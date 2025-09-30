"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";

const Chat = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { role: "assistant", content: "Xin chào 👋! Tôi có thể giúp gì cho bạn?" },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  const sendMessage = async () => {
    if (!input.trim()) return;
    const userInput = input;
    setInput("");

    const newMessages = [...messages, { role: "user", content: userInput }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: userInput }),
      });
      const data = await res.json();
      console.log("API /chat response:", data);

      const products = Array.isArray(data.products) ? data.products : [];
      const assistantMessage = {
        role: "assistant",
        message: data.message || "Đây là các sản phẩm mình tìm thấy:",
        products,
      };

      setMessages([...newMessages, assistantMessage]);
    } catch (error) {
      console.error("Error calling /chat API:", error);
      setMessages([
        ...newMessages,
        { role: "assistant", content: "Có lỗi xảy ra, vui lòng thử lại." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [messages, loading]);

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 bg-blue-500 text-white p-4 rounded-full shadow-lg hover:bg-blue-600 transition-transform hover:scale-110"
        >
          💬
        </button>
      )}

      {open && (
        <div
          className="fixed bottom-6 right-6 z-50 w-80 bg-white border rounded-lg shadow-xl flex flex-col animate-slide-up"
          style={{ maxHeight: "500px" }}
        >
          <div className="flex justify-between items-center p-3 border-b bg-blue-500 text-white rounded-t-lg">
            <span>Hỗ trợ AI</span>
            <button
              onClick={() => setOpen(false)}
              className="hover:text-gray-200"
            >
              <X size={20} />
            </button>
          </div>

          <div
            ref={chatContainerRef}
            className="p-3 h-80 overflow-y-auto space-y-3 text-sm"
          >
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex mb-2 ${
                  msg.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`px-3 py-2 rounded-lg max-w-[75%] shadow
        ${
          msg.role === "user"
            ? "bg-blue-500 text-white rounded-br-none"
            : "bg-gray-100 text-gray-800 rounded-bl-none"
        }`}
                >
                  {/* Trả lời tự nhiên */}
                  {msg.content && <span>{msg.content}</span>}
                  {msg.message && <span>{msg.message}</span>}

                  {/* Nếu có sản phẩm */}
                  {msg.products && msg.products.length > 0 && (
                    <ul className="space-y-4 mt-2">
                      {msg.products.map((product, index) => (
                        <li key={index} className="border-b pb-2">
                          <p className="font-bold">{product.name}</p>
                          {product.price && <p>Giá: {product.price} VND</p>}
                          <Link
                            to={`/product/${product.product_id}`}
                            className="text-blue-500 hover:underline"
                          >
                            Xem chi tiết
                          </Link>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              className="mt-2 rounded-md"
                            />
                          )}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start mb-2">
                <div className="bg-gray-100 text-gray-600 rounded-lg px-2 py-1 inline-flex loading-dots">
                  <span className="mx-0.5">.</span>
                  <span className="mx-0.5">.</span>
                  <span className="mx-0.5">.</span>
                </div>
              </div>
            )}
          </div>

          <div className="flex border-t">
            <input
              className="flex-1 p-2 text-sm"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Nhập câu hỏi..."
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />
            <button
              onClick={sendMessage}
              className="px-3 bg-blue-500 text-white text-sm"
            >
              Gửi
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chat;
