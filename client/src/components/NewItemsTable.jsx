import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function NewItemsTable({ selectedIds = [], onSelectItem, disableSelection }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchErrors = async () => {
      const { data, error } = await supabase
        .from("error")
        .select(
          "id, created_at, error_description, workflow_name, workflow_id, status, remarks",
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
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-center bg-gray-100">
                Select
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Created At
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Error Description
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Workflow Name
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Workflow ID
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Status
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {errors.map((err) => (
              <tr key={err.id} className="bg-white">
                <td className="border border-gray-300 p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(err.id)}
                    disabled={disableSelection}
                    onChange={(event) =>
                      onSelectItem?.(err.id, event.target.checked)
                    }
                  />
                </td>
                <td className="border border-gray-300 p-2">
                  {new Date(err.created_at).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {err.error_description}
                </td>
                <td className="border border-gray-300 p-2">
                  {err.workflow_name}
                </td>
                <td className="border border-gray-300 p-2">
                  {err.workflow_id}
                </td>
                <td className="border border-gray-300 p-2">{err.status}</td>
                <td className="border border-gray-300 p-2">
                  {err.remarks || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default NewItemsTable;
