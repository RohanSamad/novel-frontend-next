// components/ui/rating/RatingModal.tsx
import React from "react";
import { Star } from "lucide-react";
import Button from "@/components/ui/Button";

export interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  currentRating: number;
  novelTitle: string;
  isLoading?: boolean;
}

const RatingModal: React.FC<RatingModalProps> = ({
  isOpen,
  onClose,
  onRate,
  currentRating,
  novelTitle,
  isLoading = false,
}) => {
  const [selectedRating, setSelectedRating] = React.useState(currentRating);

  React.useEffect(() => {
    setSelectedRating(currentRating);
  }, [currentRating]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">
          Rate {novelTitle}
        </h3>

        <div className="flex justify-center space-x-2 mb-6">
          {[1, 2, 3, 4, 5].map((rating) => (
            <button
              key={rating}
              onClick={() => setSelectedRating(rating)}
              className={`p-2 rounded-full transition-colors ${
                rating <= selectedRating
                  ? "text-yellow-500 hover:text-yellow-600"
                  : "text-gray-300 hover:text-gray-400"
              }`}
            >
              <Star
                className={`w-8 h-8 ${
                  rating <= selectedRating ? "fill-current" : ""
                }`}
              />
            </button>
          ))}
        </div>

        <div className="flex justify-end space-x-3">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={() => onRate(selectedRating)}
            disabled={selectedRating === 0 || isLoading}
          >
            {isLoading ? "Submitting..." : "Submit Rating"}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RatingModal;
