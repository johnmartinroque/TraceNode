// FinishedItemsTable.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import "../styles/Table.css";

export default function FinishedItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinishedItems();
  }, []);

  const fetchFinishedItems = async () => {
    try {
      setLoading(true);

      // Match exact database value: Done
      const { data, error: fetchError } = await supabase
        .from("error")
        .select("*")
        .eq("status", "Done")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log("Finished Items:", data);
      setItems(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching finished items:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading) return <div className="loading">Loading finished items...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="table-container">
      <h2 className="table-title">Finished Items ({items.length})</h2>
      <table className="data-table">
        <thead>
          <tr>
            <th>Workflow Name</th>
            <th>Error Description</th>
            <th>Status</th>
            <th>Remarks</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr key={item.id} className="table-row">
                <td>{item.workflow_name}</td>
                <td>{item.error_description}</td>
                <td>
                  <span className={`status-badge status-${item.status}`}>
                    {item.status}
                  </span>
                </td>
                <td>{item.remarks || "-"}</td>
                <td>{formatDate(item.created_at)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-state">
                No finished items
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
