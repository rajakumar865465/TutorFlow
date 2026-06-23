"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Separator } from "@/components/ui/separator";
import { formatDate, formatTime, formatCurrency } from "@/lib/utils";
import { Pencil, ArrowLeft } from "lucide-react";
import Link from "next/link";

type StudentDetail = {
  student: any;
  packages: any[];
  sessions: any[];
  makeupCredits: any[];
};

export default function StudentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<StudentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState(false);

  const studentId = params.id as string;

  useEffect(() => {
    fetch(`/api/students/${studentId}`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setEditForm(d.student || {});
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [studentId]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch(`/api/students/${studentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      });
      if (res.ok) {
        const { student } = await res.json();
        setData((prev) => prev ? { ...prev, student } : null);
        setEditOpen(false);
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="animate-pulse space-y-4"><div className="h-8 w-48 bg-muted rounded" /><div className="h-64 bg-muted rounded-lg" /></div>;
  }

  if (!data?.student) return <div>Student not found.</div>;

  const { student, packages, sessions, makeupCredits } = data;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/students")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h1 className="text-2xl font-bold">{student.student_name}</h1>
        <Badge variant={student.status === "active" ? "default" : "secondary"}>{student.status}</Badge>
        <div className="ml-auto">
          <Dialog open={editOpen} onOpenChange={setEditOpen}>
            <DialogTrigger render={<Button variant="outline" />}>
              <Pencil className="h-4 w-4 mr-2" /> Edit
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader><DialogTitle>Edit Student</DialogTitle></DialogHeader>
              <form onSubmit={handleSave} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Student Name</Label><Input value={editForm.student_name || ""} onChange={(e) => setEditForm({ ...editForm, student_name: e.target.value })} required /></div>
                  <div><Label>Student Email</Label><Input type="email" value={editForm.student_email || ""} onChange={(e) => setEditForm({ ...editForm, student_email: e.target.value })} /></div>
                </div>
                <div><Label>Student Phone</Label><Input value={editForm.student_phone || ""} onChange={(e) => setEditForm({ ...editForm, student_phone: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div><Label>Parent Name</Label><Input value={editForm.parent_name || ""} onChange={(e) => setEditForm({ ...editForm, parent_name: e.target.value })} /></div>
                  <div><Label>Parent Email</Label><Input type="email" value={editForm.parent_email || ""} onChange={(e) => setEditForm({ ...editForm, parent_email: e.target.value })} /></div>
                </div>
                <div><Label>Parent Phone</Label><Input value={editForm.parent_phone || ""} onChange={(e) => setEditForm({ ...editForm, parent_phone: e.target.value })} /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Lesson Type</Label>
                    <Select value={editForm.lesson_type || "both"} onValueChange={(v) => setEditForm({ ...editForm, lesson_type: v ?? "both" })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="both">Both</SelectItem>
                        <SelectItem value="in_person">In Person</SelectItem>
                        <SelectItem value="online">Online</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div><Label>Duration (min)</Label><Input type="number" value={editForm.default_duration || 60} onChange={(e) => setEditForm({ ...editForm, default_duration: parseInt(e.target.value) || 60 })} /></div>
                </div>
                <div><Label>Notes</Label><Input value={editForm.notes || ""} onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })} /></div>
                <div>
                  <Label>Status</Label>
                  <Select value={editForm.status || "active"} onValueChange={(v) => setEditForm({ ...editForm, status: v ?? "active" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="paused">Paused</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" className="w-full" disabled={saving}>{saving ? "Saving..." : "Save Changes"}</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Contact Info</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {student.student_email && <p>Email: {student.student_email}</p>}
            {student.student_phone && <p>Phone: {student.student_phone}</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Parent Contact</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            {student.parent_name && <p>Name: {student.parent_name}</p>}
            {student.parent_email && <p>Email: {student.parent_email}</p>}
            {student.parent_phone && <p>Phone: {student.parent_phone}</p>}
            {!student.parent_name && !student.parent_email && <p className="text-muted-foreground">No parent contact</p>}
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle className="text-sm text-muted-foreground">Makeup Credits</CardTitle></CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{makeupCredits.filter((m: any) => m.status === "available").length}</p>
            <p className="text-sm text-muted-foreground">available of {makeupCredits.length} total</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sessions">
        <TabsList>
          <TabsTrigger value="sessions">Sessions</TabsTrigger>
          <TabsTrigger value="packages">Packages</TabsTrigger>
          <TabsTrigger value="credits">Makeup Credits</TabsTrigger>
        </TabsList>
        <TabsContent value="sessions" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Package</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sessions.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No sessions yet</TableCell></TableRow>
                  ) : (
                    sessions.map((s: any) => (
                      <TableRow key={s.id}>
                        <TableCell>{formatDate(s.start_time)}</TableCell>
                        <TableCell>{formatTime(s.start_time)}</TableCell>
                        <TableCell><Badge variant={s.status === "completed" ? "default" : s.status === "no_show" ? "destructive" : "secondary"}>{s.status.replace(/_/g, " ")}</Badge></TableCell>
                        <TableCell>{s.session_notes?.[0]?.ai_parent_summary ? "Has summary" : "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="packages" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Package</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Used</TableHead>
                    <TableHead>Remaining</TableHead>
                    <TableHead>Payment</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {packages.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No packages yet</TableCell></TableRow>
                  ) : (
                    packages.map((p: any) => (
                      <TableRow key={p.id}>
                        <TableCell className="font-medium">{p.packages?.name || "Unknown"}</TableCell>
                        <TableCell>{p.total_lessons}</TableCell>
                        <TableCell>{p.used_lessons}</TableCell>
                        <TableCell><Badge variant={p.remaining_lessons <= 2 ? "destructive" : "secondary"}>{p.remaining_lessons}</Badge></TableCell>
                        <TableCell><Badge variant={p.payment_status === "paid" || p.payment_status === "paid_manually" ? "default" : "secondary"}>{p.payment_status}</Badge></TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="credits" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reason</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {makeupCredits.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center py-8 text-muted-foreground">No makeup credits</TableCell></TableRow>
                  ) : (
                    makeupCredits.map((m: any) => (
                      <TableRow key={m.id}>
                        <TableCell>{m.reason}</TableCell>
                        <TableCell><Badge variant={m.status === "available" ? "default" : "secondary"}>{m.status}</Badge></TableCell>
                        <TableCell className="text-sm text-muted-foreground">{formatDate(m.created_at)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">{m.used_at ? formatDate(m.used_at) : "-"}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
