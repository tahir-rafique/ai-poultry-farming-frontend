import type { Metadata } from "next";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import Sidebar from "@/components/layout/Sidebar";
import ClerkAuthProvider from "@/components/auth/ClerkAuthProvider";

export const metadata: Metadata = {
  title: "AI Poultry Farm Manager",
  description: "AI-Based Smart Broiler Poultry Farming Management System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      afterSignInUrl="/dashboard"
      afterSignUpUrl="/dashboard"
    >
      <html lang="en">
        <body className="flex h-screen overflow-hidden bg-gray-50">
          {/* Sets the Clerk JWT on every axios request — must be inside ClerkProvider */}
          <ClerkAuthProvider />
          <Sidebar />
          <main className="flex-1 overflow-y-auto">{children}</main>
        </body>
      </html>
    </ClerkProvider>
  );
}
