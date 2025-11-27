import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiEdit2,
  FiX,
  FiUser,
  FiMail,
  FiShield,
  FiLock,
  FiArrowLeft,
  FiChevronDown,
  FiEye,
  FiEyeOff,
} from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../Components/AdminHeader/AdminHeader";
import AdminSidebar from "../../Components/AdminSidebar/AdminSidebar";
import "./AdminProfile.css";

const AdminProfile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    role: "",
    newPassword: "",
    currentPassword: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Password visibility toggles
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);

  // Sidebar & Header States
  const [collapsed, setCollapsed] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);

  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  // Fetch logged-in user
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }

    axios
      .get(`${BACKEND_URL}/api/admin/viewloginedprofile`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        setUser(res.data.user);
        setFormData({
          username: res.data.user.username,
          email: res.data.user.email,
          role: res.data.user.role,
          newPassword: "",
          currentPassword: "",
        });
      })
      .catch((err) => {
        console.error(err);
        localStorage.clear();
        navigate("/");
      })
      .finally(() => setLoading(false));
  }, [navigate, BACKEND_URL]);

  const handleEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (formData.newPassword && !formData.currentPassword) {
      setError("Current password is required to change your password.");
      return;
    }

    try {
      const token = localStorage.getItem("token");

      // ✅ Only send changed fields
      const payload = {};

      if (formData.username !== user.username) {
        payload.username = formData.username;
      }

      if (formData.email !== user.email) {
        payload.email = formData.email;
      }

      if (user.role === "admin" && formData.role !== user.role) {
        payload.role = formData.role;
      }

      if (formData.newPassword) {
        payload.newPassword = formData.newPassword;
        payload.currentPassword = formData.currentPassword;
      }

      if (Object.keys(payload).length === 0) {
        setEditMode(false);
        return;
      }

      const res = await axios.put(
        `${BACKEND_URL}/api/admin/editprofile`,
        payload,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setUser(res.data.user);
      setSuccess("Profile updated successfully!");
      setEditMode(false);
      // Reset password visibility
      setShowNewPassword(false);
      setShowCurrentPassword(false);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update profile.");
    }
  };

  if (loading) {
    return (
      <div className="admin-layout">
        <AdminHeader
          user={user}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />
        <main className={`admin-content ${collapsed ? "collapsed" : ""}`}>
          <div className="adminprofile-wrapper">
            <div className="adminprofile-loading-container">
              <div className="adminprofile-spinner"></div>
              <p>Loading your profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="admin-layout">
        <AdminHeader
          user={user}
          dropdownOpen={dropdownOpen}
          setDropdownOpen={setDropdownOpen}
          collapsed={collapsed}
          setCollapsed={setCollapsed}
        />
        <AdminSidebar
          collapsed={collapsed}
          setCollapsed={setCollapsed}
          openMenu={openMenu}
          setOpenMenu={setOpenMenu}
        />
        <main className={`admin-content ${collapsed ? "collapsed" : ""}`}>
          <div className="adminprofile-wrapper">
            <div className="adminprofile-error-message">User not found</div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="admin-layout">
      <AdminHeader
        user={user}
        dropdownOpen={dropdownOpen}
        setDropdownOpen={setDropdownOpen}
        collapsed={collapsed}
        setCollapsed={setCollapsed}
      />
      <AdminSidebar
        collapsed={collapsed}
        setCollapsed={setCollapsed}
        openMenu={openMenu}
        setOpenMenu={setOpenMenu}
      />

      <main className={`admin-content ${collapsed ? "collapsed" : ""}`}>
        <div className="adminprofile-wrapper">
          {/* Header Card */}
          <div className="adminprofile-header-card">
            <div className="adminprofile-header-top">
              <button className="adminprofile-btn-back" onClick={() => navigate(-1)}>
                <FiArrowLeft size={18} /> Back
              </button>
              <div className="adminprofile-header-actions">
                <button className="adminprofile-btn-edit" onClick={() => setEditMode(true)}>
                  <FiEdit2 size={18} /> Edit Profile
                </button>
              </div>
            </div>
          </div>

          {/* Grid of Cards */}
          <div className="adminprofile-grid">
            {/* Basic Information */}
            <div className="adminprofile-card adminprofile-card-blue">
              <div className="adminprofile-card-header">
                <h2>Basic Information</h2>
                <div className="adminprofile-header-accent"></div>
              </div>
              <div className="adminprofile-card-content">
                <div className="adminprofile-detail-row">
                  <span className="adminprofile-label">Username</span>
                  <span className="adminprofile-value">{user.username}</span>
                </div>
                <div className="adminprofile-detail-row">
                  <span className="adminprofile-label">Role</span>
                  <span className={`adminprofile-role-badge ${user.role}`}>
                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                  </span>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="adminprofile-card adminprofile-card-teal">
              <div className="adminprofile-card-header">
                <h2>Contact Information</h2>
                <div className="adminprofile-header-accent"></div>
              </div>
              <div className="adminprofile-card-content">
                <div className="adminprofile-detail-row">
                  <span className="adminprofile-label">Email</span>
                  <span className="adminprofile-value adminprofile-email-value">
                    {user.email}
                  </span>
                </div>
              </div>
            </div>

            {/* Account Security */}
            <div className="adminprofile-card adminprofile-card-purple">
              <div className="adminprofile-card-header">
                <h2>Account Security</h2>
                <div className="adminprofile-header-accent"></div>
              </div>
              <div className="adminprofile-card-content">
                <div className="adminprofile-detail-row">
                  <span className="adminprofile-label">Password</span>
                  <span className="adminprofile-value">••••••••</span>
                </div>
                <div className="adminprofile-detail-row">
                  <span className="adminprofile-label">Last Updated</span>
                  <span className="adminprofile-value">
                    {user.updatedAt
                      ? new Date(user.updatedAt).toLocaleDateString()
                      : "Never"}
                  </span>
                </div>
              </div>
            </div>

         
          </div>

          {/* Edit Modal */}
          {editMode && (
            <div
              className="adminprofile-modal-overlay"
              onClick={() => setEditMode(false)}
            >
              <div
                className="adminprofile-modal-content"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="adminprofile-modal-header">
                  <h2>Edit Profile</h2>
                  <button
                    className="adminprofile-modal-close"
                    onClick={() => setEditMode(false)}
                  >
                    <FiX />
                  </button>
                </div>

                {error && <div className="adminprofile-alert error">{error}</div>}
                {success && <div className="adminprofile-alert success">{success}</div>}

                <form onSubmit={handleEdit} className="adminprofile-form">
                  <div className="adminprofile-form-group">
                    <label className="adminprofile-form-label">Username</label>
                    <input
                      type="text"
                      className="adminprofile-form-input"
                      value={formData.username}
                      onChange={(e) =>
                        setFormData({ ...formData, username: e.target.value })
                      }
                      required
                      minLength="3"
                    />
                  </div>

                  <div className="adminprofile-form-group">
                    <label className="adminprofile-form-label">Email</label>
                    <input
                      type="email"
                      className="adminprofile-form-input"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  {user.role === "admin" && (
                    <div className="adminprofile-form-group">
                      <label className="adminprofile-form-label">Role</label>
                      <div className="adminprofile-select-wrapper">
                        <select
                          value={formData.role}
                          onChange={(e) =>
                            setFormData({ ...formData, role: e.target.value })
                          }
                          className="adminprofile-form-select"
                        >
                          <option value="admin">Admin</option>
                          <option value="subadmin1">Sub Admin 1</option>
                          <option value="subadmin2">Sub Admin 2</option>
                          <option value="subadmin3">Sub Admin 3</option>
                          <option value="supplier">Supplier</option>
                        </select>
                        <FiChevronDown className="adminprofile-select-icon" />
                      </div>
                    </div>
                  )}

                  {/* New Password with Eye Toggle */}
                  <div className="adminprofile-form-group">
                    <label className="adminprofile-form-label">
                      <FiLock className="adminprofile-form-label-icon" /> New Password (optional)
                    </label>
                    <div className="adminprofile-password-wrapper">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        className="adminprofile-form-input"
                        placeholder="Leave blank to keep current password"
                        value={formData.newPassword}
                        onChange={(e) =>
                          setFormData({ ...formData, newPassword: e.target.value })
                        }
                        minLength="6"
                      />
                      <button
                        type="button"
                        className="adminprofile-password-toggle"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        aria-label={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? <FiEyeOff /> : <FiEye />}
                      </button>
                    </div>
                  </div>

                  {/* Current Password with Eye Toggle */}
                  {formData.newPassword && (
                    <div className="adminprofile-form-group">
                      <label className="adminprofile-form-label">
                        Current Password (to confirm)
                      </label>
                      <div className="adminprofile-password-wrapper">
                        <input
                          type={showCurrentPassword ? "text" : "password"}
                          className="adminprofile-form-input"
                          value={formData.currentPassword}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              currentPassword: e.target.value,
                            })
                          }
                          required
                        />
                        <button
                          type="button"
                          className="adminprofile-password-toggle"
                          onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                          aria-label={showCurrentPassword ? "Hide password" : "Show password"}
                        >
                          {showCurrentPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="adminprofile-form-actions">
                    <button
                      type="button"
                      className="adminprofile-btn-cancel"
                      onClick={() => setEditMode(false)}
                    >
                      Cancel
                    </button>
                    <button type="submit" className="adminprofile-btn-save">
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default AdminProfile;