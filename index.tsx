import React, { useState, useCallback, FC, ReactNode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
// @ts-ignore
import JSZip from 'jszip';
import { GoogleGenAI } from '@google/genai';

// --- i18n Translations ---
const translations = {
  en: {
    title: "SmartDev Workspace",
    description: "Manage multiple projects, generate code with AI, and track history.",
    projectName: "Project Name",
    projectNamePlaceholder: "e.g., my-awesome-app",
    prompt: "Project Prompt",
    promptPlaceholder: "Describe your project...",
    generate: "Generate Project",
    generating: "Generating Structure...",
    projectTree: "Workspace Explorer",
    noFileSelected: "Select a file to view its content.",
    aiLog: "AI Log",
    debug: "Debug",
    install: "Install Guide",
    debugCTA: "Debug with AI",
    noBugs: "No active issues found. Code looks clean!",
    bugsFound: "Found issues:",
    autoFix: "Attempt Auto-Fix",
    downloadZip: "Download .ZIP",
    techStack: "Technologies & Frameworks",
    newFile: "New File",
    newFolder: "New Folder",
    rename: "Rename",
    delete: "Delete",
    confirmDelete: "Are you sure you want to delete",
    importProject: "Import Project",
    importZip: "Import .ZIP",
    importFolder: "Import Folder",
    importFromGithub: "Import",
    githubRepoUrl: "GitHub Repo URL (e.g., user/repo)",
    importing: "Importing...",
    aiAnalyzing: "AI is analyzing your code...",
    aiFixing: "AI is applying the fix...",
    aiError: "An error occurred with the AI. Please try again.",
    aiInvalidResponse: "AI returned an invalid response format.",
    editor: "Code Editor",
    preview: "Live Preview",
    runPreview: "Run & Preview",
    simulating: "AI Simulating User Interaction...",
    optimizing: "Optimizing & Fixing Bugs...",
    reportError: "Report Runtime Error",
    reportErrorPlaceholder: "Paste error from console here...",
    submitError: "Fix Reported Error",
    refreshPreview: "Refresh Preview",
    toggleLeft: "Toggle Project Tree",
    toggleRight: "Toggle Config",
    inspectorMode: "Visual Inspector",
    inspectorActive: "Inspector Active",
    inspectElement: "Inspect Element",
    visualEditor: "Visual Editor",
    selectedElement: "Selected Element",
    aiCommand: "AI Command for this Element",
    aiCommandPlaceholder: "e.g., Change background to blue, make text bigger...",
    applyChanges: "Apply Changes",
    quickStyles: "Quick Styles",
    color: "Color",
    bg: "Background",
    margin: "Margin",
    padding: "Padding",
    border: "Border",
    fontSize: "Font Size",
    history: "Project History",
    openProject: "Open Project",
    created: "Created",
    lastModified: "Last Modified",
    projectIndex: "Project Index",
    workspaceRoot: "Workspace Root",
    noProjects: "No projects found in workspace.",
  },
  fa: {
    title: "فضای کار هوشمند",
    description: "مدیریت چندین پروژه، تولید کد با هوش مصنوعی و پیگیری تاریخچه.",
    projectName: "نام پروژه",
    projectNamePlaceholder: "مثال: my-awesome-app",
    prompt: "توضیحات پروژه",
    promptPlaceholder: "پروژه خود را توصیف کنید...",
    generate: "تولید پروژه",
    generating: "در حال تولید ساختار...",
    projectTree: "کاوشگر فضای کار",
    noFileSelected: "برای مشاهده محتوا، یک فایل را انتخاب کنید.",
    aiLog: "لاگ هوش مصنوعی",
    debug: "اشکال‌زدایی",
    install: "راهنمای نصب",
    debugCTA: "اشکال‌زدایی با AI",
    noBugs: "هیچ مشکل فعالی یافت نشد. کد سالم به نظر می‌رسد!",
    bugsFound: "مشکلات یافت‌شده:",
    autoFix: "تلاش برای رفع خودکار",
    downloadZip: "دانلود فایل ZIP.",
    techStack: "تکنولوژی‌ها و فریم‌ورک‌ها",
    newFile: "فایل جدید",
    newFolder: "پوشه جدید",
    rename: "تغییر نام",
    delete: "حذف",
    confirmDelete: "آیا از حذف مطمئن هستید",
    importProject: "وارد کردن پروژه",
    importZip: "وارد کردن ZIP.",
    importFolder: "وارد کردن پوشه",
    importFromGithub: "وارد کردن",
    githubRepoUrl: "آدرس ریپازیتوری گیت‌هاب (مثال: user/repo)",
    importing: "در حال وارد کردن...",
    aiAnalyzing: "هوش مصنوعی در حال تحلیل کد شماست...",
    aiFixing: "هوش مصنوعی در حال اعمال اصلاحات است...",
    aiError: "خطایی در ارتباط با هوش مصنوعی رخ داد. لطفاً دوباره تلاش کنید.",
    aiInvalidResponse: "پاسخ دریافت شده از هوش مصنوعی معتبر نبود.",
    editor: "ویرایشگر کد",
    preview: "پیش‌نمایش زنده",
    runPreview: "اجرا و پیش‌نمایش",
    simulating: "شبیه‌سازی رفتار کاربر...",
    optimizing: "بهینه‌سازی و رفع باگ...",
    reportError: "گزارش خطای اجرا",
    reportErrorPlaceholder: "خطای کنسول را اینجا جای‌گذاری کنید...",
    submitError: "رفع خطای گزارش شده",
    refreshPreview: "بازخوانی پیش‌نمایش",
    toggleLeft: "تغییر وضعیت پنل چپ",
    toggleRight: "تغییر وضعیت پنل راست",
    inspectorMode: "بازرس بصری",
    inspectorActive: "بازرس فعال است",
    inspectElement: "بررسی عنصر",
    visualEditor: "ویرایشگر بصری",
    selectedElement: "عنصر انتخاب شده",
    aiCommand: "دستور هوش مصنوعی برای این عنصر",
    aiCommandPlaceholder: "مثال: رنگ پس‌زمینه را آبی کن، متن را بزرگتر کن...",
    applyChanges: "اعمال تغییرات",
    quickStyles: "استایل‌های سریع",
    color: "رنگ",
    bg: "پس‌زمینه",
    margin: "حاشیه خارجی",
    padding: "فاصله داخلی",
    border: "کادر",
    fontSize: "اندازه قلم",
    history: "تاریخچه پروژه‌ها",
    openProject: "باز کردن پروژه",
    created: "تاریخ ایجاد",
    lastModified: "آخرین تغییر",
    projectIndex: "نمایه پروژه",
    workspaceRoot: "ریشه فضای کار",
    noProjects: "هیچ پروژه‌ای در فضای کار یافت نشد.",
  },
};

// --- Icons (minified for brevity) ---
const FolderIcon = ({isOpen}: {isOpen?: boolean}) => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-cyan-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isOpen ? "M5 19a2 2 0 01-2-2V7a2 2 0 012-2h4l2 2h4a2 2 0 012 2v1M5 19h14a2 2 0 002-2v-5a2 2 0 00-2-2H9a2 2 0 00-2 2v5a2 2 0 01-2 2z" : "M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"} /></svg>;
const FileIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>;
const DebugIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const ZipIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M4 2a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V4a2 2 0 00-2-2H4zm2 2v3h2V4H6zm0 4v3h2V8H6zm0 4v3h2v-3H6zm4-8v3h2V4h-2zm0 4v3h2V8h-2zm0 4v3h2v-3h-2z" clipRule="evenodd" /></svg>;
const FolderOpenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor"><path d="M2 6a2 2 0 012-2h5l2 2h5a2 2 0 012 2v6a2 2 0 01-2 2H4a2 2 0 01-2-2V6z" /></svg>;
const GithubIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 0C4.477 0 0 4.477 0 10c0 4.418 2.865 8.166 6.839 9.49.5.092.682-.217.682-.482 0-.237-.009-.868-.014-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.031-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.03 1.595 1.03 2.688 0 3.848-2.338 4.695-4.566 4.942.359.308.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.003 10.003 0 0020 10c0-5.523-4.477-10-10-10z" clipRule="evenodd" /></svg>;
const PlayIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const RefreshIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 inline-block" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>;
const EyeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 inline-block" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>;
const LayoutLeftIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>;
const LayoutRightIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" /></svg>;
const HistoryIcon = () => <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;


