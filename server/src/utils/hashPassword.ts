/**
 * Utility script to generate a bcrypt hash for the admin password.
 * Usage: npx tsx server/src/utils/hashPassword.ts "yourpassword"
 * Then paste the output into server/.env as ADMIN_PASSWORD_HASH=<hash>
 */
import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npx tsx server/src/utils/hashPassword.ts "yourpassword"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log('Password hash:');
  console.log(hash);
  console.log('\nAdd to server/.env:');
  console.log(`ADMIN_PASSWORD_HASH=${hash}`);
});
