import { useState } from "react";
import {
  FolderOpen,
  FileText,
  Plus,
  ChevronRight,
  ChevronDown,
  Trash2,
  Edit3,
  Save,
  X,
  Link,
  Layers,
  Search,
  ChevronLeft,
} from "lucide-react";
import { v4 as uuid } from "uuid";

interface LocalProject {
  id: string;
  name: string;
  expanded: boolean;
}

interface LocalFolder {
  id: string;
  projectId: string;
  name: string;
  expanded: boolean;
}

interface LocalNote {
  id: string;
  folderId: string;
  projectId: string;
  title: string;
  content: string;
  links: string[];
  updatedAt: string;
}

const initialProjects: LocalProject[] = [
  { id: "p1", name: "SaaS Acquisitions", expanded: true },
  { id: "p2", name: "Market Research", expanded: false },
];

const initialFolders: LocalFolder[] = [
  { id: "f1", projectId: "p1", name: "Due Diligence", expanded: true },
  { id: "f2", projectId: "p1", name: "Financial Models", expanded: false },
  { id: "f3", projectId: "p2", name: "Industry Reports", expanded: false },
];

const initialNotes: LocalNote[] = [
  {
    id: "n1",
    folderId: "f1",
    projectId: "p1",
    title: "CloudSync SaaS - DD Checklist",
    content:
      "## Due Diligence Checklist\n\n- [x] Financial statements (3 years)\n- [x] Customer contracts review\n- [ ] Technical architecture audit\n- [ ] IP and patent verification\n- [ ] Employee agreements\n- [ ] Regulatory compliance check\n\n### Notes\nStrong recurring revenue base with 94% retention. Need to verify the patent claims and ensure no pending litigation.",
    links: ["https://example.com/financials", "https://example.com/contracts"],
    updatedAt: "2 hours ago",
  },
  {
    id: "n2",
    folderId: "f1",
    projectId: "p1",
    title: "DataPulse Analytics - Initial Review",
    content:
      "## Initial Assessment\n\nStrong B2B analytics platform serving 340 enterprise clients.\n\n### Key Metrics\n- ARR: $2.1M\n- Retention: 94%\n- Price Multiple: 2.5x revenue\n\n### Concerns\n- High dependency on key engineering talent\n- Need to assess competitive moat\n- Market consolidation risk",
    links: [],
    updatedAt: "1 day ago",
  },
  {
    id: "n3",
    folderId: "f2",
    projectId: "p1",
    title: "Valuation Model - Template",
    content:
      "## DCF Valuation Template\n\nDiscount Rate: 12%\nTerminal Growth: 3%\nProjection Period: 5 years\n\n### Revenue Assumptions\n- Year 1: Base + 10%\n- Year 2: +15%\n- Year 3: +12%\n- Year 4: +8%\n- Year 5: +5%",
    links: [],
    updatedAt: "3 days ago",
  },
];

