import { readData, triggerWorkflow } from '../lib/github.js';

export default async function (req, res) {
  // هذا الـ endpoint يُستدعى كل دقيقة عبر cron-job.org أو Vercel Cron
  const data = await readData();
  const now = new Date();
  const timeStr = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  for (const [email, user] of Object.entries(data.users)) {
    if (user.schedule === timeStr && user.reserved_bot) {
      try {
        await triggerWorkflow(user.reserved_bot);
        console.log(`Triggered workflow for ${email} at ${timeStr}`);
      } catch (err) {
        console.error(`Failed to trigger for ${email}:`, err);
      }
    }
  }

  res.status(200).end();
}
