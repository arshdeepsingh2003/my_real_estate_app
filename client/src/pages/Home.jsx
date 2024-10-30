import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation } from 'swiper/modules';
import SwiperCore from 'swiper';
import 'swiper/css/bundle';
import ListingItem from '../components/ListingItem';

export default function Home() {
  const [offerListings, setOfferListings] = useState([]);
  const [saleListings, setSaleListings] = useState([]);
  const [rentListings, setRentListings] = useState([]);
  SwiperCore.use([Navigation]);

  useEffect(() => {
    const fetchOfferListings = async () => {
      try {
        const res = await fetch('/api/listing/get?offer=true&limit=4');
        const data = await res.json();
        setOfferListings(data);
        fetchRentListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchRentListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=rent&limit=4');
        const data = await res.json();
        setRentListings(data);
        fetchSaleListings();
      } catch (error) {
        console.log(error);
      }
    };

    const fetchSaleListings = async () => {
      try {
        const res = await fetch('/api/listing/get?type=sale&limit=4');
        const data = await res.json();
        setSaleListings(data);
      } catch (error) {
        console.log(error);
      }
    };

    fetchOfferListings();
  }, []);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Top section */}
      <div className="flex flex-col items-center gap-4 py-16 px-6 max-w-6xl mx-auto text-center">
        <h1 className="text-slate-800 font-bold text-4xl lg:text-6xl text-shadow-lg">
          Find your next <span className="text-blue-600">perfect</span> place
        </h1>
        <p className="text-gray-500 text-sm sm:text-lg max-w-lg">
          My_Estate is the best place to find your next home. Explore our wide range of properties
          for rent and sale, tailored to your preferences.
        </p>
        <Link
          to="/search"
          className="text-sm sm:text-base text-white font-bold bg-blue-600 px-6 py-2 rounded-full shadow-lg transition-transform hover:scale-105"
        >
          Let’s get started
        </Link>
      </div>

      {/* Swiper section */}
      <div className="mb-10">
        <Swiper navigation>
          {offerListings.map((listing) => (
            <SwiperSlide key={listing._id}>
              <div
                style={{
                  background: `url(${listing.imageUrls[0]}) center no-repeat`,
                  backgroundSize: 'cover',
                }}
                className="h-[300px] sm:h-[400px] md:h-[500px] rounded-lg shadow-md overflow-hidden transition-transform transform hover:scale-105"
              />
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {/* Listing results for offer, sale, and rent */}
      <div className="max-w-6xl mx-auto p-3 flex flex-col gap-12 my-10">
        {offerListings && offerListings.length > 0 && (
          <div>
            <div className="my-5 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 underline decoration-blue-500 decoration-2 underline-offset-4 shadow-lg">
                Recent Offers
              </h2>
              <Link className="text-sm text-blue-600 hover:text-blue-800 hover:underline" to={'/search?offer=true'}>
                Show more offers
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {offerListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {rentListings && rentListings.length > 0 && (
          <div>
            <div className="my-5 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 underline decoration-blue-500 decoration-2 underline-offset-4 shadow-lg">
                Recent Places for Rent
              </h2>
              <Link className="text-sm text-blue-600 hover:text-blue-800 hover:underline" to={'/search?type=rent'}>
                Show more
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {rentListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
        {saleListings && saleListings.length > 0 && (
          <div>
            <div className=" my-5 flex items-center justify-between">
              <h2 className="text-2xl sm:text-3xl font-bold text-slate-800 underline decoration-blue-500 decoration-2 underline-offset-4 shadow-lg">
                Recent Places for Sale
              </h2>
              <Link className="text-sm text-blue-600 hover:text-blue-800 hover:underline" to={'/search?type=sale'}>
                Show more
              </Link>
            </div>
            <div className="flex flex-wrap gap-4">
              {saleListings.map((listing) => (
                <ListingItem listing={listing} key={listing._id} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
