import { getJiraConfig, createAuthHeader } from './config';

interface TicketInfo {
  summary: string;
  description: string;
  issueType: string;
  projectKey: string;
  testInfo?: {
    attachments?: any[];
    outputDir?: string;
    [key: string]: any;
  };
  [key: string]: any;
}

interface CreateTicketResult {
  success: boolean;
  issueKey?: string;
  issueId?: string;
  error?: string;
}

function convertToADF(description: string) {
  return {
    type: 'doc',
    version: 1,
    content: description.split('\n').map((line: string) => ({
      type: 'paragraph',
      content: line.trim()
        ? [
            {
              type: 'text',
              text: line,
            },
          ]
        : [],
    })),
  };
}

export async function createJiraTicket(
  ticketInfo: TicketInfo
): Promise<CreateTicketResult> {
  const config = getJiraConfig();

  if (!config) {
    return { success: false, error: 'Jira not configured' };
  }

  try {
    const auth = createAuthHeader(config.email, config.apiToken);

    // Convert plain text description to Atlassian Document Format (ADF)
    const descriptionADF = convertToADF(ticketInfo.description);

    const issueData = {
      fields: {
        project: {
          key: ticketInfo.projectKey,
        },
        summary: ticketInfo.summary,
        description: descriptionADF,
        issuetype: {
          name: ticketInfo.issueType,
        },
      },
    };

    const response = await fetch(`${config.baseUrl}/rest/api/3/issue`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${auth}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(issueData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Jira API error:', errorData);
      return {
        success: false,
        error:
          errorData.errorMessages?.join(', ') || errorData.errors
            ? JSON.stringify(errorData.errors)
            : `HTTP error! status: ${response.status}`,
      };
    }

    const result = await response.json();

    return { success: true, issueKey: result.key, issueId: result.id };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
