import clsx from "clsx";

export default function Message({ message, isTyping = false }) {
  const { sender, text, timestamp } = message;
  const isUser = sender === "user";

  return (
    <li className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[85%] px-4 py-3.5 rounded-xl text-sm leading-relaxed",
          isUser
            ? "bg-blue-600 text-white rounded-br-sm"
            : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-sm border border-gray-200 dark:border-gray-600"
        )}
      >
        {isTyping ? (
          <span className="flex gap-1.5 items-center">
            <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce"></span>
            <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-2 h-2 bg-gray-500 dark:bg-gray-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </span>
        ) : (
          <p className="whitespace-pre-line">{text}</p>
        )}
        {!isTyping && (
          <p className="mt-2 text-xs opacity-70 font-medium">
            {sender === "user" ? "You" : "Bot"} •{" "}
            {new Date(timestamp).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        )}
      </div>
    </li>
  );
}
