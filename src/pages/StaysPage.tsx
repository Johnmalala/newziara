import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, MapPin, Loader } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';

type Listing = Tables<'listings'>;

const StaysPage: React.FC = () => {
  const [stays, setStays] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('');
  const [priceRange, setPriceRange] = useState('');

  useEffect(() => {
    const fetchStays = async () => {
      setLoading(true);
      const { data } = await supabase.from('listings').select('*').eq('category', 'stay').eq('status', 'published');
      if (data) setStays(data);
      setLoading(false);
    };
    fetchStays();
  }, []);

  const locations = [...new Set(stays.map(stay => stay.location).filter(Boolean) as string[])];

  const filteredStays = useMemo(() => {
    return stays.filter(stay => {
      const matchesSearch = stay.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           stay.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesLocation = !selectedLocation || stay.location === selectedLocation;
      const matchesPrice = (() => {
        if (!priceRange) return true;
        const price = stay.price;
        switch (priceRange) {
          case 'under-100': return price < 100;
          case '100-200': return price >= 100 && price <= 200;
          case '200-300': return price >= 200 && price <= 300;
          case 'over-300': return price > 300;
          default: return true;
        }
      })();
      return matchesSearch && matchesLocation && matchesPrice;
    });
  }, [stays, searchTerm, selectedLocation, priceRange]);

  return (
    <div className="min-h-screen bg-gray-50">
      <section className="bg-primary text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-5xl font-bold mb-6">Accommodation</h1>
          <p className="text-xl text-red-100 max-w-3xl mx-auto">
            Find comfortable and unique places to stay during your adventure.
          </p>
        </div>
      </section>

      <section className="bg-white shadow-sm border-b sticky top-[76px] z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <input type="text" placeholder="Search accommodations..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary" />
            </div>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none">
                <option value="">All Locations</option>
                {locations.map(location => <option key={location} value={location}>{location}</option>)}
              </select>
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <select value={priceRange} onChange={(e) => setPriceRange(e.target.value)} className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary appearance-none">
                <option value="">All Prices</option>
                <option value="under-100">Under $100</option>
                <option value="100-200">$100 - $200</option>
                <option value="200-300">$200 - $300</option>
                <option value="over-300">Over $300</option>
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
              <Loader className="animate-spin h-12 w-12 text-primary" />
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-gray-900 mb-8">{filteredStays.length} Accommodations Found</h2>
              {filteredStays.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredStays.map((stay, index) => <ListingCard key={stay.id} listing={stay} index={index} />)}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Search className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No accommodations found</h3>
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

export default StaysPage;
