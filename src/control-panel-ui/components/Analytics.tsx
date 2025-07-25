import { useEffect } from 'react';
import { config } from '../../config';

const NODE_ENV = process.env.NODE_ENV;

declare global {
  interface Window {
    dataLayer: any[];
    gtag: (command: string, ...args: any[]) => void;
    ANALYTICS_USER_ID?: string;
    ENABLE_ANALYTICS?: boolean;
  }
}

export const Analytics = () => {
  useEffect(() => {
    if (window.ENABLE_ANALYTICS && NODE_ENV !== 'development') {
      // Load Google Analytics script
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=G-GFX4NHN65L`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      function gtag(command: string, ...args: any[]) {
        window.dataLayer.push(arguments);
      }
      window.gtag = gtag;
      gtag('js', new Date());

      gtag('config', 'G-GFX4NHN65L', {
        user_id: window.ANALYTICS_USER_ID
      });

      gtag('event', 'app_start');
    }
  }, []);

  return null;
}; 