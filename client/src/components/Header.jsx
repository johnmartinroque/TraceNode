import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { supabase } from "../lib/supabase";

function Header() {
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Get current logged-in user
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      setUser(user || null);
    };

    getUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user || null);
      },
    );

    // Close dropdown when clicking outside
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();

    setUser(null);
    setDropdownOpen(false);

    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("user");
    localStorage.removeItem("session");

    navigate("/login");
  };

  return (
    <header>
      <nav className="bg-white border-gray-200 px-4 lg:px-6 py-2.5 dark:bg-gray-800">
        <div className="flex flex-wrap justify-between items-center mx-auto max-w-screen-xl">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <img
              src="https://flowbite.com/docs/images/logo.svg"
              className="mr-3 h-6 sm:h-9"
              alt="Logo"
            />
            <span className="self-center text-xl font-semibold whitespace-nowrap dark:text-white">
              Flowbite
            </span>
          </Link>

          {/* Right Side */}
          <div
            className="flex items-center lg:order-2 relative"
            ref={dropdownRef}
          >
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-white px-4 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <span>{user.email}</span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
                      dropdownOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-44 bg-white rounded-lg shadow-lg border border-gray-200 dark:bg-gray-700 dark:border-gray-600 z-50">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-red-400 rounded-lg"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-800 dark:text-white hover:bg-gray-50 focus:ring-4 focus:ring-gray-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2 mr-2 dark:hover:bg-gray-700"
                >
                  Log in
                </Link>

                <Link
                  to="/register"
                  className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-4 lg:px-5 py-2"
                >
                  Get started
                </Link>
              </>
            )}
          </div>

          {/* Navigation Links */}
          <div className="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1">
            <ul className="flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
              <li>
                <Link
                  to="/"
                  className="block py-2 pr-4 pl-3 text-blue-700 lg:p-0 dark:text-white"
                >
                  Home
                </Link>
              </li>

              <li>
                <Link
                  to="/company"
                  className="block py-2 pr-4 pl-3 text-gray-700 hover:text-blue-700 lg:p-0 dark:text-gray-400 dark:hover:text-white"
                >
                  Company
                </Link>
              </li>

              <li>
                <Link
                  to="/marketplace"
                  className="block py-2 pr-4 pl-3 text-gray-700 hover:text-blue-700 lg:p-0 dark:text-gray-400 dark:hover:text-white"
                >
                  Marketplace
                </Link>
              </li>

              <li>
                <Link
                  to="/features"
                  className="block py-2 pr-4 pl-3 text-gray-700 hover:text-blue-700 lg:p-0 dark:text-gray-400 dark:hover:text-white"
                >
                  Features
                </Link>
              </li>

              <li>
                <Link
                  to="/team"
                  className="block py-2 pr-4 pl-3 text-gray-700 hover:text-blue-700 lg:p-0 dark:text-gray-400 dark:hover:text-white"
                >
                  Team
                </Link>
              </li>

              <li>
                <Link
                  to="/contact"
                  className="block py-2 pr-4 pl-3 text-gray-700 hover:text-blue-700 lg:p-0 dark:text-gray-400 dark:hover:text-white"
                >
                  Contact
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </nav>
    </header>
  );
}

export default Header;
