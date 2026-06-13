import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from "lucide-react";
import axios from "axios";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import useAuthStore from "@/store/auth.store";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type AuthStep = "email" | "login" | "set-password";

const LoginPage = () => {
  const navigate = useNavigate();
  const { login, setPassword, loginError, isLoggingIn } = useAuthStore();

  const [step, setStep] = useState<AuthStep>("email");
  const [email, setEmail] = useState("");
  const [password, setPasswordInput] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [error, setError] = useState("");
  const [checkingEmail, setCheckingEmail] = useState(false);

  const handleEmailSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Corporate email is required");
      return;
    }
    if (!EMAIL_RE.test(email.trim())) {
      setError("Enter a valid email address");
      return;
    }

    setCheckingEmail(true);
    try {
      const res = await axios.post(`http://${window.location.hostname}:8000/auth/check-email`, { email: email.trim().toLowerCase() });
      if (!res.data.exists) {
        setError("Email not found. Contact your administrator if you need an account.");
      } else {
        setEmployeeName(res.data.name || "");
        if (res.data.has_password) {
          setStep("login");
        } else {
          setStep("set-password");
        }
      }
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? "Failed to verify email. Please try again.");
    } finally {
      setCheckingEmail(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (!password) {
      setError("Password is required");
      return;
    }

    const success = await login(email, password);
    if (success) {
      navigate("/practioner/medTech/dashboard", { replace: true });
    }
  };

  const handleSetPasswordSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    const success = await setPassword(email, password);
    if (success) {
      navigate("/practioner/medTech/dashboard", { replace: true });
    }
  };

  const goBack = () => {
    setStep("email");
    setError("");
    setPasswordInput("");
    setConfirmPassword("");
  };

  return (
    <div className="min-h-screen bg-[#F0F4F8] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8 relative">
          {step !== "email" && (
            <button
              onClick={goBack}
              className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft className="w-6 h-6" />
            </button>
          )}
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#005EB8] mb-4 shadow-lg shadow-[#005EB8]/30">
            <svg
              className="w-8 h-8 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">GP Connect</h1>
          <p className="text-sm text-gray-500 mt-1">MedTech Clinical Portal</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="bg-[#005EB8] px-6 py-4">
            {step === "email" && (
              <>
                <h2 className="text-white font-semibold">Sign in to your account</h2>
                <p className="text-blue-100 text-xs mt-0.5">Use your corporate email</p>
              </>
            )}
            {step === "login" && (
              <>
                <h2 className="text-white font-semibold">Welcome back, {employeeName.split(' ')[0]}</h2>
                <p className="text-blue-100 text-xs mt-0.5">Enter your password to continue</p>
              </>
            )}
            {step === "set-password" && (
              <>
                <h2 className="text-white font-semibold">Hey {employeeName.split(' ')[0]}, let's get started</h2>
                <p className="text-blue-100 text-xs mt-0.5">Start by setting your password</p>
              </>
            )}
          </div>

          <div className="px-6 py-6">
            {/* Global Errors */}
            {(error || loginError) && (
              <div className="flex items-start gap-2.5 bg-red-50 border border-red-200 rounded-lg px-4 py-3 mb-5">
                <AlertCircle className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error || loginError}</p>
              </div>
            )}

            {step === "email" && (
              <form onSubmit={handleEmailSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-gray-700">
                    Corporate Email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.nhs.uk"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 bg-white border-gray-300"
                      autoComplete="email"
                      autoFocus
                    />
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={checkingEmail}
                  className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-5 h-auto rounded-xl shadow-md shadow-[#005EB8]/20 transition-all mt-1"
                >
                  {checkingEmail ? "Checking..." : "Continue"}
                </Button>
              </form>
            )}

            {step === "login" && (
              <form onSubmit={handleLoginSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password" className="text-sm font-medium text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="pl-9 pr-10 bg-white border-gray-300"
                      autoComplete="current-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-5 h-auto rounded-xl shadow-md shadow-[#005EB8]/20 transition-all mt-1"
                >
                  {isLoggingIn ? "Signing in..." : "Sign In"}
                </Button>
              </form>
            )}

            {step === "set-password" && (
              <form onSubmit={handleSetPasswordSubmit} className="flex flex-col gap-5">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="new-password" className="text-sm font-medium text-gray-700">
                    Create Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="new-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="At least 6 characters"
                      value={password}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="pl-9 pr-10 bg-white border-gray-300"
                      autoComplete="new-password"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="confirm-password" className="text-sm font-medium text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="Retype password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="pl-9 pr-10 bg-white border-gray-300"
                      autoComplete="new-password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                      tabIndex={-1}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isLoggingIn}
                  className="w-full bg-[#005EB8] hover:bg-[#004C99] text-white font-semibold py-5 h-auto rounded-xl shadow-md shadow-[#005EB8]/20 transition-all mt-1"
                >
                  {isLoggingIn ? "Setting up..." : "Set Password & Sign In"}
                </Button>
              </form>
            )}
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-gray-400 mt-6 leading-relaxed">
          Access is restricted to registered staff only.
          <br />
          Contact your administrator if you need an account.
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
