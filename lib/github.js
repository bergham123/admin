import fetch from 'node-fetch';

const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const OWNER = process.env.REPO_OWNER;

// تحديث ملف (أو إنشاؤه)
export async function updateFile(repo, path, content, message = `Update ${path}`) {
  const url = `https://api.github.com/repos/${OWNER}/${repo}/contents/${path}`;
  // جلب sha الحالي إن وجد
  let sha = null;
  try {
    const res = await fetch(url, { headers: { Authorization: `token ${GITHUB_TOKEN}` } });
    if (res.ok) {
      const data = await res.json();
      sha = data.sha;
    }
  } catch {}

  const body = {
    message,
    content: Buffer.from(content).toString('base64'),
    sha: sha || undefined,
  };
  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Failed to update ${path} in ${repo}: ${res.status}`);
  return await res.json();
}

// تشغيل Workflow
export async function triggerWorkflow(repo, workflowFile = '.github/workflows/whatsapp.yml') {
  const url = `https://api.github.com/repos/${OWNER}/${repo}/actions/workflows/${workflowFile}/dispatches`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ ref: 'main' }),
  });
  if (!res.ok) throw new Error(`Failed to trigger workflow in ${repo}: ${res.status}`);
}
