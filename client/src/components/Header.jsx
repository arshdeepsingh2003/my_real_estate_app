import { FaSearch } from 'react-icons/fa';


const Header = () => {
  return (
    <header className="bg-slate-200 show-md">
      <div className="flex justify-between items-center max-w-6xl mx-auto p-3">
        <a href='/'>
          <h1 className="font-bold text-sm sm:text-xl flex flex-wrap">
            <span className="text-slate-500">Real</span>
            <span className="text-slate-800">Estate</span>
          </h1>
        </a>
        <form className="bg-slate-100 p-3 rounded-r-lg flex items-center">
          <input 
            type="text" 
            placeholder="search..." 
            className="bg-transparent focus:outline-none w-24 sm:w-64" 
          />
          <FaSearch className="text-slate-600" />
        </form>
        <ul className="flex gap-4">
          <a href="/"><li className="hidden sm:inline text-slate-700 hover:underline">Home</li></a>
          <a href="/about"><li className="hidden sm:inline text-slate-700 hover:underline">About</li></a>
          <a href="/sign-in"><li className=" text-slate-700 hover:underline">SignIn</li></a>
          
      
        </ul>
      </div>
    </header>
  );
};

export default Header;
