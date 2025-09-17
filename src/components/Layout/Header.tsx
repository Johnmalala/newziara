import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, LayoutDashboard, Globe, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  const { session, signOut, profile, isAdmin } = useAuth();

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'Tours', href: '/tours' },
    { name: 'Stays', href: '/stays' },
    { name: 'Volunteer', href: '/volunteers' },
    { name: 'Custom Package', href: '/custom-package' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const Logo = () => {
    return (
      <div className="flex items-center space-x-2">
        <span className="text-2xl text-gray-900">
          <span className="font-bold">ZIARA</span><span className="font-light">zetu</span>
        </span>
      </div>
    );
  };

  return (
    <header className="bg-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <Link to="/"><Logo /></Link>

          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`text-sm font-medium transition-colors duration-200 ${
                  isActive(item.href)
                    ? 'text-primary border-b-2 border-primary pb-1'
                    : 'text-gray-700 hover:text-primary'
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="hidden md:flex items-center space-x-4">
            <CurrencySwitcher />
            {session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2">
                  <User className="h-5 w-5 text-gray-700" />
                  <span className="font-medium text-sm">{profile?.full_name || 'Account'}</span>
                </button>
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-20 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Link to="/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center">
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    My Dashboard
                  </Link>
                  {isAdmin && (
                    <a href={`//admin.${window.location.host}`} target="_blank" rel="noopener noreferrer" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Admin Portal</a>
                  )}
                  <button onClick={signOut} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-primary font-medium"
                >
                  Sign In
                </Link>
                <Link
                  to="/signup"
                  className="bg-primary text-white px-4 py-2 rounded-lg hover:brightness-90 transition-all duration-200"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2"
          >
            {isMenuOpen ? (
              <X className="h-6 w-6 text-gray-700" />
            ) : (
              <Menu className="h-6 w-6 text-gray-700" />
            )}
          </button>
        </div>

        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden pb-4"
            >
              <div className="flex flex-col space-y-3">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setIsMenuOpen(false)}
                    className={`text-sm font-medium py-2 px-3 rounded-lg transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'text-primary bg-red-50'
                        : 'text-gray-700 hover:text-primary hover:bg-gray-50'
                    }`}
                  >
                    {item.name}
                  </Link>
                ))}
                <div className="pt-4 border-t border-gray-200">
                  <CurrencySwitcher />
                </div>
                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                  {session ? (
                     <>
                      <Link to="/dashboard" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium py-2 px-3">My Dashboard</Link>
                      {isAdmin && (
                        <a href={`//admin.${window.location.host}`} target="_blank" rel="noopener noreferrer" onClick={() => setIsMenuOpen(false)} className="text-gray-700 hover:text-primary font-medium py-2 px-3">Admin Portal</a>
                      )}
                      <button onClick={() => { signOut(); setIsMenuOpen(false); }} className="text-left text-gray-700 hover:text-primary font-medium py-2 px-3">
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        to="/login"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-gray-700 hover:text-primary font-medium py-2 px-3"
                      >
                        Sign In
                      </Link>
                      <Link
                        to="/signup"
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-primary text-white px-3 py-2 rounded-lg hover:brightness-90 transition-colors duration-200 text-center"
                      >
                        Sign Up
                      </Link>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

const CurrencySwitcher: React.FC = () => {
  const { currency, setCurrency, currencies } = useCurrency();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1 text-gray-700 hover:text-primary font-medium text-sm px-3 py-2 rounded-md"
      >
        <Globe className="h-4 w-4" />
        <span>{currency}</span>
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute right-0 mt-2 w-32 bg-white rounded-md shadow-lg py-1 z-20 border"
          >
            {Object.keys(currencies).map((code) => (
              <button
                key={code}
                onClick={() => {
                  setCurrency(code);
                  setIsOpen(false);
                }}
                className={`w-full text-left px-4 py-2 text-sm ${
                  currency === code ? 'bg-red-50 text-primary' : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {code} ({currencies[code].symbol})
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Header;
