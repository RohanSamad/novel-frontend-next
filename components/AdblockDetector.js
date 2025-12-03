// components/AdblockDetector.js
"use client";

import { useEffect, useState } from "react";

const AdblockDetector = () => {
  const [isAdblockEnabled, setIsAdblockEnabled] = useState(false);

  useEffect(() => {
    const detectAdblock = async () => {
      try {
        const { default: FuckAdBlock } = await import("fuckadblock");

        const fuckAdBlock = new FuckAdBlock();
        fuckAdBlock.on(true, () => {
          setIsAdblockEnabled(true);
        });

        fuckAdBlock.on(false, () => {
          setIsAdblockEnabled(false);
        });

        fuckAdBlock.check();
      } catch (err) {
        console.error("Error initializing FuckAdBlock:", err);
        setIsAdblockEnabled(true); // Fallback in case of error
      }
    };

    detectAdblock();
  }, []);

  if (!isAdblockEnabled) return null;

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
