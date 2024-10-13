import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart,signInFailure,signInSuccess } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const {loading,error}=useSelector((state=>state.user))
  const navigate = useNavigate(); // Correctly invoke the hook to get the navigate function
  const dispatch=useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value, // Update form data based on input field
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', { // Change endpoint to match sign-in logic
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set headers to send JSON data
        },
        body: JSON.stringify(formData), // Convert formData to JSON for request
      });

      const data = await res.json(); // Parse the JSON response
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      // Handle successful sign-in (e.g., navigate to another page)
      dispatch(signInSuccess(data));
      navigate('/'); // Navigate to the home page or another page after successful sign-in
    } catch (error) {
      dispatch(signInFailure(error.message));
    }
  };

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-bold my-7">Sign In</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="email" 
          placeholder="Email" 
          className="border p-3 rounded-lg" 
          id="email" 
          value={formData.email} 
          onChange={handleChange} 
          required // Make email input required
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-3 rounded-lg" 
          id="password" 
          value={formData.password} 
          onChange={handleChange} 
          required // Make password input required
        />
        <button 
          disabled={loading} 
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Sign In'}
        </button>
        <OAuth/>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Dont Have an Account?</p>
        <Link to="/sign-up">
          <span className="text-blue-800">Sign Up</span>
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
};

export default SignIn;
