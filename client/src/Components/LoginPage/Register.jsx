import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Register.css"; // ← Our custom CSS

const Register = () => {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "admin",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
    const backendUrl = process.env.REACT_APP_BACKEND_IP;

  const navigate = useNavigate();

  const { username, email, password, role } = formData;

  const onChange = (e) =>
    setFormData({ ...formData, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (!username || !email || !password) {
      setError("All fields are required");
      setLoading(false);
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      setLoading(false);
      return;
    }

    try {
      const res = await axios.post(`${backendUrl}/api/admin/register`, formData);

      setSuccess("Admin registered successfully!");
      console.log("Registered:", res.data);

      // Optional: auto-login
      // localStorage.setItem("token", res.data.token);

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setError(
        err.response?.data?.message || "Registration failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-container">
      <div className="register-card">
        <h2 className="register-title">Create Admin Account</h2>

        {success && <div className="alert success">{success}</div>}
        {error && <div className="alert error">{error}</div>}

        <form onSubmit={onSubmit} className="register-form">
          {/* Username */}
          <div className="form-group">
            <label>Username</label>
            <input
              type="text"
              name="username"
              value={username}
              onChange={onChange}
              placeholder="Enter username"
              required
            />
          </div>

          {/* Email */}
          <div className="form-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              value={email}
              onChange={onChange}
              placeholder="admin@example.com"
              required
            />
          </div>

          {/* Password */}
          <div className="form-group">
            <label>Password</label>
            <div className="password-wrapper">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={password}
                onChange={onChange}
                placeholder="••••••••"
                required
                minLength="6"
              />
              <button
                type="button"
                className="toggle-password"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            <small>Minimum 6 characters</small>
          </div>

          {/* Role */}
          <div className="form-group">
            <label>Role</label>
            <select name="role" value={role} onChange={onChange}>
              <option value="admin">Admin</option>
              <option value="subadmin1">Subadmin 1</option>
              <option value="subadmin2">Subadmin 2</option>
              <option value="subadmin3">Subadmin 3</option>
              <option value="supplier">Supplier</option>
            </select>
          </div>

          {/* Submit */}
          <button type="submit" disabled={loading} className="submit-btn">
            {loading ? "Creating Account..." : "Register"}
          </button>
        </form>

        <p className="login-link">
          Already have an account?{" "}
          <a href="/login">Login here</a>
        </p>
      </div>
    </div>
  );
};

export default Register;