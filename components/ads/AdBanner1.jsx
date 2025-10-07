import { useEffect, useRef, useState } from 'react';

const AdBanner1 = ({ adKey, format = 'responsive', lazyLoad = true }) => {
  const containerRef = useRef(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    // Clear previous content
    containerRef.current.innerHTML = '';

    // Enhanced atOptions with better configuration
    window.atOptions = {
      'key': adKey || '1a2b80d70de8a64dc14a34eacacf0575',
      'format': format === 'responsive' ? 'iframe' : format,
      'height': format === 'responsive' ? 'auto' : 250,
      'width': format === 'responsive' ? 'auto' : 300,
      'params': {
        'targeting': 'general', // Add targeting for better ad matching
        'frequency': 'high'     // Request higher frequency ads
      }
    };

    let script;

    try {
      // Create and load the external script
      script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//www.highperformanceformat.com/${adKey || '1a2b80d70de8a64dc14a34eacacf0575'}/invoke.js`;
      script.async = true;
      script.defer = true; // Better for page loading

      // Add load and error handlers
      script.onload = () => {
        setIsLoaded(true);
        // Add refresh mechanism for better revenue
        setTimeout(() => {
          if (window.atfRefresh) {
            window.atfRefresh();
          }
        }, 30000); // Refresh after 30 seconds
      };

      script.onerror = () => {
        setHasError(true);
        // Fallback mechanism
        loadFallbackAd();
      };

      containerRef.current.appendChild(script);
    } catch (error) {
      setHasError(true);
      loadFallbackAd();
    }

    // Cleanup function
    return () => {
      if (containerRef.current && script) {
        containerRef.current.removeChild(script);
      }
      delete window.atOptions;
      delete window.atfRefresh;
    };
  }, [adKey, format]);

  // Fallback ad loading for better fill rate
  const loadFallbackAd = () => {
    if (!containerRef.current) return;
    
    // You can implement fallback ad networks here
    // Example: Google AdSense, Amazon, etc.
    console.log('Loading fallback ad...');
  };

  // Enhanced container styling for better ad performance
  const containerStyle = {
    width: format === 'responsive' ? '100%' : 300,
    height: format === 'responsive' ? 'auto' : 250,
    minHeight: 250,
    minWidth: 300,
    margin: '10px auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8f9fa', // Better user experience
    border: '1px solid #e9ecef',
    borderRadius: '4px',
  };

  return (
    <div 
      ref={containerRef} 
      style={containerStyle}
      className="optimized-ad-container"
    >
      {!isLoaded && !hasError && (
        <div style={{
          color: '#6c757d',
          fontSize: '14px',
          textAlign: 'center'
        }}>
          Loading advertisement...
        </div>
      )}
      {hasError && (
        <div style={{
          color: '#6c757d',
          fontSize: '12px',
          textAlign: 'center'
        }}>
          Ad unavailable
        </div>
      )}
    </div>
  );
};

export default AdBanner1;