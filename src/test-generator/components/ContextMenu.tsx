import React, { useEffect, useRef } from 'react';
import { Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';

interface ContextMenuProps {
  isVisible: boolean;
  position: { x: number; y: number };
  onAction: (action: string, element: HTMLElement) => void;
  onClose: () => void;
  targetElement: HTMLElement | null;
}

interface MenuItem {
  text: string;
  action: string;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  isVisible,
  position,
  onAction,
  onClose,
  targetElement
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    if (isVisible) {
      document.addEventListener('click', handleClickOutside);
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          onClose();
        }
      });
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isVisible, onClose]);

  const menuItems: MenuItem[] = [
    { text: 'Should Exist', action: 'should-exists' },
    { text: 'Should Not Exist', action: 'should-not-exist' },
    { text: 'Focus', action: 'focus' },
    { text: 'Click', action: 'click' }
  ];

  const handleAction = (action: string) => {
    if (targetElement) {
      onAction(action, targetElement);
    }
    onClose();
  };

  if (!isVisible || !targetElement) return null;

  return (
    <div
      ref={menuRef}
      className="fixed z-[10001]"
      style={{
        left: position.x,
        top: position.y
      }}
    >
      <Dropdown isOpen={isVisible} onOpenChange={(open) => !open && onClose()} portalContainer={document.getElementById('cyborg-app') as HTMLElement}>
        <DropdownTrigger>
          <div className="w-0 h-0" />
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Context menu"
          onAction={(key) => handleAction(key as string)}
          classNames={{
            list: "m-0"
          }}
        >
          {menuItems.map((item) => (
            <DropdownItem
              key={item.action}
            >
              {item.text}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
};

export default ContextMenu; 