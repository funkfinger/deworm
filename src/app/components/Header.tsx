"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="bg-base-200 shadow-md">
      <div className="container mx-auto px-4 py-2">
        <div className="flex justify-center items-center">
          <Link href="/" className="flex items-center">
            <img src="/images/logo.svg" alt="DeWorm" className="h-12" />
          </Link>
        </div>
      </div>
    </header>
  );
}
