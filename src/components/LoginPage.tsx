import React, { useState } from 'react';
import { User, Role, DementiaStage } from '../types';
import { api } from '../services/api';
import { 
  Activity, Lock, Mail, Stethoscope, HeartHandshake, User as UserIcon, 
  CheckCircle2, ArrowRight, Eye, EyeOff, Phone, Shield, Brain, 
  MapPin, Hash, Building, X, Calendar, AlertTriangle
} from 'lucide-react';

interface LoginPageProps {
  onLoginSuccess: (user: User, token: string) => void;
  onCancel?: () => void;
  initialMode?: 'login' | 'register';
  isModal?: boolean;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onLoginSuccess,
  onCancel,
  initialMode = 'login',
  isModal = false,
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [selectedLoginRole, setSelectedLoginRole] = useState<Role>('patient');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);

  // Registration role (admin cannot be registered publicly)
  const [regRole, setRegRole] = useState<'patient' | 'nurse' | 'family'>('patient');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Patient Registration fields
  const [patientFullName, setPatientFullName] = useState('');
  const [patientAge, setPatientAge] = useState<number | ''>(74);
  const [patientDisease, setPatientDisease] = useState<string>('Mild Cognitive Impairment');
  const [patientClinicalId, setPatientClinicalId] = useState('CLN-4402');
  const [patientFamilyId, setPatientFamilyId] = useState('FAM-8821');
  const [patientPhone, setPatientPhone] = useState('');
  const [patientEmail, setPatientEmail] = useState('');
  const [patientPassword, setPatientPassword] = useState('');
  const [patientAddress, setPatientAddress] = useState('');

  // Clinical/Nurse Registration fields
  const [clinicalFullName, setClinicalFullName] = useState('');
  const [clinicalClinicName, setClinicalClinicName] = useState('');
  const [clinicalClinicId, setClinicalClinicId] = useState('');
  const [clinicalAddress, setClinicalAddress] = useState('');
  const [clinicalPincode, setClinicalPincode] = useState('');
  const [clinicalEmail, setClinicalEmail] = useState('');
  const [clinicalPassword, setClinicalPassword] = useState('');

  // Family Registration fields
  const [familyName, setFamilyName] = useState('');
  const [familyId, setFamilyId] = useState('');
  const [familyAddress, setFamilyAddress] = useState('');
  const [familyPincode, setFamilyPincode] = useState('');
  const [familyEmail, setFamilyEmail] = useState('');
  const [familyPassword, setFamilyPassword] = useState('');

  // Status
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Handle Sign In role tab selection
  const handleSelectLoginRole = (role: Role) => {
    setSelectedLoginRole(role);
    setErrorMsg(null);
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.trim()) {
      setErrorMsg('Please enter your email address.');
      return;
    }

    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      setLoading(true);
      const res = await api.login({ email: loginEmail.trim(), password: loginPassword });
      setSuccessMsg(`Welcome back, ${res.user.fullName}! Navigating to ${res.user.role.toUpperCase()} view...`);
      setTimeout(() => {
        onLoginSuccess(res.user, res.token);
      }, 350);
    } catch (err: any) {
      setErrorMsg(err.message || 'Invalid credentials. Please verify your email and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    let payload: any = {};

    if (regRole === 'patient') {
      if (!patientFullName.trim() || !patientEmail.trim() || !patientPassword) {
        setErrorMsg('Please provide Full Name, Email Address, and Password.');
        return;
      }
      payload = {
        role: 'patient',
        fullName: patientFullName.trim(),
        age: Number(patientAge) || 72,
        patientAge: Number(patientAge) || 72,
        disease: patientDisease,
        dementiaStage: patientDisease as DementiaStage,
        clinicalId: (patientClinicalId || 'CLN-4402').toUpperCase().trim(),
        familyId: (patientFamilyId || 'FAM-8821').toUpperCase().trim(),
        phoneNumber: patientPhone.trim(),
        email: patientEmail.trim(),
        password: patientPassword,
        address: patientAddress.trim(),
      };
    } else if (regRole === 'nurse') {
      if (!clinicalFullName.trim() || !clinicalClinicName.trim() || !clinicalClinicId.trim() || !clinicalEmail.trim() || !clinicalPassword) {
        setErrorMsg('Please fill in Full Name/Title, Clinic Name, Clinic ID, Email, and Password.');
        return;
      }
      payload = {
        role: 'nurse',
        fullName: clinicalFullName.trim(),
        clinicName: clinicalClinicName.trim(),
        clinicalId: clinicalClinicId.toUpperCase().trim(),
        clinicId: clinicalClinicId.toUpperCase().trim(),
        address: clinicalAddress.trim(),
        pincode: clinicalPincode.trim(),
        email: clinicalEmail.trim(),
        password: clinicalPassword,
      };
    } else if (regRole === 'family') {
      if (!familyName.trim() || !familyId.trim() || !familyEmail.trim() || !familyPassword) {
        setErrorMsg('Please fill in Family Name, Family ID, Email, and Password.');
        return;
      }
      payload = {
        role: 'family',
        fullName: familyName.trim(),
        familyName: familyName.trim(),
        familyId: familyId.toUpperCase().trim(),
        address: familyAddress.trim(),
        pincode: familyPincode.trim(),
        email: familyEmail.trim(),
        password: familyPassword,
      };
    }

    try {
      setLoading(true);
      const res = await api.register(payload);
      setSuccessMsg(`Registration successful for ${res.user.fullName}! Entering ${res.user.role.toUpperCase()} dashboard...`);
      setTimeout(() => {
        onLoginSuccess(res.user, res.token);
      }, 400);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check the information provided.');
    } finally {
      setLoading(false);
    }
  };

  const containerClasses = isModal
    ? 'fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 overflow-y-auto'
    : 'min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none py-10';

  return (
    <div id="mira-auth-root" className={containerClasses}>
      
      {/* Centered Top Branding Header (MIRA Design Aligned) */}
      <div className="w-full max-w-[500px] flex flex-col items-center text-center mb-6">
        {/* Blue Rounded Icon Badge with Pulse Glyphs */}
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 transition-transform hover:scale-105 duration-200">
          <Activity className="w-7 h-7 stroke-[2.5]" />
        </div>

        {/* Stylized Title: MIRA */}
        <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-slate-900 mt-3 font-sans">
          MIRA
        </h1>
      </div>

      {/* Floating White Authentication Card */}
      <div className="w-full max-w-[500px] bg-white border border-slate-200/90 shadow-xl shadow-slate-200/70 rounded-3xl p-5 sm:p-7 relative transition-all">
        
        {onCancel && isModal && (
          <button
            onClick={onCancel}
            className="absolute top-5 right-5 text-slate-400 hover:text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Card Mode Toggle: Sign In / Register Tabs */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </h2>
          </div>

          <div className="flex bg-slate-100 p-1 rounded-xl text-sm font-bold">
            <button
              type="button"
              onClick={() => { setMode('login'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'login' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setErrorMsg(null); setSuccessMsg(null); }}
              className={`px-4 py-2 rounded-lg transition-all cursor-pointer ${
                mode === 'register' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Register
            </button>
          </div>
        </div>

        {/* Status Messages */}
        {errorMsg && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start space-x-2.5 text-rose-900 text-sm animate-in fade-in">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start space-x-2.5 text-emerald-900 text-sm animate-in fade-in">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="font-bold">{successMsg}</div>
          </div>
        )}

        {/* ======================================================== */}
        {/* MODE 1: SIGN IN                                          */}
        {/* ======================================================== */}
        {mode === 'login' ? (
          <div>
            {/* Quick Role Selection Buttons */}
            <div className="mb-4">
              <label className="block text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Target Role
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {/* 1. Patient */}
                <button
                  type="button"
                  onClick={() => handleSelectLoginRole('patient')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    selectedLoginRole === 'patient'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Brain className={`w-4 h-4 ${selectedLoginRole === 'patient' ? 'text-blue-600' : 'text-slate-500'}`} />
                  <span className="text-sm tracking-tight font-bold">PATIENT</span>
                </button>

                {/* 2. Clinical */}
                <button
                  type="button"
                  onClick={() => handleSelectLoginRole('nurse')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    selectedLoginRole === 'nurse'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Stethoscope className={`w-4 h-4 ${selectedLoginRole === 'nurse' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span className="text-sm tracking-tight font-bold">CLINICAL</span>
                </button>

                {/* 3. Family */}
                <button
                  type="button"
                  onClick={() => handleSelectLoginRole('family')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    selectedLoginRole === 'family'
                      ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-950 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <HeartHandshake className={`w-4 h-4 ${selectedLoginRole === 'family' ? 'text-indigo-600' : 'text-slate-500'}`} />
                  <span className="text-sm tracking-tight font-bold">FAMILY</span>
                </button>

                {/* 4. Admin */}
                <button
                  type="button"
                  onClick={() => handleSelectLoginRole('admin')}
                  className={`py-2.5 px-3 rounded-xl border text-center transition-all cursor-pointer flex items-center justify-center space-x-2 ${
                    selectedLoginRole === 'admin'
                      ? 'bg-slate-900 border-slate-900 text-white font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 font-medium'
                  }`}
                >
                  <Shield className={`w-4 h-4 ${selectedLoginRole === 'admin' ? 'text-teal-400' : 'text-slate-500'}`} />
                  <span className="text-sm tracking-tight font-bold">ADMIN</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email input */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-5 h-5" />
                  </div>
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="email@mira.org"
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                  />
                </div>
              </div>

              {/* Password input with eye toggle */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-5 h-5" />
                  </div>
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-11 py-3 bg-white border border-slate-200 rounded-xl text-base text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    title={showLoginPassword ? 'Hide password' : 'Show password'}
                  >
                    {showLoginPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Solid Blue Action Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-base font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Signing In...</span>
                ) : (
                  <>
                    <span>Sign In →</span>
                  </>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* ======================================================== */
          /* MODE 2: ROLE-SPECIFIC REGISTRATION FORM                  */
          /* ======================================================== */
          <div>
            {/* Registration Role Selector */}
            <div className="mb-4">
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                Select Registration Role
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {/* Patient Role */}
                <button
                  type="button"
                  onClick={() => { setRegRole('patient'); setErrorMsg(null); }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                    regRole === 'patient'
                      ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500 text-blue-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Brain className="w-4 h-4 text-blue-600 mb-1" />
                  <span className="text-xs">Patient</span>
                </button>

                {/* Clinical / Nurse Role */}
                <button
                  type="button"
                  onClick={() => { setRegRole('nurse'); setErrorMsg(null); }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                    regRole === 'nurse'
                      ? 'bg-emerald-50 border-emerald-500 ring-1 ring-emerald-500 text-emerald-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <Stethoscope className="w-4 h-4 text-emerald-600 mb-1" />
                  <span className="text-xs">Clinical / Nurse</span>
                </button>

                {/* Family Role */}
                <button
                  type="button"
                  onClick={() => { setRegRole('family'); setErrorMsg(null); }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center ${
                    regRole === 'family'
                      ? 'bg-indigo-50 border-indigo-500 ring-1 ring-indigo-500 text-indigo-900 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <HeartHandshake className="w-4 h-4 text-indigo-600 mb-1" />
                  <span className="text-xs">Family</span>
                </button>
              </div>
              <p className="text-[10px] text-slate-400 mt-1.5 italic">
                * Note: Administrator accounts cannot be registered publicly.
              </p>
            </div>

            <form onSubmit={handleRegisterSubmit} className="space-y-3">
              
              {/* ---------------------------------------------------- */}
              {/* A. PATIENT REGISTRATION FIELDS                       */}
              {/* ---------------------------------------------------- */}
              {regRole === 'patient' && (
                <>
                  {/* Full Name */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={patientFullName}
                        onChange={(e) => setPatientFullName(e.target.value)}
                        placeholder="e.g. Arthur Pendelton"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Age & Condition / Disease Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Age *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="number"
                          required
                          min={40}
                          max={110}
                          value={patientAge}
                          onChange={(e) => setPatientAge(e.target.value === '' ? '' : Number(e.target.value))}
                          placeholder="74"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Disease / Condition *
                      </label>
                      <select
                        value={patientDisease}
                        onChange={(e) => setPatientDisease(e.target.value)}
                        className="w-full px-2.5 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      >
                        <option value="Mild Cognitive Impairment">Mild Cognitive Impairment</option>
                        <option value="Early Stage Dementia">Early Stage Dementia</option>
                        <option value="Normal / Mild Age Forgetfulness">Normal Forgetfulness</option>
                        <option value="Moderate Dementia">Moderate Dementia</option>
                        <option value="Vascular Dementia">Vascular Dementia</option>
                      </select>
                    </div>
                  </div>

                  {/* Clinical ID & Family ID Linkage Grid */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Clinical ID *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={patientClinicalId}
                          onChange={(e) => setPatientClinicalId(e.target.value)}
                          placeholder="e.g. CLN-4402"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Family ID *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={patientFamilyId}
                          onChange={(e) => setPatientFamilyId(e.target.value)}
                          placeholder="e.g. FAM-8821"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Phone Number */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Phone Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Phone className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="tel"
                        value={patientPhone}
                        onChange={(e) => setPatientPhone(e.target.value)}
                        placeholder="+91 98765 43211"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={patientEmail}
                        onChange={(e) => setPatientEmail(e.target.value)}
                        placeholder="patient.arthur@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={patientPassword}
                        onChange={(e) => setPatientPassword(e.target.value)}
                        placeholder="Create a secure password"
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  {/* Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <MapPin className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        value={patientAddress}
                        onChange={(e) => setPatientAddress(e.target.value)}
                        placeholder="42 Elmwood Grove, Greenfield Suburb"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600"
                      />
                    </div>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* B. CLINICAL / NURSE REGISTRATION FIELDS              */}
              {/* ---------------------------------------------------- */}
              {regRole === 'nurse' && (
                <>
                  {/* Full Name / Title */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Full Name / Title *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <UserIcon className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="text"
                        required
                        value={clinicalFullName}
                        onChange={(e) => setClinicalFullName(e.target.value)}
                        placeholder="e.g. Dr. Sarah Jenkins, RN"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Clinic Name & Clinic ID */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Clinic Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Building className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={clinicalClinicName}
                          onChange={(e) => setClinicalClinicName(e.target.value)}
                          placeholder="e.g. St. Jude Clinic"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Clinic ID *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={clinicalClinicId}
                          onChange={(e) => setClinicalClinicId(e.target.value)}
                          placeholder="e.g. CLN-4402"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address & Pincode */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={clinicalAddress}
                          onChange={(e) => setClinicalAddress(e.target.value)}
                          placeholder="Suite 400, Pavilion"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={clinicalPincode}
                        onChange={(e) => setClinicalPincode(e.target.value)}
                        placeholder="600028"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={clinicalEmail}
                        onChange={(e) => setClinicalEmail(e.target.value)}
                        placeholder="nurse.sarah@hospital.org"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={clinicalPassword}
                        onChange={(e) => setClinicalPassword(e.target.value)}
                        placeholder="Create clinical password"
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* ---------------------------------------------------- */}
              {/* C. FAMILY REGISTRATION FIELDS                        */}
              {/* ---------------------------------------------------- */}
              {regRole === 'family' && (
                <>
                  {/* Family Name & Family ID */}
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Family Name *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <HeartHandshake className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={familyName}
                          onChange={(e) => setFamilyName(e.target.value)}
                          placeholder="e.g. Pendelton Family"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Family ID *
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <Hash className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          required
                          value={familyId}
                          onChange={(e) => setFamilyId(e.target.value)}
                          placeholder="e.g. FAM-8821"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 uppercase font-mono placeholder:normal-case placeholder:font-sans focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Address & Pincode */}
                  <div className="grid grid-cols-3 gap-2.5">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                          <MapPin className="w-3.5 h-3.5" />
                        </div>
                        <input
                          type="text"
                          value={familyAddress}
                          onChange={(e) => setFamilyAddress(e.target.value)}
                          placeholder="42 Elmwood Grove"
                          className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Pincode
                      </label>
                      <input
                        type="text"
                        value={familyPincode}
                        onChange={(e) => setFamilyPincode(e.target.value)}
                        placeholder="600041"
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Email Address */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Email Address *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Mail className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type="email"
                        required
                        value={familyEmail}
                        onChange={(e) => setFamilyEmail(e.target.value)}
                        placeholder="family.daughter@gmail.com"
                        className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
                      />
                    </div>
                  </div>

                  {/* Password */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Password *
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                        <Lock className="w-3.5 h-3.5" />
                      </div>
                      <input
                        type={showRegPassword ? 'text' : 'password'}
                        required
                        value={familyPassword}
                        onChange={(e) => setFamilyPassword(e.target.value)}
                        placeholder="Create caregiver password"
                        className="w-full pl-9 pr-9 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowRegPassword(!showRegPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                      >
                        {showRegPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {/* Submit Registration Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-sm font-bold shadow-md shadow-blue-600/20 hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer mt-4"
              >
                {loading ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create {regRole.toUpperCase()} Account →</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}
      </div>

    </div>
  );
};
