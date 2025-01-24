import { createClient } from '@supabase/supabase-js';
import type { BookingFormData } from '@/lib/validation';
import type { RealtimeChannel } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseKey);

// User management functions
export async function deleteUser(userId: string) {
  const { error } = await supabase.rpc('soft_delete_user', {
    target_user_id: userId
  });

  if (error) throw error;
}

export async function restoreUser(userId: string) {
  const { error } = await supabase.rpc('restore_user', {
    target_user_id: userId
  });

  if (error) throw error;
}

export async function updateUser(userId: string, data: {
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'user' | 'admin' | 'cleaner';
}) {
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('id', userId);

  if (error) throw error;
}

// Authentication functions
export async function signIn(email: string, password: string) {
  const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (signInError) throw signInError;
  if (!user) throw new Error('No user returned after sign in');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('email, name, role')
    .eq('auth_id', user.id)
    .eq('is_deleted', false)
    .single();

  if (profileError) throw profileError;
  if (!profile) throw new Error('User profile not found or has been deleted');

  return profile;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function signUp(userData: {
  email: string;
  password: string;
  name: string;
  phone: string;
  address: string;
}) {
  const { data: { user }, error: signUpError } = await supabase.auth.signUp({
    email: userData.email,
    password: userData.password,
  });

  if (signUpError) throw signUpError;
  if (!user) throw new Error('No user returned after sign up');

  const { data: profile, error: profileError } = await supabase
    .from('users')
    .insert({
      auth_id: user.id,
      email: userData.email,
      name: userData.name,
      phone: userData.phone,
      address: userData.address,
      role: 'user',
    })
    .select('email, name, role')
    .single();

  if (profileError) throw profileError;
  if (!profile) throw new Error('Failed to create user profile');

  return profile;
}

export async function resendConfirmationEmail(email: string) {
  const { error } = await supabase.auth.resend({
    type: 'signup',
    email: email,
  });

  if (error) throw error;
}

export async function initializeAuth() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('email, name, role')
    .eq('auth_id', session.user.id)
    .eq('is_deleted', false)
    .single();

  if (error || !profile) {
    await signOut();
    return null;
  }

  return profile;
}

// Booking functions
export async function createBooking(bookingData: BookingFormData) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data: service, error: serviceError } = await supabase
    .from('services')
    .select('id')
    .eq('name', bookingData.serviceName)
    .single();

  if (serviceError) throw serviceError;
  if (!service) throw new Error('Service not found');

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', session.user.id)
    .single();

  if (userError) throw userError;
  if (!user) throw new Error('User not found');

  const { data: booking, error: bookingError } = await supabase
    .from('bookings')
    .insert({
      user_id: user.id,
      service_id: service.id,
      status: 'pending',
      scheduled_at: new Date(`${bookingData.date}T${bookingData.time}`).toISOString(),
      address: bookingData.address,
      amount: parseInt(bookingData.price.replace('₹', '')),
    })
    .select()
    .single();

  if (bookingError) throw bookingError;
  return booking;
}

export async function fetchUserBookings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', session.user.id)
    .single();

  if (!user) return [];

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      *,
      services (
        name
      )
    `)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('scheduled_at', { ascending: false });

  if (error) {
    console.error('Error fetching user bookings:', error);
    return [];
  }

  return bookings;
}

// Review functions
export async function fetchUserReviews() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', session.user.id)
    .single();

  if (!user) return [];

  const { data: reviews, error } = await supabase
    .from('reviews')
    .select(`
      *,
      bookings (
        services (
          name
        )
      )
    `)
    .eq('user_id', user.id)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching user reviews:', error);
    return [];
  }

  return reviews;
}

export async function createReview(data: { rating: number; comment: string }) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data: user } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', session.user.id)
    .single();

  if (!user) throw new Error('User not found');

  const { data: review, error } = await supabase
    .from('reviews')
    .insert({
      user_id: user.id,
      rating: data.rating,
      comment: data.comment,
      is_published: false,
    })
    .select()
    .single();

  if (error) throw error;
  return review;
}

export async function updateReview(reviewId: string, data: { rating: number; comment: string }) {
  const { error } = await supabase
    .from('reviews')
    .update({
      rating: data.rating,
      comment: data.comment,
      is_published: false,
    })
    .eq('id', reviewId);

  if (error) throw error;
}

export async function deleteReview(reviewId: string) {
  const { error } = await supabase
    .from('reviews')
    .update({ is_deleted: true, deleted_at: new Date().toISOString() })
    .eq('id', reviewId);

  if (error) throw error;
}

// Admin functions
export async function fetchDashboardData(showDeleted: boolean = false) {
  const { data: users } = await supabase
    .from('users')
    .select('*')
    .eq('is_deleted', showDeleted)
    .order('created_at', { ascending: false });

  const { data: bookings } = await supabase
    .from('bookings')
    .select(`
      *,
      users (
        name,
        email
      ),
      services (
        name
      )
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  const { data: reviews } = await supabase
    .from('reviews')
    .select(`
      *,
      users (
        name
      ),
      metadata
    `)
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  const { data: services } = await supabase
    .from('services')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: payments } = await supabase
    .from('payments')
    .select('*')
    .eq('status', 'completed')
    .eq('is_deleted', false)
    .order('created_at', { ascending: false });

  return {
    users: users || [],
    bookings: bookings || [],
    reviews: reviews || [],
    services: services || [],
    revenue: {
      total: payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0,
      recentTransactions: payments?.slice(0, 5) || [],
    },
  };
}