export default function NotesPage() {
  const [projects, setProjects] = useState(initialProjects);
  const [folders, setFolders] = useState(initialFolders);
  const [notes, setNotes] = useState(initialNotes);
  const [selectedNote, setSelectedNote] = useState<LocalNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [newLinkInput, setNewLinkInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [showNewProjectInput, setShowNewProjectInput] = useState(false);
  const [newProjectName, setNewProjectName] = useState("");

  // Mobile: when note is selected, show editor; otherwise show tree
  const isMobileEditorView = selectedNote !== null;

  const toggleProject = (id: string) => {
    setProjects((prev) =>
      prev.map((p) => (p.id === id ? { ...p, expanded: !p.expanded } : p))
    );
  };

  const toggleFolder = (id: string) => {
    setFolders((prev) =>
      prev.map((f) => (f.id === id ? { ...f, expanded: !f.expanded } : f))
    );
  };

  const selectNote = (note: LocalNote) => {
    setSelectedNote(note);
    setIsEditing(false);
  };

  const handleBackToTree = () => {
    setSelectedNote(null);
    setIsEditing(false);
  };

  const startEditing = () => {
    if (!selectedNote) return;
    setEditTitle(selectedNote.title);
    setEditContent(selectedNote.content);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!selectedNote) return;
    const updated = {
      ...selectedNote,
      title: editTitle,
      content: editContent,
      updatedAt: "Just now",
    };
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelectedNote(updated);
    setIsEditing(false);
  };

  const addLink = () => {
    if (!selectedNote || !newLinkInput.trim()) return;
    const updated = {
      ...selectedNote,
      links: [...selectedNote.links, newLinkInput.trim()],
    };
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelectedNote(updated);
    setNewLinkInput("");
  };

  const removeLink = (index: number) => {
    if (!selectedNote) return;
    const updated = {
      ...selectedNote,
      links: selectedNote.links.filter((_, i) => i !== index),
    };
    setNotes((prev) => prev.map((n) => (n.id === updated.id ? updated : n)));
    setSelectedNote(updated);
  };

  const addProject = () => {
    if (!newProjectName.trim()) return;
    const newProject: LocalProject = {
      id: uuid(),
      name: newProjectName.trim(),
      expanded: true,
    };
    setProjects((prev) => [...prev, newProject]);
    setNewProjectName("");
    setShowNewProjectInput(false);
  };

  const addFolder = (projectId: string) => {
    const newFolder: LocalFolder = {
      id: uuid(),
      projectId,
      name: "New Folder",
      expanded: true,
    };
    setFolders((prev) => [...prev, newFolder]);
  };

  const addNote = (folderId: string, projectId: string) => {
    const newNote: LocalNote = {
      id: uuid(),
      folderId,
      projectId,
      title: "Untitled Note",
      content: "Start writing...",
      links: [],
      updatedAt: "Just now",
    };
    setNotes((prev) => [...prev, newNote]);
    setSelectedNote(newNote);
    setIsEditing(true);
    setEditTitle(newNote.title);
    setEditContent(newNote.content);
  };

  const deleteNote = (noteId: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== noteId));
    if (selectedNote?.id === noteId) {
      setSelectedNote(null);
      setIsEditing(false);
    }
  };

  /* ─── Shared tree rendering ─── */
  const renderTree = () => (
    <div className="flex-1 overflow-y-auto p-2">
      {projects.map((project) => (
        <div key={project.id} className="mb-1">
          {/* Project */}
          <button
            onClick={() => toggleProject(project.id)}
            className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-dark-600 transition-colors group"
          >
            {project.expanded ? (
              <ChevronDown size={12} className="text-dark-200" />
            ) : (
              <ChevronRight size={12} className="text-dark-200" />
            )}
            <Layers size={13} className="text-accent-500" />
            <span className="text-xs font-mono text-light-text flex-1 truncate">
              {project.name}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                addFolder(project.id);
              }}
              className="opacity-0 group-hover:opacity-100 text-dark-200 hover:text-accent-400 transition-all"
            >
              <Plus size={12} />
            </button>
          </button>

          {/* Folders */}
          {project.expanded &&
            folders
              .filter((f) => f.projectId === project.id)
              .map((folder) => (
                <div key={folder.id} className="ml-4">
                  <button
                    onClick={() => toggleFolder(folder.id)}
                    className="w-full flex items-center gap-2 px-2 py-1.5 rounded text-left hover:bg-dark-600 transition-colors group"
                  >
                    {folder.expanded ? (
                      <ChevronDown size={10} className="text-dark-300" />
                    ) : (
                      <ChevronRight size={10} className="text-dark-300" />
                    )}
                    <FolderOpen size={12} className="text-dark-100" />
                    <span className="text-[11px] font-mono text-gray-text flex-1 truncate">
                      {folder.name}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        addNote(folder.id, project.id);
                      }}
                      className="opacity-0 group-hover:opacity-100 text-dark-200 hover:text-accent-400 transition-all"
                    >
                      <Plus size={10} />
                    </button>
                  </button>

                  {/* Notes */}
                  {folder.expanded &&
                    notes
                      .filter(
                        (n) =>
                          n.folderId === folder.id &&
                          (!searchQuery ||
                            n.title
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()) ||
                            n.content
                              .toLowerCase()
                              .includes(searchQuery.toLowerCase()))
                      )
                      .map((note) => (
                        <button
                          key={note.id}
                          onClick={() => selectNote(note)}
                          className={`w-full flex items-center gap-2 px-2 py-1.5 ml-4 rounded text-left transition-colors group ${
                            selectedNote?.id === note.id
                              ? "bg-accent-900/40 border border-accent-800/50"
                              : "hover:bg-dark-600 border border-transparent"
                          }`}
                        >
                          <FileText
                            size={11}
                            className={
                              selectedNote?.id === note.id
                                ? "text-accent-400"
                                : "text-dark-200"
                            }
                          />
                          <span
                            className={`text-[11px] font-mono flex-1 truncate ${
                              selectedNote?.id === note.id
                                ? "text-accent-200"
                                : "text-dark-100"
                            }`}
                          >
                            {note.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNote(note.id);
                            }}
                            className="opacity-0 group-hover:opacity-100 text-dark-300 hover:text-red-400 transition-all"
                          >
                            <Trash2 size={10} />
                          </button>
                        </button>
                      ))}
                </div>
              ))}
        </div>
      ))}
    </div>
  );

  /* ─── Shared note editor rendering ─── */
  const renderEditor = () => {
    if (!selectedNote) return null;
    return (
      <div className="flex-1 flex flex-col">
        {/* Editor Header */}
        <div className="h-12 bg-dark-800 border-b border-dark-500 flex items-center px-3 md:px-4 shrink-0">
          {/* Mobile back button */}
          <button
            onClick={handleBackToTree}
            className="md:hidden text-dark-200 hover:text-light-text transition-colors p-1 mr-2"
          >
            <ChevronLeft size={20} />
          </button>

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 bg-transparent text-xs md:text-sm font-mono text-light-text focus:outline-none"
            />
          ) : (
            <h3 className="flex-1 text-xs md:text-sm font-mono text-light-text truncate">{selectedNote.title}</h3>
          )}

          <span className="text-[10px] text-dark-200 font-mono mr-3 md:mr-4 hidden sm:inline">
            {selectedNote.updatedAt}
          </span>

          {isEditing ? (
            <div className="flex gap-2">
              <button
                onClick={saveNote}
                className="text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1 text-xs font-mono"
              >
                <Save size={14} />
                <span className="hidden sm:inline">Save</span>
              </button>
              <button
                onClick={() => setIsEditing(false)}
                className="text-dark-200 hover:text-light-text transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={startEditing}
              className="text-dark-200 hover:text-accent-400 transition-colors flex items-center gap-1 text-xs font-mono"
            >
              <Edit3 size={14} />
              <span className="hidden sm:inline">Edit</span>
            </button>
          )}
        </div>

        {/* Editor Body */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
          {isEditing ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full bg-transparent text-xs md:text-sm font-mono text-light-text leading-relaxed focus:outline-none resize-none"
              placeholder="Write your note..."
            />
          ) : (
            <div className="prose prose-invert max-w-none">
              {selectedNote.content.split("\n").map((line, i) => {
                if (line.startsWith("## ")) {
                  return (
                    <h2
                      key={i}
                      className="text-base md:text-lg font-semibold text-white-text font-mono mb-3 mt-6 first:mt-0"
                    >
                      {line.replace("## ", "")}
                    </h2>
                  );
                }
                if (line.startsWith("### ")) {
                  return (
                    <h3
                      key={i}
                      className="text-sm md:text-base font-semibold text-light-text font-mono mb-2 mt-4"
                    >
                      {line.replace("### ", "")}
                    </h3>
                  );
                }
                if (line.startsWith("- [x] ")) {
                  return (
                    <div key={i} className="flex items-center gap-2 mb-1.5">
                      <div className="w-4 h-4 rounded border border-accent-600 bg-accent-800 flex items-center justify-center text-accent-300 text-[10px]">
                        ✓
                      </div>
                      <span className="text-xs md:text-sm font-mono text-gray-text line-through">
                        {line.replace("- [x] ", "")}
                      </span>
                    </div>
                  );
                }
                if (line.startsWith("- [ ] ")) {
                  return (
                    <div key={i} className="flex items-center gap-2 mb-1.5">
                      <div className="w-4 h-4 rounded border border-dark-300 bg-dark-600" />
                      <span className="text-xs md:text-sm font-mono text-light-text">
                        {line.replace("- [ ] ", "")}
                      </span>
                    </div>
                  );
                }
                if (line.startsWith("- ")) {
                  return (
                    <div key={i} className="flex items-start gap-2 mb-1.5 ml-1">
                      <span className="text-accent-500 mt-0.5">•</span>
                      <span className="text-xs md:text-sm font-mono text-gray-text">
                        {line.replace("- ", "")}
                      </span>
                    </div>
                  );
                }
                if (line.trim() === "") {
                  return <div key={i} className="h-3" />;
                }
                return (
                  <p key={i} className="text-xs md:text-sm font-mono text-gray-text leading-relaxed mb-1">
                    {line}
                  </p>
                );
              })}
            </div>
          )}
        </div>

        {/* Links */}
        <div className="bg-dark-800 border-t border-dark-500 p-3 md:p-4 safe-bottom">
          <div className="flex items-center gap-2 mb-2">
            <Link size={12} className="text-dark-200" />
            <span className="text-[10px] text-dark-100 font-mono uppercase tracking-wider">
              Attached Links
            </span>
          </div>

          {selectedNote.links.length > 0 && (
            <div className="space-y-1 mb-2">
              {selectedNote.links.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 bg-dark-700 rounded px-2 py-1.5 group"
                >
                  <Link size={10} className="text-accent-500 shrink-0" />
                  <span className="text-[10px] md:text-[11px] font-mono text-accent-300 truncate flex-1">
                    {link}
                  </span>
                  <button
                    onClick={() => removeLink(i)}
                    className="opacity-0 group-hover:opacity-100 text-dark-300 hover:text-red-400 transition-all"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text"
              value={newLinkInput}
              onChange={(e) => setNewLinkInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addLink()}
              placeholder="Add a link..."
              className="flex-1 bg-dark-700 border border-dark-400 rounded px-3 py-1.5 text-xs font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
            />
            <button
              onClick={addLink}
              disabled={!newLinkInput.trim()}
              className="text-accent-400 hover:text-accent-300 disabled:opacity-30 transition-colors"
            >
              <Plus size={14} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex h-full bg-dark-900">
      {/* ─── Desktop: Sidebar + Editor side by side ─── */}
      {/* Desktop sidebar - always visible */}
      <div className="hidden md:flex w-72 bg-dark-800 border-r border-dark-500 flex-col shrink-0">
        <div className="p-4 border-b border-dark-500">
          <div className="flex items-center gap-2 mb-3">
            <Layers size={16} className="text-accent-500" />
            <h2 className="font-mono text-sm text-light-text">PROJECTS</h2>
            <button
              onClick={() => setShowNewProjectInput(true)}
              className="ml-auto text-dark-200 hover:text-accent-400 transition-colors"
              title="New project"
            >
              <Plus size={14} />
            </button>
          </div>

          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-200" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search notes..."
              className="w-full bg-dark-700 border border-dark-400 rounded pl-9 pr-3 py-2 text-xs font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
            />
          </div>
        </div>

        {showNewProjectInput && (
          <div className="p-3 border-b border-dark-500 flex gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addProject()}
              placeholder="Project name..."
              className="flex-1 bg-dark-700 border border-dark-400 rounded px-2 py-1.5 text-xs font-mono text-light-text focus:outline-none focus:border-accent-600"
              autoFocus
            />
            <button onClick={addProject} className="text-accent-400 hover:text-accent-300">
              <Save size={14} />
            </button>
            <button
              onClick={() => setShowNewProjectInput(false)}
              className="text-dark-200 hover:text-light-text"
            >
              <X size={14} />
            </button>
          </div>
        )}

        {renderTree()}
      </div>

      {/* Desktop editor area */}
      <div className="hidden md:flex flex-1 flex-col">
        {selectedNote ? (
          renderEditor()
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <FileText size={48} className="text-dark-400 mx-auto mb-4" />
              <p className="text-dark-200 font-mono text-sm">Select or create a note</p>
              <p className="text-dark-300 font-mono text-xs mt-1">
                Use the project tree to navigate
              </p>
            </div>
          </div>
        )}
      </div>

      {/* ─── Mobile: Show tree OR editor ─── */}
      <div className="flex md:hidden flex-1 flex-col">
        {!isMobileEditorView ? (
          /* Mobile tree view */
          <div className="flex flex-col h-full bg-dark-800">
            <div className="p-3 border-b border-dark-500">
              <div className="flex items-center gap-2 mb-2">
                <Layers size={14} className="text-accent-500" />
                <h2 className="font-mono text-xs text-light-text">PROJECTS</h2>
                <button
                  onClick={() => setShowNewProjectInput(true)}
                  className="ml-auto text-dark-200 hover:text-accent-400 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>

              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-dark-200" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search notes..."
                  className="w-full bg-dark-700 border border-dark-400 rounded pl-8 pr-3 py-2 text-[11px] font-mono text-light-text placeholder-dark-200 focus:outline-none focus:border-accent-600 transition-colors"
                />
              </div>
            </div>

            {showNewProjectInput && (
              <div className="p-3 border-b border-dark-500 flex gap-2">
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addProject()}
                  placeholder="Project name..."
                  className="flex-1 bg-dark-700 border border-dark-400 rounded px-2 py-1.5 text-xs font-mono text-light-text focus:outline-none focus:border-accent-600"
                  autoFocus
                />
                <button onClick={addProject} className="text-accent-400 hover:text-accent-300">
                  <Save size={14} />
                </button>
                <button
                  onClick={() => setShowNewProjectInput(false)}
                  className="text-dark-200 hover:text-light-text"
                >
                  <X size={14} />
                </button>
              </div>
            )}

            {renderTree()}
          </div>
        ) : (
          /* Mobile editor view */
          renderEditor()
        )}
      </div>
    </div>
  );
}
