import React, { useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  Terminal, 
  Cpu, 
  Code2, 
  Network, 
  Layers, 
  Boxes, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Award,
  Download,
  Upload,
  RotateCcw,
  BookOpen,
  TrendingUp,
  Clock
} from 'lucide-react';
import { SUBJECTS } from '../../data/subjects';
import { LESSONS } from '../../data/lessons';
import { CONCEPTS } from '../../data/concepts';
import { useProgress } from '../../context/ProgressContext';
import { ExerciseAttempt } from '@lumenode/shared-types';

export const DashboardView: React.FC = () => {
  const { 
    completedLessons, 
    activeLessonId, 
    masteryRecords, 
    recommendations, 
    exportBackup, 
    importBackup, 
    resetAllProgress 
  } = useProgress();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  // 1. Current Lesson for Continue Learning Card
  const currentLesson = useMemo(() => {
    return LESSONS.find(l => l.id === activeLessonId) || LESSONS[0];
  }, [activeLessonId]);

  const currentConcept = useMemo(() => {
    return CONCEPTS.find(c => c.id === currentLesson.conceptId);
  }, [currentLesson]);

  const currentSubject = useMemo(() => {
    const subjectId = currentConcept?.subjectId;
    return SUBJECTS.find(s => s.id === subjectId) || SUBJECTS[0];
  }, [currentConcept]);

  // Real lesson progress in current subject (derived through canonical concepts)
  const currentSubjectLessons = useMemo(() => {
    return LESSONS.filter(l => {
      const c = CONCEPTS.find(concept => concept.id === l.conceptId);
      return c?.subjectId === currentSubject.id;
    });
  }, [currentSubject]);

  const currentSubjectCompletedCount = useMemo(() => {
    return currentSubjectLessons.filter(l => completedLessons.has(l.id)).length;
  }, [currentSubjectLessons, completedLessons]);

  const currentSubjectProgressPct = useMemo(() => {
    if (currentSubjectLessons.length === 0) return 0;
    return Math.round((currentSubjectCompletedCount / currentSubjectLessons.length) * 100);
  }, [currentSubjectCompletedCount, currentSubjectLessons]);

  // 2. Metrics (strictly backed by real state)
  const demonstratedMasteryCount = useMemo(() => {
    return Object.values(masteryRecords).filter(
      r => r.achievementLevel === 'mastered' || r.state === 'demonstrated'
    ).length;
  }, [masteryRecords]);

  const reviewDueCount = useMemo(() => {
    return Object.values(masteryRecords).filter(
      r => r.retentionStatus === 'due' || r.retentionStatus === 'overdue' || r.state === 'needs_review'
    ).length;
  }, [masteryRecords]);

  // Overall lesson completion percentage
  const overallCompletionPct = useMemo(() => {
    if (LESSONS.length === 0) return 0;
    return Math.round((completedLessons.size / LESSONS.length) * 100);
  }, [completedLessons]);

  // 3. Real Active Learning Paths
  const activeLearningPaths = useMemo(() => {
    return SUBJECTS.map(subject => {
      const subjectLessons = LESSONS.filter(l => {
        const c = CONCEPTS.find(concept => concept.id === l.conceptId);
        return c?.subjectId === subject.id;
      });
      const doneCount = subjectLessons.filter(l => completedLessons.has(l.id)).length;
      const totalCount = subjectLessons.length;
      const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      return {
        subject,
        lessonsCount: totalCount,
        completedCount: doneCount,
        percent,
      };
    });
  }, [completedLessons]);

  // 4. Learning Rhythm (Weekly Consistency based on genuine evidence timestamps)
  const rhythmDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay(); // 0 is Sunday, 1 is Monday...
    // Start of current week (Monday)
    const mondayOffset = (currentDayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

    // Collect timestamps of verified learner actions
    const activeDates = new Set<string>();
    Object.values(masteryRecords).forEach(record => {
      if (record.demonstratedAt) {
        const d = new Date(record.demonstratedAt);
        activeDates.add(d.toISOString().slice(0, 10));
      }
      if (record.lastAttemptAt) {
        const d = new Date(record.lastAttemptAt);
        activeDates.add(d.toISOString().slice(0, 10));
      }
      record.evidenceHistory?.forEach(att => {
        if (att.timestamp) {
          const d = new Date(att.timestamp);
          activeDates.add(d.toISOString().slice(0, 10));
        }
      });
    });

    const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((label, index) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + index);
      const dateStr = d.toISOString().slice(0, 10);
      const isToday = dateStr === today.toISOString().slice(0, 10);
      const isDone = activeDates.has(dateStr);
      return {
        label,
        dateStr,
        isToday,
        isDone,
      };
    });

    const completedDaysThisWeek = days.filter(d => d.isDone).length;
    return { days, completedDaysThisWeek };
  }, [masteryRecords]);

  // 5. Recent Activity (strictly from evidence history)
  const recentActivities = useMemo(() => {
    const attemptsWithConcept: Array<{
      attempt: ExerciseAttempt;
      conceptTitle: string;
      lessonTitle?: string;
    }> = [];

    Object.values(masteryRecords).forEach(record => {
      const concept = CONCEPTS.find(c => c.id === record.conceptId);
      const lesson = LESSONS.find(l => l.conceptId === record.conceptId);
      record.evidenceHistory?.forEach(att => {
        attemptsWithConcept.push({
          attempt: att,
          conceptTitle: concept?.title || record.conceptId,
          lessonTitle: lesson?.title.split(':')[0],
        });
      });
    });

    attemptsWithConcept.sort((a, b) => b.attempt.timestamp - a.attempt.timestamp);
    return attemptsWithConcept.slice(0, 4);
  }, [masteryRecords]);

  // Formatter for relative activity time
  const formatTimeAgo = (timestamp: number) => {
    const diffSec = Math.floor((Date.now() - timestamp) / 1000);
    if (diffSec < 60) return 'JUST NOW';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m AGO`;
    const diffHours = Math.floor(diffMin / 60);
    if (diffHours < 24) return `${diffHours}h AGO`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return 'YESTERDAY';
    return `${diffDays}d AGO`;
  };

  const handleExportBackup = () => {
    const snapshot = exportBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(snapshot, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `lumenode-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const res = importBackup(text);
        if (res.success) {
          setImportStatus('Backup restored successfully!');
          setTimeout(() => setImportStatus(null), 3000);
        } else {
          setImportStatus(`Import failed: ${res.error}`);
        }
      } catch {
        setImportStatus('Failed reading backup file');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const getSubjectIcon = (iconName: string) => {
    switch (iconName) {
      case 'Terminal': return <Terminal className="w-5 h-5 text-[var(--accent)]" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-[var(--cyan)]" />;
      case 'Code2': return <Code2 className="w-5 h-5 text-[var(--green)]" />;
      case 'Network': return <Network className="w-5 h-5 text-[var(--accent)]" />;
      case 'Layers': return <Layers className="w-5 h-5 text-[var(--amber)]" />;
      case 'Boxes': return <Boxes className="w-5 h-5 text-[var(--rose)]" />;
      case 'Database': return <Database className="w-5 h-5 text-[var(--green)]" />;
      default: return <Terminal className="w-5 h-5 text-[var(--accent)]" />;
    }
  };

  return (
    <div className="w-full max-w-[1320px] mx-auto py-2 sm:py-6 px-1 sm:px-4 space-y-7">
      {/* 1. Orientation Heading */}
      <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2">
        <div>
          <div className="flex items-center gap-2 text-[var(--accent)] text-[10px] font-bold uppercase tracking-[0.14em] mb-2">
            <span className="w-4 h-[1px] bg-[var(--accent)]" aria-hidden="true" />
            <span>YOUR LEARNING SPACE</span>
          </div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[var(--text)] tracking-tight">
            Make room for a new idea.
          </h1>
          <p className="text-xs sm:text-sm text-[var(--muted)] mt-1">
            A little progress, consistently made, becomes deep understanding.
          </p>
        </div>
        <div className="text-[10px] font-mono text-[var(--muted)] hidden sm:block whitespace-nowrap">
          {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} · OVERVIEW
        </div>
      </section>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.65fr)_minmax(300px,0.9fr)] gap-5 items-start">
        {/* Left Column: Primary Learning Flow */}
        <div className="grid gap-5 min-w-0">
          {/* 2. Dominant Continue Learning Hero Card */}
          <article 
            className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-7 relative overflow-hidden shadow-[var(--shadow)]"
            style={{
              background: 'linear-gradient(116deg, var(--surface) 0%, var(--surface) 58%, color-mix(in srgb, var(--accent-soft) 78%, var(--surface)) 100%)'
            }}
          >
            {/* Background Decorative Rings */}
            <div 
              className="absolute -top-36 -right-10 w-64 h-64 rounded-full border border-[var(--border-strong)] pointer-events-none opacity-40"
              style={{
                boxShadow: '0 0 0 24px color-mix(in srgb, var(--accent) 3%, transparent), 0 0 0 48px color-mix(in srgb, var(--accent) 2%, transparent)'
              }}
              aria-hidden="true"
            />

            <div className="relative z-10 flex items-center gap-2 text-[var(--muted)] text-[10px] font-bold tracking-wider uppercase mb-3">
              <span className="w-6 h-6 rounded-lg bg-[var(--accent-soft)] text-[var(--accent)] flex items-center justify-center">
                <BookOpen className="w-3.5 h-3.5" />
              </span>
              <span>CONTINUE LEARNING · {currentSubject.title}</span>
            </div>

            <div className="relative z-10 grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] gap-6 items-center">
              <div className="space-y-3">
                <h2 className="text-xl sm:text-2xl font-extrabold text-[var(--text)] tracking-tight leading-snug">
                  {currentLesson.title.split(':')[0]}
                </h2>
                <p className="text-xs sm:text-sm text-[var(--text-2)] leading-relaxed max-w-xl">
                  {currentLesson.summary}
                </p>

                {/* Progress in current course */}
                <div className="space-y-1.5 max-w-xs pt-1">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-2)]">
                    <span>Course progress</span>
                    <span>{currentSubjectProgressPct}%</span>
                  </div>
                  <div 
                    className="h-1.5 w-full bg-[var(--surface-3)] rounded-full overflow-hidden"
                    role="progressbar"
                    aria-label={`Progress in ${currentSubject.title}`}
                    aria-valuenow={currentSubjectProgressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div 
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${currentSubjectProgressPct}%`,
                        background: 'linear-gradient(90deg, var(--accent-strong), #a7baff)'
                      }}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    onClick={() => navigate(`/lessons/${currentLesson.id}`)}
                    className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-xl bg-[var(--accent-strong)] hover:opacity-95 text-white text-xs font-bold shadow-md cursor-pointer transition transform hover:-translate-y-0.5"
                    aria-label={`Resume lesson: ${currentLesson.title}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{completedLessons.has(currentLesson.id) ? 'Review lesson' : 'Resume lesson'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                  </button>
                </div>
              </div>

              {/* Concept Art / Diagram */}
              <div 
                className="hidden md:flex flex-col items-center justify-center p-3 rounded-2xl bg-[var(--surface-2)]/60 border border-[var(--border)] relative"
                aria-label="Concept diagram preview"
              >
                <svg viewBox="0 0 200 130" className="w-full max-w-[180px] h-auto overflow-visible" role="img">
                  <title>Concept visualization model</title>
                  <defs>
                    <linearGradient id="nodeGrad" x1="0" y1="0" x2="1" y2="1">
                      <stop stopColor="var(--accent)" />
                      <stop offset="1" stopColor="var(--accent-strong)" />
                    </linearGradient>
                  </defs>
                  <path d="M40 65 C70 65 75 30 110 30 S140 65 165 65" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                  <path d="M40 75 C70 75 80 105 125 105" fill="none" stroke="var(--cyan)" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.8" />
                  <rect x="10" y="45" width="55" height="40" rx="8" fill="url(#nodeGrad)" />
                  <text x="37.5" y="62" fill="#142044" textAnchor="middle" fontSize="8" fontFamily="ui-monospace, monospace">ptr</text>
                  <text x="37.5" y="75" fill="#142044" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">0x24</text>
                  
                  <rect x="110" y="10" width="70" height="38" rx="8" fill="var(--surface-3)" stroke="var(--accent)" strokeOpacity="0.8" strokeWidth="1" />
                  <text x="145" y="24" fill="var(--accent)" textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace">ADDRESS</text>
                  <text x="145" y="38" fill="var(--text)" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace">0x24</text>
                  
                  <rect x="125" y="85" width="70" height="38" rx="8" fill="var(--surface-3)" stroke="var(--cyan)" strokeOpacity="0.8" strokeWidth="1" />
                  <text x="160" y="99" fill="var(--cyan)" textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace">VALUE</text>
                  <text x="160" y="113" fill="var(--text)" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">42</text>
                </svg>
                <span className="text-[8px] font-mono text-[var(--muted)] mt-2 uppercase tracking-widest">
                  ILLUSTRATIVE POINTER MODEL
                </span>
              </div>
            </div>
          </article>

          {/* 3. Three Compact Learning Metrics (Real Data Only) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5" aria-label="Learning metrics summary">
            {/* Metric 1: Demonstrated Mastery */}
            <article className="p-4 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Concepts Mastered</span>
                <span className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--green)] flex items-center justify-center">
                  <Award className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[var(--text)] tracking-tight">
                  {demonstratedMasteryCount}
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  of {CONCEPTS.length} canonical concepts
                </div>
              </div>
            </article>

            {/* Metric 2: Review Due (Kept distinct from achievement) */}
            <article className="p-4 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Review Urgency</span>
                <span className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--amber)] flex items-center justify-center">
                  <Clock className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[var(--text)] tracking-tight">
                  {reviewDueCount}
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  {reviewDueCount === 0 ? 'All concepts fresh' : 'Scheduled for retention refresh'}
                </div>
              </div>
            </article>

            {/* Metric 3: Curriculum Progress */}
            <article className="p-4 rounded-[16px] bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] flex flex-col justify-between">
              <div className="flex items-center justify-between text-[11px] text-[var(--muted)]">
                <span>Curriculum Progress</span>
                <span className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--accent)] flex items-center justify-center">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                </span>
              </div>
              <div className="mt-3">
                <div className="text-2xl font-bold font-mono text-[var(--text)] tracking-tight">
                  {completedLessons.size} <span className="text-xs font-normal text-[var(--muted)]">/ {LESSONS.length}</span>
                </div>
                <div className="text-[10px] text-[var(--muted)] mt-0.5">
                  {overallCompletionPct}% total syllabus finished
                </div>
              </div>
            </article>
          </div>

          {/* 4. Active Learning Paths with Real Progress */}
          <article className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 sm:p-6 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] tracking-tight">Your learning paths</h2>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">A clear route through the topics you are exploring.</p>
              </div>
              <Link 
                to="/explore" 
                className="text-[11px] font-semibold text-[var(--accent)] hover:text-[var(--text)] transition inline-flex items-center gap-1"
              >
                <span>All paths</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="space-y-1.5" role="list" aria-label="Learning paths catalog">
              {activeLearningPaths.map(({ subject, lessonsCount, percent, completedCount }) => (
                <div
                  key={subject.id}
                  onClick={() => {
                    const firstSubLesson = LESSONS.find(l => {
                      const c = CONCEPTS.find(concept => concept.id === l.conceptId);
                      return c?.subjectId === subject.id;
                    });
                    if (firstSubLesson) {
                      navigate(`/lessons/${firstSubLesson.id}`);
                    } else {
                      navigate('/explore');
                    }
                  }}
                  className="grid grid-cols-[36px_minmax(0,1fr)_90px] items-center gap-3 p-2.5 rounded-xl hover:bg-[var(--surface-hover)] transition cursor-pointer group"
                  role="listitem"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      const firstSubLesson = LESSONS.find(l => {
                        const c = CONCEPTS.find(concept => concept.id === l.conceptId);
                        return c?.subjectId === subject.id;
                      });
                      if (firstSubLesson) navigate(`/lessons/${firstSubLesson.id}`);
                    }
                  }}
                  aria-label={`${subject.title}: ${percent}% complete, ${completedCount} of ${lessonsCount} lessons finished`}
                >
                  <div className="w-9 h-9 rounded-xl bg-[var(--accent-soft)] flex items-center justify-center shrink-0">
                    {getSubjectIcon(subject.icon)}
                  </div>
                  <div className="min-w-0 pr-2">
                    <div className="text-xs font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition truncate">
                      {subject.title}
                    </div>
                    <div className="text-[10px] text-[var(--muted)] truncate mt-0.5">
                      {subject.description} · {lessonsCount} lessons
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-[var(--text-2)] mb-1">
                      {percent}%
                    </div>
                    <div 
                      className="h-1 w-full bg-[var(--surface-3)] rounded-full overflow-hidden"
                      role="progressbar"
                      aria-valuenow={percent}
                      aria-valuemin={0}
                      aria-valuemax={100}
                    >
                      <div 
                        className="h-full bg-[var(--accent)] rounded-full transition-all duration-300"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column: Consistency, History & Recommended Next Steps */}
        <aside className="grid gap-5 min-w-0" aria-label="Learning rhythm and suggestions">
          {/* 5. Learning Rhythm (Weekly Consistency) */}
          <article 
            className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]"
            style={{
              background: 'linear-gradient(135deg, var(--surface), color-mix(in srgb, var(--amber) 7%, var(--surface)))'
            }}
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] tracking-tight">Your rhythm</h2>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Small steps add up.</p>
              </div>
              <span className="w-8 h-8 rounded-xl bg-[color-mix(in_srgb,var(--amber)_14%,transparent)] text-[var(--amber)] flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </span>
            </div>

            <div className="flex items-baseline justify-between mt-3.5">
              <div className="text-2xl font-bold font-mono text-[var(--text)] tracking-tight">
                {rhythmDays.completedDaysThisWeek}{' '}
                <span className="text-xs font-sans font-semibold text-[var(--muted)]">
                  {rhythmDays.completedDaysThisWeek === 1 ? 'day active' : 'days active'}
                </span>
              </div>
              <span className="text-[10px] text-[var(--muted)] font-mono">THIS WEEK</span>
            </div>

            {/* 7-Day Rhythm Dots */}
            <div className="grid grid-cols-7 gap-1.5 mt-4" aria-label="Weekly study schedule">
              {rhythmDays.days.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5 text-[9px] font-mono text-[var(--muted)]">
                  <span>{d.label}</span>
                  <div 
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border transition ${
                      d.isDone
                        ? 'bg-[color-mix(in_srgb,var(--amber)_18%,transparent)] text-[var(--amber)] border-[color-mix(in_srgb,var(--amber)_45%,transparent)] font-bold'
                        : d.isToday
                        ? 'border-[var(--amber)] text-[var(--amber)] font-bold'
                        : 'border-[var(--border-strong)] text-transparent'
                    }`}
                    title={`${d.dateStr}: ${d.isDone ? 'Activity recorded' : 'No activity'}`}
                  >
                    {d.isDone ? '✓' : d.isToday ? '•' : ''}
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* 6. Recent Learning Activity */}
          <article className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between mb-3.5">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] tracking-tight">Recent activity</h2>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Your latest learning moments.</p>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">EVIDENCE</span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs text-[var(--muted)]">No exercise attempts logged yet.</p>
                <p className="text-[10px] text-[var(--subtle)]">Take an assessment or complete a lesson quiz to see history.</p>
              </div>
            ) : (
              <div className="space-y-3" role="list">
                {recentActivities.map(({ attempt, conceptTitle }, idx) => (
                  <div key={idx} className="grid grid-cols-[28px_minmax(0,1fr)] gap-2.5 items-start text-xs" role="listitem">
                    <div className="w-7 h-7 rounded-lg bg-[var(--surface-2)] text-[var(--cyan)] flex items-center justify-center shrink-0">
                      {attempt.passed ? <CheckCircle2 className="w-3.5 h-3.5 text-[var(--green)]" /> : <Clock className="w-3.5 h-3.5 text-[var(--amber)]" />}
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-[var(--text-2)] leading-tight">
                        {attempt.passed ? 'Demonstrated ' : 'Attempted '}
                        <strong className="text-[var(--text)] font-semibold">{conceptTitle}</strong>
                      </div>
                      <div className="text-[9px] font-mono text-[var(--muted)] mt-0.5">
                        {formatTimeAgo(attempt.timestamp)} · SCORE {attempt.score}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* 7. Recommended Next Steps with Explicit Reason */}
          <article className="rounded-[22px] border border-[var(--border)] bg-[var(--surface)] p-5 shadow-[var(--shadow)]">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h2 className="text-sm font-bold text-[var(--text)] tracking-tight">A good next step</h2>
                <p className="text-[11px] text-[var(--muted)] mt-0.5">Transparent algorithmic guidance.</p>
              </div>
              <span className="text-[var(--accent)] text-sm font-bold">✦</span>
            </div>

            {recommendations.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--muted)]">
                You are on track! Explore any new subject from the catalog.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recommendations.slice(0, 3).map((rec) => {
                  const targetLessonId = rec.suggestedLessonId || currentLesson.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/lessons/${targetLessonId}`)}
                      className="py-3 first:pt-1 last:pb-1 flex items-start gap-2.5 cursor-pointer group"
                      tabIndex={0}
                      role="button"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          navigate(`/lessons/${targetLessonId}`);
                        }
                      }}
                      aria-label={`Recommendation: ${rec.conceptTitle}. Reason: ${rec.reason}`}
                    >
                      <span 
                        className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                          rec.urgency === 'high' ? 'bg-[var(--amber)]' : 'bg-[var(--accent)]'
                        }`} 
                        aria-hidden="true"
                      />
                      <div className="min-w-0 flex-1">
                        <div className="text-xs font-semibold text-[var(--text)] group-hover:text-[var(--accent)] transition">
                          {rec.conceptTitle}
                        </div>
                        <p className="text-[10px] text-[var(--muted)] leading-relaxed mt-0.5">
                          {rec.reason}
                        </p>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[var(--muted)] group-hover:text-[var(--accent)] group-hover:translate-x-0.5 transition shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </aside>
      </div>

      {/* Local-First Storage & Data Portability Controls */}
      <section 
        className="p-5 rounded-[18px] bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[var(--shadow)]"
        aria-label="Local-first data management"
      >
        <div className="space-y-1">
          <h3 className="text-xs sm:text-sm font-semibold text-[var(--text)]">
            Local-First Storage & Zero-PII Data Portability
          </h3>
          <p className="text-[11px] text-[var(--muted)]">
            All your mastery state, bookmarks, and quiz progress stay locally in your browser. Export or restore backups at any time.
          </p>
          {importStatus && (
            <p className="text-[11px] font-mono text-[var(--accent)] mt-1">{importStatus}</p>
          )}
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImportFile}
            accept=".json,application/json"
            className="hidden"
            aria-label="Import JSON learner backup"
          />
          <button
            onClick={handleExportBackup}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-2)] rounded-lg text-xs font-mono transition border border-[var(--border)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-2)] rounded-lg text-xs font-mono transition border border-[var(--border)] cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import Backup</span>
          </button>
          <button
            onClick={() => {
              if (window.confirm('Reset all progress, mastery records, and bookmarks?')) {
                resetAllProgress();
              }
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[color-mix(in_srgb,var(--rose)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--rose)_20%,transparent)] text-[var(--rose)] rounded-lg text-xs font-mono transition border border-[color-mix(in_srgb,var(--rose)_30%,transparent)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </section>

      {/* Quiet Footer Note */}
      <footer className="text-center pt-2 pb-4 text-[10px] text-[var(--subtle)]">
        Lumenode · Explore. Understand. Build. · Free & Open-Source Computer Science Education
      </footer>
    </div>
  );
};
