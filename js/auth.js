/**
 * Balanced Diet Recommendation System for Rwandan Parents
 * Authentication JavaScript File
 */

/**
 * Handle user login
 * @param {Event} e - Form submit event
 */
function handleLogin(e) {
  e.preventDefault();
  console.log("Login form submitted");

  const emailInput = document.getElementById("login-email");
  const passwordInput = document.getElementById("login-password");
  const errorContainer = document.getElementById("login-error");

  console.log("Login form elements:", {
    emailInput,
    passwordInput,
    errorContainer,
  });

  if (!emailInput || !passwordInput) {
    console.error("Login form elements not found");
    return;
  }

  const email = emailInput.value.trim();
  const password = passwordInput.value;

  // Basic validation
  if (!email || !password) {
    if (errorContainer) {
      errorContainer.textContent = "Please enter both email and password.";
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  // Get users from localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Find user with matching email
  const user = users.find((u) => u.email === email);

  if (!user || user.password !== password) {
    if (errorContainer) {
      errorContainer.textContent = "Invalid email or password.";
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  // Login successful
  console.log("Login successful for user:", user.email);

  // Store current user in localStorage (excluding password)
  try {
    const { password: _, ...userWithoutPassword } = user;
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
    console.log("Current user saved to localStorage:", userWithoutPassword);
  } catch (error) {
    console.error("Error saving current user to localStorage:", error);
  }

  // Show success message before redirecting
  if (errorContainer) {
    errorContainer.textContent =
      "Login successful! Redirecting to dashboard...";
    errorContainer.classList.remove("hidden");
    errorContainer.style.backgroundColor = "#e8f5e9";
    errorContainer.style.color = "#2e7d32";
  }

  console.log("Login successful, redirecting to dashboard...");

  // Redirect to dashboard after a short delay
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1500);
}

/**
 * Handle user registration
 * @param {Event} e - Form submit event
 */
function handleRegister(e) {
  e.preventDefault();
  console.log("Registration form submitted");

  const nameInput = document.getElementById("register-name");
  const emailInput = document.getElementById("register-email");
  const passwordInput = document.getElementById("register-password");
  const confirmPasswordInput = document.getElementById(
    "register-confirm-password"
  );
  const errorContainer = document.getElementById("register-error");

  console.log("Form elements:", {
    nameInput,
    emailInput,
    passwordInput,
    confirmPasswordInput,
    errorContainer,
  });

  if (!nameInput || !emailInput || !passwordInput || !confirmPasswordInput)
    return;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  // Basic validation
  if (!name || !email || !password || !confirmPassword) {
    if (errorContainer) {
      errorContainer.textContent = "Please fill in all fields.";
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  if (password !== confirmPassword) {
    if (errorContainer) {
      errorContainer.textContent = "Passwords do not match.";
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  // Get existing users from localStorage
  const users = JSON.parse(localStorage.getItem("users") || "[]");

  // Check if email already exists
  if (users.some((user) => user.email === email)) {
    if (errorContainer) {
      errorContainer.textContent = "Email already registered.";
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  // Create new user
  const newUser = {
    id: Date.now().toString(),
    name,
    email,
    password,
    createdAt: new Date().toISOString(),
  };

  console.log("Creating new user:", newUser);

  // Add to users array
  users.push(newUser);

  // Save to localStorage
  try {
    localStorage.setItem("users", JSON.stringify(users));
    console.log("Users saved to localStorage:", users);
  } catch (error) {
    console.error("Error saving users to localStorage:", error);
    if (errorContainer) {
      errorContainer.textContent = "Error creating account: " + error.message;
      errorContainer.classList.remove("hidden");
    }
    return;
  }

  // Store current user in localStorage (excluding password)
  try {
    const { password: _, ...userWithoutPassword } = newUser;
    localStorage.setItem("currentUser", JSON.stringify(userWithoutPassword));
    console.log("Current user saved to localStorage:", userWithoutPassword);
  } catch (error) {
    console.error("Error saving current user to localStorage:", error);
  }

  // Show success message before redirecting
  if (errorContainer) {
    errorContainer.textContent =
      "Account created successfully! Redirecting to dashboard...";
    errorContainer.classList.remove("hidden");
    errorContainer.style.backgroundColor = "#e8f5e9";
    errorContainer.style.color = "#2e7d32";
  }

  console.log("Registration successful, redirecting to dashboard...");

  // Redirect to dashboard after a short delay
  setTimeout(() => {
    window.location.href = "dashboard.html";
  }, 1500);
}

/**
 * Handle user logout
 */
function handleLogout() {
  // Log the logout activity if on dashboard
  if (
    window.location.pathname.includes("dashboard.html") &&
    typeof logUserActivity === "function"
  ) {
    logUserActivity("logout");
  }

  // Remove current user from localStorage
  localStorage.removeItem("currentUser");

  // Redirect to home page
  window.location.href = "home.html";
}

/**
 * Toggle between login and register forms
 */
function toggleAuthForms() {
  const loginForm = document.getElementById("login-form-container");
  const registerForm = document.getElementById("register-form-container");
  const toggleBtn = document.getElementById("toggle-auth-btn");

  if (!loginForm || !registerForm || !toggleBtn) return;

  if (loginForm.classList.contains("hidden")) {
    // Show login form
    loginForm.classList.remove("hidden");
    registerForm.classList.add("hidden");
    toggleBtn.textContent = "Need an account? Register";
  } else {
    // Show register form
    loginForm.classList.add("hidden");
    registerForm.classList.remove("hidden");
    toggleBtn.textContent = "Already have an account? Login";
  }
}
