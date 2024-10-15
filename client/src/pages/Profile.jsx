import { useSelector } from "react-redux";

const Profile = () => {
  // Assuming currentUser is inside the 'user' slice of your state
  const currentUser = useSelector((state) => state.user.currentUser);

  return (
    <div className="p-3 max-w-lg mx-auto">
      <h1 className="text-3xl font-semibold text-center my-7">Profile</h1>
      <form className="flex flex-col">
        {/* Display avatar if currentUser exists */}
        <img 
          src={currentUser?.avatar || 'https://via.placeholder.com/150'} 
          alt="profile" 
          className="rounded-full h-24 w-24 object-cover cursor-pointer self-center mt-2" 
        />
        <input 
          type="text" 
          placeholder="username" 
          defaultValue={currentUser?.username || ''} 
          className="border p-3 rounded-lg mt-3" 
          id="username"
        />
        <input 
          type="email" 
          placeholder="email" 
          defaultValue={currentUser?.email || ''} 
          className="border p-3 rounded-lg mt-3" 
          id="email"
        />
        <input 
          type="password" 
          placeholder="password" 
          className="border p-3 rounded-lg mt-3" 
          id="password"
        />
        <button  className="bg-slate-700 mt-3 text-white rounded-lg p-3 uppercase hover:opacity:95 disabled:opacity-80">UPDATE</button>
      </form>
      <div className="flex justify-between mt-5">
        <span className="text-red-600 cursor-pointer">Delete Account</span>
        <span className="text-red-600 cursor-pointer">Sign Out</span>
      </div>
    </div>
  );
};

export default Profile;
