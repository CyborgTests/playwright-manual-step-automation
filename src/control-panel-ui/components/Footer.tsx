import React from 'react';
import { Link } from '@heroui/react';
import { trackEvent } from '../../utils/analytics';

export default function Footer() {
  const trackButtonClick = (buttonName: string) => {
    trackEvent(`app_${buttonName}_click`);
  };

  return (
    <footer className="w-full flex items-center justify-center py-4 bg-[#F9FAFB] dark:bg-background border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-1 text-current">
        <Link
          className="text-primary mr-4"
          href="https://github.com/CyborgTests/cyborg-test"
          target="_blank"
          title="Source code link"
          onClick={() => trackButtonClick('github')}
        >
          Github
        </Link>
        <Link
          className="text-primary"
          href="https://discord.com/invite/rNZCd3MHDx"
          target="_blank"
          title="Discord community"
          onClick={() => trackButtonClick('discord')}
        >
          Discord
        </Link>
      </div>
    </footer>
  );
} 