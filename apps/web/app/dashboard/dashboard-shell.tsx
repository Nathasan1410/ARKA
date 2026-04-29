'use client';

import { useMemo, useState } from 'react';
import {
  demoWorldSeed,
  ScenarioKey,
  TriageOutcome,
  type ScenarioKey as ScenarioKeyType,
} from '@arka/shared';
import { createDashboardRun, scenarioCards, type DashboardRun } from './dashboard-data';

const INITIAL_SCENARIO = ScenarioKey.STATE_A;

export function DashboardShell() {
  const [runs, setRuns] = useState<DashboardRun[]>(() => [createDashboardRun(INITIAL_SCENARIO, 1)]);
  const [selectedCaseId, setSelectedCaseId] = useState('CASE-001');

  const selectedRun = useMemo(() => {
    return runs.find((run) => run.caseId === selectedCaseId) ?? runs[0];
  }, [runs, selectedCaseId]);

  function handleRunScenario(scenarioKey: ScenarioKeyType) {
    const nextRun = createDashboardRun(scenarioKey, runs.length + 1);
    setRuns((currentRuns) => [nextRun, ...currentRuns]);
    setSelectedCaseId(nextRun.caseId);
  }

  const movementDifference = selectedRun.auditEvent.actualMovementGrams - selectedRun.auditEvent.expectedUsageGrams;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ARKA - Audit Arena</p>
          <h1>Local dashboard shell</h1>
          <p>
            Scenario-driven dashboard route using the canonical State A / State C / State D fixtures plus pure
            reconciliation and deterministic triage. Deterministic fallback is active here; real OpenClaw runtime,
            Telegram transport, 0G upload, and chain calls are not connected in this shell.
          </p>
        </div>
        <div className="status-stack">
          <span className="chip" data-tone="info">
            Dashboard UI - PARTIAL
          </span>
          <span className="chip" data-tone="warning">
            OpenClaw - FALLBACK_ONLY
          </span>
          <span className="chip" data-tone="warning">
            Telegram - SIMULATED
          </span>
          <span className="chip" data-tone="warning">
            0G Proof - NOT_STARTED
          </span>
        </div>
      </header>

      <section className="panel span-12">
        <h2>Scenario Runner</h2>
        <p className="panel-subtitle">
          Demo world: {demoWorldSeed.productName} uses {demoWorldSeed.usageRule.gramsPerUnit}g{' '}
          {demoWorldSeed.inventoryItemName} per unit. Cashier {demoWorldSeed.cashier.name} records the order, handler{' '}
          {demoWorldSeed.handler.name} owns the movement, and {demoWorldSeed.owner.name} is the final reviewer.
        </p>

        <div className="runner-grid">
          {scenarioCards.map((card) => {
            const scenarioIsSelected = selectedRun.scenario.scenarioKey === card.key;

            return (
              <button
                key={card.key}
                className="scenario-button"
                data-active={scenarioIsSelected}
                onClick={() => handleRunScenario(card.key)}
                type="button"
              >
                <div className="scenario-header">
                  <div>
                    <h3>{card.title}</h3>
                    <p>{card.intent}</p>
                  </div>
                  <span className="status-pill" data-tone={getScenarioTone(card.key)}>
                    {card.key}
                  </span>
                </div>

                <div className="scenario-body">
                  <div className="scenario-meta">
                    <div>
                      <span className="label">Expected result</span>
                      <span className="value">{card.expectedOutcome}</span>
                    </div>
                    <div>
                      <span className="label">Proof path</span>
                      <span className="value">{card.proofPath}</span>
                    </div>
                  </div>

                  <div className="scenario-meta">
                    <div>
                      <span className="label">Expected usage</span>
                      <span className="value">{selectedRun.scenario.expectedUsageGrams}g whey</span>
                    </div>
                    <div>
                      <span className="label">Triage</span>
                      <span className="value">{card.triagePath}</span>
                    </div>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="dashboard-grid">
        <section className="panel span-4">
          <h2>Order Panel</h2>
          <p className="panel-subtitle">Business intent for the selected case.</p>

          <div className="panel-grid">
            <div className="kv-row">
              <strong>Order ID</strong>
              <span>{selectedRun.orderId}</span>
            </div>
            <div className="kv-row">
              <strong>Product</strong>
              <span>{selectedRun.auditEvent.productName}</span>
            </div>
            <div className="kv-row">
              <strong>Quantity</strong>
              <span>{selectedRun.auditEvent.orderQuantity}</span>
            </div>
            <div className="kv-row">
              <strong>Cashier</strong>
              <span>{selectedRun.auditEvent.cashierName}</span>
            </div>
            <div className="kv-row">
              <strong>Expected usage</strong>
              <span>
                {selectedRun.auditEvent.expectedUsageGrams}g {selectedRun.auditEvent.inventoryItemName}
              </span>
            </div>
            <div className="kv-row">
              <strong>Audit window</strong>
              <span>{selectedRun.evidenceWindowLabel}</span>
            </div>
          </div>
        </section>

        <section className="panel span-4">
          <h2>Movement Panel</h2>
          <p className="panel-subtitle">Physical movement used by local reconciliation.</p>

          <div className="panel-grid">
            <div className="kv-row">
              <strong>Movement ID</strong>
              <span>{selectedRun.movementId}</span>
            </div>
            <div className="kv-row">
              <strong>Inventory item</strong>
              <span>{selectedRun.auditEvent.inventoryItemName}</span>
            </div>
            <div className="kv-row">
              <strong>Container</strong>
              <span>{selectedRun.auditEvent.containerId}</span>
            </div>
            <div className="kv-row">
              <strong>Handler</strong>
              <span>{selectedRun.auditEvent.handlerName}</span>
            </div>
            <div className="kv-row">
              <strong>Movement</strong>
              <span>{selectedRun.auditEvent.actualMovementGrams}g OUT</span>
            </div>
            <div className="kv-row">
              <strong>Movement time</strong>
              <span>{selectedRun.movementTimestampLabel} ICT</span>
            </div>
          </div>
        </section>

        <section className="panel span-4">
          <h2>Proof Panel</h2>
          <p className="panel-subtitle">Honest local status only; no proof integrations run here.</p>

          <div className="panel-grid">
            <div className="kv-row">
              <strong>Audit proof status</strong>
              <span>{selectedRun.auditEvent.auditProofStatus}</span>
            </div>
            <div className="kv-row">
              <strong>Storage status</strong>
              <span>{selectedRun.auditEvent.storageStatus}</span>
            </div>
            <div className="kv-row">
              <strong>Chain status</strong>
              <span>{selectedRun.auditEvent.chainStatus}</span>
            </div>
            <div className="kv-row">
              <strong>Proof type</strong>
              <span>{selectedRun.auditEvent.proofType}</span>
            </div>
            <div className="kv-row">
              <strong>Local package hash</strong>
              <span>Not created in this shell</span>
            </div>
            <div className="kv-row">
              <strong>0G root / tx</strong>
              <span>Not started</span>
            </div>
          </div>

          <div className="note-block">
            <p>{selectedRun.proofSummary}</p>
          </div>
        </section>

        <section className="panel span-8">
          <h2>AuditEvent Detail</h2>
          <p className="panel-subtitle">Selected case reasoning from order intent to local audit result.</p>

          <div className="panel-grid">
            <div className="kv-row">
              <strong>AuditEvent ID</strong>
              <code>{selectedRun.auditEvent.auditEventId}</code>
            </div>
            <div className="kv-row">
              <strong>Case ID</strong>
              <code>{selectedRun.auditEvent.caseId}</code>
            </div>
            <div className="kv-row">
              <strong>Scenario</strong>
              <span>{selectedRun.auditEvent.scenarioKey}</span>
            </div>
            <div className="kv-row">
              <strong>Case type</strong>
              <span>{selectedRun.auditEvent.caseType}</span>
            </div>
            <div className="kv-row">
              <strong>Status</strong>
              <span>{selectedRun.auditEvent.status}</span>
            </div>
            <div className="kv-row">
              <strong>Severity</strong>
              <span>{selectedRun.auditEvent.severity}</span>
            </div>
            <div className="kv-row">
              <strong>Expected vs actual</strong>
              <span>
                {selectedRun.auditEvent.expectedUsageGrams}g expected - {selectedRun.auditEvent.actualMovementGrams}g
                actual
              </span>
            </div>
            <div className="kv-row">
              <strong>Difference / variance</strong>
              <span>
                {movementDifference > 0 ? '+' : ''}
                {movementDifference}g - {selectedRun.auditEvent.variancePercent.toFixed(1)}%
              </span>
            </div>
            <div className="kv-row">
              <strong>People context</strong>
              <span>
                Handler {selectedRun.auditEvent.handlerName} - Cashier {selectedRun.auditEvent.cashierName} - Owner{' '}
                {selectedRun.auditEvent.ownerName}
              </span>
            </div>
            <div className="kv-row">
              <strong>Created at</strong>
              <span>{selectedRun.createdAtLabel}</span>
            </div>
            <div className="kv-row">
              <strong>Evidence window</strong>
              <span>{selectedRun.evidenceWindowLabel} ICT</span>
            </div>
            <div className="kv-row">
              <strong>Recommended action</strong>
              <span>{renderRecommendedAction(selectedRun.auditEvent.triageOutcome ?? TriageOutcome.AUTO_CLEAR)}</span>
            </div>
          </div>
        </section>

        <section className="panel span-4">
          <h2>OpenClaw / Telegram Panel</h2>
          <p className="panel-subtitle">
            Deterministic fallback is active. Real OpenClaw runtime and Telegram delivery remain unverified.
          </p>

          <div className="panel-grid">
            <div className="kv-row">
              <strong>Triage outcome</strong>
              <span>{selectedRun.auditEvent.triageOutcome}</span>
            </div>
            <div className="kv-row">
              <strong>Triage source</strong>
              <span>{selectedRun.auditEvent.triageSource}</span>
            </div>
            <div className="kv-row">
              <strong>Owner state</strong>
              <span>{selectedRun.ownerAlertState}</span>
            </div>
            <div className="kv-row">
              <strong>Owner recommendation</strong>
              <span>{selectedRun.ownerRecommendation}</span>
            </div>
            <div className="kv-row">
              <strong>Action log</strong>
              <span>{selectedRun.actionLog}</span>
            </div>
            <div className="kv-row">
              <strong>Case note</strong>
              <span>{selectedRun.caseNote}</span>
            </div>
            <div className="kv-row">
              <strong>Transport</strong>
              <span>Dashboard simulation only</span>
            </div>
          </div>

          <div className="note-block">
            <p>{selectedRun.triageRuntimeSummary}</p>
          </div>

          <div className="message-box">
            <span className="label">Owner alert preview</span>
            <p>{selectedRun.ownerAlertCopy}</p>
          </div>

          {selectedRun.staffMessagePreview ? (
            <div className="message-box">
              <span className="label">Staff follow-up preview</span>
              <p style={{ whiteSpace: 'pre-line' }}>{selectedRun.staffMessagePreview}</p>
            </div>
          ) : null}
        </section>

        <section className="panel span-12">
          <h2>AuditEvent History</h2>
          <p className="panel-subtitle">Local in-memory case list for the current browser session.</p>

          <div className="history-list">
            {runs.map((run) => (
              <button
                key={run.caseId}
                className="history-button"
                data-active={run.caseId === selectedRun.caseId}
                onClick={() => setSelectedCaseId(run.caseId)}
                type="button"
              >
                <div className="history-row">
                  <div className="history-cell">
                    <strong>{run.caseId}</strong>
                    <small>{run.scenario.label}</small>
                  </div>
                  <div className="history-cell">
                    <strong>{run.auditEvent.status}</strong>
                    <small>{run.auditEvent.severity}</small>
                  </div>
                  <div className="history-cell">
                    <strong>{run.auditEvent.triageOutcome}</strong>
                    <small>{run.ownerAlertState}</small>
                  </div>
                  <div className="history-cell">
                    <strong>{run.auditEvent.auditProofStatus}</strong>
                    <small>
                      {run.auditEvent.storageStatus} / {run.auditEvent.chainStatus}
                    </small>
                  </div>
                  <div className="history-cell">
                    <strong>{run.createdAtLabel}</strong>
                    <small>Handler {run.auditEvent.handlerName}</small>
                  </div>
                </div>
              </button>
            ))}
          </div>

          <p className="microcopy">
            State C and State D surface proof lifecycle placeholders, but proof failure cannot delete or invalidate the
            AuditEvent. Final decision stays with the owner or auditor.
          </p>
        </section>
      </div>
    </main>
  );
}

function renderRecommendedAction(triageOutcome: TriageOutcome): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) {
    return 'Auto-clear locally and keep the case in dashboard history.';
  }

  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) {
    return 'Explanation requested after owner approval.';
  }

  return 'Needs immediate owner or auditor review.';
}

function getScenarioTone(scenarioKey: ScenarioKeyType): 'success' | 'warning' | 'danger' {
  if (scenarioKey === ScenarioKey.STATE_A) {
    return 'success';
  }

  if (scenarioKey === ScenarioKey.STATE_C) {
    return 'warning';
  }

  return 'danger';
}
