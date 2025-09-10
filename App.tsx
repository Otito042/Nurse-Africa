
import React from 'react';
import AITutor from './components/AITutor';

const App: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-800">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-3 flex items-center">
          <svg
            className="w-8 h-8 text-emerald-600 mr-3"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v2h-2v-2zm0 4h2v6h-2v-6z" />
            <path d="M11 11h2v2h-2zM11 15h2v2h-2z" visibility="hidden" />
            <path d="M12.5 10.5V17h-1v-6.5H9v-1h6v1z" transform="translate(-0.5 -0.5)"/>
          </svg>
          <h1 className="text-xl font-bold text-emerald-800">
            Nurse Africa <span className="font-light">AI Tutor</span>
          </h1>
        </div>
      </header>
      <main className="container mx-auto p-4">
        <AITutor />
      </main>
    </div>
  );
};

export default App;
