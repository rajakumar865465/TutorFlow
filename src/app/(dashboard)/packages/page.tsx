"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

export default function PackagesPage() {
  const [packages, setPackages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState({ name: "", lesson_count: 4, price: 0, deposit_amount: 0, lesson_duration: 60, makeup_credit_limit: 1 });
  const [submitting, setSubmitting] = useState(false);

  const load = () => {
    fetch("/api/packages").then(r => r.json()).then(d => { setPackages(d.packages || []); setLoading(false); });
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const url = editId ? `/api/packages/${editId}` : "/api/packages";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      if (res.ok) { load(); setDialogOpen(false); setEditId(null); setForm({ name: "", lesson_count: 4, price: 0, deposit_amount: 0, lesson_duration: 60, makeup_credit_limit: 1 }); }
    } finally { setSubmitting(false); }
  };

  const handleDeactivate = async (id: string) => {
    await fetch(`/api/packages/${id}`, { method: "DELETE" });
    load();
  };

  const openEdit = (pkg: any) => {
    setEditId(pkg.id);
    setForm({ name: pkg.name, lesson_count: pkg.lesson_count, price: pkg.price, deposit_amount: pkg.deposit_amount || 0, lesson_duration: pkg.lesson_duration, makeup_credit_limit: pkg.makeup_credit_limit });
    setDialogOpen(true);
  };

  if (loading) return <div><h1 className="text-2xl font-bold mb-6">Packages</h1><div className="animate-pulse space-y-4">{[1,2,3].map(i => <div key={i} className="h-32 bg-muted rounded-lg" />)}</div></div>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Packages</h1>
        <Dialog open={dialogOpen} onOpenChange={(o) => { setDialogOpen(o); if (!o) { setEditId(null); setForm({ name: "", lesson_count: 4, price: 0, deposit_amount: 0, lesson_duration: 60, makeup_credit_limit: 1 }); }}}>
          <DialogTrigger render={<Button />}><Plus className="h-4 w-4 mr-2" /> Add Package</DialogTrigger>
          <DialogContent>
            <DialogHeader><DialogTitle>{editId ? "Edit Package" : "Add Package"}</DialogTitle></DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">
              <div><Label>Package Name *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Number of Lessons *</Label><Input type="number" min={1} value={form.lesson_count} onChange={e => setForm({ ...form, lesson_count: parseInt(e.target.value) || 1 })} required /></div>
                <div><Label>Price ($) *</Label><Input type="number" min={0} step={0.01} value={form.price} onChange={e => setForm({ ...form, price: parseFloat(e.target.value) || 0 })} required /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Deposit Amount ($)</Label><Input type="number" min={0} step={0.01} value={form.deposit_amount} onChange={e => setForm({ ...form, deposit_amount: parseFloat(e.target.value) || 0 })} /></div>
                <div><Label>Lesson Duration (min)</Label><Input type="number" min={15} value={form.lesson_duration} onChange={e => setForm({ ...form, lesson_duration: parseInt(e.target.value) || 60 })} /></div>
              </div>
              <div><Label>Makeup Credit Limit</Label><Input type="number" min={0} value={form.makeup_credit_limit} onChange={e => setForm({ ...form, makeup_credit_limit: parseInt(e.target.value) || 0 })} /></div>
              <Button type="submit" className="w-full" disabled={submitting}>{submitting ? "Saving..." : editId ? "Update Package" : "Create Package"}</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {packages.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No packages yet. Create your first lesson package!</CardContent></Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {packages.map((pkg) => (
            <Card key={pkg.id} className={!pkg.is_active ? "opacity-60" : ""}>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{pkg.name}</CardTitle>
                  <Badge variant={pkg.is_active ? "default" : "secondary"}>{pkg.is_active ? "Active" : "Inactive"}</Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                <p className="text-2xl font-bold">{formatCurrency(pkg.price)}</p>
                {pkg.deposit_amount && <p className="text-sm text-muted-foreground">Deposit: {formatCurrency(pkg.deposit_amount)}</p>}
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span>{pkg.lesson_count} lessons</span>
                  <span>{pkg.lesson_duration} min</span>
                  <span>{pkg.makeup_credit_limit} makeup</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEdit(pkg)}><Pencil className="h-3 w-3 mr-1" /> Edit</Button>
                  {pkg.is_active && <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeactivate(pkg.id)}><Trash2 className="h-3 w-3 mr-1" /> Deactivate</Button>}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
