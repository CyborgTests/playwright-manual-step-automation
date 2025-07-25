import React, { Fragment } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';

export const InfoModal: React.FC = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Fragment>
      <Button
        color="default"
        variant="light"
        onPress={onOpen}
        className="w-7 h-7 min-w-0 p-0"
        startContent={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        }
      />

      <Modal
        isOpen={isOpen}
        onClose={onClose}
        size="2xl"
        className="cyborg-modal"
        classNames={{
          closeButton: "bg-transparent"
        }}
        portalContainer={document.getElementById('cyborg-app') as HTMLElement}
      >
        <ModalContent className="p-4">
          <ModalHeader className="p-3">
            <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
              How the Cyborg Test Snippet Works
            </h3>
          </ModalHeader>
          <ModalBody className="p-3">
            <div className="space-y-6">
              <p className="text-slate-600 dark:text-slate-400 leading-relaxed m-0 mb-6">
                The Cyborg snippet lets manual testers record their actions directly on the website and convert them into automation code.
              </p>

              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Start Recording</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm m-0">
                      Click the Record button. The snippet will begin tracking your actions in real time.
                    </p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Perform Actions</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm m-0 mb-2">
                      Navigate through the website just like a user. All actions will be logged and displayed in the snippet as ready-to-copy code.
                    </p>
                    <p className="text-slate-600 dark:text-slate-400 text-sm m-0">
                      You can also right-click any element to tag it as:
                    </p>
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Exists</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Does Not Exist</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Click</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                        <span className="text-sm text-slate-600 dark:text-slate-400">Focus, and more.</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-slate-900 dark:text-white mb-2">Copy and Reuse</h4>
                    <p className="text-slate-600 dark:text-slate-400 text-sm m-0">
                      Easily copy the generated code and paste it into your automation scripts for reuse.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Fragment>
  );
}; 