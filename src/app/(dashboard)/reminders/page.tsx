"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate, formatDateTime } from "@/lib/utils";
import { Send } from "lucide-react";

export default function RemindersPage() {
  const [reminders, setReminders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    fetch("/api/reminders")
      .then(r => r.json())
      .then(d => setReminders(d.reminders || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendDue = async () => {
    setSending(true);
    try {
      const res = await fetch("/api/reminders/send", { method: "POST" });
      const data = await res.json();
      alert(`Sent: ${data.sent}, Failed: ${data.failed}`);
      // Refresh
      fetch("/api/reminders").then(r => r.json()).then(d => setReminders(d.reminders || []));
    } finally { setSending(false); }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Reminders</h1>
        <Button onClick={handleSendDue} disabled={sending}>
          <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "Send Due Reminders"}
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Recipient</TableHead>
                <TableHead>Scheduled</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Sent At</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : reminders.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No reminders yet</TableCell></TableRow>
              ) : (
                reminders.map(r => (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium">{r.students?.student_name || "-"}</TableCell>
                    <TableCell><Badge variant="secondary">{r.reminder_type.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-sm">{r.recipient_email}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{formatDateTime(r.scheduled_for)}</TableCell>
                    <TableCell>
                      <Badge variant={r.status === "sent" ? "default" : r.status === "failed" ? "destructive" : "secondary"}>{r.status}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{r.sent_at ? formatDateTime(r.sent_at) : "-"}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
