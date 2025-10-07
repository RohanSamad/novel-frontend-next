import { useEffect, useRef, useState } from 'react';

const AdBanner = ({ 
  height = 250, 
  width = 300,
  className = ''
}) => {
  const containerRef = useRef(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const timer = setTimeout(() => {
      try {
        // Create a completely new div for the ad
        const adDiv = document.createElement('div');
        adDiv.id = `ad-${Date.now()}`; // Unique ID
        adDiv.style.width = '100%';
        adDiv.style.height = '100%';
        
        // Clear and set container
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(adDiv);
        
        // Set up atOptions
        window.atOptions = {
          key: '1a2b80d70de8a64dc14a34eacacf0575',
          format: 'iframe',
          height: height,
          width: width,
          params: {}
        };

        // Load script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js';
        script.async = true;
        script.onerror = () => setError(true);
        
        document.body.appendChild(script);
        
        // Cleanup
        return () => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
          delete window.atOptions;
        };
        
      } catch (err) {
        setError(true);
      }
    }, 1500); // Delay to ensure page stability

    return () => clearTimeout(timer);
  }, [height, width]);

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
        {error && (
          <div style={{ 
            color: '#999', 
            fontSize: '12px', 
            textAlign: 'center'
          }}>
            Ad unavailable
          </div>
        )}
      </div>
    </div>
  );
};

export default AdBanner;