require("dotenv").config();
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const NodeCache = require("node-cache");
const cache = new NodeCache({ stdTTL: 300 }); // Cache 5 phút

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro" }); // Model ổn định năm 2025

// Hàm thử lại cho Gemini nếu lỗi 503
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

// Hàm trích xuất từ khóa (giữ nguyên dấu tiếng Việt)
function extractKeywords(question) {
  const stopWords = [
    "tìm",
    "cho",
    "tôi",
    "một",
    "cái",
    "các",
    "là",
    "và",
    "hãy",
    "giúp",
    "kiếm",
  ];
  const lowerQuestion = question.toLowerCase(); // Chỉ lowercase để so sánh
  const originalWords = question.split(/\s+/); // Từ gốc giữ dấu
  const lowerWords = lowerQuestion.split(/\s+/); // Từ lowercase để filter
  const filteredWords = originalWords.filter(
    (word, index) =>
      !stopWords.includes(lowerWords[index]) && lowerWords[index].length > 2
  );
  return filteredWords.join(" ") || "chân váy"; // Fallback mặc định
}

// Hàm trích xuất JSON từ văn bản (nếu có văn bản giải thích)
function extractJsonFromText(text) {
  try {
    // Tìm đoạn bắt đầu bằng [ và kết thúc bằng ]
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text); // Thử parse trực tiếp nếu không tìm thấy
  } catch (err) {
    console.error("❌ Lỗi trích xuất JSON:", err.message);
    return [];
  }
}

router.post("/", async (req, res) => {
  const { question } = req.body;

  // Kiểm tra input
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Vui lòng cung cấp câu hỏi hợp lệ." });
  }

  try {
    const keywords = extractKeywords(question);
    console.log("API_URL:", process.env.API_URL);
    console.log("Keywords:", keywords);

    const cacheKey = `products_${keywords}`;
    let products = cache.get(cacheKey);

    // Khởi tạo products là mảng rỗng nếu không có trong cache
    if (!products || !Array.isArray(products)) {
      products = [];
      console.log(
        "Không tìm thấy cache hoặc cache không hợp lệ, tiến hành fetch..."
      );

      // Fetch với timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 giây timeout

      try {
        const searchRes = await fetch(
          `${
            process.env.API_URL
          }/api/products/search/name?name=${encodeURIComponent(keywords)}`,
          { signal: controller.signal }
        );
        const searchData = await searchRes.json();
        products = Array.isArray(searchData?.data) ? searchData.data : [];
        console.log("Search API trả về:", products.length, "sản phẩm");
      } catch (err) {
        console.error("❌ Lỗi gọi search API:", err);
      } finally {
        clearTimeout(timeoutId);
      }

      // Fallback nếu rỗng, lấy giới hạn sản phẩm
      if (products.length === 0 && keywords) {
        try {
          const allRes = await fetch(
            `${process.env.API_URL}/api/products?limit=20`
          );
          const allData = await allRes.json();
          products = Array.isArray(allData?.data) ? allData.data : [];
          console.log("Fallback API trả về:", products.length, "sản phẩm");
        } catch (err) {
          console.error("❌ Lỗi gọi all products API:", err);
        }
      }

      // Lưu vào cache
      cache.set(cacheKey, products);
    }

    // Prompt tinh chỉnh: Chỉ trả về JSON thuần túy
    const prompt = `
Người dùng hỏi: "${question}"

Danh sách sản phẩm từ API:
${
  products.length > 0
    ? products
        .slice(0, 10) // Giới hạn tối đa 10 sản phẩm
        .map(
          (p) =>
            `- ${p.name} (giá: ${p.price} VND, slug: ${p.slug}, ảnh: ${p.image})`
        )
        .join("\n")
    : "Không có sản phẩm nào từ API."
}

Yêu cầu:
- Phân tích câu hỏi bằng tiếng Việt và chọn 3-5 sản phẩm phù hợp nhất từ danh sách trên.
- Trả về **chỉ** một mảng JSON thuần túy, mỗi sản phẩm có các trường: name, price, url[](https://fshop.nghienshopping.online/product/[slug]), image (URL ảnh).
- KHÔNG thêm bất kỳ văn bản giải thích nào trước hoặc sau JSON.
- Định dạng phản hồi chính xác như JSON, ví dụ:
[
  {"name": "Tên sản phẩm", "price": "X VND", "url": "https://fshop.nghienshopping.online/product/slug", "image": "https://example.com/image.jpg"},
  {"name": "Tên sản phẩm", "price": "Y VND", "url": "https://fshop.nghienshopping.online/product/slug", "image": "https://example.com/image.jpg"}
]
- Nếu không có sản phẩm, trả về mảng rỗng: [].
`;

    // Gọi Gemini với retry
    const result = await generateContentWithRetry(model, prompt);
    let answer;
    try {
      // Trích xuất JSON từ phản hồi
      answer = extractJsonFromText(result.response.text());
      if (!Array.isArray(answer)) {
        throw new Error("Phản hồi từ Gemini không phải mảng JSON");
      }
    } catch (parseErr) {
      console.error("❌ Lỗi parse JSON từ Gemini:", parseErr);
      answer = []; // Fallback về mảng rỗng
    }

    res.json({ products: answer });
  } catch (err) {
    console.error("❌ Lỗi xử lý chat:", err);
    res.status(500).json({
      error: "Có lỗi khi xử lý yêu cầu.",
      details: err.message,
      status: err.status || 500,
    });
  }
});

module.exports = router;
