import React from 'react';
import { Role } from '../types';
import { 
  Shield, User, Sparkles, Trophy, 
  PlusCircle, ChevronRight, Zap, HeartHandshake, Stethoscope
} from 'lucide-react';

export type FlowNodeId = 
  | 'AUTH' 
  | 'USER_DASHBOARD' 
  | 'GAME_AI_FEEDBACK' 
  | 'MILESTONE' 
  | 'ADMIN_CONSOLE' 
  | 'ADMIN_ADD_GAME';

interface FlowchartStepperProps {
  currentNode: FlowNodeId;
  currentRole: Role;
  onSelectNode: (node: FlowNodeId) => void;
  onOpenLogin: () => void;
  isAuthenticated: boolean;
}

export const FlowchartStepper: React.FC<FlowchartStepperProps> = ({
  currentNode,
  currentRole,
  onSelectNode,
  isAuthenticated,
}) => {
  return (
    <div className="bg-slate-900 border-b border-slate-800 text-white py-2.5 px-3 sm:px-4 text-sm select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
        
        {/* Flow Indicator Label */}
        <div className="flex items-center space-x-2 shrink-0">
          <div className="w-6 h-6 rounded-md bg-blue-600 flex items-center justify-center text-white">
            <Zap className="w-3.5 h-3.5 text-amber-300" />
          </div>
          <span className="font-mono text-xs font-extrabold uppercase tracking-wider text-slate-300">
            Lifecycle Flow Engine:
          </span>
        </div>

        {/* User Flow or Admin Flow Nodes */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto overflow-x-auto py-0.5">
          
          {/* ROOT NODE: Login and Register */}
          <button
            onClick={() => onSelectNode('AUTH')}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
              currentNode === 'AUTH'
                ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
            }`}
            title="Authentication Root Node"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>1. Login & Register</span>
          </button>

          <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

          {currentRole === 'admin' ? (
            /* ADMIN MANAGEMENT FLOW */
            <>
              <button
                onClick={() => onSelectNode('ADMIN_CONSOLE')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'ADMIN_CONSOLE'
                    ? 'bg-teal-600 text-white border-teal-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <Shield className="w-3.5 h-3.5 text-teal-300" />
                <span>2. Admin Console</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <button
                onClick={() => onSelectNode('ADMIN_ADD_GAME')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'ADMIN_ADD_GAME'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-300" />
                <span>3. Adding Games In It</span>
              </button>
            </>
          ) : currentRole === 'family' ? (
            /* FAMILY MEMBER FLOW */
            <>
              <button
                onClick={() => onSelectNode('USER_DASHBOARD')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'USER_DASHBOARD'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <HeartHandshake className="w-3.5 h-3.5 text-indigo-300" />
                <span>2. Family Portal</span>
              </button>
            </>
          ) : currentRole === 'nurse' ? (
            /* CLINICIAN / NURSE FLOW */
            <>
              <button
                onClick={() => onSelectNode('USER_DASHBOARD')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'USER_DASHBOARD'
                    ? 'bg-emerald-600 text-white border-emerald-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <Stethoscope className="w-3.5 h-3.5 text-emerald-300" />
                <span>2. Clinical Triage</span>
              </button>
            </>
          ) : (
            /* STANDARD USER (PATIENT) FLOW */
            <>
              <button
                onClick={() => onSelectNode('USER_DASHBOARD')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'USER_DASHBOARD'
                    ? 'bg-blue-600 text-white border-blue-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <User className="w-3.5 h-3.5 text-blue-400" />
                <span>2. User Dashboard</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <button
                onClick={() => onSelectNode('GAME_AI_FEEDBACK')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'GAME_AI_FEEDBACK'
                    ? 'bg-indigo-600 text-white border-indigo-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-teal-300" />
                <span>3. AI Feedback</span>
              </button>

              <ChevronRight className="w-3.5 h-3.5 text-slate-600 shrink-0" />

              <button
                onClick={() => onSelectNode('MILESTONE')}
                className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg font-mono text-xs font-bold uppercase transition-all cursor-pointer border ${
                  currentNode === 'MILESTONE'
                    ? 'bg-amber-600 text-white border-amber-400 shadow-xs'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border-slate-700'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-300" />
                <span>4. Milestone</span>
              </button>
            </>
          )}
        </div>

        {/* Quick Access Role Status */}
        <div className="flex items-center space-x-1.5 shrink-0 font-mono text-xs">
          <span className="text-slate-400">PATH:</span>
          <span className={`px-2.5 py-0.5 rounded-full font-bold ${
            currentRole === 'admin'
              ? 'bg-teal-950 text-teal-300 border border-teal-800'
              : currentRole === 'nurse'
              ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
              : currentRole === 'family'
              ? 'bg-indigo-950 text-indigo-300 border border-indigo-800'
              : 'bg-blue-950 text-blue-300 border border-blue-800'
          }`}>
            {currentRole.toUpperCase()} PATH
          </span>
        </div>
      </div>
    </div>
  );
};
