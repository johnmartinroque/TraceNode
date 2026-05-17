// Register.jsx
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { Link, useNavigate } from "react-router-dom";

function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();

    const { data: signUpData, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    const user = signUpData?.user;
    if (user?.id && user.email) {
      const { error: insertError } = await supabase.from("users").insert({
        uid: user.id,
        email: user.email,
      });

      if (insertError) {
        console.error("Failed to insert user record:", insertError);
        alert("Registration succeeded, but saving user details failed.");
        return;
      }
    }

    alert("Check your email for verification!");
    navigate("/login");
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
              Sign up
            </h1>

            <form className="space-y-6 mt-10" onSubmit={handleRegister}>
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

              <button
                type="submit"
                className="w-full py-2 px-3.5 text-sm rounded-md font-semibold cursor-pointer tracking-wide text-white border border-blue-600 bg-blue-600 hover:bg-blue-700 transition-all"
              >
                Sign up
              </button>

              <div className="text-slate-900 text-sm text-center dark:text-slate-50">
                Already have an account?
                <Link
                  to="/login"
                  className="text-blue-700 hover:underline ml-1 font-medium dark:text-blue-500"
                >
                  Sign in
                </Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;
