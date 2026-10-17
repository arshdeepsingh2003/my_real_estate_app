import { useEffect } from 'react';
import { useAuth, useUser } from '@clerk/clerk-react';
import { useDispatch, useSelector } from 'react-redux';
import { signInSuccess, signOutUserSuccess } from '../redux/user/userSlice';

export default function ClerkUserSync({ children }) {
  const { isLoaded, isSignedIn, getToken } = useAuth();
  const { user } = useUser();
  const dispatch = useDispatch();
  const { currentUser } = useSelector((state) => state.user);

  useEffect(() => {
    // Intercept window.fetch to inject Clerk token automatically
    const originalFetch = window.fetch;
    window.fetch = async (input, init) => {
      const url = typeof input === 'string' ? input : input.url;
      if (url && url.startsWith('/api/') && !url.startsWith('/api/auth/signin') && !url.startsWith('/api/auth/signup')) {
        try {
          const token = await getToken();
          if (token) {
            init = init || {};
            const headers = new Headers(init.headers || {});
            if (!headers.has('Authorization')) {
              headers.set('Authorization', `Bearer ${token}`);
            }
            init.headers = headers;
          }
        } catch (error) {
          console.error('Error fetching Clerk token for API interceptor:', error);
        }
      }
      return originalFetch(input, init);
    };

    return () => {
      window.fetch = originalFetch; // restore original fetch
    };
  }, [getToken]);

  useEffect(() => {
    const syncUser = async () => {
      if (!isLoaded) return;

      if (isSignedIn && user) {
        // Sync with MongoDB if Redux currentUser is missing or has a different clerkId
        if (!currentUser || currentUser.clerkId !== user.id) {
          try {
            const token = await getToken();
            const res = await fetch('/api/auth/clerk-sync', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
            });
            if (res.ok) {
              const data = await res.json();
              dispatch(signInSuccess(data));
            } else {
              const data = await res.json().catch(() => null);
              const message = typeof data?.message === 'string'
                ? data.message
                : 'Your account was created, but we could not finish setting up your profile. Please contact support.';
              window.dispatchEvent(new CustomEvent('auth-sync-error', { detail: message }));
              console.error('Failed to sync Clerk session with MongoDB database.');
            }
          } catch (error) {
            console.error('Error syncing user with backend:', error);
          }
        }
      } else {
        // If logged out from Clerk, clear Redux state
        if (currentUser) {
          dispatch(signOutUserSuccess());
        }
      }
    };

    syncUser();
  }, [isLoaded, isSignedIn, user, currentUser, dispatch, getToken]);

  return children;
}
