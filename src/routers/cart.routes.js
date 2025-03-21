// routers/cart.routes.js
const express = require('express');
const router = express.Router();

// Define colorNameMap
const colorNameMap = {
    '#ffffff': 'Trắng',
    '#000000': 'Đen',
    '#ff5733': 'Cam',
    '#0d47a1': 'Xanh dương',
    '#D2B48C': 'Nâu',
    '#D3D3D3': 'Xám nhạt',
    '#F5F5DC': 'Be',
    '#000080': 'Xanh navy',
    '#ADD8E6': 'Xanh nhạt',
    '#e8e6cf': 'Kem' // Add the missing color code
};

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// GET cart page
router.get('/', (req, res) => {
    // Get cart items from session
    const cartItems = req.session.cart || [];
    
    // Calculate totals
    let totalAmount = 0;
    cartItems.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    
    const discount = 0; // Apply any discounts
    const shippingFee = totalAmount > 0 ? 30000 : 0; // Free shipping over a certain amount
    const finalTotal = totalAmount - discount + shippingFee;
    const vatAmount = Math.round(finalTotal * 0.1); // 10% VAT
    
    // Debug: Log cart items to check structure
    console.log('Cart items:', cartItems);

    // Render the cart page with data
    res.render('cart', {
        title: 'Giỏ hàng - Coolmate',
        cartItems,
        totalAmount,
        discount,
        shippingFee,
        finalTotal,
        vatAmount,
        colorNameMap, // Pass colorNameMap to the template
        helpers: {
            formatCurrency
        }
    });
});

// POST add item to cart
router.post('/add', (req, res) => {
    const { productId, name, price, color, size, quantity = 1, image } = req.body;
    
    // Initialize cart if it doesn't exist
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    // Check if item already exists in cart
    const existingItemIndex = req.session.cart.findIndex(item => 
        item.productId === productId && item.color === color && item.size === size
    );
    
    if (existingItemIndex > -1) {
        // Update quantity if item exists
        req.session.cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
        // Add new item to cart
        req.session.cart.push({
            id: Date.now().toString(), // Generate a unique ID
            productId,
            name,
            price: parseFloat(price),
            color,
            size,
            quantity: parseInt(quantity),
            image,
            images: [image] // Add images array to match cart.hbs expectation
        });
    }
    
    // Redirect back to product page or cart
    res.redirect('/cart');
});

// POST update cart item
router.post('/update', (req, res) => {
    const { id, quantity } = req.body;
    
    if (req.session.cart) {
        const itemIndex = req.session.cart.findIndex(item => item.id === id);
        
        if (itemIndex > -1) {
            if (parseInt(quantity) > 0) {
                // Update quantity
                req.session.cart[itemIndex].quantity = parseInt(quantity);
            } else {
                // Remove item if quantity is 0
                req.session.cart.splice(itemIndex, 1);
            }
        }
    }
    
    // For AJAX requests, send JSON response
    if (req.xhr) {
        return res.json({ success: true });
    }
    
    // For form submissions, redirect back to cart
    res.redirect('/cart');
});

// POST remove item from cart
router.post('/remove', (req, res) => {
    const { id } = req.body;
    
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id !== id);
    }
    
    // For AJAX requests, send JSON response
    if (req.xhr) {
        return res.json({ success: true });
    }
    
    // For form submissions, redirect back to cart
    res.redirect('/cart');
});

// POST clear cart
router.post('/clear', (req, res) => {
    req.session.cart = [];
    
    // For AJAX requests, send JSON response
    if (req.xhr) {
        return res.json({ success: true });
    }
    
    // For form submissions, redirect back to cart
    res.redirect('/cart');
});

module.exports = router;