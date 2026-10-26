"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  FileCheck2,
  LockKeyhole,
  Mail,
  ShieldCheck,
  GitBranch,
} from "lucide-react";

import {
  auditorLogin,
  saveAuditorSession,
} from "@/lib/auth";

const auditorLoginStyles = `
.tiaki-auditor-login {
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 32px;
  background:
    radial-gradient(circle at 10% 10%, rgba(5, 150, 105, 0.12), transparent 30%),
    radial-gradient(circle at 90% 90%, rgba(16, 185, 129, 0.08), transparent 32%),
    #f5f8f6;
}

.tiaki-auth-card {
  width: min(1120px, 100%);
  min-height: 670px;
  display: grid;
  grid-template-columns: 1.04fr 0.96fr;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 26px;
  background: #ffffff;
  box-shadow:
    0 30px 80px rgba(15, 23, 42, 0.12),
    0 8px 24px rgba(15, 23, 42, 0.06);
}

.tiaki-hero-section {
  position: relative;
  overflow: hidden;
  padding: 42px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  color: #ffffff;
  background:
    radial-gradient(circle at 15% 15%, rgba(52, 211, 153, 0.18), transparent 28%),
    radial-gradient(circle at 85% 80%, rgba(16, 185, 129, 0.13), transparent 32%),
    linear-gradient(145deg, #103a29 0%, #15543b 52%, #0d3022 100%);
}

.tiaki-hero-section::before {
  content: "";
  position: absolute;
  width: 360px;
  height: 360px;
  right: -160px;
  top: -150px;
  border-radius: 50%;
  background: rgba(52, 211, 153, 0.08);
  filter: blur(8px);
}

.tiaki-hero-section::after {
  content: "";
  position: absolute;
  width: 280px;
  height: 280px;
  left: -150px;
  bottom: -160px;
  border-radius: 50%;
  background: rgba(16, 185, 129, 0.08);
  filter: blur(8px);
}

.tiaki-hero-content,
.tiaki-hero-footer {
  position: relative;
  z-index: 2;
}

.tiaki-brand-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.tiaki-logo-box {
  width: 230px;
  height: 82px;
  display: grid;
  place-items: center;
  border-radius: 16px;
  background: #ffffff;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.14);
}

.tiaki-logo {
  width: 190px;
  max-height: 64px;
  object-fit: contain;
}

.tiaki-secure-badge {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  padding: 8px 11px;
  border: 1px solid rgba(167, 243, 208, 0.22);
  border-radius: 999px;
  color: #d1fae5;
  background: rgba(255, 255, 255, 0.06);
  font-size: 10px;
  font-weight: 800;
  letter-spacing: 0.1em;
  white-space: nowrap;
}

.tiaki-hero-copy {
  max-width: 520px;
  margin-top: 90px;
}

.tiaki-eyebrow {
  margin-bottom: 14px;
  color: #6ee7b7;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.16em;
}

.tiaki-hero-copy h1 {
  margin: 0;
  font-size: clamp(36px, 4vw, 54px);
  line-height: 1.04;
  letter-spacing: -0.045em;
  font-weight: 850;
}

.tiaki-hero-copy h1 span {
  color: #6ee7b7;
}

.tiaki-hero-copy p {
  max-width: 480px;
  margin: 22px 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 15px;
  line-height: 1.75;
}

.tiaki-feature-list {
  display: grid;
  gap: 13px;
  margin-top: 34px;
}

.tiaki-feature {
  display: flex;
  align-items: center;
  gap: 11px;
  color: rgba(255, 255, 255, 0.88);
  font-size: 13px;
  font-weight: 600;
}

.tiaki-feature svg {
  color: #6ee7b7;
  flex: 0 0 auto;
}

.tiaki-hero-footer {
  display: flex;
  align-items: center;
  gap: 10px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.54);
  font-size: 11px;
  line-height: 1.5;
}

.tiaki-form-section {
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 56px;
  background: #ffffff;
}

.tiaki-form-inner {
  width: min(390px, 100%);
  margin: 0 auto;
}

.tiaki-form-status {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #047857;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.13em;
}

.tiaki-form-status-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #10b981;
  box-shadow: 0 0 0 5px rgba(16, 185, 129, 0.1);
}

.tiaki-form-heading {
  margin-top: 20px;
}

.tiaki-form-heading h2 {
  margin: 0;
  color: #0f172a;
  font-size: 31px;
  line-height: 1.15;
  letter-spacing: -0.035em;
  font-weight: 850;
}

.tiaki-form-heading p {
  margin: 10px 0 0;
  color: #64748b;
  font-size: 14px;
  line-height: 1.6;
}

.tiaki-form {
  display: grid;
  gap: 18px;
  margin-top: 30px;
}

.tiaki-field {
  display: grid;
  gap: 8px;
}

.tiaki-field > span {
  color: #334155;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.tiaki-input-wrap {
  position: relative;
  display: flex;
  align-items: center;
}

.tiaki-input-wrap > svg:first-child {
  position: absolute;
  left: 14px;
  color: #94a3b8;
  pointer-events: none;
}

.tiaki-input {
  width: 100%;
  height: 50px;
  padding: 0 44px;
  border: 1px solid #d7e0e5;
  border-radius: 12px;
  outline: none;
  color: #0f172a;
  background: #ffffff;
  font: inherit;
  font-size: 14px;
  transition: border-color 160ms ease, box-shadow 160ms ease;
  box-sizing: border-box;
}

.tiaki-input:focus {
  border-color: #10b981;
  box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1);
}

.tiaki-input::placeholder {
  color: #a1acb8;
}

.tiaki-password-toggle {
  position: absolute;
  right: 8px;
  width: 34px;
  height: 34px;
  display: grid;
  place-items: center;
  border: 0;
  border-radius: 8px;
  color: #64748b;
  background: transparent;
  cursor: pointer;
}

.tiaki-password-toggle:hover {
  color: #047857;
  background: #f0fdf4;
}

.tiaki-error {
  padding: 11px 13px;
  border: 1px solid #fecaca;
  border-radius: 10px;
  color: #991b1b;
  background: #fef2f2;
  font-size: 12px;
  line-height: 1.5;
}

.tiaki-submit {
  width: 100%;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 9px;
  border: 0;
  border-radius: 12px;
  color: #ffffff;
  background: linear-gradient(135deg, #047857 0%, #059669 100%);
  box-shadow: 0 10px 22px rgba(5, 150, 105, 0.2);
  cursor: pointer;
  font: inherit;
  font-size: 13px;
  font-weight: 850;
  transition: transform 160ms ease, box-shadow 160ms ease, opacity 160ms ease;
}

.tiaki-submit:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 14px 28px rgba(5, 150, 105, 0.26);
}

.tiaki-submit:disabled {
  opacity: 0.72;
  cursor: wait;
}

.tiaki-spinner {
  width: 17px;
  height: 17px;
  border: 2px solid rgba(255, 255, 255, 0.35);
  border-top-color: #ffffff;
  border-radius: 50%;
  animation: tiaki-spin 700ms linear infinite;
}

@keyframes tiaki-spin {
  to {
    transform: rotate(360deg);
  }
}

.tiaki-divider {
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 28px 0 18px;
  color: #94a3b8;
  font-size: 9px;
  font-weight: 900;
  letter-spacing: 0.14em;
}

.tiaki-divider::before,
.tiaki-divider::after {
  content: "";
  height: 1px;
  flex: 1;
  background: #e2e8f0;
}

.tiaki-form-footer {
  color: #94a3b8;
  font-size: 10px;
  line-height: 1.6;
  text-align: center;
}

.tiaki-form-footer strong {
  color: #64748b;
}

@media (max-width: 900px) {
  .tiaki-auditor-login {
    padding: 20px;
  }

  .tiaki-auth-card {
    grid-template-columns: 1fr;
    max-width: 620px;
  }

  .tiaki-hero-section {
    min-height: 420px;
    padding: 34px;
  }

  .tiaki-hero-copy {
    margin-top: 55px;
  }

  .tiaki-form-section {
    padding: 42px 34px 46px;
  }
}

@media (max-width: 520px) {
  .tiaki-auditor-login {
    padding: 0;
  }

  .tiaki-auth-card {
    min-height: 100vh;
    border: 0;
    border-radius: 0;
  }

  .tiaki-hero-section {
    min-height: auto;
    padding: 26px 22px 28px;
  }

  .tiaki-logo-box {
    width: 190px;
    height: 68px;
  }

  .tiaki-logo {
    width: 160px;
    max-height: 52px;
  }

  .tiaki-secure-badge {
    padding: 7px 9px;
    font-size: 8px;
  }

  .tiaki-hero-copy {
    margin-top: 38px;
  }

  .tiaki-hero-copy h1 {
    font-size: 36px;
  }

  .tiaki-feature-list {
    margin-top: 24px;
  }

  .tiaki-hero-footer {
    display: none;
  }

  .tiaki-form-section {
    padding: 38px 22px 42px;
  }

  .tiaki-form-heading h2 {
    font-size: 27px;
  }
}
`;

