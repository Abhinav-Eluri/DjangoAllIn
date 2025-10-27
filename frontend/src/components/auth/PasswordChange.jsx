import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { authAPI } from '../../api';

const PasswordChange = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    old_password: '',
    new_password1: '',
    new_password2: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState(false);

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
    // Clear success message when user starts typing
    if (success) setSuccess(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    setSuccess(false);

    // Client-side validation
    if (formData.new_password1 !== formData.new_password2) {
      setErrors({ new_password2: ['New passwords do not match.'] });
      setLoading(false);
      return;
    }

    try {
      await authAPI.changePassword(formData);
      setSuccess(true);
      setFormData({
        old_password: '',
        new_password1: '',
        new_password2: '',
      });
      
      // Redirect to dashboard after successful password change
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);
    } catch (error) {
      console.error('Password change error:', error);
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
    <div className="space-y-6">
      {success ? (
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full mb-4">
            <svg className="w-8 h-8 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-foreground">Password Changed Successfully!</h3>
            <p className="text-muted-foreground">
              Your password has been updated. You will be redirected to the dashboard shortly.
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {getNonFieldErrors() && (
            <div className="p-4 text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg dark-transition flex items-start space-x-3">
              <svg className="w-5 h-5 text-destructive mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{getNonFieldErrors()}</span>
            </div>
          )}
          
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="old_password" className="text-sm font-medium text-foreground flex items-center">
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                Current Password
              </Label>
              <Input
                id="old_password"
                name="old_password"
                type="password"
                placeholder="Enter your current password"
                value={formData.old_password}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-12 dark-transition focus:ring-2 focus:ring-primary/20"
              />
              {getFieldError('old_password') && (
                <p className="text-sm text-destructive flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getFieldError('old_password')}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password1" className="text-sm font-medium text-foreground flex items-center">
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                </svg>
                New Password
              </Label>
              <Input
                id="new_password1"
                name="new_password1"
                type="password"
                placeholder="Enter your new password"
                value={formData.new_password1}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-12 dark-transition focus:ring-2 focus:ring-primary/20"
              />
              {getFieldError('new_password1') && (
                <p className="text-sm text-destructive flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getFieldError('new_password1')}
                </p>
              )}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="new_password2" className="text-sm font-medium text-foreground flex items-center">
                <svg className="w-4 h-4 mr-2 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Confirm New Password
              </Label>
              <Input
                id="new_password2"
                name="new_password2"
                type="password"
                placeholder="Confirm your new password"
                value={formData.new_password2}
                onChange={handleChange}
                required
                disabled={loading}
                className="h-12 dark-transition focus:ring-2 focus:ring-primary/20"
              />
              {getFieldError('new_password2') && (
                <p className="text-sm text-destructive flex items-center mt-1">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {getFieldError('new_password2')}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              className="flex-1 h-12 font-medium hover:bg-muted/50 dark-transition"
              onClick={() => navigate('/dashboard')}
              disabled={loading}
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1 h-12 font-medium bg-primary hover:bg-primary/90 dark-transition" 
              disabled={loading}
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Changing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Change Password
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

export default PasswordChange;