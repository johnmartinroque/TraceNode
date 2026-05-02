import React, { useEffect, useState } from "react";
import NewItemsTable from "../components/NewItemsTable";
import FinishedItemsTable from "../components/FinishedItemsTable";

function Home() {
  const [selectedTable, setSelectedTable] = useState(null);
  const [selectedItemIds, setSelectedItemIds] = useState({
    new: [],
    finished: [],
  });

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
        selectedIds={selectedItemIds.new}
        onSelectItem={(itemId, checked) =>
          handleSelectionChange("new", itemId, checked)
        }
        disableSelection={selectedTable === "finished"}
      />
      <FinishedItemsTable
        selectedIds={selectedItemIds.finished}
        onSelectItem={(itemId, checked) =>
          handleSelectionChange("finished", itemId, checked)
        }
        disableSelection={selectedTable === "new"}
      />
    </div>
  );
}

export default Home;
