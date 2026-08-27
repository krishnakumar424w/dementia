export type Role = 'patient' | 'family' | 'nurse' | 'admin';

export type DementiaStage = 
  | 'Normal / Mild Age Forgetfulness' 
  | 'Mild Cognitive Impairment' 
  | 'Early Stage Dementia' 
  | 'Moderate Dementia';

export type CognitiveDomain = 'memory' | 'attention' | 'logic' | 'response_time';

export type CognitiveCategory = 
  | 'MEMORY_RECALL'
  | 'ATTENTION_OBSERVATION'
  | 'ASSOCIATION_RECOGNITION'
  | 'SEQUENCE_ORDERING'
  | 'DAILY_LIFE_FAMILIARITY'
  | 'VISUAL_SPATIAL';

export interface CategoryInfo {
  id: CognitiveCategory;
  name: string;
  icon: string;
  description: string;
  gameCount: number;
}

export interface User {
  id: string;
  email: string;
  role: Role;
  fullName: string;
  phoneNumber?: string;
  address?: string;
  pincode?: string;
  familyId?: string;
  clinicId?: string;
  clinicName?: string;
  familyName?: string;
  avatarUrl?: string;
  createdAt?: string;
}

export interface PatientProfile {
  id: string;
  userId: string;
  fullName: string;
  age: number;
  gender: 'male' | 'female' | 'other';
  primaryLanguage: string;
  dementiaStage: DementiaStage;
  disease?: string;
  cognitiveCondition?: string;
  clinicalId?: string;
  familyId?: string;
  phoneNumber?: string;
  email?: string;
  address?: string;
  pincode?: string;
  assignedNurseId?: string;
  assignedNurseName?: string;
  assignedFamilyEmail?: string;
  assignedClinicalEmail?: string;
  emergencyContact: string;
  photoUrl?: string;
  streakDays: number;
  totalGamesPlayed: number;
  currentDifficulty: Record<string, number>; // gameId -> difficulty 1-10
  createdAt?: string;
  stage?: string;
  stabilityStatus?: string;
  compositeScore?: number;
  lastMmseScore?: number;
  diagnosis?: string;
}

export interface CaregiverLink {
  id: string;
  familyUserId: string;
  patientId: string;
  relationship: string;
  permissions: string[];
}

export interface GameMetrics {
  totalPairs?: number;
  cardsMatched?: number;
  flipsCount?: number;
  averageFlipDelayMs?: number;
  attempts?: number;
  avgReactionTimeMs?: number;
  maxSequenceReached?: number;
  targetCount?: number;
  distractorCount?: number;
  correctHits?: number;
  falseAlarms?: number;
  connectedNodes?: number;
  contrastLevel?: number;
  roundsCompleted?: number;
  [key: string]: any;
}

export interface GameResultPayload {
  sessionId: string;
  patientId: string;
  gameId: string;
  domain: CognitiveDomain;
  difficultyLevel: number;
  score: number;
  accuracy: number; // 0.0 to 1.0
  completionTimeSeconds: number;
  mistakes: number;
  metrics: GameMetrics;
  timestamp?: string;
}

export interface GameResultRecord extends GameResultPayload {
  id: string;
  timestamp: string;
  targetTimeSeconds: number;
  newDifficultyLevel: number;
  domainScoreContribution: number;
}

export interface CognitiveDomainScores {
  attention: number;
  logic: number;
  response_time?: number;
  responseTime?: number;
  memory: number;
}

export interface CognitiveScoreRecord {
  id: string;
  patientId: string;
  domains: CognitiveDomainScores;
  overallScore: number;
  lastEvaluatedAt: string;
  trend?: 'improving' | 'stable' | 'declining';
  historyPoints?: Array<{
    date: string;
    overallScore: number;
    memory: number;
    attention: number;
    logic: number;
    response_time: number;
  }>;
}

export interface CaretakerInteractionResponse {
  message: string;
  observation: string;
  recommendedAction: string;
  recommendedGame: string;
  category?: CognitiveCategory;
  categoryName?: string;
  gameTitle?: string;
  gameIcon?: string;
  gameDescription?: string;
  testReasoning?: string;
  targetDomain?: CognitiveDomain;
  userTestScore?: number;
  difficulty: number;
  priority: 'low' | 'medium' | 'high' | 'normal';
  encouragementTip?: string;
  voiceCueText?: string;
  alternativeGames?: Array<{
    gameId: string;
    title: string;
    category: CognitiveCategory;
    icon: string;
    difficulty: number;
    description?: string;
  }>;
  audioBase64?: string;
}

