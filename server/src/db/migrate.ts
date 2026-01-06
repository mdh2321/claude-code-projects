import { initDatabase } from './database';

try {
  initDatabase();
  console.log('Migration completed successfully');
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error);
  process.exit(1);
}
