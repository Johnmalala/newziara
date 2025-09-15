export interface Listing {
  id: string;
  title: string;
  description?: string;
  category: 'tour' | 'stay' | 'volunteer';
  sub_category?: string;
  price: number;
  rating?: number;
  location?: string;
  type?: string;
  availability?: string[];
  images?: string[];
  inclusions?: string[];
  exclusions?: string[];
  status: 'draft' | 'published';
  created_at?: string;
}

export interface Booking {
  id?: string;
  listing_id: string;
  user_id: string;
  total_amount: number;
  booking_date: string;
  payment_status?: 'pending' | 'paid' | 'partial';
  payment_plan?: 'arrival' | 'full' | 'deposit' | 'lipa_mdogo_mdogo';
  volunteer_motivation?: string;
  volunteer_duration?: string;
  created_at?: string;
  listing?: Listing;
}

export interface CustomPackageRequest {
  id?: string;
  name: string;
  email: string;
  whatsapp_phone?: string;
  call_phone?: string;
  message?: string;
  status?: 'new' | 'contacted' | 'closed';
  created_at?: string;
}

export interface Profile {
  id: string;
  full_name?: string;
  email: string;
  role?: string;
  created_at?: string;
}

export interface SiteSettings {
  id: number;
  banner_url?: string;
}
