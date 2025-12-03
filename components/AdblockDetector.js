// components/AdblockDetector.js
"use client";

import { useEffect, useState } from "react";

let FuckAdBlock;

const AdblockDetector = () => {
  const [isAdblockEnabled, setIsAdblockEnabled] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true); // Now we're on the client
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const initAdBlockDetection = async () => {
      try {
        if (!FuckAdBlock) {
          const fuckAdBlockModule = await import("fuckadblock");
          FuckAdBlock = fuckAdBlockModule.default;
        }

        const adBlock = new FuckAdBlock();

        adBlock.on(true, () => {
          console.log("Adblock detected!");
          setIsAdblockEnabled(true);
        });

        adBlock.on(false, () => {
          console.log("No adblock detected.");
          setIsAdblockEnabled(false);
        });

        adBlock.check();
      } catch (err) {
        console.error("Error initializing FuckAdBlock:", err);
        setIsAdblockEnabled(false);
      }
    };

    if (isClient) {
      initAdBlockDetection();
    }
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
