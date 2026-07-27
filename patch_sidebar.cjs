const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// Add sidebarCollapsed state
code = code.replace(
  'const [mobileMenuOpen, setMobileMenuOpen] = useState(false);',
  'const [mobileMenuOpen, setMobileMenuOpen] = useState(false);\n  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);'
);

// Update aside classes
code = code.replace(
  'w-64 bg-white flex flex-col border-r-2 border-gray-100',
  '${sidebarCollapsed ? "w-20" : "w-64"} bg-white flex flex-col border-r-2 border-gray-100 transition-all duration-300'
);

// Update sidebar header to have toggle button
code = code.replace(
  '<div className="p-5 flex items-center justify-between">',
  `<div className={\`p-5 flex items-center \${sidebarCollapsed ? 'justify-center' : 'justify-between'}\`}>`
);
code = code.replace(
  '<h1 className="text-xl font-bold flex items-center gap-2 text-brand-text">',
  '{!sidebarCollapsed && <h1 className="text-xl font-bold flex items-center gap-2 text-brand-text">'
);
code = code.replace(
  'MaxAgile\n          </h1>',
  'MaxAgile\n          </h1>}'
);

// Add toggle button for desktop
code = code.replace(
  '<button className="md:hidden text-gray-500 hover:bg-gray-200 p-1 rounded-md" onClick={() => setMobileMenuOpen(false)}>\n            <X size={20} />\n          </button>',
  `<button className="md:hidden text-gray-500 hover:bg-gray-200 p-1 rounded-md" onClick={() => setMobileMenuOpen(false)}>
            <X size={20} />
          </button>
          <button className="hidden md:flex text-gray-400 hover:bg-gray-100 p-1.5 rounded-lg transition-colors" onClick={() => setSidebarCollapsed(!sidebarCollapsed)}>
            {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>`
);

// Update NavItem props
code = code.replace(
  'function NavItem({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick?: () => void }) {',
  'function NavItem({ icon, label, active = false, collapsed = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, collapsed?: boolean, onClick?: () => void }) {'
);
code = code.replace(
  '<span className="truncate">{label}</span>',
  '{!collapsed && <span className="truncate">{label}</span>}'
);
code = code.replace(
  "className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${active ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 hover:bg-gray-200/60 hover:text-brand-text'}`}",
  "className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${collapsed ? 'justify-center px-0' : ''} ${active ? 'bg-brand-orange/10 text-brand-orange' : 'text-gray-600 hover:bg-gray-200/60 hover:text-brand-text'}`}"
);

// We need to pass collapsed to all NavItem components
// Use regex to find <NavItem and add collapsed={sidebarCollapsed}
code = code.replace(/<NavItem/g, '<NavItem collapsed={sidebarCollapsed}');

// Also handle the Menu text and Workspace text
code = code.replace(
  '<div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-3">Menu</div>',
  '{!sidebarCollapsed ? <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-4 px-3">Menu</div> : <div className="h-4 mt-4 mb-2"></div>}'
);

code = code.replace(
  '<div className="flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 px-3 group">',
  '<div className={`flex items-center ${sidebarCollapsed ? "justify-center" : "justify-between"} text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2 mt-8 px-3 group`}>'
);
code = code.replace(
  '<span>Ruang Kerja</span>',
  '{!sidebarCollapsed && <span>Ruang Kerja</span>}'
);

// Make the icon only appear on hover if collapsed? Let"s just show it if collapsed.
code = code.replace(
  '<button onClick={() => setShowNewWorkspaceModal(true)} className="text-gray-400 hover:text-brand-orange opacity-0 group-hover:opacity-100 transition-opacity"><Plus size={16} /></button>',
  '<button onClick={() => setShowNewWorkspaceModal(true)} className={`text-gray-400 hover:text-brand-orange transition-opacity ${sidebarCollapsed ? "opacity-100 p-1 bg-gray-100 rounded-md" : "opacity-0 group-hover:opacity-100"}`}><Plus size={16} /></button>'
);

// "Memuat..." and "Belum ada ruang kerja." texts
code = code.replace(
  '<div className="text-sm text-gray-500 py-2 px-3">Memuat...</div>',
  '{!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Memuat...</div> : null}'
);
code = code.replace(
  '<div className="text-sm text-gray-500 py-2 px-3">Belum ada ruang kerja.</div>',
  '{!sidebarCollapsed ? <div className="text-sm text-gray-500 py-2 px-3">Belum ada ruang kerja.</div> : null}'
);

fs.writeFileSync('src/App.tsx', code);
