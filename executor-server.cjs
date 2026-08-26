const fs = require('fs');
const path = require('path');
const express = require('express');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const PROJECT_ROOT = process.cwd();

const app = express();
app.use(express.text({ type: '*/*' }));

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

// Route: GET '/'
app.get('/', (req, res) => {
    res.send('<h1>Executor Server</h1>');
});

// Route: GET '/health'
app.get('/health', (req, res) => {
    res.send('Server is running');
});

// Route: POST '/execute'
app.post('/execute', async (req, res) => {
    const body = req.body;
    try {
        const match = body.match(/EXECUTOR_PACKAGE_V1\s*({[\s\S]*?})\s*END_EXECUTOR_PACKAGE/);
        if (!match) {
            return res.status(400).send('No valid package found. Must contain EXECUTOR_PACKAGE_V1 ... END_EXECUTOR_PACKAGE');
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
        res.status(200).send(report);
    } catch (e) {
        res.status(400).send('Error: ' + e.message);
    }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on http://0.0.0.0:${PORT}`));
