import React, { useState } from "react";
import { Lock, Mail, LogIn } from "lucide-react";
import Swal from "sweetalert2";

const API_BASE_URL = "http://127.0.0.1:3000";

export default function VendorLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [emailFocused, setEmailFocused] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const [buttonHovered, setButtonHovered] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch(`${API_BASE_URL}/vendor/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.msg || "Invalid login credentials");

      // Save vendor token in localStorage
      localStorage.setItem("vendorToken", data.token);
      localStorage.setItem("vendorName", data.vendor.name);
      localStorage.setItem("vendorId", data.vendor.vendor_id);

      // Success alert with SweetAlert2
      Swal.fire({
        title: `Welcome ${data.vendor.name}!`,
        text: "Login successful. Redirecting to your RFQ dashboard...",
        icon: "success",
        timer: 1800,
        showConfirmButton: false,
      });

      setTimeout(() => {
        window.location.href = "/vendor/dashboard";
      }, 1800);
    } catch (err) {
      console.error("Login Error:", err);
      setError(err.message || "Login failed");

      Swal.fire({
        icon: "error",
        title: "Login Failed",
        text: err.message || "Please check your credentials and try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  // Industrial Minimal Theme Styles
  const styles = {
    container: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #F5F5F5 0%, #FFFFFF 100%)',
      /* center the login card vertically & horizontally */
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem',
      fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif",
      width: '100vw',
      boxSizing: 'border-box'
    },
    card: {
      backgroundColor: '#FFFFFF',
      width: '100%',
      /* allow the card to expand on very wide screens while keeping comfortable margins */
      maxWidth: '448px',
      margin: '0 auto',
      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
      border: '1px solid #E0E0E0',
      borderRadius: '12px',
      padding: '3rem 2.5rem',
      transition: 'box-shadow 0.3s ease'
    },
    header: {
      textAlign: 'center',
      marginBottom: '2.5rem'
    },
    headerFlex: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.75rem',
      marginBottom: '0.75rem'
    },
    title: {
      fontSize: '1.875rem',
      fontWeight: '600',
      color: '#1E3A8A',
      letterSpacing: '-0.02em',
      margin: 0
    },
    subtitle: {
      fontSize: '0.875rem',
      color: '#9E9E9E',
      marginTop: '0.5rem',
      lineHeight: '1.5'
    },
    errorBox: {
      marginBottom: '1.5rem',
      padding: '0.875rem 1rem',
      borderRadius: '8px',
      fontSize: '0.875rem',
      textAlign: 'center',
      backgroundColor: '#FEE2E2',
      color: '#991B1B',
      border: '1px solid #FCA5A5',
      animation: 'fadeIn 0.3s ease'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem'
    },
    inputGroup: {
      display: 'flex',
      flexDirection: 'column'
    },
    label: {
      display: 'block',
      fontSize: '0.875rem',
      fontWeight: '500',
      marginBottom: '0.5rem',
      color: '#212121'
    },
    inputWrapper: {
      position: 'relative'
    },
    icon: {
      position: 'absolute',
      left: '0.75rem',
      top: '50%',
      transform: 'translateY(-50%)',
      color: '#9E9E9E',
      pointerEvents: 'none'
    },
    input: {
      width: '100%',
      paddingLeft: '2.75rem',
      paddingRight: '1rem',
      paddingTop: '0.875rem',
      paddingBottom: '0.875rem',
      borderRadius: '8px',
      fontSize: '0.9375rem',
      outline: 'none',
      transition: 'all 0.25s ease',
      border: '1px solid #E0E0E0',
      color: '#212121',
      backgroundColor: '#F5F5F5',
      fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif"
    },
    inputFocused: {
      borderColor: '#1E3A8A',
      boxShadow: '0 0 0 3px rgba(30, 58, 138, 0.08)',
      backgroundColor: '#FFFFFF'
    },
    button: {
      width: '100%',
      padding: '0.875rem 1.5rem',
      borderRadius: '8px',
      fontWeight: '500',
      fontSize: '1rem',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      gap: '0.5rem',
      transition: 'all 0.25s ease',
      outline: 'none',
      backgroundColor: loading ? '#9E9E9E' : '#1E3A8A',
      color: '#FFFFFF',
      border: 'none',
      cursor: loading ? 'not-allowed' : 'pointer',
      marginTop: '0.5rem',
      opacity: loading ? 0.6 : 1,
      fontFamily: "'Inter', 'Poppins', 'Roboto', sans-serif"
    },
    buttonHovered: {
      backgroundColor: '#1a3278',
      boxShadow: '0 4px 12px rgba(30, 58, 138, 0.25)',
      transform: 'translateY(-1px)'
    },
    footer: {
      marginTop: '1.5rem',
      paddingTop: '1.5rem',
      textAlign: 'center',
      borderTop: '1px solid #E0E0E0'
    },
    footerText: {
      fontSize: '0.75rem',
      color: '#9E9E9E',
      margin: 0
    }
  };

  return (
    <div style={styles.container}>
      <style>
        {`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@400;500;600;700&family=Roboto:wght@400;500;700&display=swap');
          
          * {
            box-sizing: border-box;
          }
          
          input::placeholder {
            color: #9E9E9E;
          }
          
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(-8px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          @media (max-width: 768px) {
            .vendor-login-card {
              padding: 2rem 1.5rem !important;
            }
          }
          
          @media (max-width: 480px) {
            .vendor-login-card {
              padding: 1.75rem 1.25rem !important;
            }
          }
          /* On very large screens keep comfortable inner padding so the form stays readable */
          @media (min-width: 1280px) {
            .vendor-login-card {
              padding-left: 3rem !important;
              padding-right: 3rem !important;
            }
          }

          /* ---------- New visual & animation styles ---------- */
          .login-bg-blob { position: absolute; border-radius: 9999px; filter: blur(48px); opacity: .55; transform: translateZ(0); animation: float 8s ease-in-out infinite; z-index:0; }
          /* Vendor dashboard color palette: deep-blue -> sky blue accents */
          .login-bg-blob--tl { width: 360px; height: 360px; left: -120px; top: -80px; background: radial-gradient(closest-side, rgba(30,58,138,0.14), rgba(37,99,235,0.06)); }
          .login-bg-blob--br { width: 520px; height: 520px; right: -160px; bottom: -120px; background: radial-gradient(closest-side, rgba(37,99,235,0.12), rgba(99,102,241,0.03)); animation-duration: 10s; }

          @keyframes float { 0% { transform: translateY(0) translateX(0) } 50% { transform: translateY(-12px) translateX(6px) } 100% { transform: translateY(0) translateX(0) } }

          /* Card entrance */
          .vendor-login-card { position: relative; z-index: 10; transform-origin: center; animation: popIn .45s cubic-bezier(.2,.9,.2,1) both; box-shadow: 0 8px 32px rgba(20, 20, 35, 0.08); border: 1px solid rgba(30,58,138,0.06); }
          @keyframes popIn { from { opacity:0; transform: translateY(14px) scale(.99) } to { opacity:1; transform: translateY(0) scale(1) } }

          /* Header / logo */
          .vendor-header-badge { display:inline-flex; align-items:center; justify-content:center; width:56px; height:56px; border-radius:12px; background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%); color: #fff; box-shadow: 0 6px 18px rgba(30,58,138,0.18); margin:0 auto 0.85rem auto; transform: translateZ(0); }
          .vendor-title { display:block; margin:0.25rem 0 0; font-size:1.125rem; font-weight:700; color:#0f172a; }
          .vendor-sub { color:#6b7280; font-size:0.9rem }

          /* Inputs – animated focus / icon color */
          .input-icon { transition: transform .22s ease, color .22s ease; color: #9E9E9E; }
          .input-wrapper:focus-within .input-icon { color: #1E3A8A; transform: translateX(2px); }
          .vendor-login-card label { color:#374151; font-weight:600 }

          /* Fancy button */
          .cta-btn { position: relative; overflow: hidden; background: linear-gradient(90deg,#1e3a8a 0%, #2563eb 55%); border-radius:10px; padding:.8rem 1.2rem; box-shadow: 0 8px 18px rgba(37,99,235,0.16); transition: transform .16s ease, box-shadow .16s ease; display:inline-flex; align-items:center; gap:.6rem; color:#fff; border: none; }
          .cta-btn:hover { transform: translateY(-3px); box-shadow: 0 16px 40px rgba(37,99,235,0.18); }

          /* subtle shimmer on hover */
          .cta-btn:before { content:""; position:absolute; left: -40%; top:0; width:34%; height:100%; transform: skewX(-18deg) translateX(-100%); background: linear-gradient(90deg, rgba(255,255,255,0.06), rgba(255,255,255,0.18), rgba(255,255,255,0.06)); transition: transform .72s ease; pointer-events:none; border-radius:10px; }
          .cta-btn:hover:before { transform: skewX(-18deg) translateX(260%); }

          /* subtle microcopy and link */
          .forget { color: #475569; font-size: 0.875rem; text-align:right; display:block; margin-top:.25rem }

          /* accessibility focus ring for keyboard users */
          .vendor-login-card :focus { outline: none; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.08); }

          /* subtle decorative pattern to fill wide white space without changing colors */
          .login-bg-lines { position:absolute; inset:0; z-index:0; pointer-events:none; opacity:0.06; background-image: repeating-linear-gradient(120deg, rgba(30,58,138,0.03) 0px, rgba(30,58,138,0.03) 1px, transparent 1px, transparent 28px); }

          /* a soft dot matrix anchored to the bottom-right to add interest */
          .login-bg-dots { position:absolute; right:30px; bottom:20px; width:420px; height:220px; background-image: radial-gradient(rgba(30,58,138,0.06) 1px, transparent 1px); background-size:16px 16px; opacity:0.28; transform: translateZ(0); z-index:0; pointer-events:none; }

          @media (max-width: 640px) {
            .login-bg-dots { display: none; }
            .login-bg-lines { opacity: 0.02; background-size: 36px 36px; }
            .login-bg-blob--tl, .login-bg-blob--br { opacity: 0.28; filter: blur(34px); }
          }
        `}
      </style>

      <div className="login-bg-blob login-bg-blob--tl" aria-hidden="true"></div>
      <div className="login-bg-blob login-bg-blob--br" aria-hidden="true"></div>
      <div className="login-bg-lines" aria-hidden="true"></div>
      <div className="login-bg-dots" aria-hidden="true"></div>

      <div style={styles.card} className="vendor-login-card" aria-labelledby="vendor-login-heading">
        {/* Header */}
        <div style={styles.header}>
          <div style={styles.headerFlex}>
            <div className="vendor-header-badge" aria-hidden="true">
              <Lock size={20} strokeWidth={1.6} />
            </div>
            <div>
              <h2 style={styles.title} id="vendor-login-heading">Vendor Login</h2>
              <div className="vendor-sub">Enter your vendor account to manage RFQs & quotes</div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={styles.errorBox}>
            {error}
          </div>
        )}

        {/* Form */}
        <div style={styles.form}>
          {/* Email Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Email Address
            </label>
            <div style={styles.inputWrapper} className="input-wrapper">
              <Mail className="input-icon" style={styles.icon} size={20} />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setEmailFocused(true)}
                onBlur={() => setEmailFocused(false)}
                placeholder="vendor@example.com"
                required
                style={{
                  ...styles.input,
                  ...(emailFocused ? styles.inputFocused : {})
                }}
              />
            </div>
          </div>

          {/* Password Input */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>
              Password
            </label>
            <div style={styles.inputWrapper} className="input-wrapper">
              <Lock className="input-icon" style={styles.icon} size={20} />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocused(true)}
                onBlur={() => setPasswordFocused(false)}
                placeholder="Enter password"
                required
                style={{
                  ...styles.input,
                  ...(passwordFocused ? styles.inputFocused : {})
                }}
              />
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={loading}
            onClick={handleLogin}
            onMouseEnter={() => setButtonHovered(true)}
            onMouseLeave={() => setButtonHovered(false)}
            style={{
              ...styles.button,
              ...(buttonHovered && !loading ? styles.buttonHovered : {})
            }}
            className="cta-btn"
          >
            {loading ? (
              <span>Logging in...</span>
            ) : (
              <>
                <LogIn size={18} />
                <span>Login</span>
              </>
            )}
          </button>
          <div className="forget">Need access? Contact procurement@company.example</div>
        </div>

        {/* Footer */}
        <div style={styles.footer}>
          <p style={styles.footerText}>
            © 2025 Vendor Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}