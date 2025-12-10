import React, { useState } from 'react';
import { SUBJECTS_LIST } from '../constants';
import { BookOpen, Search, ChevronRight, Layers, Hash, Sparkles, Scale } from 'lucide-react';

interface QuestionBankProps {
    onStartQuiz: (topic: string) => void;
}

const QuestionBank: React.FC<QuestionBankProps> = ({ onStartQuiz }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const normalizeText = (text: string) => {
        return text
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, "")
            .toLowerCase();
    };

    const filteredSubjects = SUBJECTS_LIST.filter(subject => 
        normalizeText(subject).includes(normalizeText(searchTerm))
    ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

    // Categorização Visual para Direito
    const getSubjectStyle = (name: string) => {
        const lower = name.toLowerCase();
        // Direito Público / Constitucional -> Azul
        if (lower.includes('constitucional') || lower.includes('estado') || lower.includes('administrativo') || lower.includes('público') || lower.includes('humanos')) {
            return { 
                bg: 'bg-blue-50 dark:bg-blue-900/20', 
                text: 'text-blue-700 dark:text-blue-300', 
                iconBg: 'bg-blue-100 dark:bg-blue-800' 
            };
        }
        // Direito Penal / Criminologia -> Vermelho
        if (lower.includes('penal') || lower.includes('criminologia') || lower.includes('crimes')) {
            return { 
                bg: 'bg-red-50 dark:bg-red-900/20', 
                text: 'text-red-700 dark:text-red-300', 
                iconBg: 'bg-red-100 dark:bg-red-800' 
            };
        }
        // Direito Civil / Privado -> Verde
        if (lower.includes('civil') || lower.includes('privado') || lower.includes('família') || lower.includes('sucessões') || lower.includes('reais') || lower.includes('consumidor') || lower.includes('contratos') || lower.includes('obrigações')) {
            return { 
                bg: 'bg-green-50 dark:bg-green-900/20', 
                text: 'text-green-700 dark:text-green-400', 
                iconBg: 'bg-green-100 dark:bg-green-800' 
            };
        }
        // Direito Empresarial / Tributário / Financeiro -> Roxo
        if (lower.includes('empresarial') || lower.includes('tributário') || lower.includes('financeiro') || lower.includes('economia') || lower.includes('falimentar')) {
            return { 
                bg: 'bg-purple-50 dark:bg-purple-900/20', 
                text: 'text-purple-700 dark:text-purple-300', 
                iconBg: 'bg-purple-100 dark:bg-purple-800' 
            };
        }
        // Trabalho / Processo -> Laranja
        if (lower.includes('trabalho') || lower.includes('processo') || lower.includes('procedimento') || lower.includes('recursos')) {
            return { 
                bg: 'bg-orange-50 dark:bg-orange-900/20', 
                text: 'text-orange-700 dark:text-orange-300', 
                iconBg: 'bg-orange-100 dark:bg-orange-800' 
            };
        }
        // Teoria / Filosofia / Sociologia -> Cinza/Neutro
        return { 
            bg: 'bg-gray-50 dark:bg-slate-700/50', 
            text: 'text-gray-700 dark:text-gray-300', 
            iconBg: 'bg-gray-100 dark:bg-slate-600' 
        };
    };

    return (
        <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">Banco de Questões Jurídicas</h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2 2xl:text-lg">Pratique questões de todas as áreas do Direito (Baseadas na grade da UFF).</p>
                
                {/* Search Bar */}
                <div className="mt-6 relative max-w-xl">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl leading-5 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all shadow-sm"
                        placeholder="Buscar disciplina (ex: Penal, Constitucional, Trabalho...)"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
                <span>Mostrando {filteredSubjects.length} disciplinas</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 2xl:gap-6">
                {filteredSubjects.map((subject, idx) => {
                    const style = getSubjectStyle(subject);
                    return (
                        <div 
                            key={idx} 
                            className="bg-white dark:bg-slate-800 rounded-xl p-5 2xl:p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-500 transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full" 
                            onClick={() => onStartQuiz(subject)}
                        >
                            <div>
                                <div className="flex justify-between items-start mb-3">
                                    <div className={`p-2 rounded-lg ${style.iconBg}`}>
                                        <Scale className={`w-5 h-5 ${style.text}`} />
                                    </div>
                                </div>
                                
                                <h3 className="text-base 2xl:text-lg font-bold text-gray-900 dark:text-white leading-tight mb-2 line-clamp-2" title={subject}>
                                    {subject}
                                </h3>
                            </div>

                            <div className="mt-4 pt-4 border-t border-gray-50 dark:border-slate-700">
                                <button 
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onStartQuiz(subject);
                                    }}
                                    className="w-full py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-bold flex items-center justify-center transition-colors mb-2"
                                >
                                    <Sparkles className="w-4 h-4 mr-2" />
                                    Gerar Questões
                                </button>
                                
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center text-xs 2xl:text-sm text-gray-400">
                                        <Layers className="w-3 h-3 mr-1" />
                                        <span>Módulos Doutrina</span>
                                    </div>
                                    <span className="text-xs 2xl:text-sm font-medium text-gray-400 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors flex items-center">
                                        Abrir <ChevronRight className="w-3 h-3 ml-0.5" />
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {filteredSubjects.length === 0 && (
                <div className="text-center py-20">
                    <div className="inline-flex items-center justify-center p-4 bg-gray-100 dark:bg-slate-800 rounded-full mb-4">
                        <Hash className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Nenhuma disciplina encontrada</h3>
                    <p className="text-gray-500 dark:text-gray-400">Tente buscar por sinônimos ou partes do nome (ex: "Processo").</p>
                </div>
            )}
        </div>
    );
};

export default QuestionBank;