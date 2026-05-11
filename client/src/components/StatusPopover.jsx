import { useEffect, useRef } from "react";

export default function StatusPopover({ 
  isOpen, 
  onClose, 
  position,
  onStatusChange, 
  currentStatus,
  isUpdating 
}) {
  const popoverRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const statuses = [
    { label: "New", value: "New", bgColor: "bg-blue-100 hover:bg-blue-200" },
    { label: "Done", value: "Done", bgColor: "bg-green-100 hover:bg-green-200" },
  ];

  return (
    <div
      ref={popoverRef}
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg p-3 z-50"
      style={{
        top: `${position?.top}px`,
        left: `${position?.left}px`,
        transform: "translateY(-50%)",
      }}
    >
      <div className="flex flex-col gap-2">
        {statuses.map((status) => (
          <button
            key={status.value}
            onClick={() => {
              onStatusChange(status.value);
              onClose();
            }}
            disabled={isUpdating}
            className={`px-4 py-2 rounded font-medium text-sm text-center transition-colors ${
              status.bgColor
            } ${isUpdating ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
          >
            {status.label}
          </button>
        ))}
      </div>
    </div>
  );
}
