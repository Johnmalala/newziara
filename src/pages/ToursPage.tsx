import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, MapPin, Loader } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';

type Listing = Tables<'listings'>;

const ToursPage: React.FC = () => {
  const [tours, setTours] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    const fetchTours = async () => {
      setLoading(true);
      const { data, error } = await supabase.from('listings').select('*').eq('category', 'tour').eq('status', 'published');
      if (data) setTours(data);
      setLoading(false);
    };
    fetchTours();
  }, []);

  const locations = [...new Set(tours.map(tour => tour.location).filter(Boolean) as string[])];

  const filteredTours = useMemo(() => {
    return tours.filter(tour => {
      const matchesSearch = tour.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           tour.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !selectedLocation || tour.location === selectedLocation;
      const matchesPrice = (() => {
        if (!priceRange) return true;
        const price = tour.price;
        switch (priceRange) {
          case 'under-500': return price < 500;
          case '500-1000': return price >= 500 && price <= 1000;
          case '1000-2000': return price >= 1000 && price <= 2000;
          case 'over-2000': return price > 2000;
          default: return true;
        }
      })();
      return matchesSearch && matchesLocation && matchesPrice;
    });
  }, [tours, searchTerm, selectedLocation, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-red-600 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">East Africa Tours</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Discover breathtaking landscapes, incredible wildlife, and rich cultures.
          </p>
        </div>
      </section>

      <section className="bg-white shadow-sm border-b sticky top-[76px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Search tours..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 appearance-none">
                <option value="">All Locations</option>
                {locations.map(location => <option key={location} value={location}>{location}</option>)}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 appearance-none">
                <option value="">All Prices</option>
                <option value="under-500">Under $500</option>
                <option value="500-1000">$500 - $1,000</option>
                <option value="1000-2000">$1,000 - $2,000</option>
                <option value="over-2000">Over $2,000</option>
              </select>
            </div>
            <button onClick={() => { setSearchTerm(''); setSelectedLocation(''); setPriceRange(''); }} className="bg-gray-100 text-gray-700 px-4 py-3 rounded-lg hover:bg-gray-200 font-medium">
              Clear Filters
            </button>
          </div>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
             <div className="flex justify-center items-center h-64">
                <Loader className="animate-spin h-12 w-12 text-red-600" />
             </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{filteredTours.length} Tours Found</h2>
              {filteredTours.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredTours.map((tour, index) => <ListingCard key={tour.id} listing={tour} index={index} />)}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No tours found</h3>
                  <p className="text-gray-600">Try adjusting your search criteria.</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default ToursPage;
