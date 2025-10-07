import { useEffect, useRef, useState } from 'react';

const AdBanner = ({ 
  format = 'iframe', 
  height = 250, 
  width = 300,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clean up previous instances
    const cleanup = () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };

    const loadAd = async () => {
      try {
        cleanup();
        
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
      cleanup();
      if (window.atOptions) {
        delete window.atOptions;
      }
    };
  }, [format, height, width]);

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
        {!isLoaded && !error && (
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