/**
 * Shopping Cart Functionality
 * Handles product quantity changes, item removal, cart total calculations,
 * and discount code application
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize cart functionality
    initializeCartPage();
});

/**
 * Initialize all shopping cart page functionality
 */
function initializeCartPage() {
    // Handle quantity changes
    initializeQuantityControls();
    
    // Handle item removal
    initializeRemoveItemButtons();
    
    // Update cart total when page loads
    updateCartTotals();
    
    // Initialize discount code application
    initializeDiscountCode();
    
    // Initialize update cart button
    initializeUpdateCart();
    
    // Initialize checkout button
    initializeCheckout();
}

/**
 * Initialize quantity controls for cart items
 */
function initializeQuantityControls() {
    const quantityInputs = document.querySelectorAll('.pro-qty-2 input');
    
    quantityInputs.forEach(input => {
        // Create quantity controls if they don't exist
        if (!input.parentElement.querySelector('.qtybtn')) {
            createQuantityButtons(input);
        }
        
        // Add event listener for manual input changes
        input.addEventListener('change', function() {
            // Enforce minimum quantity of 1
            if (parseInt(this.value) < 1 || isNaN(parseInt(this.value))) {
                this.value = 1;
            }
            
            // Update item total and cart totals
            updateItemTotal(this);
            updateCartTotals();
        });
    });
}

/**
 * Create quantity increase/decrease buttons
 */
function createQuantityButtons(input) {
    // Create decrease button
    const decreaseBtn = document.createElement('span');
    decreaseBtn.className = 'qtybtn dec';
    decreaseBtn.textContent = '-';
    decreaseBtn.addEventListener('click', function() {
        let value = parseInt(input.value);
        if (value > 1) {
            input.value = value - 1;
            // Update item total and cart totals
            updateItemTotal(input);
            updateCartTotals();
        }
    });
    
    // Create increase button
    const increaseBtn = document.createElement('span');
    increaseBtn.className = 'qtybtn inc';
    increaseBtn.textContent = '+';
    increaseBtn.addEventListener('click', function() {
        let value = parseInt(input.value);
        input.value = value + 1;
        // Update item total and cart totals
        updateItemTotal(input);
        updateCartTotals();
    });
    
    // Add buttons to the container
    input.parentElement.insertBefore(decreaseBtn, input);
    input.parentElement.appendChild(increaseBtn);
}

/**
 * Update individual item total based on quantity and price
 */
function updateItemTotal(input) {
    const cartItem = input.closest('tr');
    const priceElement = cartItem.querySelector('.product__cart__item__text h5');
    const totalElement = cartItem.querySelector('.cart__price');
    
    // Extract price (remove $ sign and convert to number)
    const price = parseFloat(priceElement.textContent.replace('$', ''));
    const quantity = parseInt(input.value);
    
    // Calculate new total
    const total = (price * quantity).toFixed(2);
    
    // Update total display
    totalElement.textContent = '$ ' + total;
}

/**
 * Initialize remove item buttons
 */
function initializeRemoveItemButtons() {
    const removeButtons = document.querySelectorAll('.cart__close');
    
    removeButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Get the cart item row
            const cartItem = this.closest('tr');
            
            // Add fade-out animation
            cartItem.style.transition = 'opacity 0.5s ease';
            cartItem.style.opacity = '0';
            
            // Remove the item after animation completes
            setTimeout(() => {
                cartItem.remove();
                updateCartTotals();
                updateHeaderCartCount();
                
                // Show empty cart message if no items left
                const cartItems = document.querySelectorAll('.shopping__cart__table tbody tr');
                if (cartItems.length === 0) {
                    showEmptyCartMessage();
                }
            }, 500);
        });
    });
}

/**
 * Show empty cart message when all items are removed
 */
function showEmptyCartMessage() {
    const table = document.querySelector('.shopping__cart__table table');
    const emptyMessage = document.createElement('tr');
    emptyMessage.innerHTML = '<td colspan="4" class="text-center" style="padding: 40px;">Your cart is empty</td>';
    
    // Clear any remaining items
    const tbody = table.querySelector('tbody');
    tbody.innerHTML = '';
    tbody.appendChild(emptyMessage);
    
    // Disable checkout button
    const checkoutButton = document.querySelector('.cart__total .primary-btn');
    if (checkoutButton) {
        checkoutButton.classList.add('disabled');
        checkoutButton.style.backgroundColor = '#ccc';
        checkoutButton.style.cursor = 'not-allowed';
    }
}

