"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import { SubmissionReportData, CertificateData, ExamData } from "@/lib/mock-data";
import {
  ShieldCheck,
  Award,
  Users,
  FileText,
  Printer,
  Eye,
  CheckCircle2,
  X,
  PlusCircle,
  Activity,
  Trash2,
  Layers,
  Search,
  ExternalLink,
  Clock,
  Sparkles,
  AlertCircle,
  Play,
  Terminal,
  RotateCcw,
  KeyRound,
  ArrowRight,
  Lock,
  Check,
  UserCheck,
  ChevronRight,
  ArrowLeft,
  Code2,
  XCircle,
} from "lucide-react";

type TabType = "dashboard" | "users" | "exams" | "reports" | "certificates";

function getFormattedSerialNo(cert?: CertificateData): string {
  if (!cert) return "14471";
  if (cert.serialNo && !cert.serialNo.includes("REC")) {
    const digits = cert.serialNo.replace(/[^0-9]/g, "");
    if (digits.length >= 4) return digits.slice(-5);
  }
  if (cert.certificateNumber && !cert.certificateNumber.includes("REC")) {
    const digits = cert.certificateNumber.replace(/[^0-9]/g, "");
    if (digits.length >= 4) return digits.slice(-5);
  }
  return "14471";
}

function AdminPortalContent() {
  const searchParams = useSearchParams();
  const highlightSubId = searchParams.get("highlightSub");
  const tabParam = searchParams.get("tab");

  const {
    currentUser,
    registeredStudents,
    exams,
    submissions,
    certificates,
    liveWritersCount,
    liveQuestionsSubmitted,
    liveWritingStudents,
    liveActivityEvents,
    createExam,
    deleteExam,
    loginAdmin,
    getCertificateBySubmissionId,
    changeUserPassword,
    resetAllRecords,
  } = useAssessment();

  // Admin access check
  const isAdmin = currentUser && currentUser.role === "company_admin";

  // Login inputs if not logged in
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [authError, setAuthError] = useState("");

  // Current active view tab
  const [activeTab, setActiveTab] = useState<TabType>("dashboard");

  // Sync tab with URL searchParams
  useEffect(() => {
    if (tabParam === "dashboard" || tabParam === "live") {
      setActiveTab("dashboard");
    } else if (tabParam === "users") {
      setActiveTab("users");
    } else if (tabParam === "exams" || tabParam === "create") {
      setActiveTab("exams");
    } else if (tabParam === "reports") {
      setActiveTab("reports");
    } else if (tabParam === "certificates") {
      setActiveTab("certificates");
    }
  }, [tabParam]);

  // Search & filter
  const [searchTerm, setSearchTerm] = useState("");
  const [userSearchTerm, setUserSearchTerm] = useState("");
  const [selectedTrack, setSelectedTrack] = useState("ALL");
  const [selectedExamReportId, setSelectedExamReportId] = useState<string | null>(null);
  const [reportsExamSearch, setReportsExamSearch] = useState("");
  const [reportsCandidateSearch, setReportsCandidateSearch] = useState("");

  // Create Exam Modal / Drawer
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Password change modal state
  const [passwordModalUser, setPasswordModalUser] = useState<{
    id: string;
    name: string;
    email: string;
    fatherName: string;
  } | null>(null);
  const [newPasswordVal, setNewPasswordVal] = useState("");
  const [confirmPasswordVal, setConfirmPasswordVal] = useState("");
  const [passwordFeedback, setPasswordFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  // Code inspection modal & certificate modal
  const [inspectSubmission, setInspectSubmission] = useState<SubmissionReportData | null>(null);
  const [viewCertificate, setViewCertificate] = useState<{
    certificate: CertificateData;
    submission?: SubmissionReportData;
  } | null>(null);

  // Form state for Create Exam
  const [createForm, setCreateForm] = useState({
    title: "",
    companyName: "",
    category: "",
    difficulty: "Intermediate" as "Beginner" | "Intermediate" | "Advanced",
    durationMinutes: 45,
    totalPoints: 100,
    description: "",
    problemTitle: "",
    problemDescription: "",
    constraints: "1 <= n <= 10^5\nTime limit: 2.0s, Memory limit: 256MB",
    sampleInput: "nums = [2, 7, 11, 15], target = 9",
    sampleOutput: "[0, 1]",
    starterJs: `function solution(input) {\n  // Write your algorithm here\n  return input;\n}`,
    starterPython: `def solution(input):\n    # Write your algorithm here\n    return input`,
  });
  const [createSuccessMsg, setCreateSuccessMsg] = useState("");

  // Auto-open highlighted submission if coming from report page
  useEffect(() => {
    if (highlightSubId && isAdmin) {
      const targetSub = submissions.find((s) => s.id === highlightSubId);
      if (targetSub) {
        const cert = getCertificateBySubmissionId(targetSub.id);
        if (cert) {
          setViewCertificate({ certificate: cert, submission: targetSub });
        } else {
          setInspectSubmission(targetSub);
        }
      }
    }
  }, [highlightSubId, isAdmin, submissions, getCertificateBySubmissionId]);

  const handleAdminSignIn = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!adminEmail.trim()) {
      setAuthError("Please enter admin email.");
      return;
    }
    if (!adminPassword) {
      setAuthError("Please enter password.");
      return;
    }
    const res = loginAdmin(adminEmail, adminPassword);
    if (!res.success) {
      setAuthError(res.error || "Authentication failed. Use admin@company.com / admin123");
    }
  };

  const handleCreateExamSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!createForm.title.trim() || !createForm.companyName.trim() || !createForm.problemTitle.trim()) {
      alert("Please fill in Exam Title, Track Domain, and Problem Title.");
      return;
    }

    const newExam: Omit<ExamData, "id"> = {
      title: createForm.title.trim(),
      companyName: createForm.companyName.trim(),
      companyLogo: "⚡",
      badgeColor: "from-indigo-600 to-violet-600",
      category: createForm.category.trim() || "Software Engineering Assessment",
      difficulty: createForm.difficulty,
      durationMinutes: Number(createForm.durationMinutes) || 45,
      totalPoints: Number(createForm.totalPoints) || 100,
      passingScore: 60,
      description: createForm.description.trim() || "Algorithmic and systems engineering challenge.",
      certificateTitle: `${createForm.title.trim()} Technical Assessment`,
      signatureName: "Technical Assessment Board",
      signatureRole: "Evaluation Authority Lead",
      problems: [
        {
          id: `prob-${Date.now().toString(36)}`,
          title: createForm.problemTitle.trim(),
          difficulty: createForm.difficulty === "Advanced" ? "Hard" : createForm.difficulty === "Beginner" ? "Easy" : "Medium",
          points: Number(createForm.totalPoints) || 100,
          description: createForm.problemDescription.trim() || "Implement a high-efficiency solution passing all test criteria.",
          constraints: createForm.constraints.split("\n").filter(Boolean),
          examples: [
            {
              input: createForm.sampleInput,
              output: createForm.sampleOutput,
              explanation: "Baseline verification test case.",
            },
          ],
          starterCode: {
            javascript: createForm.starterJs,
            python: createForm.starterPython,
            cpp: `// C++ implementation\n#include <vector>\n\nint solution() {\n    return 0;\n}`,
            java: `// Java implementation\npublic class Solution {\n    public static void main(String[] args) {\n    }\n}`,
          },
          testCases: [
            {
              id: 1,
              input: createForm.sampleInput,
              expectedOutput: createForm.sampleOutput,
              isHidden: false,
            },
            {
              id: 2,
              input: "edge_case = []",
              expectedOutput: "0",
              isHidden: true,
            },
          ],
        },
      ],
    };

    createExam(newExam);
    setCreateSuccessMsg(`Exam "${createForm.title}" successfully created and added to the student catalog!`);
    setTimeout(() => {
      setCreateSuccessMsg("");
      setShowCreateModal(false);
      setActiveTab("exams");
    }, 1200);
  };

  const handlePasswordResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordFeedback(null);

    if (!passwordModalUser) return;
    if (!newPasswordVal) {
      setPasswordFeedback({ type: "error", message: "Please enter a new password." });
      return;
    }
    if (newPasswordVal.length < 4) {
      setPasswordFeedback({ type: "error", message: "Password must be at least 4 characters." });
      return;
    }
    if (newPasswordVal !== confirmPasswordVal) {
      setPasswordFeedback({ type: "error", message: "Passwords do not match." });
      return;
    }

    const res = changeUserPassword(passwordModalUser.id, newPasswordVal);
    if (res.success) {
      setPasswordFeedback({
        type: "success",
        message: `Password successfully updated for ${passwordModalUser.name}!`,
      });
      setTimeout(() => {
        setPasswordModalUser(null);
        setNewPasswordVal("");
        setConfirmPasswordVal("");
        setPasswordFeedback(null);
      }, 1500);
    } else {
      setPasswordFeedback({ type: "error", message: res.error || "Failed to update password." });
    }
  };

  const openCertificateForStudent = (student: {
    id: string;
    name: string;
    fatherName: string;
    instituteName?: string;
    email: string;
  }) => {
    // Check if student has a submission
    const studentSub = submissions.find(
      (s) => s.studentId === student.id || s.studentEmail.toLowerCase() === student.email.toLowerCase()
    );

    if (studentSub) {
      const existingCert = getCertificateBySubmissionId(studentSub.id);
      if (existingCert) {
        setViewCertificate({ certificate: existingCert, submission: studentSub });
        return;
      }
    }

    // Generate verified sample certificate matching M.NAVEEN-CERTIFICATE.pdf & 14310.docx
    const defaultExam = exams[0] || {
      title: "Basic Fire Prevention and First Aid Fire Fighting",
      companyName: "DODLA DAIRY LIMITED",
    };

    const instName = student.instituteName || "FINTECH SYSTEMS";
    const provisionalCert: CertificateData = {
      id: `cert-gen-${student.id}`,
      certificateNumber: "14471",
      serialNo: "14471",
      studentId: student.id,
      examId: defaultExam.id || "exam-01",
      studentName: student.name.toUpperCase(),
      fatherName: (student.fatherName || "M.SANKARA").toUpperCase(),
      instituteName: instName.toUpperCase(),
      studentEmail: student.email,
      submissionId: studentSub ? studentSub.id : `sub-provisional-${student.id}`,
      examTitle: studentSub ? studentSub.examTitle : "Basic Fire Prevention and First Aid Fire Fighting",
      companyName: `${instName}, Andhra Pradesh`,
      scorePercentage: studentSub ? studentSub.scorePercentage : 92,
      issuedAt: new Date().toISOString(),
      verificationHash: `APFS-CDTI-${student.id.toUpperCase()}-14471`,
      trainingPeriod: "3 Days",
      startDate: "06-10-2026",
      endDate: "08-10-2026",
      premises: "CHITTOOR FIRE STATION",
      directorName: "P.VENKATA RAMANA",
      directorRole: "Director, A.P. Fire Services and Civil Defence",
      status: "Issued",
    };

    setViewCertificate({
      certificate: provisionalCert,
      submission: studentSub,
    });
  };

  const openCertificateForSubmission = (sub: SubmissionReportData) => {
    const existingCert = getCertificateBySubmissionId(sub.id);
    if (existingCert) {
      setViewCertificate({ certificate: existingCert, submission: sub });
      return;
    }

    const matchedStudent = registeredStudents.find(
      (s) => s.id === sub.studentId || s.email.toLowerCase() === sub.studentEmail.toLowerCase()
    );
    const instName = sub.instituteName || matchedStudent?.instituteName || "FINTECH SYSTEMS";

    const cleanSerial = getFormattedSerialNo({ serialNo: sub.certificateNumber, certificateNumber: sub.certificateNumber } as any);

    const generatedCert: CertificateData = {
      id: `cert-gen-${sub.id}`,
      certificateNumber: cleanSerial,
      serialNo: cleanSerial,
      studentId: sub.studentId,
      examId: sub.examId,
      studentName: sub.studentName.toUpperCase(),
      fatherName: (sub.fatherName || "M.SANKARA").toUpperCase(),
      instituteName: instName.toUpperCase(),
      studentEmail: sub.studentEmail,
      submissionId: sub.id,
      examTitle: sub.examTitle,
      companyName: `${instName}, Andhra Pradesh`,
      scorePercentage: sub.scorePercentage,
      issuedAt: sub.submittedAt || new Date().toISOString(),
      verificationHash: `APFS-CDTI-${sub.studentId.toUpperCase()}-14471`,
      trainingPeriod: "3 Days",
      startDate: "06-10-2026",
      endDate: "08-10-2026",
      premises: "CHITTOOR FIRE STATION",
      directorName: "P.VENKATA RAMANA",
      directorRole: "Director, A.P. Fire Services and Civil Defence",
      status: "Issued",
    };

    setViewCertificate({
      certificate: generatedCert,
      submission: sub,
    });
  };

  const filteredSubmissions = submissions.filter((sub) => {
    const matchesSearch =
      sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.studentEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.examTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.certificateNumber.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesTrack =
      selectedTrack === "ALL" ||
      sub.companyName.toUpperCase().includes(selectedTrack.toUpperCase());

    return matchesSearch && matchesTrack;
  });

  const filteredUsers = registeredStudents.filter((u) => {
    const q = userSearchTerm.toLowerCase();
    return (
      u.name.toLowerCase().includes(q) ||
      (u.fatherName && u.fatherName.toLowerCase().includes(q)) ||
      (u.instituteName && u.instituteName.toLowerCase().includes(q)) ||
      u.email.toLowerCase().includes(q) ||
      (u.phone && u.phone.toLowerCase().includes(q))
    );
  });

  const handlePrintCertificate = () => {
    const originalTitle = document.title;
    const certSerial = getFormattedSerialNo(viewCertificate?.certificate);
    const candidateName = viewCertificate?.certificate?.studentName
      ? viewCertificate.certificate.studentName.trim().replace(/[^a-zA-Z0-9]/g, "_").replace(/_+/g, "_")
      : "Candidate";

    // Sets default PDF filename when saving via browser print dialog
    document.title = `${candidateName}_CERTIFICATE_${certSerial}`;
    window.print();

    // Restore original title
    setTimeout(() => {
      document.title = originalTitle;
    }, 1000);
  };

  // If not logged in as Admin, show clean authentication gate
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 bg-slate-50 text-slate-900">
        <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-8 shadow-md space-y-6">
          <div className="text-center space-y-2">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-50 text-amber-700 border border-amber-200">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Administrator Console
            </h1>
            <p className="text-xs text-slate-600">
              Sign in with your admin credentials to access Dashboard, Users, and Examinations.
            </p>
          </div>

          <form onSubmit={handleAdminSignIn} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Admin Email
              </label>
              <input
                type="email"
                required
                placeholder="admin@company.com"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                Password
              </label>
              <input
                type="password"
                required
                placeholder="••••••••"
                value={adminPassword}
                onChange={(e) => setAdminPassword(e.target.value)}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
              />
            </div>

            {authError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-colors cursor-pointer"
            >
              Sign In to Admin Console
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 py-8 px-4 sm:px-6 lg:px-8 print:p-0 print:m-0 print:min-h-0 print:bg-white">
      <div className="max-w-7xl mx-auto space-y-8 print:hidden">
        {/* Top Header & Fast Live Indicators */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-200 pb-6">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 border border-slate-200 shadow-xs mb-2">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-600" />
              <span>Administrator Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Examination Control & Management Center
            </h1>
            <p className="mt-1 text-xs text-slate-600">
              Manage users & passwords, oversee upcoming/active examinations, monitor live candidates, and download official certificates.
            </p>
          </div>

          {/* Quick Metrics & Reset */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                if (confirm("Reset all candidate submissions, certificates, and live counters to 0?")) {
                  resetAllRecords();
                }
              }}
              className="rounded-xl border border-slate-200 bg-white hover:bg-slate-100 px-3 py-2 text-slate-600 hover:text-slate-900 transition-colors flex items-center gap-1.5 text-xs font-medium shadow-xs cursor-pointer"
              title="Reset all records and counters to 0"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Reset All to 0</span>
            </button>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 block flex items-center justify-end gap-1">
                <span className={`h-2 w-2 rounded-full ${liveWritersCount > 0 ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
                Writing Currently
              </span>
              <span className={`text-sm font-bold font-mono ${liveWritersCount > 0 ? "text-emerald-600" : "text-slate-700"}`}>
                {liveWritersCount} Students
              </span>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-right shadow-xs">
              <span className="text-[10px] font-mono uppercase text-slate-500 block">
                Questions Submitted
              </span>
              <span className="text-sm font-bold text-indigo-600 font-mono">
                {liveQuestionsSubmitted} Tests
              </span>
            </div>
          </div>
        </div>


        {/* =========================================================================
            MENU 1: ADMIN DASHBOARD
           ========================================================================= */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            {/* Metric KPI Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Total Users */}
              <div
                onClick={() => setActiveTab("users")}
                className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 group-hover:text-indigo-600 transition-colors">
                  <span className="text-[10px] font-mono uppercase">Total Registered Users</span>
                  <Users className="h-4 w-4" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 group-hover:text-indigo-600 transition-colors">
                  {registeredStudents.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Candidate profiles</span>
                  <span className="text-indigo-600 font-medium group-hover:underline flex items-center gap-0.5">
                    Manage <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>

              {/* Total Exams */}
              <div
                onClick={() => setActiveTab("exams")}
                className="rounded-2xl border border-slate-200 bg-white p-5 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all group shadow-xs"
              >
                <div className="flex items-center justify-between text-slate-500 group-hover:text-amber-600 transition-colors">
                  <span className="text-[10px] font-mono uppercase">Total Examinations</span>
                  <Layers className="h-4 w-4" />
                </div>
                <div className="text-3xl font-extrabold text-slate-900 mt-2 group-hover:text-amber-700 transition-colors">
                  {exams.length}
                </div>
                <div className="text-[11px] text-slate-500 mt-1 flex items-center justify-between">
                  <span>Active challenges</span>
                  <span className="text-amber-700 font-medium group-hover:underline flex items-center gap-0.5">
                    View Catalog <ArrowRight className="h-3 w-3" />
                  </span>
                </div>
              </div>

              {/* Live Writing Students */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-mono uppercase">Writing Currently</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600" />
                  </span>
                </div>
                <div className="text-3xl font-extrabold text-emerald-600 mt-2 flex items-center gap-2">
                  <span>{liveWritersCount}</span>
                  <span className="text-xs font-normal text-emerald-700">students</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Real-time exam sessions
                </div>
              </div>

              {/* Questions Submitted */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[10px] font-mono uppercase">Questions Submitted</span>
                  <CheckCircle2 className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="text-3xl font-extrabold text-indigo-600 mt-2">
                  {liveQuestionsSubmitted}
                </div>
                <div className="text-[11px] text-slate-500 mt-1">
                  Evaluated in test runner
                </div>
              </div>
            </div>

            {/* Active & Upcoming Examinations Section (Curated Preview with "More Exams" button) */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 space-y-5 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    <h2 className="text-base font-bold text-slate-900">Active & Upcoming Examinations</h2>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Preview of currently scheduled and active assessment challenges available to students.
                  </p>
                </div>

                {/* MORE EXAMS BUTTON REDIRECTING TO EXAMINATIONS */}
                <button
                  onClick={() => setActiveTab("exams")}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 text-xs font-semibold shadow-xs transition-all cursor-pointer"
                >
                  <span>More Exams</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Show first 3 exams */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {exams.slice(0, 3).map((exam) => (
                  <div
                    key={exam.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between hover:border-slate-300 transition-colors"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold uppercase text-indigo-600">
                          {exam.companyName}
                        </span>
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200">
                          {exam.difficulty}
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{exam.title}</h3>
                      <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                        {exam.description}
                      </p>

                      <div className="flex items-center gap-3 pt-2 text-[11px] text-slate-500 border-t border-slate-200">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-slate-400" />
                          <span>{exam.durationMinutes}m</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Award className="h-3 w-3 text-amber-600" />
                          <span>{exam.totalPoints} Pts</span>
                        </div>
                        <div className="ml-auto text-emerald-700 font-mono text-[10px] font-semibold">
                          Active
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-2 border-t border-slate-200 flex items-center justify-between">
                      <Link
                        href={`/exam/${exam.id}`}
                        className="text-xs text-slate-600 hover:text-slate-900 flex items-center gap-1 font-medium"
                      >
                        <span>Preview</span>
                        <Play className="h-3 w-3" />
                      </Link>
                      <button
                        onClick={() => setActiveTab("exams")}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium cursor-pointer"
                      >
                        Manage
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Bottom "More Exams" Bar */}
              <div className="pt-2 flex items-center justify-between text-xs text-slate-500">
                <span>Showing {Math.min(3, exams.length)} of {exams.length} examinations</span>
                <button
                  onClick={() => setActiveTab("exams")}
                  className="text-amber-800 hover:text-amber-900 font-semibold inline-flex items-center gap-1 cursor-pointer"
                >
                  <span>View All {exams.length} Examinations</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            {/* Currently Writing Students Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-emerald-600" />
                  <span>Live Candidate Telemetry: Writing Currently</span>
                </h3>
                <span className="text-xs text-slate-500 font-mono">
                  {liveWritingStudents.length} Active Sessions
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3 px-6">Candidate</th>
                      <th className="py-3 px-6">Exam Track</th>
                      <th className="py-3 px-6">Language</th>
                      <th className="py-3 px-6 text-center">Tests Executed</th>
                      <th className="py-3 px-6 text-right">Current Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {liveWritingStudents.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-slate-500">
                          No candidates currently writing. When students launch an exam, their live telemetry will stream here.
                        </td>
                      </tr>
                    ) : (
                      liveWritingStudents.map((writer) => (
                        <tr key={writer.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3.5 px-6">
                            <div className="font-semibold text-slate-900">{writer.studentName}</div>
                            <div className="text-[11px] text-slate-500 font-mono">{writer.studentEmail}</div>
                          </td>
                          <td className="py-3.5 px-6">
                            <div className="font-medium text-slate-800">{writer.examTitle}</div>
                            <div className="text-[10px] text-slate-500">Started: {writer.startedAt}</div>
                          </td>
                          <td className="py-3.5 px-6 font-mono text-slate-700">
                            {writer.currentLanguage}
                          </td>
                          <td className="py-3.5 px-6 text-center font-mono font-bold text-indigo-600">
                            {writer.testRunsCount} Runs
                          </td>
                          <td className="py-3.5 px-6 text-right">
                            <span
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold border ${
                                writer.status === "Writing Code"
                                  ? "bg-blue-50 text-blue-700 border-blue-200"
                                  : writer.status === "Running Tests"
                                  ? "bg-amber-50 text-amber-800 border-amber-200 animate-pulse"
                                  : "bg-emerald-50 text-emerald-700 border-emerald-200"
                              }`}
                            >
                              <span className="h-1.5 w-1.5 rounded-full bg-current" />
                              {writer.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Live Activity Ticker Stream */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Terminal className="h-4 w-4 text-indigo-600" />
                  <span>Real-Time Submissions & Test Runs Ticker</span>
                </h3>
                <span className="text-[10px] font-mono text-emerald-700 flex items-center gap-1 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  Streaming Live
                </span>
              </div>

              <div className="space-y-2 max-h-56 overflow-y-auto font-mono text-xs">
                {liveActivityEvents.length === 0 ? (
                  <div className="p-8 text-center text-xs text-slate-500">
                    No live activities recorded yet. Test executions and question submissions will appear here in real time.
                  </div>
                ) : (
                  liveActivityEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    >
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            evt.type === "QUESTION_SUBMIT"
                              ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                              : evt.type === "TEST_RUN"
                              ? "bg-indigo-100 text-indigo-800 border border-indigo-200"
                              : "bg-blue-100 text-blue-800 border border-blue-200"
                          }`}
                        >
                          {evt.type}
                        </span>
                        <span className="font-semibold text-slate-900">{evt.studentName}</span>
                        <span className="text-slate-500">[{evt.examTitle}]</span>
                        <span className="text-slate-700">{evt.description}</span>
                      </div>
                      <span className="text-slate-400 text-[11px] shrink-0">{evt.timestamp}</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 2: USERS MANAGEMENT
           ========================================================================= */}
        {activeTab === "users" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs">
              <div className="relative w-full sm:w-80">
                <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search student by name, father name, email..."
                  value={userSearchTerm}
                  onChange={(e) => setUserSearchTerm(e.target.value)}
                  className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="text-xs text-slate-600">
                Total Registered Students: <span className="font-bold text-slate-900">{registeredStudents.length}</span>
              </div>
            </div>

            {/* Users Directory Table */}
            <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                    <Users className="h-4 w-4 text-indigo-600" />
                    <span>Candidate & User Directory</span>
                  </h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    View student details, father&apos;s name for certification records, and manage access passwords.
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-500">
                  {filteredUsers.length} Users Listed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                    <tr>
                      <th className="py-3.5 px-6">Student Name</th>
                      <th className="py-3.5 px-6">Father&apos;s Name (S/O)</th>
                      <th className="py-3.5 px-6">Institute / Organization</th>
                      <th className="py-3.5 px-6">Email Address</th>
                      <th className="py-3.5 px-6">Phone / Contact</th>
                      <th className="py-3.5 px-6 text-center">Registration</th>
                      <th className="py-3.5 px-6 text-right">Admin Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No users found matching &ldquo;{userSearchTerm}&rdquo;
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((student) => {
                        return (
                          <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                <UserCheck className="h-3.5 w-3.5 text-indigo-600" />
                                <span>{student.name}</span>
                              </div>
                              <div className="text-[11px] font-mono text-slate-500">
                                ID: {student.id}
                              </div>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-medium text-amber-800">
                                S/O {student.fatherName || "—"}
                              </div>
                              <span className="text-[10px] text-slate-500 block">
                                Printed on Certificate (S/O)
                              </span>
                            </td>

                            <td className="py-4 px-6">
                              <div className="font-bold text-slate-900">
                                {student.instituteName || "—"}
                              </div>
                              <span className="text-[10px] text-indigo-600 font-medium block">
                                Printed on Certificate (OF)
                              </span>
                            </td>

                            <td className="py-4 px-6 font-mono text-slate-700">
                              {student.email}
                            </td>

                            <td className="py-4 px-6 text-slate-600">
                              {student.phone || "—"}
                            </td>

                            <td className="py-4 px-6 text-center text-slate-500 text-[11px]">
                              {student.createdAt || "Active"}
                            </td>

                            <td className="py-4 px-6 text-right">
                              {/* CHANGE PASSWORD BUTTON */}
                              <button
                                onClick={() => {
                                  setPasswordModalUser(student);
                                  setNewPasswordVal("");
                                  setConfirmPasswordVal("");
                                  setPasswordFeedback(null);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-300 transition-colors cursor-pointer"
                                title="Change User Password"
                              >
                                <KeyRound className="h-3.5 w-3.5 text-indigo-600" />
                                <span>Change Password</span>
                              </button>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            MENU 3: EXAMINATIONS MANAGEMENT
           ========================================================================= */}
        {activeTab === "exams" && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="h-5 w-5 text-indigo-600" />
                  <span>Examination Catalog Management</span>
                </h2>
                <p className="text-xs text-slate-600 mt-0.5">
                  Published exams are accessible by enrolled students. You can create custom challenges and inspect test suites.
                </p>
              </div>

              {/* CREATE EXAM BUTTON */}
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
              >
                <PlusCircle className="h-4 w-4" />
                <span>+ Create New Exam</span>
              </button>
            </div>

            {/* Exams Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {exams.map((exam) => (
                <div
                  key={exam.id}
                  className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-indigo-300 hover:shadow-md transition-all shadow-xs"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase text-indigo-600">{exam.companyName}</span>
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 border border-slate-200 text-slate-700">
                        {exam.difficulty}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900">{exam.title}</h4>
                    <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">{exam.description}</p>

                    <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-100 text-xs text-slate-500">
                      <div>Duration: <span className="text-slate-800 font-semibold">{exam.durationMinutes}m</span></div>
                      <div>Points: <span className="text-slate-800 font-semibold">{exam.totalPoints}</span></div>
                      <div>Submissions: <span className="text-slate-800 font-semibold">{submissions.filter((s) => s.examId === exam.id).length}</span></div>
                    </div>
                  </div>

                  <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <Link
                      href={`/exam/${exam.id}`}
                      className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
                    >
                      <span>Preview Exam IDE</span>
                      <Play className="h-3 w-3" />
                    </Link>

                    {exams.length > 1 && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete exam "${exam.title}"?`)) {
                            deleteExam(exam.id);
                          }
                        }}
                        className="text-slate-400 hover:text-rose-600 transition-colors p-1 cursor-pointer"
                        title="Delete Exam"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* =========================================================================
            SECONDARY VIEW: STUDENT REPORTS
           ========================================================================= */}
        {activeTab === "reports" && (
          <div className="space-y-6">
            {selectedExamReportId === null ? (
              /* =========================================================================
                 VIEW 1: ALL EXAMINATIONS GRID
                 ========================================================================= */
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                  <div>
                    <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                      <Layers className="h-5 w-5 text-indigo-600" />
                      <span>Examinations & Candidate Reports</span>
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Select any examination block below to inspect all students who completed it, review their question codes, and access official certificates.
                    </p>
                  </div>

                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="relative w-full sm:w-72">
                      <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        placeholder="Search examinations..."
                        value={reportsExamSearch}
                        onChange={(e) => setReportsExamSearch(e.target.value)}
                        className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Grid of Examination Blocks */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {exams
                    .filter((ex) => {
                      const q = reportsExamSearch.toLowerCase();
                      return (
                        ex.title.toLowerCase().includes(q) ||
                        ex.companyName.toLowerCase().includes(q) ||
                        ex.category.toLowerCase().includes(q)
                      );
                    })
                    .map((exam) => {
                      const completedCount = submissions.filter((s) => s.examId === exam.id).length;
                      return (
                        <div
                          key={exam.id}
                          onClick={() => {
                            setSelectedExamReportId(exam.id);
                            setReportsCandidateSearch("");
                          }}
                          className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col justify-between hover:border-indigo-400 hover:shadow-lg transition-all shadow-xs cursor-pointer group relative overflow-hidden"
                        >
                          <div className="space-y-3">
                            <div className="flex items-start justify-between gap-2">
                              <span className="inline-block rounded-md bg-indigo-50 px-2.5 py-1 text-[11px] font-bold text-indigo-700 border border-indigo-200">
                                {exam.companyName}
                              </span>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                                  exam.difficulty === "Advanced"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : exam.difficulty === "Beginner"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : "bg-blue-50 text-blue-700 border-blue-200"
                                }`}
                              >
                                {exam.difficulty}
                              </span>
                            </div>

                            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-2">
                              {exam.title}
                            </h4>

                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                              {exam.description}
                            </p>

                            <div className="flex items-center gap-3 pt-2 text-xs text-slate-500 font-mono">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5 text-slate-400" />
                                {exam.durationMinutes}m
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3.5 w-3.5 text-slate-400" />
                                {exam.problems.length} {exam.problems.length === 1 ? "Question" : "Questions"}
                              </span>
                              <span>•</span>
                              <span className="flex items-center gap-1">
                                <Award className="h-3.5 w-3.5 text-slate-400" />
                                {exam.totalPoints} Pts
                              </span>
                            </div>
                          </div>

                          <div className="pt-5 mt-5 border-t border-slate-100 flex items-center justify-between">
                            <div
                              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                                completedCount > 0
                                  ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                                  : "bg-slate-100 text-slate-600 border border-slate-200"
                              }`}
                            >
                              <UserCheck className="h-3.5 w-3.5 text-emerald-600" />
                              <span>
                                {completedCount} {completedCount === 1 ? "Candidate" : "Candidates"} Completed
                              </span>
                            </div>

                            <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                              <span>View Reports</span>
                              <ChevronRight className="h-3.5 w-3.5" />
                            </span>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            ) : (
              /* =========================================================================
                 VIEW 2: CANDIDATES FOR SELECTED EXAMINATION
                 ========================================================================= */
              (() => {
                const selectedExam = exams.find((e) => e.id === selectedExamReportId) || exams[0];
                const examSubmissions = submissions.filter((s) => s.examId === selectedExamReportId);
                const filteredExamSubmissions = examSubmissions.filter((sub) => {
                  const q = reportsCandidateSearch.toLowerCase();
                  return (
                    sub.studentName.toLowerCase().includes(q) ||
                    sub.studentEmail.toLowerCase().includes(q) ||
                    (sub.fatherName && sub.fatherName.toLowerCase().includes(q)) ||
                    (sub.certificateNumber && sub.certificateNumber.toLowerCase().includes(q))
                  );
                });

                return (
                  <div className="space-y-6">
                    {/* Navigation & Header */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => setSelectedExamReportId(null)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold border border-slate-300 transition-colors cursor-pointer"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          <span>All Examinations</span>
                        </button>
                        <div className="h-6 w-px bg-slate-200" />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                              {selectedExam.companyName}
                            </span>
                            <span className="text-xs text-slate-500 font-medium">
                              • {selectedExam.problems.length} {selectedExam.problems.length === 1 ? "Question" : "Questions"}
                            </span>
                          </div>
                          <h3 className="text-base font-bold text-slate-900 mt-0.5">
                            {selectedExam.title}
                          </h3>
                        </div>
                      </div>

                      <div className="relative w-full sm:w-72">
                        <Search className="h-4 w-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          placeholder="Search candidate name, email, S/O..."
                          value={reportsCandidateSearch}
                          onChange={(e) => setReportsCandidateSearch(e.target.value)}
                          className="w-full rounded-xl bg-white border border-slate-300 pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                        />
                      </div>
                    </div>

                    {/* Completed Candidates Table */}
                    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-xs">
                      <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/80 flex items-center justify-between">
                        <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                          <UserCheck className="h-4 w-4 text-emerald-600" />
                          <span>Candidates Who Completed This Examination</span>
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">
                          {filteredExamSubmissions.length} of {examSubmissions.length} Students
                        </span>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-50 text-slate-600 uppercase text-[10px] border-b border-slate-200">
                            <tr>
                              <th className="py-3.5 px-6">Candidate Name</th>
                              <th className="py-3.5 px-6 text-center">Score</th>
                              <th className="py-3.5 px-6 text-center">Their Exam Report</th>
                              <th className="py-3.5 px-6 text-right">Certificate Option</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-slate-700">
                            {filteredExamSubmissions.length === 0 ? (
                              <tr>
                                <td colSpan={4} className="py-12 text-center text-slate-500">
                                  <div className="max-w-md mx-auto space-y-2">
                                    <Clock className="h-8 w-8 text-slate-400 mx-auto" />
                                    <p className="text-sm font-bold text-slate-800">
                                      {examSubmissions.length === 0
                                        ? "No candidate submissions yet for this examination."
                                        : `No candidates match "${reportsCandidateSearch}"`}
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      When enrolled students complete and submit this test, their scores, question-wise code audits, and certificates will appear here.
                                    </p>
                                  </div>
                                </td>
                              </tr>
                            ) : (
                              filteredExamSubmissions.map((sub) => {
                                const isPassed = sub.scorePercentage >= (selectedExam.passingScore || 60);
                                return (
                                  <tr key={sub.id} className="hover:bg-slate-50 transition-colors">
                                    {/* 1. CANDIDATE NAME */}
                                    <td className="py-4 px-6">
                                      <div className="font-bold text-slate-900 text-sm flex items-center gap-2">
                                        <UserCheck className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
                                        <span>{sub.studentName}</span>
                                      </div>
                                      <div className="text-xs text-amber-800 font-medium mt-0.5">
                                        S/O {sub.fatherName || "—"}
                                      </div>
                                      <div className="text-[11px] font-mono text-slate-500">
                                        {sub.studentEmail}
                                      </div>
                                    </td>

                                    {/* 2. SCORE */}
                                    <td className="py-4 px-6 text-center">
                                      <div className="inline-flex flex-col items-center">
                                        <span
                                          className={`inline-flex items-center gap-1 font-bold px-3 py-1 rounded-full text-xs border ${
                                            isPassed
                                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                                              : "text-rose-700 bg-rose-50 border-rose-200"
                                          }`}
                                        >
                                          {isPassed ? (
                                            <CheckCircle2 className="h-3 w-3" />
                                          ) : (
                                            <XCircle className="h-3 w-3" />
                                          )}
                                          <span>{sub.scorePercentage}%</span>
                                          <span className="text-[10px] font-medium opacity-85">
                                            ({isPassed ? "Passed" : "Failed"})
                                          </span>
                                        </span>
                                        <span className="text-[10px] text-slate-500 font-mono mt-1">
                                          {sub.testCasesPassed}/{sub.totalTestCases} Tests Passed
                                        </span>
                                      </div>
                                    </td>

                                    {/* 3. THEIR EXAM REPORT */}
                                    <td className="py-4 px-6 text-center">
                                      <button
                                        onClick={() => setInspectSubmission(sub)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs font-semibold border border-indigo-200 transition-colors cursor-pointer"
                                        title="View Question Codes and Status for this Candidate"
                                      >
                                        <FileText className="h-3.5 w-3.5 text-indigo-600" />
                                        <span>Exam Report ({selectedExam.problems.length} Questions)</span>
                                      </button>
                                    </td>

                                    {/* 4. CERTIFICATE OPTION */}
                                    <td className="py-4 px-6 text-right">
                                      <button
                                        onClick={() => openCertificateForSubmission(sub)}
                                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                                        title="View & Download Official PDF Certificate"
                                      >
                                        <Award className="h-3.5 w-3.5" />
                                        <span>Certificate</span>
                                      </button>
                                    </td>
                                  </tr>
                                );
                              })
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                );
              })()
            )}
          </div>
        )}

        {/* =========================================================================
            SECONDARY VIEW: CERTIFICATES HUB
           ========================================================================= */}
        {activeTab === "certificates" && (
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Award className="h-5 w-5 text-amber-600" />
                  <span>Student Official Verified Certificates Hub</span>
                </h3>
                <p className="text-xs text-slate-600 mt-0.5">
                  Administrators have exclusive authority to review, download, and print official candidate verified certificates.
                </p>
              </div>
              <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200">
                {certificates.length} Issued
              </span>
            </div>

            {certificates.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-xs">
                <Award className="h-10 w-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-semibold text-slate-900">No certificates issued yet</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Official certificates will appear here automatically when candidates complete examinations, or you can issue one directly from the Users tab.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {certificates.map((cert) => {
                  const sub = submissions.find((s) => s.id === cert.submissionId) || submissions[0];
                  return (
                    <div
                      key={cert.id}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-4 hover:border-slate-300 transition-colors shadow-xs"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[10px] font-mono font-bold uppercase text-amber-700">
                            {cert.companyName}
                          </span>
                          <h4 className="text-base font-bold text-slate-900 mt-0.5">{cert.studentName}</h4>
                          <div className="text-xs text-amber-800 font-medium">S/O {cert.fatherName || "—"}</div>
                          <div className="text-xs text-slate-500 font-mono">{cert.studentEmail}</div>
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded border border-slate-200">
                          #{cert.certificateNumber}
                        </span>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Exam Title:</span>
                          <span className="text-slate-800 font-medium truncate max-w-[220px]">{cert.examTitle}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Score Earned:</span>
                          <span className="text-emerald-700 font-bold">{cert.scorePercentage}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">Serial Reference:</span>
                          <span className="text-amber-800 font-mono font-semibold">SI.No. {cert.serialNo || "14471"}</span>
                        </div>
                      </div>

                      <div className="pt-2 flex items-center justify-end gap-2">
                        <button
                          onClick={() => setViewCertificate({ certificate: cert, submission: sub })}
                          className="w-full flex items-center justify-center gap-2 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-xs font-bold text-white shadow-xs transition-all cursor-pointer"
                        >
                          <Printer className="h-4 w-4" />
                          <span>View & Download Certificate (PDF)</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* =========================================================================
          MODAL: CHANGE USER PASSWORD (ADMIN FEATURE)
         ========================================================================= */}
      {passwordModalUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 print:hidden">
          <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl space-y-5 text-slate-900">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="h-9 w-9 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200 flex items-center justify-center">
                  <KeyRound className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Change User Password</h3>
                  <p className="text-[11px] text-slate-500">Admin override for candidate account</p>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalUser(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Target Student Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1.5">
              <div className="flex justify-between">
                <span className="text-slate-500">Student Name:</span>
                <span className="text-slate-900 font-semibold">{passwordModalUser.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Father&apos;s Name:</span>
                <span className="text-amber-800 font-medium">S/O {passwordModalUser.fatherName || "—"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Email Address:</span>
                <span className="text-slate-700 font-mono">{passwordModalUser.email}</span>
              </div>
            </div>

            <form onSubmit={handlePasswordResetSubmit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">
                  New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Enter new password"
                  value={newPasswordVal}
                  onChange={(e) => setNewPasswordVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Re-enter new password"
                  value={confirmPasswordVal}
                  onChange={(e) => setConfirmPasswordVal(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                />
              </div>

              {passwordFeedback && (
                <div
                  className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                    passwordFeedback.type === "success"
                      ? "bg-emerald-50 border border-emerald-200 text-emerald-800"
                      : "bg-rose-50 border border-rose-200 text-rose-700"
                  }`}
                >
                  {passwordFeedback.type === "success" ? (
                    <Check className="h-4 w-4 shrink-0" />
                  ) : (
                    <AlertCircle className="h-4 w-4 shrink-0" />
                  )}
                  <span>{passwordFeedback.message}</span>
                </div>
              )}

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setPasswordModalUser(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CREATE NEW EXAM FORM
         ========================================================================= */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto print:hidden">
          <div className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto text-slate-900 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-xs font-semibold uppercase text-emerald-600">
                  Exam Authoring Studio
                </span>
                <h3 className="text-lg font-bold text-slate-900">Create New Technical Exam</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {createSuccessMsg && (
              <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
                <Check className="h-4 w-4" />
                <span>{createSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleCreateExamSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Exam Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Distributed Consensus Challenge"
                    value={createForm.title}
                    onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Track / Company Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DODLA DAIRY LIMITED"
                    value={createForm.companyName}
                    onChange={(e) => setCreateForm({ ...createForm, companyName: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Difficulty
                  </label>
                  <select
                    value={createForm.difficulty}
                    onChange={(e) =>
                      setCreateForm({
                        ...createForm,
                        difficulty: e.target.value as "Beginner" | "Intermediate" | "Advanced",
                      })
                    }
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-indigo-600"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Duration (Minutes)
                  </label>
                  <input
                    type="number"
                    min={15}
                    max={180}
                    value={createForm.durationMinutes}
                    onChange={(e) => setCreateForm({ ...createForm, durationMinutes: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Total Points
                  </label>
                  <input
                    type="number"
                    min={50}
                    max={500}
                    value={createForm.totalPoints}
                    onChange={(e) => setCreateForm({ ...createForm, totalPoints: Number(e.target.value) })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase text-slate-700">
                  Exam Summary / Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Brief description of skills tested..."
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="pt-2 border-t border-slate-200 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600 block">
                  Problem Specification & Test Cases
                </span>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Problem Title *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Implement Raft Consensus Log Compaction"
                    value={createForm.problemTitle}
                    onChange={(e) => setCreateForm({ ...createForm, problemTitle: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    Detailed Problem Statement
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Describe inputs, outputs, expectations, and edge cases..."
                    value={createForm.problemDescription}
                    onChange={(e) => setCreateForm({ ...createForm, problemDescription: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-slate-700">
                      Sample Input
                    </label>
                    <input
                      type="text"
                      value={createForm.sampleInput}
                      onChange={(e) => setCreateForm({ ...createForm, sampleInput: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold uppercase text-slate-700">
                      Expected Output
                    </label>
                    <input
                      type="text"
                      value={createForm.sampleOutput}
                      onChange={(e) => setCreateForm({ ...createForm, sampleOutput: e.target.value })}
                      className="w-full rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-mono text-slate-800 focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase text-slate-700">
                    JavaScript Starter Code
                  </label>
                  <textarea
                    rows={4}
                    value={createForm.starterJs}
                    onChange={(e) => setCreateForm({ ...createForm, starterJs: e.target.value })}
                    className="w-full rounded-xl border border-slate-300 bg-slate-900 p-3 font-mono text-xs text-indigo-300 focus:outline-none focus:border-indigo-600"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <PlusCircle className="h-4 w-4" />
                  <span>Publish Exam to Catalog</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: CANDIDATE EXAM REPORT & QUESTION CODES AUDIT
         ========================================================================= */}
      {inspectSubmission && (() => {
        const examObj = exams.find((e) => e.id === inspectSubmission.examId) || exams[0];
        const problemsList = examObj?.problems && examObj.problems.length > 0
          ? examObj.problems
          : [
              {
                id: "prob-single",
                title: inspectSubmission.problemTitle || "Primary Algorithm",
                difficulty: "Medium" as const,
                points: 100,
                description: "Primary technical problem implementation.",
                constraints: [],
                examples: [],
                starterCode: { javascript: "", python: "", cpp: "", java: "" },
                testCases: [],
              },
            ];

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto print:hidden">
            <div className="w-full max-w-4xl rounded-2xl border border-slate-200 bg-white p-6 sm:p-7 shadow-2xl space-y-5 max-h-[92vh] flex flex-col text-slate-900">
              {/* Header */}
              <div className="flex items-start justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Official Exam Report & Code Audit
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      #{inspectSubmission.certificateNumber || "REC-2026"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    {inspectSubmission.studentName} — {inspectSubmission.examTitle}
                  </h3>
                  <div className="text-xs text-amber-800 font-medium">
                    S/O {inspectSubmission.fatherName || "—"} • {inspectSubmission.studentEmail}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      const s = inspectSubmission;
                      setInspectSubmission(null);
                      openCertificateForSubmission(s);
                    }}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
                    title="Open Verified Certificate"
                  >
                    <Award className="h-4 w-4" />
                    <span>View Certificate</span>
                  </button>

                  <button
                    onClick={() => setInspectSubmission(null)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 cursor-pointer"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
              </div>

              {/* Summary KPIs */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Final Assessment Score:</span>
                  <span className="font-bold text-emerald-700 text-sm">
                    {inspectSubmission.scorePercentage}% ({inspectSubmission.scorePercentage >= (examObj?.passingScore || 60) ? "Passed" : "Failed"})
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Test Suite Verdict:</span>
                  <span className="font-bold text-slate-800 font-mono text-sm">
                    {inspectSubmission.testCasesPassed} / {inspectSubmission.totalTestCases} Tests
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Language & Runtime:</span>
                  <span className="font-mono font-bold uppercase text-indigo-600">
                    {inspectSubmission.language} • {inspectSubmission.executionTimeMs}ms
                  </span>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200">
                  <span className="text-slate-500 block text-[11px]">Submission Timestamp:</span>
                  <span className="text-slate-700 font-medium">
                    {inspectSubmission.submittedAt ? inspectSubmission.submittedAt.slice(0, 10) : "Recent"}
                  </span>
                </div>
              </div>

              {/* Questions & Codes Section */}
              <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Questions & Submitted Solutions ({problemsList.length} Questions)</span>
                  <span className="text-[11px] normal-case text-slate-400 font-normal">
                    Review candidate answers and unattempted status
                  </span>
                </div>

                {problemsList.map((prob, qIdx) => {
                  const detail = inspectSubmission.problemSubmissions?.find(
                    (p) => p.problemId === prob.id || p.problemTitle === prob.title
                  );

                  let status: "Attempted - Passed" | "Attempted - Failed" | "Not Attempted" = "Not Attempted";
                  let codeToShow = "";
                  let langToShow = inspectSubmission.language;

                  if (detail) {
                    status = detail.status;
                    codeToShow = detail.submittedCode || "";
                    langToShow = detail.language || inspectSubmission.language;
                  } else if (qIdx === 0) {
                    const attempted = Boolean(inspectSubmission.submittedCode && inspectSubmission.submittedCode.trim().length > 0);
                    status = !attempted
                      ? "Not Attempted"
                      : inspectSubmission.scorePercentage >= (examObj?.passingScore || 60)
                      ? "Attempted - Passed"
                      : "Attempted - Failed";
                    codeToShow = attempted ? inspectSubmission.submittedCode : "";
                  } else {
                    status = "Not Attempted";
                    codeToShow = "";
                  }

                  return (
                    <div
                      key={prob.id || qIdx}
                      className="rounded-2xl border border-slate-200 bg-white p-5 space-y-3.5 shadow-xs"
                    >
                      {/* Question Top Header */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                        <div className="flex items-center gap-2.5">
                          <span className="h-6 w-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold flex items-center justify-center shrink-0">
                            {qIdx + 1}
                          </span>
                          <div>
                            <h4 className="text-sm font-bold text-slate-900">{prob.title}</h4>
                            <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-500 font-mono">
                              <span>{prob.points} Points</span>
                              <span>•</span>
                              <span>Difficulty: {prob.difficulty}</span>
                            </div>
                          </div>
                        </div>

                        {/* Status Option Badge */}
                        <div>
                          {status === "Attempted - Passed" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                              <span>Attempted - Passed</span>
                            </span>
                          )}
                          {status === "Attempted - Failed" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-300">
                              <XCircle className="h-3.5 w-3.5 text-rose-600" />
                              <span>Attempted - Failed</span>
                            </span>
                          )}
                          {status === "Not Attempted" && (
                            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                              <AlertCircle className="h-3.5 w-3.5 text-amber-600" />
                              <span>Not Attempted</span>
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Problem Description Excerpt */}
                      {prob.description && (
                        <p className="text-xs text-slate-600 leading-relaxed bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                          {prob.description.length > 220
                            ? `${prob.description.slice(0, 220)}...`
                            : prob.description}
                        </p>
                      )}

                      {/* Code or Unattempted Status Area */}
                      {status !== "Not Attempted" && codeToShow.trim().length > 0 ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono px-1">
                            <span className="uppercase font-bold text-indigo-700">
                              Candidate Code ({langToShow})
                            </span>
                            <span>{codeToShow.split("\n").length} Lines of Code</span>
                          </div>
                          <div className="rounded-xl border border-slate-800 bg-slate-900 p-4 font-mono text-xs text-slate-100 max-h-56 overflow-y-auto">
                            <pre>
                              {codeToShow.split("\n").map((line, lIdx) => (
                                <div key={lIdx} className="table-row">
                                  <span className="table-cell pr-4 text-slate-500 select-none text-right w-8 text-[11px]">
                                    {lIdx + 1}
                                  </span>
                                  <span className="table-cell">{line}</span>
                                </div>
                              ))}
                            </pre>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50/60 p-5 text-center space-y-1">
                          <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-amber-900">
                            <AlertCircle className="h-4 w-4 text-amber-600" />
                            <span>Question Not Attempted</span>
                          </div>
                          <p className="text-[11px] text-amber-700 max-w-sm mx-auto">
                            The candidate did not submit any code or solution for this question.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link
                  href={`/report/${inspectSubmission.id}`}
                  target="_blank"
                  className="text-xs text-indigo-600 hover:text-indigo-700 flex items-center gap-1 font-semibold"
                >
                  <span>Open Full Laboratory Report</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Link>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const s = inspectSubmission;
                      setInspectSubmission(null);
                      openCertificateForSubmission(s);
                    }}
                    className="px-4 py-2 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-500 text-white flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Award className="h-3.5 w-3.5" />
                    <span>View Certificate</span>
                  </button>

                  <button
                    onClick={() => setInspectSubmission(null)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-800 cursor-pointer"
                  >
                    Close Report
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* =========================================================================
          MODAL: OFFICIAL SAMPLE CERTIFICATE (100% MATCHING M.NAVEEN-CERTIFICATE.pdf)
         ========================================================================= */}
      {viewCertificate && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-2 sm:p-4 overflow-y-auto print:static print:inset-auto print:z-auto print:p-0 print:m-0 print:bg-white print:overflow-hidden print:w-full print:h-full">
          <style
            dangerouslySetInnerHTML={{
              __html: `
                @media print {
                  @page {
                    size: landscape;
                    margin: 0 !important;
                  }
                  html, body {
                    width: 100vw !important;
                    height: 100vh !important;
                    max-width: 100vw !important;
                    max-height: 100vh !important;
                    margin: 0 !important;
                    padding: 0 !important;
                    overflow: hidden !important;
                    background: #ffffff !important;
                  }
                  #printable-certificate {
                    width: 100vw !important;
                    height: 99.2vh !important;
                    max-width: 297mm !important;
                    max-height: 210mm !important;
                    margin: 0 auto !important;
                    padding: 0 !important;
                    page-break-inside: avoid !important;
                    break-inside: avoid !important;
                    page-break-after: avoid !important;
                    break-after: avoid !important;
                    overflow: hidden !important;
                    box-shadow: none !important;
                    border: none !important;
                  }
                }
              `,
            }}
          />
          <div className="w-full max-w-5xl space-y-3 my-auto print:m-0 print:p-0 print:max-w-none print:w-full print:h-full print:space-y-0">
            {/* Modal Controls (hidden on print) */}
            <div className="flex items-center justify-between px-2 print:hidden">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                  <Award className="h-4 w-4" />
                  Official Andhra Pradesh Fire Services Certificate
                </span>
                <span className="text-slate-300 text-xs font-mono font-semibold">
                  • SI.No. {getFormattedSerialNo(viewCertificate.certificate)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrintCertificate}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                >
                  <Printer className="h-4 w-4" />
                  <span>Download / Print PDF</span>
                </button>
                <button
                  onClick={() => setViewCertificate(null)}
                  className="p-2 rounded-xl bg-white/90 hover:bg-white border border-slate-300 text-slate-700 hover:text-slate-900 cursor-pointer shadow-xs transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* PRESTIGIOUS 100% REPLICA CERTIFICATE (Using official template & signature) */}
            <div
              id="printable-certificate"
              className="relative w-full aspect-[1.414/1] bg-contain bg-no-repeat bg-center shadow-2xl rounded-sm print:rounded-none print:shadow-none print:aspect-auto"
              style={{
                backgroundImage: "url('/certificate_template.png')",
                backgroundSize: "100% 100%",
              }}
            >
              {/* Overlay Container with absolute percentage coordinate mapping */}
              <div className="absolute inset-0 select-text">
                {/* 1. Serial Number (Red, directly below left AP seal) */}
                <div
                  className="absolute font-sans font-extrabold text-[#D0021B] text-xs sm:text-sm md:text-base lg:text-lg tracking-tight"
                  style={{ top: "26.2%", left: "6.8%" }}
                >
                  SI.No.{getFormattedSerialNo(viewCertificate.certificate)}
                </div>

                {/* 2. Certificate Body Paragraph (Centered in the certification body area) */}
                <div
                  className="absolute text-justify font-serif"
                  style={{
                    top: "39%",
                    left: "7.8%",
                    right: "7.8%",
                  }}
                >
                  <p className="text-[12px] sm:text-[14.5px] md:text-[16.5px] lg:text-[18.5px] leading-[1.8] sm:leading-[2.1] md:leading-[2.25] lg:leading-[2.4] text-black">
                    <span className="font-certificate-script text-[1.15em] text-black">This is to certify that Mr./Ms. </span>
                    <span className="font-serif font-extrabold uppercase text-black">
                      {viewCertificate.certificate.studentName || "M.NAVEEN"}
                    </span>
                    <span className="font-serif font-bold text-black"> , S/O </span>
                    <span className="font-serif font-extrabold uppercase text-black">
                      {viewCertificate.certificate.fatherName || "M.SANKARA"}
                    </span>
                    <span className="font-serif font-bold text-black"> OF </span>
                    <span className="font-serif font-extrabold uppercase text-black">
                      {(
                        viewCertificate.certificate.instituteName ||
                        viewCertificate.certificate.companyName?.replace(/, Andhra Pradesh/i, "") ||
                        "FINTECH SYSTEMS"
                      ).toUpperCase()}
                    </span>
                    <span className="font-certificate-script text-[1.15em] text-black"> has undergone </span>
                    <span className="font-certificate-script text-[1.2em] font-bold text-[#D0021B]">
                      &ldquo;{viewCertificate.certificate.examTitle || "Basic Fire Prevention and First Aid Fire Fighting"}&rdquo;
                    </span>
                    <span className="font-certificate-script text-[1.15em] text-black"> for a period of </span>
                    <span className="font-serif font-bold text-black">
                      {viewCertificate.certificate.trainingPeriod || "3 Days"}
                    </span>
                    <span className="font-certificate-script text-[1.15em] text-black"> from </span>
                    <span className="whitespace-nowrap font-serif font-bold underline underline-offset-2 text-black">
                      {viewCertificate.certificate.startDate || "06-10-2026"}
                    </span>
                    <span className="font-certificate-script text-[1.15em] text-black"> to </span>
                    <span className="whitespace-nowrap font-serif font-bold underline underline-offset-2 text-black">
                      {viewCertificate.certificate.endDate || "08-10-2026"}
                    </span>
                    <span className="font-serif font-bold text-black"> AT PREMISES OF </span>
                    <span className="font-serif font-extrabold uppercase text-black">
                      CHITTOOR FIRE STATION
                    </span>
                  </p>
                </div>

                {/* 3. Director Signature & Designation (Bottom Right - Safe distance from corner border) */}
                <div
                  className="absolute flex flex-col items-center text-center"
                  style={{
                    bottom: "6%",
                    right: "16%",
                  }}
                >
                  <img
                    src="/director_signature.png"
                    alt="P. Venkata Ramana Signature"
                    className="h-10 sm:h-12 md:h-14 lg:h-16 w-auto object-contain pointer-events-none -mb-0.5"
                  />
                  <div className="font-bold text-black font-serif text-[11px] sm:text-xs md:text-sm lg:text-[15px] tracking-wide leading-tight whitespace-nowrap">
                    P.VENKATA RAMANA,
                  </div>
                  <div className="font-bold text-black font-sans text-[10px] sm:text-[11px] md:text-xs lg:text-[13px] tracking-tight leading-tight mt-0.5 whitespace-nowrap">
                    Director, A.P. Fire Services and Civil Defence
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminPortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-500 text-xs">
          Loading Administrator Console...
        </div>
      }
    >
      <AdminPortalContent />
    </Suspense>
  );
}
