// app/controllers/cartController.js
const axios = require('axios');

const API_URL = "https://fshop.nghienshopping.online";

class CartController {
    static async addItem(req, res) {
        try {
            const userId = req.user.user_id;
            const { productId, variantId, quantity } = req.body;

            const token = req.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const response = await axios.post(
                `${API_URL}/api/cart/${userId}`,
                { productId, variantId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            res.status(200).json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                message: 'Error adding to cart',
                error: error.response?.data || error.message
            });
        }
    }

    static async getCart(req, res) {
        try {
            const userId = req.user.user_id;
            const token = req.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const response = await axios.get(`${API_URL}/api/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            res.status(200).json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                message: 'Error fetching cart',
                error: error.response?.data || error.message
            });
        }
    }

    static async updateItem(req, res) {
        try {
            const userId = req.user.user_id;
            const { cartId, quantity } = req.body;
            const token = req.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const response = await axios.put(
                `${API_URL}/api/cart/${userId}`,
                { cartId, quantity },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            res.status(200).json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                message: 'Error updating cart',
                error: error.response?.data || error.message
            });
        }
    }

    static async removeItem(req, res) {
        try {
            const userId = req.user.user_id;
            const { cart_id } = req.query;
            const token = req.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const response = await axios.delete(`${API_URL}/api/cart/${userId}/item?cart_id=${cart_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            res.status(200).json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                message: 'Error removing item',
                error: error.response?.data || error.message
            });
        }
    }

    static async clearCart(req, res) {
        try {
            const userId = req.user.user_id;
            const token = req.token;
            if (!token) {
                return res.status(401).json({ message: 'No token provided' });
            }

            const response = await axios.delete(`${API_URL}/api/cart/${userId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            res.status(200).json(response.data);
        } catch (error) {
            res.status(error.response?.status || 500).json({
                message: 'Error clearing cart',
                error: error.response?.data || error.message
            });
        }
    }

    static async renderCartPage(req, res) {
        try {
            let cartItems = [];

            // Check if the user is authenticated
            if (!req.user) {
                // If not authenticated, render the page with an empty cart
                console.warn('User not authenticated for rendering cart page');
            } else {
                const userId = req.user.user_id;
                const token = req.token;

                if (token) {
                    // Fetch cart items from the external API
                    const response = await axios.get(`${API_URL}/api/cart/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    cartItems = response.data.data || [];
                } else {
                    console.warn('No token available for rendering cart page');
                }
            }

            let totalAmount = 0;
            cartItems.forEach(item => {
                totalAmount += item.price * item.quantity;
            });

            const discount = 0;
            const shippingFee = totalAmount > 0 ? 30000 : 0;
            const finalTotal = totalAmount - discount + shippingFee;
            const vatAmount = Math.round(finalTotal * 0.1);

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

            const formatCurrency = (amount) => {
                return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
            };

            res.render('cart', {
                title: 'Giỏ hàng - Coolmate',
                cartItems,
                totalAmount,
                discount,
                shippingFee,
                finalTotal,
                vatAmount,
                colorNameMap,
                helpers: { formatCurrency }
            });
        } catch (error) {
            res.status(error.response?.status || 500).json({
                message: 'Error rendering cart page',
                error: error.response?.data || error.message
            });
        }
    }
}

module.exports = CartController;