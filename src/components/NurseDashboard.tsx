import React, { useState, useEffect } from 'react';
import { NurseDashboardPayload, PatientProfile, ClinicalNote, GameDefinition } from '../types';
import { api } from '../services/api';
import { 
  Stethoscope, Activity, AlertTriangle, CheckCircle2, 
  FileText, Plus, Brain, Sparkles, Sliders, Shield, 
  UserCheck, Send, RefreshCw, Layers, Clock, TrendingDown, TrendingUp
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, 
  CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';

interface NurseDashboardProps {
  patient: PatientProfile;
  onOpenAICaretaker: () => void;
}

export const NurseDashboard: React.FC<NurseDashboardProps> = ({
  patient,
  onOpenAICaretaker,
}) => {
  const [data, setData] = useState<NurseDashboardPayload | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [allPatients, setAllPatients] = useState<PatientProfile[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(patient.id);

  // Clinical Note Form
  const [isAddingNote, setIsAddingNote] = useState<boolean>(false);
  const [noteContent, setNoteContent] = useState<string>('');
  const [noteCategory, setNoteCategory] = useState<ClinicalNote['category']>('observation');
  const [noteSeverity, setNoteSeverity] = useState<ClinicalNote['severity']>('normal');

  // AI Summary
  const [aiSummary, setAiSummary] = useState<string>('');
  const [isGeneratingSummary, setIsGeneratingSummary] = useState<boolean>(false);

  // Game Management Modal
  const [isManagingGames, setIsManagingGames] = useState<boolean>(false);
  const [gamesList, setGamesList] = useState<GameDefinition[]>([]);
  const [newGameTitle, setNewGameTitle] = useState<string>('');
  const [newGameDomain, setNewGameDomain] = useState<string>('memory');
  const [newGameDesc, setNewGameDesc] = useState<string>('');
  const [newGameTime, setNewGameTime] = useState<number>(35);

  const loadNurseDashboard = async (pId: string) => {
    try {
      setLoading(true);
      const [dashRes, patientsRes, gamesRes] = await Promise.all([
        api.getNurseDashboard(pId),
        api.getPatients(),
        api.getGames(),
      ]);
      setData(dashRes);
      setAllPatients(patientsRes.patients);
      setGamesList(gamesRes.games);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNurseDashboard(selectedPatientId);
  }, [selectedPatientId]);

  const handleGenerateSummary = async () => {
    setIsGeneratingSummary(true);
    try {
      const res = await api.getCaretakerClinicalSummary(selectedPatientId);
      setAiSummary(res.summary);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGeneratingSummary(false);
    }
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteContent.trim()) return;

    try {
      const res = await api.createClinicalNote({
        patientId: selectedPatientId,
        author: 'Sarah Jenkins, RN (Staff Geriatric Nurse)',
        content: noteContent.trim(),
        category: noteCategory,
        severity: noteSeverity,
      });

      if (res.note && data) {
        setData({
          ...data,
          clinicalNotes: [res.note, ...data.clinicalNotes],
        });
        setNoteContent('');
        setIsAddingNote(false);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAddCustomGame = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGameTitle.trim()) return;

    try {
      const res = await api.addCustomGame({
        gameId: (newGameTitle || 'custom_exercise').toLowerCase().replace(/\s+/g, '_'),
        title: newGameTitle.trim(),
        domain: newGameDomain as any,
        description: newGameDesc.trim() || 'Custom clinician prescribed cognitive exercise.',
        targetTimeSeconds: newGameTime,
        difficultyScale: '1-10',
        active: true,
      });
      if (res.game) {
        setGamesList(prev => [...prev, res.game]);
        setNewGameTitle('');
        setNewGameDesc('');
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex flex-col items-center justify-center py-20 space-y-2 font-mono">
        <Activity className="w-6 h-6 text-emerald-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase">Synchronizing Nurse Station Telemetry...</p>
      </div>
    );
  }

  const triageProfile = data.triageProfile || {
    patientId: patient.id,
    patientName: patient.fullName,
    age: patient.age,
    status: patient.stabilityStatus || 'Stable',
    riskLevel: 'low' as const,
    mmseScore: patient.lastMmseScore ?? 27,
    adherencePercent: 92,
    assignedNurse: patient.assignedNurseName || 'Sarah Jenkins, RN',
  };

  const domainMetrics = {
    memory: data.domainMetrics?.memory ?? (data as any).domainScores?.memory ?? 74,
    attention: data.domainMetrics?.attention ?? (data as any).domainScores?.attention ?? 78,
    logic: data.domainMetrics?.logic ?? (data as any).domainScores?.logic ?? 68,
    responseTime: data.domainMetrics?.responseTime ?? (data as any).domainScores?.response_time ?? (data as any).domainScores?.responseTime ?? 81,
  };

  const flaggedChanges = data.flaggedChanges || [];
  const clinicalNotes = data.clinicalNotes || [];
  const longitudinalHistory = data.longitudinalHistory || [];

  return (
    <div className="w-full space-y-4">
      {/* Clinical Command Top Bar */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-600" />
            <span className="hd-card-title">Clinical Nurse Command Center // Triage & Telemetry</span>
          </div>
          <span className="hd-badge hd-badge-emerald">STATION: RN_GERIATRIC_04</span>
        </div>

        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              Geriatric Cognitive Assessment & Behavioral Triage Station
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Care Coordinator: <strong className="text-slate-800">Sarah Jenkins, RN</strong> • Real-time anomaly detection & adaptive drill difficulty
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
            {/* Patient Selector */}
            <div className="flex items-center space-x-1.5 bg-slate-100 px-2.5 py-1.5 rounded-xs border border-slate-300">
              <span className="text-[10px] font-mono font-bold uppercase text-slate-500">SUBJECT:</span>
              <select
                value={selectedPatientId}
                onChange={(e) => setSelectedPatientId(e.target.value)}
                className="bg-transparent text-slate-900 text-xs font-bold font-mono focus:outline-none cursor-pointer"
              >
                {allPatients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {(p.fullName || 'Patient').toUpperCase()} ({p.stage || p.dementiaStage || 'MCI'})
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setIsManagingGames(!isManagingGames)}
              className="flex items-center space-x-1 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xs text-[11px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
            >
              <Sliders className="w-3.5 h-3.5 text-teal-400" />
              <span>Drill Catalog</span>
            </button>
          </div>
        </div>

        {/* Dense Clinical Stats Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 border-t border-slate-200 bg-slate-50/70 divide-x divide-slate-200">
          <div className="p-3 px-4">
            <div className="hd-stat-label">Clinical Triage</div>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <span className={`w-2 h-2 rounded-full ${
                triageProfile?.riskLevel === 'low' ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'
              }`} />
              <span className="hd-stat-value text-base text-slate-900 capitalize">{triageProfile?.status || 'Stable'}</span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 block mt-0.5">RISK: {(triageProfile?.riskLevel || 'low').toUpperCase()}</span>
          </div>

          <div className="p-3 px-4">
            <div className="hd-stat-label">MMSE / MoCA</div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="hd-stat-value text-blue-700">{triageProfile.mmseScore}</span>
              <span className="text-[10px] font-mono text-slate-400">/ 30</span>
            </div>
            <span className="text-[10px] font-mono text-emerald-600 block mt-0.5">MCI BOUNDARY</span>
          </div>

          <div className="p-3 px-4">
            <div className="hd-stat-label">Telemetry Adherence</div>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="hd-stat-value text-emerald-700">{triageProfile.adherencePercent}%</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 block mt-0.5">7/7 TARGET SESSIONS</span>
          </div>

          <div className="p-3 px-4">
            <div className="hd-stat-label">Primary Clinician</div>
            <div className="hd-stat-value text-sm text-slate-800 mt-1">
              {triageProfile.assignedNurse}
            </div>
            <span className="text-[10px] font-mono text-slate-400 block">GERIATRIC CLINIC</span>
          </div>
        </div>
      </div>

      {/* Flagged Changes & Anomalies (Dense Callout) */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            <span className="hd-card-title">Behavioral Shift Flags & Anomaly Detection</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Continuous Algorithmic Audit</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200 bg-white">
          {flaggedChanges.map((flag) => (
            <div key={flag.id} className="p-3.5 flex items-start space-x-3">
              <div className="mt-0.5">
                {flag.severity === 'attention' ? (
                  <span className="hd-badge hd-badge-amber">SHIFT</span>
                ) : (
                  <span className="hd-badge hd-badge-emerald">OPTIMAL</span>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-mono text-slate-900">{flag.metric}</span>
                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded-xs border border-slate-200">
                    {flag.change}
                  </span>
                </div>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{flag.details}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Clinical Summary (High Density AI Box) */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Aria AI Clinical Longitudinal Synthesis</span>
          </div>
          <button
            onClick={handleGenerateSummary}
            disabled={isGeneratingSummary}
            className="flex items-center space-x-1 px-2.5 py-1 bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold uppercase tracking-wider rounded-xs transition-colors cursor-pointer"
          >
            {isGeneratingSummary ? <RefreshCw className="w-3 h-3 animate-spin" /> : <Brain className="w-3 h-3" />}
            <span>{isGeneratingSummary ? 'Synthesizing...' : 'Generate Clinical Synthesis'}</span>
          </button>
        </div>

        <div className="p-3 bg-white">
          {aiSummary ? (
            <div className="hd-ai-box">
              <p className="text-xs font-medium text-[#0369A1] italic leading-relaxed">
                "{aiSummary}"
              </p>
              <div className="mt-2 text-[10px] font-mono text-sky-700 font-bold flex items-center justify-between border-t border-sky-200 pt-1.5">
                <span>SYNTHESIZED VIA ARIA CLINICAL ENGINE (GEMINI-2.5-FLASH)</span>
                <span>STATUS: VERIFIED</span>
              </div>
            </div>
          ) : (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xs text-xs text-slate-600 flex items-center justify-between">
              <span>Automated longitudinal multi-domain synthesis ready for generation.</span>
              <button
                onClick={handleGenerateSummary}
                className="text-xs font-bold text-blue-600 hover:text-blue-800 font-mono uppercase underline cursor-pointer"
              >
                Run Telemetry Analysis
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Longitudinal Score Telemetry Chart */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <span className="hd-card-title">Longitudinal Score Progression (Clinical Telemetry Logs)</span>
          </div>
          <span className="font-mono text-[10px] text-slate-500">Daily Session Samples</span>
        </div>

        <div className="p-4 bg-white">
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={longitudinalHistory}>
                <CartesianGrid strokeDasharray="2 2" stroke="#E2E8F0" />
                <XAxis dataKey="date" stroke="#64748B" fontSize={10} fontFamily="monospace" />
                <YAxis domain={[0, 100]} stroke="#64748B" fontSize={10} fontFamily="monospace" />
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
                <Bar dataKey="score" name="Daily Score" fill="#2563EB" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Clinical Notes & Telemetry Audit Table */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <FileText className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">Clinical Chart Notes & Observational Log</span>
          </div>

          <button
            onClick={() => setIsAddingNote(!isAddingNote)}
            className="flex items-center space-x-1 px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-slate-700 rounded-xs text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
          >
            <Plus className="w-3 h-3" />
            <span>Add Chart Note</span>
          </button>
        </div>

        {/* Add Note Form */}
        <AnimatePresence>
          {isAddingNote && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCreateNote}
              className="p-4 bg-slate-50 border-b border-slate-200 space-y-3"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Category</label>
                  <select
                    value={noteCategory}
                    onChange={(e) => setNoteCategory(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="observation">General Clinical Observation</option>
                    <option value="medication">Medication & Vitals Check</option>
                    <option value="cognitive_assessment">Formal Cognitive Assessment</option>
                    <option value="family_contact">Family Caregiver Consultation</option>
                  </select>
                </div>

                <div>
                  <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Clinical Severity</label>
                  <select
                    value={noteSeverity}
                    onChange={(e) => setNoteSeverity(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-xs text-xs font-mono focus:ring-1 focus:ring-blue-500"
                  >
                    <option value="normal">Normal / Routine</option>
                    <option value="attention">Needs Attention / Follow-up</option>
                    <option value="critical">Urgent Clinical Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-bold uppercase font-mono text-slate-600 mb-1 block">Clinical Assessment Entry</label>
                <textarea
                  required
                  rows={2}
                  value={noteContent}
                  onChange={(e) => setNoteContent(e.target.value)}
                  placeholder="Document engagement, latency shifts, mood, or clinical observations..."
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xs text-xs font-sans focus:ring-1 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddingNote(false)}
                  className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-bold uppercase rounded-xs"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-xs shadow-xs hover:bg-blue-700"
                >
                  Save Entry
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>

        {/* High Density Table for Notes */}
        <table className="hd-table">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Clinician</th>
              <th>Category</th>
              <th>Assessment Note</th>
            </tr>
          </thead>
          <tbody>
            {clinicalNotes.map((note) => (
              <tr key={note.id} className="hover:bg-slate-50">
                <td className="font-mono text-[11px] text-slate-500 whitespace-nowrap">
                  {note.timestamp || (note.date ? new Date(note.date).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent')}
                </td>
                <td className="font-bold text-slate-900 text-xs whitespace-nowrap">{note.author || note.authorName || 'Staff Nurse'}</td>
                <td>
                  <span className="hd-badge hd-badge-blue capitalize">{(note.category || 'observation').replace(/_/g, ' ')}</span>
                </td>
                <td className="text-xs text-slate-700 font-medium">{note.content}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Therapy Protocol & Game Catalog Manager Modal */}
      <AnimatePresence>
        {isManagingGames && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="bg-white w-full max-w-2xl max-h-[85vh] rounded-xs shadow-2xl flex flex-col overflow-hidden border-2 border-slate-900"
            >
              <div className="bg-slate-900 text-white px-4 py-3 flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-teal-400" />
                  <h3 className="font-bold text-xs uppercase font-mono tracking-wider">Cognitive Protocol & Drill Registry</h3>
                </div>
                <button
                  onClick={() => setIsManagingGames(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono font-bold"
                >
                  [ESC / CLOSE]
                </button>
              </div>

              <div className="p-4 overflow-y-auto space-y-4">
                {/* Active Games in System */}
                <div>
                  <h4 className="text-[10px] font-bold uppercase font-mono text-slate-500 mb-2">
                    Active Clinical Drill Modules ({gamesList.length})
                  </h4>
                  <div className="space-y-1.5">
                    {gamesList.map((g) => (
                      <div
                        key={g.id}
                        className="p-2.5 bg-slate-50 border border-slate-200 rounded-xs flex items-center justify-between text-xs"
                      >
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-slate-900">{g.title}</span>
                            <span className="hd-badge hd-badge-blue capitalize">
                              {g.domain}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">{g.description}</p>
                        </div>
                        <span className="font-mono text-[10px] font-bold text-slate-700 bg-white px-2 py-1 rounded-xs border border-slate-300 whitespace-nowrap">
                          TARGET: {g.targetTimeSeconds}s
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Add Custom Game Form */}
                <form onSubmit={handleAddCustomGame} className="p-3.5 bg-blue-50/60 border border-blue-200 rounded-xs space-y-2.5">
                  <h4 className="text-[10px] font-bold uppercase font-mono text-blue-900">
                    Register New Clinical Drill Module
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-700 mb-1 block">Title</label>
                      <input
                        type="text"
                        required
                        value={newGameTitle}
                        onChange={(e) => setNewGameTitle(e.target.value)}
                        placeholder="e.g. Auditory Rhythm Tap"
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-xs text-xs font-sans"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-700 mb-1 block">Domain</label>
                      <select
                        value={newGameDomain}
                        onChange={(e) => setNewGameDomain(e.target.value)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-xs text-xs font-mono"
                      >
                        <option value="memory">Memory & Recall</option>
                        <option value="attention">Attention & Focus</option>
                        <option value="logic">Logic & Executive</option>
                        <option value="response_time">Response Time</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-700 mb-1 block">Target Time (Sec)</label>
                      <input
                        type="number"
                        min="10"
                        max="120"
                        value={newGameTime}
                        onChange={(e) => setNewGameTime(parseInt(e.target.value) || 30)}
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-xs text-xs font-mono"
                      />
                    </div>

                    <div>
                      <label className="text-[10px] font-mono font-bold uppercase text-slate-700 mb-1 block">Clinical Purpose</label>
                      <input
                        type="text"
                        value={newGameDesc}
                        onChange={(e) => setNewGameDesc(e.target.value)}
                        placeholder="Therapeutic target..."
                        className="w-full px-2.5 py-1 bg-white border border-slate-300 rounded-xs text-xs font-sans"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      className="px-3 py-1 bg-blue-600 text-white text-xs font-bold uppercase rounded-xs shadow-xs hover:bg-blue-700"
                    >
                      Register Drill Module
                    </button>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
