const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const root = __dirname;
const port = Number(process.env.PORT || 3000);

function loadEnv() {
  try {
    for (const line of fs.readFileSync(path.join(root, '.env'), 'utf8').split(/\r?\n/)) {
      const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/);
      if (match && !match[2].startsWith('your_') && !process.env[match[1]]) {
        process.env[match[1]] = match[2].replace(/^['"]|['"]$/g, '');
      }
    }
  } catch {}
}
loadEnv();

const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };
const server = http.createServer(async (req, res) => {
  if (req.method === 'POST' && req.url === '/api/chat') {
    if (process.env.PUBLIC_DEMO === 'true') {
      res.writeHead(503, { 'Content-Type': 'application/json' });
      return res.end(JSON.stringify({ error: 'This public preview does not have an online AI model connected. The local AI works when StudySpark is running on its owner’s computer.' }));
    }
    let raw = '';
    req.on('data', chunk => { raw += chunk; if (raw.length > 100_000) req.destroy(); });
    req.on('end', async () => {
      try {
        const { messages } = JSON.parse(raw);
        if (!Array.isArray(messages) || messages.length > 30) throw new Error('Please start a new chat and try again.');
        const model = process.env.OLLAMA_MODEL || 'qwen3.5:2b';
        const response = await fetch('http://127.0.0.1:11434/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ model, stream: false, think: false, keep_alive: '10m', options: { temperature: 0.4, num_ctx: 4096, num_predict: 512 }, messages: [
            { role: 'system', content: 'You are StudySpark, a kind and capable personal tutor for school and college students across all subjects. Explain concepts clearly at the student’s level. For math and science problems, show the reasoning step by step, define symbols, and check the result. Ask a short clarifying question when the problem is incomplete. Use readable Markdown and LaTeX delimiters $...$ or $$...$$ for equations. Never shame the student; encourage learning rather than just giving an unexplained answer.' },
            ...messages.filter(m => ['user', 'assistant'].includes(m.role)).map(m => ({ role: m.role, content: String(m.content).slice(0, 12000) }))
          ] })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'The local AI model could not answer just now.');
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ answer: data.message?.content || 'I could not create an answer. Please try again.' }));
      } catch (error) {
        const unavailable = error.cause?.code === 'ECONNREFUSED' || error.message === 'fetch failed';
        res.writeHead(unavailable ? 503 : 500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: unavailable ? 'The local AI is not running yet. Install and open Ollama, then download the qwen3.5:2b model.' : error.message || 'Something went wrong. Please try again.' }));
      }
    });
    return;
  }
  const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
  const requested = pathname === '/' ? '/index.html' : pathname;
  const file = path.resolve(root, `.${requested}`);
  if (!file.startsWith(root + path.sep)) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404); return res.end('Not found'); }
    res.writeHead(200, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-cache' });
    res.end(content);
  });
});
server.listen(port, () => console.log(`StudySpark is running at http://localhost:${port}`));
