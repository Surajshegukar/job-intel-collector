import app from './app';
import { connectDB } from './config/db';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 5000;

async function startServer() {
  // Connect to Database
  await connectDB();

  // Start Express listener
  app.listen(PORT, () => {
    console.log(`Job Intelligence Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
}

startServer();
