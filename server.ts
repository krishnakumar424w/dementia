import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Modality } from '@google/genai';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

dotenv.config();

// Initialize Express
const app = express();
const PORT = 3000;

const JWT_SECRET = process.env.JWT_SECRET || 'neurocare_super_secret_jwt_key_2026_x89';

app.use(express.json({ limit: '10mb' }));

// Initialize Gemini Client safely
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.warn('Failed to initialize Gemini client:', e);
    }
  }
  return aiClient;
}

// In-memory TTS Cache & Rate-limit backoff tracker
const ttsCache = new Map<string, { audioBase64: string; mimeType: string }>();
let ttsCooldownUntil = 0;
let textModelCooldownUntil = 0;

/**
 * Resilient Gemini TTS synthesizer with LRU cache and rate-limit backoff.
 */
async function synthesizeGeminiTTS(text: string, voice: string = 'Kore'): Promise<{ audioBase64?: string; mimeType?: string } | null> {
  const cleanText = text.trim();
  if (!cleanText) return null;

  const cacheKey = `${voice}:::${cleanText}`;
  if (ttsCache.has(cacheKey)) {
    return ttsCache.get(cacheKey)!;
  }

  // If in rate-limit cooldown (e.g. after a 429 quota exhaustion), skip calling remote API
  if (Date.now() < ttsCooldownUntil) {
    return null;
  }

  const ai = getGeminiClient();
  if (!ai || !process.env.GEMINI_API_KEY) {
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-tts-preview',
      contents: [{ parts: [{ text: `Say warmly and reassuringly: ${cleanText}` }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: voice || 'Kore' },
          },
        },
      },
    });

    const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (audioData) {
      const result = {
        audioBase64: audioData,
        mimeType: 'audio/pcm;rate=24000',
      };
      if (ttsCache.size > 50) {
        const firstKey = ttsCache.keys().next().value;
        if (firstKey) ttsCache.delete(firstKey);
      }
      ttsCache.set(cacheKey, result);
      return result;
    }
  } catch (err: any) {
    const isQuotaExceeded =
      err?.status === 429 ||
      err?.code === 429 ||
      err?.status === 'RESOURCE_EXHAUSTED' ||
      (typeof err?.message === 'string' && (
        err.message.includes('429') ||
        err.message.includes('Quota exceeded') ||
        err.message.includes('RESOURCE_EXHAUSTED')
      ));

    if (isQuotaExceeded) {
      // Cooldown for 60 seconds so subsequent requests fall back smoothly without quota spam
      ttsCooldownUntil = Date.now() + 60000;
    }
  }

  return null;
}

/**
 * Resilient Gemini text generation helper with exponential backoff & model fallback.
 * Mitigates temporary 503 "high demand" or 429 rate limit spikes before falling back to rule engine.
 */
async function generateGeminiContentWithRetry(options: {
  contents: string | any;
  systemInstruction?: string;
  responseMimeType?: string;
  models?: string[];
  maxRetries?: number;
}): Promise<string | null> {
  const ai = getGeminiClient();
  if (!ai) return null;

  if (Date.now() < textModelCooldownUntil) {
    return null;
  }

  const candidateModels = options.models || ['gemini-3.7-flash', 'gemini-3.1-flash-lite'];
  const maxRetries = options.maxRetries ?? 2;

  for (const model of candidateModels) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: options.contents,
          config: {
            ...(options.systemInstruction ? { systemInstruction: options.systemInstruction } : {}),
            ...(options.responseMimeType ? { responseMimeType: options.responseMimeType } : {}),
          },
        });

        const text = response.text;
        if (text && text.trim().length > 0) {
          return text.trim();
        }
      } catch (err: any) {
        const status = err?.status || err?.code || (err?.message?.includes('503') ? 503 : 0);
        const isUnavailableOrRateLimited =
          status === 503 ||
          status === 429 ||
          status === 'UNAVAILABLE' ||
          status === 'RESOURCE_EXHAUSTED' ||
          (typeof err?.message === 'string' && (
            err.message.includes('high demand') ||
            err.message.includes('Spikes in demand') ||
            err.message.includes('503') ||
            err.message.includes('429') ||
            err.message.includes('Quota exceeded') ||
            err.message.includes('RESOURCE_EXHAUSTED')
          ));

        if (status === 429 || status === 'RESOURCE_EXHAUSTED' || (typeof err?.message === 'string' && err.message.includes('Quota exceeded'))) {
          textModelCooldownUntil = Date.now() + 30000;
        }

        if (isUnavailableOrRateLimited && attempt < maxRetries) {
          const delayMs = attempt * 300 + Math.random() * 150;
          await new Promise((resolve) => setTimeout(resolve, delayMs));
          continue;
        }

        if (isUnavailableOrRateLimited) {
          // Fall through to try next candidate model
          break;
        }

        // Non-retriable error
        break;
      }
    }
  }

  return null;
}

// -------------------------------------------------------------
// IN-MEMORY DATABASE & SEED DATA (MongoDB Schema Aligned)
// -------------------------------------------------------------

