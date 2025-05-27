# ANRS Admin System Setup Guide

This guide will help you set up the complete admin system for the ANRS (Balanced Diet Recommendation System) project.

## 📋 Prerequisites

- XAMPP with MySQL running
- Node.js (v14 or higher)
- Modern web browser

## 🚀 Quick Setup

### 1. Database Setup

The admin table will be automatically created when you start the server. The database schema includes:

```sql
-- Admin table structure
CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- Updated users table with admin roles
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

### 2. Environment Configuration

Update your `.env` file with admin configuration:

```env
# Admin Configuration
ADMIN_REGISTRATION_KEY=ANRS_ADMIN_2024

# JWT Configuration (ensure these are set)
JWT_SECRET=your_super_secret_jwt_key_here_change_in_production
JWT_EXPIRES_IN=7d

# Security Configuration
BCRYPT_ROUNDS=12
```

### 3. Install Dependencies

Make sure all required packages are installed:

```bash
cd backend
npm install bcryptjs express-validator jsonwebtoken express-rate-limit
```

### 4. Start the Server

```bash
cd backend
npm run dev
```

The server will automatically create the admin table on startup.

### 5. Create Your First Super Admin

Run the super admin creation script:

```bash
cd backend
npm run create-super-admin
```

Follow the prompts to create your first super admin account:
- Enter full name
- Enter email address
- Enter secure password (min 6 chars)
- Confirm password

### 6. Access Admin Dashboard

Open your browser and navigate to:
```
http://localhost:3000/admin/
```

Login with the credentials you just created.

## 🔧 Manual Setup (Alternative)

If you prefer to set up manually:

### 1. Create Admin Table Manually

Connect to your MySQL database and run:

```sql
USE anrs_db;

CREATE TABLE IF NOT EXISTS admins (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'super_admin') DEFAULT 'admin',
  is_active BOOLEAN DEFAULT TRUE,
  last_login TIMESTAMP NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_role (role),
  INDEX idx_is_active (is_active)
);

-- Update users table
ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
```

### 2. Create Super Admin Manually

You can also create a super admin directly in the database:

```sql
-- Replace with your actual details and hashed password
INSERT INTO admins (name, email, password_hash, role, is_active) 
VALUES ('Admin Name', 'admin@example.com', '$2a$12$hashedpassword', 'super_admin', TRUE);
```

## 🔐 Security Features

### Authentication
- JWT token-based authentication
- Secure password hashing with bcrypt
- Role-based access control
- Session management

### Rate Limiting
- Login attempt limiting (5 attempts per 15 minutes)
- API rate limiting
- IP-based restrictions

### Validation
- Input validation and sanitization
- Email format validation
- Password strength requirements
- XSS protection

## 📊 Admin Features

### Dashboard
- Real-time statistics
- User growth metrics
- System health monitoring
- Recent activity tracking

### User Management
- View all users
- Edit user information
- Toggle user status
- Role management
- Search and filtering

### Food Management
- Visual food catalog
- Add/edit/delete foods
- Category management
- Price tracking
- Bilingual support

### Meal Management
- View saved meals
- Meal analytics
- User meal tracking
- Cost analysis

### Analytics
- User growth charts
- Food popularity
- System performance
- Export capabilities

### Settings
- System configuration
- Security settings
- Email configuration
- Backup management

## 🛠️ API Endpoints

### Authentication
```
POST /api/auth/admin-login       - Admin login
POST /api/auth/admin-register    - Admin registration
GET  /api/auth/verify-admin      - Token verification
POST /api/auth/admin-logout      - Admin logout
GET  /api/auth/admin-profile     - Get admin profile
```

### Admin Management
```
GET    /api/admin/admins         - Get all admins (super admin only)
GET    /api/admin/admins/:id     - Get specific admin
PUT    /api/admin/admins/:id     - Update admin
DELETE /api/admin/admins/:id     - Delete admin (super admin only)
PATCH  /api/admin/admins/:id/toggle-status - Toggle admin status
PUT    /api/admin/admins/:id/password - Update password
GET    /api/admin/stats          - Get admin statistics
```

## 🔧 Troubleshooting

### Common Issues

1. **Database Connection Error**
   - Ensure XAMPP MySQL is running
   - Check database credentials in `.env`
   - Verify database name exists

2. **Admin Table Not Created**
   - Check server logs for errors
   - Manually run the SQL commands
   - Verify MySQL user permissions

3. **Login Issues**
   - Verify admin account exists and is active
   - Check password is correct
   - Ensure JWT_SECRET is set in `.env`

4. **Permission Denied**
   - Check admin role (admin vs super_admin)
   - Verify token is valid and not expired
   - Ensure proper authentication headers

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
LOG_LEVEL=debug
```

## 🚀 Production Deployment

### Security Checklist

1. **Change Default Keys**
   ```env
   ADMIN_REGISTRATION_KEY=your_secure_key_here
   JWT_SECRET=your_super_secure_jwt_secret
   ```

2. **Database Security**
   - Create dedicated database user
   - Use strong passwords
   - Enable SSL connections

3. **Server Security**
   - Enable HTTPS
   - Configure proper CORS
   - Set up firewall rules
   - Enable security headers

4. **Admin Account Security**
   - Use strong passwords
   - Enable 2FA (if implemented)
   - Regular password rotation
   - Monitor admin activity

### Environment Variables
```env
NODE_ENV=production
ADMIN_REGISTRATION_KEY=your_production_key
JWT_SECRET=your_production_jwt_secret
DB_PASSWORD=your_secure_db_password
```

## 📞 Support

If you encounter any issues:

1. Check the server logs
2. Verify database connection
3. Ensure all dependencies are installed
4. Check the troubleshooting section above

For additional help, refer to the main ANRS documentation or contact the development team.

## 🎉 Success!

Once setup is complete, you should have:
- ✅ Admin table created
- ✅ Super admin account created
- ✅ Admin dashboard accessible
- ✅ All admin features working
- ✅ Secure authentication system

You can now manage your ANRS system through the professional admin dashboard!
