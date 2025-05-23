"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { MyLogo } from "./NotifyGradientLine";
import { useAuth } from "@clerk/nextjs";
import DashboardRedirectButtom from "./DashboardRedirectButtom";

const Navbar = () => {
  const { userId } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    if (!isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
  };

  // Handle screen resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
        document.body.style.overflow = "unset";
      }
    };

    window.addEventListener("resize", handleResize);
    handleResize();

    return () => {
      window.removeEventListener("resize", handleResize);
      document.body.style.overflow = "unset";
    };
  }, []);

  const scrollToSection = (sectionId: string) => {
    const section = document.getElementById(sectionId);
    if (section) {
      const offset = 80; // Adjust this value based on your navbar height
      const elementPosition = section.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
    setIsMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 left-0 right-0 z-50">
      <div className="relative z-50"></div>
      <div className="relative">
        {/* NotifyGradientLine will be above this */}
        <div className="bg-white/80 backdrop-blur-md border-b border-gray-100">
          <div className="py-4 px-4 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
              {/* Logo */}
              <Link
                href="/"
                className="text-2xl font-bold z-50 flex items-center gap-2 hover:opacity-80 transition-opacity">
                <MyLogo />
                <span>Eversell.</span>
              </Link>

              {/* Hamburger menu for mobile */}
              <button
                className="md:hidden z-50 w-10 h-10 flex items-center justify-center hover:opacity-80 transition-opacity"
                onClick={toggleMenu}
                aria-label="Toggle menu">
                <div className="relative w-6 h-5">
                  <span
                    className={`absolute w-6 h-0.5 bg-black transition-all duration-300 ${
                      isMenuOpen ? "top-2 rotate-45" : "top-0"
                    }`}
                  />
                  <span
                    className={`absolute w-6 h-0.5 bg-black top-2 transition-all duration-300 ${
                      isMenuOpen ? "opacity-0" : "opacity-100"
                    }`}
                  />
                  <span
                    className={`absolute w-6 h-0.5 bg-black transition-all duration-300 ${
                      isMenuOpen ? "top-2 -rotate-45" : "top-4"
                    }`}
                  />
                </div>
              </button>

              {/* Navigation Links for larger screens */}
              <div className="hidden md:flex items-center space-x-8">
                <button
                  onClick={() => scrollToSection("solutions")}
                  className="text-gray-600 hover:text-gray-900 transition-colors">
                  Solutions
                </button>
                <button
                  onClick={() => scrollToSection("features")}
                  className="text-gray-600 hover:text-gray-900 transition-colors">
                  Features
                </button>
                <button
                  onClick={() => scrollToSection("pricing")}
                  className="text-gray-600 hover:text-gray-900 transition-colors">
                  Pricing
                </button>
                {/* <button
                  onClick={() => scrollToSection("resources")}
                  className="text-gray-600 hover:text-gray-900 transition-colors">
                  Resources
                </button> */}
                {userId ? (
                  <DashboardRedirectButtom />
                ) : (
                  <>
                    <Link
                      href="/book-demo"
                      className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors shadow-sm">
                      Contact Us
                    </Link>
                    <Link
                      href="/sign-in"
                      className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ml-2 font-medium">
                      Login
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Full screen mobile menu */}
        <div
          className={`fixed inset-0 w-full min-h-screen bg-white/95 backdrop-blur-md z-40 transition-transform duration-200 transform md:hidden ${
            isMenuOpen
              ? "translate-x-0 opacity-100"
              : "translate-x-full opacity-0 pointer-events-none"
          }`}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            height: "100vh",
            width: "100vw",
          }}>
          {/* Add close button */}
          <button
            onClick={toggleMenu}
            className="absolute top-6 right-4 p-2"
            aria-label="Close menu">
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
          <div className="flex flex-col items-center justify-center min-h-screen space-y-8 text-2xl px-4">
            <button
              onClick={() => {
                scrollToSection("features");
                toggleMenu();
              }}
              className="text-gray-800 hover:text-gray-600 transition-colors">
              Features
            </button>
            <button
              onClick={() => {
                scrollToSection("solutions");
                toggleMenu();
              }}
              className="text-gray-800 hover:text-gray-600 transition-colors">
              Solutions
            </button>
            <button
              onClick={() => {
                scrollToSection("pricing");
                toggleMenu();
              }}
              className="text-gray-800 hover:text-gray-600 transition-colors">
              Pricing
            </button>
            <button
              onClick={() => {
                scrollToSection("resources");
                toggleMenu();
              }}
              className="text-gray-800 hover:text-gray-600 transition-colors">
              Resources
            </button>
            {userId ? (
              <>
                <DashboardRedirectButtom />
              </>
            ) : (
              <>
                <Link
                  href="/contact"
                  className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800 transition-colors"
                  onClick={toggleMenu}>
                  Contact Us
                </Link>
                <Link
                  href="/login"
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors ml-2 font-medium">
                  Login
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
