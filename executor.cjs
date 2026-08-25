const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execAsync = promisify(exec);
const readline = require('readline');

// Configuration
const PROJECT_ROOT = process.cwd(); // or let user set via env
const BACKUP_DIR = path.join(PROJECT_ROOT, '.executor', 'backups');
const DRY_RUN = process.argv.includes('--dry-run');
const AUTO_YES = process.argv.includes('--yes');

// Ensure backup dir exists
fs.mkdirSync(BACKUP_DIR, { recursive: true });

// === Helpers ===

function resolvePath(filePath) {
    const resolved = path.resolve(PROJECT_ROOT, filePath);
    if (!resolved.startsWith(PROJECT_ROOT)) {
        throw new Error(`Path traversal detected: ${filePath}`);
    }
    return resolved;
}

function readFileSafe(filePath) {
    const full = resolvePath(filePath);
    if (!fs.existsSync(full)) return null;
    return fs.readFileSync(full, 'utf8');
}

function writeFileSafe(filePath, content, backup = true) {
    const full = resolvePath(filePath);
    if (backup && fs.existsSync(full)) {
        const backupName = path.basename(full) + '.backup.' + Date.now();
        const backupPath = path.join(BACKUP_DIR, backupName);
        fs.copyFileSync(full, backupPath);
    }
    fs.writeFileSync(full, content, 'utf8');
}

function makeBackup(filePath) {
    const full = resolvePath(filePath);
    if (!fs.existsSync(full)) return;
    const backupName = path.basename(full) + '.backup.' + Date.now();
    const backupPath = path.join(BACKUP_DIR, backupName);
    fs.copyFileSync(full, backupPath);
}

function confirm(action) {
    if (AUTO_YES) return true;
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    return new Promise(resolve => {
        rl.question(`${action}? (y/N) `, ans => {
            rl.close();
            resolve(ans.toLowerCase() === 'y');
        });
    });
}

// === Operation handlers ===

async function opReplaceFile(op) {
    const { path: filePath, content } = op;
    const full = resolvePath(filePath);
    if (!fs.existsSync(full)) {
        return { status: 'error', message: `File not found: ${filePath}` };
    }
    if (DRY_RUN) {
        return { status: 'dry', message: `Would replace ${filePath}` };
    }
    if (!AUTO_YES && !(await confirm(`Replace ${filePath}`))) {
        return { status: 'skipped', message: 'User cancelled' };
    }
    makeBackup(filePath);
    fs.writeFileSync(full, content, 'utf8');
    return { status: 'success', message: `Replaced ${filePath}` };
}

async function opCreateFile(op) {
    const { path: filePath, content } = op;
    const full = resolvePath(filePath);
    if (fs.existsSync(full)) {
        return { status: 'error', message: `File already exists: ${filePath}` };
    }
    if (DRY_RUN) {
        return { status: 'dry', message: `Would create ${filePath}` };
    }
    fs.mkdirSync(path.dirname(full), { recursive: true });
    fs.writeFileSync(full, content, 'utf8');
    return { status: 'success', message: `Created ${filePath}` };
}

async function opEditText(op) {
    const { path: filePath, find, replace, replacements } = op;
    const full = resolvePath(filePath);
    if (!fs.existsSync(full)) {
        return { status: 'error', message: `File not found: ${filePath}` };
    }
    let content = fs.readFileSync(full, 'utf8');
    let modified = false;
    const edits = replacements || [{ find, replace }];
    for (const edit of edits) {
        if (!content.includes(edit.find)) {
            return { status: 'error', message: `Text not found: "${edit.find}" in ${filePath}` };
        }
        content = content.replaceAll(edit.find, edit.replace);
        modified = true;
    }
    if (DRY_RUN) {
        return { status: 'dry', message: `Would edit ${filePath} (${edits.length} replacements)` };
    }
    if (!AUTO_YES && !(await confirm(`Edit ${filePath} (${edits.length} replacements)`))) {
        return { status: 'skipped', message: 'User cancelled' };
    }
    makeBackup(filePath);
    fs.writeFileSync(full, content, 'utf8');
    return { status: 'success', message: `Edited ${filePath}` };
}

async function opDeleteFile(op) {
    const { path: filePath } = op;
    const full = resolvePath(filePath);
    if (!fs.existsSync(full)) {
        return { status: 'error', message: `File not found: ${filePath}` };
    }
    if (DRY_RUN) {
        return { status: 'dry', message: `Would delete ${filePath}` };
    }
    if (!AUTO_YES && !(await confirm(`Delete ${filePath}`))) {
        return { status: 'skipped', message: 'User cancelled' };
    }
    makeBackup(filePath);
    fs.unlinkSync(full);
    return { status: 'success', message: `Deleted ${filePath}` };
}

async function opRenameFile(op) {
    const { from, to } = op;
    const fullFrom = resolvePath(from);
    const fullTo = resolvePath(to);
    if (!fs.existsSync(fullFrom)) {
        return { status: 'error', message: `Source not found: ${from}` };
    }
    if (fs.existsSync(fullTo)) {
        return { status: 'error', message: `Destination exists: ${to}` };
    }
    if (DRY_RUN) {
        return { status: 'dry', message: `Would rename ${from} → ${to}` };
    }
    if (!AUTO_YES && !(await confirm(`Rename ${from} → ${to}`))) {
        return { status: 'skipped', message: 'User cancelled' };
    }
    makeBackup(from);
    fs.renameSync(fullFrom, fullTo);
    return { status: 'success', message: `Renamed ${from} → ${to}` };
}

