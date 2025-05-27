// Admin Profile Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Modal elements
    const editPersonalModal = document.getElementById('editPersonalModal');
    const changePasswordModal = document.getElementById('changePasswordModal');
    
    // Button elements
    const editPersonalBtn = document.getElementById('editPersonalBtn');
    const changePasswordBtn = document.getElementById('changePasswordBtn');
    const changeAvatarBtn = document.getElementById('changeAvatarBtn');
    const enable2FABtn = document.getElementById('enable2FABtn');
    const manageSessionsBtn = document.getElementById('manageSessionsBtn');
    const viewAllActivityBtn = document.getElementById('viewAllActivityBtn');
    
    // Modal close buttons
    const closeEditPersonalModal = document.getElementById('closeEditPersonalModal');
    const closeChangePasswordModal = document.getElementById('closeChangePasswordModal');
    const cancelEditPersonal = document.getElementById('cancelEditPersonal');
    const cancelChangePassword = document.getElementById('cancelChangePassword');
    
    // Form buttons
    const savePersonalInfo = document.getElementById('savePersonalInfo');
    const saveNewPassword = document.getElementById('saveNewPassword');
    
    // Profile elements
    const profileName = document.getElementById('profileName');
    const profileEmail = document.getElementById('profileEmail');
    const fullName = document.getElementById('fullName');
    const emailAddress = document.getElementById('emailAddress');
    const phoneNumber = document.getElementById('phoneNumber');
    const department = document.getElementById('department');
    
    // Load admin data from localStorage or API
    loadAdminProfile();
    
    // Event listeners
    editPersonalBtn.addEventListener('click', openEditPersonalModal);
    changePasswordBtn.addEventListener('click', openChangePasswordModal);
    changeAvatarBtn.addEventListener('click', handleAvatarChange);
    enable2FABtn.addEventListener('click', handle2FASetup);
    manageSessionsBtn.addEventListener('click', handleSessionManagement);
    viewAllActivityBtn.addEventListener('click', handleViewAllActivity);
    
    // Modal event listeners
    closeEditPersonalModal.addEventListener('click', closeModal);
    closeChangePasswordModal.addEventListener('click', closeModal);
    cancelEditPersonal.addEventListener('click', closeModal);
    cancelChangePassword.addEventListener('click', closeModal);
    
    // Form submission listeners
    savePersonalInfo.addEventListener('click', handleSavePersonalInfo);
    saveNewPassword.addEventListener('click', handleChangePassword);
    
    // Close modal when clicking outside
    window.addEventListener('click', function(event) {
        if (event.target.classList.contains('admin-modal')) {
            closeModal();
        }
    });
    
    function loadAdminProfile() {
        // Load admin data from localStorage or make API call
        const adminData = JSON.parse(localStorage.getItem('adminData')) || {
            name: 'Administrator User',
            email: 'admin@anrs.com',
            phone: '+250 788 123 456',
            department: 'System Administration',
            role: 'Super Admin'
        };
        
        // Update profile display
        if (profileName) profileName.textContent = adminData.name;
        if (profileEmail) profileEmail.textContent = adminData.email;
        if (fullName) fullName.textContent = adminData.name;
        if (emailAddress) emailAddress.textContent = adminData.email;
        if (phoneNumber) phoneNumber.textContent = adminData.phone;
        if (department) department.textContent = adminData.department;
        
        // Update avatar initials
        const initials = adminData.name.split(' ').map(n => n[0]).join('').toUpperCase();
        const avatars = document.querySelectorAll('.admin-user-avatar, .admin-profile-avatar-large');
        avatars.forEach(avatar => {
            avatar.textContent = initials;
        });
    }
    
    function openEditPersonalModal() {
        // Populate form with current data
        const adminData = JSON.parse(localStorage.getItem('adminData')) || {};
        document.getElementById('editFullName').value = adminData.name || '';
        document.getElementById('editEmail').value = adminData.email || '';
        document.getElementById('editPhone').value = adminData.phone || '';
        document.getElementById('editDepartment').value = adminData.department || '';
        
        editPersonalModal.classList.add('show');
    }
    
    function openChangePasswordModal() {
        // Clear form
        document.getElementById('changePasswordForm').reset();
        changePasswordModal.classList.add('show');
    }
    
    function closeModal() {
        editPersonalModal.classList.remove('show');
        changePasswordModal.classList.remove('show');
    }
    
    function handleSavePersonalInfo() {
        const formData = {
            name: document.getElementById('editFullName').value,
            email: document.getElementById('editEmail').value,
            phone: document.getElementById('editPhone').value,
            department: document.getElementById('editDepartment').value
        };
        
        // Validate form data
        if (!formData.name || !formData.email) {
            showNotification('Please fill in all required fields', 'error');
            return;
        }
        
        // Save to localStorage (in a real app, this would be an API call)
        const currentData = JSON.parse(localStorage.getItem('adminData')) || {};
        const updatedData = { ...currentData, ...formData };
        localStorage.setItem('adminData', JSON.stringify(updatedData));
        
        // Update the profile display
        loadAdminProfile();
        
        // Close modal and show success message
        closeModal();
        showNotification('Profile updated successfully', 'success');
    }
    
    function handleChangePassword() {
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        // Validate passwords
        if (!currentPassword || !newPassword || !confirmPassword) {
            showNotification('Please fill in all password fields', 'error');
            return;
        }
        
        if (newPassword !== confirmPassword) {
            showNotification('New passwords do not match', 'error');
            return;
        }
        
        if (newPassword.length < 8) {
            showNotification('Password must be at least 8 characters long', 'error');
            return;
        }
        
        // In a real app, this would validate current password and update via API
        // For demo purposes, we'll just show success
        closeModal();
        showNotification('Password changed successfully', 'success');
        
        // Clear the form
        document.getElementById('changePasswordForm').reset();
    }
    
    function handleAvatarChange() {
        // Create file input for avatar upload
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.style.display = 'none';
        
        fileInput.addEventListener('change', function(event) {
            const file = event.target.files[0];
            if (file) {
                // In a real app, you would upload this to a server
                // For demo, we'll just show a success message
                showNotification('Avatar upload feature coming soon', 'info');
            }
        });
        
        document.body.appendChild(fileInput);
        fileInput.click();
        document.body.removeChild(fileInput);
    }
    
    function handle2FASetup() {
        // In a real app, this would initiate 2FA setup process
        showNotification('Two-Factor Authentication setup coming soon', 'info');
    }
    
    function handleSessionManagement() {
        // In a real app, this would show active sessions
        showNotification('Session management feature coming soon', 'info');
    }
    
    function handleViewAllActivity() {
        // In a real app, this would navigate to a detailed activity log
        showNotification('Detailed activity log coming soon', 'info');
    }
    
    function showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `admin-notification admin-notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 10001;
            opacity: 0;
            transform: translateX(100%);
            transition: all 0.3s ease;
        `;
        
        // Set background color based on type
        switch(type) {
            case 'success':
                notification.style.backgroundColor = '#4caf50';
                break;
            case 'error':
                notification.style.backgroundColor = '#f44336';
                break;
            case 'info':
                notification.style.backgroundColor = '#2196f3';
                break;
            default:
                notification.style.backgroundColor = '#9aa0a6';
        }
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }
});