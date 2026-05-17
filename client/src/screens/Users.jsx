import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function Users() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUsers = async () => {
      setLoading(true);
      setError(null);

      const { data, error: tableError } = await supabase
        .from("users")
        .select("id,email,created_at")
        .order("created_at", { ascending: false });

      if (!tableError) {
        setUsers(data ?? []);
        setLoading(false);
        return;
      }

      const { data: authData, error: authError } =
        await supabase.auth.admin.listUsers();

      if (authError) {
        setError(authError.message);
        setUsers([]);
      } else {
        setUsers(authData.users ?? []);
      }

      setLoading(false);
    };

    loadUsers();
  }, []);

  return (
    <main className="p-4">
      <h1 className="text-2xl font-semibold mb-4">Registered Users</h1>
      {loading && <p>Loading users…</p>}
      {error && <p className="text-red-600">Unable to load users: {error}</p>}
      {!loading && !error && users.length === 0 && (
        <p>No registered users found.</p>
      )}
      <ul className="space-y-3">
        {users.map((user) => {
          const email = user.email || user.user?.email || "Unknown email";
          const id = user.id || user.user?.id || "unknown-id";
          const createdAt = user.created_at || user.user?.created_at;

          return (
            <li
              key={id}
              className="rounded border border-slate-200 p-4 bg-white shadow-sm dark:bg-neutral-800 dark:border-neutral-700"
            >
              <p className="font-medium text-slate-900 dark:text-slate-100">
                {email}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                ID: {id}
              </p>
              {createdAt && (
                <p className="text-sm text-slate-600 dark:text-slate-400">
                  Created: {new Date(createdAt).toLocaleString()}
                </p>
              )}
            </li>
          );
        })}
      </ul>
    </main>
  );
}

export default Users;
