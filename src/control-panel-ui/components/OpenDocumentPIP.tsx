import React from 'react';
import ReactDOM from "react-dom/client";
import TestControlPanel from './TestControlPanel';
import pipIcon from '../icons/pip.svg';
import { TestStoreProvider } from '../store/TestStore';
import styles from '../styles/TestControlPanel.css?raw';

export default function OpenDocumentPIP() {
  const openWindow = async () => {
    try {
      const dpip = await window.documentPictureInPicture.requestWindow({
        width: "320",
        height: "400",
      });
      
      // Add styles
      const style = dpip.document.createElement('style');
      style.textContent = styles;
      dpip.document.head.appendChild(style);

      const pipDiv = dpip.document.createElement("div");
      pipDiv.setAttribute("id", "pip-root");
      dpip.document.body.append(pipDiv);
      const pipRootElement = dpip.document.getElementById("pip-root");
      if (!pipRootElement) {
        throw new Error("Failed to create PiP root element");
      }
      const pipRoot = ReactDOM.createRoot(pipRootElement);
      pipRoot.render(
        <TestStoreProvider>
          <TestControlPanel />
        </TestStoreProvider>
      );
    } catch (error) {
      if (error) {
        console.log(error);
      }
    }
  };

  return (
    <button
      className="openDocumentPIP"
      onClick={openWindow}
      title="Open Document PiP"
    >
      <img src={pipIcon} alt="Document PiP" />
    </button>
  );
}