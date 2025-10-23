export interface JiraConfig {
  baseUrl: string;
  email: string;
  apiToken: string;
  projectKey?: string;
}

export function getJiraConfig(): JiraConfig | null {
  const baseUrl = process.env.JIRA_BASE_URL;
  const email = process.env.JIRA_EMAIL;
  const apiToken = process.env.JIRA_API_TOKEN;
  const projectKey = process.env.JIRA_PROJECT_KEY;

  if (!baseUrl || !email || !apiToken) {
    return null;
  }

  return {
    baseUrl,
    email,
    apiToken,
    projectKey,
  };
}

export function checkJiraConfig(): boolean {
  const config = getJiraConfig();
  return config !== null;
}

export function getJiraProjectKey(): string {
  return process.env.JIRA_PROJECT_KEY || '';
}

export function createAuthHeader(email: string, apiToken: string): string {
  return Buffer.from(`${email}:${apiToken}`).toString('base64');
}
