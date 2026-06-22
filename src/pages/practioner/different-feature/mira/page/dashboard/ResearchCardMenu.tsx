import { useState, useRef, useEffect } from 'react';
import { MoreVertical, Edit, Trash2, CheckCircle2, XCircle, Archive } from 'lucide-react';

interface ResearchCardMenuProps {
  researchId: string;
  researchTitle: string;
  onUpdate?: () => void;
  onDelete?: () => void;
  onComplete?: () => void;
  onFailure?: () => void;
  onAbandoned?: () => void;
}

export function ResearchCardMenu({
  researchId,
  researchTitle,
  onUpdate,
  onDelete,
  onComplete,
  onFailure,
  onAbandoned,
}: ResearchCardMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState({ top: 0, right: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();
    if (!isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setMenuPosition({
        top: rect.bottom + 4,
        right: window.innerWidth - rect.right,
      });
    }
    setIsOpen(!isOpen);
  }

  function handleAction(action: string) {
    if (action === 'update' && onUpdate) {
      onUpdate();
    } else if (action === 'delete' && onDelete) {
      onDelete();
    } else if (action === 'complete' && onComplete) {
      onComplete();
    } else if (action === 'failure' && onFailure) {
      onFailure();
    } else if (action === 'abandoned' && onAbandoned) {
      onAbandoned();
    } else {
      console.log(`Action: ${action} for research ${researchId} - ${researchTitle}`);
    }
    setIsOpen(false);
  }

  const menuItems = [
    {
      label: 'Update Research',
      icon: Edit,
      action: 'update',
      className: 'text-gray-700 hover:bg-gray-50',
    },
    {
      label: 'Delete Research',
      icon: Trash2,
      action: 'delete',
      className: 'text-red-600 hover:bg-red-50',
    },
    {
      label: 'Mark as Complete',
      icon: CheckCircle2,
      action: 'complete',
      className: 'text-green-600 hover:bg-green-50',
    },
    {
      label: 'Mark as Failure',
      icon: XCircle,
      action: 'failure',
      className: 'text-red-500 hover:bg-red-50',
    },
    {
      label: 'Mark as Abandoned',
      icon: Archive,
      action: 'abandoned',
      className: 'text-gray-500 hover:bg-gray-50',
    },
  ];

  return (
    <div className="relative" onClick={(e) => e.stopPropagation()}>
      <button
        ref={buttonRef}
        onClick={handleToggle}
        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors"
        title="More options"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {isOpen && (
        // Use fixed positioning so the menu escapes parent overflow-hidden clipping
        <div
          ref={menuRef}
          style={{ position: 'fixed', top: menuPosition.top, right: menuPosition.right }}
          className="z-200 w-52.5 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.action}
                onClick={() => handleAction(item.action)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-[0.8125rem] font-medium transition-colors ${item.className}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
