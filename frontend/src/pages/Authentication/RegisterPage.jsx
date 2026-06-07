import React, { useState, useEffect } from "react";
import { FaUser, FaEnvelope, FaLock, FaCheckCircle, FaTimesCircle, FaExclamationCircle, FaMagic, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

export default function RegisterPage() {
  // State for form data
  const [formData, setFormData] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  // State for validation errors
  const [errors, setErrors] = useState({});
  // State for server response message
  const [message, setMessage] = useState("");
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  // State for loading/submission status
  const [isLoading, setIsLoading] = useState(false);
  // State for tracking which field is currently focused
  const [focusedField, setFocusedField] = useState("");

  const navigate = useNavigate();

  // --- Utility Functions for Validation ---

  /**
   * Validates a single field based on its name and value.
   * Uses allFormData to check dependencies like confirmPassword vs password.
   */
  const validate = (name, value, allFormData) => {
    let error = "";

    switch (name) {
      case "username":
        if (!value) {
          error = "Username is required.";
        } else if (value.length < 3) {
          error = "Username must be at least 3 characters long.";
        } else if (/\s/.test(value)) {
          error = "Username cannot contain spaces.";
        } else if (!/^[a-zA-Z0-9_]+$/.test(value)) {
          error = "Username can only contain letters, numbers, and underscores.";
        }
        break;

      case "email":
        // Improved regex to prevent emails like om@gmail.com1 (TLD must be letters only)
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

        if (!value) {
          error = "Email is required.";
        } else if (!emailRegex.test(value)) {
          error = "Please enter a valid email address (e.g., user@domain.com).";
        }
        break;

      case "password":
        if (!value) {
          error = "Password is required.";
        } else if (value.length < 8) {
          error = "Password must be at least 8 characters long.";
        } else if (!/[A-Z]/.test(value)) {
          error = "Password must contain at least one uppercase letter.";
        } else if (!/[a-z]/.test(value)) {
          error = "Password must contain at least one lowercase letter.";
        } else if (!/[0-9]/.test(value)) {
          error = "Password must contain at least one number.";
        } else if (!/[^a-zA-Z0-9]/.test(value)) {
          error = "Password must contain at least one special character.";
        }
        break;

      case "confirmPassword":
        if (!value) {
          error = "Confirmation is required.";
        } else if (value !== allFormData.password) {
          error = "Passwords do not match.";
        }
        break;

      default:
        break;
    }

    return error;
  };

  // --- Handlers ---

  const handleChange = (e) => {
    const { name, value } = e.target;

    // 1. Update form data
    setFormData(prevData => {
      const newData = { ...prevData, [name]: value };

      // 2. Validate the changed field
      const error = validate(name, value, newData);
      setErrors(prevErrors => ({ ...prevErrors, [name]: error }));

      // 3. Special case: If password changes, re-validate confirmPassword too
      if (name === 'password' && newData.confirmPassword) {
        const confirmError = validate('confirmPassword', newData.confirmPassword, newData);
        setErrors(prevErrors => ({ ...prevErrors, confirmPassword: confirmError }));
      } else if (name === 'confirmPassword' && newData.password) {
        // If confirm password changes, re-validate it against the main password
        const confirmError = validate('confirmPassword', value, newData);
        setErrors(prevErrors => ({ ...prevErrors, confirmPassword: confirmError }));
      }

      // Clear the server message and field-specific errors on change
      if (message) setMessage("");

      return newData;
    });
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const validateAll = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validate(key, formData[key], formData);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0; // Returns true if no errors
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage(""); // Clear previous server message

    // 1. Run client-side validation
    const isValid = validateAll();

    if (!isValid) {
      setMessage("error:Please correct the errors in the form before submitting.");
      return; // Stop submission if validation fails
    }

    // Since confirmPassword is only for client-side validation, omit it for the server
    const { confirmPassword, ...dataToSend } = formData;

    setIsLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:3000/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(dataToSend),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("success:Registered successfully!");
        // Redirect logic 
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      }
      else {
        // Handle specific server-side errors (e.g., username/email already taken)
        // Check if it's a duplicate entry error
        if (data.sqlState === '23000' || data.code === 'ER_DUP_ENTRY') {
          // Extract field name from error message
          const errorMsg = data.sqlMessage || data.message || "";
          if (errorMsg.includes("username")) {
            setErrors(prevErrors => ({ ...prevErrors, username: "This username is already taken. Please choose another one." }));
          } else if (errorMsg.includes("email")) {
            setErrors(prevErrors => ({ ...prevErrors, email: "This email is already registered. Please use another email." }));
          } else {
            setMessage("error:" + (data.message || "Registration failed. Please try again."));
          }
        } else {
          setMessage("error:" + (data.message || "Registration failed. Please try again."));
        }
      }
    } catch (err) {
      setMessage("warning:Server error: Could not connect to the server.");
    } finally {
      // Only set isLoading to false if not redirecting immediately
      setIsLoading(false);
    }
  };

  // Optional: useEffect to handle successful redirect message
  useEffect(() => {
    if (message.startsWith("success:")) {
      const timer = setTimeout(() => {
        if (message.includes("successfully!")) {
          setMessage("success:Redirecting to login...");
        }
      }, 1500);

      return () => clearTimeout(timer); // Cleanup
    }
  }, [message]);


  // --- Styling Functions ---

  const getMessageIcon = () => {
    if (message.startsWith("success:")) return <FaCheckCircle size={20} color="#1E3A8A" />;
    if (message.startsWith("error:")) return <FaTimesCircle size={20} color="#B91C1C" />;
    if (message.startsWith("warning:")) return <FaExclamationCircle size={20} color="#D97706" />;
    return null;
  };

  const getMessageStyles = () => {
    if (message.startsWith("success:")) {
      return {
        color: "#1E3A8A",
        backgroundColor: "#EFF6FF",
        borderColor: "#93C5FD",
      };
    }
    if (message.startsWith("error:")) {
      return {
        color: "#B91C1C",
        backgroundColor: "#FEF2F2",
        borderColor: "#FCA5A5",
      };
    }
    if (message.startsWith("warning:")) {
      return {
        color: "#D97706",
        backgroundColor: "#FFFBEB",
        borderColor: "#FDE68A",
      };
    }
    return {};
  };

  const inputContainerStyle = {
    position: "relative",
    marginBottom: "1.5rem",
    display: "flex",
    alignItems: "center"
  };

  const inputStyle = (fieldName) => ({
    width: "100%",
    padding: "1rem 3rem 1rem 3rem",
    border: `2px solid ${errors[fieldName] ? "#B91C1C" : (focusedField === fieldName ? "#1E3A8A" : "#E0E0E0")}`,
    borderRadius: "10px",
    outline: "none",
    fontSize: "1rem",
    fontFamily: "'Inter', 'Roboto', sans-serif",
    color: "#212121",
    backgroundColor: "#FFFFFF",
    transition: "border-color 0.3s ease, box-shadow 0.3s ease",
    boxShadow: focusedField === fieldName ? "0 0 0 3px rgba(30, 58, 138, 0.1)" : "none",
  });

  const iconStyle = {
    position: "absolute",
    left: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    color: "#9E9E9E",
    pointerEvents: "none",
    fontSize: "1.25rem",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "1.5rem",
    height: "1.5rem",
    flexShrink: 0
  };

  const errorTextStyle = {
    color: "#B91C1C",
    fontSize: "0.875rem",
    marginTop: "0.5rem",
    paddingLeft: "0.5rem",
    paddingRight: "0.5rem",
    wordWrap: "break-word",
    whiteSpace: "normal",
    lineHeight: "1.4",
    maxWidth: "100%",
    display: "block",
    overflow: "hidden"
  };

  const passwordToggleStyle = {
    position: "absolute",
    right: "0.75rem",
    top: "50%",
    transform: "translateY(-50%)",
    background: "none",
    border: "none",
    cursor: "pointer",
    padding: "0.5rem",
    color: "#9E9E9E"
  };


  // --- Render ---

  return (
    <div style={{
      minHeight: "100vh",
      width: "100vw",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      background: "#F5F5F5",
      fontFamily: "'Inter', 'Roboto', sans-serif"
    }}>
      <div style={{
        background: "#FFFFFF",
        padding: "3rem 2.5rem",
        borderRadius: "12px",
        width: "100%",
        maxWidth: "440px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
        transition: "all 0.3s ease"
      }}>
        <div style={{ textAlign: "center", marginBottom: "2.5rem" }}>
          <div style={{
            fontSize: "2.5rem",
            marginBottom: "0.75rem",
            color: "#1E3A8A",
            opacity: 0.9
          }}>
            <FaMagic />
          </div>
          <h2 style={{
            margin: 0,
            color: "#212121",
            fontSize: "1.875rem",
            fontWeight: "600",
            fontFamily: "'Inter', 'Roboto', sans-serif",
            marginBottom: "0.5rem"
          }}>
            Create Account
          </h2>
          <p style={{
            color: "#9E9E9E",
            margin: 0,
            fontSize: "0.95rem",
            fontWeight: "400"
          }}>
            Join us and start your journey
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Username */}
          <div style={inputContainerStyle}>
            <FaUser style={iconStyle} />
            <input
              type="text"
              name="username"
              placeholder="Username (min 3 chars, no spaces)"
              value={formData.username}
              onChange={handleChange}
              onFocus={() => setFocusedField("username")}
              onBlur={() => setFocusedField("")}
              style={inputStyle("username")}
              aria-invalid={!!errors.username}
              aria-describedby="username-error"
              required
            />
            {errors.username && <div id="username-error" style={errorTextStyle}>{errors.username}</div>}
          </div>

          {/* Email */}
          <div style={inputContainerStyle}>
            <FaEnvelope style={iconStyle} />
            <input
              type="email"
              name="email"
              placeholder="Email (e.g., user@domain.com)"
              value={formData.email}
              onChange={handleChange}
              onFocus={() => setFocusedField("email")}
              onBlur={() => setFocusedField("")}
              style={inputStyle("email")}
              aria-invalid={!!errors.email}
              aria-describedby="email-error"
              required
            />
            {errors.email && <div id="email-error" style={errorTextStyle}>{errors.email}</div>}
          </div>

          {/* Password */}
          <div style={inputContainerStyle}>
            <FaLock style={iconStyle} />
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              placeholder="Password (min 8 chars, incl. special/upper/lower/number)"
              value={formData.password}
              onChange={handleChange}
              onFocus={() => setFocusedField("password")}
              onBlur={() => setFocusedField("")}
              style={{
                ...inputStyle("password"),
                paddingRight: "5rem" // Add space for the toggle button
              }}
              aria-invalid={!!errors.password}
              aria-describedby="password-error"
              required
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              style={passwordToggleStyle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.password && <div id="password-error" style={errorTextStyle}>{errors.password}</div>}
          </div>

          {/* Confirm Password */}
          <div style={inputContainerStyle}>
            <FaLock style={iconStyle} />
            <input
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              placeholder="Confirm Password"
              value={formData.confirmPassword}
              onChange={handleChange}
              onFocus={() => setFocusedField("confirmPassword")}
              onBlur={() => setFocusedField("")}
              style={{
                ...inputStyle("confirmPassword"),
                paddingRight: "5rem"
              }}
              aria-invalid={!!errors.confirmPassword}
              aria-describedby="confirmPassword-error"
              required
            />
            <button
              type="button"
              onClick={handleTogglePassword}
              style={passwordToggleStyle}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={20} /> : <FaEye size={20} />}
            </button>
            {errors.confirmPassword && <div id="confirmPassword-error" style={errorTextStyle}>{errors.confirmPassword}</div>}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            style={{
              width: "100%",
              padding: "1rem",
              background: isLoading ? "#9E9E9E" : "#1E3A8A",
              color: "#FFFFFF",
              border: "none",
              borderRadius: "10px",
              fontWeight: "600",
              fontSize: "1rem",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              cursor: isLoading ? "not-allowed" : "pointer",
              marginTop: "1rem",
              transition: "all 0.3s ease",
              boxShadow: isLoading ? "none" : "0 2px 8px rgba(30, 58, 138, 0.2)"
            }}
            onMouseEnter={(e) => {
              if (!isLoading) {
                e.target.style.background = "#1E40AF";
                e.target.style.boxShadow = "0 4px 12px rgba(30, 58, 138, 0.3)";
              }
            }}
            onMouseLeave={(e) => {
              if (!isLoading) {
                e.target.style.background = "#1E3A8A";
                e.target.style.boxShadow = "0 2px 8px rgba(30, 58, 138, 0.2)";
              }
            }}
          >
            {isLoading ? "Creating..." : "Create Account"}
          </button>
        </form>

        {/* Message */}
        {message && (
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "0.5rem",
            marginTop: "1.25rem",
            padding: "0.875rem",
            borderRadius: "10px",
            border: "1px solid",
            fontFamily: "'Inter', 'Roboto', sans-serif",
            fontSize: "0.9rem",
            ...getMessageStyles()
          }}>
            {getMessageIcon()}
            <span>{message.split(":")[1]}</span>
          </div>
        )}

        {/* Footer */}
        <p style={{
          fontSize: "0.875rem",
          textAlign: "center",
          marginTop: "1.5rem",
          color: "#9E9E9E",
          fontFamily: "'Inter', 'Roboto', sans-serif"
        }}>
          Already have an account?{" "}
          <span
            onClick={() => navigate("/login")}
            style={{
              color: "#1E3A8A",
              cursor: "pointer",
              fontWeight: "500",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.textDecoration = "underline";
            }}
            onMouseLeave={(e) => {
              e.target.style.textDecoration = "none";
            }}
          >
            Sign in
          </span>
        </p>
      </div>
    </div>
  );
}