import { File, Image as ImageIcon, ExternalLink, X } from "lucide-react";
import type { ChatAttachment } from "@/store/aiResearcher.store";

interface AttachmentPreviewProps {
  attachment: ChatAttachment;
  onRemove?: (id: string) => void; // If provided, shows a remove button (for pending attachments)
}

/**
 * Renders a single attachment chip — used in both sent messages and the pending attachments bar.
 * Supports PDF, image, and URL attachment types.
 */
export function AttachmentPreview({
  attachment,
  onRemove,
}: AttachmentPreviewProps) {
  // Pick the right icon and background color based on type
  const getIconAndColor = () => {
    if (attachment.type === "pdf") {
      return {
        icon: <File className="w-5 h-5 text-red-500" />,
        bgColor: "bg-red-50",
      };
    }
    if (attachment.type === "image") {
      return {
        icon: <ImageIcon className="w-5 h-5 text-green-600" />,
        bgColor: "bg-green-50",
      };
    }
    // URL type
    return {
      icon: <ExternalLink className="w-5 h-5 text-indigo-500" />,
      bgColor: "bg-indigo-50",
    };
  };

  const { icon, bgColor } = getIconAndColor();

  // For image attachments, show a thumbnail preview instead of an icon
  const isImageWithPreview = attachment.type === "image" && attachment.url;

  return (
    <div className="bg-white border border-gray-200 p-2.5 rounded-xl shadow-sm flex items-center gap-3 pr-4 max-w-[280px]">
      {/* Thumbnail or Icon */}
      {isImageWithPreview ? (
        <img
          src={attachment.url}
          alt={attachment.name}
          className="w-10 h-10 rounded-lg object-cover border border-gray-100"
        />
      ) : (
        <div className={`${bgColor} p-2 rounded-lg shrink-0`}>{icon}</div>
      )}

      {/* File Info */}
      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-bold text-gray-900 truncate">
          {attachment.name}
        </p>
        <p className="text-[10px] text-gray-500 mt-0.5">{attachment.size}</p>
      </div>

      {/* Remove Button (only for pending attachments) */}
      {onRemove && (
        <button
          onClick={() => onRemove(attachment.id)}
          className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
          title="Remove attachment"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

interface PendingAttachmentsBarProps {
  attachments: ChatAttachment[];
  onRemove: (id: string) => void;
}

/**
 * Horizontal bar showing all staged attachments above the text input.
 * Visible only when there are pending attachments.
 */
export function PendingAttachmentsBar({
  attachments,
  onRemove,
}: PendingAttachmentsBarProps) {
  if (attachments.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 flex-wrap px-2 pb-2 pt-1 border-b border-gray-100">
      {attachments.map((attachment) => (
        <AttachmentPreview
          key={attachment.id}
          attachment={attachment}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
