import React from "react";

export default function SearchItem({
  searchTerm = "",
  onSearchChange = () => {},
}) {
  return (
    <div className="py-4">
      <label className="sr-only">Search by workflow name</label>
      <div className="max-w-md mx-4">
        <input
          type="search"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search by workflow name"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>
    </div>
  );
}
