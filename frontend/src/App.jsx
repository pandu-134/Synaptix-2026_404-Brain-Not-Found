import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, TrendingUp, Target, Award, Play, Activity, CheckCircle2, XCircle, CheckCircle } from 'lucide-react';

// Helper to handle line breaks from AI text
const formatAIText = (text) => {
  if (!text) return "";
  return text.replace(/\\n/g, '\n'); 
};

// Set how many questions the assessment should have
const TOTAL_QUESTIONS = 5;

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  
  // --- DASHBOARD STATE ---
  const [studentData, setStudentData] = useState({
    name: "Harish",
    level: "Beginner",
    totalTests: 0, 
    avgAccuracy: 0, 
    streak: 0,
    skills: [
      { name: "Python", mastery: 10, color: "from-blue-400 to-blue-600" },
      { name: "Data Structures", mastery: 10, color: "from-emerald-400 to-emerald-600" },
      { name: "Algorithms", mastery: 10, color: "from-purple-400 to-purple-600" },
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

      return {
        ...prevData,
        totalTests: prevData.totalTests + 1,
        avgAccuracy: newAvgAccuracy,
        skills: updatedSkills
      };
    });
  };

  // --- DASHBOARD VIEW ---
  if (currentView === 'dashboard') {
    return (
      <div className="min-h-screen bg-slate-900 text-slate-100 p-6 md:p-12 font-sans overflow-x-hidden">
        <div className="max-w-6xl mx-auto space-y-8">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-end">
            <div>
              <h1 className="text-4xl font-extrabold text-white mb-2">Welcome back, {studentData.name}! 👋</h1>
              <p className="text-slate-400 text-lg">Ready to level up your skills today?</p>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { title: "Tests Completed", value: studentData.totalTests, icon: <CheckCircle2 className="text-emerald-400" size={32}/> },
              { title: "Avg. Accuracy", value: `${studentData.avgAccuracy}%`, icon: <Target className="text-blue-400" size={32}/> },
              { title: "Current Streak", value: `${studentData.streak} Days`, icon: <TrendingUp className="text-amber-400" size={32}/> }
            ].map((stat, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 flex items-center justify-between"
              >
                <div>
                  <p className="text-slate-400 font-medium mb-1">{stat.title}</p>
                  <p className="text-3xl font-bold text-white">{stat.value}</p>
                </div>
                <div className="bg-slate-800 p-3 rounded-xl">{stat.icon}</div>
              </motion.div>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }} 
              className="md:col-span-2 bg-slate-800/50 p-8 rounded-3xl border border-slate-700/50"
            >
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center"><Brain className="mr-3 text-indigo-400"/> Competency Analytics</h2>
              <div className="space-y-6">
                {studentData.skills.map((skill, index) => (
                  <div key={skill.name + skill.mastery}>
                    <div className="flex justify-between mb-2">
                      <span className="font-semibold text-slate-300">{skill.name}</span>
                      <span className="font-bold text-white">{skill.mastery}%</span>
                    </div>
                    <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} animate={{ width: `${skill.mastery}%` }} transition={{ duration: 1.5, ease: "easeOut" }}
                        className={`h-3 rounded-full bg-gradient-to-r ${skill.color}`}
                      ></motion.div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.4 }}
              className="bg-gradient-to-b from-indigo-600 to-indigo-900 p-8 rounded-3xl border border-indigo-500/30 flex flex-col justify-center items-center text-center shadow-2xl"
            >
              <div className="bg-indigo-500/30 p-4 rounded-full mb-6"><Activity size={48} className="text-indigo-200" /></div>
              <h3 className="text-2xl font-bold text-white mb-3">Adaptive Assessment</h3>
              <p className="text-indigo-200 mb-8 leading-relaxed">Our AI will dynamically adjust to your skill level to find your true mastery.</p>
              <button onClick={startTest} className="w-full py-4 bg-white text-indigo-900 font-extrabold rounded-xl shadow-lg hover:scale-105 transition-transform duration-200 flex justify-center items-center">
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-6 font-sans">
        <div className="w-full max-w-3xl flex justify-between mb-8 text-sm font-bold tracking-wide">
          <span className="bg-slate-800 text-slate-300 px-4 py-2 rounded-lg border border-slate-700">TOPIC: <span className="text-indigo-400">{currentQuestion.topic}</span></span>
          <span className="bg-indigo-900/40 text-indigo-300 px-4 py-2 rounded-lg border border-indigo-700/50">LVL: {currentQuestion.difficulty}</span>
        </div>
        <div className="w-full max-w-3xl relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div key={currentQuestion.id} initial={{ opacity: 0, x: 100 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -100 }} transition={{ duration: 0.3 }}
              className="bg-slate-800 p-8 md:p-12 rounded-3xl border border-slate-700 shadow-2xl"
            >
              <h2 className="text-2xl md:text-3xl font-semibold mb-10 text-white whitespace-pre-wrap">{formatAIText(currentQuestion.text)}</h2>
              <div className="space-y-4">
                {Object.entries(currentQuestion.options).map(([key, value]) => (
                  <button key={key} onClick={() => setSelectedOption(key)}
                    className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center group
                      ${selectedOption === key ? 'border-indigo-500 bg-indigo-500/10' : 'border-slate-700 hover:border-indigo-400/50 bg-slate-800/50'}`}
                  >
                    <span className={`flex-shrink-0 inline-flex items-center justify-center w-10 h-10 rounded-xl mr-5 font-bold ${selectedOption === key ? 'bg-indigo-500 text-white' : 'bg-slate-700 text-slate-400'}`}>{key}</span>
                    <span className={`text-lg md:text-xl whitespace-pre-wrap ${selectedOption === key ? 'text-indigo-100' : 'text-slate-300'}`}>{formatAIText(value)}</span>
                  </button>
                ))}
              </div>
              <div className="mt-10 flex justify-end border-t border-slate-700 pt-6">
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
      <div className="min-h-screen bg-slate-900 flex flex-col items-center py-12 px-6 font-sans text-white">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-4xl">
          
          {/* Header */}
          <div className="text-center mb-10">
            <Award size={64} className="text-amber-400 mx-auto mb-4" />
            <h1 className="text-4xl font-extrabold mb-2 text-emerald-400">Test Summary</h1>
            <p className="text-xl text-slate-400 font-medium">Session ID: #{(Math.random() * 10000).toFixed(0)}</p>
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

          {/* Detailed Performance Review List */}
          <div className="bg-slate-800 rounded-3xl p-6 md:p-8 border border-slate-700 shadow-2xl mb-8">
            <h2 className="text-2xl font-bold mb-6 border-b border-slate-700 pb-4 flex items-center">
              <Activity className="mr-3 text-indigo-400" /> Question-by-Question Analysis
            </h2>
            
            <div className="space-y-6">
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
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-center pb-10">
            <button onClick={() => setCurrentView('dashboard')} className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl font-black text-lg transition-all shadow-xl shadow-indigo-500/20 hover:-translate-y-1">
              Confirm & Return to Dashboard
            </button>
          </div>
        </motion.div>
      </div>
    );
  }
}