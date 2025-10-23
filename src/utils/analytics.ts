const NODE_ENV = process.env.NODE_ENV;

declare global {
  interface Window {
    gtag: (command: string, ...args: any[]) => void;
    ENABLE_ANALYTICS?: boolean;
  }
}

const isAnalyticsEnabled = () => {
  return typeof window !== 'undefined' && window.ENABLE_ANALYTICS !== false;
};

export const trackEvent = (
  eventName: string,
  eventParams?: Record<string, any>
) => {
  if (NODE_ENV === 'development') return;
  if (isAnalyticsEnabled() && window.gtag) {
    window.gtag('event', eventName, eventParams);
  }
};
