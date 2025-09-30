require("dotenv").config();
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Khởi tạo Gemini model
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// -----------------
// Hàm retry Gemini
// -----------------
async function generateContentWithRetry(
  model,
  prompt,
  retries = 3,
  delay = 1000
) {
  for (let i = 0; i < retries; i++) {
    try {
      const result = await model.generateContent(prompt);
      return result;
    } catch (err) {
      if (err.status === 503 && i < retries - 1) {
        console.log(`Thử lại lần ${i + 1} sau ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw err;
    }
  }
  throw new Error("Không thể gọi Gemini sau nhiều lần thử.");
}

// -----------------
// Hàm parse câu hỏi
// -----------------
function parseQuestion(question) {
  let lower = question.toLowerCase();
  const result = { name: null, color: null, size: null, price: null };

  // --- Chuẩn hóa chiều cao: "1m7" -> "170cm", "1m65" -> "165cm"
  const meterHeightMatch = lower.match(/(\d+)m(\d{1,2})/);
  if (meterHeightMatch) {
    const meters = parseInt(meterHeightMatch[1], 10);
    const cmPart =
      meterHeightMatch[2].length === 1
        ? parseInt(meterHeightMatch[2], 10) * 10
        : parseInt(meterHeightMatch[2], 10);
    const h = meters * 100 + cmPart;
    lower = lower.replace(meterHeightMatch[0], `${h}cm`);
  }

  // --- Tên sản phẩm ---
  const productNames = ["áo thun", "váy", "sơ mi", "hoodie", "áo khoác"];
  result.name = productNames.find((n) => lower.includes(n));

  // --- Màu sắc ---
  const colors = ["đen", "trắng", "đỏ", "xanh", "vàng", "nâu", "hồng"];
  result.color = colors.find((c) => lower.includes(c));

  // --- Size nhập trực tiếp ---
  const sizes = ["s", "m", "l", "xl", "xxl"];
  result.size = sizes.find((s) => lower.split(/\s+/).includes(s));

  // --- Gợi ý size từ chiều cao/cân nặng ---
  const heightMatch = lower.match(/(\d{3})\s?cm/);
  const weightMatch = lower.match(/(\d{2,3})\s?kg/);
  if (!result.size && (heightMatch || weightMatch)) {
    const height = heightMatch ? parseInt(heightMatch[1], 10) : null;
    const weight = weightMatch ? parseInt(weightMatch[1], 10) : null;

    if (height && weight) {
      if (height < 160 || weight < 50) result.size = "s";
      else if (height <= 170 && weight <= 65) result.size = "m";
      else if (height <= 180 && weight <= 75) result.size = "l";
      else result.size = "xl";
    }
  }

  // --- Nhận diện khoảng giá ---
  function parseMoney(str) {
    if (!str) return null;
    str = str.toLowerCase();
    if (str.includes("tr")) return parseInt(str) * 1000000;
    if (str.includes("k")) return parseInt(str) * 1000;
    const num = parseInt(str, 10);
    return num >= 1000 ? num : null; // chỉ nhận số >= 1000
  }

  // Khoảng giá "300k - 1tr"
  const rangeRegex = /(\d+(?:k|tr|000))\s*[-–tođến]+\s*(\d+(?:k|tr|000))/;
  const rangeMatch = lower.match(rangeRegex);

  // Giá đơn "500k", "1tr", "1000000"
  const singlePriceRegex = /\b(\d+(?:k|tr|000))\b/g;
  const allPrices = lower.match(singlePriceRegex);

  if (rangeMatch) {
    const min = parseMoney(rangeMatch[1]);
    const max = parseMoney(rangeMatch[2]);
    if (min && max) result.price = { min, max };
  } else if (allPrices) {
    const val = parseMoney(allPrices[allPrices.length - 1]); // lấy số cuối tránh nhầm cm/kg
    if (val) result.price = { min: val - 100000, max: val + 100000 };
  }

  return result;
}

// -----------------
// Extract JSON từ Gemini
// -----------------
function extractJsonFromText(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error("❌ Lỗi trích xuất JSON:", err.message);
    return { message: "Xin lỗi, không parse được phản hồi.", products: [] };
  }
}

// -----------------
// Endpoint chính
// -----------------
router.post("/", async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Vui lòng cung cấp câu hỏi hợp lệ." });
  }

  try {
    const filters = parseQuestion(question);
    console.log("Filters:", filters);

    let results = [];

    // Gọi API theo từng filter
    const fetchPromises = [];
    if (filters.name) {
      fetchPromises.push(
        fetch(
          `${
            process.env.API_URL
          }/api/products/search/name?name=${encodeURIComponent(filters.name)}`
        ).then((r) => r.json())
      );
    }
    if (filters.color) {
      fetchPromises.push(
        fetch(
          `${
            process.env.API_URL
          }/api/products/search/color?color=${encodeURIComponent(
            filters.color
          )}`
        ).then((r) => r.json())
      );
    }
    if (filters.size) {
      fetchPromises.push(
        fetch(
          `${
            process.env.API_URL
          }/api/products/search/size?size=${encodeURIComponent(filters.size)}`
        ).then((r) => r.json())
      );
    }
    if (filters.price) {
      fetchPromises.push(
        fetch(
          `${process.env.API_URL}/api/products/search/price?min=${filters.price.min}&max=${filters.price.max}`
        ).then((r) => r.json())
      );
    }

    const apiResponses = await Promise.all(fetchPromises);
    const productLists = apiResponses
      .map((res) => (Array.isArray(res?.data) ? res.data : []))
      .filter((arr) => arr.length > 0);

    if (productLists.length > 0) {
      results = productLists.reduce((acc, curr) =>
        acc.filter((p) => curr.some((c) => c.product_id === p.product_id))
      );
      if (results.length === 0) {
        results = [
          ...new Map(
            productLists.flat().map((p) => [p.product_id, p])
          ).values(),
        ];
      }
    }

    if (results.length === 0) {
      const fbRes = await fetch(`${process.env.API_URL}/api/products?limit=5`);
      const fbData = await fbRes.json();
      results = Array.isArray(fbData?.data) ? fbData.data : [];
    }

    // Prompt cho Gemini
    const prompt = `
Người dùng hỏi: "${question}"

Danh sách sản phẩm từ API:
${
  results.length > 0
    ? results
        .slice(0, 10)
        .map(
          (p) =>
            `- ${p.name} (id: ${p.product_id}, giá: ${p.price} VND, ảnh: ${p.image})`
        )
        .join("\n")
    : "Không có sản phẩm nào từ API."
}

Yêu cầu:
- Viết 1-2 câu trả lời tự nhiên bằng tiếng Việt với HNG store.
- Sau đó trả về một object JSON có dạng:
  {
    "message": "câu trả lời tự nhiên",
    "products": [ { product_id, name, price, image, url } ]
  }
- Nếu không có sản phẩm, để "products": [] nhưng vẫn có "message".
- KHÔNG thêm văn bản ngoài JSON.
`;

    const result = await generateContentWithRetry(model, prompt);
    let answer;
    try {
      answer = extractJsonFromText(result.response.text());
      if (!answer || !answer.products) throw new Error("Phản hồi không hợp lệ");
    } catch (err) {
      console.error("❌ Lỗi parse JSON Gemini:", err);
      answer = {
        message: "Xin lỗi, chưa tìm được sản phẩm phù hợp.",
        products: [],
      };
    }

    res.json(answer);
  } catch (err) {
    console.error("❌ Lỗi xử lý chat:", err);
    res.status(500).json({
      error: "Có lỗi khi xử lý yêu cầu.",
      details: err.message,
    });
  }
});

module.exports = router;
