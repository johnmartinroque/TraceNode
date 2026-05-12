// NewItemsTable.jsx
import ErrorItemsTable from "./ErrorItemsTable";

export default function NewItemsTable({ refreshKey, onStatusUpdated }) {
  return (
    <ErrorItemsTable
      status="New"
      title="New Items"
      refreshKey={refreshKey}
      onStatusUpdated={onStatusUpdated}
    />
  );
}
