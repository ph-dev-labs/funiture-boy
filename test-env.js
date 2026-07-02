require('dotenv').config({ path: '.env.local' });
console.log(process.env.FIREBASE_PRIVATE_KEY?.substring(0, 50));
