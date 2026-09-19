import React, { useState } from 'react';

// Pinned message box. Enter sends, Shift+Enter adds a new line.
// Kept only if onSend resolves to false, so a failed send doesn't lose the text.
const Composer = ({ onSend, disabled = false, placeholder = 'Message…' }) => {
  const [text, setText] = useState('');

  const submit = async (e) => {
    e?.preventDefault();
    const value = text.trim();
    if (!value || disabled) return;
    // onSend may return false (e.g. a failed request) to keep the draft.
    const ok = await onSend(value);
    if (ok !== false) setText('');
  };

  return (
    <div className="shrink-0 px-3 pb-3 pt-2 md:px-5 md:pb-5">
      <form
        onSubmit={submit}
        className="flex items-center gap-3 rounded-full border border-line px-4 py-2 transition-colors focus-within:border-line-strong"
      >
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) submit(e);
          }}
          placeholder={placeholder}
          aria-label="Message"
          rows="1"
          maxLength={2000}
          className="max-h-24 flex-1 resize-none bg-transparent py-1 text-sm leading-5 text-fg placeholder:text-subtle focus:outline-none"
        />
        <button type="submit" disabled={!text.trim() || disabled} className="link-btn">
          Send
        </button>
      </form>
    </div>
  );
};

export default Composer;
