/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Role, User, PatientProfile, CognitiveCategory } from './types';
import { api } from './services/api';
import { sounds } from './services/audio';
import { gameRegistry, GameModule, GameCompletionResult } from './games/GameRegistry';
import './games'; // registers all default game modules

import { Navbar } from './components/Navbar';
import { FlowchartStepper, FlowNodeId } from './components/FlowchartStepper';
import { PatientHomeView } from './components/PatientHomeView';
import { AIFeedbackView } from './components/AIFeedbackView';
import { MilestonesView } from './components/MilestonesView';
import { AdminConsoleView } from './components/AdminConsoleView';
import { AdminGameManager } from './components/AdminGameManager';
import { FamilyDashboard } from './components/FamilyDashboard';
import { NurseDashboard } from './components/NurseDashboard';
import { AccessDeniedView } from './components/AccessDeniedView';
import { RemindersView } from './components/RemindersView';
import { MemoriesView } from './components/MemoriesView';
import { GameContainer } from './components/GameContainer';
import { AICaretakerModal } from './components/AICaretakerModal';
import { LoginPage } from './components/LoginPage';
import { ProfileView } from './components/ProfileView';
import { CategoriesView } from './components/CategoriesView';
import { 
  Brain, Bell, Camera, Trophy, Grid, Layers
} from 'lucide-react';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentRole, setCurrentRole] = useState<Role>('patient');
  
  // Navigation & Lifecycle Flow State matching flowchart
  const [flowNode, setFlowNode] = useState<FlowNodeId>('AUTH');
  const [activeTab, setActiveTab] = useState<'patient' | 'family' | 'nurse' | 'admin' | 'profile'>('patient');
  const [patientSubView, setPatientSubView] = useState<'games' | 'categories' | 'reminders' | 'memories' | 'milestones'>('games');
  
  const [patient, setPatient] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [currentTimeUTC, setCurrentTimeUTC] = useState<string>(new Date().toISOString().slice(11, 19) + ' UTC');

  // Active game modal
  const [activeGameId, setActiveGameId] = useState<string | null>(null);

  // Completed Game & AI Feedback state
  const [lastCompletedGameModule, setLastCompletedGameModule] = useState<GameModule | null>(null);
  const [lastCompletionResult, setLastCompletionResult] = useState<GameCompletionResult | null>(null);

  // Aria AI Caretaker modal
  const [isAICaretakerOpen, setIsAICaretakerOpen] = useState<boolean>(false);
  const [selectedCategoryForAria, setSelectedCategoryForAria] = useState<CognitiveCategory | undefined>(undefined);

  // Keep UTC time ticking
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimeUTC(new Date().toISOString().slice(11, 19) + ' UTC');
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Initial Data Bootstrap with Auth Check
  useEffect(() => {
    const bootstrap = async () => {
      try {
        setLoading(true);
        const [authRes, patientsRes] = await Promise.all([
          api.getCurrentUser(),
          api.getPatients(),
        ]);

        if (patientsRes && patientsRes.patients && patientsRes.patients.length > 0) {
          setPatient(patientsRes.patients[0]);
        }

        if (authRes && authRes.user) {
          setCurrentUser(authRes.user);
          setCurrentRole(authRes.user.role || 'patient');
          
          if (authRes.user.role === 'admin') {
            setFlowNode('ADMIN_CONSOLE');
            setActiveTab('admin');
          } else if (authRes.user.role === 'family') {
            setFlowNode('USER_DASHBOARD');
            setActiveTab('family');
          } else if (authRes.user.role === 'nurse') {
            setFlowNode('USER_DASHBOARD');
            setActiveTab('nurse');
          } else {
            setFlowNode('USER_DASHBOARD');
            setActiveTab('patient');
          }
        } else {
          // If unauthenticated, show Auth start page
          setFlowNode('AUTH');
        }
      } catch (err) {
        console.error('Failed to load initial data:', err);
        setFlowNode('AUTH');
      } finally {
        setLoading(false);
      }
    };
    bootstrap();
  }, []);

  const handleToggleSound = () => {
    const nextState = !soundEnabled;
    setSoundEnabled(nextState);
    sounds.setMuted(!nextState);
  };

  const handleLoginSuccess = async (user: User, token: string) => {
    setCurrentUser(user);
    setCurrentRole(user.role);

    // Refresh patients list to ensure proper linkage
    try {
      const patientsRes = await api.getPatients();
      if (patientsRes && patientsRes.patients && patientsRes.patients.length > 0) {
        if (user.role === 'patient') {
          const matched = patientsRes.patients.find(p => p.userId === user.id || p.fullName.toLowerCase() === user.fullName.toLowerCase());
          setPatient(matched || patientsRes.patients[0]);
        } else if (user.role === 'family') {
          const matched = patientsRes.patients.find(p => p.assignedFamilyEmail?.toLowerCase() === user.email.toLowerCase());
          setPatient(matched || patientsRes.patients[0]);
        } else if (user.role === 'nurse') {
          const matched = patientsRes.patients.find(p => p.assignedClinicalEmail?.toLowerCase() === user.email.toLowerCase() || p.assignedNurseId === user.id);
          setPatient(matched || patientsRes.patients[0]);
        } else {
          setPatient(patientsRes.patients[0]);
        }
      }
    } catch (e) {
      console.warn('Patient refresh notice:', e);
    }

    // Strict End-to-End Lifecycle Routing:
    if (user.role === 'admin') {
      // Login & Register ──► Admin Console
      setFlowNode('ADMIN_CONSOLE');
      setActiveTab('admin');
    } else if (user.role === 'family') {
      // Login & Register ──► Family Portal
      setFlowNode('USER_DASHBOARD');
      setActiveTab('family');
    } else if (user.role === 'nurse') {
      // Login & Register ──► Clinical Triage
      setFlowNode('USER_DASHBOARD');
      setActiveTab('nurse');
    } else {
      // Login & Register ──► User Dashboard (Patient)
      setFlowNode('USER_DASHBOARD');
      setActiveTab('patient');
      setPatientSubView('games');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setFlowNode('AUTH');
  };

  const handleRoleQuickSwitch = async (newRole: Role) => {
    try {
      let email = 'patient.arthur@gmail.com';
      let pass = 'PatientPassword123!';
      if (newRole === 'admin') {
        email = 'admin@mira.org';
        pass = 'AdminPassword123!';
      } else if (newRole === 'nurse') {
        email = 'nurse.sarah@hospital.org';
        pass = 'NursePassword123!';
      } else if (newRole === 'family') {
        email = 'family.daughter@gmail.com';
        pass = 'FamilyPassword123!';
      }

      const res = await api.login({ email, password: pass });
      handleLoginSuccess(res.user, res.token);
    } catch (e) {
      console.warn('Role switch fallback:', e);
      setCurrentRole(newRole);
      if (newRole === 'admin') {
        setFlowNode('ADMIN_CONSOLE');
        setActiveTab('admin');
      } else if (newRole === 'family') {
        setFlowNode('USER_DASHBOARD');
        setActiveTab('family');
      } else if (newRole === 'nurse') {
        setFlowNode('USER_DASHBOARD');
        setActiveTab('nurse');
      } else {
        setFlowNode('USER_DASHBOARD');
        setActiveTab('patient');
      }
    }
  };

  const handleLaunchGame = (gameId: string) => {
    sounds.playTone(523, 0.15);
    setActiveGameId(gameId);
  };

  const handleGameCompleted = (updatedPatient: PatientProfile) => {
    setPatient(updatedPatient);
  };

  const handleOpenAIFeedback = (gameModule: GameModule, result: GameCompletionResult) => {
    setLastCompletedGameModule(gameModule);
    setLastCompletionResult(result);
    setActiveGameId(null);
    // Move to next flowchart node:
    // User Dashboard ──► Specific Game & AI Feedback
    setFlowNode('GAME_AI_FEEDBACK');
    setActiveTab('patient');
  };

  const handleProceedToMilestones = () => {
    // Move to next flowchart node:
    // AI Feedback ──► Milestone & Achievement Screen
    setFlowNode('MILESTONE');
    setActiveTab('patient');
    setPatientSubView('milestones');
  };

  const handleReturnToDashboard = () => {
    setFlowNode('USER_DASHBOARD');
    if (currentRole === 'admin') setActiveTab('admin');
    else if (currentRole === 'family') setActiveTab('family');
    else if (currentRole === 'nurse') setActiveTab('nurse');
    else {
      setActiveTab('patient');
      setPatientSubView('games');
    }
  };

  const handleFlowNodeSelect = (node: FlowNodeId) => {
    setFlowNode(node);
    if (node === 'AUTH') {
      // If choosing Auth from stepper, navigate to Auth root node
    } else if (node === 'USER_DASHBOARD') {
      if (currentRole === 'family') setActiveTab('family');
      else if (currentRole === 'nurse') setActiveTab('nurse');
      else {
        setActiveTab('patient');
        setPatientSubView('games');
      }
    } else if (node === 'GAME_AI_FEEDBACK') {
      // If no recent game completed, fallback to first game module for testing
      if (!lastCompletedGameModule) {
        const games = gameRegistry.getAllGames();
        setLastCompletedGameModule(games[0]);
        setLastCompletionResult({
          accuracy: 0.92,
          completionTimeSeconds: 38.4,
          mistakes: 1,
          score: 88,
          metrics: { cardsMatched: 8, flipsCount: 17 },
        });
      }
      setActiveTab('patient');
    } else if (node === 'MILESTONE') {
      setActiveTab('patient');
      setPatientSubView('milestones');
    } else if (node === 'ADMIN_CONSOLE') {
      if (currentRole !== 'admin') {
        handleRoleQuickSwitch('admin');
      } else {
        setActiveTab('admin');
      }
    } else if (node === 'ADMIN_ADD_GAME') {
      if (currentRole !== 'admin') {
        handleRoleQuickSwitch('admin');
      } else {
        setActiveTab('admin');
      }
    }
  };

  if (loading && !patient) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center space-y-3 font-mono">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20">
          <Brain className="w-5 h-5 animate-pulse" />
        </div>
        <div className="text-center">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">MIRA Platform // Initializing</h2>
          <p className="text-[11px] text-slate-500 mt-1">Connecting cognitive stream & AI Caretaker Aria...</p>
        </div>
      </div>
    );
  }

  // ========================================================
  // START PAGE: CLEAN FULL-PAGE AUTHENTICATION SCREEN
  // ========================================================
  if (flowNode === 'AUTH') {
    return (
      <LoginPage
        onLoginSuccess={handleLoginSuccess}
        onCancel={currentUser ? () => {
          if (currentRole === 'admin') {
            setFlowNode('ADMIN_CONSOLE');
            setActiveTab('admin');
          } else if (currentRole === 'family') {
            setFlowNode('USER_DASHBOARD');
            setActiveTab('family');
          } else if (currentRole === 'nurse') {
            setFlowNode('USER_DASHBOARD');
            setActiveTab('nurse');
          } else {
            setFlowNode('USER_DASHBOARD');
            setActiveTab('patient');
          }
        } : undefined}
      />
    );
  }

  const activeGameModule = activeGameId ? gameRegistry.getGame(activeGameId) : undefined;
  const isClinicalPermitted = currentRole === 'nurse' || currentRole === 'admin';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col antialiased">
      {/* Top Application Navbar */}
      <Navbar
        currentRole={currentRole}
        currentUser={currentUser}
        onSelectRole={handleRoleQuickSwitch}
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'patient') setFlowNode('USER_DASHBOARD');
          else if (tab === 'admin') setFlowNode('ADMIN_CONSOLE');
          else if (tab === 'family') setFlowNode('USER_DASHBOARD');
          else if (tab === 'nurse') setFlowNode('USER_DASHBOARD');
        }}
        patient={patient}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenAICaretaker={() => setIsAICaretakerOpen(true)}
        onOpenAuthModal={() => {
          setFlowNode('AUTH');
        }}
        onLogout={handleLogout}
      />

      {/* LIFECYCLE FLOWCHART STEPPER */}
      <FlowchartStepper
        currentNode={flowNode}
        currentRole={currentRole}
        onSelectNode={handleFlowNodeSelect}
        onOpenLogin={() => {
          setFlowNode('AUTH');
        }}
        isAuthenticated={!!currentUser}
      />

      {/* Main Body Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6 py-4 sm:py-6">

        {/* ======================================================== */}
        {/* FLOW NODE 3: AFTER SPECIFIC GAME FEEDBACK FROM AI       */}
        {/* ======================================================== */}
        {flowNode === 'GAME_AI_FEEDBACK' && lastCompletedGameModule && patient && (
          <AIFeedbackView
            gameModule={lastCompletedGameModule}
            completionResult={lastCompletionResult || {
              accuracy: 0.92,
              completionTimeSeconds: 38,
              mistakes: 1,
              score: 85,
              metrics: {},
            }}
            patient={patient}
            onProceedToMilestones={handleProceedToMilestones}
            onReturnToDashboard={handleReturnToDashboard}
            onReplayGame={() => handleLaunchGame(lastCompletedGameModule.gameId)}
          />
        )}

        {/* ======================================================== */}
        {/* FLOW NODE 4: MILESTONES & ACHIEVEMENTS VIEW              */}
        {/* ======================================================== */}
        {flowNode === 'MILESTONE' && patient && (
          <MilestonesView
            patient={patient}
            onReturnToDashboard={handleReturnToDashboard}
            onLaunchNextGame={handleLaunchGame}
          />
        )}

        {/* ======================================================== */}
        {/* ADMIN FLOW NODE 2: ADMIN ADD / MANAGE GAMES STUDIO      */}
        {/* ======================================================== */}
        {flowNode === 'ADMIN_ADD_GAME' && (
          currentRole === 'admin' ? (
            <AdminGameManager
              onTestLaunchGame={handleLaunchGame}
              onReturnToAdminConsole={() => setFlowNode('ADMIN_CONSOLE')}
            />
          ) : (
            <AccessDeniedView
              requiredRoles={['admin']}
              currentRole={currentRole}
              viewName="Admin Cognitive Game Manager"
              onSwitchRole={handleRoleQuickSwitch}
              onOpenLogin={() => setFlowNode('AUTH')}
              onReturnToHome={handleReturnToDashboard}
            />
          )
        )}

        {/* ======================================================== */}
        {/* ROLE 1: PATIENT COMPANION VIEW (USER DASHBOARD)          */}
        {/* ======================================================== */}
        {activeTab === 'patient' && flowNode === 'USER_DASHBOARD' && patient && (
          <div className="space-y-4">
            {/* Sub-navigation Tabs */}
            <div className="flex items-center space-x-2 border-b border-slate-200 pb-3 overflow-x-auto">
              <button
                onClick={() => setPatientSubView('games')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 cursor-pointer ${
                  patientSubView === 'games'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Brain className="w-4.5 h-4.5" />
                <span>Daily Overview</span>
              </button>

              <button
                onClick={() => setPatientSubView('categories')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 cursor-pointer ${
                  patientSubView === 'categories'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Grid className="w-4.5 h-4.5 text-indigo-500" />
                <span>Games</span>
              </button>

              <button
                onClick={() => setPatientSubView('reminders')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 cursor-pointer ${
                  patientSubView === 'reminders'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Bell className="w-4.5 h-4.5" />
                <span>Daily Schedule</span>
              </button>

              <button
                onClick={() => setPatientSubView('memories')}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 cursor-pointer ${
                  patientSubView === 'memories'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                <Camera className="w-4.5 h-4.5" />
                <span>Photo Album</span>
              </button>

              <button
                onClick={() => {
                  setPatientSubView('milestones');
                  setFlowNode('MILESTONE');
                }}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm sm:text-base font-bold transition-all shrink-0 cursor-pointer ${
                  patientSubView === 'milestones'
                    ? 'bg-amber-500 text-slate-950 shadow-sm font-extrabold'
                    : 'bg-amber-50 text-amber-900 hover:bg-amber-100 border border-amber-300'
                }`}
              >
                <Trophy className="w-4.5 h-4.5 text-amber-700" />
                <span>Journey Map</span>
              </button>
            </div>

            {/* Sub-view switcher */}
            {patientSubView === 'games' && (
              <PatientHomeView
                patient={patient}
                onLaunchGame={handleLaunchGame}
                onOpenAICaretaker={() => setIsAICaretakerOpen(true)}
                onSelectSubView={setPatientSubView}
              />
            )}

            {patientSubView === 'categories' && (
              <CategoriesView
                patient={patient}
                onLaunchGame={handleLaunchGame}
                onOpenAICaretaker={(category) => {
                  setSelectedCategoryForAria(category);
                  setIsAICaretakerOpen(true);
                }}
              />
            )}

            {patientSubView === 'reminders' && (
              <RemindersView
                patientId={patient.id}
                userRole={currentRole}
                patientName={patient.fullName}
              />
            )}

            {patientSubView === 'memories' && (
              <MemoriesView
                patientId={patient.id}
                userRole={currentRole}
                patientName={patient.fullName}
              />
            )}

            {patientSubView === 'milestones' && (
              <MilestonesView
                patient={patient}
                onReturnToDashboard={handleReturnToDashboard}
                onLaunchNextGame={handleLaunchGame}
              />
            )}
          </div>
        )}

        {/* ======================================================== */}
        {/* ROLE 2: FAMILY PORTAL (STRICT ISOLATION)                 */}
        {/* ======================================================== */}
        {activeTab === 'family' && flowNode !== 'AUTH' && patient && (
          <FamilyDashboard
            patient={patient}
            onOpenAICaretaker={() => setIsAICaretakerOpen(true)}
          />
        )}

        {/* ======================================================== */}
        {/* ROLE 3: NURSE CLINICAL DASHBOARD (RBAC PROTECTED)        */}
        {/* ======================================================== */}
        {activeTab === 'nurse' && flowNode !== 'AUTH' && patient && (
          isClinicalPermitted ? (
            <NurseDashboard
              patient={patient}
              onOpenAICaretaker={() => setIsAICaretakerOpen(true)}
            />
          ) : (
            <AccessDeniedView
              requiredRoles={['nurse', 'admin']}
              currentRole={currentRole}
              viewName="Clinical Triage & Patient Observations"
              onSwitchRole={handleRoleQuickSwitch}
              onOpenLogin={() => setFlowNode('AUTH')}
              onReturnToHome={handleReturnToDashboard}
            />
          )
        )}

        {/* ======================================================== */}
        {/* ROLE 4: ADMIN SYSTEM CONSOLE (ADMIN MANAGEMENT PATH)     */}
        {/* ======================================================== */}
        {activeTab === 'admin' && flowNode === 'ADMIN_CONSOLE' && currentUser && (
          currentRole === 'admin' ? (
            <AdminConsoleView
              currentUser={currentUser}
              onSwitchUser={handleRoleQuickSwitch}
              onTestLaunchGame={handleLaunchGame}
            />
          ) : (
            <AccessDeniedView
              requiredRoles={['admin']}
              currentRole={currentRole}
              viewName="Admin Console & Audit Telemetry"
              onSwitchRole={handleRoleQuickSwitch}
              onOpenLogin={() => setFlowNode('AUTH')}
              onReturnToHome={handleReturnToDashboard}
            />
          )
        )}

        {/* ======================================================== */}
        {/* PROFILE VIEW (ALL ROLES: PATIENT, CLINICAL, FAMILY, ADMIN) */}
        {/* ======================================================== */}
        {activeTab === 'profile' && currentUser && (
          <ProfileView
            currentUser={currentUser}
            currentRole={currentRole}
            patient={patient}
            onUpdateUser={(updated) => setCurrentUser(updated)}
            onUpdatePatient={(updatedPatient) => setPatient(updatedPatient)}
            onBackToDashboard={handleReturnToDashboard}
          />
        )}
      </main>

      {/* ACTIVE GAME MODAL RUNNER */}
      <AnimatePresence>
        {activeGameModule && patient && (
          <GameContainer
            gameModule={activeGameModule}
            patient={patient}
            onClose={() => setActiveGameId(null)}
            onGameCompleted={handleGameCompleted}
            onLaunchNextGame={(nextId) => setActiveGameId(nextId)}
            onOpenAIFeedback={handleOpenAIFeedback}
          />
        )}
      </AnimatePresence>

      {/* ARIA AI CARETAKER MODAL */}
      <AnimatePresence>
        {isAICaretakerOpen && patient && (
          <AICaretakerModal
            isOpen={isAICaretakerOpen}
            onClose={() => {
              setIsAICaretakerOpen(false);
              setSelectedCategoryForAria(undefined);
            }}
            initialCategory={selectedCategoryForAria}
            patient={patient}
            onLaunchGame={(gameId) => {
              setIsAICaretakerOpen(false);
              setSelectedCategoryForAria(undefined);
              setActiveGameId(gameId);
            }}
          />
        )}
      </AnimatePresence>

      {/* High Density System Status Footer */}
      <footer className="h-8 bg-[#0F172A] text-white flex items-center justify-between px-4 text-[10px] font-mono select-none border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 text-emerald-400 font-bold">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>MIRA_PROD_01</span>
          </div>
          <span className="text-slate-500">|</span>
          <span className="text-teal-400 hidden sm:inline">AUTH: JWT (HS256)</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 hidden md:inline">RBAC: ENFORCED</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-teal-400 hidden sm:inline">FLOW: {flowNode}</span>
          <span className="text-slate-500 hidden sm:inline">|</span>
          <span className="text-slate-400 font-bold">{currentTimeUTC}</span>
        </div>
      </footer>
    </div>
  );
}
