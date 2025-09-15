import { Listing, Booking } from '../types';

// Mock listings data for demonstration
export const mockListings: Listing[] = [
  {
    id: '1',
    title: 'Serengeti Safari Adventure',
    description: 'Experience the breathtaking wildlife of Serengeti National Park with our expert guides. Witness the Great Migration and spot the Big Five in their natural habitat.',
    category: 'tour',
    sub_category: 'Safari',
    price: 1200,
    rating: 4.8,
    location: 'Serengeti, Tanzania',
    type: 'Group Tour',
    availability: ['2025-02-15', '2025-02-20', '2025-02-25', '2025-03-01', '2025-03-05', '2025-03-10'],
    images: ['https://images.unsplash.com/photo-1516026672322-bc52d61a55d5?w=800', 'https://images.unsplash.com/photo-1549366021-9f761d040a94?w=800'],
    inclusions: ['Professional guide', 'All meals', 'Transportation', 'Park fees'],
    exclusions: ['Personal expenses', 'Travel insurance', 'Tips'],
    status: 'published'
  },
  {
    id: '2',
    title: 'Mount Kilimanjaro Trek',
    description: 'Conquer Africa\'s highest peak with our experienced mountain guides. A challenging but rewarding adventure to the roof of Africa.',
    category: 'tour',
    sub_category: 'Trekking',
    price: 2500,
    rating: 4.9,
    location: 'Kilimanjaro, Tanzania',
    type: 'Adventure',
    availability: ['2025-03-01', '2025-03-15', '2025-04-01'],
    images: ['https://images.unsplash.com/photo-1609198092458-38a293c7ac4b?w=800'],
    inclusions: ['Mountain guide', 'Camping equipment', 'All meals', 'Permits'],
    exclusions: ['Personal gear', 'Travel insurance', 'Tips'],
    status: 'published'
  },
  {
    id: '3',
    title: 'Zanzibar Beach Resort',
    description: 'Relax on the pristine beaches of Zanzibar with crystal clear waters and white sand. Perfect for honeymoons and family vacations.',
    category: 'stay',
    sub_category: 'Resort',
    price: 180,
    rating: 4.7,
    location: 'Stone Town, Zanzibar',
    type: 'Beach Resort',
    availability: ['2025-02-10', '2025-02-15', '2025-02-20'],
    images: ['https://images.unsplash.com/photo-1439066615861-d1af74d74000?w=800'],
    inclusions: ['Breakfast', 'WiFi', 'Beach access', 'Pool'],
    exclusions: ['Lunch & Dinner', 'Excursions', 'Spa services'],
    status: 'published'
  },
  {
    id: '4',
    title: 'Wildlife Conservation Program',
    description: 'Join our conservation efforts to protect endangered wildlife in Kenya. Make a difference while experiencing African wildlife up close.',
    category: 'volunteer',
    sub_category: 'Conservation',
    price: 800,
    rating: 4.9,
    location: 'Maasai Mara, Kenya',
    type: 'Volunteer Program',
    availability: ['2025-03-01', '2025-04-01', '2025-05-01'],
    images: ['https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800'],
    inclusions: ['Accommodation', 'All meals', 'Training', 'Supervision'],
    exclusions: ['Travel to site', 'Personal expenses', 'Travel insurance'],
    status: 'published'
  },
  {
    id: '5',
    title: 'Lake Victoria Lodge',
    description: 'Experience the tranquility of Africa\'s largest lake with comfortable accommodation and stunning sunset views.',
    category: 'stay',
    sub_category: 'Lodge',
    price: 120,
    rating: 4.5,
    location: 'Lake Victoria, Uganda',
    type: 'Lake Lodge',
    availability: ['2025-02-20', '2025-03-01', '2025-03-10'],
    images: ['https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=800'],
    inclusions: ['All meals', 'Boat rides', 'Fishing equipment', 'WiFi'],
    exclusions: ['Beverages', 'Laundry', 'Excursions'],
    status: 'published'
  },
  {
    id: '6',
    title: 'Teaching Program in Rural Schools',
    description: 'Share your knowledge and make a lasting impact by teaching in rural schools across East Africa.',
    category: 'volunteer',
    sub_category: 'Education',
    price: 600,
    rating: 4.8,
    location: 'Rural Uganda',
    type: 'Teaching Program',
    availability: ['2025-03-15', '2025-04-15', '2025-05-15'],
    images: ['https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=800'],
    inclusions: ['Accommodation', 'All meals', 'Teaching materials', 'Local support'],
    exclusions: ['Travel to site', 'Personal expenses', 'Certification'],
    status: 'published'
  }
];

export const mockBookings: Booking[] = [
  {
    id: 'booking-1',
    listing_id: '1', // Serengeti Safari Adventure
    user_id: 'user-123',
    total_amount: 1200,
    booking_date: '2025-02-20',
    payment_status: 'pending',
    payment_plan: 'arrival',
  },
  {
    id: 'booking-2',
    listing_id: '1', // Serengeti Safari Adventure
    user_id: 'user-789',
    total_amount: 1200,
    booking_date: '2025-03-05',
    payment_status: 'paid',
    payment_plan: 'full',
  },
  {
    id: 'booking-3',
    listing_id: '3', // Zanzibar Beach Resort
    user_id: 'user-456',
    total_amount: 360,
    booking_date: '2025-02-15',
    payment_status: 'pending',
    payment_plan: 'arrival',
  }
];

export const mockSiteSettings = {
  id: 1,
  banner_url: 'https://images.unsplash.com/photo-1473163928189-364b2c4e1135?w=1200'
};
