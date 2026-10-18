import app from '../server/app.js';

export default function handler(req, res) {
  const requestUrl = new URL(req.url || '/', 'http://localhost');
  const apiPath = requestUrl.searchParams.get('__path');

  if (apiPath !== null) {
    requestUrl.searchParams.delete('__path');
    const query = requestUrl.searchParams.toString();
    req.url = `/api/${apiPath}${query ? `?${query}` : ''}`;
  }

  return app(req, res);
}
