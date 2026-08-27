import React, { useState } from 'react';
import { GameProps } from './GameRegistry';
import { sounds } from '../services/audio';
import { 
  Coffee, Compass, Clock, Utensils, Scissors, Phone,
  Camera, BookOpen, Key, Shirt, ShieldAlert, Sparkles, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QuestionItem {
  id: number;
  prompt: string;
  category: string;
  correctIcon: any;
  correctLabel: string;
  options: Array<{
    label: string;
    icon: any;
    color: string;
  }>;
}

const QUESTIONS: QuestionItem[] = [
  {
    id: 1,
    prompt: 'Which familiar item is used in the kitchen to brew fresh morning tea or coffee?',
    category: 'Kitchen & Beverage',
    correctIcon: Coffee,
    correctLabel: 'Teacup & Coffee',
    options: [
      { label: 'Teacup & Coffee', icon: Coffee, color: 'text-amber-700 bg-amber-50' },
      { label: 'Wall Clock', icon: Clock, color: 'text-blue-600 bg-blue-50' },
      { label: 'House Key', icon: Key, color: 'text-slate-700 bg-slate-100' },
    ],
  },
  {
    id: 2,
    prompt: 'Which tool helps you tell what time of day it is before afternoon lunch?',
    category: 'Time & Orientation',
    correctIcon: Clock,
    correctLabel: 'Analog Clock',
    options: [
      { label: 'Scissors', icon: Scissors, color: 'text-red-600 bg-red-50' },
      { label: 'Analog Clock', icon: Clock, color: 'text-blue-600 bg-blue-50' },
      { label: 'Dinner Spoon', icon: Utensils, color: 'text-emerald-600 bg-emerald-50' },
    ],
  },
  {
    id: 3,
    prompt: 'Which item do you wear to stay warm when heading outdoors for a walk?',
    category: 'Clothing & Daily Living',
    correctIcon: Shirt,
    correctLabel: 'Warm Cardigan',
    options: [
      { label: 'Camera', icon: Camera, color: 'text-purple-600 bg-purple-50' },
      { label: 'Telephone', icon: Phone, color: 'text-teal-600 bg-teal-50' },
      { label: 'Warm Cardigan', icon: Shirt, color: 'text-indigo-600 bg-indigo-50' },
    ],
  },
  {
    id: 4,
    prompt: 'Which device is used to take and capture family photographs of loved ones?',
    category: 'Memories & Technology',
    correctIcon: Camera,
    correctLabel: 'Vintage Camera',
    options: [
      { label: 'Vintage Camera', icon: Camera, color: 'text-purple-600 bg-purple-50' },
      { label: 'Story Book', icon: BookOpen, color: 'text-amber-600 bg-amber-50' },
      { label: 'House Key', icon: Key, color: 'text-slate-700 bg-slate-100' },
    ],
  },
  {
    id: 5,
    prompt: 'Which utensil do you use at the dinner table to eat soup or cereal?',
    category: 'Dining & Kitchen',
    correctIcon: Utensils,
    correctLabel: 'Soup Spoon & Fork',
    options: [
      { label: 'Compass', icon: Compass, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Soup Spoon & Fork', icon: Utensils, color: 'text-emerald-600 bg-emerald-50' },
      { label: 'Telephone', icon: Phone, color: 'text-teal-600 bg-teal-50' },
    ],
  },
];

export const IconIdentificationGame: React.FC<GameProps> = ({
  difficulty,
  patientName,
  onComplete,
  onCancel,
}) => {
  // Question count: 3 to 5 questions based on difficulty
  const questionCount = Math.min(Math.max(Math.floor(difficulty / 2) + 2, 3), 5);
  const activeQuestions = QUESTIONS.slice(0, questionCount);

  const [currentIdx, setCurrentIdx] = useState<number>(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [mistakes, setMistakes] = useState<number>(0);
  const [correctCount, setCorrectCount] = useState<number>(0);
  const [startTime] = useState<number>(Date.now());

  const currentQ = activeQuestions[currentIdx];

  const handleSelect = (optionLabel: string) => {
    if (isAnswered) return;

    setSelectedOption(optionLabel);
    setIsAnswered(true);

    const isCorrect = optionLabel === currentQ.correctLabel;
    if (isCorrect) {
      sounds.playMatchSuccess();
      setCorrectCount(prev => prev + 1);
    } else {
      sounds.playError();
      setMistakes(prev => prev + 1);
    }

    setTimeout(() => {
      if (currentIdx + 1 < activeQuestions.length) {
        setCurrentIdx(prev => prev + 1);
        setSelectedOption(null);
        setIsAnswered(false);
      } else {
        handleVictory(isCorrect ? mistakes : mistakes + 1);
      }
    }, 1400);
  };

  const handleVictory = (finalMistakes: number) => {
    sounds.playFanfare();
    const duration = Math.max((Date.now() - startTime) / 1000, 5);
    const accuracy = Math.max(0.4, Math.min(1.0, (questionCount - finalMistakes) / questionCount));

    onComplete({
      accuracy: Math.round(accuracy * 100) / 100,
      completionTimeSeconds: Math.round(duration * 10) / 10,
      mistakes: finalMistakes,
      score: Math.round(accuracy * 100),
      metrics: {
        totalQuestions: questionCount,
        correctAnswers: questionCount - finalMistakes,
        categoryTested: 'Daily Living & Semantic Recall',
      },
    });
  };

  return (
    <div className="flex flex-col items-center justify-center w-full max-w-xl mx-auto p-4 select-none">
      {/* Progress header */}
      <div className="flex items-center justify-between w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 mb-6">
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Question:</span>
          <span className="text-lg font-bold text-indigo-700">{currentIdx + 1} / {questionCount}</span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Category:</span>
          <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-indigo-100 text-indigo-800">{currentQ.category}</span>
        </div>
      </div>

      {/* Question Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentQ.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          className="w-full bg-white border-2 border-slate-200 rounded-3xl p-6 shadow-sm mb-6 text-center"
        >
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-200 text-indigo-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-slate-800 leading-snug">
            {currentQ.prompt}
          </h3>
          <p className="text-xs text-slate-500 mt-2">
            Select the matching item below that best answers the question.
          </p>
        </motion.div>
      </AnimatePresence>

      {/* 3 Options */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 w-full">
        {currentQ.options.map((option, idx) => {
          const Icon = option.icon;
          const isSelected = selectedOption === option.label;
          const isCorrect = option.label === currentQ.correctLabel;

          let btnStyle = 'bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300';
          if (isAnswered) {
            if (isCorrect) {
              btnStyle = 'bg-emerald-50 border-emerald-500 ring-2 ring-emerald-300 text-emerald-900';
            } else if (isSelected && !isCorrect) {
              btnStyle = 'bg-rose-50 border-rose-400 ring-2 ring-rose-300 text-rose-900';
            } else {
              btnStyle = 'bg-slate-50 border-slate-200 opacity-60';
            }
          }

          return (
            <motion.button
              key={idx}
              whileTap={{ scale: 0.96 }}
              onClick={() => handleSelect(option.label)}
              disabled={isAnswered}
              className={`p-4 rounded-2xl border-2 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer shadow-xs ${btnStyle}`}
            >
              <div className={`p-3 rounded-2xl mb-2 ${option.color}`}>
                <Icon className="w-8 h-8" />
              </div>
              <span className="text-sm font-bold text-slate-800 text-center">
                {option.label}
              </span>
              {isAnswered && isCorrect && (
                <span className="text-[11px] font-bold text-emerald-700 flex items-center mt-1">
                  <Check className="w-3.5 h-3.5 mr-0.5" /> Correct
                </span>
              )}
              {isAnswered && isSelected && !isCorrect && (
                <span className="text-[11px] font-bold text-rose-600 flex items-center mt-1">
                  <X className="w-3.5 h-3.5 mr-0.5" /> Not quite
                </span>
              )}
            </motion.button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between w-full mt-8 pt-4 border-t border-slate-100">
        <button
          onClick={onCancel}
          className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 rounded-lg hover:bg-slate-100 transition-colors"
        >
          Cancel Exercise
        </button>
        <span className="text-xs text-slate-400">
          Cognitive Domain: <strong>Semantic Memory & Object Recognition</strong>
        </span>
      </div>
    </div>
  );
};