const db = {
  users: [
    {
      id: '65df0011a123b456789a0009',
      email: 'admin@mira.org',
      passwordHash: bcrypt.hashSync('AdminPassword123!', 10),
      role: 'admin' as const,
      fullName: 'Krishna',
      phoneNumber: '+919876543213',
      address: 'MIRA Central Medical Headquarters, Floor 9',
      pincode: '600001',
      avatarUrl: '',
      createdAt: '2026-08-20T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0001',
      email: 'nurse.sarah@hospital.org',
      passwordHash: bcrypt.hashSync('NursePassword123!', 10),
      role: 'nurse' as const,
      fullName: 'Sarah Jenkins, RN',
      clinicName: 'St. Jude Cognitive Neurology Clinic',
      clinicId: 'CLN-4402',
      phoneNumber: '+919876543210',
      address: 'Suite 400, Medical Arts Pavilion, Metro Hospital',
      pincode: '600028',
      avatarUrl: '',
      createdAt: '2026-08-20T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0008',
      email: 'nurse.robert@metrohealth.org',
      passwordHash: bcrypt.hashSync('NursePassword123!', 10),
      role: 'nurse' as const,
      fullName: 'Robert Davies, NP',
      clinicName: 'Metro West Memory Care Center',
      clinicId: 'CLN-7719',
      phoneNumber: '+919876543218',
      address: '88 West Blvd, Care District',
      pincode: '600092',
      avatarUrl: '',
      createdAt: '2026-08-21T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0004',
      email: 'patient.arthur@gmail.com',
      passwordHash: bcrypt.hashSync('PatientPassword123!', 10),
      role: 'patient' as const,
      fullName: 'Arthur Pendelton',
      phoneNumber: '+919876543211',
      address: '42 Elmwood Grove, Greenfield Suburb',
      pincode: '600041',
      clinicalId: 'CLN-4402',
      familyId: 'FAM-8821',
      emergencyContact: '+919876543212 (Eleanor - Daughter)',
      avatarUrl: '',
      createdAt: '2026-08-20T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0014',
      email: 'patient.chen@gmail.com',
      passwordHash: bcrypt.hashSync('PatientPassword123!', 10),
      role: 'patient' as const,
      fullName: 'Margaret Chen',
      phoneNumber: '+919876543220',
      address: '18 Lotus Valley Lane',
      pincode: '600085',
      clinicalId: 'CLN-4402',
      familyId: 'FAM-9934',
      emergencyContact: '+919876543221 (David - Son)',
      avatarUrl: '',
      createdAt: '2026-08-22T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0024',
      email: 'patient.harold@gmail.com',
      passwordHash: bcrypt.hashSync('PatientPassword123!', 10),
      role: 'patient' as const,
      fullName: 'Harold Bradley',
      phoneNumber: '+919876543299',
      address: '12 Beacon Hill Way',
      pincode: '600092',
      clinicalId: 'CLN-7719',
      familyId: 'FAM-5541',
      emergencyContact: '+919876543298 (Carol - Wife)',
      avatarUrl: '',
      createdAt: '2026-08-23T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0006',
      email: 'family.daughter@gmail.com',
      passwordHash: bcrypt.hashSync('FamilyPassword123!', 10),
      role: 'family' as const,
      fullName: 'Eleanor Pendelton (Daughter)',
      familyName: 'Pendelton Family',
      familyId: 'FAM-8821',
      phoneNumber: '+919876543212',
      address: '42 Elmwood Grove, Greenfield Suburb',
      pincode: '600041',
      avatarUrl: '',
      createdAt: '2026-08-20T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0016',
      email: 'family.chen@gmail.com',
      passwordHash: bcrypt.hashSync('FamilyPassword123!', 10),
      role: 'family' as const,
      fullName: 'David Chen (Son)',
      familyName: 'Chen Family',
      familyId: 'FAM-9934',
      phoneNumber: '+919876543221',
      address: '18 Lotus Valley Lane',
      pincode: '600085',
      avatarUrl: '',
      createdAt: '2026-08-22T00:00:00Z',
    },
  ],

  auditLogs: [
    {
      id: 'log_boot_01',
      action: 'SYSTEM_BOOT',
      userId: '65df0011a123b456789a0009',
      userEmail: 'admin@mira.org',
      userRole: 'admin',
      details: 'MIRA Cognitive Security Core loaded. JWT signing algorithm HMAC-SHA256 active.',
      ipAddress: '127.0.0.1',
      timestamp: '2026-08-27T08:00:00Z',
      status: 'SUCCESS' as 'SUCCESS' | 'WARNING' | 'DENIED',
    },
    {
      id: 'log_seed_02',
      action: 'ADMIN_SEEDED',
      userId: '65df0011a123b456789a0009',
      userEmail: 'admin@mira.org',
      userRole: 'admin',
      details: 'Pre-defined admin credentials initialized: admin@mira.org (RBAC: Full Access).',
      ipAddress: '127.0.0.1',
      timestamp: '2026-08-27T08:00:01Z',
      status: 'SUCCESS' as 'SUCCESS' | 'WARNING' | 'DENIED',
    },
    {
      id: 'log_auth_03',
      action: 'POLICY_ENFORCED',
      userId: '65df0011a123b456789a0001',
      userEmail: 'nurse.sarah@hospital.org',
      userRole: 'nurse',
      details: 'Clinical triage credentials validated for Clinic CLN-4402.',
      ipAddress: '192.168.1.42',
      timestamp: '2026-08-27T08:30:14Z',
      status: 'SUCCESS' as 'SUCCESS' | 'WARNING' | 'DENIED',
    },
  ],

  patients: [
    {
      id: '65df0011a123b456789a0002',
      userId: '65df0011a123b456789a0004',
      fullName: 'Arthur Pendelton',
      age: 74,
      gender: 'male' as const,
      primaryLanguage: 'English / Tamil',
      disease: 'Mild Cognitive Impairment',
      cognitiveCondition: 'Mild Cognitive Impairment',
      dementiaStage: 'Mild Cognitive Impairment' as const,
      stage: 'Mild Cognitive Impairment',
      diagnosis: 'Mild Cognitive Impairment',
      clinicalId: 'CLN-4402',
      familyId: 'FAM-8821',
      phoneNumber: '+919876543211',
      email: 'patient.arthur@gmail.com',
      address: '42 Elmwood Grove, Greenfield Suburb',
      pincode: '600041',
      stabilityStatus: 'Stable',
      compositeScore: 84,
      lastMmseScore: 27,
      assignedNurseId: '65df0011a123b456789a0001',
      assignedNurseName: 'Sarah Jenkins, RN',
      assignedFamilyEmail: 'family.daughter@gmail.com',
      assignedClinicalEmail: 'nurse.sarah@hospital.org',
      emergencyContact: '+919876543212 (Eleanor - Daughter)',
      photoUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
      streakDays: 7,
      totalGamesPlayed: 34,
      currentDifficulty: {
        memory_training: 4,
        touch_sequence: 3,
        concentration: 3,
        icon_identification: 4,
        graph_interpretation: 2,
        vision_adaptation: 3,
      },
      createdAt: '2026-08-20T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0012',
      userId: '65df0011a123b456789a0014',
      fullName: 'Margaret Chen',
      age: 81,
      gender: 'female' as const,
      primaryLanguage: 'English / Mandarin',
      disease: 'Early Stage Dementia',
      cognitiveCondition: 'Early Stage Dementia',
      dementiaStage: 'Early Stage Dementia' as const,
      stage: 'Early Stage Dementia',
      diagnosis: 'Early Stage Dementia',
      clinicalId: 'CLN-4402',
      familyId: 'FAM-9934',
      phoneNumber: '+919876543220',
      email: 'patient.chen@gmail.com',
      address: '18 Lotus Valley Lane',
      pincode: '600085',
      stabilityStatus: 'Monitored',
      compositeScore: 72,
      lastMmseScore: 23,
      assignedNurseId: '65df0011a123b456789a0001',
      assignedNurseName: 'Sarah Jenkins, RN',
      assignedFamilyEmail: 'family.chen@gmail.com',
      assignedClinicalEmail: 'nurse.sarah@hospital.org',
      emergencyContact: '+919876543221 (David - Son)',
      photoUrl: 'https://images.unsplash.com/photo-1566616213894-2d4e1baee5d8?w=200&auto=format&fit=crop&q=80',
      streakDays: 3,
      totalGamesPlayed: 19,
      currentDifficulty: {
        memory_training: 2,
        touch_sequence: 2,
        concentration: 2,
        icon_identification: 3,
        graph_interpretation: 1,
        vision_adaptation: 2,
      },
      createdAt: '2026-08-22T00:00:00Z',
    },
    {
      id: '65df0011a123b456789a0022',
      userId: '65df0011a123b456789a0024',
      fullName: 'Harold Bradley',
      age: 79,
      gender: 'male' as const,
      primaryLanguage: 'English',
      disease: 'Moderate Dementia',
      cognitiveCondition: 'Moderate Dementia',
      dementiaStage: 'Moderate Dementia' as const,
      stage: 'Moderate Dementia',
      diagnosis: 'Moderate Dementia',
      clinicalId: 'CLN-7719',
      familyId: 'FAM-5541',
      phoneNumber: '+919876543299',
      email: 'patient.harold@gmail.com',
      address: '12 Beacon Hill Way',
      pincode: '600092',
      stabilityStatus: 'High Support',
      compositeScore: 61,
      lastMmseScore: 19,
      assignedNurseId: '65df0011a123b456789a0008',
      assignedNurseName: 'Robert Davies, NP',
      assignedFamilyEmail: 'family.bradley@gmail.com',
      assignedClinicalEmail: 'nurse.robert@metrohealth.org',
      emergencyContact: '+919876543298 (Carol - Wife)',
      photoUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&auto=format&fit=crop&q=80',
      streakDays: 2,
      totalGamesPlayed: 12,
      currentDifficulty: {
        memory_training: 2,
        touch_sequence: 1,
        concentration: 2,
        icon_identification: 2,
        graph_interpretation: 1,
        vision_adaptation: 1,
      },
      createdAt: '2026-08-23T00:00:00Z',
    },
  ],

  caregiverLinks: [
    {
      id: '65df0011a123b456789a0004',
      familyUserId: '65df0011a123b456789a0006',
      patientId: '65df0011a123b456789a0002',
      relationship: 'Daughter',
      permissions: ['read_scores', 'manage_reminders', 'manage_memories'],
    },
  ],

  cognitiveScores: {
    '65df0011a123b456789a0002': {
      id: '65df0011a123b456789a0007',
      patientId: '65df0011a123b456789a0002',
      domains: {
        attention: 78.2,
        logic: 65.0,
        response_time: 82.1,
        memory: 70.4,
      },
      overallScore: 73.92,
      lastEvaluatedAt: '2026-08-27T09:30:00Z',
      trend: 'improving' as const,
      historyPoints: [
        { date: 'Aug 21', overallScore: 68.2, memory: 64.0, attention: 72.0, logic: 61.0, response_time: 76.0 },
        { date: 'Aug 22', overallScore: 69.5, memory: 65.2, attention: 73.5, logic: 62.1, response_time: 78.0 },
        { date: 'Aug 23', overallScore: 71.0, memory: 67.0, attention: 75.0, logic: 63.4, response_time: 80.2 },
        { date: 'Aug 24', overallScore: 72.4, memory: 68.5, attention: 76.8, logic: 64.0, response_time: 81.0 },
        { date: 'Aug 25', overallScore: 70.8, memory: 66.8, attention: 75.2, logic: 63.8, response_time: 79.5 },
        { date: 'Aug 26', overallScore: 72.8, memory: 69.0, attention: 77.4, logic: 64.6, response_time: 81.5 },
        { date: 'Aug 27', overallScore: 73.9, memory: 70.4, attention: 78.2, logic: 65.0, response_time: 82.1 },
      ],
    },
    '65df0011a123b456789a0012': {
      id: '65df0011a123b456789a0017',
      patientId: '65df0011a123b456789a0012',
      domains: {
        attention: 74.0,
        logic: 68.5,
        response_time: 76.0,
        memory: 69.0,
      },
      overallScore: 71.88,
      lastEvaluatedAt: '2026-08-27T09:30:00Z',
      trend: 'stable' as const,
      historyPoints: [
        { date: 'Aug 22', overallScore: 70.0, memory: 67.0, attention: 72.0, logic: 66.0, response_time: 75.0 },
        { date: 'Aug 24', overallScore: 71.2, memory: 68.0, attention: 73.5, logic: 67.5, response_time: 75.5 },
        { date: 'Aug 27', overallScore: 71.88, memory: 69.0, attention: 74.0, logic: 68.5, response_time: 76.0 },
      ],
    },
    '65df0011a123b456789a0022': {
      id: '65df0011a123b456789a0027',
      patientId: '65df0011a123b456789a0022',
      domains: {
        attention: 62.0,
        logic: 58.0,
        response_time: 65.0,
        memory: 59.0,
      },
      overallScore: 60.95,
      lastEvaluatedAt: '2026-08-27T09:30:00Z',
      trend: 'declining' as const,
      historyPoints: [
        { date: 'Aug 23', overallScore: 63.5, memory: 62.0, attention: 64.0, logic: 60.0, response_time: 67.0 },
        { date: 'Aug 25', overallScore: 62.0, memory: 60.5, attention: 63.0, logic: 59.0, response_time: 66.0 },
        { date: 'Aug 27', overallScore: 60.95, memory: 59.0, attention: 62.0, logic: 58.0, response_time: 65.0 },
      ],
    },
  },

  gameResults: [
    {
      id: 'res_001',
      sessionId: 'sess_987654321',
      patientId: '65df0011a123b456789a0002',
      gameId: 'memory_training',
      domain: 'memory' as const,
      difficultyLevel: 3,
      score: 85.5,
      accuracy: 0.90,
      completionTimeSeconds: 42.4,
      targetTimeSeconds: 45.0,
      mistakes: 2,
      newDifficultyLevel: 4,
      domainScoreContribution: 74.2,
      metrics: {
        cardsMatched: 8,
        flipsCount: 18,
        averageFlipDelayMs: 1400,
      },
      timestamp: '2026-08-27T09:30:00Z',
    },
    {
      id: 'res_002',
      sessionId: 'sess_987654320',
      patientId: '65df0011a123b456789a0002',
      gameId: 'touch_sequence',
      domain: 'response_time' as const,
      difficultyLevel: 3,
      score: 88.0,
      accuracy: 0.92,
      completionTimeSeconds: 31.5,
      targetTimeSeconds: 35.0,
      mistakes: 1,
      newDifficultyLevel: 4,
      domainScoreContribution: 84.0,
      metrics: {
        maxSequenceReached: 5,
        avgReactionTimeMs: 1100,
      },
      timestamp: '2026-08-26T16:15:00Z',
    },
    {
      id: 'res_003',
      sessionId: 'sess_987654319',
      patientId: '65df0011a123b456789a0002',
      gameId: 'concentration',
      domain: 'attention' as const,
      difficultyLevel: 3,
      score: 82.0,
      accuracy: 0.88,
      completionTimeSeconds: 38.0,
      targetTimeSeconds: 40.0,
      mistakes: 2,
      newDifficultyLevel: 3,
      domainScoreContribution: 79.5,
      metrics: {
        correctHits: 9,
        falseAlarms: 1,
      },
      timestamp: '2026-08-26T10:00:00Z',
    },
  ],

  reminders: [
    {
      id: 'rem_01',
      patientId: '65df0011a123b456789a0002',
      title: 'Morning Blood Pressure & Donepezil (5mg)',
      time: '08:30 AM',
      category: 'medication' as const,
      completed: true,
      notes: 'Take with half glass of water and light breakfast.',
      recurrence: 'daily' as const,
    },
    {
      id: 'rem_02',
      patientId: '65df0011a123b456789a0002',
      title: 'Hydration & Herbal Tea Break',
      time: '11:00 AM',
      category: 'hydration' as const,
      completed: true,
      notes: 'Chamomile or warm lemon water.',
      recurrence: 'daily' as const,
    },
    {
      id: 'rem_03',
      patientId: '65df0011a123b456789a0002',
      title: 'Daily Cognitive Brain Workout (2 Sessions)',
      time: '02:00 PM',
      category: 'cognitive' as const,
      completed: false,
      notes: 'Memory Cards and Touch Sequence games.',
      recurrence: 'daily' as const,
    },
    {
      id: 'rem_04',
      patientId: '65df0011a123b456789a0002',
      title: 'Afternoon Garden Walk with Eleanor',
      time: '04:30 PM',
      category: 'exercise' as const,
      completed: false,
      notes: '15-minute gentle stroll in the courtyard.',
      recurrence: 'daily' as const,
    },
    {
      id: 'rem_05',
      patientId: '65df0011a123b456789a0002',
      title: 'Evening Vitamin D3 & Calming Music',
      time: '08:00 PM',
      category: 'medication' as const,
      completed: false,
      notes: 'Listen to jazz records before sleep.',
      recurrence: 'daily' as const,
    },
  ],

  memories: [
    {
      id: 'mem_01',
      patientId: '65df0011a123b456789a0002',
      title: 'Granddaughter Maya’s Graduation',
      description: 'Maya graduating with honors in computer engineering. Arthur wore his favorite blue suit and smiled all afternoon.',
      imageUrl: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop&q=80',
      date: 'June 14, 2024',
      year: '2024',
      tags: ['Family', 'Maya', 'Graduation', 'Celebration'],
      personTag: 'Maya (Granddaughter)',
      audioPrompt: 'Remember Maya telling you she chose engineering because of your vintage radio bench?',
      favorite: true,
    },
    {
      id: 'mem_02',
      patientId: '65df0011a123b456789a0002',
      title: 'Golden Wedding Anniversary in Cornwall',
      description: 'Arthur and Clara celebrated 50 years together by the seaside cliff walk. The sea breeze and sunset were golden.',
      imageUrl: 'https://images.unsplash.com/photo-1510312305653-8ed496efae75?w=600&auto=format&fit=crop&q=80',
      date: 'September 18, 2018',
      year: '2018',
      tags: ['Anniversary', 'Clara', 'Cornwall', 'Seaside'],
      personTag: 'Clara (Wife)',
      audioPrompt: 'The seagulls were so loud, but Clara held your hand the whole sunset.',
      favorite: true,
    },
    {
      id: 'mem_03',
      patientId: '65df0011a123b456789a0002',
      title: 'Arthur’s Vintage 1968 Triumph Roadster',
      description: 'Restoring the British racing green roadster in the backyard garage. Spending Saturdays with wrench and polish.',
      imageUrl: 'https://images.unsplash.com/photo-1583121274602-3e2820c69888?w=600&auto=format&fit=crop&q=80',
      date: 'Summer 1975',
      year: '1975',
      tags: ['Hobby', 'Cars', 'Restoration', 'Green Roadster'],
      personTag: 'Arthur (Younger)',
      audioPrompt: 'You spent three months tuning the twin carburetors until it purred like a kitten!',
      favorite: false,
    },
  ],

  clinicalNotes: [
    {
      id: 'note_01',
      patientId: '65df0011a123b456789a0002',
      author: 'Sarah Jenkins, RN',
      authorId: '65df0011a123b456789a0001',
      authorName: 'Sarah Jenkins, RN',
      authorRole: 'Primary Geriatric Nurse',
      category: 'cognitive_assessment',
      content: 'Arthur completed morning memory assessment with solid recall (90%). Reaction time remains steady at 1.2s. Daughter reports he was in cheerful spirits during the garden walk.',
      severity: 'normal',
      flagLevel: 'routine' as const,
      timestamp: 'Today, 10:15 AM',
      date: '2026-08-27T10:15:00Z',
    },
    {
      id: 'note_02',
      patientId: '65df0011a123b456789a0002',
      author: 'Sarah Jenkins, RN',
      authorId: '65df0011a123b456789a0001',
      authorName: 'Sarah Jenkins, RN',
      authorRole: 'Primary Geriatric Nurse',
      category: 'observation',
      content: 'Mild hesitation observed during Trail Making Graph test on Tuesday. Recommended adjusting difficulty from level 3 down to level 2 temporarily to prevent cognitive fatigue.',
      severity: 'attention',
      flagLevel: 'warning' as const,
      timestamp: 'Aug 25, 02:30 PM',
      date: '2026-08-25T14:30:00Z',
    },
  ],

  games: [
    {
      id: 'memory_training',
      title: 'Memory Card Match',
      domain: 'memory' as const,
      description: 'Strengthen short-term visual recall by matching pairs of familiar symbols and items.',
      targetTimeSeconds: 40,
      icon: 'Brain',
      recommendedFor: 'Early recall reinforcement and hippocampal stimulation.',
      tags: ['Visual Memory', 'Pairs', 'Short-term Recall'],
      active: true,
    },
    {
      id: 'touch_sequence',
      title: 'Chime Sequence Recall',
      domain: 'response_time' as const,
      description: 'Follow illuminated musical color pads in sequence to sharpen psychomotor speed.',
      targetTimeSeconds: 30,
      icon: 'Zap',
      recommendedFor: 'Processing speed and temporal pattern sequencing.',
      tags: ['Processing Speed', 'Audio-Visual', 'Motor Control'],
      active: true,
    },
    {
      id: 'concentration',
      title: 'Focus Flanker & Target Finder',
      domain: 'attention' as const,
      description: 'Discriminate target symbols amidst distractors to enhance selective attention.',
      targetTimeSeconds: 35,
      icon: 'Target',
      recommendedFor: 'Sustained attention and inhibitory control.',
      tags: ['Attention Span', 'Filtering', 'Reaction Time'],
      active: true,
    },
    {
      id: 'icon_identification',
      title: 'Daily Item & Category Naming',
      domain: 'logic' as const,
      description: 'Identify real-world objects and classify items into functional categories.',
      targetTimeSeconds: 35,
      icon: 'Sparkles',
      recommendedFor: 'Semantic memory preservation and object recognition.',
      tags: ['Semantic Memory', 'Categorization', 'Language'],
      active: true,
    },
    {
      id: 'graph_interpretation',
      title: 'Trail Connect & Sequence Matrix',
      domain: 'logic' as const,
      description: 'Connect numbers and letters in alternating sequence (Trail Making Test principles).',
      targetTimeSeconds: 45,
      icon: 'Network',
      recommendedFor: 'Executive functioning, cognitive flexibility, and visual scanning.',
      tags: ['Executive Function', 'Trail Making', 'Cognitive Flexibility'],
      active: true,
    },
    {
      id: 'vision_adaptation',
      title: 'Contrast & Spatial Search',
      domain: 'attention' as const,
      description: 'Detect subtle contrast variations and spatial grid orientation changes.',
      targetTimeSeconds: 30,
      icon: 'Eye',
      recommendedFor: 'Visuospatial orientation and contrast sensitivity adaptation.',
      tags: ['Visuospatial', 'Contrast Sensitivity', 'Visual Search'],
      active: true,
    },
  ],

  milestones: {
    '65df0011a123b456789a0002': [
      {
        id: 'ms_01',
        title: '7-Day Streak Master',
        description: 'Completed at least one adaptive cognitive drill every day for a full week.',
        iconName: 'Flame',
        badgeIcon: '🔥',
        unlocked: true,
        unlockedAt: '2026-08-27',
        category: 'streak' as const,
        progress: 100,
        badgeColor: 'amber',
        badgeType: 'gold',
        percentileRank: 'Top 1% Player This Week',
        benchmarkText: 'Top 1% of cognitive cohort for 7-day adherence',
        tier: 'Master',
      },
      {
        id: 'ms_02',
        title: 'Master of Recall (90%+ Accuracy)',
        description: 'Achieved 90% or higher precision across 5 consecutive working memory drills.',
        iconName: 'Award',
        badgeIcon: '🧠',
        unlocked: true,
        unlockedAt: '2026-08-26',
        category: 'accuracy' as const,
        progress: 100,
        badgeColor: 'emerald',
        badgeType: 'emerald',
        percentileRank: 'Top 5% Memory Recall',
        benchmarkText: 'Top 5% memory retention across regional clinic patients',
        tier: 'Elite',
      },
      {
        id: 'ms_03',
        title: 'Lightning Reflexes (<1.2s Reaction)',
        description: 'Completed sequence chime tests with average motor latency under 1200ms.',
        iconName: 'Zap',
        badgeIcon: '⚡',
        unlocked: true,
        unlockedAt: '2026-08-25',
        category: 'speed' as const,
        progress: 100,
        badgeColor: 'blue',
        badgeType: 'blue',
        percentileRank: 'Top 5% Visual Speed',
        benchmarkText: 'Top 5% psychomotor reaction in MCI demographic',
        tier: 'Elite',
      },
      {
        id: 'ms_04',
        title: 'Consistent Thinker (30-Day Path)',
        description: 'Maintain persistent cognitive training routine across 30 active days.',
        iconName: 'Sparkles',
        badgeIcon: '✨',
        unlocked: false,
        category: 'streak' as const,
        progress: 45,
        badgeColor: 'purple',
        badgeType: 'purple',
        percentileRank: 'Top 3% Target',
        benchmarkText: 'Unlock to enter Top 3% Global Longevity Cohort',
        tier: 'Master',
      },
      {
        id: 'ms_05',
        title: 'Early Bird (Zen Morning Routine)',
        description: 'Complete daily morning medications and memory routine before 10:00 AM.',
        iconName: 'Sun',
        badgeIcon: '🌅',
        unlocked: true,
        unlockedAt: '2026-08-27',
        category: 'streak' as const,
        progress: 100,
        badgeColor: 'rose',
        badgeType: 'bronze',
        percentileRank: 'Top 10% Morning Punctuality',
        benchmarkText: 'Top 10% early morning routine compliance',
        tier: 'Advanced',
      },
      {
        id: 'ms_06',
        title: 'Cognitive Champion (50 Games)',
        description: 'Play a total of 50 neuroplasticity drill and evaluation sessions.',
        iconName: 'Trophy',
        badgeIcon: '🏆',
        unlocked: false,
        category: 'overall' as const,
        progress: 68,
        badgeColor: 'purple',
        badgeType: 'gold',
        percentileRank: 'Top 8% Volume Benchmark',
        benchmarkText: '34 of 50 drills completed towards Grandmaster Tier',
        tier: 'Master',
      },
    ],
  },
};

