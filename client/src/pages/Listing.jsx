import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import {
  FaBath,
  FaBed,
  FaChair,
  FaMapMarkerAlt,
  FaParking,
  FaShare,
} from 'react-icons/fa';
import Contact from '../components/Contact';

export default function Listing() {
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [copied, setCopied] = useState(false);
  const [contact, setContact] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const params = useParams();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await fetch(`/api/listing/get/${params.listingId}`);
        const data = await res.json();
        if (data.success === false) {
          setError(true);
          return;
        }
        setListing(data);
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [params.listingId]);

  const handleThumbnailClick = (index) => {
    setActiveIndex(index);
  };

  return (
    <main className='bg-gray-50 min-h-screen'>
      {loading && <p className='text-center my-7 text-2xl'>Loading...</p>}
      {error && (
        <p className='text-center my-7 text-2xl text-red-500'>Something went wrong!</p>
      )}
      {listing && (
        <div className='max-w-4xl mx-auto p-4'>
          {/* Main Image Display */}
          <img
            src={listing.imageUrls[activeIndex]}
            alt={listing.name}
            className='h-[450px] w-full rounded-lg shadow-lg mb-4 object-cover'
          />

          {/* Thumbnails */}
          <div className='flex justify-center items-center overflow-x-auto gap-2 mb-4'>
            {listing.imageUrls.map((url, index) => (
              <img
                key={url}
                onClick={() => handleThumbnailClick(index)}
                src={url}
                alt={`Thumbnail ${index + 1}`}
                className={`h-[80px] sm:h-[100px] w-auto rounded-lg shadow-lg cursor-pointer transition-opacity duration-200 ${
                  activeIndex === index ? 'opacity-100' : 'opacity-60'
                }`}
              />
            ))}
          </div>

         
          <div className='fixed top-[18%] right-[25%] z-10 border rounded-full w-12 h-12 flex justify-center items-center bg-white shadow-lg cursor-pointer transition-transform transform hover:scale-110'>
            <FaShare
              className='text-gray-600'
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            />
          </div>
          {copied && (
            <p className='fixed top-[20%] right-[5%] z-10 rounded-md bg-white p-2 shadow-md'>
              Link copied!
            </p>
          )}

      
          <div className='bg-white p-6 rounded-lg shadow-md my-7'>
            <p className='text-2xl sm:text-3xl font-bold text-gray-800'>
              {listing.name} - ${' '}
              {listing.offer
                ? listing.discountPrice.toLocaleString('en-US')
                : listing.regularPrice.toLocaleString('en-US')}
              {listing.type === 'rent' && ' / month'}
            </p>
            <p className='flex items-center mt-4 gap-2 text-gray-600 text-sm'>
              <FaMapMarkerAlt className='text-green-700' />
              {listing.address}
            </p>
            <div className='flex gap-4 mt-3'>
              <p className='bg-red-600 w-full max-w-[200px] text-white text-center p-2 rounded-md'>
                {listing.type === 'rent' ? 'For Rent' : 'For Sale'}
              </p>
              {listing.offer && (
                <p className='bg-green-600 w-full max-w-[200px] text-white text-center p-2 rounded-md'>
                  ${+listing.regularPrice - +listing.discountPrice} OFF
                </p>
              )}
            </div>
            <p className='text-gray-800 mt-4'>
              <span className='font-semibold text-black'>Description - </span>
              {listing.description}
            </p>
            <ul className='text-green-900 font-semibold text-sm flex flex-wrap items-center gap-4 sm:gap-6 mt-3'>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaBed className='text-lg' />
                {listing.bedrooms} {listing.bedrooms > 1 ? 'beds' : 'bed'}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaBath className='text-lg' />
                {listing.bathrooms} {listing.bathrooms > 1 ? 'baths' : 'bath'}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaParking className='text-lg' />
                {listing.parking ? 'Parking spot' : 'No Parking'}
              </li>
              <li className='flex items-center gap-1 whitespace-nowrap'>
                <FaChair className='text-lg' />
                {listing.furnished ? 'Furnished' : 'Unfurnished'}
              </li>
            </ul>
            {currentUser && listing.userRef !== currentUser._id && !contact && (
              <button
                onClick={() => setContact(true)}
                className='mt-4 bg-blue-600 text-white rounded-lg uppercase hover:bg-blue-500 transition p-3'
              >
                Contact landlord
              </button>
            )}
            {contact && <Contact listing={listing} />}
          </div>
        </div>
      )}
    </main>
  );
}
