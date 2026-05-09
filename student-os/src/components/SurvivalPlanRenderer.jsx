import React from 'react';
import ReactMarkdown from 'react-markdown';
import { AlertCircle, Clock, CheckCircle2 } from 'lucide-react';

// Helper to parse the raw markdown into sections based on H1 (#) headers
const parseSections = (markdown) => {
  // Split by top-level headers, keeping the header in the chunk
  const chunks = markdown.split(/(?=^# )/m).filter(s => s.trim().length > 0);
  
  return chunks.map(chunk => {
    const titleMatch = chunk.match(/^#\s+(.+)$/m);
    const title = titleMatch ? titleMatch[1].trim() : '';
    // Remove the title line from the body
    const body = chunk.replace(/^#\s+.*$/m, '').trim();
    return { title, body };
  });
};

const PriorityBadge = ({ text }) => {
  const normalized = text.toLowerCase();
  let colorClass = 'bg-slate-700 text-slate-300';
  let Icon = CheckCircle2;

  if (normalized.includes('high') || normalized.includes('urgent')) {
    colorClass = 'bg-red-500/20 text-red-400 border border-red-500/30';
    Icon = AlertCircle;
  } else if (normalized.includes('medium') || normalized.includes('med')) {
    colorClass = 'bg-amber-500/20 text-amber-400 border border-amber-500/30';
    Icon = Clock;
  } else if (normalized.includes('low')) {
    colorClass = 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30';
    Icon = CheckCircle2;
  }

  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${colorClass}`}>
      <Icon className="w-3 h-3 mr-1" />
      {text.toUpperCase()}
    </span>
  );
};

const MarkdownComponents = {
  a: ({ node, ...props }) => {
    const isChip = typeof props.children === 'string' && 
                   (props.children.includes('Search Notes') || props.children.includes('Watch Tutorial'));
    
    if (isChip) {
      const isYouTube = props.children.includes('Watch Tutorial');
      return (
        <a 
          {...props} 
          target="_blank" 
          rel="noreferrer"
          className={`inline-flex items-center px-2.5 py-1 mt-1 mr-2 rounded-full text-xs font-semibold no-underline transition-colors border ${
            isYouTube 
              ? 'bg-red-500/10 text-red-400 border-red-500/30 hover:bg-red-500/20' 
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30 hover:bg-indigo-500/20'
          }`}
        >
          {props.children}
        </a>
      );
    }
    return <a {...props} target="_blank" rel="noreferrer" className="text-indigo-400 hover:text-indigo-300 underline" />;
  }
};

const UrgentTasksRenderer = ({ body }) => {
  // Extract bullet points
  const items = body.split(/^(?:-|\*)\s+/m).filter(i => i.trim().length > 0);

  return (
    <div className="relative border-l-2 border-slate-700 ml-3 mt-4 space-y-6 pb-4">
      {items.map((item, idx) => {
        // Try to extract priority in parentheses or brackets e.g. (High) or [Medium Priority]
        let priority = 'Normal';
        let content = item.trim();
        
        const priorityMatch = content.match(/[\(\[]\s*(high|medium|med|low)(?:\s+priority)?\s*[\)\]]/i);
        if (priorityMatch) {
          priority = priorityMatch[1];
          // Remove the priority tag from the content
          content = content.replace(priorityMatch[0], '').trim();
        } else if (content.toLowerCase().includes('high')) {
          priority = 'High';
        } else if (content.toLowerCase().includes('urgent')) {
          priority = 'High';
        }

        return (
          <div key={idx} className="relative pl-6">
            <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-4 ring-slate-800" />
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
              <div className="prose prose-invert prose-sm text-slate-300 max-w-none flex-1">
                <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
              </div>
              <div className="shrink-0 mt-1 sm:mt-0">
                <PriorityBadge text={priority} />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

const StudyPrioritiesRenderer = ({ body }) => {
  // Split by H2 headers (##)
  const chunks = body.split(/(?=^## )/m).filter(s => s.trim().length > 0);
  
  if (chunks.length <= 1) {
    // If there are no H2 headers, fallback to default markdown
    return (
      <div className="prose prose-invert prose-sm text-slate-300 max-w-none mt-4">
        <ReactMarkdown components={MarkdownComponents}>{body}</ReactMarkdown>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
      {chunks.map((chunk, idx) => {
        const titleMatch = chunk.match(/^##\s+(.+)$/m);
        const title = titleMatch ? titleMatch[1].trim() : 'Priority';
        const content = chunk.replace(/^##\s+.*$/m, '').trim();
        
        // Determine border color based on title (High/Medium/Low)
        let borderColor = 'border-white/20';
        if (title.toLowerCase().includes('high')) borderColor = 'border-red-500/50';
        else if (title.toLowerCase().includes('medium')) borderColor = 'border-amber-500/50';
        else if (title.toLowerCase().includes('low')) borderColor = 'border-emerald-500/50';

        return (
          <div key={idx} className={`bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10 border-t-2 ${borderColor}`}>
            <h3 className="text-sm font-bold text-white mb-2 font-mono uppercase tracking-wider">{title}</h3>
            <div className="prose prose-invert prose-sm text-slate-300 max-w-none prose-li:my-0.5">
              <ReactMarkdown components={MarkdownComponents}>{content}</ReactMarkdown>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default function SurvivalPlanRenderer({ result, isCooked }) {
  if (!result) return null;

  const sections = parseSections(result);
  const accentColor = isCooked ? 'border-red-500 shadow-[0_0_15px_-3px_rgba(220,38,38,0.3)]' : 'border-indigo-500 shadow-[0_0_15px_-3px_rgba(255,255,255,0.1)]';
  const glassBg = isCooked ? 'bg-red-500/5 backdrop-blur-sm' : 'bg-white/5 backdrop-blur-sm';

  return (
    <div className="space-y-6">
      {sections.map((section, idx) => {
        const { title, body } = section;
        
        // Skip empty sections
        if (!title && !body) return null;

        const isUrgentTasks = title.toLowerCase().includes('urgent task');
        const isStudyPriorities = title.toLowerCase().includes('study priorit');

        return (
          <div 
            key={idx} 
            className={`${glassBg} rounded-xl p-5 border border-white/10 border-t-2 ${accentColor}`}
          >
            {title && (
              <h2 className="text-xl font-bold text-white mb-2 font-mono tracking-tight pb-2 border-b border-white/10">
                {title}
              </h2>
            )}
            
            {isUrgentTasks ? (
              <UrgentTasksRenderer body={body} />
            ) : isStudyPriorities ? (
              <StudyPrioritiesRenderer body={body} />
            ) : (
              <div className="prose prose-invert prose-sm text-slate-300 max-w-none mt-4 prose-headings:font-mono prose-headings:text-white prose-a:text-indigo-400">
                <ReactMarkdown components={MarkdownComponents}>{body}</ReactMarkdown>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
