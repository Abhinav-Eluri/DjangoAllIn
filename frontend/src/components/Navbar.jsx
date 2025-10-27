import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';
import NotificationBell from './notifications/NotificationBell';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';

const Navbar = () => {
  const { user, loading, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <nav className="bg-background border-b border-border w-full dark-transition shadow-sm">
      <div className="w-full px-responsive">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/">
              <h1 className="text-responsive-lg font-bold text-foreground">Django All-In</h1>
            </Link>
            
            {user && (
              <div className="hidden md:ml-6 md:flex md:space-x-8">
                <Link
                  to="/dashboard"
                  className="text-foreground hover:text-muted-foreground px-3 py-2 rounded-md text-responsive-sm font-medium dark-transition"
                >
                  Dashboard
                </Link>
                <Link
                  to="/password-change"
                  className="text-muted-foreground hover:text-foreground px-3 py-2 rounded-md text-responsive-sm font-medium dark-transition"
                >
                  Change Password
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            <ThemeToggle />
            {user && <NotificationBell />}
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2 text-responsive-sm"
                    >
                      <span className="hidden sm:inline">
                        {user.first_name || user.email}
                      </span>
                      <User className="h-4 w-4" />
                      <ChevronDown className="h-3 w-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link to="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        <span>My Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/password-change" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Change Password</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={handleLogout}
                      className="flex items-center text-destructive focus:text-destructive"
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Logout</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/auth/login">
                  <Button variant="ghost" size="sm" className="text-responsive-sm">
                    Sign in
                  </Button>
                </Link>
                <Link to="/auth/register">
                  <Button size="sm" className="text-responsive-sm">
                    Sign up
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;