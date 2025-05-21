document.addEventListener('DOMContentLoaded', () => {
    // Initialize products if needed
    initializeProducts();
    
    // Load products
    loadProducts();
    
    // Update cart count
    updateCartCount();
  });
  
  // Initialize sample products (first time only)
// Update the initializeProducts function
async function initializeProducts() {
  try {
    const response = await fetch('/api/products/init', {
      method: 'POST'
    });
    
    if (!response.ok) {
      // Don't throw error for existing products
      const data = await response.json();
      if (data.message === 'Products already exist') {
        return;
      }
      throw new Error(data.message || 'Failed to initialize products');
    }
  } catch (error) {
    console.error('Error initializing products:', error);
    // Remove this line to prevent the error popup
    // showNotification('Failed to load products', true);
  }
}

// Update the loadProducts function
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }
    
    const products = await response.json();
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    // ... rest of the loadProducts function remains the same ...
  } catch (error) {
    console.error('Error loading products:', error);
    // Only show error notification for actual loading failures
  
    }
  }

  // Load all products
 // Update the loadProducts function
async function loadProducts() {
  try {
    const response = await fetch('/api/products');
    const products = await response.json();
    
    const productsContainer = document.getElementById('products-container');
    productsContainer.innerHTML = '';
    
    products.forEach(product => {
      const productEl = document.createElement('div');
      productEl.className = 'grid-item';
      
      const isAvailable = product.available > 0;
      
      productEl.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-name">${product.name}</div>
        <div class="product-price">₹${product.price.toLocaleString('en-IN')}</div>
        <div class="product-available ${isAvailable ? '' : 'out-of-stock'}">
          ${isAvailable ? `${product.available} available` : 'Out of Stock'}
        </div>
        <div class="button-group">
          <button class="btn add-to-cart" data-id="${product._id}" ${isAvailable ? '' : 'disabled'}>
            Add to Cart
          </button>
          <button class="btn buy-now" data-id="${product._id}" ${isAvailable ? '' : 'disabled'}>
            Buy Now
          </button>
        </div>
      `;
      
      productsContainer.appendChild(productEl);
    });
    
    // Add event listeners to buttons
    document.querySelectorAll('.add-to-cart').forEach(button => {
      button.addEventListener('click', addToCart);
    });
    
    document.querySelectorAll('.buy-now').forEach(button => {
      button.addEventListener('click', buyNow);
    });
  } catch (error) {
    console.error('Error loading products:', error);
   // showNotification('Failed to load products', true);
  }
}

// Update the loadCartItems function
async function loadCartItems() {
  try {
    const response = await fetch('/api/cart');
    const cartItems = await response.json();
    
    const cartContainer = document.getElementById('cart-container');
    cartContainer.innerHTML = '';
    
    if (cartItems.length === 0) {
      cartContainer.innerHTML = '<p>Your cart is empty. <a href="/">Continue shopping</a></p>';
      document.getElementById('cart-total').textContent = '₹0';
      return;
    }
    
    let total = 0;
    
    cartItems.forEach(item => {
      const itemTotal = item.price * item.quantity;
      total += itemTotal;
      
      const cartItemEl = document.createElement('div');
      cartItemEl.className = 'grid-item';
      
      cartItemEl.innerHTML = `
        <div class="product-name">${item.name}</div>
        <div class="product-price">₹${itemTotal.toLocaleString('en-IN')}</div>
        <div class="product-available">${item.quantity} items</div>
        <div class="button-group">
          <button class="btn remove-btn" data-id="${item._id}">Remove</button>
          <button class="btn buy-now" data-id="${item._id}">Buy Now</button>
        </div>
      `;
      
      cartContainer.appendChild(cartItemEl);
    });
    
    // Update total
    document.getElementById('cart-total').textContent = `₹${total.toLocaleString('en-IN')}`;
    
    // Add event listeners to buttons
    document.querySelectorAll('.remove-btn').forEach(button => {
      button.addEventListener('click', removeFromCart);
    });
    
    document.querySelectorAll('.buy-now').forEach(button => {
      button.addEventListener('click', buyCartItem);
    });
  } catch (error) {
    console.error('Error loading cart items:', error);
    showNotification('Failed to load cart items', true);
  }
}

// Add buyCartItem function
async function buyCartItem(e) {
  const cartItemId = e.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`/api/cart/buy/${cartItemId}`, {
      method: 'POST'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete purchase');
    }
    
    const result = await response.json();
    showNotification(`Purchase successful! Total: ₹${result.purchaseDetails.totalPrice}`);
    loadCartItems(); // Refresh cart list
    updateCartCount(); // Update cart counter
  } catch (error) {
    console.error('Error buying item:', error);
    showNotification(error.message, true);
  }
}
  // Add product to cart
  async function addToCart(e) {
    const productId = e.target.getAttribute('data-id');
    
    try {
      const response = await fetch(`/api/cart/add/${productId}`, {
        method: 'POST'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to add to cart');
      }
      
      showNotification('Product added to cart');
      loadProducts(); // Refresh product list
      updateCartCount(); // Update cart counter
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification(error.message, true);
    }
  }
  
  // Update cart count in navbar
  async function updateCartCount() {
    try {
      const response = await fetch('/api/cart');
      const cartItems = await response.json();
      
      const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);
      document.getElementById('cart-count').textContent = cartCount;
    } catch (error) {
      console.error('Error updating cart count:', error);
    }
  }
  
  // Show notification
  function showNotification(message, isError = false) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.className = `notification ${isError ? 'error' : ''}`;
    
    // Add show class to trigger animation
    setTimeout(() => {
      notification.classList.add('show');
    }, 10);
    
    // Hide notification after 3 seconds
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }