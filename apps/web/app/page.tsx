import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-neu-bg text-neu-foreground selection:bg-neu-accent selection:text-white pb-32 overflow-hidden relative">
      {/* Decorative Floating Circles */}
      <div className="absolute top-[-100px] right-[-100px] w-[500px] h-[500px] rounded-full shadow-extruded animate-float opacity-70 pointer-events-none">
        <div className="absolute inset-8 rounded-full shadow-inset-deep">
          <div className="absolute inset-16 rounded-full shadow-extruded bg-neu-bg"></div>
        </div>
      </div>
      
      <div className="absolute bottom-[100px] left-[-150px] w-[400px] h-[400px] rounded-full shadow-extruded animate-float opacity-70 pointer-events-none" style={{ animationDelay: '2s' }}>
         <div className="absolute inset-12 rounded-full shadow-inset"></div>
      </div>

      {/* Navigation */}
      <nav className="fixed w-full top-0 z-50 py-6 px-8 md:px-16 flex justify-between items-center bg-neu-bg/80 backdrop-blur-md">
        <div className="flex items-center gap-4">
          {/* Logo mark */}
          <div className="w-12 h-12 rounded-2xl shadow-extruded-sm flex items-center justify-center">
            <div className="w-6 h-6 rounded-full shadow-inset-sm bg-neu-accent"></div>
          </div>
          <span className="font-display font-extrabold text-2xl tracking-tight text-neu-foreground">
            ARKA
          </span>
        </div>
        
        <div className="hidden md:flex gap-8 items-center font-sans font-medium text-neu-muted">
          <a href="#features" className="hover:text-neu-accent transition-colors focus:ring-2 focus:ring-neu-accent focus:outline-none rounded-md px-2 py-1">Features</a>
          <a href="#how-it-works" className="hover:text-neu-accent transition-colors focus:ring-2 focus:ring-neu-accent focus:outline-none rounded-md px-2 py-1">How it Works</a>
          <a href="https://github.com/Nathasan1410/ARKA" target="_blank" rel="noopener noreferrer" className="hover:text-neu-accent transition-colors focus:ring-2 focus:ring-neu-accent focus:outline-none rounded-md px-2 py-1">GitHub</a>
        </div>

        <Link 
          href="/dashboard" 
          className="hidden md:flex items-center justify-center px-8 h-12 rounded-2xl font-bold bg-neu-bg shadow-extruded hover:-translate-y-px hover:shadow-extruded-hover active:translate-y-0.5 active:shadow-inset-sm transition-all duration-300 focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg focus:outline-none"
        >
          Launch Console
        </Link>

        {/* Mobile Menu Button (Visual Only for now) */}
        <button className="md:hidden w-12 h-12 rounded-2xl shadow-extruded flex flex-col justify-center items-center gap-1.5 focus:ring-2 focus:ring-neu-accent focus:outline-none active:shadow-inset-sm active:translate-y-px transition-all">
          <span className="w-5 h-0.5 bg-neu-foreground rounded-full"></span>
          <span className="w-5 h-0.5 bg-neu-foreground rounded-full"></span>
        </button>
      </nav>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 md:px-16 pt-40 md:pt-48 relative z-10">
        <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
          <div className="mb-6 px-6 py-2 rounded-full shadow-inset-sm text-sm font-bold tracking-widest text-neu-accent uppercase">
            Built for ETHGlobal
          </div>
          <h1 className="font-display text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] mb-8 text-neu-foreground">
            Immutable auditing for the physical world.
          </h1>
          <p className="text-lg md:text-xl text-neu-muted max-w-2xl mb-12 leading-relaxed">
            ARKA connects business intent with physical reality. It detects inventory drift, automates triage, and anchors operational evidence to the <strong className="text-neu-foreground font-bold">0G Chain</strong> for tamper-proof accountability.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 w-full sm:w-auto">
            <Link 
              href="/dashboard"
              className="flex items-center justify-center px-10 h-16 rounded-2xl font-bold text-white bg-neu-accent shadow-extruded hover:-translate-y-px hover:shadow-extruded-hover active:translate-y-0.5 active:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.2),inset_-4px_-4px_8px_rgba(255,255,255,0.2)] transition-all duration-300 focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg focus:outline-none"
            >
              Open Operator Console
            </Link>
            <a 
              href="https://github.com/Nathasan1410/ARKA"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center px-10 h-16 rounded-2xl font-bold bg-neu-bg shadow-extruded hover:-translate-y-px hover:shadow-extruded-hover active:translate-y-0.5 active:shadow-inset-sm transition-all duration-300 focus:ring-2 focus:ring-neu-accent focus:ring-offset-2 focus:ring-offset-neu-bg focus:outline-none"
            >
              Read the Docs
            </a>
          </div>
        </div>

        {/* Features Grid */}
        <section id="features" className="mt-32 md:mt-48 grid md:grid-cols-3 gap-12">
          
          <article className="p-10 rounded-[32px] bg-neu-bg shadow-extruded hover:-translate-y-0.5 hover:shadow-extruded-hover transition-all duration-500 flex flex-col group">
            <div className="w-16 h-16 rounded-2xl shadow-inset-deep flex items-center justify-center mb-8">
              {/* Abstract Icon */}
              <div className="w-6 h-6 rounded-full border-4 border-neu-accent group-hover:scale-110 transition-transform duration-300"></div>
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 text-neu-foreground">Deterministic Triage</h3>
            <p className="text-neu-muted leading-relaxed">
              Instantly calculate variances between expected POS usage and actual inventory movement. Automatically flags discrepancies for critical review or automated clearing.
            </p>
          </article>

          <article className="p-10 rounded-[32px] bg-neu-bg shadow-extruded hover:-translate-y-0.5 hover:shadow-extruded-hover transition-all duration-500 flex flex-col group">
            <div className="w-16 h-16 rounded-2xl shadow-inset-deep flex items-center justify-center mb-8">
               <div className="w-6 h-6 rounded-md bg-neu-secondary group-hover:rotate-12 transition-transform duration-300"></div>
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 text-neu-foreground">Zero-Gravity Storage</h3>
            <p className="text-neu-muted leading-relaxed">
              Bulky operational evidence, including raw AuditEvents and movement receipts, are securely sealed and stored off-chain using the decentralized 0G Storage network.
            </p>
          </article>

          <article className="p-10 rounded-[32px] bg-neu-bg shadow-extruded hover:-translate-y-0.5 hover:shadow-extruded-hover transition-all duration-500 flex flex-col group">
            <div className="w-16 h-16 rounded-2xl shadow-inset-deep flex items-center justify-center mb-8">
              <div className="w-6 h-6 border-b-4 border-r-4 border-neu-foreground rounded-br-lg group-hover:translate-x-1 group-hover:translate-y-1 transition-transform duration-300"></div>
            </div>
            <h3 className="font-display text-2xl font-bold mb-4 text-neu-foreground">Immutable Anchors</h3>
            <p className="text-neu-muted leading-relaxed">
              Every critical event resolution is anchored to the 0G Galileo Testnet. Append-only smart contracts guarantee that the audit trail can never be secretly altered.
            </p>
          </article>

        </section>

        {/* Technical Stack Section */}
        <section id="how-it-works" className="mt-32 md:mt-48 p-12 md:p-20 rounded-[32px] bg-neu-bg shadow-extruded flex flex-col md:flex-row items-center gap-16 relative overflow-hidden">
          
          {/* Abstract Graphic Background */}
          <div className="absolute right-[-20%] top-[-20%] w-[500px] h-[500px] rounded-full shadow-inset-deep opacity-30 pointer-events-none"></div>

          <div className="flex-1 relative z-10">
            <span className="text-sm font-bold tracking-widest text-neu-accent uppercase mb-4 block">Architecture</span>
            <h2 className="font-display text-4xl md:text-5xl font-extrabold mb-6 tracking-tight text-neu-foreground">
              Built for production,<br/>anchored in Web3.
            </h2>
            <p className="text-lg text-neu-muted mb-8 leading-relaxed">
              ARKA operates on a strict boundary philosophy. Operational data remains fast and private in a Supabase PostgreSQL environment. Only the cryptographically hashed proofs are published to the 0G Chain to establish public, undeniable accountability.
            </p>
            <ul className="space-y-4">
              {['Next.js & Supabase for fast operational state', 'Drizzle ORM for type-safe models', '0G Storage for decentralized evidence blobs', '0G Chain (EVM) for smart contract registry'].map((item, i) => (
                <li key={i} className="flex items-center gap-4 text-neu-foreground font-medium">
                  <div className="w-8 h-8 rounded-xl shadow-inset-sm flex items-center justify-center shrink-0">
                    <div className="w-2 h-2 rounded-full bg-neu-secondary"></div>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          
          {/* Visual Component Preview */}
          <div className="flex-1 w-full max-w-sm relative z-10">
             <div className="p-8 rounded-3xl shadow-extruded bg-neu-bg flex flex-col gap-6">
                <div className="flex justify-between items-center pb-4 border-b border-neu-bg shadow-[0_1px_0_rgba(255,255,255,0.4)]">
                   <span className="font-bold text-sm text-neu-muted uppercase tracking-wider">Proof Status</span>
                   <div className="px-3 py-1 rounded-full shadow-inset-sm text-xs font-bold text-neu-secondary">VERIFIED</div>
                </div>
                <div className="space-y-2">
                   <div className="text-xs font-bold text-neu-muted uppercase tracking-wider">Local Hash</div>
                   <div className="p-4 rounded-xl shadow-inset-deep font-mono text-xs text-neu-foreground overflow-hidden text-ellipsis">
                     0x8f3c...9a2b
                   </div>
                </div>
                <div className="space-y-2">
                   <div className="text-xs font-bold text-neu-muted uppercase tracking-wider">0G Chain Tx</div>
                   <div className="p-4 rounded-xl shadow-inset font-mono text-xs text-neu-foreground overflow-hidden text-ellipsis">
                     0xEA4a472F0123fC...
                   </div>
                </div>
             </div>
          </div>
        </section>
      </main>
    </div>
  );
}
