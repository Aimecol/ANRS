# ANRS Admin Dashboard

A comprehensive administrative dashboard for the Balanced Diet Recommendation System (ANRS) for Rwandan Parents.

## Features

### 🔐 Authentication & Security
- Secure admin login system
- Role-based access control (admin/user roles)
- JWT token authentication
- Session management
- Admin registration with secure keys

### 📊 Dashboard Overview
- Real-time system statistics
- User growth metrics
- Recent activity monitoring
- System health indicators
- Quick action shortcuts

### 👥 User Management
- View all registered users
- User search and filtering
- Edit user information
- Toggle user active status
- User role management
- Export user data

### 🍎 Food Management
- Visual food catalog with cards
- Add, edit, and delete food items
- Category-based organization
- Price and nutrition management
- Bilingual support (English/Kinyarwanda)
- Food image management

### 🍽️ Meal Management
- View all saved meals
- Meal search and filtering
- Cost-based filtering
- Detailed meal information
- User meal tracking
- Meal deletion capabilities

### 📈 Analytics & Reports
- User growth charts
- Food category analytics
- Activity heatmaps
- Budget analysis
- Popular foods tracking
- System performance metrics
- Data export capabilities

### ⚙️ System Settings
- General system configuration
- Security settings
- Email configuration
- Backup management
- System information
- Maintenance mode

## File Structure

```
admin/
├── index.html              # Admin login page
├── css/
│   └── admin.css           # Complete admin styling
├── js/
│   ├── admin-api.js        # API service layer
│   ├── admin-auth.js       # Authentication handling
│   └── admin-dashboard.js  # Dashboard functionality
├── pages/
│   ├── dashboard.html      # Main dashboard
│   ├── users.html          # User management
│   ├── foods.html          # Food management
│   ├── meals.html          # Meal management
│   ├── analytics.html      # Analytics & reports
│   ├── settings.html       # System settings
│   └── register.html       # Admin registration
└── README.md              # This file
```

## Getting Started

### Prerequisites
- XAMPP with MySQL running
- Node.js backend server
- Modern web browser

### Installation

1. **Place admin folder** in your ANRS project root
2. **Update database schema** to include admin roles:
   ```sql
   ALTER TABLE users ADD COLUMN role ENUM('user', 'admin') DEFAULT 'user';
   ALTER TABLE users ADD COLUMN is_active BOOLEAN DEFAULT TRUE;
   ```

3. **Configure backend** to handle admin routes
4. **Access admin panel** at `/admin/index.html`

### Default Credentials (Development)
- **Admin Registration Key**: `ANRS_ADMIN_2024`
- Create your first admin account using the registration page

## API Integration

The admin dashboard expects the following API endpoints:

### Authentication
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/admin-register` - Admin registration
- `GET /api/auth/verify-admin` - Token verification
- `POST /api/auth/logout` - Logout

### Admin Routes
- `GET /api/admin/users` - Get users with pagination
- `PUT /api/admin/users/:id` - Update user
- `DELETE /api/admin/users/:id` - Delete user
- `GET /api/admin/foods` - Get foods
- `POST /api/admin/foods` - Create food
- `PUT /api/admin/foods/:id` - Update food
- `DELETE /api/admin/foods/:id` - Delete food
- `GET /api/admin/meals` - Get all meals
- `DELETE /api/admin/meals/:id` - Delete meal
- `GET /api/admin/stats/dashboard` - Dashboard statistics
- `GET /api/admin/analytics/*` - Analytics data
- `GET /api/admin/system/health` - System health

## Features in Detail

### Responsive Design
- Mobile-friendly interface
- Collapsible sidebar
- Adaptive layouts
- Touch-friendly controls

### User Experience
- Professional design
- Intuitive navigation
- Loading states
- Error handling
- Success notifications
- Confirmation dialogs

### Data Management
- Search functionality
- Filtering options
- Pagination
- Bulk operations
- Export capabilities
- Real-time updates

### Security Features
- Role-based access
- Secure authentication
- Session timeout
- Input validation
- XSS protection
- CSRF protection

## Customization

### Styling
The admin dashboard uses CSS custom properties for easy theming:

```css
:root {
  --admin-primary: #1a237e;
  --admin-secondary: #3f51b5;
  --admin-accent: #ff5722;
  /* ... more variables */
}
```

### Adding New Pages
1. Create HTML file in `pages/` directory
2. Include required scripts and styles
3. Add navigation link in sidebar
4. Implement page-specific JavaScript

### API Integration
Update `admin-api.js` to add new endpoints:

```javascript
async newEndpoint(data) {
  return await this.request('/api/admin/new-endpoint', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
```

## Browser Support
- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Development Notes

### Mock Data
The dashboard includes mock data generators for development:
- User data simulation
- Meal data generation
- Statistics calculation
- Chart placeholders

### Production Deployment
1. Remove demo credentials
2. Update API endpoints
3. Configure proper authentication
4. Set up SSL/HTTPS
5. Enable security headers
6. Configure backup systems

## Contributing

1. Follow existing code style
2. Test on multiple browsers
3. Ensure responsive design
4. Add proper error handling
5. Update documentation

## License

This admin dashboard is part of the ANRS project and follows the same licensing terms.

## Support

For technical support or questions about the admin dashboard, please refer to the main ANRS project documentation or contact the development team.
