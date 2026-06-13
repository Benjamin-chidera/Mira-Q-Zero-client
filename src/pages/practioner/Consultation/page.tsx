import { useState } from "react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TopNavbar from "@/components/pageComponents/consultation/top-navbar";
import ChatHeader from "@/components/pageComponents/consultation/chat-header";
import MessageBubble from "@/components/pageComponents/consultation/message-bubble";
import QuickReplies from "@/components/pageComponents/consultation/quick-replies";
import MessageInput from "@/components/pageComponents/consultation/message-input";
import AISplitScreen from "@/components/pageComponents/consultation/ai-split-screen";
import { useAgentStore } from "@/store/agents";
import NavSidebarPractitioner from "@/components/pageComponents/Sidebar/nav-sidebar-practice";

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

export const PractitionerConsultationPage = () => {
  const [activeTab, setActiveTab] = useState("patient");

  const handleQuickReply = (reply: string) => {
    console.log("Quick reply selected:", reply);
    // TODO: Handle quick reply action
  };
  const { isSplitScreen } = useAgentStore();

  return (
    <main className="flex h-screen overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col h-screen bg-gray-50">
        {/* Top Navbar */}
        <TopNavbar>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-[18.75rem]">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100/50 p-1">
              <TabsTrigger 
                value="patient" 
                className="rounded-md data-[state=active]:bg-[#005EB8] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Patient
              </TabsTrigger>
              <TabsTrigger 
                value="doctor" 
                className="rounded-md data-[state=active]:bg-[#005EB8] data-[state=active]:text-white data-[state=active]:shadow-sm transition-all"
              >
                Doctor
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </TopNavbar>

        <div className="flex flex-1 overflow-hidden">
          {/* Left Sidebar Navigation */}
          <NavSidebarPractitioner activeItem="consultation" />

          {/* Main Chat Area */}
          <div className="flex-1 flex flex-col">
            {activeTab === "patient" ? (
              <>
                {/* Chat Header for Patient */}
                <ChatHeader />

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 w-full custom-scrollbar">
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
              </>
            ) : (
              <>
                {/* Chat Header for Old GP */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-white">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-11 h-11 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 font-bold">
                        Dr
                      </div>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">Old GP (Dr. Smith)</h2>
                      <p className="text-sm text-gray-500">General Practitioner · Offline</p>
                    </div>
                  </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto px-6 py-6 w-full custom-scrollbar flex items-center justify-center">
                   <p className="text-gray-500">No previous messages with old GP.</p>
                </div>

                {/* Message Input */}
                <MessageInput />
              </>
            )}
          </div>
        </div>
      </div>

      {isSplitScreen && (
        <div className="w-[28.125rem] shrink-0 h-screen border-l border-gray-200 bg-white">
          <AISplitScreen />
        </div>
      )}
    </main>
  );
};

