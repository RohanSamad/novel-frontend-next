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

    const loadAd = async () => {
      try {
        // Create a completely isolated container
        const adContainer = document.createElement('div');
        adContainer.style.width = '100%';
        adContainer.style.height = '100%';
        adContainer.style.position = 'relative';
        
        // Clear container
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(adContainer);

        // Set up atOptions in a more isolated way
        const adScriptContent = `
          window.atOptions = {
            key: '1a2b80d70de8a64dc14a34eacacf0575',
            format: '${format}',
            height: ${height},
            width: ${width},
            params: {}
          };
        `;

        // Create script for atOptions
        const optionsScript = document.createElement('script');
        optionsScript.textContent = adScriptContent;
        document.body.appendChild(optionsScript);

        // Load the external script
        const script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = '//www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js';
        script.async = true;
        
        // Add error handling
        script.onerror = () => {
          setError('Failed to load advertisement');
          setIsLoaded(false);
          document.body.removeChild(optionsScript);
        };

        script.onload = () => {
          setIsLoaded(true);
          setError(null);
          // Try to move ad content to our container
          setTimeout(() => {
            moveAdContent(adContainer);
          }, 100);
        };

        document.body.appendChild(script);

        // Cleanup function
        return () => {
          if (document.body.contains(optionsScript)) {
            document.body.removeChild(optionsScript);
          }
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        };

      } catch (err) {
        setError('Error loading advertisement');
        console.error('Ad loading error:', err);
      }
    };

    // Function to move ad content to isolated container
    const moveAdContent = (targetContainer) => {
      // Look for recently added iframes that might be ads
      const iframes = document.querySelectorAll('iframe:not([data-processed])');
      iframes.forEach(iframe => {
        if (iframe.src && iframe.src.includes('highperformanceformat')) {
          iframe.setAttribute('data-processed', 'true');
          if (targetContainer && !targetContainer.contains(iframe)) {
            // Move iframe to our container
            targetContainer.appendChild(iframe);
          }
        }
      });
    };

    // Load ad with a delay to ensure page is stable
    const timer = setTimeout(() => {
      loadAd();
    }, 500);

    return () => {
      clearTimeout(timer);
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
          borderRadius: '4px',
          overflow: 'hidden'
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