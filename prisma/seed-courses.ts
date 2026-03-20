import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCourses() {
  console.log('🌱 Seeding courses...');

  // Get admin user to set as creator
  const admin = await prisma.user.findFirst({
    where: { role: 'admin' },
  });

  if (!admin) {
    throw new Error('Admin user not found. Please run main seed first.');
  }

  // Create courses
  const spanishBeginners = await prisma.videoCourse.create({
    data: {
      title: 'Spanish for Beginners',
      description: 'Learn Spanish from scratch! This comprehensive course covers basic vocabulary, essential grammar, and everyday conversations. Perfect for travelers and language enthusiasts starting their Spanish journey.',
      thumbnailUrl: '/images/courses/spanish-beginners.jpg',
      language: 'Spanish',
      level: 'beginner',
      price: 49.99,
      currency: 'EUR',
      createdBy: admin.id,
      isPublished: true,
      modules: {
        create: [
          {
            title: 'Introduction & Spanish Alphabet',
            orderIndex: 1,
            vimeoVideoId: '76979871',
            vimeoUrl: 'https://vimeo.com/76979871',
            durationSec: 600,
            isPreview: true,
          },
          {
            title: 'Basic Greetings & Introductions',
            orderIndex: 2,
            vimeoVideoId: '123456790',
            vimeoUrl: 'https://vimeo.com/123456790',
            durationSec: 720,
          },
          {
            title: 'Numbers 1-100',
            orderIndex: 3,
            vimeoVideoId: '123456791',
            vimeoUrl: 'https://vimeo.com/123456791',
            durationSec: 540,
          },
          {
            title: 'Days, Months & Seasons',
            orderIndex: 4,
            vimeoVideoId: '123456792',
            vimeoUrl: 'https://vimeo.com/123456792',
            durationSec: 480,
          },
          {
            title: 'Colors & Common Objects',
            orderIndex: 5,
            vimeoVideoId: '123456793',
            vimeoUrl: 'https://vimeo.com/123456793',
            durationSec: 600,
          },
          {
            title: 'Present Tense Verbs',
            orderIndex: 6,
            vimeoVideoId: '123456794',
            vimeoUrl: 'https://vimeo.com/123456794',
            durationSec: 900,
          },
        ],
      },
    },
  });

  const businessEnglish = await prisma.videoCourse.create({
    data: {
      title: 'Business English Essentials',
      description: 'Master professional English for the workplace. Learn business vocabulary, email writing, presentation skills, and meeting etiquette. Ideal for professionals working in international environments.',
      thumbnailUrl: '/images/courses/business-english.jpg',
      language: 'English',
      level: 'intermediate',
      price: 79.99,
      currency: 'EUR',
      createdBy: admin.id,
      isPublished: true,
      modules: {
        create: [
          {
            title: 'Professional Email Writing',
            orderIndex: 1,
            vimeoVideoId: '22439234',
            vimeoUrl: 'https://vimeo.com/22439234',
            durationSec: 840,
            isPreview: true,
          },
          {
            title: 'Business Vocabulary & Expressions',
            orderIndex: 2,
            vimeoVideoId: '223456790',
            vimeoUrl: 'https://vimeo.com/223456790',
            durationSec: 960,
          },
          {
            title: 'Telephone Conversations',
            orderIndex: 3,
            vimeoVideoId: '223456791',
            vimeoUrl: 'https://vimeo.com/223456791',
            durationSec: 720,
          },
          {
            title: 'Presentations & Public Speaking',
            orderIndex: 4,
            vimeoVideoId: '223456792',
            vimeoUrl: 'https://vimeo.com/223456792',
            durationSec: 1080,
          },
          {
            title: 'Meeting Etiquette',
            orderIndex: 5,
            vimeoVideoId: '223456793',
            vimeoUrl: 'https://vimeo.com/223456793',
            durationSec: 780,
          },
        ],
      },
    },
  });

  const frenchConversation = await prisma.videoCourse.create({
    data: {
      title: 'French Conversation Practice',
      description: 'Improve your French speaking skills through real-world conversations. Focus on pronunciation, common phrases, and cultural nuances. Includes dialogues for restaurants, shopping, and social situations.',
      thumbnailUrl: '/images/courses/french-conversation.jpg',
      language: 'French',
      level: 'intermediate',
      price: 59.99,
      currency: 'EUR',
      createdBy: admin.id,
      isPublished: true,
      modules: {
        create: [
          {
            title: 'At the Restaurant',
            orderIndex: 1,
            vimeoVideoId: '146022717',
            vimeoUrl: 'https://vimeo.com/146022717',
            durationSec: 660,
            isPreview: true,
          },
          {
            title: 'Shopping & Bargaining',
            orderIndex: 2,
            vimeoVideoId: '323456790',
            vimeoUrl: 'https://vimeo.com/323456790',
            durationSec: 600,
          },
          {
            title: 'Travel & Directions',
            orderIndex: 3,
            vimeoVideoId: '323456791',
            vimeoUrl: 'https://vimeo.com/323456791',
            durationSec: 720,
          },
          {
            title: 'Social Conversations',
            orderIndex: 4,
            vimeoVideoId: '323456792',
            vimeoUrl: 'https://vimeo.com/323456792',
            durationSec: 840,
          },
        ],
      },
    },
  });

  const germanGrammar = await prisma.videoCourse.create({
    data: {
      title: 'German Grammar Mastery',
      description: 'Comprehensive guide to German grammar from basics to advanced concepts. Master cases, verb conjugations, sentence structure, and more. Perfect for serious learners who want a solid foundation.',
      thumbnailUrl: '/images/courses/german-grammar.jpg',
      language: 'German',
      level: 'advanced',
      price: 69.99,
      currency: 'EUR',
      createdBy: admin.id,
      isPublished: true,
      modules: {
        create: [
          {
            title: 'German Cases Explained',
            orderIndex: 1,
            vimeoVideoId: '76979871',
            vimeoUrl: 'https://vimeo.com/76979871',
            durationSec: 1200,
            isPreview: true,
          },
          {
            title: 'Verb Conjugation Patterns',
            orderIndex: 2,
            vimeoVideoId: '423456790',
            vimeoUrl: 'https://vimeo.com/423456790',
            durationSec: 1080,
          },
          {
            title: 'Word Order & Sentence Structure',
            orderIndex: 3,
            vimeoVideoId: '423456791',
            vimeoUrl: 'https://vimeo.com/423456791',
            durationSec: 960,
          },
          {
            title: 'Prepositions & Their Cases',
            orderIndex: 4,
            vimeoVideoId: '423456792',
            vimeoUrl: 'https://vimeo.com/423456792',
            durationSec: 840,
          },
          {
            title: 'Modal Verbs',
            orderIndex: 5,
            vimeoVideoId: '423456793',
            vimeoUrl: 'https://vimeo.com/423456793',
            durationSec: 720,
          },
        ],
      },
    },
  });

  console.log('✅ Created courses:');
  console.log(`  - ${spanishBeginners.title} (${spanishBeginners.language}, ${spanishBeginners.level})`);
  console.log(`  - ${businessEnglish.title} (${businessEnglish.language}, ${businessEnglish.level})`);
  console.log(`  - ${frenchConversation.title} (${frenchConversation.language}, ${frenchConversation.level})`);
  console.log(`  - ${germanGrammar.title} (${germanGrammar.language}, ${germanGrammar.level})`);
}

seedCourses()
  .catch((e) => {
    console.error('❌ Error seeding courses:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
