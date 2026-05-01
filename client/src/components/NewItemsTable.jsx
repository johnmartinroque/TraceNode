import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function NewItemsTable() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrors = async () => {
      const { data, error } = await supabase
        .from("error")
        .select(
          "created_at, error_description, workflow_name, workflow_id, status, remarks",
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.log("Error:", error.message);
      } else {
        setErrors(data);
      }

      setLoading(false);
    };

    fetchErrors();
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>New Items</h2>
      {errors.length === 0 ? (
        <p>No new items</p>
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
            {errors.map((err) => (
              <tr key={err.id} style={styles.tr}>
                <td style={styles.td}>
                  {new Date(err.created_at).toLocaleString()}
                </td>
                <td style={styles.td}>{err.error_description}</td>
                <td style={styles.td}>{err.workflow_name}</td>
                <td style={styles.td}>{err.workflow_id}</td>
                <td style={styles.td}>{err.status}</td>
                <td style={styles.td}>{err.remarks || "-"}</td>
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

export default NewItemsTable;
