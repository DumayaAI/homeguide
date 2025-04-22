import { useState, useRef, useEffect } from 'react';

export default function App() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const [isOpen, setIsOpen] = useState(true); // For floating toggle (optional)
  const [typing, setTyping] = useState(false); // Typing indicator state

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setTyping(true); // Show typing indicator

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input }),
      });

      const data = await res.json();
      const botMsg = {
        role: 'bot',
        content: data.response || '⚠️ No response.',
      };

      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'bot', content: '⚠️ Error talking to chatbot.' },
      ]);
    } finally {
      setTyping(false); // Hide typing indicator after response
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const containerStyle = `z-50 ${
    window.innerWidth < 640
      ? 'fixed inset-0 p-4' // full screen on mobile
      : 'fixed bottom-5 right-5 w-[90vw] sm:w-[360px]' // floating on desktop
  }`;

  return (
    <>
      {isOpen && (
        <div className={containerStyle}>
          <div className="bg-white rounded-2xl shadow-xl border border-gray-300 p-4 flex flex-col space-y-4 max-h-[90vh]">
            {/* Header */}
            <div className="flex justify-between items-center">
              <h1 className="text-lg font-semibold text-black text-center flex-1">
                🏡 Real Estate Chatbot
              </h1>
            </div>

            {/* Chat messages */}
            <div className="h-64 overflow-y-auto flex flex-col gap-3 bg-gray-100 p-3 rounded-lg scrollbar-thin scrollbar-thumb-gray-500">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`px-4 py-2 rounded-lg max-w-[80%] break-words ${
                    msg.role === 'user'
                      ? 'bg-blue-500 self-end text-white'   // User's message in blue
                      : 'bg-gray-200 self-start text-black'  // Bot's message in light gray
                  }`}
                >
                  {msg.content}
                </div>
              ))}

              {/* Typing indicator */}
              {typing && (
                <div className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg self-start animate-pulse w-fit">
                  ...
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="flex gap-2 items-center">
              <input
                type="text"
                className="flex-1 p-2 rounded-lg bg-gray-200 text-black placeholder-gray-400 outline-none"
                placeholder="Ask something..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
              <button
                onClick={handleSend}
                className="bg-blue-500 hover:bg-blue-600 px-4 py-2 rounded-lg text-white"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
