"use client";

import React, { use } from "react";
import Link from "next/link";
import { useAssessment } from "@/lib/assessment-store";
import {
  FileText,
  CheckCircle2,
  ShieldCheck,
  Printer,
  ArrowLeft,
} from "lucide-react";

export default function SubmissionReportPage({
  params,
}: {
  params: Promise<{ submissionId: string }>;
}) {
  const resolvedParams = use(params);
  const submissionId = resolvedParams.submissionId;
  const { getSubmissionById, currentUser } = useAssessment();

  const submission = getSubmissionById(submissionId);

  if (!submission) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center text-slate-900">
        <div className="h-16 w-16 rounded-2xl bg-white border border-slate-200 shadow-xs flex items-center justify-center text-slate-400 mb-4">
          <FileText className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Submission Report Not Found</h2>
        <p className="text-xs text-slate-600 mt-2 max-w-sm">
          No submission record found with ID: <span className="font-mono text-indigo-600">{submissionId}</span>.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 px-4 py-2 rounded-xl bg-indigo-600 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors shadow-xs"
        >
          Return to Assessments
        </Link>
      </div>
    );
  }

  const handlePrint = () => {
    const originalTitle = document.title;
    const candidateName = (submission.studentName || "Candidate").trim().replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_");
    document.title = `${candidateName}_Lab_Report_${submission.id}`;
    window.print();
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 print:bg-white print:text-black print:p-0">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Top Action Bar (hidden when printing) */}
        <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-xs font-medium text-slate-700 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white border border-slate-300 hover:bg-slate-50 shadow-xs transition-colors"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            <span>Back to Assessments</span>
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors shadow-xs cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5 text-indigo-600" />
              <span>Print Laboratory Report</span>
            </button>
            {currentUser?.role === "company_admin" && (
              <Link
                href={`/admin?highlightSub=${submission.id}`}
                className="flex items-center gap-2 text-xs font-semibold px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Open in Admin Console</span>
              </Link>
            )}
          </div>
        </div>

        {/* Formal Laboratory Exercise Report Document */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-10 shadow-lg print:border-none print:shadow-none print:p-4 print:bg-white">
          {/* Institutional Lab Document Header */}
          <div className="border-b-2 border-slate-200 pb-6 print:border-black space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700 print:text-black">
                  TECHNICAL ASSESSMENT BOARD • CODE VERIFICATION LAB
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 print:text-black mt-1">
                  Laboratory Exercise Evaluation Report
                </h1>
                <p className="text-xs text-slate-600 print:text-gray-700 mt-0.5">
                  Automated Sandbox Evaluation, Static Code Analysis & Runtime Telemetry
                </p>
              </div>

              <div className="sm:text-right shrink-0">
                <div className="text-[10px] font-mono uppercase text-slate-500">
                  Document Reference
                </div>
                <div className="text-xs font-mono font-bold text-indigo-700 print:text-black">
                  LAB-REP-{submission.id.toUpperCase()}
                </div>
                <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200 print:border-black print:text-black">
                  <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                  EVALUATED & CONFIRMED
                </div>
              </div>
            </div>
          </div>

          {/* Candidate & Assessment Metadata Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-6 border-b border-slate-200 print:border-gray-300 text-xs">
            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-gray-900">
                Candidate Particulars
              </h4>
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 border border-slate-200 print:bg-gray-50 print:border-gray-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Full Name:</span>
                  <span className="font-semibold text-slate-900 print:text-black">{submission.studentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Father&apos;s Name:</span>
                  <span className="font-medium text-amber-800 print:text-black">S/O {submission.fatherName || "—"}</span>
                </div>
                {submission.instituteName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Institute / Organization:</span>
                    <span className="font-semibold text-slate-900 print:text-black">{submission.instituteName}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Email:</span>
                  <span className="font-mono text-slate-700 print:text-black">{submission.studentEmail}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Registered Phone:</span>
                  <span className="font-mono text-slate-700 print:text-black">{submission.studentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Candidate ID:</span>
                  <span className="font-mono text-indigo-700 print:text-black">{submission.studentId}</span>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-gray-900">
                Assessment Particulars
              </h4>
              <div className="space-y-1.5 rounded-xl bg-slate-50 p-4 border border-slate-200 print:bg-gray-50 print:border-gray-200">
                <div className="flex justify-between">
                  <span className="text-slate-500">Assessment Track:</span>
                  <span className="font-semibold text-indigo-700 print:text-black">{submission.companyName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Challenge Title:</span>
                  <span className="font-semibold text-slate-900 print:text-black truncate max-w-[200px]">
                    {submission.examTitle}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Programming Language:</span>
                  <span className="font-mono uppercase font-semibold text-slate-800 print:text-black">
                    {submission.language}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Timestamp:</span>
                  <span className="text-slate-700 print:text-black" suppressHydrationWarning>
                    {submission.submittedAt ? submission.submittedAt.slice(0, 19).replace("T", " ") : "Recent"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Empirical Lab Metrics Cards */}
          <div className="py-6 border-b border-slate-200 print:border-gray-300 space-y-3">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-gray-900">
              Laboratory Performance Metrics
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {/* Score */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center print:bg-gray-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Overall Score</span>
                <div className="text-2xl font-extrabold text-emerald-700 print:text-black mt-1">
                  {submission.scorePercentage}%
                </div>
                <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
                  Full Proficiency
                </span>
              </div>

              {/* Test Cases */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center print:bg-gray-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Test Suites</span>
                <div className="text-2xl font-extrabold text-slate-900 print:text-black mt-1">
                  {submission.testCasesPassed}/{submission.totalTestCases}
                </div>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  {submission.testCasesPassed === submission.totalTestCases ? "100% Passed" : "Partial Pass"}
                </span>
              </div>

              {/* Execution Latency */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center print:bg-gray-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">CPU Latency</span>
                <div className="text-2xl font-extrabold text-indigo-700 print:text-black mt-1">
                  {submission.executionTimeMs} ms
                </div>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Optimal &lt; 50ms
                </span>
              </div>

              {/* Memory Footprint */}
              <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 text-center print:bg-gray-50">
                <span className="text-[10px] uppercase font-bold text-slate-500 block">Memory Footprint</span>
                <div className="text-2xl font-extrabold text-amber-700 print:text-black mt-1">
                  {(submission.memoryKb / 1024).toFixed(1)} MB
                </div>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                  Within Bounds
                </span>
              </div>
            </div>
          </div>

          {/* Submitted Code Section with Line Numbers */}
          <div className="py-6 border-b border-slate-200 print:border-gray-300 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500 print:text-gray-900">
                Submitted Laboratory Solution Code
              </h4>
              <span className="text-[11px] font-mono text-slate-500">
                Language: {submission.language}
              </span>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs overflow-x-auto print:bg-gray-50 print:border-gray-300 text-slate-100 print:text-black">
              <pre className="leading-relaxed">
                {submission.submittedCode.split("\n").map((line, idx) => (
                  <div key={idx} className="table-row">
                    <span className="table-cell pr-4 text-slate-500 select-none text-right w-8 text-[11px]">
                      {idx + 1}
                    </span>
                    <span className="table-cell">{line}</span>
                  </div>
                ))}
              </pre>
            </div>
          </div>

          {/* Verification & Audit Record Footer */}
          <div className="pt-6">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 flex flex-col sm:flex-row items-center justify-between gap-4 print:border-gray-300 print:bg-gray-50">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 print:text-black">
                    Official Assessment Record #{submission.certificateNumber}
                  </h4>
                  <p className="text-[11px] text-slate-600 print:text-gray-600">
                    Verified through automated sandbox test execution. Archived in evaluation database for candidate profile and hiring team review.
                  </p>
                </div>
              </div>
              <div className="shrink-0 text-right">
                <span className="text-[11px] font-mono text-slate-500 block">
                  Reference: REC-{submission.id.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
