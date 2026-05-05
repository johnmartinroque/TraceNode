import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function NewItemsTable({ selectedIds = [], onSelectItem, disableSelection }) {
  const [errors, setErrors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

  useEffect(() => {
    fetchErrors();

    const channel = supabase
      .channel("new-items-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "error",
        },
        (payload) => {
          console.log("Realtime Update:", payload);
          fetchErrors(); // Always refetch latest New items
        },
      )
      .subscribe((status) => {
        console.log("Realtime Status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch only New items
  const fetchErrors = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("error")
      .select(
        "id, created_at, error_description, workflow_name, workflow_id, status, remarks",
      )
      .eq("status", "New")
      .order("created_at", { ascending: false });

    if (error) {
      console.log("Fetch Error:", error.message);
    } else {
      setErrors(data || []);
    }

    setLoading(false);
  };

  // Bulk or single status update
  const updateStatus = async (clickedId, newStatus) => {
    try {
      // If multiple selected, update all selected
      const idsToUpdate =
        selectedIds.length > 0 && selectedIds.includes(clickedId)
          ? selectedIds
          : [clickedId];

      const { error } = await supabase
        .from("error")
        .update({ status: newStatus })
        .in("id", idsToUpdate);

      if (error) {
        console.log("Update Error:", error.message);
        alert("Failed to update status");
        return;
      }

      console.log("Updated IDs:", idsToUpdate);

      // Remove all updated items from New table if Done
      if (newStatus === "Done") {
        setErrors((prev) =>
          prev.filter((item) => !idsToUpdate.includes(item.id)),
        );
      } else {
        setErrors((prev) =>
          prev.map((item) =>
            idsToUpdate.includes(item.id)
              ? { ...item, status: newStatus }
              : item,
          ),
        );
      }

      // Optional: uncheck all after update
      // Optional: uncheck all after update
      idsToUpdate.forEach((id) => {
        onSelectItem?.(id, false);
      });

      setOpenDropdownId(null);
      fetchErrors();
    } catch (err) {
      console.log("Unexpected Error:", err.message);
    }
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
              <tr
                key={err.id}
                className={`bg-white ${selectedIds.includes(err.id) ? "bg-blue-100" : ""}`}
              >
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

                {/* Status Popover */}
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
                    {err.status}
                  </button>

                  {openDropdownId === err.id && (
                    <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-28">
                      <button
                        onClick={() => updateStatus(err.id, "New")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Update Selected to New
                      </button>

                      <button
                        onClick={() => updateStatus(err.id, "Done")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Update Selected to Done
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
