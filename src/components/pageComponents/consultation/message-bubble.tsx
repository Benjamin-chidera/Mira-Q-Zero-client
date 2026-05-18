import { FileText, Download } from "lucide-react";

// Attachment data shape
interface Attachment {
  name: string;
  size: string;
}

interface MessageBubbleProps {
  content: string;
  time: string;
  isDoctor: boolean;
  isRead?: boolean;
  attachment?: Attachment;
}

const MessageBubble = ({
  content,
  time,
  isDoctor,
  isRead = false,
  attachment,
}: MessageBubbleProps) => {
  // Doctor messages are left-aligned, patient messages are right-aligned
  if (isDoctor) {
    return (
      <div className="flex items-start gap-3 max-w-4xl">
        {/* Doctor avatar */}
        <img
          src="/doctor-avatar.png"
          alt="Doctor"
          className="w-9 h-9 rounded-full object-cover mt-1 shrink-0"
        />

        <div>
          {/* Message with blue left border */}
          <div className="bg-white border-l-3 border-[#005EB8] rounded-r-lg px-4 py-3 shadow-sm">
            <p className="text-sm text-gray-800 leading-relaxed">{content}</p>

            {/* File attachment */}
            {attachment && (
              <div className="mt-3 flex items-center justify-between bg-[#F5F7FA] rounded-lg px-4 py-3 border border-gray-200">
                <div className="flex items-center gap-3">
                  <div className="bg-[#005EB8]/10 p-2 rounded-lg">
                    <FileText className="w-4 h-4 text-[#005EB8]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#005EB8]">
                      {attachment.name}
                    </p>
                    <p className="text-xs text-gray-400">{attachment.size}</p>
                  </div>
                </div>
                <button className="p-2 text-gray-400 hover:text-[#005EB8] transition-colors">
                  <Download className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Timestamp */}
          <p className="text-xs text-[#005EB8] mt-1.5 ml-1">{time}</p>
        </div>
      </div>
    );
  }

  // Patient message (right-aligned, blue background)
  return (
    <div className="flex flex-col items-end max-w-4xl ml-auto">
      <div className="bg-[#005EB8] rounded-xl px-4 py-3 shadow-sm">
        <p className="text-sm text-white leading-relaxed">{content}</p>
      </div>

      {/* Timestamp + read status */}
      <p className="text-xs text-gray-400 mt-1.5 mr-1">
        {time}
        {isRead && " · Read"}
      </p>
    </div>
  );
};

export default MessageBubble;
