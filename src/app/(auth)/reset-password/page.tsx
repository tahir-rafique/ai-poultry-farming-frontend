"use client";

import { useState, FormEvent, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Bird, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";

function ResetPasswordForm() {
  const router       = useRouter();
  const searchParams = useSearchParams();
  const token        = searchParams.get("token") ?? "";

  const [password, setPassword]           = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword]   = useState(false);
  const [loading, setLoading]             = useState(false);
  const [success, setSuccess]             = useState(false);
  const [error, setError]                 = useState("");

  if (!token) {
    return (
      <div className="text-center">
        <AlertCircle className="text-red-500 mx-auto mb-4" size={48} />
        <h1 className="text-xl font-bold text-gray-800 mb-2">Invalid link</h1>
        <p className="text-gray-500 text-sm mb-6">
          This reset link is missing or invalid. Please request a new one.
        </p>
        <Link href="/forgot-password" className="text-green-700 font-medium hover:underline text-sm">
          Request new link
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setSuccess(true);
      setTimeout(() => router.push("/login"), 3000);
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Failed to reset password. The link may have expired.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div className="text-center">
        <CheckCircle className="text-green-600 mx-auto mb-4" size={48} />
        <h1 className="text-xl font-bold text-gray-800 mb-2">Password updated!</h1>
        <p className="text-gray-500 text-sm mb-2">Your password has been changed successfully.</p>
        <p className="text-xs text-gray-400">Redirecting to sign in…</p>
      </div>
    );
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-gray-800 mb-1">Set new password</h1>
      <p className="text-gray-500 text-sm mb-6">Choose a strong password for your account.</p>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
          {error}
          {error.includes("expired") && (
            <span>
              {" "}
              <Link href="/forgot-password" className="underline font-medium">
                Request a new link
              </Link>
            </span>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 6 characters"
              className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
          <input
            type={showPassword ? "text" : "password"}
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Re-enter your password"
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
        >
          {loading && <Loader2 size={16} className="animate-spin" />}
          {loading ? "Updating…" : "Update Password"}
        </button>
      </form>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="w-full max-w-md">
      {/* Logo */}
      <div className="flex items-center justify-center gap-3 mb-8">
        <div className="w-11 h-11 bg-green-700 rounded-xl flex items-center justify-center">
          <Bird className="text-white" size={24} />
        </div>
        <div>
          <p className="font-bold text-gray-800 text-xl leading-tight">Smart Poultry</p>
          <p className="text-gray-500 text-sm">AI Farm Manager</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-lg p-8">
        {/* Suspense needed because useSearchParams() requires it in Next.js App Router */}
        <Suspense fallback={<p className="text-sm text-gray-500 text-center">Loading…</p>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
