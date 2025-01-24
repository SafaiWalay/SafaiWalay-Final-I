import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/lib/store';
import { createBooking } from '@/lib/supabase';
import type { BookingFormData } from '@/lib/validation';

const services = {
  'patio-parking': { name: 'Patio & Parking Cleaning', price: '₹999' },
  'solar-panel': { name: 'Solar Panel Cleaning', price: '₹600' },
  'carpet-cleaning': { name: 'Carpet Cleaning', price: '₹500' },
  'terrace-roof': { name: 'Terrace & Roof Cleaning', price: '₹1299' },
  'water-tank': { name: 'Water Tank Cleaning', price: '₹1000' },
  'car-wash': { name: 'Car Wash', price: '₹499' },
};

export default function BookService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const addItem = useCart((state) => state.addItem);
  
  const service = serviceId ? services[serviceId as keyof typeof services] : null;
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    date: '',
    time: '',
  });

  if (!service) {
    navigate('/services');
    return null;
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const bookingData: BookingFormData = {
      serviceName: service.name,
      price: service.price,
      ...formData,
    };

    try {
      await createBooking(bookingData);
      
      const booking = {
        id: crypto.randomUUID(),
        serviceName: service.name,
        price: service.price,
        ...formData,
      };
      
      addItem(booking);
      toast({
        title: "Service Added to Cart",
        description: "Your booking has been added to the cart.",
      });
      navigate('/cart');
    } catch (error) {
      if (error instanceof Error) {
        toast({
          title: "Booking Failed",
          description: error.message,
          variant: "destructive",
        });
      }
    }
  };

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Book {service.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="date">Date</Label>
                  <Input
                    id="date"
                    name="date"
                    type="date"
                    required
                    value={formData.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="time">Time</Label>
                  <Input
                    id="time"
                    name="time"
                    type="time"
                    required
                    value={formData.time}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  required
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <Button type="submit" className="w-full">Add to Cart</Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}