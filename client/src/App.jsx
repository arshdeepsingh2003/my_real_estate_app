import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home.jsx';
import SignIn from './pages/SignIn.jsx';
import SignUp from './pages/SignUp.jsx';
import About from './pages/About.jsx';
import Profile from './pages/Profile.jsx';
import Header from './components/Header.jsx';
import PrivateRoute from './components/PrivateRoute.jsx';
import CreateListing from './pages/CreateListing.jsx';
import UpdateListing from './pages/UpdateListing.jsx';
function App() {
  return (
    <>
      <Header />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} /> {/* Corrected here */}
          <Route path="/about" element={<About />} />
          <Route element={<PrivateRoute />} >
          <Route path="/profile" element={<Profile />}/>
          <Route path="/create-listing" element={<CreateListing />}/>
          <Route path="/update-listing/:listingID" element={<UpdateListing />}/>
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
