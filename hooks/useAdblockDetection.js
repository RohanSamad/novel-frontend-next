// hooks/useAdblockDetection.js
import { useEffect, useState } from "react";

const detectAdblock = () => {
  return new Promise((resolve) => {
    let scriptBlocked = false;
    let fetchBlocked = false;
    let visibilityBlocked = false;

    // Test 1: Fake ad script
    const scriptTest = new Promise((resolveTest) => {
      const script = document.createElement("script");
      script.src = "/ads.js";
      script.onload = () => {
        scriptBlocked = false;
        resolveTest();
      };
      script.onerror = () => {
        scriptBlocked = true;
        resolveTest();
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
    const fetchTest = new Promise((resolveTest) => {
      fetch("https://www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js", {
        method: "HEAD",
        mode: "no-cors",
      })
        .then(() => {
          fetchBlocked = false;
          resolveTest();
        })
        .catch(() => {
          fetchBlocked = true;
          resolveTest();
        });
    });

    // Test 3: Visibility check
    const visibilityTest = new Promise((resolveTest) => {
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

      resolveTest();
    });

    // Run all tests with timeout
    Promise.race([
      Promise.all([scriptTest, fetchTest, visibilityTest]),
      new Promise((resolveTimeout) => setTimeout(resolveTimeout, 3000)),
    ]).then(() => {
      // If any test indicates blocking
      if (scriptBlocked || fetchBlocked || visibilityBlocked) {
        console.log("✅ Adblock detected!");
        resolve(true);
      } else {
        console.log("❌ No adblock detected.");
        resolve(false);
      }
    });
  });
};

export const useAdblockDetection = () => {
  const [isAdblockDetected, setIsAdblockDetected] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkAdblock = async () => {
      const blocked = await detectAdblock();
      setIsAdblockDetected(blocked);
      setIsChecking(false);
    };
    
    checkAdblock();
  }, []);

  const checkAgain = async () => {
    setIsChecking(true);
    const blocked = await detectAdblock();
    setIsAdblockDetected(blocked);
    setIsChecking(false);
    return blocked;
  };

  return { isAdblockDetected, isChecking, checkAgain };
};
