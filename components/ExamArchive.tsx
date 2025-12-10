import React, { useState } from 'react';
import { MOCK_EXAMS, SUBJECTS_LIST } from '../constants';
import { FileText, ChevronLeft, Building, Calendar, BookOpen, Search, Shield, Award, Users, Sparkles, ChevronRight, Layers } from 'lucide-react';

interface ExamArchiveProps {
    onStartExam: (subject: string, university: string) => void;
}

interface ExamCardProps {
    exam: any;
    onStart: (subject: string, university: string) => void;
}

const ExamCard: React.FC<ExamCardProps> = ({ exam, onStart }) => (
    <div className="bg-white dark:bg-slate-800 rounded-xl p-4 border border-gray-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-400 transition-all flex flex-col justify-between gap-2">
        <div>
            <div className="flex items-center justify-between mb-2">
                <h4 className="font-bold text-gray-900 dark:text-white">{exam.university}</h4>
                <span className="text-xs font-mono text-gray-400">{exam.year}</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center">
               <Calendar className="w-3 h-3 mr-1" /> {exam.period}
            </p>
        </div>
        <button 
            onClick={() => onStart(exam.subject, exam.university)}
            className="w-full py-2 mt-2 bg-gray-100 dark:bg-slate-700 hover:bg-primary-600 hover:text-white dark:hover:bg-primary-500 text-gray-700 dark:text-gray-200 font-bold rounded-lg transition-colors text-xs"
        >
            Praticar
        </button>
    </div>
);

interface CategorySectionProps {
    title: string;
    icon: any;
    colorClass: string;
    exams: any[];
    onStartExam: (subject: string, university: string) => void;
}

const CategorySection: React.FC<CategorySectionProps> = ({ title, icon: Icon, colorClass, exams, onStartExam }) => {
  if (exams.length === 0) return null;
  return (
    <div className="mb-8 animate-fade-in-up">
      <div className={`flex items-center space-x-3 mb-4 p-3 rounded-lg border ${colorClass}`}>
          <div className="p-2 bg-white/50 dark:bg-black/20 rounded-full">
              <Icon className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-lg">{title}</h3>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {exams.map((exam: any) => <ExamCard key={exam.id} exam={exam} onStart={onStartExam} />)}
      </div>
    </div>
  );
};

