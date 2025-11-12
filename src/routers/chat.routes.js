// file: chat.routes.js

require("dotenv").config();
const express = require("express");
const router = express.Router();
const { GoogleGenerativeAI } = require("@google/generative-ai");
const fetch = require("node-fetch"); // Đảm bảo anh đã cài: npm install node-fetch

// Khởi tạo Gemini model (Dùng 1.5 Flash để hỗ trợ Tool tốt hơn)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- Model 1: Dùng để phân tích câu hỏi và chọn API (NLU) ---
// (Sử dụng các API "thông minh" từ api.js của anh)
const toolConfig = {
  tools: [
    {
      functionDeclarations: [
        {
          name: "getProductByCategorySlug",
          description:
            "Lấy sản phẩm theo danh mục. Dùng khi người dùng hỏi rõ về 1 loại (áo thun, sơ mi, váy...).",
          parameters: {
            type: "object",
            properties: {
              slug: {
                type: "string",
                description: "Slug của danh mục, ví dụ: 'ao-thun-nam'.",
              },
              filters: {
                type: "object",
                properties: {
                  color: { type: "string" },
                  size: { type: "string" },
                  // --- CẬP NHẬT MÔ TẢ GIÁ ---
                  minPrice: {
                    type: "number",
                    description: "Giá TỐI THIỂU (ví dụ: 'trên 500k').",
                  },
                  maxPrice: {
                    type: "number",
                    description: "Giá TỐI ĐA (ví dụ: 'dưới 500k').",
                  },
                  approxPrice: {
                    type: "number",
                    description:
                      "Giá KHOẢNG. Dùng khi có từ 'khoảng', 'tầm'. Ví dụ: 'khoảng 600k', 'tầm 600 cành' -> 600000.",
                  },
                  height: {
                    type: "number",
                    description: "Chiều cao (cm). Ví dụ: '1m7' -> 170.",
                  },
                  weight: {
                    type: "number",
                    description: "Cân nặng (kg). Ví dụ: '65kg' -> 65.",
                  },
                },
              },
            },
          },
        },
        {
          name: "searchProducts",
          description:
            "Tìm kiếm sản phẩm nâng cao. Dùng cho các câu hỏi chung (ví dụ: 'áo thun nam đen', 'áo khoác dưới 500k').",
          parameters: {
            type: "object",
            properties: {
              queryTerm: {
                type: "string",
                description: "Từ khóa tìm kiếm (ví dụ: 'áo thun nam đen')",
              },
              filters: {
                type: "object",
                properties: {
                  color: { type: "string" },
                  size: { type: "string" },
                  // --- CẬP NHẬT MÔ TẢ GIÁ ---
                  minPrice: {
                    type: "number",
                    description: "Giá TỐI THIỂU (ví dụ: 'trên 500k').",
                  },
                  maxPrice: {
                    type: "number",
                    description: "Giá TỐI ĐA (ví dụ: 'dưới 500k').",
                  },
                  approxPrice: {
                    type: "number",
                    description:
                      "Giá KHOẢNG. Dùng khi có từ 'khoảng', 'tầm'. Ví dụ: 'khoảng 600k', 'tầm 600 cành' -> 600000.",
                  },
                  height: {
                    type: "number",
                    description: "Chiều cao (cm). Ví dụ: '1m7' -> 170.",
                  },
                  weight: {
                    type: "number",
                    description: "Cân nặng (kg). Ví dụ: '65kg' -> 65.",
                  },
                },
              },
            },
          },
        },
        {
          name: "getGeneralProducts",
          description:
            "Lấy sản phẩm chung. Dùng khi người dùng chỉ chào hỏi hoặc hỏi câu không liên quan.",
          parameters: { type: "object", properties: {} },
        },
      ],
    },
  ],
};

const nluModel = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
  ...toolConfig,
});

