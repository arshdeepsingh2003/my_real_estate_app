import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSignIn } from '@clerk/clerk-react';
import OAuth from '../components/OAuth';

const SignIn = () => {
  const { isLoaded, signIn, setActive } = useSignIn();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
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
      setError(err.errors ? err.errors[0].message : err.message);
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
          <input 
            type="password" 
            placeholder="Password" 
            className="border p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
            required
          />
          <button 
            disabled={loading} 
            className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-500 transition-colors duration-200 disabled:opacity-50"
          >
            {loading ? 'Loading...' : 'Sign In'}
          </button>
          <OAuth />
        </form>
        <div className="flex gap-2 mt-5 justify-center">
          <p className="text-gray-600">Don't have an account?</p>
          <Link to="/sign-up">
            <span className="text-blue-600 font-semibold">Sign Up</span>
          </Link>
        </div>
        {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default SignIn;
