/**
 * ANRS Admin Authentication
 * Handles admin login, registration, and session management
 */

/**
 * Handle admin login
 */
async function handleAdminLogin(e) {
  e.preventDefault();

  const emailInput = document.getElementById("admin-email");
  const passwordInput = document.getElementById("admin-password");
  const errorContainer = document.getElementById("admin-login-error");
  const successContainer = document.getElementById("admin-login-success");
  const loadingOverlay = document.getElementById("loading-overlay");

  // Clear previous messages
  if (errorContainer) {
    errorContainer.classList.add("hidden");
    errorContainer.textContent = "";
  }
  if (successContainer) {
    successContainer.classList.add("hidden");
    successContainer.textContent = "";
  }

  // Validate inputs
  const email = emailInput?.value?.trim();
  const password = passwordInput?.value;

  if (!email || !password) {
    showError("Please enter both email and password.");
    return;
  }

  if (!isValidEmail(email)) {
    showError("Please enter a valid email address.");
    return;
  }

  try {
    // Show loading
    if (loadingOverlay) {
      loadingOverlay.classList.remove("hidden");
    }

    // Attempt login - use direct fetch if AdminAPI is not available
    let response;
    if (window.AdminAPI && typeof window.AdminAPI.login === "function") {
      response = await window.AdminAPI.login(email, password);
    } else {
      // Fallback to direct fetch
      console.log("Using fallback fetch for admin login");
      const fetchResponse = await fetch(
        "http://localhost:3001/api/admin/auth/admin-login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        }
      );

      response = await fetchResponse.json();

      if (!fetchResponse.ok) {
        throw new Error(response.message || response.error || "Login failed");
      }

      // Store token if provided
      if (response.token) {
        localStorage.setItem("adminToken", response.token);
      }
    }

    if (response.success) {
      showSuccess("Login successful! Redirecting to dashboard...");

      // Store admin info
      if (response.admin) {
        localStorage.setItem("adminInfo", JSON.stringify(response.admin));
      }

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "pages/dashboard.html";
      }, 1500);
    } else {
      showError(response.message || "Login failed. Please try again.");
    }
  } catch (error) {
    console.error("Login error:", error);
    showError(
      error.message ||
        "Login failed. Please check your credentials and try again."
    );
  } finally {
    // Hide loading
    if (loadingOverlay) {
      loadingOverlay.classList.add("hidden");
    }
  }
}

/**
 * Handle admin registration
 */
async function handleAdminRegistration(e) {
  e.preventDefault();

  const form = e.target;
  const formData = new FormData(form);
  const errorContainer = document.getElementById("admin-register-error");
  const successContainer = document.getElementById("admin-register-success");

  // Clear previous messages
  if (errorContainer) {
    errorContainer.classList.add("hidden");
    errorContainer.textContent = "";
  }
  if (successContainer) {
    successContainer.classList.add("hidden");
    successContainer.textContent = "";
  }

  // Get form data
  const userData = {
    name: formData.get("name")?.trim(),
    email: formData.get("email")?.trim(),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
    adminKey: formData.get("adminKey")?.trim(),
  };

  // Validate inputs
  const validation = validateRegistrationData(userData);
  if (!validation.isValid) {
    showError(validation.message);
    return;
  }

  try {
    // Show loading
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    submitBtn.innerHTML =
      '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
    submitBtn.disabled = true;

    // Attempt registration - use direct fetch if AdminAPI is not available
    let response;
    if (window.AdminAPI && typeof window.AdminAPI.register === "function") {
      response = await window.AdminAPI.register({
        name: userData.name,
        email: userData.email,
        password: userData.password,
        adminKey: userData.adminKey,
      });
    } else {
      // Fallback to direct fetch
      console.log("Using fallback fetch for admin registration");
      const fetchResponse = await fetch(
        "http://localhost:3001/api/admin/auth/admin-register",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: userData.name,
            email: userData.email,
            password: userData.password,
            adminKey: userData.adminKey,
          }),
        }
      );

      response = await fetchResponse.json();

      if (!fetchResponse.ok) {
        throw new Error(
          response.message || response.error || "Registration failed"
        );
      }

      // Store token if provided
      if (response.token) {
        localStorage.setItem("adminToken", response.token);
      }
    }

    if (response.success) {
      showSuccess("Account created successfully! Redirecting to dashboard...");

      // Store admin info
      if (response.admin) {
        localStorage.setItem("adminInfo", JSON.stringify(response.admin));
      }

      // Redirect after short delay
      setTimeout(() => {
        window.location.href = "dashboard.html";
      }, 1500);
    } else {
      showError(response.message || "Registration failed. Please try again.");
    }
  } catch (error) {
    console.error("Registration error:", error);
    showError(error.message || "Registration failed. Please try again.");
  } finally {
    // Reset button
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.innerHTML =
      '<i class="fas fa-user-plus"></i> Create Admin Account';
    submitBtn.disabled = false;
  }
}

