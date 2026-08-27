import React from 'react';
import { Role } from '../types';
import { ShieldAlert, Lock, ArrowRight, Stethoscope, Shield, RefreshCw } from 'lucide-react';

interface AccessDeniedViewProps {
  requiredRoles: Role[];
  currentRole: Role;
  viewName: string;
  onSwitchRole: (targetRole: Role) => void;
  onOpenLogin: () => void;
  onReturnToHome: () => void;
}

export const AccessDeniedView: React.FC<AccessDeniedViewProps> = ({
  requiredRoles,
  currentRole,
  viewName,
  onSwitchRole,
  onOpenLogin,
  onReturnToHome,
}) => {
  return (
    <div className="w-full max-w-3xl mx-auto my-8 p-6 sm:p-8 bg-white border-2 border-slate-900 rounded-xs shadow-md">
      {/* High Density Banner */}
      <div className="flex items-start space-x-4 border-b border-slate-200 pb-5">
        <div className="w-12 h-12 rounded-xs bg-rose-100 border border-rose-300 text-rose-700 flex items-center justify-center shrink-0">
          <ShieldAlert className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono font-extrabold uppercase tracking-wider text-rose-700 bg-rose-50 px-2 py-0.5 rounded-xs border border-rose-200">
              HTTP 403 // Access Denied
            </span>
            <span className="text-[10px] font-mono text-slate-500">
              RBAC Policy Enforcement
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-extrabold uppercase tracking-tight text-slate-900 mt-1">
            Unauthorized Access: {viewName}
          </h2>
          <p className="text-xs text-slate-600 mt-1 leading-relaxed">
            Your current authenticated role (<strong className="font-mono text-slate-900 uppercase font-bold">{currentRole}</strong>) lacks clearance for clinical telemetry and nurse observation queues. This view is restricted under medical privacy and HIPAA security guidelines.
          </p>
        </div>
      </div>

      {/* Permission Comparison Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
        <div className="p-4 bg-slate-50 border border-slate-200 rounded-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono mb-1">
            Current Authenticated Role
          </div>
          <div className="flex items-center space-x-2 text-sm font-bold text-slate-800 uppercase">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>{currentRole}</span>
          </div>
          <div className="text-[11px] text-slate-500 mt-1 font-mono">
            Clearance Level: {currentRole === 'patient' ? 'L1 - Companion' : currentRole === 'family' ? 'L2 - Family Caregiver' : 'L3'}
          </div>
        </div>

        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xs">
          <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 font-mono mb-1">
            Required Role(s) for Access
          </div>
          <div className="flex items-center space-x-2 text-sm font-bold text-emerald-950 uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
            <span>{requiredRoles.join(' or ').toUpperCase()}</span>
          </div>
          <div className="text-[11px] text-emerald-700 mt-1 font-mono">
            Clearance Level: L3 (Nurse / Clinician) or L4 (Admin)
          </div>
        </div>
      </div>

      {/* Recommended Action Buttons */}
      <div className="space-y-3 pt-2">
        <div className="text-[11px] font-bold uppercase tracking-wider text-slate-700 font-mono">
          Resolve Authorization:
        </div>

        <div className="flex flex-wrap gap-2.5">
          {requiredRoles.includes('nurse') && (
            <button
              onClick={() => onSwitchRole('nurse')}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Stethoscope className="w-3.5 h-3.5" />
              <span>Switch to Nurse Credentials (Sarah, RN)</span>
            </button>
          )}

          {requiredRoles.includes('admin') && (
            <button
              onClick={() => onSwitchRole('admin')}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer shadow-xs"
            >
              <Shield className="w-3.5 h-3.5 text-teal-400" />
              <span>Switch to Admin Credentials (Krishna)</span>
            </button>
          )}

          <button
            onClick={onOpenLogin}
            className="px-4 py-2 bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 rounded-xs text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer"
          >
            <Lock className="w-3.5 h-3.5 text-blue-600" />
            <span>Login with Another Account</span>
          </button>

          <button
            onClick={onReturnToHome}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xs text-xs font-bold uppercase tracking-wider transition-all flex items-center space-x-2 cursor-pointer ml-auto"
          >
            <span>Return to Home</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
