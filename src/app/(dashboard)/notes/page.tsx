"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Send } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default function NotesPage() {
  const [notes, setNotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/notes")
      .then(r => r.json())
      .then(d => setNotes(d.notes || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSendToParent = async (noteId: string) => {
    setSending(noteId);
    try {
      const res = await fetch("/api/notes/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note_id: noteId }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes(notes.map(n => n.id === noteId ? { ...n, sent_to_parent: true, sent_at: new Date().toISOString() } : n));
      } else {
        alert(data.error || "Failed to send summary to parent");
      }
    } finally {
      setSending(null);
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Session Notes</h1>
      {loading ? (
        <div className="animate-pulse space-y-4">{[1, 2, 3].map(i => <div key={i} className="h-20 bg-muted rounded-lg" />)}</div>
      ) : notes.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No session notes yet. Mark a session as completed and add notes from the Sessions page.</CardContent></Card>
      ) : (
        <div className="space-y-4">
          {notes.map((note: any) => (
            <Card key={note.id}>
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{note.students?.student_name || "Unknown Student"}</CardTitle>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{note.sessions?.start_time ? formatDate(note.sessions.start_time) : ""}</span>
                    {note.ai_parent_summary && !note.sent_to_parent && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSendToParent(note.id)}
                        disabled={sending === note.id}
                      >
                        <Send className="h-3 w-3 mr-1" />
                        {sending === note.id ? "Sending..." : "Send to Parent"}
                      </Button>
                    )}
                    {note.sent_to_parent && (
                      <Badge variant="default" className="text-xs">Sent</Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {note.private_note && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Private Notes</p>
                    <p className="text-sm">{note.private_note}</p>
                  </div>
                )}
                {note.ai_parent_summary && (
                  <div className="bg-accent p-3 rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">Parent Summary</p>
                    <p className="text-sm">{note.ai_parent_summary}</p>
                  </div>
                )}
                {note.homework && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Homework</p>
                    <p className="text-sm">{note.homework}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