// --- Theming & Types ---
const themes = {
  'neon-gloss': { bg: 'bg-gray-900', text: 'text-gray-200', primary: 'text-cyan-300', secondary: 'text-pink-500', accent: 'text-purple-400', border: 'border-gray-700', inputBg: 'bg-gray-800', button: 'bg-purple-600 hover:bg-purple-500 text-white font-bold py-2 px-4 rounded-lg shadow-lg shadow-purple-600/50 transition-all duration-300 transform hover:scale-105', tabActive: 'bg-gray-800 border-b-2 border-cyan-400 text-cyan-300', tabInactive: 'text-gray-400 hover:text-cyan-300', panelBg: 'bg-black/30 backdrop-blur-sm' },
  'neon-matte': { bg: 'bg-black', text: 'text-gray-300', primary: 'text-emerald-400', secondary: 'text-amber-500', accent: 'text-indigo-400', border: 'border-gray-800', inputBg: 'bg-gray-900', button: 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-2 px-4 rounded-lg transition-all duration-300', tabActive: 'bg-gray-900 border-b-2 border-emerald-500 text-emerald-400', tabInactive: 'text-gray-500 hover:text-emerald-400', panelBg: 'bg-black/50' },
};
type FileSystemEntry = { type: 'file'; content: string } | { type: 'folder'; children: { [key: string]: FileSystemEntry } };
type ProjectStructure = { [key: string]: FileSystemEntry };
type ContextMenu = { x: number; y: number; path: string; type: 'file' | 'folder' } | null;
type SelectedElement = {
    tagName: string;
    id: string;
    className: string;
    innerText: string;
    outerHTML: string;
    rect: { top: number; left: number; width: number; height: number };
} | null;

interface ProjectMetadata {
    id: string;
    name: string;
    description: string;
    createdAt: string;
    lastModified: string;
    techStack: string[];
    log: string[];
}

// --- Helper Functions ---
const addPathToStructure = (structure: ProjectStructure, path: string, content: string | null) => {
    const parts = path.split('/').filter(p => p);
    let currentLevel: any = structure;
    for (let i = 0; i < parts.length; i++) {
        const part = parts[i];
        if (i === parts.length - 1 && content !== null) {
            currentLevel[part] = { type: 'file', content };
        } else {
            if (!currentLevel[part] || currentLevel[part].type !== 'folder') {
                currentLevel[part] = { type: 'folder', children: {} };
            }
            currentLevel = currentLevel[part].children;
        }
    }
};

// Flatten structure for context
const flattenProject = (structure: ProjectStructure, path = ''): string => {
    let result = '';
    for (const key in structure) {
        const entry = structure[key];
        const fullPath = path ? `${path}/${key}` : key;
        if (entry.type === 'file') {
            result += `File: ${fullPath}\n\`\`\`\n${entry.content}\n\`\`\`\n\n`;
        } else {
            result += flattenProject(entry.children, fullPath);
        }
    }
    return result;
};


const buildPreviewBlob = (project: ProjectStructure, enableInspector: boolean, activeProjectName?: string): string | null => {
    // Find the root of the active project if we are in workspace view
    let searchRoot = project;
    if (activeProjectName && project['projects']?.type === 'folder') {
        const projectsFolder = project['projects'].children;
        // Fix: Assign to variable to narrow type correctly before accessing .children
        const activeProjectEntry = projectsFolder[activeProjectName];
        if (activeProjectEntry?.type === 'folder') {
             searchRoot = activeProjectEntry.children;
        }
    }
    
    // Fallback: Try to find any index.html
    const findIndex = (dir: any): any => {
        if(dir['index.html']) return dir;
        for(const key in dir) {
            if(dir[key].type === 'folder') {
                const res = findIndex(dir[key].children);
                if(res) return res;
            }
        }
        return null;
    };

    const activeDir = findIndex(searchRoot);
    if (!activeDir) return null;

    const indexHtmlEntry = activeDir['index.html'];
    if (!indexHtmlEntry || indexHtmlEntry.type !== 'file') return null;

    let htmlContent = indexHtmlEntry.content;

    htmlContent = htmlContent.replace(/<link\s+rel=["']stylesheet["']\s+href=["'](.+?)["']\s*\/?>/g, (match: string, href: string) => {
        const cssContent = activeDir[href]?.content;
        return cssContent ? `<style>\n${cssContent}\n</style>` : match;
    });

    htmlContent = htmlContent.replace(/<script\s+src=["'](.+?)["']><\/script>/g, (match: string, src: string) => {
         const jsContent = activeDir[src]?.content;
         return jsContent ? `<script>\n${jsContent}\n</script>` : match;
    });
    
    // Add error catching script & Inspector Script
    const errorScript = `
    <script>
      window.onerror = function(message, source, lineno, colno, error) {
        console.error("Preview Error:", message);
      };
    </script>
    `;

    const inspectorScript = enableInspector ? `
    <script>
    (function() {
        let highlighted = null;
        const originalOutlines = new WeakMap();

        function getSelector(el) {
             let sel = el.tagName.toLowerCase();
             if (el.id) sel += '#' + el.id;
             if (el.className && typeof el.className === 'string') sel += '.' + el.className.split(' ').join('.');
             return sel;
        }

        window.addEventListener('mouseover', function(e) {
            if (e.target === document.body || e.target === document.documentElement) return;
            e.stopPropagation();
            
            if (highlighted && highlighted !== e.target) {
                 highlighted.style.outline = originalOutlines.get(highlighted) || '';
            }
            
            highlighted = e.target;
            if (!originalOutlines.has(e.target)) {
                originalOutlines.set(e.target, e.target.style.outline);
            }
            e.target.style.outline = '2px dashed #00ffff';
            e.target.style.cursor = 'pointer';
        });

        window.addEventListener('mouseout', function(e) {
             if(highlighted) {
                 highlighted.style.outline = originalOutlines.get(highlighted) || '';
                 highlighted = null;
             }
        });
        
        window.addEventListener('click', function(e) {
            if (e.target === document.body || e.target === document.documentElement) return;
            e.preventDefault();
            e.stopPropagation();
            
            const rect = e.target.getBoundingClientRect();
            // We need absolute position relative to the document to handle scrolling
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;

            window.parent.postMessage({
                type: 'ELEMENT_CLICK',
                tagName: e.target.tagName.toLowerCase(),
                id: e.target.id,
                className: e.target.className,
                innerText: e.target.innerText ? e.target.innerText.substring(0, 50) : '',
                outerHTML: e.target.outerHTML,
                rect: { 
                    top: rect.top + scrollTop, 
                    left: rect.left + scrollLeft, 
                    width: rect.width, 
                    height: rect.height 
                }
            }, '*');
        });
    })();
    </script>
    ` : '';

    htmlContent = errorScript + inspectorScript + htmlContent;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    return URL.createObjectURL(blob);
};


// --- Helper Components ---
const Panel: FC<{ children: ReactNode; className?: string; theme: keyof typeof themes; style?: React.CSSProperties }> = ({ children, className = '', theme, style }) => (
  <div className={`border ${themes[theme].border} ${themes[theme].panelBg} rounded-xl shadow-2xl ${className}`} style={style}>{children}</div>
);
const Input: FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string; theme: keyof typeof themes; }> = ({ label, theme, ...props }) => (
    <div><label className={`block mb-2 text-sm font-bold ${themes[theme].primary}`}>{label}</label><input className={`w-full p-3 ${themes[theme].inputBg} ${themes[theme].text} border ${themes[theme].border} rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition`} {...props}/></div>
);
const useContextMenu = () => {
    const [contextMenu, setContextMenu] = useState<ContextMenu>(null);
    const handleContextMenu = useCallback((event: React.MouseEvent, path: string, type: 'file' | 'folder') => { event.preventDefault(); event.stopPropagation(); setContextMenu({ x: event.clientX, y: event.clientY, path, type }); }, []);
    const closeContextMenu = useCallback(() => setContextMenu(null), []);
    useEffect(() => { window.addEventListener('click', closeContextMenu); return () => window.removeEventListener('click', closeContextMenu); }, [closeContextMenu]);
    return { contextMenu, handleContextMenu, closeContextMenu };
};

