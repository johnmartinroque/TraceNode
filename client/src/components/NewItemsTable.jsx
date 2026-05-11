// NewItemsTable.jsx
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const getStatusStyles = (status) => {
  const styles = {
    New: "bg-blue-100 text-blue-700",
    Done: "bg-green-100 text-green-700",
    "In Progress": "bg-orange-100 text-orange-700",
    Pending: "bg-purple-100 text-purple-700",
  };
  return styles[status] || "bg-gray-100 text-gray-700";
};

export default function NewItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchNewItems();
  }, []);

  const fetchNewItems = async () => {
    try {
      setLoading(true);

      // Match exact database value: New
      const { data, error: fetchError } = await supabase
        .from("error")
        .select("*")
        .eq("status", "New")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log("New Items:", data);
      setItems(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching new items:", err);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (loading)
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-gray-50 text-gray-600">
        Loading new items...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-red-50 text-red-800 font-medium">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-sm my-5 overflow-hidden border border-gray-200">
      <h2 className="text-lg font-semibold text-gray-900 px-5 pt-5 pb-4 mb-0 border-b border-gray-200">
        New Items ({items.length})
      </h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
              Workflow Name
            </th>
            <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
              Error Description
            </th>
            <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
              Status
            </th>
            <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide border-r border-gray-200">
              Remarks
            </th>
            <th className="px-5 py-3 text-center font-semibold text-gray-600 uppercase text-xs tracking-wide">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-200 transition-colors duration-200 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-5 py-4 text-gray-900 break-words font-semibold text-gray-800 text-center border-r border-gray-200">
                  {item.workflow_name}
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-gray-600 text-center border-r border-gray-200">
                  {item.error_description}
                </td>
                <td
                  className={`px-5 py-4 break-words text-center border-r border-gray-200 font-semibold text-white ${
                    item.status === "New"
                      ? "bg-blue-500"
                      : item.status === "Done"
                        ? "bg-green-500"
                        : "bg-gray-400"
                  }`}
                >
                  {item.status}
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-gray-400 text-sm text-center border-r border-gray-200">
                  {item.remarks || "-"}
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-gray-400 text-sm text-center">
                  {formatDate(item.created_at)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan="5"
                className="px-5 py-10 text-center text-gray-400 italic"
              >
                No new items
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