export default function AuditorLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("auditor@tiaki.local");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const styleId = "tiaki-auditor-login-styles";

    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = auditorLoginStyles;
      document.head.appendChild(style);
    }

    return () => {
      document.getElementById(styleId)?.remove();
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setError("");
    setLoading(true);

    try {
      const result = await auditorLogin(email, password);

      saveAuditorSession(result);

      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to sign in"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="tiaki-auditor-login">
      <section className="tiaki-auth-card">
        <div className="tiaki-hero-section">
          <div className="tiaki-hero-content">
            <div className="tiaki-brand-row">
              <div className="tiaki-logo-box">
                <img
                  src="/logo.png"
                  alt="TIAKI — Halal Slaughter Intelligence"
                  className="tiaki-logo"
                />
              </div>

              <div className="tiaki-secure-badge">
                <ShieldCheck size={13} />
                SECURE ACCESS
              </div>
            </div>

            <div className="tiaki-hero-copy">
              <div className="tiaki-eyebrow">
                HALAL ASSURANCE · NEW ZEALAND
              </div>

              <h1>
                Evidence-driven
                <br />
                <span>halal assurance.</span>
              </h1>

              <p>
                A focused workspace for auditors to manage audits,
                evidence, findings and assurance workflows with confidence.
              </p>

              <div className="tiaki-feature-list">
                <div className="tiaki-feature">
                  <FileCheck2 size={17} />
                  Audit &amp; Assurance
                </div>

                <div className="tiaki-feature">
                  <CheckCircle2 size={17} />
                  Evidence &amp; Findings
                </div>

                <div className="tiaki-feature">
                  <GitBranch size={17} />
                  Traceability Intelligence
                </div>
              </div>
            </div>
          </div>

          <div className="tiaki-hero-footer">
            <LockKeyhole size={14} />
            Protected auditor workspace · Halal assurance platform
          </div>
        </div>

        <div className="tiaki-form-section">
          <div className="tiaki-form-inner">
            <div className="tiaki-form-status">
              <span className="tiaki-form-status-dot" />
              AUDITOR WORKSPACE
            </div>

            <div className="tiaki-form-heading">
              <h2>Welcome back</h2>
              <p>
                Sign in to continue to your audit and assurance workspace.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="tiaki-form">
              <label className="tiaki-field">
                <span>Email address</span>

                <div className="tiaki-input-wrap">
                  <Mail size={17} />

                  <input
                    className="tiaki-input"
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    autoComplete="email"
                    placeholder="auditor@organisation.com"
                    required
                  />
                </div>
              </label>

              <label className="tiaki-field">
                <span>Password</span>

                <div className="tiaki-input-wrap">
                  <LockKeyhole size={17} />

                  <input
                    className="tiaki-input"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    required
                  />

                  <button
                    type="button"
                    className="tiaki-password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </label>

              {error && (
                <div className="tiaki-error" role="alert">
                  {error}
                </div>
              )}

              <button
                type="submit"
                className="tiaki-submit"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="tiaki-spinner" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Auditor
                    <ArrowRight size={17} />
                  </>
                )}
              </button>
            </form>

            <div className="tiaki-divider">
              SECURE SESSION
            </div>

            <div className="tiaki-form-footer">
              <strong>TIAKI Auditor</strong>
              <br />
              Halal Slaughter Intelligence &amp; Assurance Platform
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
