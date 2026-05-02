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
          filter: "status=eq.Done",
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

  const fetchFinishedItems = async () => {
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
      console.error("Error fetching finished items:", error);
    } finally {
      setLoading(false);
    }
  };

  // Update status in Supabase
  const updateStatus = async (id, newStatus) => {
    try {
      const { error } = await supabase
        .from("error")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;

      // If moved from Done to New, remove from this table instantly
      if (newStatus === "New") {
        setItems((prev) => prev.filter((item) => item.id !== id));
      } else {
        setItems((prev) =>
          prev.map((item) =>
            item.id === id ? { ...item, status: newStatus } : item,
          ),
        );
      }

      setOpenDropdownId(null);
    } catch (error) {
      console.error("Update Error:", error);
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
              <tr key={item.id} className="bg-white">
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

                {/* Clickable Status */}
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
                    {item.status || "Done"}
                  </button>

                  {/* Popover Dropdown */}
                  {openDropdownId === item.id && (
                    <div className="absolute z-10 mt-2 bg-white border border-gray-300 rounded shadow-lg w-28">
                      <button
                        onClick={() => updateStatus(item.id, "New")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        New
                      </button>
                      <button
                        onClick={() => updateStatus(item.id, "Done")}
                        className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                      >
                        Done
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
