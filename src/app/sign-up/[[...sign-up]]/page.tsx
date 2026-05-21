import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-6">
        {/* App branding above the Clerk widget */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-700 rounded-xl flex items-center justify-center text-2xl">
            🐔
          </div>
          <div>
            <p className="font-bold text-gray-800 text-lg leading-tight">Smart Poultry</p>
            <p className="text-gray-500 text-sm">AI Farm Manager</p>
          </div>
        </div>

        <SignUp
          appearance={{
            elements: {
              formButtonPrimary: "bg-green-700 hover:bg-green-800 text-sm",
              card: "shadow-lg",
            },
          }}
        />
      </div>
    </div>
  );
}
