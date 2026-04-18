import Link from "next/link"
import { ShieldAlert, ArrowRight, Activity, BrainCircuit, Users, Database, Zap, Server, MapPin, SearchCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-full bg-slate-950 text-slate-100 font-sans selection:bg-sky-500/30 overflow-x-hidden">
      
      {/* Background Deep Gradients */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[150px]" />
      </div>

      {/* Floating Nano-Grid */}
      <div className="fixed inset-0 z-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />

      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-slate-950/50 backdrop-blur-xl border-b border-white/5 z-50 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 p-2 rounded-xl border border-red-500/30">
              <ShieldAlert className="h-6 w-6 text-red-500" />
            </div>
            <span className="text-2xl font-black tracking-widest text-white">EvacuAid</span>
            <span className="ml-4 text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30 px-3 py-1 rounded-full uppercase tracking-widest hidden sm:block">
              Solution Challenge '26
            </span>
          </div>
          <div className="flex items-center gap-8">
            <Link href="#problem" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">The Problem</Link>
            <Link href="#architecture" className="text-sm font-medium text-slate-400 hover:text-white transition-colors hidden md:block">Tech Stack</Link>
            <Link href="/dashboard" className="text-sm font-bold bg-white text-slate-950 px-6 py-2.5 rounded-full hover:bg-sky-50 transition-colors flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.2)] hover:shadow-[0_0_30px_rgba(255,255,255,0.4)]">
              Launch MVP <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Extreme Hero Section */}
      <section className="relative pt-40 pb-32 px-6 flex flex-col items-center justify-center min-h-screen">
        <div className="max-w-5xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-900 border border-slate-700 text-sky-400 text-xs font-bold uppercase tracking-widest mb-8 shadow-2xl">
            <span className="relative flex h-2 w-2 mr-1">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-sky-500"></span>
            </span>
            System Node Online
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter text-white mb-8 leading-[1.1] drop-shadow-2xl">
            Autonomous <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-orange-400 to-yellow-500 animate-gradient-x">
              Crisis Response
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-slate-400 mb-12 leading-relaxed max-w-3xl mx-auto font-light">
            EvacuAid leverages live <strong className="text-white">Cloud SQL</strong> telemetry, generative <strong className="text-white">Gemini AI</strong>, and instant <strong className="text-white">A* Map Pathfinding</strong> to route humans dynamically out of catastrophic structural emergencies.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 w-full sm:w-auto">
            <Link href="/dashboard" className="w-full sm:w-auto overflow-hidden relative group bg-gradient-to-r from-sky-600 to-blue-700 px-10 py-5 rounded-full font-bold text-lg hover:scale-105 transition-all flex items-center justify-center gap-3 shadow-[0_0_40px_rgba(2,132,199,0.4)]">
              <span className="absolute w-0 h-0 transition-all duration-500 ease-out bg-white rounded-full group-hover:w-56 group-hover:h-56 opacity-10"></span>
              Enter Command Center <ArrowRight className="h-6 w-6" />
            </Link>
            <Link href="#architecture" className="w-full sm:w-auto bg-slate-900 border-2 border-slate-700 text-slate-300 px-10 py-5 rounded-full font-bold text-lg hover:border-slate-500 hover:text-white transition-all flex items-center justify-center">
              View Architecture
            </Link>
          </div>
        </div>
      </section>

      {/* The USP Grid */}
      <section id="problem" className="py-32 bg-slate-950/80 px-6 border-y border-white/5 relative z-10 backdrop-blur-2xl">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white">Why EvacuAid?</h2>
            <p className="text-slate-400 mt-6 text-lg max-w-2xl mx-auto">Static fire escape signs are deadly if the fire is actively blocking the stairs. Our system forces a dynamic recalculation layer.</p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-red-500/10 rounded-2xl flex items-center justify-center text-red-500 mb-8 border border-red-500/20"><Activity className="h-7 w-7" /></div>
              <h3 className="text-2xl font-bold mb-4 text-white">The Deadly Standard</h3>
              <p className="text-slate-400 leading-relaxed text-lg">During structural emergencies, standard evacuation maps lead humans blindly into hazardous corridors if the fire originates there. Coordination without live geometry is impossible.</p>
            </div>
            
            <div className="bg-sky-900/10 p-10 rounded-3xl border border-sky-500/20 shadow-[0_0_30px_rgba(14,165,233,0.05)] hover:border-sky-500/40 transition-all hover:-translate-y-2 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-[80px] group-hover:bg-sky-500/40 transition-all" />
              <div className="w-14 h-14 bg-sky-500/20 rounded-2xl flex items-center justify-center text-sky-400 mb-8 border border-sky-500/30"><MapPin className="h-7 w-7" /></div>
              <h3 className="text-2xl font-bold mb-4 text-white">Dynamic Map Routing (A*)</h3>
              <p className="text-slate-400 leading-relaxed text-lg">We replaced the static map with a live <strong className="text-white">A* routing engine</strong>. If an IoT Sensor detects smoke, the node dies, and the Map recalculates the shortest survivable exit in pure milliseconds.</p>
            </div>
            
            <div className="bg-slate-900/50 p-10 rounded-3xl border border-slate-800 hover:border-slate-700 transition-all hover:-translate-y-2">
              <div className="w-14 h-14 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 mb-8 border border-emerald-500/20"><SearchCheck className="h-7 w-7" /></div>
              <h3 className="text-2xl font-bold mb-4 text-white">Global Real-time Search</h3>
              <p className="text-slate-400 leading-relaxed text-lg">Equipped with a unified Omnibox command palette. Search instantly scales across active incidents, offline CCTVs, and actual topological map coordinates.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Massive Architecture Breakdown */}
      <section id="architecture" className="py-32 px-6 relative z-10">
        <div className="max-w-6xl mx-auto">
          
          <div className="text-center mb-24">
            <h2 className="text-4xl md:text-5xl font-black tracking-tight text-white mb-6">Built For Scale. Built For GCP.</h2>
            <p className="text-slate-400 text-xl max-w-3xl mx-auto">We ripped out local states and fully integrated a deep-stack Next.js architecture running natively off Google services.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-12 items-center">
            
            {/* The Stack List */}
            <div className="flex-1 space-y-6 w-full">
              <div className="flex items-start gap-6 bg-slate-900/40 p-6 opacity-90 rounded-2xl border border-slate-800 hover:border-blue-500/30 transition-colors">
                <div className="p-4 bg-blue-500/10 text-blue-400 rounded-xl shrink-0"><Database className="h-6 w-6" /></div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">Google Cloud SQL Engine</h4>
                  <p className="text-slate-400 leading-relaxed">Centralized single source of truth securely hosting the live graph topologies, hardware sensor arrays, and active crisis assignments via Prisma ORM.</p>
                </div>
              </div>
              
              <div className="flex items-start gap-6 bg-sky-900/20 p-6 rounded-2xl border border-sky-500/30 shadow-[0_0_30px_rgba(14,165,233,0.1)]">
                <div className="p-4 bg-sky-500/20 text-sky-400 rounded-xl shrink-0"><BrainCircuit className="h-6 w-6" /></div>
                <div>
                  <h4 className="text-xl font-bold text-sky-100 mb-2">Gemini 2.5 Flash API</h4>
                  <p className="text-slate-300 leading-relaxed">The Chat Widget queries the backend, which parses the Cloud SQL telemetry directly into the LLM context. Gemini reads live emergencies perfectly.</p>
                </div>
              </div>

              <div className="flex items-start gap-6 bg-slate-900/40 p-6 opacity-90 rounded-2xl border border-slate-800 hover:border-emerald-500/30 transition-colors">
                <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-xl shrink-0"><Zap className="h-6 w-6" /></div>
                <div>
                  <h4 className="text-xl font-bold text-white mb-2">High FPS Dashboard (Vercel)</h4>
                  <p className="text-slate-400 leading-relaxed">Next.js 16 app directory, aggressive Zustand local cache hydration, and interactive HTML5 map canvases delivered globally.</p>
                </div>
              </div>
            </div>

            {/* Visual Architecture Diagram Box */}
            <div className="flex-1 w-full bg-slate-900 rounded-[2.5rem] border border-slate-800 p-1 lg:p-2 shadow-2xl relative">
              <div className="bg-slate-950 rounded-[2rem] p-8 lg:p-12 w-full h-full relative overflow-hidden">
                <div className="absolute top-[-20%] right-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[80px]" />
                
                <h3 className="text-lg font-bold text-slate-300 mb-8 tracking-widest uppercase flex items-center gap-3">
                  <Server className="h-5 w-5" /> Data Flow Pipeline
                </h3>

                <div className="space-y-6 relative z-10 font-mono text-sm tracking-wide">
                  <div className="bg-slate-900 p-5 rounded-2xl flex flex-col md:flex-row md:items-center justify-between border border-slate-800 gap-4">
                    <span className="text-slate-300 font-bold bg-slate-800 px-3 py-1 rounded-md">Frontend UI</span>
                    <span className="text-slate-500 hidden md:block">← fetch() →</span>
                    <span className="text-sky-400">/api/chat Route</span>
                  </div>
                  
                  <div className="flex justify-center text-slate-700 py-1">↓</div>
                  
                  <div className="bg-blue-900/20 p-5 rounded-2xl border border-blue-500/30 shadow-[0_0_20px_rgba(59,130,246,0.1)] flex flex-col">
                    <span className="text-blue-300 font-bold mb-3">Google Cloud SQL</span>
                    <div className="text-slate-500 text-xs grid grid-cols-2 gap-2">
                      <div className="bg-slate-900/80 px-3 py-2 rounded-lg">BuildingMap{}</div>
                      <div className="bg-slate-900/80 px-3 py-2 rounded-lg">Incidents{}</div>
                      <div className="bg-slate-900/80 px-3 py-2 rounded-lg">Devices{}</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-center text-slate-700 py-1">↓</div>
                  
                  <div className="bg-slate-900 p-5 rounded-2xl flex items-center justify-between border-l-4 border-l-purple-500 border-t border-r border-b border-slate-800">
                    <span className="text-purple-400 font-bold">Google Generative AI</span>
                    <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded-full">Gemini 2.5 Flash</span>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-slate-950 border-t border-white/5 text-center relative z-10">
        <div className="inline-flex items-center gap-2 mb-6 opacity-50 justify-center">
          <ShieldAlert className="h-5 w-5" />
          <span className="text-xl font-bold tracking-widest text-white">EvacuAid</span>
        </div>
        <p className="text-slate-500 font-medium tracking-wide">© 2026 Emergency Systems</p>
      </footer>

    </div>
  )
}
