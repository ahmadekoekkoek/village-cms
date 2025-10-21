import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
const prisma = new PrismaClient();
async function main(){
  const hashed = await bcrypt.hash('password', 10);
  await prisma.user.upsert({
    where: { email: 'admin@local' },
    update: {},
    create: { email: 'admin@local', password: hashed, name: 'Admin', role: 'ADMIN' }
  });
  console.log('seed done');
}
main().catch(e=>{console.error(e);process.exit(1);}).finally(()=>prisma.$disconnect());
