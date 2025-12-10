import { Question, UserStats, Exam, LearningModule } from './types';

// GRADE CURRICULAR DIREITO (Abrangente)
export const SUBJECTS_LIST = [
  "Direito Constitucional", "Direito Administrativo", "Direito Civil", "Processo Civil",
  "Direito Penal", "Processo Penal", "Direito Tributário", "Direito Empresarial",
  "Direito do Trabalho", "Processo do Trabalho", "Direitos Humanos", "Ética Profissional",
  "Direito Ambiental", "Estatuto da Criança e Adolescente", "Direito do Consumidor",
  "Direito Eleitoral", "Direito Previdenciário", "Direito Internacional",
  "Filosofia do Direito", "Teoria Geral do Direito", "Legislação Específica (RJ)",
  "Regimento Interno (Casas Legislativas)", "Fazenda Pública em Juízo"
];

// Configuração das Instituições (Atualizada com os Concursos Pedidos)
const UNIVERSITIES = [
    { name: 'OAB', type: 'Ordem', fullName: 'Exame de Ordem Unificado (FGV)' },
    { name: 'TJRJ', type: 'Concurso', fullName: 'Tribunal de Justiça do Rio de Janeiro' },
    { name: 'ALERJ', type: 'Concurso', fullName: 'Assembleia Legislativa do Estado do RJ' },
    { name: 'PGE-RJ', type: 'Concurso', fullName: 'Procuradoria Geral do Estado do RJ (Residência)' },
    { name: 'UFF', type: 'Publica', fullName: 'Universidade Federal Fluminense' },
    { name: 'UFRJ', type: 'Publica', fullName: 'Universidade Federal do Rio de Janeiro' },
    { name: 'Estácio', type: 'Privada', fullName: 'Universidade Estácio de Sá' },
];

const generateExams = (): Exam[] => {
  const exams: Exam[] = [];
  
  // Matérias chave para cada concurso específico
  const pgeSubjects = ["Administrativo", "Constitucional", "Tributário", "Processo Civil", "Fazenda Pública"];
  const tjSubjects = ["Civil", "Processo Civil", "Constitucional", "Administrativo", "Penal"];
  const alerjSubjects = ["Constitucional", "Administrativo", "Processo Legislativo", "Regimento Interno"];

  SUBJECTS_LIST.forEach((subject, index) => {
     UNIVERSITIES.forEach((uni, uIndex) => {
        let shouldAdd = false;
        let periodLabel = `${(index % 2) + 1}º Semestre`;

        if (uni.name === 'PGE-RJ') {
            shouldAdd = pgeSubjects.some(s => subject.includes(s));
            periodLabel = "Residência Jurídica";
        } else if (uni.name === 'TJRJ') {
            shouldAdd = tjSubjects.some(s => subject.includes(s));
            periodLabel = "Técnico/Analista";
        } else if (uni.name === 'ALERJ') {
            shouldAdd = alerjSubjects.some(s => subject.includes(s));
            periodLabel = "Edital Anterior";
        } else if (uni.name === 'OAB') {
            shouldAdd = true; // OAB tem tudo
            periodLabel = `XXX${(index % 5) + 2} Exame`;
        } else {
            // Universidades (aleatório para preencher)
            shouldAdd = (index + uIndex) % 6 === 0;
        }

        if (shouldAdd) {
            exams.push({
                id: `${uni.name.toLowerCase()}-${index}`,
                university: uni.name as any,
                subject: subject,
                year: 2023 - (index % 4),
                period: periodLabel,
                url: '#'
            });
        }
     });
  });

  // Adicionar manualmente algumas provas discursivas específicas
  exams.push({ id: 'disc-pge-1', university: 'PGE-RJ', subject: 'Peça Prática (Discursiva)', year: 2024, period: 'Fase Final', url: '#' });
  exams.push({ id: 'disc-tj-1', university: 'TJRJ', subject: 'Sentença Cível (Discursiva)', year: 2023, period: 'Magistratura', url: '#' });

  return exams;
};

export const MOCK_EXAMS: Exam[] = generateExams();

const generateModules = (): LearningModule[] => {
    return SUBJECTS_LIST.map((subject, index) => ({
        id: `lm-${index}`,
        title: subject,
        description: `Curso completo de ${subject} com base na doutrina e jurisprudência dominante nos tribunais superiores.`,
        progress: 0,
        totalLessons: 10,
        completedLessons: 0
    }));
}

export const MOCK_LEARNING_MODULES: LearningModule[] = generateModules();

export const INITIAL_STATS: UserStats = {
  questionsSolved: 0,
  accuracy: 0,
  streakDays: 0,
  topicPerformance: []
};

export const QUESTION_BANK_DATA: Question[] = [];