// ==================== SHOPPING CART INTEGRATION ====================

// Cart helper functions
function getCart() {
    const cart = localStorage.getItem('fashionCart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    localStorage.setItem('fashionCart', JSON.stringify(cart));
}

function updateCartCount() {
    const cart = getCart();
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => {
        el.textContent = count;
    });
}

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

// Add to cart function - real cart functionality
async function addToCart(productIdOrName) {
    let product;
    
    if (typeof productIdOrName === 'number') {
        product = await fetchProductById(productIdOrName);
    } else {
        const products = await fetchProducts();
        product = products.find(p => p.name === productIdOrName);
    }
    
    if (product) {
        const cart = getCart();
        const existingItem = cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1
            });
        }
        
        saveCart(cart);
        updateCartCount();
        showToast(`${product.name} added to cart!`, 'success');
    }
}

// ==================== PRODUCT DATA MANAGEMENT ====================

// Initialize - check Supabase connection first
async function initializeProducts() {
    // Try to connect to Supabase first
    await checkSupabaseConnection();
    
    // Also initialize localStorage for fallback
    initializeProductsLocal();
}

// ==================== CRUD OPERATIONS - Using Supabase ====================

// CREATE - Add a new product
async function addProduct(product) {
    const result = await createProduct(product);
    if (result && result.success) {
        return result.data;
    } else {
        console.error('Error adding product:', result?.error);
        return null;
    }
}

// READ - Get all products
async function getProducts() {
    return await fetchProducts();
}

// READ - Get products by category
async function getProductsByCategory(category) {
    return await fetchProductsByCategory(category);
}

// READ - Get single product by ID
async function getProductById(id) {
    return await fetchProductById(id);
}

// UPDATE - Update an existing product
async function updateProductDB(id, product) {
    const result = await updateProduct(id, product);
    if (result && result.success) {
        return true;
    } else {
        console.error('Error updating product:', result?.error);
        return false;
    }
}

// DELETE - Remove a product
async function deleteProductDB(id) {
    const result = await deleteProductById(id);
    if (result && result.success) {
        return true;
    } else {
        console.error('Error deleting product:', result?.error);
        return false;
    }
}

// ==================== RENDER FUNCTIONS ====================

function renderProducts(products, containerId, showCategory = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }

    products.forEach(product => {
        const card = document.createElement('div');
        card.className = 'card';
        
        let categoryLabel = '';
        if (showCategory) {
            categoryLabel = `<span class="category-badge">${product.category.toUpperCase()}</span>`;
        }

        card.innerHTML = `
            ${categoryLabel}
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
            <button onclick="addToCart('${product.name}')">Add to Cart</button>
        `;
        container.appendChild(card);
    });
}

function renderAdminProducts(products) {
    const container = document.getElementById('adminProducts');
    if (!container) return;

    container.innerHTML = '';

    if (!products || products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }

    const table = document.createElement('table');
    table.className = 'admin-table';
    table.innerHTML = `
        <thead>
            <tr><th>ID</th><th>Image</th><th>Name</th><th>Description</th><th>Price</th><th>Category</th><th>Actions</th></tr>
        </thead>
        <tbody>
            ${products.map(product => `
                <tr>
                    <td>${product.id}</td>
                    <td><img src="${product.image}" alt="${product.name}" class="product-thumb"></td>
                    <td>${product.name}</td>
                    <td>${product.description}</td>
                    <td>$${parseFloat(product.price).toFixed(2)}</td>
                    <td>${product.category}</td>
                    <td>
                        <button class="edit-btn" onclick="editProductForm(${product.id})">Edit</button>
                        <button class="delete-btn" onclick="deleteProductConfirm(${product.id})">Delete</button>
                    </td>
                </tr>
            `).join('')}
        </tbody>
    `;
    container.appendChild(table);
}

// ==================== ADMIN FORM FUNCTIONS ====================

