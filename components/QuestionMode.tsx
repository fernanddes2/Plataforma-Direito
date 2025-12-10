import React, { useState, useEffect, useRef } from 'react';
import { Question } from '../types';
import { CheckCircle, XCircle, AlertCircle, Sparkles, ChevronRight, RefreshCw, Home, Trophy, Scale, FileText, PenTool } from 'lucide-react';
import { explainQuestion, generateQuizForTopic } from '../services/geminiService';
import MarkdownRenderer from './MarkdownRenderer';

interface QuestionModeProps {
  initialQuestions?: Question[]; 
  topicName: string;
  isExamMode?: boolean;
  onExit: () => void;
  onUpdateStats: (correct: boolean) => void;
}

const QuestionMode: React.FC<QuestionModeProps> = ({ initialQuestions, topicName, isExamMode = false, onExit, onUpdateStats }) => {
  const [questions, setQuestions] = useState<Question[]>(initialQuestions || []);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Estado para Objetiva
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  
  // Estado para Discursiva
  const [userAnswer, setUserAnswer] = useState('');
  
  const [isAnswered, setIsAnswered] = useState(false);
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [quizFinished, setQuizFinished] = useState(false);
  const [score, setScore] = useState(0);
  const hasFetched = useRef(false);

  useEffect(() => {
    const loadQuestions = async () => {
        if (initialQuestions && initialQuestions.length > 0) {
            setQuestions(initialQuestions);
            setLoading(false);
            return;
        }
        if (hasFetched.current) return;
        hasFetched.current = true;
        await fetchNewQuestions();
    };
    loadQuestions();
  }, [topicName, initialQuestions, isExamMode]);

  const fetchNewQuestions = async () => {
      setLoading(true);
      setQuestions([]);
      setCurrentIndex(0);
      setScore(0);
      setQuizFinished(false);
      setIsAnswered(false);
      setSelectedOption(null);
      setUserAnswer('');
      setAiExplanation(null);

      try {
          const context = isExamMode ? topicName : false;
          // Se for discursiva (detectado pelo nome do topico), pede menos questões
          const count = topicName.toLowerCase().includes('discursiva') ? 2 : (isExamMode ? 10 : 5);
          const newQuestions = await generateQuizForTopic(topicName, count, context);
          setQuestions(newQuestions);
      } catch (e) {
          console.error(e);
      } finally {
          setLoading(false);
      }
  };

  const currentQuestion = questions[currentIndex];
  
  const handleSelect = (index: number) => {
    if (isAnswered) return;
    setSelectedOption(index);
  };

  const handleSubmit = () => {
    if (!currentQuestion) return;
    if (currentQuestion.type === 'objective' && selectedOption === null) return;
    if (currentQuestion.type === 'discursive' && !userAnswer.trim()) return;

    setIsAnswered(true);
    
    if (currentQuestion.type === 'objective') {
        // Usa nullish coalescing (??) para garantir que 0 seja considerado um número válido
        const correctIndex = currentQuestion.correctAnswerIndex ?? 0;
        const correct = selectedOption === correctIndex;
        if (correct) setScore(prev => prev + 1);
        onUpdateStats(correct);
    } else {
        // Discursivas são auto-avaliativas no momento, mas contam como "praticadas"
        onUpdateStats(true); 
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedOption(null);
      setUserAnswer('');
      setIsAnswered(false);
      setAiExplanation(null);
    } else {
      setQuizFinished(true);
    }
  };

  const handleAskAI = async () => {
    if (!currentQuestion) return;
    setLoadingAi(true);

    if (currentQuestion.type === 'objective') {
        // CORREÇÃO DOS ERROS 1, 2 e 3:
        // Garantimos que options é um array (ou vazio) e o index é um número (ou 0)
        const opts = currentQuestion.options || [];
        const correctIdx = currentQuestion.correctAnswerIndex ?? 0;
        const correctText = opts[correctIdx] || "Opção correta não identificada";

        const explanation = await explainQuestion(
            currentQuestion.text, 
            opts, 
            correctText
        );
        setAiExplanation(explanation);
    } else {
        // Para discursiva, a "IA" pode comparar a resposta do usuário com o espelho
        setAiExplanation(`**Análise da IA sobre o tema:**\n\n${currentQuestion.explanation || "Sem análise extra disponível."}`);
    }
    setLoadingAi(false);
  };

  if (loading) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center animate-fade-in">
              <div className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
                  Preparando Material Jurídico
              </h2>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">
                  Consultando editais (ALERJ, TJRJ, PGE) e jurisprudência para <strong>{topicName}</strong>...
              </p>
          </div>
      );
  }

  if (quizFinished) {
      return (
          <div className="flex flex-col items-center justify-center h-full p-8 animate-fade-in-up">
              <div className="bg-white dark:bg-slate-800 p-10 rounded-3xl shadow-xl text-center max-w-lg w-full border border-gray-100 dark:border-slate-700">
                  <div className="inline-flex p-4 bg-yellow-50 dark:bg-yellow-900/30 rounded-full mb-6">
                      <Trophy className="w-12 h-12 text-yellow-500" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Treino Finalizado!</h2>
                  <p className="text-gray-500 dark:text-gray-400 mb-8">Ciclo de estudos em {topicName} concluído.</p>
                  
                  {questions.length > 0 && questions[0].type === 'objective' && (
                      <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-2xl mb-6">
                          <span className="block text-3xl font-bold text-primary-600 dark:text-primary-400">{score}/{questions.length}</span>
                          <span className="text-xs text-gray-400 dark:text-gray-500 uppercase font-bold">Acertos</span>
                      </div>
                  )}

                  <div className="space-y-3">
                      <button onClick={fetchNewQuestions} className="w-full py-3 bg-secondary-900 hover:bg-black dark:bg-primary-900/50 dark:hover:bg-primary-900 text-white rounded-xl font-bold transition-colors flex items-center justify-center">
                          <Scale className="w-4 h-4 mr-2" /> Novo Simulado
                      </button>
                      <button onClick={onExit} className="w-full py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-xl font-bold transition-colors">
                          Voltar ao Menu
                      </button>
                  </div>
              </div>
          </div>
      );
  }

  if (!currentQuestion) return null;

  return (
    <div className="max-w-screen-xl 2xl:max-w-[1600px] mx-auto p-6 2xl:p-10 h-full flex flex-col">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-2 sm:space-x-4">
            <button onClick={onExit} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-medium text-sm flex items-center">
                <Home className="w-4 h-4 mr-1" /> Sair
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-slate-600 mx-2"></div>
            <span className="text-sm font-semibold text-gray-400">Questão {currentIndex + 1}</span>
        </div>
        <span className="text-xs px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-300 rounded-full font-bold uppercase tracking-wide truncate max-w-[200px]">
            {topicName}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 2xl:gap-12 flex-1 overflow-y-auto custom-scrollbar">
        <div className="lg:col-span-2 space-y-8">
            <div>
                <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold px-2 py-1 rounded uppercase bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400">
                        {currentQuestion.type === 'discursive' ? 'Discursiva / Peça Prática' : currentQuestion.difficulty}
                    </span>
                </div>
                <h2 className="text-xl 2xl:text-2xl font-semibold text-gray-900 dark:text-white leading-relaxed">
                    <MarkdownRenderer content={currentQuestion.text} />
                </h2>
            </div>

            {/* RENDERIZAÇÃO CONDICIONAL: OBJETIVA OU DISCURSIVA */}
            {currentQuestion.type === 'objective' ? (
                <div className="space-y-3 2xl:space-y-4">
                    {/* CORREÇÃO DO ERRO 4: Fallback para array vazio se options for undefined */}
                    {(currentQuestion.options || []).map((option, index) => {
                        let styles = "border-gray-200 dark:border-slate-700 hover:border-primary-400 dark:hover:border-primary-500 hover:bg-blue-50/50 dark:hover:bg-slate-700";
                        let icon = <div className="w-5 h-5 rounded-full border border-gray-300 dark:border-gray-500"></div>;
                        
                        if (isAnswered) {
                            if (index === currentQuestion.correctAnswerIndex) {
                                styles = "border-green-500 bg-green-50 dark:bg-green-900/20";
                                icon = <CheckCircle className="w-5 h-5 text-green-600" />;
                            } else if (index === selectedOption) {
                                styles = "border-red-500 bg-red-50 dark:bg-red-900/20";
                                icon = <XCircle className="w-5 h-5 text-red-500" />;
                            }
                        } else if (selectedOption === index) {
                            styles = "border-primary-500 bg-primary-50 dark:bg-primary-900/20 ring-1 ring-primary-500";
                            icon = <div className="w-5 h-5 rounded-full border-[5px] border-primary-500"></div>;
                        }

                        return (
                            <button key={index} onClick={() => handleSelect(index)} disabled={isAnswered} className={`w-full p-4 text-left rounded-xl border-2 flex items-center space-x-4 transition-all duration-200 ${styles}`}>
                                <div className="flex-shrink-0">{icon}</div>
                                <span className="text-sm md:text-base font-medium text-gray-700 dark:text-gray-200">
                                    <MarkdownRenderer content={option} />
                                </span>
                            </button>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                        <PenTool className="w-4 h-4 inline mr-2" />
                        Redija sua resposta ou tópicos da peça:
                    </label>
                    <textarea
                        value={userAnswer}
                        onChange={(e) => setUserAnswer(e.target.value)}
                        disabled={isAnswered}
                        placeholder="Ex: Preliminarmente, argui-se a incompetência do juízo..."
                        className="w-full h-96 p-4 rounded-xl border-2 border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none font-mono text-sm leading-relaxed dark:text-gray-200"
                    />
                </div>
            )}

            <div className="pt-4">
                {!isAnswered ? (
                    <button 
                        onClick={handleSubmit}
                        disabled={currentQuestion.type === 'objective' ? selectedOption === null : !userAnswer.trim()}
                        className="w-full py-4 rounded-xl font-bold text-white bg-secondary-900 hover:bg-black dark:bg-primary-600 dark:hover:bg-primary-500 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {currentQuestion.type === 'objective' ? 'Confirmar Resposta' : 'Finalizar Redação'}
                    </button>
                ) : (
                    <div className="flex justify-end">
                         <button onClick={handleNext} className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg flex items-center space-x-2 transition-all">
                            <span>Próxima</span><ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                )}
            </div>
        </div>

        {/* Coluna Direita: Feedback */}
        <div className="lg:col-span-1">
            {isAnswered && (
                <div className="animate-fade-in-up space-y-4">
                    {/* Espelho / Gabarito */}
                    <div className="bg-slate-100 dark:bg-slate-800 p-6 rounded-2xl border border-slate-200 dark:border-slate-700">
                        <h4 className="font-bold flex items-center gap-2 mb-3 text-slate-800 dark:text-white">
                            <FileText className="w-4 h-4" />
                            {currentQuestion.type === 'objective' ? 'Gabarito Comentado' : 'Espelho de Correção (Banca)'}
                        </h4>
                        <div className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed custom-scrollbar max-h-96 overflow-y-auto">
                            {/* CORREÇÃO DO ERRO 5: Garantir que content seja string, nunca undefined */}
                            <MarkdownRenderer content={currentQuestion.explanation || currentQuestion.referenceAnswer || "Sem comentário disponível."} />
                        </div>
                    </div>
                    
                    {/* Botão de Análise Extra para Discursivas */}
                    {currentQuestion.type === 'discursive' && !aiExplanation && (
                        <button onClick={handleAskAI} className="w-full py-3 bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors">
                            <Sparkles className="w-4 h-4" /> Analisar Profundidade (IA)
                        </button>
                    )}
                    
                    {/* Análise da IA */}
                    {aiExplanation && (
                         <div className="bg-purple-50 dark:bg-purple-900/10 p-6 rounded-2xl border border-purple-100 dark:border-purple-800">
                            <h4 className="font-bold flex items-center gap-2 mb-3 text-purple-800 dark:text-purple-300">
                                <Sparkles className="w-4 h-4" /> JusMind Comenta
                            </h4>
                            <div className="text-sm text-purple-900 dark:text-purple-200 leading-relaxed custom-scrollbar max-h-80 overflow-y-auto">
                                <MarkdownRenderer content={aiExplanation} />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
      </div>
    </div>
  );
};

export default QuestionMode;