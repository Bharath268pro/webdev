/**
 * Enhanced Product Interactions Script
 * Handles functionality for product filters, add to cart, favorites, star ratings, and compare
 */

document.addEventListener('DOMContentLoaded', function() {
    // Cart functionality
    initializeCart();
    
    // Star rating system
    initializeRatings();
    
    // Wishlist/Favorites functionality
    initializeFavorites();
    
    // Compare functionality
    initializeCompare();
    
    // Enhanced product filter functionality
    enhanceProductFilter();
});

/**
 * Initialize shopping cart functionality
 */
function initializeCart() {
    // Cart counter and total
    let cartCount = 0;
    let cartTotal = 0.00;
    
    // Add to Cart button functionality
    const addToCartButtons = document.querySelectorAll('.add-cart');
    
    addToCartButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Get product info
            const productItem = this.closest('.product__item');
            const productName = productItem.querySelector('h6').textContent;
            const productPrice = parseFloat(productItem.querySelector('h5').textContent.replace('$', ''));
            
            // Update cart count and total
            cartCount++;
            cartTotal += productPrice;
            
            // Update UI
            const headerCartCount = document.querySelector('.header__nav__option span');
            const headerCartTotal = document.querySelector('.header__nav__option .price');
            
            if (headerCartCount) {
                headerCartCount.textContent = cartCount;
            }
            
            if (headerCartTotal) {
                headerCartTotal.textContent = '$' + cartTotal.toFixed(2);
            }
            
            // Change button text temporarily to show feedback
            const originalText = this.textContent;
            this.textContent = 'Added!';
            this.classList.add('added');
            
            setTimeout(() => {
                this.textContent = originalText;
                this.classList.remove('added');
            }, 1500);
            
            // Show notification
            showNotification(`${productName} added to cart!`);
        });
    });
}

/**
 * Initialize product rating functionality
 */
function initializeRatings() {
    const ratingContainers = document.querySelectorAll('.rating');
    
    ratingContainers.forEach(container => {
        const stars = container.querySelectorAll('i');
        
        stars.forEach((star, index) => {
            // Make stars interactive
            star.addEventListener('mouseover', () => {
                // Highlight stars on hover
                for (let i = 0; i <= index; i++) {
                    stars[i].classList.remove('fa-star-o');
                    stars[i].classList.add('fa-star');
                }
            });
            
            star.addEventListener('mouseout', () => {
                // Reset stars to original state unless clicked
                if (!star.classList.contains('rated')) {
                    stars.forEach(s => {
                        if (!s.classList.contains('rated')) {
                            s.classList.remove('fa-star');
                            s.classList.add('fa-star-o');
                        }
                    });
                }
            });
            
            star.addEventListener('click', () => {
                // Set permanent rating
                stars.forEach((s, i) => {
                    s.classList.remove('rated');
                    if (i <= index) {
                        s.classList.remove('fa-star-o');
                        s.classList.add('fa-star');
                        s.classList.add('rated');
                    } else {
                        s.classList.remove('fa-star');
                        s.classList.add('fa-star-o');
                    }
                });
                
                // Show rating confirmation
                const productName = star.closest('.product__item').querySelector('h6').textContent;
                showNotification(`You rated ${productName} ${index + 1} out of 5 stars!`);
            });
        });
    });
}

/**
 * Initialize favorites functionality
 */
function initializeFavorites() {
    const favoriteButtons = document.querySelectorAll('.product__hover li:first-child a');
    
    favoriteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productItem = this.closest('.product__item');
            const productName = productItem.querySelector('.product__item__text h6').textContent;
            
            // Toggle favorite status
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                showNotification(`${productName} removed from favorites`);
            } else {
                this.classList.add('active');
                showNotification(`${productName} added to favorites!`);
            }
            
            // Visual feedback
            const heartIcon = this.querySelector('img');
            heartIcon.classList.add('pulse');
            
            setTimeout(() => {
                heartIcon.classList.remove('pulse');
            }, 500);
        });
    });
}

/**
 * Initialize compare functionality
 */
function initializeCompare() {
    const compareButtons = document.querySelectorAll('.product__hover li:nth-child(2) a');
    let compareList = [];
    
    compareButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            
            const productItem = this.closest('.product__item');
            const productName = productItem.querySelector('.product__item__text h6').textContent;
            
            // Toggle compare status
            if (this.classList.contains('active')) {
                this.classList.remove('active');
                
                // Remove from compare list
                const index = compareList.indexOf(productName);
                if (index > -1) {
                    compareList.splice(index, 1);
                }
                
                showNotification(`${productName} removed from comparison`);
            } else {
                // Check if already have 4 items to compare
                if (compareList.length >= 4) {
                    showNotification('You can compare up to 4 items at once. Please remove an item first.');
                    return;
                }
                
                this.classList.add('active');
                compareList.push(productName);
                showNotification(`${productName} added to comparison!`);
            }
            
            // Update compare counter if it exists
            updateCompareCounter(compareList.length);
        });
    });
}

/**
 * Update compare counter
 */
function updateCompareCounter(count) {
    // Create or update compare counter
    let compareCounter = document.querySelector('.compare-counter');
    
    if (!compareCounter) {
        compareCounter = document.createElement('div');
        compareCounter.className = 'compare-counter';
        document.body.appendChild(compareCounter);
    }
    
    compareCounter.textContent = count;
    
    if (count === 0) {
        compareCounter.style.display = 'none';
    } else {
        compareCounter.style.display = 'block';
    }
}

/**
 * Enhance product filter functionality
 */
function enhanceProductFilter() {
    const filterControls = document.querySelectorAll('.filter__controls li');
    
    filterControls.forEach(control => {
        control.addEventListener('click', function() {
            // Update active state
            filterControls.forEach(c => c.classList.remove('active'));
            this.classList.add('active');
            
            // Add animation for smooth transitions
            const productItems = document.querySelectorAll('.product__item');
            productItems.forEach(item => {
                item.style.transition = 'opacity 0.3s ease';
                item.style.opacity = '0.5';
                
                setTimeout(() => {
                    item.style.opacity = '1';
                }, 300);
            });
        });
    });
}

/**
 * Show notification popup
 */
function showNotification(message) {
    // Create notification element if it doesn't exist
    let notification = document.querySelector('.custom-notification');
    
    if (!notification) {
        notification = document.createElement('div');
        notification.className = 'custom-notification';
        document.body.appendChild(notification);
    }
    
    // Set message and show notification
    notification.textContent = message;
    notification.classList.add('show');
    
    // Hide notification after 3 seconds
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

/**
 * Initialize CSS for the added features
 */
function initializeCustomCSS() {
    const style = document.createElement('style');
    style.textContent = `
        .add-cart.added {
            background-color: #007bff;
            color: white;
        }
        
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
        
        .pulse {
            animation: pulse-animation 0.5s ease;
        }
        
        @keyframes pulse-animation {
            0% { transform: scale(1); }
            50% { transform: scale(1.5); }
            100% { transform: scale(1); }
        }
        
        .product__hover li a.active {
            background-color: #f3f2ee;
        }
        
        .fa-star {
            color: #f5ba41;
            cursor: pointer;
        }
        
        .fa-star-o {
            color: #d3d3d3;
            cursor: pointer;
        }
        
        .compare-counter {
            position: fixed;
            bottom: 20px;
            right: 20px;
            width: 24px;
            height: 24px;
            border-radius: 50%;
            background-color: #e53637;
            color: white;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
            display: none;
            box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
        }
    `;
    
    document.head.appendChild(style);
}

// Initialize custom CSS
initializeCustomCSS();