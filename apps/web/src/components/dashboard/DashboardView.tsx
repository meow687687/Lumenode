import React, { useRef, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  Download, 
  Upload, 
  RotateCcw, 
  BookOpen 
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

  // 3. Real Active Learning Paths / Treatises
  const activeLearningPaths = useMemo(() => {
    const romanNumerals = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII'];
    return SUBJECTS.map((subject, idx) => {
      const subjectLessons = LESSONS.filter(l => {
        const c = CONCEPTS.find(concept => concept.id === l.conceptId);
        return c?.subjectId === subject.id;
      });
      const doneCount = subjectLessons.filter(l => completedLessons.has(l.id)).length;
      const totalCount = subjectLessons.length;
      const percent = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
      return {
        subject,
        roman: romanNumerals[idx] || (idx + 1).toString(),
        lessonsCount: totalCount,
        completedCount: doneCount,
        percent,
      };
    });
  }, [completedLessons]);

  // 4. Learning Chronometry / Weekly Consistency
  const rhythmDays = useMemo(() => {
    const today = new Date();
    const currentDayOfWeek = today.getDay();
    const mondayOffset = (currentDayOfWeek + 6) % 7;
    const monday = new Date(today);
    monday.setDate(today.getDate() - mondayOffset);
    monday.setHours(0, 0, 0, 0);

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

  // 5. Recent Scholarly Activity
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
    downloadAnchor.setAttribute('download', `lumenode-monograph-backup-${new Date().toISOString().slice(0, 10)}.json`);
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



  return (
    <div className="w-full max-w-[1240px] mx-auto py-4 sm:py-8 px-2 sm:px-6 space-y-8">
      {/* 1. Monograph Folio Orientation Header */}
      <section className="border-b border-[var(--border)] pb-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[var(--accent)] text-[11px] font-sans font-bold uppercase tracking-[0.16em] mb-2">
            <span>&sect; DISCIPLINE &bull; FOUNDATIONS OF COMPUTATION</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-normal italic text-[var(--text)] tracking-tight">
            Make room for a new idea.
          </h1>
          <p className="text-sm sm:text-base text-[var(--text-2)] font-serif mt-2 max-w-2xl">
            A little progress, consistently made, becomes deep understanding.
          </p>
        </div>
        <div className="font-mono text-[11px] text-[var(--muted)] hidden sm:block whitespace-nowrap">
          {new Date().toLocaleDateString('en-US', { weekday: 'long' }).toUpperCase()} &bull; FOLIO LEDGER
        </div>
      </section>

      {/* Main Two-Column Monograph Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1.75fr)_minmax(320px,0.95fr)] gap-7 items-start">
        {/* Left Column: Treatises & Active Inquiries */}
        <div className="grid gap-7 min-w-0">
          {/* 2. Dominant Continue Learning Paper Card */}
          <article 
            className="rounded border border-[var(--border)] bg-[var(--surface)] p-6 sm:p-8 relative overflow-hidden shadow-[var(--shadow)]"
            style={{
              borderTop: '3px solid var(--accent)'
            }}
          >
            <div className="flex items-center gap-2 text-[var(--accent)] font-sans text-[10px] font-bold tracking-widest uppercase mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>CONTINUE LEARNING &bull; {currentSubject.title}</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_200px] gap-6 items-center">
              <div className="space-y-3">
                <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[var(--text)] tracking-tight leading-snug">
                  {currentLesson.title.split(':')[0]}
                </h2>
                <p className="text-sm text-[var(--text-2)] leading-relaxed max-w-xl font-serif">
                  {currentLesson.summary}
                </p>

                {/* Progress bar in current treatise */}
                <div className="space-y-1.5 max-w-xs pt-1 font-sans">
                  <div className="flex items-center justify-between text-[11px] font-mono text-[var(--text-2)]">
                    <span>Treatise completion</span>
                    <span>{currentSubjectProgressPct}%</span>
                  </div>
                  <div 
                    className="h-1.5 w-full bg-[var(--surface-3)] rounded overflow-hidden"
                    role="progressbar"
                    aria-label={`Progress in ${currentSubject.title}`}
                    aria-valuenow={currentSubjectProgressPct}
                    aria-valuemin={0}
                    aria-valuemax={100}
                  >
                    <div 
                      className="h-full bg-[var(--accent)] transition-all duration-300"
                      style={{ width: `${currentSubjectProgressPct}%` }}
                    />
                  </div>
                </div>

                <div className="pt-3 font-sans">
                  <button
                    onClick={() => navigate(`/lessons/${currentLesson.id}`)}
                    className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded bg-[var(--accent)] hover:bg-[var(--accent-strong)] text-[#141619] font-bold text-xs uppercase tracking-wider cursor-pointer transition shadow-sm"
                    aria-label={`Resume lesson: ${currentLesson.title}`}
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{completedLessons.has(currentLesson.id) ? 'Review Chapter' : 'Resume Chapter'}</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </button>
                </div>
              </div>

              {/* Monograph Memory Apparatus Diagram */}
              <div 
                className="hidden md:flex flex-col items-center justify-center p-3 rounded bg-[var(--surface-2)] border border-[var(--border)] relative"
                aria-label="Treatise diagram preview"
              >
                <svg viewBox="0 0 200 130" className="w-full max-w-[180px] h-auto overflow-visible" role="img">
                  <title>Concept pointer apparatus</title>
                  <defs>
                    <linearGradient id="academicGrad" x1="0" x2="1" y1="0" y2="1">
                      <stop stopColor="var(--accent)" />
                      <stop offset="1" stopColor="var(--border-strong)" />
                    </linearGradient>
                  </defs>
                  <path d="M40 65 C70 65 75 30 110 30 S140 65 165 65" fill="none" stroke="var(--accent)" strokeWidth="1.5" strokeDasharray="3 3" opacity="0.8" />
                  <path d="M40 75 C70 75 80 105 125 105" fill="none" stroke="var(--cyan)" strokeWidth="1.4" strokeDasharray="3 3" opacity="0.8" />
                  <rect x="10" y="45" width="55" height="40" rx="3" fill="url(#academicGrad)" />
                  <text x="37.5" y="62" fill="#141619" textAnchor="middle" fontSize="8" fontFamily="ui-monospace, monospace">ptr</text>
                  <text x="37.5" y="75" fill="#141619" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">0x24</text>
                  
                  <rect x="110" y="10" width="70" height="38" rx="3" fill="var(--surface-3)" stroke="var(--accent)" strokeOpacity="0.8" strokeWidth="1" />
                  <text x="145" y="24" fill="var(--accent)" textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace">ADDRESS</text>
                  <text x="145" y="38" fill="var(--text)" textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace">0x24</text>
                  
                  <rect x="125" y="85" width="70" height="38" rx="3" fill="var(--surface-3)" stroke="var(--cyan)" strokeOpacity="0.8" strokeWidth="1" />
                  <text x="160" y="99" fill="var(--cyan)" textAnchor="middle" fontSize="7" fontFamily="ui-monospace, monospace">VALUE</text>
                  <text x="160" y="113" fill="var(--text)" textAnchor="middle" fontSize="11" fontWeight="700" fontFamily="ui-monospace, monospace">42</text>
                </svg>
                <span className="text-[8px] font-mono text-[var(--muted)] mt-2 uppercase tracking-widest">
                  FIG. 1 &bull; POINTER ARCHITECTURE
                </span>
              </div>
            </div>
          </article>

          {/* 3. Three Monograph Metrics (Triptych) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Learning metrics summary">
            <article className="p-5 rounded bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] text-center">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--accent)] tracking-tight">
                {demonstratedMasteryCount}
              </div>
              <div className="font-sans text-[11px] font-semibold text-[var(--text)] uppercase tracking-wider mt-1">
                Concepts Mastered
              </div>
              <div className="text-[10px] text-[var(--muted)] font-serif mt-0.5">
                of {CONCEPTS.length} canonical proofs
              </div>
            </article>

            <article className="p-5 rounded bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] text-center">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--amber)] tracking-tight">
                {reviewDueCount}
              </div>
              <div className="font-sans text-[11px] font-semibold text-[var(--text)] uppercase tracking-wider mt-1">
                Review Urgency
              </div>
              <div className="text-[10px] text-[var(--muted)] font-serif mt-0.5">
                {reviewDueCount === 0 ? 'All concepts fresh' : 'Scheduled for retention refresh'}
              </div>
            </article>

            <article className="p-5 rounded bg-[var(--surface)] border border-[var(--border)] shadow-[var(--shadow)] text-center">
              <div className="font-serif text-3xl sm:text-4xl font-bold text-[var(--text)] tracking-tight">
                {completedLessons.size} <span className="text-lg font-normal text-[var(--muted)] font-serif">/ {LESSONS.length}</span>
              </div>
              <div className="font-sans text-[11px] font-semibold text-[var(--text)] uppercase tracking-wider mt-1">
                Curriculum Progress
              </div>
              <div className="text-[10px] text-[var(--muted)] font-serif mt-0.5">
                {overallCompletionPct}% total syllabus finished
              </div>
            </article>
          </div>

          {/* 4. Active Theoretical Treatises */}
          <article 
            className="rounded border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
            style={{ borderTop: '3px solid var(--accent)' }}
          >
            <div className="flex items-center justify-between mb-5">
              <div>
                <span className="font-sans text-[10px] text-[var(--accent)] font-bold tracking-widest uppercase">SYLLABUS</span>
                <h2 className="text-xl font-serif font-bold text-[var(--text)]">Active Theoretical Treatises</h2>
                <p className="text-xs text-[var(--muted)] font-serif mt-0.5">Sequential computational disciplines and proofs.</p>
              </div>
              <Link 
                to="/explore" 
                className="font-sans text-xs font-semibold text-[var(--accent)] hover:text-[var(--text)] transition inline-flex items-center gap-1"
              >
                <span>All Treatises</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>

            <div className="divide-y divide-[var(--border)]" role="list" aria-label="Curricula treatises">
              {activeLearningPaths.map(({ subject, roman, lessonsCount, percent, completedCount }) => (
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
                  className="py-3 px-2 flex items-center justify-between hover:bg-[var(--surface-hover)] rounded transition cursor-pointer group"
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
                  <div className="flex items-center gap-3.5 min-w-0 pr-3">
                    <span className="w-6 text-center font-serif font-bold text-[var(--accent)] text-sm shrink-0">
                      {roman}.
                    </span>
                    <div className="min-w-0">
                      <div className="font-serif font-bold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition truncate">
                        {subject.title}
                      </div>
                      <div className="font-sans text-[11px] text-[var(--muted)] truncate">
                        {subject.description} &bull; {lessonsCount} chapters
                      </div>
                    </div>
                  </div>
                  <div className="text-right shrink-0 font-sans">
                    <div className="text-[11px] font-mono text-[var(--accent)]">
                      {percent}% [{completedCount}/{lessonsCount}]
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </article>
        </div>

        {/* Right Column: Chronometry, Academic Evidence & Recommended Inquiries */}
        <aside className="grid gap-7 min-w-0 font-sans" aria-label="Monograph chronometry and recommendations">
          {/* 5. Chronometry Study Rhythm */}
          <article 
            className="rounded border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
            style={{ borderTop: '3px solid var(--accent)' }}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">CHRONOMETRY</span>
                <h2 className="text-lg font-serif font-bold text-[var(--text)]">Study Rhythm</h2>
              </div>
              <span className="text-xs font-mono text-[var(--accent)] font-bold">
                {rhythmDays.completedDaysThisWeek} DAYS
              </span>
            </div>
            <p className="text-xs text-[var(--muted)] font-serif mt-1">
              Recorded participation for the current calendar cycle.
            </p>

            {/* 7-Day Calendar Strip */}
            <div className="grid grid-cols-7 gap-1.5 mt-4 text-center font-mono" aria-label="Weekly study schedule">
              {rhythmDays.days.map((d, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1 text-[10px] text-[var(--muted)]">
                  <span>{d.label}</span>
                  <div 
                    className={`w-7 h-7 rounded border flex items-center justify-center text-xs transition ${
                      d.isDone
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)] text-[var(--accent)] font-bold'
                        : d.isToday
                        ? 'border-[var(--accent)] text-[var(--accent)] font-bold'
                        : 'border-[var(--border)] text-transparent'
                    }`}
                    title={`${d.dateStr}: ${d.isDone ? 'Activity recorded' : 'No activity'}`}
                  >
                    {d.isDone ? '✓' : d.isToday ? '&bull;' : ''}
                  </div>
                </div>
              ))}
            </div>
          </article>

          {/* 6. Recent Academic Milestones */}
          <article 
            className="rounded border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
            style={{ borderTop: '3px solid var(--accent)' }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">EVIDENCE LOG</span>
                <h2 className="text-lg font-serif font-bold text-[var(--text)]">Recent Milestones</h2>
              </div>
              <span className="text-[10px] font-mono text-[var(--muted)]">EVAL</span>
            </div>

            {recentActivities.length === 0 ? (
              <div className="py-6 text-center space-y-1">
                <p className="text-xs text-[var(--muted)] font-serif">No exercise attempts logged yet.</p>
                <p className="text-[10px] text-[var(--subtle)]">Complete a chapter assessment to log evidence.</p>
              </div>
            ) : (
              <div className="space-y-3" role="list">
                {recentActivities.map(({ attempt, conceptTitle }, idx) => (
                  <div key={idx} className="border-b border-[var(--border)] pb-2.5 last:border-0 last:pb-0 text-xs" role="listitem">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm font-semibold text-[var(--text)] truncate">
                        {attempt.passed ? 'Demonstrated: ' : 'Attempted: '}{conceptTitle}
                      </span>
                      <span className="font-mono text-[10px] text-[var(--accent)] shrink-0 ml-2">
                        {attempt.score}%
                      </span>
                    </div>
                    <div className="font-mono text-[10px] text-[var(--muted)] mt-0.5">
                      {formatTimeAgo(attempt.timestamp)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </article>

          {/* 7. Recommended Next Inquiries */}
          <article 
            className="rounded border border-[var(--border)] bg-[var(--surface)] p-6 shadow-[var(--shadow)]"
            style={{ borderTop: '3px solid var(--accent)' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <span className="text-[10px] font-bold text-[var(--accent)] uppercase tracking-widest">GUIDANCE</span>
                <h2 className="text-lg font-serif font-bold text-[var(--text)]">Next Inquiry</h2>
              </div>
              <span className="text-[var(--accent)] font-serif font-bold text-sm">&sect;</span>
            </div>

            {recommendations.length === 0 ? (
              <div className="py-4 text-center text-xs text-[var(--muted)] font-serif">
                You are on track across the active treatises.
              </div>
            ) : (
              <div className="divide-y divide-[var(--border)]">
                {recommendations.slice(0, 3).map((rec) => {
                  const targetLessonId = rec.suggestedLessonId || currentLesson.id;
                  return (
                    <div
                      key={rec.id}
                      onClick={() => navigate(`/lessons/${targetLessonId}`)}
                      className="py-3 first:pt-1 last:pb-1 cursor-pointer group"
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
                      <div className="font-serif font-bold text-sm text-[var(--text)] group-hover:text-[var(--accent)] transition">
                        {rec.conceptTitle}
                      </div>
                      <p className="text-[11px] text-[var(--muted)] leading-relaxed mt-1 font-serif">
                        {rec.reason}
                      </p>
                      <div className="text-[10px] font-sans font-semibold text-[var(--accent)] inline-flex items-center gap-1 mt-1.5">
                        <span>Begin Reading</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </article>
        </aside>
      </div>

      {/* Local-First Monograph Preservation Section */}
      <section 
        className="p-6 rounded bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 shadow-[var(--shadow)] font-sans"
        aria-label="Local-first data management"
      >
        <div className="space-y-1">
          <h3 className="text-sm font-serif font-bold text-[var(--text)]">
            Offline Preservation &amp; Zero-PII Ledger
          </h3>
          <p className="text-xs text-[var(--muted)] font-serif">
            All proofs, mastery records, and reading bookmarks remain on your local device.
          </p>
          {importStatus && (
            <p className="text-xs font-mono text-[var(--accent)] mt-1">{importStatus}</p>
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
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-2)] rounded text-xs font-mono transition border border-[var(--border)] cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Backup</span>
          </button>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[var(--surface-2)] hover:bg-[var(--surface-hover)] text-[var(--text-2)] rounded text-xs font-mono transition border border-[var(--border)] cursor-pointer"
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
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-[color-mix(in_srgb,var(--rose)_12%,transparent)] hover:bg-[color-mix(in_srgb,var(--rose)_20%,transparent)] text-[var(--rose)] rounded text-xs font-mono transition border border-[color-mix(in_srgb,var(--rose)_30%,transparent)] cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>
        </div>
      </section>

      {/* Monograph Colophon Footer */}
      <footer className="text-center pt-2 pb-6 text-xs text-[var(--subtle)] font-serif">
        Lumenode &bull; An Open Computer Science Compendium &bull; Volume I &bull; 2026
      </footer>
    </div>
  );
};
