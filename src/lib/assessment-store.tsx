"use client";

import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import {
  MOCK_EXAMS,
  INITIAL_SUBMISSIONS,
  INITIAL_CERTIFICATES,
  ExamData,
  SubmissionReportData,
  CertificateData,
} from "./mock-data";

export interface UserSession {
  id: string;
  name: string;
  fatherName?: string;
  instituteName?: string;
  email: string;
  phone: string;
  role: "student" | "company_admin";
}

export interface RegisterInput {
  name: string;
  fatherName: string;
  instituteName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export interface LiveStudentSession {
  id: string;
  studentName: string;
  studentEmail: string;
  examId: string;
  examTitle: string;
  startedAt: string;
  currentLanguage: string;
  testRunsCount: number;
  status: "Writing Code" | "Running Tests" | "Reviewing Cases";
}

export interface LiveActivityEvent {
  id: string;
  studentName: string;
  examTitle: string;
  type: "TEST_RUN" | "QUESTION_SUBMIT" | "STARTED_EXAM";
  description: string;
  timestamp: string;
}

interface AssessmentContextType {
  currentUser: UserSession | null;
  registeredStudents: {
    id: string;
    name: string;
    fatherName: string;
    instituteName?: string;
    email: string;
    phone: string;
    passwordHash: string;
    createdAt?: string;
  }[];
  exams: ExamData[];
  submissions: SubmissionReportData[];
  certificates: CertificateData[];
  liveWritersCount: number;
  liveQuestionsSubmitted: number;
  liveWritingStudents: LiveStudentSession[];
  liveActivityEvents: LiveActivityEvent[];
  createExam: (newExam: Omit<ExamData, "id">) => ExamData;
  loginUser: (identifier: string, password: string) => { success: boolean; role?: "student" | "company_admin"; error?: string };
  loginStudent: (identifier: string, password: string) => { success: boolean; error?: string };
  registerStudent: (input: RegisterInput) => { success: boolean; error?: string };
  loginAdmin: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  quickLoginStudent: (studentId?: string) => void;
  quickLoginAdmin: () => void;
  changeUserPassword: (studentId: string, newPassword: string) => { success: boolean; error?: string };
  submitExamAttempt: (params: {
    examId: string;
    language: string;
    submittedCode: string;
    testCasesPassed: number;
    totalTestCases: number;
  }) => { submission: SubmissionReportData; certificate: CertificateData };
  getSubmissionById: (id: string) => SubmissionReportData | undefined;
  getCertificateById: (id: string) => CertificateData | undefined;
  getCertificateBySubmissionId: (subId: string) => CertificateData | undefined;
  resetAllRecords: () => void;
  enterExamSession: (examId: string, studentName?: string) => string;
  leaveExamSession: (sessionId: string) => void;
  recordTestRun: (examId: string) => void;
}

const AssessmentContext = createContext<AssessmentContextType | null>(null);

const DEFAULT_REGISTERED_STUDENTS = [
  {
    id: "std-alex-01",
    name: "Alex Mercer",
    fatherName: "Arthur Mercer",
    instituteName: "FINTECH SYSTEMS",
    email: "alex.mercer@cs.edu",
    phone: "9876543210",
    passwordHash: "password123",
    createdAt: "2026-10-01",
  },
  {
    id: "std-sarah-02",
    name: "Sarah Chen",
    fatherName: "Li Chen",
    instituteName: "CLOUD SYSTEMS",
    email: "sarah.chen@tech.org",
    phone: "9123456780",
    passwordHash: "password123",
    createdAt: "2026-10-05",
  },
  {
    id: "std-demo-03",
    name: "M. Naveen",
    fatherName: "M. Sankara",
    instituteName: "DODLA DAIRY LIMITED",
    email: "student@test.com",
    phone: "9988776655",
    passwordHash: "student123",
    createdAt: "2026-10-08",
  },
];

const INITIAL_LIVE_WRITERS: LiveStudentSession[] = [];

const INITIAL_ACTIVITY_STREAM: LiveActivityEvent[] = [];

export function AssessmentProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserSession | null>(null);
  const [registeredStudents, setRegisteredStudents] = useState(DEFAULT_REGISTERED_STUDENTS);
  const [exams, setExams] = useState<ExamData[]>(MOCK_EXAMS);
  const [submissions, setSubmissions] = useState<SubmissionReportData[]>(INITIAL_SUBMISSIONS);
  const [certificates, setCertificates] = useState<CertificateData[]>(INITIAL_CERTIFICATES);
  const [liveWritingStudents, setLiveWritingStudents] = useState<LiveStudentSession[]>([]);
  const [liveQuestionsSubmitted, setLiveQuestionsSubmitted] = useState(0);
  const [liveWritersCount, setLiveWritersCount] = useState(0);
  const [liveActivityEvents, setLiveActivityEvents] = useState<LiveActivityEvent[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load state from localStorage on hydration and purge old mock entries
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("certicode_user");
      if (storedUser) setCurrentUser(JSON.parse(storedUser));

      const storedStudents = localStorage.getItem("certicode_students");
      if (storedStudents) {
        const parsed = JSON.parse(storedStudents);
        const merged = Array.isArray(parsed)
          ? parsed.map((s: any) => {
              if (!s.instituteName) {
                const def = DEFAULT_REGISTERED_STUDENTS.find((d) => d.id === s.id);
                return { ...s, instituteName: def?.instituteName || "DODLA DAIRY LIMITED" };
              }
              return s;
            })
          : DEFAULT_REGISTERED_STUDENTS;
        setRegisteredStudents(merged);
      }

      const storedExams = localStorage.getItem("certicode_exams");
      if (storedExams) setExams(JSON.parse(storedExams));

      const storedSubs = localStorage.getItem("certicode_submissions");
      if (storedSubs) {
        const parsed = JSON.parse(storedSubs);
        // Clean out any old mock records from previous sessions
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((s: any) => s.id !== "sub-1001" && s.id !== "sub-1002")
          : [];
        setSubmissions(cleaned.length > 0 ? cleaned : INITIAL_SUBMISSIONS);
      } else {
        setSubmissions(INITIAL_SUBMISSIONS);
      }

      const storedCerts = localStorage.getItem("certicode_certificates");
      if (storedCerts) {
        const parsed = JSON.parse(storedCerts);
        // Clean out any old mock certificates
        const cleaned = Array.isArray(parsed)
          ? parsed.filter((c: any) => c.id !== "cert-stripe-8821" && c.id !== "cert-gcloud-4491")
          : [];
        setCertificates(cleaned.length > 0 ? cleaned : INITIAL_CERTIFICATES);
      } else {
        setCertificates(INITIAL_CERTIFICATES);
      }

      const storedLiveCount = localStorage.getItem("certicode_live_submissions_count");
      if (storedLiveCount) {
        const parsedCount = parseInt(storedLiveCount, 10);
        if (parsedCount === 148 || isNaN(parsedCount)) {
          setLiveQuestionsSubmitted(0);
          localStorage.setItem("certicode_live_submissions_count", "0");
        } else {
          setLiveQuestionsSubmitted(parsedCount);
        }
      } else {
        setLiveQuestionsSubmitted(0);
      }
    } catch (e) {
      console.warn("Could not load from localStorage:", e);
    }
    setIsLoaded(true);
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    if (!isLoaded) return;
    try {
      if (currentUser) {
        localStorage.setItem("certicode_user", JSON.stringify(currentUser));
      } else {
        localStorage.removeItem("certicode_user");
      }
      localStorage.setItem("certicode_students", JSON.stringify(registeredStudents));
      localStorage.setItem("certicode_exams", JSON.stringify(exams));
      localStorage.setItem("certicode_submissions", JSON.stringify(submissions));
      localStorage.setItem("certicode_certificates", JSON.stringify(certificates));
      localStorage.setItem("certicode_live_submissions_count", liveQuestionsSubmitted.toString());
    } catch (e) {
      console.warn("Could not sync to localStorage:", e);
    }
  }, [currentUser, registeredStudents, exams, submissions, certificates, liveQuestionsSubmitted, isLoaded]);

  // Real-time automatic ticker: only updates if active writing student sessions exist
  useEffect(() => {
    if (liveWritingStudents.length === 0) {
      setLiveWritersCount(0);
      return;
    }

    const interval = setInterval(() => {
      // 1. Keep writers count in sync with real live writing candidates
      setLiveWritersCount(liveWritingStudents.length);

      // 2. Slightly update an active student's status or test count
      setLiveWritingStudents((prev) => {
        if (prev.length === 0) return prev;
        return prev.map((s, idx) => {
          if (idx === Math.floor(Math.random() * prev.length)) {
            const nextStatus: LiveStudentSession["status"] =
              s.status === "Writing Code"
                ? "Running Tests"
                : s.status === "Running Tests"
                ? "Reviewing Cases"
                : "Writing Code";
            return {
              ...s,
              testRunsCount: s.testRunsCount + 1,
              status: nextStatus,
            };
          }
          return s;
        });
      });
    }, 4000);

    return () => clearInterval(interval);
  }, [liveWritingStudents.length]);

  // Reset all records to 0
  const resetAllRecords = () => {
    setSubmissions([]);
    setCertificates([]);
    setLiveQuestionsSubmitted(0);
    setLiveWritersCount(0);
    setLiveWritingStudents([]);
    setLiveActivityEvents([]);
    try {
      localStorage.setItem("certicode_submissions", JSON.stringify([]));
      localStorage.setItem("certicode_certificates", JSON.stringify([]));
      localStorage.setItem("certicode_live_submissions_count", "0");
    } catch (e) {
      console.warn("Could not reset localStorage:", e);
    }
  };

  // Live session management for candidates
  const enterExamSession = (examId: string, studentName?: string) => {
    const exam = exams.find((e) => e.id === examId) || exams[0];
    const name = studentName || (currentUser ? currentUser.name : "Candidate Student");
    const sessionId = `live-${Date.now().toString(36)}`;
    const newSession: LiveStudentSession = {
      id: sessionId,
      studentName: name,
      studentEmail: currentUser ? currentUser.email : "candidate@assessment.edu",
      examId,
      examTitle: exam ? exam.title : "Technical Assessment",
      startedAt: "Just now",
      currentLanguage: "JavaScript ES6",
      testRunsCount: 0,
      status: "Writing Code",
    };

    setLiveWritingStudents((prev) => [newSession, ...prev]);
    setLiveWritersCount((prev) => prev + 1);

    setLiveActivityEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        studentName: name,
        examTitle: exam ? exam.companyName : "Code Assessment",
        type: "STARTED_EXAM",
        description: "Started challenge session",
        timestamp: "Just now",
      },
      ...prev.slice(0, 15),
    ]);

    return sessionId;
  };

  const leaveExamSession = (sessionId: string) => {
    setLiveWritingStudents((prev) => {
      const updated = prev.filter((s) => s.id !== sessionId);
      setLiveWritersCount(updated.length);
      return updated;
    });
  };

  const recordTestRun = (examId: string) => {
    const exam = exams.find((e) => e.id === examId);
    const name = currentUser ? currentUser.name : "Candidate Student";
    setLiveQuestionsSubmitted((prev) => prev + 1);
    setLiveActivityEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        studentName: name,
        examTitle: exam ? exam.companyName : "Code Assessment",
        type: "TEST_RUN",
        description: "Ran test suite in Monaco IDE",
        timestamp: "Just now",
      },
      ...prev.slice(0, 15),
    ]);
  };

  // Create new exam by Admin
  const createExam = (newExamData: Omit<ExamData, "id">) => {
    const id = `exam-custom-${Date.now().toString(36)}`;
    const created: ExamData = {
      ...newExamData,
      id,
    };
    const updated = [created, ...exams];
    setExams(updated);
    return created;
  };

  // Delete exam by Admin
  const deleteExam = (id: string) => {
    setExams((prev) => prev.filter((e) => e.id !== id));
  };

  // Student Dual Login: Email OR Phone
  const loginStudent = (identifier: string, password: string) => {
    const trimmed = identifier.trim().toLowerCase();
    const cleanInputDigits = identifier.replace(/[^0-9]/g, "");

    const student = registeredStudents.find((s) => {
      const matchEmail = s.email && s.email.toLowerCase() === trimmed;
      const matchPhone =
        cleanInputDigits.length >= 7 &&
        s.phone &&
        s.phone.replace(/[^0-9]/g, "") === cleanInputDigits;
      return matchEmail || matchPhone;
    });

    if (!student) {
      return { success: false, error: "No student account found with this Email ID or Phone Number." };
    }

    if (student.passwordHash !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const session: UserSession = {
      id: student.id,
      name: student.name,
      fatherName: student.fatherName,
      instituteName: student.instituteName,
      email: student.email,
      phone: student.phone,
      role: "student",
    };

    setCurrentUser(session);
    try {
      localStorage.setItem("certicode_user", JSON.stringify(session));
    } catch (e) {
      console.warn("Could not save session to localStorage", e);
    }
    return { success: true };
  };

  // Student Registration with Father's Name & Institute Name
  const registerStudent = (input: RegisterInput) => {
    const { name, fatherName, instituteName, email, phone, password, confirmPassword } = input;

    if (
      !name.trim() ||
      !fatherName.trim() ||
      !instituteName.trim() ||
      !email.trim() ||
      !phone.trim() ||
      !password ||
      !confirmPassword
    ) {
      return { success: false, error: "All registration fields including Institute / Organization are required." };
    }

    if (password !== confirmPassword) {
      return { success: false, error: "Passwords do not match." };
    }

    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters long." };
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanPhone = phone.trim().replace(/[^0-9]/g, "");

    if (cleanPhone.length < 10) {
      return { success: false, error: "Please provide a valid 10-digit phone number." };
    }

    const emailExists = registeredStudents.some((s) => s.email.toLowerCase() === cleanEmail);
    if (emailExists) {
      return { success: false, error: "An account with this Email ID already exists." };
    }

    const phoneExists = registeredStudents.some(
      (s) => s.phone.replace(/[^0-9]/g, "") === cleanPhone
    );
    if (phoneExists) {
      return { success: false, error: "An account with this Phone Number already exists." };
    }

    const newStudent = {
      id: `std-${Date.now().toString(36)}`,
      name: name.trim(),
      fatherName: fatherName.trim(),
      instituteName: instituteName.trim(),
      email: cleanEmail,
      phone: cleanPhone,
      passwordHash: password,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [newStudent, ...registeredStudents];
    setRegisteredStudents(updated);

    const session: UserSession = {
      id: newStudent.id,
      name: newStudent.name,
      fatherName: newStudent.fatherName,
      instituteName: newStudent.instituteName,
      email: newStudent.email,
      phone: newStudent.phone,
      role: "student",
    };
    setCurrentUser(session);

    return { success: true };
  };

  // Change Password for any user by Admin
  const changeUserPassword = (studentId: string, newPassword: string) => {
    if (!newPassword || newPassword.length < 4) {
      return { success: false, error: "Password must be at least 4 characters long." };
    }
    const student = registeredStudents.find((s) => s.id === studentId);
    if (!student) {
      return { success: false, error: "User account not found." };
    }
    const updated = registeredStudents.map((s) =>
      s.id === studentId ? { ...s, passwordHash: newPassword } : s
    );
    setRegisteredStudents(updated);
    try {
      localStorage.setItem("certicode_students", JSON.stringify(updated));
    } catch (e) {
      console.warn("Could not save students to localStorage", e);
    }
    return { success: true };
  };

  // Admin Login
  const loginAdmin = (email: string, password: string) => {
    const trimmed = email.trim().toLowerCase();
    if (
      (trimmed === "admin@company.com" || trimmed === "admin@codeassess.com" || trimmed === "admin@certicode.com") &&
      (password === "admin123" || password === "admin")
    ) {
      const adminSession: UserSession = {
        id: "admin-master-01",
        name: "Assessment Administrator",
        email: "admin@codeassess.com",
        phone: "+1 (800) 555-0199",
        role: "company_admin",
      };
      setCurrentUser(adminSession);
      return { success: true };
    }
    return { success: false, error: "Invalid Admin credentials. Use admin@company.com / admin123." };
  };

  // Unified Login: checks Admin first, then checks Student (email or phone)
  const loginUser = (identifier: string, password: string) => {
    const trimmed = identifier.trim().toLowerCase();

    // 1. Check if matching Admin credentials
    if (
      (trimmed === "admin@company.com" ||
        trimmed === "admin@codeassess.com" ||
        trimmed === "admin@certicode.com" ||
        trimmed === "admin") &&
      (password === "admin123" || password === "admin")
    ) {
      const adminSession: UserSession = {
        id: "admin-master-01",
        name: "Assessment Administrator",
        email: "admin@codeassess.com",
        phone: "+1 (800) 555-0199",
        role: "company_admin",
      };
      setCurrentUser(adminSession);
      try {
        localStorage.setItem("certicode_user", JSON.stringify(adminSession));
      } catch (e) {
        console.warn("Could not save session to localStorage", e);
      }
      return { success: true, role: "company_admin" as const };
    }

    // 2. Check if matching Student account
    const cleanInputDigits = identifier.replace(/[^0-9]/g, "");
    const student = registeredStudents.find((s) => {
      const matchEmail = s.email && s.email.toLowerCase() === trimmed;
      const matchPhone =
        cleanInputDigits.length >= 7 &&
        s.phone &&
        s.phone.replace(/[^0-9]/g, "") === cleanInputDigits;
      return matchEmail || matchPhone;
    });

    if (!student) {
      return {
        success: false,
        error: "No account found matching this Email ID or Phone Number. Please check your credentials or register.",
      };
    }

    if (student.passwordHash !== password) {
      return { success: false, error: "Incorrect password. Please try again." };
    }

    const session: UserSession = {
      id: student.id,
      name: student.name,
      fatherName: student.fatherName,
      instituteName: student.instituteName,
      email: student.email,
      phone: student.phone,
      role: "student",
    };

    setCurrentUser(session);
    try {
      localStorage.setItem("certicode_user", JSON.stringify(session));
    } catch (e) {
      console.warn("Could not save session to localStorage", e);
    }
    return { success: true, role: "student" as const };
  };

  const logout = useCallback(() => {
    setCurrentUser(null);
    try {
      localStorage.removeItem("certicode_user");
    } catch (e) {
      console.warn("Could not remove user from localStorage", e);
    }
  }, []);

  const quickLoginStudent = (studentId = "std-demo-03") => {
    const student = registeredStudents.find((s) => s.id === studentId) || registeredStudents[0];
    setCurrentUser({
      id: student.id,
      name: student.name,
      fatherName: student.fatherName,
      instituteName: student.instituteName,
      email: student.email,
      phone: student.phone,
      role: "student",
    });
  };

  const quickLoginAdmin = () => {
    setCurrentUser({
      id: "admin-master-01",
      name: "Assessment Administrator",
      email: "admin@codeassess.com",
      phone: "+1 (800) 555-0199",
      role: "company_admin",
    });
  };

  // Exam submission
  const submitExamAttempt = ({
    examId,
    language,
    submittedCode,
    testCasesPassed,
    totalTestCases,
  }: {
    examId: string;
    language: string;
    submittedCode: string;
    testCasesPassed: number;
    totalTestCases: number;
  }) => {
    const exam = exams.find((e) => e.id === examId) || exams[0] || MOCK_EXAMS[0];
    const student = currentUser && currentUser.role === "student"
      ? currentUser
      : {
          id: "std-guest-99",
          name: "Candidate Student",
          fatherName: "Guardian Name",
          instituteName: "FINTECH SYSTEMS",
          email: "student@candidate.edu",
          phone: "9876543210",
          role: "student" as const,
        };

    const submissionId = `sub-${Date.now().toString(36)}`;
    const certId = `cert-${Date.now().toString(36)}`;
    const certSeq = Math.floor(14474 + Math.random() * 50);
    const certificateNumber = `${certSeq}`;
    const serialNumber = `${certSeq}`;
    const studentFatherName = student.fatherName || registeredStudents.find(s => s.id === student.id)?.fatherName || "M. Sankara";
    const studentInstituteName = student.instituteName || registeredStudents.find(s => s.id === student.id)?.instituteName || "FINTECH SYSTEMS";

    const scorePercentage = totalTestCases > 0 ? Math.round((testCasesPassed / totalTestCases) * 100) : 100;
    const nowIso = new Date().toISOString();

    const problemSubmissions = (exam.problems || []).map((prob, idx) => {
      const isAttempted = idx === 0 ? Boolean(submittedCode && submittedCode.trim().length > 0) : false;
      return {
        problemId: prob.id,
        problemTitle: prob.title,
        points: prob.points,
        difficulty: prob.difficulty,
        status: isAttempted
          ? (scorePercentage >= (exam.passingScore || 60) ? "Attempted - Passed" as const : "Attempted - Failed" as const)
          : "Not Attempted" as const,
        submittedCode: isAttempted ? submittedCode : "",
        language,
        testCasesPassed: isAttempted ? testCasesPassed : 0,
        totalTestCases: isAttempted ? totalTestCases : (prob.testCases?.length || 0),
      };
    });

    const newSubmission: SubmissionReportData = {
      id: submissionId,
      studentId: student.id,
      studentName: student.name,
      fatherName: studentFatherName,
      instituteName: studentInstituteName,
      studentEmail: student.email,
      studentPhone: student.phone,
      examId: exam.id,
      examTitle: exam.title,
      companyName: exam.companyName,
      problemTitle: exam.problems[0]?.title || "Technical Problem",
      language,
      submittedCode,
      testCasesPassed,
      totalTestCases,
      scorePercentage,
      executionTimeMs: Math.floor(Math.random() * 25) + 32,
      memoryKb: Math.floor(Math.random() * 4000) + 16000,
      status: "Submitted & Evaluated",
      submittedAt: nowIso,
      certificateId: certId,
      certificateNumber,
      problemSubmissions,
    };

    const newCertificate: CertificateData = {
      id: certId,
      serialNo: serialNumber,
      certificateNumber,
      studentId: student.id,
      studentName: student.name,
      fatherName: studentFatherName,
      instituteName: studentInstituteName,
      studentEmail: student.email,
      examId: exam.id,
      examTitle: exam.title,
      companyName: exam.companyName,
      submissionId,
      scorePercentage,
      issuedAt: nowIso,
      trainingPeriod: exam.durationMinutes > 60 ? "3 Days" : "Standard Examination Session",
      startDate: "06-10-2026",
      endDate: "08-10-2026",
      premises: "CHITTOOR FIRE STATION",
      directorName: "P.VENKATA RAMANA",
      directorRole: "Director, A.P. Fire Services and Civil Defence",
      verificationHash: `0x${Math.random().toString(16).slice(2, 10)}${Math.random().toString(16).slice(2, 10)}`,
      status: "Issued",
    };

    setSubmissions((prev) => [newSubmission, ...prev]);
    setCertificates((prev) => [newCertificate, ...prev]);
    setLiveQuestionsSubmitted((prev) => prev + 1);

    // Push event to live stream
    setLiveActivityEvents((prev) => [
      {
        id: `evt-${Date.now()}`,
        studentName: student.name,
        examTitle: exam.companyName,
        type: "QUESTION_SUBMIT",
        description: `Completed exam (${scorePercentage}% score, ${testCasesPassed}/${totalTestCases} tests passed)`,
        timestamp: "Just now",
      },
      ...prev,
    ]);

    return { submission: newSubmission, certificate: newCertificate };
  };

  const getSubmissionById = (id: string) => {
    return submissions.find((s) => s.id === id);
  };

  const getCertificateById = (id: string) => {
    return certificates.find((c) => c.id === id);
  };

  const getCertificateBySubmissionId = (subId: string) => {
    return certificates.find((c) => c.submissionId === subId);
  };

  return (
    <AssessmentContext.Provider
      value={{
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
        loginUser,
        loginStudent,
        registerStudent,
        loginAdmin,
        logout,
        quickLoginStudent,
        quickLoginAdmin,
        changeUserPassword,
        submitExamAttempt,
        getSubmissionById,
        getCertificateById,
        getCertificateBySubmissionId,
        resetAllRecords,
        enterExamSession,
        leaveExamSession,
        recordTestRun,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
}

export function useAssessment() {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error("useAssessment must be used within an AssessmentProvider");
  }
  return context;
}
