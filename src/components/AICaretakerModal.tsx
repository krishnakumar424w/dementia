import React, { useState, useEffect, useRef } from 'react';
import { PatientProfile, CaretakerInteractionResponse, CognitiveCategory } from '../types';
import { api } from '../services/api';
import { sounds } from '../services/audio';
import { 
  Sparkles, Send, Mic, MicOff, Volume2, VolumeX, 
  X, Brain, Bot, RefreshCw, Zap,
  ChevronRight, Play, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface AICaretakerModalProps {
  isOpen: boolean;
  onClose: () => void;
  patient: PatientProfile;
  onLaunchGame: (gameId: string) => void;
  initialCategory?: CognitiveCategory;
}

interface ChatMessage {
  id: string;
  sender: 'aria' | 'patient';
  text: string;
  timestamp: string;
  recommendation?: CaretakerInteractionResponse;
  audioBase64?: string;
}

const CATEGORY_TABS: Array<{ id: CognitiveCategory | 'ALL'; name: string; icon: string; domain: string }> = [
  { id: 'ALL', name: 'Best for Tests', icon: '🌟', domain: 'Adaptive' },
  { id: 'MEMORY_RECALL', name: 'Memory & Recall', icon: '🧠', domain: 'Memory' },
  { id: 'ATTENTION_OBSERVATION', name: 'Attention & Focus', icon: '👀', domain: 'Attention' },
  { id: 'ASSOCIATION_RECOGNITION', name: 'Association', icon: '🔗', domain: 'Logic' },
  { id: 'SEQUENCE_ORDERING', name: 'Sequence Logic', icon: '🔢', domain: 'Logic / Speed' },
  { id: 'DAILY_LIFE_FAMILIARITY', name: 'Daily Life', icon: '🏠', domain: 'Episodic' },
  { id: 'VISUAL_SPATIAL', name: 'Visual & Spatial', icon: '🧩', domain: 'Spatial' },
];

export const AICaretakerModal: React.FC<AICaretakerModalProps> = ({
  isOpen,
  onClose,
  patient,
  onLaunchGame,
  initialCategory,
}) => {
  const [activeCategory, setActiveCategory] = useState<CognitiveCategory | 'ALL'>(initialCategory || 'ALL');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [isListening, setIsListening] = useState<boolean>(false);
  const [voiceAutoPlay, setVoiceAutoPlay] = useState<boolean>(true);
  const [audioSource, setAudioSource] = useState<'gemini' | 'browser'>('browser');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  // Initialize greeting and category recommendation when modal opens
  useEffect(() => {
    if (isOpen) {
      if (initialCategory) {
        setActiveCategory(initialCategory);
      }
      sounds.playAriaGreeting();

      if (messages.length === 0) {
        fetchCategoryRecommendation(initialCategory || undefined);
      }
    }
  }, [isOpen, initialCategory]);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Text-to-Speech: Plays Gemini high-fidelity TTS audio if available, or Web Speech API fallback
  const playOrSpeak = async (text: string, audioBase64?: string) => {
    if (!voiceAutoPlay) return;

    if (audioBase64) {
      try {
        setIsSpeaking(true);
        setAudioSource('gemini');
        await sounds.playAudioBase64(audioBase64);
        setIsSpeaking(false);
        return;
      } catch (err) {
        console.warn('Gemini audio playback error, falling back to Web Speech:', err);
      }
    }

    // Web Speech API Fallback
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.92;
      utterance.pitch = 1.02;

      const voices = window.speechSynthesis.getVoices();
      const friendlyVoice = voices.find(v => 
        v.lang.startsWith('en') && (
          v.name.includes('Samantha') || 
          v.name.includes('Natural') || 
          v.name.includes('Google') || 
          v.name.includes('Karen') ||
          v.name.includes('Victoria')
        )
      );
      if (friendlyVoice) utterance.voice = friendlyVoice;

      utterance.onstart = () => {
        setIsSpeaking(true);
        setAudioSource('browser');
      };
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      window.speechSynthesis.speak(utterance);
    }
  };

  // Fetch AI Caretaker Recommendation based on Category and Test Performance
  const fetchCategoryRecommendation = async (category?: CognitiveCategory) => {
    setIsLoading(true);
    const patientFirstName = patient?.fullName ? patient.fullName.split(' ')[0] : 'Arthur';

    try {
      const response = await api.interactWithCaretaker({
        patientId: patient.id,
        requestedCategory: category,
        userMessage: category 
          ? `Recommend the best game in the ${category.replace(/_/g, ' ')} category based on my cognitive test scores.`
          : `Hello Aria, recommend the best exercise for my test scores today.`,
        generateAudio: true,
      });

      sounds.playGameRecommended();

      const ariaMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'aria',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: response,
        audioBase64: response.audioBase64,
      };

      setMessages(prev => [...prev, ariaMsg]);
      playOrSpeak(response.message, response.audioBase64);
    } catch (err) {
      console.error('Caretaker recommendation error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now()}`,
        sender: 'aria',
        text: `Hello ${patientFirstName}! Based on your test profile, let's practice Memory Card Match to strengthen your recall today.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: {
          message: `Let's train your short-term memory today with Memory Card Match!`,
          observation: 'Steady cognitive performance observed.',
          recommendedAction: 'Engage in light memory matching drill.',
          recommendedGame: 'memory_card_match',
          category: 'MEMORY_RECALL',
          categoryName: 'Memory & Recall',
          gameTitle: 'Memory Card Match',
          gameIcon: '🧠',
          gameDescription: 'Flip and match pairs of cards to sharpen short-term memory.',
          testReasoning: 'Supports short-term memory retention and visual pattern recognition.',
          difficulty: patient?.currentDifficulty?.memory_card_match || 3,
          priority: 'low',
        },
      };
      setMessages(prev => [...prev, fallbackMsg]);
      playOrSpeak(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  // Web Speech API - Speech to Text
  const toggleListening = () => {
    if (typeof window === 'undefined') return;
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported by this browser. Please type your message below.');
      return;
    }

    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
      sounds.playListeningStop();
      return;
    }

    try {
      sounds.playListeningStart();
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'en-US';

      recognition.onstart = () => setIsListening(true);
      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputVal(transcript);
        setIsListening(false);
        sounds.playListeningStop();
        handleSendMessage(transcript);
      };
      recognition.onerror = () => {
        setIsListening(false);
        sounds.playListeningStop();
      };
      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

  const handleCategorySelect = (category: CognitiveCategory | 'ALL') => {
    setActiveCategory(category);
    const catParam = category === 'ALL' ? undefined : category;
    fetchCategoryRecommendation(catParam);
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputVal;
    if (!textToSend.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: `msg_${Date.now()}`,
      sender: 'patient',
      text: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputVal('');
    setIsLoading(true);

    try {
      const response = await api.interactWithCaretaker({
        patientId: patient.id,
        userMessage: textToSend,
        requestedCategory: activeCategory === 'ALL' ? undefined : activeCategory,
        generateAudio: true,
        context: 'patient_voice_chat',
      });

      sounds.playGameRecommended();

      const ariaMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'aria',
        text: response.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        recommendation: response,
        audioBase64: response.audioBase64,
      };

      setMessages(prev => [...prev, ariaMsg]);
      playOrSpeak(response.message, response.audioBase64);
    } catch (err) {
      console.error('Caretaker response error:', err);
      const fallbackMsg: ChatMessage = {
        id: `msg_${Date.now() + 1}`,
        sender: 'aria',
        text: `You're doing wonderfully today! Take a moment to relax, and we can do a gentle drill whenever you feel ready.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
      playOrSpeak(fallbackMsg.text);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const firstName = patient?.fullName ? patient.fullName.split(' ')[0] : 'Arthur';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 15 }}
        className="bg-white w-full max-w-5xl h-[94vh] max-h-[880px] min-h-[560px] rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200"
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-950 text-white px-5 py-4 flex items-center justify-between border-b border-indigo-800/40 shrink-0">
          <div className="flex items-center space-x-3.5">
            <div className="relative">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-500 to-indigo-500 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
              </div>
              {isSpeaking && (
                <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-400 border-2 border-slate-900 rounded-full animate-ping" />
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2.5">
                <h2 className="font-extrabold text-base sm:text-lg tracking-tight text-white m-0 p-0 leading-none">
                  Aria • AI Voice Assistant
                </h2>
                <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 rounded-full font-mono text-xs font-bold">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span>Voice Active</span>
                </span>
              </div>
              <p className="text-xs text-indigo-200/90 font-medium mt-1">
                Cognitive test-calibrated game recommendations for <span className="text-white font-bold">{firstName}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {/* Audio Waveform Indicator */}
            {isSpeaking && (
              <div className="hidden sm:flex items-center space-x-2 px-3 py-1.5 bg-amber-400/20 text-amber-300 border border-amber-400/40 rounded-xl text-xs font-bold font-mono">
                <Volume2 className="w-4 h-4 animate-bounce" />
                <span>Speaking ({audioSource === 'gemini' ? 'Gemini AI Voice' : 'Voice Synth'})</span>
              </div>
            )}

            {/* Voice Mute Toggle */}
            <button
              onClick={() => {
                const nextState = !voiceAutoPlay;
                setVoiceAutoPlay(nextState);
                if (!nextState && window.speechSynthesis) window.speechSynthesis.cancel();
              }}
              title={voiceAutoPlay ? 'Mute AI Voice' : 'Enable AI Voice'}
              className="p-2.5 text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
            >
              {voiceAutoPlay ? <Volume2 className="w-5 h-5 text-emerald-300" /> : <VolumeX className="w-5 h-5 text-slate-400" />}
            </button>

            {/* Close Button */}
            <button
              onClick={() => {
                if (window.speechSynthesis) window.speechSynthesis.cancel();
                onClose();
              }}
              className="p-2.5 text-indigo-200 hover:text-white bg-white/10 hover:bg-white/20 rounded-xl transition-all cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Patient Cognitive Test Metric Summary Bar */}
        <div className="bg-slate-50 px-5 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs shrink-0">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <span className="font-bold text-slate-800 flex items-center space-x-1.5 text-xs sm:text-sm">
              <Brain className="w-4 h-4 text-blue-600" />
              <span>Test Benchmark:</span>
            </span>
            <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
              <span className="px-2.5 py-1 rounded-lg bg-blue-100/90 text-blue-900 font-extrabold border border-blue-200">
                Overall: {patient.compositeScore ?? 78}/100
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-purple-100/90 text-purple-900 font-bold border border-purple-200">
                Memory: 70%
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-amber-100/90 text-amber-900 font-bold border border-amber-200">
                Attention: 78%
              </span>
              <span className="px-2.5 py-1 rounded-lg bg-rose-100/90 text-rose-900 font-extrabold border border-rose-200">
                Logic: 65% (Focus)
              </span>
            </div>
          </div>

          <span className="text-xs text-slate-500 font-medium italic hidden lg:inline">
            Aria adapts game difficulty dynamically based on your test metrics
          </span>
        </div>

        {/* Clean Category Selector Tabs with Hidden Scrollbars */}
        <div className="px-4 py-2.5 bg-white border-b border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {CATEGORY_TABS.map((cat) => {
            const isSelected = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 cursor-pointer flex items-center space-x-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-md scale-100'
                    : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700'
                }`}
              >
                <span className="text-base">{cat.icon}</span>
                <span className="whitespace-nowrap">{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Spacious & Big Chat History Area */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-6 space-y-6 bg-[#F8FAFC]">
          {messages.map((msg) => {
            const isAria = msg.sender === 'aria';
            return (
              <div
                key={msg.id}
                className={`flex flex-col ${isAria ? 'items-start' : 'items-end'}`}
              >
                <div className="flex items-start space-x-3 max-w-[95%] sm:max-w-[85%]">
                  {isAria ? (
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm">
                      <Bot className="w-5 h-5 text-amber-300" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-2xl bg-slate-700 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-sm order-last ml-3">
                      <User className="w-5 h-5" />
                    </div>
                  )}

                  <div
                    className={`rounded-3xl p-5 text-sm sm:text-base leading-relaxed border ${
                      isAria
                        ? 'bg-white text-slate-900 border-slate-200/90 shadow-sm'
                        : 'bg-blue-600 text-white border-blue-600 shadow-sm'
                    }`}
                  >
                    <p className="font-medium whitespace-pre-wrap m-0">{msg.text}</p>
                    
                    {isAria && (
                      <div className="flex items-center justify-between mt-4 pt-3 border-t border-slate-100 font-mono text-xs">
                        <span className="text-slate-400">{msg.timestamp}</span>
                        <button
                          onClick={() => playOrSpeak(msg.text, msg.audioBase64)}
                          className="text-blue-600 hover:text-blue-800 font-bold uppercase flex items-center space-x-1.5 cursor-pointer transition-colors bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-lg"
                        >
                          <Volume2 className="w-4 h-4" />
                          <span>Replay Voice</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Big & Clear Game Recommendation Card */}
                {isAria && msg.recommendation && msg.recommendation.recommendedGame && (
                  <motion.div
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 ml-0 sm:ml-13 w-full max-w-[95%] sm:max-w-[85%] bg-white border-2 border-blue-200 rounded-3xl p-5 sm:p-6 shadow-md"
                  >
                    {/* Game Category & Header */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
                      <div className="flex items-center space-x-3.5">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-3xl shadow-inner shrink-0">
                          {msg.recommendation.gameIcon || '🧠'}
                        </div>
                        <div>
                          <span className="text-xs font-mono font-black uppercase text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200 inline-block">
                            {msg.recommendation.categoryName || 'Recommended Category'}
                          </span>
                          <h3 className="text-base sm:text-xl font-extrabold text-slate-900 mt-1 m-0 p-0">
                            {msg.recommendation.gameTitle || msg.recommendation.recommendedGame.replace(/_/g, ' ')}
                          </h3>
                        </div>
                      </div>

                      <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-800 font-mono text-xs sm:text-sm font-bold border border-slate-200">
                        DIFFICULTY LVL {msg.recommendation.difficulty || 3}/10
                      </span>
                    </div>

                    {/* Test Score Reasoning - Highly Clear Callout */}
                    {msg.recommendation.testReasoning && (
                      <div className="my-4 p-4 bg-blue-50/90 rounded-2xl border border-blue-200/80 flex items-start space-x-3 text-xs sm:text-sm text-blue-950 leading-relaxed">
                        <Zap className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-extrabold text-blue-950 block text-xs uppercase tracking-wider mb-0.5">
                            Clinical Test Benchmark Alignment:
                          </strong>
                          <span>{msg.recommendation.testReasoning}</span>
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    {msg.recommendation.gameDescription && (
                      <p className="text-xs sm:text-sm text-slate-600 my-3 leading-relaxed">
                        {msg.recommendation.gameDescription}
                      </p>
                    )}

                    {/* Primary Action Button */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
                      <span className="text-xs text-slate-500 font-medium">
                        Target Domain: <strong className="text-slate-900 font-bold uppercase font-mono">{msg.recommendation.targetDomain || 'Cognitive'}</strong>
                      </span>

                      <button
                        onClick={() => {
                          if (window.speechSynthesis) window.speechSynthesis.cancel();
                          onClose();
                          onLaunchGame(msg.recommendation!.recommendedGame);
                        }}
                        className="flex items-center space-x-2.5 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-2xl text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Launch Drill Now</span>
                      </button>
                    </div>

                    {/* Alternative recommendations in category */}
                    {msg.recommendation.alternativeGames && msg.recommendation.alternativeGames.length > 0 && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                          More drills in this category:
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {msg.recommendation.alternativeGames.map((alt) => (
                            <button
                              key={alt.gameId}
                              onClick={() => {
                                if (window.speechSynthesis) window.speechSynthesis.cancel();
                                onClose();
                                onLaunchGame(alt.gameId);
                              }}
                              className="p-3 bg-slate-50 hover:bg-blue-50 border border-slate-200 hover:border-blue-300 rounded-2xl text-left transition-all cursor-pointer group flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2 overflow-hidden">
                                <span className="text-xl shrink-0">{alt.icon}</span>
                                <span className="text-xs sm:text-sm font-bold text-slate-800 group-hover:text-blue-700 truncate">
                                  {alt.title}
                                </span>
                              </div>
                              <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-blue-600 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </motion.div>
                )}
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center space-x-3 text-slate-500 font-mono text-sm pl-2 py-3 bg-white/60 rounded-2xl border border-slate-100 p-3">
              <RefreshCw className="w-5 h-5 animate-spin text-blue-600" />
              <span>Aria is analyzing your cognitive tests and tailoring the best category drill...</span>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Voice Prompt Suggestions with Hidden Scrollbars */}
        <div className="px-5 py-2.5 bg-slate-100/80 border-t border-slate-200 flex items-center gap-2 overflow-x-auto no-scrollbar shrink-0">
          {[
            { label: '🧠 Memory Game', prompt: 'Recommend a memory recall game for my test level.' },
            { label: '👀 Attention Drill', prompt: 'Give me an attention and observation exercise.' },
            { label: '🔗 Association Match', prompt: 'I want an association and recognition game.' },
            { label: '🔢 Sequence Logic', prompt: 'Recommend a sequence and ordering puzzle.' },
            { label: '🏠 Daily Life Recall', prompt: 'Give me a daily life familiarity routine.' },
            { label: '🧩 Spatial Exercise', prompt: 'Recommend a visual spatial thinking exercise.' },
            { label: '📊 Best for Test Score', prompt: 'What is the best game for my lowest test domain?' },
          ].map((item, idx) => (
            <button
              key={idx}
              onClick={() => handleSendMessage(item.prompt)}
              className="px-3.5 py-1.5 bg-white hover:bg-blue-50 hover:border-blue-300 border border-slate-200 rounded-xl text-slate-800 whitespace-nowrap text-xs font-bold cursor-pointer transition-all shadow-xs"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Big Bottom Voice & Text Input Bar */}
        <div className="p-4 sm:p-5 bg-white border-t border-slate-200 flex items-center space-x-3 shrink-0">
          <button
            onClick={toggleListening}
            title={isListening ? 'Stop Listening' : 'Speak to Aria (Voice Recognition)'}
            className={`px-4 py-3.5 rounded-2xl border transition-all cursor-pointer shadow-sm flex items-center space-x-2 shrink-0 ${
              isListening
                ? 'bg-rose-600 text-white border-rose-700 animate-pulse ring-4 ring-rose-200'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300 hover:border-blue-400'
            }`}
          >
            {isListening ? (
              <>
                <MicOff className="w-5 h-5 text-white" />
                <span className="text-xs sm:text-sm font-bold uppercase font-mono">Listening...</span>
              </>
            ) : (
              <>
                <Mic className="w-5 h-5 text-blue-700" />
                <span className="text-xs sm:text-sm font-bold uppercase font-mono">Voice Input</span>
              </>
            )}
          </button>

          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            placeholder={isListening ? 'Listening to your voice...' : 'Ask Aria: "Give me a memory game", "What should I play for my test score?"...'}
            className="flex-1 px-4 py-3.5 bg-slate-50 border border-slate-300 rounded-2xl text-sm sm:text-base text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:outline-none transition-all"
          />

          <button
            onClick={() => handleSendMessage()}
            disabled={!inputVal.trim() || isLoading}
            className="p-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-2xl transition-all cursor-pointer shadow-sm shrink-0"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </motion.div>
    </div>
  );
};
