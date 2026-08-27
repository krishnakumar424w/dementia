import {
  User,
  PatientProfile,
  GameResultPayload,
  CaretakerInteractionResponse,
  FamilyDashboardPayload,
  NurseDashboardPayload,
  ReminderItem,
  MemoryItem,
  MilestoneItem,
  GameDefinition,
  ClinicalNote,
  AuthResponse,
  LoginCredentials,
  RegisterPayload,
  AuditLogItem,
  SystemTelemetry,
} from '../types';

const TOKEN_KEY = 'neurocare_jwt_token';

export const api = {
  // Token Management
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  removeToken(): void {
    localStorage.removeItem(TOKEN_KEY);
  },

  getAuthHeaders(): Record<string, string> {
    const token = this.getToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  },

  // Auth Endpoints
  async getCurrentUser(): Promise<{ user: User | null }> {
    try {
      const token = this.getToken();
      if (!token) {
        return { user: null };
      }
      const res = await fetch('/api/auth/me', {
        headers: this.getAuthHeaders(),
      });
      if (!res.ok) {
        return { user: null };
      }
      return res.json();
    } catch (e) {
      return { user: null };
    }
  },

  async getUsers(): Promise<{ users: User[] }> {
    const res = await fetch('/api/auth/users', {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async login(credentials: LoginCredentials | string, password?: string): Promise<AuthResponse> {
    const payload = typeof credentials === 'string'
      ? { email: credentials, password: password || 'CognitivePass123!' }
      : credentials;

    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Authentication failed. Please verify your credentials.');
    }

    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async register(payload: RegisterPayload): Promise<AuthResponse> {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed. Please check the provided information.');
    }

    if (data.token) {
      this.setToken(data.token);
    }
    return data;
  },

  async updateProfile(payload: Partial<User> & { disease?: string; dementiaStage?: string; age?: number; emergencyContact?: string; clinicalId?: string; familyId?: string }): Promise<{ user: User; message: string }> {
    const res = await fetch('/api/auth/profile', {
      method: 'PUT',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Failed to update profile.');
    }
    return data;
  },

  logout(): void {
    this.removeToken();
  },

  // Admin & Audit Log Methods
  async getAuditLogs(): Promise<{ auditLogs: AuditLogItem[] }> {
    const res = await fetch('/api/admin/audit-logs', {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async getTelemetry(): Promise<SystemTelemetry & { roleBreakdown: Record<string, number> }> {
    const res = await fetch('/api/admin/telemetry', {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  // Patients
  async getPatients(params?: { assignedFamilyEmail?: string; assignedClinicalEmail?: string; userId?: string; familyId?: string; clinicId?: string }): Promise<{ patients: PatientProfile[] }> {
    const searchParams = new URLSearchParams();
    if (params?.familyId) searchParams.append('familyId', params.familyId);
    if (params?.clinicId) searchParams.append('clinicId', params.clinicId);
    if (params?.assignedFamilyEmail) searchParams.append('assignedFamilyEmail', params.assignedFamilyEmail);
    if (params?.assignedClinicalEmail) searchParams.append('assignedClinicalEmail', params.assignedClinicalEmail);
    if (params?.userId) searchParams.append('userId', params.userId);
    const queryString = searchParams.toString() ? `?${searchParams.toString()}` : '';
    const res = await fetch(`/api/patients${queryString}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async getPatient(patientId: string): Promise<{ patient: PatientProfile; scores: any }> {
    const res = await fetch(`/api/patients/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  // Submit Game Result
  async submitGameResult(payload: GameResultPayload): Promise<any> {
    const res = await fetch('/api/results', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(payload),
    });
    return res.json();
  },

  async getGameResults(patientId: string): Promise<{ results: any[] }> {
    const res = await fetch(`/api/results/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  // AI Caretaker Companion
  async interactWithCaretaker(params: {
    patientId: string;
    userMessage?: string;
    requestedCategory?: string;
    lastGameResult?: any;
    context?: string;
    generateAudio?: boolean;
  }): Promise<CaretakerInteractionResponse> {
    const res = await fetch('/api/caretaker/interact', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(params),
    });
    return res.json();
  },

  async synthesizeSpeech(text: string, voice: string = 'Kore'): Promise<{ audioBase64?: string; mimeType?: string }> {
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify({ text, voice }),
      });
      return await res.json();
    } catch {
      return {};
    }
  },

  async getCaretakerClinicalSummary(patientId: string): Promise<{ summary: string }> {
    const res = await fetch('/api/caretaker/summary', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify({ patientId }),
    });
    return res.json();
  },

  // Dashboards
  async getFamilyDashboard(patientId: string): Promise<FamilyDashboardPayload> {
    const res = await fetch(`/api/dashboard/family/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async getNurseDashboard(patientId: string): Promise<NurseDashboardPayload> {
    const res = await fetch(`/api/dashboard/nurse/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  // Reminders
  async getReminders(patientId: string): Promise<{ reminders: ReminderItem[] }> {
    const res = await fetch(`/api/reminders/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async createReminder(reminder: Partial<ReminderItem>): Promise<{ success: boolean; reminder: ReminderItem }> {
    const res = await fetch('/api/reminders', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(reminder),
    });
    return res.json();
  },

  async toggleReminder(id: string): Promise<{ success: boolean; reminder: ReminderItem }> {
    const res = await fetch(`/api/reminders/${id}/toggle`, {
      method: 'PATCH',
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  // Memories
  async getMemories(patientId: string): Promise<{ memories: MemoryItem[] }> {
    const res = await fetch(`/api/memories/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async createMemory(memory: Partial<MemoryItem>): Promise<{ success: boolean; memory: MemoryItem }> {
    const res = await fetch('/api/memories', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(memory),
    });
    return res.json();
  },

  async getUploadSignature(): Promise<any> {
    const res = await fetch('/api/memories/upload-signature', {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  // Games Catalog
  async getGames(): Promise<{ games: GameDefinition[] }> {
    const res = await fetch('/api/games', {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },

  async addCustomGame(game: Partial<GameDefinition>): Promise<{ success: boolean; game: GameDefinition }> {
    const res = await fetch('/api/games', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(game),
    });
    return res.json();
  },

  // Clinical Notes
  async createClinicalNote(note: Partial<ClinicalNote>): Promise<{ success: boolean; note: ClinicalNote }> {
    const res = await fetch('/api/clinical-notes', {
      method: 'POST',
      headers: this.getAuthHeaders(),
      body: JSON.stringify(note),
    });
    return res.json();
  },

  // Milestones
  async getMilestones(patientId: string): Promise<{ milestones: MilestoneItem[] }> {
    const res = await fetch(`/api/milestones/${patientId}`, {
      headers: this.getAuthHeaders(),
    });
    return res.json();
  },
};

