document.addEventListener('DOMContentLoaded', () => {
  loadCartItems();
  updateCartCount();
  loadAvailableCoupons(); // Add this line
});
// Variable to store current discount
let currentDiscount = 0;
let originalTotal = 0;

async function loadAvailableCoupons() {
  try {
    const response = await fetch('/api/coupons');
    const coupons = await response.json();
    
    const couponList = document.getElementById('coupon-list');
    couponList.innerHTML = '';
    
    coupons.forEach(coupon => {
      const validUntil = new Date(coupon.validUntil).toLocaleDateString();
      const couponEl = document.createElement('div');
      couponEl.className = 'coupon-card';
      couponEl.innerHTML = `
        <div class="coupon-code">${coupon.code}</div>
        <div class="coupon-discount">${coupon.discount}% OFF</div>
        <div class="coupon-validity">Valid until: ${validUntil}</div>
      `;
      
      // Add click handler to apply coupon
      couponEl.addEventListener('click', () => {
        document.getElementById('coupon-code').value = coupon.code;
        applyCoupon();
      });
      
      couponList.appendChild(couponEl);
    });
  } catch (error) {
    console.error('Error loading coupons:', error);
    showNotification('Failed to load available coupons', true);
  }
}
// Function to update cart total with discount
function updateCartTotal(total) {
  originalTotal = total;
  const discountAmount = total * (currentDiscount / 100);
  const finalTotal = total - discountAmount;
  
  const cartSummary = document.getElementById('cart-summary');
  cartSummary.innerHTML = `
    <h2>Cart Summary</h2>
    ${currentDiscount > 0 ? `
      <div class="original-price">Original Total: ₹${originalTotal.toLocaleString('en-IN')}</div>
      <div class="discount">Discount (${currentDiscount}%): -₹${discountAmount.toLocaleString('en-IN')}</div>
    ` : ''}
    <div id="cart-total">₹${finalTotal.toLocaleString('en-IN')}</div>
  `;
}

// Apply coupon function
async function applyCoupon() {
  const couponCode = document.getElementById('coupon-code').value;
  const messageEl = document.getElementById('coupon-message');
  
  try {
    const response = await fetch('/api/coupons/validate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ code: couponCode })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message);
    }
    
    currentDiscount = data.discount;
    updateCartTotal(originalTotal);
    
    messageEl.textContent = `Coupon applied! ${data.discount}% off`;
    messageEl.className = 'success';
  } catch (error) {
    messageEl.textContent = error.message;
    messageEl.className = 'error';
    currentDiscount = 0;
    updateCartTotal(originalTotal);
  }
}

async function buyCartItem(e) {
  const cartItemId = e.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`/api/cart/buy/${cartItemId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ discount: currentDiscount })
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to complete purchase');
    }
    
    const result = await response.json();
    showNotification(`Purchase successful! Total: ₹${result.purchaseDetails.finalPrice}`);
    loadCartItems();
    updateCartCount();
  } catch (error) {
    console.error('Error buying item:', error);
    showNotification(error.message, true);
  }
}

async function removeFromCart(e) {
  const cartItemId = e.target.getAttribute('data-id');
  
  try {
    const response = await fetch(`/api/cart/remove/${cartItemId}`, {
      method: 'DELETE'
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove from cart');
    }
    
    showNotification('Product removed from cart');
    loadCartItems();
    updateCartCount();
  } catch (error) {
    console.error('Error removing from cart:', error);
    showNotification(error.message, true);
  }
}

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

function showNotification(message, isError = false) {
  const notification = document.getElementById('notification');
  notification.textContent = message;
  notification.className = `notification ${isError ? 'error' : ''}`;
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 10);
  
  setTimeout(() => {
    notification.classList.remove('show');
  }, 3000);
}