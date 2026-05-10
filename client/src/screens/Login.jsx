// Login.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    if (data?.session && data?.user) {
      // Create one clean object for storage
      const userInfo = {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at,
        expires_in: data.session.expires_in,
        token_type: data.session.token_type,
        user: {
          id: data.user.id,
          email: data.user.email,
          role: data.user.role,
          created_at: data.user.created_at,
          last_sign_in_at: data.user.last_sign_in_at,
        },
      };

      // Save whether rememberMe is checked or not
      // (If you only want rememberMe users saved, wrap this in if (rememberMe))
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      navigate("/");
    }
  };

  return (
    <main className="bg-gray-50 px-4 md:px-8 dark:bg-neutral-900">
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="max-w-md w-full">
          <Link to="/">
            <img
              src="https://readymadeui.com/logo-alt.svg"
              alt="logo"
              className="w-14 min-h-14 mb-8 mx-auto block"
            />
          </Link>

          <div className="p-6 rounded-lg bg-white border border-slate-300 shadow-xs md:p-8 dark:bg-neutral-800 dark:border-neutral-700">
            <h1 className="text-slate-900 text-center text-3xl font-bold dark:text-slate-50">
              Sign in
            </h1>

            <form className="space-y-6 mt-10" onSubmit={handleLogin}>
              <div>
                <label className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="john@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"
                />
              </div>

              <div>
                <label className="mb-2 text-slate-900 font-medium text-sm inline-block dark:text-slate-50">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="px-3 py-2.5 text-sm text-slate-900 rounded-md bg-white w-full outline-1 -outline-offset-1 outline-slate-300 focus:outline-2 focus:-outline-offset-2 focus:outline-blue-600 dark:text-slate-50 dark:bg-neutral-700 dark:outline-neutral-600"
                />
              </div>

              <div className="flex items-start flex-wrap gap-2">
                <label className="flex items-center group cursor-pointer">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="sr-only"
                  />

                  <span
                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded outline-1 ${
                      rememberMe
                        ? "bg-blue-600 outline-blue-600"
                        : "bg-white outline-slate-300 dark:bg-neutral-700 dark:outline-neutral-600"
                    }`}
                  >
                    <svg
                      className={`size-3 text-white ${
                        rememberMe ? "opacity-100" : "opacity-0"
                      }`}
                      viewBox="0 0 12 10"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 5l3 3 7-7" />
                    </svg>
                  </span>

                  <span className="ml-3 text-sm text-slate-700 dark:text-slate-300">
                    Remember me
                  </span>
                </label>

                <Link
                  to="/forgot-password"
                  className="ml-auto text-sm font-medium text-blue-700 dark:text-blue-500 hover:underline"
                >
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Sign in
              </button>

              <div className="text-slate-900 text-sm text-center dark:text-slate-50">
                Don&apos;t have an account?
                <Link
                  to="/register"
                  className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500"
                >
                  Sign up
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Login;
