"use client";

import { faCookieBite } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";

const COOKIE_CONSENT_KEY = "deworm-cookie-consent";

export default function CookieConsent() {
  const [showConsent, setShowConsent] = useState(false);

  useEffect(() => {
    // Check if user has already consented
    const hasConsented = localStorage.getItem(COOKIE_CONSENT_KEY);
    if (!hasConsented) {
      setShowConsent(true);
    }
  }, []);

  const acceptCookies = () => {
    localStorage.setItem(COOKIE_CONSENT_KEY, "true");
    setShowConsent(false);
  };

  if (!showConsent) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-base-200">
      <div className="container mx-auto">
        <div className="alert shadow-lg">
          <FontAwesomeIcon icon={faCookieBite} className="w-6 h-6" />
          <div>
            <h3 className="font-bold">Cookie Policy</h3>
            <div className="text-xs">
              We use cookies to improve your experience and for authentication
              purposes. By continuing to use this site, you agree to our use of
              cookies.
            </div>
          </div>
          <div>
            <button
              className="btn btn-sm btn-primary"
              onClick={acceptCookies}
              type="button"
            >
              Accept
            </button>
            <a href="/privacy" className="btn btn-sm btn-ghost">
              Learn More
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