/**
 * Update cart totals (subtotal and total)
 */
function updateCartTotals() {
    let subtotal = 0;
    
    // Get all cart item price elements
    const cartPrices = document.querySelectorAll('.cart__price');
    
    // Calculate subtotal
    cartPrices.forEach(price => {
        subtotal += parseFloat(price.textContent.replace('$', ''));
    });
    
    // Format subtotal
    const formattedSubtotal = subtotal.toFixed(2);
    
    // Get applied discount if any
    const discountElement = document.querySelector('.cart__total .discount');
    let discount = 0;
    if (discountElement) {
        discount = parseFloat(discountElement.textContent.replace('$', ''));
    }
    
    // Calculate final total
    const total = (subtotal - discount).toFixed(2);
    
    // Update the display
    const subtotalElement = document.querySelector('.cart__total ul li:first-child span');
    const totalElement = document.querySelector('.cart__total ul li:last-child span');
    
    if (subtotalElement) {
        subtotalElement.textContent = '$ ' + formattedSubtotal;
    }
    
    if (totalElement) {
        totalElement.textContent = '$ ' + total;
    }
    
    // Update header cart total
    updateHeaderCartTotal(total);
}

/**
 * Update header cart item count
 */
function updateHeaderCartCount() {
    const cartItems = document.querySelectorAll('.shopping__cart__table tbody tr');
    const itemCount = cartItems.length;
    
    // Update header cart count
    const headerCartCount = document.querySelector('.header__nav__option span');
    if (headerCartCount) {
        headerCartCount.textContent = itemCount;
    }
    
    // Update mobile menu cart count
    const mobileCartCount = document.querySelector('.offcanvas__nav__option span');
    if (mobileCartCount) {
        mobileCartCount.textContent = itemCount;
    }
}

/**
 * Update header cart total price
 */
function updateHeaderCartTotal(total) {
    // Update header cart total
    const headerCartTotal = document.querySelector('.header__nav__option .price');
    if (headerCartTotal) {
        headerCartTotal.textContent = '$' + total;
    }
    
    // Update mobile menu cart total
    const mobileCartTotal = document.querySelector('.offcanvas__nav__option .price');
    if (mobileCartTotal) {
        mobileCartTotal.textContent = '$' + total;
    }
}

/**
 * Initialize discount code application
 */
function initializeDiscountCode() {
    const discountForm = document.querySelector('.cart__discount form');
    
    if (discountForm) {
        discountForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const codeInput = this.querySelector('input');
            const code = codeInput.value.trim().toUpperCase();
            
            // Example discount codes
            const discountCodes = {
                'WELCOME10': 10, // 10% off
                'SUMMER25': 25,  // 25% off
                'FREESHIP': 15   // $15 off for free shipping
            };
            
            // Check if code is valid
            if (code in discountCodes) {
                applyDiscount(discountCodes[code], code);
                
                // Show success message
                showDiscountMessage(`Discount code "${code}" applied successfully!`, 'success');
                
                // Disable input and button
                codeInput.disabled = true;
                this.querySelector('button').disabled = true;
            } else {
                // Show error message
                showDiscountMessage('Invalid discount code. Please try again.', 'error');
            }
        });
    }
}

/**
 * Apply discount to cart total
 */
function applyDiscount(discountPercent, code) {
    // Get current subtotal
    const subtotalElement = document.querySelector('.cart__total ul li:first-child span');
    const subtotal = parseFloat(subtotalElement.textContent.replace('$', ''));
    
    // Calculate discount amount
    const discountAmount = (subtotal * (discountPercent / 100)).toFixed(2);
    
    // Get cart total list
    const cartTotalList = document.querySelector('.cart__total ul');
    
    // Check if discount line already exists
    let discountElement = document.querySelector('.cart__total .discount-line');
    
    if (!discountElement) {
        // Create discount line
        const discountLine = document.createElement('li');
        discountLine.className = 'discount-line';
        discountLine.innerHTML = `Discount <span class="code">(${code})</span> <span class="discount">$ ${discountAmount}</span>`;
        
        // Insert before the total line
        const totalLine = document.querySelector('.cart__total ul li:last-child');
        cartTotalList.insertBefore(discountLine, totalLine);
    } else {
        // Update existing discount line
        discountElement.innerHTML = `Discount <span class="code">(${code})</span> <span class="discount">$ ${discountAmount}</span>`;
    }
    
    // Update total
    updateCartTotals();
}