/**
 * Validate registration data
 */
function validateRegistrationData(data) {
  if (!data.name || data.name.length < 2) {
    return {
      isValid: false,
      message: "Name must be at least 2 characters long.",
    };
  }

  if (!data.email || !isValidEmail(data.email)) {
    return { isValid: false, message: "Please enter a valid email address." };
  }

  if (!data.password || data.password.length < 6) {
    return {
      isValid: false,
      message: "Password must be at least 6 characters long.",
    };
  }

  if (data.password !== data.confirmPassword) {
    return { isValid: false, message: "Passwords do not match." };
  }

  if (!data.adminKey) {
    return { isValid: false, message: "Admin key is required." };
  }

  // Check password strength
  const passwordStrength = checkPasswordStrength(data.password);
  if (!passwordStrength.isStrong) {
    return { isValid: false, message: passwordStrength.message };
  }

  return { isValid: true };
}

/**
 * Check password strength
 */
function checkPasswordStrength(password) {
  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  if (password.length < minLength) {
    return {
      isStrong: false,
      message: `Password must be at least ${minLength} characters long.`,
    };
  }

  let score = 0;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChar) score++;

  if (score < 2) {
    return {
      isStrong: false,
      message:
        "Password should contain at least 2 of: uppercase letters, lowercase letters, numbers, special characters.",
    };
  }

  return { isStrong: true };
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Show error message
 */
function showError(message) {
  const errorContainer =
    document.getElementById("admin-login-error") ||
    document.getElementById("admin-register-error");
  if (errorContainer) {
    errorContainer.textContent = message;
    errorContainer.classList.remove("hidden");

    // Auto-hide after 5 seconds
    setTimeout(() => {
      errorContainer.classList.add("hidden");
    }, 5000);
  }
}

/**
 * Show success message
 */
function showSuccess(message) {
  const successContainer =
    document.getElementById("admin-login-success") ||
    document.getElementById("admin-register-success");
  if (successContainer) {
    successContainer.textContent = message;
    successContainer.classList.remove("hidden");
  }
}

/**
 * Check if user is authenticated admin
 */
function checkAdminAuth() {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    // Redirect to login if not on login page
    if (
      !window.location.pathname.includes("index.html") &&
      !window.location.pathname.includes("register.html")
    ) {
      window.location.href = "../index.html";
    }
    return false;
  }
  return true;
}

/**
 * Handle admin logout
 */
async function handleAdminLogout() {
  try {
    await AdminAPI.logout();
  } catch (error) {
    console.error("Logout error:", error);
  } finally {
    // Clear local storage
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminInfo");

    // Redirect to login
    window.location.href = "../index.html";
  }
}

/**
 * Get current admin info
 */
function getCurrentAdmin() {
  const adminInfo = localStorage.getItem("adminInfo");
  return adminInfo ? JSON.parse(adminInfo) : null;
}

/**
 * Initialize admin authentication
 */
function initAdminAuth() {
  // Check authentication on protected pages
  if (
    window.location.pathname.includes("/pages/") &&
    !window.location.pathname.includes("register.html")
  ) {
    checkAdminAuth();
  }

  // Set up logout handlers
  const logoutBtns = document.querySelectorAll(".admin-logout-btn");
  logoutBtns.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("Are you sure you want to logout?")) {
        handleAdminLogout();
      }
    });
  });
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", initAdminAuth);
