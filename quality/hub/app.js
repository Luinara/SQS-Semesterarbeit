const reportUrl = '/reports/report.json';
const checksElement = document.querySelector('#checks');
const evidenceElement = document.querySelector('#evidence');
const gateRing = document.querySelector('#gate-ring');
const gateScore = document.querySelector('#gate-score');
const gateStatus = document.querySelector('#gate-status');
const gateCopy = document.querySelector('#gate-copy');
const reportTime = document.querySelector('#report-time');

const metricPassed = document.querySelector('#metric-passed');
const metricFailed = document.querySelector('#metric-failed');
const metricSkipped = document.querySelector('#metric-skipped');
const metricRequired = document.querySelector('#metric-required');

loadReport();
setInterval(loadReport, 5000);

async function loadReport() {
  try {
    const response = await fetch(`${reportUrl}?t=${Date.now()}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    renderReport(await response.json());
  } catch {
    renderWaiting();
  }
}

function renderWaiting() {
  gateRing.style.setProperty('--score', '0%');
  gateScore.textContent = '0';
  gateStatus.textContent = 'Wartet';
  gateStatus.className = 'status-pill status-running';
  gateCopy.textContent =
    'Noch kein Quality-Report vorhanden. Starte: docker compose --profile quality up --build';
  reportTime.textContent = 'Report wird geladen...';
  metricPassed.textContent = '0';
  metricFailed.textContent = '0';
  metricSkipped.textContent = '0';
  metricRequired.textContent = '0 / 0';
  checksElement.innerHTML = '';
  evidenceElement.innerHTML = '';
}

function renderReport(report) {
  const score = report.gate?.score ?? 0;
  const status = report.gate?.status ?? 'running';

  gateRing.style.setProperty('--score', `${score}%`);
  gateScore.textContent = String(score);
  gateStatus.textContent = statusLabel(status);
  gateStatus.className = `status-pill status-${status}`;
  gateCopy.textContent = gateMessage(report);

  metricPassed.textContent = String(report.summary?.passed ?? 0);
  metricFailed.textContent = String(report.summary?.failed ?? 0);
  metricSkipped.textContent = String(report.summary?.skipped ?? 0);
  metricRequired.textContent = `${report.gate?.requiredPassed ?? 0} / ${
    report.gate?.requiredTotal ?? 0
  }`;

  reportTime.textContent = report.finishedAt
    ? `Fertig: ${formatDate(report.finishedAt)}`
    : `Gestartet: ${formatDate(report.startedAt)}`;

  checksElement.innerHTML = report.checks.map(renderCheck).join('');
  evidenceElement.innerHTML = renderEvidence(report);
}

function renderCheck(check) {
  return `
    <article class="check" data-status="${escapeHtml(check.status)}">
      <span class="check__bar" aria-hidden="true"></span>
      <div>
        <h3>${escapeHtml(check.title)}</h3>
        <p>${escapeHtml(check.summary)}</p>
        <small>${escapeHtml(check.required ? 'Pflichtcheck' : 'Optional')} · ${escapeHtml(
          check.category
        )}</small>
      </div>
      <div class="check__meta">
        <span class="status-pill status-${escapeHtml(check.status)}">${statusLabel(check.status)}</span>
        <span class="tag">${formatDuration(check.durationSeconds)}</span>
      </div>
    </article>
  `;
}

function renderEvidence(report) {
  return report.checks
    .map((check) => {
      const artifactLinks = (check.artifacts ?? [])
        .map(
          (artifact) =>
            `<a href="/reports/${escapeAttribute(artifact.path)}" target="_blank" rel="noreferrer">${escapeHtml(
              artifact.label
            )}</a>`
        )
        .join('');
      const logLink = `<a href="/reports/${escapeAttribute(
        check.logPath
      )}" target="_blank" rel="noreferrer">Log</a>`;

      return `
        <article class="evidence-card">
          <h3>${escapeHtml(check.title)}</h3>
          ${logLink}
          ${artifactLinks}
        </article>
      `;
    })
    .join('');
}

function gateMessage(report) {
  const status = report.gate?.status;
  if (status === 'passed') {
    return 'Alle Pflichtchecks sind grün. Der optionale E2E-Status bleibt separat sichtbar.';
  }

  if (status === 'failed') {
    return `Gate rot: ${report.gate.failedRequired.length} Pflichtcheck(s) fehlgeschlagen.`;
  }

  return 'Quality Runner arbeitet. Diese Seite aktualisiert sich automatisch.';
}

function statusLabel(status) {
  return (
    {
      passed: 'Bestanden',
      failed: 'Fehlgeschlagen',
      running: 'Läuft',
      pending: 'Wartet',
      skipped: 'Übersprungen',
    }[status] ?? status
  );
}

function formatDate(value) {
  if (!value) {
    return 'unbekannt';
  }

  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value));
}

function formatDuration(value) {
  if (value === null || value === undefined) {
    return 'offen';
  }

  if (value < 60) {
    return `${value}s`;
  }

  return `${Math.floor(value / 60)}m ${value % 60}s`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function escapeAttribute(value) {
  return encodeURI(String(value ?? '')).replaceAll('"', '%22');
}
