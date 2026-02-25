// ==================== USER AUTHENTICATION ====================

// Initialize users in localStorage if not present
function initializeUsers() {
    if (!localStorage.getItem('fashionUsers')) {
        // Create default admin user
        const defaultAdmin = {
            id: 1,
            username: 'admin',
            email: 'admin@fashionhub.com',
            password: 'admin123',
            role: 'admin',
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('fashionUsers', JSON.stringify([defaultAdmin]));
    }
}

// Get all users
function getUsers() {
    initializeUsers();
    return JSON.parse(localStorage.getItem('fashionUsers'));
}

// Save users to localStorage
function saveUsers(users) {
    localStorage.setItem('fashionUsers', JSON.stringify(users));
}

// Check if email already exists
function emailExists(email) {
    const users = getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

// Sign up new user (default role is 'user')
function signUp(username, email, password) {
    if (!username || !email || !password) {
        return { success: false, message: 'All fields are required!' };
    }
    
    if (emailExists(email)) {
        return { success: false, message: 'Email already registered!' };
    }
    
    const users = getUsers();
    const newUser = {
        id: Date.now(),
        username: username,
        email: email.toLowerCase(),
        password: password,
        role: 'user',
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Account created successfully!' };
}

// Log in user
function logIn(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email and password are required!' };
    }
    
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        const userInfo = {
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role || 'user'
        };
        localStorage.setItem('fashionCurrentUser', JSON.stringify(userInfo));
        return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid email or password!' };
}

// Log out user
function logOut() {
    localStorage.removeItem('fashionCurrentUser');
    window.location.href = 'index.html';
}

// Get current logged in user
function getCurrentUser() {
    const user = localStorage.getItem('fashionCurrentUser');
    return user ? JSON.parse(user) : null;
}

// Check if user is logged in
function isLoggedIn() {
    return getCurrentUser() !== null;
}

// Check if user is admin
function isAdmin() {
    const user = getCurrentUser();
    return user && user.role === 'admin';
}

// Update navigation based on login status
function updateAuthNav() {
    const navList = document.querySelector('nav ul');
    if (!navList) return;
    
    const user = getCurrentUser();
    let authHTML = '';
    
    if (user) {
        authHTML = `
            <li><a href="#" onclick="showCart()">🛒 Cart (<span id="cartCount">${getCartCount()}</span>)</a></li>
            <li><span class="user-greeting">Hi, ${user.username}</span></li>
            <li><a href="#" onclick="logOut()">Logout</a></li>
        `;
    } else {
        authHTML = `
            <li><a href="login.html">Login</a></li>
            <li><a href="signup.html">Sign Up</a></li>
        `;
    }
    
    const existingAuth = navList.querySelectorAll('.auth-item');
    existingAuth.forEach(item => item.remove());
    
    const lastItems = navList.querySelectorAll('li');
    if (lastItems.length > 0) {
        const authContainer = document.createElement('div');
        authContainer.className = 'auth-items';
        authContainer.innerHTML = authHTML;
        navList.insertBefore(authContainer, navList.lastElementChild);
    }
}

// Handle signup form submission
function handleSignUp(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (password !== confirmPassword) {
        showToast('Passwords do not match!', 'error');
        return false;
    }
    
    if (password.length < 6) {
        showToast('Password must be at least 6 characters!', 'error');
        return false;
    }
    
    const result = signUp(username, email, password);
    
    if (result.success) {
        showToast(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
    } else {
        showToast(result.message, 'error');
    }
    
    return false;
}

// Handle login form submission
function handleLogIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = logIn(email, password);
    
    if (result.success) {
        showToast(result.message, 'success');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    } else {
        showToast(result.message, 'error');
    }
    
    return false;
}

// Show toast notification
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerText = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => toast.classList.add('show'), 10);
    
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Initialize auth on page load
document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    if (document.querySelector('nav')) {
        updateAuthNav();
    }
});
