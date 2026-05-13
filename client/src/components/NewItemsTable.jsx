// NewItemsTable.jsx
import ErrorItemsTable from "./ErrorItemsTable";

export default function NewItemsTable({
  refreshKey,
  onStatusUpdated,
  selectedIds,
  onSelectionChange,
  onClearSelection,
}) {
  return (
    <ErrorItemsTable
      status="New"
      title="New Items"
      table="new"
      refreshKey={refreshKey}
      onStatusUpdated={onStatusUpdated}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      onClearSelection={onClearSelection}
    />
  );
}
