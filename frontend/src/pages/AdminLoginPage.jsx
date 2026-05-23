import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";

export default function AdminLoginPage() {
    const { user, login } = useAuth();
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (user && typeof user === "object") {
            navigate("/admin", { replace: true });
        }
    }, [user, navigate]);

    const submit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        const res = await login(email, password);
        setSubmitting(false);
        if (res.ok) {
            toast.success("Signed in.");
            navigate("/admin", { replace: true });
        } else {
            toast.error(res.error || "Login failed");
        }
    };

    return (
        <div
            data-testid="admin-login-page"
            className="min-h-screen bg-paper text-ink grid grid-cols-1 lg:grid-cols-2"
        >
            {/* Left visual */}
            <div className="hidden lg:flex flex-col justify-between bg-ink text-paper p-12 relative overflow-hidden">
                <Link to="/" className="kicker-num inline-flex items-center gap-2 hover:text-signal w-fit">
                    <ArrowLeft size={14} /> Back to site
                </Link>
                <div>
                    <div className="label-kicker text-signal mb-6">Admin</div>
                    <h1 className="font-display text-7xl leading-[0.9] tracking-tight">
                        Control<br />
                        <span className="italic font-light text-signal">Room</span>
                    </h1>
                    <p className="mt-8 text-paper/60 max-w-md text-lg">
                        Edit projects, update bio, and review messages from the contact form.
                    </p>
                </div>
                <div className="kicker-num text-paper/40">№ 005 / ADMIN</div>
            </div>

            {/* Right form */}
            <div className="flex items-center justify-center p-8 lg:p-16">
                <form
                    onSubmit={submit}
                    className="w-full max-w-md"
                    data-testid="admin-login-form"
                >
                    <div className="label-kicker text-signal mb-4 lg:hidden">Admin</div>
                    <h2 className="font-display text-5xl tracking-tight">Sign in</h2>
                    <p className="mt-3 text-ink/60">
                        Enter your credentials to access the dashboard.
                    </p>

                    <div className="mt-10 space-y-6">
                        <div>
                            <label className="kicker-num">Email</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@example.com"
                                data-testid="admin-email-input"
                                className="editorial-input mt-1"
                            />
                        </div>
                        <div>
                            <label className="kicker-num">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                data-testid="admin-password-input"
                                className="editorial-input mt-1"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        data-testid="admin-login-button"
                        className="btn-ink w-full mt-10"
                    >
                        {submitting ? "Signing in..." : "Sign in"}
                    </button>

                    <Link
                        to="/"
                        className="kicker-num inline-flex items-center gap-2 mt-8 hover:text-signal lg:hidden"
                    >
                        <ArrowLeft size={14} /> Back to site
                    </Link>
                </form>
            </div>
        </div>
    );
}
