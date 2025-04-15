"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";

const Header = () => {
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0); // Persist scroll position

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Hide on scroll down, show on scroll up
      if (currentScrollY > lastScrollY.current && currentScrollY > 50) {
        setHidden(true);
      } else {
        setHidden(false);
      }

      lastScrollY.current = currentScrollY; // Update last scroll position
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 w-full bg-black/40 backdrop-blur-md text-white p-4 z-50 transition-transform duration-300 ${
        hidden ? "-translate-y-full" : "translate-y-0"
      }`}
    >
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <h1 className="text-xl font-bold text-gray-200">4PlaylistGen</h1>
        <nav>
  <ul className="flex gap-6 text-gray-300">
    <li>
      <Link href="/" className="hover:text-white transition-colors">Home</Link>
    </li>
    <li>
      <Link href="/create-playlist" className="hover:text-white transition-colors">Create</Link>
    </li>
    <li>
      <Link href="/shared-playlist" className="hover:text-white transition-colors">Browse</Link>
    </li>
  </ul>
</nav>
      </div>
    </header>
  );
};

export default Header;
