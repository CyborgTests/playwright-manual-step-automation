import React, { useState } from 'react';
import { Button, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from '@heroui/react';
import { generatePlaywrightTest } from '../../utils/generatePlaywrightTest';
import { useEventRecorder } from '../store/EventRecorderStore';

interface GeneratedTestModalProps {
  recordedElements: any[];
}

export const GeneratedTestModal: React.FC<GeneratedTestModalProps> = ({
  recordedElements
}) => {
  const [generatedTest, setGeneratedTest] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const { setRecording } = useEventRecorder();
  if (recordedElements.length === 0) {
    return null;
  }

  const handleGenerateTest = async () => {
    try {
      const testCode = generatePlaywrightTest(recordedElements);
      setGeneratedTest(testCode);
      return testCode;
    } catch (error) {
      setGeneratedTest('');
      console.error('Error generating test:', error);
      return '';
    }
  };

  const handleGenerateAndOpen = async () => {
    await handleGenerateTest();
    onOpen();
  };

  const handleCopyCode = (testCode: string) => {
    navigator.clipboard.writeText(testCode);
  };

  const handleGenerateAndCopyCode = async () => {
    const testCode = await handleGenerateTest();
    if (testCode) {
      handleCopyCode(testCode);
    }
  };

  return (
    <>
      <Button
        color="primary"
        variant="light"
        onPress={handleGenerateAndOpen}
        className="underline ml-3"
        size="sm"
      >
        {recordedElements.length} elements recorded
      </Button>
      <Button color="primary" onPress={handleGenerateAndCopyCode} size="sm" variant="light" className="min-w-0 p-1 ml-1">
        <svg width="14" viewBox="0 0 17 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 16C5.45 16 4.97917 15.8042 4.5875 15.4125C4.19583 15.0208 4 14.55 4 14V2C4 1.45 4.19583 0.979167 4.5875 0.5875C4.97917 0.195833 5.45 0 6 0H15C15.55 0 16.0208 0.195833 16.4125 0.5875C16.8042 0.979167 17 1.45 17 2V14C17 14.55 16.8042 15.0208 16.4125 15.4125C16.0208 15.8042 15.55 16 15 16H6ZM6 14H15V2H6V14ZM2 20C1.45 20 0.979167 19.8042 0.5875 19.4125C0.195833 19.0208 0 18.55 0 18V4H2V18H13V20H2Z" fill="#1C1B1F"/>
        </svg>
      </Button>

      <Modal
        isOpen={isOpen}
        onClose={() => {
          onClose();
          setGeneratedTest('');
          setRecording(false);
        }}
        size="4xl"
        className="cyborg-modal"
        classNames={{
          closeButton: "bg-transparent"
        }}
        portalContainer={document.getElementById('cyborg-app') as HTMLElement}
      >
        <ModalContent>
          <ModalHeader>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white m-0">
              Generated Playwright Test
            </h3>
          </ModalHeader>
          <ModalBody>
            <div className="bg-slate-900 rounded-lg p-4 overflow-auto max-h-96">
              <pre className="text-sm text-slate-100 font-mono leading-relaxed bg-transparent">
                <code className="bg-transparent text-[#fff]">{generatedTest}</code>
              </pre>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={() => handleCopyCode(generatedTest)}>
              Copy Code
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
}; 