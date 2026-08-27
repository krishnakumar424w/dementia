import React, { useState, useRef } from 'react';
import { User, Role, PatientProfile, DementiaStage } from '../types';
import { api } from '../services/api';
import { Avatar } from './Avatar';
import { 
  User as UserIcon, Camera, Trash2, Save, X, Edit3, 
  Mail, Phone, MapPin, Hash, Building, HeartHandshake, 
  Stethoscope, Shield, Brain, Calendar, AlertCircle, CheckCircle2,
  Lock, KeyRound, Award, Activity
} from 'lucide-react';

interface ProfileViewProps {
  currentUser: User;
  currentRole: Role;
  patient: PatientProfile | null;
  onUpdateUser: (updatedUser: User) => void;
  onUpdatePatient?: (updatedPatient: PatientProfile) => void;
  onBackToDashboard: () => void;
}

export const ProfileView: React.FC<ProfileViewProps> = ({
  currentUser,
  currentRole,
  patient,
  onUpdateUser,
  onUpdatePatient,
  onBackToDashboard,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Editable Profile fields
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [phoneNumber, setPhoneNumber] = useState(currentUser.phoneNumber || '');
  const [address, setAddress] = useState(currentUser.address || '');
  const [pincode, setPincode] = useState(currentUser.pincode || '');
  const [avatarUrl, setAvatarUrl] = useState(currentUser.avatarUrl || '');

  // Patient Specific fields
  const [age, setAge] = useState<number | string>(patient?.age || 74);
  const [disease, setDisease] = useState<string>(patient?.disease || patient?.dementiaStage || 'Mild Cognitive Impairment');
  const [clinicalId, setClinicalId] = useState(currentUser.clinicId || patient?.clinicalId || 'CLN-4402');
  const [familyId, setFamilyId] = useState(currentUser.familyId || patient?.familyId || 'FAM-8821');
  const [emergencyContact, setEmergencyContact] = useState(patient?.emergencyContact || '');

  // Clinical specific
  const [clinicName, setClinicName] = useState(currentUser.clinicName || 'St. Jude Cognitive Neurology Clinic');

  // Family specific
  const [familyName, setFamilyName] = useState(currentUser.familyName || 'Pendelton Family');

  // File input ref for photo upload
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size should be less than 2MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setAvatarUrl(result);
      setSuccessMsg('Profile photo selected. Click "Save Changes" to apply.');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read image file.');
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    setAvatarUrl('');
    setSuccessMsg('Profile photo removed. Click "Save Changes" to apply.');
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full name is required.');
      return;
    }

    try {
      setSaving(true);
      const payload: any = {
        id: currentUser.id,
        email: currentUser.email,
        fullName: fullName.trim(),
        phoneNumber: phoneNumber.trim(),
        address: address.trim(),
        pincode: pincode.trim(),
        avatarUrl: avatarUrl,
      };

      if (currentUser.role === 'nurse') {
        payload.clinicName = clinicName.trim();
        payload.clinicId = clinicalId.toUpperCase().trim();
      } else if (currentUser.role === 'family') {
        payload.familyName = familyName.trim();
        payload.familyId = familyId.toUpperCase().trim();
      } else if (currentUser.role === 'patient') {
        payload.clinicalId = clinicalId.toUpperCase().trim();
        payload.familyId = familyId.toUpperCase().trim();
        payload.age = Number(age);
        payload.disease = disease;
        payload.dementiaStage = disease;
        payload.emergencyContact = emergencyContact.trim();
      }

      const res = await api.updateProfile(payload);
      onUpdateUser(res.user);

      if (currentUser.role === 'patient' && patient && onUpdatePatient) {
        onUpdatePatient({
          ...patient,
          fullName: res.user.fullName,
          phoneNumber: res.user.phoneNumber,
          address: res.user.address,
          pincode: res.user.pincode,
          photoUrl: res.user.avatarUrl,
          age: Number(age),
          disease: disease,
          dementiaStage: disease as DementiaStage,
          clinicalId: clinicalId.toUpperCase().trim(),
          familyId: familyId.toUpperCase().trim(),
          emergencyContact: emergencyContact.trim(),
        });
      }

      setSuccessMsg('Profile details successfully updated!');
      setIsEditing(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save profile changes.');
    } finally {
      setSaving(false);
    }
  };

  const getRoleBadge = (role: Role) => {
    switch (role) {
      case 'admin':
        return {
          label: 'SYSTEM ADMINISTRATOR',
          bg: 'bg-slate-900 text-teal-300 border-teal-800',
          icon: <Shield className="w-3.5 h-3.5 text-teal-400" />,
        };
      case 'nurse':
        return {
          label: 'CLINICAL SPECIALIST',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          icon: <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'family':
        return {
          label: 'FAMILY CAREGIVER',
          bg: 'bg-indigo-100 text-indigo-800 border-indigo-300',
          icon: <HeartHandshake className="w-3.5 h-3.5 text-indigo-600" />,
        };
      default:
        return {
          label: 'COGNITIVE CARE PATIENT',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          icon: <Brain className="w-3.5 h-3.5 text-blue-600" />,
        };
    }
  };

  const badge = getRoleBadge(currentUser.role);

  return (
    <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 py-6 sm:py-8 select-none">
      
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-sm mb-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-50 to-transparent rounded-bl-full pointer-events-none -z-0" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          
          {/* Avatar and Basic Info */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-4 sm:space-y-0 sm:space-x-5">
            
            {/* Avatar with Upload Control */}
            <div className="relative group">
              <Avatar 
                src={avatarUrl} 
                alt={currentUser.fullName} 
                size="xl" 
                rounded="2xl" 
                className="border-2 border-white shadow-md"
              />

              {/* Upload Overlay Button */}
              {isEditing && (
                <div className="absolute inset-0 bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="p-1.5 bg-white text-slate-900 rounded-lg hover:bg-slate-100 text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                    title="Upload Photo"
                  >
                    <Camera className="w-3.5 h-3.5 text-blue-600" />
                    <span>Upload</span>
                  </button>

                  {avatarUrl && (
                    <button
                      type="button"
                      onClick={handleRemovePhoto}
                      className="p-1.5 bg-rose-600 text-white rounded-lg hover:bg-rose-700 text-xs font-bold transition-all shadow-xs flex items-center space-x-1 cursor-pointer"
                      title="Remove Photo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  )}
                </div>
              )}

              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleImageUpload} 
                accept="image/*" 
                className="hidden" 
              />
            </div>

            {/* Title & Role Metadata */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  {currentUser.fullName}
                </h1>
                <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-extrabold uppercase border ${badge.bg}`}>
                  {badge.icon}
                  <span>{badge.label}</span>
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 font-medium">
                <span className="flex items-center space-x-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{currentUser.email}</span>
                </span>
                {currentUser.phoneNumber && (
                  <span className="flex items-center space-x-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentUser.phoneNumber}</span>
                  </span>
                )}
                {currentUser.address && (
                  <span className="flex items-center space-x-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    <span>{currentUser.address}</span>
                  </span>
                )}
              </div>
            </div>

          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            {!isEditing ? (
              <button
                type="button"
                onClick={() => setIsEditing(true)}
                className="w-full md:w-auto px-4 py-2.5 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Profile</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setErrorMsg(null);
                  setFullName(currentUser.fullName || '');
                  setPhoneNumber(currentUser.phoneNumber || '');
                  setAddress(currentUser.address || '');
                  setPincode(currentUser.pincode || '');
                  setAvatarUrl(currentUser.avatarUrl || '');
                }}
                className="w-full md:w-auto px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer border border-slate-200"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            )}

            <button
              type="button"
              onClick={onBackToDashboard}
              className="w-full md:w-auto px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center space-x-1.5 cursor-pointer"
            >
              <span>Back to Portal</span>
            </button>
          </div>

        </div>

      </div>

      {/* Notifications */}
      {errorMsg && (
        <div className="mb-6 p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start space-x-3 text-rose-900 text-xs sm:text-sm animate-in fade-in">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
          <div className="font-semibold">{errorMsg}</div>
        </div>
      )}

      {successMsg && (
        <div className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start space-x-3 text-emerald-900 text-xs sm:text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="font-bold">{successMsg}</div>
        </div>
      )}

      {/* Profile Details Form */}
      <form onSubmit={handleSaveProfile} className="space-y-6">
        
        {/* Section 1: Core Personal & Contact Details */}
        <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
          <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-5">
            <UserIcon className="w-4 h-4 text-blue-600" />
            <h2 className="text-base font-bold text-slate-900">Personal & Account Information</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name / Title *
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Arthur Pendelton"
                className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all font-medium"
              />
            </div>

            {/* Email Address (Read-Only Identity) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address (Primary Identity)
              </label>
              <div className="relative">
                <input
                  type="email"
                  disabled
                  value={currentUser.email}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-500 font-mono cursor-not-allowed"
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-mono uppercase bg-slate-200 text-slate-600 px-1.5 py-0.5 rounded">
                  Locked
                </span>
              </div>
            </div>

            {/* Phone Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                disabled={!isEditing}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Pincode */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Postal / Pincode
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="600041"
                className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>

            {/* Residential / Clinic Address */}
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Residential / Facility Address
              </label>
              <input
                type="text"
                disabled={!isEditing}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="42 Elmwood Grove, Greenfield Suburb"
                className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Role-Specific Medical & Linkage Metadata */}
        {currentUser.role === 'patient' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-5">
              <Brain className="w-4 h-4 text-blue-600" />
              <h2 className="text-base font-bold text-slate-900">Cognitive & Caregiver Linkages</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {/* Age */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Age (Years)
                </label>
                <input
                  type="number"
                  disabled={!isEditing}
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              {/* Disease / Condition */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Cognitive Condition / Stage
                </label>
                <select
                  disabled={!isEditing}
                  value={disease}
                  onChange={(e) => setDisease(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                >
                  <option value="Normal / Mild Age Forgetfulness">Normal / Mild Age Forgetfulness</option>
                  <option value="Mild Cognitive Impairment">Mild Cognitive Impairment (MCI)</option>
                  <option value="Early Stage Dementia">Early Stage Dementia</option>
                  <option value="Moderate Dementia">Moderate Dementia</option>
                </select>
              </div>

              {/* Clinical ID Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Clinical ID Link
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={clinicalId}
                  onChange={(e) => setClinicalId(e.target.value)}
                  placeholder="CLN-4402"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all uppercase font-mono font-bold"
                />
              </div>

              {/* Family ID Link */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Linked Family Group ID
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  placeholder="FAM-8821"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all uppercase font-mono font-bold"
                />
              </div>

              {/* Emergency Contact */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Emergency Caregiver Contact
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={emergencyContact}
                  onChange={(e) => setEmergencyContact(e.target.value)}
                  placeholder="+919876543212 (Eleanor - Daughter)"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'nurse' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-5">
              <Stethoscope className="w-4 h-4 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">Clinic & Practice Assignment</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clinic / Hospital Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={clinicName}
                  onChange={(e) => setClinicName(e.target.value)}
                  placeholder="St. Jude Cognitive Neurology Clinic"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Clinic ID
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={clinicalId}
                  onChange={(e) => setClinicalId(e.target.value)}
                  placeholder="CLN-4402"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all uppercase font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {currentUser.role === 'family' && (
          <div className="bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center space-x-2 border-b border-slate-100 pb-3 mb-5">
              <HeartHandshake className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Family Group Details</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Family Group Name
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={familyName}
                  onChange={(e) => setFamilyName(e.target.value)}
                  placeholder="Pendelton Family"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Assigned Family ID
                </label>
                <input
                  type="text"
                  disabled={!isEditing}
                  value={familyId}
                  onChange={(e) => setFamilyId(e.target.value)}
                  placeholder="FAM-8821"
                  className="w-full px-3.5 py-2.5 bg-slate-50 disabled:bg-slate-50/50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-600 transition-all uppercase font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {/* Save Changes Floating Bar when in edit mode */}
        {isEditing && (
          <div className="sticky bottom-6 z-30 bg-slate-900 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between animate-in slide-in-from-bottom-3">
            <div className="flex items-center space-x-2 text-xs text-slate-300">
              <Activity className="w-4 h-4 text-teal-400" />
              <span>You have unsaved changes in your profile.</span>
            </div>

            <div className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold shadow-md shadow-blue-600/30 transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{saving ? 'Saving Profile...' : 'Save Changes'}</span>
              </button>
            </div>
          </div>
        )}

      </form>

    </div>
  );
};
