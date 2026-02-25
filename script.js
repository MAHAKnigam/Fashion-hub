// ==================== FASHION HUB - UNIFIED SCRIPT ====================
// This file handles all CRUD operations, cart, auth, and product management

// ==================== PRODUCT DATA WITH SUB-CATEGORIES ====================

// Sub-category definitions
const SUB_CATEGORIES = {
    men: ['Shirts', 'Pants', 'Jackets', 'Shoes', 'Accessories'],
    women: ['Dresses', 'Tops', 'Pants', 'Shoes', 'Accessories'],
    kids: ['Boys', 'Girls', 'Shoes', 'Accessories']
};

// Main categories
const MAIN_CATEGORIES = ['men', 'women', 'kids'];

// Initialize products in localStorage with sample data
function initializeProducts() {
    const defaultProducts = [
        // ==================== MEN'S COLLECTION ====================
        // Shirts
        { id: 1, name: "Casual Button-Down Shirt", description: "Comfortable cotton shirt perfect for everyday wear.", price: 34.99, image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", category: "men", subCategory: "Shirts" },
        { id: 2, name: "Premium Cotton T-Shirt", description: "Soft and comfortable crew neck t-shirt in multiple colors.", price: 24.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", category: "men", subCategory: "Shirts" },
        { id: 3, name: "Classic Polo Shirt", description: "Elegant polo shirt for casual and semi-formal occasions.", price: 39.99, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400", category: "men", subCategory: "Shirts" },
        
        // Pants
        { id: 4, name: "Slim Fit Denim Jeans", description: "Modern slim fit jeans with premium denim quality.", price: 59.99, image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", category: "men", subCategory: "Pants" },
        { id: 5, name: "Formal Dress Pants", description: "Professional dress pants with perfect tailoring.", price: 79.99, image: "https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=400", category: "men", subCategory: "Pants" },
        { id: 6, name: "Athletic Running Shorts", description: "Lightweight shorts perfect for workouts.", price: 29.99, image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400", category: "men", subCategory: "Pants" },
        
        // Jackets
        { id: 7, name: "Classic Navy Blazer", description: "Elegant blazer suitable for business occasions.", price: 149.99, image: "https://images.unsplash.com/photo-1507679799987-c73779587ccf?w=400", category: "men", subCategory: "Jackets" },
        { id: 8, name: "Leather Biker Jacket", description: "Stylish genuine leather jacket for a bold look.", price: 199.99, image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", category: "men", subCategory: "Jackets" },
        { id: 9, name: "Wool Blend Sweater", description: "Warm and cozy sweater perfect for winter.", price: 69.99, image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400", category: "men", subCategory: "Jackets" },
        { id: 10, name: "Casual Hoodie", description: "Comfortable pullover hoodie for everyday comfort.", price: 49.99, image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", category: "men", subCategory: "Jackets" },
        
        // Shoes
        { id: 11, name: "Leather Dress Shoes", description: "Classic leather shoes for formal occasions.", price: 119.99, image: "https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=400", category: "men", subCategory: "Shoes" },
        { id: 12, name: "Athletic Sneakers", description: "Comfortable sneakers for everyday wear.", price: 79.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", category: "men", subCategory: "Shoes" },
        
        // Accessories
        { id: 13, name: "Leather Belt", description: "Genuine leather belt with classic buckle.", price: 39.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", category: "men", subCategory: "Accessories" },
        { id: 14, name: "Classic Watch", description: "Elegant timepiece for every occasion.", price: 149.99, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400", category: "men", subCategory: "Accessories" },
        { id: 15, name: "Sunglasses", description: "Stylish sunglasses for sun protection.", price: 29.99, image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", category: "men", subCategory: "Accessories" },
        
        // ==================== WOMEN'S COLLECTION ====================
        // Dresses
        { id: 16, name: "Floral Summer Dress", description: "Light and breezy dress with beautiful floral print.", price: 59.99, image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", category: "women", subCategory: "Dresses" },
        { id: 17, name: "Elegant Evening Gown", description: "Stunning floor-length gown for special occasions.", price: 199.99, image: "https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=400", category: "women", subCategory: "Dresses" },
        { id: 18, name: "Cocktail Party Dress", description: "Perfect dress for parties and formal events.", price: 89.99, image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", category: "women", subCategory: "Dresses" },
        
        // Tops
        { id: 19, name: "Silk Blouse", description: "Elegant silk blouse suitable for office wear.", price: 79.99, image: "https://images.unsplash.com/photo-1598554747436-c9293d6a588f?w=400", category: "women", subCategory: "Tops" },
        { id: 20, name: "Casual T-Shirt", description: "Comfortable cotton t-shirt for everyday wear.", price: 24.99, image: "https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400", category: "women", subCategory: "Tops" },
        { id: 21, name: "Crop Top", description: "Trendy crop top for casual outings.", price: 29.99, image: "https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=400", category: "women", subCategory: "Tops" },
        
        // Pants
        { id: 22, name: "High-Waist Jeans", description: "Trendy high-waist jeans with perfect fit.", price: 69.99, image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", category: "women", subCategory: "Pants" },
        { id: 23, name: "Leggings", description: "Comfortable and stretchy leggings.", price: 34.99, image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=400", category: "women", subCategory: "Pants" },
        { id: 24, name: "Palazzo Pants", description: "Flowy palazzo pants for elegant looks.", price: 54.99, image: "https://images.unsplash.com/photo-1509631179647-0177331693ae?w=400", category: "women", subCategory: "Pants" },
        
        // Shoes
        { id: 25, name: "Leather Heels", description: "Elegant leather heels for formal occasions.", price: 89.99, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400", category: "women", subCategory: "Shoes" },
        { id: 26, name: "Ballet Flats", description: "Comfortable flats for everyday wear.", price: 49.99, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400", category: "women", subCategory: "Shoes" },
        { id: 27, name: "Ankle Boots", description: "Stylish boots for fall and winter.", price: 99.99, image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400", category: "women", subCategory: "Shoes" },
        
        // Accessories
        { id: 28, name: "Designer Handbag", description: "Premium leather handbag with stylish design.", price: 129.99, image: "https://images.unsplash.com/photo-1606760227091-3dd870d97f1d?w=400", category: "women", subCategory: "Accessories" },
        { id: 29, name: "Statement Necklace", description: "Beautiful necklace to complete any outfit.", price: 29.99, image: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=400", category: "women", subCategory: "Accessories" },
        { id: 30, name: "Scarf", description: "Elegant scarf for all seasons.", price: 24.99, image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", category: "women", subCategory: "Accessories" },
        
        // ==================== KIDS COLLECTION ====================
        // Boys
        { id: 31, name: "Boys T-Shirt Set", description: "Pack of 3 comfortable cotton t-shirts.", price: 24.99, image: "https://images.unsplash.com/photo-1621452773781-0f992ee03591?w=400", category: "kids", subCategory: "Boys" },
        { id: 32, name: "Boys Denim Jeans", description: "Durable denim jeans for active kids.", price: 29.99, image: "https://images.unsplash.com/photo-1519234939596-022d7d3a2986?w=400", category: "kids", subCategory: "Boys" },
        { id: 33, name: "Boys Polo Shirt", description: "Classic polo shirt in soft cotton.", price: 19.99, image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400", category: "kids", subCategory: "Boys" },
        { id: 34, name: "Boys Shorts Pack", description: "Pack of 2 casual shorts for summer.", price: 22.99, image: "https://images.unsplash.com/photo-1560243563-062bfc001d68?w=400", category: "kids", subCategory: "Boys" },
        
        // Girls
        { id: 35, name: "Girls Floral Dress", description: "Cute and colorful dress with floral pattern.", price: 34.99, image: "https://images.unsplash.com/photo-1519457431-44ccd64a579b?w=400", category: "kids", subCategory: "Girls" },
        { id: 36, name: "Girls Leggings", description: "Comfortable and stretchy leggings.", price: 19.99, image: "https://images.unsplash.com/photo-1519234939596-022d7d3a2f2?w=400", category: "kids", subCategory: "Girls" },
        { id: 37, name: "Girls Skirt Set", description: "Adorable skirt with matching bow set.", price: 29.99, image: "https://images.unsplash.com/photo-1519257624325-496c9e4c4c5a?w=400", category: "kids", subCategory: "Girls" },
        
        // Shoes
        { id: 38, name: "Kids Sneakers", description: "Comfortable sneakers for active kids.", price: 44.99, image: "https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=400", category: "kids", subCategory: "Shoes" },
        { id: 39, name: "Kids Sandals", description: "Comfortable sandals for summer.", price: 29.99, image: "https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400", category: "kids", subCategory: "Shoes" },
        
        // Accessories
        { id: 40, name: "Kids Cap", description: "Cute cap for sun protection.", price: 14.99, image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", category: "kids", subCategory: "Accessories" },
        { id: 41, name: "Kids Winter Jacket", description: "Warm and waterproof jacket.", price: 59.99, image: "https://images.unsplash.com/photo-1519234939596-022d7d3a2f21?w=400", category: "kids", subCategory: "Accessories" }
    ];

    if (!localStorage.getItem('fashionProducts')) {
        localStorage.setItem('fashionProducts', JSON.stringify(defaultProducts));
        console.log('Products initialized with sub-categories!');
    } else {
        // Check if products have subCategory field, if not, update them
        const existingProducts = JSON.parse(localStorage.getItem('fashionProducts'));
        const needsUpdate = !existingProducts.some(p => p.subCategory);
        
        if (needsUpdate) {
            // Assign sub-categories based on product name/type
            const updatedProducts = existingProducts.map((product, index) => {
                // Try to infer sub-category from product name
                const name = product.name.toLowerCase();
                let subCategory = 'Other';
                
                if (product.category === 'men') {
                    if (name.includes('shirt') || name.includes('t-shirt') || name.includes('polo')) subCategory = 'Shirts';
                    else if (name.includes('jean') || name.includes('pant') || name.includes('short')) subCategory = 'Pants';
                    else if (name.includes('jacket') || name.includes('blazer') || name.includes('hoodie') || name.includes('sweater')) subCategory = 'Jackets';
                    else if (name.includes('shoe') || name.includes('sneaker')) subCategory = 'Shoes';
                    else if (name.includes('belt') || name.includes('watch') || name.includes('sunglass')) subCategory = 'Accessories';
                    else subCategory = SUB_CATEGORIES.men[index % SUB_CATEGORIES.men.length];
                } else if (product.category === 'women') {
                    if (name.includes('dress') || name.includes('gown')) subCategory = 'Dresses';
                    else if (name.includes('top') || name.includes('blouse') || name.includes('crop')) subCategory = 'Tops';
                    else if (name.includes('jean') || name.includes('pant') || name.includes('legging')) subCategory = 'Pants';
                    else if (name.includes('heel') || name.includes('boot') || name.includes('flat') || name.includes('shoe')) subCategory = 'Shoes';
                    else if (name.includes('bag') || name.includes('necklace') || name.includes('scarf')) subCategory = 'Accessories';
                    else subCategory = SUB_CATEGORIES.women[index % SUB_CATEGORIES.women.length];
                } else if (product.category === 'kids') {
                    if (name.includes('boy')) subCategory = 'Boys';
                    else if (name.includes('girl')) subCategory = 'Girls';
                    else if (name.includes('shoe') || name.includes('sandal') || name.includes('sneaker')) subCategory = 'Shoes';
                    else subCategory = SUB_CATEGORIES.kids[index % SUB_CATEGORIES.kids.length];
                }
                
                return { ...product, subCategory };
            });
            
            localStorage.setItem('fashionProducts', JSON.stringify(updatedProducts));
            console.log('Products updated with sub-categories!');
        }
    }
}

// ==================== CRUD OPERATIONS ====================

// CREATE - Add a new product
function addProduct(product) {
    const products = getProducts();
    product.id = Date.now(); // Generate unique ID
    product.createdAt = new Date().toISOString();
    products.push(product);
    localStorage.setItem('fashionProducts', JSON.stringify(products));
    console.log('Product added:', product.name);
    return product;
}

// READ - Get all products
function getProducts() {
    const products = localStorage.getItem('fashionProducts');
    return products ? JSON.parse(products) : [];
}

// READ - Get products by main category
function getProductsByCategory(category) {
    const products = getProducts();
    if (category === 'all' || !category) return products;
    return products.filter(p => p.category === category);
}

// READ - Get products by sub-category
function getProductsBySubCategory(subCategory) {
    const products = getProducts();
    if (!subCategory || subCategory === 'all') return products;
    return products.filter(p => p.subCategory === subCategory);
}

// READ - Get products by main AND sub category
function getProductsByCategoryAndSub(category, subCategory) {
    let products = getProductsByCategory(category);
    if (subCategory && subCategory !== 'all') {
        products = products.filter(p => p.subCategory === subCategory);
    }
    return products;
}

// READ - Get single product by ID
function getProductById(id) {
    const products = getProducts();
    return products.find(p => p.id === id);
}

// UPDATE - Update an existing product
function updateProduct(id, updatedProduct) {
    const products = getProducts();
    const index = products.findIndex(p => p.id === id);
    if (index !== -1) {
        updatedProduct.id = id;
        updatedProduct.updatedAt = new Date().toISOString();
        products[index] = { ...products[index], ...updatedProduct };
        localStorage.setItem('fashionProducts', JSON.stringify(products));
        console.log('Product updated:', updatedProduct.name);
        return true;
    }
    return false;
}

// DELETE - Remove a product
function deleteProduct(id) {
    const products = getProducts();
    const filteredProducts = products.filter(p => p.id !== id);
    localStorage.setItem('fashionProducts', JSON.stringify(filteredProducts));
    console.log('Product deleted, ID:', id);
    return filteredProducts;
}

// ==================== SHOPPING CART ====================

// Get cart from localStorage
function getCart() {
    const cart = localStorage.getItem('fashionCart');
    return cart ? JSON.parse(cart) : [];
}

// Save cart to localStorage
function saveCart(cart) {
    localStorage.setItem('fashionCart', JSON.stringify(cart));
}

// Get cart item count
function getCartCount() {
    const cart = getCart();
    return cart.reduce((total, item) => total + item.quantity, 0);
}

// Add item to cart
function addToCart(productIdOrName) {
    let product;
    
    if (typeof productIdOrName === 'number') {
        product = getProductById(productIdOrName);
    } else {
        const products = getProducts();
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

// Remove item from cart
function removeFromCart(productId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== productId);
    saveCart(cart);
    updateCartCount();
    renderCartItems();
}

// Update item quantity
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

// Calculate cart total
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
}

// Update cart count in navigation
function updateCartCount() {
    const cartCountElements = document.querySelectorAll('#cartCount');
    cartCountElements.forEach(el => {
        el.textContent = getCartCount();
    });
}

// Show cart (navigate to cart page)
function showCart() {
    window.location.href = 'cart.html';
}

// Render cart items on cart page
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

// Update cart total display
function updateCartTotal() {
    const totalElements = document.querySelectorAll('#cartTotal');
    const total = getCartTotal();
    totalElements.forEach(el => {
        el.textContent = total.toFixed(2);
    });
}

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

// ==================== RENDER FUNCTIONS ====================

// Render products to a container
function renderProducts(products, containerId, showCategory = false) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p class="no-products">No products found.</p>';
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
            <img src="${product.image}" alt="${product.name}" onerror="this.src='https://via.placeholder.com/300x250?text=No+Image'">
            <div class="card-content">
                <h3>${product.name}</h3>
                <p>${product.description}</p>
                <p class="price">$${parseFloat(product.price).toFixed(2)}</p>
                <button onclick="addToCart('${product.name}')">Add to Cart</button>
            </div>
        `;
        container.appendChild(card);
    });
}

// Render products for admin panel
function renderAdminProducts(products) {
    const container = document.getElementById('adminProducts');
    if (!container) {
        // Try alternative container ID
        const altContainer = document.getElementById('adminProductList');
        if (!altContainer) return;
        
        renderAdminProductsTable(altContainer, products);
        return;
    }

    renderAdminProductsTable(container, products);
}

function renderAdminProductsTable(container, products) {
    container.innerHTML = '';

    if (products.length === 0) {
        container.innerHTML = '<p>No products found.</p>';
        return;
    }

    let tableHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Sub-Category</th>
                    <th>Price</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
    `;

    products.forEach(product => {
        tableHTML += `
            <tr>
                <td>${product.id}</td>
                <td><img src="${product.image}" alt="${product.name}" class="product-thumb" onerror="this.src='https://via.placeholder.com/60?text=N/A'"></td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${product.subCategory || 'N/A'}</td>
                <td>$${parseFloat(product.price).toFixed(2)}</td>
                <td>
                    <button class="edit-btn" onclick="editProductForm(${product.id})">Edit</button>
                    <button class="delete-btn" onclick="deleteProductConfirm(${product.id})">Delete</button>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody></table>';
    container.innerHTML = tableHTML;
}

// ==================== ADMIN FORM FUNCTIONS ====================

// Show add/edit product form
function showProductForm(product = null) {
    const formContainer = document.getElementById('productForm');
    const isEdit = product !== null;

    if (formContainer) {
        formContainer.style.display = 'block';
        
        const formTitle = document.getElementById('formTitle');
        if (formTitle) {
            formTitle.textContent = isEdit ? 'Edit Product' : 'Add New Product';
        }
        
        // Set form values
        const productIdInput = document.getElementById('productId');
        const productNameInput = document.getElementById('productName');
        const productDescInput = document.getElementById('productDescription');
        const productPriceInput = document.getElementById('productPrice');
        const productImageInput = document.getElementById('productImage');
        const productCategorySelect = document.getElementById('productCategory');
        
        if (productIdInput) productIdInput.value = isEdit ? product.id : '';
        if (productNameInput) productNameInput.value = isEdit ? product.name : '';
        if (productDescInput) productDescInput.value = isEdit ? product.description : '';
        if (productPriceInput) productPriceInput.value = isEdit ? product.price : '';
        if (productImageInput) productImageInput.value = isEdit ? product.image : '';
        if (productCategorySelect && isEdit) {
            productCategorySelect.value = product.category;
            // Update sub-category dropdown
            updateSubCategoryOptions(product.category, product.subCategory);
        }
    } else {
        console.error('Product form container not found');
    }
}

// Hide product form
function hideProductForm() {
    const formContainer = document.getElementById('productForm');
    if (formContainer) {
        formContainer.style.display = 'none';
    }
    
    // Reset form
    const form = formContainer?.querySelector('form');
    if (form) form.reset();
}

// Update sub-category options based on main category
function updateSubCategoryOptions(category, selectedSubCategory = '') {
    const subCategorySelect = document.getElementById('productSubCategory');
    if (!subCategorySelect) return;
    
    subCategorySelect.innerHTML = '<option value="">Select Sub-Category</option>';
    
    if (category && SUB_CATEGORIES[category]) {
        SUB_CATEGORIES[category].forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat;
            option.textContent = subCat;
            if (subCat === selectedSubCategory) {
                option.selected = true;
            }
            subCategorySelect.appendChild(option);
        });
    }
}

// Save product (create or update)
function handleProductSubmit(event) {
    event.preventDefault();

    const productId = document.getElementById('productId').value;
    const product = {
        name: document.getElementById('productName').value,
        description: document.getElementById('productDescription').value,
        price: parseFloat(document.getElementById('productPrice').value),
        image: document.getElementById('productImage').value,
        category: document.getElementById('productCategory').value,
        subCategory: document.getElementById('productSubCategory')?.value || 'Other'
    };

    if (productId) {
        // Update existing product
        updateProduct(parseInt(productId), product);
        showToast('Product updated successfully!', 'success');
    } else {
        // Create new product
        addProduct(product);
        showToast('Product added successfully!', 'success');
    }

    hideProductForm();
    loadAdminProducts();
    
    // Reload page products if on collection/mens/womens pages
    loadPageProducts();
}

// Edit product - populate form
function editProductForm(id) {
    const product = getProductById(id);
    if (product) {
        showProductForm(product);
    }
}

// Delete product with confirmation
function deleteProductConfirm(id) {
    if (confirm('Are you sure you want to delete this product?')) {
        deleteProduct(id);
        showToast('Product deleted successfully!', 'success');
        loadAdminProducts();
        loadPageProducts();
    }
}

// Load admin products
function loadAdminProducts() {
    const products = getProducts();
    renderAdminProducts(products);
}

// Filter admin products by category
function filterAdminProducts(category) {
    const products = getProductsByCategory(category);
    renderAdminProducts(products);
}

// Filter admin products by sub-category
function filterAdminProductsBySub(category, subCategory) {
    const products = getProductsByCategoryAndSub(category, subCategory);
    renderAdminProducts(products);
}

// ==================== TOAST NOTIFICATIONS ====================

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

// ==================== PAGE LOAD FUNCTIONS ====================

// Load products based on current page
function loadPageProducts() {
    initializeProducts(); // Ensure products are initialized

    const path = window.location.pathname;
    const filename = path.split('/').pop();
    
    // Collection page - show all products
    if (filename === 'collection.html') {
        const products = getProducts();
        renderProducts(products, 'productCards', true);
    }
    
    // Men's page - show men's products
    if (filename === 'mens.html') {
        const products = getProductsByCategory('men');
        renderProducts(products, 'productCards');
    }
    
    // Women's page - show women's products
    if (filename === 'womens.html') {
        const products = getProductsByCategory('women');
        renderProducts(products, 'productCards');
    }
}

// Load sub-categories for filter dropdown
function loadSubCategories(category, containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<option value="all">All Sub-Categories</option>';
    
    if (category && SUB_CATEGORIES[category]) {
        SUB_CATEGORIES[category].forEach(subCat => {
            const option = document.createElement('option');
            option.value = subCat;
            option.textContent = subCat;
            container.appendChild(option);
        });
    }
}

// Filter products by sub-category on page
function filterBySubCategory(category, subCategory) {
    const products = getProductsByCategoryAndSub(category, subCategory);
    renderProducts(products, 'productCards');
}

// ==================== CHECKOUT ====================

function proceedToCheckout() {
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
    
    // Save order to localStorage
    const user = getCurrentUser();
    const order = {
        id: Date.now(),
        userId: user.id,
        items: cart,
        total: getCartTotal(),
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    
    const orders = JSON.parse(localStorage.getItem('fashionOrders') || '[]');
    orders.push(order);
    localStorage.setItem('fashionOrders', JSON.stringify(orders));
    
    showToast('Order placed successfully! Thank you for shopping!', 'success');
    
    // Clear cart
    saveCart([]);
    updateCartCount();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// ==================== NAVIGATION ====================

// Update navigation based on login status
function updateNavigation() {
    const user = getCurrentUser();
    
// Admin link
    const adminLink = document.getElementById('adminLink');
    if (adminLink) {
        adminLink.style.display = (user && user.role === 'admin') ? 'block' : 'none';
    }
    
    // Cart link - hide if not logged in
    const cartLinks = document.querySelectorAll('#navMenu li a[href="cart.html"]');
    cartLinks.forEach(cartLink => {
        const parentLi = cartLink.parentElement;
        if (parentLi) {
            parentLi.style.display = user ? 'block' : 'none';
        }
    });
    
    // Login/Signup links
    const loginLink = document.getElementById('loginLink');
    const signupLink = document.getElementById('signupLink');
    const userLink = document.getElementById('userLink');
    const logoutLink = document.getElementById('logoutLink');
    
    if (user) {
        if (loginLink) loginLink.style.display = 'none';
        if (signupLink) signupLink.style.display = 'none';
        if (userLink) {
            userLink.style.display = 'block';
            const greeting = userLink.querySelector('.user-greeting');
            if (greeting) {
                greeting.textContent = 'Hi, ' + user.username + (user.role === 'admin' ? ' (Admin)' : '');
            }
        }
        if (logoutLink) logoutLink.style.display = 'block';
    } else {
        if (loginLink) loginLink.style.display = 'block';
        if (signupLink) signupLink.style.display = 'block';
        if (userLink) userLink.style.display = 'none';
        if (logoutLink) logoutLink.style.display = 'none';
    }
}

// ==================== EXISTING FUNCTIONS ====================

function shopNow() {
    showToast("Welcome to our Collection Section!", 'info');
    const collectionSection = document.getElementById("collection");
    if (collectionSection) {
        collectionSection.scrollIntoView({ behavior: 'smooth' });
    }
}

function submitForm() {
    showToast("Thank you! Your message has been sent.", 'success');
    return false;
}

// Mobile menu toggle
function toggleMenu() {
    const navMenu = document.getElementById('navMenu');
    const menuToggle = document.querySelector('.menu-toggle');
    if (navMenu) navMenu.classList.toggle('active');
    if (menuToggle) menuToggle.classList.toggle('active');
}

// ==================== INITIALIZATION ====================

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    // Initialize data
    initializeProducts();
    initializeUsers();
    
    // Update UI
    updateCartCount();
    updateNavigation();
    
    // Load page-specific products
    loadPageProducts();
    
    // Render cart items if on cart page
    if (document.getElementById('cartItems')) {
        renderCartItems();
    }
    
    // Load admin products if on admin page
    if (document.getElementById('adminProducts') || document.getElementById('adminProductList')) {
        const user = getCurrentUser();
        if (!user || user.role !== 'admin') {
            // Not admin, check URL
            const path = window.location.pathname;
            if (path.includes('admin.html')) {
                alert('Access Denied! Only admins can access this page.');
                window.location.href = 'index.html';
                return;
            }
        }
        loadAdminProducts();
    }
    
    // Category filter change handler for main pages
    const categoryFilter = document.getElementById('categoryFilter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', function() {
            loadPageProducts();
        });
    }
    
    // Sub-category filter change handler
    const subCategoryFilter = document.getElementById('subCategoryFilter');
    if (subCategoryFilter) {
        subCategoryFilter.addEventListener('change', function() {
            const path = window.location.pathname;
            const filename = path.split('/').pop();
            
            let category = 'all';
            if (filename === 'mens.html') category = 'men';
            if (filename === 'womens.html') category = 'women';
            if (filename === 'kids.html') category = 'kids';
            
            filterBySubCategory(category, this.value);
        });
    }
    
    // Product category change handler for admin form
    const productCategorySelect = document.getElementById('productCategory');
    if (productCategorySelect) {
        productCategorySelect.addEventListener('change', function() {
            updateSubCategoryOptions(this.value);
        });
    }
});

// Make functions globally available
window.addToCart = addToCart;
window.removeFromCart = removeFromCart;
window.updateQuantity = updateQuantity;
window.getProducts = getProducts;
window.getProductsByCategory = getProductsByCategory;
window.getProductById = getProductById;
window.addProduct = addProduct;
window.updateProduct = updateProduct;
window.deleteProduct = deleteProduct;
window.renderProducts = renderProducts;
window.renderAdminProducts = renderAdminProducts;
window.showProductForm = showProductForm;
window.hideProductForm = hideProductForm;
window.handleProductSubmit = handleProductSubmit;
window.editProductForm = editProductForm;
window.deleteProductConfirm = deleteProductConfirm;
window.loadAdminProducts = loadAdminProducts;
window.filterAdminProducts = filterAdminProducts;
window.filterBySubCategory = filterBySubCategory;
window.updateSubCategoryOptions = updateSubCategoryOptions;
window.showToast = showToast;
window.proceedToCheckout = proceedToCheckout;
window.logIn = logIn;
window.logOut = logOut;
window.signUp = signUp;
window.getCurrentUser = getCurrentUser;
window.isLoggedIn = isLoggedIn;
window.isAdmin = isAdmin;
window.toggleMenu = toggleMenu;
window.shopNow = shopNow;
window.submitForm = submitForm;
window.showCart = showCart;
window.initializeUsers = initializeUsers;
window.initializeProducts = initializeProducts;
window.updateNavigation = updateNavigation;
