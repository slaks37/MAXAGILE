const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  "className={`w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${active ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 hover:bg-gray-200/60 hover:text-brand-text'}`}",
  "className={`w-full flex items-center gap-3 py-3 rounded-2xl text-sm font-bold transition-all ${collapsed ? 'justify-center px-0' : 'px-4'} ${active ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 hover:bg-gray-200/60 hover:text-brand-text'}`}"
);

fs.writeFileSync('src/App.tsx', code);
