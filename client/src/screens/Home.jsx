import React, { useEffect, useState } from "react";
import NewItemsTable from "../components/NewItemsTable";
import FinishedItemsTable from "../components/FinishedItemsTable";

function Home() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState({
    new: [],
    finished: [],
  });
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    if (
      selectedItemIds.new.length > 0 &&
      selectedItemIds.finished.length === 0
    ) {
      setSelectedTable("new");
    } else if (
      selectedItemIds.finished.length > 0 &&
      selectedItemIds.new.length === 0
    ) {
      setSelectedTable("finished");
    } else if (
      selectedItemIds.new.length === 0 &&
      selectedItemIds.finished.length === 0
    ) {
      setSelectedTable(null);
    }
  }, [selectedItemIds]);

  const handleStatusUpdated = () => {
    setRefreshKey((prev) => prev + 1);
  };

  const handleSelectionChange = (table, itemId, checked) => {
    setSelectedItemIds((prev) => {
      const updatedIds = new Set(prev[table]);

      if (checked) {
        updatedIds.add(itemId);
      } else {
        updatedIds.delete(itemId);
      }

      return {
        ...prev,
        [table]: Array.from(updatedIds),
      };
    });
  };

  return (
    <div>
      <NewItemsTable
        refreshKey={refreshKey}
        onStatusUpdated={handleStatusUpdated}
      />

      <FinishedItemsTable
        refreshKey={refreshKey}
        onStatusUpdated={handleStatusUpdated}
      />
    </div>
  );
}

export default Home;
