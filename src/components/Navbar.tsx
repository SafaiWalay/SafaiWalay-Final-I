import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X, Sparkles, ShoppingCart, User } from 'lucide-react';
import { useCart, useAuth } from '@/lib/store';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const cartItems = useCart((state) => state.items);
  const { user, setUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isCleanerRoute = location.pathname.startsWith('/cleaner');

  const handleLogoClick = () => {
    if (user) {
      switch (user.role) {
        case 'admin':
          navigate('/admin');
          break;
        case 'cleaner':
          navigate('/cleaner/dashboard');
          break;
        default:
          navigate('/');
      }
    } else {
      if (isAdminRoute) {
        navigate('/admin_login');
      } else if (isCleanerRoute) {
        navigate('/cleaner/login');
      } else {
        navigate('/');
      }
    }
  };

  const handleLogout = () => {
    setUser(null);
    navigate('/');
  };

  // Only show these navigation items for regular users
  const navigation = !isAdminRoute && !isCleanerRoute ? [
    { name: 'Services', href: '/services' },
    { name: 'Contact', href: '/contact' },
  ] : [];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container flex h-16 items-center justify-between">
        <div
          onClick={handleLogoClick}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-xl font-bold">SafaiWalay</span>
        </div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex md:items-center md:space-x-6">
          {navigation.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm font-medium transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
          {!isAdminRoute && !isCleanerRoute && (
            <Link to="/cart" className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartItems.length > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {cartItems.length}
                  </Badge>
                )}
              </Button>
            </Link>
          )}
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {!isAdminRoute && !isCleanerRoute && (
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            !isAdminRoute && !isCleanerRoute && (
              <Link to="/signin">
                <Button variant="default">Sign In</Button>
              </Link>
            )
          )}
        </div>

        {/* Mobile Navigation */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[300px] sm:w-[400px]">
            <div className="flex flex-col space-y-4 py-4">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className="text-sm font-medium transition-colors hover:text-primary"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              {!isAdminRoute && !isCleanerRoute && (
                <Link 
                  to="/cart" 
                  className="flex items-center space-x-2"
                  onClick={() => setIsOpen(false)}
                >
                  <ShoppingCart className="h-5 w-5" />
                  <span>Cart</span>
                  {cartItems.length > 0 && (
                    <Badge variant="destructive">{cartItems.length}</Badge>
                  )}
                </Link>
              )}
              {user ? (
                <>
                  {!isAdminRoute && !isCleanerRoute && (
                    <Link 
                      to="/profile"
                      className="flex items-center space-x-2"
                      onClick={() => setIsOpen(false)}
                    >
                      <User className="h-5 w-5" />
                      <span>Profile</span>
                    </Link>
                  )}
                  <Button onClick={handleLogout}>Logout</Button>
                </>
              ) : (
                !isAdminRoute && !isCleanerRoute && (
                  <Link to="/signin" onClick={() => setIsOpen(false)}>
                    <Button className="w-full">Sign In</Button>
                  </Link>
                )
              )}
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}