import Link from "next/link";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Nav */}
      <nav className="flex items-center justify-between px-8 py-5 border-b border-white/10">
        <span className="text-xl font-bold tracking-tight">⬡ Vanguard Graph</span>
        <div className="flex gap-6 text-sm text-gray-400">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how-it-works" className="hover:text-white transition">How It Works</a>
          <Link href="/dashboard" className="bg-white text-black px-4 py-1.5 rounded-full font-semibold hover:bg-gray-200 transition">
            Open Dashboard
          </Link>
        </div>
      </nav>

      {/* Hero */}
      <section className="flex flex-col items-center text-center px-6 pt-28 pb-20">
        <div className="inline-block bg-white/10 border border-white/20 text-xs text-gray-300 px-4 py-1.5 rounded-full mb-6 tracking-wide uppercase">
          Fraud Coordination Intelligence Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-extrabold leading-tight mb-6 bg-gradient-to-r from-white via-gray-300 to-gray-500 bg-clip-text text-transparent">
          Catch Fraud Rings<br />Before Money Moves
        </h1>
        <p className="text-gray-400 text-lg max-w-xl mb-10">
          Vanguard Graph converts onboarding signals into a live relationship graph — detecting coordinated fraud networks that flat checks miss entirely.
        </p>
        <div className="flex gap-4">
          <Link href="/dashboard" className="bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-gray-200 transition">
            Open Dashboard →
          </Link>
          <a href="#how-it-works" className="border border-white/20 px-6 py-3 rounded-full text-gray-300 hover:border-white hover:text-white transition">
            See How It Works
          </a>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-3 gap-6 max-w-3xl mx-auto px-6 pb-20">
        {[
          { value: "2nd–3rd", label: "Degree connections detected" },
          { value: "Real-time", label: "Graph traversal on every onboard" },
          { value: "AI-powered", label: "Plain-language risk memos" },
        ].map((stat) => (
          <div key={stat.label} className="border border-white/10 rounded-2xl p-6 text-center bg-white/5">
            <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
            <div className="text-sm text-gray-400">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* Features */}
      <section id="features" className="max-w-5xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">Why Vanguard Graph</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: "🕸️",
              title: "Ring Detection",
              desc: "Neo4j graph queries trace shared devices, IPs, and bank accounts across merchants — even 3 hops away.",
            },
            {
              icon: "🧠",
              title: "AI Risk Memos",
              desc: "Claude converts raw Cypher graph output into plain-language investigator notes with recommended actions.",
            },
            {
              icon: "⚡",
              title: "Durable Workflows",
              desc: "Render Workflows power every investigation — retry-safe, resumable, and checkpoint-recovered automatically.",
            },
          ].map((f) => (
            <div key={f.title} className="border border-white/10 rounded-2xl p-6 bg-gradient-to-b from-white/5 to-transparent hover:border-white/30 transition">
              <div className="text-3xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-semibold mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="max-w-3xl mx-auto px-6 pb-24">
        <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
        <div className="space-y-6">
          {[
            { step: "01", title: "Merchant Onboards", desc: "A new merchant submits details — name, device, bank account, IP address." },
            { step: "02", title: "Graph Gets Built", desc: "Every signal becomes a node. Relationships are drawn between shared entities across all merchants." },
            { step: "03", title: "Ring Check Runs", desc: "Cypher queries traverse the graph looking for 2nd and 3rd degree connections to flagged entities." },
            { step: "04", title: "AI Explains the Risk", desc: "Claude reads the graph findings and writes a plain-language memo with a risk score and recommended action." },
            { step: "05", title: "Investigator Acts", desc: "The analyst blocks the merchant or sends to review — before any payout is processed." },
          ].map((item) => (
            <div key={item.step} className="flex gap-6 items-start border border-white/10 rounded-2xl p-6 bg-white/5">
              <div className="text-2xl font-extrabold text-gray-600 w-10 shrink-0">{item.step}</div>
              <div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-gray-400 text-sm">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center px-6 pb-28">
        <h2 className="text-4xl font-bold mb-4">Ready to catch fraud rings?</h2>
        <p className="text-gray-400 mb-8">Open the dashboard and see Vanguard Graph in action.</p>
        <Link href="/dashboard" className="bg-white text-black px-8 py-3 rounded-full font-semibold text-lg hover:bg-gray-200 transition">
          Open Dashboard →
        </Link>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 px-8 py-6 text-center text-gray-600 text-sm">
        Vanguard Graph — Built for Namespace Hackathon AH6926
      </footer>
    </main>
  );
}