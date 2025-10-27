import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { authAPI } from '../api';

const Dashboard = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authAPI.getUser();
        setUser(response.data);
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-foreground dark-transition"></div>
      </div>
    );
  }

  return (
    <div className="space-y-responsive p-responsive">
      <div>
        <h1 className="text-responsive-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground text-responsive-base">Welcome to your dashboard</p>
      </div>

      <div className="grid-responsive-3 gap-responsive">
        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-responsive-lg">Profile Information</CardTitle>
            <CardDescription className="text-responsive-sm">Your account details</CardDescription>
          </CardHeader>
          <CardContent>
            {user ? (
              <div className="space-y-2">
                <div>
                  <span className="font-medium text-responsive-sm">Email:</span> <span className="text-responsive-sm">{user.email}</span>
                </div>
                {user.first_name && (
                  <div>
                    <span className="font-medium text-responsive-sm">First Name:</span> <span className="text-responsive-sm">{user.first_name}</span>
                  </div>
                )}
                {user.last_name && (
                  <div>
                    <span className="font-medium text-responsive-sm">Last Name:</span> <span className="text-responsive-sm">{user.last_name}</span>
                  </div>
                )}
                <div>
                  <span className="font-medium text-responsive-sm">Account Status:</span>{' '}
                  <span className="text-green-600 dark:text-green-400 text-responsive-sm">Active</span>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-responsive-sm">Failed to load user information</p>
            )}
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-responsive-lg">Quick Actions</CardTitle>
            <CardDescription className="text-responsive-sm">Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-responsive-sm text-muted-foreground">
                • Update your profile information
              </div>
              <div className="text-responsive-sm text-muted-foreground">
                • Change your password
              </div>
              <div className="text-responsive-sm text-muted-foreground">
                • Manage account settings
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="card-responsive">
          <CardHeader>
            <CardTitle className="text-responsive-lg">System Status</CardTitle>
            <CardDescription className="text-responsive-sm">Application health</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-responsive-sm">Authentication: Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-responsive-sm">API: Connected</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-responsive-sm">Database: Operational</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;