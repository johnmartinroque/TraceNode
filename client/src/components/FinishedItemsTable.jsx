// FinishedItemsTable.jsx
import ErrorItemsTable from "./ErrorItemsTable";

export default function FinishedItemsTable({ refreshKey, onStatusUpdated }) {
  return (
    <ErrorItemsTable
      status="Done"
      title="Finished Items"
      refreshKey={refreshKey}
      onStatusUpdated={onStatusUpdated}
    />
  );
}
