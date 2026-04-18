const loginTab = document.getElementById('loginTab');
const signupTab = document.getElementById('signupTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');

const loginError = document.getElementById('loginError');
const signupError = document.getElementById('signupError');
const loginStatus = document.getElementById('loginStatus');
const signupStatus = document.getElementById('signupStatus');

const createAccountLink = document.getElementById('createAccountLink');
const forgotPasswordLink = document.getElementById('forgotPasswordLink');
const themeToggle = document.getElementById('themeToggle');

function switchForm(formType) {
  const isLogin = formType === 'login';
  loginTab.classList.toggle('active', isLogin);
  signupTab.classList.toggle('active', !isLogin);
  loginForm.classList.toggle('active', isLogin);
  signupForm.classList.toggle('active', !isLogin);
  clearMessages();
}

function clearMessages() {
  loginError.textContent = '';
  signupError.textContent = '';
  loginStatus.textContent = '';
  signupStatus.textContent = '';
  loginStatus.classList.remove('error-text');
  signupStatus.classList.remove('error-text');
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validateSignupInput(data) {
  if (!data.fullName || data.fullName.length < 3) {
    return 'Full Name must be at least 3 characters.';
  }
  if (!isValidEmail(data.email)) {
    return 'Please enter a valid email address.';
  }
  if (!/^\d{10}$/.test(data.phoneNumber)) {
    return 'Phone Number must be exactly 10 digits.';
  }
  if (data.password.length < 6) {
    return 'Password must be at least 6 characters.';
  }
  if (data.password !== data.confirmPassword) {
    return 'Password and Confirm Password must match.';
  }
  return '';
}

function getUsers() {
  const stored = localStorage.getItem('safeNestUsers');
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users) {
  localStorage.setItem('safeNestUsers', JSON.stringify(users));
}

loginTab.addEventListener('click', function () {
  switchForm('login');
});

signupTab.addEventListener('click', function () {
  switchForm('signup');
});

createAccountLink.addEventListener('click', function (event) {
  event.preventDefault();
  switchForm('signup');
});

forgotPasswordLink.addEventListener('click', function (event) {
  event.preventDefault();
  loginStatus.textContent = 'Password reset flow will be added later.';
  loginStatus.classList.remove('error-text');
});

signupForm.addEventListener('submit', function (event) {
  event.preventDefault();
  clearMessages();

  const signupData = {
    fullName: document.getElementById('fullName').value.trim(),
    email: document.getElementById('signupEmail').value.trim().toLowerCase(),
    phoneNumber: document.getElementById('phoneNumber').value.trim(),
    password: document.getElementById('signupPassword').value,
    confirmPassword: document.getElementById('confirmPassword').value
  };

  const validationError = validateSignupInput(signupData);
  if (validationError) {
    signupError.textContent = validationError;
    return;
  }

  const users = getUsers();
  const existingUser = users.find(function (user) {
    return user.email === signupData.email;
  });

  if (existingUser) {
    signupError.textContent = 'Account already exists with this email.';
    return;
  }

  users.push({
    fullName: signupData.fullName,
    email: signupData.email,
    phoneNumber: signupData.phoneNumber,
    password: signupData.password
  });

  saveUsers(users);
  signupStatus.textContent = 'Sign up successful. You can now login.';
  signupForm.reset();
  switchForm('login');
});

loginForm.addEventListener('submit', function (event) {
  event.preventDefault();
  clearMessages();

  const email = document.getElementById('loginEmail').value.trim().toLowerCase();
  const password = document.getElementById('loginPassword').value;

  if (!isValidEmail(email)) {
    loginError.textContent = 'Please enter a valid email address.';
    return;
  }

  if (!password) {
    loginError.textContent = 'Please enter your password.';
    return;
  }

  const users = getUsers();
  const matchedUser = users.find(function (user) {
    return user.email === email && user.password === password;
  });

  if (!matchedUser) {
    loginStatus.textContent = 'Invalid email or password.';
    loginStatus.classList.add('error-text');
    return;
  }

  loginStatus.textContent = 'Login successful. Welcome, ' + matchedUser.fullName + '!';
  localStorage.setItem('safeNestCurrentUser', JSON.stringify(matchedUser));
  loginForm.reset();
  window.location.href = 'dashboard.html';
});

themeToggle.addEventListener('click', function () {
  document.body.classList.toggle('dark');
});