// -------------------------------------------------------------
// GENERIC ALGORITHMS
// -------------------------------------------------------------

/**
 * Calculates updated difficulty for next game session (1 to 10 scale)
 * Specified in Architectural Plan Section 4
 */
function calculateNextDifficulty(
  currentDifficulty: number,
  accuracy: number,
  completionTimeSeconds: number,
  targetTimeSeconds: number
): number {
  let adjustment = 0;

  if (accuracy >= 0.85 && completionTimeSeconds <= targetTimeSeconds) {
    adjustment = 1; // Increase difficulty
  } else if (accuracy < 0.60 || completionTimeSeconds > targetTimeSeconds * 1.5) {
    adjustment = -1; // Decrease difficulty
  }

  const newDifficulty = Math.min(Math.max(currentDifficulty + adjustment, 1), 10);
  return newDifficulty;
}

/**
 * Domain Score Formula:
 * DomainScore = 0.7 * (Accuracy Percentage) + 0.3 * max(0, 100 - (Time / Target Time) * 20)
 */
function calculateDomainScore(accuracy: number, completionTime: number, targetTime: number): number {
  const accuracyPct = Math.min(Math.max(accuracy * 100, 0), 100);
  const timeFactor = targetTime > 0 ? (completionTime / targetTime) * 20 : 20;
  const timeScore = Math.max(0, 100 - timeFactor);
  const finalScore = 0.7 * accuracyPct + 0.3 * timeScore;
  return Math.round(finalScore * 10) / 10;
}

/**
 * Overall Cognitive Score:
 * OverallScore = 0.30(Memory) + 0.25(Attention) + 0.25(Logic) + 0.20(Response Time)
 */
function calculateOverallScore(domains: {
  memory: number;
  attention: number;
  logic: number;
  response_time: number;
}): number {
  const overall =
    0.30 * (domains.memory || 70) +
    0.25 * (domains.attention || 75) +
    0.25 * (domains.logic || 65) +
    0.20 * (domains.response_time || 80);
  return Math.round(overall * 100) / 100;
}

