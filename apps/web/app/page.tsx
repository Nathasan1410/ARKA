import Link from 'next/link';
import type { ReactNode } from 'react';

const proofStatuses = [
  {
    label: 'AuditEvent generation',
    status: 'PARTIAL',
    detail: 'A/C/D demo cases create order-linked AuditEvents through the local Next.js flow.',
  },
  {
    label: 'OpenClaw triage',
    status: 'PARTIAL',
    detail: 'Deterministic fallback is active; local fork, skill loading, plugin load, and one model inference smoke are verified.',
  },
  {
    label: '0G Storage',
    status: 'REAL',
    detail: 'A live proof package upload has been verified through the dashboard proof service.',
  },
  {
    label: '0G Chain',
    status: 'REAL',
    detail: 'AuditProofRegistry anchoring is verified on 0G Galileo Testnet.',
  },
];

const architectureLayers = [
  {
    layer: 'Backend',
    role: 'Creates AuditEvent',
    copy: 'Calculates expected usage, actual movement, variance, status, severity, and recommended action.',
  },
  {
    layer: 'Database',
    role: 'Stores evidence',
    copy: 'Keeps operational evidence and ProofRecord metadata fast and local to the app workflow.',
  },
  {
    layer: 'OpenClaw',
    role: 'Layer-1 triage',
    copy: 'Operates on AuditEvent facts and appends owner-safe recommendations without rewriting reconciliation truth.',
  },
  {
    layer: 'Dashboard',
    role: 'Layer-2 investigation',
    copy: 'Shows scenario runs, expected-vs-actual comparison, triage state, and proof lifecycle in one console.',
  },
  {
    layer: '0G Storage',
    role: 'Sealed packages',
    copy: 'Stores selected redacted proof packages for important cases, not daily operational queries.',
  },
  {
    layer: '0G Chain',
    role: 'Proof anchors',
    copy: 'Registers compact anchors that point to 0G Storage packages without putting private case data on-chain.',
  },
];

const scenarioCards = [
  {
    state: 'State A',
    title: 'Clear usage',
    expected: '90g expected',
    actual: '90g recorded',
    outcome: 'AUTO_CLEAR',
    copy: 'Shows ARKA does not interrupt the owner when business intent and physical movement match.',
  },
  {
    state: 'State C',
    title: 'Request explanation',
    expected: '90g expected',
    actual: '99g recorded',
    outcome: 'REQUEST_EXPLANATION',
    copy: 'Creates a moderate review case and prepares an owner-approved clarification request.',
  },
  {
    state: 'State D',
    title: 'Critical review',
    expected: '90g expected',
    actual: '160g recorded',
    outcome: 'ESCALATE',
    copy: 'Raises an immediate review case when movement is materially above the expected range.',
  },
];

const proofSteps = [
  'AuditEvent created',
  'Proof package canonicalized',
  '0G Storage root returned',
  'AuditProofRegistry anchor written',
];

const navItems = [
  { href: '#architecture', label: 'Architecture' },
  { href: '#demo', label: 'Demo' },
  { href: '#truth', label: 'Status' },
];

function NeuLink({
  href,
  children,
  variant = 'secondary',
}: {
  href: string;
  children: ReactNode;
  variant?: 'primary' | 'secondary';
}) {
  const primary =
    'bg-neu-accent !text-white shadow-[9px_9px_16px_rgb(163,177,198,0.6),-9px_-9px_16px_rgba(255,255,255,0.5)] active:shadow-[inset_4px_4px_8px_rgba(25,20,95,0.28),inset_-4px_-4px_8px_rgba(255,255,255,0.18)]';
  const secondary =
    'bg-neu-bg text-neu-foreground shadow-extruded active:shadow-inset-sm';

  return (
    <Link
      href={href}
      className={`inline-flex min-h-12 items-center justify-center rounded-2xl px-6 text-sm font-bold transition-all duration-300 ease-out hover:-translate-y-px hover:shadow-extruded-hover focus:outline-none focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg sm:px-8 ${
        variant === 'primary' ? primary : secondary
      }`}
    >
      {children}
    </Link>
  );
}

