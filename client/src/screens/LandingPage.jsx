import React from "react";
import { Link } from "react-router-dom";

function LandingPage() {
  return (
    <main className="bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-neutral-900 dark:to-neutral-800">
      <div className="min-h-screen flex flex-col items-center justify-center px-4 md:px-8">
        <div className="max-w-2xl w-full text-center">
          {/* Logo */}
          <img
            src="https://readymadeui.com/logo-alt.svg"
            alt="logo"
            className="w-16 h-16 mb-8 mx-auto block"
          />

          {/* Main Heading */}
          <h1 className="text-4xl md:text-5xl font-bold text-slate-900 dark:text-slate-50 mb-4">
            Welcome to TraceNode
          </h1>

          {/* Subheading */}
          <p className="text-lg text-slate-600 dark:text-slate-300 mb-8">
            Manage your tasks efficiently with our powerful task tracking
            system. Keep track of new items and mark them as finished.
          </p>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
              <div className="text-3xl mb-3">📋</div>
              <h3 className="text-slate-900 dark:text-slate-50 font-semibold mb-2">
                Track Items
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Keep all your tasks organized in one place
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
              <div className="text-3xl mb-3">✅</div>
              <h3 className="text-slate-900 dark:text-slate-50 font-semibold mb-2">
                Mark Complete
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Move items to finished when they&apos;re done
              </p>
            </div>

            <div className="p-6 bg-white dark:bg-neutral-800 rounded-lg shadow-md">
              <div className="text-3xl mb-3">🔒</div>
              <h3 className="text-slate-900 dark:text-slate-50 font-semibold mb-2">
                Secure
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Your data is safe and encrypted
              </p>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/login"
              className="px-8 py-3 text-sm rounded-md font-semibold text-white bg-blue-600 hover:bg-blue-700 transition-all"
            >
              Sign In
            </Link>

            <Link
              to="/register"
              className="px-8 py-3 text-sm rounded-md font-semibold text-blue-600 bg-white border border-blue-600 hover:bg-blue-50 transition-all dark:text-blue-500 dark:bg-neutral-800 dark:border-blue-500 dark:hover:bg-neutral-700"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

export default LandingPage;
