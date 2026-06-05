import { hashPassword } from '../security.js';

const password = process.argv[2];

if (!password) {
  console.error('Usage: tsx server/src/scripts/hashAdminPassword.ts "your-password"');
  process.exit(1);
}

console.log(hashPassword(password));
