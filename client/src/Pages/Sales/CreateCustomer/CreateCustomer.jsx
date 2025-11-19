// src/CreateCustomer.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminHeader from "../../../Components/AdminHeader/AdminHeader";
import AdminSidebar from "../../../Components/AdminSidebar/AdminSidebar";
import "./CreateCustomer.css";

const CreateCustomer = () => {
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  // Admin layout states
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);
const [catalogues, setCatalogues] = useState([]);
const [catalogueLoading, setCatalogueLoading] = useState(true);
  // Form state
  const [formData, setFormData] = useState({
    customer: "",
    company: "",
    taxType: "Vat Registered",
    placeOfSupply: "Abu Dhabi",
    trn: "",
    email: "",
    secondaryEmail: "",
    phone: "",
    catalogue: "Default",
    currency: "United Arab Emirates Dirham - AED",
    tags: [],
    paymentTerms: "Default",
    assignStaff: "",
    openingBalance: "Amount Receivable",
    taxMethod: "Tax Exclusive",
    billingAddress: {
      address: "",
      city: "",
      stateRegion: "",
      zipPostalCode: "",
      country: "United Arab Emirates",
    },
    shippingAddress: {
      sameAsBilling: false,
      contactPerson: "",
      address: "",
      city: "",
      stateRegion: "",
      zipPostalCode: "",
      country: "",
      phone: "",
    },
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Dark Mode
  useEffect(() => {
    document.body.setAttribute("data-theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  // Protect route
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
      .then((res) => setUser(res.data.user))
      .catch(() => {
        localStorage.clear();
        navigate("/");
      });
  }, [navigate, BACKEND_URL]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: type === "checkbox" ? checked : value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleTagInput = (e) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const tag = e.target.value.trim();
      setFormData((prev) => ({ ...prev, tags: [...prev.tags, tag] }));
      e.target.value = "";
    }
  };

  const removeTag = (tag) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((t) => t !== tag),
    }));
  };


  // Fetch catalogues on mount
useEffect(() => {
  const fetchCatalogues = async () => {
    try {
      const res = await axios.get(`${BACKEND_URL}/api/catalogues/getAllCatalogues`);
      
      // Safety first: always ensure it's an array
      const data = Array.isArray(res.data) ? res.data : res.data.data || [];
      
      setCatalogues(data);

      // Auto-select "Default" if exists
      const defaultCat = data.find(c => c.name === "Default") || data[0];
      if (defaultCat) {
        setFormData(prev => ({ ...prev, catalogue: defaultCat._id }));
      }
    } catch (err) {
      console.error("Failed to load catalogues", err);
      setCatalogues([]); // fallback
    } finally {
      setCatalogueLoading(false);
    }
  };

  fetchCatalogues();
}, [BACKEND_URL]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer.trim()) {
      setError("Customer name is required");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await axios.post(`${BACKEND_URL}/api/customers/createCustomer`, formData);
      navigate("/admin/sales/Customer");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create customer");
    } finally {
      setLoading(false);
    }
  };

  // Auto-sync shipping address when "Same as Billing" is checked
