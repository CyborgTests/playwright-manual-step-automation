import React, { useState } from 'react';
import packageJson from '../../../package.json';

interface FeedbackPopupProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function FeedbackPopup({ isOpen, onClose }: FeedbackPopupProps) {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch(
        'https://hook.eu2.make.com/pmdgolq9wroe2oeyjud1ltcjvj3s2zly',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-make-apikey': 'eBZT5P5klgsquwxP8xrp',
          },
          body: JSON.stringify({
            Email: email,
            Message: message,
            'Page name': `Cyborg Test UI v${packageJson.version}`,
            'GA ID': window.ANALYTICS_USER_ID,
          }),
        }
      );

      if (response.ok) {
        setIsSubmitted(true);

        try {
          await (window as any).markFeedbackSent?.();
        } catch (error) {
          console.warn('Failed to mark feedback as sent:', error);
        }

        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        throw new Error('Failed to submit feedback');
      }
    } catch (error) {
      console.error('Error submitting feedback:', error);
      alert('Failed to submit feedback. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMaybeLater = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <dialog
      open
      onClose={onClose}
      className="top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[380px]"
    >
      <div className="rounded-lg border border-gray-200 shadow-xl">
        <div className="p-5 border-b border-gray-200">
          <svg
            width="29"
            height="29"
            viewBox="0 0 29 29"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M14.5 28.5C22.232 28.5 28.5 22.232 28.5 14.5C28.5 6.76801 22.232 0.5 14.5 0.5C6.76801 0.5 0.5 6.76801 0.5 14.5C0.5 22.232 6.76801 28.5 14.5 28.5Z"
              fill="#EFF6FF"
              stroke="#BFDBFE"
            />
            <path
              d="M16.5 10.5H12.5C11.6716 10.5 11 11.1716 11 12V19C11 19.8284 11.6716 20.5 12.5 20.5H16.5C17.3284 20.5 18 19.8284 18 19V12C18 11.1716 17.3284 10.5 16.5 10.5Z"
              fill="#60A5FA"
            />
            <path
              d="M14 14.7C14.6627 14.7 15.2 14.1627 15.2 13.5C15.2 12.8373 14.6627 12.3 14 12.3C13.3373 12.3 12.8 12.8373 12.8 13.5C12.8 14.1627 13.3373 14.7 14 14.7Z"
              fill="white"
            />
            <path
              opacity="0.9"
              d="M15 18C15.5523 18 16 17.5523 16 17C16 16.4477 15.5523 16 15 16C14.4477 16 14 16.4477 14 17C14 17.5523 14.4477 18 15 18Z"
              fill="white"
            />
          </svg>

          <div className="flex-1">
            <h2 className="text-lg font-semibold text-gray-900 italic mt-2">
              Enjoying Cyborg Tests?
            </h2>
            <p className="text-sm text-gray-600 mt-1">
              Share your feedback — it helps us improve.
            </p>
          </div>
          <button
            className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer absolute top-2 right-2"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-5 text-center">
            <p className="text-green-600 font-medium">
              Thank you for your feedback! 🎉
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5">
            <div className="mb-4">
              <label
                htmlFor="email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Email
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="message"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Your feedback
              </label>
              <textarea
                id="message"
                value={message}
                onChange={e => setMessage(e.target.value)}
                placeholder="Your thoughts or suggestions..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
                required
              />
            </div>

            <div className="flex justify-between items-center mb-3">
              <button
                type="button"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors cursor-pointer"
                onClick={handleMaybeLater}
              >
                Maybe later
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Sending...' : 'Send feedback'}
              </button>
            </div>

            <p className="text-xs text-gray-500">
              We may contact you about your feedback. No spam, ever.
            </p>
          </form>
        )}
      </div>
    </dialog>
  );
}