const README_CONTENT = `# SmartDev Assistant Builder / دستیار هوشمند برنامه‌نویسی

![SmartDev Banner](images/banner.png)

## 🇬🇧 English Documentation

**SmartDev Assistant Builder** is a powerful, AI-driven development environment that allows you to generate, edit, preview, and debug web applications entirely in your browser. Powered by Google Gemini AI.

### 🚀 Capabilities: What can you build?
- **Single Page Applications (SPAs):** React, Vue, or Vanilla JS apps.
- **Landing Pages:** Marketing sites with Tailwind CSS or Bootstrap.
- **Tools & Utilities:** Calculators, To-Do lists, Converters.
- **Prototypes:** Rapidly visualize ideas before full-scale development.
- **Learning Projects:** Experiment with HTML/CSS/JS with instant AI feedback.

---

### 🔑 API Key Setup
To use the AI features (Code Generation, Debugging, Auto-Fix), you need a **Google Gemini API Key**.

1.  **Get Key:** Visit [Google AI Studio](https://aistudio.google.com/app/apikey).
2.  **Create Key:** Click "Create API Key" (it's free for most use cases).
3.  **Use in App:** The app automatically uses the environment variable provided by the platform. If running locally, create a \`.env\` file with \`API_KEY=your_key_here\`.

---

### 🛠 Tools Required (For Local Development)
If you want to run this *Builder* itself on your machine:

*   [**Node.js**](https://nodejs.org/): Runtime environment (LTS version recommended).
*   [**VS Code**](https://code.visualstudio.com/): Recommended code editor.
*   [**Git**](https://git-scm.com/): Version control.

---

### 📦 Installation & Deployment Guide

#### 1. Local Installation
To run a generated project on your computer:
1.  Click **"Download .ZIP"** in the app.
2.  Extract the zip file.
3.  Open the folder in VS Code.
4.  If it's a static site (HTML/CSS/JS), just open \`index.html\`.
5.  If it uses Node.js/React:
    \`\`\`bash
    npm install
    npm run dev
    \`\`\`

#### 2. Deploy to GitHub Pages (Free)
1.  Create a repository on [GitHub](https://github.com/new).
2.  Push your generated code to the repo.
3.  Go to **Settings > Pages**.
4.  Select the \`main\` branch and \`root\` folder.
5.  Save. Your site will be live in minutes.

#### 3. Deploy to Cloudflare Pages (Free & Fast)
1.  Sign up for [Cloudflare Pages](https://pages.cloudflare.com/).
2.  Connect your GitHub account.
3.  Select your repository.
4.  **Build Settings:**
    *   For static HTML: Leave blank.
    *   For React/Vite: Command: \`npm run build\`, Output: \`dist\`.
5.  Click **Deploy**.

#### 4. Shared Hosting (cPanel/DirectAdmin)
1.  Download the project ZIP.
2.  Log in to your hosting File Manager.
3.  Upload the ZIP to \`public_html\`.
4.  Extract it.
5.  Ensure \`index.html\` is in the root of \`public_html\`.

---

## 🇮🇷 راهنمای فارسی

**SmartDev Assistant Builder** یک محیط توسعه قدرتمند مبتنی بر هوش مصنوعی است که به شما امکان می‌دهد برنامه‌های تحت وب را مستقیماً در مرورگر خود تولید، ویرایش، پیش‌نمایش و دیباگ کنید.

### 🚀 چه چیزی می‌توان ساخت؟
*   **اپلیکیشن‌های تک‌صفحه‌ای (SPA):** با React، Vue یا جاوا اسکریپت خالص.
*   **صفحات فرود (Landing Pages):** سایت‌های تبلیغاتی با Tailwind CSS یا Bootstrap.
*   **ابزارها:** ماشین حساب، لیست وظایف، مبدل‌ها.
*   **پروتوتایپ‌ها:** ایده‌های خود را قبل از توسعه نهایی به سرعت مشاهده کنید.

---

### 🔑 راهنمای دریافت کلید API
برای استفاده از قابلیت‌های هوش مصنوعی، به یک **کلید API گوگل جمینای** نیاز دارید.

1.  **دریافت کلید:** به سایت [Google AI Studio](https://aistudio.google.com/app/apikey) بروید (ممکن است نیاز به تغییر IP داشته باشید).
2.  **ساخت کلید:** روی دکمه "Create API Key" کلیک کنید.
3.  **استفاده:** این برنامه به صورت خودکار از کلید محیطی استفاده می‌کند.

---

### 📦 راهنمای نصب و راه‌اندازی

#### ۱. نصب لوکال (روی کامپیوتر خودتان)
1.  دکمه **"Download .ZIP"** را بزنید و فایل را دانلود کنید.
2.  فایل را اکسترکت کنید.
3.  اگر سایت ساده HTML است، فایل \`index.html\` را باز کنید.
4.  اگر پروژه Node.js/React است:
    *   [Node.js](https://nodejs.org/) را نصب کنید.
    *   در ترمینال پوشه دستور \`npm install\` و سپس \`npm run dev\` را بزنید.

#### ۲. آپلود روی هاست اشتراکی (cPanel)
1.  فایل‌های پروژه را دانلود کنید.
2.  وارد File Manager هاست شوید.
3.  فایل‌ها را در پوشه \`public_html\` آپلود کنید.
4.  مطمئن شوید فایل \`index.html\` در صفحه اصلی باشد.

#### ۳. دیپلوی روی گیت‌هاب (GitHub Pages)
1.  در [GitHub](https://github.com/) یک ریپازیتوری جدید بسازید.
2.  کدهای خود را آپلود کنید.
3.  به بخش **Settings > Pages** بروید.
4.  شاخه \`main\` را انتخاب کرده و ذخیره کنید.

#### ۴. استفاده از Cloudflare Pages (پیشنهادی)
1.  در [Cloudflare](https://pages.cloudflare.com/) ثبت نام کنید.
2.  حساب گیت‌هاب خود را متصل کنید.
3.  پروژه را انتخاب کرده و دکمه Deploy را بزنید.

---

*(Screenshots placeholder folder created at /images)*
`;

