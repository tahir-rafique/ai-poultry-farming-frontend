"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";
import { Bird, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail]     = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent]       = useState(false);
  const [error, setError]     = useState("");

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

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
        {sent ? (
          /* ── Success state ── */
          <div className="text-center">
            <div className="flex justify-center mb-4">
              <CheckCircle className="text-green-600" size={48} />
            </div>
            <h1 className="text-xl font-bold text-gray-800 mb-2">Check your inbox</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              We sent a password reset link to <strong>{email}</strong>.
              It expires in 1 hour.
            </p>
            <p className="text-xs text-gray-400 mb-6">
              Didn&apos;t receive it? Check your spam folder or{" "}
              <button
                onClick={() => { setSent(false); setEmail(""); }}
                className="text-green-700 font-medium hover:underline"
              >
                try again
              </button>
              .
            </p>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 text-sm text-green-700 font-medium hover:underline"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </div>
        ) : (
          /* ── Form state ── */
          <>
            <h1 className="text-2xl font-bold text-gray-800 mb-1">Forgot password?</h1>
            <p className="text-gray-500 text-sm mb-6 leading-relaxed">
              Enter your email and we&apos;ll send you a link to reset your password.
            </p>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3 mb-4">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-green-700 hover:bg-green-800 disabled:opacity-60 text-white font-semibold py-2.5 rounded-lg text-sm transition-colors flex items-center justify-center gap-2"
              >
                {loading && <Loader2 size={16} className="animate-spin" />}
                {loading ? "Sending…" : "Send Reset Link"}
              </button>
            </form>

            <Link
              href="/login"
              className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={14} /> Back to sign in
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
