"use client";

import React, { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useAssessment } from "@/lib/assessment-store";
import { MOCK_EXAMS } from "@/lib/mock-data";
import {
  Clock,
  Play,
  Send,
  ArrowLeft,
  CheckCircle2,
  XCircle,
  Terminal,
  FileCode,
  RotateCcw,
  Sparkles,
} from "lucide-react";

// Dynamically import Monaco Editor to avoid SSR hydration issues
const Editor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type LanguageKey = "javascript" | "python" | "cpp" | "java";

export default function ExamIdePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const examId = resolvedParams.id;
  const router = useRouter();
  const {
    exams,
    submitExamAttempt,
    currentUser,
    enterExamSession,
    leaveExamSession,
    recordTestRun,
  } = useAssessment();

  // Find active exam
  const exam = exams.find((e) => e.id === examId) || MOCK_EXAMS[0];
  const problem = exam.problems[0];

  // Register live writing session
  useEffect(() => {
    const sessionId = enterExamSession(exam.id, currentUser?.name);
    return () => {
      leaveExamSession(sessionId);
    };
  }, [exam.id, currentUser, enterExamSession, leaveExamSession]);

  // Editor states (starts completely blank without any prefilled code)
  const [language, setLanguage] = useState<LanguageKey>("javascript");
  const [code, setCode] = useState<string>("");

  // Update language without injecting prefilled code
  const handleLanguageChange = (newLang: LanguageKey) => {
    setLanguage(newLang);
  };

  const handleResetCode = () => {
    if (confirm("Clear editor and remove all current code?")) {
      setCode("");
    }
  };

  // Timer state
  const [secondsRemaining, setSecondsRemaining] = useState(exam.durationMinutes * 60);

  useEffect(() => {
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleFinalSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Test Runner States
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [activeTestCaseTab, setActiveTestCaseTab] = useState(0);
  const [testResults, setTestResults] = useState<
    | {
        id: number;
        passed: boolean;
        output: string;
        timeMs: number;
      }[]
    | null
  >(null);

  // Submit Modal
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Run Test Cases against simulated sandbox runner
  const handleRunTests = () => {
    setIsRunningTests(true);
    recordTestRun(exam.id);

    setTimeout(() => {
      const results = (problem?.testCases || []).map((tc, idx) => {
        const passes = idx === 0 || code.length > 50;
        return {
          id: tc.id,
          passed: passes,
          output: passes ? tc.expectedOutput : "[Runtime Test Deviation]",
          timeMs: Math.floor(Math.random() * 25) + 12,
        };
      });

      setTestResults(results);
      setIsRunningTests(false);
    }, 900);
  };

  // Final Assessment Submission
  const handleFinalSubmit = () => {
    setIsSubmitting(true);

    const passedCount = testResults
      ? testResults.filter((r) => r.passed).length
      : 2;
    const totalCount = problem?.testCases.length || 2;

    const { submission } = submitExamAttempt({
      examId: exam.id,
      language,
      submittedCode: code,
      testCasesPassed: passedCount,
      totalTestCases: totalCount,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      setShowSubmitModal(false);
      router.push(`/report/${submission.id}`);
    }, 1200);
  };

  return (
    <div className="flex flex-col h-screen bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Top Header Bar */}
      <header className="h-14 border-b border-slate-200 bg-white px-4 flex items-center justify-between shrink-0 shadow-xs">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-xs text-slate-600 hover:text-slate-900 px-2.5 py-1.5 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Dashboard</span>
          </Link>

          <div className="h-4 w-px bg-slate-200" />

          <div className="flex items-center gap-2.5">
            <span className="text-xl">{exam.companyLogo}</span>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 tracking-wide">
                  {exam.title}
                </span>
                <span className="text-[10px] uppercase font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                  {exam.companyName}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Center / Right controls */}
        <div className="flex items-center gap-3">
          {/* Language Selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500 font-medium hidden sm:inline">Language:</span>
            <select
              value={language}
              onChange={(e) => handleLanguageChange(e.target.value as LanguageKey)}
              className="rounded-lg bg-white border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-800 focus:outline-none focus:border-indigo-600 transition-colors"
            >
              <option value="javascript">JavaScript (ES6+)</option>
              <option value="python">Python 3.12</option>
              <option value="cpp">C++ 20</option>
              <option value="java">Java 21</option>
            </select>
          </div>

          {/* Countdown Timer */}
          <div
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border font-mono text-xs font-bold ${
              secondsRemaining < 300
                ? "bg-rose-50 border-rose-300 text-rose-700 animate-pulse"
                : "bg-slate-100 border-slate-200 text-slate-800"
            }`}
          >
            <Clock className="h-3.5 w-3.5" />
            <span>{formatTimer(secondsRemaining)}</span>
          </div>

          {/* Action Buttons */}
          <button
            onClick={handleRunTests}
            disabled={isRunningTests}
            className="flex items-center gap-1.5 rounded-lg bg-white hover:bg-slate-50 disabled:opacity-50 px-3.5 py-1.5 text-xs font-semibold text-slate-700 border border-slate-300 transition-colors shadow-xs cursor-pointer"
          >
            <Play className={`h-3 w-3 ${isRunningTests ? "animate-spin" : "fill-current"}`} />
            <span>{isRunningTests ? "Running..." : "Run Tests"}</span>
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className="flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-4 py-1.5 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
          >
            <Send className="h-3 w-3" />
            <span>Submit Exam</span>
          </button>
        </div>
      </header>

      {/* Main IDE Body (Split layout) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
        {/* Left Column: Problem Details & Constraints (5 cols on lg) */}
        <div className="lg:col-span-5 border-r border-slate-200 bg-white overflow-y-auto p-6 space-y-6">
          {/* Problem Header */}
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[11px] font-semibold tracking-wider uppercase text-indigo-700">
                Problem Description
              </span>
              <span className="rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-0.5 text-[10px] font-bold">
                {problem.difficulty} • {problem.points} Points
              </span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">
              {problem.title}
            </h2>
          </div>

          {/* Description Text */}
          <div className="text-slate-700 space-y-3 leading-relaxed whitespace-pre-line text-xs sm:text-sm">
            {problem.description}
          </div>

          {/* Examples */}
          <div className="space-y-4 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Sample Examples
            </h3>
            {problem.examples.map((ex, idx) => (
              <div
                key={idx}
                className="rounded-xl border border-slate-200 bg-slate-50 p-4 space-y-2 text-xs"
              >
                <div className="font-semibold text-slate-800">Example {idx + 1}:</div>
                <div>
                  <span className="text-slate-500 font-mono block mb-1">Input:</span>
                  <div className="rounded-lg bg-white p-2.5 font-mono text-[11px] text-indigo-700 border border-slate-200 overflow-x-auto">
                    {ex.input}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 font-mono block mb-1">Expected Output:</span>
                  <div className="rounded-lg bg-white p-2.5 font-mono text-[11px] text-emerald-700 border border-slate-200 overflow-x-auto">
                    {ex.output}
                  </div>
                </div>
                {ex.explanation && (
                  <div className="text-slate-600 text-[11px] pt-1">
                    <span className="text-slate-500 font-medium">Explanation: </span>
                    {ex.explanation}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Constraints */}
          <div className="space-y-2 pt-4 border-t border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Constraints & Specifications
            </h3>
            <ul className="space-y-1.5 list-disc pl-4 text-xs text-slate-600">
              {problem.constraints.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Code Editor & Test Case Runner (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white overflow-hidden">
          {/* Editor Sub-header */}
          <div className="h-10 bg-slate-100 border-b border-slate-200 px-4 flex items-center justify-between shrink-0 text-xs">
            <div className="flex items-center gap-2 text-slate-700 font-medium">
              <FileCode className="h-3.5 w-3.5 text-indigo-600" />
              <span>Solution.{language === "javascript" ? "js" : language === "python" ? "py" : language === "cpp" ? "cpp" : "java"}</span>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleResetCode}
                title="Reset editor"
                className="flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>Reset Editor</span>
              </button>
            </div>
          </div>

          {/* Monaco Editor Container in Light Theme */}
          <div className="flex-1 min-h-[300px] relative">
            <Editor
              height="100%"
              language={language === "cpp" ? "cpp" : language}
              value={code}
              theme="vs"
              onChange={(value) => setCode(value || "")}
              options={{
                fontSize: 14,
                fontFamily: "var(--font-geist-mono), monospace",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                smoothScrolling: true,
                automaticLayout: true,
                tabSize: 2,
                cursorBlinking: "smooth",
                renderLineHighlight: "all",
                bracketPairColorization: { enabled: true },
              }}
            />
          </div>

          {/* Bottom Test Runner & Console Panel */}
          <div className="h-64 border-t border-slate-200 bg-white flex flex-col shrink-0">
            {/* Panel Header */}
            <div className="h-9 border-b border-slate-200 bg-slate-50 px-4 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Terminal className="h-3.5 w-3.5 text-indigo-600" />
                <span className="font-semibold text-slate-800">Test Cases & Evaluation Runner</span>
              </div>
              <div className="flex items-center gap-2">
                {testResults && (
                  <span className="text-[11px] font-bold text-emerald-700">
                    Passed {testResults.filter((r) => r.passed).length}/{testResults.length} Cases
                  </span>
                )}
              </div>
            </div>

            {/* Test Case Selectors */}
            <div className="flex items-center gap-1.5 px-4 py-2 border-b border-slate-200 bg-slate-50/70 overflow-x-auto">
              {(problem?.testCases || []).map((tc, idx) => {
                const res = testResults?.find((r) => r.id === tc.id);
                return (
                  <button
                    key={tc.id}
                    onClick={() => setActiveTestCaseTab(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                      activeTestCaseTab === idx
                        ? "bg-white text-indigo-700 border border-slate-300 shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <span>Case {idx + 1}</span>
                    {tc.isHidden && (
                      <span className="text-[9px] px-1 py-0.2 rounded bg-slate-200 text-slate-600">
                        Hidden
                      </span>
                    )}
                    {res &&
                      (res.passed ? (
                        <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                      ) : (
                        <XCircle className="h-3 w-3 text-rose-600" />
                      ))}
                  </button>
                );
              })}
            </div>

            {/* Active Test Case Details */}
            <div className="flex-1 p-4 overflow-y-auto text-xs font-mono space-y-3">
              {isRunningTests ? (
                <div className="flex items-center justify-center h-full gap-2 text-slate-500">
                  <Play className="h-4 w-4 animate-spin text-indigo-600" />
                  <span>Executing test suites against sandbox container...</span>
                </div>
              ) : (
                <>
                  {problem?.testCases[activeTestCaseTab] && (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Input Parameters
                        </span>
                        <div className="p-2 rounded bg-slate-50 text-indigo-700 border border-slate-200">
                          {problem.testCases[activeTestCaseTab].input}
                        </div>
                      </div>

                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                          Expected Output
                        </span>
                        <div className="p-2 rounded bg-slate-50 text-emerald-700 border border-slate-200">
                          {problem.testCases[activeTestCaseTab].expectedOutput}
                        </div>
                      </div>

                      {testResults && (
                        <div>
                          <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1">
                            Your Actual Output & Telemetry
                          </span>
                          <div className="p-2 rounded bg-slate-50 text-slate-800 border border-slate-200 flex items-center justify-between">
                            <span>{testResults[activeTestCaseTab]?.output}</span>
                            <span className="text-[10px] text-slate-500 font-sans">
                              Time: {testResults[activeTestCaseTab]?.timeMs}ms
                            </span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Submit Modal */}
      {showSubmitModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
                <Send className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Final Assessment Submission
                </h3>
                <p className="text-xs text-slate-500">
                  {exam.title} ({exam.companyName})
                </p>
              </div>
            </div>

            <div className="rounded-xl bg-slate-50 p-4 border border-slate-200 text-xs space-y-2 text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-500">Candidate:</span>
                <span className="font-semibold text-slate-900">
                  {currentUser ? currentUser.name : "Candidate Student"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Language:</span>
                <span className="font-semibold text-indigo-700 uppercase">{language}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Time Left:</span>
                <span className="font-semibold text-amber-700">{formatTimer(secondsRemaining)}</span>
              </div>
            </div>

            <div className="rounded-xl bg-indigo-50 border border-indigo-200 p-3 text-[11px] text-indigo-900 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-indigo-950">
                <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
                Instant Post-Submission Actions:
              </div>
              <p className="text-slate-700">
                1. Your comprehensive <strong>Laboratory Evaluation Report</strong> will be generated immediately with test results and latency metrics.
              </p>
              <p className="text-slate-700">
                2. Your submission is timestamped, verified, and archived in the evaluator console for candidate evaluation.
              </p>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowSubmitModal(false)}
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                Continue Coding
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white shadow-xs transition-all cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <Play className="h-3 w-3 animate-spin" />
                    <span>Evaluating & Generating...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    <span>Submit & View Lab Report</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
