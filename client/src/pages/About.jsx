export default function About() {
  return (
    <div className='py-20 px-4 max-w-6xl mx-auto'>
      <h1 className='text-4xl font-bold mb-6 text-blue-700 transition-transform transform hover:scale-105'>
        About Sahand Estate
      </h1>
      <div className='bg-white rounded-lg shadow-lg p-6 transition-shadow duration-300 hover:shadow-xl'>
        <p className='mb-4 text-gray-800'>
          My_Estate is a leading real estate agency that specializes in helping clients buy, sell, and rent properties in the most desirable neighborhoods. Our team of experienced agents is dedicated to providing exceptional service and making the buying and selling process as smooth as possible.
        </p>
        <p className='mb-4 text-gray-800'>
          Our mission is to help our clients achieve their real estate goals by providing expert advice, personalized service, and a deep understanding of the local market. Whether you are looking to buy, sell, or rent a property, we are here to help you every step of the way.
        </p>
        <p className='mb-4 text-gray-800'>
          Our team of agents has a wealth of experience and knowledge in the real estate industry, and we are committed to providing the highest level of service to our clients. We believe that buying or selling a property should be an exciting and rewarding experience, and we are dedicated to making that a reality for each and every one of our clients.
        </p>
      </div>
      <style jsx>{`
        h1:hover {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </div>
  );
}
