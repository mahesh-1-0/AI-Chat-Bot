import clsx from "clsx";

export default function Message({ message, isTyping = false }) {
  const { sender, text, timestamp } = message;
  const isUser = sender === "user";

  return (
    <li className={clsx("flex", isUser ? "justify-end" : "justify-start")}>
      <div
        className={clsx(
          "max-w-[90%] border-3 px-4 py-3 font-pixel text-[0.7rem] leading-relaxed",
          isUser
            ? "bg-pixel-user border-pixel-user text-white"
            : "bg-pixel-bot border-pixel-bot text-white"
        )}
        style={{
          boxShadow: '4px 4px 0 #000000, inset -1px -1px 0 rgba(255,255,255,0.1)',
          textShadow: '2px 2px 0 rgba(0,0,0,0.5)'
        }}
      >
        {isTyping ? (
          <span className="flex gap-2 items-center">
            <span 
              className="w-2 h-2 bg-white"
              style={{
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                animation: 'pixel-blink 1.2s infinite ease-in-out'
              }}
            ></span>
            <span 
              className="w-2 h-2 bg-white"
              style={{
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                animation: 'pixel-blink 1.2s infinite ease-in-out 0.2s'
              }}
            ></span>
            <span 
              className="w-2 h-2 bg-white"
              style={{
                boxShadow: '2px 2px 0 rgba(0,0,0,0.5)',
                animation: 'pixel-blink 1.2s infinite ease-in-out 0.4s'
              }}
            ></span>
          </span>
        ) : (
          <p className="whitespace-pre-line">{text}</p>
        )}
        {!isTyping && (
          <p className="mt-2 text-[0.55rem] uppercase tracking-wider text-white/70">
            {sender === "user" ? "YOU" : "BOT"} •{" "}
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