useEffect(() => {
  if (formData.shippingAddress.sameAsBilling) {
    setFormData(prev => ({
      ...prev,
      shippingAddress: {
        sameAsBilling: true,
        contactPerson: prev.shippingAddress.contactPerson || "",
        address: prev.billingAddress.address || "",
        city: prev.billingAddress.city || "",
        stateRegion: prev.billingAddress.stateRegion || "",
        zipPostalCode: prev.billingAddress.zipPostalCode || "",
        country: prev.billingAddress.country || "",  // ← This prevents empty invalid value
        phone: prev.phone || ""
      }
    }));
  }
}, [
  formData.shippingAddress.sameAsBilling,
  formData.billingAddress.address,
  formData.billingAddress.city,
  formData.billingAddress.stateRegion,
  formData.billingAddress.zipPostalCode,
  formData.billingAddress.country,
  formData.phone
]);

  if (!user) return <div className="loading">Loading…</div>;

  return (
    <div className="admin-layout">
      <AdminHeader
        user={user}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
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
        <div className="supplier-form-container">
          <div className="form-header">
            <h1>Create New Customer</h1>
            <button
              className="btn-back"
              onClick={() => navigate("/admin/sales/Customer")}
            >
              ← Back
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <form onSubmit={handleSubmit} className="supplier-form">
            {/* ==== Customer Information ==== */}
            <div className="form-section-title">Customer Information</div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="customer">
                  Customer <span className="required">*</span>
                </label>
                <input
                  id="customer"
                  name="customer"
                  value={formData.customer}
                  onChange={handleChange}
                  placeholder="Enter customer name"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  name="currency"
                  value={formData.currency}
                  onChange={handleChange}
                >
                  <option value="United Arab Emirates Dirham - AED">
                    United Arab Emirates Dirham - AED
                  </option>
                  <option value="Qatari Riyal - QAR">Qatari Riyal - QAR</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="company">Company</label>
                <input
                  id="company"
                  name="company"
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Enter company name"
                />
              </div>
              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <div className="tags-input">
                  {formData.tags.map((tag) => (
                    <span key={tag} className="tag">
                      {tag}{" "}
                      <button type="button" onClick={() => removeTag(tag)}>
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    onKeyDown={handleTagInput}
                    placeholder="Press Enter to add tag"
                  />
                </div>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="taxType">Tax Type</label>
                <select
                  id="taxType"
                  name="taxType"
                  value={formData.taxType}
                  onChange={handleChange}
                >
                  <option value="Vat Registered">Vat Registered</option>
                  <option value="Non-Vat Registered">Non-Vat Registered</option>
                  <option value="Vat Registered - Designated ozones">
                    Vat Registered - Designated ozones
                  </option>
                  <option value="Non Vat Registered - Designated ozones">
                    Non Vat Registered - Designated ozones
                  </option>
                  <option value="GCC Vat Registered">GCC Vat Registered</option>
                  <option value="GCC Non Vat Registered">
                    GCC Non Vat Registered
                  </option>
                  <option value="Non-GCC">Non-GCC</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="paymentTerms">Payment Terms</label>
                <select
                  id="paymentTerms"
                  name="paymentTerms"
                  value={formData.paymentTerms}
                  onChange={handleChange}
                >
                  <option value="Default">Default</option>
                  <option value="Net 1">Net 1</option>
                  <option value="Net 3">Net 3</option>
                  <option value="Net 7">Net 7</option>
                  <option value="Net 10">Net 10</option>
                  <option value="Net 15">Net 15</option>
                  <option value="Net 30">Net 30</option>
                  <option value="Net 45">Net 45</option>
                  <option value="Net 60">Net 60</option>
                  <option value="Due on Receipt">Due on Receipt</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="placeOfSupply">Place of Supply</label>
                <select
                  id="placeOfSupply"
                  name="placeOfSupply"
                  value={formData.placeOfSupply}
                  onChange={handleChange}
                >
                  <option value="Abu Dhabi">Abu Dhabi</option>
                  <option value="Ajman">Ajman</option>
                  <option value="Dubai">Dubai</option>
                  <option value="Fujairah">Fujairah</option>
                  <option value="Ras Al Khaimah">Ras Al Khaimah</option>
                  <option value="Sharjah">Sharjah</option>
                  <option value="Umm Al Quwain">Umm Al Quwain</option>
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="openingBalance">Opening Balance</label>
                <select
                  id="openingBalance"
                  name="openingBalance"
                  value={formData.openingBalance}
                  onChange={handleChange}
                >
                  <option value="Amount Receivable & Amount Payable">
                    Amount Receivable & Amount Payable
                  </option>
                  <option value="Amount Receivable">Amount Receivable</option>
                  <option value="Amount Payable">Amount Payable</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="trn">TRN</label>
                <input
                  id="trn"
                  name="trn"
                  value={formData.trn}
                  onChange={handleChange}
                  placeholder="Enter TRN"
                />
              </div>
              <div className="form-group">
                <label htmlFor="taxMethod">Tax Method</label>
                <select
                  id="taxMethod"
                  name="taxMethod"
                  value={formData.taxMethod}
                  onChange={handleChange}
                >
                  <option value="Tax Exclusive">Tax Exclusive</option>
                  <option value="Tax Inclusive">Tax Inclusive</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="Enter email"
                />
              </div>
       <div className="form-group">
  <label htmlFor="catalogue">
    Catalogue <span className="required">*</span>
  </label>
  <select
    id="catalogue"
    name="catalogue"
    value={formData.catalogue || ""}
    onChange={handleChange}
    required
    disabled={catalogueLoading}
  >
    {catalogueLoading ? (
      <option>Loading catalogues...</option>
    ) : catalogues.length === 0 ? (
      <option>No catalogues available</option>
    ) : (
      <>
        <option value="">Select Catalogue</option>
        {catalogues.map((cat) => (
          <option key={cat._id} value={cat._id}>
            {cat.name}
          </option>
        ))}
      </>
    )}
  </select>
</div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="secondaryEmail">Secondary Email</label>
                <input
                  id="secondaryEmail"
                  name="secondaryEmail"
                  type="email"
                  value={formData.secondaryEmail}
                  onChange={handleChange}
                  placeholder="Enter secondary email"
                />
              </div>
              <div className="form-group">
                <label htmlFor="assignStaff">Assign Staff</label>
                <input
                  id="assignStaff"
                  name="assignStaff"
                  value={formData.assignStaff}
                  onChange={handleChange}
                  placeholder="Enter staff name"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Enter phone number"
                />
              </div>
            </div>

            {/* ==== Billing Address ==== */}
            <div className="form-section-title">Billing Address</div>
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="billingAddress.address">Address</label>
                <input
                  id="billingAddress.address"
                  name="billingAddress.address"
                  value={formData.billingAddress.address}
                  onChange={handleChange}
                  placeholder="Enter address"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="billingAddress.city">City</label>
                <input
                  id="billingAddress.city"
                  name="billingAddress.city"
                  value={formData.billingAddress.city}
                  onChange={handleChange}
                  placeholder="Enter city"
                />
              </div>
              <div className="form-group">
                <label htmlFor="billingAddress.stateRegion">State/Region</label>
                <input
                  id="billingAddress.stateRegion"
                  name="billingAddress.stateRegion"
                  value={formData.billingAddress.stateRegion}
                  onChange={handleChange}
                  placeholder="Enter state or region"
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="billingAddress.zipPostalCode">
                  ZIP/Postal Code
                </label>
                <input
                  id="billingAddress.zipPostalCode"
                  name="billingAddress.zipPostalCode"
                  value={formData.billingAddress.zipPostalCode}
                  onChange={handleChange}
                  placeholder="Enter ZIP code"
                />
              </div>
              <div className="form-group">
                <label htmlFor="billingAddress.country">Country</label>
                <select
                  id="billingAddress.country"
                  name="billingAddress.country"
                  value={formData.billingAddress.country}
                  onChange={handleChange}
                >
                  <option value="">Select Country</option>
                  <option value="Afghanistan">Afghanistan</option>
                  <option value="Albania">Albania</option>
                  <option value="Algeria">Algeria</option>
                  <option value="Andorra">Andorra</option>
                  <option value="Angola">Angola</option>
                  <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                  <option value="Argentina">Argentina</option>
                  <option value="Armenia">Armenia</option>
                  <option value="Australia">Australia</option>
                  <option value="Austria">Austria</option>
                  <option value="Azerbaijan">Azerbaijan</option>
                  <option value="Bahamas">Bahamas</option>
                  <option value="Bahrain">Bahrain</option>
                  <option value="Bangladesh">Bangladesh</option>
                  <option value="Barbados">Barbados</option>
                  <option value="Belarus">Belarus</option>
                  <option value="Belgium">Belgium</option>
                  <option value="Belize">Belize</option>
                  <option value="Benin">Benin</option>
                  <option value="Bhutan">Bhutan</option>
                  <option value="Bolivia">Bolivia</option>
                  <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                  <option value="Botswana">Botswana</option>
                  <option value="Brazil">Brazil</option>
                  <option value="Brunei">Brunei</option>
                  <option value="Bulgaria">Bulgaria</option>
                  <option value="Burkina Faso">Burkina Faso</option>
                  <option value="Burundi">Burundi</option>
                  <option value="Cambodia">Cambodia</option>
                  <option value="Cameroon">Cameroon</option>
                  <option value="Canada">Canada</option>
                  <option value="Cape Verde">Cape Verde</option>
                  <option value="Central African Republic">Central African Republic</option>
                  <option value="Chad">Chad</option>
                  <option value="Chile">Chile</option>
                  <option value="China">China</option>
                  <option value="Colombia">Colombia</option>
                  <option value="Comoros">Comoros</option>
                  <option value="Congo (Congo-Brazzaville)">Congo (Congo-Brazzaville)</option>
                  <option value="Costa Rica">Costa Rica</option>
                  <option value="Croatia">Croatia</option>
                  <option value="Cuba">Cuba</option>
                  <option value="Cyprus">Cyprus</option>
                  <option value="Czech Republic">Czech Republic</option>
                  <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                  <option value="Denmark">Denmark</option>
                  <option value="Djibouti">Djibouti</option>
                  <option value="Dominica">Dominica</option>
                  <option value="Dominican Republic">Dominican Republic</option>
                  <option value="Ecuador">Ecuador</option>
                  <option value="Egypt">Egypt</option>
                  <option value="El Salvador">El Salvador</option>
                  <option value="Equatorial Guinea">Equatorial Guinea</option>
                  <option value="Eritrea">Eritrea</option>
                  <option value="Estonia">Estonia</option>
                  <option value="Eswatini">Eswatini</option>
                  <option value="Ethiopia">Ethiopia</option>
                  <option value="Fiji">Fiji</option>
                  <option value="Finland">Finland</option>
                  <option value="France">France</option>
                  <option value="Gabon">Gabon</option>
                  <option value="Gambia">Gambia</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Germany">Germany</option>
                  <option value="Ghana">Ghana</option>
                  <option value="Greece">Greece</option>
                  <option value="Grenada">Grenada</option>
                  <option value="Guatemala">Guatemala</option>
                  <option value="Guinea">Guinea</option>
                  <option value="Guinea-Bissau">Guinea-Bissau</option>
                  <option value="Guyana">Guyana</option>
                  <option value="Haiti">Haiti</option>
                  <option value="Honduras">Honduras</option>
                  <option value="Hungary">Hungary</option>
                  <option value="Iceland">Iceland</option>
                  <option value="India">India</option>
                  <option value="Indonesia">Indonesia</option>
                  <option value="Iran">Iran</option>
                  <option value="Iraq">Iraq</option>
                  <option value="Ireland">Ireland</option>
                  <option value="Israel">Israel</option>
                  <option value="Italy">Italy</option>
                  <option value="Jamaica">Jamaica</option>
                  <option value="Japan">Japan</option>
                  <option value="Jordan">Jordan</option>
                  <option value="Kazakhstan">Kazakhstan</option>
                  <option value="Kenya">Kenya</option>
                  <option value="Kiribati">Kiribati</option>
                  <option value="Kuwait">Kuwait</option>
                  <option value="Kyrgyzstan">Kyrgyzstan</option>
                  <option value="Laos">Laos</option>
                  <option value="Latvia">Latvia</option>
                  <option value="Lebanon">Lebanon</option>
                  <option value="Lesotho">Lesotho</option>
                  <option value="Liberia">Liberia</option>
                  <option value="Libya">Libya</option>
                  <option value="Liechtenstein">Liechtenstein</option>
                  <option value="Lithuania">Lithuania</option>
                  <option value="Luxembourg">Luxembourg</option>
                  <option value="Madagascar">Madagascar</option>
                  <option value="Malawi">Malawi</option>
                  <option value="Malaysia">Malaysia</option>
                  <option value="Maldives">Maldives</option>
                  <option value="Mali">Mali</option>
                  <option value="Malta">Malta</option>
                  <option value="Marshall Islands">Marshall Islands</option>
                  <option value="Mauritania">Mauritania</option>
                  <option value="Mauritius">Mauritius</option>
                  <option value="Mexico">Mexico</option>
                  <option value="Micronesia">Micronesia</option>
                  <option value="Moldova">Moldova</option>
                  <option value="Monaco">Monaco</option>
                  <option value="Mongolia">Mongolia</option>
                  <option value="Montenegro">Montenegro</option>
                  <option value="Morocco">Morocco</option>
                  <option value="Mozambique">Mozambique</option>
                  <option value="Myanmar">Myanmar</option>
                  <option value="Namibia">Namibia</option>
                  <option value="Nauru">Nauru</option>
                  <option value="Nepal">Nepal</option>
                  <option value="Netherlands">Netherlands</option>
                  <option value="New Zealand">New Zealand</option>
                  <option value="Nicaragua">Nicaragua</option>
                  <option value="Niger">Niger</option>
                  <option value="Nigeria">Nigeria</option>
                  <option value="North Korea">North Korea</option>
                  <option value="North Macedonia">North Macedonia</option>
                  <option value="Norway">Norway</option>
                  <option value="Oman">Oman</option>
                  <option value="Pakistan">Pakistan</option>
                  <option value="Palau">Palau</option>
                  <option value="Palestine">Palestine</option>
                  <option value="Panama">Panama</option>
                  <option value="Papua New Guinea">Papua New Guinea</option>
                  <option value="Paraguay">Paraguay</option>
                  <option value="Peru">Peru</option>
                  <option value="Philippines">Philippines</option>
                  <option value="Poland">Poland</option>
                  <option value="Portugal">Portugal</option>
                  <option value="Qatar">Qatar</option>
                  <option value="Romania">Romania</option>
                  <option value="Russia">Russia</option>
                  <option value="Rwanda">Rwanda</option>
                  <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                  <option value="Saint Lucia">Saint Lucia</option>
                  <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                  <option value="Samoa">Samoa</option>
                  <option value="San Marino">San Marino</option>
                  <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                  <option value="Saudi Arabia">Saudi Arabia</option>
                  <option value="Senegal">Senegal</option>
                  <option value="Serbia">Serbia</option>
                  <option value="Seychelles">Seychelles</option>
                  <option value="Sierra Leone">Sierra Leone</option>
                  <option value="Singapore">Singapore</option>
                  <option value="Slovakia">Slovakia</option>
                  <option value="Slovenia">Slovenia</option>
                  <option value="Solomon Islands">Solomon Islands</option>
                  <option value="Somalia">Somalia</option>
                  <option value="South Africa">South Africa</option>
                  <option value="South Korea">South Korea</option>
                  <option value="South Sudan">South Sudan</option>
                  <option value="Spain">Spain</option>
                  <option value="Sri Lanka">Sri Lanka</option>
                  <option value="Sudan">Sudan</option>
                  <option value="Suriname">Suriname</option>
                  <option value="Sweden">Sweden</option>
                  <option value="Switzerland">Switzerland</option>
                  <option value="Syria">Syria</option>
                  <option value="Taiwan">Taiwan</option>
                  <option value="Tajikistan">Tajikistan</option>
                  <option value="Tanzania">Tanzania</option>
                  <option value="Thailand">Thailand</option>
                  <option value="Timor-Leste">Timor-Leste</option>
                  <option value="Togo">Togo</option>
                  <option value="Tonga">Tonga</option>
                  <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                  <option value="Tunisia">Tunisia</option>
                  <option value="Turkey">Turkey</option>
                  <option value="Turkmenistan">Turkmenistan</option>
                  <option value="Tuvalu">Tuvalu</option>
                  <option value="Uganda">Uganda</option>
                  <option value="Ukraine">Ukraine</option>
                  <option value="United Arab Emirates">United Arab Emirates</option>
                  <option value="United Kingdom">United Kingdom</option>
                  <option value="United States">United States</option>
                  <option value="Uruguay">Uruguay</option>
                  <option value="Uzbekistan">Uzbekistan</option>
                  <option value="Vanuatu">Vanuatu</option>
                  <option value="Vatican City">Vatican City</option>
                  <option value="Venezuela">Venezuela</option>
                  <option value="Vietnam">Vietnam</option>
                  <option value="Yemen">Yemen</option>
                  <option value="Zambia">Zambia</option>
                  <option value="Zimbabwe">Zimbabwe</option>
                </select>
              </div>
            </div>

            {/* ==== Shipping Address ==== */}
            <div className="form-section-title">Shipping Address</div>
            <div className="form-row">
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    name="shippingAddress.sameAsBilling"
                    checked={formData.shippingAddress.sameAsBilling}
                    onChange={handleChange}
                  />
                  Same as billing address
                </label>
              </div>
            </div>

            {!formData.shippingAddress.sameAsBilling && (
              <>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingAddress.contactPerson">
                      Contact Person
                    </label>
                    <input
                      id="shippingAddress.contactPerson"
                      name="shippingAddress.contactPerson"
                      value={formData.shippingAddress.contactPerson}
                      onChange={handleChange}
                      placeholder="Enter contact person"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingAddress.phone">Phone</label>
                    <input
                      id="shippingAddress.phone"
                      name="shippingAddress.phone"
                      value={formData.shippingAddress.phone}
                      onChange={handleChange}
                      placeholder="Enter phone"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingAddress.address">Address</label>
                    <input
                      id="shippingAddress.address"
                      name="shippingAddress.address"
                      value={formData.shippingAddress.address}
                      onChange={handleChange}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingAddress.city">City</label>
                    <input
                      id="shippingAddress.city"
                      name="shippingAddress.city"
                      value={formData.shippingAddress.city}
                      onChange={handleChange}
                      placeholder="Enter city"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingAddress.stateRegion">
                      State/Region
                    </label>
                    <input
                      id="shippingAddress.stateRegion"
                      name="shippingAddress.stateRegion"
                      value={formData.shippingAddress.stateRegion}
                      onChange={handleChange}
                      placeholder="Enter state or region"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="shippingAddress.zipPostalCode">
                      ZIP/Postal Code
                    </label>
                    <input
                      id="shippingAddress.zipPostalCode"
                      name="shippingAddress.zipPostalCode"
                      value={formData.shippingAddress.zipPostalCode}
                      onChange={handleChange}
                      placeholder="Enter ZIP code"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="shippingAddress.country">Country</label>
                    <select
                      id="shippingAddress.country"
                      name="shippingAddress.country"
                      value={formData.shippingAddress.country}
                      onChange={handleChange}
                    >
                      <option value="">Select Country</option>
                      {/* Same country list as billing */}
                      <option value="Afghanistan">Afghanistan</option>
                      <option value="Albania">Albania</option>
                      <option value="Algeria">Algeria</option>
                      <option value="Andorra">Andorra</option>
                      <option value="Angola">Angola</option>
                      <option value="Antigua and Barbuda">Antigua and Barbuda</option>
                      <option value="Argentina">Argentina</option>
                      <option value="Armenia">Armenia</option>
                      <option value="Australia">Australia</option>
                      <option value="Austria">Austria</option>
                      <option value="Azerbaijan">Azerbaijan</option>
                      <option value="Bahamas">Bahamas</option>
                      <option value="Bahrain">Bahrain</option>
                      <option value="Bangladesh">Bangladesh</option>
                      <option value="Barbados">Barbados</option>
                      <option value="Belarus">Belarus</option>
                      <option value="Belgium">Belgium</option>
                      <option value="Belize">Belize</option>
                      <option value="Benin">Benin</option>
                      <option value="Bhutan">Bhutan</option>
                      <option value="Bolivia">Bolivia</option>
                      <option value="Bosnia and Herzegovina">Bosnia and Herzegovina</option>
                      <option value="Botswana">Botswana</option>
                      <option value="Brazil">Brazil</option>
                      <option value="Brunei">Brunei</option>
                      <option value="Bulgaria">Bulgaria</option>
                      <option value="Burkina Faso">Burkina Faso</option>
                      <option value="Burundi">Burundi</option>
                      <option value="Cambodia">Cambodia</option>
                      <option value="Cameroon">Cameroon</option>
                      <option value="Canada">Canada</option>
                      <option value="Cape Verde">Cape Verde</option>
                      <option value="Central African Republic">Central African Republic</option>
                      <option value="Chad">Chad</option>
                      <option value="Chile">Chile</option>
                      <option value="China">China</option>
                      <option value="Colombia">Colombia</option>
                      <option value="Comoros">Comoros</option>
                      <option value="Congo (Congo-Brazzaville)">Congo (Congo-Brazzaville)</option>
                      <option value="Costa Rica">Costa Rica</option>
                      <option value="Croatia">Croatia</option>
                      <option value="Cuba">Cuba</option>
                      <option value="Cyprus">Cyprus</option>
                      <option value="Czech Republic">Czech Republic</option>
                      <option value="Democratic Republic of the Congo">Democratic Republic of the Congo</option>
                      <option value="Denmark">Denmark</option>
                      <option value="Djibouti">Djibouti</option>
                      <option value="Dominica">Dominica</option>
                      <option value="Dominican Republic">Dominican Republic</option>
                      <option value="Ecuador">Ecuador</option>
                      <option value="Egypt">Egypt</option>
                      <option value="El Salvador">El Salvador</option>
                      <option value="Equatorial Guinea">Equatorial Guinea</option>
                      <option value="Eritrea">Eritrea</option>
                      <option value="Estonia">Estonia</option>
                      <option value="Eswatini">Eswatini</option>
                      <option value="Ethiopia">Ethiopia</option>
                      <option value="Fiji">Fiji</option>
                      <option value="Finland">Finland</option>
                      <option value="France">France</option>
                      <option value="Gabon">Gabon</option>
                      <option value="Gambia">Gambia</option>
                      <option value="Georgia">Georgia</option>
                      <option value="Germany">Germany</option>
                      <option value="Ghana">Ghana</option>
                      <option value="Greece">Greece</option>
                      <option value="Grenada">Grenada</option>
                      <option value="Guatemala">Guatemala</option>
                      <option value="Guinea">Guinea</option>
                      <option value="Guinea-Bissau">Guinea-Bissau</option>
                      <option value="Guyana">Guyana</option>
                      <option value="Haiti">Haiti</option>
                      <option value="Honduras">Honduras</option>
                      <option value="Hungary">Hungary</option>
                      <option value="Iceland">Iceland</option>
                      <option value="India">India</option>
                      <option value="Indonesia">Indonesia</option>
                      <option value="Iran">Iran</option>
                      <option value="Iraq">Iraq</option>
                      <option value="Ireland">Ireland</option>
                      <option value="Israel">Israel</option>
                      <option value="Italy">Italy</option>
                      <option value="Jamaica">Jamaica</option>
                      <option value="Japan">Japan</option>
                      <option value="Jordan">Jordan</option>
                      <option value="Kazakhstan">Kazakhstan</option>
                      <option value="Kenya">Kenya</option>
                      <option value="Kiribati">Kiribati</option>
                      <option value="Kuwait">Kuwait</option>
                      <option value="Kyrgyzstan">Kyrgyzstan</option>
                      <option value="Laos">Laos</option>
                      <option value="Latvia">Latvia</option>
                      <option value="Lebanon">Lebanon</option>
                      <option value="Lesotho">Lesotho</option>
                      <option value="Liberia">Liberia</option>
                      <option value="Libya">Libya</option>
                      <option value="Liechtenstein">Liechtenstein</option>
                      <option value="Lithuania">Lithuania</option>
                      <option value="Luxembourg">Luxembourg</option>
                      <option value="Madagascar">Madagascar</option>
                      <option value="Malawi">Malawi</option>
                      <option value="Malaysia">Malaysia</option>
                      <option value="Maldives">Maldives</option>
                      <option value="Mali">Mali</option>
                      <option value="Malta">Malta</option>
                      <option value="Marshall Islands">Marshall Islands</option>
                      <option value="Mauritania">Mauritania</option>
                      <option value="Mauritius">Mauritius</option>
                      <option value="Mexico">Mexico</option>
                      <option value="Micronesia">Micronesia</option>
                      <option value="Moldova">Moldova</option>
                      <option value="Monaco">Monaco</option>
                      <option value="Mongolia">Mongolia</option>
                      <option value="Montenegro">Montenegro</option>
                      <option value="Morocco">Morocco</option>
                      <option value="Mozambique">Mozambique</option>
                      <option value="Myanmar">Myanmar</option>
                      <option value="Namibia">Namibia</option>
                      <option value="Nauru">Nauru</option>
                      <option value="Nepal">Nepal</option>
                      <option value="Netherlands">Netherlands</option>
                      <option value="New Zealand">New Zealand</option>
                      <option value="Nicaragua">Nicaragua</option>
                      <option value="Niger">Niger</option>
                      <option value="Nigeria">Nigeria</option>
                      <option value="North Korea">North Korea</option>
                      <option value="North Macedonia">North Macedonia</option>
                      <option value="Norway">Norway</option>
                      <option value="Oman">Oman</option>
                      <option value="Pakistan">Pakistan</option>
                      <option value="Palau">Palau</option>
                      <option value="Palestine">Palestine</option>
                      <option value="Panama">Panama</option>
                      <option value="Papua New Guinea">Papua New Guinea</option>
                      <option value="Paraguay">Paraguay</option>
                      <option value="Peru">Peru</option>
                      <option value="Philippines">Philippines</option>
                      <option value="Poland">Poland</option>
                      <option value="Portugal">Portugal</option>
                      <option value="Qatar">Qatar</option>
                      <option value="Romania">Romania</option>
                      <option value="Russia">Russia</option>
                      <option value="Rwanda">Rwanda</option>
                      <option value="Saint Kitts and Nevis">Saint Kitts and Nevis</option>
                      <option value="Saint Lucia">Saint Lucia</option>
                      <option value="Saint Vincent and the Grenadines">Saint Vincent and the Grenadines</option>
                      <option value="Samoa">Samoa</option>
                      <option value="San Marino">San Marino</option>
                      <option value="Sao Tome and Principe">Sao Tome and Principe</option>
                      <option value="Saudi Arabia">Saudi Arabia</option>
                      <option value="Senegal">Senegal</option>
                      <option value="Serbia">Serbia</option>
                      <option value="Seychelles">Seychelles</option>
                      <option value="Sierra Leone">Sierra Leone</option>
                      <option value="Singapore">Singapore</option>
                      <option value="Slovakia">Slovakia</option>
                      <option value="Slovenia">Slovenia</option>
                      <option value="Solomon Islands">Solomon Islands</option>
                      <option value="Somalia">Somalia</option>
                      <option value="South Africa">South Africa</option>
                      <option value="South Korea">South Korea</option>
                      <option value="South Sudan">South Sudan</option>
                      <option value="Spain">Spain</option>
                      <option value="Sri Lanka">Sri Lanka</option>
                      <option value="Sudan">Sudan</option>
                      <option value="Suriname">Suriname</option>
                      <option value="Sweden">Sweden</option>
                      <option value="Switzerland">Switzerland</option>
                      <option value="Syria">Syria</option>
                      <option value="Taiwan">Taiwan</option>
                      <option value="Tajikistan">Tajikistan</option>
                      <option value="Tanzania">Tanzania</option>
                      <option value="Thailand">Thailand</option>
                      <option value="Timor-Leste">Timor-Leste</option>
                      <option value="Togo">Togo</option>
                      <option value="Tonga">Tonga</option>
                      <option value="Trinidad and Tobago">Trinidad and Tobago</option>
                      <option value="Tunisia">Tunisia</option>
                      <option value="Turkey">Turkey</option>
                      <option value="Turkmenistan">Turkmenistan</option>
                      <option value="Tuvalu">Tuvalu</option>
                      <option value="Uganda">Uganda</option>
                      <option value="Ukraine">Ukraine</option>
                      <option value="United Arab Emirates">United Arab Emirates</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="United States">United States</option>
                      <option value="Uruguay">Uruguay</option>
                      <option value="Uzbekistan">Uzbekistan</option>
                      <option value="Vanuatu">Vanuatu</option>
                      <option value="Vatican City">Vatican City</option>
                      <option value="Venezuela">Venezuela</option>
                      <option value="Vietnam">Vietnam</option>
                      <option value="Yemen">Yemen</option>
                      <option value="Zambia">Zambia</option>
                      <option value="Zimbabwe">Zimbabwe</option>
                    </select>
                  </div>
                </div>
              </>
            )}

            {/* ==== Actions ==== */}
            <div className="form-actions">
              <button type="submit" className="btn-save" disabled={loading}>
                {loading ? "Creating..." : "Save"}
              </button>
              <button
                type="button"
                className="btn-cancel"
                onClick={() => navigate("/admin/sales/Customer")}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default CreateCustomer;