import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import OAuth from '../components/OAuth';
import { getSignInErrorMessage } from '../utils/auth';

const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setError(null);
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      setLoading(true);
      setError(null);

      const result = await signIn.create({
        identifier: formData.email,
        password: formData.password,
      });

      if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/'); // Navigate to the home page after successful sign-in
      } else {
        console.warn('Sign-in status incomplete:', result.status);
        setError('Verification or additional steps required.');
      }
    } catch (err) {
      console.error(err);
      setError(getSignInErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center  mt-6 bg-gray-100">
      <div className="bg-blue-50 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h1 className="text-3xl text-center font-bold mb-4 text-blue-700">Sign In</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="email" 
            placeholder="Email" 
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              className="w-full border p-3 pr-11 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              id="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((visible) => !visible)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              aria-pressed={showPassword}
            >
              {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
            </button>
          </div>
          <button 
            disabled={loading || !isLoaded} 
            className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <OAuth />
        </form>
        <div className="flex gap-2 mt-5 justify-center">
          <p className="text-gray-600">Don&apos;t have an account?</p>
          <Link to="/sign-up">
            <span className="text-blue-600 font-semibold">Sign Up</span>
          </Link>
        </div>
        {error && <p className="text-red-600 mt-5 text-center" role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;
