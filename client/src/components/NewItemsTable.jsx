import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function NewItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNewItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("new-items-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "n8n_error_tracking",
          filter: "status=eq.new",
        },
        (payload) => {
          fetchNewItems();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchNewItems = async () => {
    try {
      const { data, error } = await supabase
        .from("n8n_error_tracking")
        .select("*")
        .eq("status", "new")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching new items:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsDone = async (id) => {
    try {
      const { error } = await supabase
        .from("n8n_error_tracking")
        .update({ status: "done", updated_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
      // Item will be removed from the list via real-time subscription
    } catch (error) {
      console.error("Error updating status:", error);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ marginBottom: "40px" }}>
      <h2>New Items</h2>
      {items.length === 0 ? (
        <p>No new items</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th style={styles.th}>Workflow Name</th>
              <th style={styles.th}>Error Message</th>
              <th style={styles.th}>Created At</th>
              <th style={styles.th}>Action</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} style={styles.tr}>
                <td style={styles.td}>{item.workflow_name}</td>
                <td style={styles.td}>{item.error_message}</td>
                <td style={styles.td}>
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td style={styles.td}>
                  <button
                    onClick={() => markAsDone(item.id)}
                    style={styles.button}
                  >
                    Mark Done
                  </button>
                </td>
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
  button: {
    padding: "6px 12px",
    backgroundColor: "#4CAF50",
    color: "white",
    border: "none",
    borderRadius: "4px",
    cursor: "pointer",
  },
};

export default NewItemsTable;
