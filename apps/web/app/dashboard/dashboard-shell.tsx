'use client';

import { useMemo, useState } from 'react';
import { demoScenarioSeeds, demoWorldSeed, ScenarioKey, TriageOutcome, type ScenarioKey as ScenarioKeyType } from '@arka/shared';
import {
  scenarioCards,
  type AdminSimulationInput,
  type DashboardRun,
  type RunScenarioResponse,
  type SimulatedAgentAction,
} from './dashboard-data';

type DashboardShellProps = {
  initialState: RunScenarioResponse;
};

type CaseView = 'run-movement' | 'order-evidence' | 'simulation' | 'proof';

export function DashboardShell({ initialState }: DashboardShellProps) {
  const [runs, setRuns] = useState<DashboardRun[]>(initialState.history);
  const [selectedCaseId, setSelectedCaseId] = useState(initialState.run.caseId);
  const [selectedScenarioKey, setSelectedScenarioKey] = useState<ScenarioKeyType>(initialState.run.scenario.scenarioKey);
  const [activeView, setActiveView] = useState<CaseView>('run-movement');
  const [autoRunProofFlow, setAutoRunProofFlow] = useState(false);
  const [adminOrderQuantity, setAdminOrderQuantity] = useState(String(initialState.run.auditEvent.orderQuantity));
  const [adminMovementGrams, setAdminMovementGrams] = useState(String(initialState.run.auditEvent.actualMovementGrams));
  const [manualStorageRootHash, setManualStorageRootHash] = useState(initialState.run.proofRecord.storageRootHash ?? '');
  const [isRunningScenario, setIsRunningScenario] = useState(false);
  const [isRunningAgentAction, setIsRunningAgentAction] = useState(false);
  const [isRunningAdminSimulation, setIsRunningAdminSimulation] = useState(false);
  const [isRunningProofStorage, setIsRunningProofStorage] = useState(false);
  const [isRunningProofRegistration, setIsRunningProofRegistration] = useState(false);
  const [runError, setRunError] = useState<string | null>(null);

  const selectedRun = useMemo(() => {
    return runs.find((run) => run.caseId === selectedCaseId) ?? runs[0];
  }, [runs, selectedCaseId]);

  function applyRunResult(result: RunScenarioResponse, nextView: CaseView) {
    setRuns(result.history);
    setSelectedCaseId(result.run.caseId);
    setSelectedScenarioKey(result.run.scenario.scenarioKey);
    setAdminOrderQuantity(String(result.run.auditEvent.orderQuantity));
    setAdminMovementGrams(String(result.run.auditEvent.actualMovementGrams));
    setManualStorageRootHash(result.run.proofRecord.storageRootHash ?? '');
    setActiveView(nextView);
  }

  async function runAutoProofForCase(caseId: string) {
    setIsRunningProofStorage(true);
    setRunError(null);

    try {
      const storageResponse = await fetch('/api/demo/proof/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caseId }),
      });

      const storagePayload = (await storageResponse.json().catch(() => null)) as
        | ({ error?: string } & RunScenarioResponse)
        | null;

      if (storagePayload?.run && storagePayload.history) {
        applyRunResult(storagePayload as RunScenarioResponse, 'proof');
      }

      if (!storageResponse.ok) {
        throw new Error(storagePayload?.error ?? `Proof upload failed with HTTP ${storageResponse.status}`);
      }

      const storageResult = storagePayload as RunScenarioResponse;
      setIsRunningProofStorage(false);
      setIsRunningProofRegistration(true);

      const registerResponse = await fetch('/api/demo/proof/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: storageResult.run.caseId,
          storageRootHash: storageResult.run.proofRecord.storageRootHash ?? null,
        }),
      });

      const registerPayload = (await registerResponse.json().catch(() => null)) as
        | ({ error?: string } & RunScenarioResponse)
        | null;

      if (registerPayload?.run && registerPayload.history) {
        applyRunResult(registerPayload as RunScenarioResponse, 'proof');
      }

      if (!registerResponse.ok) {
        throw new Error(registerPayload?.error ?? `Proof registration failed with HTTP ${registerResponse.status}`);
      }
    } finally {
      setIsRunningProofStorage(false);
      setIsRunningProofRegistration(false);
    }
  }

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
      applyRunResult(
        result,
        result.run.auditEvent.triageOutcome === TriageOutcome.AUTO_CLEAR ? 'order-evidence' : 'simulation',
      );

      if (autoRunProofFlow) {
        await runAutoProofForCase(result.run.caseId);
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Scenario route failed.');
    } finally {
      setIsRunningScenario(false);
    }
  }

  async function handleAdminSimulation(input: AdminSimulationInput) {
    setIsRunningAdminSimulation(true);
    setRunError(null);

    try {
      const response = await fetch('/api/demo/admin-movement', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(input),
      });

      if (!response.ok) {
        const errorBody = (await response.json().catch(() => null)) as { error?: string } | null;
        throw new Error(errorBody?.error ?? `Movement simulation failed with HTTP ${response.status}`);
      }

      const result = (await response.json()) as RunScenarioResponse;
      applyRunResult(
        result,
        result.run.auditEvent.triageOutcome === TriageOutcome.AUTO_CLEAR ? 'order-evidence' : 'simulation',
      );

      if (autoRunProofFlow) {
        await runAutoProofForCase(result.run.caseId);
      }
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Movement simulation failed.');
    } finally {
      setIsRunningAdminSimulation(false);
    }
  }

  function handleAdminSubmit() {
    const orderQuantity = Number(adminOrderQuantity);
    const actualMovementGrams = Number(adminMovementGrams);

    if (!Number.isInteger(orderQuantity) || !Number.isInteger(actualMovementGrams)) {
      setRunError('Order quantity and movement grams must be whole numbers.');
      return;
    }

    void handleAdminSimulation({
      orderQuantity,
      actualMovementGrams,
    });
  }

  function handleSelectRun(run: DashboardRun) {
    setSelectedCaseId(run.caseId);
    setSelectedScenarioKey(run.scenario.scenarioKey);
    setAdminOrderQuantity(String(run.auditEvent.orderQuantity));
    setAdminMovementGrams(String(run.auditEvent.actualMovementGrams));
    setManualStorageRootHash(run.proofRecord.storageRootHash ?? '');
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
      applyRunResult(result, 'simulation');
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Agent simulation failed.');
    } finally {
      setIsRunningAgentAction(false);
    }
  }

  async function handleProofRegistration() {
    setIsRunningProofRegistration(true);
    setRunError(null);

    try {
      const response = await fetch('/api/demo/proof/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedRun.caseId,
          storageRootHash: manualStorageRootHash.trim() || null,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ({ error?: string } & RunScenarioResponse)
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? `Proof registration failed with HTTP ${response.status}`);
      }

      const result = payload as RunScenarioResponse;
      applyRunResult(result, 'proof');
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Proof registration failed.');
    } finally {
      setIsRunningProofRegistration(false);
    }
  }

  async function handleProofStorageUpload() {
    setIsRunningProofStorage(true);
    setRunError(null);

    try {
      const response = await fetch('/api/demo/proof/store', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caseId: selectedRun.caseId,
        }),
      });

      const payload = (await response.json().catch(() => null)) as
        | ({ error?: string } & RunScenarioResponse)
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? `Proof upload failed with HTTP ${response.status}`);
      }

      const result = payload as RunScenarioResponse;
      applyRunResult(result, 'proof');
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Proof upload failed.');
    } finally {
      setIsRunningProofStorage(false);
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
          <p className="eyebrow">ARKA Operator Console</p>
          <h1>Reconcile intent vs reality.</h1>
          <p>
            Protein Shake demo: 3 orders = 90g expected Whey Protein usage. Run movements to see how ARKA reconciles differences, assigns triage outcomes, and tracks local proofs.
          </p>
        </div>
        <div className="status-stack">
          <span className="chip" data-tone="info">API route - LOCAL</span>
          <span className="chip" data-tone="warning">DB - {selectedRun.persistence.mode}</span>
          <span className="chip" data-tone="warning">Agent - SIMULATED</span>
        </div>
      </header>

      <div className="audit-workspace">
        <aside className="scenario-rail">
          <section className="panel">
            <h2>Scenario Control</h2>
            <p className="panel-subtitle">
              {demoWorldSeed.productName} uses {demoWorldSeed.usageRule.gramsPerUnit}g {demoWorldSeed.inventoryItemName}.
            </p>
            <div className="scenario-dropdown-box">
              <label className="label">Select Scenario</label>
              <div className="scenario-select-row">
                <select 
                  className="scenario-select"
                  disabled={
                    isRunningScenario ||
                    isRunningAdminSimulation ||
                    isRunningAgentAction ||
                    isRunningProofStorage ||
                    isRunningProofRegistration
                  }
                  onChange={(e) => {
                    setSelectedScenarioKey(e.target.value as ScenarioKeyType);
                  }}
                  value={selectedScenarioKey}
                >
                  {scenarioCards.map((card) => (
                    <option key={card.key} value={card.key}>
                      {card.title}
                    </option>
                  ))}
                </select>
                <button 
                  className="action-button primary-action compact"
                  disabled={
                    isRunningScenario ||
                    isRunningAdminSimulation ||
                    isRunningAgentAction ||
                    isRunningProofStorage ||
                    isRunningProofRegistration
                  }
                  onClick={() => void handleRunScenario(selectedScenarioKey)}
                  type="button"
                >
                  Run
                </button>
              </div>
              <label className="auto-proof-toggle">
                <input
                  checked={autoRunProofFlow}
                  disabled={
                    isRunningScenario ||
                    isRunningAdminSimulation ||
                    isRunningAgentAction ||
                    isRunningProofStorage ||
                    isRunningProofRegistration
                  }
                  onChange={(e) => setAutoRunProofFlow(e.target.checked)}
                  type="checkbox"
                />
                <div>
                  <span className="label">Auto-run 0G proof flow</span>
                  <p className="toggle-copy">
                    After each new case, upload to 0G Storage and then register on 0G Chain automatically.
                  </p>
                </div>
              </label>
              <div className="scenario-preview-box">
                <span className="scenario-title">{scenarioCards.find(c => c.key === selectedScenarioKey)?.title}</span>
                <p className="scenario-line">Expected result: {scenarioCards.find(c => c.key === selectedScenarioKey)?.expectedOutcome}</p>
                <p className="scenario-line">Triage: {scenarioCards.find(c => c.key === selectedScenarioKey)?.triagePath}</p>
              </div>
            </div>
            {runError ? <p className="error-text">{runError}</p> : null}
          </section>

          <section className="panel">
            <h2>Case History</h2>
            <div className="history-scroll-box">
              <div className="history-list compact">
                {runs.map((run) => (
                  <button
                    key={run.caseId}
                    className="history-button"
                    data-active={run.caseId === selectedRun.caseId}
                    onClick={() => handleSelectRun(run)}
                    type="button"
                  >
                    <HistoryCell
                      title={run.caseId}
                      detail={`${run.scenario.scenarioKey} / ${run.auditEvent.severity} / ${run.proofRecord.auditProofStatus}`}
                    />
                  </button>
                ))}
              </div>
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
              <MetricBlock label="Expected" value={`${selectedRun.auditEvent.expectedUsageGrams}g`} detail={`${selectedRun.auditEvent.orderQuantity} shakes x ${demoWorldSeed.usageRule.gramsPerUnit}g`} />
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
                <span className="label">Next Action / Review</span>
                <h3>{selectedRun.simulatedAgent.headline}</h3>
                <p>{selectedRun.simulatedAgent.ownerMessage}</p>
              </div>
              <div className="proof-snapshot">
                <span className="status-pill" data-tone="info">Proof: {selectedRun.proofRecord.auditProofStatus}</span>
                <span className="status-pill" data-tone="warning">Storage: {selectedRun.proofRecord.storageStatus}</span>
                <span className="status-pill" data-tone="warning">Chain: {selectedRun.proofRecord.chainStatus}</span>
                <span className="status-pill" data-tone="info">Hash: {selectedRun.proofRecord.localPackageHash ? `${selectedRun.proofRecord.localPackageHash.substring(0, 10)}...` : 'N/A'}</span>
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
            <button data-active={activeView === 'run-movement'} onClick={() => setActiveView('run-movement')} type="button">
              Run Movement
            </button>
            <button data-active={activeView === 'order-evidence'} onClick={() => setActiveView('order-evidence')} type="button">
              Order & Evidence
            </button>
            <button data-active={activeView === 'simulation'} onClick={() => setActiveView('simulation')} type="button">
              Simulation
            </button>
            <button data-active={activeView === 'proof'} onClick={() => setActiveView('proof')} type="button">
              Proof Status
            </button>
          </nav>

          {activeView === 'run-movement' ? (
            <AdminSimulationView
              adminMovementGrams={adminMovementGrams}
              adminOrderQuantity={adminOrderQuantity}
              isRunning={isRunningAdminSimulation}
              onMovementChange={setAdminMovementGrams}
              onOrderChange={setAdminOrderQuantity}
              onPresetRun={(input) => void handleAdminSimulation(input)}
              onSubmit={handleAdminSubmit}
            />
          ) : null}
          {activeView === 'order-evidence' ? <EvidenceView selectedRun={selectedRun} movementDifference={movementDifference} /> : null}
          {activeView === 'simulation' ? <AgentView selectedRun={selectedRun} /> : null}
          {activeView === 'proof' ? (
            <ProofView
              isRunningProofStorage={isRunningProofStorage}
              isRunningProofRegistration={isRunningProofRegistration}
              manualStorageRootHash={manualStorageRootHash}
              onManualStorageRootHashChange={setManualStorageRootHash}
              onStoreProof={() => void handleProofStorageUpload()}
              onRegisterProof={() => void handleProofRegistration()}
              selectedRun={selectedRun}
            />
          ) : null}
        </section>
      </div>
    </main>
  );
}

