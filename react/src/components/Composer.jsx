import { forwardRef } from "react";

const Composer = forwardRef(function Composer(
  { value, onChange, onSend, disabled },
  ref
) {
  function handleSubmit(event) {
    event.preventDefault();
    onSend();
  }

  function handleKeyDown(event) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      onSend();
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-3 bg-gray-50 dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700"
    >
      <label
        htmlFor="chat-input"
        className="block text-sm font-semibold text-gray-900 dark:text-white"
      >
        Message
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Type your message..."
        aria-required="true"
        rows={3}
        className="w-full resize-none px-4 py-3 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
      />
      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500 dark:text-gray-400">
        <p className="flex-1">
          Press Enter to send. Use Shift+Enter for a new line.
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed rounded-lg transition-colors"
        >
          Send
        </button>
      </div>
    </form>
  );
});

export default Composer;
