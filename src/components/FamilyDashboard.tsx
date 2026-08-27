import React, { useState, useEffect } from 'react';
import { FamilyDashboardPayload, PatientProfile } from '../types';
import { api } from '../services/api';
import { 
  HeartHandshake, TrendingUp, AlertTriangle, CheckCircle, 
  Calendar, Brain, Sparkles, Activity, ShieldCheck,
  Clock, Download, Heart, FileText, ArrowRight
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, RadarChart, PolarGrid, 
  PolarAngleAxis, PolarRadiusAxis, Radar 
} from 'recharts';

interface FamilyDashboardProps {
  patient: PatientProfile;
  onOpenAICaretaker: () => void;
}

export const FamilyDashboard: React.FC<FamilyDashboardProps> = ({
  patient,
  onOpenAICaretaker,
}) => {
  const [data, setData] = useState<FamilyDashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [timeRange, setTimeRange] = useState<'7d' | '30d'>('7d');

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        const res = await api.getFamilyDashboard(patient.id);
        setData(res);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    loadDashboard();
  }, [patient.id]);

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2 font-mono">
        <Activity className="w-6 h-6 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase">Loading Family Telemetry Stream...</p>
      </div>
    );
  }

  const patientOverview = data.patientOverview || {
    id: patient.id,
    name: patient.fullName,
    age: patient.age,
    stage: patient.stage || patient.dementiaStage || 'Mild Cognitive Impairment',
    streakDays: patient.streakDays || 7,
    compositeScore: 74,
    adherenceRate: 88,
    completedDaysCount: 7,
    stabilityStatus: patient.stabilityStatus || 'Stable',
  };

  const domainBreakdown = {
    memory: data.domainBreakdown?.memory ?? (data as any).domainScores?.memory ?? 74,
    attention: data.domainBreakdown?.attention ?? (data as any).domainScores?.attention ?? 78,
    logic: data.domainBreakdown?.logic ?? (data as any).domainScores?.logic ?? 68,
    responseTime: data.domainBreakdown?.responseTime ?? (data as any).domainScores?.response_time ?? (data as any).domainScores?.responseTime ?? 81,
  };

  const scoreTrends = data.scoreTrends || [];
  const recentObservations = data.recentObservations || [];
  const recommendations = data.recommendations || [];

  const radarData = [
    { domain: 'Memory', score: domainBreakdown.memory },
    { domain: 'Attention', score: domainBreakdown.attention },
    { domain: 'Logic', score: domainBreakdown.logic },
    { domain: 'Response', score: domainBreakdown.responseTime },
  ];

  return (
    <div className="w-full space-y-4">
      {/* High Density Header Bar */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <span className="hd-card-title">Family & Caregiver Portal // Longitudinal Analytics</span>
            <span className="hd-badge hd-badge-blue">Observer Role: Eleanor Pendelton</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500 font-bold">PID: {(patient.id || '').toUpperCase()}</span>
        </div>

        <div className="p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900">
              Cognitive Wellness & Adherence Report • {patientOverview?.name || patient.fullName} ({patientOverview?.age || patient.age}y)
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Longitudinal tracking synchronized with clinical team • Stage: <strong className="text-slate-800">{patientOverview?.stage || patient.dementiaStage}</strong>
            </p>
          </div>

          <div className="flex items-center space-x-2.5 w-full md:w-auto">
            <button
              onClick={() => {}}
              className="flex items-center space-x-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Export Summary</span>
            </button>

            <button
              onClick={onOpenAICaretaker}
              className="flex items-center space-x-2 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>Ask Aria AI</span>
            </button>
          </div>
        </div>

        {/* Dense Stat Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 bg-slate-50/70 divide-x divide-slate-200">
          <div className="p-3 px-4">
            <div className="hd-stat-label">Composite Score</div>
            <div className="flex items-baseline space-x-1.5">
              <span className="hd-stat-value text-blue-700">{patientOverview?.compositeScore ?? 84}</span>
              <span className="text-[10px] font-mono text-emerald-600 font-bold">↑ +2.4 pts</span>
            </div>
          </div>

          <div className="p-3 px-4">
            <div className="hd-stat-label">Routine Adherence</div>
            <div className="flex items-baseline space-x-1.5">
              <span className="hd-stat-value text-emerald-700">{patientOverview?.adherenceRate ?? 92}%</span>
              <span className="text-[10px] font-mono text-slate-500">({patientOverview?.completedDaysCount ?? 7}/7d)</span>
            </div>
          </div>

          <div className="p-3 px-4">
            <div className="hd-stat-label">Consecutive Streak</div>
            <div className="flex items-baseline space-x-1.5">
              <span className="hd-stat-value text-amber-600">{patientOverview?.streakDays ?? patient.streakDays ?? 7}</span>
              <span className="text-[10px] font-mono text-amber-800 font-bold">DAYS ACTIVE</span>
            </div>
          </div>

          <div className="p-3 px-4">
            <div className="hd-stat-label">Clinical Stability</div>
            <div className="hd-stat-value text-slate-800 text-sm flex items-center h-[30px]">
              {(patient.stabilityStatus || patientOverview?.stabilityStatus || 'Stable').toUpperCase()}
            </div>
          </div>
        </div>
      </div>

      {/* Main High Density Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Trend Chart (2 Cols) */}
        <div className="lg:col-span-2 hd-card shadow-2xs">
          <div className="hd-card-header">
            <div className="flex items-center space-x-2">
              <span className="hd-card-title">Longitudinal Score Trends (Composite & Domains)</span>
            </div>
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setTimeRange('7d')}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold transition-all ${
                  timeRange === '7d' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                7D
              </button>
              <button
                onClick={() => setTimeRange('30d')}
                className={`px-2 py-0.5 rounded-xs text-[10px] font-mono font-bold transition-all ${
                  timeRange === '30d' ? 'bg-slate-900 text-white' : 'bg-slate-200 text-slate-600 hover:bg-slate-300'
                }`}
              >
                30D
              </button>
            </div>
          </div>

          <div className="p-4 bg-white">
            <div className="h-60 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={scoreTrends}>
                  <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                  <XAxis dataKey="date" stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                  <YAxis domain={[50, 100]} stroke="#64748B" fontSize={10} tickLine={false} fontFamily="monospace" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '4px',
                      color: '#FFF',
                      border: '1px solid #334155',
                      fontSize: '11px',
                      fontFamily: 'monospace',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="compositeScore"
                    name="Composite Score"
                    stroke="#2563EB"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#2563EB' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="memory"
                    name="Memory"
                    stroke="#059669"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                  <Line
                    type="monotone"
                    dataKey="attention"
                    name="Attention"
                    stroke="#D97706"
                    strokeWidth={1.5}
                    strokeDasharray="3 3"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Domain Radar (1 Col) */}
        <div className="hd-card shadow-2xs">
          <div className="hd-card-header">
            <span className="hd-card-title">Cognitive Radar Profile</span>
            <span className="font-mono text-[10px] text-slate-500">4 Axes</span>
          </div>

          <div className="p-3 bg-white flex flex-col justify-between flex-1">
            <div className="h-44 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="#E2E8F0" />
                  <PolarAngleAxis dataKey="domain" stroke="#64748B" fontSize={9} fontFamily="monospace" />
                  <PolarRadiusAxis domain={[0, 100]} stroke="#CBD5E1" fontSize={8} />
                  <Radar
                    name="Level"
                    dataKey="score"
                    stroke="#2563EB"
                    fill="#3B82F6"
                    fillOpacity={0.35}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-200 text-[10px] font-mono">
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500">MEM</span>
                <span className="font-bold text-emerald-700">{domainBreakdown.memory}%</span>
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500">ATTN</span>
                <span className="font-bold text-amber-700">{domainBreakdown.attention}%</span>
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500">LOG</span>
                <span className="font-bold text-blue-700">{domainBreakdown.logic}%</span>
              </div>
              <div className="flex items-center justify-between p-1 bg-slate-50 border border-slate-200 rounded-xs">
                <span className="text-slate-500">SPD</span>
                <span className="font-bold text-indigo-700">{domainBreakdown.responseTime}%</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* High Density Observations & Action Items */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Observations */}
        <div className="hd-card shadow-2xs">
          <div className="hd-card-header">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-3.5 h-3.5 text-blue-600" />
              <span className="hd-card-title">Aria AI Longitudinal Observations</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Automated Audit</span>
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            {recentObservations.map((obs) => (
              <div key={obs.id} className="p-3 flex items-start space-x-2.5">
                <div className="mt-0.5">
                  {obs.severity === 'attention' ? (
                    <span className="hd-badge hd-badge-amber">NOTE</span>
                  ) : (
                    <span className="hd-badge hd-badge-emerald">STABLE</span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-slate-900 uppercase font-mono">{obs.domain} Domain</span>
                    <span className="text-[10px] font-mono text-slate-400">{obs.date}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{obs.note}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recommendations */}
        <div className="hd-card shadow-2xs">
          <div className="hd-card-header">
            <div className="flex items-center space-x-2">
              <Heart className="w-3.5 h-3.5 text-rose-500" />
              <span className="hd-card-title">Actionable Care Protocol Recommendations</span>
            </div>
            <span className="font-mono text-[10px] text-slate-500">Care Plan</span>
          </div>

          <div className="divide-y divide-slate-100 bg-white">
            {recommendations.map((rec) => (
              <div key={rec.id} className="p-3 flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-slate-900 uppercase font-mono">{rec.title}</span>
                    <span className={`hd-badge ${rec.priority === 'high' ? 'hd-badge-rose' : 'hd-badge-blue'}`}>
                      {rec.priority}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">{rec.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="p-2.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
            <span className="text-slate-500 font-mono text-[10px]">CARE TEAM CONTACT</span>
            <button
              onClick={() => alert('Consultation request sent to Sarah Jenkins, RN.')}
              className="text-xs font-bold text-blue-600 hover:text-blue-800 uppercase font-mono flex items-center space-x-1 cursor-pointer"
            >
              <span>Page Nurse Sarah, RN</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
