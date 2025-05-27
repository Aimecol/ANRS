# ANRS MySQL XAMPP Setup Guide

## Prerequisites
- XAMPP installed and running
- Node.js installed
- Git (optional)

## Step 1: Start XAMPP Services

1. **Open XAMPP Control Panel**
2. **Start Apache** (for phpMyAdmin access)
3. **Start MySQL** (for database service)

## Step 2: Create Database

### Option A: Using phpMyAdmin (Recommended)
1. Open browser and go to `http://localhost/phpmyadmin`
2. Click "New" to create a new database
3. Enter database name: `anrs_db`
4. Select collation: `utf8mb4_unicode_ci`
5. Click "Create"

### Option B: Using MySQL Command Line
```bash
mysql -u root -p
CREATE DATABASE anrs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE anrs_db;
```

## Step 3: Create Database Tables

Copy and paste this SQL into phpMyAdmin SQL tab or MySQL command line:

```sql
-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email)
);

-- Foods table
CREATE TABLE foods (
    id INT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_rw VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_unit VARCHAR(50) NOT NULL,
    benefits JSON,
    image VARCHAR(255),
    quantity_units JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_category (category),
    INDEX idx_name_en (name_en),
    INDEX idx_name_rw (name_rw)
);

-- Food categories
CREATE TABLE food_categories (
    id VARCHAR(50) PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_rw VARCHAR(255) NOT NULL,
    icon VARCHAR(100),
    color VARCHAR(20),
    description TEXT
);

-- Saved meals
CREATE TABLE saved_meals (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    total_cost DECIMAL(10,2),
    foods_data JSON,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_saved_at (saved_at)
);

-- Budget history
CREATE TABLE budget_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    budget DECIMAL(10,2) NOT NULL,
    recommendations_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
);

-- Grocery history
CREATE TABLE grocery_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    foods_data JSON,
    analysis_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_analysis_date (analysis_date)
);

-- Children recommendations
CREATE TABLE children_recommendations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    age_type ENUM('weeks', 'months', 'years') NOT NULL,
    age_value INT NOT NULL,
    recommendations_data JSON,
    saved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_age (age_type, age_value),
    INDEX idx_saved_at (saved_at)
);

-- User activity logs
CREATE TABLE user_activities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    activity_type VARCHAR(100) NOT NULL,
    details JSON,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_timestamp (timestamp)
);
```

## Step 4: Setup Backend

1. **Navigate to backend directory**:
   ```bash
   cd backend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

4. **Edit .env file** with your MySQL settings:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=anrs_db
   JWT_SECRET=your_secret_key_here
   ```

5. **Start the backend server**:
   ```bash
   npm run dev
   ```

## Step 5: Test Connection

1. **Check backend logs** for "Connected to MySQL database"
2. **Test API health endpoint**: `http://localhost:3000/api/health`
3. **Verify tables created** in phpMyAdmin

## Step 6: Update Frontend

1. **Include API service** in your HTML files:
   ```html
   <script src="js/api-service.js"></script>
   ```

2. **Replace localStorage calls** with API calls in your JavaScript files

## Step 7: Data Migration (Optional)

If you have existing localStorage data:

1. **Export localStorage data** from browser console:
   ```javascript
   console.log(JSON.stringify(localStorage));
   ```

2. **Save output** to a file (e.g., `localStorage-export.json`)

3. **Run migration script**:
   ```bash
   node scripts/migrate-localStorage-to-mysql.js localStorage-export.json
   ```

## Troubleshooting

### Common Issues:

1. **MySQL Connection Error**:
   - Ensure XAMPP MySQL service is running
   - Check database credentials in .env file
   - Verify database exists

2. **Port Already in Use**:
   - Change PORT in .env file
   - Or stop other services using port 3000

3. **Foreign Key Constraints**:
   - Ensure parent tables exist before child tables
   - Check user_id references in related tables

4. **JSON Column Issues**:
   - Ensure MySQL version 5.7+ for JSON support
   - Use TEXT column type for older MySQL versions

### Verification Commands:

```sql
-- Check if tables exist
SHOW TABLES;

-- Check table structure
DESCRIBE users;
DESCRIBE saved_meals;

-- Check data
SELECT COUNT(*) FROM users;
SELECT COUNT(*) FROM saved_meals;
```

## Security Recommendations

1. **Create dedicated MySQL user**:
   ```sql
   CREATE USER 'anrs_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON anrs_db.* TO 'anrs_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

2. **Update .env file** with new credentials:
   ```env
   DB_USER=anrs_user
   DB_PASSWORD=secure_password
   ```

3. **Set strong JWT secret** in production

## Next Steps

1. Test all API endpoints
2. Update frontend to use API service
3. Implement error handling for network issues
4. Add data validation and sanitization
5. Set up backup procedures for MySQL database

## Support

If you encounter issues:
1. Check XAMPP error logs
2. Check Node.js console output
3. Verify MySQL service status
4. Test database connection manually
