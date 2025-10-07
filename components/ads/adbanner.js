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

    const loadAd = () => {
      try {
        // Clear container first
        containerRef.current.innerHTML = '';
        
        // Create iframe for complete isolation
        const iframe = document.createElement('iframe');
        iframe.style.width = '100%';
        iframe.style.height = '100%';
        iframe.style.border = 'none';
        iframe.sandbox = 'allow-scripts allow-same-origin'; // Restrict iframe capabilities
        
        // Create iframe content with ad script
        const iframeContent = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { margin: 0; padding: 0; overflow: hidden; }
            </style>
          </head>
          <body>
            <script>
              window.atOptions = {
                key: '1a2b80d70de8a64dc14a34eacacf0575',
                format: 'iframe',
                height: ${height},
                width: ${width},
                params: {}
              };
            <\/script>
            <script type="text/javascript" 
                    src="//www.highperformanceformat.com/1a2b80d70de8a64dc14a34eacacf0575/invoke.js">
            <\/script>
          </body>
          </html>
        `;
        
        // Write content to iframe
        iframe.onload = () => {
          try {
            const doc = iframe.contentDocument || iframe.contentWindow.document;
            doc.open();
            doc.write(iframeContent);
            doc.close();
          } catch (err) {
            console.error('Error writing iframe content:', err);
            setError('Advertisement failed to load');
          }
        };
        
        iframe.onerror = () => {
          setError('Advertisement failed to load');
        };
        
        containerRef.current.appendChild(iframe);
        
      } catch (err) {
        setError('Error loading advertisement');
        console.error('Ad loading error:', err);
      }
    };

    // Load with delay
    const timer = setTimeout(() => {
      loadAd();
    }, 1000);

    return () => {
      clearTimeout(timer);
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
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