const ExamArchive: React.FC<ExamArchiveProps> = ({ onStartExam }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const normalizeText = (text: string) => {
      return text
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, "")
          .toLowerCase();
  };

  const availableSubjects = SUBJECTS_LIST.filter(subject => 
      normalizeText(subject).includes(normalizeText(searchTerm))
  ).sort((a, b) => a.localeCompare(b, 'pt-BR'));

  const subjectExams = selectedSubject 
    ? MOCK_EXAMS.filter(exam => exam.subject === selectedSubject)
    : [];

  const oabExams = subjectExams.filter(e => e.university === 'OAB');
  const contestExams = subjectExams.filter(e => e.university === 'Concursos');
  const publicExams = subjectExams.filter(e => ['UFF', 'UFRJ', 'USP', 'UERJ', 'UNB', 'TJ-RJ', 'MP-RJ'].includes(e.university));
  const privateExams = subjectExams.filter(e => ['PUC-Rio', 'FGV', 'Mackenzie', 'Estácio', 'Universo'].includes(e.university));

  const getSubjectStyle = (name: string) => {
        const lower = name.toLowerCase();
        if (lower.includes('constitucional') || lower.includes('estado') || lower.includes('administrativo') || lower.includes('público')) {
            return { bg: 'bg-blue-50 dark:bg-blue-900/20', text: 'text-blue-700 dark:text-blue-300', iconBg: 'bg-blue-100 dark:bg-blue-800' };
        }
        if (lower.includes('penal') || lower.includes('criminologia')) {
            return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', iconBg: 'bg-red-100 dark:bg-red-800' };
        }
        if (lower.includes('civil') || lower.includes('privado') || lower.includes('contratos')) {
            return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-400', iconBg: 'bg-green-100 dark:bg-green-800' };
        }
        return { bg: 'bg-gray-50 dark:bg-slate-700/50', text: 'text-gray-700 dark:text-gray-300', iconBg: 'bg-gray-100 dark:bg-slate-600' };
  };

  if (!selectedSubject) {
    return (
      <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto animate-fade-in">
        <div className="mb-8">
          <h1 className="text-3xl 2xl:text-4xl font-bold text-gray-900 dark:text-white">Acervo de Provas e OAB</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2 2xl:text-lg">
              Pratique com exames da OAB, concursos públicos e provas de faculdades (UFF, UFRJ, Estácio).
          </p>
          
          <div className="mt-6 relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 transition-all shadow-sm"
                placeholder="Buscar disciplina (ex: Direito Penal, OAB...)"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="flex items-center justify-between mb-4 text-sm text-gray-500 dark:text-gray-400">
            <span>Mostrando {availableSubjects.length} disciplinas</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 2xl:gap-6">
          {availableSubjects.map((subject, idx) => {
            const style = getSubjectStyle(subject);
            return (
                <div 
                    key={idx}
                    className="bg-white dark:bg-slate-800 rounded-xl p-5 2xl:p-6 border border-gray-100 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-primary-500 dark:hover:border-primary-500 transition-all duration-200 group cursor-pointer flex flex-col justify-between h-full"
                    onClick={() => setSelectedSubject(subject)}
                >
                <div>
                    <div className="flex justify-between items-start mb-3">
                        <div className={`p-2 rounded-lg ${style.iconBg}`}>
                            <FileText className={`w-5 h-5 ${style.text}`} />
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
                            onStartExam(subject, 'Simulado OAB/IA');
                        }}
                        className="w-full py-2 bg-primary-50 dark:bg-primary-900/20 hover:bg-primary-100 dark:hover:bg-primary-900/40 text-primary-700 dark:text-primary-300 rounded-lg text-sm font-bold flex items-center justify-center transition-colors mb-2"
                    >
                        <Sparkles className="w-4 h-4 mr-2" />
                        Gerar Simulado
                    </button>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center text-xs 2xl:text-sm text-gray-400">
                            <Layers className="w-3 h-3 mr-1" />
                            <span>Provas Anteriores</span>
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

        {availableSubjects.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                  Nenhuma disciplina encontrada com esse nome.
              </div>
        )}
      </div>
    );
  }

  return (
    <div className="p-8 2xl:p-12 max-w-screen-2xl 2xl:max-w-[1800px] mx-auto animate-fade-in-up">
      <button 
        onClick={() => setSelectedSubject(null)}
        className="flex items-center text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400 mb-6 font-medium transition-colors"
      >
        <ChevronLeft className="w-5 h-5 mr-1" /> Voltar para Disciplinas
      </button>

      <div className="flex items-center space-x-4 mb-8 border-b border-gray-100 dark:border-slate-700 pb-6">
        <div className="p-4 bg-primary-100 dark:bg-primary-900/30 rounded-2xl">
            <BookOpen className="w-8 h-8 text-primary-600 dark:text-primary-400" />
        </div>
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{selectedSubject}</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                {subjectExams.length} provas encontradas para simulação.
            </p>
        </div>
      </div>

      <div className="space-y-2">
          <CategorySection 
             title="Exame da Ordem (OAB)" 
             icon={Shield} 
             colorClass="bg-red-50 dark:bg-red-900/20 border-red-100 dark:border-red-900/30 text-red-800 dark:text-red-200"
             exams={oabExams}
             onStartExam={onStartExam}
          />
           <CategorySection 
             title="Concursos Públicos (Carreiras Jurídicas)" 
             icon={Award} 
             colorClass="bg-yellow-50 dark:bg-yellow-900/20 border-yellow-100 dark:border-yellow-900/30 text-yellow-800 dark:text-yellow-200"
             exams={contestExams}
             onStartExam={onStartExam}
          />
          <CategorySection 
             title="Universidades Públicas (UFF, UFRJ, USP...)" 
             icon={Building} 
             colorClass="bg-blue-50 dark:bg-blue-900/20 border-blue-100 dark:border-blue-900/30 text-blue-800 dark:text-blue-200"
             exams={publicExams}
             onStartExam={onStartExam}
          />
          <CategorySection 
             title="Instituições Privadas" 
             icon={Users} 
             colorClass="bg-green-50 dark:bg-green-900/20 border-green-100 dark:border-green-900/30 text-green-800 dark:text-green-200"
             exams={privateExams}
             onStartExam={onStartExam}
          />
      </div>

      {subjectExams.length === 0 && (
             <div className="mt-12 text-center py-12 bg-gray-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-gray-300 dark:border-slate-700">
                <p className="text-gray-500 dark:text-gray-400 mb-4">Não encontramos provas oficiais cadastradas para esta disciplina.</p>
                <button 
                    onClick={() => onStartExam(selectedSubject, 'Geral')}
                    className="px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white font-bold rounded-lg transition-colors shadow-lg"
                >
                    Gerar Simulado Genérico com IA
                </button>
            </div>
      )}
    </div>
  );
};

export default ExamArchive;