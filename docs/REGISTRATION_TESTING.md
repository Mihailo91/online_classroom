# Registration Feature - Testing Guide

## ✅ Implementation Complete

### Features Implemented
1. ✅ **Registration API** (`/api/auth/register`)
   - Input validation (email format, password strength, name length)
   - Duplicate email detection
   - Password hashing with bcrypt
   - Creates student accounts only
   - Returns appropriate error messages

2. ✅ **Registration Form Component**
   - Email, password, confirm password, and name fields
   - Real-time password strength indicator
   - Show/hide password toggle
   - Client-side validation
   - Auto-login after successful registration
   - Clear error messages

3. ✅ **Registration Page** (`/register`)
   - Server-side auth check (redirects if logged in)
   - Consistent styling with login page
   - Link to login for existing users

## 🧪 Manual Testing Checklist

### Test 1: Valid Registration
**Steps:**
1. Navigate to `http://localhost:3000/register`
2. Enter:
   - Name: `Test Student`
   - Email: `test@example.com`
   - Password: `Test1234` (or stronger)
   - Confirm Password: `Test1234`
3. Click "Create Account"

**Expected Result:**
- ✅ Form submits successfully
- ✅ User is automatically logged in
- ✅ Redirected to `/dashboard`
- ✅ Dashboard shows "Welcome back, Test Student!"

### Test 2: Duplicate Email
**Steps:**
1. Navigate to `/register`
2. Try to register with: `student1@example.com` (already exists)
3. Click "Create Account"

**Expected Result:**
- ✅ Error message: "An account with this email already exists"
- ✅ Form stays on registration page
- ✅ No redirect occurs

### Test 3: Weak Password
**Steps:**
1. Navigate to `/register`
2. Enter password: `weak` (less than 8 chars)
3. Click "Create Account"

**Expected Result:**
- ✅ Error message: "Password must be at least 8 characters long"
- ✅ Password strength indicator shows "Weak" (red)

### Test 4: Password Without Number
**Steps:**
1. Navigate to `/register`
2. Enter password: `Password` (no number)
3. Click "Create Account"

**Expected Result:**
- ✅ Error message: "Password must contain at least one letter and one number"

### Test 5: Password Mismatch
**Steps:**
1. Navigate to `/register`
2. Enter password: `Test1234`
3. Enter confirm password: `Test5678`
4. Click "Create Account"

**Expected Result:**
- ✅ Error message: "Passwords do not match"

### Test 6: Invalid Email Format
**Steps:**
1. Navigate to `/register`
2. Enter email: `notanemail`
3. Click "Create Account"

**Expected Result:**
- ✅ Error message: "Please enter a valid email address"

### Test 7: Short Name
**Steps:**
1. Navigate to `/register`
2. Enter name: `A` (less than 2 chars)
3. Click "Create Account"

**Expected Result:**
- ✅ Error message: "Name must be at least 2 characters long"

### Test 8: Already Logged In
**Steps:**
1. Login as `student1@example.com`
2. Navigate to `/register`

**Expected Result:**
- ✅ Immediately redirected to `/dashboard`
- ✅ Cannot access registration page while logged in

### Test 9: Password Strength Indicator
**Steps:**
1. Navigate to `/register`
2. Type password: `weak` → `Weak1` → `Weak123` → `Weak123!`

**Expected Result:**
- ✅ Strength bar changes color/width
- ✅ Label shows: Weak → Fair → Good → Strong
- ✅ Visual feedback is immediate

### Test 10: Show/Hide Password
**Steps:**
1. Navigate to `/register`
2. Enter password
3. Click "Show" button
4. Click "Hide" button

**Expected Result:**
- ✅ Password visibility toggles
- ✅ Button text changes
- ✅ Works for both password fields independently

## 🔍 Edge Case Testing

### Empty Fields
- Submit with empty fields → validation errors

### Very Long Name
- Enter 100+ character name → should work (no max length)

### Special Characters in Name
- Enter `José María` → should work (UTF-8 support)

### Case-Insensitive Email
- Register `Test@Example.com` after `test@example.com` → should show duplicate error

### Network Failure Simulation
- Disable network during submit → generic error message

### Rapid Double-Click Submit
- Click submit twice rapidly → button should be disabled, only one request sent

## 📊 Database Verification

After successful registration, verify in database:

```sql
-- Check user was created
SELECT id, email, name, role, created_at 
FROM users 
WHERE email = 'test@example.com';

-- Verify password is hashed
SELECT password_hash 
FROM users 
WHERE email = 'test@example.com';
-- Should see bcrypt hash (starts with $2b$)

-- Verify role is student
SELECT role 
FROM users 
WHERE email = 'test@example.com';
-- Should be 'student'
```

Or use Prisma Studio:
```bash
npm run db:studio
```

## 🔐 Security Validation

### Password Hashing
- ✅ Passwords stored as bcrypt hashes
- ✅ Salt rounds = 10 (matches auth.ts)
- ✅ Never logged or exposed in responses

### Email Normalization
- ✅ Emails stored in lowercase
- ✅ Case-insensitive duplicate detection

### SQL Injection
- ✅ Protected by Prisma (parameterized queries)

### XSS Prevention
- ✅ Protected by React (automatic escaping)

### CSRF Protection
- ✅ Next.js CSRF protection active

## 🎨 UI/UX Validation

### Responsive Design
- Test on mobile (320px width)
- Test on tablet (768px width)
- Test on desktop (1920px width)

### Accessibility
- Tab through form fields (keyboard navigation)
- Screen reader test (aria labels)
- Focus indicators visible

### Loading States
- Button shows "Creating your account..." during submission
- Button is disabled while loading
- Cannot submit twice

## 📝 API Testing with cURL

### Valid Registration
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "curl@example.com",
    "password": "Test1234",
    "name": "cURL Test"
  }'
```

**Expected**: 201 status, success message

### Duplicate Email
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "student1@example.com",
    "password": "Test1234",
    "name": "Duplicate Test"
  }'
```

**Expected**: 409 status, error message

### Weak Password
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "weak@example.com",
    "password": "weak",
    "name": "Weak Password"
  }'
```

**Expected**: 400 status, validation error

## ✅ Success Criteria

All tests passing indicates:
- [x] Valid registration creates student account
- [x] Auto-login works after registration
- [x] Redirects to dashboard after success
- [x] Duplicate email shows clear error
- [x] Password validation enforced
- [x] Password strength indicator works
- [x] Show/hide password toggle works
- [x] Form validation prevents invalid submissions
- [x] Loading states work correctly
- [x] Error messages are user-friendly
- [x] Already logged-in users redirected
- [x] Password is securely hashed
- [x] Email is case-insensitive
- [x] Database constraints enforced

## 🐛 Known Limitations

1. **No Email Verification**: Users can register with any email (no confirmation required)
2. **No Rate Limiting**: No protection against registration spam (can add later)
3. **No CAPTCHA**: Bots can register (can add later)
4. **No Password Reset**: Users cannot recover forgotten passwords yet
5. **Student Role Only**: Professors/Admins must be created by admin

## 🚀 Next Steps

After registration is tested and validated:
1. Add email verification (optional)
2. Implement password reset flow
3. Add OAuth providers (Google, Facebook)
4. Implement rate limiting
5. Add CAPTCHA for bot prevention
6. Create admin panel for user management

## 📞 Support

If any test fails:
1. Check browser console for JavaScript errors
2. Check server logs for API errors
3. Verify database connection
4. Ensure all dependencies installed
5. Restart dev server

---

**Status**: ✅ Registration feature ready for testing!
