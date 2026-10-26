"use client";

import {
  ArrowRight,
  CheckCircle2,
  FileCheck2,
  Fingerprint,
  LockKeyhole,
  QrCode,
  Search,
  ShieldCheck,
  Sparkles,
  Trace,
} from "lucide-react";
import Image from "next/image";
import { FormEvent, useState } from "react";

export default function PublicVerificationPage() {
  const [verificationId, setVerificationId] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitted(Boolean(verificationId.trim()));
  }

  return (
    <main className="verification-page">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <header className="public-header">
        <a className="brand" href="/" aria-label="TIAKI Public Verification">
          <Image
            src="/logo.png"
            alt="TIAKI"
            width={190}
            height={70}
            priority
            className="brand-logo"
          />
        </a>

        <div className="header-badge">
          <span className="status-pulse" />
          PUBLIC VERIFICATION
        </div>
      </header>

      <section className="hero">
        <div className="hero-content">
          <div className="eyebrow">
            <ShieldCheck size={17} />
            TIAKI CERTIFICATION NETWORK
          </div>

          <h1>
            Trust what you
            <span> can verify.</span>
          </h1>

          <p className="hero-copy">
            Verify the authenticity and public status of a TIAKI halal
            certification using a certificate, registration, batch, QR, or
            verification ID.
          </p>

          <form className="verification-form" onSubmit={handleSubmit}>
            <div className="input-shell">
              <Search size={22} />

              <input
                value={verificationId}
                onChange={(event) => setVerificationId(event.target.value)}
                placeholder="Enter certificate or verification ID"
                aria-label="Certificate or verification ID"
                autoComplete="off"
              />

              {verificationId && (
                <button
                  type="button"
                  className="clear-button"
                  onClick={() => {
                    setVerificationId("");
                    setSubmitted(false);
                  }}
                  aria-label="Clear verification ID"
                >
                  ×
                </button>
              )}
            </div>

            <button className="verify-button" type="submit">
              Verify
              <ArrowRight size={19} />
            </button>
          </form>

          {submitted && (
            <div className="lookup-notice" role="status">
              <LockKeyhole size={18} />

              <div>
                <strong>Verification lookup ready</strong>

                <span>
                  The public verification service will validate this ID when
                  the live TIAKI verification API is connected.
                </span>
              </div>
            </div>
          )}

          <div className="trust-line">
            <div>
              <CheckCircle2 size={17} />
              Authenticity
            </div>

            <div>
              <CheckCircle2 size={17} />
              Certification status
            </div>

            <div>
              <CheckCircle2 size={17} />
              Public traceability
            </div>
          </div>
        </div>

        <div className="hero-visual" aria-hidden="true">
          <div className="orbit orbit-large" />
          <div className="orbit orbit-small" />

          <div className="shield-card">
            <div className="shield-glow" />

            <div className="shield-icon">
              <ShieldCheck size={76} strokeWidth={1.35} />
            </div>

            <div className="shield-label">
              TIAKI VERIFIED
            </div>

            <div className="shield-subtitle">
              Public certification assurance
            </div>
          </div>

          <div className="floating-card floating-card-top">
            <Fingerprint size={20} />

            <div>
              <strong>Authenticity</strong>
              <span>Verification-ready</span>
            </div>
          </div>

          <div className="floating-card floating-card-bottom">
            <QrCode size={20} />

            <div>
              <strong>QR Verification</strong>
              <span>Public access</span>
            </div>
          </div>
        </div>
      </section>

      <section className="assurance-section">
        <div className="section-heading">
          <div className="eyebrow">
            <Sparkles size={16} />
            WHAT YOU CAN VERIFY
          </div>

          <h2>
            One verification. Clear public assurance.
          </h2>

          <p>
            TIAKI Public Verification is designed to expose only information
            intended for public confirmation.
          </p>
        </div>

        <div className="assurance-grid">
          <article className="assurance-card">
            <div className="card-icon">
              <FileCheck2 size={24} />
            </div>

            <h3>Certificate</h3>

            <p>
              Confirm the public identity and status of a TIAKI certificate.
            </p>

            <span className="card-link">
              Certificate verification
              <ArrowRight size={15} />
            </span>
          </article>

          <article className="assurance-card featured">
            <div className="card-icon">
              <ShieldCheck size={24} />
            </div>

            <h3>Authenticity</h3>

            <p>
              Check whether the submitted verification reference can be
              authenticated by TIAKI.
            </p>

            <span className="card-link">
              Authenticity check
              <ArrowRight size={15} />
            </span>
          </article>

          <article className="assurance-card">
            <div className="card-icon">
              <Trace size={24} />
            </div>

            <h3>Traceability</h3>

            <p>
              View a public-safe traceability summary without exposing
              sensitive operational records.
            </p>

            <span className="card-link">
              Traceability summary
              <ArrowRight size={15} />
            </span>
          </article>
        </div>
      </section>

      <section className="how-section">
        <div className="how-panel">
          <div className="how-copy">
            <div className="eyebrow">
              <LockKeyhole size={16} />
              PUBLIC BY DESIGN
            </div>

            <h2>
              Verification without exposing the operation.
            </h2>

            <p>
              The public portal is intentionally separated from TIAKI
              internal operational and audit systems. Only approved public
              verification information belongs here.
            </p>
          </div>

          <div className="protection-list">
            <div>
              <CheckCircle2 size={20} />
              <span>Certificate authenticity</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Public certification scope</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Current public status</span>
            </div>

            <div>
              <CheckCircle2 size={20} />
              <span>Public traceability summary</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="public-footer">
        <div className="footer-brand">
          <Image
            src="/logo.png"
            alt="TIAKI"
            width={125}
            height={46}
            className="footer-logo"
          />

          <span>
            Halal Slaughter Intelligence
          </span>
        </div>

        <div className="footer-note">
          <LockKeyhole size={14} />
          Public verification only · Sensitive operational data is not
          displayed.
        </div>
      </footer>
    </main>
  );
}
