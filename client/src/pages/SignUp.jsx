import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import OAuth from '../components/OAuth';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState(null); // For handling errors
  const [loading, setLoading] = useState(false); // For loading state
  const navigate = useNavigate(); // Correctly invoke the hook to get the navigate function

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value, // Update form data based on input field
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    if (!isLoaded) return;
    try {
      setLoading(true); // Set loading state to true while fetching data
      setError(null);

      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        username: formData.username,
      });

      if (result.status === 'missing_requirements' && result.unverifiedFields.includes('email_address')) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        navigate('/');
      } else {
        console.warn('Sign-up status incomplete:', result.status);
        setError('Verification or additional steps required.');
      }
    } catch (err) {
      console.error(err);
      setError(err.errors ? err.errors[0].message : err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    try {
      setLoading(true);
      setError(null);

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        navigate('/');
      } else {
        console.warn('Verification incomplete status:', completeSignUp.status);
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(err.errors ? err.errors[0].message : err.message);
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <div className="flex items-center justify-center mt-6 bg-gray-100">
        <div className="bg-blue-50 shadow-md rounded-lg p-6 w-full max-w-md">
          <h1 className="text-3xl text-center font-bold mb-4 text-blue-700">Verify Email</h1>
          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            <p className="text-center text-gray-600">Please enter the 6-digit verification code sent to your email.</p>
            <input 
              type="text" 
              placeholder="Verification Code" 
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
              id="verificationCode" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              required
            />
            <button 
              disabled={loading} 
              className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-500 disabled:opacity-80 transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-6 bg-gray-100"> {/* Full screen height and light background */}
      <div className="bg-blue-50 shadow-md rounded-lg p-6 w-full max-w-md"> {/* Light blue background for the card */}
        <h1 className="text-3xl text-center font-bold mb-4 text-blue-700">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Username" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="username" 
            value={formData.username} 
            onChange={handleChange} 
            required
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
            required
          />
          <button 
            disabled={loading} 
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-600 disabled:opacity-80 transition"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          <OAuth />
        </form>
        <div className="flex gap-2 mt-5">
          <p>Have an Account?</p>
          <Link to="/sign-in">
            <span className="text-blue-800 hover:underline">Sign In</span> {/* Added underline on hover */}
          </Link>
        </div>
        {error && <p className="text-red-500 mt-5 text-center">{error}</p>} {/* Centered error message */}
      </div>
    </div>
  );
};

export default SignUp;
