"use client";

import React, { Suspense } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import {
  Code2,
  ShieldCheck,
  User,
  LogOut,
  Building2,
  PlusCircle,
  Activity,
  Layers,
  Users,
  FileText,
  Award,
  Info,
} from "lucide-react";

function NavbarInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { currentUser, logout } = useAssessment();

  // Hide in exam coding IDE fullscreen
  const isExamScreen = pathname.startsWith("/exam/");
  if (isExamScreen) return null;

  const isWelcomePage = pathname === "/";
  const isAuthPage = pathname.startsWith("/auth/");
  const isPublicPage = isWelcomePage || isAuthPage;

  const currentTab = searchParams.get("tab") || "dashboard";

  const isAdmin = currentUser?.role === "company_admin";
  const isStudent = currentUser?.role === "student";

  // Student active tab checks
  const isStudentDashboardActive = pathname === "/dashboard" && currentTab === "dashboard";
  const isStudentExamsActive = pathname === "/dashboard" && currentTab === "exams";

  // Admin active tab checks
  const isAdminDashboardActive = pathname === "/admin" && (currentTab === "dashboard" || currentTab === "live");
  const isAdminUsersActive = pathname === "/admin" && currentTab === "users";
  const isAdminExamsActive = pathname === "/admin" && (currentTab === "exams" || currentTab === "create");
  const isAdminReportsActive = pathname === "/admin" && currentTab === "reports";
  const isAdminCertsActive = pathname === "/admin" && currentTab === "certificates";

  return (
    <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-xs print:hidden">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 group-hover:scale-105 transition-transform">
              <Code2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-indigo-600 transition-colors">
                  CodeAssess
                </span>
                {!isPublicPage && isAdmin && (
                  <span className="rounded-full bg-amber-50 px-2.5 py-0.5 text-[10px] font-bold text-amber-800 border border-amber-200">
                    ADMIN
                  </span>
                )}
                {!isPublicPage && isStudent && (
                  <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[10px] font-semibold text-indigo-700 border border-indigo-200">
                    STUDENT
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 hidden sm:block">
                {isPublicPage
                  ? "Standardized Coding Assessment & Evaluation Platform"
                  : isAdmin
                  ? "Admin & Assessment Management Console"
                  : isStudent
                  ? "Candidate Assessment Portal"
                  : "Technical Assessment Platform"}
              </p>
            </div>
          </Link>

          {/* Nav Links:
              If on Public Page (/ or /auth/*): ONLY show "About the Website", NO menu buttons!
              If on authenticated internal portal pages: show student or admin menu */}
          <nav className="hidden md:flex items-center gap-1.5">
            {isPublicPage ? (
              <Link
                href="/#about"
                className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Info className="h-3.5 w-3.5 text-indigo-600" />
                <span>About the Website</span>
              </Link>
            ) : (
              <>
                {/* STUDENT MENU: Dashboard, Examinations */}
                {isStudent && (
                  <>
                    <Link
                      href="/dashboard?tab=dashboard"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isStudentDashboardActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Activity
                        className={`h-3.5 w-3.5 ${
                          isStudentDashboardActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/dashboard?tab=exams"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isStudentExamsActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Layers
                        className={`h-3.5 w-3.5 ${
                          isStudentExamsActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Examinations</span>
                    </Link>
                  </>
                )}

                {/* ADMIN MENU: Dashboard, Users, Examinations, Reports, Certificates */}
                {isAdmin && (
                  <>
                    <Link
                      href="/admin?tab=dashboard"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isAdminDashboardActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <ShieldCheck
                        className={`h-3.5 w-3.5 ${
                          isAdminDashboardActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Dashboard</span>
                    </Link>

                    <Link
                      href="/admin?tab=users"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isAdminUsersActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Users
                        className={`h-3.5 w-3.5 ${
                          isAdminUsersActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Users</span>
                    </Link>

                    <Link
                      href="/admin?tab=exams"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isAdminExamsActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Layers
                        className={`h-3.5 w-3.5 ${
                          isAdminExamsActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Examinations</span>
                    </Link>

                    <Link
                      href="/admin?tab=reports"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isAdminReportsActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <FileText
                        className={`h-3.5 w-3.5 ${
                          isAdminReportsActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Reports</span>
                    </Link>

                    <Link
                      href="/admin?tab=certificates"
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                        isAdminCertsActive
                          ? "text-indigo-700 bg-indigo-50 border border-indigo-200 shadow-xs"
                          : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                      }`}
                    >
                      <Award
                        className={`h-3.5 w-3.5 ${
                          isAdminCertsActive ? "text-indigo-600" : "text-slate-500"
                        }`}
                      />
                      <span>Certificates</span>
                    </Link>
                  </>
                )}

                {/* If guest browsing non-welcome page, offer About link */}
                {!currentUser && (
                  <Link
                    href="/#about"
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    About the Website
                  </Link>
                )}
              </>
            )}
          </nav>
        </div>

        {/* Right action area:
            On Public Pages (/ and /auth/*): Clean Login / Sign Up buttons, NEVER show user identity pill
            On Internal Portal Pages: User identity pill and Sign Out */}
        <div className="flex items-center gap-2.5">
          {isPublicPage ? (
            <div className="flex items-center gap-2">
              {pathname === "/auth/login" ? (
                <Link
                  href="/auth/register"
                  className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/20"
                >
                  Sign Up
                </Link>
              ) : pathname === "/auth/register" ? (
                <Link
                  href="/auth/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors border border-slate-200"
                >
                  Login
                </Link>
              ) : (
                <>
                  <Link
                    href="/auth/login"
                    className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/20"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          ) : currentUser ? (
            <div className="flex items-center gap-3">
              {/* Admin Create Exam CTA in Header */}
              {isAdmin && (
                <Link
                  href="/admin?tab=exams"
                  className="hidden sm:flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 text-xs font-bold text-white shadow-sm transition-all"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Create Exam</span>
                </Link>
              )}

              {/* User Identity Pill */}
              <div className="hidden sm:flex flex-col text-right">
                <span className="text-xs font-semibold text-slate-900 flex items-center justify-end gap-1.5">
                  {isAdmin ? (
                    <>
                      <Building2 className="h-3.5 w-3.5 text-amber-600" />
                      {currentUser.name}
                    </>
                  ) : (
                    <>
                      <User className="h-3.5 w-3.5 text-indigo-600" />
                      {currentUser.name}
                    </>
                  )}
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  {isAdmin ? "Administrator" : currentUser.email}
                </span>
              </div>

              {/* Sign Out */}
              <button
                onClick={() => {
                  logout();
                  router.push("/");
                }}
                title="Sign out"
                className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/auth/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                Login
              </Link>
              <Link
                href="/auth/register"
                className="rounded-lg bg-indigo-600 px-3.5 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-all shadow-sm shadow-indigo-600/20"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default function Navbar() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white h-16" />
      }
    >
      <NavbarInner />
    </Suspense>
  );
}