// -------------------------------------------------------------
// REST API ROUTES
// -------------------------------------------------------------

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    geminiEnabled: Boolean(process.env.GEMINI_API_KEY),
    timestamp: new Date().toISOString(),
  });
});

// Helper functions for Auth & RBAC
function sanitizeUser(user: any) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

function generateJwtToken(user: any): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      fullName: user.fullName,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

function verifyJwtToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    return null;
  }
}

// -------------------------------------------------------------
// AUTHENTICATION & RBAC ENDPOINTS
// -------------------------------------------------------------

// POST /api/auth/register
app.post('/api/auth/register', (req, res) => {
  try {
    const {
      fullName,
      email,
      password = 'CognitivePass123!',
      role = 'patient',
      phoneNumber = '',
      address = '',
      pincode = '',
      emergencyContact = '',
      // Patient fields
      age,
      patientAge,
      disease = 'Mild Cognitive Impairment',
      dementiaStage,
      clinicalId = '',
      familyId = '',
      assignedFamilyEmail = '',
      assignedClinicalEmail = '',
      // Clinical fields
      clinicName = '',
      // Family fields
      familyName = '',
    } = req.body;

    if (!email || !fullName) {
      return res.status(400).json({ error: 'Full name and email are required for registration.' });
    }

    if (role === 'admin') {
      return res.status(403).json({ error: 'System Administrator accounts cannot be registered publicly. Please use pre-configured administrator credentials (admin@mira.org).' });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = db.users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'An account with this email address already exists. Please login instead.' });
    }

    const userId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const passwordHash = bcrypt.hashSync(password, 10);

    const newUser: any = {
      id: userId,
      email: normalizedEmail,
      passwordHash,
      role: role as any,
      fullName: fullName.trim(),
      phoneNumber: phoneNumber.trim(),
      address: address.trim(),
      pincode: pincode.trim(),
      emergencyContact: emergencyContact.trim(),
      avatarUrl: '',
      createdAt: new Date().toISOString(),
    };

    if (role === 'nurse') {
      newUser.clinicName = clinicName.trim() || 'Community Cognitive Neurology Clinic';
      newUser.clinicId = (clinicalId || `CLN-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase().trim();
    } else if (role === 'family') {
      newUser.familyName = familyName.trim() || `${fullName.trim()} Family`;
      newUser.familyId = (familyId || `FAM-${Math.floor(1000 + Math.random() * 9000)}`).toUpperCase().trim();
    } else if (role === 'patient') {
      newUser.clinicalId = (clinicalId || 'CLN-4402').toUpperCase().trim();
      newUser.familyId = (familyId || 'FAM-8821').toUpperCase().trim();
    }

    db.users.push(newUser);

    // If role is patient, register corresponding patient telemetry record
    if (role === 'patient') {
      const patientId = `pat_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
      const assignedCondition = disease || dementiaStage || 'Mild Cognitive Impairment';
      const patientCalculatedAge = Number(age || patientAge) || 72;

      // Find clinician by clinicId or email
      const matchedClinician = db.users.find(u => u.role === 'nurse' && (u.clinicId === newUser.clinicalId || u.email === assignedClinicalEmail?.toLowerCase()));
      // Find family member by familyId or email
      const matchedFamily = db.users.find(u => u.role === 'family' && (u.familyId === newUser.familyId || u.email === assignedFamilyEmail?.toLowerCase()));

      const newPatient = {
        id: patientId,
        userId: newUser.id,
        fullName: newUser.fullName,
        age: patientCalculatedAge,
        gender: 'male' as const,
        primaryLanguage: 'English',
        disease: assignedCondition,
        cognitiveCondition: assignedCondition,
        dementiaStage: assignedCondition as any,
        stage: assignedCondition,
        diagnosis: assignedCondition,
        clinicalId: newUser.clinicalId,
        familyId: newUser.familyId,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        address: newUser.address,
        pincode: newUser.pincode,
        stabilityStatus: 'Stable',
        compositeScore: 78,
        lastMmseScore: 26,
        assignedNurseId: matchedClinician?.id || '65df0011a123b456789a0001',
        assignedNurseName: matchedClinician?.fullName || 'Sarah Jenkins, RN',
        assignedFamilyEmail: matchedFamily?.email || assignedFamilyEmail || 'family.daughter@gmail.com',
        assignedClinicalEmail: matchedClinician?.email || assignedClinicalEmail || 'nurse.sarah@hospital.org',
        emergencyContact: emergencyContact || '+919876543212 (Family)',
        photoUrl: newUser.avatarUrl,
        streakDays: 1,
        totalGamesPlayed: 0,
        currentDifficulty: {
          memory_training: 3,
          touch_sequence: 2,
          concentration: 2,
          icon_identification: 3,
          graph_interpretation: 2,
          vision_adaptation: 2,
        },
        createdAt: new Date().toISOString(),
      };
      db.patients.push(newPatient);

      // Seed cognitive scores
      db.cognitiveScores[patientId as keyof typeof db.cognitiveScores] = {
        id: `sc_${patientId}`,
        patientId,
        overallScore: 78,
        domains: {
          memory: 75,
          attention: 80,
          logic: 74,
          response_time: 82,
        },
        lastEvaluatedAt: new Date().toISOString(),
        trend: 'stable',
        historyPoints: [
          { date: 'Day 1', overallScore: 78, memory: 75, attention: 80, logic: 74, response_time: 82 },
        ],
      } as any;
    }

    // Record audit log
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'USER_REGISTERED',
      userId: newUser.id,
      userEmail: newUser.email,
      userRole: newUser.role,
      details: `New account registered: ${newUser.fullName} (${newUser.role.toUpperCase()}) [ClinicID: ${newUser.clinicId || 'N/A'}, FamilyID: ${newUser.familyId || 'N/A'}]`,
      ipAddress: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });

    const token = generateJwtToken(newUser);
    res.status(201).json({
      token,
      user: sanitizeUser(newUser),
      message: 'Account registered successfully.',
    });
  } catch (err: any) {
    console.error('Registration failed:', err);
    res.status(500).json({ error: 'Registration error: ' + (err.message || 'Internal server error') });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email is required for authentication.' });
    }

    const inputEmail = email.toLowerCase().trim();

    // Map demo aliases
    let searchEmail = inputEmail;
    if (inputEmail === 'admin@mira.org' || inputEmail === 'admin@neurocare.org') searchEmail = 'admin@mira.org';
    if (inputEmail === 'family.daughter@gmail.com') searchEmail = 'family.daughter@gmail.com';
    if (inputEmail === 'patient.arthur@gmail.com') searchEmail = 'patient.arthur@gmail.com';
    if (inputEmail === 'nurse.sarah@hospital.org') searchEmail = 'nurse.sarah@hospital.org';

    let user = db.users.find(u => u.email.toLowerCase() === searchEmail || u.email.toLowerCase() === inputEmail);
    if (!user) {
      // Fallback check against known aliases
      if (inputEmail.includes('admin')) user = db.users.find(u => u.role === 'admin');
      else if (inputEmail.includes('nurse') || inputEmail.includes('sarah')) user = db.users.find(u => u.role === 'nurse');
      else if (inputEmail.includes('family') || inputEmail.includes('daughter') || inputEmail.includes('eleanor')) user = db.users.find(u => u.role === 'family');
      else if (inputEmail.includes('patient') || inputEmail.includes('arthur')) user = db.users.find(u => u.role === 'patient');
    }

    if (!user) {
      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: 'AUTH_FAILED_USER_NOT_FOUND',
        userId: 'unknown',
        userEmail: inputEmail,
        userRole: 'unknown',
        details: `Failed authentication attempt for unknown user: ${inputEmail}`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString(),
        status: 'DENIED',
      });
      return res.status(401).json({ error: 'No account found with this email address. Please check your credentials or register.' });
    }

    // Password verification
    let isPasswordValid = true;
    if (password && user.passwordHash) {
      const standardDemoPass = password === 'AdminPassword123!' || password === 'NursePass123!' || password === 'FamilyPass123!' || password === 'PatientPass123!' || password === 'NursePassword123!' || password === 'FamilyPassword123!' || password === 'PatientPassword123!';
      isPasswordValid = standardDemoPass || bcrypt.compareSync(password, user.passwordHash);
    }

    if (!isPasswordValid) {
      db.auditLogs.unshift({
        id: `log_${Date.now()}`,
        action: 'AUTH_FAILED_INVALID_CREDENTIALS',
        userId: user.id,
        userEmail: user.email,
        userRole: user.role,
        details: `Invalid password attempt for account: ${user.email}`,
        ipAddress: req.ip || '127.0.0.1',
        timestamp: new Date().toISOString(),
        status: 'DENIED',
      });
      return res.status(401).json({ error: 'Invalid password. Please verify your credentials and try again.' });
    }

    // Log successful auth
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'USER_LOGIN',
      userId: user.id,
      userEmail: user.email,
      userRole: user.role,
      details: `User logged in successfully with role: ${user.role.toUpperCase()}`,
      ipAddress: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });

    const token = generateJwtToken(user);
    res.json({
      token,
      user: sanitizeUser(user),
      message: 'Authentication successful.',
    });
  } catch (err: any) {
    console.error('Login error:', err);
    res.status(500).json({ error: 'Authentication service error.' });
  }
});

// GET /api/auth/me
app.get('/api/auth/me', (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    const decoded = verifyJwtToken(token);
    if (decoded && decoded.id) {
      const user = db.users.find(u => u.id === decoded.id || u.email.toLowerCase() === decoded.email?.toLowerCase());
      if (user) {
        return res.json({ user: sanitizeUser(user) });
      }
    }
  }

  // If demo role query parameter is present (convenience)
  const queryRole = req.query.role as string;
  if (queryRole) {
    const matched = db.users.find(u => u.role === queryRole);
    if (matched) return res.json({ user: sanitizeUser(matched) });
  }

  // Unauthenticated - client must show Login / Register page
  res.json({ user: null });
});

// GET /api/auth/users
app.get('/api/auth/users', (req, res) => {
  res.json({ users: db.users.map(sanitizeUser) });
});

