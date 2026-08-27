import React, { useState } from 'react';
import { 
  Terminal, Server, Database, Brain, Sparkles, 
  Layers, Code, ShieldCheck, Cpu, ArrowRight, Check 
} from 'lucide-react';

export const ArchitectureVisualizer: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'architecture' | 'algorithms' | 'contracts' | 'schemas'>('architecture');

  return (
    <div className="w-full space-y-4">
      {/* High Density Header */}
      <div className="hd-card shadow-2xs">
        <div className="hd-card-header">
          <div className="flex items-center space-x-2">
            <Terminal className="w-3.5 h-3.5 text-blue-600" />
            <span className="hd-card-title">System Architecture & Technical Contracts Specification</span>
          </div>
          <span className="hd-badge hd-badge-blue">SPEC v2.4</span>
        </div>

        <div className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white">
          <div>
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              24-Hour Production Architecture & Algorithm Topology
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Client layer, Express REST telemetry engine, Gemini AI Caretaker, MongoDB Schemas, & Section 4 algorithms
            </p>
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xs border border-slate-300">
            <button
              onClick={() => setActiveTab('architecture')}
              className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'architecture' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Topology
            </button>
            <button
              onClick={() => setActiveTab('algorithms')}
              className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'algorithms' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Formulas
            </button>
            <button
              onClick={() => setActiveTab('contracts')}
              className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'contracts' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Contracts
            </button>
            <button
              onClick={() => setActiveTab('schemas')}
              className={`px-2.5 py-1 rounded-xs text-[10px] font-mono font-bold uppercase transition-all cursor-pointer ${
                activeTab === 'schemas' ? 'bg-slate-900 text-white' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Schemas
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: System Topology */}
      {activeTab === 'architecture' && (
        <div className="hd-card shadow-2xs p-4 bg-white space-y-4">
          <div className="hd-card-title flex items-center space-x-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Interactive Component Interactions & Layer Boundaries</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
            {/* Client Layer */}
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-2">
              <div className="flex items-center space-x-1.5 text-blue-700 font-bold uppercase tracking-wider text-[10px]">
                <Cpu className="w-3.5 h-3.5" />
                <span>1. Client Presentation</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Flutter Mobile / Web Engine</li>
                <li>• React Caregiver & Nurse Portals</li>
                <li>• Web Audio API Sound Synthesizer</li>
                <li>• Web Speech API (TTS & Speech-to-Text)</li>
                <li>• Dynamic GameRegistry & Factory</li>
              </ul>
            </div>

            {/* Application Layer */}
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-2">
              <div className="flex items-center space-x-1.5 text-emerald-700 font-bold uppercase tracking-wider text-[10px]">
                <Server className="w-3.5 h-3.5" />
                <span>2. Node / Express REST API</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• POST /api/results (Contract 1)</li>
                <li>• POST /api/caretaker/interact (Contract 2)</li>
                <li>• GET /api/dashboard/family (Contract 3)</li>
                <li>• GET /api/dashboard/nurse (Contract 4)</li>
                <li>• Adaptive Difficulty Engine (1-10)</li>
              </ul>
            </div>

            {/* Storage & Intelligence */}
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-2">
              <div className="flex items-center space-x-1.5 text-indigo-700 font-bold uppercase tracking-wider text-[10px]">
                <Brain className="w-3.5 h-3.5" />
                <span>3. Intelligence & Persistence</span>
              </div>
              <ul className="space-y-1 text-slate-600 text-[11px]">
                <li>• Gemini 2.5 Flash Caretaker Companion</li>
                <li>• MongoDB Document Collections</li>
                <li>• Cloudinary Asset Delivery</li>
                <li>• Longitudinal Metric Aggregator</li>
                <li>• Rule-based Safety Fallbacks</li>
              </ul>
            </div>
          </div>

          <div className="bg-slate-900 p-4 rounded-xs border border-slate-800 font-mono text-xs text-slate-300 overflow-x-auto">
            <pre className="text-teal-300 leading-relaxed">
{`┌────────────────────────────────────────────────────────┐
│                      CLIENT LAYER                      │
│   • Patient Games (Memory, Sequence, Concentration...) │
│   • Family Portal & Nurse Clinical Command             │
└───────────────────────────┬────────────────────────────┘
                            │ REST JSON over HTTP
┌───────────────────────────▼────────────────────────────┐
│                  EXPRESS API GATEWAY                   │
│   • Section 4 Cognitive Scoring & Adaptive Engine      │
│   • JWT Authentication & Role-Based Access (RBAC)      │
└─────────────┬────────────────────────────┬─────────────┘
              │                            │
┌─────────────▼──────────┐      ┌──────────▼─────────────┐
│    GEMINI FLASH AI     │      │   MONGODB PERSISTENCE  │
│  Empathetic Caretaker  │      │  Users, Results, Notes │
└────────────────────────┘      └────────────────────────┘`}
            </pre>
          </div>
        </div>
      )}

      {/* Tab 2: Formulas & Logic */}
      {activeTab === 'algorithms' && (
        <div className="hd-card shadow-2xs p-4 bg-white space-y-4">
          <div className="hd-card-title flex items-center space-x-1.5">
            <Brain className="w-3.5 h-3.5 text-blue-600" />
            <span>Section 4: Core Mathematical & Adaptive Difficulty Algorithms</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            {/* Difficulty adjustment */}
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-1.5">
              <div className="text-blue-700 font-bold uppercase text-[10px]">
                Algorithm A: calculateNextDifficulty(currentDifficulty, accuracy, completionTime, targetTime)
              </div>
              <p className="text-slate-600 text-[11px]">
                Scale: 1 to 10. Automatically increases on high accuracy and speed, drops on low accuracy to prevent patient frustration.
              </p>
              <pre className="p-3 bg-slate-900 rounded-xs text-teal-200 overflow-x-auto text-[11px]">
{`if (accuracy >= 0.85 && completionTime <= targetTime * 0.9) {
  return Math.min(10, currentDifficulty + 1); // Level Up
}
if (accuracy < 0.60 || completionTime > targetTime * 1.4) {
  return Math.max(1, currentDifficulty - 1);  // Gentle Down-scale
}
return currentDifficulty; // Maintain`}
              </pre>
            </div>

            {/* Cognitive score */}
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-1.5">
              <div className="text-indigo-700 font-bold uppercase text-[10px]">
                Algorithm B: Cognitive Score Calculation & Weighting
              </div>
              <pre className="p-3 bg-slate-900 rounded-xs text-indigo-200 overflow-x-auto text-[11px]">
{`timeScore = Math.max(0, 100 - (completionTime / targetTime) * 20);
domainScore = 0.7 * (accuracy * 100) + 0.3 * timeScore;

compositeScore = (memory * 0.35) + (attention * 0.25) + (logic * 0.20) + (responseTime * 0.20);`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: API Contracts */}
      {activeTab === 'contracts' && (
        <div className="hd-card shadow-2xs p-4 bg-white space-y-4">
          <div className="hd-card-title flex items-center space-x-1.5">
            <Code className="w-3.5 h-3.5 text-blue-600" />
            <span>Section 5: Strict API Contract Payloads</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-1.5">
              <div className="text-blue-700 font-bold text-[10px] uppercase">Contract 1: POST /api/results</div>
              <pre className="p-3 bg-slate-900 rounded-xs text-slate-200 text-[10px] overflow-x-auto">
{`{
  "sessionId": "sess_12345",
  "patientId": "pat_001",
  "gameId": "memory_training",
  "domain": "memory",
  "difficultyLevel": 3,
  "score": 88,
  "accuracy": 0.90,
  "completionTimeSeconds": 28.4,
  "mistakes": 1,
  "metrics": {
    "totalPairs": 4,
    "cardsMatched": 4
  }
}`}
              </pre>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-1.5">
              <div className="text-emerald-700 font-bold text-[10px] uppercase">Contract 2: POST /api/caretaker/interact</div>
              <pre className="p-3 bg-slate-900 rounded-xs text-slate-200 text-[10px] overflow-x-auto">
{`{
  "message": "Good morning Arthur! Let's do a short memory game.",
  "observation": "Memory domain stable at 82/100.",
  "recommendedAction": "Suggest Level 3 Memory Cards.",
  "recommendedGame": "memory_training",
  "difficulty": 3,
  "priority": "normal"
}`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: MongoDB Schemas */}
      {activeTab === 'schemas' && (
        <div className="hd-card shadow-2xs p-4 bg-white space-y-4">
          <div className="hd-card-title flex items-center space-x-1.5">
            <Database className="w-3.5 h-3.5 text-blue-600" />
            <span>Section 3: Database & Document Schemas</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-xs">
            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-1.5">
              <div className="text-amber-800 font-bold text-[10px] uppercase">PatientProfile Schema</div>
              <pre className="p-3 bg-slate-900 rounded-xs text-amber-200 text-[10px] overflow-x-auto">
{`{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  age: 78,
  stage: "Mild Cognitive Impairment",
  baselineScore: 75,
  currentDifficulty: {
    memory_training: 3,
    touch_sequence: 3,
    concentration: 3
  },
  streakDays: 7
}`}
              </pre>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-xs border border-slate-300 space-y-1.5">
              <div className="text-purple-800 font-bold text-[10px] uppercase">GameResult Schema</div>
              <pre className="p-3 bg-slate-900 rounded-xs text-purple-200 text-[10px] overflow-x-auto">
{`{
  _id: ObjectId,
  sessionId: String,
  patientId: ObjectId,
  gameId: String,
  domain: "memory" | "attention" | "logic" | "response_time",
  score: Number,
  accuracy: Number,
  completionTimeSeconds: Number,
  mistakes: Number,
  metrics: Object
}`}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
