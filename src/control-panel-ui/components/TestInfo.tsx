import React, { useState } from 'react';
import { useTestStore } from '../store/TestStore';
import logoSvg from '../../../public/logo.svg';

export default function TestInfo() {
  const { state } = useTestStore();
  const testInfo = state.testInfo;
  const [showAnnotations, setShowAnnotations] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <img src={logoSvg} alt="Cyborg Tests Logo" className="h-8 w-auto" />
      </div>

      <div>
        <h3 id="testName" className="text-black font-bold text-lg">
          <span className="text-gray-400 mr-2">Test:</span>
          {state.testName}
        </h3>
      </div>

      {testInfo?.file && (
        <p className="text-gray-400 text-sm font-sans">{testInfo.file}</p>
      )}

      {testInfo?.tags && testInfo.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {testInfo.tags.map((tag, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm font-sans border bg-green-100 text-green-700 border border-green-200`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      {testInfo?.annotations && testInfo.annotations.length > 0 && (
        <div>
          <button
            onClick={() => setShowAnnotations(!showAnnotations)}
            className="text-blue-600 text-sm font-medium hover:text-blue-800 transition-colors"
          >
            {showAnnotations ? 'Hide annotations' : 'Show annotations'}
          </button>

          {showAnnotations && (
            <div className="mt-2 p-3 bg-gray-50 rounded-lg">
              <div className="space-y-2">
                {testInfo.annotations.map((annotation, index) => (
                  <div key={index} className="text-xs">
                    <span className="text-gray-600">{annotation.type}:</span>
                    <span className="ml-1">{annotation.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
