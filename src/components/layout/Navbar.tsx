
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Get initials for avatar fallback
  const getInitials = () => {
    if (profile?.full_name) {
      return profile.full_name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase();
    }
    return user?.email?.substring(0, 2).toUpperCase() || "U";
  };

  return (
    <nav className="bg-[#0F0F13] border-b border-white/5 text-white">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <span className="text-xl font-bold">luma<span className="text-purple-500">+</span></span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/events" className="text-white/70 hover:text-white">
              Explore Events
            </Link>
            <Link to="/how-it-works" className="text-white/70 hover:text-white">
              How It Works
            </Link>
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full hover:bg-white/10">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                      <AvatarFallback className="bg-purple-700 text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1C1C24] border-white/10 text-white">
                  <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <Link to="/create" className="flex items-center">Create Event</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem onClick={handleSignOut} className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button asChild variant="ghost" className="text-white hover:bg-white/10">
                  <Link to="/login">Log in</Link>
                </Button>
                <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white border-none">
                  <Link to="/signup">Sign up</Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              type="button"
              className="text-white/70 hover:text-white"
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
        <div className="md:hidden bg-[#13131A] border-b border-white/5 py-4">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            <Link
              to="/events"
              className="text-white/70 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              Explore Events
            </Link>
            <Link
              to="/how-it-works"
              className="text-white/70 hover:text-white py-2"
              onClick={() => setIsMenuOpen(false)}
            >
              How It Works
            </Link>
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-white/70 hover:text-white py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link
                    to="/create"
                    className="text-white/70 hover:text-white py-2"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Create Event
                  </Link>
                  <Button variant="outline" onClick={handleSignOut} className="border-white/20 text-white hover:bg-white/10">
                    Log out
                  </Button>
                </>
              ) : (
                <>
                  <Button asChild variant="outline" className="border-white/20 text-white hover:bg-white/10">
                    <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                      Log in
                    </Link>
                  </Button>
                  <Button asChild className="bg-purple-600 hover:bg-purple-700 text-white">
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)}>
                      Sign up
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
