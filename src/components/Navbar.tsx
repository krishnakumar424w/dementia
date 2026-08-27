import React from 'react';
import { Role, User, PatientProfile } from '../types';
import { Avatar } from './Avatar';
import { 
  Brain, HeartHandshake, Stethoscope, UserCircle, 
  Flame, Volume2, VolumeX, Shield, Sparkles,
  Lock, LogIn, LogOut, Key, Gamepad2, Bell, Image, Trophy,
  User as UserIcon, Settings
} from 'lucide-react';

interface NavbarProps {
  currentRole: Role;
  currentUser: User | null;
  onSelectRole: (role: Role) => void;
  activeTab: 'patient' | 'family' | 'nurse' | 'admin' | 'profile';
  onSelectTab: (tab: 'patient' | 'family' | 'nurse' | 'admin' | 'profile') => void;
  patient: PatientProfile | null;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenAICaretaker: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentRole,
  currentUser,
  onSelectRole,
  activeTab,
  onSelectTab,
  patient,
  soundEnabled,
  onToggleSound,
  onOpenAICaretaker,
  onOpenAuthModal,
  onLogout,
}) => {
  const userAvatar = currentUser?.avatarUrl || (currentRole === 'patient' ? patient?.photoUrl : undefined);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="w-full max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between h-14">
          
          {/* Brand & Platform Identity */}
          <div className="flex items-center space-x-3">
            <div 
              onClick={() => {
                if (currentRole === 'admin') onSelectTab('admin');
                else if (currentRole === 'nurse') onSelectTab('nurse');
                else if (currentRole === 'family') onSelectTab('family');
                else onSelectTab('patient');
              }}
              className="flex items-center space-x-3 cursor-pointer group select-none"
            >
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 flex items-center justify-center text-white shadow-sm shadow-blue-500/20">
                <Brain className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-xl tracking-tight text-slate-900 font-sans">
                    MIRA
                  </span>
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-full border border-blue-200">
                    AI Companion
                  </span>
                </div>
              </div>
            </div>

            {/* Streak & Percentile Badge for Patient */}
            {currentRole === 'patient' && patient && (
              <div className="hidden sm:flex items-center space-x-2 font-sans text-sm font-extrabold text-amber-950 bg-gradient-to-r from-amber-50 via-amber-100 to-amber-50 px-3.5 py-1 rounded-full border border-amber-300 shadow-2xs">
                <Flame className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
                <span className="font-mono text-amber-900">{patient.streakDays || 7}D</span>
                <span className="text-amber-400 font-bold">•</span>
                <span className="text-xs text-amber-900 uppercase tracking-tight">Streak Master</span>
              </div>
            )}
          </div>

          {/* Center Navigation - Enforcing Strict Role Isolation & Profile Link */}
          <nav className="hidden md:flex items-center space-x-1.5 bg-slate-100/90 p-1.5 rounded-xl border border-slate-200/80">
            {currentRole === 'patient' && (
              <button
                onClick={() => onSelectTab('patient')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'patient'
                    ? 'bg-white text-blue-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserCircle className="w-4 h-4 text-blue-600" />
                <span>Patient Dashboard</span>
              </button>
            )}

            {currentRole === 'family' && (
              <button
                onClick={() => onSelectTab('family')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'family'
                    ? 'bg-white text-indigo-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <HeartHandshake className="w-4 h-4 text-indigo-600" />
                <span>Family Portal</span>
              </button>
            )}

            {currentRole === 'nurse' && (
              <button
                onClick={() => onSelectTab('nurse')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'nurse'
                    ? 'bg-white text-emerald-700 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Stethoscope className="w-4 h-4 text-emerald-600" />
                <span>Clinical Triage</span>
              </button>
            )}

            {currentRole === 'admin' && (
              <button
                onClick={() => onSelectTab('admin')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'admin'
                    ? 'bg-slate-900 text-teal-300 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <Shield className="w-4 h-4 text-teal-400" />
                <span>Admin Console</span>
              </button>
            )}

            {/* Profile Section Tab for all authenticated roles */}
            {currentUser && (
              <button
                onClick={() => onSelectTab('profile')}
                className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer ${
                  activeTab === 'profile'
                    ? 'bg-white text-slate-900 shadow-xs border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                }`}
              >
                <UserIcon className="w-4 h-4 text-slate-700" />
                <span>Profile</span>
              </button>
            )}
          </nav>

          {/* Right Controls & User Profile Avatar Badge */}
          <div className="flex items-center space-x-2.5">
            
            {/* Aria AI Button */}
            <button
              onClick={onOpenAICaretaker}
              className="flex items-center space-x-2 px-3.5 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-sm font-bold shadow-xs transition-all cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span className="hidden sm:inline">AI Caretaker</span>
              <span className="sm:hidden">Aria</span>
            </button>

            {/* Sound Toggle */}
            <button
              onClick={onToggleSound}
              title={soundEnabled ? 'Mute Sounds' : 'Enable Sounds'}
              className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {soundEnabled ? <Volume2 className="w-4 h-4 text-blue-600" /> : <VolumeX className="w-4 h-4 text-slate-400" />}
            </button>

            {/* Authenticated User Pill & Avatar with Clickable Profile Link */}
            {currentUser ? (
              <div className="flex items-center space-x-2 bg-slate-50 border border-slate-200 rounded-xl pl-1.5 pr-1.5 py-1">
                {/* Clickable Profile Avatar */}
                <button
                  type="button"
                  onClick={() => onSelectTab('profile')}
                  className="flex items-center space-x-2 text-left cursor-pointer group"
                  title="View / Edit Profile"
                >
                  <Avatar 
                    src={userAvatar} 
                    alt={currentUser.fullName} 
                    size="sm" 
                    rounded="xl" 
                    className="group-hover:ring-2 group-hover:ring-blue-500/50 transition-all"
                  />

                  <div className="flex flex-col text-left hidden sm:block">
                    <div className="flex items-center space-x-1.5">
                      <span className="text-[11px] font-bold text-slate-900 truncate max-w-[110px] group-hover:text-blue-600 transition-colors">
                        {currentUser.fullName}
                      </span>
                      <span className={`text-[9px] font-mono font-extrabold uppercase px-1.5 py-0.5 rounded-md ${
                        currentRole === 'admin'
                          ? 'bg-slate-900 text-teal-300'
                          : currentRole === 'nurse'
                          ? 'bg-emerald-100 text-emerald-800'
                          : currentRole === 'family'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {currentRole}
                      </span>
                    </div>

                    {currentRole === 'patient' && (
                      <div className="flex items-center space-x-1 mt-0.5">
                        <span className="inline-flex items-center space-x-1 text-[9px] font-extrabold text-amber-900 bg-amber-100/90 border border-amber-300 px-1.5 py-0.2 rounded-md tracking-tight">
                          <Trophy className="w-2.5 h-2.5 text-amber-600 shrink-0" />
                          <span>Top 1% Streak Master</span>
                        </span>
                      </div>
                    )}
                  </div>
                </button>

                {/* Profile icon button */}
                <button
                  onClick={() => onSelectTab('profile')}
                  title="Profile & Settings"
                  className={`p-1.5 rounded-lg text-slate-600 hover:text-slate-900 transition-colors cursor-pointer ${
                    activeTab === 'profile' ? 'bg-blue-100 text-blue-700' : 'hover:bg-slate-200'
                  }`}
                >
                  <UserIcon className="w-3.5 h-3.5" />
                </button>

                {/* Logout Button */}
                <button
                  onClick={onLogout}
                  title="Sign Out"
                  className="p-1.5 bg-slate-200 hover:bg-rose-100 hover:text-rose-700 text-slate-700 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuthModal}
                className="px-3.5 py-1.5 bg-[#0284C7] hover:bg-[#0369A1] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center space-x-1.5 cursor-pointer shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Sign In</span>
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
};
