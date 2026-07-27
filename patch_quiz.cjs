const fs = require('fs');
let code = fs.readFileSync('src/components/learning/LearningHub.tsx', 'utf8');

// Add import
code = code.replace(
  "import { Checklist } from './Checklist';",
  "import { Checklist } from './Checklist';\nimport { UsecaseQuiz } from './UsecaseQuiz';"
);

// Add BrainCircuit icon
code = code.replace(
  "import { BookOpen, ClipboardCheck, Compass, GitMerge, LayoutList, ListTodo } from 'lucide-react';",
  "import { BookOpen, ClipboardCheck, Compass, GitMerge, LayoutList, ListTodo, BrainCircuit } from 'lucide-react';"
);

// Add to Tab type
code = code.replace(
  "type Tab = 'materi' | 'assessment' | 'wizard' | 'guide' | 'mapping' | 'checklist';",
  "type Tab = 'materi' | 'assessment' | 'wizard' | 'guide' | 'mapping' | 'checklist' | 'quiz';"
);

// Add to tabs array
code = code.replace(
  "{ id: 'checklist', label: 'Daftar Periksa', icon: <ListTodo size={16} /> }",
  "{ id: 'checklist', label: 'Daftar Periksa', icon: <ListTodo size={16} /> },\n    { id: 'quiz', label: 'Kuis Usecase', icon: <BrainCircuit size={16} /> }"
);

// Add to content render
code = code.replace(
  "{activeTab === 'checklist' && <Checklist />}",
  "{activeTab === 'checklist' && <Checklist />}\n        {activeTab === 'quiz' && <UsecaseQuiz />}"
);

fs.writeFileSync('src/components/learning/LearningHub.tsx', code);
