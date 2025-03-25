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
    '#e8e6cf': 'Kem'
};

// Helper function to format currency
function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// GET cart page
router.get('/', (req, res) => {
    const cartItems = req.session.cart || [];
    
    let totalAmount = 0;
    cartItems.forEach(item => {
        totalAmount += item.price * item.quantity;
    });
    
    const discount = 0;
    const shippingFee = totalAmount > 0 ? 30000 : 0;
    const finalTotal = totalAmount - discount + shippingFee;
    const vatAmount = Math.round(finalTotal * 0.1);
    
    res.render('cart', {
        title: 'Giỏ hàng - Coolmate',
        cartItems,
        totalAmount,
        discount,
        shippingFee,
        finalTotal,
        vatAmount,
        colorNameMap,
        helpers: {
            formatCurrency
        }
    });
});

// POST add item to cart
router.post('/add', (req, res) => {
    const { productId, name, price, color, size, quantity = 1, image } = req.body;
    
    if (!req.session.cart) {
        req.session.cart = [];
    }
    
    const existingItemIndex = req.session.cart.findIndex(item => 
        item.productId === productId && item.color === color && item.size === size
    );
    
    if (existingItemIndex > -1) {
        req.session.cart[existingItemIndex].quantity += parseInt(quantity);
    } else {
        req.session.cart.push({
            id: Date.now().toString(),
            productId,
            name,
            price: parseFloat(price),
            color,
            size,
            quantity: parseInt(quantity),
            image,
            images: [image]
        });
    }
    
    res.redirect('/cart');
});

// POST update cart item
router.post('/update', (req, res) => {
    const { id, quantity } = req.body;
    
    if (req.session.cart) {
        const itemIndex = req.session.cart.findIndex(item => item.id === id);
        
        if (itemIndex > -1) {
            if (parseInt(quantity) > 0) {
                req.session.cart[itemIndex].quantity = parseInt(quantity);
            } else {
                req.session.cart.splice(itemIndex, 1);
            }
        }
    }
    
    if (req.xhr) {
        return res.json({ success: true });
    }
    
    res.redirect('/cart');
});

// POST remove item from cart
router.post('/remove', (req, res) => {
    const { id } = req.body;
    
    if (req.session.cart) {
        req.session.cart = req.session.cart.filter(item => item.id !== id);
    }
    
    if (req.xhr) {
        return res.json({ success: true });
    }
    
    res.redirect('/cart');
});

// POST clear cart
router.post('/clear', (req, res) => {
    req.session.cart = [];
    
    if (req.xhr) {
        return res.json({ success: true });
    }
    
    res.redirect('/cart');
});

// POST checkout
router.post('/orders/:user_id/checkout', (req, res) => {
    const userId = req.params.user_id;
    const orderData = req.body;

    // Kiểm tra xem req.user đã được gắn bởi middleware userFromToken chưa
    if (!req.user || req.user.user_id !== parseInt(userId)) {
        return res.status(403).json({ message: 'Không có quyền truy cập hoặc chưa đăng nhập' });
    }

    // Giả lập lưu đơn hàng vào database
    const orderId = Date.now().toString();
    const order = {
        order_id: orderId,
        user_id: parseInt(userId),
        status: 'pending',
        recipient_name: orderData.recipient_name,
        recipient_phone: orderData.recipient_phone,
        shipping_address: orderData.shipping_address,
        total_price: orderData.total_price,
        shipping_fee: orderData.shipping_fee,
        discount: orderData.discount || 0,
        amount_paid: orderData.amount_paid,
        payment_method: orderData.payment_method,
        shipping_method: orderData.shipping_method,
        items: orderData.items,
        created_at: new Date().toISOString()
    };

    // TODO: Thay bằng logic lưu vào database thực tế
    // Ví dụ: await db.orders.insert(order);

    // Xóa giỏ hàng trong session sau khi đặt hàng thành công
    req.session.cart = [];

    res.json({
        message: 'Order created successfully',
        order: order
    });
});

module.exports = router;