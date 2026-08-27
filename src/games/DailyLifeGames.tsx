import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { GAME_DATASETS } from './gameDatasets';
import { Home, Sun, Moon, Users, BookOpen, MapPin, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

// ==========================================
// 1. Daily Life Recall (Everyday Facts & Knowledge)
// ==========================================
export const DailyLifeRecallGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.dailyLifeRecallQuestions>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.dailyLifeRecallQuestions].sort(() => Math.random() - 0.5);
    setQuestions(shuffled.slice(0, totalRounds));
  }, [totalRounds]);

  const handleAnswer = (choice: string) => {
    const currentQ = questions[qIndex];
    const isCorrect = choice === currentQ.answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (qIndex + 1 >= questions.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / questions.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: questions.length - newCorrect,
        metrics: { totalQuestions: questions.length, correctAnswers: newCorrect },
      });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Home className="w-5 h-5 text-amber-600" />
            Daily Life Recall
          </h2>
          <p className="text-xs text-slate-500">Everyday knowledge and routines</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-mono text-xs font-bold">
          Question {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-4">
        <div className="w-20 h-20 bg-amber-50 border-2 border-amber-200 rounded-2xl flex items-center justify-center text-4xl shadow-xs mb-3">
          {currentQ.icon}
        </div>
        <h3 className="text-base sm:text-lg font-extrabold text-slate-900 text-center px-4">
          {currentQ.question}
        </h3>
      </div>

      <div className="flex flex-col gap-2.5 w-full my-3">
        {currentQ.options.map((opt, idx) => (
          <button
            key={idx}
            id={`daily-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-3.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 text-left transition-colors cursor-pointer shadow-2xs"
          >
            {opt}
          </button>
        ))}
      </div>

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 2. Morning or Night? (Activity Classification)
// ==========================================
export const MorningOrNightGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5 + Math.floor(difficulty * 0.4);
  const [activities, setActivities] = useState<typeof GAME_DATASETS.morningOrNightActivities>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.morningOrNightActivities].sort(() => Math.random() - 0.5);
    setActivities(shuffled.slice(0, totalRounds));
  }, [totalRounds]);

  const handleChoice = (time: 'Morning' | 'Night') => {
    const currentA = activities[qIndex];
    const isCorrect = time === currentA.time;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (qIndex + 1 >= activities.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / activities.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: activities.length - newCorrect,
        metrics: { totalQuestions: activities.length, correctAnswers: newCorrect },
      });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  if (activities.length === 0) return null;
  const currentA = activities[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sun className="w-5 h-5 text-amber-500" />
            Morning or Night?
          </h2>
          <p className="text-xs text-slate-500">When does this daily activity happen?</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-mono text-xs font-bold">
          {qIndex + 1} / {activities.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-6">
        <div className="w-24 h-24 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center text-5xl shadow-xs mb-3">
          {currentA.icon}
        </div>
        <h3 className="text-lg font-extrabold text-slate-900 text-center px-4 leading-snug">
          "{currentA.activity}"
        </h3>
      </div>

      <div className="grid grid-cols-2 gap-4 w-full my-2">
        <button
          onClick={() => handleChoice('Morning')}
          className="p-4 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-sm transition-transform hover:scale-102 cursor-pointer"
        >
          <Sun className="w-6 h-6" />
          <span className="text-sm uppercase tracking-wider">Morning</span>
        </button>
        <button
          onClick={() => handleChoice('Night')}
          className="p-4 bg-indigo-900 hover:bg-indigo-950 text-white rounded-xl font-bold flex flex-col items-center justify-center gap-1 shadow-sm transition-transform hover:scale-102 cursor-pointer"
        >
          <Moon className="w-6 h-6 text-indigo-300" />
          <span className="text-sm uppercase tracking-wider">Night</span>
        </button>
      </div>

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 3. Remember the Family Table (Spatial Seating Recall)
// ==========================================
export const FamilyTableGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const scene = GAME_DATASETS.familyTableScenes[0];
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [countdown, setCountdown] = useState(7);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (phase === 'study' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'study' && countdown === 0) {
      setPhase('quiz');
    }
  }, [phase, countdown]);

  const currentQ = scene.questions[qIndex];

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === currentQ.answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (qIndex + 1 >= scene.questions.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / scene.questions.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: scene.questions.length - newCorrect,
        metrics: { totalQuestions: scene.questions.length, correctAnswers: newCorrect },
      });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-rose-600" />
            Remember the Family Table
          </h2>
          <p className="text-xs text-slate-500">Seating positions around the dinner table</p>
        </div>
        {phase === 'study' ? (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-sm">
            ⏳ {countdown}s
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-md font-mono text-xs font-bold">
            Question {qIndex + 1} / {scene.questions.length}
          </span>
        )}
      </div>

      {phase === 'study' ? (
        <div className="w-full flex flex-col items-center py-4">
          <p className="text-xs font-semibold text-slate-600 mb-3">Memorize where each family member is sitting:</p>
          <div className="grid grid-cols-2 gap-3 w-full my-2">
            {scene.seats.map((seat, idx) => (
              <div key={idx} className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl flex items-center gap-3">
                <span className="text-3xl">{seat.emoji}</span>
                <div>
                  <span className="text-[11px] font-bold text-rose-600 uppercase tracking-wider block">{seat.position}</span>
                  <span className="text-xs font-extrabold text-slate-900">{seat.member}</span>
                </div>
              </div>
            ))}
          </div>

          <button
            onClick={() => setPhase('quiz')}
            className="mt-5 px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            I Memorized the Seats
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-2">
          <p className="text-base font-bold text-slate-900 mb-4 text-center">
            {currentQ.question}
          </p>
          <div className="flex flex-col gap-2.5 w-full">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                id={`table-opt-${idx}`}
                onClick={() => handleAnswer(opt)}
                className="p-3.5 bg-slate-50 hover:bg-rose-50 hover:border-rose-400 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 text-left transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 4. Remember the Place (Scene & Room Exploration)
// ==========================================
export const RememberPlaceGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const scene = GAME_DATASETS.rememberPlaceScenes[1]; // Living room
  const [phase, setPhase] = useState<'study' | 'quiz'>('study');
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [countdown, setCountdown] = useState(8);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (phase === 'study' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'study' && countdown === 0) {
      setPhase('quiz');
    }
  }, [phase, countdown]);

  const currentQ = scene.questions[qIndex];

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === currentQ.answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (qIndex + 1 >= scene.questions.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / scene.questions.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: scene.questions.length - newCorrect,
        metrics: { totalQuestions: scene.questions.length, correctAnswers: newCorrect },
      });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-teal-600" />
            Remember the Place
          </h2>
          <p className="text-xs text-slate-500">{scene.name}</p>
        </div>
        {phase === 'study' ? (
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-sm">
            ⏳ {countdown}s
          </span>
        ) : (
          <span className="px-2.5 py-1 bg-teal-50 text-teal-800 rounded-md font-mono text-xs font-bold">
            {qIndex + 1} / {scene.questions.length}
          </span>
        )}
      </div>

      {phase === 'study' ? (
        <div className="w-full flex flex-col items-center py-4">
          <div className="w-full p-5 bg-teal-50/70 border border-teal-200 rounded-2xl mb-4">
            <p className="text-base text-slate-800 leading-relaxed font-serif text-center">
              "{scene.description}"
            </p>
          </div>
          <div className="grid grid-cols-2 gap-2 w-full">
            {scene.details.map((det, idx) => (
              <div key={idx} className="p-2.5 bg-slate-50 rounded-lg text-xs font-medium text-slate-700 border border-slate-200 text-center">
                ✨ {det}
              </div>
            ))}
          </div>
          <button
            onClick={() => setPhase('quiz')}
            className="mt-5 px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer"
          >
            I am Ready for Questions
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-2">
          <p className="text-base font-bold text-slate-900 mb-4 text-center">
            {currentQ.question}
          </p>
          <div className="flex flex-col gap-2.5 w-full">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                id={`place-scene-opt-${idx}`}
                onClick={() => handleAnswer(opt)}
                className="p-3.5 bg-slate-50 hover:bg-teal-50 hover:border-teal-400 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 text-left transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};

// ==========================================
// 5. Memory Story (Narrative Comprehension & Recall)
// ==========================================
export const MemoryStoryGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const [storyIndex] = useState(() => Math.floor(Math.random() * GAME_DATASETS.memoryStories.length));
  const currentStory = GAME_DATASETS.memoryStories[storyIndex];
  const [phase, setPhase] = useState<'reading' | 'quiz'>('reading');
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  const currentQ = currentStory.questions[qIndex];

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === currentQ.answer;
    const newCorrect = isCorrect ? correctCount + 1 : correctCount;
    setCorrectCount(newCorrect);

    if (qIndex + 1 >= currentStory.questions.length) {
      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = newCorrect / currentStory.questions.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: currentStory.questions.length - newCorrect,
        metrics: { totalQuestions: currentStory.questions.length, correctAnswers: newCorrect },
      });
    } else {
      setQIndex(qIndex + 1);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-blue-600" />
            Memory Story
          </h2>
          <p className="text-xs text-slate-500">{currentStory.title}</p>
        </div>
        {phase === 'quiz' && (
          <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-mono text-xs font-bold">
            {qIndex + 1} / {currentStory.questions.length}
          </span>
        )}
      </div>

      {phase === 'reading' ? (
        <div className="w-full flex flex-col items-center py-4">
          <div className="w-full p-5 sm:p-6 bg-amber-50/70 border border-amber-200 rounded-2xl mb-4">
            <span className="text-3xl mb-2 block">{currentStory.icon}</span>
            <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-serif">
              "{currentStory.story}"
            </p>
          </div>
          <button
            onClick={() => setPhase('quiz')}
            className="mt-4 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm cursor-pointer flex items-center gap-1.5"
          >
            <span>Start Story Questions</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-2">
          <p className="text-base font-bold text-slate-900 mb-4 text-center">
            {currentQ.question}
          </p>
          <div className="flex flex-col gap-2.5 w-full">
            {currentQ.options.map((opt, idx) => (
              <button
                key={idx}
                id={`story-opt-${idx}`}
                onClick={() => handleAnswer(opt)}
                className="p-3.5 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 text-left transition-colors cursor-pointer"
              >
                {opt}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="w-full flex justify-start pt-3 border-t border-slate-100 mt-4">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
      </div>
    </div>
  );
};
