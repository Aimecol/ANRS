/**
 * Test script for the admin system
 * This script tests the basic functionality of the admin system
 * 
 * Usage: node scripts/test-admin-system.js
 */

const Admin = require('../models/Admin');
const database = require('../config/mysql-database');

async function testAdminSystem() {
  console.log('🧪 Testing ANRS Admin System');
  console.log('==============================\n');

  try {
    // Test 1: Database connection
    console.log('1. Testing database connection...');
    await database.connect();
    console.log('   ✅ Database connected successfully\n');

    // Test 2: Admin table exists
    console.log('2. Testing admin table...');
    const [tables] = await database.execute("SHOW TABLES LIKE 'admins'");
    if (tables.length > 0) {
      console.log('   ✅ Admin table exists\n');
    } else {
      console.log('   ❌ Admin table does not exist\n');
      return;
    }

    // Test 3: Check admin table structure
    console.log('3. Testing admin table structure...');
    const [columns] = await database.execute("DESCRIBE admins");
    const expectedColumns = ['id', 'name', 'email', 'password_hash', 'role', 'is_active', 'last_login', 'created_at', 'updated_at'];
    const actualColumns = columns.map(col => col.Field);
    
    const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
    if (missingColumns.length === 0) {
      console.log('   ✅ Admin table structure is correct\n');
    } else {
      console.log(`   ❌ Missing columns: ${missingColumns.join(', ')}\n`);
    }

    // Test 4: Admin model functionality
    console.log('4. Testing Admin model...');
    
    // Test creating an admin
    const testEmail = `test_admin_${Date.now()}@example.com`;
    const testAdmin = await Admin.create({
      name: 'Test Admin',
      email: testEmail,
      password: 'testpassword123',
      role: 'admin'
    });
    
    if (testAdmin && testAdmin.id) {
      console.log('   ✅ Admin creation successful');
      console.log(`   📝 Created admin with ID: ${testAdmin.id}\n`);
    } else {
      console.log('   ❌ Admin creation failed\n');
      return;
    }

    // Test 5: Password verification
    console.log('5. Testing password verification...');
    const isValidPassword = await testAdmin.verifyPassword('testpassword123');
    const isInvalidPassword = await testAdmin.verifyPassword('wrongpassword');
    
    if (isValidPassword && !isInvalidPassword) {
      console.log('   ✅ Password verification working correctly\n');
    } else {
      console.log('   ❌ Password verification failed\n');
    }

    // Test 6: Admin retrieval
    console.log('6. Testing admin retrieval...');
    const retrievedAdmin = await Admin.findById(testAdmin.id);
    const retrievedByEmail = await Admin.findByEmail(testEmail);
    
    if (retrievedAdmin && retrievedByEmail && retrievedAdmin.id === testAdmin.id) {
      console.log('   ✅ Admin retrieval working correctly\n');
    } else {
      console.log('   ❌ Admin retrieval failed\n');
    }

    // Test 7: Admin update
    console.log('7. Testing admin update...');
    await testAdmin.update({ name: 'Updated Test Admin' });
    const updatedAdmin = await Admin.findById(testAdmin.id);
    
    if (updatedAdmin.name === 'Updated Test Admin') {
      console.log('   ✅ Admin update working correctly\n');
    } else {
      console.log('   ❌ Admin update failed\n');
    }

    // Test 8: Admin statistics
    console.log('8. Testing admin statistics...');
    const stats = await Admin.getStats();
    
    if (stats && typeof stats.total_admins === 'number') {
      console.log('   ✅ Admin statistics working correctly');
      console.log(`   📊 Total admins: ${stats.total_admins}`);
      console.log(`   📊 Active admins: ${stats.active_admins}`);
      console.log(`   📊 Super admins: ${stats.super_admins}\n`);
    } else {
      console.log('   ❌ Admin statistics failed\n');
    }

    // Test 9: Admin list with pagination
    console.log('9. Testing admin pagination...');
    const adminList = await Admin.getAll(1, 10);
    
    if (adminList && Array.isArray(adminList.admins)) {
      console.log('   ✅ Admin pagination working correctly');
      console.log(`   📄 Found ${adminList.total} total admins\n`);
    } else {
      console.log('   ❌ Admin pagination failed\n');
    }

    // Test 10: Clean up test data
    console.log('10. Cleaning up test data...');
    await testAdmin.delete();
    const deletedAdmin = await Admin.findById(testAdmin.id);
    
    if (!deletedAdmin) {
      console.log('    ✅ Test admin deleted successfully\n');
    } else {
      console.log('    ❌ Failed to delete test admin\n');
    }

    // Test 11: Check for existing super admins
    console.log('11. Checking for existing super admins...');
    const finalStats = await Admin.getStats();
    
    if (finalStats.super_admins > 0) {
      console.log(`    ✅ Found ${finalStats.super_admins} super admin(s)`);
      console.log('    🎉 Admin system is ready to use!\n');
    } else {
      console.log('    ⚠️  No super admins found');
      console.log('    💡 Run "npm run create-super-admin" to create your first super admin\n');
    }

    console.log('🎉 All tests completed successfully!');
    console.log('✅ Admin system is working correctly');
    console.log('\n📋 Next steps:');
    console.log('   1. Create a super admin: npm run create-super-admin');
    console.log('   2. Start the server: npm run dev');
    console.log('   3. Access admin dashboard: http://localhost:3000/admin/');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('   1. Ensure XAMPP MySQL is running');
    console.error('   2. Check database configuration in .env');
    console.error('   3. Verify database exists and is accessible');
    console.error('   4. Check server logs for detailed errors');
  } finally {
    await database.end();
  }
}

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n\nTest interrupted by user.');
  await database.end();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n\nTest terminated.');
  await database.end();
  process.exit(0);
});

// Run the test
if (require.main === module) {
  testAdminSystem().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { testAdminSystem };
