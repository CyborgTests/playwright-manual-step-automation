import React, { useState, useEffect, useRef } from 'react';
import { Card, Button } from '@heroui/react';
import { InfoModal } from './InfoModal';
import { GeneratedTestModal } from './GeneratedTestModal';
import { finder } from '@medv/finder';
import ContextMenu from './ContextMenu';
import { useEventRecorder } from '../store/EventRecorderStore';

export default function EventRecorderApp() {
  const { state, addElement, setRecording } = useEventRecorder();
  const { recordedElements, isRecording } = state;
  const [showContextMenu, setShowContextMenu] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [targetElement, setTargetElement] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (isEventDisabled(target as HTMLElement)) return;
      
      console.log('[EVENT RECORDER] Click detected');
      
      const link = target.closest('a') || target;
      if (link && link.tagName === 'A' && link.getAttribute('target') === '_blank') {
        e.preventDefault();
        e.stopPropagation();
        
        const href = link.getAttribute('href');
        if (href) {
          window.location.href = href;
        }
      }
      
      const path = e.composedPath();
      const el = path.find(el => el instanceof HTMLElement);
      
      if (el) {
        const selector = getSelector(target as HTMLElement);
        
        const isLink = target.tagName === 'A' || !!target.closest('a');
        const hasHref = target.hasAttribute('href') || !!target.closest('[href]');
        const isButtonWithNavigation = target.tagName === 'BUTTON' && (
          target.getAttribute('type') === 'submit' || 
          !!target.onclick || 
          !!target.closest('form')
        );
        const mightNavigate = isLink || hasHref || isButtonWithNavigation;
        
        const isDirectLinkClick = isLink && hasHref;
        const href = isDirectLinkClick ? (target.tagName === 'A' ? target.getAttribute('href') : target.closest('a')?.getAttribute('href')) : null;
        
        const elementData = {
          selector: selector,
          eventType: 'click' as const,
          data: {
            mightNavigate: mightNavigate,
            isDirectLinkClick: isDirectLinkClick,
            href: href
          }
        };
        
        addElement(elementData);
        console.log('[RECORDER]', elementData);
        
        highlightElement(target);
      }
    };

    const handleKeydown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (isEventDisabled(target as HTMLElement)) return;
      
      const isInputElement = target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT';
      if (!isInputElement) return;
      
      console.log('[EVENT RECORDER] Input/Select keyboard interaction detected');
      
      const selector = getSelector(target);
      const elementData = {
        selector: selector,
        eventType: 'keydown' as const,
        data: {
          text: (target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value || undefined
        }
      };
      
      addElement(elementData);
      console.log('[RECORDER] Input/Select element:', elementData);
      
      highlightElement(target);
    };

    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement;
      if (isEventDisabled(target as HTMLElement)) return;

      const isInputElement = target.tagName === 'INPUT' || 
        target.tagName === 'TEXTAREA' || 
        target.tagName === 'SELECT';

      if (!isInputElement) return;
      
      const currentValue = (target as HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement).value;
      const recordedValue = target.getAttribute('data-recorded-value');
      
      if (currentValue !== recordedValue) {
        const selector = getSelector(target);

        addElement({
          selector,
          eventType: 'keydown' as const,
          data: { text: currentValue }
        });

        target.setAttribute('data-recorded-value', currentValue);
        console.log('[RECORDER] Updated input value:', currentValue);
      }
    };

    const handleContextMenu = (e: MouseEvent) => {
      if (isEventDisabled(e.target as HTMLElement)) return;
      
      console.log('[EVENT RECORDER] Right-click detected');
      e.preventDefault();
      
      const path = e.composedPath();
      const el = path.find(el => el instanceof HTMLElement);
      
      if (el) {
        setTargetElement(el as HTMLElement);
        setContextMenuPosition({ x: e.clientX, y: e.clientY });
        setShowContextMenu(true);
      }
    };

    document.addEventListener('click', handleClick);
    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('input', handleInput);
    document.addEventListener('contextmenu', handleContextMenu);

    return () => {
      document.removeEventListener('click', handleClick);
      document.removeEventListener('keydown', handleKeydown);
      document.removeEventListener('input', handleInput);
      document.removeEventListener('contextmenu', handleContextMenu);
    };
  }, [isRecording]);

  const getSelector = (el: HTMLElement): string => {
    return finder(el);
  };

  const isEventDisabled = (el: HTMLElement): boolean => {
    if (!isRecording) {
      return true;
    }

    if (el.closest('#cyborg-app')) {
      return true;
    }
    
    if (el.closest('.cyborg-modal')) {
      return true;
    }

    return false;
  };

  const handleContextMenuAction = (action: string, element: HTMLElement) => {
    const selector = getSelector(element);
    
    let mightNavigate = false;
    if (action === 'click') {
      const isLink = element.tagName === 'A' || !!element.closest('a');
      const hasHref = element.hasAttribute('href') || !!element.closest('[href]');
      const isButtonWithNavigation = element.tagName === 'BUTTON' && (
        element.getAttribute('type') === 'submit' || 
        !!element.onclick || 
        !!element.closest('form')
      );
      mightNavigate = isLink || hasHref || isButtonWithNavigation;
    }
    
    const elementData = {
      selector: selector,
      eventType: action as 'click' | 'should-exists' | 'should-not-exist' | 'focus',
      data: action === 'click' ? { mightNavigate } : undefined
    };
    
    addElement(elementData);
    console.log('[RECORDER] Context menu action:', elementData);
    highlightElement(element);
  };

  const highlightElement = (element: HTMLElement) => {
    const originalBackground = element.style.backgroundColor;
    element.style.backgroundColor = '#28a745';
    element.style.transition = 'background-color 0.3s, border 0.3s';
    
    setTimeout(() => {
      element.style.backgroundColor = originalBackground;
    }, 500);
  };

  return (
    <Card className="mx-auto p-3 inline-flex flex-row items-center absolute top-2 left-2 z-1000">
      <Button
        color="danger"
        variant="solid"
        onPress={() => setRecording(!isRecording)}
        className={`w-7 h-7 min-w-0 p-0 bg-[#DD0606] ${isRecording ? 'rounded-none' : 'rounded-full'}`}
      />
      <GeneratedTestModal
        recordedElements={recordedElements}
      />
      <div className="w-px h-6 bg-gray-300 mx-2"></div>
      <InfoModal />
      <ContextMenu
        isVisible={showContextMenu}
        position={contextMenuPosition}
        onAction={handleContextMenuAction}
        onClose={() => setShowContextMenu(false)}
        targetElement={targetElement}
      />
    </Card>
  );
}; 