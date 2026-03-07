import React from 'react';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Star, Lock, RotateCcw, Medal } from 'lucide-react';

interface NumberSelectionProps {
  onNumberSelect: (number: string) => void;
  completedNumbers: Set<string>;
  onResetProgress: () => void;
}

const NUMBERS = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];

const NUMBER_COLORS = [
  'bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-green-400', 'bg-blue-400', 'bg-indigo-400',
  'bg-purple-400', 'bg-pink-400', 'bg-rose-400', 'bg-emerald-400', 'bg-teal-400'
];

export function NumberSelection({ onNumberSelect, completedNumbers, onResetProgress }: NumberSelectionProps) {
  const getNumberStatus = (number: string, index: number) => {
    if (completedNumbers.has(number)) return 'completed';
    return 'available';
  };

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-5xl font-bold text-white mb-4 drop-shadow-lg">
          🌟 Number Adventure 🌟
        </h1>
        <p className="text-xl text-white/90 drop-shadow">
          Click on a number to start tracing!
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
        <div className="bg-white rounded-xl border-4 border-yellow-400 p-3 shadow-lg flex items-center gap-3">
          <div className="bg-orange-100 p-2 rounded-full">
            <Medal className="w-8 h-8 text-orange-500" />
          </div>
          <div>
            <p className="text-purple-700 font-bold text-lg">Completed: {completedNumbers.size}/11 Numbers</p>
            <p className="text-sm text-purple-500 font-medium">
              {Math.round((completedNumbers.size / 11) * 100)}% Complete - Keep going! 🚀
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            if (window.confirm("Are you sure you want to reset your progress?")) {
              onResetProgress();
            }
          }}
          disabled={completedNumbers.size === 0}
          className={`bg-white text-rose-500 font-bold px-4 py-2 rounded-lg border-2 border-rose-200 shadow transition-all flex items-center gap-2 ${
            completedNumbers.size === 0 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-rose-50 hover:scale-105'
          }`}
        >
          <RotateCcw className="w-5 h-5" />
          Reset Progress
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-7 gap-4">
        {NUMBERS.map((number, index) => {
          const status = getNumberStatus(number, index);
          const isCompleted = status === 'completed';
          const colorClass = NUMBER_COLORS[index];

          return (
            <Card
              key={number}
              className={`
                relative aspect-square cursor-pointer transition-all duration-300 hover:scale-105 
                border-4 border-white/50 shadow-lg hover:shadow-xl hover:border-white
                ${colorClass}
              `}
              onClick={() => onNumberSelect(number)}
            >
              <div className="h-full flex flex-col items-center justify-center p-2">
                <>
                  <span className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg">
                    {number}
                  </span>
                  {isCompleted && (
                    <div className="absolute -top-2 -right-2">
                      <Badge className="bg-yellow-400 text-yellow-900 border-2 border-yellow-200 px-2 py-1">
                        <Star className="w-3 h-3 mr-1 fill-current" />
                        ✓
                      </Badge>
                    </div>
                  )}
                </>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}