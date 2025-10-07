import { useEffect, useRef, useState } from 'react';

const AdBanner = ({ 
  format = 'iframe', 
  height = 250, 
  width = 300,
  className = '',
  loadDelay = 2000 // Delay in milliseconds after component mounts
}) => {
  const containerRef = useRef(null);
  const [shouldLoadAd, setShouldLoadAd] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  // Load ad after component mounts and delay
  useEffect(() => {
    const timer = setTimeout(() => {
      setShouldLoadAd(true);
    }, loadDelay);

    return () => clearTimeout(timer);
  }, [loadDelay]);

  // Load the ad script when shouldLoadAd is true
  useEffect(() => {
    if (!shouldLoadAd || !containerRef.current) return;

    const loadAd = async () => {
      try {
        // Clean up previous instances
        if (containerRef.current) {
          containerRef.current.innerHTML = '';
        }
        
        // Set up atOptions
        window.atOptions = {
          key: '1a2b80d70de8a64dc14a34eacacf0575',
          format: format,
          height: height,
          width: width,
          params: {}
        };

        // Load the external script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js';
        script.async = true;
        
        // Add error handling
        script.onerror = () => {
          setError('Failed to load advertisement');
          setIsLoaded(false);
        };

        script.onload = () => {
          setIsLoaded(true);
          setError(null);
        };

        document.body.appendChild(script);

      } catch (err) {
        setError('Error loading advertisement');
        console.error('Ad loading error:', err);
      }
    };

    loadAd();

    return () => {
      // Cleanup function
      if (window.atOptions) {
        delete window.atOptions;
      }
    };
  }, [shouldLoadAd, format, height, width]);

  return (
    <div className={className}>
      <div
        ref={containerRef}
        style={{
          height: `${height}px`,
          width: `${width}px`,
          minHeight: '50px',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          border: '1px dashed #ccc',
          borderRadius: '4px'
        }}
      >
        {!shouldLoadAd && (
          <div style={{ 
            color: '#666', 
            fontSize: '12px', 
            textAlign: 'center',
            padding: '10px'
          }}>
            Advertisement
          </div>
        )}
        {shouldLoadAd && !isLoaded && !error && (
          <div style={{ 
            color: '#666', 
            fontSize: '12px', 
            textAlign: 'center',
            padding: '10px'
          }}>
            Loading advertisement...
          </div>
        )}
        {error && (
          <div style={{ 
            color: '#999', 
            fontSize: '12px', 
            textAlign: 'center',
            padding: '10px'
          }}>
            Advertisement unavailable
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;