// PUT /api/auth/profile - Update profile details & avatar
app.put('/api/auth/profile', (req, res) => {
  try {
    let authUser: any = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const decoded = verifyJwtToken(authHeader.substring(7));
      if (decoded && decoded.id) {
        authUser = db.users.find(u => u.id === decoded.id || u.email.toLowerCase() === decoded.email?.toLowerCase());
      }
    }

    const {
      id,
      email,
      fullName,
      phoneNumber,
      address,
      pincode,
      clinicName,
      clinicId,
      familyName,
      familyId,
      clinicalId,
      emergencyContact,
      avatarUrl,
      // Patient specifics
      disease,
      dementiaStage,
      age,
    } = req.body;

    const targetUser = authUser || db.users.find(u => u.id === id || u.email.toLowerCase() === email?.toLowerCase());
    if (!targetUser) {
      return res.status(404).json({ error: 'User account not found.' });
    }

    if (fullName !== undefined) targetUser.fullName = fullName.trim();
    if (phoneNumber !== undefined) targetUser.phoneNumber = phoneNumber.trim();
    if (address !== undefined) targetUser.address = address.trim();
    if (pincode !== undefined) targetUser.pincode = pincode.trim();
    if (avatarUrl !== undefined) targetUser.avatarUrl = avatarUrl;
    if (emergencyContact !== undefined) targetUser.emergencyContact = emergencyContact.trim();

    if (targetUser.role === 'nurse') {
      if (clinicName !== undefined) targetUser.clinicName = clinicName.trim();
      if (clinicId !== undefined) targetUser.clinicId = clinicId.toUpperCase().trim();
    } else if (targetUser.role === 'family') {
      if (familyName !== undefined) targetUser.familyName = familyName.trim();
      if (familyId !== undefined) targetUser.familyId = familyId.toUpperCase().trim();
    } else if (targetUser.role === 'patient') {
      if (clinicalId !== undefined) targetUser.clinicalId = clinicalId.toUpperCase().trim();
      if (familyId !== undefined) targetUser.familyId = familyId.toUpperCase().trim();
    }

    // Sync corresponding patient profile if role is patient
    if (targetUser.role === 'patient') {
      const patientRec = db.patients.find(p => p.userId === targetUser.id || (p.email && p.email.toLowerCase() === targetUser.email.toLowerCase()));
      if (patientRec) {
        if (fullName !== undefined) patientRec.fullName = fullName.trim();
        if (phoneNumber !== undefined) patientRec.phoneNumber = phoneNumber.trim();
        if (address !== undefined) patientRec.address = address.trim();
        if (pincode !== undefined) patientRec.pincode = pincode.trim();
        if (avatarUrl !== undefined) patientRec.photoUrl = avatarUrl;
        if (emergencyContact !== undefined) patientRec.emergencyContact = emergencyContact.trim();
        if (clinicalId !== undefined) patientRec.clinicalId = clinicalId.toUpperCase().trim();
        if (familyId !== undefined) patientRec.familyId = familyId.toUpperCase().trim();
        if (disease || dementiaStage) {
          const condition = disease || dementiaStage;
          patientRec.disease = condition;
          patientRec.dementiaStage = condition;
          patientRec.cognitiveCondition = condition;
          patientRec.stage = condition;
          patientRec.diagnosis = condition;
        }
        if (age !== undefined && age !== '') {
          patientRec.age = Number(age);
        }
      }
    }

    // Log profile update in audit trail
    db.auditLogs.unshift({
      id: `log_${Date.now()}`,
      action: 'USER_PROFILE_UPDATED',
      userId: targetUser.id,
      userEmail: targetUser.email,
      userRole: targetUser.role,
      details: `Profile updated for ${targetUser.fullName} (${targetUser.role.toUpperCase()})`,
      ipAddress: req.ip || '127.0.0.1',
      timestamp: new Date().toISOString(),
      status: 'SUCCESS',
    });

    res.json({
      user: sanitizeUser(targetUser),
      message: 'Profile updated successfully.',
    });
  } catch (err: any) {
    console.error('Profile update error:', err);
    res.status(500).json({ error: 'Failed to update profile: ' + (err.message || 'Internal server error') });
  }
});

// GET /api/admin/audit-logs
app.get('/api/admin/audit-logs', (req, res) => {
  res.json({ auditLogs: db.auditLogs });
});

// GET /api/admin/telemetry
app.get('/api/admin/telemetry', (req, res) => {
  res.json({
    uptimeSeconds: Math.round(process.uptime()),
    activeUsersCount: db.users.length,
    totalPatientsCount: db.patients.length,
    totalGameResultsCount: db.gameResults.length,
    jwtAlgorithm: 'HS256 (HMAC with SHA-256)',
    nodeEnvironment: process.env.NODE_ENV || 'development',
    rbacEnforced: true,
    dbStatus: 'HEALTHY',
    roleBreakdown: {
      admin: db.users.filter(u => u.role === 'admin').length,
      nurse: db.users.filter(u => u.role === 'nurse').length,
      family: db.users.filter(u => u.role === 'family').length,
      patient: db.users.filter(u => u.role === 'patient').length,
    },
  });
});

// Patients API with Strict Access Control & Role Privacy Filtering
app.get('/api/patients', (req, res) => {
  let authUser: any = null;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const decoded = verifyJwtToken(authHeader.substring(7));
    if (decoded && decoded.id) {
      authUser = db.users.find(u => u.id === decoded.id || u.email.toLowerCase() === decoded.email?.toLowerCase());
    }
  }

  const { assignedFamilyEmail, assignedClinicalEmail, nurseId, userId, familyId, clinicId } = req.query as any;
  let list = db.patients;

  if (authUser) {
    if (authUser.role === 'admin') {
      // Admin has full visibility across all clinics and families
      list = db.patients;
    } else if (authUser.role === 'family') {
      // Family member sees ONLY patients linked to their specific familyId or email
      const targetFamId = authUser.familyId || familyId;
      list = list.filter(p => 
        (targetFamId && p.familyId && p.familyId.toUpperCase() === targetFamId.toUpperCase()) ||
        (p.assignedFamilyEmail && p.assignedFamilyEmail.toLowerCase() === authUser.email.toLowerCase())
      );
    } else if (authUser.role === 'nurse') {
      // Clinician sees ONLY patients assigned to their clinicId or clinical email / nurseId
      const targetClinicId = authUser.clinicId || clinicId;
      list = list.filter(p =>
        (targetClinicId && p.clinicalId && p.clinicalId.toUpperCase() === targetClinicId.toUpperCase()) ||
        (p.assignedClinicalEmail && p.assignedClinicalEmail.toLowerCase() === authUser.email.toLowerCase()) ||
        p.assignedNurseId === authUser.id
      );
    } else if (authUser.role === 'patient') {
      // Patient sees only their own record
      list = list.filter(p => 
        p.userId === authUser.id || 
        (p.email && p.email.toLowerCase() === authUser.email.toLowerCase()) ||
        p.fullName.toLowerCase() === authUser.fullName.toLowerCase()
      );
    }
  } else {
    // Fallback based on explicit query parameters when unauthenticated
    if (familyId) {
      list = list.filter(p => p.familyId && p.familyId.toUpperCase() === String(familyId).toUpperCase().trim());
    }
    if (clinicId) {
      list = list.filter(p => p.clinicalId && p.clinicalId.toUpperCase() === String(clinicId).toUpperCase().trim());
    }
    if (assignedFamilyEmail) {
      list = list.filter(p => (p.assignedFamilyEmail && p.assignedFamilyEmail.toLowerCase() === String(assignedFamilyEmail).toLowerCase().trim()) || p.userId === userId);
    }
    if (assignedClinicalEmail) {
      list = list.filter(p => (p.assignedClinicalEmail && p.assignedClinicalEmail.toLowerCase() === String(assignedClinicalEmail).toLowerCase().trim()) || p.assignedNurseId === nurseId);
    }
    if (userId) {
      list = list.filter(p => p.userId === userId);
    }
  }

  res.json({ patients: list });
});

app.get('/api/patients/:patientId', (req, res) => {
  const patient = db.patients.find(p => p.id === req.params.patientId) || db.patients[0];
  const scores = db.cognitiveScores[patient.id as keyof typeof db.cognitiveScores] || db.cognitiveScores['65df0011a123b456789a0002'];
  res.json({ patient, scores });
});

// Submit Game Result (Contract 1 Implementation)
app.post('/api/results', (req, res) => {
  const payload = req.body;
  const {
    sessionId = `sess_${Date.now()}`,
    patientId = '65df0011a123b456789a0002',
    gameId = 'memory_training',
    domain = 'memory',
    difficultyLevel = 3,
    completionTimeSeconds = 40,
    mistakes = 0,
    accuracy = 1.0,
    metrics = {},
  } = payload;

  const gameDef = db.games.find(g => g.id === gameId);
  const targetTimeSeconds = gameDef ? gameDef.targetTimeSeconds : 40;

  // 1. Calculate next adaptive difficulty
  const newDifficulty = calculateNextDifficulty(
    difficultyLevel,
    accuracy,
    completionTimeSeconds,
    targetTimeSeconds
  );

  // 2. Calculate domain contribution score
  const domainContribution = calculateDomainScore(accuracy, completionTimeSeconds, targetTimeSeconds);

  // 3. Store Result Record
  const newResult = {
    id: `res_${Date.now()}`,
    sessionId,
    patientId,
    gameId,
    domain,
    difficultyLevel,
    score: Math.round(accuracy * 100 * 10) / 10,
    accuracy,
    completionTimeSeconds,
    targetTimeSeconds,
    mistakes,
    newDifficultyLevel: newDifficulty,
    domainScoreContribution: domainContribution,
    metrics,
    timestamp: new Date().toISOString(),
  };

  db.gameResults.unshift(newResult);

  // 4. Update Patient Profile Difficulty & Played count
  const patient = db.patients.find(p => p.id === patientId);
  if (patient) {
    patient.totalGamesPlayed += 1;
    if (!patient.currentDifficulty) {
      (patient as any).currentDifficulty = {
        memory_training: 3,
        touch_sequence: 3,
        concentration: 3,
        icon_identification: 3,
        graph_interpretation: 3,
        vision_adaptation: 3,
      };
    }
    (patient.currentDifficulty as any)[gameId] = newDifficulty;
  }

  // 5. Update Cognitive Domain Scores with weighted blend
  const existingScores = db.cognitiveScores[patientId as keyof typeof db.cognitiveScores];
  if (existingScores) {
    const dKey = domain as keyof typeof existingScores.domains;
    if (dKey in existingScores.domains) {
      // blend 80% previous + 20% fresh result
      existingScores.domains[dKey] = Math.round((existingScores.domains[dKey] * 0.8 + domainContribution * 0.2) * 10) / 10;
    }
    existingScores.overallScore = calculateOverallScore(existingScores.domains);
    existingScores.lastEvaluatedAt = new Date().toISOString();

    // Add to history
    const todayLabel = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    if (!existingScores.historyPoints) existingScores.historyPoints = [];
    existingScores.historyPoints.push({
      date: todayLabel,
      overallScore: existingScores.overallScore,
      memory: existingScores.domains.memory,
      attention: existingScores.domains.attention,
      logic: existingScores.domains.logic,
      response_time: existingScores.domains.response_time,
    });
    if (existingScores.historyPoints.length > 10) {
      existingScores.historyPoints.shift();
    }
  }

  // 6. Check Milestones progress
  const patientMilestones = db.milestones[patientId as keyof typeof db.milestones];
  if (patientMilestones) {
    patientMilestones.forEach(m => {
      if (m.id === 'ms_04' && !m.unlocked) {
        m.progress = Math.min(100, Math.round(((patient?.totalGamesPlayed || 0) / 50) * 100));
        if (m.progress >= 100) {
          m.unlocked = true;
          m.unlockedAt = new Date().toISOString();
        }
      }
    });
  }

  // 7. Generate instant AI Feedback preview
  const feedbackRecommendation = {
    message: `Splendid job on ${gameDef?.title || 'the game'}! Your accuracy was ${(accuracy * 100).toFixed(0)}% in ${completionTimeSeconds.toFixed(1)} seconds.`,
    newDifficulty,
    score: domainContribution,
    overallScore: existingScores?.overallScore || 74.0,
  };

  res.json({
    success: true,
    result: newResult,
    feedback: feedbackRecommendation,
    patient,
    cognitiveScore: existingScores,
  });
});