// Cleaner functions
export async function fetchCleanerEarnings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return null;

  const { data: cleaner, error } = await supabase
    .from('cleaners')
    .select('earnings_balance, earnings_history')
    .single();

  if (error) throw error;
  return cleaner;
}

export async function requestWithdrawal(amount: number) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data: cleaner } = await supabase
    .from('cleaners')
    .select('id, earnings_balance')
    .single();

  if (!cleaner) throw new Error('Cleaner profile not found');
  if (cleaner.earnings_balance < amount) {
    throw new Error('Insufficient balance');
  }

  const { error } = await supabase
    .from('earnings_withdrawals')
    .insert({
      cleaner_id: cleaner.id,
      amount: amount
    });

  if (error) throw error;

  const { error: updateError } = await supabase
    .from('cleaners')
    .update({
      earnings_balance: cleaner.earnings_balance - amount
    })
    .eq('id', cleaner.id);

  if (updateError) throw updateError;
}

export async function fetchWithdrawalHistory() {
  const { data: withdrawals, error } = await supabase
    .from('earnings_withdrawals')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return withdrawals;
}

export async function fetchAvailableBookings() {
  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      scheduled_at,
      address,
      amount,
      services (
        name
      ),
      users (
        name,
        phone
      )
    `)
    .eq('status', 'pending')
    .eq('is_deleted', false)
    .order('scheduled_at', { ascending: true });

  if (error) {
    console.error('Error fetching available bookings:', error);
    return [];
  }

  return bookings;
}

export async function fetchCleanerBookings() {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) return [];

  const { data: cleanerProfile } = await supabase
    .from('cleaners')
    .select('id')
    .single();

  if (!cleanerProfile) return [];

  const { data: bookings, error } = await supabase
    .from('bookings')
    .select(`
      id,
      status,
      scheduled_at,
      started_at,
      completed_at,
      paused_at,
      total_pause_duration,
      address,
      amount,
      payment_collected_at,
      payment_proof_url,
      services (
        name
      ),
      users (
        name,
        phone
      )
    `)
    .eq('cleaner_id', cleanerProfile.id)
    .eq('is_deleted', false)
    .order('scheduled_at', { ascending: false });

  if (error) {
    console.error('Error fetching cleaner bookings:', error);
    return [];
  }

  return bookings;
}

export async function pickBooking(bookingId: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const { data: cleanerProfile } = await supabase
    .from('cleaners')
    .select('id')
    .single();

  if (!cleanerProfile) throw new Error('Cleaner profile not found');

  const { error } = await supabase
    .from('bookings')
    .update({
      cleaner_id: cleanerProfile.id,
      status: 'picked',
      picked_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .eq('status', 'pending')
    .eq('is_deleted', false);

  if (error) throw error;
}

export async function startJob(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'in_progress',
      started_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .eq('status', 'picked')
    .eq('is_deleted', false);

  if (error) throw error;
}

export async function pauseJob(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'paused',
      paused_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .eq('status', 'in_progress')
    .eq('is_deleted', false);

  if (error) throw error;
}

export async function resumeJob(bookingId: string) {
  const { data: booking } = await supabase
    .from('bookings')
    .select('paused_at, total_pause_duration')
    .eq('id', bookingId)
    .single();

  if (!booking?.paused_at) throw new Error('Job not paused');

  const pauseDuration = Math.floor(
    (Date.now() - new Date(booking.paused_at).getTime()) / (1000 * 60)
  );

  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'in_progress',
      paused_at: null,
      total_pause_duration: (booking.total_pause_duration || 0) + pauseDuration
    })
    .eq('id', bookingId)
    .eq('status', 'paused')
    .eq('is_deleted', false);

  if (error) throw error;
}

export async function completeJob(bookingId: string) {
  const { error } = await supabase
    .from('bookings')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .in('status', ['in_progress', 'paused'])
    .eq('is_deleted', false);

  if (error) throw error;
}

export async function uploadPaymentProof(bookingId: string, file: File) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.user) throw new Error('Not authenticated');

  const fileExt = file.name.split('.').pop();
  const fileName = `${bookingId}-${Date.now()}.${fileExt}`;
  const filePath = `payment-proofs/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('receipts')
    .upload(filePath, file);

  if (uploadError) throw uploadError;

  const { data: { publicUrl } } = supabase.storage
    .from('receipts')
    .getPublicUrl(filePath);

  const { error: updateError } = await supabase
    .from('bookings')
    .update({
      payment_proof_url: publicUrl,
      payment_collected_at: new Date().toISOString()
    })
    .eq('id', bookingId)
    .select()
    .single();

  if (updateError) throw updateError;

  return publicUrl;
}

// Subscription functions
export function subscribeToBookings(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('bookings_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'bookings',
      },
      callback
    )
    .subscribe();
}

export function subscribeToPayments(callback: (payload: any) => void): RealtimeChannel {
  return supabase
    .channel('payments_changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'payments',
      },
      callback
    )
    .subscribe();
}