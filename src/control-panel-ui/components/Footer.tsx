import React from 'react';
import { trackEvent } from '../../utils/analytics';

export default function Footer() {
  const trackButtonClick = (buttonName: string) => {
    trackEvent(`app_${buttonName}_click`);
  };

  return (
    <footer className="footer">
      <button
        className="footer-link"
        onClick={() => {
          trackButtonClick('github');
          (window as any).openInMainBrowser('https://github.com/CyborgTests/cyborg-test');
        }}
      >
        Github
      </button>
      <button
        className="footer-link"
        onClick={() => {
          trackButtonClick('discord');
          (window as any).openInMainBrowser('https://discord.com/invite/rNZCd3MHDx');
        }}
      >
        Discord
      </button>
    </footer>
  );
} 