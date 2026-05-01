import React, { useState, useEffect } from "react";
import { supabase } from "../lib/supabase";

function FinishedItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFinishedItems();

    // Subscribe to real-time changes
    const channel = supabase
      .channel("finished-items-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "error",
          filter: "status=eq.Done",
        },
        (payload) => {
          fetchFinishedItems();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchFinishedItems = async () => {
    try {
      const { data, error } = await supabase
        .from("error")
        .select(
          "created_at, error_description, workflow_name, workflow_id, status, remarks",
        )
        .eq("status", "Done")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (error) {
      console.error("Error fetching finished items:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <h2>Finished Items</h2>
      {items.length === 0 ? (
        <p>No finished items</p>
      ) : (
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Created At
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Error Description
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Workflow Name
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Workflow ID
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Status
              </th>
              <th className="border border-gray-300 p-2 text-left bg-gray-100">
                Remarks
              </th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item.id} className="bg-white">
                <td className="border border-gray-300 p-2">
                  {new Date(item.created_at).toLocaleString()}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.error_description}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.workflow_name}
                </td>
                <td className="border border-gray-300 p-2">
                  {item.workflow_id}
                </td>
                <td className="border border-gray-300 p-2">{item.status}</td>
                <td className="border border-gray-300 p-2">
                  {item.remarks || "-"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default FinishedItemsTable;
