import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';

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
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl text-center font-bold my-7">Sign Up</h1>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <input 
          type="text" 
          placeholder="Username" 
          className="border p-3 rounded-lg" 
          id="username" 
          value={formData.username} 
          onChange={handleChange} 
        />
        <input 
          type="email" 
          placeholder="Email" 
          className="border p-3 rounded-lg" 
          id="email" 
          value={formData.email} 
          onChange={handleChange} 
        />
        <input 
          type="password" 
          placeholder="Password" 
          className="border p-3 rounded-lg" 
          id="password" 
          value={formData.password} 
          onChange={handleChange} 
        />
        <button 
          disabled={loading} 
          className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:opacity-95 disabled:opacity-80"
        >
          {loading ? 'Loading...' : 'Sign Up'}
        </button>
      </form>
      <div className="flex gap-2 mt-5">
        <p>Have an Account?</p>
        <Link to="/sign-in">
          <span className="text-blue-800">Sign in</span>
        </Link>
      </div>
      {error && <p className="text-red-500 mt-5">{error}</p>}
    </div>
  );
};

export default SignUp;
