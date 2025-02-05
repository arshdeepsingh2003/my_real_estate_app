import { useEffect, useState } from 'react';
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from 'firebase/storage';
import { app } from '../firebase';
import { useSelector } from 'react-redux';
import { useNavigate, useParams } from 'react-router-dom';

export default function CreateListing() {
  const { currentUser } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const params = useParams();
  const [files, setFiles] = useState([]);
  const [formData, setFormData] = useState({
    imageUrls: [],
    name: '',
    description: '',
    address: '',
    type: 'rent',
    bedrooms: 1,
    bathrooms: 1,
    regularPrice: 50,
    discountPrice: 0,
    offer: false,
    parking: false,
    furnished: false,
  });
  const [imageUploadError, setImageUploadError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      const listingId = params.listingId;
      const res = await fetch(`/api/listing/get/${listingId}`);
      const data = await res.json();
      if (data.success === false) {
        console.log(data.message);
        return;
      }
      setFormData(data);
    };

    fetchListing();
  }, [params.listingId]);

  const handleImageSubmit = (e) => {
    if (files.length > 0 && files.length + formData.imageUrls.length < 7) {
      setUploading(true);
      setImageUploadError(false);
      const promises = [];

      for (let i = 0; i < files.length; i++) {
        promises.push(storeImage(files[i]));
      }
      Promise.all(promises)
        .then((urls) => {
          setFormData({
            ...formData,
            imageUrls: formData.imageUrls.concat(urls),
          });
          setImageUploadError(false);
          setUploading(false);
        })
        .catch((err) => {
          setImageUploadError('Image upload failed (2 mb max per image)');
          setUploading(false);
        });
    } else {
      setImageUploadError('You can only upload 6 images per listing');
      setUploading(false);
    }
  };

  const storeImage = async (file) => {
    return new Promise((resolve, reject) => {
      const storage = getStorage(app);
      const fileName = new Date().getTime() + file.name;
      const storageRef = ref(storage, fileName);
      const uploadTask = uploadBytesResumable(storageRef, file);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress =
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log(`Upload is ${progress}% done`);
        },
        (error) => {
          reject(error);
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            resolve(downloadURL);
          });
        }
      );
    });
  };

  const handleRemoveImage = (index) => {
    setFormData({
      ...formData,
      imageUrls: formData.imageUrls.filter((_, i) => i !== index),
    });
  };

  const handleChange = (e) => {
    if (e.target.name === 'propertyType') {
      setFormData({
        ...formData,
        type: e.target.id,
      });
    }

    if (
      e.target.id === 'parking' ||
      e.target.id === 'furnished' ||
      e.target.id === 'offer'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.checked,
      });
    }

    if (
      e.target.type === 'number' ||
      e.target.type === 'text' ||
      e.target.type === 'textarea'
    ) {
      setFormData({
        ...formData,
        [e.target.id]: e.target.value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (formData.imageUrls.length < 1)
        return setError('You must upload at least one image');
      if (+formData.regularPrice < +formData.discountPrice)
        return setError('Discount price must be lower than regular price');
      setLoading(true);
      setError(false);
      const res = await fetch(`/api/listing/update/${params.listingId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          userRef: currentUser._id,
        }),
      });
      const data = await res.json();
      setLoading(false);
      if (data.success === false) {
        setError(data.message);
      }
      navigate(`/listing/${data._id}`);
    } catch (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <main className='p-5 max-w-4xl mx-auto bg-white shadow-md rounded-lg'>
      <h1 className='text-4xl font-bold text-center text-blue-600 my-6'>
        Update a Listing
      </h1>
      <form onSubmit={handleSubmit} className='flex flex-col sm:flex-row gap-4'>
        <div className='flex flex-col gap-4 flex-1'>
          <input
            type='text'
            placeholder='Name'
            className='border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            id='name'
            maxLength='62'
            minLength='10'
            required
            onChange={handleChange}
            value={formData.name}
          />
          <textarea
            placeholder='Description'
            className='border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            id='description'
            required
            onChange={handleChange}
            value={formData.description}
          />
          <input
            type='text'
            placeholder='Address'
            className='border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
            id='address'
            required
            onChange={handleChange}
            value={formData.address}
          />
          <div className='flex gap-6 flex-wrap'>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id='sale'
                name='propertyType'
                className='w-5 h-5'
                onChange={handleChange}
                checked={formData.type === 'sale'}
              />
              <span className='text-gray-700'>Sale</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='radio'
                id='rent'
                name='propertyType'
                className='w-5 h-5'
                onChange={handleChange}
                checked={formData.type === 'rent'}
              />
              <span className='text-gray-700'>Rent</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='parking'
                className='w-5 h-5'
                onChange={handleChange}
                checked={formData.parking}
              />
              <span className='text-gray-700'>Parking</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='furnished'
                className='w-5 h-5'
                onChange={handleChange}
                checked={formData.furnished}
              />
              <span className='text-gray-700'>Furnished</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='checkbox'
                id='offer'
                className='w-5 h-5'
                onChange={handleChange}
                checked={formData.offer}
              />
              <span className='text-gray-700'>Offer</span>
            </div>
          </div>
          <div className='flex flex-wrap gap-6'>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bedrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={handleChange}
                value={formData.bedrooms}
              />
              <span className='text-gray-700'>Beds</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='bathrooms'
                min='1'
                max='10'
                required
                className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={handleChange}
                value={formData.bathrooms}
              />
              <span className='text-gray-700'>Baths</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='regularPrice'
                required
                min='50'
                className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={handleChange}
                value={formData.regularPrice}
              />
              <span className='text-gray-700'>Regular Price</span>
            </div>
            <div className='flex items-center gap-2'>
              <input
                type='number'
                id='discountPrice'
                min='0'
                className='p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500'
                onChange={handleChange}
                value={formData.discountPrice}
              />
              <span className='text-gray-700'>Discount Price</span>
            </div>
          </div>
          <button
            type='submit'
            className='bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500 transition duration-300'
          >
            {loading ? 'Loading...' : 'Update Listing'}
          </button>
          {error && <p className='text-red-600'>{error}</p>}
        </div>
        <div className='flex flex-col flex-1'>
          <div className='flex flex-col gap-4'>
            {formData.imageUrls.map((url, index) => (
              <div key={index} className='relative'>
                <img
                  src={url}
                  alt='uploaded'
                  className='w-full h-64 object-cover rounded-lg'
                />
                <button
                  className='absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full'
                  onClick={() => handleRemoveImage(index)}
                >
                  X
                </button>
              </div>
            ))}
          </div>
          <input
            type='file'
            className='border border-gray-300 p-3 rounded-lg'
            onChange={(e) => setFiles(e.target.files)}
            multiple
          />
          <button
            className='bg-blue-600 text-white p-3 rounded-lg hover:bg-blue-500 transition duration-300'
            onClick={handleImageSubmit}
          >
            Upload Images
          </button>
          {uploading && <p>Uploading...</p>}
          {imageUploadError && <p className='text-red-600'>{imageUploadError}</p>}
        </div>
      </form>
    </main>
  );
}
