import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Camera, Mountain, Heart, Users } from 'lucide-react';
import ListingCard from '../components/ui/ListingCard';
import { supabase } from '../lib/supabase';
import { Tables } from '../types/supabase';
import { useSettings } from '../context/SettingsContext';

type Listing = Tables<'listings'>;

const HomePage: React.FC = () => {
  const [featuredTours, setFeaturedTours] = useState<Listing[]>([]);
  const [featuredStays, setFeaturedStays] = useState<Listing[]>([]);
  const { settings, loading: settingsLoading } = useSettings();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const { data: toursData } = await supabase.from('listings').select('*').eq('category', 'tour').eq('status', 'published').limit(3);
      setFeaturedTours(toursData || []);
      const { data: staysData } = await supabase.from('listings').select('*').eq('category', 'stay').eq('status', 'published').limit(3);
      setFeaturedStays(staysData || []);
      setLoading(false);
    };
    fetchData();
  }, []);

  const quickLinks = [
    { title: 'Safari Adventures', description: 'Witness the Big Five', icon: Camera, href: '/tours', color: 'bg-green-500' },
    { title: 'Mountain Trekking', description: 'Conquer Africa\'s peaks', icon: Mountain, href: '/tours', color: 'bg-blue-500' },
    { title: 'Volunteer Programs', description: 'Make a difference', icon: Heart, href: '/volunteers', color: 'bg-purple-500' },
    { title: 'Beach Resorts', description: 'Relax on pristine beaches', icon: Users, href: '/stays', color: 'bg-teal-500' }
  ];

  return (
    <div className="min-h-screen">
      <section className="relative h-screen flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${settings?.banner_url || 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1200'})`,
          }}
        >
          <div className="absolute inset-0 bg-black/50"></div>
        </div>
        
        <div className="relative z-10 text-center text-white max-w-4xl mx-auto px-4">
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-5xl md:text-7xl font-bold mb-6"
          >
            Discover East Africa
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl mb-8 text-gray-200"
          >
            Unforgettable tours, comfortable stays, and meaningful volunteer opportunities
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link
              to="/tours"
              className="bg-primary text-white px-8 py-4 rounded-lg text-lg font-semibold hover:brightness-90 transition-all"
            >
              Explore Tours <ArrowRight className="inline ml-2 h-5 w-5" />
            </Link>
            <Link
              to="/custom-package"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white hover:text-gray-900 transition-colors"
            >
              Custom Package
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">What Would You Like To Experience?</h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">Find your perfect East African adventure</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {quickLinks.map((link, index) => (
              <motion.div
                key={link.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
              >
                <Link
                  to={link.href}
                  className="group bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 block"
                >
                  <div className={`${link.color} w-12 h-12 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                    <link.icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-primary">{link.title}</h3>
                  <p className="text-gray-600">{link.description}</p>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Featured Tours</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-200 h-96 rounded-xl animate-pulse"></div>) 
                     : featuredTours.map((listing, index) => <ListingCard key={listing.id} listing={listing} index={index} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/tours" className="inline-flex items-center text-primary hover:brightness-90 font-semibold text-lg">
              View All Tours <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.h2 className="text-4xl font-bold text-center text-gray-900 mb-16">Featured Accommodations</motion.h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? Array.from({ length: 3 }).map((_, i) => <div key={i} className="bg-gray-200 h-96 rounded-xl animate-pulse"></div>) 
                     : featuredStays.map((listing, index) => <ListingCard key={listing.id} listing={listing} index={index} />)}
          </div>
          <div className="text-center mt-12">
            <Link to="/stays" className="inline-flex items-center text-primary hover:brightness-90 font-semibold text-lg">
              View All Accommodations <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
