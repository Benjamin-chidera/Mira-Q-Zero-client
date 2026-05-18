import { useState } from "react";
import { Paperclip, Send, AlertCircle } from "lucide-react";

const MessageInput = () => {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    if (!message.trim()) return;
    // TODO: Send message logic
    setMessage("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="px-6 py-4 bg-white border-t border-gray-200">
      {/* Input Row */}
      <div className="flex items-center gap-3">
        <div className="flex-1 relative">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message here..."
            className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#005EB8]/20 focus:border-[#005EB8] transition-colors"
          />
          <button className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
            <Paperclip className="w-5 h-5" />
          </button>
        </div>

        {/* Send Button */}
        <button
          onClick={handleSend}
          className="w-11 h-11 bg-[#005EB8] hover:bg-[#004C99] text-white rounded-xl flex items-center justify-center transition-colors shrink-0"
        >
          <Send className="w-5 h-5" />
        </button>
      </div>

      {/* Emergency Notice */}
      <div className="flex items-center gap-1.5 mt-2">
        <AlertCircle className="w-3.5 h-3.5 text-gray-400" />
        <p className="text-xs text-gray-400">
          For medical emergencies, please call 999 or go to the nearest A&E.
        </p>
      </div>
    </div>
  );
};

export default MessageInput;
