import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { useAuth } from '../../contexts/AuthContext';

const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password1: '',
    password2: '',
    first_name: '',
    last_name: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear specific field error when user starts typing
    if (errors[e.target.name]) {
      setErrors({
        ...errors,
        [e.target.name]: '',
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    // Client-side validation
    if (formData.password1 !== formData.password2) {
      setErrors({ password2: 'Passwords do not match.' });
      setLoading(false);
      return;
    }

    try {
      const response = await register(formData);
      
      // Show success message instead of redirecting
      setSuccess(true);
      setSuccessMessage(response.data.detail || 'User registered successfully. Please verify your email to access the website.');
      
      // Clear form data
      setFormData({
        email: '',
        password1: '',
        password2: '',
        first_name: '',
        last_name: '',
      });
    } catch (error) {
      console.error('Registration error:', error);
      if (error.response?.data) {
        setErrors(error.response.data);
      } else {
        setErrors({ non_field_errors: ['Network error. Please try again.'] });
      }
    } finally {
      setLoading(false);
    }
  };

  const getFieldError = (fieldName) => {
    return errors[fieldName] ? errors[fieldName][0] : '';
  };

  const getNonFieldErrors = () => {
    return errors.non_field_errors ? errors.non_field_errors.join(' ') : '';
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] p-responsive">
      <Card className="w-full max-w-sm sm:max-w-md card-responsive">
        <CardHeader className="space-y-1">
          <CardTitle className="text-responsive-xl text-center">Create account</CardTitle>
          <CardDescription className="text-center text-responsive-sm">
            Enter your information to create your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="text-center space-y-4">
              <div className="p-4 text-responsive-sm text-green-700 bg-green-50 border border-green-200 rounded-md dark:text-green-400 dark:bg-green-900/20 dark:border-green-800">
                <div className="flex items-center justify-center mb-2">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="font-medium">{successMessage}</p>
              </div>
              <div className="text-responsive-sm text-muted-foreground">
                Already verified your email?{' '}
                <Link to="/auth/login" className="text-primary hover:text-primary/80 dark-transition font-medium">
                  Sign in here
                </Link>
              </div>
            </div>
          ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {getNonFieldErrors() && (
              <div className="p-3 text-responsive-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-md">
                {getNonFieldErrors()}
              </div>
            )}
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name" className="text-responsive-sm">First Name</Label>
                <Input
                  id="first_name"
                  name="first_name"
                  type="text"
                  placeholder="John"
                  value={formData.first_name}
                  onChange={handleChange}
                  disabled={loading}
                  className="dark-transition"
                />
                {getFieldError('first_name') && (
                  <p className="text-responsive-sm text-destructive">{getFieldError('first_name')}</p>
                )}
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="last_name" className="text-responsive-sm">Last Name</Label>
                <Input
                  id="last_name"
                  name="last_name"
                  type="text"
                  placeholder="Doe"
                  value={formData.last_name}
                  onChange={handleChange}
                  disabled={loading}
                  className="dark-transition"
                />
                {getFieldError('last_name') && (
                  <p className="text-responsive-sm text-destructive">{getFieldError('last_name')}</p>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email" className="text-responsive-sm">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="john@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                disabled={loading}
                className="dark-transition"
              />
              {getFieldError('email') && (
                <p className="text-responsive-sm text-destructive">{getFieldError('email')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password1" className="text-responsive-sm">Password</Label>
              <Input
                id="password1"
                name="password1"
                type="password"
                placeholder="Create a password"
                value={formData.password1}
                onChange={handleChange}
                required
                disabled={loading}
                className="dark-transition"
              />
              {getFieldError('password1') && (
                <p className="text-responsive-sm text-destructive">{getFieldError('password1')}</p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password2" className="text-responsive-sm">Confirm Password</Label>
              <Input
                id="password2"
                name="password2"
                type="password"
                placeholder="Confirm your password"
                value={formData.password2}
                onChange={handleChange}
                required
                disabled={loading}
                className="dark-transition"
              />
              {getFieldError('password2') && (
                <p className="text-responsive-sm text-destructive">{getFieldError('password2')}</p>
              )}
            </div>

            <Button type="submit" className="w-full btn-responsive" disabled={loading}>
              {loading ? 'Creating account...' : 'Create account'}
            </Button>
          </form>
          )}

          {!success && (
          <div className="mt-6 text-center">
            <div className="text-responsive-sm text-muted-foreground">
              Already have an account?{' '}
              <Link to="/auth/login" className="text-primary hover:text-primary/80 dark-transition">
                Sign in
              </Link>
            </div>
          </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;