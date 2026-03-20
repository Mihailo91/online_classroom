# Prisma Database Setup

## Overview
This project uses Prisma ORM with PostgreSQL for the Online Language School Platform.

## Prerequisites
- PostgreSQL database (local or cloud: Neon/Supabase)
- Node.js 18+

## Environment Setup

1. **Copy the example environment file:**
   ```bash
   cp .env.example .env
   ```

2. **Update DATABASE_URL in `.env`:**
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/online_classroom?schema=public"
   ```

   Example for local PostgreSQL:
   ```env
   DATABASE_URL="postgresql://postgres:password@localhost:5432/online_classroom"
   ```

   Example for Neon/Supabase (provided by their dashboard):
   ```env
   DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/online_classroom?sslmode=require"
   ```

## Database Commands

### Generate Prisma Client
```bash
npm run db:generate
```

### Create and Apply Migrations (Development)
```bash
npm run db:migrate
```
This will:
- Create a new migration based on schema changes
- Apply it to your development database
- Regenerate the Prisma Client

### Apply Migrations (Production)
```bash
npm run db:migrate:deploy
```

### Push Schema Without Migration (Quick Prototyping)
```bash
npm run db:push
```
⚠️ **Use only in development** - this bypasses migration history.

### Seed the Database
```bash
npm run db:seed
```
Populates the database with:
- Admin, Professor, and Student users
- Package definitions (Single, Starter, Standard, Premium)
- Professor pricing
- Sample video course

### Open Prisma Studio (Database GUI)
```bash
npm run db:studio
```
Opens at `http://localhost:5555`

## Schema Structure

### Key Models
- **User** - Students, Professors, Admins
- **Package** - Lesson package definitions
- **ProfessorPricing** - Per-professor prices for each package
- **StudentPackage** - Purchased packages with expiry tracking
- **Lesson** - Scheduled 1-on-1 lessons
- **Transaction** - Payment records
- **VideoCourse** + **CourseModule** - Video course content
- **GroupClass** + **GroupClassEnrollment** - Group class sessions

### Important Constraints
- `remaining_lessons` on `StudentPackage` is computed as `total_lessons - used_lessons`
- Prices are NEVER stored on `packages` - always in `professor_pricing`
- `student_package_id` on `lessons` is nullable (null = single class purchase)

## Test Credentials (After Seeding)

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@example.com | admin123 |
| Professor 1 | professor1@example.com | professor123 |
| Professor 2 | professor2@example.com | professor123 |
| Student 1 | student1@example.com | student123 |
| Student 2 | student2@example.com | student123 |

## Troubleshooting

### Connection Issues
- Ensure PostgreSQL is running
- Verify DATABASE_URL format
- Check firewall/network settings for cloud databases

### Migration Errors
```bash
# Reset database (⚠️ DELETES ALL DATA)
npx prisma migrate reset

# Force push schema (development only)
npm run db:push -- --force-reset
```

### Generate Client After Schema Changes
```bash
npm run db:generate
```

## Next Steps
1. Set up database (local PostgreSQL or cloud)
2. Configure `.env` with DATABASE_URL
3. Run migrations: `npm run db:migrate`
4. Seed database: `npm run db:seed`
5. Verify with Prisma Studio: `npm run db:studio`
