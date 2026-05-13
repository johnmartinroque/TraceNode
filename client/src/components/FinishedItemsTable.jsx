// FinishedItemsTable.jsx
import ErrorItemsTable from "./ErrorItemsTable";

export default function FinishedItemsTable({
  refreshKey,
  onStatusUpdated,
  selectedIds,
  onSelectionChange,
  onClearSelection,
}) {
  return (
    <ErrorItemsTable
      status="Done"
      title="Finished Items"
      table="finished"
      refreshKey={refreshKey}
      onStatusUpdated={onStatusUpdated}
      selectedIds={selectedIds}
      onSelectionChange={onSelectionChange}
      onClearSelection={onClearSelection}
    />
  );
}
