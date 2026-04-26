import React from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Sparkles, Zap, Brain, CheckCircle,
  ArrowRight, BarChart3, Image as ImageIcon,
  PlayCircle, ShieldCheck, Mail, MapPin, Phone, ShieldAlert
} from 'lucide-react';
import logoImage from '../assets/logo.jpeg';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-950 font-sans selection:bg-cyan-200/70 overflow-x-hidden relative">
      {/* 1. Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-950/55 backdrop-blur-lg border-b border-white/10 transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <img src={logoImage} alt="ReturnAI Logo" className="h-10 object-contain drop-shadow-md" />
              <span className="font-display text-2xl font-bold text-white tracking-tight">ReturnAI</span>
            </div>

            {/* Desktop Nav Links */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#home" className="text-sm font-semibold text-slate-100 hover:text-cyan-300 transition-colors">Home</a>
              <a href="#features" className="text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors">Features</a>
              <a href="#demo" className="text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors">Demo</a>
              <a href="#contact" className="text-sm font-medium text-slate-300 hover:text-cyan-300 transition-colors">Contact</a>
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 sm:gap-4">
              <Link to="/login" className="text-sm font-semibold text-slate-200 hover:text-cyan-300 transition-colors px-2">Log In</Link>
              <Link to="/register" className="text-sm font-bold text-slate-950 bg-cyan-300 hover:bg-cyan-200 px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-cyan-400/30 hover:-translate-y-0.5 active:translate-y-0 duration-300">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* 2. Hero Section */}
      <section id="home" className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: "url('https://images.unsplash.com/photo-1761195696590-3490ea770aa1?auto=format&fit=crop&fm=jpg&q=80&w=2200')",
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover'
            }}
          />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(2,6,23,0.88)_0%,rgba(2,6,23,0.7)_45%,rgba(2,6,23,0.62)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(148,163,184,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(148,163,184,0.08)_1px,transparent_1px)] bg-[size:72px_72px] opacity-20" />
          <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-b from-transparent to-slate-100" />
        </div>

        {/* Dynamic Background */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-[1200px] pointer-events-none -z-10">
          <div className="absolute -top-[20%] -right-[10%] w-[600px] h-[600px] rounded-full bg-gradient-to-br from-cyan-300/25 to-blue-500/10 blur-[100px] animate-pulse" style={{ animationDuration: '8s' }} />
          <div className="absolute top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full bg-gradient-to-tr from-blue-300/20 to-emerald-200/10 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/10 rounded-full mb-8 shadow-sm">
            <Sparkles className="w-4 h-4 text-cyan-300" />
            <span className="text-xs font-bold text-cyan-100 uppercase tracking-wider">The Future of E-Commerce</span>
          </div>

          <div className="mx-auto mb-8 flex h-28 w-28 items-center justify-center rounded-[2rem] border border-cyan-200/20 bg-white/10 p-3 shadow-2xl shadow-cyan-950/30 backdrop-blur-md">
            <img src={logoImage} alt="ReturnAI" className="h-full w-full rounded-[1.4rem] object-cover" />
          </div>

          <h1 className="font-display text-5xl md:text-6xl lg:text-7xl font-extrabold text-white tracking-tight leading-[1.1] mb-6">
            Intelligent Return <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-indigo-200">
              Verification Platform
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-300 mb-10 font-medium leading-relaxed">
            Eliminate fraudulent returns and slash operational costs using state-of-the-art computer vision models that verify product integrity instantly.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-cyan-300 hover:bg-cyan-200 text-slate-950 font-semibold px-8 py-4 rounded-full transition-all shadow-lg shadow-cyan-900/30 hover:shadow-cyan-400/30 hover:-translate-y-1">
              Start Free Trial <ArrowRight className="w-5 h-5" />
            </Link>
            <a href="#demo" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white font-semibold px-8 py-4 rounded-full border border-white/15 transition-all shadow-sm hover:shadow-md backdrop-blur-sm">
              <PlayCircle className="w-5 h-5 text-cyan-300" /> View Demo
            </a>
          </div>

          {/* Dashboard Preview Graphic */}
          <div className="mt-20 relative max-w-5xl mx-auto md:[perspective:2000px]">
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-slate-100 to-transparent z-20" />
            <div className="relative rounded-2xl bg-white/90 border border-white/40 shadow-2xl p-2 transition-all duration-700 ease-out origin-bottom will-change-transform backdrop-blur-md [transform:rotateX(12deg)] hover:[transform:rotateX(0deg)] hover:shadow-cyan-500/20">
              <div className="rounded-xl overflow-hidden border border-slate-100 bg-slate-50 flex flex-col h-[400px]">
                {/* Fake App header */}
                <div className="h-12 border-b border-slate-200 flex items-center px-4 gap-2 bg-white">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-green-400" />
                  <div className="ml-4 w-64 h-6 bg-slate-100/80 rounded-md" />
                  <div className="ml-auto flex gap-2">
                    <div className="w-16 h-6 bg-slate-100/80 rounded-full" />
                    <div className="w-8 h-6 bg-indigo-100 rounded-full" />
                  </div>
                </div>
                {/* Fake App body */}
                <div className="flex-1 p-6 flex gap-6">
                  {/* Image Scan Area */}
                  <div className="w-1/3 bg-slate-900 border border-slate-200 shadow-sm rounded-xl relative overflow-hidden group">
                    <img src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&q=80&w=800" alt="Returned Nike Sneaker" className="absolute inset-0 w-full h-full object-cover opacity-90 transition-transform duration-700 group-hover:scale-105" />
                    
                    {/* AI Scanner Line */}
                    <div className="absolute inset-x-0 top-1/2 h-0.5 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,1)] transform -translate-y-1/2 z-10" />
                    
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-900/10 to-slate-900/30" />
                    
                    <div className="absolute bottom-4 left-4 right-4 z-20">
                       <div className="flex items-center gap-2 mb-2">
                         <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
                         <span className="text-[10px] font-mono font-bold text-cyan-400 tracking-wider">ANALYZING TEXTURE...</span>
                       </div>
                       <div className="w-full bg-slate-800/80 rounded-full h-1 overflow-hidden backdrop-blur-sm">
                         <div className="bg-gradient-to-r from-cyan-600 to-cyan-300 h-full rounded-full w-[84%]" style={{ transition: 'width 2s ease-out' }} />
                       </div>
                    </div>
                    <div className="absolute top-4 left-4 bg-red-500/90 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm flex items-center gap-1 z-20 border border-red-400/50">
                      <ShieldAlert className="w-3 h-3" /> USAGE DETECTED
                    </div>
                  </div>
                  
                  {/* Stats Area */}
                  <div className="w-2/3 flex flex-col gap-4">
                    <div className="h-10 w-1/2 bg-slate-50 rounded-lg flex items-center px-4 justify-between border border-slate-200">
                       <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Order Identifier</span>
                       <span className="text-sm font-mono font-bold text-indigo-700">#RTN-9942A</span>
                    </div>
                    
                    <div className="flex-1 bg-white border border-slate-200 shadow-sm rounded-xl flex items-center p-6 relative overflow-hidden gap-6 justify-between group hover:border-cyan-200 transition-colors">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-gradient-to-b from-cyan-50 to-transparent rounded-full opacity-50 pointer-events-none" />
                      <div>
                         <h4 className="font-display font-bold text-slate-900 text-lg">ResNet Analysis</h4>
                         <p className="text-sm text-slate-500 mt-1 max-w-sm leading-relaxed">Product exhibits 16% structural deviation from pristine baseline. Scuffs detected on lower heel.</p>
                         <div className="mt-4 flex gap-2">
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 border border-amber-200/50 text-[10px] uppercase tracking-wide font-bold rounded-md">Minor Damage</span>
                            <span className="px-2.5 py-1 bg-rose-100 text-rose-700 border border-rose-200/50 text-[10px] uppercase tracking-wide font-bold rounded-md">Deny Request</span>
                         </div>
                      </div>
                      
                      <div className="w-24 h-24 rounded-full border-4 border-slate-100 flex items-center justify-center relative flex-shrink-0">
                         <svg className="absolute inset-0 w-full h-full transform -rotate-90">
                            <circle cx="44" cy="44" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-cyan-500" strokeDasharray="276" strokeDashoffset={276 - (276 * 84) / 100} style={{ transition: 'stroke-dashoffset 2s ease-out' }} />
                         </svg>
                         <div className="flex flex-col items-center">
                           <span className="text-2xl font-bold text-slate-800 tracking-tighter">84<span className="text-sm text-slate-400 font-medium">%</span></span>
                           <span className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Match</span>
                         </div>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="h-24 flex-1 bg-slate-50 border border-slate-200 shadow-sm rounded-xl flex items-center justify-center flex-col gap-2 hover:bg-slate-100 transition-colors cursor-default">
                        <CheckCircle className="w-6 h-6 text-emerald-500" />
                        <div className="text-xs font-bold text-emerald-700">Authentic Product</div>
                      </div>
                      <div className="h-24 flex-1 bg-slate-50 border border-slate-200 shadow-sm rounded-xl flex items-center justify-center flex-col gap-2 hover:bg-slate-100 transition-colors cursor-default">
                        <Brain className="w-6 h-6 text-indigo-500" />
                        <div className="text-xs font-bold text-indigo-700">Behavior: 72% Risk</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Features Section */}
      <section id="features" className="py-24 bg-white/80 backdrop-blur-md border-y border-slate-200/50 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-indigo-600 font-bold tracking-wide uppercase text-sm mb-2">Platform Capabilities</h2>
            <h3 className="font-display text-4xl font-bold text-slate-900 mb-4">Enterprise-grade return intelligence</h3>
            <p className="text-slate-500 text-lg">Stop relying on manual inspection. Our machine learning pipeline instantly verifies product authenticity and assesses damage.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Brain className="w-6 h-6 text-indigo-600" />}
              title="Predictive Fraud Analysis"
              desc="Historical customer behavior scoring identifies high-risk operators in real-time."
            />
            <FeatureCard
              icon={<ImageIcon className="w-6 h-6 text-purple-600" />}
              title="Image Similarity Network"
              desc="Deep-learning feature extraction guarantees the returned product matches the exact baseline sent."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-emerald-600" />}
              title="Damage Detection Heuristics"
              desc="Laplacian edge-variance algorithms pinpoint hidden cracks, scratches, and structural damage."
            />
            <FeatureCard
              icon={<BarChart3 className="w-6 h-6 text-blue-600" />}
              title="Operational Dashboard"
              desc="Comprehensive queue management with detailed analytical reports for store managers."
            />
            <FeatureCard
              icon={<Shield className="w-6 h-6 text-slate-700" />}
              title="Secure JWT Architecture"
              desc="Role-based access controls separate customer-facing tracking from managerial capabilities."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-6 h-6 text-rose-500" />}
              title="Immediate ROI"
              desc="Slash manual processing times by an average of 74% within the first month of deployment."
            />
          </div>
        </div>
      </section>

      {/* 4. Demo Section */}
      <section id="demo" className="py-24 bg-slate-900 text-white overflow-hidden relative">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-indigo-500/20 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1">
              <h2 className="text-indigo-400 font-bold tracking-wide uppercase text-sm mb-2">How it Works</h2>
              <h3 className="font-display text-4xl font-bold mb-6">Seamless execution,<br />instantaneous results.</h3>
              <div className="space-y-8 mt-10">
                <DemoStep num="01" title="Customer Uploads Request" desc="The customer initiates a return, uploading images of the received product securely through their dashboard." />
                <DemoStep num="02" title="Manager Adds Baseline" desc="Operations quickly uploads the original shipping condition image for an unbiased comparison." />
                <DemoStep num="03" title="AI Verification" desc="ReturnAI compares embeddings and outputs Risk/Damage metrics directly onto the manager queue." />
              </div>
            </div>

            <div className="flex-1 w-full max-w-md bg-slate-800/80 backdrop-blur-md border border-slate-700 p-8 rounded-3xl shadow-2xl relative">
              <div className="absolute -top-4 -right-4 bg-indigo-600 text-white font-bold px-4 py-2 rounded-xl shadow-lg shadow-indigo-500/30 transform rotate-3">
                Live Analysis
              </div>
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                  <span className="text-slate-400 font-medium font-mono text-sm uppercase">Similarity Score</span>
                  <span className="text-rose-400 font-mono font-bold text-xl drop-shadow-sm">12%</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                  <span className="text-slate-400 font-medium font-mono text-sm uppercase">Customer Risk</span>
                  <span className="text-orange-400 font-mono font-bold text-xl drop-shadow-sm">84%</span>
                </div>
                <div className="flex items-center justify-between border-b border-slate-700/50 pb-4">
                  <span className="text-slate-400 font-medium font-mono text-sm uppercase">Damage Detected</span>
                  <span className="text-slate-200 font-mono font-bold text-xl">Severe</span>
                </div>
                <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 text-center mt-6 shadow-inner">
                  <span className="text-rose-400 font-bold flex items-center justify-center gap-2 uppercase tracking-wide">
                    <ShieldCheck className="w-5 h-5" /> REJECT RECOMMENDATION
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Contact / Footer */}
      <footer id="contact" className="bg-white border-t border-slate-200 pt-20 pb-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-5 gap-12 mb-16">
            <div className="md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <img src={logoImage} alt="ReturnAI Logo" className="h-8 object-contain drop-shadow-sm" />
                <span className="font-display text-2xl font-bold text-slate-900 tracking-tight">ReturnAI</span>
              </div>
              <p className="text-slate-500 leading-relaxed pr-8">
                The world's most advanced operational platform for e-commerce return verification and fraud prevention. Built with precision machine learning.
              </p>
            </div>

            <div className="md:col-span-1">
              <h4 className="font-bold text-slate-900 mb-4">Platform</h4>
              <ul className="space-y-3">
                <li><a href="#features" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Features</a></li>
                <li><a href="#demo" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Live Demo</a></li>
                <li><Link to="/login" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Login Portal</Link></li>
                <li><Link to="/delivery/login" className="text-slate-500 text-sm font-medium hover:text-indigo-600 transition-colors">Delivery Portal</Link></li>
              </ul>
            </div>

            <div className="md:col-span-2">
              <h4 className="font-bold text-slate-900 mb-4">Contact Information</h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50 mt-0.5"><Mail className="w-4 h-4 text-indigo-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-slate-700">Email Us</span>
                    <a href="mailto:hello@returnai.com" className="hover:text-indigo-600 transition-colors">hello@returnai.com</a>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50 mt-0.5"><Phone className="w-4 h-4 text-indigo-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-slate-700">Call Us</span>
                    <span>1-800-RETURN-AI</span>
                  </div>
                </li>
                <li className="flex items-start gap-3 text-slate-500 text-sm font-medium">
                  <div className="p-2 border border-slate-100 rounded-lg bg-slate-50 mt-0.5"><MapPin className="w-4 h-4 text-indigo-600" /></div>
                  <div className="flex flex-col">
                    <span className="text-slate-700">Headquarters</span>
                    <span>123 AI Boulevard, Silicon Valley, CA</span>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          <div className="flex flex-col md:flex-row items-center justify-between pt-8 border-t border-slate-100">
            <div className="text-slate-400 text-sm font-medium mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} ReturnAI Technologies. All rights reserved.
            </div>
            <div className="flex gap-6">
              <a href="#" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">Privacy Policy</a>
              <a href="#" className="text-slate-400 hover:text-slate-600 text-sm font-medium transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Subcomponents
function FeatureCard({ icon, title, desc }) {
  return (
    <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-indigo-50/40 hover:-translate-y-1 transition-all duration-300 group">
      <div className="w-12 h-12 bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 group-hover:border-indigo-100 rounded-xl flex items-center justify-center mb-6 transition-colors shadow-sm">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900 text-xl mb-3">{title}</h4>
      <p className="text-slate-500 leading-relaxed font-medium text-sm">{desc}</p>
    </div>
  );
}

function DemoStep({ num, title, desc }) {
  return (
    <div className="flex gap-4 group">
      <div className="flex flex-col items-center">
        <div className="w-10 h-10 rounded-full border border-indigo-500/30 bg-indigo-500/10 flex items-center justify-center font-mono font-bold text-indigo-400 group-hover:bg-indigo-500 group-hover:text-white transition-colors shadow-inner">
          {num}
        </div>
        <div className="w-0.5 h-16 bg-slate-800 my-2 group-last:hidden" />
      </div>
      <div className="pb-4">
        <h4 className="text-xl font-bold text-white mb-2">{title}</h4>
        <p className="text-slate-400 leading-relaxed font-medium text-sm max-w-sm">{desc}</p>
      </div>
    </div>
  );
}
