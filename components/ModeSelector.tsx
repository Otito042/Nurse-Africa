import React from 'react';
import { TutorMode, OSCESubModes, NMCCBTSubModes, OSCESubMode, NMCCBTSubMode } from '../types';
import { BookIcon } from './icons/BookIcon';
import { ExamIcon } from './icons/ExamIcon';
import { OSCEIcon } from './icons/OSCEIcon';
import { NCLEXIcon } from './icons/NCLEXIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { NMCIcon } from './icons/NMCIcon';
import { JobsIcon } from './icons/JobsIcon';
import { CareerIcon } from './icons/CareerIcon';


interface ModeSelectorProps {
  currentMode: TutorMode;
  currentSubMode: OSCESubMode | NMCCBTSubMode | null;
  onModeChange: (mode: TutorMode) => void;
  onSubModeChange: (subMode: OSCESubMode | NMCCBTSubMode) => void;
}

interface ModeConfig {
    id: TutorMode;
    label: string;
    icon: React.FC<React.SVGProps<SVGSVGElement>>;
    subModes?: readonly string[];
}

const modes: ModeConfig[] = [
  { id: 'Tutor', label: 'AI Tutor', icon: BookIcon },
  { id: 'Exam', label: 'Exam Sim', icon: ExamIcon },
  { id: 'OSCE', label: 'OSCE Sim', icon: OSCEIcon, subModes: OSCESubModes },
  { id: 'NMC_CBT', label: 'NMC CBT', icon: NMCIcon, subModes: NMCCBTSubModes },
  { id: 'NCLEX', label: 'NCLEX', icon: NCLEXIcon },
  { id: 'OET', label: 'OET Prep', icon: LanguageIcon },
  { id: 'IELTS', label: 'IELTS Prep', icon: LanguageIcon },
  { id: 'Jobs', label: 'Job List', icon: JobsIcon },
  { id: 'Career', label: 'Career Dev', icon: CareerIcon },
];

const ModeSelector: React.FC<ModeSelectorProps> = ({ currentMode, currentSubMode, onModeChange, onSubModeChange }) => {
  const activeModeConfig = modes.find(m => m.id === currentMode);

  return (
    <div className="p-3 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
      <div className="flex flex-wrap justify-center gap-2">
        {modes.map((mode) => (
          <button
            key={mode.id}
            onClick={() => onModeChange(mode.id)}
            className={`flex items-center justify-center gap-2 px-3 py-2 text-xs sm:text-sm font-semibold rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 ${
              currentMode === mode.id
                ? 'bg-emerald-600 text-white shadow-md'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
            }`}
            aria-pressed={currentMode === mode.id}
          >
            <mode.icon className="w-4 h-4 sm:w-5 sm:h-5" />
            <span>{mode.label}</span>
          </button>
        ))}
      </div>
      {activeModeConfig?.subModes && (
        <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex flex-wrap justify-center gap-2">
                {activeModeConfig.subModes.map((subMode) => (
                    <button
                        key={subMode}
                        onClick={() => onSubModeChange(subMode as any)}
                        className={`px-3 py-1 text-xs sm:text-sm font-medium rounded-full transition-colors duration-200 ${
                            currentSubMode === subMode
                            ? 'bg-emerald-200 text-emerald-800 ring-1 ring-emerald-500'
                            : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                        }`}
                        aria-pressed={currentSubMode === subMode}
                    >
                       {subMode}
                    </button>
                ))}
            </div>
        </div>
      )}
    </div>
  );
};

export default ModeSelector;
