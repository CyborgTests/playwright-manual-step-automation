import { getJiraConfig, createAuthHeader } from './config';

export interface JiraIssueType {
  id: string;
  name: string;
  description?: string;
}

export async function getJiraIssueTypes(projectKey: string): Promise<JiraIssueType[]> {
  const config = getJiraConfig();

  if (!config || !projectKey) {
    return [];
  }

  try {
    const auth = createAuthHeader(config.email, config.apiToken);
    const response = await fetch(
      `${config.baseUrl}/rest/api/3/issue/createmeta?projectKeys=${projectKey}&expand=projects.issuetypes`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      console.error('Failed to fetch Jira issue types:', response.status);
      return [];
    }

    const data = await response.json();
    const project = data.projects?.[0];
    if (!project) return [];

    return project.issuetypes.map((type: any) => ({
      id: type.id,
      name: type.name,
      description: type.description,
    }));
  } catch (error) {
    console.error('Error fetching Jira issue types:', error);
    return [];
  }
}

