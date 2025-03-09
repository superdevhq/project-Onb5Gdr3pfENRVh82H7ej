
import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold text-indigo-600">EventHub</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-gray-600 hover:text-indigo-600">
              Explore Events
            </Link>
            <Link to="/how-it-works" className="text-gray-600 hover:text-indigo-600">
              How It Works
            </Link>
          </div>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/login">Log in</Link>
            </Button>
            <Button asChild>
              <Link to="/signup">Sign up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-gray-600 hover:text-indigo-600"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              to="/events"
              className="text-gray-600 hover:text-indigo-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Events
            </Link>
            <Link
              to="/how-it-works"
              className="text-gray-600 hover:text-indigo-600 py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-4 border-t border-gray-200 flex flex-col space-y-2">
              <Button asChild variant="outline">
                <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                  Log in
                </Link>
              </Button>
              <Button asChild>
                <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                  Sign up
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
