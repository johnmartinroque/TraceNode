import { useEffect, useState } from "react";
import { supabase } from "./lib/supabase";

function App() {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrors = async () => {
      const { data, error } = await supabase
        .from("error") // make sure this matches your table name
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

  return (
    <div style={{ padding: "20px" }}>
      <h1>Error Tracker</h1>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <table
          border="1"
          cellPadding="10"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Created At</th>
              <th>Error Description</th>
              <th>Workflow Name</th>
              <th>Workflow ID</th>
              <th>Status</th>
              <th>Remarks</th>
            </tr>
          </thead>

          <tbody>
            {errors.map((err, index) => (
              <tr key={index}>
                <td>{new Date(err.created_at).toLocaleString()}</td>
                <td>{err.error_description}</td>
                <td>{err.workflow_name}</td>
                <td>{err.workflow_id}</td>
                <td>{err.status}</td>
                <td>{err.remarks || "-"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
