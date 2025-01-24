import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/store';
import { Camera, User, Star, Pencil, Trash2 } from 'lucide-react';
import { fetchUserReviews, createReview, updateReview, deleteReview, fetchUserBookings } from '@/lib/supabase';

// Add interfaces
interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  is_published: boolean;
  bookings?: {
    services: {
      name: string;
    };
  };
}

interface ReviewFormData {
  rating: number;
  comment: string;
}

// Add ReviewDialog component
function ReviewDialog({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData 
}: { 
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReviewFormData) => void;
  initialData?: Review;
}) {
  const [formData, setFormData] = useState<ReviewFormData>({
    rating: initialData?.rating || 5,
    comment: initialData?.comment || '',
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{initialData ? 'Edit Review' : 'Write a Review'}</DialogTitle>
          <DialogDescription>
            Share your experience with our service
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="flex items-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, rating: star }))}
                className="focus:outline-none"
              >
                <Star
                  className={`h-6 w-6 ${
                    star <= formData.rating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }`}
                />
              </button>
            ))}
          </div>
          <Textarea
            value={formData.comment}
            onChange={(e) => setFormData(prev => ({ ...prev, comment: e.target.value }))}
            placeholder="Write your review here..."
            className="min-h-[100px]"
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={() => onSubmit(formData)}>
            {initialData ? 'Update Review' : 'Submit Review'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
    address: '',
  });
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review>();

  // Load orders and reviews when component mounts
  useEffect(() => {
    if (user) {
      loadOrders();
      loadReviews();
    }
  }, [user]);

  // Existing functions
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    const imageUrl = URL.createObjectURL(file);
    setProfileImage(imageUrl);
    
    toast({
      title: "Profile picture updated",
      description: "Your profile picture has been updated successfully.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // TODO: Implement actual profile update
      toast({
        title: "Profile Updated",
        description: "Your profile has been updated successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Load orders
  const loadOrders = async () => {
    try {
      const bookings = await fetchUserBookings();
      setOrders(bookings);
    } catch (error) {
      console.error('Error loading orders:', error);
      toast({
        title: "Error",
        description: "Failed to load your orders",
        variant: "destructive",
      });
    } finally {
      setIsLoadingOrders(false);
    }
  };

  // Load reviews
  const loadReviews = async () => {
    try {
      const userReviews = await fetchUserReviews();
      setReviews(userReviews);
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast({
        title: "Error",
        description: "Failed to load reviews",
        variant: "destructive",
      });
    }
  };

  // Review management functions
  const handleReviewSubmit = async (data: ReviewFormData) => {
    try {
      if (selectedReview) {
        await updateReview(selectedReview.id, data);
        toast({
          title: "Review Updated",
          description: "Your review has been updated and is pending approval.",
        });
      } else {
        await createReview(data);
        toast({
          title: "Review Submitted",
          description: "Your review has been submitted and is pending approval.",
        });
      }
      setIsReviewDialogOpen(false);
      setSelectedReview(undefined);
      loadReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save review",
        variant: "destructive",
      });
    }
  };

  const handleEditReview = (review: Review) => {
    setSelectedReview(review);
    setIsReviewDialogOpen(true);
  };

  const handleDeleteReview = async (reviewId: string) => {
    try {
      await deleteReview(reviewId);
      toast({
        title: "Review Deleted",
        description: "Your review has been deleted successfully.",
      });
      loadReviews();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete review",
        variant: "destructive",
      });
    }
  };

  // Redirect if not authenticated
  if (!user) {
    return <Navigate to="/signin" />;
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
            <CardTitle className="text-2xl">My Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">Orders</TabsTrigger>
                <TabsTrigger value="reviews">Reviews</TabsTrigger>
              </TabsList>

              <TabsContent value="profile">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="relative">
                      <Avatar className="h-24 w-24">
                        <AvatarImage src={profileImage || undefined} />
                        <AvatarFallback>
                          <User className="h-12 w-12" />
                        </AvatarFallback>
                      </Avatar>
                      <label
                        htmlFor="profile-image"
                        className="absolute bottom-0 right-0 p-1 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors"
                      >
                        <Camera className="h-4 w-4" />
                      </label>
                      <input
                        id="profile-image"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleImageChange}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Textarea
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      required
                    />
                  </div>

                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : 'Save Changes'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="orders">
                <div className="space-y-4">
                  {isLoadingOrders ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">Loading orders...</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">No orders found</p>
                    </div>
                  ) : (
                    orders.map((order) => (
                      <Card key={order.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h3 className="font-semibold">{order.services.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(order.scheduled_at).toLocaleDateString()}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold">₹{order.amount}</p>
                              <p className="text-sm text-muted-foreground capitalize">{order.status}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </TabsContent>

              <TabsContent value="reviews">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold">My Reviews</h3>
                    <Button onClick={() => setIsReviewDialogOpen(true)}>
                      Write a Review
                    </Button>
                  </div>
                  {reviews.map((review) => (
                    <Card key={review.id}>
                      <CardContent className="p-4">
                        <div className="space-y-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex space-x-1 mb-2">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${
                                      i < review.rating
                                        ? 'text-yellow-400 fill-yellow-400'
                                        : 'text-gray-300'
                                    }`}
                                  />
                                ))}
                              </div>
                              {review.bookings?.services?.name && (
                                <p className="text-sm text-muted-foreground mb-1">
                                  Service: {review.bookings.services.name}
                                </p>
                              )}
                              <p className="text-sm">{review.comment}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleEditReview(review)}
                              >
                                <Pencil className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteReview(review.id)}
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            </div>
                          </div>
                          <div className="flex items-center justify-between text-sm text-muted-foreground">
                            <span>{new Date(review.created_at).toLocaleDateString()}</span>
                            <Badge variant="outline">
                              {review.is_published ? 'Published' : 'Pending Review'}
                            </Badge>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </motion.div>

      <ReviewDialog
        isOpen={isReviewDialogOpen}
        onClose={() => {
          setIsReviewDialogOpen(false);
          setSelectedReview(undefined);
        }}
        onSubmit={handleReviewSubmit}
        initialData={selectedReview}
      />
    </div>
  );
}