export interface FamilyDashboardPayload {
  patientOverview: {
    id: string;
    name: string;
    age: number;
    stage: string;
    streakDays: number;
    compositeScore: number;
    adherenceRate: number;
    completedDaysCount: number;
  };
  scoreTrends: Array<{
    date: string;
    compositeScore: number;
    memory: number;
    attention: number;
    logic: number;
    responseTime: number;
  }>;
  domainBreakdown: {
    memory: number;
    attention: number;
    logic: number;
    responseTime: number;
  };
  recentObservations: Array<{
    id: string;
    domain: string;
    note: string;
    date: string;
    severity: 'normal' | 'attention';
  }>;
  recommendations: Array<{
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
  }>;
}

export interface NurseDashboardPayload {
  triageProfile: {
    patientId: string;
    patientName: string;
    age: number;
    status: string;
    riskLevel: 'low' | 'medium' | 'high';
    mmseScore: number;
    adherencePercent: number;
    assignedNurse: string;
  };
  domainMetrics: {
    memory: number;
    attention: number;
    logic: number;
    responseTime: number;
  };
  flaggedChanges: Array<{
    id: string;
    metric: string;
    change: string;
    details: string;
    severity: 'normal' | 'attention';
  }>;
  clinicalNotes: ClinicalNote[];
  longitudinalHistory: Array<{
    date: string;
    score: number;
    latencyMs: number;
  }>;
}

export interface ClinicalNote {
  id: string;
  patientId: string;
  author: string;
  authorId?: string;
  authorName?: string;
  authorRole?: string;
  content: string;
  category?: 'observation' | 'medication' | 'cognitive_assessment' | 'family_contact';
  severity?: 'normal' | 'attention' | 'critical';
  flagLevel?: 'routine' | 'warning' | 'critical';
  timestamp?: string;
  date?: string;
}

export interface ReminderItem {
  id: string;
  patientId: string;
  title: string;
  time: string;
  category: 'medication' | 'hydration' | 'exercise' | 'cognitive' | 'social';
  completed: boolean;
  notes?: string;
  recurrence?: 'daily' | 'twice_daily' | 'weekly';
}

export interface MemoryItem {
  id: string;
  patientId: string;
  title: string;
  description: string;
  imageUrl: string;
  date?: string;
  year?: number | string;
  location?: string;
  tags?: string[];
  personTag?: string;
  audioPrompt?: string;
  favorite?: boolean;
  uploadedBy?: string;
}

export interface MilestoneItem {
  id: string;
  title: string;
  description: string;
  badgeIcon: string;
  iconName?: string;
  unlocked: boolean;
  unlockedAt?: string;
  category?: 'streak' | 'accuracy' | 'speed' | 'overall';
  progress?: number;
  badgeColor?: string;
  badgeType?: 'gold' | 'emerald' | 'bronze' | 'purple' | 'blue' | 'rose';
  percentileRank?: string; // e.g. "Top 1%", "Top 5%", "Top 10%"
  benchmarkText?: string;  // e.g. "Outperforming 99% of cohort this week"
  tier?: 'Master' | 'Elite' | 'Advanced' | 'Rising Star';
}

export interface GameDefinition {
  id?: string;
  gameId?: string;
  title: string;
  domain: CognitiveDomain;
  description: string;
  targetTimeSeconds: number;
  difficultyScale?: string;
  icon?: string;
  recommendedFor?: string;
  tags?: string[];
  active?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
  message?: string;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterPayload {
  fullName: string;
  email: string;
  password?: string;
  role: Role;
  phoneNumber?: string;
  address?: string;
  pincode?: string;
  emergencyContact?: string;
  // Patient-specific
  age?: number;
  patientAge?: number;
  disease?: string;
  dementiaStage?: DementiaStage;
  clinicalId?: string;
  familyId?: string;
  assignedFamilyEmail?: string;
  assignedClinicalEmail?: string;
  // Clinical-specific
  clinicName?: string;
  // Family-specific
  familyName?: string;
}

export interface AuditLogItem {
  id: string;
  action: string;
  userId?: string;
  userEmail?: string;
  userRole?: string;
  details?: string;
  ipAddress?: string;
  timestamp: string;
  status: 'SUCCESS' | 'WARNING' | 'DENIED';
}

export interface SystemTelemetry {
  uptimeSeconds: number;
  activeUsersCount: number;
  totalPatientsCount: number;
  totalGameResultsCount: number;
  jwtAlgorithm: string;
  nodeEnvironment: string;
  rbacEnforced: boolean;
  dbStatus: 'HEALTHY' | 'DEGRADED';
}

