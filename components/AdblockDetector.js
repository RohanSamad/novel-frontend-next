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
    if (!isClient) return;

    const script = document.createElement("script");
    script.src = "/ads.js";
    script.onload = () => {
      setIsAdblockEnabled(false);
    };
    script.onerror = () => {
      setIsAdblockEnabled(true);
    };
    document.head.appendChild(script);

    return () => {
      if (document.head.contains(script)) {
        document.head.removeChild(script);
      }
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
