import { connectDB, disconnectDB } from './config/db';
import { Player, Team, Match } from './models/index';
import { SEED_PLAYERS, SEED_TEAMS, SEED_MATCHES } from './models/seed';

async function seed() {
  await connectDB();

  console.log('🗑️  Clearing existing data...');
  await Player.deleteMany({});
  await Team.deleteMany({});
  await Match.deleteMany({});

  console.log('🌱 Seeding players...');
  await Player.insertMany(SEED_PLAYERS);
  console.log(`   ✅ ${SEED_PLAYERS.length} players inserted`);

  console.log('🌱 Seeding teams...');
  await Team.insertMany(SEED_TEAMS);
  console.log(`   ✅ ${SEED_TEAMS.length} teams inserted`);

  console.log('🌱 Seeding matches...');
  await Match.insertMany(SEED_MATCHES);
  console.log(`   ✅ ${SEED_MATCHES.length} matches inserted`);

  console.log('\n🎉 Database seeded successfully!');
  await disconnectDB();
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
