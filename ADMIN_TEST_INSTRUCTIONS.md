# Admin System Testing Instructions

## 🚀 Quick Test Steps

### 1. Start the Backend Server
```bash
cd backend
npm run dev
```

Make sure you see:
- "Database initialized successfully"
- "ANRS Backend Server running on port 3000"

### 2. Test the Admin System
```bash
cd backend
npm run test-admin
```

This will verify:
- Database connection
- Admin table creation
- Admin model functionality
- All CRUD operations

### 3. Create Your First Super Admin
```bash
cd backend
npm run create-super-admin
```

Follow the prompts:
- Enter your full name
- Enter your email address
- Enter a secure password (min 6 chars)
- Confirm the password

### 4. Test Admin Login

1. Open your browser and go to: `http://localhost:3000/admin/`
2. Use the credentials you just created
3. You should be redirected to the dashboard

### 5. Test Admin Registration

1. Go to: `http://localhost:3000/admin/pages/register.html`
2. Fill in the form:
   - Name: Your name
   - Email: Different email from step 3
   - Password: Secure password
   - Confirm Password: Same password
   - Admin Key: `ANRS_ADMIN_2024`
3. Click "Create Admin Account"

## 🔧 Troubleshooting

### Issue: "AdminAPI.register is not a function"

**Solution 1: Clear Browser Cache**
1. Press `Ctrl+Shift+R` (or `Cmd+Shift+R` on Mac) to hard refresh
2. Or open Developer Tools (F12) and right-click refresh button → "Empty Cache and Hard Reload"

**Solution 2: Check Console for Errors**
1. Open Developer Tools (F12)
2. Go to Console tab
3. Look for any JavaScript errors
4. If you see errors, refresh the page

**Solution 3: Verify Server is Running**
1. Make sure backend server is running on port 3000
2. Test API endpoint: `http://localhost:3000/api/health`
3. Should return: `{"status":"OK","timestamp":"...","version":"1.0.0"}`

**Solution 4: Check Network Tab**
1. Open Developer Tools (F12)
2. Go to Network tab
3. Try to register/login
4. Check if API calls are being made to `http://localhost:3000/api/auth/admin-*`

### Issue: Database Connection Error

**Solution:**
1. Make sure XAMPP is running
2. Start MySQL service in XAMPP
3. Check `.env` file in backend folder:
   ```env
   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=
   DB_NAME=anrs_db
   ```

### Issue: "Admin table does not exist"

**Solution:**
1. The table should be created automatically when you start the server
2. If not, manually create it:
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
   ```

### Issue: "Invalid admin registration key"

**Solution:**
1. Use the correct admin key: `ANRS_ADMIN_2024`
2. Or check your `.env` file for `ADMIN_REGISTRATION_KEY`

### Issue: Login/Registration not working

**Solution:**
1. Check browser console for errors
2. Verify server is running and accessible
3. Check network requests in Developer Tools
4. Try the fallback method (it should work automatically)

## 📝 Test Checklist

- [ ] Backend server starts successfully
- [ ] Database connection works
- [ ] Admin table is created
- [ ] Super admin creation works
- [ ] Admin login works
- [ ] Admin registration works
- [ ] Dashboard loads correctly
- [ ] Navigation between pages works
- [ ] Logout functionality works

## 🎯 Expected Results

### Successful Login:
- Redirected to dashboard
- See welcome message
- Navigation sidebar visible
- User avatar in top right

### Successful Registration:
- Success message appears
- Redirected to dashboard
- New admin account created

### Dashboard Features:
- Statistics cards showing data
- Recent users/meals lists
- System health indicators
- Quick action buttons

## 🔍 Debug Information

If you're still having issues, check these:

1. **Browser Console Logs:**
   - Look for "AdminAPI initialized"
   - Check for any error messages
   - Verify API calls are being made

2. **Server Logs:**
   - Check for database connection messages
   - Look for API request logs
   - Verify admin routes are loaded

3. **Network Requests:**
   - POST to `/api/auth/admin-login`
   - POST to `/api/auth/admin-register`
   - Should return JSON responses

## 📞 Still Need Help?

If you're still experiencing issues:

1. Run the test script: `npm run test-admin`
2. Check the server logs for errors
3. Verify all dependencies are installed: `npm install`
4. Make sure you're using the correct URLs and ports
5. Try accessing the test page: `http://localhost:3000/admin/test-api.html`

The admin system includes fallback mechanisms, so even if the AdminAPI class has issues, the direct fetch methods should work.
