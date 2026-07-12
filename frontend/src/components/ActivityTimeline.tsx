import React from 'react';
import { Calendar, User, FileText, CheckCircle2, History } from 'lucide-react';

interface TimelineEvent {
  id: string;
  date: string;
  action: string;
  user: string;
  notes?: string;
}

interface ActivityTimelineProps {
  events: TimelineEvent[];
}

export function ActivityTimeline({ events }: ActivityTimelineProps) {
  if (!events || events.length === 0) {
    return (
      <div className="text-center py-6 text-sm text-gray-500 dark:text-zinc-400 flex flex-col items-center justify-center gap-2">
        <History className="w-8 h-8 text-gray-350 dark:text-zinc-600" />
        <p>No activity history logged for this record.</p>
      </div>
    );
  }

  // Sort events chronologically (newest first)
  const sortedEvents = [...events].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {sortedEvents.map((event, idx) => {
          const isLast = idx === sortedEvents.length - 1;
          
          let icon = <FileText className="w-4 h-4 text-gray-500" />;
          let iconBg = 'bg-gray-100 dark:bg-zinc-800 border-gray-250 dark:border-zinc-700';

          const actionLower = event.action.toLowerCase();
          if (actionLower.includes('register')) {
            icon = <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />;
            iconBg = 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-250 dark:border-emerald-900/30';
          } else if (actionLower.includes('allocate') || actionLower.includes('assigned')) {
            icon = <User className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />;
            iconBg = 'bg-indigo-50 dark:bg-indigo-950/20 border-indigo-250 dark:border-indigo-900/30';
          } else if (actionLower.includes('maintenance')) {
            icon = <Calendar className="w-4 h-4 text-amber-600 dark:text-amber-400" />;
            iconBg = 'bg-amber-50 dark:bg-amber-950/20 border-amber-250 dark:border-amber-900/30';
          }

          return (
            <li key={event.id}>
              <div className="relative pb-8">
                {/* Connector Line */}
                {!isLast && (
                  <span
                    className="absolute top-5 left-5 -ml-px h-full w-0.5 bg-gray-200 dark:bg-zinc-850"
                    aria-hidden="true"
                  />
                )}
                
                <div className="relative flex items-start space-x-3.5">
                  {/* Timeline Badge */}
                  <div className={`relative flex items-center justify-center w-10 h-10 rounded-lg border ${iconBg}`}>
                    {icon}
                  </div>
                  
                  {/* Event Text */}
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-semibold text-gray-800 dark:text-zinc-150 flex flex-wrap items-center justify-between gap-x-2">
                      <span>{event.action}</span>
                      <span className="text-xs font-normal text-gray-400 dark:text-zinc-500">{event.date}</span>
                    </div>
                    <div className="mt-1 text-xs text-gray-500 dark:text-zinc-400">
                      by <span className="font-semibold text-gray-650 dark:text-zinc-300">{event.user}</span>
                    </div>
                    {event.notes && (
                      <p className="mt-2 text-xs leading-relaxed text-gray-600 dark:text-zinc-400 bg-gray-50 dark:bg-zinc-850/50 p-2.5 rounded-lg border border-gray-100 dark:border-zinc-800/80">
                        {event.notes}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default ActivityTimeline;
