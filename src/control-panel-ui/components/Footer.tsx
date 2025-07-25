import React from 'react';
import { Button } from '@heroui/react';
import { trackEvent } from '../../utils/analytics';

export default function Footer() {
  const trackButtonClick = (buttonName: string) => {
    trackEvent(`app_${buttonName}_click`);
  };

  const handleButtonClick = (url: string, buttonName: string) => {
    trackButtonClick(buttonName);
    if ((window as any).openInMainBrowser) {
      (window as any).openInMainBrowser(url);
    } else {
      // Fallback to window.open if openInMainBrowser is not available
      window.open(url, '_blank');
    }
  };

  return (
    <footer className="w-full flex items-center justify-center py-2 bg-[#F9FAFB] dark:bg-background border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-1 text-current">
        <Button
          className="text-primary"
          variant="light"
          size="sm"
          title="Source code link"
          onPress={() => handleButtonClick('https://github.com/CyborgTests/cyborg-test', 'github')}
        >
          Github
        </Button>
        <Button
          className="text-primary"
          variant="light"
          size="sm"
          title="Discord community"
          onPress={() => handleButtonClick('https://discord.com/invite/rNZCd3MHDx', 'discord')}
        >
          Discord
        </Button>
      </div>
    </footer>
  );
} 