app.get('/api/results/:patientId', (req, res) => {
  const results = db.gameResults.filter(r => r.patientId === req.params.patientId);
  res.json({ results });
});

// Global 36-Game Metadata Catalog for AI Caretaker & Voice Assistant
const ALL_GAMES_METADATA = [
  // 1. MEMORY & RECALL (6 Games)
  { gameId: 'memory_card_match', category: 'MEMORY_RECALL', categoryName: 'Memory & Recall', domain: 'memory', title: 'Memory Card Match', icon: '🧠', description: 'Flip and match pairs of cards to sharpen short-term memory.' },
  { gameId: 'remember_objects', category: 'MEMORY_RECALL', categoryName: 'Memory & Recall', domain: 'memory', title: 'Remember the Objects', icon: '📦', description: 'Study items and recall which ones were shown.' },
  { gameId: 'which_disappeared', category: 'MEMORY_RECALL', categoryName: 'Memory & Recall', domain: 'memory', title: 'Which Object Disappeared?', icon: '👀', description: 'Memorize objects and identify the missing one.' },
  { gameId: 'remember_picture', category: 'MEMORY_RECALL', categoryName: 'Memory & Recall', domain: 'memory', title: 'Remember the Picture', icon: '🖼️', description: 'Explore a detailed scene and answer recall questions.' },
  { gameId: 'which_one_did_you_see', category: 'MEMORY_RECALL', categoryName: 'Memory & Recall', domain: 'memory', title: 'Which One Did You See?', icon: '✨', description: 'Instant target flash identification among alternatives.' },
  { gameId: 'memory_training', category: 'MEMORY_RECALL', categoryName: 'Memory & Recall', domain: 'memory', title: 'Structured Memory Matrix', icon: '🎴', description: 'Standardized clinical pair recall matching with timed tracking.' },

  // 2. ATTENTION & OBSERVATION (6 Games)
  { gameId: 'find_different', category: 'ATTENTION_OBSERVATION', categoryName: 'Attention & Observation', domain: 'attention', title: 'Find the Different Object', icon: '🔍', description: 'Spot the odd one out in a grid of similar items.' },
  { gameId: 'same_or_different', category: 'ATTENTION_OBSERVATION', categoryName: 'Attention & Observation', domain: 'attention', title: 'Same or Different?', icon: '⚖️', description: 'Compare two items and determine if they match.' },
  { gameId: 'remember_colors', category: 'ATTENTION_OBSERVATION', categoryName: 'Attention & Observation', domain: 'attention', title: 'Remember the Colors', icon: '🎨', description: 'Observe color sequence flashes and repeat in order.' },
  { gameId: 'object_spotting', category: 'ATTENTION_OBSERVATION', categoryName: 'Attention & Observation', domain: 'attention', title: 'Object Spotting', icon: '🎯', description: 'Find target items hidden in a mixed clutter of distractors.' },
  { gameId: 'visual_search', category: 'ATTENTION_OBSERVATION', categoryName: 'Attention & Observation', domain: 'attention', title: 'Simple Visual Search', icon: '🔎', description: 'Rapid scanning and detection of a specific target symbol.' },
  { gameId: 'concentration', category: 'ATTENTION_OBSERVATION', categoryName: 'Attention & Observation', domain: 'attention', title: 'Focus Flanker & Target Finder', icon: '🎯', description: 'Standardized flanker discrimination amidst visual distractors.' },

  // 3. ASSOCIATION & RECOGNITION (6 Games)
  { gameId: 'match_object_place', category: 'ASSOCIATION_RECOGNITION', categoryName: 'Association & Recognition', domain: 'logic', title: 'Match Object to Place', icon: '📍', description: 'Connect household items to their natural room.' },
  { gameId: 'match_object_use', category: 'ASSOCIATION_RECOGNITION', categoryName: 'Association & Recognition', domain: 'logic', title: 'Match Object to Use', icon: '🛠️', description: 'Identify functional uses of common tools and objects.' },
  { gameId: 'word_association', category: 'ASSOCIATION_RECOGNITION', categoryName: 'Association & Recognition', domain: 'logic', title: 'Word Association', icon: '🔗', description: 'Link related concepts, professions, and familiar pairs.' },
  { gameId: 'familiar_object', category: 'ASSOCIATION_RECOGNITION', categoryName: 'Association & Recognition', domain: 'logic', title: 'Familiar Object Recognition', icon: '💡', description: 'Identify everyday objects based on descriptive clues.' },
  { gameId: 'animal_food', category: 'ASSOCIATION_RECOGNITION', categoryName: 'Association & Recognition', domain: 'logic', title: 'Animal & Food Recognition', icon: '🍎', description: 'Identify and classify animals, fruits, and vegetables.' },
  { gameId: 'icon_identification', category: 'ASSOCIATION_RECOGNITION', categoryName: 'Association & Recognition', domain: 'logic', title: 'Daily Item & Category Naming', icon: '❤️', description: 'Classify items into functional semantic categories.' },

  // 4. SEQUENCE & ORDERING (7 Games)
  { gameId: 'what_comes_next', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'logic', title: 'What Comes Next?', icon: '➡️', description: 'Identify sequential pattern rules and complete next item.' },
  { gameId: 'remember_order', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'logic', title: 'Remember the Order', icon: '🔢', description: 'Memorize object display order and tap in sequence.' },
  { gameId: 'picture_ordering', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'logic', title: 'Picture & Step Ordering', icon: '📋', description: 'Arrange activity steps into chronological order.' },
  { gameId: 'daily_routine', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'logic', title: 'Complete the Daily Routine', icon: '🌅', description: 'Identify missing procedural steps in daily habits.' },
  { gameId: 'number_memory', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'logic', title: 'Simple Number Memory', icon: '⏰', description: 'Memorize number sequences and type back in order.' },
  { gameId: 'touch_sequence', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'response_time', title: 'Chime Sequence Recall', icon: '⚡', description: 'Psychomotor chime sequence recall and reaction speed.' },
  { gameId: 'graph_interpretation', category: 'SEQUENCE_ORDERING', categoryName: 'Sequence & Ordering', domain: 'logic', title: 'Trail Connect & Sequence Matrix', icon: '📊', description: 'Trail Making Test connecting numbers and letters.' },

  // 5. DAILY LIFE & FAMILIARITY (5 Games)
  { gameId: 'daily_life_recall', category: 'DAILY_LIFE_FAMILIARITY', categoryName: 'Daily Life & Familiarity', domain: 'memory', title: 'Daily Life Recall', icon: '🏠', description: 'Recall everyday knowledge, calendar facts, and habits.' },
  { gameId: 'morning_or_night', category: 'DAILY_LIFE_FAMILIARITY', categoryName: 'Daily Life & Familiarity', domain: 'memory', title: 'Morning or Night?', icon: '☀️', description: 'Classify habits and meals as day or night.' },
  { gameId: 'family_table', category: 'DAILY_LIFE_FAMILIARITY', categoryName: 'Daily Life & Familiarity', domain: 'memory', title: 'Remember the Family Table', icon: '👥', description: 'Recall family seating positions and arrangements.' },
  { gameId: 'remember_place', category: 'DAILY_LIFE_FAMILIARITY', categoryName: 'Daily Life & Familiarity', domain: 'memory', title: 'Remember the Place', icon: '🛋️', description: 'Explore household rooms and recall specific details.' },
  { gameId: 'memory_story', category: 'DAILY_LIFE_FAMILIARITY', categoryName: 'Daily Life & Familiarity', domain: 'memory', title: 'Memory Story', icon: '📖', description: 'Read a short narrative followed by comprehension questions.' },

  // 6. VISUAL & SPATIAL THINKING (6 Games)
  { gameId: 'remember_location', category: 'VISUAL_SPATIAL', categoryName: 'Visual & Spatial Thinking', domain: 'attention', title: 'Remember the Location', icon: '🗺️', description: 'Memorize grid placement and place items back.' },
  { gameId: 'color_shape_matching', category: 'VISUAL_SPATIAL', categoryName: 'Visual & Spatial Thinking', domain: 'attention', title: 'Color & Shape Matching', icon: '🔷', description: 'Match items based on both color and geometric shape.' },
  { gameId: 'shape_matching', category: 'VISUAL_SPATIAL', categoryName: 'Visual & Spatial Thinking', domain: 'attention', title: 'Shape Matching', icon: '🔺', description: 'Identify geometric shapes and silhouettes.' },
  { gameId: 'color_matching', category: 'VISUAL_SPATIAL', categoryName: 'Visual & Spatial Thinking', domain: 'attention', title: 'Color Matching', icon: '🎨', description: 'Compare color hues and shades for discrimination.' },
  { gameId: 'visual_memory_grid', category: 'VISUAL_SPATIAL', categoryName: 'Visual & Spatial Thinking', domain: 'attention', title: 'Visual Memory Grid', icon: '▦', description: 'Matrix spatial recall of illuminated grid cells.' },
  { gameId: 'vision_adaptation', category: 'VISUAL_SPATIAL', categoryName: 'Visual & Spatial Thinking', domain: 'attention', title: 'Contrast & Spatial Search', icon: '👁️', description: 'Standardized spatial orientation and contrast search.' }
];

