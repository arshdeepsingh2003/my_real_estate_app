//Frontend for Google sign in

import { GoogleAuthProvider, getAuth, signInWithPopup } from 'firebase/auth'; 
import { app } from '../firebase'; 
import { useDispatch } from 'react-redux'; 
import { signInSuccess } from '../redux/user/userSlice'; 
import {useNavigate} from 'react-router-dom';

const OAuth = () => {
  const dispatch = useDispatch(); 
const navigate=useNavigate();
  const handleGoogleClick = async () => {
    try {
      // Initialize GoogleAuthProvider for Google sign-in
      const provider = new GoogleAuthProvider();
      const auth = getAuth(app); // Get Firebase authentication instance

      // Sign in with a Google popup and get the result (user info)
      const result = await signInWithPopup(auth, provider);

      // Send user data (name, email, photo) to the backend for authentication and/or registration
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: result.user.displayName, 
          email: result.user.email, 
          photo: result.user.photoURL
        }),
      });

      const data = await res.json(); // Parse the response from the backend
      dispatch(signInSuccess(data)); // Dispatch the sign-in success action with the received data
      navigate("/");    
    } catch (error) {
      console.log('Could not sign in with Google', error); // Handle and log errors if sign-in fails
    }
  };

  return (
    
    <button onClick={handleGoogleClick} type='button' className="bg-red-700 text-white p3 rounded-lg uppercase hover:opacity-95">
      Continue with Google
    </button>
  );
};

export default OAuth;
