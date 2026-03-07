import React, { useState } from 'react';
import { NumberSelection } from './components/NumberSelection';
import { NumberTracing } from './components/NumberTracing';
import { Button } from './components/ui/button';
import { ArrowLeft } from 'lucide-react';

export default function App() {
  const [currentScreen, setCurrentScreen] = useState<'levels' | 'tracing'>('levels');
  const [selectedNumber, setSelectedNumber] = useState<string>('');
  const [completedNumbers, setCompletedNumbers] = useState<Set<string>>(new Set());

  const handleNumberSelect = (num: string) => {
    setSelectedNumber(num);
    setCurrentScreen('tracing');
  };

  const handleNumberComplete = (num: string) => {
    setCompletedNumbers((prev: Set<string>) => new Set([...prev, num]));
    setTimeout(() => {
      setCurrentScreen('levels');
    }, 2000); // Show celebration for 2 seconds
  };

  const handleBackToLevels = () => {
    setCurrentScreen('levels');
  };

  const handleResetProgress = () => {
    setCompletedNumbers(new Set());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-orange-400 p-4">
      {currentScreen === 'levels' ? (
        <NumberSelection
          onNumberSelect={handleNumberSelect}
          completedNumbers={completedNumbers}
          onResetProgress={handleResetProgress}
        />
      ) : (
        <div className="max-w-4xl mx-auto">
          <div className="mb-4">
            <Button
              onClick={handleBackToLevels}
              variant="outline"
              className="bg-white/90 hover:bg-white border-2 border-purple-300 text-purple-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Levels
            </Button>
          </div>
          <NumberTracing
            number={selectedNumber}
            onComplete={handleNumberComplete}
            isCompleted={completedNumbers.has(selectedNumber)}
          />
        </div>
      )}
    </div>
  );
}