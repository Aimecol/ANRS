/**
 * Script to create the first super admin
 * Run this script once to create the initial super admin account
 * 
 * Usage: node scripts/create-super-admin.js
 */

const readline = require('readline');
const Admin = require('../models/Admin');
const database = require('../config/mysql-database');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

function questionHidden(prompt) {
  return new Promise((resolve) => {
    process.stdout.write(prompt);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch (char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
}

async function createSuperAdmin() {
  try {
    console.log('🔧 ANRS Super Admin Creation Tool');
    console.log('=====================================\n');

    // Check if any super admin already exists
    const existingStats = await Admin.getStats();
    if (existingStats.super_admins > 0) {
      console.log('⚠️  A super admin already exists in the system.');
      const proceed = await question('Do you want to create another super admin? (y/N): ');
      
      if (proceed.toLowerCase() !== 'y' && proceed.toLowerCase() !== 'yes') {
        console.log('Operation cancelled.');
        process.exit(0);
      }
    }

    console.log('Please provide the following information for the super admin account:\n');

    // Get admin details
    const name = await question('Full Name: ');
    if (!name || name.trim().length < 2) {
      console.log('❌ Name must be at least 2 characters long.');
      process.exit(1);
    }

    const email = await question('Email Address: ');
    if (!email || !isValidEmail(email)) {
      console.log('❌ Please provide a valid email address.');
      process.exit(1);
    }

    // Check if email already exists
    const existingAdmin = await Admin.findByEmail(email);
    if (existingAdmin) {
      console.log('❌ An admin with this email already exists.');
      process.exit(1);
    }

    const password = await questionHidden('Password (min 6 chars): ');
    if (!password || password.length < 6) {
      console.log('❌ Password must be at least 6 characters long.');
      process.exit(1);
    }

    const confirmPassword = await questionHidden('Confirm Password: ');
    if (password !== confirmPassword) {
      console.log('❌ Passwords do not match.');
      process.exit(1);
    }

    console.log('\n📝 Creating super admin account...');

    // Create the super admin
    const admin = await Admin.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: password,
      role: 'super_admin'
    });

    console.log('✅ Super admin created successfully!');
    console.log('\n📋 Account Details:');
    console.log(`   Name: ${admin.name}`);
    console.log(`   Email: ${admin.email}`);
    console.log(`   Role: ${admin.role}`);
    console.log(`   ID: ${admin.id}`);
    console.log(`   Created: ${admin.created_at}`);

    console.log('\n🔐 You can now login to the admin dashboard with these credentials.');
    console.log('   Admin Dashboard URL: http://localhost:3000/admin/');

  } catch (error) {
    console.error('❌ Error creating super admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await database.end();
  }
}

function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Handle process termination
process.on('SIGINT', () => {
  console.log('\n\nOperation cancelled by user.');
  rl.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\nOperation terminated.');
  rl.close();
  process.exit(0);
});

// Run the script
if (require.main === module) {
  createSuperAdmin().catch((error) => {
    console.error('❌ Unexpected error:', error);
    process.exit(1);
  });
}

module.exports = { createSuperAdmin };
