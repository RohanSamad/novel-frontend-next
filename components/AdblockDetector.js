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

    let scriptBlocked = false;
    let fetchBlocked = false;
    let visibilityBlocked = false;

    const runDetection = async () => {
      // Test 1: Fake ad script
      const scriptTest = new Promise((resolve) => {
        const script = document.createElement("script");
        script.src = "/ads.js";
        script.onload = () => {
          scriptBlocked = false;
          resolve();
        };
        script.onerror = () => {
          scriptBlocked = true;
          resolve();
        };
        document.head.appendChild(script);

        // Cleanup
        setTimeout(() => {
          if (document.head.contains(script)) {
            document.head.removeChild(script);
          }
        }, 1000);
      });

      // Test 2: Fetch Adsterra domain
      const fetchTest = new Promise((resolve) => {
        fetch("https://www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js", {
          method: "HEAD",
          mode: "no-cors",
        })
          .then(() => {
            fetchBlocked = false;
            resolve();
          })
          .catch(() => {
            fetchBlocked = true;
            resolve();
          });
      });

      // Test 3: Visibility check
      const visibilityTest = new Promise((resolve) => {
        const adElement = document.createElement("div");
        adElement.innerHTML = "&nbsp;";
        adElement.className = "adsbox";
        adElement.style.height = "1px";
        document.body.appendChild(adElement);

        // Check if hidden
        visibilityBlocked = adElement.offsetHeight === 0;

        // Cleanup
        setTimeout(() => {
          if (document.body.contains(adElement)) {
            document.body.removeChild(adElement);
          }
        }, 100);

        resolve();
      });

      // Run all tests with timeout
      await Promise.race([
        Promise.all([scriptTest, fetchTest, visibilityTest]),
        new Promise((resolve) => setTimeout(resolve, 3000)),
      ]);

      // If any test indicates blocking
      if (scriptBlocked || fetchBlocked || visibilityBlocked) {
        console.log("✅ Adblock detected!");
        setIsAdblockEnabled(true);
      } else {
        console.log("❌ No adblock detected.");
        setIsAdblockEnabled(false);
      }
    };

    runDetection();
  }, [isClient]);

  if (!isClient || !isAdblockEnabled) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black bg-opacity-90 flex items-center justify-center">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-md mx-4">
        <h2 className="text-xl font-bold text-red-600 mb-2">Adblock Detected!</h2>
        <p className="text-gray-700 mb-4">
          Please disable your ad blocker to support us and continue enjoying our free content.
        </p>
        <div className="flex flex-col gap-2">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
          >
            Reload Page
          </button>
          <button
            onClick={() => {
              setIsAdblockEnabled(false);
            }}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Close (not recommended)
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdblockDetector;
