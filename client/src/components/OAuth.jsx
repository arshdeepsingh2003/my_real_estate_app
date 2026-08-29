import { useSignIn } from '@clerk/clerk-react';

export default function OAuth() {
  const { isLoaded, signIn } = useSignIn();

  const handleGoogleClick = async () => {
    if (!isLoaded) return;
    try {
      await signIn.authenticateWithRedirect({
        strategy: 'oauth_google',
        redirectUrl: '/sso-callback',
        redirectUrlComplete: '/',
      });
    } catch (error) {
      console.error('Could not sign in with Google through Clerk:', error);
    }
  };

  return (
    <button
      onClick={handleGoogleClick}
      type='button'
      className='bg-red-700 text-white p-3 rounded-lg uppercase hover:opacity-95'
    >
      Continue with google
    </button>
  );
}
