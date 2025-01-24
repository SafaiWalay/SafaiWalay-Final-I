import { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/components/ui/use-toast';
import { useAuth } from '@/lib/store';
import { fetchDashboardData, deleteUser, restoreUser, updateUser } from '@/lib/supabase';
import {
  MoreVertical,
  Users,
  Calendar,
  DollarSign,
  Star,
  Trash2,
  RefreshCcw,
  Pencil,
} from 'lucide-react';

interface UserFormData {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  role: 'user' | 'admin' | 'cleaner';
}

export default function Admin() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleted, setShowDeleted] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<UserFormData | null>(null);
  const [dashboardData, setDashboardData] = useState<any>({
    users: [],
    bookings: [],
    reviews: [],
    services: [],
    revenue: {
      total: 0,
      recentTransactions: [],
    },
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      loadDashboardData();
    }
  }, [user, showDeleted]);

  const loadDashboardData = async () => {
    try {
      const data = await fetchDashboardData(showDeleted);
      setDashboardData(data);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      await deleteUser(userId);
      toast({
        title: "User Deleted",
        description: "The user has been deleted successfully.",
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive",
      });
    }
  };

  const handleRestoreUser = async (userId: string) => {
    try {
      await restoreUser(userId);
      toast({
        title: "User Restored",
        description: "The user has been restored successfully.",
      });
      loadDashboardData();
    } catch (error) {
      console.error('Error restoring user:', error);
      toast({
        title: "Error",
        description: "Failed to restore user",
        variant: "destructive",
      });
    }
  };

  const handleEditUser = (userData: UserFormData) => {
    setSelectedUser(userData);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      await updateUser(selectedUser.id, {
        name: selectedUser.name,
        email: selectedUser.email,
        phone: selectedUser.phone,
        address: selectedUser.address,
        role: selectedUser.role,
      });

      toast({
        title: "User Updated",
        description: "User profile has been updated successfully.",
      });

      setIsEditDialogOpen(false);
      loadDashboardData();
    } catch (error) {
      console.error('Error updating user:', error);
      toast({
        title: "Error",
        description: "Failed to update user",
        variant: "destructive",
      });
    }
  };

  if (!user || user.role !== 'admin') {
    return <Navigate to="/admin_login" />;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{dashboardData.users.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Bookings</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {dashboardData.bookings.filter((b: any) => b.status === 'confirmed').length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{dashboardData.revenue.total}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(dashboardData.reviews.reduce((acc: number, r: any) => acc + r.rating, 0) / 
                  Math.max(dashboardData.reviews.length, 1)).toFixed(1)}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="users">
          <TabsList>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="bookings">Bookings</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
          </TabsList>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Users</CardTitle>
                  <div className="flex items-center space-x-2">
                    <Label htmlFor="show-deleted">Show Deleted Users</Label>
                    <Switch
                      id="show-deleted"
                      checked={showDeleted}
                      onCheckedChange={setShowDeleted}
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {dashboardData.users.map((user: any) => (
                      <Card key={user.id} className={user.is_deleted ? 'opacity-60' : ''}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{user.name}</h3>
                              <p className="text-sm text-muted-foreground">{user.email}</p>
                              <p className="text-sm text-muted-foreground">{user.phone}</p>
                              <div className="flex gap-2 mt-1">
                                <Badge>{user.role}</Badge>
                                {user.is_deleted && (
                                  <Badge variant="destructive">Deleted</Badge>
                                )}
                              </div>
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <MoreVertical className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                {!user.is_deleted && (
                                  <>
                                    <DropdownMenuItem onClick={() => handleEditUser(user)}>
                                      <Pencil className="h-4 w-4 mr-2" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem 
                                      className="text-destructive"
                                      onClick={() => handleDeleteUser(user.id)}
                                    >
                                      <Trash2 className="h-4 w-4 mr-2" /> Delete
                                    </DropdownMenuItem>
                                  </>
                                )}
                                {user.is_deleted && (
                                  <DropdownMenuItem onClick={() => handleRestoreUser(user.id)}>
                                    <RefreshCcw className="h-4 w-4 mr-2" /> Restore
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings">
            <Card>
              <CardHeader>
                <CardTitle>Recent Bookings</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {dashboardData.bookings.map((booking: any) => (
                      <Card key={booking.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{booking.services.name}</h3>
                              <p className="text-sm text-muted-foreground">
                                {new Date(booking.scheduled_at).toLocaleString()}
                              </p>
                              <p className="text-sm">
                                Customer: {booking.users.name} ({booking.users.email})
                              </p>
                              <Badge>{booking.status}</Badge>
                            </div>
                            <p className="font-semibold">₹{booking.amount}</p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reviews">
            <Card>
              <CardHeader>
                <CardTitle>Recent Reviews</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {dashboardData.reviews.map((review: any) => (
                      <Card key={review.id}>
                        <CardContent className="p-4">
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
                              <p className="text-sm">{review.comment}</p>
                              <p className="text-sm text-muted-foreground mt-2">
                                By: {review.users.name}
                              </p>
                            </div>
                            <Badge variant={review.is_published ? "default" : "secondary"}>
                              {review.is_published ? "Published" : "Pending"}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit User Profile</DialogTitle>
            <DialogDescription>
              Update user information and role
            </DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  value={selectedUser.name}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    name: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={selectedUser.email}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    email: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={selectedUser.phone}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    phone: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  value={selectedUser.address}
                  onChange={(e) => setSelectedUser({
                    ...selectedUser,
                    address: e.target.value
                  })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select
                  value={selectedUser.role}
                  onValueChange={(value: 'user' | 'admin' | 'cleaner') => 
                    setSelectedUser({
                      ...selectedUser,
                      role: value
                    })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateUser}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}