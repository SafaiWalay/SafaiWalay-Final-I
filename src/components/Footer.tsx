import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/lib/supabase';

export default function Footer() {
  const [reviews, setReviews] = useState<any[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      const { data, error } = await supabase
        .from('reviews')
        .select('*, users(*)')
        .eq('is_published', true)
        .order('created_at', { ascending: false })
        .limit(3);

      if (!error && data) {
        setReviews(data);
      }
    };

    fetchReviews();
  }, []);

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com/safaiwalay' },
    { icon: Instagram, href: 'https://instagram.com/safaiwalay' },
    { icon: Twitter, href: 'https://twitter.com/safaiwalay' },
    { icon: Youtube, href: 'https://youtube.com/safaiwalay' },
  ];

  return (
    <footer className="bg-background border-t">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SafaiWalay</h3>
            <p className="text-sm text-muted-foreground">
              Professional cleaning services for homes and offices. Making spaces sparkle since 2023.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/services" className="text-sm text-muted-foreground hover:text-primary">
                  Our Services
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-sm text-muted-foreground hover:text-primary">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-sm text-muted-foreground hover:text-primary">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Reviews */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Customer Reviews</h3>
            <div className="space-y-2">
              {reviews.map((review, index) => (
                <div key={index} className="text-sm">
                  <div className="flex mb-1">
                    {[...Array(review.rating)].map((_, i) => (
                      <svg
                        key={i}
                        className="h-4 w-4 text-yellow-400 fill-current"
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    ))}
                  </div>
                  <p className="text-muted-foreground">"{review.comment}"</p>
                  <p className="font-medium mt-1">
                    - {review.metadata?.display_name || review.users?.name}
                    {review.metadata?.location && ` (${review.metadata.location})`}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">Email: contact@safaiwalay.com</p>
              <p className="text-sm text-muted-foreground">Phone: +91 93093-49629</p>
            </div>
            <div className="flex space-x-4">
              {socialLinks.map((social, index) => {
                const Icon = social.icon;
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        <Separator className="my-8" />

        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} SafaiWalay. All rights reserved.
          </p>
          <div className="flex space-x-4">
            <Link to="/privacy" className="text-sm text-muted-foreground hover:text-primary">
              Privacy Policy
            </Link>
            <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}