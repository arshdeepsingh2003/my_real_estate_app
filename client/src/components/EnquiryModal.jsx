import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { FaTimes, FaSpinner, FaCheckCircle, FaEnvelope } from 'react-icons/fa';

export default function EnquiryModal({ isOpen, onClose, listing }) {
  const { currentUser } = useSelector((state) => state.user);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  // Reset or prefill form when modal is opened
  useEffect(() => {
    if (isOpen) {
      setSuccess(false);
      setError(null);
      setFormData({
        name: currentUser ? currentUser.username : '',
        email: currentUser ? currentUser.email : '',
        phone: '',
        message: `Hi, I am interested in "${listing?.name}" and would like to get more information. Please contact me.`,
      });
    }
  }, [isOpen, currentUser, listing]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    // Basic client side email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`/api/listing/${listing._id}/enquiry`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      
      if (res.ok && data.success !== false) {
        setSuccess(true);
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
        });
        // Auto close modal after 2.5 seconds upon success
        setTimeout(() => {
          onClose();
        }, 2500);
      } else {
        setError(data.message || 'Something went wrong. Please try again later.');
      }
    } catch (err) {
      console.error('Enquiry Submission Error:', err);
      setError('Unable to reach the server. Please check your internet connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-65 backdrop-blur-sm transition-all duration-300'>
      <div className='relative w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden transform scale-100 transition-all duration-300'>
        
        {/* Header */}
        <div className='flex items-center justify-between p-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white'>
          <div className='flex items-center gap-2'>
            <FaEnvelope className='text-xl' />
            <h3 className='text-xl font-bold tracking-wide'>Contact Seller</h3>
          </div>
          <button 
            onClick={onClose} 
            className='p-1 text-white hover:text-gray-200 transition-colors duration-150 rounded-full hover:bg-white hover:bg-opacity-10 focus:outline-none'
          >
            <FaTimes className='text-lg' />
          </button>
        </div>

        {/* Modal content */}
        <div className='p-6'>
          {success ? (
            <div className='flex flex-col items-center justify-center py-10 text-center animate-fade-in'>
              <FaCheckCircle className='text-6xl text-green-500 mb-4 animate-bounce' />
              <h4 className='text-2xl font-bold text-gray-800 mb-2'>Enquiry Sent!</h4>
              <p className='text-gray-600'>Your message has been sent to the property owner successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className='flex flex-col gap-4'>
              <p className='text-gray-600 text-sm'>
                You are enquiring about: <span className='font-semibold text-gray-800'>{listing?.name}</span>
              </p>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='name'>
                  Sender Name *
                </label>
                <input
                  type='text'
                  id='name'
                  placeholder='Enter your full name'
                  className='w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm'
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='email'>
                  Sender Email *
                </label>
                <input
                  type='email'
                  id='email'
                  placeholder='Enter your email address'
                  className='w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm'
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='phone'>
                  Phone Number (optional)
                </label>
                <input
                  type='tel'
                  id='phone'
                  placeholder='Enter your phone number'
                  className='w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm'
                  value={formData.phone}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>

              <div>
                <label className='block text-sm font-medium text-gray-700 mb-1' htmlFor='message'>
                  Message / Enquiry *
                </label>
                <textarea
                  id='message'
                  rows='4'
                  placeholder='Write your message here...'
                  className='w-full border border-gray-300 p-3 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition duration-200 text-sm resize-none'
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              {error && (
                <div className='p-3 bg-red-50 text-red-700 border border-red-200 rounded-lg text-sm font-medium'>
                  {error}
                </div>
              )}

              <div className='flex gap-3 mt-4'>
                <button
                  type='button'
                  onClick={onClose}
                  className='flex-1 border border-gray-300 text-gray-700 p-3 rounded-lg font-semibold hover:bg-gray-50 transition duration-200 text-sm'
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-3 rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 transition duration-200 disabled:opacity-50 text-sm'
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <FaSpinner className='animate-spin' /> Sending...
                    </>
                  ) : (
                    'Submit Enquiry'
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