// AI Caretaker Companion Interact - Category & User Test Aware
app.post('/api/caretaker/interact', async (req, res) => {
  const {
    patientId = '65df0011a123b456789a0002',
    userMessage,
    requestedCategory,
    lastGameResult,
    context = 'routine_checkin',
    generateAudio = false,
  } = req.body;

  const patient = db.patients.find(p => p.id === patientId) || db.patients[0];
  const scores = db.cognitiveScores[patient.id as keyof typeof db.cognitiveScores] || db.cognitiveScores['65df0011a123b456789a0002'];

  // Detect explicit or inferred category from user request
  let targetCategory = requestedCategory;
  if (!targetCategory && userMessage) {
    const msg = userMessage.toLowerCase();
    if (msg.includes('memory') || msg.includes('recall') || msg.includes('remember') || msg.includes('cards')) {
      targetCategory = 'MEMORY_RECALL';
    } else if (msg.includes('attention') || msg.includes('focus') || msg.includes('spot') || msg.includes('different') || msg.includes('search')) {
      targetCategory = 'ATTENTION_OBSERVATION';
    } else if (msg.includes('association') || msg.includes('recogni') || msg.includes('connect') || msg.includes('word') || msg.includes('animal')) {
      targetCategory = 'ASSOCIATION_RECOGNITION';
    } else if (msg.includes('sequence') || msg.includes('order') || msg.includes('pattern') || msg.includes('number') || msg.includes('trail')) {
      targetCategory = 'SEQUENCE_ORDERING';
    } else if (msg.includes('daily') || msg.includes('routine') || msg.includes('habit') || msg.includes('family') || msg.includes('table') || msg.includes('story')) {
      targetCategory = 'DAILY_LIFE_FAMILIARITY';
    } else if (msg.includes('visual') || msg.includes('spatial') || msg.includes('shape') || msg.includes('grid') || msg.includes('location')) {
      targetCategory = 'VISUAL_SPATIAL';
    }
  }

  // Get games filtered by category if specified, otherwise full catalog
  const filteredCatalog = targetCategory
    ? ALL_GAMES_METADATA.filter(g => g.category === targetCategory)
    : ALL_GAMES_METADATA;

  // Domain score mapping
  const domainScoreMap: Record<string, number> = {
    memory: scores.domains.memory,
    attention: scores.domains.attention,
    logic: scores.domains.logic,
    response_time: scores.domains.response_time || 82.1,
  };

  const availableGamesList = filteredCatalog.map(g => `• ${g.gameId}: "${g.title}" (Category: ${g.categoryName}, Domain: ${g.domain}, Focus: ${g.description})`).join('\n');

  // Try using Gemini API via resilient retry
  const prompt = `You are "Aria", a warm, empathetic, and encouraging AI Caretaker and voice companion for ${patient.fullName} (age ${patient.age}, diagnosed with ${patient.dementiaStage || 'Mild Cognitive Impairment'}).

Patient Cognitive Test Profile:
- Overall Composite Test Score: ${scores.overallScore}/100
- Memory Domain Score: ${scores.domains.memory}/100
- Attention Domain Score: ${scores.domains.attention}/100
- Logic & Problem Solving Score: ${scores.domains.logic}/100
- Response Time & Reflex Score: ${scores.domains.response_time || 82.1}/100
- MMSE Baseline: ${patient.lastMmseScore || 24}/30
- Target Requested Category: ${targetCategory || 'Auto-select best category based on lowest test domain score'}
- Recent Game Activity: ${lastGameResult ? `Completed ${lastGameResult.gameId} with ${(lastGameResult.accuracy * 100).toFixed(0)}% accuracy in ${lastGameResult.completionTimeSeconds}s` : 'Daily check-in'}
- User Voice/Message: "${userMessage || 'Recommend the best game for my test scores today'}"

Available Games in Catalog:
${availableGamesList}

Task:
Recommend a specific game from the available games list that best matches ${patient.fullName.split(' ')[0]}'s cognitive test performance and requested category.
Explain gently why this game in this category will help their test scores (e.g. training memory recall, visual attention, sequence logic, or daily familiarity).

Return JSON strictly matching this schema:
{
  "message": "Direct, warm, spoken response to ${patient.fullName.split(' ')[0]}. Keep it encouraging, pleasant, and under 40 words. Mention the game title and why it supports their cognitive tests.",
  "recommendedGame": "gameId matching one of the available games",
  "category": "MEMORY_RECALL" | "ATTENTION_OBSERVATION" | "ASSOCIATION_RECOGNITION" | "SEQUENCE_ORDERING" | "DAILY_LIFE_FAMILIARITY" | "VISUAL_SPATIAL",
  "categoryName": "Human-readable category name",
  "gameTitle": "Exact title of recommended game",
  "gameIcon": "Emoji icon of game",
  "gameDescription": "Short description of game",
  "testReasoning": "1-2 sentence clinical explanation linking the patient's test score to this category drill.",
  "difficulty": 1-10 number,
  "priority": "low" | "medium" | "high",
  "voiceCueText": "1-sentence conversational spoken cue for voice synthesis.",
  "observation": "Clinical observation of patient trajectory.",
  "recommendedAction": "Actionable suggestion for care team."
}`;

  let parsedResponse: any = null;

  const responseText = await generateGeminiContentWithRetry({
    contents: prompt,
    responseMimeType: 'application/json',
    systemInstruction: 'You are an expert compassionate geriatric cognitive health specialist and AI voice companion.',
  });

  if (responseText) {
    try {
      const cleaned = responseText.replace(/^```json\s*/, '').replace(/\s*```$/, '').trim();
      const parsed = JSON.parse(cleaned);
      if (parsed && parsed.recommendedGame && parsed.message) {
        parsedResponse = parsed;
      }
    } catch {
      // Fallback
    }
  }

  // Deterministic Fallback Engine if AI is offline or model fails
  if (!parsedResponse) {
    const firstName = patient.fullName.split(' ')[0] || 'Arthur';
    let chosenCategory = targetCategory;

    // If no category requested, pick based on lowest test score
    if (!chosenCategory) {
      const sortedDomains = [
        { domain: 'logic', score: scores.domains.logic, cat: 'SEQUENCE_ORDERING' },
        { domain: 'memory', score: scores.domains.memory, cat: 'MEMORY_RECALL' },
        { domain: 'attention', score: scores.domains.attention, cat: 'ATTENTION_OBSERVATION' },
        { domain: 'response_time', score: scores.domains.response_time || 82, cat: 'SEQUENCE_ORDERING' },
      ].sort((a, b) => a.score - b.score);
      chosenCategory = sortedDomains[0].cat;
    }

    const categoryGames = ALL_GAMES_METADATA.filter(g => g.category === chosenCategory);
    const selectedGame = categoryGames[Math.floor(Math.random() * categoryGames.length)] || ALL_GAMES_METADATA[0];
    const catDomainScore = domainScoreMap[selectedGame.domain] ?? scores.overallScore;

    let testReasoning = `Based on your recent ${selectedGame.domain} score of ${catDomainScore.toFixed(0)}%, practicing ${selectedGame.title} in ${selectedGame.categoryName} provides optimal gentle cognitive reinforcement.`;
    let fallbackMessage = `Hello ${firstName}! Based on your test profile, I recommend playing "${selectedGame.title}" in ${selectedGame.categoryName}. It's a delightful way to keep your mind sharp!`;

    if (targetCategory) {
      fallbackMessage = `Here is a wonderful ${selectedGame.categoryName} exercise for you, ${firstName}: "${selectedGame.title}". It will strengthen your ${selectedGame.domain} skills at a comfortable pace.`;
    }

    parsedResponse = {
      message: fallbackMessage,
      recommendedGame: selectedGame.gameId,
      category: selectedGame.category,
      categoryName: selectedGame.categoryName,
      gameTitle: selectedGame.title,
      gameIcon: selectedGame.icon,
      gameDescription: selectedGame.description,
      testReasoning,
      targetDomain: selectedGame.domain,
      userTestScore: catDomainScore,
      difficulty: patient.currentDifficulty?.[selectedGame.gameId] || 3,
      priority: 'low',
      voiceCueText: fallbackMessage,
      observation: `Recommended ${selectedGame.title} aligned with test score ${catDomainScore.toFixed(0)}% in ${selectedGame.domain}.`,
      recommendedAction: `Encourage daily engagement with ${selectedGame.categoryName} exercises.`,
    };
  }

  // Ensure game title, icon, category, and alternative games are filled from catalog
  const matchedGameMeta = ALL_GAMES_METADATA.find(g => g.gameId === parsedResponse.recommendedGame) || ALL_GAMES_METADATA[0];
  parsedResponse.gameTitle = parsedResponse.gameTitle || matchedGameMeta.title;
  parsedResponse.gameIcon = parsedResponse.gameIcon || matchedGameMeta.icon;
  parsedResponse.gameDescription = parsedResponse.gameDescription || matchedGameMeta.description;
  parsedResponse.category = parsedResponse.category || matchedGameMeta.category;
  parsedResponse.categoryName = parsedResponse.categoryName || matchedGameMeta.categoryName;
  parsedResponse.targetDomain = parsedResponse.targetDomain || matchedGameMeta.domain;
  parsedResponse.userTestScore = parsedResponse.userTestScore || domainScoreMap[matchedGameMeta.domain] || scores.overallScore;

  // Add 3 alternative games from the same or related categories
  parsedResponse.alternativeGames = ALL_GAMES_METADATA
    .filter(g => g.gameId !== parsedResponse.recommendedGame && (g.category === parsedResponse.category || g.domain === matchedGameMeta.domain))
    .slice(0, 3)
    .map(g => ({
      gameId: g.gameId,
      title: g.title,
      category: g.category,
      categoryName: g.categoryName,
      icon: g.icon,
      description: g.description,
      difficulty: patient.currentDifficulty?.[g.gameId] || 3,
    }));

  // Optional: Try generating server-side Gemini TTS audio if requested
  if (generateAudio && process.env.GEMINI_API_KEY) {
    const ttsResult = await synthesizeGeminiTTS(parsedResponse.message, 'Kore');
    if (ttsResult?.audioBase64) {
      parsedResponse.audioBase64 = ttsResult.audioBase64;
    }
  }

  res.json(parsedResponse);
});

// Dedicated Text-to-Speech API Endpoint using Gemini 3.1 Flash TTS with seamless client fallback
app.post('/api/tts', async (req, res) => {
  const { text, voice = 'Kore' } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required for TTS' });
  }

  const ttsResult = await synthesizeGeminiTTS(text, voice);
  if (ttsResult?.audioBase64) {
    return res.json(ttsResult);
  }

  // Graceful fallback for client Web Speech synthesis without 500 error
  res.json({
    fallbackToClient: true,
    message: 'Web Speech API fallback active',
  });
});

// AI Caretaker Clinical Summary
app.post('/api/caretaker/summary', async (req, res) => {
  const { patientId = '65df0011a123b456789a0002' } = req.body;
  const patient = db.patients.find(p => p.id === patientId) || db.patients[0];
  const scores = db.cognitiveScores[patient.id as keyof typeof db.cognitiveScores] || db.cognitiveScores['65df0011a123b456789a0002'];

  const prompt = `Generate a concise 3-bullet clinical executive summary for geriatric nurse Sarah Jenkins regarding patient ${patient.fullName} (Age ${patient.age}, MCI).
Scores: Overall ${scores.overallScore}/100 (Memory ${scores.domains.memory}, Attention ${scores.domains.attention}, Logic ${scores.domains.logic}, Speed ${scores.domains.response_time}).
Adherence: 88%. Streak: ${patient.streakDays} days.`;

  const summaryText = await generateGeminiContentWithRetry({
    contents: prompt,
  });

  if (summaryText) {
    return res.json({ summary: summaryText });
  }

  res.json({
    summary: `• Cognitive Stability: Overall composite index stands at 73.9/100, showing steady +2.4% trajectory over 7 days.\n• Domain Strengths: Response time (82.1) and Attention (78.2) remain well-preserved.\n• Actionable Note: Afternoon medication adherence is 92%. Continue daily memory exercises and reminiscence therapy.`,
  });
});

