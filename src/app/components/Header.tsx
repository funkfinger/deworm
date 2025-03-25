"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faSignOutAlt,
  faHome,
  faSearch,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import { isAuthenticated } from "@/app/lib/client-session";

export default function Header() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check if user is logged in on client side
    setIsLoggedIn(isAuthenticated());
  }, []);

  return (
    <header className="bg-base-200 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="navbar px-0">
          <div className="navbar-start">
            <Link
              href="/"
              className="text-xl font-bold flex items-center gap-2"
            >
              <span className="text-primary">DeWorm</span>
            </Link>
          </div>

          <div className="navbar-center hidden md:flex">
            <ul className="menu menu-horizontal px-1">
              <li>
                <Link href="/" className={pathname === "/" ? "active" : ""}>
                  <FontAwesomeIcon icon={faHome} />
                  Home
                </Link>
              </li>
              {isLoggedIn && (
                <>
                  <li>
                    <Link
                      href="/search"
                      className={pathname === "/search" ? "active" : ""}
                    >
                      <FontAwesomeIcon icon={faSearch} />
                      Search
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className={pathname === "/dashboard" ? "active" : ""}
                    >
                      <FontAwesomeIcon icon={faUser} />
                      Dashboard
                    </Link>
                  </li>
                </>
              )}
            </ul>
          </div>

          <div className="navbar-end">
            {isLoggedIn ? (
              <Link href="/api/auth/logout" className="btn btn-ghost btn-sm">
                <FontAwesomeIcon icon={faSignOutAlt} className="mr-1" />
                Logout
              </Link>
            ) : (
              <Link href="/api/auth/login" className="btn btn-primary btn-sm">
                Login with Spotify
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
