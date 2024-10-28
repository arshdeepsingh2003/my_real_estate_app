import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { signInStart, signInFailure, signInSuccess } from '../redux/user/userSlice';
import OAuth from '../components/OAuth';

const SignIn = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const { loading, error } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (data.success === false) {
        dispatch(signInFailure(data.message));
        return;
      }
      dispatch(signInSuccess(data));
      navigate('/'); // Navigate to the home page after successful sign-in
    } catch (error) {
      dispatch(signInFailure(error.message));
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
