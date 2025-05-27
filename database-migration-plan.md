# MySQL Database Migration Plan for ANRS (Using XAMPP)

## Current State Analysis

The project is a client-side web application using localStorage for data persistence. It stores:

- User authentication data
- Saved meals, budget history, grocery history
- Children recommendations and activity logs
- Static food data (cached from JSON)

## Recommended Approach: Node.js + MySQL Backend (XAMPP)

### 1. XAMPP MySQL Setup

1. **Start XAMPP Services**:

   - Start Apache and MySQL from XAMPP Control Panel
   - Access phpMyAdmin at `http://localhost/phpmyadmin`

2. **Create Database**:
   ```sql
   CREATE DATABASE anrs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   USE anrs_db;
   ```

### 2. Database Schema Design

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

-- Foods table (migrate from JSON)
CREATE TABLE foods (
    id INT PRIMARY KEY,
    name_en VARCHAR(255) NOT NULL,
    name_rw VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    price_unit VARCHAR(50) NOT NULL,
    benefits JSON, -- JSON array for benefits
    image VARCHAR(255),
    quantity_units JSON, -- JSON array for quantity units
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
    foods_data JSON, -- JSON data for foods
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
    foods_data JSON, -- JSON data for grocery analysis
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
    recommendations_data JSON, -- JSON data for recommendations
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
    details JSON, -- JSON data for activity details
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_activity_type (activity_type),
    INDEX idx_timestamp (timestamp)
);
```

### 3. Backend Implementation Structure

```
backend/
├── package.json
├── server.js
├── config/
│   └── database.js
├── models/
│   ├── User.js
│   ├── Food.js
│   ├── SavedMeal.js
│   ├── BudgetHistory.js
│   ├── GroceryHistory.js
│   ├── ChildrenRecommendation.js
│   └── UserActivity.js
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── foods.js
│   ├── meals.js
│   ├── budget.js
│   ├── grocery.js
│   └── children.js
├── middleware/
│   └── auth.js
└── migrations/
    └── 001_initial_schema.sql
```

### 4. Required Dependencies

```json
{
  "dependencies": {
    "express": "^4.18.2",
    "mysql2": "^3.6.5",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.2",
    "cors": "^2.8.5",
    "helmet": "^7.0.0",
    "express-rate-limit": "^6.8.1",
    "dotenv": "^16.3.1",
    "express-validator": "^7.0.1"
  }
}
```

### 5. Migration Strategy

#### Phase 1: XAMPP MySQL Setup

1. Start XAMPP Apache and MySQL services
2. Create MySQL database using phpMyAdmin
3. Run schema creation scripts
4. Set up database user and permissions

#### Phase 2: Backend Setup

1. Create Node.js/Express backend
2. Configure MySQL connection with mysql2
3. Implement authentication endpoints
4. Create data migration scripts

#### Phase 3: API Development

1. Create RESTful APIs for all data operations
2. Implement JWT-based authentication
3. Add data validation and error handling
4. Set up CORS for frontend communication

#### Phase 4: Frontend Migration

1. Replace localStorage calls with API calls
2. Add authentication token management
3. Implement error handling for network requests
4. Add loading states and offline support

#### Phase 5: Data Migration

1. Create migration script to export localStorage data
2. Import existing user data to MySQL
3. Validate data integrity
4. Deploy and test

### 6. Benefits of MySQL Migration

✅ **Advantages:**

- Persistent data storage across devices
- Better data integrity and relationships
- Concurrent user support
- Backup and recovery capabilities
- SQL query capabilities for analytics
- Scalable architecture
- XAMPP integration (familiar environment)
- phpMyAdmin for database management
- Better performance for complex queries
- ACID compliance for data consistency

⚠️ **Considerations:**

- Requires XAMPP MySQL service running
- More complex deployment
- Network dependency
- Need for authentication system
- Database connection management

### 7. XAMPP Configuration

#### MySQL Configuration:

1. **Default Connection**:

   - Host: `localhost`
   - Port: `3306`
   - Username: `root`
   - Password: `` (empty by default)

2. **Security Setup** (Recommended):
   ```sql
   -- Create dedicated user for ANRS
   CREATE USER 'anrs_user'@'localhost' IDENTIFIED BY 'secure_password';
   GRANT ALL PRIVILEGES ON anrs_db.* TO 'anrs_user'@'localhost';
   FLUSH PRIVILEGES;
   ```

### 8. Alternative: Hybrid Approach

For minimal changes, consider:

- Keep localStorage for offline functionality
- Add MySQL backend for data synchronization
- Implement sync mechanism when online
- Gradual migration of features

This approach allows maintaining current functionality while adding server-side persistence.
