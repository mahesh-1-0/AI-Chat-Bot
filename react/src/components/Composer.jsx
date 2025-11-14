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
      className="space-y-3 pixel-border bg-pixel-panel p-4 mt-4 relative"
      style={{
        boxShadow: '8px 8px 0 #000000, inset -2px -2px 0 rgba(255,255,255,0.1)'
      }}
    >
      <label
        htmlFor="chat-input"
        className="block text-[0.7rem] uppercase tracking-wider text-pixel-accent font-pixel"
        style={{
          textShadow: '2px 2px 0 #000000'
        }}
      >
        MESSAGE
      </label>
      <textarea
        id="chat-input"
        ref={ref}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="TYPE YOUR MESSAGE..."
        aria-required="true"
        rows={3}
        className="w-full resize-none font-pixel text-[0.7rem] border-3 border-pixel-border bg-pixel-bg text-pixel-text p-3 focus:border-pixel-accent focus:outline-none"
        style={{
          boxShadow: 'inset 4px 4px 0 rgba(0,0,0,0.3), 4px 4px 0 #000000'
        }}
      />
      <div className="flex flex-wrap items-center gap-3 text-[0.6rem] text-pixel-text-muted">
        <p className="flex-1 leading-relaxed">
          PRESS ENTER TO SEND. SHIFT+ENTER FOR NEW LINE.
        </p>
        <button
          type="submit"
          disabled={disabled}
          className="pixel-button bg-pixel-accent border-pixel-accent-strong text-black px-4 py-2 text-[0.65rem] disabled:opacity-50 disabled:cursor-not-allowed"
          style={{
            boxShadow: disabled 
              ? 'none' 
              : '4px 4px 0 #000000, inset -2px -2px 0 rgba(255,255,255,0.2)',
            textShadow: '1px 1px 0 rgba(255,255,255,0.3)'
          }}
        >
          SEND
        </button>
      </div>
    </form>
  );
});

export default Composer;
