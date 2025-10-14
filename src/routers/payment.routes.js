const express = require("express");
const router = express.Router();
const PaymentController = require("../app/controllers/payment.controller");

// Route tạo order thanh toán Momo
router.post("/momo", PaymentController.createMomoPayment);

// Route tạo order thanh toán ZaloPay
router.post("/zalopay", PaymentController.createZaloPayPayment);

module.exports = router;
