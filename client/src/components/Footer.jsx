import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t mt-20">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-600">
          &copy; {year} TraceNode. All rights reserved.
        </div>

        <nav className="flex items-center gap-6 text-sm text-gray-600">
          <Link to="/" className="hover:text-gray-900">
            Home
          </Link>
          <Link to="/users" className="hover:text-gray-900">
            Users
          </Link>
          <Link to="/login" className="hover:text-gray-900">
            Login
          </Link>
        </nav>
      </div>
    </footer>
  );
}

export default Footer;
