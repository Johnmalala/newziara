import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Star, Calendar, Users } from 'lucide-react';
import { motion } from 'framer-motion';
import { Listing } from '../../types';

interface ListingCardProps {
  listing: Listing;
  index?: number;
}

const ListingCard: React.FC<ListingCardProps> = ({ listing, index = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
    >
      <div className="relative">
        <img
          src={listing.images?.[0] || 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=400'}
          alt={listing.title}
          className="w-full h-48 object-cover"
        />
        <div className="absolute top-4 left-4">
          <span className="bg-red-600 text-white px-3 py-1 rounded-full text-sm font-medium capitalize">
            {listing.category}
          </span>
        </div>
        {listing.rating && (
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center space-x-1">
            <Star className="h-4 w-4 text-yellow-500 fill-current" />
            <span className="text-sm font-medium">{listing.rating}</span>
          </div>
        )}
      </div>

      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <h3 className="text-xl font-semibold text-gray-900 line-clamp-2">
            {listing.title}
          </h3>
        </div>

        <div className="flex items-center text-gray-600 mb-3">
          <MapPin className="h-4 w-4 mr-1" />
          <span className="text-sm">{listing.location}</span>
        </div>

        <p className="text-gray-600 text-sm mb-4 line-clamp-3">
          {listing.description}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-red-600">
              ${listing.price}
            </span>
            <span className="text-sm text-gray-500">
              {listing.category === 'stay' ? 'per night' : 'per person'}
            </span>
          </div>

          <Link
            to={`/listing/${listing.id}`}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors duration-200 font-medium"
          >
            View Details
          </Link>
        </div>
      </div>
    </motion.div>
  );
};

export default ListingCard;
