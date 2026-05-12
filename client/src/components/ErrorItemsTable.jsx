// ErrorItemsTable.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusPopover from "./StatusPopover";
import RemarksEditor from "./RemarksEditor";

export default function ErrorItemsTable({
  status,
  title,
  refreshKey, // added
  onStatusUpdated, // added
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popoverPosition, setPopoverPosition] = useState(null);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [remarksEditorOpen, setRemarksEditorOpen] = useState(false);
  const [remarksEditorPosition, setRemarksEditorPosition] = useState(null);
  const [selectedRemarksItemId, setSelectedRemarksItemId] = useState(null);
  const [isSavingRemarks, setIsSavingRemarks] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [status, refreshKey]); // refresh when parent triggers update

  const fetchItems = async () => {
    try {
      setLoading(true);

      const { data, error: fetchError } = await supabase
        .from("errors")
        .select("*")
        .eq("status", status)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      setItems(data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusClick = (e, itemId) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setPopoverPosition({
      top: rect.top,
      left: rect.right + 10,
    });

    setSelectedItemId(itemId);
    setPopoverOpen(true);
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);

      const { error: updateError } = await supabase
        .from("errors")
        .update({ status: newStatus })
        .eq("id", selectedItemId);

      if (updateError) throw updateError;

      // Remove from current table immediately
      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== selectedItemId),
      );

      // Notify parent so other tables refresh
      if (onStatusUpdated) {
        onStatusUpdated();
      }

      setPopoverOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleRemarksClick = (e, itemId, currentRemarks) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();

    setRemarksEditorPosition({
      top: rect.top,
      left: rect.right + 10,
    });

    setSelectedRemarksItemId(itemId);
    setRemarksEditorOpen(true);
  };

  const handleRemarksChange = async (newRemarks) => {
    try {
      setIsSavingRemarks(true);

      const { error: updateError } = await supabase
        .from("errors")
        .update({ remarks: newRemarks })
        .eq("id", selectedRemarksItemId);

      if (updateError) throw updateError;

      // Update item in the table
      setItems((prevItems) =>
        prevItems.map((item) =>
          item.id === selectedRemarksItemId
            ? { ...item, remarks: newRemarks }
            : item,
        ),
      );

      setRemarksEditorOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSavingRemarks(false);
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
      default:
        return "bg-gray-400";
    }
  };

  if (loading) {
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-gray-50 text-gray-600">
        Loading {status.toLowerCase()} items...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-red-50 text-red-800 font-medium">
        Error: {error}
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm my-5 border border-gray-200 overflow-hidden">
        <h2 className="text-lg font-semibold text-gray-900 px-5 pt-5 pb-4 border-b border-gray-200">
          {title} ({items.length})
        </h2>

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="px-5 py-3 text-center">Workflow Name</th>
              <th className="px-5 py-3 text-center">Error Description</th>
              <th className="px-5 py-3 text-center">Status</th>
              <th className="px-5 py-3 text-center">Remarks</th>
              <th className="px-5 py-3 text-center">Date</th>
            </tr>
          </thead>

          <tbody>
            {items.length > 0 ? (
              items.map((item) => (
                <tr key={item.id} className="border-b border-gray-200">
                  <td className="px-5 py-4">{item.workflow_name}</td>
                  <td className="px-5 py-4">{item.error_description}</td>

                  <td
                    onClick={(e) => handleStatusClick(e, item.id)}
                    className={`px-5 py-4 text-center text-white cursor-pointer ${getStatusCellColor(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </td>

                  <td
                    onClick={(e) =>
                      handleRemarksClick(e, item.id, item.remarks)
                    }
                    className="px-5 py-4 cursor-pointer hover:bg-gray-100 transition-colors"
                  >
                    {item.remarks || "-"}
                  </td>
                  <td className="px-5 py-4 text-center">
                    {formatDate(item.created_at)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="px-5 py-10 text-center">
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

      <RemarksEditor
        isOpen={remarksEditorOpen}
        onClose={() => setRemarksEditorOpen(false)}
        position={remarksEditorPosition}
        onSave={handleRemarksChange}
        currentRemarks={
          items.find((item) => item.id === selectedRemarksItemId)?.remarks || ""
        }
        isSaving={isSavingRemarks}
      />
    </>
  );
}
