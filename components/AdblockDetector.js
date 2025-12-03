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

    let adsterraFailed = false;
    let fallbackFailed = false;

    const checkAdblock = async () => {
      // Test 1: Adsterra script (fetch)
      try {
        const response = await fetch(
          "https://www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js",
          { method: "HEAD", mode: "no-cors" }
        );
        // If fetch succeeds, it doesn't mean it's not blocked.
        // We can't detect from response due to CORS, so we'll assume it's okay unless error.
        adsterraFailed = false;
      } catch (err) {
        adsterraFailed = true;
      }

      // Test 2: Local fallback script
      const script = document.createElement("script");
      script.src = "/ads.js";

      const fallbackPromise = new Promise((resolve) => {
        script.onload = () => {
          fallbackFailed = false;
          resolve();
        };
        script.onerror = () => {
          fallbackFailed = true;
          resolve();
        };
        document.head.appendChild(script);
      });

      await fallbackPromise;

      // Cleanup
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }

      // If both fail, adblock is likely active
      if (adsterraFailed && fallbackFailed) {
        console.log("Adblock detected!");
        setIsAdblockEnabled(true);
      } else {
        console.log("No adblock detected.");
        setIsAdblockEnabled(false);
      }
    };

    checkAdblock();
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
