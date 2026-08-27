import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { GAME_DATASETS } from './gameDatasets';
import { Layers, CheckCircle, ArrowRight, Clock, HelpCircle, ListOrdered } from 'lucide-react';
import { motion } from 'motion/react';

// ==========================================
// 1. What Comes Next? (Pattern Completion)
// ==========================================
export const WhatComesNextGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.whatComesNextPatterns>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.whatComesNextPatterns].sort(() => Math.random() - 0.5);
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
            <Layers className="w-5 h-5 text-blue-600" />
            What Comes Next?
          </h2>
          <p className="text-xs text-slate-500">Discover the pattern rule</p>
        </div>
        <span className="px-2.5 py-1 bg-blue-50 text-blue-800 rounded-md font-mono text-xs font-bold">
          Pattern {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="w-full flex flex-col items-center my-6">
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 p-4 bg-slate-50 border border-slate-200 rounded-2xl">
          {currentQ.seq.map((item, idx) => (
            <div
              key={idx}
              className="w-12 h-12 sm:w-14 sm:h-14 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-3xl shadow-2xs"
            >
              {item}
            </div>
          ))}
          <div className="w-12 h-12 sm:w-14 sm:h-14 bg-amber-50 border-2 border-dashed border-amber-400 rounded-xl flex items-center justify-center text-2xl font-bold text-amber-600 animate-pulse">
            ❓
          </div>
        </div>
        <p className="text-xs text-slate-500 font-semibold mt-3">Which symbol comes next in this pattern?</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 w-full my-2">
        {currentQ.options.map((opt, idx) => (
          <button
            key={idx}
            id={`pattern-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="h-16 bg-slate-50 hover:bg-blue-50 hover:border-blue-400 border border-slate-200 rounded-xl flex items-center justify-center text-3xl transition-colors cursor-pointer shadow-2xs"
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
// 2. Remember the Order (Sequence Memorization)
// ==========================================
export const RememberOrderGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const sequenceLength = Math.min(5, Math.max(3, 2 + Math.floor(difficulty * 0.4)));
  const [phase, setPhase] = useState<'showing' | 'recall'>('showing');
  const [sequence, setSequence] = useState<string[]>([]);
  const [activeItem, setActiveItem] = useState<string | null>(null);
  const [userInput, setUserInput] = useState<string[]>([]);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const pool = [...GAME_DATASETS.recallObjectPool].sort(() => Math.random() - 0.5);
    const seq = pool.slice(0, sequenceLength);
    const dist = pool.slice(sequenceLength, sequenceLength + 2);
    const allOpts = [...seq, ...dist].sort(() => Math.random() - 0.5);

    setSequence(seq);
    setOptions(allOpts);

    let idx = 0;
    const interval = setInterval(() => {
      if (idx < seq.length) {
        setActiveItem(seq[idx]);
        idx++;
      } else {
        clearInterval(interval);
        setActiveItem(null);
        setTimeout(() => setPhase('recall'), 600);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [sequenceLength]);

  const handleChoice = (item: string) => {
    const newInput = [...userInput, item];
    setUserInput(newInput);

    if (newInput.length === sequence.length) {
      let correct = 0;
      newInput.forEach((it, idx) => {
        if (it === sequence[idx]) correct++;
      });

      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = correct / sequence.length;
      const score = Math.round(accuracy * 1000);
      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: sequence.length - correct,
        metrics: { sequenceLength, correctInOrder: correct },
      });
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ListOrdered className="w-5 h-5 text-indigo-600" />
            Remember the Order
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'showing' ? 'Remember the exact order of objects!' : 'Tap the items in the order they appeared'}
          </p>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md font-mono text-xs font-bold">
          Length: {sequenceLength}
        </span>
      </div>

      {phase === 'showing' ? (
        <div className="py-12 flex flex-col items-center">
          <div className="w-24 h-24 sm:w-28 sm:h-28 bg-indigo-50 border-4 border-indigo-300 rounded-3xl flex items-center justify-center text-6xl shadow-md">
            {activeItem || '✨'}
          </div>
          <span className="text-xs font-bold text-indigo-600 mt-4 uppercase tracking-widest animate-pulse">
            Memorizing Sequence...
          </span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-4">
          <div className="flex gap-2 justify-center mb-6 min-h-12">
            {userInput.map((it, idx) => (
              <div key={idx} className="w-12 h-12 bg-indigo-50 border-2 border-indigo-400 rounded-xl flex items-center justify-center text-2xl shadow-2xs">
                {it}
              </div>
            ))}
            {Array(sequence.length - userInput.length).fill(0).map((_, idx) => (
              <div key={idx} className="w-12 h-12 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs">
                {userInput.length + idx + 1}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3 w-full">
            {options.map((opt, idx) => (
              <button
                key={idx}
                id={`order-opt-${idx}`}
                onClick={() => handleChoice(opt)}
                className="h-16 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 border border-slate-200 rounded-xl flex items-center justify-center text-3xl transition-transform hover:scale-105 cursor-pointer shadow-2xs"
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
// 3. Picture Ordering (Step Process Sequencing)
// ==========================================
export const PictureOrderingGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const [taskIndex] = useState(() => Math.floor(Math.random() * GAME_DATASETS.pictureOrderingTasks.length));
  const task = GAME_DATASETS.pictureOrderingTasks[taskIndex];
  const [shuffledSteps, setShuffledSteps] = useState<typeof task.steps>([]);
  const [orderedSteps, setOrderedSteps] = useState<typeof task.steps>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    setShuffledSteps([...task.steps].sort(() => Math.random() - 0.5));
  }, [task]);

  const selectStep = (stepItem: (typeof task.steps)[0]) => {
    setOrderedSteps([...orderedSteps, stepItem]);
    setShuffledSteps(shuffledSteps.filter((s) => s.step !== stepItem.step));
  };

  const handleFinish = () => {
    let correct = 0;
    orderedSteps.forEach((s, idx) => {
      if (s.step === idx + 1) correct++;
    });

    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const accuracy = correct / task.steps.length;
    const score = Math.round(accuracy * 1000);

    onComplete({
      score,
      accuracy,
      completionTimeSeconds: elapsed,
      mistakes: task.steps.length - correct,
      metrics: { totalSteps: task.steps.length, correctPositions: correct },
    });
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-xl">{task.icon}</span>
            Picture & Step Ordering
          </h2>
          <p className="text-xs text-slate-500">{task.title}</p>
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-600 mb-2">Tap steps below in chronological sequence (First to Last):</p>

      {/* Selected Sequence */}
      <div className="w-full space-y-2 mb-4">
        {orderedSteps.map((s, idx) => (
          <div key={s.step} className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center gap-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
              {idx + 1}
            </span>
            <span className="text-xl">{s.emoji}</span>
            <span className="text-xs font-bold text-slate-800">{s.text}</span>
          </div>
        ))}
      </div>

      {/* Available choices */}
      <div className="w-full space-y-2 mb-4">
        {shuffledSteps.map((s) => (
          <button
            key={s.step}
            onClick={() => selectStep(s)}
            className="w-full p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center gap-3 text-left transition-colors cursor-pointer"
          >
            <span className="text-2xl">{s.emoji}</span>
            <span className="text-xs font-semibold text-slate-800">{s.text}</span>
          </button>
        ))}
      </div>

      <div className="w-full flex justify-between items-center pt-3 border-t border-slate-100">
        <button onClick={onCancel} className="text-xs text-slate-400 hover:text-slate-600 cursor-pointer">
          Cancel
        </button>
        {shuffledSteps.length === 0 && (
          <button
            onClick={handleFinish}
            className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider cursor-pointer flex items-center gap-1"
          >
            <span>Submit Order</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  );
};

// ==========================================
// 4. Complete the Daily Routine (Missing Step)
// ==========================================
export const DailyRoutineGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const [taskIndex] = useState(() => Math.floor(Math.random() * GAME_DATASETS.dailyRoutines.length));
  const task = GAME_DATASETS.dailyRoutines[taskIndex];
  const [startTime] = useState(Date.now());

  const handleAnswer = (choice: string) => {
    const isCorrect = choice === task.missingStep;
    const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const accuracy = isCorrect ? 1.0 : 0.0;
    const score = isCorrect ? 1000 : 200;

    onComplete({
      score,
      accuracy,
      completionTimeSeconds: elapsed,
      mistakes: isCorrect ? 0 : 1,
      metrics: { routine: task.routineName, correct: isCorrect },
    });
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <span className="text-xl">{task.icon}</span>
            Complete the Daily Routine
          </h2>
          <p className="text-xs text-slate-500">{task.routineName}</p>
        </div>
      </div>

      <div className="w-full space-y-2.5 my-4">
        {task.steps.map((st, idx) => (
          <div
            key={idx}
            className={`p-3.5 rounded-xl border flex items-center gap-3 ${
              st === 'MISSING_STEP'
                ? 'bg-amber-50 border-amber-300 text-amber-900 font-bold border-dashed'
                : 'bg-slate-50 border-slate-200 text-slate-700'
            }`}
          >
            <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">
              {idx + 1}
            </span>
            <span className="text-xs font-semibold">
              {st === 'MISSING_STEP' ? '❓ Which step goes here?' : st}
            </span>
          </div>
        ))}
      </div>

      <p className="text-xs font-bold text-slate-600 mb-3">Choose the missing step:</p>

      <div className="flex flex-col gap-2.5 w-full">
        {task.options.map((opt, idx) => (
          <button
            key={idx}
            id={`routine-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-3.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 text-left transition-colors cursor-pointer"
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
// 5. Simple Number Memory (Digit Span Recall)
// ==========================================
export const NumberMemoryGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const digitsCount = Math.min(6, Math.max(3, 2 + Math.floor(difficulty * 0.4)));
  const [phase, setPhase] = useState<'showing' | 'recall'>('showing');
  const [digits, setDigits] = useState<number[]>([]);
  const [userDigits, setUserDigits] = useState<number[]>([]);
  const [countdown, setCountdown] = useState(4);
  const [startTime, setStartTime] = useState(Date.now());

  useEffect(() => {
    const list: number[] = [];
    for (let i = 0; i < digitsCount; i++) {
      list.push(Math.floor(Math.random() * 9) + 1);
    }
    setDigits(list);
    setCountdown(3 + Math.floor(digitsCount * 0.5));
  }, [digitsCount]);

  useEffect(() => {
    if (phase === 'showing' && countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    } else if (phase === 'showing' && countdown === 0) {
      setPhase('recall');
      setStartTime(Date.now());
    }
  }, [phase, countdown]);

  const addDigit = (num: number) => {
    const next = [...userDigits, num];
    setUserDigits(next);

    if (next.length === digits.length) {
      let correct = 0;
      next.forEach((d, idx) => {
        if (d === digits[idx]) correct++;
      });

      const elapsed = Math.max(1, Math.round((Date.now() - startTime) / 1000));
      const accuracy = correct / digits.length;
      const score = Math.round(accuracy * 1000);

      onComplete({
        score,
        accuracy,
        completionTimeSeconds: elapsed,
        mistakes: digits.length - correct,
        metrics: { digitsCount, correctDigits: correct },
      });
    }
  };

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            Simple Number Memory
          </h2>
          <p className="text-xs text-slate-500">
            {phase === 'showing' ? 'Remember this number sequence!' : 'Type the numbers in the same order'}
          </p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-mono text-xs font-bold">
          {digitsCount} Digits
        </span>
      </div>

      {phase === 'showing' ? (
        <div className="py-10 flex flex-col items-center">
          <div className="flex gap-3 justify-center mb-6">
            {digits.map((d, idx) => (
              <div
                key={idx}
                className="w-14 h-16 bg-emerald-50 border-2 border-emerald-300 rounded-2xl flex items-center justify-center text-4xl font-extrabold text-emerald-950 font-mono shadow-xs"
              >
                {d}
              </div>
            ))}
          </div>
          <span className="px-3 py-1 bg-amber-100 text-amber-900 rounded-full font-mono font-bold text-xs">
            ⏳ {countdown}s remaining
          </span>
        </div>
      ) : (
        <div className="w-full flex flex-col items-center py-4">
          <div className="flex gap-2 justify-center mb-6 min-h-14">
            {userDigits.map((d, idx) => (
              <div key={idx} className="w-12 h-14 bg-emerald-50 border-2 border-emerald-500 rounded-xl flex items-center justify-center text-3xl font-extrabold font-mono text-emerald-950">
                {d}
              </div>
            ))}
            {Array(digits.length - userDigits.length).fill(0).map((_, idx) => (
              <div key={idx} className="w-12 h-14 bg-slate-100 border-2 border-dashed border-slate-300 rounded-xl" />
            ))}
          </div>

          {/* Keypad */}
          <div className="grid grid-cols-3 gap-2.5 w-64 max-w-full">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
              <button
                key={num}
                id={`num-key-${num}`}
                onClick={() => addDigit(num)}
                className="h-14 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 rounded-xl text-2xl font-bold font-mono text-slate-800 transition-colors cursor-pointer shadow-2xs"
              >
                {num}
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