function showProductForm(product = null) {
    const formContainer = document.getElementById('productFormContainer');
    const isEdit = product !== null;

    if (formContainer) {
        formContainer.style.display = 'block';
        formContainer.innerHTML = `
            <h3>${isEdit ? 'Edit Product' : 'Add New Product'}</h3>
            <form onsubmit="saveProduct(event, ${isEdit ? product.id : 'null'})">
                <input type="text" id="productName" placeholder="Product Name" value="${isEdit ? product.name : ''}" required>
                <textarea id="productDescription" placeholder="Product Description" required>${isEdit ? product.description : ''}</textarea>
                <input type="number" id="productPrice" placeholder="Price" step="0.01" value="${isEdit ? product.price : ''}" required>
                <input type="text" id="productImage" placeholder="Image URL" value="${isEdit ? product.image : ''}" required>
                <select id="productCategory" required>
                    <option value="">Select Category</option>
                    <option value="men" ${isEdit && product.category === 'men' ? 'selected' : ''}>Men's</option>
                    <option value="women" ${isEdit && product.category === 'women' ? 'selected' : ''}>Women's</option>
                    <option value="kids" ${isEdit && product.category === 'kids' ? 'selected' : ''}>Kids</option>
                </select>
                <button type="submit">${isEdit ? 'Update Product' : 'Add Product'}</button>
                <button type="button" onclick="hideProductForm()">Cancel</button>
            </form>
        `;
    } else {
        // Try admin.html's form container
        const adminForm = document.getElementById('productForm');
        if (adminForm) {
            adminForm.style.display = 'block';
            document.getElementById('formTitle').textContent = isEdit ? 'Edit Product' : 'Add New Product';
            document.getElementById('productId').value = isEdit ? product.id : '';
            document.getElementById('productName').value = isEdit ? product.name : '';
            document.getElementById('productDescription').value = isEdit ? product.description : '';
            document.getElementById('productPrice').value = isEdit ? product.price : '';
            document.getElementById('productImage').value = isEdit ? product.image : '';
            document.getElementById('productCategory').value = isEdit ? product.category : '';
        }
    }
}

function hideProductForm() {
    const formContainer = document.getElementById('productFormContainer');
    if (formContainer) {
        formContainer.style.display = 'none';
        formContainer.innerHTML = '';
    }
    
    const adminForm = document.getElementById('productForm');
    if (adminForm) {
        adminForm.style.display = 'none';
    }
}

async function saveProduct(event, editId = null) {
    event.preventDefault();

    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        category: document.getElementById('productCategory').value
    };

    if (editId) {
        await updateProductDB(editId, product);
        showToast('Product updated successfully!', 'success');
    } else {
        await addProduct(product);
        showToast('Product added successfully!', 'success');
    }

    hideProductForm();
    loadAdminProducts();
}

async function editProductForm(id) {
    const product = await getProductById(id);
    if (product) {
        showProductForm(product);
    }
}

async function deleteProductConfirm(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        await deleteProductDB(id);
        showToast('Product deleted successfully!', 'success');
        loadAdminProducts();
    }
}

async function loadAdminProducts() {
    const products = await getProducts();
    renderAdminProducts(products);
}

async function filterAdminProducts(category) {
    const products = await getProductsByCategory(category);
    renderAdminProducts(products);
}

function handleProductSubmit(event) {
    event.preventDefault();
    
    const productId = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        category: document.getElementById('productCategory').value
    };

    if (productId) {
        updateProductDB(parseInt(productId), product);
        showToast('Product updated successfully!', 'success');
    } else {
        addProduct(product);
        showToast('Product added successfully!', 'success');
    }

    hideProductForm();
    loadAdminProducts();
    return false;
}

// ==================== PAGE LOAD FUNCTIONS ====================

async function loadPageProducts() {
    await initializeProducts();

    const path = window.location.pathname;
    
    if (path.includes('collection.html')) {
        const products = await getProducts();
        renderProducts(products, 'productCards', true);
    }
    
    if (path.includes('mens.html')) {
        const products = await getProductsByCategory('men');
        renderProducts(products, 'productCards');
    }
    
    if (path.includes('womens.html')) {
        const products = await getProductsByCategory('women');
        renderProducts(products, 'productCards');
    }
}

// ==================== EXISTING FUNCTIONS ====================

function shopNow() {
    showToast("Welcome to our Collection Section!", 'info');
    document.getElementById("collection")?.scrollIntoView({ behavior: 'smooth' });
}

function submitForm() {
    showToast("Thank you! Your message has been sent.", 'success');
    return false;
}

// ==================== AUTH FUNCTIONS ====================

function initializeUsers() {
    initializeUsersLocal();
}

function getUsers() {
    return getUsersLocal();
}

function saveUsers(users) {
    localStorage.setItem('fashionUsers', JSON.stringify(users));
}

function emailExists(email) {
    const users = getUsers();
    return users.some(user => user.email.toLowerCase() === email.toLowerCase());
}

