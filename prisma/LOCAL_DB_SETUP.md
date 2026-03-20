# Local Database Configuration Summary

## ✅ Setup Complete

### Database Connection
- **Container**: `scheduling-db` (Podman)
- **PostgreSQL**: v16.13
- **Port**: 5433 → 5432 (container)
- **Database**: `online_classroom`
- **User**: `postgres`
- **Password**: `postgres`

### Connection String
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/online_classroom?schema=public"
```

## 📊 Database Status

### Tables Created (14)
✅ users
✅ packages
✅ professor_pricing
✅ student_packages
✅ professor_availability
✅ lessons
✅ transactions
✅ video_courses
✅ course_modules
✅ student_courses
✅ student_module_progress
✅ group_classes
✅ group_class_enrollments
✅ _prisma_migrations

### Test Data Seeded
- **5 Users**: 1 Admin, 2 Professors, 2 Students
- **4 Packages**: Single Class, Starter Pack, Standard Pack, Premium Pack
- **8 Pricing Records**: Both professors have pricing for all 4 packages
- **1 Video Course**: "Spanish for Beginners" with 2 modules

## 👥 Test Credentials

| Role | Email | Password | Name |
|------|-------|----------|------|
| Admin | admin@example.com | admin123 | Admin User |
| Professor | professor1@example.com | professor123 | Maria Garcia |
| Professor | professor2@example.com | professor123 | John Smith |
| Student | student1@example.com | student123 | Alice Johnson |
| Student | student2@example.com | student123 | Bob Wilson |

## 💰 Professor Pricing Examples

### Maria Garcia (More Affordable)
- Single Class: €25.00
- Starter Pack (4): €90.00
- Standard Pack (8): €170.00
- Premium Pack (12): €240.00

### John Smith (Premium)
- Single Class: €30.00
- Starter Pack (4): €110.00
- Standard Pack (8): €200.00
- Premium Pack (12): €280.00

## 🛠️ Useful Commands

### Access PostgreSQL CLI
```bash
podman exec -it scheduling-db psql -U postgres -d online_classroom
```

### Query Users
```sql
SELECT name, email, role FROM users ORDER BY role;
```

### View Professor Pricing
```sql
SELECT u.name as professor, p.name as package, pp.price, pp.currency
FROM professor_pricing pp
JOIN users u ON pp.professor_id = u.id
JOIN packages p ON pp.package_id = p.id
ORDER BY u.name, p.lesson_count;
```

### Prisma Studio (GUI)
```bash
npm run db:studio
# Opens at http://localhost:5555
```

## 🔄 Database Management

### Reset Database (⚠️ Deletes all data)
```bash
npx prisma migrate reset
```

### Reseed After Reset
```bash
npm run db:seed
```

### View Migration Status
```bash
npx prisma migrate status
```

### Generate Prisma Client
```bash
npm run db:generate
```

## 📝 Next Steps

1. ✅ Database configured and seeded
2. ✅ Test data available
3. ⏭️ Configure NextAuth.js
4. ⏭️ Create route structure
5. ⏭️ Build authentication flow

Your local Podman PostgreSQL database is ready for development! 🚀