async function opRunCommand(op) {
    const { command } = op;
    if (DRY_RUN) {
        return { status: 'dry', message: `Would run: ${command}` };
    }
    if (!AUTO_YES && !(await confirm(`Run command: ${command}`))) {
        return { status: 'skipped', message: 'User cancelled' };
    }
    try {
        const { stdout, stderr } = await execAsync(command, { cwd: PROJECT_ROOT, timeout: 300000 });
        return {
            status: 'success',
            message: `Command executed: ${command}`,
            stdout,
            stderr,
            exitCode: 0
        };
    } catch (error) {
        return {
            status: 'error',
            message: `Command failed: ${command}`,
            stdout: error.stdout || '',
            stderr: error.stderr || error.message,
            exitCode: error.code || 1
        };
    }
}

async function opReadFile(op) {
    const { path: filePath } = op;
    const full = resolvePath(filePath);
    if (!fs.existsSync(full)) {
        return { status: 'error', message: `File not found: ${filePath}` };
    }
    const content = fs.readFileSync(full, 'utf8');
    const stats = fs.statSync(full);
    return {
        status: 'success',
        message: `Read ${filePath}`,
        content,
        size: stats.size,
        hash: require('crypto').createHash('sha256').update(content).digest('hex').slice(0, 16)
    };
}

const opMap = {
    replace_file: opReplaceFile,
    create_file: opCreateFile,
    edit_text: opEditText,
    delete_file: opDeleteFile,
    rename_file: opRenameFile,
    run_command: opRunCommand,
    read_file: opReadFile,
};

// === Parser ===

function extractPackage(input) {
    const match = input.match(/EXECUTOR_PACKAGE_V1\s*({[\s\S]*?})\s*END_EXECUTOR_PACKAGE/);
    if (!match) {
        // fallback: try to parse whole input as JSON
        try { return JSON.parse(input); } catch (e) { throw new Error('No valid package found'); }
    }
    try { return JSON.parse(match[1]); } catch (e) { throw new Error('Invalid JSON inside package'); }
}

// === Main ===

async function main() {
    if (process.argv.includes('--help') || process.argv.includes('-h')) {
        console.log(`Usage: node executor.js [--dry-run] [--yes] [--file <package.json>] [--stdin]
        --dry-run   Show what would be done
        --yes       Auto-confirm all operations
        --file      Read package from file
        --stdin     Read package from stdin (default if no --file)
        `);
        return;
    }

    let packageData;
    const fileArg = process.argv.indexOf('--file');
    if (fileArg !== -1) {
        const filePath = process.argv[fileArg + 1];
        if (!filePath) throw new Error('Missing file path for --file');
        packageData = fs.readFileSync(filePath, 'utf8');
    } else {
        // read from stdin
        const chunks = [];
        process.stdin.setEncoding('utf8');
        for await (const chunk of process.stdin) chunks.push(chunk);
        packageData = chunks.join('');
        if (!packageData.trim()) {
            console.error('No input provided.');
            return;
        }
    }

    let pkg;
    try {
        pkg = extractPackage(packageData);
    } catch (e) {
        console.error(`Error parsing package: ${e.message}`);
        return;
    }

    console.log(`\n=== EXECUTOR PACKAGE ===`);
    console.log(`Version: ${pkg.version || '1'}`);
    console.log(`Project: ${pkg.project || 'current'}`);
    console.log(`Operations: ${pkg.operations.length}\n`);

    if (DRY_RUN) console.log('DRY RUN MODE – no changes will be made.\n');

    const results = [];
    for (const op of pkg.operations) {
        const handler = opMap[op.type];
        if (!handler) {
            results.push({
                type: op.type,
                status: 'error',
                message: `Unknown operation type: ${op.type}`
            });
            continue;
        }
        try {
            const result = await handler(op);
            results.push({ ...result, type: op.type });
        } catch (err) {
            results.push({ type: op.type, status: 'error', message: err.message });
        }
        // if an operation fails and we are not set to continue, stop?
        // The package can specify continueOnError, but default is stop on error.
        if (results[results.length - 1].status === 'error' && !pkg.continueOnError) {
            console.log(`\nStopped due to error in operation ${results.length}.`);
            break;
        }
    }

    // Print report
    console.log('\n=== EXECUTION REPORT ===');
    for (const r of results) {
        const icon = r.status === 'success' ? '✓' : r.status === 'dry' ? '◌' : r.status === 'skipped' ? '⚠' : '✗';
        console.log(`${icon} ${r.type}: ${r.message}`);
        if (r.stdout && r.stdout.trim()) console.log(`  stdout: ${r.stdout.trim()}`);
        if (r.stderr && r.stderr.trim()) console.log(`  stderr: ${r.stderr.trim()}`);
    }

    const failed = results.filter(r => r.status === 'error');
    if (failed.length) {
        console.log(`\n❌ ${failed.length} operation(s) failed.`);
    } else {
        console.log('\n✅ All operations completed successfully.');
    }

    // Output machine-readable result for DeepSeek
    console.log('\n=== RESULT PACKAGE ===');
    console.log(JSON.stringify({ results }, null, 2));
}

main().catch(err => {
    console.error(`Fatal: ${err.message}`);
    process.exit(1);
});