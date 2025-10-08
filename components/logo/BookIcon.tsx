import React from 'react';

const BookIcon = ({ className }: { className?: string }) => {
  return (
    <div className={className} style={{ height: '32px', width: '32px' }}>
      <iframe
        src="/book-icon.svg"
        sandbox="allow-scripts allow-same-origin"
        loading="lazy"
        scrolling="no"
        style={{
          border: 'none',
          width: '100%',
          height: '100%',
          background: 'transparent',
        }}
        title="Book Icon"
      />
    </div>
  );
};

export default BookIcon;