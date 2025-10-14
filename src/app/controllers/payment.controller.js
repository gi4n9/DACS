const PaymentService = require("../../service/payment.service");

class PaymentController {
  // Xử lý thanh toán Momo
  static async createMomoPayment(req, res) {
    const { amount, orderId, redirectUrl } = req.body;
    console.log("Momo Payment Request Body:", { amount, orderId, redirectUrl });

    if (!amount || !orderId || !redirectUrl) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin amount, orderId hoặc redirectUrl" });
    }

    try {
      const result = await PaymentService.createMomoOrder({
        amount,
        orderId,
        redirectUrl,
      });
      res.json(result);
    } catch (error) {
      console.error("Momo Payment Error:", error);
      res.status(500).json({ error: error.message });
    }
  }

  // Xử lý thanh toán ZaloPay
  static async createZaloPayPayment(req, res) {
    const { amount, orderId, redirectUrl } = req.body;

    // Kiểm tra dữ liệu đầu vào
    if (!amount || !orderId || !redirectUrl) {
      return res
        .status(400)
        .json({ error: "Thiếu thông tin amount, orderId hoặc redirectUrl" });
    }

    try {
      const result = await PaymentService.createZaloPayOrder({
        amount,
        orderId,
        redirectUrl,
      });
      res.json(result);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  }
}

module.exports = PaymentController;
