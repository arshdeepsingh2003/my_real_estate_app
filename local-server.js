import app from './server/app.js';

const port = Number(process.env.PORT) || 3000;

app.listen(port, () => {
  console.log(`API server is listening on port ${port}.`);
});
