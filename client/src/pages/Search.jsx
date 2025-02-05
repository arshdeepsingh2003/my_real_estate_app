import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ListingItem from '../components/ListingItem';

export default function Search() {
  const navigate = useNavigate();
  const [sidebardata, setSidebardata] = useState({
    searchTerm: '',
    type: 'all',
    parking: false,
    furnished: false,
    offer: false,
    sort: 'created_at',
    order: 'desc',
  });

  const [loading, setLoading] = useState(false);
  const [listings, setListings] = useState([]);
  const [showMore, setShowMore] = useState(false);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const searchTermFromUrl = urlParams.get('searchTerm');
    const typeFromUrl = urlParams.get('type');
    const parkingFromUrl = urlParams.get('parking');
    const furnishedFromUrl = urlParams.get('furnished');
    const offerFromUrl = urlParams.get('offer');
    const sortFromUrl = urlParams.get('sort');
    const orderFromUrl = urlParams.get('order');

    if (
      searchTermFromUrl ||
      typeFromUrl ||
      parkingFromUrl ||
      furnishedFromUrl ||
      offerFromUrl ||
      sortFromUrl ||
      orderFromUrl
    ) {
      setSidebardata({
        searchTerm: searchTermFromUrl || '',
        type: typeFromUrl || 'all',
        parking: parkingFromUrl === 'true',
        furnished: furnishedFromUrl === 'true',
        offer: offerFromUrl === 'true',
        sort: sortFromUrl || 'created_at',
        order: orderFromUrl || 'desc',
      });
    }

    const fetchListings = async () => {
      setLoading(true);
      setShowMore(false);
      const searchQuery = urlParams.toString();
      const res = await fetch(`/api/listing/get?${searchQuery}`);
      const data = await res.json();
      setShowMore(data.length > 8);
      setListings(data);
      setLoading(false);
    };

    fetchListings();
  }, [location.search]);

  const handleChange = (e) => {
    const { id, type, checked, value } = e.target;

    if (type === 'checkbox') {
      setSidebardata({ ...sidebardata, [id]: checked });
    } else if (id === 'searchTerm') {
      setSidebardata({ ...sidebardata, searchTerm: value });
    } else if (id === 'sort_order') {
      const [sort, order] = value.split('_');
      setSidebardata({ ...sidebardata, sort, order });
    } else {
      setSidebardata({ ...sidebardata, type: id });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(sidebardata);
    navigate(`/search?${urlParams}`);
  };

  const onShowMoreClick = async () => {
    const numberOfListings = listings.length;
    const urlParams = new URLSearchParams(location.search);
    urlParams.set('startIndex', numberOfListings);
    const res = await fetch(`/api/listing/get?${urlParams}`);
    const data = await res.json();
    setListings([...listings, ...data]);
    setShowMore(data.length >= 9);
  };

  return (
    <div className='flex flex-col md:flex-row bg-gray-100 mt-5'>
      <div className='p-7 border-b-2 md:border-r-2 md:min-h-screen bg-white shadow-lg rounded-lg'>
        <h2 className='text-xl font-semibold mb-4'>Search Listings</h2>
        <form onSubmit={handleSubmit} className='flex flex-col gap-6'>
          <div className='flex flex-col'>
            <label className='font-semibold'>Search Term:</label>
            <input
              type='text'
              id='searchTerm'
              placeholder='Search...'
              className='border rounded-lg p-3 w-full focus:outline-none focus:ring-2 focus:ring-green-500'
              value={sidebardata.searchTerm}
              onChange={handleChange}
            />
          </div>
          <div className='flex flex-col'>
            <span className='font-semibold'>Type:</span>
            <div className='flex gap-4'>
              {['all', 'rent', 'sale'].map((type) => (
                <div key={type} className='flex items-center'>
                  <input
                    type='radio'
                    id={type}
                    name='listingType'
                    className='hidden'
                    onChange={handleChange}
                    checked={sidebardata.type === type}
                  />
                  <label
                    className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:border-green-500'
                    htmlFor={type}
                  >
                    {sidebardata.type === type && (
                      <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                    )}
                  </label>
                  <span className='ml-2'>{type.charAt(0).toUpperCase() + type.slice(1)}</span>
                </div>
              ))}
            </div>
            <div className='flex gap-4 mt-4'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='offer'
                  className='hidden'
                  onChange={handleChange}
                  checked={sidebardata.offer}
                />
                <label
                  className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:border-green-500'
                  htmlFor='offer'
                >
                  {sidebardata.offer && (
                    <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                  )}
                </label>
                <span className='ml-2'>Offer</span>
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <span className='font-semibold'>Amenities:</span>
            <div className='flex gap-4'>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='parking'
                  className='hidden'
                  onChange={handleChange}
                  checked={sidebardata.parking}
                />
                <label
                  className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:border-green-500'
                  htmlFor='parking'
                >
                  {sidebardata.parking && (
                    <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                  )}
                </label>
                <span className='ml-2'>Parking</span>
              </div>
              <div className='flex items-center'>
                <input
                  type='checkbox'
                  id='furnished'
                  className='hidden'
                  onChange={handleChange}
                  checked={sidebardata.furnished}
                />
                <label
                  className='flex items-center justify-center w-6 h-6 rounded-full border-2 border-gray-300 cursor-pointer hover:border-green-500'
                  htmlFor='furnished'
                >
                  {sidebardata.furnished && (
                    <span className='w-3 h-3 bg-green-500 rounded-full'></span>
                  )}
                </label>
                <span className='ml-2'>Furnished</span>
              </div>
            </div>
          </div>
          <div className='flex flex-col'>
            <label className='font-semibold'>Sort:</label>
            <select
              onChange={handleChange}
              defaultValue={'created_at_desc'}
              id='sort_order'
              className='border rounded-lg p-3'
            >
              <option value='regularPrice_desc'>Price high to low</option>
              <option value='regularPrice_asc'>Price low to high</option>
              <option value='createdAt_desc'>Latest</option>
              <option value='createdAt_asc'>Oldest</option>
            </select>
          </div>
          <button className='bg-green-500 text-white p-3 rounded-lg uppercase hover:bg-green-600 transition duration-200'>
            Search
          </button>
        </form>
      </div>
      <div className='flex-1 p-5'>
        <h1 className='text-2xl font-semibold border-b p-3 text-gray-700'>
          Listing results:
        </h1>
        <div className='flex flex-wrap gap-6 mt-4'>
          {!loading && listings.length === 0 && (
            <p className='text-xl text-gray-700'>No listings found!</p>
          )}
          {loading && (
            <p className='text-xl text-gray-700 text-center w-full'>
              Loading...
            </p>
          )}
          {!loading &&
            listings.map((listing) => (
              <ListingItem key={listing._id} listing={listing} />
            ))}
          {showMore && (
            <button
              onClick={onShowMoreClick}
              className='mt-5 bg-blue-500 text-white p-3 rounded-lg'
            >
              Show More
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
