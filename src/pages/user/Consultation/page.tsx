import TopNavbar from "@/components/pageComponents/consultation/top-navbar";
import NavSidebar from "@/components/pageComponents/Sidebar/nav-sidebar";
import ChatHeader from "@/components/pageComponents/consultation/chat-header";
import MessageBubble from "@/components/pageComponents/consultation/message-bubble";
import QuickReplies from "@/components/pageComponents/consultation/quick-replies";
import MessageInput from "@/components/pageComponents/consultation/message-input";
import AISplitScreen from "@/components/pageComponents/consultation/ai-split-screen";
import { useAgentStore } from "@/store/agents";

// Sample conversation data
const MESSAGES = [
  {
    id: 1,
    content:
      "Hello. I've reviewed your latest blood test results. Everything looks normal, but I'd like to discuss your Vitamin D levels which are on the lower end of the spectrum.",
    time: "09:30 AM",
    isDoctor: true,
  },
  {
    id: 2,
    content:
      "Thank you for letting me know, Doctor. Should I start taking supplements, or can I manage this through diet?",
    time: "09:35 AM",
    isDoctor: false,
    isRead: true,
  },
  {
    id: 3,
    content:
      "I recommend a combination. I've attached a guidance leaflet on Vitamin D rich foods and a prescription for a high-strength supplement for the first 3 months.",
    time: "09:42 AM",
    isDoctor: true,
    attachment: {
      name: "Vitamin_D_Guide.pdf",
      size: "1.2 MB",
    },
  },
];

const QUICK_REPLIES = ["Confirm Receipt", "Ask about dosage", "Schedule Call"];

export const ConsultationPage = () => {
  const handleQuickReply = (reply: string) => {
    console.log("Quick reply selected:", reply);
    // TODO: Handle quick reply action
  };
  const { isSplitScreen } = useAgentStore();

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col h-screen bg-gray-50">
        {/* Top Navbar */}
        <TopNavbar />

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <NavSidebar activeItem="consultation" />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {/* Chat Header */}
            <ChatHeader />

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-6 py-6 w-full">
              {/* Today Date Badge */}
              <div className="flex justify-center mb-8">
                <span className="px-4 py-1.5 bg-white border border-gray-200 rounded-full text-xs font-medium text-gray-600 shadow-sm">
                  Today
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-12">
                {MESSAGES.map((msg) => (
                  <MessageBubble
                    key={msg.id}
                    content={msg.content}
                    time={msg.time}
                    isDoctor={msg.isDoctor}
                    isRead={msg.isRead}
                    attachment={msg.attachment}
                  />
                ))}
              </div>

              {/* Quick Reply Buttons */}
              <div className="max-w-3xl mx-auto mt-4">
                <QuickReplies
                  replies={QUICK_REPLIES}
                  onReplyClick={handleQuickReply}
                />
              </div>
            </div>

            {/* Message Input */}
            <MessageInput />
          </div>
        </div>
      </div>

      {isSplitScreen && (
        <div className="w-[450px] shrink-0 h-screen border-l border-gray-200 bg-white">
          <AISplitScreen />
        </div>
      )}
    </main>
  );
};

export default ConsultationPage;