/**
 * Show discount code application message
 */
function showDiscountMessage(message, type) {
    // Create message element if it doesn't exist
    let messageElement = document.querySelector('.discount-message');
    
    if (!messageElement) {
        messageElement = document.createElement('div');
        messageElement.className = 'discount-message';
        
        // Add message after the form
        const discountForm = document.querySelector('.cart__discount form');
        discountForm.parentNode.insertBefore(messageElement, discountForm.nextSibling);
    }
    
    // Set message and type
    messageElement.textContent = message;
    messageElement.className = 'discount-message ' + type;
    
    // Add fade-in animation
    messageElement.style.opacity = '0';
    messageElement.style.display = 'block';
    
    setTimeout(() => {
        messageElement.style.opacity = '1';
    }, 10);
    
    // Auto-remove message after 5 seconds
    setTimeout(() => {
        messageElement.style.opacity = '0';
        
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 500);
    }, 5000);
}

/**
 * Initialize update cart button
 */
function initializeUpdateCart() {
    const updateButton = document.querySelector('.update__btn a');
    
    if (updateButton) {
        updateButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Add spinning animation to the icon
            const icon = this.querySelector('i');
            icon.classList.add('fa-spin');
            
            // Simulate cart update delay
            setTimeout(() => {
                // Stop spinning
                icon.classList.remove('fa-spin');
                
                // Show notification message
                showNotification('Cart updated successfully!');
                
                // Update cart totals
                updateCartTotals();
            }, 1000);
        });
    }
}

/**
 * Initialize checkout button
 */
function initializeCheckout() {
    const checkoutButton = document.querySelector('.cart__total .primary-btn');
    
    if (checkoutButton) {
        checkoutButton.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Check if cart is empty
            const cartItems = document.querySelectorAll('.shopping__cart__table tbody tr');
            if (cartItems.length === 0) {
                showNotification('Your cart is empty. Please add items before checkout.');
                return;
            }
            
            // Redirect to checkout page
            window.location.href = 'checkout.html';
        });
    }
}

/**
 * Show notification popup (defined in product-interactions.js)
 * This is a duplicate function in case the other script is not loaded
 */
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.custom-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'custom-notification';
        document.body.appendChild(notification);
        
        // Add CSS for notification
        const style = document.createElement('style');
        style.textContent = `
            .custom-notification {
                position: fixed;
                top: 20px;
                right: 20px;
                background-color: rgba(0, 0, 0, 0.8);
                color: white;
                padding: 12px 20px;
                border-radius: 4px;
                z-index: 9999;
                transform: translateX(200%);
                transition: transform 0.3s ease;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            }
            
            .custom-notification.show {
                transform: translateX(0);
            }
            
            .discount-message {
                margin-top: 10px;
                padding: 10px;
                border-radius: 4px;
                text-align: center;
                transition: opacity 0.5s ease;
            }
            
            .discount-message.success {
                background-color: #d4edda;
                color: #155724;
                border: 1px solid #c3e6cb;
            }
            
            .discount-message.error {
                background-color: #f8d7da;
                color: #721c24;
                border: 1px solid #f5c6cb;
            }
            
            .discount-line {
                color: #e53637;
            }
            
            .discount-line .code {
                font-size: 12px;
                font-style: italic;
            }
        `;
        document.head.appendChild(style);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

// Initialize additional CSS for cart page
function initializeCartCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .pro-qty-2 {
            position: relative;
            width: 140px;
            height: 50px;
            border: 1px solid #e5e5e5;
            border-radius: 50px;
            padding: 0 20px;
            display: flex;
            align-items: center;
        }
        
        .pro-qty-2 input {
            height: 100%;
            width: 50px;
            font-size: 16px;
            color: #111111;
            font-weight: 500;
            border: none;
            text-align: center;
        }
        
        .pro-qty-2 .qtybtn {
            font-size: 16px;
            color: #888888;
            cursor: pointer;
            font-weight: 600;
        }
        
        .pro-qty-2 .qtybtn.dec {
            position: absolute;
            left: 20px;
        }
        
        .pro-qty-2 .qtybtn.inc {
            position: absolute;
            right: 20px;
        }
        
        .disabled {
            pointer-events: none;
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize cart CSS
initializeCartCSS();