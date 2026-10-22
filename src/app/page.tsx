"use client";

import React from "react";
import Link from "next/link";
import {
  Code2,
  ShieldCheck,
  ArrowRight,
  Terminal,
  PlusCircle,
  Award,
  Sparkles,
  Info,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-5xl h-80 bg-gradient-to-b from-indigo-100/50 to-transparent blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-20 pb-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto text-center space-y-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-white px-3.5 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-xs">
          <Code2 className="h-3.5 w-3.5 text-indigo-600" />
          <span>Technical Assessment & Examination Platform</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-slate-900 max-w-3xl mx-auto leading-tight">
          Evaluate Technical Skills with{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">
            Focused Coding Assessments
          </span>
        </h1>

        <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-600 leading-relaxed">
          Administer production-grade algorithmic and systems challenges in an in-browser Monaco IDE with automated test execution, live proctoring, and instant verified laboratory reports.
        </p>

        {/* Welcome Actions: Only Login, Sign Up, and About the Website */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
          <Link
            href="/auth/login"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 px-7 py-3 text-sm font-semibold text-white shadow-md shadow-indigo-600/20 transition-all"
          >
            <span>Login</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/register"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-white border border-slate-300 hover:border-slate-400 px-7 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 shadow-xs transition-all"
          >
            <PlusCircle className="h-4 w-4 text-emerald-600" />
            <span>Sign Up</span>
          </Link>
          <a
            href="#about"
            className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 hover:text-slate-900 transition-all"
          >
            <Info className="h-4 w-4 text-indigo-600" />
            <span>About the Website</span>
          </a>
        </div>
      </section>

      {/* About the Website & Core Capabilities */}
      <section id="about" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12 scroll-mt-20">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 border border-indigo-200">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Standardized Assessment Architecture</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Engineered for Academic & Enterprise Evaluation
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto">
            CodeAssess replaces basic quizzes with real-world developer assessment environments, sandboxed code execution, and verified certificates.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Terminal className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">In-Browser Monaco IDE</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Full VS Code editing experience with syntax highlighting, multi-language support (JavaScript, Python, C++, Java), automated test runner, and real-time execution feedback.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Live Telemetry & Proctoring</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Real-time monitoring of candidate active sessions, test suite executions, submission timestamps, tab integrity safeguards, and anti-cheating audit tracking.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-3 shadow-xs hover:border-slate-300 hover:shadow-md transition-all">
            <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center border border-amber-200">
              <Award className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Verified Official Certificates</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Generates high-fidelity printable PDF certificates with student name, father&apos;s name (S/O), serial number reference, institution seal, and cryptographic verification hash.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-20 border-t border-slate-200 bg-white py-10 px-4 sm:px-6 lg:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 font-bold text-slate-900">
            <Code2 className="h-4 w-4 text-indigo-600" />
            <span>CodeAssess Technical Testing Framework</span>
          </div>
          <p>© 2026 CodeAssess Inc. All evaluation records and verified certificates cryptographically logged.</p>
        </div>
      </footer>
    </div>
  );
}
