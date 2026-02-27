import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Target, Award, Play, Activity, CheckCircle2, XCircle, CheckCircle, Flame, Sparkles, ChevronRight } from 'lucide-react';

// Helper to handle line breaks from AI text
const formatAIText = (text) => {
  if (!text) return "";
  return text.replace(/\\n/g, '\n'); 
};

// Set how many questions the assessment should have
const TOTAL_QUESTIONS = 5;

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

  // --- TEST TRACKING STATE ---
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOption, setSelectedOption] = useState(null);
  const [sessionScore, setSessionScore] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [answerHistory, setAnswerHistory] = useState([]);

  // --- API CONNECTION LOGIC ---
  const formatBackendData = (backendQuestion) => {
    return {
      id: Math.random(), 
      topic: backendQuestion.Topic,
      difficulty: backendQuestion.Difficulty_Level,
      text: backendQuestion.Question_Text,
      options: {
        A: backendQuestion.Option_A,
        B: backendQuestion.Option_B,
        C: backendQuestion.Option_C,
        D: backendQuestion.Option_D
      },
      correct: backendQuestion.Correct_Option,
      explanation: backendQuestion.Explanation || "Keep practicing to master this concept!"
    };
  };

  const startTest = async () => {
    setIsLoading(true);
    setCurrentView('test');
    setSelectedOption(null);
    setSessionScore(0);
    setQuestionsAnswered(0);
    setAnswerHistory([]); 

    try {
      const response = await fetch('http://127.0.0.1:5001/api/start-test');
      const data = await response.json();
      setCurrentQuestion(formatBackendData(data.question));
    } catch (error) {
      console.error("Failed to connect to backend:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextQuestion = async () => {
    const isCorrect = selectedOption === currentQuestion.correct;
    const updatedScore = sessionScore + (isCorrect ? 1 : 0);
    
    // Save this specific answer to our history log
    setAnswerHistory(prev => [...prev, {
      question: currentQuestion,
      selectedOption: selectedOption,
      isCorrect: isCorrect
    }]);

    setSessionScore(updatedScore);

    // Stop Condition
    if (questionsAnswered >= TOTAL_QUESTIONS - 1) {
      calculateNewStats(updatedScore);
      setCurrentView('results');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:5001/api/submit-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: currentQuestion.topic,
          current_difficulty: currentQuestion.difficulty,
          is_correct: isCorrect
        })
      });
      
      const data = await response.json();
      setCurrentQuestion(formatBackendData(data.question));
      setQuestionsAnswered(prev => prev + 1);
      setSelectedOption(null);
    } catch (error) {
      console.error("Error submitting answer:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateNewStats = (finalScore) => {
    const testAccuracy = (finalScore / TOTAL_QUESTIONS) * 100;

    setStudentData(prevData => {
      const newAvgAccuracy = prevData.totalTests === 0 
        ? Math.round(testAccuracy) 
        : Math.round(((prevData.avgAccuracy * prevData.totalTests) + testAccuracy) / (prevData.totalTests + 1));

      const updatedSkills = prevData.skills.map(skill => {
        if (["Algorithms", "Data Structures", "Python"].includes(skill.name)) {
           let masteryChange = (finalScore / TOTAL_QUESTIONS) >= 0.5 ? 15 : -5; 
           let newMastery = Math.min(100, Math.max(0, skill.mastery + masteryChange));
           return { ...skill, mastery: newMastery };
        }
        return skill;
      });
      return { ...prev, totalTests: prev.totalTests + 1, avgAccuracy: newAvgAccuracy, skills: updatedSkills };
    });
  };

  // --- DASHBOARD VIEW ---
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 p-6 md:p-12 font-sans overflow-x-hidden selection:bg-fuchsia-500/30">
        
        {/* Background Ambient Glow */}
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

          {/* Dynamic Stats Grid (Staggered) */}
          <motion.div variants={staggerContainer} initial="hidden" animate="show" className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Missions Completed", value: studentData.totalTests, icon: <CheckCircle2 className="text-cyan-400" size={28}/>, glow: "shadow-cyan-500/10" },
              { title: "Global Accuracy", value: `${studentData.avgAccuracy}%`, icon: <Target className="text-fuchsia-400" size={28}/>, glow: "shadow-fuchsia-500/10" },
              { title: "Learning Streak", value: `${studentData.streak} Days`, icon: <Flame className="text-orange-500 drop-shadow-[0_0_8px_rgba(249,115,22,0.8)] animate-pulse" size={28}/>, glow: "shadow-orange-500/10" }
            ].map((stat, i) => (
              <motion.div key={i} variants={slideUpItem}
                className={`bg-slate-900/40 backdrop-blur-xl p-6 rounded-3xl border border-slate-700/50 flex items-center justify-between shadow-xl ${stat.glow} hover:bg-slate-800/60 transition-colors cursor-default`}
              >
                <div>
                  <p className="text-slate-400 font-semibold mb-1 uppercase tracking-wider text-xs">{stat.title}</p>
                  <p className="text-4xl font-black text-white tracking-tight">{stat.value}</p>
                </div>
                <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-800 shadow-inner">{stat.icon}</div>
              </motion.div>
            ))}
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Neural Competency Analytics */}
            <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }} 
              className="md:col-span-2 bg-slate-900/40 backdrop-blur-xl p-8 rounded-[2rem] border border-slate-700/50 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 blur-[80px] rounded-full"></div>
              <h2 className="text-2xl font-bold text-white mb-8 flex items-center tracking-tight">
                <Brain className="mr-3 text-cyan-400"/> Neural Mastery Matrix
              </h2>
              <div className="space-y-8 relative z-10">
                {studentData.skills.map((skill) => (
                  <div key={skill.name + skill.mastery}>
                    <div className="flex justify-between mb-3">
                      <span className="font-bold text-slate-300 text-lg">{skill.name}</span>
                      <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400">{skill.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-950 rounded-full h-4 p-1 border border-slate-800 shadow-inner">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${skill.mastery}%` }} transition={{ duration: 1.5, type: "spring" }}
                        className={`h-full rounded-full bg-gradient-to-r ${skill.color} shadow-lg ${skill.shadow} relative`}
                      >
                         <div className="absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-r from-transparent to-white/30 rounded-full"></div>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Premium Action Card */}
            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
              className="group relative p-[1px] rounded-[2rem] overflow-hidden bg-gradient-to-b from-fuchsia-500 to-cyan-500 shadow-[0_0_40px_rgba(217,70,239,0.3)] hover:shadow-[0_0_60px_rgba(217,70,239,0.5)] transition-all duration-500"
            >
              <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500 to-cyan-500 opacity-50 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative h-full bg-[#0F1423] p-8 rounded-[2rem] flex flex-col justify-center items-center text-center">
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 20, repeat: Infinity, ease: "linear" }} className="bg-gradient-to-br from-fuchsia-500/20 to-cyan-500/20 p-5 rounded-full mb-6 border border-white/10">
                  <Activity size={48} className="text-fuchsia-400" />
                </motion.div>
                <h3 className="text-3xl font-black text-white mb-3 tracking-tight">Initialize Assessment</h3>
                <p className="text-slate-400 mb-8 font-medium leading-relaxed">Our quantum AI engine will calibrate questions to your exact neural frequency in real-time.</p>
                <button onClick={startTest} className="w-full py-5 bg-white text-[#0B0F19] font-black text-lg rounded-2xl shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:scale-105 transition-all duration-300 flex justify-center items-center group/btn">
                  <Play className="mr-2 group-hover/btn:text-fuchsia-500 transition-colors" fill="currentColor" size={22}/> Start Test
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  // --- ACTIVE TEST VIEW ---
  if (currentView === 'test') {
    if (isLoading || !currentQuestion) {
      return (
        <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-6 text-center">
          <Activity className="animate-spin text-indigo-500 mb-6 mx-auto" size={64} />
          <h2 className="text-3xl font-bold mb-2">Generating Adaptive Question...</h2>
          <p className="text-slate-400 text-lg">Our AI is analyzing your skill level</p>
        </div>
      );
    }

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
              <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-white whitespace-pre-wrap">{formatAIText(currentQuestion.text)}</h2>
              <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button key={key} onClick={() => setSelectedOption(key)}
                    className={`w-full text-left p-6 rounded-2xl border-2 transition-all duration-300 flex items-center group
                      ${selectedOption === key ? 'border-cyan-400 bg-cyan-950/40 shadow-[0_0_20px_rgba(6,182,212,0.15)] scale-[1.02]' : 'border-slate-800 bg-slate-900/50 hover:border-slate-600 hover:bg-slate-800'}`}
                  >
                    <span className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl mr-5 font-bold ${selectedOption === key ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{key}</span>
                    <span className={`text-lg md:text-xl whitespace-pre-wrap ${selectedOption === key ? 'text-indigo-100' : 'text-slate-300'}`}>{formatAIText(value)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-12 flex justify-end">
                <button onClick={handleNextQuestion} disabled={!selectedOption}
                  className={`px-10 py-4 rounded-xl font-bold text-lg transition-all ${selectedOption ? 'bg-indigo-500 hover:bg-indigo-400 text-white shadow-xl' : 'bg-slate-700 text-slate-500 opacity-50 cursor-not-allowed'}`}
                >
                  {questionsAnswered === TOTAL_QUESTIONS - 1 ? 'Finish Test' : 'Submit & Next'}
                </button>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    );
  }

  // --- RESULTS & EXPLANATION VIEW ---
  if (currentView === 'results') {
    const sessionAccuracy = Math.round((sessionScore / TOTAL_QUESTIONS) * 100);
    
    return (
      <div className="min-h-screen bg-[#0B0F19] flex flex-col items-center py-16 px-6 font-sans text-white relative overflow-hidden">
        {/* Glow Effects */}
        <div className={`fixed top-0 w-[600px] h-[600px] rounded-full blur-[150px] opacity-20 pointer-events-none ${isSuccess ? 'bg-emerald-500' : 'bg-red-500'}`}></div>

        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl relative z-10">
          
          <div className="text-center mb-12">
            <motion.div initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: "spring", stiffness: 200, damping: 20 }}>
               <Award size={80} className={`mx-auto mb-6 drop-shadow-[0_0_20px_rgba(251,191,36,0.6)] ${isSuccess ? 'text-amber-400' : 'text-slate-600'}`} />
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tight">Mission Debrief</h1>
            <p className="text-xl text-slate-400 font-medium">Session ID: <span className="text-cyan-400 font-mono">#{Math.random().toString(36).substr(2, 9).toUpperCase()}</span></p>
          </div>

          {/* Particular Session Result Card */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
             <div className="bg-indigo-600 p-8 rounded-3xl shadow-lg flex flex-col items-center justify-center">
                <span className="text-indigo-200 uppercase text-xs font-bold tracking-widest mb-2">Session Score</span>
                <h2 className="text-6xl font-black text-white">{sessionAccuracy}%</h2>
                <p className="mt-2 text-indigo-100 font-medium">{sessionScore} / {TOTAL_QUESTIONS} Correct</p>
             </div>

             <div className="bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-lg space-y-4">
                <h3 className="text-lg font-bold text-slate-200 border-b border-slate-700 pb-2">Session Insights</h3>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Efficiency</span>
                  <span className="text-emerald-400 font-bold">{sessionAccuracy > 70 ? 'High' : 'Improving'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Difficulty Level</span>
                  <span className="text-indigo-300 font-bold">Adaptive (AI Generated)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-400">Test Format</span>
                  <span className="text-slate-200 font-bold">{TOTAL_QUESTIONS} Questions</span>
                </div>
             </div>
          </div>

          {/* STAGGERED Performance Review */}
          <div className="mb-12">
            <h2 className="text-3xl font-black mb-8 flex items-center text-white"><Brain className="mr-4 text-fuchsia-400" size={36}/> Test Analysis</h2>
            <motion.div variants={staggerContainer} initial="hidden" animate="show" className="space-y-6">
              {answerHistory.map((item, index) => (
                <div key={index} className={`p-6 rounded-2xl border transition-all ${item.isCorrect ? 'bg-emerald-900/10 border-emerald-800/30' : 'bg-red-900/10 border-red-800/30'}`}>
                  
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-lg font-semibold pr-4 leading-snug whitespace-pre-wrap">{index + 1}. {formatAIText(item.question.text)}</h3>
                    {item.isCorrect ? (
                      <CheckCircle className="text-emerald-500 flex-shrink-0" size={28} />
                    ) : (
                      <XCircle className="text-red-500 flex-shrink-0" size={28} />
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-700/50">
                      <span className="text-slate-500 block mb-1 text-[10px] uppercase font-black">Your Choice</span>
                      <span className={item.isCorrect ? "text-emerald-400 font-bold whitespace-pre-wrap" : "text-red-400 font-bold whitespace-pre-wrap"}>
                        {item.selectedOption}: {formatAIText(item.question.options[item.selectedOption])}
                      </span>
                    </div>
                    {!item.isCorrect && (
                      <div className="bg-emerald-900/20 p-3 rounded-xl border border-emerald-800/30">
                        <span className="text-emerald-500 block mb-1 text-[10px] uppercase font-black">Correct Answer</span>
                        <span className="text-emerald-400 font-bold whitespace-pre-wrap">
                          {item.question.correct}: {formatAIText(item.question.options[item.question.correct])}
                        </span>
                      </div>
                    )}
                  </div>

                  {!item.isCorrect && (
                    <div className="mt-4 bg-slate-900/60 p-4 rounded-xl border-l-4 border-indigo-500 italic text-slate-300 text-sm">
                      <span className="text-indigo-400 font-bold not-italic">Pro Tip: </span> {formatAIText(item.question.explanation)}
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