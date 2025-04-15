"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function Footer() {
  return (
    <motion.footer
      className="mb-2 relative w-full py-6 px-6 text-gray-300 mt-0 backdrop-blur-lg border-t border-white/10"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      style={{
        background: "rgba(255, 255, 255, 0.05)",
      }}
    >
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">

        <p className="text-sm text-green-500">
        &copy; {new Date().getFullYear()} . All rights reserved.
      </p>        
      
        <nav className="mt-4 md:mt-0 flex space-x-6">
          {[
            { name: "About", href: "/about" },
          ].map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="text-green-400 hover:text-white transition duration-300 text-sm md:text-base"
            >
              {link.name}
            </Link>
          ))}
        </nav>
      </div>
    </motion.footer>
  );
}
