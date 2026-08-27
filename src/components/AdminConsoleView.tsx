import React, { useState, useEffect } from 'react';
import { User, AuditLogItem, SystemTelemetry, Role } from '../types';
import { api } from '../services/api';
import { Avatar } from './Avatar';
import { AdminGameManager } from './AdminGameManager';
import { 
  Shield, Cpu, Server, Activity, Users, Lock, Key, 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Terminal, Eye,
  ShieldCheck, FileText, Database, Radio, PlusCircle, Brain
} from 'lucide-react';

interface AdminConsoleViewProps {
  currentUser: User;
  onSwitchUser?: (targetRole: Role) => void;
  initialTab?: 'telemetry' | 'audit' | 'users' | 'games';
  onTestLaunchGame?: (gameId: string) => void;
}

export const AdminConsoleView: React.FC<AdminConsoleViewProps> = ({
  currentUser,
  onSwitchUser,
  initialTab = 'telemetry',
  onTestLaunchGame,
}) => {
  const [telemetry, setTelemetry] = useState<SystemTelemetry & { roleBreakdown: Record<string, number> } | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterRole, setFilterRole] = useState<string>('ALL');
  const [activeTab, setActiveTab] = useState<'telemetry' | 'audit' | 'users' | 'games'>(initialTab);

  const fetchAdminData = async () => {
    try {
      setLoading(true);
      const [telemetryRes, auditRes, usersRes] = await Promise.all([
        api.getTelemetry(),
        api.getAuditLogs(),
        api.getUsers(),
      ]);
      setTelemetry(telemetryRes);
      setAuditLogs(auditRes.auditLogs || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin console data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const filteredLogs = filterRole === 'ALL'
    ? auditLogs
    : auditLogs.filter(log => log.userRole === filterRole.toLowerCase() || (log.status === filterRole));

  return (
    <div className="space-y-4">
      {/* High Density Header Bar */}
      <div className="p-5 bg-slate-900 text-white rounded-xl border-2 border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-xl bg-slate-800 text-teal-400 flex items-center justify-center border border-slate-700">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2.5">
              <h1 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tight text-white">
                Admin System Console & Audit Telemetry
              </h1>
              <span className="font-mono text-xs font-bold text-teal-300 bg-teal-950 px-2.5 py-0.5 rounded-full border border-teal-800">
                L4 MASTER ACCESS
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 mt-1 font-mono">
              Authenticated Administrator: {currentUser.fullName} ({currentUser.email})
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setActiveTab('games')}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-mono font-bold rounded-xl flex items-center space-x-2 cursor-pointer shadow-xs"
          >
            <PlusCircle className="w-4 h-4 text-amber-300" />
            <span>ADD / MANAGE GAMES</span>
          </button>

          <button
            onClick={fetchAdminData}
            disabled={loading}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-mono rounded-xl border border-slate-700 flex items-center space-x-2 cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>REFRESH TELEMETRY</span>
          </button>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('telemetry')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'telemetry'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <Activity className="w-3.5 h-3.5 text-teal-400" />
          <span>System Telemetry & Health</span>
        </button>

        <button
          onClick={() => setActiveTab('games')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'games'
              ? 'bg-blue-700 text-white shadow-2xs'
              : 'bg-white text-blue-700 hover:bg-blue-50 border border-blue-300'
          }`}
        >
          <Brain className="w-3.5 h-3.5 text-amber-300" />
          <span>Add & Manage Games (Flow Node)</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Security Audit Logs ({auditLogs.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('users')}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xs text-[11px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
            activeTab === 'users'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-300'
          }`}
        >
          <Users className="w-3.5 h-3.5 text-blue-400" />
          <span>User Directory & RBAC Matrix ({users.length})</span>
        </button>
      </div>

      {/* TAB 1: SYSTEM TELEMETRY */}
      {activeTab === 'telemetry' && telemetry && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-3 bg-white border border-slate-300 rounded-xs shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                System Status
              </div>
              <div className="flex items-center space-x-1.5 mt-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-sm font-mono font-extrabold text-emerald-700 uppercase">
                  {telemetry.dbStatus}
                </span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                Uptime: {Math.floor(telemetry.uptimeSeconds / 60)}m {telemetry.uptimeSeconds % 60}s
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-300 rounded-xs shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                JWT Auth Subsystem
              </div>
              <div className="flex items-center space-x-1 mt-1 text-slate-900 font-mono font-bold text-xs">
                <Key className="w-3.5 h-3.5 text-blue-600" />
                <span>HMAC-SHA256 (HS256)</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-1">
                RBAC Enforcement: ACTIVE
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-300 rounded-xs shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Registered Users
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                {telemetry.activeUsersCount} <span className="text-xs text-slate-500 font-normal">Accounts</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Patients: {telemetry.roleBreakdown?.patient || 0} | Staff: {(telemetry.roleBreakdown?.nurse || 0) + (telemetry.roleBreakdown?.admin || 0)}
              </div>
            </div>

            <div className="p-3 bg-white border border-slate-300 rounded-xs shadow-2xs">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
                Clinical Game Results
              </div>
              <div className="text-lg font-mono font-extrabold text-slate-900 mt-0.5">
                {telemetry.totalGameResultsCount} <span className="text-xs text-slate-500 font-normal">Telemetry Pkts</span>
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                Target SLA: &lt; 50ms latency
              </div>
            </div>
          </div>

          {/* RBAC Architecture Breakdown */}
          <div className="p-4 bg-white border border-slate-300 rounded-xs shadow-2xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3 flex items-center space-x-1.5">
              <Lock className="w-4 h-4 text-blue-600" />
              <span>Role-Based Access Control (RBAC) Hierarchy & Permissions</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead>
                  <tr className="bg-slate-100 border-b border-slate-300 text-[10px] font-bold uppercase text-slate-700">
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">Clearance Level</th>
                    <th className="p-2.5">Allowed Modules</th>
                    <th className="p-2.5">Restrictions</th>
                    <th className="p-2.5">Default Seed Account</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-slate-900"></span>
                      <span>ADMIN</span>
                    </td>
                    <td className="p-2.5 text-slate-700">L4 (Master Access)</td>
                    <td className="p-2.5 text-emerald-700 font-bold">ALL VIEWS: Patient OS, Family, Nurse, Admin Console</td>
                    <td className="p-2.5 text-slate-500">None (Full System Authority)</td>
                    <td className="p-2.5 text-slate-800">admin@neurocare.org</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-emerald-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                      <span>NURSE</span>
                    </td>
                    <td className="p-2.5 text-slate-700">L3 (Clinical Staff)</td>
                    <td className="p-2.5 text-slate-800">Clinical Triage, Observation Logs, Notes, Patient OS</td>
                    <td className="p-2.5 text-slate-500">No Admin Telemetry configuration</td>
                    <td className="p-2.5 text-slate-800">nurse.sarah@hospital.org</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-indigo-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                      <span>FAMILY</span>
                    </td>
                    <td className="p-2.5 text-slate-700">L2 (Caregiver)</td>
                    <td className="p-2.5 text-slate-800">Family Dashboard, Trend Reports, Schedule, Photo Memories</td>
                    <td className="p-2.5 text-rose-600 font-bold">Blocked from Nurse Clinical Triage</td>
                    <td className="p-2.5 text-slate-800">family.daughter@gmail.com</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-blue-900 flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                      <span>PATIENT</span>
                    </td>
                    <td className="p-2.5 text-slate-700">L1 (Companion)</td>
                    <td className="p-2.5 text-slate-800">Cognitive Drills, Reminders, Photo Album, AI Caretaker Aria</td>
                    <td className="p-2.5 text-rose-600 font-bold">Blocked from Nurse Clinical Triage</td>
                    <td className="p-2.5 text-slate-800">patient.arthur@gmail.com</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-[11px] font-bold uppercase text-slate-600 font-mono">Filter Status / Role:</span>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="px-2 py-1 bg-white border border-slate-300 text-xs font-mono rounded-xs focus:ring-1 focus:ring-blue-500 outline-none cursor-pointer"
              >
                <option value="ALL">ALL LOGS ({auditLogs.length})</option>
                <option value="SUCCESS">SUCCESS ONLY</option>
                <option value="DENIED">DENIED ONLY</option>
                <option value="ADMIN">ADMIN ACTIONS</option>
                <option value="NURSE">NURSE ACTIONS</option>
              </select>
            </div>

            <div className="text-[10px] text-slate-500 font-mono">
              Displaying {filteredLogs.length} audit event records
            </div>
          </div>

          <div className="bg-white border border-slate-300 rounded-xs shadow-2xs overflow-hidden">
            <div className="overflow-x-auto max-h-[500px]">
              <table className="w-full text-left border-collapse text-xs font-mono">
                <thead className="sticky top-0 bg-slate-900 text-white text-[10px] uppercase tracking-wider">
                  <tr>
                    <th className="p-2.5">Timestamp</th>
                    <th className="p-2.5">Status</th>
                    <th className="p-2.5">Action Event</th>
                    <th className="p-2.5">User Identity</th>
                    <th className="p-2.5">Role</th>
                    <th className="p-2.5">IP Origin</th>
                    <th className="p-2.5">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50">
                      <td className="p-2.5 whitespace-nowrap text-[11px] text-slate-500">
                        {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td className="p-2.5">
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded-xs text-[9px] font-bold uppercase ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : log.status === 'DENIED'
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-2.5 font-bold text-slate-900 whitespace-nowrap">
                        {log.action}
                      </td>
                      <td className="p-2.5 text-slate-700 whitespace-nowrap">
                        {log.userEmail || 'ANONYMOUS'}
                      </td>
                      <td className="p-2.5 uppercase font-bold text-slate-800">
                        {log.userRole || '-'}
                      </td>
                      <td className="p-2.5 text-slate-500 text-[10px]">
                        {log.ipAddress || '127.0.0.1'}
                      </td>
                      <td className="p-2.5 text-slate-600 text-[11px] max-w-xs truncate" title={log.details}>
                        {log.details}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: USERS DIRECTORY */}
      {activeTab === 'users' && (
        <div className="bg-white border border-slate-300 rounded-xs shadow-2xs overflow-hidden">
          <div className="p-3 bg-slate-100 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-800 font-mono">
              System Registered Accounts ({users.length})
            </span>
            <span className="text-[10px] text-slate-500 font-mono">
              Passwords securely hashed with bcrypt (salt rounds: 10)
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs font-mono">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold uppercase text-slate-600">
                  <th className="p-2.5">User</th>
                  <th className="p-2.5">Email</th>
                  <th className="p-2.5">Role</th>
                  <th className="p-2.5">Phone</th>
                  <th className="p-2.5">Created</th>
                  <th className="p-2.5 text-right">Quick Switch</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50">
                    <td className="p-2.5 font-bold text-slate-900 flex items-center space-x-2">
                      <Avatar
                        src={user.avatarUrl}
                        alt={user.fullName}
                        size="xs"
                        rounded="full"
                      />
                      <span>{user.fullName}</span>
                    </td>
                    <td className="p-2.5 text-slate-700">{user.email}</td>
                    <td className="p-2.5">
                      <span className={`px-1.5 py-0.5 rounded-xs text-[10px] font-bold uppercase ${
                        user.role === 'admin'
                          ? 'bg-slate-900 text-teal-300'
                          : user.role === 'nurse'
                          ? 'bg-emerald-100 text-emerald-800'
                          : user.role === 'family'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-2.5 text-slate-500">{user.phoneNumber || '-'}</td>
                    <td className="p-2.5 text-slate-400 text-[10px]">
                      {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Initial Seed'}
                    </td>
                    <td className="p-2.5 text-right">
                      {onSwitchUser && (
                        <button
                          onClick={() => onSwitchUser(user.role)}
                          className="px-2 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-[10px] font-bold uppercase rounded-xs border border-slate-300 cursor-pointer"
                        >
                          Switch Role
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: ADD & MANAGE GAMES (FLOW NODE) */}
      {activeTab === 'games' && (
        <AdminGameManager
          onTestLaunchGame={onTestLaunchGame}
          onReturnToAdminConsole={() => setActiveTab('telemetry')}
        />
      )}
    </div>
  );
};
