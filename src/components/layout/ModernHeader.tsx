
import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X, User, LogOut, ChevronRight, Calendar, Info, Search } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";

const ModernHeader = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, profile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  // Check if a link is active
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <header 
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        scrolled 
          ? "bg-[#0F0F13]/95 backdrop-blur-md shadow-md" 
          : "bg-transparent"
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center transition-transform duration-300 hover:scale-105"
          >
            <span className="text-xl font-bold text-white">
              luma<span className="text-purple-500">+</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <NavigationMenu>
              <NavigationMenuList className="gap-1">
                <NavigationMenuItem>
                  <Link to="/events">
                    <NavigationMenuLink 
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                        "text-white/70 hover:text-white hover:bg-white/10",
                        isActive("/events") && "bg-white/10 text-white"
                      )}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Explore Events
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuTrigger 
                    className="bg-transparent text-white/70 hover:text-white hover:bg-white/10 focus:bg-white/10"
                  >
                    Resources
                  </NavigationMenuTrigger>
                  <NavigationMenuContent>
                    <ul className="grid w-[400px] gap-3 p-4 bg-[#1C1C24] border border-white/10 rounded-md">
                      <li className="row-span-3">
                        <NavigationMenuLink asChild>
                          <a
                            className="flex h-full w-full select-none flex-col justify-end rounded-md bg-gradient-to-b from-purple-500/50 to-purple-900/50 p-6 no-underline outline-none focus:shadow-md"
                            href="/how-it-works"
                          >
                            <div className="mb-2 mt-4 text-lg font-medium text-white">
                              How It Works
                            </div>
                            <p className="text-sm leading-tight text-white/70">
                              Learn how to create, manage and promote your events with our platform.
                            </p>
                          </a>
                        </NavigationMenuLink>
                      </li>
                      <li>
                        <Link to="/pricing" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 focus:bg-white/10">
                          <div className="text-sm font-medium leading-none text-white">Pricing</div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/70">
                            Check our flexible pricing options for events of all sizes.
                          </p>
                        </Link>
                      </li>
                      <li>
                        <Link to="/help" className="block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-white/10 focus:bg-white/10">
                          <div className="text-sm font-medium leading-none text-white">Help Center</div>
                          <p className="line-clamp-2 text-sm leading-snug text-white/70">
                            Get support and answers to frequently asked questions.
                          </p>
                        </Link>
                      </li>
                    </ul>
                  </NavigationMenuContent>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <Link to="/how-it-works">
                    <NavigationMenuLink 
                      className={cn(
                        "group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors",
                        "text-white/70 hover:text-white hover:bg-white/10",
                        isActive("/how-it-works") && "bg-white/10 text-white"
                      )}
                    >
                      <Info className="mr-2 h-4 w-4" />
                      How It Works
                    </NavigationMenuLink>
                  </Link>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </div>

          {/* Auth Buttons or User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            {/* Search Button */}
            <Button 
              variant="ghost" 
              size="icon" 
              className="rounded-full hover:bg-white/10"
              onClick={() => navigate('/search')}
            >
              <Search className="h-5 w-5 text-white/70" />
            </Button>

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    className="relative h-9 w-9 rounded-full hover:bg-white/10 overflow-hidden ring-2 ring-purple-500/30 hover:ring-purple-500/50 transition-all duration-300"
                  >
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                      <AvatarFallback className="bg-purple-700 text-white">{getInitials()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-[#1C1C24] border-white/10 text-white w-56">
                  <div className="flex flex-col space-y-1 p-2">
                    <p className="text-sm font-medium">{profile?.full_name || user?.email}</p>
                    <p className="text-xs text-white/50 truncate">{user?.email}</p>
                  </div>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <Link to="/dashboard" className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild className="hover:bg-white/10 focus:bg-white/10 cursor-pointer">
                    <Link to="/create" className="flex items-center">
                      <Calendar className="mr-2 h-4 w-4" />
                      <span>Create Event</span>
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-white/10" />
                  <DropdownMenuItem 
                    onClick={handleSignOut} 
                    className="hover:bg-white/10 focus:bg-white/10 cursor-pointer text-red-400 hover:text-red-300"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <>
                <Button 
                  asChild 
                  variant="ghost" 
                  className="text-white hover:bg-white/10 transition-all duration-300"
                >
                  <Link to="/login">Log in</Link>
                </Button>
                <Button 
                  asChild 
                  className="bg-purple-600 hover:bg-purple-700 text-white border-none transition-all duration-300"
                >
                  <Link to="/signup" className="flex items-center">
                    Sign up
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="rounded-full hover:bg-white/10 mr-2"
                onClick={() => navigate('/search')}
              >
                <Search className="h-5 w-5 text-white/70" />
              </Button>
            )}
            <button
              type="button"
              className="text-white/70 hover:text-white transition-colors"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "Close menu" : "Open menu"}
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
        <div className="md:hidden bg-[#13131A] border-b border-white/5 py-4 animate-in slide-in-from-top duration-300">
          <div className="container mx-auto px-4 flex flex-col space-y-4">
            {user && (
              <div className="flex items-center space-x-3 p-2 bg-white/5 rounded-lg">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                  <AvatarFallback className="bg-purple-700 text-white">{getInitials()}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <p className="text-sm font-medium text-white">{profile?.full_name || "User"}</p>
                  <p className="text-xs text-white/50 truncate">{user?.email}</p>
                </div>
              </div>
            )}
            
            <Link
              to="/events"
              className="text-white/70 hover:text-white py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Calendar className="mr-2 h-4 w-4" />
              Explore Events
            </Link>
            <Link
              to="/how-it-works"
              className="text-white/70 hover:text-white py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              <Info className="mr-2 h-4 w-4" />
              How It Works
            </Link>
            <Link
              to="/pricing"
              className="text-white/70 hover:text-white py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Pricing
            </Link>
            <Link
              to="/help"
              className="text-white/70 hover:text-white py-2 flex items-center"
              onClick={() => setIsMenuOpen(false)}
            >
              Help Center
            </Link>
            
            <div className="pt-4 border-t border-white/10 flex flex-col space-y-2">
              {user ? (
                <>
                  <Link
                    to="/dashboard"
                    className="text-white/70 hover:text-white py-2 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <User className="mr-2 h-4 w-4" />
                    Dashboard
                  </Link>
                  <Link
                    to="/create"
                    className="text-white/70 hover:text-white py-2 flex items-center"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    Create Event
                  </Link>
                  <Button 
                    variant="outline" 
                    onClick={handleSignOut} 
                    className="border-white/20 text-red-400 hover:text-red-300 hover:bg-white/10 mt-2"
                  >
                    <LogOut className="mr-2 h-4 w-4" />
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
                    <Link to="/signup" onClick={() => setIsMenuOpen(false)} className="flex items-center">
                      Sign up
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

export default ModernHeader;
