// ErrorItemsTable.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import StatusPopover from "./StatusPopover";
import RemarksEditor from "./RemarksEditor";

export default function ErrorItemsTable({
  status,
  title,
  table,
  refreshKey,
  onStatusUpdated,
  selectedIds = [],
  onSelectionChange = () => {},
  onClearSelection = () => {},
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

  // RIGHT CLICK DELETE MENU
  const [contextMenuOpen, setContextMenuOpen] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchItems();
  }, [status, refreshKey]);

  useEffect(() => {
    const channel = supabase.channel(`errors-realtime-${status}`);

    channel
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "errors",
        },
        (payload) => {
          const inserted = payload.new;
          if (inserted?.status === status) {
            setItems((prevItems) => [inserted, ...prevItems]);
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "errors",
        },
        (payload) => {
          const updated = payload.new;
          const previous = payload.old;
          if (!updated) return;

          if (updated.status === status) {
            setItems((prevItems) => {
              const alreadyInList = prevItems.some(
                (item) => item.id === updated.id,
              );

              if (alreadyInList) {
                return prevItems.map((item) =>
                  item.id === updated.id ? { ...item, ...updated } : item,
                );
              }

              return [updated, ...prevItems];
            });
          } else if (previous?.status === status) {
            setItems((prevItems) =>
              prevItems.filter((item) => item.id !== updated.id),
            );
          }
        },
      )
      .on(
        "postgres_changes",
        {
          event: "DELETE",
          schema: "public",
          table: "errors",
        },
        (payload) => {
          const deleted = payload.old;
          if (deleted?.status === status) {
            setItems((prevItems) =>
              prevItems.filter((item) => item.id !== deleted.id),
            );
          }
        },
      );

    channel.subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [status]);

  // CLOSE CONTEXT MENU ON CLICK
  useEffect(() => {
    const closeMenu = () => setContextMenuOpen(false);
    window.addEventListener("click", closeMenu);

    return () => window.removeEventListener("click", closeMenu);
  }, []);

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

  const getTimestamp = () => {
    const now = new Date();
    const year = now.getUTCFullYear();
    const month = String(now.getUTCMonth() + 1).padStart(2, "0");
    const day = String(now.getUTCDate()).padStart(2, "0");
    const hours = String(now.getUTCHours()).padStart(2, "0");
    const minutes = String(now.getUTCMinutes()).padStart(2, "0");
    const seconds = String(now.getUTCSeconds()).padStart(2, "0");
    const milliseconds = String(now.getUTCMilliseconds()).padStart(3, "0");
    const microseconds = milliseconds + "000";
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}.${microseconds}+00`;
  };

  const handleStatusChange = async (newStatus) => {
    try {
      setIsUpdating(true);

      const idsToUpdate =
        selectedIds?.length > 0 && selectedIds.includes(selectedItemId)
          ? selectedIds
          : [selectedItemId];

      const { error: updateError } = await supabase
        .from("errors")
        .update({ status: newStatus, last_modified: getTimestamp() })
        .in("id", idsToUpdate);

      if (updateError) throw updateError;

      setItems((prevItems) =>
        prevItems.filter((item) => !idsToUpdate.includes(item.id)),
      );

      onStatusUpdated?.();
      onClearSelection(table);
      setPopoverOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  // RIGHT CLICK MENU
  const handleRightClick = (e, itemId) => {
    e.preventDefault();

    // Auto select row if not already selected
    if (!selectedIds.includes(itemId)) {
      onClearSelection(table);
      onSelectionChange(table, itemId, true);
    }

    setSelectedItemId(itemId);
    setContextMenuPosition({
      top: e.pageY,
      left: e.pageX,
    });

    setContextMenuOpen(true);
  };

  // DELETE SINGLE OR MULTIPLE
  const handleDelete = async () => {
    try {
      setIsDeleting(true);

      const idsToDelete =
        selectedIds?.length > 0 && selectedIds.includes(selectedItemId)
          ? selectedIds
          : [selectedItemId];

      const { error: deleteError } = await supabase
        .from("errors")
        .delete()
        .in("id", idsToDelete);

      if (deleteError) throw deleteError;

      setItems((prevItems) =>
        prevItems.filter((item) => !idsToDelete.includes(item.id)),
      );

      onClearSelection(table);
      onStatusUpdated?.();
      setContextMenuOpen(false);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRemarksClick = (e, itemId) => {
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

      const idsToUpdate =
        selectedIds?.length > 0 && selectedIds.includes(selectedRemarksItemId)
          ? selectedIds
          : [selectedRemarksItemId];

      const { error: updateError } = await supabase
        .from("errors")
        .update({ remarks: newRemarks, last_modified: getTimestamp() })
        .in("id", idsToUpdate);

      if (updateError) throw updateError;

      setItems((prevItems) =>
        prevItems.map((item) =>
          idsToUpdate.includes(item.id)
            ? { ...item, remarks: newRemarks }
            : item,
        ),
      );

      onClearSelection(table);
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
      <div className="bg-white rounded-lg shadow-sm my-5 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900 px-5 pt-5 pb-4 border-b border-gray-200">
          {title} ({items.length})
        </h2>

        <div>
          <table className="min-w-[1100px] w-full table-fixed border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="w-[48px] px-5 py-3 text-center">
                  <input
                    type="checkbox"
                    checked={
                      items.length > 0 && selectedIds.length === items.length
                    }
                    onChange={(event) =>
                      items.forEach((item) =>
                        onSelectionChange(table, item.id, event.target.checked),
                      )
                    }
                  />
                </th>
                <th className="w-[180px] px-5 py-3 text-center">
                  Workflow Name
                </th>
                <th className="w-[170px] px-5 py-3 text-center">
                  Workflow Link
                </th>
                <th className="w-[260px] px-5 py-3 text-center">
                  Error Description
                </th>
                <th className="w-[100px] px-5 py-3 text-center">Status</th>
                <th className="w-[190px] px-5 py-3 text-center">Remarks</th>
                <th className="w-[160px] px-5 py-3 text-center">Date</th>
              </tr>
            </thead>

            <tbody>
              {items.length > 0 ? (
                items.map((item) => (
                  <tr
                    key={item.id}
                    onContextMenu={(e) => handleRightClick(e, item.id)}
                    className={`border-b border-gray-200 cursor-context-menu ${
                      selectedIds.includes(item.id) ? "bg-blue-50" : ""
                    }`}
                  >
                    <td className="px-5 py-4 text-center">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={(event) =>
                          onSelectionChange(
                            table,
                            item.id,
                            event.target.checked,
                          )
                        }
                      />
                    </td>

                    <td className="px-5 py-4">{item.workflow_name}</td>

                    <td className="px-5 py-4 text-center">
                      {item.workflow_link ? (
                        <a
                          href={item.workflow_link}
                          target="_blank"
                          rel="noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Open Workflow
                        </a>
                      ) : item.workflow_id ? (
                        item.workflow_id
                      ) : (
                        "-"
                      )}
                    </td>

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
                      onClick={(e) => handleRemarksClick(e, item.id)}
                      className="px-5 py-4 cursor-pointer hover:bg-gray-100"
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
                  <td colSpan="7" className="px-5 py-10 text-center">
                    No {status.toLowerCase()} items
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>{" "}
      {/* THIS DIV WAS MISSING */}
      {/* RIGHT CLICK DELETE MENU */}
      {contextMenuOpen && (
        <div
          className="fixed bg-white border border-gray-300 rounded shadow-lg z-50"
          style={{
            top: contextMenuPosition?.top,
            left: contextMenuPosition?.left,
          }}
        >
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="px-4 py-2 text-red-600 hover:bg-red-50 w-full text-left"
          >
            {isDeleting
              ? "Deleting..."
              : `Delete ${
                  selectedIds.length > 1
                    ? `${selectedIds.length} Items`
                    : "Item"
                }`}
          </button>
        </div>
      )}
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
