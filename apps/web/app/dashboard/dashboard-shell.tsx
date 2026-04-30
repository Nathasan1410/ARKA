'use client';

import { useMemo, useState } from 'react';
import { demoScenarioSeeds, demoWorldSeed, ScenarioKey, TriageOutcome, type ScenarioKey as ScenarioKeyType } from '@arka/shared';
import { scenarioCards, type DashboardRun, type RunScenarioResponse, type SimulatedAgentAction } from './dashboard-data';

type DashboardShellProps = {
  initialState: RunScenarioResponse;
};

type CaseView = 'evidence' | 'agent' | 'proof';

export function DashboardShell({ initialState }: DashboardShellProps) {
  const [runs, setRuns] = useState<DashboardRun[]>(initialState.history);
  const [selectedCaseId, setSelectedCaseId] = useState(initialState.run.caseId);
  const [activeView, setActiveView] = useState<CaseView>('evidence');
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [isRunningAgentAction, setIsRunningAgentAction] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const selectedRun = useMemo(() => {
    return runs.find((run) => run.caseId === selectedCaseId) ?? runs[0];
  }, [runs, selectedCaseId]);

  async function handleRunScenario(scenarioKey: ScenarioKeyType) {
    setIsRunningScenario(true);
    setRunError(null);

    try {
      const response = await fetch('/api/demo/run-scenario', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenarioKey }),
      });

      if (!response.ok) {
        throw new Error(`Scenario route failed with HTTP ${response.status}`);
      }

      const result = (await response.json()) as RunScenarioResponse;
      setRuns(result.history);
      setSelectedCaseId(result.run.caseId);
      setActiveView(result.run.auditEvent.triageOutcome === TriageOutcome.AUTO_CLEAR ? 'evidence' : 'agent');
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Scenario route failed.');
    } finally {
      setIsRunningScenario(false);
    }
  }

  async function handleAgentAction(action: SimulatedAgentAction) {
    setIsRunningAgentAction(true);
    setRunError(null);

    try {
      const response = await fetch('/api/demo/agent-action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId: selectedRun.caseId, action }),
      });

      if (!response.ok) {
        throw new Error(`Agent simulation failed with HTTP ${response.status}`);
      }

      const result = (await response.json()) as RunScenarioResponse;
      setRuns(result.history);
      setSelectedCaseId(result.run.caseId);
      setActiveView('agent');
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Agent simulation failed.');
    } finally {
      setIsRunningAgentAction(false);
    }
  }

  if (!selectedRun) {
    return (
      <main className="app-shell">
        <section className="panel">
          <h1>Dashboard unavailable</h1>
          <p className="panel-subtitle">No local scenario run could be loaded.</p>
        </section>
      </main>
    );
  }

  const movementDifference = selectedRun.auditEvent.actualMovementGrams - selectedRun.auditEvent.expectedUsageGrams;
  const actionAvailable = selectedRun.simulatedAgent.availableActions.length > 0;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ARKA Audit Case Console</p>
          <h1>Run a case, inspect the mismatch, decide the next action.</h1>
          <p>
            Protein Shake demo: 3 orders should use 90g Whey Protein. The dashboard shows what happened, why ARKA
            triaged it, and which proof state exists locally.
          </p>
        </div>
        <div className="status-stack">
          <span className="chip" data-tone="info">API route - LOCAL</span>
          <span className="chip" data-tone="warning">DB - {selectedRun.persistence.mode}</span>
          <span className="chip" data-tone="warning">Agent - SIMULATED</span>
          <span className="chip" data-tone="warning">
            Proof - {selectedRun.proofRecord.storageStatus} / {selectedRun.proofRecord.chainStatus}
          </span>
        </div>
      </header>

      <div className="audit-workspace">
        <aside className="scenario-rail">
          <section className="panel">
            <h2>Scenario Cards</h2>
            <p className="panel-subtitle">
              {demoWorldSeed.productName} uses {demoWorldSeed.usageRule.gramsPerUnit}g {demoWorldSeed.inventoryItemName}
              . Handler: {demoWorldSeed.handler.name}.
            </p>
            <div className="scenario-stack">
              {scenarioCards.map((card) => {
                const scenario = demoScenarioSeeds[card.key];
                const difference = scenario.actualMovementGrams - scenario.expectedUsageGrams;

                return (
                  <button
                    key={card.key}
                    className="scenario-button compact"
                    data-active={selectedRun.scenario.scenarioKey === card.key}
                    disabled={isRunningScenario}
                    onClick={() => void handleRunScenario(card.key)}
                    type="button"
                  >
                    <span className="scenario-title">{card.title}</span>
                    <span className="scenario-line">
                      {scenario.expectedUsageGrams}g expected / {scenario.actualMovementGrams}g actual
                    </span>
                    <span className="scenario-line">
                      {difference > 0 ? '+' : ''}
                      {difference}g / {scenario.triageOutcome}
                    </span>
                  </button>
                );
              })}
            </div>
            {runError ? <p className="error-text">{runError}</p> : null}
          </section>

          <section className="panel">
            <h2>Case History</h2>
            <div className="history-list compact">
              {runs.map((run) => (
                <button
                  key={run.caseId}
                  className="history-button"
                  data-active={run.caseId === selectedRun.caseId}
                  onClick={() => setSelectedCaseId(run.caseId)}
                  type="button"
                >
                  <HistoryCell title={run.caseId} detail={`${run.auditEvent.status} / ${run.auditEvent.triageOutcome}`} />
                </button>
              ))}
            </div>
          </section>
        </aside>

        <section className="case-workspace">
          <section className="case-command">
            <div className="case-heading">
              <div>
                <p className="eyebrow">{selectedRun.scenario.label}</p>
                <h2>{selectedRun.caseId}</h2>
              </div>
              <div className="case-badges">
                <span className="status-pill" data-tone={getScenarioTone(selectedRun.scenario.scenarioKey)}>
                  {selectedRun.auditEvent.status}
                </span>
                <span className="status-pill" data-tone={getSeverityTone(selectedRun.auditEvent.severity)}>
                  {selectedRun.auditEvent.severity}
                </span>
              </div>
            </div>

            <div className="comparison-strip">
              <MetricBlock label="Expected" value={`${selectedRun.auditEvent.expectedUsageGrams}g`} detail="3 shakes x 30g" />
              <MetricBlock label="Actual movement" value={`${selectedRun.auditEvent.actualMovementGrams}g`} detail="Whey Protein OUT" />
              <MetricBlock
                label="Difference"
                value={`${movementDifference > 0 ? '+' : ''}${movementDifference}g`}
                detail={`${selectedRun.auditEvent.variancePercent.toFixed(1)}% variance`}
              />
              <MetricBlock label="Triage" value={selectedRun.auditEvent.triageOutcome} detail={selectedRun.auditEvent.triageSource} />
            </div>

            <div className="stage-strip" aria-label="AuditEvent loop">
              <StageItem label="Order" value={selectedRun.orderId} />
              <StageItem label="Movement" value={selectedRun.movementId} />
              <StageItem label="AuditEvent" value={selectedRun.auditEvent.auditEventId} />
              <StageItem label="Triage" value={selectedRun.simulatedAgent.mode} />
              <StageItem label="Proof" value={selectedRun.proofRecord.auditProofStatus} />
            </div>

            <div className="next-action">
              <div>
                <span className="label">Current action</span>
                <h3>{selectedRun.simulatedAgent.headline}</h3>
                <p>{selectedRun.simulatedAgent.ownerMessage}</p>
              </div>
              <div className="proof-snapshot">
                <span className="status-pill" data-tone="info">{selectedRun.proofRecord.auditProofStatus}</span>
                <span className="status-pill" data-tone="warning">Storage {selectedRun.proofRecord.storageStatus}</span>
                <span className="status-pill" data-tone="warning">Chain {selectedRun.proofRecord.chainStatus}</span>
              </div>
              {actionAvailable ? (
                <div className="agent-actions">
                  {selectedRun.simulatedAgent.availableActions.map((action) => (
                    <button
                      key={action}
                      className="action-button"
                      disabled={isRunningAgentAction}
                      onClick={() => void handleAgentAction(action)}
                      type="button"
                    >
                      {renderAgentActionLabel(action)}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </section>

          <nav className="view-tabs" aria-label="Case detail views">
            <button data-active={activeView === 'evidence'} onClick={() => setActiveView('evidence')} type="button">
              Evidence
            </button>
            <button data-active={activeView === 'agent'} onClick={() => setActiveView('agent')} type="button">
              OpenClaw / Triage
            </button>
            <button data-active={activeView === 'proof'} onClick={() => setActiveView('proof')} type="button">
              Proof Status
            </button>
          </nav>

          {activeView === 'evidence' ? <EvidenceView selectedRun={selectedRun} movementDifference={movementDifference} /> : null}
          {activeView === 'agent' ? <AgentView selectedRun={selectedRun} /> : null}
          {activeView === 'proof' ? <ProofView selectedRun={selectedRun} /> : null}
        </section>
      </div>
    </main>
  );
}

function EvidenceView({ selectedRun, movementDifference }: { selectedRun: DashboardRun; movementDifference: number }) {
  return (
    <section className="detail-grid">
      <article className="panel">
        <h2>Business Intent</h2>
        <div className="panel-grid">
          <Kv label="Order ID" value={selectedRun.orderId} />
          <Kv label="Product" value={selectedRun.auditEvent.productName} />
          <Kv label="Quantity" value={selectedRun.auditEvent.orderQuantity} />
          <Kv label="Cashier" value={selectedRun.auditEvent.cashierName} />
          <Kv
            label="Expected usage"
            value={`${selectedRun.auditEvent.orderQuantity} x ${selectedRun.auditEvent.usageRuleGramsPerUnit}g = ${selectedRun.auditEvent.expectedUsageGrams}g`}
          />
          <Kv label="Audit window" value={`${selectedRun.evidenceWindowLabel} ICT`} />
        </div>
      </article>

      <article className="panel">
        <h2>Physical Movement</h2>
        <div className="panel-grid">
          <Kv label="Movement ID" value={selectedRun.movementId} />
          <Kv label="Item" value={selectedRun.auditEvent.inventoryItemName} />
          <Kv label="Container" value={selectedRun.auditEvent.containerId} />
          <Kv label="Handler" value={selectedRun.auditEvent.handlerName} />
          <Kv label="Before / after" value={`${selectedRun.movementBeforeGrams}g -> ${selectedRun.movementAfterGrams}g`} />
          <Kv label="Movement amount" value={`${selectedRun.auditEvent.actualMovementGrams}g OUT`} />
        </div>
      </article>

      <article className="panel detail-span">
        <h2>AuditEvent Reasoning</h2>
        <div className="panel-grid wide">
          <Kv label="AuditEvent ID" value={selectedRun.auditEvent.auditEventId} code />
          <Kv label="Case type" value={selectedRun.auditEvent.caseType} />
          <Kv label="Expected vs actual" value={`${selectedRun.auditEvent.expectedUsageGrams}g / ${selectedRun.auditEvent.actualMovementGrams}g`} />
          <Kv
            label="Difference / variance"
            value={`${movementDifference > 0 ? '+' : ''}${movementDifference}g / ${selectedRun.auditEvent.variancePercent.toFixed(1)}%`}
          />
          <Kv label="Recommended action" value={renderRecommendedAction(selectedRun.auditEvent.triageOutcome ?? TriageOutcome.AUTO_CLEAR)} />
          <Kv label="Created at" value={selectedRun.createdAtLabel} />
        </div>
      </article>
    </section>
  );
}

function AgentView({ selectedRun }: { selectedRun: DashboardRun }) {
  return (
    <section className="detail-grid">
      <article className="panel">
        <h2>Agent State</h2>
        <div className="panel-grid">
          <Kv label="Mode" value={selectedRun.simulatedAgent.mode} />
          <Kv label="State" value={selectedRun.simulatedAgent.status} />
          <Kv label="Triage outcome" value={selectedRun.auditEvent.triageOutcome} />
          <Kv label="Triage source" value={selectedRun.auditEvent.triageSource} />
          <Kv label="Transport" value="Dashboard simulation; no Telegram sent" />
          <Kv label="Owner state" value={selectedRun.ownerAlertState} />
        </div>
      </article>

      <article className="panel">
        <h2>Messages</h2>
        <div className="message-box">
          <span className="label">{selectedRun.simulatedAgent.headline}</span>
          <p>{selectedRun.simulatedAgent.ownerMessage}</p>
        </div>
        {selectedRun.simulatedAgent.staffMessage ? (
          <div className="message-box">
            <span className="label">Staff follow-up preview</span>
            <p style={{ whiteSpace: 'pre-line' }}>{selectedRun.simulatedAgent.staffMessage}</p>
            <small className="message-footnote">Preview only. It is not sent before owner approval.</small>
          </div>
        ) : null}
        {selectedRun.simulatedAgent.staffResponse ? (
          <div className="message-box">
            <span className="label">Simulated staff reply</span>
            <p>{selectedRun.simulatedAgent.staffResponse}</p>
          </div>
        ) : null}
        {selectedRun.simulatedAgent.finalDecision ? (
          <div className="message-box">
            <span className="label">Final owner decision</span>
            <p>{selectedRun.simulatedAgent.finalDecision}</p>
          </div>
        ) : null}
      </article>

      <article className="panel detail-span">
        <h2>Interaction Timeline</h2>
        <div className="timeline-list">
          {selectedRun.simulatedAgent.timeline.map((entry) => (
            <div key={entry.id} className="timeline-entry">
              <div>
                <strong>{entry.label}</strong>
                <p>{entry.detail}</p>
              </div>
              <span>
                {entry.actor} / {entry.createdAtLabel}
              </span>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}

function ProofView({ selectedRun }: { selectedRun: DashboardRun }) {
  return (
    <section className="detail-grid">
      <article className="panel detail-span">
        <h2>Proof Status</h2>
        <p className="panel-subtitle">{selectedRun.proofSummary}</p>
        <div className="panel-grid wide">
          <Kv label="Proof record ID" value={selectedRun.proofRecord.proofRecordId} />
          <Kv label="Proof type" value={selectedRun.proofRecord.proofType} />
          <Kv label="Audit proof status" value={selectedRun.proofRecord.auditProofStatus} />
          <Kv label="Storage status" value={selectedRun.proofRecord.storageStatus} />
          <Kv label="Chain status" value={selectedRun.proofRecord.chainStatus} />
          <Kv label="Local package hash" value={selectedRun.proofRecord.localPackageHash} code />
          <Kv label="0G Storage root" value={selectedRun.proofRecord.storageRootHash ?? 'Not started'} />
          <Kv label="0G Storage tx" value={selectedRun.proofRecord.storageTxHash ?? 'Not started'} />
          <Kv label="0G Chain tx" value={selectedRun.proofRecord.chainTxHash ?? 'Not registered'} />
          <Kv label="Retry state" value={selectedRun.proofRecord.retryState} />
        </div>
      </article>
      <article className="panel detail-span">
        <h2>Persistence Mode</h2>
        <p className="panel-subtitle">
          {selectedRun.persistence.label}. {selectedRun.persistence.detail}
        </p>
      </article>
    </section>
  );
}

function MetricBlock({ label, value, detail }: { label: string; value: string | null; detail: string }) {
  return (
    <div className="metric-block">
      <span className="label">{label}</span>
      <strong>{value}</strong>
      <small>{detail}</small>
    </div>
  );
}

function StageItem({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="stage-item">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function renderAgentActionLabel(action: SimulatedAgentAction): string {
  if (action === 'APPROVE_EXPLANATION_REQUEST') return 'Approve request';
  if (action === 'SEND_STAFF_MESSAGE') return 'Send simulated message';
  if (action === 'SIMULATE_STAFF_REPLY') return 'Simulate reply';
  if (action === 'RECORD_FINAL_DECISION') return 'Record final decision';
  if (action === 'SILENT_LOG_CASE') return 'Silent log';
  return 'Mark reviewed';
}

function Kv({ label, value, code = false }: { label: string; value: number | string | null; code?: boolean }) {
  return (
    <div className="kv-row">
      <strong>{label}</strong>
      {code ? <code className="hash-value">{value}</code> : <span>{value}</span>}
    </div>
  );
}

function HistoryCell({ title, detail }: { title: string | null; detail: string }) {
  return (
    <div className="history-cell">
      <strong>{title}</strong>
      <small>{detail}</small>
    </div>
  );
}

function renderRecommendedAction(triageOutcome: TriageOutcome): string {
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) return 'Auto-clear locally and keep the case in dashboard history.';
  if (triageOutcome === TriageOutcome.REQUEST_EXPLANATION) return 'Explanation requested after owner approval.';
  return 'Needs immediate owner or auditor review.';
}

function getScenarioTone(scenarioKey: ScenarioKeyType): 'success' | 'warning' | 'danger' {
  if (scenarioKey === ScenarioKey.STATE_A) return 'success';
  if (scenarioKey === ScenarioKey.STATE_C) return 'warning';
  return 'danger';
}

function getSeverityTone(severity: string): 'success' | 'warning' | 'danger' {
  if (severity === 'NORMAL') return 'success';
  if (severity === 'CRITICAL_REVIEW') return 'danger';
  return 'warning';
}
