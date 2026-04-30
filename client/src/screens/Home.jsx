import React from "react";
import NewItemsTable from "../components/NewItemsTable";
import FinishedItemsTable from "../components/FinishedItemsTable";

function Home() {
  return (
    <div>
      <NewItemsTable />
      <FinishedItemsTable />
    </div>
  );
}

export default Home;
