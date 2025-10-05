import { createAuthHeader } from './config';

export async function uploadAttachment(
  jiraBaseUrl: string,
  jiraEmail: string,
  jiraApiToken: string,
  issueKey: string,
  attachment: any,
  outputDir: string
): Promise<boolean> {
  try {
    const fs = await import('fs/promises');
    const path = await import('path');

    let fullPath = attachment.path;
    if (!path.isAbsolute(attachment.path) && outputDir) {
      fullPath = path.join(outputDir, attachment.path);
    }

    console.log(`Attempting to read: ${fullPath}`);

    const fileExists = await fs.access(fullPath).then(() => true).catch(() => false);
    if (!fileExists) {
      console.error(`File not found: ${fullPath}`);
      return false;
    }

    const fileBuffer = await fs.readFile(fullPath);
    const fileName = path.basename(fullPath);

    console.log(`Read file ${fileName}, size: ${fileBuffer.length} bytes`);

    const boundary = `----WebKitFormBoundary${Math.random().toString(36).substring(2)}`;
    const formData = Buffer.concat([
      Buffer.from(`--${boundary}\r\n`),
      Buffer.from(`Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`),
      Buffer.from(`Content-Type: ${attachment.contentType}\r\n\r\n`),
      fileBuffer,
      Buffer.from(`\r\n--${boundary}--\r\n`),
    ]);

    const auth = createAuthHeader(jiraEmail, jiraApiToken);
    const attachmentResponse = await fetch(`${jiraBaseUrl}/rest/api/3/issue/${issueKey}/attachments`, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'X-Atlassian-Token': 'no-check',
        'Content-Type': `multipart/form-data; boundary=${boundary}`,
      },
      body: formData,
    });

    if (attachmentResponse.ok) {
      console.log(`✅ Successfully uploaded ${fileName}`);
      return true;
    } else {
      const errorText = await attachmentResponse.text();
      console.error(`❌ Failed to upload ${fileName}: ${attachmentResponse.status} - ${errorText}`);
      return false;
    }
  } catch (attachError) {
    console.error(`Error uploading attachment:`, attachError);
    return false;
  }
}

export async function uploadAttachments(
  jiraBaseUrl: string,
  jiraEmail: string,
  jiraApiToken: string,
  issueKey: string,
  attachments: any[],
  outputDir: string
): Promise<void> {
  if (!attachments || attachments.length === 0) {
    return;
  }

  console.log(`Uploading ${attachments.length} attachments to ${issueKey}`);
  console.log('Output dir:', outputDir);

  for (const attachment of attachments) {
    await uploadAttachment(jiraBaseUrl, jiraEmail, jiraApiToken, issueKey, attachment, outputDir);
  }
}

export async function getLatestAttachments(testInfo: any): Promise<{ attachments: any[]; outputDir: string }> {
  console.log('Getting latest attachments from testInfo');
  console.log('Current attachments:', JSON.stringify(testInfo.attachments, null, 2));
  console.log('Output dir:', testInfo.outputDir);

  try {
    const fs = await import('fs/promises');
    
    const outputDir = testInfo.outputDir;
    const files = await fs.readdir(outputDir);
    console.log('Files in output directory:', files);

    // Look for video files
    const videoFile = files.find((f: string) => f.endsWith('.webm'));
    if (videoFile) {
      console.log(`Found video file: ${videoFile}`);
    }
  } catch (error) {
    console.error('Error reading output directory:', error);
  }

  return {
    attachments: testInfo.attachments,
    outputDir: testInfo.outputDir,
  };
}

