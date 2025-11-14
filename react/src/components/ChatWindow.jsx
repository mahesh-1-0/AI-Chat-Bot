import { useEffect, useRef } from "react";
import Message from "./Message.jsx";

export default function ChatWindow({ messages, isTyping }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) return;
    node.scrollTop = node.scrollHeight;
  }, [messages, isTyping]);

  const typingMessage = {
    id: "typing-indicator",
    sender: "bot",
    text: "",
    timestamp: new Date().toISOString(),
  };

  return (
    <div className="flex-1 min-h-0">
      <ol
        ref={containerRef}
        role="log"
        aria-live="polite"
        aria-label="Conversation transcript"
        className="flex h-full flex-col gap-4 overflow-auto bg-gray-50 dark:bg-gray-900 p-4 rounded-lg"
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}
        {isTyping && <Message message={typingMessage} isTyping />}
      </ol>
    </div>
  );
}
