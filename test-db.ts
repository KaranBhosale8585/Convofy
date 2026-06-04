import { PrismaClient } from './src/generated/prisma';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Testing database connection...');
    console.log('DB_URL:', process.env.DB_URL ? 'Defined' : 'Not Defined');
    const users = await prisma.user.findMany({ take: 1 });
    console.log('Connection successful, users found:', users.length);
    const posts = await prisma.post.findMany({ take: 1 });
    console.log('Posts fetch successful, posts found:', posts.length);
  } catch (error) {
    console.error('Database connection failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
