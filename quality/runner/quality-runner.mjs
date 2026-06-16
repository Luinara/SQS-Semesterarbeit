import { spawn } from 'node:child_process';
import { cpSync, existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const repoRoot = process.env.QUALITY_REPO_DIR ?? '/work/repo';
const outputRoot = process.env.QUALITY_OUTPUT_DIR ?? '/quality-output';
const logRoot = join(outputRoot, 'logs');
const artifactRoot = join(outputRoot, 'artifacts');
const reportPath = join(outputRoot, 'report.json');
const startedAt = new Date();

mkdirSync(logRoot, { recursive: true });
mkdirSync(artifactRoot, { recursive: true });

const checks = [
  {
    id: 'backend-tests',
    title: 'Backend Unit- und Integrationstests + JaCoCo',
    category: 'Backend',
    command: 'mvn --batch-mode --no-transfer-progress verify',
    cwd: 'backend',
    required: true,
    artifacts: [
      {
        source: 'backend/target/site/jacoco',
        target: 'backend-jacoco',
        label: 'Backend JaCoCo Report',
      },
    ],
  },
  {
    id: 'backend-checkstyle',
    title: 'Backend Checkstyle',
    category: 'Backend',
    command: 'mvn --batch-mode --no-transfer-progress checkstyle:check',
    cwd: 'backend',
    required: true,
  },
  {
    id: 'backend-spotbugs',
    title: 'Backend SpotBugs',
    category: 'Backend',
    command: 'mvn --batch-mode --no-transfer-progress compile spotbugs:check',
    cwd: 'backend',
    required: true,
  },
  {
    id: 'frontend-install',
    title: 'Frontend Dependencies',
    category: 'Frontend',
    command: 'npm ci',
    cwd: 'frontend',
    required: true,
  },
  {
    id: 'frontend-typecheck',
    title: 'Frontend Type Check',
    category: 'Frontend',
    command: 'npm run type-check',
    cwd: 'frontend',
    required: true,
  },
  {
    id: 'frontend-unit',
    title: 'Frontend Unit Tests',
    category: 'Frontend',
    command: 'npm test',
    cwd: 'frontend',
    required: true,
  },
  {
    id: 'frontend-coverage',
    title: 'Frontend Coverage Gate',
    category: 'Frontend',
    command: 'npm run test:coverage',
    cwd: 'frontend',
    required: true,
    artifacts: [
      {
        source: 'frontend/coverage',
        target: 'frontend-coverage',
        label: 'Frontend Coverage Report',
      },
    ],
  },
  {
    id: 'frontend-lint',
    title: 'Frontend ESLint',
    category: 'Frontend',
    command: 'npm run lint',
    cwd: 'frontend',
    required: true,
  },
  {
    id: 'frontend-security',
    title: 'Frontend Security',
    category: 'Security',
    command: 'npm run security:frontend',
    cwd: 'frontend',
    required: true,
  },
  {
    id: 'e2e',
    title: 'Playwright User Flow',
    category: 'E2E',
    command: 'npx playwright test',
    cwd: 'frontend',
    required: false,
    preflight: async () => {
      const frontendReady = await waitForHttp('http://frontend:3000', 90_000);
      const backendReady = await waitForHttp('http://backend:8181/api/tasks', 90_000);

      if (!frontendReady || !backendReady) {
        return {
          status: 'skipped',
          summary:
            'Docker-App oder Backend war nicht erreichbar. Der E2E-Check ist sichtbar, aber nicht gate-pflichtig.',
        };
      }

      return { status: 'ready' };
    },
    env: {
      PLAYWRIGHT_SKIP_WEB_SERVER: '1',
      PLAYWRIGHT_BASE_URL: 'http://frontend:3000',
      PLAYWRIGHT_EVIDENCE: '1',
      PLAYWRIGHT_HTML_OPEN: 'never',
    },
    artifacts: [
      {
        source: 'frontend/playwright-report',
        target: 'playwright-report',
        label: 'Playwright HTML Report',
      },
    ],
  },
];

const report = {
  schemaVersion: 1,
  generatedBy: 'PokeHabit Quality Runner',
  startedAt: startedAt.toISOString(),
  finishedAt: null,
  durationSeconds: null,
  gate: {
    status: 'running',
    score: 0,
    requiredPassed: 0,
    requiredTotal: checks.filter((check) => check.required).length,
    failedRequired: [],
  },
  summary: {
    passed: 0,
    failed: 0,
    skipped: 0,
    running: 0,
    pending: checks.length,
  },
  checks: checks.map((check) => ({
    id: check.id,
    title: check.title,
    category: check.category,
    required: check.required,
    status: 'pending',
    startedAt: null,
    finishedAt: null,
    durationSeconds: null,
    exitCode: null,
    summary: 'Wartet auf Ausführung.',
    logPath: `logs/${check.id}.log`,
    artifacts: [],
  })),
};

writeReport();

for (const check of checks) {
  const item = findCheck(check.id);

  if (check.preflight) {
    const preflight = await check.preflight();
    if (preflight.status === 'skipped') {
      markSkipped(item, preflight.summary);
      writeReport();
      continue;
    }
  }

  item.status = 'running';
  item.startedAt = new Date().toISOString();
  item.summary = 'Check läuft.';
  writeReport();

  const started = Date.now();
  const result = await runShellCommand(check);
  item.finishedAt = new Date().toISOString();
  item.durationSeconds = secondsSince(started);
  item.exitCode = result.exitCode;
  item.status = result.exitCode === 0 ? 'passed' : 'failed';
  item.summary =
    result.exitCode === 0
      ? 'Check erfolgreich abgeschlossen.'
      : `Check fehlgeschlagen mit Exit-Code ${result.exitCode}.`;

  item.artifacts = collectArtifacts(check);
  writeReport();
}

report.finishedAt = new Date().toISOString();
report.durationSeconds = secondsSince(startedAt.getTime());
updateGate();
writeReport();

process.exit(report.gate.status === 'failed' ? 1 : 0);

function runShellCommand(check) {
  return new Promise((resolve) => {
    const logPath = join(logRoot, `${check.id}.log`);
    const fullCwd = join(repoRoot, check.cwd);
    const env = check.env ? { ...process.env, ...check.env } : process.env;

    writeFileSync(
      logPath,
      [
        `# ${check.title}`,
        `# CWD: ${fullCwd}`,
        `# Command: ${check.command}`,
        `# Started: ${new Date().toISOString()}`,
        '',
      ].join('\n')
    );

    const child = spawn('bash', ['-lc', check.command], {
      cwd: fullCwd,
      env,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    child.stdout.on('data', (chunk) => appendLog(logPath, chunk));
    child.stderr.on('data', (chunk) => appendLog(logPath, chunk));

    child.on('error', (error) => {
      appendLog(logPath, `\nRunner error: ${error.message}\n`);
      resolve({ exitCode: 1 });
    });

    child.on('close', (code) => {
      appendLog(logPath, `\n# Finished: ${new Date().toISOString()}\n# Exit code: ${code ?? 1}\n`);
      resolve({ exitCode: code ?? 1 });
    });
  });
}

function appendLog(logPath, chunk) {
  writeFileSync(logPath, chunk, { flag: 'a' });
}

function collectArtifacts(check) {
  const artifacts = [];

  for (const artifact of check.artifacts ?? []) {
    const source = join(repoRoot, artifact.source);
    const target = join(artifactRoot, artifact.target);

    if (!existsSync(source)) {
      continue;
    }

    rmSync(target, { recursive: true, force: true });
    cpSync(source, target, { recursive: true });

    const indexFile = existsSync(join(target, 'index.html')) ? 'index.html' : '';
    artifacts.push({
      label: artifact.label ?? artifact.target,
      path: `artifacts/${artifact.target}/${indexFile}`,
    });
  }

  return artifacts;
}

function markSkipped(item, summary) {
  item.status = 'skipped';
  item.startedAt = new Date().toISOString();
  item.finishedAt = item.startedAt;
  item.durationSeconds = 0;
  item.exitCode = null;
  item.summary = summary;
}

function findCheck(id) {
  return report.checks.find((check) => check.id === id);
}

function writeReport() {
  updateGate();
  writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`);
}

function updateGate() {
  const required = report.checks.filter((check) => check.required);
  const requiredPassed = required.filter((check) => check.status === 'passed').length;
  const failedRequired = required.filter((check) => check.status === 'failed');
  const running = report.checks.filter((check) => check.status === 'running').length;
  const pending = report.checks.filter((check) => check.status === 'pending').length;

  report.summary = {
    passed: report.checks.filter((check) => check.status === 'passed').length,
    failed: report.checks.filter((check) => check.status === 'failed').length,
    skipped: report.checks.filter((check) => check.status === 'skipped').length,
    running,
    pending,
  };

  report.gate.requiredPassed = requiredPassed;
  report.gate.requiredTotal = required.length;
  report.gate.failedRequired = failedRequired.map((check) => check.id);
  report.gate.score = Math.round((requiredPassed / required.length) * 100);

  if (failedRequired.length > 0) {
    report.gate.status = 'failed';
    return;
  }

  if (running > 0 || pending > 0) {
    report.gate.status = 'running';
    return;
  }

  report.gate.status = 'passed';
}

function secondsSince(startTimestamp) {
  return Math.round((Date.now() - startTimestamp) / 1000);
}

async function waitForHttp(url, timeoutMs) {
  const deadline = Date.now() + timeoutMs;

  while (Date.now() < deadline) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(3000) });
      if (response.status < 500) {
        return true;
      }
    } catch {
      await sleep(1500);
    }
  }

  return false;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
