import React, { useState, useEffect } from 'react';
import { GameProps } from './GameRegistry';
import { GAME_DATASETS } from './gameDatasets';
import { Heart, Link, MapPin, Wrench, Sparkles, CheckCircle, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

// ==========================================
// 1. Match Object to Place (Where does this belong?)
// ==========================================
export const MatchObjectPlaceGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.matchObjectPlaceData>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.matchObjectPlaceData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalRounds);
    setQuestions(selected);
    if (selected.length > 0) {
      const first = selected[0];
      const opts = [first.place, ...first.others].sort(() => Math.random() - 0.5);
      setOptions(opts);
    }
  }, [totalRounds]);

  const handleAnswer = (choice: string) => {
    const currentQ = questions[qIndex];
    const isCorrect = choice === currentQ.place;
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
      const nextQ = questions[qIndex + 1];
      const nextOpts = [nextQ.place, ...nextQ.others].sort(() => Math.random() - 0.5);
      setQIndex(qIndex + 1);
      setOptions(nextOpts);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <MapPin className="w-5 h-5 text-rose-600" />
            Match Object to Place
          </h2>
          <p className="text-xs text-slate-500">Where in the house or garden does this belong?</p>
        </div>
        <span className="px-2.5 py-1 bg-rose-50 text-rose-800 rounded-md font-mono text-xs font-bold">
          Item {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-rose-50 border-2 border-rose-200 rounded-3xl flex items-center justify-center text-6xl shadow-xs mb-2">
          {currentQ.object}
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">{currentQ.name}</h3>
        <p className="text-xs text-slate-500 font-medium mt-1">Where do we usually find this?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`place-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-4 bg-slate-50 hover:bg-rose-50 hover:border-rose-400 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 transition-colors text-center cursor-pointer shadow-2xs"
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
// 2. Match Object to Use (What is this used for?)
// ==========================================
export const MatchObjectUseGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.matchObjectUseData>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.matchObjectUseData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalRounds);
    setQuestions(selected);
    if (selected.length > 0) {
      const first = selected[0];
      const opts = [first.use, ...first.others].sort(() => Math.random() - 0.5);
      setOptions(opts);
    }
  }, [totalRounds]);

  const handleAnswer = (choice: string) => {
    const currentQ = questions[qIndex];
    const isCorrect = choice === currentQ.use;
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
      const nextQ = questions[qIndex + 1];
      const nextOpts = [nextQ.use, ...nextQ.others].sort(() => Math.random() - 0.5);
      setQIndex(qIndex + 1);
      setOptions(nextOpts);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Wrench className="w-5 h-5 text-amber-600" />
            Match Object to Use
          </h2>
          <p className="text-xs text-slate-500">What is this object used for?</p>
        </div>
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 rounded-md font-mono text-xs font-bold">
          Item {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-amber-50 border-2 border-amber-200 rounded-3xl flex items-center justify-center text-6xl shadow-xs mb-2">
          {currentQ.object}
        </div>
        <h3 className="text-lg font-extrabold text-slate-900">{currentQ.name}</h3>
      </div>

      <div className="flex flex-col gap-2.5 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`use-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-3.5 bg-slate-50 hover:bg-amber-50 hover:border-amber-400 border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 text-left transition-colors cursor-pointer"
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
// 3. Word Association (Concept Linking)
// ==========================================
export const WordAssociationGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.wordAssociationData>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.wordAssociationData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalRounds);
    setQuestions(selected);
    if (selected.length > 0) {
      const first = selected[0];
      const opts = [first.answer, ...first.others].sort(() => Math.random() - 0.5);
      setOptions(opts);
    }
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
      const nextQ = questions[qIndex + 1];
      const nextOpts = [nextQ.answer, ...nextQ.others].sort(() => Math.random() - 0.5);
      setQIndex(qIndex + 1);
      setOptions(nextOpts);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Link className="w-5 h-5 text-indigo-600" />
            Word Association
          </h2>
          <p className="text-xs text-slate-500">Which word connects most naturally?</p>
        </div>
        <span className="px-2.5 py-1 bg-indigo-50 text-indigo-800 rounded-md font-mono text-xs font-bold">
          {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-6">
        <span className="text-xs font-bold text-indigo-500 uppercase tracking-widest mb-1">Concept Prompt</span>
        <div className="px-6 py-4 bg-indigo-50 border-2 border-indigo-200 rounded-2xl text-2xl sm:text-3xl font-extrabold text-indigo-950 shadow-xs">
          {currentQ.prompt}
        </div>
      </div>

      <p className="text-xs font-semibold text-slate-500 mb-3">Which word pairs with {currentQ.prompt.split(' ')[1] || 'this'}?</p>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`word-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-4 bg-slate-50 hover:bg-indigo-50 hover:border-indigo-400 border border-slate-200 rounded-xl text-base font-bold text-slate-800 text-center transition-colors cursor-pointer shadow-2xs"
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
// 4. Familiar Object Recognition (Clues & Naming)
// ==========================================
export const FamiliarObjectGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 4 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.familiarObjectData>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.familiarObjectData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalRounds);
    setQuestions(selected);
    if (selected.length > 0) {
      const first = selected[0];
      const opts = [first.answer, ...first.others].sort(() => Math.random() - 0.5);
      setOptions(opts);
    }
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
      const nextQ = questions[qIndex + 1];
      const nextOpts = [nextQ.answer, ...nextQ.others].sort(() => Math.random() - 0.5);
      setQIndex(qIndex + 1);
      setOptions(nextOpts);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Heart className="w-5 h-5 text-emerald-600" />
            Familiar Object Recognition
          </h2>
          <p className="text-xs text-slate-500">Name this familiar household object</p>
        </div>
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-800 rounded-md font-mono text-xs font-bold">
          {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-emerald-50 border-2 border-emerald-200 rounded-3xl flex items-center justify-center text-6xl shadow-xs mb-3">
          {currentQ.emoji}
        </div>
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl max-w-sm text-center">
          <p className="text-xs text-slate-600 italic">"{currentQ.clue}"</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`familiar-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-4 bg-slate-50 hover:bg-emerald-50 hover:border-emerald-400 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 text-center transition-colors cursor-pointer shadow-2xs"
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
// 5. Animal & Food Recognition (Categorization)
// ==========================================
export const AnimalFoodGame: React.FC<GameProps> = ({
  difficulty,
  onComplete,
  onCancel,
}) => {
  const totalRounds = 5 + Math.floor(difficulty * 0.4);
  const [questions, setQuestions] = useState<typeof GAME_DATASETS.animalFoodData>([]);
  const [qIndex, setQIndex] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    const shuffled = [...GAME_DATASETS.animalFoodData].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, totalRounds);
    setQuestions(selected);
    if (selected.length > 0) {
      const first = selected[0];
      const opts = [first.answer, ...first.others].sort(() => Math.random() - 0.5);
      setOptions(opts);
    }
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
      const nextQ = questions[qIndex + 1];
      const nextOpts = [nextQ.answer, ...nextQ.others].sort(() => Math.random() - 0.5);
      setQIndex(qIndex + 1);
      setOptions(nextOpts);
    }
  };

  if (questions.length === 0) return null;
  const currentQ = questions[qIndex];

  return (
    <div className="flex flex-col items-center max-w-lg mx-auto p-4 sm:p-6 bg-white rounded-xl shadow-2xs border border-slate-200">
      <div className="w-full flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-orange-600" />
            Animal & Food Recognition
          </h2>
          <p className="text-xs text-slate-500">Class: {currentQ.category}</p>
        </div>
        <span className="px-2.5 py-1 bg-orange-50 text-orange-800 rounded-md font-mono text-xs font-bold">
          {qIndex + 1} / {questions.length}
        </span>
      </div>

      <div className="flex flex-col items-center my-4">
        <div className="w-24 h-24 sm:w-28 sm:h-28 bg-orange-50 border-2 border-orange-200 rounded-3xl flex items-center justify-center text-6xl shadow-xs mb-2">
          {currentQ.emoji}
        </div>
        <p className="text-sm font-bold text-slate-700">What is this?</p>
      </div>

      <div className="grid grid-cols-2 gap-3 w-full my-2">
        {options.map((opt, idx) => (
          <button
            key={idx}
            id={`animal-food-opt-${idx}`}
            onClick={() => handleAnswer(opt)}
            className="p-4 bg-slate-50 hover:bg-orange-50 hover:border-orange-400 border border-slate-200 rounded-xl text-base font-bold text-slate-800 text-center transition-colors cursor-pointer shadow-2xs"
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