// --- Model 2: Dùng để tạo câu trả lời (Giữ nguyên model của anh) ---
const generationModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// -----------------
// Hàm retry Gemini (Giữ nguyên)
// -----------------
async function generateContentWithRetry(
  model,
  prompt,
  retries = 3,
  delay = 1000
) {
  // ... (Code retry của anh giữ nguyên)
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

function suggestSizeFromMetrics(height, weight) {
  if (!height || !weight) return null;

  if (height < 160 || weight < 50) return "S";
  if (height <= 170 && weight <= 65) return "M";
  if (height <= 180 && weight <= 75) return "L";
  return "XL";
}

// -----------------
// HÀM MỚI: Dùng AI để tìm sản phẩm
// -----------------
async function findProducts(question, retries = 3, delay = 1000) {
  const chat = nluModel.startChat();

  for (let i = 0; i < retries; i++) {
    try {
      const result = await chat.sendMessage(question);

      const call = result.response.functionCalls()?.[0];

      if (!call) {
        // Nếu AI không gọi API, gọi getGeneralProducts
        return callApi("getGeneralProducts", {});
      }

      // Thực thi API mà AI đã chọn
      const { name, args } = call;
      return await callApi(name, args);
    } catch (err) {
      // THÊM LOGIC RETRY NẾU LÀ LỖI 503
      if (err.status === 503 && i < retries - 1) {
        console.log(`Lỗi NLU (503), thử lại lần ${i + 1} sau ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue; // Thử lại
      }

      console.error("Lỗi NLU:", err);
      // Fallback nếu NLU lỗi sau nhiều lần thử
      return callApi("getGeneralProducts", {});
    }
  }
  // Fallback sau khi retry hết
  return callApi("getGeneralProducts", {});
}

// -----------------
// HÀM MỚI: Helper để gọi API động
// -----------------
async function callApi(functionName, args) {
  let url = "";
  const params = new URLSearchParams();
  let filters = args.filters || {};
  let suggestedSize = null;

  // Mức chênh lệch giá (anh muốn 150k-200k, tôi chọn 150k)
  const priceMargin = 150000;

  // --- LOGIC TƯ VẤN SIZE (Giữ nguyên) ---
  if (!filters.size && filters.height && filters.weight) {
    suggestedSize = suggestSizeFromMetrics(filters.height, filters.weight);
    if (suggestedSize) {
      console.log(
        `Đã gợi ý size: ${suggestedSize} (từ ${filters.height}cm, ${filters.weight}kg)`
      );
      filters.size = suggestedSize;
    }
  }

  // --- LOGIC GIÁ MỚI ---
  // Xác định tên tham số (API search dùng 'min', API category dùng 'minPrice')
  const minParam = functionName === "searchProducts" ? "min" : "minPrice";
  const maxParam = functionName === "searchProducts" ? "max" : "maxPrice";

  // Ưu tiên 1: Nếu AI phát hiện "giá khoảng" (approxPrice)
  if (filters.approxPrice && !filters.minPrice && !filters.maxPrice) {
    console.log(
      `Đã phát hiện 'giá khoảng': ${filters.approxPrice}. Tạo dải giá.`
    );

    // Tạo dải giá (ví dụ: 600k -> min=450k, max=750k)
    params.append(minParam, Math.max(0, filters.approxPrice - priceMargin));
    params.append(maxParam, filters.approxPrice + priceMargin);
  }
  // Ưu tiên 2: Nếu AI phát hiện "min" hoặc "max" (ví dụ: "trên 500k", "dưới 300k")
  else {
    if (filters.minPrice) params.append(minParam, filters.minPrice);
    if (filters.maxPrice) params.append(maxParam, filters.maxPrice);
  }
  // --- KẾT THÚC LOGIC GIÁ MỚI ---

  // Xây dựng URL (Logic này đã được sửa ở bước trước)
  switch (functionName) {
    case "getProductByCategorySlug":
      if (!args.slug) return callApi("getGeneralProducts", {});
      url = `${process.env.API_URL}/api/products/category/${args.slug}`;
      break;

    case "searchProducts":
      if (!args.queryTerm) return callApi("getGeneralProducts", {});
      url = `${process.env.API_URL}/api/products/search`;
      params.append("q", args.queryTerm);
      params.append("inStock", "true");
      // (Không cần thêm logic giá ở đây nữa vì đã xử lý ở trên)
      break;

    case "getGeneralProducts":
    default:
      url = `${process.env.API_URL}/api/products`;
      params.append("limit", 5);
      break;
  }

  // Thêm các filters còn lại (size giờ đã được tự động thêm nếu có tư vấn)
  if (filters.color) params.append("color", filters.color);
  if (filters.size) params.append("size", filters.size);

  const queryString = params.toString();
  const finalUrl = queryString ? `${url}?${queryString}` : url;

  console.log("Đang gọi API:", finalUrl);

  try {
    const res = await fetch(finalUrl);
    const data = await res.json();
    const products = data?.data?.products || data?.data || [];

    // Trả về object
    return { products: products, suggestedSize: suggestedSize };
  } catch (err) {
    console.error("Lỗi gọi API sản phẩm:", err);
    return { products: [], suggestedSize: null };
  }
}

// -----------------
// Extract JSON (Giữ nguyên)
// -----------------
function extractJsonFromText(text) {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (typeof parsed.message === "string") {
        return parsed;
      }
    }
    // Fallback nếu AI không trả về JSON
    return { message: text.replace(/```json|```/g, "").trim() };
  } catch (err) {
    console.error("❌ Lỗi trích xuất JSON:", err.message);
    return { message: text }; // Trả về text thô nếu lỗi
  }
}

// -----------------
// Endpoint chính (ĐÃ NÂNG CẤP)
// -----------------
router.post("/", async (req, res) => {
  const { question } = req.body;
  if (!question || typeof question !== "string") {
    return res.status(400).json({ error: "Vui lòng cung cấp câu hỏi hợp lệ." });
  }

  try {
    // 1. DÙNG AI ĐỂ TÌM SẢN PHẨM
    // 'results' giờ là object: { products: [...], suggestedSize: "M" }
    const results = await findProducts(question);

    const products = results.products || [];
    const suggestedSize = results.suggestedSize; // Lấy size đã tư vấn

    console.log(
      `Tìm thấy ${products.length} sản phẩm (Size gợi ý: ${
        suggestedSize || "N/A"
      })`
    );

    // 2. DÙNG AI ĐỂ TẠO CÂU TRẢ LỜI
    // (Cập nhật prompt để AI biết về size tư vấn)
    const prompt = `
Người dùng hỏi: "${question}"

Sản phẩm tìm được: ${products.length > 0 ? products.length : "0"} sản phẩm.
${
  products.length > 0
    ? "Một vài sản phẩm: " +
      products
        .slice(0, 3)
        .map((p) => p.name)
        .join(", ")
    : "(Không có sản phẩm)"
}

${
  suggestedSize
    ? `(Hệ thống đã tự động gợi ý size ${suggestedSize} cho người dùng)`
    : ""
}

Yêu cầu:
- Viết 1-2 câu trả lời tự nhiên bằng tiếng Việt (với tên shop là HNG store).
- Nếu có 'suggestedSize' (ví dụ "M"), HÃY nhắc đến nó trong câu trả lời (ví dụ: "Dạ, với thông tin của bạn, HNG gợi ý size M. Đây là một số sản phẩm phù hợp...").
- Nếu không có sản phẩm, hãy trả lời là tiếc quá chưa tìm được.
- CHỈ trả lời 1-2 câu.
- Trả lời dưới dạng JSON object: { "message": "câu trả lời tự nhiên của bạn" }
- KHÔNG thêm văn bản ngoài JSON.
`;

    // Gọi model 2 (Generation)
    const result = await generateContentWithRetry(generationModel, prompt);
    let chatResponse;
    try {
      chatResponse = extractJsonFromText(result.response.text());
      if (!chatResponse || typeof chatResponse.message !== "string") {
        throw new Error("Phản hồi không có 'message'");
      }
    } catch (err) {
      console.error("❌ Lỗi parse JSON Gemini (message only):", err);
      chatResponse = {
        message:
          "Xin lỗi, HNG store chưa hiểu rõ ý bạn. Bạn có thể hỏi về áo thun hoặc váy không?",
      };
    }

    // 3. SERVER TỰ TẠO DANH SÁCH SẢN PHẨM (Đảm bảo ID đúng)
    const productsForClient = products.slice(0, 6).map((p) => ({
      product_id: p.product_id,
      name: p.name,
      price: p.price,
      image: p.image,
      url: `/product/${p.product_id}`,
    }));

    // 4. GỬI KẾT QUẢ CUỐI CÙNG
    res.json({
      message: chatResponse.message, // Message (từ AI)
      products: productsForClient, // Products (từ Server)
    });
  } catch (err) {
    console.error("❌ Lỗi xử lý chat:", err);
    res.status(500).json({
      error: "Có lỗi khi xử lý yêu cầu.",
      details: err.message,
    });
  }
});

module.exports = router;
