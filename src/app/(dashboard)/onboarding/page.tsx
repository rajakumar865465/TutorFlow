"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TIMEZONES, getDayName } from "@/lib/utils";
import { GraduationCap, Plus, Trash2, ArrowRight, ArrowLeft, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STEPS = ["Profile", "Package", "Availability"];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [saving, setSaving] = useState(false);

  // Step 1: Profile
  const [profile, setProfile] = useState({
    business_name: "",
    phone: "",
    timezone: "America/New_York",
    lesson_type: "both",
    default_lesson_duration: 60,
    cancellation_policy: "24h",
  });

  // Step 2: Package
  const [pkg, setPkg] = useState({
    name: "",
    lesson_count: 4,
    price: "",
    deposit_amount: "",
    lesson_duration: 60,
  });

  // Step 3: Availability
  const [slots, setSlots] = useState<{ day_of_week: number; start_time: string; end_time: string }[]>([]);
  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: "09:00", end_time: "17:00" });

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/tutor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...profile,
          reminder_preferences: { "24h_reminder": true, "same_day_reminder": false, "student_reminder": false },
        }),
      });
      if (!res.ok) throw new Error("Failed to save profile");
      setStep(1);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSavePackage = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/packages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...pkg,
          price: parseFloat(pkg.price) || 0,
          deposit_amount: pkg.deposit_amount ? parseFloat(pkg.deposit_amount) : null,
        }),
      });
      if (!res.ok) throw new Error("Failed to save package");
      setStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = () => {
    if (!slots.some(s => s.day_of_week === newSlot.day_of_week && s.start_time === newSlot.start_time && s.end_time === newSlot.end_time)) {
      setSlots([...slots, { ...newSlot }]);
    }
  };

  const handleSaveAvailability = async () => {
    setSaving(true);
    try {
      for (const slot of slots) {
        await fetch("/api/availability", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...slot, is_recurring: true }),
        });
      }
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const canProceed = () => {
    if (step === 0) return profile.business_name.trim().length > 0;
    if (step === 1) return pkg.name.trim().length > 0 && pkg.price.length > 0;
    return true;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">TutorFlow</span>
          </div>
          <h1 className="text-2xl font-bold">Welcome! Let's set up your account</h1>
          <p className="text-muted-foreground mt-1">This takes about 2 minutes. You can always change these later.</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((label, i) => (
            <div key={label} className="flex-1">
              <div className={`h-2 rounded-full transition-colors ${i <= step ? "bg-primary" : "bg-muted"}`} />
              <p className={`text-xs mt-1 text-center ${i <= step ? "text-primary font-medium" : "text-muted-foreground"}`}>{label}</p>
            </div>
          ))}
        </div>

        {/* Step 1: Profile */}
        {step === 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Profile</CardTitle>
              <CardDescription>This info appears on your booking page and communications.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Business Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. Jane's Math Tutoring" value={profile.business_name} onChange={e => setProfile({ ...profile, business_name: e.target.value })} autoFocus />
              </div>
              <div>
                <Label>Phone</Label>
                <Input placeholder="(555) 123-4567" value={profile.phone} onChange={e => setProfile({ ...profile, phone: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Timezone</Label>
                  <Select value={profile.timezone} onValueChange={v => setProfile({ ...profile, timezone: v ?? "America/New_York" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>{TIMEZONES.map(tz => <SelectItem key={tz} value={tz}>{tz}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Lesson Type</Label>
                  <Select value={profile.lesson_type} onValueChange={v => setProfile({ ...profile, lesson_type: v || "both" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="both">Both</SelectItem>
                      <SelectItem value="in_person">In Person</SelectItem>
                      <SelectItem value="online">Online</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Lesson Duration (min)</Label>
                  <Input type="number" min={15} value={profile.default_lesson_duration} onChange={e => setProfile({ ...profile, default_lesson_duration: parseInt(e.target.value) || 60 })} />
                </div>
                <div>
                  <Label>Cancellation Policy</Label>
                  <Select value={profile.cancellation_policy} onValueChange={v => setProfile({ ...profile, cancellation_policy: v ?? "24h" })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="flexible">Flexible (anytime)</SelectItem>
                      <SelectItem value="24h">24-hour notice</SelectItem>
                      <SelectItem value="48h">48-hour notice</SelectItem>
                      <SelectItem value="strict">Strict (no refunds)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end pt-2">
                <Button onClick={handleSaveProfile} disabled={saving || !canProceed()}>
                  {saving ? "Saving..." : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2: Package */}
        {step === 1 && (
          <Card>
            <CardHeader>
              <CardTitle>Create Your First Package</CardTitle>
              <CardDescription>Packages define what parents book and pay for. You can add more later.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Package Name <span className="text-destructive">*</span></Label>
                <Input placeholder="e.g. 4-Lesson Monthly" value={pkg.name} onChange={e => setPkg({ ...pkg, name: e.target.value })} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Number of Lessons <span className="text-destructive">*</span></Label>
                  <Input type="number" min={1} value={pkg.lesson_count} onChange={e => setPkg({ ...pkg, lesson_count: parseInt(e.target.value) || 1 })} />
                </div>
                <div>
                  <Label>Price ($) <span className="text-destructive">*</span></Label>
                  <Input type="number" min={0} step={0.01} placeholder="200" value={pkg.price} onChange={e => setPkg({ ...pkg, price: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Deposit Amount ($)</Label>
                  <Input type="number" min={0} step={0.01} placeholder="50" value={pkg.deposit_amount} onChange={e => setPkg({ ...pkg, deposit_amount: e.target.value })} />
                </div>
                <div>
                  <Label>Lesson Duration (min)</Label>
                  <Input type="number" min={15} value={pkg.lesson_duration} onChange={e => setPkg({ ...pkg, lesson_duration: parseInt(e.target.value) || 60 })} />
                </div>
              </div>
              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(0)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <Button onClick={handleSavePackage} disabled={saving || !canProceed()}>
                  {saving ? "Saving..." : "Continue"} <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3: Availability */}
        {step === 2 && (
          <Card>
            <CardHeader>
              <CardTitle>Set Your Availability</CardTitle>
              <CardDescription>When are you available for lessons? Parents will see these time slots on your booking page.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-3 items-end">
                <div>
                  <Label>Day</Label>
                  <Select value={String(newSlot.day_of_week)} onValueChange={v => setNewSlot({ ...newSlot, day_of_week: parseInt(v ?? "1") })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>{[0,1,2,3,4,5,6].map(d => <SelectItem key={d} value={String(d)}>{getDayName(d)}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Start</Label>
                  <Input type="time" value={newSlot.start_time} onChange={e => setNewSlot({ ...newSlot, start_time: e.target.value })} className="w-28" />
                </div>
                <div>
                  <Label>End</Label>
                  <Input type="time" value={newSlot.end_time} onChange={e => setNewSlot({ ...newSlot, end_time: e.target.value })} className="w-28" />
                </div>
                <Button onClick={handleAddSlot} size="sm"><Plus className="h-4 w-4 mr-1" /> Add</Button>
              </div>

              {slots.length === 0 ? (
                <p className="text-muted-foreground text-sm py-4">No slots added yet. Add your weekly hours above, or skip this step.</p>
              ) : (
                <div className="space-y-2">
                  {slots.map((slot, i) => (
                    <div key={i} className="flex items-center gap-4 rounded-lg border p-3">
                      <Badge variant="secondary">{getDayName(slot.day_of_week)}</Badge>
                      <span className="text-sm">{slot.start_time} - {slot.end_time}</span>
                      <Button variant="ghost" size="icon" className="ml-auto h-8 w-8" onClick={() => setSlots(slots.filter((_, j) => j !== i))}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex justify-between pt-2">
                <Button variant="ghost" onClick={() => setStep(1)}><ArrowLeft className="mr-2 h-4 w-4" /> Back</Button>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={() => { router.push("/dashboard"); router.refresh(); }}>Skip for now</Button>
                  <Button onClick={handleSaveAvailability} disabled={saving}>
                    {saving ? "Saving..." : "Finish"} <Check className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
