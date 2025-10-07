import { useEffect, useRef } from 'react';

const AdBanner2 = () => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Define atOptions
    window.atOptions = {
      'key': '8888a650ac1abe1b3039086c93b72cd1',
      'format': 'iframe',
      'height': 90,
      'width': 728,
      'params': {}
    };

    // Create and load the external script
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.highperformanceformat.com/8888a650ac1abe1b3039086c93b72cd1/invoke.js';
    script.async = true;

    containerRef.current.appendChild(script);

    // Cleanup function
    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
      delete window.atOptions;
    };
  }, []);

  return (
    <div ref={containerRef}>
      {/* Ad will be loaded here */}
    </div>
  );
};

export default AdBanner2;