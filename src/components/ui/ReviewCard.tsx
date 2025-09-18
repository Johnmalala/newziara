import React from 'react';
import { Star } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type ReviewWithProfile = {
  rating: number;
  comment: string | null;
  created_at: string;
  profile: { full_name: string | null } | null;
};

interface ReviewCardProps {
  review: ReviewWithProfile;
}

const ReviewCard: React.FC<ReviewCardProps> = ({ review }) => {
  const renderStars = (rating: number) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-5 w-5 ${i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="border-t border-gray-200 py-6">
      <div className="flex items-center mb-3">
        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center mr-4">
          <span className="font-semibold text-gray-600">
            {review.profile?.full_name?.charAt(0)?.toUpperCase() || 'A'}
          </span>
        </div>
        <div>
          <p className="font-semibold text-gray-800">{review.profile?.full_name || 'Anonymous'}</p>
          <p className="text-sm text-gray-500">
            {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
          </p>
        </div>
      </div>
      <div className="mb-3">
        {renderStars(review.rating)}
      </div>
      {review.comment && (
        <div className="prose prose-sm max-w-none text-gray-700">
          <p>{review.comment}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;
