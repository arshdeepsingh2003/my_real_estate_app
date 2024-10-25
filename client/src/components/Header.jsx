import { useState,useEffect } from 'react';
import { FaSearch } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const { currentUser } = useSelector(state => state.user);
  const[searchTerm,setSearchTerm]=useState('');
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
    <header className="bg-slate-200 show-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <a href="/">
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Real</span>
            <span className="text-slate-800">Estate</span>
          </h1>
        </a>
        <form onSubmit={handleSubmit} className="bg-slate-100 p-3 rounded-r-lg flex items-center">
          <input 
            type="text" 
            placeholder="search..." 
            className="bg-transparent focus:outline-none w-24 sm:w-64"
            value={searchTerm}
            onChange={(e)=>setSearchTerm(e.target.value)}
          />
          <button>
          <FaSearch className="text-slate-600" />
          </button>
          
        </form>
        <ul className="flex gap-4">
          <a href="/">
            <li className="hidden sm:inline text-slate-700 hover:underline">Home</li>
          </a>
          <a href="/about">
            <li className="hidden sm:inline text-slate-700 hover:underline">About</li>
          </a>
          <a href="/profile">
          {currentUser ? (
              <img className='rounded-full h-7 w-7 object-cover' src={currentUser.avatar}
                alt='profile'
              />
            ) : (
              <li className=' text-slate-700 hover:underline'> Sign in</li>
            )
            }
          </a>
        </ul>
      </div>
    </header>
  );
};

export default Header;
