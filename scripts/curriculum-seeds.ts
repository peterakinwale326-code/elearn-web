export interface CourseSeedSpec {
  id: number;
  code: string;
  title: string;
  category: string;
  level: string;
  department: string;
  nerdcSubjectRef: string;
  modulesCount: number;
  lessonsCount: number;
  quizzesCount: number;
  questionsCount: number;
  answersCount: number;
  textbookOverview: string;
  coreTopicsCovered: string[];
}

export const NERDC_85_SUBJECTS_CATALOG = [
  // ... your 85 subject objects here ...
];

export const COMPLETE_CURRICULUM_SEEDS: CourseSeedSpec[] = [
  {
    id: 1,
    code: "JSS1-ENG",
    title: "English Studies (JSS1)",
    category: "Junior Secondary",
    level: "JSS1",
    department: "General",
    nerdcSubjectRef: "SUB-001: English Studies",
    modulesCount: 3,
    lessonsCount: 27,
    quizzesCount: 27,
    questionsCount: 81,
    answersCount: 324,
    textbookOverview: "Comprehensive structural foundations of English syntax...",
    coreTopicsCovered: ["Nouns and Pronouns", "Phonics and Monophthongs", "Reading Comprehension"]
  },
  // ... add all remaining course seeds here ...
];