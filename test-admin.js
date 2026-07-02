require('dotenv').config({ path: '.env.local' });
const { initializeApp, cert } = require('firebase-admin/app');

try {
  const privateKey = process.env.FIREBASE_PRIVATE_KEY;
  console.log('Key length:', privateKey?.length);
  initializeApp({
    credential: cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      privateKey: privateKey?.replace(/\\n/g, '\n'),
    }),
  });
  console.log('Success');
} catch (e) {
  console.error('Error:', e.message);
}
