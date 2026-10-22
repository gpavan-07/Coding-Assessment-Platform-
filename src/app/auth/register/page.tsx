"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAssessment } from "@/lib/assessment-store";
import {
  Code2,
  Lock,
  Mail,
  Phone,
  User,
  Building2,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const { registerStudent, logout } = useAssessment();

  // Clear any existing session when accessing register page
  useEffect(() => {
    logout();
  }, [logout]);

  const [name, setName] = useState("");
  const [fatherName, setFatherName] = useState("");
  const [instituteName, setInstituteName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!name.trim()) {
      setError("Full Name is required.");
      return;
    }
    if (!fatherName.trim()) {
      setError("Father's / Guardian's Name is required (used for official S/O certificate generation).");
      return;
    }
    if (!instituteName.trim()) {
      setError("Institute / Organization Name is required (e.g. FINTECH SYSTEMS, DODLA DAIRY LIMITED).");
      return;
    }
    if (!email.trim() || !email.includes("@")) {
      setError("Please provide a valid unique Email ID.");
      return;
    }
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (cleanPhone.length < 10) {
      setError("Please provide a valid 10-digit Phone Number.");
      return;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match. Please re-enter.");
      return;
    }

    const res = registerStudent({
      name,
      fatherName,
      instituteName,
      email,
      phone,
      password,
      confirmPassword,
    });

    if (res.success) {
      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard");
      }, 1000);
    } else {
      setError(res.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-slate-50 text-slate-900">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/20 mb-4">
            <Code2 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Create Candidate Account
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Register to access technical coding assessments and receive your official verified certificates.
          </p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-md">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
                <CheckCircle2 className="h-8 w-8" />
              </div>
              <h2 className="text-xl font-bold text-slate-900">Registration Successful!</h2>
              <p className="text-sm text-slate-600">
                Welcome, <span className="text-indigo-600 font-semibold">{name}</span>. Redirecting you to your candidate examination portal...
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Full Name <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. M. Naveen"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
              </div>

              {/* Father's Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Father&apos;s / Guardian&apos;s Name <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    Printed on Certificate (S/O)
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fatherName}
                    onChange={(e) => setFatherName(e.target.value)}
                    placeholder="e.g. M. Sankara"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
              </div>

              {/* Institute / Organization Name */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Institute / Organization <span className="text-rose-600">*</span>
                  </label>
                  <span className="text-[10px] text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded font-medium">
                    Printed on Certificate (OF ...)
                  </span>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Building2 className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={instituteName}
                    onChange={(e) => setInstituteName(e.target.value)}
                    placeholder="e.g. FINTECH SYSTEMS or DODLA DAIRY LIMITED"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Your college, university, or company name to appear on your official certificate.
                </p>
              </div>

              {/* Unique Email */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Unique Email ID <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Mail className="h-4 w-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="student@university.edu"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Used for exam notifications and dual-login access.
                </p>
              </div>

              {/* Unique Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                  Unique Phone Number <span className="text-rose-600">*</span>
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Phone className="h-4 w-4" />
                  </div>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="9876543210"
                    className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                  />
                </div>
                <p className="text-[11px] text-slate-500">
                  Can be used interchangeably with your email to sign in.
                </p>
              </div>

              {/* Password and Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold uppercase tracking-wider text-slate-700">
                    Confirm Password <span className="text-rose-600">*</span>
                  </label>
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                      <Lock className="h-4 w-4" />
                    </div>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full rounded-xl border border-slate-300 bg-white pl-10 pr-4 py-2.5 text-sm text-slate-900 placeholder-slate-400 focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600 transition-all"
                    />
                  </div>
                </div>
              </div>

              {/* Error Alert */}
              {error && (
                <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                className="w-full mt-2 flex items-center justify-center gap-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 py-3 px-4 text-sm font-semibold text-white shadow-sm shadow-indigo-600/20 transition-all cursor-pointer"
              >
                <span>Complete Registration & Enter</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <div className="text-center pt-3 border-t border-slate-100">
                <p className="text-xs text-slate-600">
                  Already registered?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors"
                  >
                    Log in with Email or Phone
                  </Link>
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
