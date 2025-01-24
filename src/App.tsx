import { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ThemeProvider } from '@/components/theme-provider';
import { Toaster } from '@/components/ui/toaster';
import { useAuth } from '@/lib/store';
import { initializeAuth } from '@/lib/supabase';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Mascot from '@/components/Mascot';
import Home from '@/pages/Home';
import About from '@/pages/About';
import Services from '@/pages/Services';
import Contact from '@/pages/Contact';
import SignIn from '@/pages/SignIn';
import BookService from '@/pages/BookService';
import Cart from '@/pages/Cart';
import AdminLogin from '@/pages/AdminLogin';
import Admin from '@/pages/Admin';
import Profile from '@/pages/Profile';
import CleanerLogin from '@/pages/CleanerLogin';
import CleanerDashboard from '@/pages/CleanerDashboard';

function AppContent() {
  const location = useLocation();
  const showFooter = !location.pathname.startsWith('/admin') && !location.pathname.startsWith('/cleaner');

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/services" element={<Services />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/book/:serviceId" element={<BookService />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/admin_login" element={<AdminLogin />} />
          <Route path="/admin" element={<Admin />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/cleaner/login" element={<CleanerLogin />} />
          <Route path="/cleaner/dashboard" element={<CleanerDashboard />} />
        </Routes>
      </main>
      {showFooter && <Footer />}
      <Mascot />
    </div>
  );
}

function App() {
  const { setUser } = useAuth();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const profile = await initializeAuth();
        if (profile) {
          setUser({
            email: profile.email,
            name: profile.name,
            role: profile.role,
          });
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, [setUser]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="safaiwalay-theme">
      <Router>
        <AppContent />
      </Router>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;