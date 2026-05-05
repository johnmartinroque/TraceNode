import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function FinishedItemsTable({
  selectedIds = [],
  onSelectItem,
  disableSelection,
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);

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
        },
        () => {
          fetchFinishedItems();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Fetch only Done items
  const fetchFinishedItems = async () => {
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from("error")
        .select(
          "id, created_at, error_description, workflow_name, workflow_id, status, remarks",
        )
        .eq("status", "Done")
        .order("created_at", { ascending: false });

      if (error) throw error;

      setItems(data || []);
    } catch (error) {
      console.error("Error fetching finished items:", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Bulk or single status update (same logic as NewItemsTable)
  // Replace ONLY your updateStatus function inside FinishedItemsTable with this:

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

      // Remove all updated items from Finished table if moved to New
      if (newStatus === "New") {
        setItems((prev) =>
          prev.filter((item) => !idsToUpdate.includes(item.id)),
        );
      } else {
        // Keep them if still Done
        setItems((prev) =>
          prev.map((item) =>
            idsToUpdate.includes(item.id)
              ? { ...item, status: newStatus }
              : item,
          ),
        );
      }

      // Optional: uncheck all after update
      idsToUpdate.forEach((id) => {
        onSelectItem?.(id, false);
      });

      setOpenDropdownId(null);
    } catch (err) {
      console.log("Unexpected Error:", err.message);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Finished Items</h2>

      {items.length === 0 ? (
        <p>No finished items</p>
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
            {items.map((item) => (
              <tr
                key={item.id}
                className={`bg-white ${selectedIds.includes(item.id) ? "bg-blue-100" : ""}`}
              >
                {/* Checkbox */}
                <td className="border border-gray-300 p-2 text-center">
                  <input
                    type="checkbox"
                    checked={selectedIds.includes(item.id)}
                    disabled={disableSelection}
                    onChange={(event) =>
                      onSelectItem?.(item.id, event.target.checked)
                    }
                  />
                </td>

                {/* Created At */}
                <td className="border border-gray-300 p-2">
                  {new Date(item.created_at).toLocaleString()}
                </td>

                {/* Error Description */}
                <td className="border border-gray-300 p-2">
                  {item.error_description}
                </td>

                {/* Workflow Name */}
                <td className="border border-gray-300 p-2">
                  {item.workflow_name}
                </td>

                {/* Workflow ID */}
                <td className="border border-gray-300 p-2">
                  {item.workflow_id}
                </td>

                {/* Status Popover */}
                <td className="border border-gray-300 p-2 relative">
                  <button
                    onClick={() =>
                      setOpenDropdownId(
                        openDropdownId === item.id ? null : item.id,
                      )
                    }
                    className={`px-3 py-1 rounded text-white ${
                      item.status === "Done" ? "bg-green-500" : "bg-blue-500"
                    }`}
                  >
                    {item.status}
                  </button>

                  {openDropdownId === item.id && (
                    <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-40">
                      <button
                        onClick={() => updateStatus(item.id, "New")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Update Selected to New
                      </button>

                      <button
                        onClick={() => updateStatus(item.id, "Done")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Update Selected to Done
                      </button>
                    </div>
                  )}
                </td>

                {/* Remarks */}
                <td className="border border-gray-300 p-2">
                  {item.remarks || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FinishedItemsTable;
