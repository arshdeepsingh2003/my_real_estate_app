
const Footer = () => {
  return (
    <footer className="bg-blue-900 text-white text-center py-6">
      <div className="max-w-4xl mx-auto px-4">
        <p className="text-lg font-semibold text-blue-300">My Real Estate App</p>
        <p className="text-sm text-blue-200 mt-1">
          Helping you find your dream home with ease.
        </p>
        <p className="text-xs text-blue-100 mt-3">
          © {new Date().getFullYear()} My Real Estate App. All rights reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
