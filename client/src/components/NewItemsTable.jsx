import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function NewItemsTable({ selectedIds = [], onSelectItem, disableSelection }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    const fetchErrors = async () => {
      const { data, error } = await supabase
        .from("error")
        .select(
          "id, created_at, error_description, workflow_name, workflow_id, status, remarks",
        )
        .eq("status", "New")
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

  // Update status in Supabase
  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase
      .from("error")
      .update({ status: newStatus })
      .eq("id", id);

    if (error) {
      console.log("Update Error:", error.message);
      return;
    }

    // Update local state instantly
    setErrors((prev) =>
      prev
        .map((item) => (item.id === id ? { ...item, status: newStatus } : item))
        .filter((item) => item.status === "New"),
    );

    setOpenDropdownId(null);
  };

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
                {/* Checkbox */}
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

                {/* Created At */}
                <td className="border border-gray-300 p-2">
                  {new Date(err.created_at).toLocaleString()}
                </td>

                {/* Error Description */}
                <td className="border border-gray-300 p-2">
                  {err.error_description}
                </td>

                {/* Workflow Name */}
                <td className="border border-gray-300 p-2">
                  {err.workflow_name}
                </td>

                {/* Workflow ID */}
                <td className="border border-gray-300 p-2">
                  {err.workflow_id}
                </td>

                {/* Clickable Status */}
                <td className="border border-gray-300 p-2 relative">
                  <button
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === err.id ? null : err.id,
                      )
                    }
                    className={`px-3 py-1 rounded text-white ${
                      err.status === "Done" ? "bg-green-500" : "bg-blue-500"
                    }`}
                  >
                    {err.status || "New"}
                  </button>

                  {/* Popover Dropdown */}
                  {openDropdownId === err.id && (
                    <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-28">
                      <button
                        onClick={() => updateStatus(err.id, "New")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        New
                      </button>
                      <button
                        onClick={() => updateStatus(err.id, "Done")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Done
                      </button>
                    </div>
                  )}
                </td>

                {/* Remarks */}
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