// --- App ---
const App = () => {
    const [language, setLanguage] = useState<'en' | 'fa'>('en');
    const [theme, setTheme] = useState<keyof typeof themes>('neon-gloss');
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    // Project state now represents the entire workspace including /projects/ folder
    const [workspace, setWorkspace] = useState<ProjectStructure>({
        'projects': { type: 'folder', children: { 
            'index.json': { type: 'file', content: '[]' } 
        }},
        'README.md': { type: 'file', content: README_CONTENT },
        'images': { type: 'folder', children: {
            'banner.png': { type: 'file', content: '(Placeholder for banner image)' },
            'screenshot1.png': { type: 'file', content: '(Placeholder for screenshot)' }
        }}
    });
    // activeProjectName is the folder name inside /projects/
    const [activeProjectName, setActiveProjectName] = useState<string | null>(null);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);
    const [activeBottomTab, setActiveBottomTab] = useState('aiLog');
    const [activeMainTab, setActiveMainTab] = useState<'editor' | 'preview' | 'history'>('editor');
    const [aiLog, setAiLog] = useState<string[]>([]);
    const [debugLog, setDebugLog] = useState<any[]>([]);
    const [projectName, setProjectName] = useState('');
    const [prompt, setPrompt] = useState('');
    const [techStack, setTechStack] = useState<string[]>(['HTML', 'CSS', 'JavaScript']);
    const [githubUrl, setGithubUrl] = useState('');
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [manualError, setManualError] = useState('');
    
    // New UI States
    const [showLeftPanel, setShowLeftPanel] = useState(true);
    const [showRightPanel, setShowRightPanel] = useState(true);
    const [inspectMode, setInspectMode] = useState(false);
    const [selectedElement, setSelectedElement] = useState<SelectedElement>(null);
    const [elementCommand, setElementCommand] = useState('');
    const iframeRef = useRef<HTMLIFrameElement>(null);

    const { contextMenu, handleContextMenu, closeContextMenu } = useContextMenu();
    const zipInputRef = useRef<HTMLInputElement>(null);
    const folderInputRef = useRef<HTMLInputElement>(null);

    const t = translations[language];
    const currentTheme = themes[theme];
    const availableTech = [
        'HTML', 'CSS', 'JavaScript', 'React', 'Vue', 'Tailwind', 
        'Bootstrap', 'PHP', 'Java', 'Python', 'Node.js', 
        'JSON', 'Markdown', 'Shell', 'jQuery'
    ];
    
    // --- Inspector Message Listener ---
    useEffect(() => {
        const handleMessage = (event: MessageEvent) => {
            if (event.data && event.data.type === 'ELEMENT_CLICK') {
                setSelectedElement(event.data);
            }
        };
        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    // --- AI Integration ---
    const addAiLog = (message: string) => setAiLog(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
    
    const parseAIResponse = (text: string | undefined) => {
        const rawText = text || "{}";
        let jsonText = rawText.trim();
        if (jsonText.startsWith('```')) {
            jsonText = jsonText.replace(/^```(json)?\s*/, '').replace(/\s*```$/, '');
        }
        try {
            return JSON.parse(jsonText);
        } catch (e) {
            console.error("JSON Parse Error", e, jsonText);
            return {};
        }
    };

    // Helper for Robust API calls
    const generateWithRetry = async (promptText: string, isJson: boolean = true) => {
        const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
        let lastError;
        for (let i = 0; i < 3; i++) {
            try {
                return await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: promptText, // Simplified string format
                    config: isJson ? { responseMimeType: 'application/json' } : undefined
                });
            } catch (error: any) {
                console.warn(`API Attempt ${i + 1} failed`, error);
                lastError = error;
                // Retry on network/server errors (500, XHR error, etc)
                if (error.message?.toLowerCase().includes('xhr') || error.message?.toLowerCase().includes('fetch') || error.code === 500 || error.status === 500) {
                     await new Promise(r => setTimeout(r, 1000 * (i + 1))); // Backoff
                     continue;
                }
                throw error;
            }
        }
        throw lastError;
    };


    const performSelfCorrection = async (currentStructure: any, prjName: string) => {
        setLoadingMessage(t.simulating);
        addAiLog("AI Agent: Simulating user interaction and checking for runtime errors...");
        
        const flatCode = flattenProject(currentStructure);
        
        const simulationPrompt = `
        You are an expert QA Engineer and Developer.
        I have generated the following web application code. 
        Your goal is to:
        1. Mentally simulate a user interacting with this application in a browser.
        2. Identify any SYNTAX errors, LOGICAL errors, or MISSING files that would prevent it from running.
        3. Specifically check if index.html correctly references the CSS and JS files.
        4. If there are errors, provide the FIXED code for ONLY the files that need changing.
        5. If there are no errors, return an empty "fixedFiles" object.

        Current Code:
        ${flatCode}

        Response Format (JSON ONLY):
        {
            "logs": ["Simulated click on button X...", "Found error in script.js line 10..."],
            "fixedFiles": {
                "filename.ext": { "type": "file", "content": "FIXED CONTENT HERE" },
                "folder/filename.ext": { "type": "file", "content": "FIXED CONTENT HERE" }
            }
        }
        `;

        try {
            const response = await generateWithRetry(simulationPrompt, true);
            const result = parseAIResponse(response.text);
            
            if(result.logs && Array.isArray(result.logs)) {
                result.logs.forEach((log: string) => addAiLog(`[Simulation] ${log}`));
            }

            if (result.fixedFiles && Object.keys(result.fixedFiles).length > 0) {
                setLoadingMessage(t.optimizing);
                addAiLog(`Found ${Object.keys(result.fixedFiles).length} issues. Applying fixes...`);
                
                const newProject = JSON.parse(JSON.stringify(currentStructure));
                // Root is the project name
                const root = newProject[prjName].children; 

                Object.entries(result.fixedFiles).forEach(([path, entry]: [string, any]) => {
                    const parts = path.split('/');
                    const fileName = parts[parts.length - 1];
                    
                    if(root[fileName]) {
                        root[fileName].content = entry.content;
                    } else {
                        addPathToStructure(newProject[prjName].children, path, entry.content);
                    }
                });
                return newProject;
            } else {
                addAiLog("Simulation complete. No critical errors found.");
                return currentStructure;
            }

        } catch (e) {
            console.error("Self correction failed", e);
            addAiLog("Self-correction warning: Could not complete verification due to network issue.");
            return currentStructure;
        }
    };

    const handleGenerate = async () => {
        if (!prompt || !projectName) {
            alert("Please provide a project name and prompt.");
            return;
        }
        setIsLoading(true); setLoadingMessage(t.generating); setSelectedFile(null); setAiLog([]); setDebugLog([]);
        setActiveBottomTab('aiLog');
        setActiveMainTab('editor');
        
        const generationPrompt = `
You are an expert frontend web architect. Generate a complete, runnable web project (Single Page Application).
IMPORTANT: The output MUST be valid HTML, CSS, and JavaScript that can run in a browser without a backend server (Node/Python).
Use "index.html", "style.css", and "script.js" as the core files.

The output MUST be a single, valid JSON object representing the file system.
- Keys are file or folder names.
- Values: { "type": "file", "content": "..." } or { "type": "folder", "children": { ... } }

Project Request:
- Name: ${projectName}
- Description: ${prompt}
- Stack: ${techStack.join(', ')}

Generate the project structure now.
`;
        addAiLog("Sending generation request to Gemini...");
        try {
            const response = await generateWithRetry(generationPrompt, true);
            addAiLog("Structure generated. Parsing...");
            
            const generatedProject = parseAIResponse(response.text);
            if (!generatedProject || Object.keys(generatedProject).length === 0) {
                throw new Error("Empty or invalid JSON response from AI.");
            }
            
            // Initial simple structure
            const initialStructure = { [projectName]: { type: 'folder', children: generatedProject } };
            
            // Run Self Correction
            const refinedStructure = await performSelfCorrection(initialStructure, projectName);
            
            // Save to workspace
            updateWorkspace(refinedStructure, projectName, prompt, techStack);
            
            setActiveProjectName(projectName);
            addAiLog("Project ready & saved to workspace!");
            
            // Select index.html if available
            const rootChildren = refinedStructure[projectName].children;
            if(rootChildren['index.html']) setSelectedFile(`projects/${projectName}/index.html`);
            else setSelectedFile(`projects/${projectName}`);
            
            setActiveMainTab('preview');

        } catch (error) {
            console.error(error);
            addAiLog(`Error: ${t.aiError} - ${error instanceof Error ? error.message : String(error)}`);
        } finally {
            setIsLoading(false);
        }
    };

    const updateWorkspace = (newProjectStructure: any, prjName: string, prjPrompt: string, stack: string[]) => {
        setWorkspace(currentWs => {
            const newWs = JSON.parse(JSON.stringify(currentWs));
            const projectsFolder = newWs['projects'].children;
            
            // Add the new project folder
            projectsFolder[prjName] = newProjectStructure[prjName];
            
            // Update Index
            let indexData: ProjectMetadata[] = [];
            try {
                if(projectsFolder['index.json']) {
                    indexData = JSON.parse(projectsFolder['index.json'].content);
                }
            } catch(e) {}
            
            const existingIdx = indexData.findIndex(p => p.name === prjName);
            const metadata: ProjectMetadata = {
                id: crypto.randomUUID(),
                name: prjName,
                description: prjPrompt,
                createdAt: existingIdx >= 0 ? indexData[existingIdx].createdAt : new Date().toISOString(),
                lastModified: new Date().toISOString(),
                techStack: stack,
                log: aiLog
            };
            
            if (existingIdx >= 0) {
                indexData[existingIdx] = metadata;
            } else {
                indexData.push(metadata);
            }
            
            projectsFolder['index.json'].content = JSON.stringify(indexData, null, 2);
            
            return newWs;
        });
    };
    
    const updatePreview = (inspector: boolean) => {
        if(!workspace) return;
        const blobUrl = buildPreviewBlob(workspace, inspector, activeProjectName || undefined);
        if (blobUrl) {
             setPreviewUrl(blobUrl);
        } else {
            // Only warn if we are trying to preview an active project
            if(activeProjectName) addAiLog("Could not build preview: Missing index.html");
        }
    };
    
    useEffect(() => {
        if(workspace) updatePreview(inspectMode);
    }, [inspectMode, workspace, activeProjectName]);

    const handleFileContentChange = (newContent: string) => {
        if (!selectedFile) return;
        updateFileSystem(draft => {
            const parts = selectedFile.split('/'); 
            let current: any = draft;
            // Traverse
            for (let i = 0; i < parts.length - 1; i++) {
                if(current[parts[i]].type === 'folder') {
                    current = current[parts[i]].children;
                }
            }
            current[parts[parts.length - 1]].content = newContent;
        });
    };

    const handleRefreshPreview = () => {
        updatePreview(inspectMode);
        setSelectedElement(null);
    };

    // --- Element Modification AI ---
    const handleModifyElement = async (customInstruction?: string, presetKey?: string, presetValue?: string) => {
        if (!selectedElement || !activeProjectName) return;
        
        let instruction = customInstruction || elementCommand;
        if (presetKey && presetValue) {
            instruction = `Change css ${presetKey} to ${presetValue} for this element.`;
        }
        
        if(!instruction) return;

        setIsLoading(true);
        setLoadingMessage(t.optimizing);
        addAiLog(`Visual Editor: Modifying element <${selectedElement.tagName}>...`);

        // We only send the active project to AI, not the whole workspace
        const projectsFolder = (workspace['projects'] as any).children;
        const activeProjectData = { [activeProjectName]: projectsFolder[activeProjectName] };
        const flatCode = flattenProject(activeProjectData);
        
        const modifyPrompt = `
        User wants to modify a specific HTML element in the web application.
        
        Target Element Context:
        Tag: ${selectedElement.tagName}
        ID: ${selectedElement.id}
        Class: ${selectedElement.className}
        Current HTML: ${selectedElement.outerHTML}

        User Instruction: "${instruction}"

        Current Codebase:
        ${flatCode}

        Task:
        1. Locate the element in index.html or the corresponding CSS rule in style.css.
        2. Apply the requested change. 
        3. Return JSON with "fixedFiles" containing only the changed files.
        `;

        try {
             const response = await generateWithRetry(modifyPrompt, true);
             const result = parseAIResponse(response.text);
            
            if (result.fixedFiles) {
                updateFileSystem(draft => {
                     // Path likely comes back as "project/file.ext" or just "file.ext"
                     // We need to map it to projects/activeProjectName/file.ext
                     const projectsRoot = (draft['projects'] as any).children;
                     const projectRoot = (projectsRoot[activeProjectName] as any).children;

                     Object.entries(result.fixedFiles).forEach(([path, entry]: [string, any]) => {
                         const fileName = path.split('/').pop()!;
                         // Try to find file in project root
                         if(projectRoot[fileName]) projectRoot[fileName].content = entry.content;
                         // Add logic for nested folders if needed, but simple for now
                     });
                });
                addAiLog("Visual change applied.");
                setSelectedElement(null);
                setElementCommand('');
                setTimeout(() => handleRefreshPreview(), 500);
            }
        } catch(e) {
            addAiLog("Failed to apply visual edit.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleManualErrorFix = async () => {
        if(!manualError || !activeProjectName) return;
        setIsLoading(true);
        setLoadingMessage(t.optimizing);
        
        const projectsFolder = (workspace['projects'] as any).children;
        const activeProjectData = { [activeProjectName]: projectsFolder[activeProjectName] };
        const flatCode = flattenProject(activeProjectData);

        const fixPrompt = `
        The user reported a runtime error.
        Error: "${manualError}"
        
        Current Code:
        ${flatCode}
        
        Fix the code. Return JSON "fixedFiles".
        `;
        
        try {
             const response = await generateWithRetry(fixPrompt, true);
             const result = parseAIResponse(response.text);
            
            if (result.fixedFiles) {
                updateFileSystem(draft => {
                    const projectsRoot = (draft['projects'] as any).children;
                    const projectRoot = (projectsRoot[activeProjectName] as any).children;
                    Object.entries(result.fixedFiles).forEach(([path, entry]: [string, any]) => {
                        const fileName = path.split('/').pop()!;
                        if(projectRoot[fileName]) projectRoot[fileName].content = entry.content;
                    });
                });
                addAiLog("Fix applied based on error report.");
                setManualError('');
                setTimeout(() => handleRefreshPreview(), 500);
            }
        } catch(e) {
            addAiLog("Failed to fix reported error.");
        } finally {
            setIsLoading(false);
        }
    };


    const handleDebug = async () => {
        if (!selectedFile || !workspace) return;
        setActiveBottomTab('debug');
        setIsLoading(true);
        setLoadingMessage(t.aiAnalyzing);
        setDebugLog([]);

        const fileContent = getFileContent(selectedFile);
        const debugPrompt = `
Analyze this code for bugs. Respond with JSON: { "analysis": "string", "fixed_code": "string" }
File: ${selectedFile}
Code:
${fileContent}
`;
        try {
            const response = await generateWithRetry(debugPrompt, true);
            const result = parseAIResponse(response.text);

            if (result.analysis && result.fixed_code) {
                setDebugLog([{ file: selectedFile, message: result.analysis, fix: () => handleAutoFix(selectedFile, result.fixed_code) }]);
            } else {
                setDebugLog([]);
            }
        } catch (error) {
            console.error(error);
            addAiLog("Debug failed due to network error.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const handleAutoFix = (filePath: string, fixedContent: string) => {
        updateFileSystem(draft => {
            const parts = filePath.split('/'); let current: any = draft;
            for (let i = 0; i < parts.length - 1; i++) current = current[parts[i]].children;
            current[parts[parts.length - 1]].content = fixedContent;
        });
        setDebugLog([]);
        setTimeout(() => handleRefreshPreview(), 100);
    };

    const updateFileSystem = (callback: (draft: ProjectStructure) => void) => {
        setWorkspace(currentWs => {
            const newWs = JSON.parse(JSON.stringify(currentWs));
            callback(newWs);
            return newWs;
        });
    };

    const handleRename = (oldPath: string, newName: string) => {
        if (!newName || newName.includes('/')) return;
        updateFileSystem(draft => {
            const parts = oldPath.split('/'); 
            let parent: any = draft;
            for (let i = 0; i < parts.length - 1; i++) { parent = parent[parts[i]].children };
            const oldName = parts[parts.length - 1];
            parent[newName] = parent[oldName];
            delete parent[oldName];
        });
        setSelectedFile(path => path === oldPath ? oldPath.replace(/[^/]*$/, newName) : path);
    };

    const handleDelete = (path: string) => {
        if (!window.confirm(`${t.confirmDelete} "${path}"?`)) return;
        updateFileSystem(draft => {
            const parts = path.split('/'); 
            let parent: any = draft;
            for (let i = 0; i < parts.length - 1; i++) { parent = parent[parts[i]].children };
            delete parent[parts[parts.length - 1]];
        });
        if (selectedFile === path || selectedFile?.startsWith(path + '/')) setSelectedFile(null);
    };
    
    const handleNewFile = (folderPath: string) => {
        const fileName = window.prompt("Enter new file name:");
        if (!fileName || fileName.includes('/')) return;
        updateFileSystem(draft => {
            let target = draft;
            const parts = folderPath.split('/').filter(p => p);
            for (const part of parts) { 
                if (target[part]?.type === 'folder') {
                    target = (target[part] as any).children;
                }
            }
            target[fileName] = { type: 'file', content: '' };
        });
    };

    const handleNewFolder = (folderPath: string) => {
        const folderName = window.prompt("Enter new folder name:");
        if (!folderName || folderName.includes('/')) return;
        updateFileSystem(draft => {
            let target = draft;
            const parts = folderPath.split('/').filter(p => p);
            for (const part of parts) { 
                if (target[part]?.type === 'folder') {
                    target = (target[part] as any).children;
                }
            }
            target[folderName] = { type: 'folder', children: {} };
        });
    };

    const renderProjectTree = (tree: ProjectStructure, pathPrefix = '') => {
        return Object.entries(tree).map(([name, entry]) => (
            <FileTreeEntry
                key={pathPrefix + name} name={name} entry={entry}
                path={pathPrefix + name}
                onSelectFile={setSelectedFile} selectedFile={selectedFile}
                onContextMenu={handleContextMenu}
            />
        ));
    };
    
    const getFileContent = (path: string) => {
        if (!workspace || !path) return '';
        const parts = path.split('/'); 
        let current: any = workspace;
        for (const part of parts) { if (!current[part]) return ''; current = current[part].children || current[part]; }
        return current.content;
    };
    
    const handleDownloadZip = async () => {
        if (!activeProjectName || !workspace) return;
        
        // Find active project folder
        const projectsFolder = (workspace['projects'] as any).children;
        const activeProject = projectsFolder[activeProjectName];
        if(!activeProject) return;

        // @ts-ignore
        const zip = new JSZip();
        const addFolderToZip = (folder: ProjectStructure, currentZipFolder: JSZip) => {
            Object.entries(folder).forEach(([name, entry]) => {
                if (entry.type === 'folder') {
                    addFolderToZip(entry.children, currentZipFolder.folder(name)!);
                } else {
                    currentZipFolder.file(name, entry.content);
                }
            });
        };
        addFolderToZip(activeProject.children, zip);
        const content = await (zip as any).generateAsync({ type: 'blob' });
        const downloadLink = document.createElement('a');
        downloadLink.href = URL.createObjectURL(content as any);
        downloadLink.download = `${activeProjectName}.zip`;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    
    // Simplified History View
    const renderHistory = () => {
        let projects: ProjectMetadata[] = [];
        try {
            const projectsFolder = (workspace['projects'] as any).children;
            if(projectsFolder['index.json']) {
                projects = JSON.parse(projectsFolder['index.json'].content);
            }
        } catch(e) {}

        if(projects.length === 0) return <div className="p-8 text-center text-gray-500">{t.noProjects}</div>;

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 overflow-y-auto">
                {projects.map(p => (
                    <div key={p.id} className={`p-4 rounded-lg border ${currentTheme.border} ${currentTheme.inputBg} hover:border-cyan-500 transition cursor-pointer`} onClick={() => { setActiveProjectName(p.name); setActiveMainTab('editor'); setSelectedFile(`projects/${p.name}`); }}>
                        <div className="flex justify-between items-start mb-2">
                             <h3 className="font-bold text-lg text-white">{p.name}</h3>
                             <span className="text-xs text-gray-500">{new Date(p.lastModified).toLocaleDateString()}</span>
                        </div>
                        <p className="text-sm text-gray-400 mb-2 line-clamp-2">{p.description}</p>
                        <div className="flex flex-wrap gap-1">
                            {p.techStack.slice(0, 3).map(tech => <span key={tech} className="text-xs bg-gray-700 px-2 py-0.5 rounded text-cyan-300">{tech}</span>)}
                        </div>
                        <button className="mt-4 w-full bg-cyan-900/50 hover:bg-cyan-800 text-cyan-300 text-sm py-1 rounded border border-cyan-800">{t.openProject}</button>
                    </div>
                ))}
            </div>
        )
    };
    
    // Only import zip into active project or as new project? 
    // Implementing simpler: Import Zip adds to current workspace at root
    const handleZipFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]; if (!file) return;
        setIsLoading(true); setLoadingMessage(t.importing);
        try {
            // @ts-ignore
            const zip = await JSZip.loadAsync(file);
            const importedFolder: ProjectStructure = {};
            
            const promises = Object.values(zip.files).map(async (zipEntry: any) => {
                if (!zipEntry.dir) {
                    const content = await (zipEntry as any)['async']('string');
                    addPathToStructure(importedFolder, zipEntry.name, content);
                } else {
                     addPathToStructure(importedFolder, zipEntry.name, null);
                }
            });
            await Promise.all(promises);
            
            const newName = file.name.replace('.zip', '');
            updateWorkspace({ [newName]: { type: 'folder', children: importedFolder } }, newName, "Imported from ZIP", ["Imported"]);
            setActiveProjectName(newName);
            
        } catch (e) {
             console.error("Zip import error:", e);
             alert("Failed to import zip file.");
        } finally {
            setIsLoading(false);
            event.target.value = '';
        }
    };
    
    // Only file imports logic retained but simplified for brevity
    const handleFolderChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files; if (!files || files.length === 0) return;
        setIsLoading(true); setLoadingMessage(t.importing);
        const importedFolder: ProjectStructure = {};
        await Promise.all(Array.from(files).map(file => new Promise<void>(resolve => {
            const reader = new FileReader();
            reader.onload = (e) => {
                // @ts-ignore
                addPathToStructure(importedFolder, (file as any).webkitRelativePath || file.name, e.target?.result as string);
                resolve();
            };
            reader.readAsText(file);
        })));
        
        const folderName = (files[0] as any).webkitRelativePath.split('/')[0] || "ImportedFolder";
        updateWorkspace({ [folderName]: { type: 'folder', children: importedFolder } }, folderName, "Imported Folder", ["Imported"]);
        setActiveProjectName(folderName);
        setIsLoading(false);
    };

    const handleImportFromGithub = async () => {
        if (!githubUrl) return;
        setIsLoading(true);
        setLoadingMessage(t.importing);
        try {
            const cleanUrl = githubUrl.replace('https://github.com/', '').replace('.git', '');
            const [owner, repo] = cleanUrl.split('/').filter(Boolean);
            if (!owner || !repo) throw new Error("Invalid Repository URL");

            // Attempt to fetch tree from main or master
            let treeData: any;
            let branch = 'main';
            try {
                const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/main?recursive=1`);
                if (!res.ok) throw new Error();
                treeData = await res.json();
            } catch {
                branch = 'master';
                const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/master?recursive=1`);
                if (!res.ok) throw new Error("Repository not found or not public.");
                treeData = await res.json();
            }

            const importedFolder: ProjectStructure = {};
            // Filter relevant source files, limit to 50 to respect rate limits/bandwidth
            const files = treeData.tree.filter((f: any) => f.type === 'blob' && /\.(html|css|js|json|ts|tsx|jsx|md|txt)$/.test(f.path)).slice(0, 50);

            await Promise.all(files.map(async (file: any) => {
                const rawRes = await fetch(`https://raw.githubusercontent.com/${owner}/${repo}/${branch}/${file.path}`);
                if (rawRes.ok) {
                    const content = await rawRes.text();
                    addPathToStructure(importedFolder, file.path, content);
                }
            }));

            updateWorkspace({ [repo]: { type: 'folder', children: importedFolder } }, repo, `Imported from ${owner}/${repo}`, ["Imported", "GitHub"]);
            setActiveProjectName(repo);
            addAiLog(`Imported project from GitHub: ${owner}/${repo}`);

        } catch (error: any) {
            alert(`Import failed: ${error.message}`);
        } finally {
            setIsLoading(false);
            setGithubUrl('');
        }
    };

    // --- Layout Logic ---
    const getGridCols = () => {
        const left = showLeftPanel ? '280px' : '0px';
        const right = showRightPanel ? '380px' : '0px';
        return `grid-cols-[${left}_1fr_${right}]`;
    };

    return (
    <div dir={language === 'fa' ? 'rtl' : 'ltr'} className={`${currentTheme.bg} ${currentTheme.text} h-screen flex flex-col font-sans transition-colors duration-500`}>
        <div className="absolute inset-0 bg-grid-gray-700/[0.2] [mask-image:linear-gradient(to_bottom,white_5%,transparent_100%)]"></div>
        <header className={`relative z-10 p-4 border-b ${currentTheme.border} bg-gray-900/50 backdrop-blur-md flex-shrink-0`}>
            <div className="flex justify-between items-center">
                <div className="flex items-center gap-4">
                    <h1 className={`text-xl font-bold ${currentTheme.primary} animation-glow`}>{t.title}</h1>
                    <div className="flex gap-2">
                        <button onClick={() => setShowLeftPanel(!showLeftPanel)} className="text-gray-400 hover:text-white" title={t.toggleLeft}><LayoutLeftIcon/></button>
                        <button onClick={() => setShowRightPanel(!showRightPanel)} className="text-gray-400 hover:text-white" title={t.toggleRight}><LayoutRightIcon/></button>
                    </div>
                </div>
                <div className="flex items-center space-x-4">
                    <select onChange={(e) => setTheme(e.target.value as keyof typeof themes)} value={theme} className={`${currentTheme.inputBg} ${currentTheme.text} rounded p-1 text-sm`}><option value="neon-gloss">Neon Gloss</option><option value="neon-matte">Neon Matte</option></select>
                    <button onClick={() => setLanguage(lang => lang === 'en' ? 'fa' : 'en')} className="font-bold text-sm">{language === 'en' ? 'فارسی' : 'English'}</button>
                </div>
            </div>
        </header>

        <main className={`flex-grow grid grid-cols-1 lg:${getGridCols()} gap-4 p-4 overflow-hidden transition-all duration-300 ease-in-out`}>
            {/* Left Panel */}
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${showLeftPanel ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                 <Panel theme={theme} className="flex-grow flex flex-col h-full">
                    <h2 className={`text-lg font-bold p-4 border-b ${currentTheme.border} ${currentTheme.primary}`}>{t.projectTree}</h2>
                    <div className="flex-grow p-2 overflow-y-auto">
                        {/* We render the workspace root */}
                        {renderProjectTree(workspace)}
                    </div>
                 </Panel>
            </div>

            {/* Center Panel */}
            <div className="flex flex-col gap-4 overflow-hidden min-w-0">
                <Panel theme={theme} className="flex-grow flex flex-col relative">
                    <div className={`flex items-center p-2 border-b ${currentTheme.border} space-x-2 rtl:space-x-reverse`}>
                        <button onClick={() => setActiveMainTab('editor')} className={`px-4 py-1 rounded text-sm font-bold ${activeMainTab === 'editor' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>{t.editor}</button>
                        <button onClick={() => {setActiveMainTab('preview'); handleRefreshPreview();}} className={`px-4 py-1 rounded text-sm font-bold ${activeMainTab === 'preview' ? 'bg-green-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>{t.preview}</button>
                        <button onClick={() => setActiveMainTab('history')} className={`px-4 py-1 rounded text-sm font-bold ${activeMainTab === 'history' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:bg-gray-800'}`}>{t.history}</button>
                        
                        {activeMainTab === 'preview' && (
                            <button 
                                onClick={() => setInspectMode(!inspectMode)} 
                                className={`ml-4 px-3 py-1 rounded text-sm border ${inspectMode ? 'border-cyan-400 text-cyan-400 bg-cyan-900/30' : 'border-gray-600 text-gray-400'}`}
                            >
                                <EyeIcon/> {inspectMode ? t.inspectorActive : t.inspectElement}
                            </button>
                        )}

                        <div className="flex-grow"></div>
                        <span className="font-mono text-sm text-purple-400 truncate max-w-[200px]">{selectedFile || t.noFileSelected}</span>
                        {selectedFile && activeMainTab === 'editor' && <button onClick={handleDebug} disabled={isLoading} className={`flex items-center text-sm px-3 py-1 rounded ${currentTheme.inputBg} hover:bg-gray-700 disabled:opacity-50`}><DebugIcon/> {t.debugCTA}</button>}
                        {activeMainTab === 'preview' && <button onClick={handleRefreshPreview} className={`flex items-center text-sm px-3 py-1 rounded ${currentTheme.inputBg} hover:bg-gray-700`}><RefreshIcon/></button>}
                    </div>

                    <div className="flex-grow relative overflow-hidden">
                        {/* Code Editor */}
                        <div className={`absolute inset-0 transition-opacity duration-300 ${activeMainTab === 'editor' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                           <textarea value={getFileContent(selectedFile || '')} onChange={(e) => handleFileContentChange(e.target.value)} className="w-full h-full p-4 bg-transparent font-mono text-sm resize-none focus:outline-none" placeholder={t.noFileSelected} spellCheck="false" disabled={!selectedFile || isLoading}/>
                        </div>
                        
                        {/* Live Preview */}
                        <div className={`absolute inset-0 bg-white transition-opacity duration-300 ${activeMainTab === 'preview' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                             {previewUrl ? (
                                <iframe ref={iframeRef} src={previewUrl} className="w-full h-full border-none" title="Live Preview" sandbox="allow-scripts allow-modals" />
                             ) : (
                                <div className="flex items-center justify-center h-full text-gray-500">{activeProjectName ? t.generating : t.noFileSelected}</div>
                             )}

                             {/* Floating Inspector Menu */}
                             {inspectMode && selectedElement && (
                                <div style={{ position: 'absolute', top: Math.max(10, selectedElement.rect.top - 160), left: Math.min(window.innerWidth - 320, Math.max(10, selectedElement.rect.left)), zIndex: 50 }} className="w-80 bg-gray-800/95 backdrop-blur border border-cyan-500/50 rounded-lg shadow-2xl p-4 flex flex-col gap-3 animate-in fade-in zoom-in duration-200">
                                    <div className="flex justify-between items-center border-b border-gray-700 pb-2">
                                        <span className="text-xs font-mono text-cyan-300 font-bold">{selectedElement.tagName.toUpperCase()} {selectedElement.className ? `.${selectedElement.className.split(' ').join('.')}` : ''}</span>
                                        <button onClick={() => setSelectedElement(null)} className="text-gray-400 hover:text-white">✕</button>
                                    </div>
                                    
                                    <div className="grid grid-cols-3 gap-2">
                                        {['red', 'blue', 'green'].map(c => <button key={c} onClick={() => handleModifyElement(undefined, 'color', c)} className="h-6 rounded border border-white/20" style={{backgroundColor: c}}></button>)}
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <button onClick={() => handleModifyElement(undefined, 'padding', '10px')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">Pad 10px</button>
                                        <button onClick={() => handleModifyElement(undefined, 'margin', '10px')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">Marg 10px</button>
                                        <button onClick={() => handleModifyElement(undefined, 'fontSize', '18px')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">Font 18px</button>
                                        <button onClick={() => handleModifyElement(undefined, 'border', '1px solid red')} className="bg-gray-700 hover:bg-gray-600 px-2 py-1 rounded text-white">Border</button>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        <label className="text-xs text-gray-400">{t.aiCommand}</label>
                                        <textarea 
                                            className="bg-black/50 border border-gray-600 rounded p-2 text-xs text-white focus:border-cyan-500 outline-none resize-none h-16"
                                            placeholder={t.aiCommandPlaceholder}
                                            value={elementCommand}
                                            onChange={(e) => setElementCommand(e.target.value)}
                                        />
                                        <button onClick={() => handleModifyElement()} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold py-1.5 rounded flex justify-center items-center">
                                            {isLoading ? <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : t.applyChanges}
                                        </button>
                                    </div>
                                </div>
                             )}
                        </div>
                        
                        {/* History Tab */}
                        <div className={`absolute inset-0 ${currentTheme.bg} transition-opacity duration-300 ${activeMainTab === 'history' ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                            <div className="h-full flex flex-col">
                                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                                    <h2 className="text-xl font-bold text-white flex items-center"><HistoryIcon/> {t.history}</h2>
                                    <div className="text-xs text-gray-500">{t.workspaceRoot}: /projects/</div>
                                </div>
                                <div className="flex-grow overflow-hidden">
                                    {renderHistory()}
                                </div>
                            </div>
                        </div>

                    </div>
                </Panel>

                <Panel theme={theme} className="h-48 flex flex-col">
                    <div className={`border-b ${currentTheme.border}`}><nav className="-mb-px flex space-x-4 px-4"><button onClick={() => setActiveBottomTab('aiLog')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeBottomTab === 'aiLog' ? currentTheme.tabActive : `${currentTheme.tabInactive} border-transparent`}`}>{t.aiLog}</button><button onClick={() => setActiveBottomTab('debug')} className={`py-2 px-1 border-b-2 font-medium text-sm ${activeBottomTab === 'debug' ? currentTheme.tabActive : `${currentTheme.tabInactive} border-transparent`}`}>{t.debug}</button></nav></div>
                    <div className="flex-grow p-4 overflow-y-auto font-mono text-xs">
                        {activeBottomTab === 'aiLog' && aiLog.map((line, i) => <p key={i} className="whitespace-pre-wrap mb-1 border-b border-gray-800 pb-1">{line}</p>)}
                        {activeBottomTab === 'debug' && (
                             <div className="space-y-4">
                                <div className="p-2 bg-gray-800 rounded border border-gray-700">
                                    <label className="block text-xs text-gray-400 mb-1">{t.reportError}</label>
                                    <div className="flex gap-2">
                                        <input value={manualError} onChange={(e) => setManualError(e.target.value)} placeholder={t.reportErrorPlaceholder} className="flex-grow bg-gray-900 border border-gray-700 rounded px-2 py-1 text-white focus:outline-none"/>
                                        <button onClick={handleManualErrorFix} disabled={!manualError || isLoading} className="bg-red-600 hover:bg-red-500 text-white px-3 py-1 rounded text-xs">{t.submitError}</button>
                                    </div>
                                </div>
                                {debugLog.length > 0 ? (
                                    <div><p className="text-yellow-400 mb-2">{t.bugsFound}</p>{debugLog.map((log, i) => (<div key={i} className="p-2 bg-gray-800/50 rounded mb-2"><p><span className="font-bold text-red-400">{log.file}</span>: {log.message}</p><button onClick={log.fix} className="text-xs bg-green-600 hover:bg-green-500 text-white font-bold py-1 px-2 rounded mt-1">{t.autoFix}</button></div>))}</div>
                                ) : (<p className="text-green-400">{t.noBugs}</p>)}
                             </div>
                        )}
                    </div>
                </Panel>
            </div>
            
            {/* Right Panel */}
            <div className={`flex flex-col overflow-hidden transition-all duration-300 ${showRightPanel ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <Panel theme={theme} className="flex-grow flex flex-col h-full overflow-y-auto p-4 gap-6">
                     <div>
                        <h2 className={`text-lg font-bold mb-4 border-b ${currentTheme.border} ${currentTheme.primary}`}>{t.generate}</h2>
                        <Input label={t.projectName} placeholder={t.projectNamePlaceholder} value={projectName} onChange={(e) => setProjectName(e.target.value)} theme={theme} />
                        <div className="mt-4">
                             <label className={`block mb-2 text-sm font-bold ${currentTheme.primary}`}>{t.prompt}</label>
                             <textarea className={`w-full p-3 h-32 ${currentTheme.inputBg} ${currentTheme.text} border ${currentTheme.border} rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none transition resize-none`} placeholder={t.promptPlaceholder} value={prompt} onChange={(e) => setPrompt(e.target.value)}></textarea>
                        </div>
                        <button onClick={handleGenerate} disabled={isLoading} className={`w-full mt-4 ${currentTheme.button} ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                            {isLoading ? t.generating : t.generate}
                        </button>
                     </div>

                     <div>
                        <h3 className={`text-sm font-bold mb-2 ${currentTheme.primary}`}>{t.techStack}</h3>
                        <div className="flex flex-wrap gap-2">
                            {availableTech.map(tech => (
                                <button key={tech} onClick={() => setTechStack(prev => prev.includes(tech) ? prev.filter(t => t !== tech) : [...prev, tech])} className={`px-2 py-1 text-xs rounded border transition-colors ${techStack.includes(tech) ? `${currentTheme.primary} border-cyan-400 bg-cyan-900/30` : 'text-gray-500 border-gray-700 hover:border-gray-500'}`}>
                                    {tech}
                                </button>
                            ))}
                        </div>
                     </div>

                     <div className="border-t border-gray-700 pt-4">
                        <h2 className={`text-lg font-bold mb-4 ${currentTheme.primary}`}>{t.importProject}</h2>
                         <div className="grid grid-cols-2 gap-2 mb-4">
                             <button onClick={() => zipInputRef.current?.click()} className={`flex items-center justify-center p-2 rounded border ${currentTheme.border} hover:bg-gray-800 text-sm`}><ZipIcon/> {t.importZip}</button>
                             <button onClick={() => folderInputRef.current?.click()} className={`flex items-center justify-center p-2 rounded border ${currentTheme.border} hover:bg-gray-800 text-sm`}><FolderOpenIcon/> {t.importFolder}</button>
                             <input type="file" ref={zipInputRef} onChange={handleZipFileChange} accept=".zip" className="hidden" />
                             {/* @ts-ignore */}
                             <input type="file" ref={folderInputRef} onChange={handleFolderChange} webkitdirectory="" directory="" multiple className="hidden" />
                         </div>
                         <div className="space-y-2">
                             <Input label="GitHub" placeholder={t.githubRepoUrl} value={githubUrl} onChange={(e) => setGithubUrl(e.target.value)} theme={theme} />
                             <button onClick={handleImportFromGithub} disabled={isLoading} className={`w-full p-2 rounded border ${currentTheme.border} hover:bg-gray-800 text-sm flex items-center justify-center`}><GithubIcon/> {t.importFromGithub}</button>
                         </div>
                     </div>

                     <div className="border-t border-gray-700 pt-4">
                         <button onClick={handleDownloadZip} disabled={!activeProjectName} className={`w-full p-2 rounded border ${currentTheme.border} hover:bg-gray-800 text-sm flex items-center justify-center disabled:opacity-50`}><ZipIcon/> {t.downloadZip}</button>
                     </div>
                </Panel>
            </div>
            
            {contextMenu && <ContextMenu menu={contextMenu} onClose={closeContextMenu} onRename={handleRename} onDelete={handleDelete} onNewFile={handleNewFile} onNewFolder={handleNewFolder} t={t} />}
        </main>
    </div>
    );
};

interface FileTreeEntryProps { name: string; entry: FileSystemEntry; path: string; onSelectFile: (path: string) => void; selectedFile: string | null; onContextMenu: (e: React.MouseEvent, path: string, type: 'file' | 'folder') => void; }
const FileTreeEntry: FC<FileTreeEntryProps> = ({ name, entry, path, onSelectFile, selectedFile, onContextMenu }) => {
    const [isOpen, setIsOpen] = useState(false);
    
    // Auto-open 'projects' folder
    useEffect(() => {
        if (name === 'projects' || name === 'src') setIsOpen(true);
    }, [name]);
    
    const isSelected = selectedFile === path;
    if (entry.type === 'folder') {
        return (
            <div>
                <div onClick={() => setIsOpen(!isOpen)} onContextMenu={(e) => onContextMenu(e, path, 'folder')} className={`font-mono text-sm cursor-pointer hover:bg-gray-800 rounded p-1 flex items-center`}>
                   <FolderIcon isOpen={isOpen} /> {name}
                </div>
                {isOpen && <div className="pl-5 border-l border-gray-700">{Object.entries(entry.children).map(([childName, childEntry]) => <FileTreeEntry key={path + '/' + childName} name={childName} entry={childEntry} path={path + '/' + childName} onSelectFile={onSelectFile} selectedFile={selectedFile} onContextMenu={onContextMenu}/>)}</div>}
            </div>
        );
    }
    return (
        <div onClick={() => onSelectFile(path)} onContextMenu={(e) => onContextMenu(e, path, 'file')} className={`font-mono text-sm cursor-pointer hover:bg-gray-800 rounded p-1 flex items-center ${isSelected ? 'bg-purple-900/50' : ''}`}>
           <FileIcon /> {name}
        </div>
    );
};

const ContextMenu: FC<{ menu: ContextMenu; onClose: () => void; onRename: any; onDelete: any; onNewFile: any; onNewFolder: any; t: any;}> = ({ menu, onClose, onRename, onDelete, onNewFile, onNewFolder, t }) => {
    if (!menu) return null;
    const { x, y, path, type } = menu;
    const menuItems = [
        ...(type === 'folder' ? [{label: t.newFile, action: () => onNewFile(path || '')}, {label: t.newFolder, action: () => onNewFolder(path || '')}] : []),
        {label: t.rename, action: () => { const newName = prompt(`Rename ${path}:`); if(newName) onRename(path, newName); }},
        {label: t.delete, action: () => onDelete(path) }
    ];
    return (
        <div style={{ top: y, left: x }} className="absolute z-50 bg-gray-800 border border-gray-600 rounded-md shadow-lg py-1 w-40" onClick={onClose}>
            {menuItems.map(({ label, action }) => (
                <button key={label} onClick={action} className="block w-full text-left px-4 py-2 text-sm text-gray-200 hover:bg-purple-600">{label}</button>
            ))}
        </div>
    );
};

const container = document.getElementById('root');
const root = createRoot(container!);
root.render(<App />);