const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

console.log('Testing connection to:', process.env.MONGO_URI);

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('SUCCESS: Connected to Atlas!');
    process.exit(0);
  })
  .catch(err => {
    console.error('FAILURE: Connection error:', err);
    process.exit(1);
  });
