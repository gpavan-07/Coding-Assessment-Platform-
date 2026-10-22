"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import { ExamData } from "@/lib/mock-data";
import {
  Code2,
  Clock,
  Award,
  CheckCircle2,
  FileText,
  ArrowRight,
  Play,
  Terminal,
  ExternalLink,
  Info,
  UserCheck,
  ShieldAlert,
  X,
  Layers,
  Calendar,
} from "lucide-react";

function StudentDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab");

  const { currentUser, exams, submissions } = useAssessment();

  // Active view tab: "dashboard" or "exams"
  const [activeTab, setActiveTab] = useState<"dashboard" | "exams">("dashboard");

  useEffect(() => {
    if (tabParam === "exams") {
      setActiveTab("exams");
    } else {
      setActiveTab("dashboard");
    }
  }, [tabParam]);

  // Disclaimer Modal state
  const [disclaimerExam, setDisclaimerExam] = useState<ExamData | null>(null);
  const [disclaimerAgreed, setDisclaimerAgreed] = useState(false);

  // Filter submissions made by this student
  const studentSubmissions = currentUser
    ? submissions.filter(
        (s) =>
          s.studentId === currentUser.id ||
          s.studentEmail.toLowerCase() === currentUser.email.toLowerCase()
      )
    : [];

  const handleStartExamClick = (exam: ExamData) => {
    setDisclaimerExam(exam);
    setDisclaimerAgreed(false);
  };

  const handleConfirmAndProceed = () => {
    if (disclaimerExam && disclaimerAgreed) {
      const examId = disclaimerExam.id;
      setDisclaimerExam(null);
      router.push(`/exam/${examId}`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Onboarding Banner if not logged in */}
        {!currentUser && (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200 shrink-0">
                <Info className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Student Examination Portal
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Sign in or register with your student account to record your attempts and view your certificates and reports.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <Link
                href="/auth/login"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/auth/register"
                className="px-4 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 transition-colors"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        {/* Portal Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-xs mb-2">
              <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
              <span>Student Candidate Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              {currentUser ? `Welcome, ${currentUser.name}` : "Student Examination Center"}
            </h1>
            <p className="mt-1 text-xs text-slate-600 max-w-xl">
              {currentUser && currentUser.fatherName ? (
                <span>
                  Candidate: <strong className="text-slate-900">{currentUser.name}</strong> • Father&apos;s Name: <strong className="text-amber-800">S/O {currentUser.fatherName}</strong>
                </span>
              ) : (
                "Track upcoming exams, review completed evaluations, and take allocated tests."
              )}
            </p>
          </div>

          {/* Student Status Badge */}
          <div className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-right shadow-xs">
            <span className="text-[10px] font-mono uppercase text-slate-500 block">Candidate Status</span>
            <span className="text-sm font-bold text-indigo-700 flex items-center justify-end gap-1.5">
              {currentUser ? (
                <>
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-emerald-700">Verified Student</span>
                </>
              ) : (
                <span className="text-slate-500">Guest Visitor</span>
              )}
            </span>
          </div>
        </div>


        {/* =========================================================================
            MENU 1: STUDENT DASHBOARD
            - Upcoming / Active exams
            - If completed, marked as "Completed"
            - Score, tests passed, lab report link
           ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Allocated Examinations
                </span>
                <div className="text-3xl font-extrabold text-slate-900 mt-2">
                  {exams.length}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Available in candidate catalog
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Completed Examinations
                </span>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
                  <span>{studentSubmissions.length}</span>
                  <CheckCircle2 className="h-5 w-5 text-emerald-600" />
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Evaluated in sandbox
                </span>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <span className="text-[10px] font-mono uppercase text-slate-500 block">
                  Pending / Active Exams
                </span>
                <div className="text-3xl font-extrabold text-amber-600 mt-2">
                  {Math.max(0, exams.length - studentSubmissions.length)}
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ready to attempt
                </span>
              </div>
            </div>

            {/* Upcoming / Active Exams List with Completed Status */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-indigo-600" />
                    <span>My Upcoming & Active Examinations</span>
                  </h2>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Completed examinations are marked with verified evaluation badges and lab reports.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {exams.map((exam) => {
                  const sub = studentSubmissions.find((s) => s.examId === exam.id);
                  const isCompleted = Boolean(sub);

                  return (
                    <div
                      key={exam.id}
                      className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                        isCompleted
                          ? "border-emerald-300 bg-emerald-50/40 shadow-xs"
                          : "border-slate-200 bg-white hover:border-slate-300 hover:shadow-md shadow-xs"
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold uppercase text-indigo-600">
                            {exam.companyName}
                          </span>

                          {/* IF COMPLETED MARK AS COMPLETED */}
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-700" />
                              <span>Completed • {sub?.scorePercentage}%</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800 border border-amber-200">
                              <span className="h-1.5 w-1.5 rounded-full bg-amber-600 animate-pulse" />
                              <span>Active / Upcoming</span>
                            </span>
                          )}
                        </div>

                        <div>
                          <h3 className="text-base font-bold text-slate-900">
                            {exam.title}
                          </h3>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-1 leading-relaxed">
                            {exam.description}
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-3.5 w-3.5 text-slate-400" />
                            <span>{exam.durationMinutes}m</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Award className="h-3.5 w-3.5 text-amber-600" />
                            <span>{exam.totalPoints} Pts</span>
                          </div>
                          <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-700">
                            <span>{exam.difficulty}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                        {isCompleted && sub ? (
                          <div className="w-full flex items-center justify-between">
                            <span className="text-[11px] text-slate-500">
                              Submitted: {sub.submittedAt ? sub.submittedAt.slice(0, 10) : "Recent"}
                            </span>
                            <Link
                              href={`/report/${sub.id}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-indigo-700 text-xs font-semibold border border-slate-200 transition-colors"
                            >
                              <span>View Lab Report</span>
                              <ExternalLink className="h-3.5 w-3.5" />
                            </Link>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleStartExamClick(exam)}
                            className="w-full flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer"
                          >
                            <Play className="h-3 w-3 fill-current" />
                            <span>Start Exam</span>
                            <ArrowRight className="h-3.5 w-3.5 ml-auto" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Submissions & Report Records */}
            {studentSubmissions.length > 0 && (
              <div className="space-y-4 pt-6 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <FileText className="h-4 w-4 text-indigo-600" />
                      <span>Completed Examination Reports</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Review your scores, test suite execution results, and runtime telemetry.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-slate-500">
                    {studentSubmissions.length} Completed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {studentSubmissions.map((sub) => (
                    <div
                      key={sub.id}
                      className="rounded-2xl border border-slate-200 bg-white p-4 space-y-3 shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-bold uppercase text-indigo-600">
                            {sub.companyName}
                          </span>
                          <h4 className="text-sm font-semibold text-slate-900 mt-0.5">
                            {sub.examTitle}
                          </h4>
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800 border border-emerald-200">
                          <CheckCircle2 className="h-3 w-3" />
                          {sub.scorePercentage}%
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-[11px]">
                        <div>
                          <span className="text-slate-500 block">Tests</span>
                          <span className="font-semibold text-slate-800">
                            {sub.testCasesPassed}/{sub.totalTestCases}
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Runtime</span>
                          <span className="font-semibold text-slate-800">
                            {sub.executionTimeMs} ms
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Record</span>
                          <span className="font-mono text-indigo-700 font-semibold">
                            #{sub.certificateNumber}
                          </span>
                        </div>
                      </div>

                      <div className="pt-1 flex items-center justify-end">
                        <Link
                          href={`/report/${sub.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                        >
                          <span>Open Full Report</span>
                          <ExternalLink className="h-3.5 w-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* =========================================================================
            MENU 2: EXAMINATIONS CATALOG
            - The exam which is allocated to him is shown
            - When click on the arrow (right) / start button -> DISCLAIMER POPUP
            - Then navigate to the exam
           ========================================================================= */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  <span>Allocated Examination Challenges</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Click the start button or arrow to read the examination disclaimer and enter the Monaco IDE workspace.
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500">
                {exams.length} Active Challenges
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exams.map((exam) => {
                const sub = studentSubmissions.find((s) => s.examId === exam.id);
                const isCompleted = Boolean(sub);

                return (
                  <div
                    key={exam.id}
                    className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all group shadow-xs"
                  >
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold uppercase text-indigo-600">
                          {exam.companyName}
                        </span>
                        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                          {exam.difficulty}
                        </span>
                      </div>

                      <h3 className="text-base font-semibold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {exam.title}
                      </h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>

                      <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-slate-400" />
                          <span>{exam.durationMinutes}m</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Award className="h-3.5 w-3.5 text-amber-600" />
                          <span>{exam.totalPoints} Pts</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          {isCompleted ? (
                            <span className="text-emerald-700 font-semibold text-[11px]">Completed</span>
                          ) : (
                            <span className="text-amber-700 text-[11px]">Active</span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {isCompleted && sub ? (
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            <span>Score: {sub.scorePercentage}%</span>
                          </span>
                          <Link
                            href={`/report/${sub.id}`}
                            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold inline-flex items-center gap-1"
                          >
                            <span>Report</span>
                            <ExternalLink className="h-3 w-3" />
                          </Link>
                        </div>
                      ) : (
                        /* CLICKING START BUTTON / ARROW TRIGGERS DISCLAIMER POPUP */
                        <button
                          onClick={() => handleStartExamClick(exam)}
                          className="w-full flex items-center justify-between gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-2.5 px-4 text-xs font-semibold text-white shadow-xs transition-all cursor-pointer group-hover:shadow-indigo-600/30"
                        >
                          <span className="flex items-center gap-2">
                            <Play className="h-3 w-3 fill-current" />
                            <span>Start Exam</span>
                          </span>
                          <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* =========================================================================
          DISCLAIMER POPUP MODAL (STUDENT START EXAM FLOW)
          - Shown when student clicks arrow (right) / Start button on an active exam
          - Rules & Code of Conduct
          - Mandatory agreement checkbox
          - Proceed button navigates to /exam/[id]
         ========================================================================= */}
      {disclaimerExam && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
          <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200 text-slate-900">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-700 border border-amber-200 flex items-center justify-center shrink-0">
                  <ShieldAlert className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    Examination Disclaimer & Rules
                  </h3>
                  <p className="text-xs text-slate-500">
                    Mandatory candidate code of conduct
                  </p>
                </div>
              </div>
              <button
                onClick={() => setDisclaimerExam(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Exam Information Banner */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between text-xs">
              <div>
                <span className="text-[10px] font-mono uppercase text-indigo-600 font-bold block">
                  Target Examination
                </span>
                <span className="font-bold text-slate-900 text-sm">
                  {disclaimerExam.title}
                </span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block">Duration</span>
                <span className="font-mono font-bold text-amber-700">
                  {disclaimerExam.durationMinutes} Minutes
                </span>
              </div>
            </div>

            {/* Disclaimer Terms & Instructions */}
            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[11px] font-bold text-indigo-600 shrink-0 mt-0.5">
                  1
                </span>
                <p>
                  <strong className="text-slate-800">Timer & Continuity:</strong> The examination countdown will begin immediately upon entering the workspace. The timer cannot be paused.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[11px] font-bold text-indigo-600 shrink-0 mt-0.5">
                  2
                </span>
                <p>
                  <strong className="text-slate-800">Anti-Plagiarism & Integrity:</strong> All code runs in an isolated sandbox. Plagiarism and copying unauthorized external solutions will lead to disqualification.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[11px] font-bold text-indigo-600 shrink-0 mt-0.5">
                  3
                </span>
                <p>
                  <strong className="text-slate-800">Automated Evaluation:</strong> Your solution will be tested against both visible and hidden test cases. Click &ldquo;Submit Final Solution&rdquo; once satisfied.
                </p>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="h-5 w-5 rounded-full bg-slate-100 border border-slate-300 flex items-center justify-center text-[11px] font-bold text-indigo-600 shrink-0 mt-0.5">
                  4
                </span>
                <p>
                  <strong className="text-slate-800">Environment:</strong> Do not refresh or close the browser tab during an active test session to prevent accidental submission.
                </p>
              </div>
            </div>

            {/* Mandatory Checkbox */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={disclaimerAgreed}
                  onChange={(e) => setDisclaimerAgreed(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-0"
                />
                <span className="text-xs text-slate-800 font-medium leading-relaxed">
                  I have read, understood, and agree to abide by the Examination Disclaimer and Code of Conduct.
                </span>
              </label>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setDisclaimerExam(null)}
                className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
              >
                Cancel / Return
              </button>
              <button
                type="button"
                disabled={!disclaimerAgreed}
                onClick={handleConfirmAndProceed}
                className={`px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all flex items-center gap-2 ${
                  disclaimerAgreed
                    ? "bg-indigo-600 hover:bg-indigo-500 shadow-indigo-600/30 cursor-pointer"
                    : "bg-slate-300 text-slate-500 cursor-not-allowed"
                }`}
              >
                <span>Agree & Proceed to Exam</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
          Loading Student Dashboard...
        </div>
      }
    >
      <StudentDashboardContent />
    </Suspense>
  );
}
