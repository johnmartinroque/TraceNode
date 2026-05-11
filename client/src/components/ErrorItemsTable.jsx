import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusPopover from "./StatusPopover";

export default function ErrorItemsTable({ status, title }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [status]);

  const fetchItems = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("error")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log(`${status} Items:`, data);
      setItems(data || []);
    } catch (err) {
      setError(err.message);
      console.error(`Error fetching ${status} items:`, err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (e, itemId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    setPopoverPosition({
      top: rect.top + window.scrollY,
      left: rect.right + window.scrollX + 10,
    });
    setSelectedItemId(itemId);
    setPopoverOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);
      const { error: updateError } = await supabase
        .from("error")
        .update({ status: newStatus })
        .eq("id", selectedItemId);

      if (updateError) throw updateError;

      // Update local state
      setItems((prevItems) =>
        prevItems
          .map((item) =>
            item.id === selectedItemId ? { ...item, status: newStatus } : item
          )
          .filter((item) => {
            // If new status doesn't match current filter, remove from list
            return item.status === status;
          })
      );

      setPopoverOpen(false);
    } catch (err) {
      console.error("Error updating status:", err);
      setError(err.message);
    } finally {
      setIsUpdating(false);
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

  const getStatusCellColor = (itemStatus) => {
    switch (itemStatus) {
      case "New":
        return "bg-blue-500";
      case "Done":
        return "bg-green-500";
      case "In Progress":
        return "bg-orange-500";
      case "Pending":
        return "bg-purple-500";
      default:
        return "bg-gray-400";
    }
  };

  if (loading)
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-gray-50 text-gray-600">
        Loading {status.toLowerCase()} items...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-red-50 text-red-800 font-medium">
        Error: {error}
      </div>
    );

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm my-5 overflow-hidden border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 px-5 pt-5 pb-4 mb-0 border-b border-gray-200">
          {title} ({items.length})
        </h2>
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
                Workflow Name
              </th>
              <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
                Error Description
              </th>
              <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
                Status
              </th>
              <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
                Remarks
              </th>
              <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide">
                Date
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50"
                >
                  <td className="px-5 py-4 text-gray-900 break-words font-semibold text-gray-800 text-left border-r border-gray-200">
                    {item.workflow_name}
                  </td>
                  <td className="px-5 py-4 text-gray-900 break-words text-gray-600 text-left border-r border-gray-200">
                    {item.error_description}
                  </td>
                  <td
                    onClick={(e) => handleStatusClick(e, item.id)}
                    className={`px-5 py-4 break-words text-center border-r border-gray-200 font-semibold text-white ${getStatusCellColor(
                      item.status
                    )} cursor-pointer hover:opacity-80 transition-opacity`}
                  >
                    {item.status}
                  </td>
                  <td className="px-5 py-4 text-gray-900 break-words text-gray-400 text-sm text-left border-r border-gray-200">
                    {item.remarks || "-"}
                  </td>
                  <td className="px-5 py-4 text-gray-900 break-words text-gray-400 text-sm text-center">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan="5"
                  className="px-5 py-10 text-center text-gray-400 italic"
                >
                  No {status.toLowerCase()} items
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <StatusPopover
        isOpen={popoverOpen}
        onClose={() => setPopoverOpen(false)}
        position={popoverPosition}
        onStatusChange={handleStatusChange}
        currentStatus={status}
        isUpdating={isUpdating}
      />
    </>
  );
}
