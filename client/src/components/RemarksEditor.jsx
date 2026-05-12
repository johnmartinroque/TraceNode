import { useEffect, useRef } from "react";

export default function RemarksEditor({
  isOpen,
  onClose,
  position,
  onSave,
  currentRemarks,
  isSaving,
}) {
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (inputRef.current && !inputRef.current.contains(event.target)) {
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

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      onSave(inputRef.current.value);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed bg-white border border-gray-300 rounded-lg shadow-lg z-50 p-2"
      style={{
        top: `${position?.top}px`,
        left: `${position?.left}px`,
        transform: "translateY(-50%)",
        minWidth: "250px",
      }}
    >
      <input
        ref={inputRef}
        type="text"
        defaultValue={currentRemarks || ""}
        onKeyDown={handleKeyDown}
        disabled={isSaving}
        placeholder="Enter remarks..."
        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
      />
      {isSaving && <p className="text-xs text-gray-500 mt-1">Saving...</p>}
    </div>
  );
}
