import { useState, useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { currentUser } = useSelector(state => state.user);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    urlParams.set('searchTerm', searchTerm);
    const searchQuery = urlParams.toString();
    navigate(`/search?${searchQuery}`);
  };

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    if (searchTermFromUrl) {
      setSearchTerm(searchTermFromUrl);
    }
  }, [location.search]);

  return (
    <header className="bg-gradient-to-r from-blue-200 to-blue-300 backdrop-blur-lg bg-white/50 rounded-lg shadow-md p-4 mx-auto mt-4 max-w-7xl">
      <div className="flex justify-between items-center p-3">
        <a href="/" className="text-2xl font-extrabold text-slate-900 flex">
          <span className="text-blue-600">Real</span><span className="text-orange-600">Estate</span>
        </a>
        <form 
          onSubmit={handleSubmit} 
          className="flex items-center bg-white/20 backdrop-blur-md rounded-full px-4 py-2 shadow-inner"
        >
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent text-slate-900 placeholder-slate-500 focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button type="submit" className="text-blue-600 ml-2">
            <FaSearch />
          </button>
        </form>
        <ul className="flex items-center gap-6 text-slate-900">
          <a href="/" className="hidden sm:inline hover:text-blue-600">Home</a>
          <a href="/about" className="hidden sm:inline hover:text-blue-600">About</a>
          <a href="/profile">
            {currentUser ? (
              <img
                className="rounded-full h-8 w-8 border-2 border-white shadow-md"
                src={currentUser.avatar}
                alt="profile"
              />
            ) : (
              <span className="hover:text-blue-600">Sign In</span>
            )}
          </a>
        </ul>
      </div>
    </header>
  );
};

export default Header;