function AdminSimulationView({
  adminMovementGrams,
  adminOrderQuantity,
  isRunning,
  onMovementChange,
  onOrderChange,
  onPresetRun,
  onSubmit,
}: {
  adminMovementGrams: string;
  adminOrderQuantity: string;
  isRunning: boolean;
  onMovementChange: (value: string) => void;
  onOrderChange: (value: string) => void;
  onPresetRun: (input: AdminSimulationInput) => void;
  onSubmit: () => void;
}) {
  const orderQuantity = Number(adminOrderQuantity);
  const actualMovementGrams = Number(adminMovementGrams);
  const expectedUsageGrams = Number.isFinite(orderQuantity) ? orderQuantity * demoWorldSeed.usageRule.gramsPerUnit : 0;
  const difference = Number.isFinite(actualMovementGrams) ? actualMovementGrams - expectedUsageGrams : 0;

  return (
    <section className="detail-grid">
      <article className="panel">
        <h2>Manual Override</h2>
        <p className="panel-subtitle">Input custom quantity and movement, then run reconciliation to see triage outcome.</p>
        <div className="admin-form">
          <label>
            <span className="label">Protein Shake quantity</span>
            <input
              min="1"
              max="20"
              onChange={(event) => onOrderChange(event.target.value)}
              type="number"
              value={adminOrderQuantity}
            />
          </label>
          <label>
            <span className="label">Whey Protein OUT grams</span>
            <input
              min="0"
              max="1000"
              onChange={(event) => onMovementChange(event.target.value)}
              type="number"
              value={adminMovementGrams}
            />
          </label>
          <button className="action-button primary-action" disabled={isRunning} onClick={onSubmit} type="button">
            Run movement simulation
          </button>
        </div>
        <div className="admin-presets">
          <button disabled={isRunning} onClick={() => onPresetRun({ orderQuantity: 3, actualMovementGrams: 90 })} type="button">
            Run clear
          </button>
          <button disabled={isRunning} onClick={() => onPresetRun({ orderQuantity: 3, actualMovementGrams: 99 })} type="button">
            Run explanation
          </button>
          <button disabled={isRunning} onClick={() => onPresetRun({ orderQuantity: 3, actualMovementGrams: 160 })} type="button">
            Run critical review
          </button>
        </div>
      </article>

      <article className="panel">
        <h2>Movement Preview</h2>
        <p className="panel-subtitle">Review before running simulation.</p>
        <div className="panel-grid">
          <Kv label="Usage rule" value={`1 ${demoWorldSeed.productName} = ${demoWorldSeed.usageRule.gramsPerUnit}g`} />
          <Kv label="Expected usage" value={`${expectedUsageGrams}g`} />
          <Kv label="Movement OUT" value={`${Number.isFinite(actualMovementGrams) ? actualMovementGrams : 0}g`} />
          <Kv label="Difference" value={`${difference > 0 ? '+' : ''}${difference}g`} />
          <Kv label="Handler" value={demoWorldSeed.handler.name} />
          <Kv label="Container" value={demoWorldSeed.containerId} />
        </div>
      </article>
    </section>
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
        <h2>Simulation State</h2>
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

function ProofView({
  selectedRun,
  manualStorageRootHash,
  onManualStorageRootHashChange,
  onStoreProof,
  onRegisterProof,
  isRunningProofStorage,
  isRunningProofRegistration,
}: {
  selectedRun: DashboardRun;
  manualStorageRootHash: string;
  onManualStorageRootHashChange: (value: string) => void;
  onStoreProof: () => void;
  onRegisterProof: () => void;
  isRunningProofStorage: boolean;
  isRunningProofRegistration: boolean;
}) {
  const chainAlreadyRegistered = Boolean(selectedRun.proofRecord.chainTxHash);
  const storageAlreadyUploaded = Boolean(selectedRun.proofRecord.storageTxHash && selectedRun.proofRecord.storageRootHash);
  const proofIsFullyVerified = storageAlreadyUploaded && chainAlreadyRegistered;
  const storageExplorerUrl = getZeroGExplorerUrl(selectedRun.proofRecord.storageTxHash);
  const chainExplorerUrl = getZeroGExplorerUrl(selectedRun.proofRecord.chainTxHash);

  return (
    <section className="detail-grid">
      <article className="panel detail-span">
        <h2>Local Proof Package</h2>
        <p className="panel-subtitle">{selectedRun.proofSummary}</p>
        {proofIsFullyVerified ? (
          <div className="proof-verification-card">
            <div>
              <span className="label">Verified Web3 proof</span>
              <h3>Stored on 0G and anchored on 0G Chain</h3>
              <p>
                This case now has a real storage transaction hash, a real storage root hash, and a real on-chain proof anchor.
              </p>
            </div>
            <div className="proof-snapshot">
              <span className="status-pill" data-tone="success">Proof: REAL</span>
              <span className="status-pill" data-tone="success">Storage: VERIFIED</span>
              <span className="status-pill" data-tone="success">Chain: VERIFIED</span>
            </div>
            <div className="proof-link-row">
              {storageExplorerUrl ? (
                <a className="proof-link" href={storageExplorerUrl} rel="noreferrer" target="_blank">
                  Open storage tx
                </a>
              ) : null}
              {chainExplorerUrl ? (
                <a className="proof-link" href={chainExplorerUrl} rel="noreferrer" target="_blank">
                  Open chain tx
                </a>
              ) : null}
            </div>
          </div>
        ) : null}
        <div className="panel-grid wide">
          <Kv label="Proof record ID" value={selectedRun.proofRecord.proofRecordId} />
          <Kv label="Proof type" value={selectedRun.proofRecord.proofType} />
          <Kv
            label="Audit proof status"
            value={selectedRun.proofRecord.auditProofStatus}
            tone={getProofTone(selectedRun.proofRecord.auditProofStatus)}
          />
          <Kv
            label="Storage status"
            value={selectedRun.proofRecord.storageStatus}
            tone={getStorageTone(selectedRun.proofRecord.storageStatus)}
          />
          <Kv
            label="Chain status"
            value={selectedRun.proofRecord.chainStatus}
            tone={getChainTone(selectedRun.proofRecord.chainStatus)}
          />
          <Kv label="Local package hash" value={selectedRun.proofRecord.localPackageHash} code />
          <Kv label="0G Storage root" value={selectedRun.proofRecord.storageRootHash ?? 'Not started'} />
          <Kv
            label="0G Storage tx"
            value={selectedRun.proofRecord.storageTxHash ?? 'Not started'}
            href={storageExplorerUrl}
            linkLabel="Open explorer"
          />
          <Kv
            label="0G Chain tx"
            value={selectedRun.proofRecord.chainTxHash ?? 'Not registered'}
            href={chainExplorerUrl}
            linkLabel="Open explorer"
          />
          <Kv label="Retry state" value={selectedRun.proofRecord.retryState} />
        </div>
      </article>
      <article className="panel detail-span">
        <h2>0G Storage Upload</h2>
        <p className="panel-subtitle">
          Upload the canonical proof JSON to 0G Storage first. This should produce the real storage root hash that the chain anchor
          step uses next.
        </p>
        <div className="admin-form">
          <button
            className="action-button primary-action"
            disabled={isRunningProofStorage || storageAlreadyUploaded}
            onClick={onStoreProof}
            type="button"
          >
            {storageAlreadyUploaded ? 'Already uploaded to 0G Storage' : 'Upload proof to 0G Storage'}
          </button>
        </div>
      </article>
      <article className="panel detail-span">
        <h2>0G Chain Registration</h2>
        <p className="panel-subtitle">
          Register the proof on 0G Chain using the stored root hash. If upload did not run in-app, you can still paste a real
          external root hash manually.
        </p>
        <div className="admin-form">
          <label>
            <span className="label">External 0G storage root hash</span>
            <input
              onChange={(event) => onManualStorageRootHashChange(event.target.value)}
              placeholder="Paste a real 0G storage root hash"
              type="text"
              value={manualStorageRootHash}
            />
          </label>
          <button
            className="action-button primary-action"
            disabled={isRunningProofRegistration || chainAlreadyRegistered}
            onClick={onRegisterProof}
            type="button"
          >
            {chainAlreadyRegistered ? 'Already registered on 0G Chain' : 'Register proof on 0G Chain'}
          </button>
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

function Kv({
  label,
  value,
  code = false,
  href,
  linkLabel,
  tone,
}: {
  label: string;
  value: number | string | null;
  code?: boolean;
  href?: string | null;
  linkLabel?: string;
  tone?: 'success' | 'warning' | 'danger' | 'info';
}) {
  return (
    <div className="kv-row">
      <strong>{label}</strong>
      <div className="kv-value-stack">
        {tone ? <span className="status-pill" data-tone={tone}>{value}</span> : null}
        {code ? <code className="hash-value">{value}</code> : tone ? null : <span>{value}</span>}
        {href ? (
          <a className="proof-link" href={href} rel="noreferrer" target="_blank">
            {linkLabel ?? 'Open'}
          </a>
        ) : null}
      </div>
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
  if (triageOutcome === TriageOutcome.AUTO_CLEAR) return 'Auto-clear locally and keep the case in history.';
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

function getProofTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'REGISTERED_ON_CHAIN') return 'success';
  if (status === 'STORED_ON_0G') return 'info';
  return 'warning';
}

function getStorageTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'STORED') return 'success';
  if (status === 'FAILED_TO_STORE') return 'danger';
  return 'warning';
}

function getChainTone(status: string): 'success' | 'warning' | 'danger' | 'info' {
  if (status === 'ANCHOR_CONFIRMED') return 'success';
  if (status === 'FAILED_TO_REGISTER') return 'danger';
  return 'warning';
}

function getZeroGExplorerUrl(txHash: string | null): string | null {
  const trimmed = txHash?.trim();
  if (!trimmed) {
    return null;
  }

  return `https://chainscan-galileo.0g.ai/tx/${trimmed}`;
}
