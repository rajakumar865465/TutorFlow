"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { formatDate, formatTime } from "@/lib/utils";
import { Check, XCircle, UserX, Pencil, Send } from "lucide-react";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("scheduled");
  const [noteSessionId, setNoteSessionId] = useState<string | null>(null);
  const [noteForm, setNoteForm] = useState({ private_note: "", ai_parent_summary: "", homework: "" });
  const [generating, setGenerating] = useState(false);

  const load = () => {
    fetch(`/api/sessions?status=${statusFilter}`)
      .then(r => r.json())
      .then(d => setSessions(d.sessions || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [statusFilter]);

  const handleComplete = async (id: string) => {
    await fetch(`/api/sessions/${id}/complete`, { method: "POST" });
    load();
  };

  const handleNoShow = async (id: string) => {
    await fetch(`/api/sessions/${id}/no-show`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ counts_against_package: true }) });
    load();
  };

  const handleCancel = async (id: string) => {
    await fetch(`/api/sessions/${id}/cancel`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ canceled_by: "tutor", reason: "", counts_against_package: false, create_makeup_credit: true }) });
    load();
  };

  const handleGenerateSummary = async (sessionId: string) => {
    setGenerating(true);
    try {
      const res = await fetch("/api/ai/generate-session-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionId, private_note: noteForm.private_note }),
      });
      const data = await res.json();
      if (data.note?.ai_parent_summary) {
        setNoteForm(f => ({ ...f, ai_parent_summary: data.note.ai_parent_summary }));
      }
    } finally { setGenerating(false); }
  };

  const [saving, setSaving] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSaveNote = async (sessionId: string) => {
    setSaving(true);
    try {
      // Upsert session note
      const existing = sessions.find(s => s.id === sessionId)?.session_notes?.[0];
      if (existing) {
        await fetch(`/api/notes`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: existing.id, private_note: noteForm.private_note, ai_parent_summary: noteForm.ai_parent_summary, homework: noteForm.homework }),
        });
      } else {
        const res = await fetch("/api/ai/generate-session-summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionId, private_note: noteForm.private_note }),
        });
        const data = await res.json();
        if (data.note) {
          // Update the summary and homework if user edited them
          if (noteForm.ai_parent_summary !== data.note.ai_parent_summary || noteForm.homework) {
            await fetch(`/api/notes`, {
              method: "PUT",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ id: data.note.id, ai_parent_summary: noteForm.ai_parent_summary, homework: noteForm.homework }),
            });
          }
        }
      }
      load();
      setNoteSessionId(null);
    } finally { setSaving(false); }
  };

  const handleSendToParent = async () => {
    if (!noteSessionId) return;
    const existing = sessions.find(s => s.id === noteSessionId)?.session_notes?.[0];
    if (!existing) return;

    setSending(true);
    try {
      const res = await fetch("/api/notes/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: existing.id }),
      });
      const data = await res.json();
      if (data.success) {
        load();
        setNoteSessionId(null);
      } else {
        alert(data.error || "Failed to send summary to parent");
      }
    } finally { setSending(false); }
  };

  const openNotes = (session: any) => {
    const existing = session.session_notes?.[0];
    setNoteForm({ private_note: existing?.private_note || "", ai_parent_summary: existing?.ai_parent_summary || "", homework: existing?.homework || "" });
    setNoteSessionId(session.id);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Sessions</h1>
        <Select value={statusFilter} onValueChange={v => setStatusFilter(v ?? "scheduled")}>
          <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="canceled_by_parent">Canceled (Parent)</SelectItem>
            <SelectItem value="canceled_by_tutor">Canceled (Tutor)</SelectItem>
            <SelectItem value="no_show">No Show</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8">Loading...</TableCell></TableRow>
              ) : sessions.length === 0 ? (
                <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">No sessions found</TableCell></TableRow>
              ) : (
                sessions.map(s => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.students?.student_name || "Unknown"}</TableCell>
                    <TableCell>{formatDate(s.start_time)}</TableCell>
                    <TableCell>{formatTime(s.start_time)}</TableCell>
                    <TableCell><Badge variant={s.status === "completed" ? "default" : s.status === "no_show" ? "destructive" : "secondary"}>{s.status.replace(/_/g, " ")}</Badge></TableCell>
                    <TableCell className="text-sm text-muted-foreground">{s.students?.parent_name || "-"}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {s.status === "scheduled" && (
                          <>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleComplete(s.id)} title="Complete"><Check className="h-4 w-4 text-green-600" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCancel(s.id)} title="Cancel"><XCircle className="h-4 w-4 text-yellow-600" /></Button>
                            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleNoShow(s.id)} title="No Show"><UserX className="h-4 w-4 text-red-600" /></Button>
                          </>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openNotes(s)} title="Notes"><Pencil className="h-4 w-4" /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={!!noteSessionId} onOpenChange={() => setNoteSessionId(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Session Notes</DialogTitle></DialogHeader>
          <div className="space-y-4 mt-2">
            <div>
              <Label>Private Tutor Notes</Label>
              <Textarea value={noteForm.private_note} onChange={e => setNoteForm({ ...noteForm, private_note: e.target.value })} rows={4} placeholder="Write your rough notes here..." />
            </div>
            <Button variant="outline" size="sm" onClick={() => noteSessionId && handleGenerateSummary(noteSessionId)} disabled={generating || !noteForm.private_note}>
              {generating ? "Generating..." : "Generate AI Parent Summary"}
            </Button>
            <div>
              <Label>Parent-Facing Summary (editable)</Label>
              <Textarea value={noteForm.ai_parent_summary} onChange={e => setNoteForm({ ...noteForm, ai_parent_summary: e.target.value })} rows={3} />
            </div>
            <div>
              <Label>Homework</Label>
              <Input value={noteForm.homework} onChange={e => setNoteForm({ ...noteForm, homework: e.target.value })} placeholder="Optional homework assignment" />
            </div>
            <div className="flex gap-2">
              <Button onClick={() => noteSessionId && handleSaveNote(noteSessionId)} disabled={saving}>{saving ? "Saving..." : "Save Note"}</Button>
              {(() => {
                const existing = sessions.find(s => s.id === noteSessionId)?.session_notes?.[0];
                if (existing?.ai_parent_summary && !existing?.sent_to_parent) {
                  return (
                    <Button variant="outline" onClick={handleSendToParent} disabled={sending}>
                      <Send className="h-4 w-4 mr-2" /> {sending ? "Sending..." : "Send to Parent"}
                    </Button>
                  );
                }
                if (existing?.sent_to_parent) {
                  return <span className="text-sm text-green-600 self-center">Sent to parent</span>;
                }
                return null;
              })()}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
