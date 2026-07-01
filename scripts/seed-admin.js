const { initializeApp, cert } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');
const readline = require('readline');

// Load the service account key
let serviceAccount;
try {
  serviceAccount = require('../serviceAccountKey.json');
} catch (e) {
  console.error('\n❌ ERROR: serviceAccountKey.json not found in the root directory.');
  console.log('Please download it from Firebase Console → Project Settings → Service Accounts → Generate new private key.\n');
  process.exit(1);
}

// Initialize firebase-admin with modular API (v11+)
initializeApp({
  credential: cert(serviceAccount)
});

const db = getFirestore();
const auth = getAuth();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('\n--- TrendyTrades Admin Seeder ---\n');

rl.question('Enter admin email address: ', (email) => {
  rl.question('Enter a strong password (min 6 chars): ', (password) => {
    rl.question('Enter display name (e.g. Super Admin): ', async (displayName) => {
      try {
        console.log('\nCreating user in Firebase Auth...');
        const userRecord = await auth.createUser({
          email,
          password,
          displayName,
          emailVerified: true,
        });

        console.log('✅ Auth user created! UID:', userRecord.uid);
        console.log('Creating Firestore profile with admin role...');

        await db.collection('users').doc(userRecord.uid).set({
          email,
          displayName,
          role: 'admin',
          balance: 0,
          tradingProfit: 0,
          kycVerified: true,
          kycStatus: 'approved',
          createdAt: new Date(),
        });

        console.log('\n✅ SUCCESS! Admin user seeded.');
        console.log(`   Email   : ${email}`);
        console.log(`   UID     : ${userRecord.uid}`);
        console.log('\nYou can now log in at /auth/login and access the /admin panel.\n');
      } catch (error) {
        if (error.code === 'auth/email-already-exists') {
          console.error('\n❌ ERROR: A user with this email already exists.');
          console.log('Try a different email or delete the existing user in Firebase Console → Authentication.\n');
        } else {
          console.error('\n❌ ERROR:', error.message);
        }
      } finally {
        rl.close();
        process.exit(0);
      }
    });
  });
});
