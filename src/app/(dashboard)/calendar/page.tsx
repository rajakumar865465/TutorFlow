"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatTime } from "@/lib/utils";
import { startOfWeek, addDays, format, isSameDay, parseISO } from "date-fns";

type Session = {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  students: { student_name: string } | null;
};

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalendarPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 0 }));

  useEffect(() => {
    const start = currentWeekStart.toISOString();
    const end = addDays(currentWeekStart, 7).toISOString();
    fetch(`/api/sessions?start=${start}&end=${end}`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [currentWeekStart]);

  const prevWeek = () => setCurrentWeekStart(addDays(currentWeekStart, -7));
  const nextWeek = () => setCurrentWeekStart(addDays(currentWeekStart, 7));

  const getSessionsForDay = (day: Date) =>
    sessions.filter(s => isSameDay(parseISO(s.start_time), day));

  const statusColor = (status: string) => {
    switch (status) {
      case "completed": return "default";
      case "no_show": return "destructive";
      case "canceled_by_parent":
      case "canceled_by_tutor": return "secondary";
      default: return "outline";
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={prevWeek}>Previous</Button>
          <span className="text-sm font-medium px-2">
            {format(currentWeekStart, "MMM d")} - {format(addDays(currentWeekStart, 6), "MMM d, yyyy")}
          </span>
          <Button variant="outline" size="sm" onClick={nextWeek}>Next</Button>
        </div>
      </div>

      {loading ? (
        <div className="animate-pulse grid grid-cols-7 gap-2">{[1,2,3,4,5,6,7].map(i => <div key={i} className="h-64 bg-muted rounded-lg" />)}</div>
      ) : (
        <div className="grid grid-cols-7 gap-2">
          {DAYS.map((dayName, i) => {
            const day = addDays(currentWeekStart, i);
            const daySessions = getSessionsForDay(day);
            const isToday = isSameDay(day, new Date());

            return (
              <div key={dayName} className={`rounded-lg border ${isToday ? "border-primary bg-primary/5" : "bg-card"}`}>
                <div className={`text-center py-2 border-b ${isToday ? "bg-primary text-primary-foreground" : "bg-muted"}`}>
                  <p className="text-xs font-medium">{dayName}</p>
                  <p className="text-lg font-bold">{format(day, "d")}</p>
                </div>
                <div className="p-1 space-y-1 min-h-[200px]">
                  {daySessions.map(s => (
                    <div key={s.id} className="rounded p-1.5 text-xs bg-accent hover:bg-accent/80 cursor-pointer">
                      <p className="font-medium">{formatTime(s.start_time)}</p>
                      <p className="truncate">{s.students?.student_name || "Unknown"}</p>
                      <Badge variant={statusColor(s.status) as any} className="text-[10px] px-1 py-0 mt-0.5">
                        {s.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