async function signUp(username, email, password) {
    if (!username || !email || !password) {
        return { success: false, message: 'All fields are required!' };
    }
    
    if (emailExists(email)) {
        return { success: false, message: 'Email already registered!' };
    }
    
    // Try Supabase first
    if (typeof supabase !== 'undefined') {
        const result = await signUpWithSupabase(email, password, username);
        if (result.success) {
            return { success: true, message: 'Account created successfully! Please check your email.' };
        }
    }
    
    // Local fallback
    const users = getUsers();
    const newUser = {
        id: Date.now(),
        username: username,
        email: email.toLowerCase(),
        password: password,
        createdAt: new Date().toISOString()
    };
    
    users.push(newUser);
    saveUsers(users);
    
    return { success: true, message: 'Account created successfully!' };
}

async function logIn(email, password) {
    if (!email || !password) {
        return { success: false, message: 'Email and password are required!' };
    }
    
    // Try Supabase first
    if (typeof supabase !== 'undefined') {
        const result = await signInWithSupabase(email, password);
        if (result.success) {
            const user = result.data.user;
            const userInfo = {
                id: user.id,
                username: user.user_metadata?.username || user.email.split('@')[0],
                email: user.email
            };
            localStorage.setItem('fashionCurrentUser', JSON.stringify(userInfo));
            return { success: true, message: 'Login successful!' };
        }
    }
    
    // Local fallback
    const users = getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    
    if (user) {
        const userInfo = {
            id: user.id,
            username: user.username,
            email: user.email
        };
        localStorage.setItem('fashionCurrentUser', JSON.stringify(userInfo));
        return { success: true, message: 'Login successful!' };
    }
    
    return { success: false, message: 'Invalid email or password!' };
}

function logOut() {
    if (typeof supabase !== 'undefined') {
        signOutFromSupabase();
    }
    localStorage.removeItem('fashionCurrentUser');
    window.location.href = 'index.html';
}

function getCurrentUser() {
    const user = localStorage.getItem('fashionCurrentUser');
    return user ? JSON.parse(user) : null;
}

function isLoggedIn() {
    return getCurrentUser() !== null;
}

async function handleSignUp(event) {
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
    
    const result = await signUp(username, email, password);
    
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

async function handleLogIn(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    
    const result = await logIn(email, password);
    
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

// Cart functions for cart page
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    renderCartItems();
}

function updateQuantity(productId, change) {
    const cart = getCart();
    const item = cart.find(item => item.id === productId);
    
    if (item) {
        item.quantity += change;
        
        if (item.quantity <= 0) {
            cart = cart.filter(i => i.id !== productId);
        }
        
        saveCart(cart);
        updateCartCount();
        renderCartItems();
    }
}

function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

function renderCartItems() {
    const container = document.getElementById('cartItems');
    if (!container) return;
    
    const cart = getCart();
    
    if (cart.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <h2>Your cart is empty</h2>
                <p>Start shopping to add items to your cart!</p>
                <a href="collection.html" class="btn">Shop Now</a>
            </div>
        `;
        updateCartTotal();
        return;
    }
    
    container.innerHTML = cart.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-details">
                <h3>${item.name}</h3>
                <p class="cart-item-price">$${item.price.toFixed(2)}</p>
            </div>
            <div class="cart-item-quantity">
                <button onclick="updateQuantity(${item.id}, -1)">-</button>
                <span>${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)">+</button>
            </div>
            <div class="cart-item-total">
                $${(item.price * item.quantity).toFixed(2)}
            </div>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Remove</button>
        </div>
    `).join('');
    
    updateCartTotal();
}

function updateCartTotal() {
    const totalElements = document.querySelectorAll('#cartTotal');
    const total = getCartTotal();
    totalElements.forEach(el => {
        el.textContent = total.toFixed(2);
    });
}

async function proceedToCheckout() {
    if (!isLoggedIn()) {
        showToast('Please login to checkout!', 'error');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 1500);
        return;
    }
    
    const cart = getCart();
    if (cart.length === 0) {
        showToast('Your cart is empty!', 'error');
        return;
    }
    
    // Create order in Supabase
    const user = getCurrentUser();
    const order = {
        user_id: user.id,
        items: JSON.stringify(cart),
        total: getCartTotal(),
        status: 'pending'
    };
    
    await createOrder(order);
    
    showToast('Order placed successfully! Thank you for shopping!', 'success');
    
    saveCart([]);
    updateCartCount();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

function showCart() {
    window.location.href = 'cart.html';
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', async function() {
    initializeUsers();
    await initializeProducts();
    await loadPageProducts();
    updateCartCount();
});
