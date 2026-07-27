const fs = require('fs');
let code = fs.readFileSync('src/components/learning/LearningHub.tsx', 'utf8');

code = code.replace(
  '<div className="flex-1 flex flex-col h-full overflow-hidden bg-brand-bg">',
  '<div className="flex-1 h-full overflow-auto bg-brand-bg custom-scrollbar">'
);

code = code.replace(
  '<div className="bg-white border-b border-gray-200 px-6 py-6 shrink-0 shadow-sm relative overflow-hidden">',
  '<div className="bg-white px-6 pt-6 pb-2 shrink-0 relative overflow-hidden">'
);

code = code.replace(
  '<div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">',
  '</div>\n      <div className="sticky top-0 z-20 bg-white border-b border-gray-200 px-6 py-4 shadow-sm flex gap-3 overflow-x-auto scrollbar-hide">'
);

code = code.replace(
  '<div className="flex-1 overflow-auto p-6">',
  '<div className="p-6">'
);

fs.writeFileSync('src/components/learning/LearningHub.tsx', code);
