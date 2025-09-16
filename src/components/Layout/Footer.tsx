import React from 'react';
import { MapPin, Phone, Mail, Facebook, Twitter, Instagram } from 'lucide-react';

const Footer: React.FC = () => {
  const Logo = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-2xl font-bold">Ziarazetu</span>
      </div>
    );
  };

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="mb-4"><Logo /></div>
            <p className="text-gray-300 mb-4">
              Discover the beauty of East Africa with our curated tours, comfortable stays, and meaningful volunteer opportunities.
            </p>
            <div className="flex space-x-4">
              <Facebook className="h-6 w-6 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
              <Twitter className="h-6 w-6 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
              <Instagram className="h-6 w-6 text-gray-300 hover:text-primary cursor-pointer transition-colors" />
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/tours" className="text-gray-300 hover:text-primary transition-colors">Tours</a></li>
              <li><a href="/stays" className="text-gray-300 hover:text-primary transition-colors">Stays</a></li>
              <li><a href="/volunteers" className="text-gray-300 hover:text-primary transition-colors">Volunteer</a></li>
              <li><a href="/custom-package" className="text-gray-300 hover:text-primary transition-colors">Custom Package</a></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Services</h3>
            <ul className="space-y-2">
              <li><span className="text-gray-300">Safari Tours</span></li>
              <li><span className="text-gray-300">Mountain Trekking</span></li>
              <li><span className="text-gray-300">Beach Resorts</span></li>
              <li><span className="text-gray-300">Conservation Programs</span></li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-primary" />
                <span className="text-gray-300">+254 700 123 456</span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-primary" />
                <span className="text-gray-300">info@ziarazetu.com</span>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-primary mt-1" />
                <span className="text-gray-300">Nairobi, Kenya<br />East Africa</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          <p className="text-gray-300">
            © 2025 Ziarazetu. All rights reserved. Discover East Africa with us.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
