import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Target, Award, Play, Activity, CheckCircle2 } from 'lucide-react';

// --- DUMMY DATA ---
const studentData = {
  name: "Harish",
  level: "Intermediate",
  totalTests: 12,
  avgAccuracy: "78%",
  streak: 5,
  skills: [
    { name: "Python", mastery: 85, color: "from-blue-400 to-blue-600" },
    { name: "Data Structures", mastery: 60, color: "from-emerald-400 to-emerald-600" },
    { name: "Algorithms", mastery: 45, color: "from-purple-400 to-purple-600" },
  ]
};

const mockQuestions = [
  { id: 101, topic: "Algorithms", difficulty: 3, text: "What is the worst-case time complexity of QuickSort?", options: { A: "O(n log n)", B: "O(n^2)", C: "O(n)", D: "O(log n)" } },
  { id: 102, topic: "Data Structures", difficulty: 4, text: "Which data structure uses LIFO (Last In, First Out) principle?", options: { A: "Queue", B: "Linked List", C: "Stack", D: "Tree" } },
];

// --- MAIN APP COMPONENT ---
export default function App() {
  const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard', 'test', 'results'
  
  // Test State
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);

  const startTest = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setCurrentView('test');
  };

  const handleNextQuestion = () => {
    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
    } else {
      setCurrentView('results');
    }
  };

  // --- DASHBOARD VIEW ---
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans">
        <div className="max-w-6xl mx-auto space-y-8">
          
          {/* Welcome Header */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">Welcome back, {studentData.name}! 👋</h1>
              <p className="text-slate-400 text-lg">Ready to level up your skills today?</p>
            </div>
            <div className="hidden md:flex items-center space-x-2 bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
              <Award className="text-amber-400" />
              <span className="font-bold text-slate-200">{studentData.level} Rank</span>
            </div>
          </motion.div>

          {/* Quick Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Tests Completed", value: studentData.totalTests, icon: <CheckCircle2 className="text-emerald-400" size={32}/> },
              { title: "Avg. Accuracy", value: studentData.avgAccuracy, icon: <Target className="text-blue-400" size={32}/> },
              { title: "Current Streak", value: `${studentData.streak} Days`, icon: <TrendingUp className="text-amber-400" size={32}/> }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 backdrop-blur-sm p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-400 font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl shadow-inner">{stat.icon}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Competency Profile */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} 
              className="md:col-span-2 bg-slate-800/50 backdrop-blur-sm p-8 rounded-3xl border border-slate-700/50"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><Brain className="mr-3 text-indigo-400"/> Competency Analytics</h2>
              <div className="space-y-6">
                {studentData.skills.map((skill, index) => (
                  <div key={index}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-slate-300">{skill.name}</span>
                      <span className="font-bold text-white">{skill.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${skill.mastery}%` }} transition={{ duration: 1, delay: 0.5 + (index * 0.2) }}
                        className={`h-3 rounded-full bg-gradient-to-r ${skill.color}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Action Card */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-gradient-to-b from-indigo-600 to-indigo-900 p-8 rounded-3xl border border-indigo-500/30 flex flex-col justify-center items-center text-center shadow-2xl shadow-indigo-900/50"
            >
              <div className="bg-indigo-500/30 p-4 rounded-full mb-6">
                <Activity size={48} className="text-indigo-200" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-3">Adaptive Assessment</h3>
              <p className="text-indigo-200 mb-8 leading-relaxed">Our AI will dynamically adjust to your skill level to find your true mastery.</p>
              <button 
                onClick={startTest}
                className="w-full py-4 bg-white text-indigo-900 font-extrabold rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 flex justify-center items-center"
              >
                <Play className="mr-2" fill="currentColor" size={20}/> Start Now
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE TEST VIEW ---
  if (currentView === 'test') {
    const currentQuestion = mockQuestions[currentIndex];
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-3xl flex justify-between mb-8 text-sm font-bold tracking-wide">
          <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg shadow-md border border-slate-700">TOPIC: <span className="text-indigo-400">{currentQuestion.topic}</span></span>
          <span className="bg-indigo-900/40 text-indigo-300 px-4 py-2 rounded-lg shadow-md border border-indigo-700/50">LVL: {currentQuestion.difficulty}</span>
        </div>
        <div className="w-full max-w-3xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.4 }}
              className="bg-slate-800 p-8 md:p-12 rounded-3xl shadow-2xl border border-slate-700"
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-white leading-tight">{currentQuestion.text}</h2>
              <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button key={key} onClick={() => setSelectedOption(key)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all duration-200 flex items-center group
                      ${selectedOption === key ? 'border-indigo-500 bg-indigo-500/10 scale-[1.02]' : 'border-slate-700 hover:border-indigo-400/50 bg-slate-800/50 hover:bg-slate-700'}`}
                  >
                    <span className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl mr-5 font-bold text-lg transition-colors ${selectedOption === key ? 'bg-indigo-500 text-white shadow-lg' : 'bg-slate-700 text-slate-400'}`}>{key}</span>
                    <span className={`text-lg md:text-xl ${selectedOption === key ? 'text-indigo-100 font-medium' : 'text-slate-300'}`}>{value}</span>
                  </button>
                ))}
              </div>
              <div className="mt-10 flex justify-end border-t border-slate-700 pt-6">
                <button onClick={handleNextQuestion} disabled={!selectedOption}
                  className={`px-10 py-4 rounded-xl font-bold text-lg transition-all duration-300 flex items-center ${selectedOption ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl translate-y-0' : 'bg-slate-700 text-slate-500 cursor-not-allowed opacity-50'}`}
                >
                  Submit & Next
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // --- RESULTS VIEW ---
  if (currentView === 'results') {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6">
        <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
          <Award size={80} className="text-amber-400 mx-auto mb-6" />
          <h1 className="text-5xl font-extrabold mb-4 text-emerald-400">Assessment Complete!</h1>
          <p className="text-xl text-slate-300 mb-8">Your new competency profile has been updated.</p>
          <button onClick={() => setCurrentView('dashboard')} className="px-8 py-3 bg-slate-800 hover:bg-slate-700 rounded-xl font-bold border border-slate-600 transition-colors">
            Return to Dashboard
          </button>
        </motion.div>
      </div>
    );
  }
}