import { useEffect, useRef, useState } from "react";

const suggestions = [
  "Which inventory item is at highest risk?",
  "Why is BTMC-450 high risk?",
  "Which products need replenishment?",
  "Which supplier should I consider?",
];

export function SmartBuyChatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi Sophie. I'm SmartBuy AI. I can help you analyze inventory, stock risk, products, suppliers and procurement decisions.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(message = input) {
    const text = message.trim();

    if (!text || loading) return;

    setInput("");

    const userMessage = {
      id: Date.now(),
      role: "user",
      content: text,
    };

    setMessages((current) => [
      ...current,
      userMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          message: text,
        }),
      });

      const payload = await response.json();

      if (!response.ok) {
        throw new Error(
          payload.message || "Unable to contact SmartBuy AI",
        );
      }

      const answer =
        payload.data?.answer ||
        "I couldn't generate an answer.";

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: answer,
        },
      ]);
    } catch (error) {
      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          role: "assistant",
          content:
            error.message ||
            "Something went wrong while contacting SmartBuy AI.",
          error: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(event) {
    event.preventDefault();
    sendMessage();
  }

  return (
    <div className="chatbot-panel">
      <div className="chatbot-header">
        <div>
          <span className="chatbot-ai-icon">✦</span>

          <div>
            <strong>SmartBuy AI</strong>
            <small>Inventory & Procurement Assistant</small>
          </div>
        </div>

        <button
          type="button"
          className="chatbot-close"
          onClick={onClose}
          aria-label="Close SmartBuy AI"
        >
          ×
        </button>
      </div>

      <div className="chatbot-messages">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`chat-message ${
              message.role === "user"
                ? "chat-message-user"
                : "chat-message-ai"
            }`}
          >
            {message.content}
          </div>
        ))}

        {loading && (
          <div className="chat-message chat-message-ai">
            <span className="chat-loading">
              SmartBuy AI is analyzing…
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {messages.length === 1 && (
        <div className="chatbot-suggestions">
          {suggestions.map((suggestion) => (
            <button
              type="button"
              key={suggestion}
              onClick={() => sendMessage(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      )}

      <form
        className="chatbot-input"
        onSubmit={handleSubmit}
      >
        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          placeholder="Ask about inventory, risk or suppliers..."
          disabled={loading}
        />

        <button
          type="submit"
          disabled={!input.trim() || loading}
          aria-label="Send message"
        >
          →
        </button>
      </form>
    </div>
  );
}