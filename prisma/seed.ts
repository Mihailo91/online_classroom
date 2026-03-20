import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clean existing data (optional - comment out if you want to preserve data)
  // await prisma.$executeRaw`TRUNCATE TABLE users CASCADE`;

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@example.com',
      passwordHash: adminPassword,
      name: 'Admin User',
      role: 'admin',
    },
  });
  console.log('✅ Admin user created:', admin.email);

  // Create Professor Users
  const professorPassword = await bcrypt.hash('professor123', 10);
  const professor1 = await prisma.user.create({
    data: {
      email: 'professor1@example.com',
      passwordHash: professorPassword,
      name: 'Maria Garcia',
      role: 'professor',
    },
  });

  const professor2 = await prisma.user.create({
    data: {
      email: 'professor2@example.com',
      passwordHash: professorPassword,
      name: 'John Smith',
      role: 'professor',
    },
  });
  console.log('✅ Professors created:', professor1.name, professor2.name);

  // Create Student Users
  const studentPassword = await bcrypt.hash('student123', 10);
  const student1 = await prisma.user.create({
    data: {
      email: 'student1@example.com',
      passwordHash: studentPassword,
      name: 'Alice Johnson',
      role: 'student',
    },
  });

  const student2 = await prisma.user.create({
    data: {
      email: 'student2@example.com',
      passwordHash: studentPassword,
      name: 'Bob Wilson',
      role: 'student',
    },
  });
  console.log('✅ Students created:', student1.name, student2.name);

  // Create Packages
  const singleClass = await prisma.package.create({
    data: {
      name: 'Single Class',
      lessonCount: 1,
      validityDays: null,
      isActive: true,
    },
  });

  const starterPack = await prisma.package.create({
    data: {
      name: 'Starter Pack',
      lessonCount: 4,
      validityDays: 30,
      isActive: true,
    },
  });

  const standardPack = await prisma.package.create({
    data: {
      name: 'Standard Pack',
      lessonCount: 8,
      validityDays: 60,
      isActive: true,
    },
  });

  const premiumPack = await prisma.package.create({
    data: {
      name: 'Premium Pack',
      lessonCount: 12,
      validityDays: 90,
      isActive: true,
    },
  });
  console.log('✅ Packages created: Single, Starter, Standard, Premium');

  // Create Professor Pricing for Professor 1
  await prisma.professorPricing.createMany({
    data: [
      { professorId: professor1.id, packageId: singleClass.id, price: 25.00, currency: 'EUR' },
      { professorId: professor1.id, packageId: starterPack.id, price: 90.00, currency: 'EUR' },
      { professorId: professor1.id, packageId: standardPack.id, price: 170.00, currency: 'EUR' },
      { professorId: professor1.id, packageId: premiumPack.id, price: 240.00, currency: 'EUR' },
    ],
  });

  // Create Professor Pricing for Professor 2
  await prisma.professorPricing.createMany({
    data: [
      { professorId: professor2.id, packageId: singleClass.id, price: 30.00, currency: 'EUR' },
      { professorId: professor2.id, packageId: starterPack.id, price: 110.00, currency: 'EUR' },
      { professorId: professor2.id, packageId: standardPack.id, price: 200.00, currency: 'EUR' },
      { professorId: professor2.id, packageId: premiumPack.id, price: 280.00, currency: 'EUR' },
    ],
  });
  console.log('✅ Professor pricing configured');

  // Create Sample Video Course
  const course = await prisma.videoCourse.create({
    data: {
      title: 'Spanish for Beginners',
      description: 'A comprehensive introduction to Spanish language.',
      language: 'Spanish',
      level: 'beginner',
      price: 49.99,
      currency: 'EUR',
      createdBy: admin.id,
      isPublished: true,
    },
  });

  // Create Course Modules (using placeholder Vimeo IDs)
  await prisma.courseModule.createMany({
    data: [
      {
        courseId: course.id,
        title: 'Introduction & Greetings',
        orderIndex: 1,
        vimeoVideoId: '123456789',
        vimeoUrl: 'https://vimeo.com/123456789',
        durationSec: 600,
      },
      {
        courseId: course.id,
        title: 'Basic Vocabulary',
        orderIndex: 2,
        vimeoVideoId: '987654321',
        vimeoUrl: 'https://vimeo.com/987654321',
        durationSec: 900,
      },
    ],
  });
  console.log('✅ Sample video course created');

  console.log('🎉 Database seeded successfully!');
  console.log('\n📝 Test Credentials:');
  console.log('Admin: admin@example.com / admin123');
  console.log('Professor 1: professor1@example.com / professor123');
  console.log('Professor 2: professor2@example.com / professor123');
  console.log('Student 1: student1@example.com / student123');
  console.log('Student 2: student2@example.com / student123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
