export default function DeleteItemModal({
  isOpen,
  onClose,
  onConfirm,
  itemCount = 1,
  isDeleting = false,
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-2xl ring-1 ring-black/5">
        <div className="px-6 py-5 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Confirm delete</h2>
          <p className="mt-2 text-sm text-gray-600">
            Are you sure you want to delete {itemCount} {itemCount === 1 ? "item" : "items"}?
            This action cannot be undone.
          </p>
        </div>

        <div className="px-6 py-4 flex flex-col gap-3">
          <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
            Once confirmed, the selected error item(s) will be removed permanently.
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={isDeleting}
              className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isDeleting ? "Deleting..." : itemCount > 1 ? `Delete ${itemCount} items` : "Delete item"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
