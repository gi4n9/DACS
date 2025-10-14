require("dotenv").config();
const crypto = require("crypto");
const axios = require("axios");

const MOMO_CONFIG = {
  endpoint: "https://test-payment.momo.vn/v2/gateway/api/create",
  partnerCode: process.env.MOMO_PARTNER_CODE,
  accessKey: process.env.MOMO_ACCESS_KEY,
  secretKey: process.env.MOMO_SECRET_KEY,
  ipnUrl: process.env.MOMO_IPN_URL,
};

const ZALOPAY_CONFIG = {
  endpoint: "https://sandbox.zalopay.com.vn/v001/tpe/createorder",
  appId: process.env.ZALOPAY_APP_ID,
  key1: process.env.ZALOPAY_KEY1,
  key2: process.env.ZALOPAY_KEY2,
  callbackUrl: process.env.ZALOPAY_CALLBACK_URL,
};

class PaymentService {
  // Tạo order thanh toán Momo
  static async createMomoOrder({ amount, orderId, redirectUrl }) {
    if (
      !MOMO_CONFIG.partnerCode ||
      !MOMO_CONFIG.accessKey ||
      !MOMO_CONFIG.secretKey ||
      !MOMO_CONFIG.ipnUrl
    ) {
      throw new Error(
        "Missing Momo configuration: Ensure MOMO_PARTNER_CODE, MOMO_ACCESS_KEY, MOMO_SECRET_KEY, and MOMO_IPN_URL are set in .env"
      );
    }
    const requestId = orderId;
    const orderInfo = "Thanh toán đơn hàng";
    const requestType = "payWithMethod";
    const extraData = "";
    const lang = "vi";
    const autoCapture = true;

    // Tạo chữ ký (signature)
    const rawSignature = `accessKey=${MOMO_CONFIG.accessKey}&amount=${amount}&extraData=${extraData}&ipnUrl=${MOMO_CONFIG.ipnUrl}&orderId=${orderId}&orderInfo=${orderInfo}&partnerCode=${MOMO_CONFIG.partnerCode}&redirectUrl=${redirectUrl}&requestId=${requestId}&requestType=${requestType}`;
    const signature = crypto
      .createHmac("sha256", MOMO_CONFIG.secretKey)
      .update(rawSignature)
      .digest("hex");

    // Payload gửi tới Momo
    const payload = {
      partnerCode: MOMO_CONFIG.partnerCode,
      partnerName: "FShop",
      storeId: "FShopStore",
      requestId,
      amount,
      orderId,
      orderInfo,
      redirectUrl,
      ipnUrl: MOMO_CONFIG.ipnUrl,
      lang,
      requestType,
      autoCapture,
      extraData,
      signature,
    };

    try {
      const response = await axios.post(MOMO_CONFIG.endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.resultCode === 0) {
        return { payUrl: response.data.payUrl };
      } else {
        throw new Error(response.data.message || "Lỗi tạo order Momo");
      }
    } catch (error) {
      throw new Error(`Momo API error: ${error.message}`);
    }
  }

  // Tạo order thanh toán ZaloPay
  static async createZaloPayOrder({ amount, orderId, redirectUrl }) {
    const appTransId = `${Date.now()}`;
    const description = "Thanh toán đơn hàng";
    const embedData = JSON.stringify({ redirecturl: redirectUrl });
    const items = JSON.stringify([]); // Có thể thêm chi tiết sản phẩm nếu cần
    const appTime = Date.now();

    // Tạo chữ ký (mac)
    const data = `${ZALOPAY_CONFIG.appId}|${appTransId}|${ZALOPAY_CONFIG.appId}|${amount}|${appTime}|${embedData}|${items}`;
    const mac = crypto
      .createHmac("sha256", ZALOPAY_CONFIG.key1)
      .update(data)
      .digest("hex");

    // Payload gửi tới ZaloPay
    const payload = {
      appid: ZALOPAY_CONFIG.appId,
      apptransid: appTransId,
      apptime: appTime,
      appuser: "FShopUser",
      amount,
      description,
      orderid: orderId,
      item: items,
      embeddata: embedData,
      mac,
    };

    try {
      const response = await axios.post(ZALOPAY_CONFIG.endpoint, payload, {
        headers: { "Content-Type": "application/json" },
      });

      if (response.data.return_code === 1) {
        return { payUrl: response.data.order_url };
      } else {
        throw new Error(
          response.data.return_message || "Lỗi tạo order ZaloPay"
        );
      }
    } catch (error) {
      throw new Error(`ZaloPay API error: ${error.message}`);
    }
  }
}

module.exports = PaymentService;
