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

export default function FinishedItemsTable() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFinishedItems();
  }, []);

  const fetchFinishedItems = async () => {
    try {
      setLoading(true);

      // Match exact database value: Done
      const { data, error: fetchError } = await supabase
        .from("error")
        .select("*")
        .eq("status", "Done")
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;

      console.log("Finished Items:", data);
      setItems(data || []);
    } catch (err) {
      setError(err.message);
      console.error("Error fetching finished items:", err);
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
        Loading finished items...
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center rounded-lg my-5 bg-red-50 text-red-800 font-medium">
        Error: {error}
      </div>
    );

  return (
    <div className="bg-white rounded-lg shadow-sm my-5 overflow-hidden">
      <h2 className="text-lg font-semibold text-gray-900 px-5 pt-5 pb-4 mb-0 border-b border-gray-300">
        Finished Items ({items.length})
      </h2>
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="bg-gray-50 border-b-2 border-gray-300">
            <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase text-xs tracking-wide">
              Workflow Name
            </th>
            <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase text-xs tracking-wide">
              Error Description
            </th>
            <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase text-xs tracking-wide">
              Status
            </th>
            <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase text-xs tracking-wide">
              Remarks
            </th>
            <th className="px-5 py-3 text-left font-semibold text-gray-600 uppercase text-xs tracking-wide">
              Date
            </th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-gray-100 transition-colors duration-200 hover:bg-gray-50 cursor-pointer"
              >
                <td className="px-5 py-4 text-gray-900 break-words font-semibold text-gray-800 max-w-xs overflow-hidden text-ellipsis">
                  {item.workflow_name}
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-gray-600 max-w-sm overflow-hidden text-ellipsis whitespace-nowrap">
                  {item.error_description}
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-center">
                  <span
                    className={`inline-block px-3 py-1.5 rounded-full font-semibold text-xs capitalize ${getStatusStyles(
                      item.status,
                    )}`}
                  >
                    {item.status}
                  </span>
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-gray-400 text-sm max-w-xs overflow-hidden text-ellipsis">
                  {item.remarks || "-"}
                </td>
                <td className="px-5 py-4 text-gray-900 break-words text-gray-400 text-sm whitespace-nowrap">
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
                No finished items
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
