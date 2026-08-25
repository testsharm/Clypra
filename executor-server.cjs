const fs = require('fs');
const path = require('path');
const http = require('http');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

function resolvePath(filePath) {
    const resolved = path.resolve(PROJECT_ROOT, filePath);
    if (!resolved.startsWith(PROJECT_ROOT)) throw new Error('Path traversal');
    return resolved;
}

const opMap = {
    replace_file: async (op) => {
        const full = resolvePath(op.path);
        if (!fs.existsSync(full)) return { status: 'error', message: `File not found: ${op.path}` };
        fs.writeFileSync(full, op.content, 'utf8');
        return { status: 'success', message: `Replaced ${op.path}` };
    },
    create_file: async (op) => {
        const full = resolvePath(op.path);
        if (fs.existsSync(full)) return { status: 'error', message: `File exists: ${op.path}` };
        fs.mkdirSync(path.dirname(full), { recursive: true });
        fs.writeFileSync(full, op.content, 'utf8');
        return { status: 'success', message: `Created ${op.path}` };
    },
    edit_text: async (op) => {
        const full = resolvePath(op.path);
        if (!fs.existsSync(full)) return { status: 'error', message: `File not found: ${op.path}` };
        let content = fs.readFileSync(full, 'utf8');
        const edits = op.replacements || [{ find: op.find, replace: op.replace }];
        for (const edit of edits) {
            if (!content.includes(edit.find)) {
                return { status: 'error', message: `Text not found: "${edit.find}"` };
            }
            content = content.replaceAll(edit.find, edit.replace);
        }
        fs.writeFileSync(full, content, 'utf8');
        return { status: 'success', message: `Edited ${op.path}` };
    },
    delete_file: async (op) => {
        const full = resolvePath(op.path);
        if (!fs.existsSync(full)) return { status: 'error', message: `File not found: ${op.path}` };
        fs.unlinkSync(full);
        return { status: 'success', message: `Deleted ${op.path}` };
    },
    rename_file: async (op) => {
        const from = resolvePath(op.from);
        const to = resolvePath(op.to);
        if (!fs.existsSync(from)) return { status: 'error', message: `Source not found: ${op.from}` };
        if (fs.existsSync(to)) return { status: 'error', message: `Destination exists: ${op.to}` };
        fs.renameSync(from, to);
        return { status: 'success', message: `Renamed ${op.from} → ${op.to}` };
    },
    run_command: async (op) => {
        try {
            const { stdout, stderr } = await execAsync(op.command, { cwd: PROJECT_ROOT, timeout: 300000 });
            return { status: 'success', message: `Command executed: ${op.command}`, stdout, stderr };
        } catch (e) {
            return { status: 'error', message: `Command failed: ${op.command}`, stdout: e.stdout || '', stderr: e.stderr || e.message };
        }
    },
    read_file: async (op) => {
        const full = resolvePath(op.path);
        if (!fs.existsSync(full)) return { status: 'error', message: `File not found: ${op.path}` };
        const content = fs.readFileSync(full, 'utf8');
        return { status: 'success', message: `Read ${op.path}`, content };
    }
};

const server = http.createServer(async (req, res) => {
    if (req.method === 'GET' && req.url === '/') {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Executor Interface</title>
                <style>
                    body { font-family: sans-serif; background: #1e1e26; color: #eee; padding: 20px; }
                    textarea { width: 100%; height: 300px; background: #0e0e12; color: #ddd; border: 1px solid #2a2a38; padding: 10px; font-family: monospace; }
                    button { background: #7C6FFF; color: white; border: none; padding: 10px 20px; margin: 10px 0; cursor: pointer; border-radius: 4px; }
                    button:hover { background: #5B4EE8; }
                    #output { background: #0e0e12; border: 1px solid #2a2a38; padding: 10px; white-space: pre-wrap; font-family: monospace; max-height: 400px; overflow: auto; }
                </style>
            </head>
            <body>
                <h2>Executor Interface</h2>
                <p>Paste your EXECUTOR_PACKAGE_V1 block below and click Run.</p>
                <textarea id="input">EXECUTOR_PACKAGE_V1
        {
          "version": "1",
          "operations": [
            {"type": "read_file", "path": "src/hello.txt"}
          ]
        }
        END_EXECUTOR_PACKAGE</textarea>
                <br>
                <button onclick="run()">Run</button>
                <button onclick="document.getElementById('input').value=''">Clear</button>
                <h3>Output</h3>
                <div id="output">Ready</div>
                <script>
                    async function run() {
                        const input = document.getElementById('input').value;
                        const output = document.getElementById('output');
                        output.textContent = 'Running...';
                        try {
                            const resp = await fetch('/execute', {
                                method: 'POST',
                                headers: { 'Content-Type': 'text/plain' },
                                body: input
                            });
                            const text = await resp.text();
                            output.textContent = text;
                        } catch(e) {
                            output.textContent = 'Error: ' + e.message;
                        }
                    }
                </script>
            </body>
            </html>
        `);
    } else 

 if (req.method === 'POST' && req.url === '/execute') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const match = body.match(/EXECUTOR_PACKAGE_V1\s*({[\s\S]*?})\s*END_EXECUTOR_PACKAGE/);
                if (!match) {
                    res.writeHead(400);
                    res.end('No valid package found. Must contain EXECUTOR_PACKAGE_V1 ... END_EXECUTOR_PACKAGE');
                    return;
                }
                const pkg = JSON.parse(match[1]);
                const results = [];
                for (const op of pkg.operations) {
                    const handler = opMap[op.type];
                    if (!handler) {
                        results.push({ type: op.type, status: 'error', message: 'Unknown operation' });
                        continue;
                    }
                    try {
                        const result = await handler(op);
                        results.push({ ...result, type: op.type });
                    } catch (e) {
                        results.push({ type: op.type, status: 'error', message: e.message });
                    }
                    if (results[results.length-1].status === 'error' && !pkg.continueOnError) break;
                }
                let report = '=== EXECUTION REPORT ===\n';
                for (const r of results) {
                    const icon = r.status === 'success' ? '✓' : '✗';
                    report += `${icon} ${r.type}: ${r.message}\n`;
                    if (r.stdout) report += `  stdout: ${r.stdout}\n`;
                    if (r.stderr) report += `  stderr: ${r.stderr}\n`;
                }
                const failed = results.filter(r => r.status === 'error');
                if (failed.length) report += `\n❌ ${failed.length} operation(s) failed.`;
                else report += '\n✅ All operations completed successfully.';
                report += '\n\n=== RESULT PACKAGE ===\n' + JSON.stringify({ results }, null, 2);
                res.writeHead(200, { 'Content-Type': 'text/plain' });
                res.end(report);
            } catch (e) {
                res.writeHead(400);
                res.end('Error: ' + e.message);
            }
        });
    } else {
        res.writeHead(404);
        res.end('Not found');
    }
});

const PORT = 3001;
server.listen(PORT, () => {
    console.log(`Executor server running at http://localhost:${PORT}`);
    console.log('Open this URL in your browser.');
});

