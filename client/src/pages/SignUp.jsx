import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useSignUp } from '@clerk/clerk-react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import OAuth from '../components/OAuth';
import { getSignUpErrorMessage, PASSWORD_REQUIREMENTS } from '../utils/auth';

const SignUp = () => {
  const { isLoaded, signUp, setActive } = useSignUp();
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: ''
  });
  const [pendingVerification, setPendingVerification] = useState(false);
  const [verificationDeadline, setVerificationDeadline] = useState(null);
  const [secondsRemaining, setSecondsRemaining] = useState(60);
  const [verificationExpired, setVerificationExpired] = useState(false);
  const [registrationComplete, setRegistrationComplete] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [success, setSuccess] = useState('');
  const [syncError, setSyncError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const getVerificationErrorMessage = (verificationError) => {
    const clerkError = Array.isArray(verificationError?.errors) ? verificationError.errors[0] : null;
    const code = String(clerkError?.code || verificationError?.code || '').toLowerCase();
    const message = [clerkError?.longMessage, clerkError?.message, verificationError?.message]
      .filter((value) => typeof value === 'string')
      .join(' ');
    const details = `${code} ${message}`.toLowerCase();

    if (/expired|timeout|timed out/.test(details)) {
      setVerificationExpired(true);
      return 'This verification code has expired. Please resend a new code to continue.';
    }
    if (/code.*(incorrect|invalid|wrong)|(incorrect|invalid|wrong).*code|verification_failed|form_code_incorrect/.test(details)) {
      return 'That verification code is incorrect. Please check the code and try again.';
    }
    return getSignUpErrorMessage(verificationError);
  };

  useEffect(() => {
    const handleSyncError = (event) => {
      if (typeof event.detail === 'string') setSyncError(event.detail);
    };
    window.addEventListener('auth-sync-error', handleSyncError);
    return () => window.removeEventListener('auth-sync-error', handleSyncError);
  }, []);

  useEffect(() => {
    if (!verificationDeadline) return undefined;

    const updateCountdown = () => {
      const remaining = Math.max(0, Math.ceil((verificationDeadline - Date.now()) / 1000));
      setSecondsRemaining(remaining);
      if (remaining === 0) setVerificationExpired(true);
    };

    updateCountdown();
    const timerId = window.setInterval(updateCountdown, 250);
    return () => window.clearInterval(timerId);
  }, [verificationDeadline]);

  const startVerificationTimer = () => {
    setVerificationDeadline(Date.now() + 60_000);
    setSecondsRemaining(60);
    setVerificationExpired(false);
  };

  const handleChange = (e) => {
    if (e.target.id === 'username') setUsernameError('');
    setError('');
    setSuccess('');
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    const username = formData.username.trim();
    if (!PASSWORD_REQUIREMENTS.test(formData.password)) {
      setError('Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setUsernameError('');
      setSuccess('');
      setSyncError('');

      let validationResponse;
      try {
        validationResponse = await fetch('/api/auth/validate-signup', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password: formData.password }),
        });
      } catch {
        throw new Error('Unable to connect to the server. Check your internet connection and try again.');
      }

      let validationData;
      try {
        validationData = await validationResponse.json();
      } catch {
        throw new Error('Signup service returned an unexpected response. Check that the API function is deployed, then open /api/health to verify it.');
      }
      if (!validationResponse.ok) {
        const validationMessage = typeof validationData?.message === 'string' ? validationData.message : '';
        if (validationResponse.status >= 500) {
          throw new Error('Unable to create your account right now. Please try again later.');
        }
        if (validationMessage.includes('Password must')) {
          throw new Error(validationMessage);
        }
        throw new Error(validationMessage || 'Unable to validate your username. Please try again.');
      }
      if (typeof validationData?.available !== 'boolean') {
        throw new Error('Signup service returned an invalid response. Check the API server logs and try again.');
      }
      if (!validationData.available) {
        setUsernameError('Username already exists. Please choose another username.');
        return;
      }

      const result = await signUp.create({
        emailAddress: formData.email,
        password: formData.password,
        unsafeMetadata: { username },
      });

      if (result.status === 'missing_requirements' && result.unverifiedFields.includes('email_address')) {
        await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
        setPendingVerification(true);
        startVerificationTimer();
        setSuccess('Account details accepted. Check your email for the verification code.');
      } else if (result.status === 'complete') {
        await setActive({ session: result.createdSessionId });
        setSuccess('Your account was created successfully.');
        setRegistrationComplete(true);
      } else {
        console.warn('Sign-up status incomplete:', result.status);
        setError('Verification or additional steps required.');
      }
    } catch (err) {
      console.error(err);
      const message = getSignUpErrorMessage(err);
      if (message === 'Username already exists. Please choose another username.') {
        setUsernameError(message);
      } else {
        setError(message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifySubmit = async (e) => {
    e.preventDefault();
    if (!isLoaded) return;
    if (verificationExpired || !verificationDeadline || Date.now() >= verificationDeadline) {
      setSecondsRemaining(0);
      setVerificationExpired(true);
      setError('This verification code has expired. Please resend a new code to continue.');
      return;
    }
    try {
      setLoading(true);
      setError('');
      setSuccess('');

      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code: verificationCode,
      });

      if (completeSignUp.status === 'complete') {
        await setActive({ session: completeSignUp.createdSessionId });
        setSuccess('Your account was created successfully.');
        setRegistrationComplete(true);
      } else {
        console.warn('Verification incomplete status:', completeSignUp.status);
        setError('Verification failed. Please try again.');
      }
    } catch (err) {
      console.error(err);
      setError(getVerificationErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!isLoaded || loading) return;
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      await signUp.prepareEmailAddressVerification({ strategy: 'email_code' });
      setVerificationCode('');
      startVerificationTimer();
      setSuccess('A new verification code has been sent.');
    } catch (err) {
      console.error(err);
      setError(getSignUpErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  if (registrationComplete) {
    return (
      <div className="flex items-center justify-center mt-6 bg-gray-100">
        <div className="bg-blue-50 shadow-md rounded-lg p-6 w-full max-w-md text-center">
          <h1 className="text-3xl font-bold mb-4 text-blue-700">Account Created</h1>
          {syncError
            ? <p className="text-red-600 mb-5" role="alert">{syncError}</p>
            : <p className="text-green-700 mb-5" role="status">{success}</p>}
          <Link to="/" className="inline-block bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-500 transition-colors duration-200">Continue</Link>
        </div>
      </div>
    );
  }

  if (pendingVerification) {
    return (
      <div className="flex items-center justify-center mt-6 bg-gray-100">
        <div className="bg-blue-50 shadow-md rounded-lg p-6 w-full max-w-md">
          <h1 className="text-3xl text-center font-bold mb-4 text-blue-700">Verify Email</h1>
          <form onSubmit={handleVerifySubmit} className="flex flex-col gap-4">
            <p className="text-center text-gray-600">Please enter the 6-digit verification code sent to your email.</p>
            <p className="text-center text-sm text-gray-600" role="timer" aria-live="off">
              {verificationExpired
                ? secondsRemaining > 0
                  ? `Your verification code has expired. Please resend a new code when the timer reaches ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}.`
                  : 'Your verification code has expired. Please resend a new code to continue.'
                : `Enter the code within 1 minute: ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}`}
            </p>
            {success && <p className="text-green-700 text-center" role="status">{success}</p>}
            <input 
              type="text" 
              placeholder="Verification Code" 
              className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
              id="verificationCode" 
              value={verificationCode} 
              onChange={(e) => setVerificationCode(e.target.value)} 
              required
            />
            <button 
              disabled={loading || verificationExpired || secondsRemaining === 0}
              className="bg-blue-600 text-white p-3 rounded-lg uppercase hover:bg-blue-500 disabled:opacity-80 transition"
            >
              {loading ? 'Verifying...' : 'Verify'}
            </button>
          </form>
          <button
            type="button"
            onClick={handleResendVerification}
            disabled={loading || secondsRemaining > 0}
            className={`w-full mt-3 text-blue-700 hover:underline disabled:text-gray-400 disabled:no-underline ${secondsRemaining === 0 && !loading ? 'animate-pulse font-semibold' : ''}`}
          >
            {loading
              ? 'Sending...'
              : secondsRemaining > 0
                ? `Resend code in ${String(Math.floor(secondsRemaining / 60)).padStart(2, '0')}:${String(secondsRemaining % 60).padStart(2, '0')}`
                : 'Resend verification code'}
          </button>
          {error && <p className="text-red-500 mt-5 text-center">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center mt-6 bg-gray-100"> {/* Full screen height and light background */}
      <div className="bg-blue-50 shadow-md rounded-lg p-6 w-full max-w-md"> {/* Light blue background for the card */}
        <h1 className="text-3xl text-center font-bold mb-4 text-blue-700">Sign Up</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input 
            type="text" 
            placeholder="Username" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="username" 
            value={formData.username} 
            onChange={handleChange} 
            required
          />
          {usernameError && <p className="-mt-3 text-sm text-red-600" role="alert">{usernameError}</p>}
          <input 
            type="email" 
            placeholder="Email" 
            className="border p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400" 
            id="email" 
            value={formData.email} 
            onChange={handleChange} 
            required
          />
          <div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Password"
                className="w-full border p-3 pr-11 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                id="password"
                value={formData.password}
                onChange={handleChange}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                aria-pressed={showPassword}
              >
                {showPassword ? <FaEyeSlash aria-hidden="true" /> : <FaEye aria-hidden="true" />}
              </button>
            </div>
            <p className="mt-2 text-xs text-gray-600">Password must be at least 6 characters and include uppercase, lowercase, a number, and a special character.</p>
            {formData.password && !PASSWORD_REQUIREMENTS.test(formData.password) && <p className="mt-1 text-sm text-red-600" role="alert">Password does not meet these requirements.</p>}
          </div>
          <button 
            disabled={loading || !isLoaded} 
            className="bg-slate-700 text-white p-3 rounded-lg uppercase hover:bg-slate-600 disabled:opacity-80 transition"
          >
            {loading ? 'Loading...' : 'Sign Up'}
          </button>
          <OAuth />
        </form>
        <div className="flex gap-2 mt-5">
          <p>Have an Account?</p>
          <Link to="/sign-in">
            <span className="text-blue-800 hover:underline">Sign In</span> {/* Added underline on hover */}
          </Link>
        </div>
        {success && <p className="text-green-700 mt-5 text-center" role="status">{success}</p>}
        {error && <p className="text-red-600 mt-5 text-center" role="alert">{error}</p>}
      </div>
    </div>
  );
};

export default SignUp;
