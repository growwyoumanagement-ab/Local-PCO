import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import api from "@/services/api";
import { useNavigate } from "react-router-dom";
import { Lock, Smartphone, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";

export default function Login() {
    const [loginMethod, setLoginMethod] = useState<"email" | "phone">("email");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const emailRef = useRef<HTMLInputElement>(null);
    const phoneRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);

    // Session & Token Edge Cases: Redirect if already authenticated
    useEffect(() => {
        const token = localStorage.getItem("adminToken");
        const user = localStorage.getItem("adminUser");
        if (token && user) {
            try {
                const userData = JSON.parse(user);
                if (userData.role === "verifier") {
                    navigate("/verification");
                } else if (userData.role === "admin") {
                    navigate("/");
                }
            } catch (e) {
                localStorage.removeItem("adminToken");
                localStorage.removeItem("adminRefreshToken");
                localStorage.removeItem("adminUser");
                toast.error("Your session was corrupted. Please log in again.");
            }
        }
    }, [navigate]);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        // UI/UX Edge Cases: Native focus on invalid inputs
        if (loginMethod === "email") {
            const trimmedEmail = email.trim();
            if (!trimmedEmail) {
                toast.error("Please enter your email address");
                emailRef.current?.focus();
                return;
            }

            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(trimmedEmail)) {
                toast.error("Please enter a valid email address");
                emailRef.current?.focus();
                return;
            }
        } else {
            const trimmedPhone = phone.trim();
            if (!trimmedPhone) {
                toast.error("Please enter your phone number");
                phoneRef.current?.focus();
                return;
            }

            const phoneRegex = /^[6-9]\d{9}$/;
            if (!phoneRegex.test(trimmedPhone)) {
                toast.error("Please enter a valid 10-digit phone number starting with 6-9");
                phoneRef.current?.focus();
                return;
            }
        }

        if (!password.trim()) {
            toast.error("Please enter your password");
            passwordRef.current?.focus();
            return;
        }

        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long");
            passwordRef.current?.focus();
            return;
        }

        setLoading(true);

        try {
            const payload = loginMethod === "email"
                ? { email: email.trim().toLowerCase(), password }
                : { phone: phone.trim(), password };

            const { data } = await api.post("/v1/auth/client/login", payload);

            if (data.success) {
                const role = data.data.role || "user";

                // Only allow admin and verifier roles
                if (role !== "admin" && role !== "verifier") {
                    toast.error("Access denied. Admin or Verifier credentials required.");
                    setLoading(false);
                    return;
                }

                // Session Edge Case: Handle private mode / quota limitations
                try {
                    localStorage.setItem("adminToken", data.data.accessToken);
                    if (data.data.refreshToken) {
                        localStorage.setItem("adminRefreshToken", data.data.refreshToken);
                    }
                    localStorage.setItem("adminUser", JSON.stringify({
                        name: data.data.name,
                        phone: data.data.phone,
                        email: data.data.email,
                        role: role
                    }));
                } catch (storageError) {
                    toast.error("Failed to save login session. Private mode or full storage might be enabled.");
                    setLoading(false);
                    return;
                }

                if (role === "verifier") {
                    toast.success("Welcome back, Verifier!");
                    navigate("/verification");
                } else {
                    toast.success("Welcome back, Admin!");
                    navigate("/");
                }
            }
        } catch (error: any) {
            console.error(error);
            // Authentication Edge Cases: Specific feedback per status
            if (!navigator.onLine) {
                toast.error("No internet connection. Please check your network.");
                return;
            }

            const status = error.response?.status;
            const message = error.response?.data?.message;

            if (status === 401) {
                toast.error(loginMethod === "email"
                    ? "Invalid email or password. Please try again."
                    : "Invalid phone number or password. Please try again."
                );
                passwordRef.current?.focus();
                setPassword(""); // UX Edge Case: Clear password on failure
            } else if (status === 403) {
                toast.error(message || "Your account has been blocked or suspended. Contact support.");
            } else if (status === 404) {
                toast.error(message || "Account not found. Please check your credentials.");
            } else if (status === 429) {
                toast.error("Too many login attempts. Please try again later.");
            } else if (status >= 500) {
                toast.error("Server is experiencing issues. Please try again shortly.");
            } else {
                toast.error(message || "An unexpected error occurred during login.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950 p-4 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-100/40 via-zinc-100 to-zinc-50 dark:from-emerald-950/20 dark:via-zinc-950 dark:to-zinc-950">
            <div className="w-full max-w-md bg-white dark:bg-zinc-900/50 backdrop-blur-xl border border-zinc-200 dark:border-white/10 rounded-3xl shadow-2xl overflow-hidden p-8 animate-in fade-in zoom-in-95 duration-500">
                <div className="flex flex-col items-center mb-8">
                    <img src="/logo.png" alt="Local PCO Logo" className="h-16 w-16 object-contain mb-3 drop-shadow-md" />
                    <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Local PCO Operations</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 text-sm mt-2">Operations Command & Verification Portal</p>
                </div>

                <form onSubmit={handleLogin} className="space-y-5">
                    {/* Primary / Optional Login Mode Tabs */}
                    <div className="grid grid-cols-2 p-1 bg-zinc-100 dark:bg-zinc-800/70 rounded-2xl border border-zinc-200/80 dark:border-white/5">
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod("email");
                                setTimeout(() => emailRef.current?.focus(), 50);
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                                loginMethod === "email"
                                    ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            }`}
                        >
                            <Mail className="h-4 w-4" />
                            <span>Email <span className="text-[10px] font-normal opacity-80">(Primary)</span></span>
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                setLoginMethod("phone");
                                setTimeout(() => phoneRef.current?.focus(), 50);
                            }}
                            className={`flex items-center justify-center gap-2 py-2.5 px-3 text-xs font-semibold rounded-xl transition-all ${
                                loginMethod === "phone"
                                    ? "bg-white dark:bg-zinc-900 text-violet-600 dark:text-violet-400 shadow-sm"
                                    : "text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200"
                            }`}
                        >
                            <Smartphone className="h-4 w-4" />
                            <span>Phone <span className="text-[10px] font-normal opacity-80">(Optional)</span></span>
                        </button>
                    </div>

                    {/* Email Input (Primary) */}
                    {loginMethod === "email" ? (
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Email Address <span className="text-violet-600 dark:text-violet-400 text-[10px] font-normal lowercase">(primary)</span>
                            </label>
                            <div className="relative group">
                                <Mail className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                                <Input
                                    ref={emailRef}
                                    type="email"
                                    autoComplete="username email"
                                    placeholder="admin@localpco.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/5 focus-visible:ring-violet-500 rounded-xl transition-all"
                                />
                            </div>
                        </div>
                    ) : (
                        /* Phone Input (Optional) */
                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">
                                Phone Number <span className="text-zinc-400 text-[10px] font-normal lowercase">(optional)</span>
                            </label>
                            <div className="relative group">
                                <Smartphone className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                                <Input
                                    ref={phoneRef}
                                    type="tel"
                                    autoComplete="tel"
                                    placeholder="Enter 10-digit phone number"
                                    value={phone}
                                    onChange={(e) => {
                                        const value = e.target.value.replace(/\D/g, "");
                                        if (value.length <= 10) {
                                            setPhone(value);
                                        }
                                    }}
                                    className="pl-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/5 focus-visible:ring-violet-500 rounded-xl transition-all"
                                    maxLength={10}
                                />
                            </div>
                        </div>
                    )}

                    {/* Password Input */}
                    <div className="space-y-2">
                        <label className="text-xs font-semibold uppercase tracking-wider text-zinc-500 ml-1">Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-3 top-3 h-5 w-5 text-zinc-400 group-focus-within:text-violet-500 transition-colors" />
                            <Input
                                ref={passwordRef}
                                type={showPassword ? "text" : "password"}
                                autoComplete="current-password"
                                placeholder="Enter password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 pr-10 h-11 bg-zinc-50 dark:bg-zinc-800/50 border-zinc-200 dark:border-white/5 focus-visible:ring-violet-500 rounded-xl transition-all"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
                            >
                                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                            </button>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-11 bg-violet-600 hover:bg-violet-700 text-white shadow-lg shadow-violet-500/25 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        ) : (
                            <span className="flex items-center">
                                Login to Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                            </span>
                        )}
                    </Button>

                    {/* Alternate Switch Helper */}
                    <div className="text-center text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                        {loginMethod === "email" ? (
                            <span>
                                Want to use your phone number instead?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginMethod("phone");
                                        setTimeout(() => phoneRef.current?.focus(), 50);
                                    }}
                                    className="text-violet-600 dark:text-violet-400 hover:underline font-medium ml-1"
                                >
                                    Login with Phone
                                </button>
                            </span>
                        ) : (
                            <span>
                                Prefer using your admin email?{" "}
                                <button
                                    type="button"
                                    onClick={() => {
                                        setLoginMethod("email");
                                        setTimeout(() => emailRef.current?.focus(), 50);
                                    }}
                                    className="text-violet-600 dark:text-violet-400 hover:underline font-medium ml-1"
                                >
                                    Login with Email (Primary)
                                </button>
                            </span>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
}
