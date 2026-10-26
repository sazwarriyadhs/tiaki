"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  Lock,
  User,
  Eye,
  EyeOff,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  AlertCircle,
  Activity,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    login: "owner@tiaki.local",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

    if (error) {
      setError("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (loading) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        "http://localhost:8093/api/v1/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(formData),
        }
      );

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          data?.message ||
            data?.error?.message ||
            data?.error ||
            "Login gagal. Silakan periksa kredensial Anda."
        );
      }

      const accessToken =
        data?.data?.access_token ||
        data?.access_token ||
        data?.data?.token ||
        data?.token;

      const refreshToken =
        data?.data?.refresh_token ||
        data?.refresh_token;

      if (!accessToken) {
        throw new Error(
          "Login berhasil tetapi access token tidak diterima dari API."
        );
      }

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("tiaki_access_token", accessToken);

      if (refreshToken) {
        localStorage.setItem("refresh_token", refreshToken);
        localStorage.setItem("tiaki_refresh_token", refreshToken);
      }

      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Terjadi kesalahan sistem. Silakan coba lagi."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="tiaki-auth-wrapper">
      <section className="tiaki-auth-card">
        <div className="tiaki-hero-section">
          <div className="tiaki-hero-glow tiaki-hero-glow-one" />
          <div className="tiaki-hero-glow tiaki-hero-glow-two" />

          <div className="tiaki-hero-content">
            <div className="tiaki-brand-row">
              <div className="tiaki-brand-mark">
                <Image
                  src="/logo.png"
                  alt="TIAKI"
                  width={200}
                  height={80}
                  priority
                  className="tiaki-logo"
                />
              </div>
            </div>

            <div className="tiaki-demo-badge">
              <span className="tiaki-demo-dot" />
              FIANZ DISCOVERY DEMO
            </div>

            <div className="tiaki-hero-body">
              <p className="tiaki-eyebrow">
                DIGITAL HALAL ASSURANCE & CERTIFICATION INTELLIGENCE
              </p>

              <h1>
                Halal operations,
                <br />
                <span>intelligently connected.</span>
              </h1>

              <p className="tiaki-hero-description">
                A unified intelligence layer for production traceability,
                halal controls, operational monitoring and audit readiness.
              </p>

              <div className="tiaki-features-list">
                <div className="tiaki-feature">
                  <div className="tiaki-feature-icon">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <strong>Operational Traceability</strong>
                    <span>Monitor production and batch lineage.</span>
                  </div>
                </div>

                <div className="tiaki-feature">
                  <div className="tiaki-feature-icon">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <strong>Halal Control Intelligence</strong>
                    <span>Surface verification status and exceptions.</span>
                  </div>
                </div>

                <div className="tiaki-feature">
                  <div className="tiaki-feature-icon">
                    <CheckCircle2 size={17} />
                  </div>
                  <div>
                    <strong>Audit-Ready Evidence</strong>
                    <span>Connect operational records with audit trails.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="tiaki-hero-footer">
            <div className="tiaki-security-icon">
              <ShieldCheck size={16} />
            </div>

            <div>
              <strong>Secure operational environment</strong>
              <span>Decision support only · Demo environment</span>
            </div>

            <div className="tiaki-region">
              <span>NZ</span>
              <small>Pacific/Auckland</small>
            </div>
          </div>
        </div>

        <div className="tiaki-form-section">
          <div className="tiaki-form-inner">
            <div className="tiaki-form-header">
              <div className="tiaki-form-status">
                <span>
                  <Activity size={13} />
                </span>
                Commander Access
              </div>

              <h2>Welcome back</h2>

              <p>
                Sign in to access the TIAKI operational command center.
              </p>
            </div>

            {error && (
              <div className="tiaki-alert-error" role="alert">
                <div className="tiaki-alert-icon">
                  <AlertCircle size={17} />
                </div>

                <div>
                  <strong>Authentication failed</strong>
                  <span>{error}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="tiaki-login-form">
              <div className="tiaki-input-group">
                <label htmlFor="login">Username or Email</label>

                <div className="input-wrapper">
                  <User className="input-icon" size={18} />

                  <input
                    type="text"
                    id="login"
                    name="login"
                    value={formData.login}
                    onChange={handleChange}
                    placeholder="Enter your username or email"
                    autoComplete="username"
                    required
                  />
                </div>
              </div>

              <div className="tiaki-input-group">
                <div className="label-row">
                  <label htmlFor="password">Password</label>

                  <button
                    type="button"
                    className="forgot-link"
                    onClick={() =>
                      setError(
                        "Password recovery is not enabled in this discovery demo."
                      )
                    }
                  >
                    Forgot password?
                  </button>
                </div>

                <div className="input-wrapper">
                  <Lock className="input-icon" size={18} />

                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    required
                  />

                  <button
                    type="button"
                    className="password-toggle"
                    onClick={() => setShowPassword((value) => !value)}
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff size={18} />
                    ) : (
                      <Eye size={18} />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="tiaki-submit-btn"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="tiaki-spinner" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign in to Commander</span>
                    <ArrowRight size={18} />
                  </>
                )}
              </button>
            </form>

            <div className="tiaki-form-divider">
              <span />
              <small>TIaki operational intelligence</small>
              <span />
            </div>

            <div className="tiaki-form-footer">
              <p>
                Access is restricted to authorised users.
              </p>

              <div className="tiaki-api-status">
                <span className="tiaki-api-dot" />
                API · localhost:8093
              </div>
            </div>

            <div className="tiaki-demo-context">
              <strong>FIANZ DISCOVERY DEMO</strong>
              <span>
                Illustrative FIANZ-aligned workflow · New Zealand
              </span>
            </div>
          </div>
        </div>
      </section>

      <style jsx>{`
        .tiaki-auth-wrapper {
          min-height: 100vh;
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 32px;
          background:
            radial-gradient(
              circle at 12% 15%,
              rgba(39, 119, 82, 0.08),
              transparent 28%
            ),
            radial-gradient(
              circle at 88% 85%,
              rgba(39, 119, 82, 0.06),
              transparent 30%
            ),
            #f4f7f5;
          font-family:
            -apple-system,
            BlinkMacSystemFont,
            "Segoe UI",
            Roboto,
            Oxygen,
            Ubuntu,
            Cantarell,
            sans-serif;
        }

        .tiaki-auth-card {
          width: 100%;
          max-width: 1120px;
          min-height: 670px;
          display: grid;
          grid-template-columns: 1.04fr 0.96fr;
          overflow: hidden;
          background: #ffffff;
          border: 1px solid #dfe8e2;
          border-radius: 26px;
          box-shadow:
            0 28px 80px rgba(15, 23, 42, 0.11),
            0 6px 20px rgba(15, 23, 42, 0.04);
        }

        .tiaki-hero-section {
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 46px 48px 38px;
          color: #ffffff;
          background:
            linear-gradient(
              145deg,
              #103a29 0%,
              #15543b 52%,
              #0d3022 100%
            );
        }

        .tiaki-hero-glow {
          position: absolute;
          border-radius: 999px;
          pointer-events: none;
          filter: blur(2px);
        }

        .tiaki-hero-glow-one {
          width: 300px;
          height: 300px;
          top: -160px;
          right: -90px;
          background: rgba(110, 231, 183, 0.12);
        }

        .tiaki-hero-glow-two {
          width: 240px;
          height: 240px;
          bottom: -150px;
          left: -100px;
          background: rgba(52, 211, 153, 0.09);
        }

        .tiaki-hero-content,
        .tiaki-hero-footer {
          position: relative;
          z-index: 1;
        }

        .tiaki-brand-row {
          display: flex;
          align-items: center;
          margin-bottom: 22px;
        }

        .tiaki-brand-mark {
          width: 200px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          padding: 9px 13px;
          border: 1px solid #e4ebe7;
          border-radius: 14px;
          background: #ffffff;
          box-shadow: 0 10px 28px rgba(0, 0, 0, 0.13);
        }

        .tiaki-logo {
          display: block;
          width: 200px;
          height: auto;
          object-fit: contain;
        }

        .tiaki-demo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 7px 12px;
          border: 1px solid rgba(255, 255, 255, 0.14);
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.08);
          color: #d8f5e7;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.09em;
        }

        .tiaki-demo-dot {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #45d99a;
          box-shadow: 0 0 0 4px rgba(69, 217, 154, 0.12);
        }

        .tiaki-hero-body {
          max-width: 520px;
          margin-top: 62px;
        }

        .tiaki-eyebrow {
          margin: 0 0 15px;
          color: #8ee0ba;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.14em;
          line-height: 1.5;
        }

        .tiaki-hero-body h1 {
          margin: 0;
          color: #ffffff;
          font-size: clamp(2.25rem, 4vw, 3.35rem);
          font-weight: 760;
          letter-spacing: -0.045em;
          line-height: 1.06;
        }

        .tiaki-hero-body h1 span {
          color: #8ee0ba;
        }

        .tiaki-hero-description {
          max-width: 480px;
          margin: 22px 0 30px;
          color: #c6ddd2;
          font-size: 14px;
          line-height: 1.75;
        }

        .tiaki-features-list {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        .tiaki-feature {
          display: flex;
          align-items: center;
          gap: 12px;
        }

        .tiaki-feature-icon {
          width: 32px;
          height: 32px;
          flex: 0 0 32px;
          display: grid;
          place-items: center;
          border: 1px solid rgba(141, 224, 186, 0.18);
          border-radius: 10px;
          background: rgba(255, 255, 255, 0.07);
          color: #69d9a5;
        }

        .tiaki-feature strong,
        .tiaki-feature span {
          display: block;
        }

        .tiaki-feature strong {
          color: #f2faf6;
          font-size: 12px;
          font-weight: 700;
        }

        .tiaki-feature span {
          margin-top: 2px;
          color: #9fc3b2;
          font-size: 11px;
        }

        .tiaki-hero-footer {
          display: flex;
          align-items: center;
          gap: 10px;
          padding-top: 18px;
          border-top: 1px solid rgba(255, 255, 255, 0.1);
        }

        .tiaki-security-icon {
          width: 31px;
          height: 31px;
          display: grid;
          place-items: center;
          border-radius: 9px;
          background: rgba(255, 255, 255, 0.08);
          color: #8ee0ba;
        }

        .tiaki-hero-footer strong,
        .tiaki-hero-footer span {
          display: block;
        }

        .tiaki-hero-footer strong {
          color: #e7f6ee;
          font-size: 10px;
        }

        .tiaki-hero-footer span {
          margin-top: 2px;
          color: #89aa9c;
          font-size: 9px;
        }

        .tiaki-region {
          margin-left: auto;
          text-align: right;
        }

        .tiaki-region span,
        .tiaki-region small {
          display: block;
        }

        .tiaki-region span {
          color: #dff8ea;
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.08em;
        }

        .tiaki-region small {
          color: #86a899;
          font-size: 8px;
        }

        .tiaki-form-section {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 56px 56px;
          background: #ffffff;
        }

        .tiaki-form-inner {
          width: 100%;
          max-width: 390px;
        }

        .tiaki-form-status {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          margin-bottom: 18px;
          color: #39755b;
          font-size: 9px;
          font-weight: 850;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .tiaki-form-status span {
          width: 24px;
          height: 24px;
          display: grid;
          place-items: center;
          border-radius: 8px;
          background: #eef8f2;
          color: #20855b;
        }

        .tiaki-form-header h2 {
          margin: 0;
          color: #111827;
          font-size: 30px;
          font-weight: 760;
          letter-spacing: -0.035em;
        }

        .tiaki-form-header p {
          margin: 8px 0 0;
          color: #718078;
          font-size: 13px;
          line-height: 1.6;
        }

        .tiaki-alert-error {
          display: flex;
          align-items: flex-start;
          gap: 10px;
          margin: 22px 0 0;
          padding: 12px 13px;
          border: 1px solid #f2d4d4;
          border-radius: 12px;
          background: #fff7f7;
          color: #a43d3d;
          font-size: 11px;
        }

        .tiaki-alert-icon {
          flex: 0 0 auto;
          margin-top: 1px;
        }

        .tiaki-alert-error strong,
        .tiaki-alert-error span {
          display: block;
        }

        .tiaki-alert-error strong {
          margin-bottom: 2px;
          font-size: 11px;
        }

        .tiaki-alert-error span {
          line-height: 1.45;
        }

        .tiaki-login-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
          margin-top: 30px;
        }

        .tiaki-input-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .tiaki-input-group label {
          color: #33423b;
          font-size: 11px;
          font-weight: 750;
        }

        .label-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .forgot-link {
          padding: 0;
          border: 0;
          background: transparent;
          color: #287454;
          font-size: 10px;
          font-weight: 700;
          cursor: pointer;
        }

        .forgot-link:hover {
          color: #165b3f;
          text-decoration: underline;
        }

        .input-wrapper {
          position: relative;
          display: flex;
          align-items: center;
        }

        .input-icon {
          position: absolute;
          left: 14px;
          z-index: 1;
          color: #9aa8a1;
        }

        .input-wrapper input {
          width: 100%;
          height: 48px;
          padding: 0 44px 0 42px;
          border: 1px solid #d9e2dd;
          border-radius: 12px;
          outline: none;
          background: #fbfcfb;
          color: #17211d;
          font-size: 13px;
          transition:
            border-color 0.18s ease,
            box-shadow 0.18s ease,
            background 0.18s ease;
        }

        .input-wrapper input::placeholder {
          color: #a8b2ad;
        }

        .input-wrapper input:hover {
          border-color: #c6d4cc;
          background: #ffffff;
        }

        .input-wrapper input:focus {
          border-color: #37926a;
          background: #ffffff;
          box-shadow: 0 0 0 4px rgba(55, 146, 106, 0.1);
        }

        .password-toggle {
          position: absolute;
          right: 12px;
          width: 28px;
          height: 28px;
          display: grid;
          place-items: center;
          padding: 0;
          border: 0;
          border-radius: 8px;
          background: transparent;
          color: #98a49e;
          cursor: pointer;
        }

        .password-toggle:hover {
          background: #f0f4f1;
          color: #53645b;
        }

        .tiaki-submit-btn {
          width: 100%;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 9px;
          margin-top: 2px;
          border: 0;
          border-radius: 12px;
          background: linear-gradient(135deg, #176543, #23805a);
          color: #ffffff;
          font-size: 12px;
          font-weight: 750;
          letter-spacing: 0.01em;
          cursor: pointer;
          box-shadow: 0 10px 24px rgba(23, 101, 67, 0.18);
          transition:
            transform 0.18s ease,
            box-shadow 0.18s ease,
            opacity 0.18s ease;
        }

        .tiaki-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 13px 28px rgba(23, 101, 67, 0.23);
        }

        .tiaki-submit-btn:active:not(:disabled) {
          transform: translateY(0);
        }

        .tiaki-submit-btn:disabled {
          cursor: not-allowed;
          opacity: 0.7;
        }

        .tiaki-spinner {
          width: 15px;
          height: 15px;
          border: 2px solid rgba(255, 255, 255, 0.35);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: tiaki-spin 0.75s linear infinite;
        }

        @keyframes tiaki-spin {
          to {
            transform: rotate(360deg);
          }
        }

        .tiaki-form-divider {
          display: flex;
          align-items: center;
          gap: 10px;
          margin: 28px 0 18px;
        }

        .tiaki-form-divider span {
          height: 1px;
          flex: 1;
          background: #edf1ef;
        }

        .tiaki-form-divider small {
          color: #a1aca6;
          font-size: 8px;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .tiaki-form-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
        }

        .tiaki-form-footer p {
          margin: 0;
          color: #8a9690;
          font-size: 9px;
        }

        .tiaki-api-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #7a8981;
          font-size: 8px;
          font-weight: 700;
          white-space: nowrap;
        }

        .tiaki-api-dot {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #25a56f;
          box-shadow: 0 0 0 3px rgba(37, 165, 111, 0.1);
        }

        .tiaki-demo-context {
          display: flex;
          flex-direction: column;
          gap: 3px;
          margin-top: 28px;
          padding-top: 17px;
          border-top: 1px solid #edf1ef;
        }

        .tiaki-demo-context strong {
          color: #506159;
          font-size: 8px;
          font-weight: 850;
          letter-spacing: 0.1em;
        }

        .tiaki-demo-context span {
          color: #a0aaa5;
          font-size: 8px;
        }

        @media (max-width: 900px) {
          .tiaki-auth-wrapper {
            padding: 20px;
          }

          .tiaki-auth-card {
            grid-template-columns: 1fr;
            max-width: 600px;
          }

          .tiaki-hero-section {
            min-height: 470px;
            padding: 34px;
          }

          .tiaki-hero-body {
            margin-top: 42px;
          }

          .tiaki-form-section {
            padding: 42px 34px;
          }
        }

        @media (max-width: 520px) {
          .tiaki-auth-wrapper {
            padding: 0;
          }

          .tiaki-auth-card {
            min-height: 100vh;
            border: 0;
            border-radius: 0;
          }

          .tiaki-hero-section {
            min-height: auto;
            padding: 28px 24px 25px;
          }

          .tiaki-hero-body {
            margin-top: 32px;
          }

          .tiaki-hero-body h1 {
            font-size: 2.1rem;
          }

          .tiaki-hero-description {
            margin-bottom: 24px;
          }

          .tiaki-form-section {
            padding: 36px 24px;
          }

          .tiaki-form-footer {
            align-items: flex-start;
            flex-direction: column;
          }
        }
      `}</style>
    </main>
  );
}
