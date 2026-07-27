const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(
  '{!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Memuat...</div> : null}',
  '(!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Memuat...</div> : null)'
);

code = code.replace(
  '{!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Belum ada ruang kerja.</div> : null}',
  '(!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Belum ada ruang kerja.</div> : null)'
);

fs.writeFileSync('src/App.tsx', code);
