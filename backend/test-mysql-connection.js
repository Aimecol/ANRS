/**
 * Test MySQL Connection for ANRS
 * Run this script to verify MySQL/XAMPP connection
 */

require('dotenv').config();
const database = require('./config/mysql-database');

async function testConnection() {
  console.log('🔍 Testing MySQL connection...');
  console.log('Configuration:');
  console.log(`- Host: ${process.env.DB_HOST || 'localhost'}`);
  console.log(`- Port: ${process.env.DB_PORT || 3306}`);
  console.log(`- User: ${process.env.DB_USER || 'root'}`);
  console.log(`- Database: ${process.env.DB_NAME || 'anrs_db'}`);
  console.log('');

  try {
    // Test connection
    console.log('📡 Connecting to MySQL...');
    await database.connect();
    console.log('✅ Successfully connected to MySQL database!');

    // Test health check
    console.log('🏥 Running health check...');
    const isHealthy = await database.healthCheck();
    if (isHealthy) {
      console.log('✅ Database health check passed!');
    } else {
      console.log('❌ Database health check failed!');
    }

    // Test basic query
    console.log('📊 Testing basic query...');
    const tables = await database.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables in database:`);
    tables.forEach(table => {
      const tableName = Object.values(table)[0];
      console.log(`   - ${tableName}`);
    });

    // Test table structure
    if (tables.length > 0) {
      console.log('🔍 Checking users table structure...');
      try {
        const userTableStructure = await database.query('DESCRIBE users');
        console.log('✅ Users table structure:');
        userTableStructure.forEach(column => {
          console.log(`   - ${column.Field}: ${column.Type} ${column.Null === 'NO' ? 'NOT NULL' : 'NULL'}`);
        });
      } catch (error) {
        console.log('⚠️  Users table not found or error:', error.message);
      }
    }

    // Test insert and select (with cleanup)
    console.log('🧪 Testing insert/select operations...');
    try {
      // Insert test user
      const testUser = {
        name: 'Test User',
        email: `test_${Date.now()}@example.com`,
        password_hash: 'test_hash_123'
      };

      const insertResult = await database.run(
        'INSERT INTO users (name, email, password_hash) VALUES (?, ?, ?)',
        [testUser.name, testUser.email, testUser.password_hash]
      );

      console.log(`✅ Test user inserted with ID: ${insertResult.insertId}`);

      // Select test user
      const selectedUser = await database.get(
        'SELECT * FROM users WHERE id = ?',
        [insertResult.insertId]
      );

      if (selectedUser) {
        console.log('✅ Test user retrieved successfully:');
        console.log(`   - ID: ${selectedUser.id}`);
        console.log(`   - Name: ${selectedUser.name}`);
        console.log(`   - Email: ${selectedUser.email}`);
      }

      // Cleanup test user
      await database.run('DELETE FROM users WHERE id = ?', [insertResult.insertId]);
      console.log('✅ Test user cleaned up successfully');

    } catch (error) {
      console.log('⚠️  Insert/Select test failed:', error.message);
      console.log('   This might be because tables don\'t exist yet.');
    }

    console.log('');
    console.log('🎉 All tests completed successfully!');
    console.log('');
    console.log('Next steps:');
    console.log('1. Run the backend server: npm run dev');
    console.log('2. Test API endpoints: http://localhost:3000/api/health');
    console.log('3. Update frontend to use API service');

  } catch (error) {
    console.error('❌ Connection test failed:');
    console.error('Error:', error.message);
    console.error('');
    console.error('Troubleshooting steps:');
    console.error('1. Ensure XAMPP MySQL service is running');
    console.error('2. Check database credentials in .env file');
    console.error('3. Verify database "anrs_db" exists');
    console.error('4. Check MySQL port (default: 3306)');
    console.error('');
    console.error('To create database, run in MySQL:');
    console.error('CREATE DATABASE anrs_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;');
  } finally {
    // Close connection
    try {
      await database.close();
      console.log('🔌 Database connection closed');
    } catch (error) {
      console.error('Error closing connection:', error.message);
    }
  }
}

// Run the test
if (require.main === module) {
  console.log('🚀 ANRS MySQL Connection Test');
  console.log('================================');
  testConnection()
    .then(() => {
      console.log('Test completed');
      process.exit(0);
    })
    .catch((error) => {
      console.error('Test failed:', error);
      process.exit(1);
    });
}

module.exports = testConnection;
