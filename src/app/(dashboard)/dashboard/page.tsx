"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Calendar,
  Users,
  CreditCard,
  Package,
  FileText,
  AlertTriangle,
  Clock,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { formatTime, formatDate, formatCurrency } from "@/lib/utils";

type DashboardData = {
  todaySessions: any[];
  upcomingSessions: any[];
  pendingPayments: any[];
  lowPackages: any[];
  recentNotes: any[];
  makeupCredits: any[];
  alerts: any[];
  stats: { totalStudents: number; totalSessionsThisWeek: number };
};

export default function DashboardPage() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/tutor/profile")
      .then((r) => r.json())
      .then((p) => {
        if (!p.profile) {
          router.replace("/onboarding");
          return;
        }
        return fetch("/api/tutor/dashboard").then((r) => r.json());
      })
      .then((d) => { if (d) setData(d); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="h-20 animate-pulse bg-muted rounded" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return <div>Failed to load dashboard data.</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Link href="/students">
          <Button>Add Student</Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.totalStudents}</p>
                <p className="text-sm text-muted-foreground">Active Students</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.todaySessions?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Today's Sessions</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.stats.totalSessionsThisWeek}</p>
                <p className="text-sm text-muted-foreground">Sessions This Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{data.pendingPayments?.length || 0}</p>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(data.lowPackages?.length > 0 || data.makeupCredits?.length > 0 || data.alerts?.length > 0) && (
        <div className="space-y-3">
          {data.lowPackages?.map((pkg: any) => (
            <Alert key={pkg.id}>
              <Package className="h-4 w-4" />
              <AlertDescription>
                <strong>{pkg.students?.student_name}</strong> has only <strong>{pkg.remaining_lessons} lessons</strong> remaining in "{pkg.packages?.name}"
                <Link href="/packages" className="ml-2 text-primary underline text-sm">View packages</Link>
              </AlertDescription>
            </Alert>
          ))}
          {data.makeupCredits?.slice(0, 3).map((mc: any) => (
            <Alert key={mc.id} variant="default">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <strong>{mc.students?.student_name}</strong> has an available makeup credit
              </AlertDescription>
            </Alert>
          ))}
          {data.alerts?.map((s: any) => (
            <Alert key={s.id} variant="destructive">
              <UserX className="h-4 w-4" />
              <AlertDescription>
                {s.status === "no_show" ? "No-show" : "Canceled"}: <strong>{s.students?.student_name}</strong> on {formatDate(s.start_time)}
              </AlertDescription>
            </Alert>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Today's Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Today's Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.todaySessions?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No sessions today</p>
            ) : (
              <div className="space-y-3">
                {data.todaySessions?.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{session.students?.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatTime(session.start_time)} - {formatTime(session.end_time)}
                      </p>
                    </div>
                    <Badge variant={session.status === "completed" ? "default" : "secondary"}>
                      {session.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Sessions */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Upcoming Sessions</CardTitle>
          </CardHeader>
          <CardContent>
            {data.upcomingSessions?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No upcoming sessions</p>
            ) : (
              <div className="space-y-3">
                {data.upcomingSessions?.map((session: any) => (
                  <div key={session.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium">{session.students?.student_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(session.start_time)} at {formatTime(session.start_time)}
                      </p>
                    </div>
                    <Link href={`/sessions?id=${session.id}`}>
                      <Button variant="ghost" size="sm">View</Button>
                    </Link>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Recent Notes
              <Link href="/notes">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.recentNotes?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No notes yet</p>
            ) : (
              <div className="space-y-3">
                {data.recentNotes?.map((note: any) => (
                  <div key={note.id} className="rounded-lg border p-3">
                    <p className="font-medium text-sm">{note.students?.student_name}</p>
                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                      {note.private_note || note.ai_parent_summary || "No content"}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Payments */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              Pending Payments
              <Link href="/payments">
                <Button variant="ghost" size="sm">View all</Button>
              </Link>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {data.pendingPayments?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No pending payments</p>
            ) : (
              <div className="space-y-3">
                {data.pendingPayments?.map((payment: any) => (
                  <div key={payment.id} className="flex items-center justify-between rounded-lg border p-3">
                    <div>
                      <p className="font-medium text-sm">{payment.students?.student_name}</p>
                      <p className="text-sm text-muted-foreground">{formatCurrency(payment.amount)}</p>
                    </div>
                    <Badge variant={payment.status === "failed" ? "destructive" : "secondary"}>
                      {payment.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
