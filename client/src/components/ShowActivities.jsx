import React, { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function ShowActivities() {
  const [activities, setActivities] = useState([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchActivities = async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching activities:", error);
    } else {
      setActivities(data);
    }

    setLoading(false);
  };

  const openModal = async () => {
    setOpen(true);
    await fetchActivities();
  };

  const closeModal = () => setOpen(false);

  return (
    <>
      {/* Trigger button */}
      <button
        onClick={openModal}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Show Activities
      </button>

      {/* Modal */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white w-[90%] max-w-2xl max-h-[80vh] rounded-lg shadow-lg p-4 overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-lg font-semibold">Activities</h2>
              <button onClick={closeModal} className="text-red-500 font-bold">
                ✕
              </button>
            </div>

            {/* Content (scrollable) */}
            <div className="overflow-y-auto flex-1 border rounded p-2">
              {loading ? (
                <p>Loading...</p>
              ) : activities.length === 0 ? (
                <p>No activities found.</p>
              ) : (
                activities.map((item) => (
                  <div
                    key={item.id}
                    className="border-b py-2 text-sm space-y-1"
                  >
                    <div>
                      <strong>ID:</strong> {item.id}
                    </div>
                    <div>
                      <strong>Error ID:</strong> {item.error_id}
                    </div>
                    <div>
                      <strong>Action:</strong> {item.action}
                    </div>
                    <div className="text-gray-500 text-xs">
                      {new Date(item.created_at).toLocaleString()}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ShowActivities;
