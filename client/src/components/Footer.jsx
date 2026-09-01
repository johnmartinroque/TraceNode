import React from "react";

function Footer() {
  return (
    <footer className="border-t mt-20">
      <div className="max-w-6xl mx-auto px-6 py-6 text-center text-sm text-gray-600">
        &copy; {new Date().getFullYear()} TraceNode. All rights reserved.
      </div>
    </footer>
  );
}

export default Footer;
