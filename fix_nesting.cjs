const fs = require('fs');
let code = fs.readFileSync('src/components/learning/LearningHub.tsx', 'utf8');

// I will just replace the whole header and tabs block to ensure perfect nesting
code = code.replace(/<div className="bg-white px-6 pt-6 pb-2 shrink-0 relative overflow-hidden">[\s\S]*?<div className="p-6">/, 
`<div className="bg-white px-6 pt-6 pb-2 shrink-0 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-brand-blue rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
        <div className="relative z-10">
          <h2 className="text-2xl font-extrabold text-brand-text mb-2 tracking-tight">MaxAgile Learning Center</h2>
          <p className="text-gray-500 mb-6 max-w-2xl">Pusat pembelajaran interaktif untuk memahami dan beralih secara mulus dari metode Tradisional ke pola pikir Agile.</p>
        </div>
      </div>
      <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-gray-200 px-6 py-4 shadow-sm flex gap-3 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as Tab)}
            className={\`flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-extrabold transition-all whitespace-nowrap \${
              activeTab === tab.id 
                ? 'bg-brand-text text-white border-2 border-brand-text border-b-4 translate-y-[-2px] shadow-sm' 
                : 'bg-white border-2 border-gray-200 border-b-4 text-gray-500 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-700 hover:text-brand-text'
            }\`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>
      <div className="p-6">`);

fs.writeFileSync('src/components/learning/LearningHub.tsx', code);
