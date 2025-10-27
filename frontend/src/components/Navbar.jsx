import { Link, useNavigate } from 'react-router-dom';
import { Button } from './ui/button';
import { useAuth } from '../contexts/AuthContext';
import ThemeToggle from './ThemeToggle';

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
            
            {loading ? (
              <div className="animate-pulse">
                <div className="h-8 w-20 bg-muted rounded"></div>
              </div>
            ) : user ? (
              <div className="flex items-center space-x-2 sm:space-x-4">
                <span className="text-responsive-sm text-muted-foreground hidden sm:inline">
                  Welcome, {user.first_name || user.email}
                </span>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="sm"
                  className="btn-responsive"
                >
                  Logout
                </Button>
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