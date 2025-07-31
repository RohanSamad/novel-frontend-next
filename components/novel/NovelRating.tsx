'use client'
import React, { useState, useEffect } from 'react';
import { Star } from 'lucide-react';
import axios from 'axios';
import { useAppSelector } from '../../hooks/redux';
import { toast } from 'react-hot-toast';

interface NovelRatingProps {
  novelId: string;
  initialRating?: number;
  onRatingChange?: (rating: number) => void;
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

const NovelRating: React.FC<NovelRatingProps> = ({
  novelId,
  initialRating = 0,
  onRatingChange,
  size = 'medium',
  className = ''
}) => {
  const [rating, setRating] = useState(initialRating);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { user } = useAppSelector(state => state.auth);



  const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

  useEffect(() => {
    if (user?.id) {
      fetchUserRating();
    }
  }, [user?.id, novelId]);

  const fetchUserRating = async () => {
    if (!user?.id) return;

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.get(`${BASE_URL}/api/novel-ratings`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/json',
        },
        params: {
          novel_id: novelId,
          user_id: user.id,
        },
      });


      const data = response.data.data;
      if (data) {
        setRating(data.rating);
        onRatingChange?.(data.rating);
      }
    } catch  {
      console.error('Error fetching rating:');
    }
  };

  const handleRating = async (value: number) => {
    if (!user?.id) {
      toast.error('Please sign in to rate novels');
      return;
    }

    if (value === rating) {
      return; 
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem('auth_token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      const response = await axios.post(
        `${BASE_URL}/api/novel-ratings`,
        {
          novel_id: novelId,
          rating: value,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );


      const data = response.data.data;
      setRating(data.rating);
      onRatingChange?.(data.rating);
      toast.success('Rating submitted successfully');
    } finally {
      setIsSubmitting(false);
    }
  };

  const starSizes = {
    small: 'w-4 h-4',
    medium: 'w-6 h-6',
    large: 'w-8 h-8'
  };

  return (
    <div className={`flex items-center space-x-1 ${className}`} role="group" aria-label="Rate novel">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          onClick={() => !isSubmitting && handleRating(value)}
          onMouseEnter={() => setHoverRating(value)}
          onMouseLeave={() => setHoverRating(0)}
          onFocus={() => setHoverRating(value)}
          onBlur={() => setHoverRating(0)}
          className={`transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 rounded ${
            isSubmitting ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'
          }`}
          disabled={isSubmitting}
          aria-label={`Rate ${value} star${value !== 1 ? 's' : ''}`}
          aria-pressed={value === rating}
        >
          <Star
            className={`
              ${starSizes[size]}
              ${value <= (hoverRating || rating)
                ? 'text-yellow-400 fill-current'
                : 'text-gray-300'
              }
              transition-colors
            `}
          />
        </button>
      ))}
    </div>
  );
};

export default NovelRating;