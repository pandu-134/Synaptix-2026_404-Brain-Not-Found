import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Target, Award, Play, Activity, CheckCircle2, XCircle, CheckCircle, Flame, Sparkles, ChevronRight, Zap, AlertTriangle } from 'lucide-react';

// --- EXPANDED DUMMY DATA ---
const mockQuestions = [
  { id: 101, topic: "Algorithms", difficulty: 3, text: "What is the worst-case time complexity of QuickSort?", options: { A: "O(n log n)", B: "O(n^2)", C: "O(n)", D: "O(log n)" }, correct: "B", explanation: "If the pivot is always the largest or smallest element (like in an already sorted array), QuickSort degrades to O(n^2)." },
  { id: 102, topic: "Data Structures", difficulty: 4, text: "Which data structure uses the LIFO principle?", options: { A: "Queue", B: "Linked List", C: "Stack", D: "Tree" }, correct: "C", explanation: "A Stack operates like a stack of plates; the last one on top is the first one off (Last In, First Out)." },
  { id: 103, topic: "Python", difficulty: 2, text: "Which keyword is used to define a function in Python?", options: { A: "func", B: "def", C: "function", D: "define" }, correct: "B", explanation: "In Python, 'def' is short for 'define' and creates user-defined functions." }
];

// --- FRAMER MOTION VARIANTS ---
const staggerContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.15 } } };
const slideUpItem = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } } };

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  const [studentData, setStudentData] = useState({
    name: "Harish", level: "Prodigy", totalTests: 0, avgAccuracy: 0, streak: 12,
    skills: [
      { name: "Python", mastery: 10, color: "from-cyan-400 to-blue-600", shadow: "shadow-cyan-500/50" },
      { name: "Data Structures", mastery: 10, color: "from-fuchsia-400 to-purple-600", shadow: "shadow-purple-500/50" },
      { name: "Algorithms", mastery: 10, color: "from-emerald-400 to-teal-600", shadow: "shadow-teal-500/50" },
    ]
  });

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);

  const startTest = () => {
    setCurrentIndex(0); setSelectedOption(null); setSessionScore(0); setAnswerHistory([]); setCurrentView('test');
  };

  const handleNextQuestion = () => {
    const currentQuestion = mockQuestions[currentIndex];
    const isCorrect = selectedOption === currentQuestion.correct;
    
    setAnswerHistory(prev => [...prev, { question: currentQuestion, selectedOption, isCorrect }]);
    const updatedScore = sessionScore + (isCorrect ? 1 : 0);
    setSessionScore(updatedScore);

    if (currentIndex < mockQuestions.length - 1) {
      setCurrentIndex(currentIndex + 1); setSelectedOption(null);
    } else {
      calculateNewStats(updatedScore); setCurrentView('results');
    }
  };

  const calculateNewStats = (finalScore) => {
    const testAccuracy = (finalScore / mockQuestions.length) * 100;
    setStudentData(prev => {
      const newAvgAccuracy = prev.totalTests === 0 ? Math.round(testAccuracy) : Math.round(((prev.avgAccuracy * prev.totalTests) + testAccuracy) / (prev.totalTests + 1));
      const updatedSkills = prev.skills.map(skill => {
        let masteryChange = (finalScore / mockQuestions.length) >= 0.5 ? 25 : -10; 
        return { ...skill, mastery: Math.min(100, Math.max(0, skill.mastery + masteryChange)) };
      });
      return { ...prev, totalTests: prev.totalTests + 1, avgAccuracy: newAvgAccuracy, skills: updatedSkills };
    });
  };

  // --- DASHBOARD VIEW ---
  if (currentView === 'dashboard') {
    // DYNAMICALLY CALCULATE STRENGTHS AND WEAKNESSES
    // We make a copy of the skills array and sort it from highest mastery to lowest
    const sortedSkills = [...studentData.skills].sort((a, b) => b.mastery - a.mastery);
    const topSkill = sortedSkills[0]; // The highest score
    const bottomSkill = sortedSkills[sortedSkills.length - 1]; // The lowest score

    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12 font-sans overflow-x-hidden selection:bg-fuchsia-500/30 pb-20">
        <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-fuchsia-600/20 blur-[120px] rounded-full pointer-events-none"></div>

        <div className="max-w-6xl mx-auto space-y-10 relative z-10">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
            <div>
              <h1 className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight">
                Welcome back, {studentData.name} <Sparkles className="inline text-fuchsia-400 mb-2" size={32}/>
              </h1>
              <p className="text-slate-400 text-lg font-medium">Your personalized AI learning matrix is ready.</p>
            </div>
            <div className="hidden md:flex items-center space-x-3 bg-slate-900/80 backdrop-blur-xl px-5 py-2.5 rounded-2xl border border-slate-700/50 shadow-[0_0_20px_rgba(0,0,0,0.3)]">
              <Award className="text-amber-400" />
              <span className="font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-500">{studentData.level} Tier</span>
            </div>
          </motion.div>

          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Missions Completed", value: studentData.totalTests, icon: <CheckCircle2 className="text-cyan-400" size={28}/>, glow: "shadow-cyan-500/10" },
              { title: "Global Accuracy", value: `${studentData.avgAccuracy}%`, icon: <Target className="text-fuchsia-400" size={28}/>, glow: "shadow-fuchsia-500/10" },
              { title: "Learning Streak", value: `${studentData.streak} Days`, icon: <Flame className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" size={28}/>, glow: "shadow-orange-500/10" }
            ].map((stat, i) => (
              <motion.div key={i} variants={slideUpItem} className={`bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 flex items-center justify-between shadow-xl ${stat.glow} hover:bg-slate-800/60 transition-colors cursor-default`}>
                <div>
                  <p className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-xs">{stat.title}</p>
                  <p className="text-4xl font-black text-white tracking-tight">{stat.value}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 shadow-inner">{stat.icon}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} className="md:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center tracking-tight"><Brain className="mr-3 text-cyan-400"/> Neural Mastery Matrix</h2>
              <div className="space-y-8 relative z-10">
                {studentData.skills.map((skill) => (
                  <div key={skill.name + skill.mastery}>
                    <div className="flex justify-between mb-3"><span className="font-bold text-slate-300 text-lg">{skill.name}</span><span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{skill.mastery}%</span></div>
                    <div className="w-full bg-slate-950 rounded-full h-4 p-1 border border-slate-800 shadow-inner">
                      <motion.div initial={{ width: 0 }} animate={{ width: `${skill.mastery}%` }} transition={{ duration: 1.5, type: "spring" }} className={`h-full rounded-full bg-gradient-to-r ${skill.color} shadow-lg ${skill.shadow} relative`}><div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} className="group relative p-[1px] rounded-[2rem] overflow-hidden bg-gradient-to-b from-fuchsia-500 to-cyan-500 shadow-[0_0_40px_rgba(217,70,239,0.3)] hover:shadow-[0_0_60px_rgba(217,70,239,0.5)] transition-all duration-500">
              <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full bg-[#0F1423] p-8 rounded-[2rem] flex flex-col justify-center items-center text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 p-5 rounded-full mb-6 border border-white/10"><Activity size={48} className="text-fuchsia-400" /></motion.div>
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Initialize Assessment</h3>
                <p className="text-slate-400 mb-8 font-medium leading-relaxed">Our AI engine will calibrate questions to your neural frequency in real-time.</p>
                <button onClick={startTest} className="w-full py-5 bg-white text-[#0B0F19] font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 flex justify-center items-center group/btn"><Play className="mr-2 group-hover/btn:text-fuchsia-500 transition-colors" fill="currentColor" size={22}/> Launch Protocol</button>
              </div>
            </motion.div>
          </div>

          {/* NEW: DYNAMIC STRENGTHS & WEAKNESSES SECTION */}
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Strength Card */}
            <div className="bg-emerald-950/20 backdrop-blur-xl p-8 rounded-[2rem] border border-emerald-900/30 shadow-[0_0_30px_rgba(16,185,129,0.05)] flex items-center space-x-6 hover:bg-emerald-950/40 transition-colors">
              <div className="bg-emerald-500/20 p-4 rounded-2xl shadow-[0_0_15px_rgba(16,185,129,0.4)]">
                <Zap className="text-emerald-400" size={36} />
              </div>
              <div>
                <h4 className="text-emerald-500 font-bold uppercase tracking-widest text-xs mb-1">Greatest Strength</h4>
                <p className="text-3xl font-black text-white">{topSkill.name}</p>
                <p className="text-slate-400 font-medium mt-1">Exceptional mastery at <span className="text-emerald-400">{topSkill.mastery}%</span>.</p>
              </div>
            </div>

            {/* Focus Area Card */}
            <div className="bg-rose-950/20 backdrop-blur-xl p-8 rounded-[2rem] border border-rose-900/30 shadow-[0_0_30px_rgba(244,63,94,0.05)] flex items-center space-x-6 hover:bg-rose-950/40 transition-colors">
              <div className="bg-rose-500/20 p-4 rounded-2xl shadow-[0_0_15px_rgba(244,63,94,0.4)]">
                <AlertTriangle className="text-rose-400" size={36} />
              </div>
              <div>
                <h4 className="text-rose-500 font-bold uppercase tracking-widest text-xs mb-1">Primary Focus Area</h4>
                <p className="text-3xl font-black text-white">{bottomSkill.name}</p>
                <p className="text-slate-400 font-medium mt-1">Currently at <span className="text-rose-400">{bottomSkill.mastery}%</span>. Needs attention.</p>
              </div>
            </div>

          </motion.div>

        </div>
      </div>
    );
  }

  // ... (The rest of the code remains exactly the same for Active Test and Results views) ...
  // --- ACTIVE TEST VIEW ---
  if (currentView === 'test') {
    const currentQuestion = mockQuestions[currentIndex];
    const progress = ((currentIndex + 1) / mockQuestions.length) * 100;

    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center justify-center p-6 font-sans selection:bg-cyan-500/30">
        <div className="fixed top-0 left-0 w-full h-1.5 bg-slate-800">
           <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className="h-full bg-gradient-to-r from-fuchsia-500 to-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]"></motion.div>
        </div>

        <div className="w-full max-w-3xl flex justify-between mb-8 text-sm font-bold tracking-widest uppercase">
          <span className="text-cyan-400 flex items-center bg-cyan-950/30 px-4 py-2 rounded-xl border border-cyan-900/50"><Target className="mr-2" size={16}/> {currentQuestion.topic}</span>
          <span className="text-fuchsia-400 flex items-center bg-fuchsia-950/30 px-4 py-2 rounded-xl border border-fuchsia-900/50"><Activity className="mr-2" size={16}/> Level {currentQuestion.difficulty}</span>
        </div>

        <div className="w-full max-w-3xl relative">
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} exit={{ opacity: 0, x: -100, filter: "blur(10px)" }} transition={{ duration: 0.4 }}
              className="bg-slate-900/60 backdrop-blur-2xl p-8 md:p-12 rounded-[2.5rem] border border-slate-700/50 shadow-[0_0_50px_rgba(0,0,0,0.5)]"
            >
              <h2 className="text-2xl md:text-4xl font-semibold mb-10 text-white leading-tight tracking-tight">{currentQuestion.text}</h2>
              <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button key={key} onClick={() => setSelectedOption(key)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center group
                      ${selectedOption === key ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] scale-[1.02]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'}`}
                  >
                    <span className={`flex-shrink-0 inline-flex items-center justify-center w-12 h-12 rounded-xl mr-6 font-black text-xl transition-all duration-300 ${selectedOption === key ? 'bg-cyan-400 text-[#0B0F19] shadow-[0_0_15px_rgba(6,182,212,0.5)]' : 'bg-slate-800 text-slate-500 group-hover:bg-slate-700 group-hover:text-slate-300'}`}>{key}</span>
                    <span className={`text-xl font-medium tracking-wide ${selectedOption === key ? 'text-cyan-50' : 'text-slate-300'}`}>{value}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-end">
                <button onClick={handleNextQuestion} disabled={!selectedOption}
                  className={`px-10 py-5 rounded-2xl font-black text-lg transition-all duration-300 flex items-center ${selectedOption ? 'bg-white text-[#0B0F19] shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105' : 'bg-slate-800 text-slate-600 opacity-50 cursor-not-allowed'}`}
                >
                  {currentIndex === mockQuestions.length - 1 ? 'Execute Evaluation' : 'Lock Answer & Proceed'} <ChevronRight className="ml-2"/>
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // --- SHOWCASE RESULTS VIEW ---
  if (currentView === 'results') {
    const sessionAccuracy = Math.round((sessionScore / mockQuestions.length) * 100);
    const isSuccess = sessionAccuracy >= 50;
    
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center py-16 px-6 font-sans text-white relative overflow-hidden">
        <div className={`fixed top-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl relative z-10">
          
          <div className="text-center mb-12">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
               <Award size={80} className={`mx-auto mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${isSuccess ? 'text-amber-400' : 'text-slate-600'}`} />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Mission Debrief</h1>
            <p className="text-xl text-slate-400 font-medium">Session ID: <span className="text-cyan-400 font-mono">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
             <motion.div initial={{ opacity: 0, x: -50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className={`p-[1px] rounded-[2.5rem] bg-gradient-to-b ${isSuccess ? 'from-emerald-400 to-teal-600 shadow-[0_0_40px_rgba(16,185,129,0.2)]' : 'from-red-400 to-rose-600 shadow-[0_0_40px_rgba(244,63,94,0.2)]'}`}>
                <div className="bg-[#0B0F19]/90 backdrop-blur-xl h-full p-10 rounded-[2.5rem] flex flex-col items-center justify-center text-center">
                  <span className={`uppercase text-sm font-black tracking-widest mb-4 ${isSuccess ? 'text-emerald-400' : 'text-red-400'}`}>Neural Synchronization</span>
                  <h2 className="text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-400">{sessionAccuracy}%</h2>
                  <p className="mt-4 text-slate-300 font-bold text-lg bg-slate-800/50 px-6 py-2 rounded-full">{sessionScore} / {mockQuestions.length} Data Points Verified</p>
                </div>
             </motion.div>

             <motion.div initial={{ opacity: 0, x: 50 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} className="bg-slate-900/50 backdrop-blur-xl p-10 rounded-[2.5rem] border border-slate-700/50 shadow-xl space-y-6 flex flex-col justify-center">
                <h3 className="text-xl font-bold text-slate-200 border-b border-slate-700 pb-4">Session Telemetry</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Cognitive Efficiency</span><span className={`font-black ${isSuccess ? 'text-emerald-400' : 'text-amber-400'}`}>{isSuccess ? 'Optimal' : 'Recalibrating'}</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Adaptive Engine</span><span className="text-fuchsia-400 font-black">Active (Lvl 3.5)</span></div>
                  <div className="flex justify-between items-center"><span className="text-slate-400 font-medium">Time Dilation</span><span className="text-white font-black font-mono">02:45:12</span></div>
                </div>
             </motion.div>
          </div>

          <div className="mb-12">
            <h2 className="text-3xl font-black mb-8 flex items-center text-white"><Brain className="mr-4 text-fuchsia-400" size={36}/> Test Analysis</h2>
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
              {answerHistory.map((item, index) => (
                <motion.div variants={slideUpItem} key={index} className={`p-8 rounded-[2rem] border relative overflow-hidden backdrop-blur-md transition-all hover:scale-[1.01] ${item.isCorrect ? 'bg-emerald-950/20 border-emerald-900/50 shadow-[0_0_30px_rgba(16,185,129,0.05)]' : 'bg-red-950/20 border-red-900/50 shadow-[0_0_30px_rgba(244,63,94,0.05)]'}`}>
                  
                  <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${item.isCorrect ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.8)]' : 'bg-red-500 shadow-[0_0_10px_rgba(244,63,94,0.8)]'}`}></div>

                  <div className="flex items-start justify-between mb-6 pl-4">
                    <h3 className="text-xl font-bold text-white leading-relaxed pr-6"><span className="text-slate-500 mr-2">0{index + 1}.</span> {item.question.text}</h3>
                    {item.isCorrect ? <CheckCircle className="text-emerald-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" size={32} /> : <XCircle className="text-red-400 flex-shrink-0 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" size={32} />}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pl-4">
                    <div className="bg-[#0B0F19]/60 p-5 rounded-2xl border border-slate-800">
                      <span className="text-slate-500 block mb-2 text-xs uppercase font-black tracking-widest">User Input</span>
                      <span className={`text-lg font-bold ${item.isCorrect ? "text-emerald-400" : "text-red-400"}`}>{item.selectedOption}: {item.question.options[item.selectedOption]}</span>
                    </div>
                    {!item.isCorrect && (
                      <div className="bg-emerald-950/30 p-5 rounded-2xl border border-emerald-900/50">
                        <span className="text-emerald-500 block mb-2 text-xs uppercase font-black tracking-widest">Optimal Output</span>
                        <span className="text-emerald-400 text-lg font-bold">{item.question.correct}: {item.question.options[item.question.correct]}</span>
                      </div>
                    )}
                  </div>

                  {!item.isCorrect && (
                    <div className="mt-6 ml-4 bg-[#0B0F19]/80 p-5 rounded-2xl border-l-4 border-fuchsia-500 flex items-start">
                      <Sparkles className="text-fuchsia-400 mr-4 flex-shrink-0 mt-1" size={20}/>
                      <p className="text-slate-300 font-medium leading-relaxed"><strong className="text-fuchsia-400 font-bold uppercase text-xs tracking-widest block mb-1">AI Insights</strong> {item.question.explanation}</p>
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1 }} className="flex justify-center pb-20">
            <button onClick={() => setCurrentView('dashboard')} className="px-12 py-5 bg-white text-[#0B0F19] rounded-2xl font-black text-xl transition-all shadow-[0_0_40px_rgba(255,255,255,0.2)] hover:shadow-[0_0_60px_rgba(255,255,255,0.4)] hover:-translate-y-2 flex items-center">
              Return to HOME <ChevronRight className="ml-2"/>
            </button>
          </motion.div>
        </motion.div>
      </div>
    );
  }
}