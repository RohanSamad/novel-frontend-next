// components/logo/BookIcon.tsx
'use client';

import React, { useState } from 'react';

const BookIcon = ({ className }: { className?: string }) => {
  const [imageError, setImageError] = useState(false);

  if (imageError) {
    return (
      <div className={className} style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        fontSize: '1.5rem'
      }}>
        📚
      </div>
    );
  }

  return (
    <div className={className}>
      <img 
        src="/book-icon.svg" 
        alt="Book Icon"
        className="w-full h-full"
        onError={() => setImageError(true)}
        loading="lazy"
      />
    </div>
  );
};

export default BookIcon;
