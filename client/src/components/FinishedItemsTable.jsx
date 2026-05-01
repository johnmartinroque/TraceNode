import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function FinishedItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinishedItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("finished-items-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "error",
          filter: "status=eq.Done",
        },
        (payload) => {
          fetchFinishedItems();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFinishedItems = async () => {
    try {
      const { data, error } = await supabase
        .from("error")
        .select(
          "created_at, error_description, workflow_name, workflow_id, status, remarks",
        )
        .eq("status", "Done")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching finished items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Finished Items</h2>
      {items.length === 0 ? (
        <p>No finished items</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Error Description</th>
              <th style={styles.th}>Workflow Name</th>
              <th style={styles.th}>Workflow ID</th>
              <th style={styles.th}>Status</th>
              <th style={styles.th}>Remarks</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td style={styles.td}>{item.error_description}</td>
                <td style={styles.td}>{item.workflow_name}</td>
                <td style={styles.td}>{item.workflow_id}</td>
                <td style={styles.td}>{item.status}</td>
                <td style={styles.td}>{item.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const styles = {
  th: {
    border: "1px solid #ddd",
    padding: "8px",
    textAlign: "left",
    backgroundColor: "#f5f5f5",
  },
  td: { border: "1px solid #ddd", padding: "8px" },
  tr: { backgroundColor: "#fff" },
};

export default FinishedItemsTable;
