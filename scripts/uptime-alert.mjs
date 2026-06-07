const baseUrl = (process.env.SMOKE_BASE_URL || process.env.UPTIME_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '');
const webhookUrl = process.env.UPTIME_WEBHOOK_URL || '';

async function notify(message) {
  if (!webhookUrl) return;
  await fetch(webhookUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ text: message }),
  }).catch((error) => {
    console.error(`Failed to send uptime webhook: ${error.message}`);
  });
}

try {
  const response = await fetch(`${baseUrl}/api/health`, { signal: AbortSignal.timeout(8000) });
  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.ok !== true) {
    throw new Error(`Healthcheck failed: ${response.status} ${response.statusText}`);
  }

  console.log(`ok uptime ${baseUrl}/api/health`);
} catch (error) {
  const message = `TOGOSHOL uptime alert: ${baseUrl} is unavailable. ${error instanceof Error ? error.message : String(error)}`;
  console.error(message);
  await notify(message);
  process.exit(1);
}
