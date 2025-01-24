import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useCart, useAuth } from '@/lib/store';
import { Trash2 } from 'lucide-react';

export default function Cart() {
  const navigate = useNavigate();
  const { items, removeItem, clearCart } = useCart();
  const { user } = useAuth();

  const handleCheckout = () => {
    if (!user) {
      return;
    }
    // Process checkout
    clearCart();
    navigate('/checkout-success');
  };

  if (items.length === 0) {
    return (
      <div className="container py-24">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Your Cart is Empty</h2>
          <Button onClick={() => navigate('/services')}>Browse Services</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Your Cart</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div>
                    <h3 className="font-semibold">{item.serviceName}</h3>
                    <p className="text-sm text-muted-foreground">
                      {item.date} at {item.time}
                    </p>
                    <p className="text-sm">{item.address}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <p className="font-semibold">{item.price}</p>
                    <Button
                      variant="destructive"
                      size="icon"
                      onClick={() => removeItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              
              <div className="flex justify-between items-center pt-4 border-t">
                <div>
                  <p className="text-lg font-semibold">Total</p>
                  <p className="text-sm text-muted-foreground">
                    {items.length} items
                  </p>
                </div>
                <p className="text-2xl font-bold">
                  ₹{items.reduce((acc, item) => acc + parseInt(item.price.replace('₹', '')), 0)}
                </p>
              </div>

              {user ? (
                <Button className="w-full" onClick={handleCheckout}>
                  Proceed to Checkout
                </Button>
              ) : (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-full">Proceed to Checkout</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Sign in Required</DialogTitle>
                      <DialogDescription>
                        Please sign in to complete your booking
                      </DialogDescription>
                    </DialogHeader>
                    <div className="flex justify-end gap-4">
                      <Button variant="outline" onClick={() => navigate('/signin')}>
                        Sign In
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}