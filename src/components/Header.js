"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { 
  FiMenu, 
  FiX, 
  FiMusic, 
  FiPlus, 
  FiHome,
  FiLogIn,
  FiLogOut,
  FiUser
} from "react-icons/fi";

export default function Header() {
  const { user, isAuthenticated, signOut } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeHover, setActiveHover] = useState(null);
  const [greeting, setGreeting] = useState("");
  const lastScrollY = useRef(0);
  const router = useRouter();
  const menuRef = useRef(null);

  // Set time-based greeting
  useEffect(() => {
    const updateGreeting = () => {
      const hour = new Date().getHours();
      if (hour < 12) setGreeting("Good morning");
      else if (hour < 18) setGreeting("Good afternoon");
      else setGreeting("Good evening");
    };
    
    updateGreeting();
    const interval = setInterval(updateGreeting, 60000);
    return () => clearInterval(interval);
  }, []);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      setIsScrolled(currentScrollY > 20);

      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await signOut();
      router.push('/auth');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }; 

  const navItems = [
    { id: "music", icon: <FiHome />, label: "Home", path: "/" },
    { id: "myplaylists", icon: <FiMenu/>, label: "My Playlists", path: "/myplaylists" },

  ];

  const authItem = isAuthenticated
    ? { 
        id: "user", 
        icon: <FiUser />, 
        label: greeting || "Account", 
        action: () => router.push("/profile"),
        secondaryAction: handleLogout
      }
    : { 
        id: "auth", 
        icon: <FiLogIn />, 
        label: "Login", 
        action: () => router.push("/auth") 
      };

  const mobileNavItems = [
    ...navItems,
    { ...authItem, label: isAuthenticated ? "Account" : "Login" },
    ...(isAuthenticated ? [{ 
      id: "logout", 
      icon: <FiLogOut />, 
      label: "Logout", 
      action: handleLogout 
    }] : [])
  ];

  return (
    <header
      ref={menuRef}
      className={`fixed top-0 left-0 w-full z-50 px-4 py-3 transition-all duration-300 ${
        isScrolled ? "bg-black/80 backdrop-blur-md border-b border-gray-700 shadow-lg" : "bg-black/90"
      } ${hidden ? "-translate-y-full" : "translate-y-0"}`}
    >
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        {/* Logo */}
        <div 
          className="flex items-center gap-3 group cursor-pointer"
          onClick={() => router.push("/")}
        >
          <div className="w-8 h-8 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full flex items-center justify-center">
            <FiMusic className="text-white" size={18} />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            Audiora
          </h1>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-full bg-gray-800/80 hover:bg-gray-700 transition-all duration-300 group"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label={isMenuOpen ? "Close menu" : "Open menu"}
        >
          {isMenuOpen ? (
            <FiX className="text-gray-300 group-hover:text-white transition-colors" size={24} />
          ) : (
            <FiMenu className="text-gray-300 group-hover:text-white transition-colors" size={24} />
          )}
        </button>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex gap-2 items-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                router.push(item.path);
                setIsMenuOpen(false);
              }}
              onMouseEnter={() => setActiveHover(item.id)}
              onMouseLeave={() => setActiveHover(null)}
              className={`px-5 py-2.5 relative overflow-hidden rounded-full transition-all duration-300 ${
                activeHover === item.id
                  ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-300 hover:text-white"
              }`}
              aria-label={item.label}
            >
              <span className="flex items-center gap-2 z-10 relative">
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </span>
              {activeHover === item.id && (
                <span className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-blue-500/10 animate-pulse rounded-full" />
              )}
            </button>
          ))}

          {/* Auth Button */}
          <div className="relative group ml-2">
            <button
              onClick={authItem.action}
              onMouseEnter={() => setActiveHover(authItem.id)}
              onMouseLeave={() => setActiveHover(null)}
              className={`px-5 py-2.5 relative overflow-hidden rounded-full transition-all duration-300 flex items-center gap-2 ${
                activeHover === authItem.id
                  ? "bg-gradient-to-r from-purple-600/30 to-blue-600/30 text-white shadow-lg"
                  : "bg-gray-800/50 text-gray-300 hover:text-white"
              }`}
              aria-label={authItem.label}
            >
              <span className="text-lg">{authItem.icon}</span>
              <span className="text-sm font-medium">
                {isAuthenticated ? (
                  <span className="truncate max-w-[120px]">
                  {greeting},{" "}
                  {user?.user_metadata?.full_name
                    ? user.user_metadata.full_name.split(' ')[0].toLowerCase().replace(/^./, c => c.toUpperCase())
                    : user?.email?.split('@')[0] || 'User'}
                </span>
                
                ) : (
                  authItem.label
                )}
              </span>
            </button>

            {isAuthenticated && (
              <button
                onClick={authItem.secondaryAction}
                className="absolute -right-2 -top-2 bg-red-500/90 hover:bg-red-400 text-white p-1 rounded-full transition-all duration-200 opacity-0 group-hover:opacity-100"
                aria-label="Logout"
              >
                <FiLogOut size={14} />
              </button>
            )}
          </div>
        </nav>

        {/* Mobile Dropdown Menu */}
        {isMenuOpen && (
          <div className="absolute top-full right-0 w-full md:hidden bg-gradient-to-b from-gray-900/95 to-gray-800/95 backdrop-blur-xl border-b border-gray-700 shadow-2xl">
            <ul className="flex flex-col p-4 gap-1">
              {mobileNavItems.map((item) => (
                <li key={item.id}>
                  <button
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push('/');
                    }}
                    className="w-full px-4 py-3 flex items-center gap-3 rounded-lg transition-all duration-200 text-gray-300 hover:bg-gray-700/80 hover:text-white"
                    aria-label={item.label}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="text-sm font-medium">{item.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </header>
  );
}