import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface WishlistContextType {
  wishlist: string[]; // Array of listing IDs
  addToWishlist: (listingId: string) => Promise<void>;
  removeFromWishlist: (listingId: string) => Promise<void>;
  isInWishlist: (listingId: string) => boolean;
  loading: boolean;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export const WishlistProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchWishlist = async () => {
      if (!user) {
        setWishlist([]);
        setLoading(false);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from('wishlist_items')
        .select('listing_id')
        .eq('user_id', user.id);
      
      if (error) {
        console.error('Error fetching wishlist:', error);
      } else {
        setWishlist(data.map(item => item.listing_id));
      }
      setLoading(false);
    };

    fetchWishlist();
  }, [user]);

  const isInWishlist = (listingId: string) => {
    return wishlist.includes(listingId);
  };

  const addToWishlist = async (listingId: string) => {
    if (!user) {
      toast.error('Please sign in to add items to your wishlist.');
      return;
    }
    if (isInWishlist(listingId)) return;

    setWishlist(prev => [...prev, listingId]); // Optimistic update

    const { error } = await supabase
      .from('wishlist_items')
      .insert({ user_id: user.id, listing_id: listingId });

    if (error) {
      toast.error('Could not add to wishlist.');
      setWishlist(prev => prev.filter(id => id !== listingId)); // Revert on failure
    } else {
      toast.success('Added to your wishlist!');
    }
  };

  const removeFromWishlist = async (listingId: string) => {
    if (!user) return;
    if (!isInWishlist(listingId)) return;

    const originalWishlist = [...wishlist];
    setWishlist(prev => prev.filter(id => id !== listingId)); // Optimistic update

    const { error } = await supabase
      .from('wishlist_items')
      .delete()
      .match({ user_id: user.id, listing_id: listingId });

    if (error) {
      toast.error('Could not remove from wishlist.');
      setWishlist(originalWishlist); // Revert on failure
    } else {
      toast.success('Removed from your wishlist.');
    }
  };

  const value = {
    wishlist,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    loading,
  };

  return (
    <WishlistContext.Provider value={value}>
      {children}
    </WishlistContext.Provider>
  );
};

export const useWishlist = () => {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
};