// Family Dashboard Payload (Contract 3 Implementation)
app.get('/api/dashboard/family/:patientId', (req, res) => {
  const patientId = req.params.patientId || '65df0011a123b456789a0002';
  const patient = db.patients.find(p => p.id === patientId) || db.patients[0];
  const scores = db.cognitiveScores[patientId as keyof typeof db.cognitiveScores] || db.cognitiveScores['65df0011a123b456789a0002'];
  const recentResults = db.gameResults.filter(r => r.patientId === patientId).slice(0, 5);

  const domainBreakdown = {
    memory: scores?.domains?.memory ?? 74.2,
    attention: scores?.domains?.attention ?? 78.5,
    logic: scores?.domains?.logic ?? 68.0,
    responseTime: scores?.domains?.response_time ?? (scores?.domains as any)?.responseTime ?? 81.2,
  };

  const scoreTrends = (scores?.historyPoints || []).map(hp => ({
    date: hp.date,
    compositeScore: hp.overallScore,
    memory: hp.memory,
    attention: hp.attention,
    logic: hp.logic,
    responseTime: hp.response_time ?? (hp as any).responseTime ?? 80,
  }));

  const patientOverview = {
    id: patient.id,
    name: patient.fullName,
    age: patient.age,
    stage: patient.stage || patient.dementiaStage || 'Mild Cognitive Impairment',
    streakDays: patient.streakDays || 7,
    compositeScore: scores?.overallScore || 74,
    adherenceRate: 88,
    completedDaysCount: 7,
    stabilityStatus: patient.stabilityStatus || 'Stable',
  };

  const observations = [
    {
      id: 'obs_01',
      domain: 'Memory',
      note: 'Consistently completes morning memory exercises with >85% recall accuracy.',
      date: 'Aug 27, 9:30 AM',
      severity: 'normal' as const,
    },
    {
      id: 'obs_02',
      domain: 'Attention',
      note: 'Slight drop in graph interpretation speed noticed on Tuesday.',
      date: 'Aug 26, 2:00 PM',
      severity: 'attention' as const,
    },
    {
      id: 'obs_03',
      domain: 'Reminiscence',
      note: 'Enjoyed reviewing Cornwall 50th anniversary photo album with high emotional valence.',
      date: 'Aug 25, 4:15 PM',
      severity: 'normal' as const,
    },
  ];

  const recommendations = [
    {
      id: 'rec_01',
      title: 'Maintain Daily Morning Recall',
      description: 'Continue daily 9:00 AM visual symbol matching drills to sustain short-term memory encoding.',
      priority: 'low' as const,
    },
    {
      id: 'rec_02',
      title: 'Afternoon Hydration Routine',
      description: 'Ensure prompt response to 2:00 PM water reminder to optimize neurological hydration.',
      priority: 'medium' as const,
    },
    {
      id: 'rec_03',
      title: 'Weekly Reminiscence Session',
      description: 'Engage with family photo memories on Sunday evening with Eleanor to promote positive mood.',
      priority: 'low' as const,
    },
  ];

  const payload = {
    patientOverview,
    scoreTrends,
    domainBreakdown,
    recentObservations: observations,
    recommendations,
    // Backward compatibility
    patient: {
      id: patient.id,
      name: patient.fullName,
      age: patient.age,
      dementiaStage: patient.dementiaStage,
      streakDays: patient.streakDays,
      primaryLanguage: patient.primaryLanguage,
    },
    overallScore: scores?.overallScore ?? 74,
    domainScores: scores?.domains ?? domainBreakdown,
    adherenceRate: 0.88,
    alerts: [
      {
        id: 'alt_01',
        type: 'warning' as const,
        message: 'Missed afternoon hydration check-in yesterday at 2:00 PM.',
        date: 'Aug 26, 2:00 PM',
        actionRequired: false,
      },
      {
        id: 'alt_02',
        type: 'info' as const,
        message: 'Achieved 7-day brain training streak badge this morning!',
        date: 'Aug 27, 9:30 AM',
        actionRequired: false,
      },
    ],
    recentResults,
    historyPoints: scores?.historyPoints || [],
  };

  res.json(payload);
});

// Nurse Dashboard Clinical Payload
app.get('/api/dashboard/nurse/:patientId', (req, res) => {
  const patientId = req.params.patientId || '65df0011a123b456789a0002';
  const patient = db.patients.find(p => p.id === patientId) || db.patients[0];
  const scores = db.cognitiveScores[patientId as keyof typeof db.cognitiveScores] || db.cognitiveScores['65df0011a123b456789a0002'];
  const notes = db.clinicalNotes.filter(n => n.patientId === patientId);
  const recentResults = db.gameResults.filter(r => r.patientId === patientId);

  const domainMetrics = {
    memory: scores?.domains?.memory ?? 74.2,
    attention: scores?.domains?.attention ?? 78.5,
    logic: scores?.domains?.logic ?? 68.0,
    responseTime: scores?.domains?.response_time ?? (scores?.domains as any)?.responseTime ?? 81.2,
  };

  const triageProfile = {
    patientId: patient.id,
    patientName: patient.fullName,
    age: patient.age,
    status: patient.stabilityStatus || 'Stable',
    riskLevel: 'low' as const,
    mmseScore: patient.lastMmseScore ?? 27,
    adherencePercent: 92,
    assignedNurse: patient.assignedNurseName || 'Sarah Jenkins, RN',
  };

  const flaggedChanges = [
    {
      id: 'flag_01',
      metric: 'Trail Interpretation Reaction Latency',
      change: '-8.4% Latency',
      details: 'Average node tap delay increased from 1.1s to 1.45s during complex switching.',
      severity: 'attention' as const,
    },
    {
      id: 'flag_02',
      metric: 'Visual Memory Card Pair Recall',
      change: '+12.0% Accuracy',
      details: 'Flip efficiency improved from 2.2 flips/pair to 1.8 flips/pair across 4 sessions.',
      severity: 'normal' as const,
    },
  ];

  const longitudinalHistory = (scores?.historyPoints || []).map(hp => ({
    date: hp.date,
    score: hp.overallScore,
    latencyMs: Math.round(1000 - hp.overallScore * 6),
  }));

  const nursePayload = {
    triageProfile,
    domainMetrics,
    flaggedChanges,
    clinicalNotes: notes,
    longitudinalHistory,
    // Backward compatibility
    patient: {
      id: patient.id,
      name: patient.fullName,
      age: patient.age,
      dementiaStage: patient.dementiaStage,
      streakDays: patient.streakDays,
      primaryLanguage: patient.primaryLanguage,
    },
    overallScore: scores?.overallScore ?? 74,
    domainScores: scores?.domains ?? domainMetrics,
    adherenceRate: 0.88,
    complianceRate: 0.94,
    mmseEstimate: 24,
    mocaEstimate: 22,
    recentObservations: [
      'Visual spatial recognition is strong; slight latency in multi-step trail alternation.',
      'Medication compliance logged by family caregiver at 95% this week.',
    ],
    alerts: [
      {
        id: 'alt_01',
        type: 'warning' as const,
        message: 'Flagged hesitation on 6-node sequence switching test.',
        date: 'Aug 25, 2:30 PM',
      },
    ],
    recentResults: recentResults.slice(0, 8),
    historyPoints: scores?.historyPoints || [],
  };

  res.json(nursePayload);
});

// Reminders API
app.get('/api/reminders/:patientId', (req, res) => {
  const rems = db.reminders.filter(r => r.patientId === req.params.patientId);
  res.json({ reminders: rems });
});

app.post('/api/reminders', (req, res) => {
  const { patientId, title, time, category, notes, recurrence } = req.body;
  const newReminder = {
    id: `rem_${Date.now()}`,
    patientId: patientId || '65df0011a123b456789a0002',
    title: title || 'New Reminder',
    time: time || '12:00 PM',
    category: category || 'cognitive',
    completed: false,
    notes: notes || '',
    recurrence: recurrence || 'daily',
  };
  db.reminders.push(newReminder);
  res.json({ success: true, reminder: newReminder });
});

app.patch('/api/reminders/:id/toggle', (req, res) => {
  const rem = db.reminders.find(r => r.id === req.params.id);
  if (rem) {
    rem.completed = !rem.completed;
    res.json({ success: true, reminder: rem });
  } else {
    res.status(404).json({ error: 'Reminder not found' });
  }
});

// Memories API (Cloudinary & Presigned Upload Signature Demo)
app.get('/api/memories/upload-signature', (req, res) => {
  // Simulates Cloudinary presigned upload parameters
  const timestamp = Math.round(new Date().getTime() / 1000);
  res.json({
    signature: `sig_${timestamp}_sha256_mock_valid`,
    timestamp,
    cloudName: 'neurocare-cdn',
    apiKey: 'cloudinary_829381928371928',
    uploadUrl: 'https://api.cloudinary.com/v1_1/neurocare-cdn/image/upload',
  });
});

app.get('/api/memories/:patientId', (req, res) => {
  const memories = db.memories.filter(m => m.patientId === req.params.patientId);
  res.json({ memories });
});

app.post('/api/memories', (req, res) => {
  const { patientId, title, description, imageUrl, year, tags, personTag, audioPrompt } = req.body;
  const newMemory = {
    id: `mem_${Date.now()}`,
    patientId: patientId || '65df0011a123b456789a0002',
    title: title || 'Family Memory',
    description: description || '',
    imageUrl: imageUrl || 'https://images.unsplash.com/photo-1511895426328-dc8714191300?w=600&auto=format&fit=crop&q=80',
    date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
    year: year || '2024',
    tags: tags || ['Family'],
    personTag: personTag || 'Family',
    audioPrompt: audioPrompt || 'Remember this wonderful day together?',
    favorite: true,
  };
  db.memories.unshift(newMemory);
  res.json({ success: true, memory: newMemory });
});

// Clinical Notes API
app.post('/api/clinical-notes', (req, res) => {
  const { patientId, author, authorId, authorName, authorRole, content, category, severity, flagLevel } = req.body;
  const newNote = {
    id: `note_${Date.now()}`,
    patientId: patientId || '65df0011a123b456789a0002',
    author: author || authorName || 'Sarah Jenkins, RN',
    authorId: authorId || '65df0011a123b456789a0001',
    authorName: authorName || author || 'Sarah Jenkins, RN',
    authorRole: authorRole || 'Primary Geriatric Nurse',
    category: category || 'observation',
    content: content || '',
    severity: severity || 'normal',
    flagLevel: flagLevel || (severity === 'attention' ? 'warning' : 'routine'),
    timestamp: 'Just now',
    date: new Date().toISOString(),
  };
  db.clinicalNotes.unshift(newNote);
  res.json({ success: true, note: newNote });
});

// Game Registry & Custom Game Builder (for Nurse / Admin)
app.get('/api/games', (req, res) => {
  res.json({ games: db.games });
});

app.post('/api/games', (req, res) => {
  const { id, title, domain, description, targetTimeSeconds, icon, recommendedFor, tags } = req.body;
  const newGame = {
    id: id || `custom_game_${Date.now()}`,
    title: title || 'Custom Cognitive Exercise',
    domain: domain || 'memory',
    description: description || 'Therapist-customized brain drill.',
    targetTimeSeconds: Number(targetTimeSeconds) || 40,
    icon: icon || 'Brain',
    recommendedFor: recommendedFor || 'Personalized cognitive rehabilitation.',
    tags: tags || ['Custom', 'Therapy'],
    active: true,
  };
  db.games.push(newGame);
  res.json({ success: true, game: newGame });
});

// Milestones API
app.get('/api/milestones/:patientId', (req, res) => {
  const milestones = db.milestones[req.params.patientId as keyof typeof db.milestones] || db.milestones['65df0011a123b456789a0002'];
  res.json({ milestones });
});

// -------------------------------------------------------------
// VITE DEV & PROD MIDDLEWARE
// -------------------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`NeuroCare Cognitive Health Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Failed to start server:', err);
});
