import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import OAuth from '../components/OAuth';

const SignUp = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
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
    try {
      setLoading(true); // Set loading state to true while fetching data
      const res = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json', // Set headers to send JSON data
        },
        body: JSON.stringify(formData), // Convert formData to JSON for request
      });

      const data = await res.json(); // Parse the JSON response
      if (data.success === false) {
        setError(data.message); // If signup failed, set error message
        setLoading(false);
        return;
      }
      // Handle successful signup (e.g., navigate to another page)
      setLoading(false); // Reset loading state
      setError(null); // Clear any previous error
      navigate('/sign-in'); // Navigate to the sign-in page
    } catch (error) {
      setLoading(false); // Reset loading state
      setError(error.message); // Set error message if there's a fetch error
    }
  };

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
          />
          <input 
            type="email" 
            placeholder="Email" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="password" 
            value={formData.password} 
            onChange={handleChange} 
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
