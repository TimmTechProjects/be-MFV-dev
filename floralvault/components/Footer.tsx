import React from "react";

const Footer = () => {
  return (
    <footer className="w-full px-10 py-4 text-sm text-white bg-transparent">
      <div className="flex flex-col md:flex-row items-center justify-between gap-2">
        <span>
          © {new Date().getFullYear()} FloraVault. All rights reserved.
        </span>
        <div className="flex gap-4">
          <a href="/privacy" className="hover:underline">
            Privacy Policy
          </a>
          <a href="/terms" className="hover:underline">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
