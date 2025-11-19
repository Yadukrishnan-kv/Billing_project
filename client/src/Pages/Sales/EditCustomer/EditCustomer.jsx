import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AdminHeader from '../../../Components/AdminHeader/AdminHeader';
import AdminSidebar from '../../../Components/AdminSidebar/AdminSidebar';
import '../CreateCustomer/CreateCustomer.css';

const CustomerEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const BACKEND_URL = process.env.REACT_APP_BACKEND_IP;

  const [form, setForm] = useState({
    customer: '',
    company: '',
    taxType: 'Vat Registered',
    placeOfSupply: 'Abu Dhabi',
    trn: '',
    email: '',
    secondaryEmail: '',
    phone: '',
    catalogue: '',
    currency: 'United Arab Emirates Dirham - AED',
    tags: [],
    paymentTerms: 'Default',
    assignStaff: '',
    openingBalance: 'Amount Receivable',
    taxMethod: 'Tax Exclusive',
    billingAddress: {
      address: '',
      city: '',
      stateRegion: '',
      zipPostalCode: '',
      country: 'United Arab Emirates',
    },
    shippingAddress: {
      sameAsBilling: false,
      contactPerson: '',
      address: '',
      city: '',
      stateRegion: '',
      zipPostalCode: '',
      country: '',
      phone: '',
    },
  });

  const [catalogues, setCatalogues] = useState([]);
  const [catalogueLoading, setCatalogueLoading] = useState(true);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [tagInput, setTagInput] = useState('');

  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(null);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    document.body.setAttribute('data-theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  // Auth Check
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/');
      return;
    }
    axios.get(`${BACKEND_URL}/api/admin/viewloginedprofile`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUser(res.data.user))
    .catch(() => { localStorage.clear(); navigate('/'); });
  }, [navigate, BACKEND_URL]);

  // Fetch All Catalogues
  useEffect(() => {
    const fetchCatalogues = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/catalogues/getAllCatalogues`);
        const data = Array.isArray(res.data) ? res.data : res.data.data || [];
        setCatalogues(data);
      } catch (err) {
        console.error('Failed to load catalogues', err);
        setCatalogues([]);
      } finally {
        setCatalogueLoading(false);
      }
    };
    fetchCatalogues();
  }, [BACKEND_URL]);

  // Fetch Customer Data
  useEffect(() => {
    if (!user) return;

    const fetchCustomer = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/customers/getCustomerById/${id}`);
        const c = res.data.data;

        setForm({
          customer: c.customer || '',
          company: c.company || '',
          taxType: c.taxType || 'Vat Registered',
          placeOfSupply: c.placeOfSupply || 'Abu Dhabi',
          trn: c.trn || '',
          email: c.email || '',
          secondaryEmail: c.secondaryEmail || '',
          phone: c.phone || '',
          // SAFELY extract catalogue ID
          catalogue: c.catalogue && typeof c.catalogue === 'object' ? c.catalogue._id : c.catalogue || '',
          currency: c.currency || 'United Arab Emirates Dirham - AED',
          tags: c.tags || [],
          paymentTerms: c.paymentTerms || 'Default',
          assignStaff: c.assignStaff || '',
          openingBalance: c.openingBalance || 'Amount Receivable',
          taxMethod: c.taxMethod || 'Tax Exclusive',
          billingAddress: {
            address: c.billingAddress?.address || '',
            city: c.billingAddress?.city || '',
            stateRegion: c.billingAddress?.stateRegion || '',
            zipPostalCode: c.billingAddress?.zipPostalCode || '',
            country: c.billingAddress?.country || 'United Arab Emirates',
          },
          shippingAddress: {
            sameAsBilling: c.shippingAddress?.sameAsBilling || false,
            contactPerson: c.shippingAddress?.contactPerson || '',
            address: c.shippingAddress?.address || '',
            city: c.shippingAddress?.city || '',
            stateRegion: c.shippingAddress?.stateRegion || '',
            zipPostalCode: c.shippingAddress?.zipPostalCode || '',
            country: c.shippingAddress?.country || '',
            phone: c.shippingAddress?.phone || '',
          },
        });
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to load customer');
      } finally {
        setLoading(false);
      }
    };

    fetchCustomer();
  }, [id, BACKEND_URL, user]);

  // Auto-sync shipping address when "Same as Billing" is checked
  useEffect(() => {
    if (form.shippingAddress.sameAsBilling) {
      setForm(prev => ({
        ...prev,
        shippingAddress: {
          ...prev.shippingAddress,
          sameAsBilling: true,
          address: prev.billingAddress.address,
          city: prev.billingAddress.city,
          stateRegion: prev.billingAddress.stateRegion,
          zipPostalCode: prev.billingAddress.zipPostalCode,
          country: prev.billingAddress.country,
          phone: prev.phone,
        }
      }));
    }
  }, [form.shippingAddress.sameAsBilling, form.billingAddress, form.phone]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const keys = name.split('.');

    if (keys.length === 1) {
      setForm(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
    } else {
      setForm(prev => {
        const copy = { ...prev };
        let ref = copy;
        for (let i = 0; i < keys.length - 1; i++) ref = ref[keys[i]];
        ref[keys[keys.length - 1]] = type === 'checkbox' ? checked : value;
        return copy;
      });
    }
  };

  const handleTagKeyDown = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setForm(prev => ({ ...prev, tags: [...prev.tags, tagInput.trim()] }));
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setForm(prev => ({ ...prev, tags: prev.tags.filter(t => t !== tag) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.customer.trim()) {
      setError('Customer name is required');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await axios.put(`${BACKEND_URL}/api/customers/updateCustomer/${id}`, form);
      navigate('/admin/sales/Customer');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

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
      <main className={`admin-content ${collapsed ? 'collapsed' : ''}`}>
        <div className="supplier-form-container">
          {/* ---------- HEADER ---------- */}
          <div className="form-header">
            <h1>Edit Customer</h1>
            <button className="btn-back" onClick={() => navigate('/admin/sales/Customer')}>
              Back
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          {loading ? (
            <div className="loading">Loading…</div>
          ) : (
            <form onSubmit={handleSubmit} className="supplier-form">

              {/* ==== CUSTOMER INFORMATION ==== */}
              <div className="form-section-title">Customer Information</div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="customer">Customer <span className="required">*</span></label>
                  <input
                    id="customer"
                    name="customer"
                    value={form.customer}
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
                    value={form.currency}
                    onChange={handleChange}
                  >
                    <option>United Arab Emirates Dirham - AED</option>
                    <option>US Dollar - USD</option>
                    <option>Euro - EUR</option>
                    <option>British Pound - GBP</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="company">Company</label>
                  <input
                    id="company"
                    name="company"
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Enter company name"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="tags">Tags</label>
                  <div className="tags-input">
                    {form.tags.map((tag) => (
                      <span key={tag} className="tag">
                        {tag}{' '}
                        <button type="button" onClick={() => removeTag(tag)}>
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      placeholder="Press Enter to add tag"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
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
                    value={form.taxType}
                    onChange={handleChange}
                  >
                    <option>Vat Registered</option>
                    <option>Non-Vat Registered</option>
                    <option>Vat Registered - Designated ozones</option>
                    <option>Non Vat Registered - Designated ozones</option>
                    <option>GCC Vat Registered</option>
                    <option>GCC Non Vat Registered</option>
                    <option>Non-GCC</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="paymentTerms">Payment Terms</label>
                  <select
                    id="paymentTerms"
                    name="paymentTerms"
                    value={form.paymentTerms}
                    onChange={handleChange}
                  >
                    <option>Default</option>
                    <option>Net 1</option>
                    <option>Net 3</option>
                    <option>Net 7</option>
                    <option>Net 10</option>
                    <option>Net 15</option>
                    <option>Net 30</option>
                    <option>Net 45</option>
                    <option>Net 60</option>
                    <option>Due on Receipt</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="placeOfSupply">Place of Supply</label>
                  <select
                    id="placeOfSupply"
                    name="placeOfSupply"
                    value={form.placeOfSupply}
                    onChange={handleChange}
                  >
                    <option>Abu Dhabi</option>
                    <option>Ajman</option>
                    <option>Dubai</option>
                    <option>Fujairah</option>
                    <option>Ras Al Khaimah</option>
                    <option>Sharjah</option>
                    <option>Umm Al Quwain</option>
                  </select>
                </div>
                <div className="form-group">
                  <label htmlFor="openingBalance">Opening Balance</label>
                  <select
                    id="openingBalance"
                    name="openingBalance"
                    value={form.openingBalance}
                    onChange={handleChange}
                  >
                    <option>Amount Receivable & Amount Payable</option>
                    <option>Amount Receivable</option>
                    <option>Amount Payable</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="trn">TRN</label>
                  <input
                    id="trn"
                    name="trn"
                    value={form.trn}
                    onChange={handleChange}
                    placeholder="Enter TRN"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="taxMethod">Tax Method</label>
                  <select
                    id="taxMethod"
                    name="taxMethod"
                    value={form.taxMethod}
                    onChange={handleChange}
                  >
                    <option>Tax Exclusive</option>
                    <option>Tax Inclusive</option>
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
                    value={form.email}
                    onChange={handleChange}
                    placeholder="Enter email"
                  />
                </div>
              <div className="form-group">
                  <label>Catalogue <span className="required">*</span></label>
                  <select name="catalogue" value={form.catalogue || ''} onChange={handleChange} required disabled={catalogueLoading}>
                    {catalogueLoading ? (
                      <option>Loading catalogues...</option>
                    ) : catalogues.length === 0 ? (
                      <option>No catalogues found</option>
                    ) : (
                      <>
                        <option value="">Select Catalogue</option>
                        {catalogues.map(cat => (
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
                    value={form.secondaryEmail}
                    onChange={handleChange}
                    placeholder="Enter secondary email"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="assignStaff">Assign Staff</label>
                  <input
                    id="assignStaff"
                    name="assignStaff"
                    value={form.assignStaff}
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
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Enter phone number"
                  />
                </div>
              </div>

              {/* ==== BILLING ADDRESS ==== */}
              <div className="form-section-title">Billing Address</div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="billingAddress.address">Address</label>
                  <input
                    id="billingAddress.address"
                    name="billingAddress.address"
                    value={form.billingAddress.address}
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
                    value={form.billingAddress.city}
                    onChange={handleChange}
                    placeholder="Enter city"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="billingAddress.stateRegion">State/Region</label>
                  <input
                    id="billingAddress.stateRegion"
                    name="billingAddress.stateRegion"
                    value={form.billingAddress.stateRegion}
                    onChange={handleChange}
                    placeholder="Enter state or region"
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="billingAddress.zipPostalCode">ZIP/Postal Code</label>
                  <input
                    id="billingAddress.zipPostalCode"
                    name="billingAddress.zipPostalCode"
                    value={form.billingAddress.zipPostalCode}
                    onChange={handleChange}
                    placeholder="Enter ZIP code"
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="billingAddress.country">Country</label>
                  <select
                    id="billingAddress.country"
                    name="billingAddress.country"
                    value={form.billingAddress.country}
                    onChange={handleChange}
                  >
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

              {/* ==== SHIPPING ADDRESS ==== */}
              <div className="form-section-title">Shipping Address</div>

              <div className="form-row">
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="shippingAddress.sameAsBilling"
                      checked={form.shippingAddress.sameAsBilling}
                      onChange={handleChange}
                    />
                    Same as billing address
                  </label>
                </div>
              </div>

              {!form.shippingAddress.sameAsBilling && (
                <>
                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="shippingAddress.contactPerson">Contact Person</label>
                      <input
                        id="shippingAddress.contactPerson"
                        name="shippingAddress.contactPerson"
                        value={form.shippingAddress.contactPerson}
                        onChange={handleChange}
                        placeholder="Enter contact person"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippingAddress.phone">Phone</label>
                      <input
                        id="shippingAddress.phone"
                        name="shippingAddress.phone"
                        value={form.shippingAddress.phone}
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
                        value={form.shippingAddress.address}
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
                        value={form.shippingAddress.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippingAddress.stateRegion">State/Region</label>
                      <input
                        id="shippingAddress.stateRegion"
                        name="shippingAddress.stateRegion"
                        value={form.shippingAddress.stateRegion}
                        onChange={handleChange}
                        placeholder="Enter state or region"
                      />
                    </div>
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="shippingAddress.zipPostalCode">ZIP/Postal Code</label>
                      <input
                        id="shippingAddress.zipPostalCode"
                        name="shippingAddress.zipPostalCode"
                        value={form.shippingAddress.zipPostalCode}
                        onChange={handleChange}
                        placeholder="Enter ZIP code"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="shippingAddress.country">Country</label>
                      <select
                        id="shippingAddress.country"
                        name="shippingAddress.country"
                        value={form.shippingAddress.country}
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
                </>
              )}

              {/* ==== ACTIONS ==== */}
              <div className="form-actions">
                <button type="submit" className="btn-save" disabled={saving}>
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  className="btn-cancel"
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
};

export default CustomerEdit;