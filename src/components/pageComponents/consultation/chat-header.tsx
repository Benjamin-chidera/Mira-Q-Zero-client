import { Video, Phone, MoreVertical } from "lucide-react";

const ChatHeader = () => {
  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
      {/* Doctor Info */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src="/doctor-avatar.png"
            alt="Dr. West End"
            className="w-11 h-11 rounded-full object-cover"
          />
          {/* Online indicator */}
          <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900">Amelia Thompson</h2>
          <p className="text-sm text-gray-500">General Practitioner · Online</p>
        </div>
      </div>

      {/* Action Icons */}
      <div className="flex items-center gap-3">
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Video className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <Phone className="w-5 h-5" />
        </button>
        <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
          <MoreVertical className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export default ChatHeader;
