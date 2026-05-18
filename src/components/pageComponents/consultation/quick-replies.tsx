interface QuickRepliesProps {
  replies: string[];
  onReplyClick?: (reply: string) => void;
}

const QuickReplies = ({ replies, onReplyClick }: QuickRepliesProps) => {
  return (
    <div className="flex items-center justify-center gap-3 py-4">
      {replies.map((reply) => (
        <button
          key={reply}
          onClick={() => onReplyClick?.(reply)}
          className="px-4 py-2 text-sm font-medium text-[#005EB8] border border-[#005EB8] rounded-full hover:bg-[#005EB8] hover:text-white transition-colors"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default QuickReplies;
