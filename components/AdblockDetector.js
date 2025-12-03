// components/AdblockDetector.js
"use client";

import { useEffect, useState } from "react";

const AdblockDetector = () => {
  const [isAdblockEnabled, setIsAdblockEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !isClient) return;

    let adsterraLoaded = false;
    let fallbackLoaded = false;

    const checkComplete = () => {
      if (adsterraLoaded && fallbackLoaded) {
        // Both checks completed
        if (!window.adsterraSuccess && !window.fallbackSuccess) {
          console.log("Adblock detected via both methods.");
          setIsAdblockEnabled(true);
        } else {
          console.log("No adblock detected.");
          setIsAdblockEnabled(false);
        }
      }
    };

    // Method 1: Try loading Adsterra script
    const testAdsterra = () => {
      const img = new Image();
      img.onload = () => {
        window.adsterraSuccess = true;
        adsterraLoaded = true;
        checkComplete();
      };
      img.onerror = () => {
        window.adsterraSuccess = false;
        adsterraLoaded = true;
        checkComplete();
      };
      img.src = 'https://www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js';
    };

    // Method 2: Try loading local fallback script
    const testFallback = () => {
      const script = document.createElement("script");
      script.src = "/ads.js";
      script.onload = () => {
        window.fallbackSuccess = true;
        fallbackLoaded = true;
        checkComplete();
      };
      script.onerror = () => {
        window.fallbackSuccess = false;
        fallbackLoaded = true;
        checkComplete();
      };
      document.head.appendChild(script);

      // Cleanup
      return () => {
        if (document.head.contains(script)) {
          document.head.removeChild(script);
        }
      };
    };

    // Start both tests
    testAdsterra();
    const cleanup = testFallback();

    return () => {
      cleanup?.();
    };
  }, [isClient]);

  if (!isClient || !isAdblockEnabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-80 flex items-center justify-center">
      <div className="bg-white p-6 rounded shadow-lg text-center max-w-md">
        <h2 className="text-xl font-bold text-red-600">Adblock Detected!</h2>
        <p className="mt-2 text-gray-700">
          Please disable your ad blocker to support us and continue enjoying our
          free content.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reload Page
        </button>
      </div>
    </div>
  );
};

export default AdblockDetector;
