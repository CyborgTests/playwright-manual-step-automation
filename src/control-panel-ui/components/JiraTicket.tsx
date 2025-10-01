import React, { useState, useEffect } from 'react';
import { Button, Input, Textarea, Select, SelectItem } from '@heroui/react';
import { useTestStore } from '../store/TestStore';
import { trackEvent } from '../../utils/analytics';
import toast from 'react-hot-toast';

interface JiraTicketData {
  summary: string;
  description: string;
  issueType: string;
  projectKey: string;
}

interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
}

export default function JiraTicket() {
  const { state, dispatch } = useTestStore();
  const [ticketData, setTicketData] = useState<JiraTicketData>({
    summary: '',
    description: '',
    issueType: '',
    projectKey: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jiraConfigured, setJiraConfigured] = useState(false);
  const [issueTypes, setIssueTypes] = useState<JiraIssueType[]>([]);

  useEffect(() => {
    const checkJiraConfig = async () => {
      try {
        const configured = await (window as any).checkJiraConfig?.();
        setJiraConfigured(configured);
        
        if (configured) {
          const projectKey = await (window as any).getJiraProjectKey?.();
          if (projectKey) {
            setTicketData(prev => ({ ...prev, projectKey }));
          }
        }
      } catch (error) {
        console.error('Failed to check Jira config:', error);
        setJiraConfigured(false);
      }
    };

    checkJiraConfig();
  }, []);

  useEffect(() => {
    const fetchIssueTypes = async () => {
      if (!ticketData.projectKey) {
        setIssueTypes([]);
        return;
      }

      try {
        const types = await (window as any).getJiraIssueTypes?.(ticketData.projectKey);
        if (types && types.length > 0) {
          setIssueTypes(types);
          const defaultType = types.find((t: JiraIssueType) => t.name === 'Bug') || types[0];
          if (defaultType && !ticketData.issueType) {
            setTicketData(prev => ({ ...prev, issueType: defaultType.name }));
          }
        }
      } catch (error) {
        console.error('Failed to fetch Jira issue types:', error);
        setIssueTypes([]);
      }
    };

    fetchIssueTypes();
  }, [ticketData.projectKey]);

  useEffect(() => {
    if (state.testInfo && !ticketData.summary) {
      const failedSteps = state.steps.filter(step => step.status === 'fail' || step.status === 'warning');
      const lastFailedStep = failedSteps[failedSteps.length - 1];
      
      const summary = `Test Failed: ${state.testInfo.title}`;
      
      let description = `Test Failure Details\n`;
      description += `Test: ${state.testInfo.title}\n`;
      description += `File: ${state.testInfo.file}\n`;
      description += `Test ID: ${state.testInfo.testId}\n\n`;
      
      if (failedSteps.length > 0) {
        description += `Failed Steps:\n`;
        failedSteps.forEach((step, idx) => {
          description += `${idx + 1}. ${step.text}`;
          if (step.reason) {
            description += ` - ${step.reason}`;
          }
          description += '\n';
        });
        description += '\n';
      }
      
      description += `Steps to Reproduce:\n`;
      state.steps.forEach((step, idx) => {
        description += `${idx + 1}. ${step.text}\n`;
      });
      
      description += `\nExpected Behavior:\n`;
      description += `All test steps should pass\n`;
      
      description += `\nActual Behavior:\n`;
      if (lastFailedStep) {
        description += `Step "${lastFailedStep.text}" failed`;
        if (lastFailedStep.reason) {
          description += `: ${lastFailedStep.reason}`;
        }
      }
      
      setTicketData(prev => ({
        ...prev,
        summary,
        description,
      }));
    }
  }, [state.testInfo, state.steps]);

  const handleSubmit = async () => {
    if (!ticketData.summary || !ticketData.projectKey || !ticketData.issueType) {
      return;
    }

    setIsSubmitting(true);
    trackEvent('app_create_jira_ticket_click');

    let loadingToastId: string | undefined;
    try {
      const failedSteps = state.steps.filter(step => step.status === 'fail' || step.status === 'warning');
      
      const ticketInfo = {
        ...ticketData,
        testInfo: state.testInfo,
        steps: state.steps,
        failedSteps: failedSteps,
      };

      loadingToastId = toast.loading('Creating Jira ticket...');
      
      const result = await (window as any).createJiraTicket?.(ticketInfo);
      console.log('Jira API result:', result);
      
      toast.dismiss(loadingToastId);
      loadingToastId = undefined;
      
      if (result?.success) {
        toast.success(`Jira ticket created: ${result.issueKey}`, {
          duration: 4000,
        });
        handleCancel();
      } else {
        const errorMessage = result?.error || 'Failed to create Jira ticket';
        toast.error(`Failed to create Jira ticket: ${errorMessage}`, {
          duration: 6000,
        });
      }
    } catch (error) {
      if (loadingToastId) {
        toast.dismiss(loadingToastId);
      }
      toast.error(`Failed to create Jira ticket: ${error instanceof Error ? error.message : 'Unknown error'}`, {
        duration: 6000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    dispatch({ type: 'TOGGLE_JIRA_TICKET' });
    const defaultType = issueTypes.find((t) => t.name === 'Bug') || issueTypes[0];
    setTicketData({
      summary: '',
      description: '',
      issueType: defaultType?.name || '',
      projectKey: ticketData.projectKey,
    });
  };

  if (!jiraConfigured) {
    return (
      <div className="p-6 max-w-2xl mx-auto">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold mb-2">Jira Not Configured</h3>
            <p className="text-sm text-gray-600 mb-4">
              Jira integration is not properly configured.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg text-left">
              <p className="text-sm font-medium mb-2">Required Environment Variables:</p>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• JIRA_BASE_URL</li>
                <li>• JIRA_EMAIL</li>
                <li>• JIRA_API_TOKEN</li>
                <li>• JIRA_PROJECT_KEY (optional)</li>
              </ul>
            </div>
            <div className="mt-4">
              <Button color="default" variant="bordered" onPress={handleCancel}>
                Go Back
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 w-full max-w-3xl mx-auto">
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-6">Create Jira Ticket</h2>
        
        <div className="space-y-5">
          <div className="w-full">
            <Input
              isRequired
              label="Summary"
              placeholder="Brief description of the issue"
              value={ticketData.summary}
              onValueChange={(value) => setTicketData((prev) => ({ ...prev, summary: value }))}
              classNames={{
                input: "text-sm",
                inputWrapper: "w-full"
              }}
            />
          </div>
          
          <div className="w-full">
            <Textarea
              label="Description"
              placeholder="Detailed description of the issue"
              value={ticketData.description}
              onValueChange={(value) => setTicketData((prev) => ({ ...prev, description: value }))}
              className="h-32"
              classNames={{
                input: "text-sm leading-relaxed",
                inputWrapper: "w-full"
              }}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <Select
                isRequired
                label="Issue Type"
                placeholder={issueTypes.length === 0 ? "Loading..." : "Select issue type"}
                selectedKeys={ticketData.issueType ? [ticketData.issueType] : []}
                onSelectionChange={(keys) => {
                  const issueType = Array.from(keys)[0] as string;
                  setTicketData((prev) => ({ ...prev, issueType }));
                }}
                classNames={{
                  trigger: "w-full"
                }}
                isDisabled={issueTypes.length === 0}
              >
                {issueTypes.map((type) => (
                  <SelectItem key={type.name}>
                    {type.name}
                  </SelectItem>
                ))}
              </Select>
            </div>
            
            <div className="w-full">
              <Input
                isRequired
                label="Project Key"
                placeholder="e.g., PROJ"
                value={ticketData.projectKey}
                onValueChange={(value) => setTicketData((prev) => ({ ...prev, projectKey: value }))}
                classNames={{
                  input: "text-sm uppercase",
                  inputWrapper: "w-full"
                }}
              />
            </div>
          </div>
          
          {state.steps.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 w-full">
              <p className="text-sm font-medium text-blue-800 mb-2">
                Test Steps ({state.steps.length})
              </p>
              <div className="text-sm text-blue-600 space-y-1 max-h-48 overflow-y-auto">
                {state.steps.map((step, idx) => (
                  <div 
                    key={idx} 
                    className={`break-words ${step.status === 'fail' ? 'text-red-600 font-medium' : ''}`}
                  >
                    {idx + 1}. {step.text} {step.status === 'fail' ? '❌' : step.status === 'pass' ? '✓' : ''}
                  </div>
                ))}
              </div>
            </div>
          )}
          
        </div>
        
        <div className="flex gap-3 mt-6">
          <Button color="default" variant="bordered" onPress={handleCancel} className="flex-1">
            Cancel
          </Button>
          <Button
            color="primary"
            isDisabled={!ticketData.summary || !ticketData.projectKey || !ticketData.issueType}
            isLoading={isSubmitting}
            onPress={handleSubmit}
            className="flex-1"
          >
            Create Ticket
          </Button>
        </div>
      </div>
    </div>
  );
}

