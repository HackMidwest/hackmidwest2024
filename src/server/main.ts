import express from 'express';

const app = express();
const port = 4000;

// Define a simple Hello World endpoint
app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Start the server
app.listen(port, () => {
  console.log(`App is listening at http://localhost:${port}`);
});