function StatusPill({ status }: { status: string }) {
  const tone =
    status === 'REAL'
      ? 'text-neu-secondary'
      : status === 'PARTIAL'
        ? 'text-neu-accent'
        : 'text-neu-muted';

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-extrabold ${tone} shadow-inset-sm`}>
      {status}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen overflow-hidden bg-neu-bg text-neu-foreground selection:bg-neu-accent selection:text-white">
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -right-36 top-16 h-[34rem] w-[34rem] rounded-full opacity-60 shadow-extruded animate-float">
          <div className="absolute inset-10 rounded-full shadow-inset-deep">
            <div className="absolute inset-20 rounded-full bg-neu-bg shadow-extruded-sm" />
          </div>
        </div>
        <div
          className="absolute -bottom-32 -left-32 h-[28rem] w-[28rem] rounded-full opacity-50 shadow-inset-deep animate-float"
          style={{ animationDelay: '1.5s' }}
        />
      </div>

      <header className="fixed left-0 top-0 z-50 w-full bg-neu-bg/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-10">
        <nav className="mx-auto flex max-w-7xl items-center justify-between gap-4" aria-label="Primary navigation">
          <Link
            href="/"
            className="flex min-h-12 items-center gap-3 rounded-2xl px-2 focus:outline-none focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg"
            aria-label="ARKA home"
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-neu-bg shadow-extruded-sm">
              <span className="h-6 w-6 rounded-full bg-neu-accent shadow-inset-sm" />
            </span>
            <span className="font-display text-2xl font-extrabold">ARKA</span>
          </Link>

          <div className="hidden items-center gap-7 text-sm font-bold text-neu-muted md:flex">
            {navItems.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="rounded-xl px-2 py-2 transition-colors hover:text-neu-accent focus:outline-none focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg"
              >
                {item.label}
              </a>
            ))}
          </div>

          <div className="hidden md:block">
            <NeuLink href="/dashboard" variant="primary">
              Open Operator Console
            </NeuLink>
          </div>

          <details className="group relative md:hidden">
            <summary className="flex h-12 w-12 cursor-pointer list-none items-center justify-center rounded-2xl bg-neu-bg shadow-extruded transition-all duration-300 group-open:shadow-inset-sm focus:outline-none focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg">
              <span className="sr-only">Open navigation</span>
              <span className="grid gap-1.5">
                <span className="block h-0.5 w-5 rounded-full bg-neu-foreground transition-transform group-open:translate-y-1 group-open:rotate-45" />
                <span className="block h-0.5 w-5 rounded-full bg-neu-foreground transition-transform group-open:-translate-y-1 group-open:-rotate-45" />
              </span>
            </summary>
            <div className="absolute right-0 mt-4 grid w-64 gap-3 rounded-[32px] bg-neu-bg p-4 shadow-extruded">
              {navItems.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl px-4 py-3 text-sm font-bold text-neu-muted shadow-inset-sm transition-colors hover:text-neu-accent focus:outline-none focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg"
                >
                  {item.label}
                </a>
              ))}
              <NeuLink href="/dashboard" variant="primary">
                Open Console
              </NeuLink>
            </div>
          </details>
        </nav>
      </header>

      <main className="relative z-10">
        <section className="mx-auto grid min-h-screen max-w-7xl place-items-center px-5 pb-20 pt-32 sm:px-6 lg:px-10">
          <div className="grid w-full gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(390px,1.05fr)] lg:items-center">
            <div className="max-w-3xl">
              <p className="mb-5 inline-flex rounded-full px-5 py-2 text-xs font-extrabold uppercase text-neu-accent shadow-inset-sm">
                AuditEvent generator + OpenClaw triage + 0G proof
              </p>
              <h1 className="font-display text-6xl font-extrabold leading-none text-neu-foreground sm:text-7xl lg:text-8xl">
                ARKA
              </h1>
              <p className="mt-6 max-w-2xl text-2xl font-bold leading-tight text-neu-foreground sm:text-3xl">
                Physical operations, turned into reviewable proof.
              </p>
              <p className="mt-6 max-w-2xl text-base leading-8 text-neu-muted sm:text-lg">
                ARKA compares business intent against physical inventory movement, creates an AuditEvent,
                routes the case through an OpenClaw-compatible triage layer, and seals important proof
                packages through 0G Storage and 0G Chain.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row">
                <NeuLink href="/dashboard" variant="primary">
                  Open Operator Console
                </NeuLink>
                <NeuLink href="#truth">Check Truthful Status</NeuLink>
              </div>
            </div>

            <div className="relative min-h-[640px] w-full">
              <div className="absolute inset-x-0 top-0 mx-auto h-[540px] max-w-xl rounded-[48px] bg-neu-bg shadow-inset-deep" />
              <div className="absolute left-1/2 top-8 w-[min(92%,34rem)] -translate-x-1/2 rounded-[32px] bg-neu-bg p-5 shadow-extruded transition-all duration-500 hover:-translate-y-1 hover:shadow-extruded-hover sm:p-7">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-xs font-extrabold uppercase text-neu-muted">AuditEvent</p>
                    <h2 className="mt-2 font-display text-2xl font-extrabold text-neu-foreground">
                      CASE-STATE-C
                    </h2>
                  </div>
                  <span className="rounded-full px-3 py-2 text-xs font-extrabold text-neu-accent shadow-inset-sm">
                    REQUEST_EXPLANATION
                  </span>
                </div>

                <div className="mt-7 grid grid-cols-2 gap-4">
                  <div className="rounded-2xl bg-neu-bg p-4 shadow-inset">
                    <span className="text-xs font-bold uppercase text-neu-muted">Expected</span>
                    <strong className="mt-3 block text-3xl font-extrabold text-neu-foreground">90g</strong>
                    <small className="mt-1 block text-sm font-medium text-neu-muted">3 Protein Shakes</small>
                  </div>
                  <div className="rounded-2xl bg-neu-bg p-4 shadow-inset">
                    <span className="text-xs font-bold uppercase text-neu-muted">Recorded</span>
                    <strong className="mt-3 block text-3xl font-extrabold text-neu-foreground">99g</strong>
                    <small className="mt-1 block text-sm font-medium text-neu-muted">Whey movement out</small>
                  </div>
                </div>

                <div className="mt-5 rounded-[28px] bg-neu-bg p-5 shadow-extruded-sm">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-xs font-extrabold uppercase text-neu-muted">
                      Proof path
                    </span>
                    <StatusPill status="REAL" />
                  </div>
                  <div className="mt-5 grid gap-3">
                    {proofSteps.map((step, index) => (
                      <div key={step} className="flex items-center gap-3">
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-neu-bg text-xs font-extrabold text-neu-secondary shadow-inset-sm">
                          {index + 1}
                        </span>
                        <span className="text-sm font-bold text-neu-foreground">{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 rounded-2xl bg-neu-bg p-4 font-mono text-xs text-neu-foreground shadow-inset-deep">
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    storage root: 0x65b50bcd81377e...
                  </div>
                  <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                    chain tx: 0x4c378bb1801a7057...
                  </div>
                </div>

                <div className="mt-5 rounded-2xl bg-neu-bg p-4 shadow-inset">
                  <p className="text-xs font-extrabold uppercase text-neu-muted">Operator note</p>
                  <p className="mt-3 text-sm font-medium leading-6 text-neu-muted">
                    Usage is above expected range. Ask for explanation after owner approval. Do not rewrite
                    the AuditEvent facts.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="architecture" className="px-5 py-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-3xl">
              <p className="text-sm font-extrabold uppercase text-neu-accent">Architecture</p>
              <h2 className="mt-4 font-display text-4xl font-extrabold text-neu-foreground sm:text-5xl">
                One loop, six strict responsibilities.
              </h2>
              <p className="mt-5 text-lg leading-8 text-neu-muted">
                ARKA stays narrow: it creates, triages, investigates, seals, and anchors AuditEvents. It
                does not become a POS, ERP, warehouse suite, CCTV AI system, or HR punishment workflow.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              {architectureLayers.map((item) => (
                <article
                  key={item.layer}
                  className="rounded-[32px] bg-neu-bg p-7 shadow-extruded transition-all duration-500 hover:-translate-y-1 hover:shadow-extruded-hover"
                >
                  <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-neu-bg shadow-inset-deep">
                    <span className="h-6 w-6 rounded-full bg-neu-secondary shadow-extruded-sm" />
                  </div>
                  <h3 className="font-display text-2xl font-extrabold text-neu-foreground">
                    {item.layer}
                  </h3>
                  <p className="mt-2 text-sm font-extrabold uppercase text-neu-accent">
                    {item.role}
                  </p>
                  <p className="mt-4 text-sm leading-7 text-neu-muted">{item.copy}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="demo" className="px-5 py-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
              <div>
                <p className="text-sm font-extrabold uppercase text-neu-accent">Demo world</p>
                <h2 className="mt-4 font-display text-4xl font-extrabold text-neu-foreground sm:text-5xl">
                  Protein bar scenario, built for repeatable judging.
                </h2>
                <p className="mt-5 text-lg leading-8 text-neu-muted">
                  The MVP uses one concrete world: Protein Shake orders, Whey Protein movement, and a 30g
                  usage rule. The point is not to simulate a full business. The point is to show how a
                  mismatch becomes an auditable case.
                </p>
                <div className="mt-8 rounded-[32px] bg-neu-bg p-6 shadow-inset-deep">
                  <dl className="grid gap-5 sm:grid-cols-2">
                    {[
                      ['Product', 'Protein Shake'],
                      ['Usage rule', '30g Whey / serving'],
                      ['Handler', 'Joni'],
                      ['Cashier', 'Nina'],
                    ].map(([label, value]) => (
                      <div key={label}>
                        <dt className="text-xs font-extrabold uppercase text-neu-muted">
                          {label}
                        </dt>
                        <dd className="mt-2 text-lg font-extrabold text-neu-foreground">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              </div>

              <div className="grid gap-5">
                {scenarioCards.map((scenario) => (
                  <article key={scenario.state} className="rounded-[32px] bg-neu-bg p-6 shadow-extruded">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-xs font-extrabold uppercase text-neu-accent">
                          {scenario.state}
                        </p>
                        <h3 className="mt-2 font-display text-2xl font-extrabold text-neu-foreground">
                          {scenario.title}
                        </h3>
                      </div>
                      <span className="rounded-full px-4 py-2 text-xs font-extrabold text-neu-foreground shadow-inset-sm">
                        {scenario.outcome}
                      </span>
                    </div>
                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-2xl bg-neu-bg p-4 shadow-inset-sm">
                        <span className="text-xs font-bold uppercase text-neu-muted">
                          Business intent
                        </span>
                        <strong className="mt-2 block text-lg text-neu-foreground">{scenario.expected}</strong>
                      </div>
                      <div className="rounded-2xl bg-neu-bg p-4 shadow-inset-sm">
                        <span className="text-xs font-bold uppercase text-neu-muted">
                          Physical movement
                        </span>
                        <strong className="mt-2 block text-lg text-neu-foreground">{scenario.actual}</strong>
                      </div>
                    </div>
                    <p className="mt-5 text-sm leading-7 text-neu-muted">{scenario.copy}</p>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="truth" className="px-5 py-24 sm:px-6 lg:px-10">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <p className="text-sm font-extrabold uppercase text-neu-accent">Truthful status</p>
                <h2 className="mt-4 font-display text-4xl font-extrabold text-neu-foreground sm:text-5xl">
                  The landing page does not overclaim the demo.
                </h2>
                <p className="mt-5 text-lg leading-8 text-neu-muted">
                  ARKA shows what is real, what is partial, and what remains outside the current MVP. Chain
                  anchors do not prove blame; they prove that a sealed package was registered for review.
                </p>
              </div>
              <div className="rounded-[32px] bg-neu-bg p-6 shadow-inset-deep">
                <p className="text-xs font-extrabold uppercase text-neu-muted">
                  Deployed 0G Galileo registry
                </p>
                <p className="mt-3 overflow-hidden text-ellipsis font-mono text-sm font-bold text-neu-foreground">
                  0xEA4a472F0123fC9889650be807A1FF5EF780029F
                </p>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2">
              {proofStatuses.map((item) => (
                <article key={item.label} className="rounded-[32px] bg-neu-bg p-7 shadow-extruded">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="font-display text-xl font-extrabold text-neu-foreground">
                      {item.label}
                    </h3>
                    <StatusPill status={item.status} />
                  </div>
                  <p className="mt-4 text-sm leading-7 text-neu-muted">{item.detail}</p>
                </article>
              ))}
            </div>
          </div>
        </section>
      </main>

      <footer className="relative z-10 px-5 pb-12 pt-8 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-5 rounded-[32px] bg-neu-bg p-6 shadow-extruded sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium leading-6 text-neu-muted">
            ARKA is an AuditEvent generator with an OpenClaw triage layer and 0G proof layer.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex min-h-12 items-center justify-center rounded-2xl bg-neu-bg px-6 text-sm font-bold text-neu-foreground shadow-inset-sm transition-colors hover:text-neu-accent focus:outline-none focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg"
          >
            Continue to dashboard
          </Link>
        </div>
      </footer>
    </div>
  );
}
