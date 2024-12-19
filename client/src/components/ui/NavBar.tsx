import { useState } from "react";
import { Menu, X } from "lucide-react";
import { Link } from "react-router-dom";


export type NavbarLink = {
  path : string,
  label : string,
  isHidden? : boolean
}

export function Navbar({navlinks} : {navlinks : NavbarLink[]}) {
  const [isMobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen((prev) => !prev);
  };

  return (
    <nav className="w-full bg-white shadow">
      <div className="max-w-screen-2xl mx-auto p-4 flex justify-between items-center">
        <Link to="/" className="text-xl font-bold">
          Inventory System
        </Link>

        <button
          className="md:hidden focus:outline-none"
          onClick={toggleMobileMenu}
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-700" />
          ) : (
            <Menu className="w-6 h-6 text-gray-700" />
          )}
        </button>

        <div className="hidden md:flex space-x-4">
          {navlinks.map((link) => {
            if(link.isHidden) return null;
            return <Link
              key={link.path}
              to={link.path}
              className={"text-gray-700 hover:text-gray-900 block"}
            >
              {link.label}
            </Link>
        })}
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden bg-white shadow p-4 space-y-2">
          {navlinks.map((link) => {
            if(link.isHidden) return null;
            return <Link
              key={link.path}
              to={link.path}
              className={"text-gray-700 hover:text-gray-900 block"}
              onClick={toggleMobileMenu}
            >
              {link.label}
            </Link>
})}
        </div>
      )}
    </nav>
  );
}
