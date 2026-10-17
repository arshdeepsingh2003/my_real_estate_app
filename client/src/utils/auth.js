export const PASSWORD_REQUIREMENTS = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

const isNetworkError = (error) =>
  error instanceof TypeError || /failed to fetch|network|load failed/i.test(String(error?.message || ''));

export function getSignUpErrorMessage(error) {
  if (isNetworkError(error)) return 'Unable to connect. Check your internet connection and try again.';

  const clerkError = Array.isArray(error?.errors) ? error.errors[0] : null;
  const code = String(clerkError?.code || error?.code || '').toLowerCase();
  const message = [clerkError?.longMessage, clerkError?.message, error?.message]
    .find((value) => typeof value === 'string' && value.trim());

  if (/username.*(taken|exist|already)|(?:taken|exist|already).*username/.test(code)) {
    return 'Username already exists. Please choose another username.';
  }
  if (message && /username.*(taken|exist|already)|(?:taken|exist|already).*username/i.test(message)) {
    return 'Username already exists. Please choose another username.';
  }
  if (Number(error?.status || clerkError?.status) >= 500 || !message || /is unknown|unknown error|internal server error/i.test(message.trim())) {
    return 'Unable to create your account right now. Please try again later.';
  }
  if (message === '[object Object]' || message === 'undefined' || message === 'null') {
    return 'Unable to create your account. Please check your details and try again.';
  }
  return message;
}

export function getSignInErrorMessage(error) {
  if (isNetworkError(error)) return 'Unable to connect. Check your internet connection and try again.';

  const clerkError = Array.isArray(error?.errors) ? error.errors[0] : null;
  const code = String(clerkError?.code || error?.code || '').toLowerCase();
  if (/password_incorrect|identifier_not_found|form_identifier_not_found|form_password_incorrect|invalid_credentials/.test(code)) {
    return 'Incorrect email or password.';
  }

  const message = [clerkError?.longMessage, clerkError?.message, error?.message]
    .find((value) => typeof value === 'string' && value.trim());
  if (message && /incorrect|invalid credentials|wrong password|identifier.*not found/i.test(message)) {
    return 'Incorrect email or password.';
  }
  if (Number(error?.status || clerkError?.status) >= 500 || !message || /is unknown|unknown error|internal server error/i.test(message.trim())) {
    return 'Unable to sign in right now. Please try again later.';
  }
  if (message === '[object Object]' || message === 'undefined' || message === 'null') {
    return 'Incorrect email or password.';
  }
  return message;
}
