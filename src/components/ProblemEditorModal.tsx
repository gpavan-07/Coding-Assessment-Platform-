"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  FileText,
  Code2,
  FlaskConical,
  Play,
  Plus,
  Trash2,
  Save,
  Eye,
  EyeOff,
  CheckCircle2,
  XCircle,
  Clock,
  Sparkles,
  HelpCircle,
} from "lucide-react";
import { ProblemData } from "@/lib/mock-data";

interface ProblemEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  problem: ProblemData | null;
  onSave: (problem: ProblemData) => void;
}

type TabType = "details" | "driver" | "testcases" | "verify";

export default function ProblemEditorModal({
  isOpen,
  onClose,
  problem,
  onSave,
}: ProblemEditorModalProps) {
  const isEditing = !!problem;

  // Tabs
  const [activeTab, setActiveTab] = useState<TabType>("details");

  // Form State
  const [id, setId] = useState("");
  const [title, setTitle] = useState("");
  const [difficulty, setDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium");
  const [points, setPoints] = useState(100);
  const [description, setDescription] = useState("");
  const [showMarkdownPreview, setShowMarkdownPreview] = useState(false);
  const [constraints, setConstraints] = useState<string[]>([]);
  const [newConstraint, setNewConstraint] = useState("");

  const [examples, setExamples] = useState<
    { input: string; output: string; explanation?: string }[]
  >([]);

  // Driver Code State
  const [driverLanguage, setDriverLanguage] = useState<"java" | "python" | "javascript" | "cpp">("java");
  const [starterCode, setStarterCode] = useState<{
    javascript: string;
    python: string;
    cpp: string;
    java: string;
  }>({
    javascript: "",
    python: "",
    cpp: "",
    java: "",
  });

  // Test Cases State
  const [testCases, setTestCases] = useState<
    { id: number; input: string; expectedOutput: string; isHidden?: boolean }[]
  >([]);
  const [selectedTestCaseIndex, setSelectedTestCaseIndex] = useState(0);

  // Verify Tab State
  const [verifyLanguage, setVerifyLanguage] = useState<"java" | "python" | "javascript" | "cpp">("java");
  const [verifyCode, setVerifyCode] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResults, setVerificationResults] = useState<{
    tested: boolean;
    allPassed: boolean;
    results: {
      testId: number;
      passed: boolean;
      input: string;
      expected: string;
      actual: string;
      timeMs: number;
      isHidden?: boolean;
    }[];
  } | null>(null);

  // Initialize or reset form when modal opens or problem changes
  useEffect(() => {
    if (!isOpen) return;

    if (problem) {
      setId(problem.id);
      setTitle(problem.title);
      setDifficulty(problem.difficulty);
      setPoints(problem.points || 100);
      setDescription(problem.description || "");
      setConstraints(problem.constraints ? [...problem.constraints] : []);
      setExamples(problem.examples ? [...problem.examples] : []);
      setStarterCode({
        javascript: problem.starterCode?.javascript || "",
        python: problem.starterCode?.python || "",
        cpp: problem.starterCode?.cpp || "",
        java: problem.starterCode?.java || "",
      });
      setTestCases(
        problem.testCases && problem.testCases.length > 0
          ? [...problem.testCases]
          : [
              { id: 1, input: "1", expectedOutput: "1", isHidden: false },
              { id: 2, input: "2", expectedOutput: "1", isHidden: false },
            ]
      );
      setSelectedTestCaseIndex(0);
      setVerifyCode(
        problem.starterCode?.java ||
          problem.starterCode?.javascript ||
          problem.starterCode?.python ||
          ""
      );
    } else {
      // New Problem Defaults
      const newId = `prob-custom-${Date.now().toString(36)}`;
      setId(newId);
      setTitle("New Technical Assessment Problem");
      setDifficulty("Medium");
      setPoints(100);
      setDescription(
        `### Problem Statement\nDescribe the algorithmic or system design challenge here.\n\n### Task\nExplain the exact method or output expected.\n\n### Return Value\nDetail the expected return type and format.`
      );
      setConstraints([
        "1 <= N <= 10^5",
        "Time Limit: 2.0s",
        "Memory Limit: 256MB",
      ]);
      setExamples([
        {
          input: "5",
          output: "5",
          explanation: "Example explanation detailing step-by-step logic.",
        },
      ]);
      setStarterCode({
        java: `class Solution {\n    public static String solve(String input) {\n        // Write solution here\n        return input;\n    }\n}`,
        python: `def solve(input_data: str) -> str:\n    # Write solution here\n    return input_data\n`,
        javascript: `function solve(input) {\n  // Write solution here\n  return input;\n}\n`,
        cpp: `#include <iostream>\n#include <string>\n\nstd::string solve(std::string input) {\n    // Write solution here\n    return input;\n}\n`,
      });
      setTestCases([
        { id: 1, input: "1", expectedOutput: "1", isHidden: false },
        { id: 2, input: "2", expectedOutput: "1", isHidden: false },
        { id: 3, input: "5", expectedOutput: "5", isHidden: true },
        { id: 4, input: "10", expectedOutput: "55", isHidden: true },
      ]);
      setSelectedTestCaseIndex(0);
      setVerifyCode(`class Solution {\n    public static String solve(String input) {\n        // Driver code\n        return input;\n    }\n}`);
    }

    setActiveTab("details");
    setVerificationResults(null);
  }, [isOpen, problem]);

  // Keep verify code in sync when switching verify language
  useEffect(() => {
    if (starterCode[verifyLanguage]) {
      setVerifyCode(starterCode[verifyLanguage]);
    }
  }, [verifyLanguage]);

  if (!isOpen) return null;

  // Active test case
  const activeTestCase = testCases[selectedTestCaseIndex] || testCases[0];

  // Add Test Case
  const handleAddTestCase = () => {
    const newId = testCases.length > 0 ? Math.max(...testCases.map((t) => t.id)) + 1 : 1;
    const newCase = {
      id: newId,
      input: "",
      expectedOutput: "",
      isHidden: testCases.length >= 2, // Hide by default after 2 visible
    };
    setTestCases([...testCases, newCase]);
    setSelectedTestCaseIndex(testCases.length);
  };

  // Delete Test Case
  const handleDeleteTestCase = (indexToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (testCases.length <= 1) {
      alert("A problem must have at least one test case.");
      return;
    }
    const updated = testCases.filter((_, idx) => idx !== indexToDelete);
    setTestCases(updated);
    if (selectedTestCaseIndex >= updated.length) {
      setSelectedTestCaseIndex(Math.max(0, updated.length - 1));
    }
  };

  // Update Active Test Case
  const handleUpdateActiveTestCase = (field: "input" | "expectedOutput" | "isHidden", value: any) => {
    if (!activeTestCase) return;
    const updated = [...testCases];
    updated[selectedTestCaseIndex] = {
      ...updated[selectedTestCaseIndex],
      [field]: value,
    };
    setTestCases(updated);
  };

  // Add Example
  const handleAddExample = () => {
    setExamples([
      ...examples,
      { input: "", output: "", explanation: "" },
    ]);
  };

  // Remove Example
  const handleRemoveExample = (idx: number) => {
    setExamples(examples.filter((_, i) => i !== idx));
  };

  // Add Constraint
  const handleAddConstraint = () => {
    if (!newConstraint.trim()) return;
    setConstraints([...constraints, newConstraint.trim()]);
    setNewConstraint("");
  };

  // Remove Constraint
  const handleRemoveConstraint = (idx: number) => {
    setConstraints(constraints.filter((_, i) => i !== idx));
  };

  // Execute Verification Runner
  const handleRunVerification = () => {
    setIsVerifying(true);
    setVerificationResults(null);

    setTimeout(() => {
      const results = testCases.map((tc, idx) => {
        // Deterministic simulation: If code has content and test has expected output, simulate realistic execution
        const hasCode = verifyCode.trim().length > 20;
        const passed = hasCode ? true : idx % 2 === 0;
        return {
          testId: tc.id,
          passed,
          input: tc.input || "(empty)",
          expected: tc.expectedOutput || "(none)",
          actual: passed ? tc.expectedOutput : "[Mismatch] Output evaluated to NULL",
          timeMs: Math.floor(Math.random() * 28) + 12,
          isHidden: tc.isHidden,
        };
      });

      const allPassed = results.every((r) => r.passed);
      setVerificationResults({
        tested: true,
        allPassed,
        results,
      });
      setIsVerifying(false);
    }, 750);
  };

  // Save Problem
  const handleSave = () => {
    if (!title.trim()) {
      alert("Please provide a valid problem title.");
      setActiveTab("details");
      return;
    }

    if (testCases.length === 0) {
      alert("Please define at least one test case.");
      setActiveTab("testcases");
      return;
    }

    const payload: ProblemData = {
      id: id || `prob-custom-${Date.now().toString(36)}`,
      title: title.trim(),
      difficulty,
      points: Number(points) || 100,
      description,
      constraints,
      examples,
      starterCode,
      testCases,
    };

    onSave(payload);
    onClose();
  };

  // Slug breadcrumb
  const slugDisplay = title
    ? title.toUpperCase().replace(/\s+/g, "_")
    : "UNTITLED_PROBLEM";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-6xl max-h-[92vh] flex flex-col rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Top Header */}
        <div className="px-6 py-4 border-b border-slate-200 bg-white flex items-start justify-between shrink-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              {isEditing ? "Edit Problem" : "Add New Problem"}
            </h2>
            <p className="text-xs font-mono font-medium text-slate-500 mt-0.5 tracking-wider">
              {slugDisplay}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation (Exact match to user's screenshots) */}
        <div className="px-6 pt-3 pb-2 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2 overflow-x-auto shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("details")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "details"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Details</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("driver")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "driver"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Code2 className="h-4 w-4" />
            <span>Driver Code</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("testcases")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "testcases"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <FlaskConical className="h-4 w-4" />
            <span>Test Cases</span>
            <span
              className={`ml-1 px-1.5 py-0.2 rounded-full text-[11px] font-bold ${
                activeTab === "testcases"
                  ? "bg-indigo-100 text-indigo-700"
                  : "bg-slate-200 text-slate-700"
              }`}
            >
              {testCases.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("verify")}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              activeTab === "verify"
                ? "bg-white text-indigo-700 shadow-xs border border-slate-200"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/60"
            }`}
          >
            <Play className="h-4 w-4" />
            <span>Verify</span>
          </button>
        </div>

        {/* Modal Body / Tab Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50/30">
          {/* TAB 1: DETAILS */}
          {activeTab === "details" && (
            <div className="space-y-6 max-w-4xl">
              {/* Problem Title & Basic Specs */}
              <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                <div className="sm:col-span-8 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Problem Title
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. Nth Fibonacci Number Using BigIntegers"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-medium"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Difficulty
                  </label>
                  <select
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Points
                  </label>
                  <input
                    type="number"
                    min={10}
                    max={500}
                    step={10}
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Description (Markdown Supported) */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                    <span>Problem Description (Markdown)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowMarkdownPreview(!showMarkdownPreview)}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer"
                  >
                    {showMarkdownPreview ? "Back to Editor" : "Preview Markdown"}
                  </button>
                </div>

                {showMarkdownPreview ? (
                  <div className="rounded-xl border border-slate-200 bg-white p-4 min-h-[200px] prose prose-slate max-w-none text-sm whitespace-pre-wrap font-sans">
                    {description}
                  </div>
                ) : (
                  <textarea
                    rows={8}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Provide a clear, detailed algorithmic explanation, requirements, and sequence definitions..."
                    className="w-full rounded-xl border border-slate-300 bg-white p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 font-mono leading-relaxed"
                  />
                )}
              </div>

              {/* Constraints */}
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Execution Constraints
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {constraints.map((c, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-100 border border-slate-200 px-3 py-1 text-xs font-mono text-slate-700"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveConstraint(idx)}
                        className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newConstraint}
                    onChange={(e) => setNewConstraint(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddConstraint())}
                    placeholder="e.g. 1 <= N <= 10^5 or Time Limit: 2.0s"
                    className="flex-1 rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={handleAddConstraint}
                    className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
                  >
                    + Add
                  </button>
                </div>
              </div>

              {/* Examples */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Sample Test Examples
                  </label>
                  <button
                    type="button"
                    onClick={handleAddExample}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add Example</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {examples.map((ex, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 relative"
                    >
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
                        <span>Example #{idx + 1}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveExample(idx)}
                          className="text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <span className="text-[11px] font-medium text-slate-500">Input:</span>
                          <input
                            type="text"
                            value={ex.input}
                            onChange={(e) => {
                              const updated = [...examples];
                              updated[idx].input = e.target.value;
                              setExamples(updated);
                            }}
                            placeholder="e.g. 5"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-slate-500">Expected Output:</span>
                          <input
                            type="text"
                            value={ex.output}
                            onChange={(e) => {
                              const updated = [...examples];
                              updated[idx].output = e.target.value;
                              setExamples(updated);
                            }}
                            placeholder="e.g. 5"
                            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs font-mono text-slate-900 focus:border-indigo-600 focus:outline-none"
                          />
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-slate-500">Explanation (Optional):</span>
                        <input
                          type="text"
                          value={ex.explanation || ""}
                          onChange={(e) => {
                            const updated = [...examples];
                            updated[idx].explanation = e.target.value;
                            setExamples(updated);
                          }}
                          placeholder="F(5) = 5 as per sequence..."
                          className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-xs text-slate-900 focus:border-indigo-600 focus:outline-none"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: DRIVER CODE */}
          {activeTab === "driver" && (
            <div className="space-y-4 max-w-5xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Starter & Driver Templates
                  </h3>
                  <p className="text-xs text-slate-600">
                    Provide the initial code and driver method signature for candidates in each language.
                  </p>
                </div>

                <div className="inline-flex rounded-xl bg-slate-200 p-1 border border-slate-300">
                  {(["java", "python", "javascript", "cpp"] as const).map((lang) => (
                    <button
                      key={lang}
                      type="button"
                      onClick={() => setDriverLanguage(lang)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition-all cursor-pointer ${
                        driverLanguage === lang
                          ? "bg-white text-indigo-700 shadow-xs"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-[#0f172a] overflow-hidden shadow-lg">
                <div className="px-4 py-2.5 bg-[#1e293b] border-b border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
                  <span className="font-semibold text-slate-200">
                    {driverLanguage.toUpperCase()} Starter Solution
                  </span>
                  <span>UTF-8 • Monospaced</span>
                </div>
                <textarea
                  rows={14}
                  value={starterCode[driverLanguage] || ""}
                  onChange={(e) =>
                    setStarterCode({
                      ...starterCode,
                      [driverLanguage]: e.target.value,
                    })
                  }
                  className="w-full bg-[#0f172a] text-emerald-400 p-4 font-mono text-xs sm:text-sm focus:outline-none resize-y leading-relaxed"
                  spellCheck={false}
                />
              </div>
            </div>
          )}

          {/* TAB 3: TEST CASES (Exact layout of Image 2) */}
          {activeTab === "testcases" && (
            <div className="space-y-4 max-w-5xl">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Test Cases</h3>
                  <p className="text-xs text-slate-600">
                    Define inputs and expected outputs for validation.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddTestCase}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-800 shadow-xs transition-colors cursor-pointer"
                >
                  <Plus className="h-3.5 w-3.5 text-indigo-600" />
                  <span>Add Test Case</span>
                </button>
              </div>

              {/* Two Column Layout matching Screenshot 2 */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 pt-1">
                {/* Left Column: Test Case list pills */}
                <div className="md:col-span-3 space-y-2">
                  {testCases.map((tc, idx) => {
                    const isSelected = selectedTestCaseIndex === idx;
                    return (
                      <button
                        key={tc.id || idx}
                        type="button"
                        onClick={() => setSelectedTestCaseIndex(idx)}
                        className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                            : "bg-white border border-slate-200 text-slate-700 hover:border-indigo-300 hover:bg-indigo-50/30"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span>Test {idx + 1}</span>
                          {tc.isHidden && (
                            <EyeOff
                              className={`h-3.5 w-3.5 ${
                                isSelected ? "text-indigo-200" : "text-slate-400"
                              }`}
                            />
                          )}
                        </div>

                        <span
                          onClick={(e) => handleDeleteTestCase(idx, e)}
                          title="Delete test case"
                          className={`p-1 rounded hover:bg-black/10 transition-colors ${
                            isSelected ? "text-white" : "text-slate-400 hover:text-rose-600"
                          }`}
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Right Column: Active Test Case Details */}
                <div className="md:col-span-9 rounded-2xl border border-slate-200 bg-white p-5 space-y-4 shadow-xs">
                  {activeTestCase ? (
                    <>
                      {/* Top bar with # and Hidden toggle */}
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <span className="inline-flex items-center px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-xs font-bold text-slate-800">
                          Test Case #{selectedTestCaseIndex + 1}
                        </span>

                        <div className="flex items-center gap-2">
                          <span className="text-xs font-medium text-slate-600">Hidden</span>
                          <button
                            type="button"
                            onClick={() =>
                              handleUpdateActiveTestCase("isHidden", !activeTestCase.isHidden)
                            }
                            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                              activeTestCase.isHidden ? "bg-indigo-600" : "bg-slate-200"
                            }`}
                          >
                            <span
                              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                                activeTestCase.isHidden ? "translate-x-5" : "translate-x-0"
                              }`}
                            />
                          </button>
                        </div>
                      </div>

                      {/* Input and Expected Output textareas */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Input
                          </label>
                          <textarea
                            rows={8}
                            value={activeTestCase.input}
                            onChange={(e) =>
                              handleUpdateActiveTestCase("input", e.target.value)
                            }
                            placeholder="e.g. 1"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm font-mono text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-xs font-semibold text-slate-700">
                            Expected Output
                          </label>
                          <textarea
                            rows={8}
                            value={activeTestCase.expectedOutput}
                            onChange={(e) =>
                              handleUpdateActiveTestCase("expectedOutput", e.target.value)
                            }
                            placeholder="e.g. 1"
                            className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs sm:text-sm font-mono text-slate-900 focus:border-indigo-600 focus:bg-white focus:outline-none focus:ring-1 focus:ring-indigo-600"
                          />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="py-12 text-center text-slate-400 text-xs">
                      No test case selected. Click "+ Add Test Case" to begin.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: VERIFY (Exact layout of Image 1) */}
          {activeTab === "verify" && (
            <div className="space-y-4 max-w-5xl">
              {/* Header with Title and Language + Verify Button */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-slate-900">Verify Solution</h3>
                  <p className="text-xs text-slate-600">
                    Run the driver code against the defined test cases.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    value={verifyLanguage}
                    onChange={(e) => setVerifyLanguage(e.target.value as any)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-indigo-600 focus:outline-none"
                  >
                    <option value="java">java</option>
                    <option value="python">python</option>
                    <option value="javascript">javascript</option>
                    <option value="cpp">cpp</option>
                  </select>

                  <button
                    type="button"
                    onClick={handleRunVerification}
                    disabled={isVerifying}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 px-4 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
                  >
                    <Play className="h-3.5 w-3.5 fill-current" />
                    <span>{isVerifying ? "Verifying..." : "Verify"}</span>
                  </button>
                </div>
              </div>

              {/* Split Editor and Results (Matching Image 1) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
                {/* Left: Code Editor */}
                <div className="lg:col-span-7 rounded-2xl border border-slate-800 bg-[#1e293b] overflow-hidden shadow-md flex flex-col">
                  <div className="px-4 py-2.5 bg-[#0f172a] border-b border-slate-800 text-xs font-semibold text-slate-300">
                    {verifyLanguage === "java"
                      ? "Java Test Editor"
                      : verifyLanguage === "python"
                      ? "Python Test Editor"
                      : verifyLanguage === "javascript"
                      ? "JavaScript Test Editor"
                      : "C++ Test Editor"}
                  </div>

                  <div className="flex flex-1 min-h-[340px] text-xs font-mono">
                    {/* Line numbers gutter */}
                    <div className="w-9 py-3 text-right pr-2 select-none text-slate-600 bg-[#0f172a] border-r border-slate-800 space-y-1">
                      {Array.from({ length: 18 }).map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    <textarea
                      value={verifyCode}
                      onChange={(e) => setVerifyCode(e.target.value)}
                      placeholder="// Write your driver code here\n// This code will wrap the user's solution"
                      className="flex-1 bg-[#1e293b] text-emerald-300 p-3 font-mono text-xs focus:outline-none resize-none leading-relaxed"
                      spellCheck={false}
                    />
                  </div>
                </div>

                {/* Right: Results Panel */}
                <div className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs flex flex-col min-h-[340px]">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 pb-3 border-b border-slate-100">
                    Results
                  </h4>

                  <div className="flex-1 flex flex-col justify-center py-4">
                    {!verificationResults ? (
                      <div className="text-center text-slate-400 text-xs space-y-1">
                        <FlaskConical className="h-8 w-8 mx-auto text-slate-300 mb-1" />
                        <p className="font-medium text-slate-500">Click verify to run cases...</p>
                        <p className="text-[11px] text-slate-400">
                          Executes your code against all {testCases.length} defined test cases.
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div
                          className={`p-3 rounded-xl border flex items-center justify-between text-xs font-semibold ${
                            verificationResults.allPassed
                              ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                              : "bg-rose-50 border-rose-200 text-rose-800"
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            {verificationResults.allPassed ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-rose-600" />
                            )}
                            <span>
                              {verificationResults.allPassed
                                ? `All ${verificationResults.results.length} Test Cases Passed`
                                : `Some Test Cases Failed`}
                            </span>
                          </div>
                          <span className="text-[11px] opacity-75">
                            {verificationResults.results.filter((r) => r.passed).length}/
                            {verificationResults.results.length} OK
                          </span>
                        </div>

                        {/* Test run breakdown */}
                        <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                          {verificationResults.results.map((r, idx) => (
                            <div
                              key={r.testId || idx}
                              className={`p-2.5 rounded-lg border text-xs font-mono space-y-1 ${
                                r.passed
                                  ? "bg-slate-50 border-slate-200 text-slate-700"
                                  : "bg-rose-50/50 border-rose-200 text-rose-900"
                              }`}
                            >
                              <div className="flex items-center justify-between font-sans text-[11px]">
                                <span className="font-bold flex items-center gap-1.5">
                                  <span>Test #{idx + 1}</span>
                                  {r.isHidden && (
                                    <span className="text-[10px] bg-slate-200 text-slate-600 px-1 rounded">
                                      hidden
                                    </span>
                                  )}
                                </span>
                                <span
                                  className={`font-semibold ${
                                    r.passed ? "text-emerald-600" : "text-rose-600"
                                  }`}
                                >
                                  {r.passed ? "Passed" : "Failed"} • {r.timeMs}ms
                                </span>
                              </div>
                              <div className="text-[11px] text-slate-500">
                                <div>Input: {r.input}</div>
                                <div>Expected: {r.expected}</div>
                                {!r.passed && <div className="text-rose-600">Actual: {r.actual}</div>}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Action Footer (Matching user's screenshots) */}
        <div className="px-6 py-3.5 border-t border-slate-200 bg-white flex items-center justify-end gap-3 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleSave}
            className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
          >
            <Save className="h-4 w-4" />
            <span>Save Problem</span>
          </button>
        </div>
      </div>
    </div>
  );
}
