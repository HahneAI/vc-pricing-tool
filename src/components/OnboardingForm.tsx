import React, { useState } from 'react';
import { User, Briefcase, Mail, Key, CheckCircle, AlertCircle } from 'lucide-react';

interface OnboardingFormProps {
  betaCode: string;
  betaCodeId: number;
  onComplete: (userData: {
    firstName: string;
    jobTitle: string;
    email: string;
  }) => void;
}

const OnboardingForm: React.FC<OnboardingFormProps> = ({ betaCode, betaCodeId, onComplete }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    jobTitle: '',
    email: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const jobTitleOptions = [
    'Owner/President',
    'Operations Manager', 
    'Field Technician',
    'Sales Representative',
    'Office Manager',
    'Crew Leader',
    'Estimator',
    'Project Manager',
    'Other'
  ];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.firstName || !formData.jobTitle) {
      setError('Please fill in all required fields');
      return false;
    }
    
    // Email is optional, but if provided, validate it
    if (formData.email && formData.email.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setError('Please enter a valid email address');
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateStep1()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Check if email already exists (only if email was provided)
      if (formData.email && formData.email.trim()) {
        const checkResponse = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/beta_users?email=eq.${formData.email}`, {
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
            'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json'
          }
        });

        if (!checkResponse.ok) {
          throw new Error('Failed to check email availability');
        }

        const existingUsers = await checkResponse.json();
        
        if (existingUsers.length > 0) {
          setError('An account with this email already exists');
          return;
        }
      }

      // Create the user account
      onComplete(formData);
      
    } catch (error) {
      console.error('Registration error:', error);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mx-auto w-16 h-16 bg-green-600 rounded-full flex items-center justify-center mb-4">
            <CheckCircle className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to TradeSphere!</h1>
          <p className="text-gray-600 mt-2">Let's set up your account</p>
          <div className="mt-3 px-3 py-1 bg-green-100 border border-green-200 rounded-full inline-block">
            <span className="text-green-700 text-xs font-medium">Beta Code: {betaCode}</span>
          </div>
        </div>

        {/* Progress Indicator - Single Step */}
        <div className="flex items-center justify-center mb-6">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium bg-indigo-600 text-white">
            ✓
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 text-center mb-4">
              Set Up Your Account
            </h3>
            
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-2">
                <User className="w-4 h-4 inline mr-1" />
                First Name (Login Username) *
              </label>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleInputChange}
                placeholder="John"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
              <p className="text-xs text-gray-500 mt-1">This will be your username to login</p>
            </div>

            <div>
              <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                <Briefcase className="w-4 h-4 inline mr-1" />
                Job Title *
              </label>
              <select
                id="jobTitle"
                name="jobTitle"
                value={formData.jobTitle}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900"
                disabled={loading}
              >
                <option value="" className="text-gray-500">Select your role...</option>
                {jobTitleOptions.map((title) => (
                  <option key={title} value={title} className="text-gray-900">{title}</option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Company Email (Optional)
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@company.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-gray-900 placeholder-gray-500"
                disabled={loading}
              />
            </div>

            {/* Login Information */}
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-md">
              <h4 className="text-sm font-medium text-blue-800 mb-2">
                <Key className="w-4 h-4 inline mr-1" />
                Your Login Information
              </h4>
              <div className="text-sm text-blue-700">
                <p><strong>Username:</strong> {formData.firstName || '[Enter first name]'}</p>
                <p><strong>Password:</strong> {betaCodeId}</p>
              </div>
              <p className="text-xs text-blue-600 mt-2">
                Use these credentials to login after account creation
              </p>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 p-3 rounded-md">
              <p className="text-sm text-gray-600">
                <strong>First Name:</strong> {formData.firstName}<br />
                <strong>Job Title:</strong> {formData.jobTitle}<br />
                <strong>Email:</strong> {formData.email || 'Not provided'}
              </p>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 text-red-500 mr-2 flex-shrink-0" />
              <span className="text-red-700 text-sm">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-md font-medium ${
                loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-green-600 text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2'
              }`}
            >
              {loading ? (
                <div className="flex items-center justify-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Creating Account...
                </div>
              ) : (
                'Create Account'
              )}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-8 text-center">
          <p className="text-xs text-gray-500">
            TradeSphere Private Beta • Account Setup
          </p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingForm;