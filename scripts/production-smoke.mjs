const baseUrl = (process.env.SMOKE_BASE_URL || 'http://127.0.0.1:8787').replace(/\/+$/, '');

const checks = [
  { name: 'health', path: '/api/health', expect: /"ok"\s*:\s*true/ },
  { name: 'home', path: '/', expect: /TOGOSHOL/i },
  { name: 'robots', path: '/robots.txt', expect: /Sitemap:/i },
  { name: 'sitemap', path: '/sitemap.xml', expect: /<urlset/i },
];

for (const check of checks) {
  const url = `${baseUrl}${check.path}`;
  const response = await fetch(url);
  const body = await response.text();

  if (!response.ok) {
    throw new Error(`${check.name} failed: ${response.status} ${response.statusText} at ${url}`);
  }

  if (!check.expect.test(body)) {
    throw new Error(`${check.name} failed: unexpected response body at ${url}`);
  }

  console.log(`ok ${check.name} ${url}`);
}
