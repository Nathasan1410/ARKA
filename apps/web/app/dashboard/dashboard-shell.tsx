'use client';

import { useMemo, useState } from 'react';
import { demoScenarioSeeds, demoWorldSeed, ScenarioKey, TriageOutcome, type ScenarioKey as ScenarioKeyType } from '@arka/shared';
import { scenarioCards, type DashboardRun, type RunScenarioResponse, type SimulatedAgentAction } from './dashboard-data';

type DashboardShellProps = {
  initialState: RunScenarioResponse;
};

export function DashboardShell({ initialState }: DashboardShellProps) {
  const [runs, setRuns] = useState<DashboardRun[]>(initialState.history);
  const [selectedCaseId, setSelectedCaseId] = useState(initialState.run.caseId);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ scenarioKey }),
      });

      if (!response.ok) {
        throw new Error(`Scenario route failed with HTTP ${response.status}`);
      }

      const result = (await response.json()) as RunScenarioResponse;
      setRuns(result.history);
      setSelectedCaseId(result.run.caseId);
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
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ caseId: selectedRun.caseId, action }),
      });

      if (!response.ok) {
        throw new Error(`Agent simulation failed with HTTP ${response.status}`);
      }

      const result = (await response.json()) as RunScenarioResponse;
      setRuns(result.history);
      setSelectedCaseId(result.run.caseId);
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Agent simulation failed.');
    } finally {
      setIsRunningAgentAction(false);
    }
  }

  if (!selectedRun) {
    return (
      <main className="app-shell">
        <section className="panel span-12">
          <h1>Dashboard unavailable</h1>
          <p className="panel-subtitle">No local scenario run could be loaded.</p>
        </section>
      </main>
    );
  }

  const movementDifference = selectedRun.auditEvent.actualMovementGrams - selectedRun.auditEvent.expectedUsageGrams;

  return (
    <main className="app-shell">
      <header className="topbar">
        <div>
          <p className="eyebrow">ARKA - Audit Arena</p>
          <h1>AuditEvent dashboard MVP</h1>
          <p>
            Scenario cards now call a local backend route that creates order, movement, AuditEvent, deterministic
            fallback triage, and a local proof record. Real OpenClaw runtime, Telegram delivery, 0G upload, and chain
            calls are still not connected.
          </p>
        </div>
        <div className="status-stack">
          <span className="chip" data-tone="info">
            Dashboard UI - PARTIAL
          </span>
          <span className="chip" data-tone="info">
            API route - LOCAL
          </span>
          <span className="chip" data-tone="warning">
            DB - {selectedRun.persistence.mode}
          </span>
          <span className="chip" data-tone="warning">
            OpenClaw - FALLBACK_ONLY
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
            const cardScenario = demoScenarioSeeds[card.key];
            const cardDifference = cardScenario.actualMovementGrams - cardScenario.expectedUsageGrams;

            return (
              <button
                key={card.key}
                className="scenario-button"
                data-active={scenarioIsSelected}
                disabled={isRunningScenario}
                onClick={() => void handleRunScenario(card.key)}
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
                  <ScenarioMetric label="Expected result" value={card.expectedOutcome} />
                  <ScenarioMetric label="Proof path" value={card.proofPath} />
                  <ScenarioMetric label="Expected usage" value={`${cardScenario.expectedUsageGrams}g whey`} />
                  <ScenarioMetric label="Actual movement" value={`${cardScenario.actualMovementGrams}g OUT`} />
                  <ScenarioMetric
                    label="Difference"
                    value={`${cardDifference > 0 ? '+' : ''}${cardDifference}g / ${cardScenario.variancePercent.toFixed(1)}%`}
                  />
                  <ScenarioMetric label="Triage" value={card.triagePath} />
                </div>
              </button>
            );
          })}
        </div>

        {runError ? <p className="error-text">{runError}</p> : null}
      </section>

      <div className="dashboard-grid">
        <section className="panel span-4">
          <h2>Order Panel</h2>
          <p className="panel-subtitle">Business intent created by the local scenario route.</p>
          <div className="panel-grid">
            <Kv label="Order ID" value={selectedRun.orderId} />
            <Kv label="Product" value={selectedRun.auditEvent.productName} />
            <Kv label="Quantity" value={selectedRun.auditEvent.orderQuantity} />
            <Kv label="Cashier" value={selectedRun.auditEvent.cashierName} />
            <Kv
              label="Expected usage"
              value={`${selectedRun.auditEvent.orderQuantity} x ${selectedRun.auditEvent.usageRuleGramsPerUnit}g = ${selectedRun.auditEvent.expectedUsageGrams}g ${selectedRun.auditEvent.inventoryItemName}`}
            />
            <Kv label="Audit window" value={selectedRun.evidenceWindowLabel} />
          </div>
        </section>

        <section className="panel span-4">
          <h2>Movement Panel</h2>
          <p className="panel-subtitle">Physical movement created by the local scenario route.</p>
          <div className="panel-grid">
            <Kv label="Movement ID" value={selectedRun.movementId} />
            <Kv label="Inventory item" value={selectedRun.auditEvent.inventoryItemName} />
            <Kv label="Container" value={selectedRun.auditEvent.containerId} />
            <Kv label="Handler" value={selectedRun.auditEvent.handlerName} />
            <Kv label="Movement" value={`${selectedRun.auditEvent.actualMovementGrams}g OUT`} />
            <Kv label="Before / after" value={`${selectedRun.movementBeforeGrams}g -> ${selectedRun.movementAfterGrams}g`} />
            <Kv label="Movement time" value={`${selectedRun.movementTimestampLabel} ICT`} />
          </div>
        </section>

        <section className="panel span-4">
          <h2>Proof Panel</h2>
          <p className="panel-subtitle">Local proof record only; no 0G integrations run here.</p>
          <div className="panel-grid">
            <Kv label="Proof record ID" value={selectedRun.proofRecord.proofRecordId} />
            <Kv label="Audit proof status" value={selectedRun.proofRecord.auditProofStatus} />
            <Kv label="Storage status" value={selectedRun.proofRecord.storageStatus} />
            <Kv label="Chain status" value={selectedRun.proofRecord.chainStatus} />
            <Kv label="Local package hash" value={selectedRun.proofRecord.localPackageHash} code />
            <Kv label="0G Storage root" value={selectedRun.proofRecord.storageRootHash ?? 'Not started'} />
            <Kv label="0G Storage tx" value={selectedRun.proofRecord.storageTxHash ?? 'Not started'} />
            <Kv label="0G Chain tx" value={selectedRun.proofRecord.chainTxHash ?? 'Not registered'} />
            <Kv label="Failure state" value={selectedRun.proofRecord.failureState} />
            <Kv label="Retry state" value={selectedRun.proofRecord.retryState} />
          </div>
          <div className="note-block">
            <p>{selectedRun.proofSummary}</p>
          </div>
        </section>

        <section className="panel span-8">
          <h2>AuditEvent Detail</h2>
          <p className="panel-subtitle">Selected case reasoning from order intent to local audit result.</p>
          <div className="panel-grid">
            <Kv label="AuditEvent ID" value={selectedRun.auditEvent.auditEventId} code />
            <Kv label="Case ID" value={selectedRun.auditEvent.caseId} code />
            <Kv label="Scenario" value={selectedRun.auditEvent.scenarioKey} />
            <Kv label="Case type" value={selectedRun.auditEvent.caseType} />
            <Kv label="Status" value={selectedRun.auditEvent.status} />
            <Kv label="Severity" value={selectedRun.auditEvent.severity} />
            <Kv
              label="Expected vs actual"
              value={`${selectedRun.auditEvent.expectedUsageGrams}g expected / ${selectedRun.auditEvent.actualMovementGrams}g actual`}
            />
            <Kv
              label="Usage formula"
              value={`${selectedRun.auditEvent.orderQuantity} ${selectedRun.auditEvent.productName}s x ${selectedRun.auditEvent.usageRuleGramsPerUnit}g = ${selectedRun.auditEvent.expectedUsageGrams}g`}
            />
            <Kv
              label="Difference / variance"
              value={`${movementDifference > 0 ? '+' : ''}${movementDifference}g - ${selectedRun.auditEvent.variancePercent.toFixed(1)}%`}
            />
            <Kv
              label="People context"
              value={`Handler ${selectedRun.auditEvent.handlerName} - Cashier ${selectedRun.auditEvent.cashierName} - Owner ${selectedRun.auditEvent.ownerName}`}
            />
            <Kv label="Created at" value={selectedRun.createdAtLabel} />
            <Kv label="Evidence window" value={`${selectedRun.evidenceWindowLabel} ICT`} />
            <Kv
              label="Recommended action"
              value={renderRecommendedAction(selectedRun.auditEvent.triageOutcome ?? TriageOutcome.AUTO_CLEAR)}
            />
          </div>
        </section>

        <section className="panel span-4">
          <h2>Agent / Telegram Panel</h2>
          <p className="panel-subtitle">
            Dashboard simulation is active. Real OpenClaw runtime and Telegram delivery remain unverified.
          </p>
          <div className="panel-grid">
            <Kv label="Triage outcome" value={selectedRun.auditEvent.triageOutcome} />
            <Kv label="Triage source" value={selectedRun.auditEvent.triageSource} />
            <Kv label="Simulation state" value={selectedRun.simulatedAgent.status} />
            <Kv label="Owner state" value={selectedRun.ownerAlertState} />
            <Kv label="Owner recommendation" value={selectedRun.ownerRecommendation} />
            <Kv label="Action log" value={selectedRun.actionLog} />
            <Kv label="Case note" value={selectedRun.caseNote} />
            <Kv label="Transport" value="Dashboard simulation only; no Telegram message sent" />
          </div>
          <div className="note-block">
            <p>{selectedRun.triageRuntimeSummary}</p>
          </div>
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
          {selectedRun.simulatedAgent.availableActions.length > 0 ? (
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
        </section>

        <section className="panel span-12">
          <h2>Simulated Agent Timeline</h2>
          <p className="panel-subtitle">
            Local dashboard-only interaction log. It does not send Telegram messages and does not prove real OpenClaw
            gateway behavior.
          </p>
          <div className="timeline-list">
            {selectedRun.simulatedAgent.timeline.map((entry) => (
              <div key={entry.id} className="timeline-entry">
                <div>
                  <strong>{entry.label}</strong>
                  <p>{entry.detail}</p>
                </div>
                <span>
                  {entry.actor} · {entry.createdAtLabel}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="panel span-12">
          <h2>AuditEvent History</h2>
          <p className="panel-subtitle">
            {selectedRun.persistence.label}. {selectedRun.persistence.detail}
          </p>
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
                  <HistoryCell title={run.caseId} detail={run.scenario.label} />
                  <HistoryCell title={run.auditEvent.status} detail={run.auditEvent.severity} />
                  <HistoryCell title={run.auditEvent.triageOutcome} detail={run.ownerAlertState} />
                  <HistoryCell
                    title={run.proofRecord.auditProofStatus}
                    detail={`${run.proofRecord.storageStatus} / ${run.proofRecord.chainStatus}`}
                  />
                  <HistoryCell title={run.createdAtLabel} detail={`Handler ${run.auditEvent.handlerName}`} />
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

function renderAgentActionLabel(action: SimulatedAgentAction): string {
  if (action === 'APPROVE_EXPLANATION_REQUEST') {
    return 'Approve explanation request';
  }

  if (action === 'SEND_STAFF_MESSAGE') {
    return 'Simulate sending staff message';
  }

  if (action === 'SIMULATE_STAFF_REPLY') {
    return 'Simulate staff reply';
  }

  if (action === 'RECORD_FINAL_DECISION') {
    return 'Record final owner decision';
  }

  if (action === 'SILENT_LOG_CASE') {
    return 'Silent log case';
  }

  return 'Mark owner reviewed';
}

function ScenarioMetric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="label">{label}</span>
      <span className="value">{value}</span>
    </div>
  );
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
