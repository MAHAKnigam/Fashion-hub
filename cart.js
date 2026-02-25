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
function addToCart(product) {
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

// Proceed to checkout
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
    
    // In a real app, this would process payment
    showToast('Order placed successfully! Thank you for shopping!', 'success');
    
    // Clear cart
    saveCart([]);
    updateCartCount();
    
    setTimeout(() => {
        window.location.href = 'index.html';
    }, 2000);
}

// Add to cart from product cards (wrapper function)
function addToCartFromCard(productId) {
    const products = JSON.parse(localStorage.getItem('fashionProducts') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (product) {
        addToCart(product);
    }
}

// Initialize cart
document.addEventListener('DOMContentLoaded', function() {
    updateCartCount();
});
