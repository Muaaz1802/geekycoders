/**
 * Entry point for the Resume Builder API.
 * Uses Supabase (PostgreSQL + Storage); no MongoDB.
 */
require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} on port ${PORT}`);
});
