"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { TIMEZONES, CANCELLATION_POLICIES, getDayName } from "@/lib/utils";
import { Copy, Plus, Trash2, Check } from "lucide-react";

const defaultNotificationSettings = {
  email_24h_reminder: true,
  email_same_day_reminder: false,
  email_student_reminder: false,
  email_new_booking: true,
  email_cancellation: true,
  email_payment_received: true,
  email_weekly_summary: false,
  push_enabled: false,
};

const defaultAISettings = {
  auto_generate_summaries: true,
  summary_tone: "professional" as "professional" | "friendly" | "concise",
};

export default function SettingsPage() {
  const [profile, setProfile] = useState<any>(null);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [copied, setCopied] = useState(false);

  const [form, setForm] = useState({
    business_name: "",
    phone: "",
    timezone: "America/New_York",
    lesson_type: "both",
    default_lesson_duration: 60,
    cancellation_policy: "24h",
    reminder_preferences: { "24h_reminder": true, "same_day_reminder": false, "student_reminder": false },
    makeup_policy: "",
    ai_settings: defaultAISettings,
    notification_settings: defaultNotificationSettings,
  });

  const [newSlot, setNewSlot] = useState({ day_of_week: 1, start_time: "09:00", end_time: "17:00" });

  useEffect(() => {
    Promise.all([
      fetch("/api/tutor/profile").then((r) => r.json()),
      fetch("/api/availability").then((r) => r.json()),
    ]).then(([profileData, availData]) => {
      if (profileData.profile) {
        setProfile(profileData.profile);
        setForm({
          business_name: profileData.profile.business_name || "",
          phone: profileData.profile.phone || "",
          timezone: profileData.profile.timezone || "America/New_York",
          lesson_type: profileData.profile.lesson_type || "both",
          default_lesson_duration: profileData.profile.default_lesson_duration || 60,
          cancellation_policy: profileData.profile.cancellation_policy || "24h",
          reminder_preferences: profileData.profile.reminder_preferences || { "24h_reminder": true, "same_day_reminder": false, "student_reminder": false },
          makeup_policy: profileData.profile.makeup_policy || "",
          ai_settings: profileData.profile.ai_settings || defaultAISettings,
          notification_settings: profileData.profile.notification_settings || defaultNotificationSettings,
        });
      }
      setSlots(availData.slots || []);
      setLoading(false);
    });
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch("/api/tutor/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const err = await res.json();
        toast.error(err.error || "Failed to save settings");
        return;
      }
      toast.success("Settings saved successfully");
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddSlot = async () => {
    const res = await fetch("/api/availability", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newSlot, is_recurring: true }),
    });
    if (res.ok) {
      const { slot } = await res.json();
      setSlots((s) => [...s, slot]);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    await fetch(`/api/availability/${id}`, { method: "DELETE" });
    setSlots((s) => s.filter((sl) => sl.id !== id));
  };

  const bookingLink = profile ? `${window.location.origin}/book/${profile.booking_link_slug}` : "";

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading)
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-8 w-48 bg-muted rounded" />
        <div className="h-64 bg-muted rounded-lg" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Settings</h1>

      {/* Booking Link */}
      {profile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Your Booking Link</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm break-all">{bookingLink}</code>
              <Button variant="outline" size="icon" onClick={copyLink}>
                {copied ? <Check className="h-4 w-4 text-green-600" /> : <Copy className="h-4 w-4" />}
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Share this link with parents so they can book lessons.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Profile Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Profile Settings</CardTitle>
          <CardDescription>Your basic business and contact information.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Business Name</Label>
                <Input
                  value={form.business_name}
                  onChange={(e) => setForm({ ...form, business_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Timezone</Label>
                <Select
                  value={form.timezone}
                  onValueChange={(v) => setForm({ ...form, timezone: v ?? "America/New_York" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz} value={tz}>
                        {tz}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Lesson Type</Label>
                <Select
                  value={form.lesson_type}
                  onValueChange={(v) => setForm({ ...form, lesson_type: v || "both" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="both">Both</SelectItem>
                    <SelectItem value="in_person">In Person</SelectItem>
                    <SelectItem value="online">Online</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <Label>Default Lesson Duration (min)</Label>
                <Input
                  type="number"
                  min={15}
                  value={form.default_lesson_duration}
                  onChange={(e) =>
                    setForm({ ...form, default_lesson_duration: parseInt(e.target.value) || 60 })
                  }
                />
              </div>
              <div>
                <Label>Cancellation Policy</Label>
                <Select
                  value={form.cancellation_policy}
                  onValueChange={(v) => setForm({ ...form, cancellation_policy: v ?? "24h" })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANCELLATION_POLICIES.map((p) => (
                      <SelectItem key={p.value} value={p.value}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Cancellation & Makeup Policy */}
            <Separator />
            <div>
              <CardTitle className="text-lg mb-2">Cancellation &amp; Makeup Policy</CardTitle>
              <CardDescription className="mb-4">
                Describe your cancellation, no-show, and makeup lesson policies.
              </CardDescription>
              <div className="space-y-4">
                <div>
                  <Label>Makeup Policy</Label>
                  <Textarea
                    placeholder="e.g., Makeup lessons can be scheduled within 30 days if cancelled with 24h notice. No-shows forfeit the lesson."
                    value={form.makeup_policy}
                    onChange={(e) => setForm({ ...form, makeup_policy: e.target.value })}
                    rows={4}
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Parents will see this on your booking page.
                  </p>
                </div>
              </div>
            </div>

            {/* AI Settings */}
            <Separator />
            <div>
              <CardTitle className="text-lg mb-2">AI Settings</CardTitle>
              <CardDescription className="mb-4">
                Customize how AI features work for your account.
              </CardDescription>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <Label htmlFor="ai-summaries" className="font-medium">
                      Auto-generate session summaries
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      AI generates parent-friendly summaries after each lesson.
                    </p>
                  </div>
                  <Switch
                    id="ai-summaries"
                    checked={form.ai_settings.auto_generate_summaries}
                    onCheckedChange={(v) =>
                      setForm({
                        ...form,
                        ai_settings: { ...form.ai_settings, auto_generate_summaries: v },
                      })
                    }
                  />
                </div>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label>Summary Tone</Label>
                    <Select
                      value={form.ai_settings.summary_tone}
                      onValueChange={(v) =>
                        setForm({
                          ...form,
                          ai_settings: {
                            ...form.ai_settings,
                            summary_tone: v as "professional" | "friendly" | "concise",
                          },
                        })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">Professional</SelectItem>
                        <SelectItem value="friendly">Friendly</SelectItem>
                        <SelectItem value="concise">Concise</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </div>

            {/* Notification Settings */}
            <Separator />
            <div>
              <CardTitle className="text-lg mb-2">Notification Settings</CardTitle>
              <CardDescription className="mb-4">
                Choose which emails and notifications you receive.
              </CardDescription>
              <div className="space-y-4">
                <p className="font-medium text-sm">Lesson Reminders</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-24h">24-hour lesson reminder</Label>
                    <Switch
                      id="ns-24h"
                      checked={form.notification_settings.email_24h_reminder}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_24h_reminder: v,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-sameday">Same-day lesson reminder</Label>
                    <Switch
                      id="ns-sameday"
                      checked={form.notification_settings.email_same_day_reminder}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_same_day_reminder: v,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-student">Student reminder sent to parent</Label>
                    <Switch
                      id="ns-student"
                      checked={form.notification_settings.email_student_reminder}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_student_reminder: v,
                          },
                        })
                      }
                    />
                  </div>
                </div>

                <Separator />

                <p className="font-medium text-sm">Activity Notifications</p>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-booking">New booking confirmation</Label>
                    <Switch
                      id="ns-booking"
                      checked={form.notification_settings.email_new_booking}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_new_booking: v,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-cancel">Lesson cancellation</Label>
                    <Switch
                      id="ns-cancel"
                      checked={form.notification_settings.email_cancellation}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_cancellation: v,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-payment">Payment received</Label>
                    <Switch
                      id="ns-payment"
                      checked={form.notification_settings.email_payment_received}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_payment_received: v,
                          },
                        })
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="ns-weekly">Weekly summary</Label>
                    <Switch
                      id="ns-weekly"
                      checked={form.notification_settings.email_weekly_summary}
                      onCheckedChange={(v) =>
                        setForm({
                          ...form,
                          notification_settings: {
                            ...form.notification_settings,
                            email_weekly_summary: v,
                          },
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>

            <Button type="submit" disabled={saving}>
              {saving ? "Saving..." : "Save Settings"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Weekly Availability */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Weekly Availability</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div>
              <Label>Day</Label>
              <Select
                value={String(newSlot.day_of_week)}
                onValueChange={(v) =>
                  setNewSlot({ ...newSlot, day_of_week: parseInt(v ?? "1") })
                }
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[0, 1, 2, 3, 4, 5, 6].map((d) => (
                    <SelectItem key={d} value={String(d)}>
                      {getDayName(d)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Start</Label>
              <Input
                type="time"
                value={newSlot.start_time}
                onChange={(e) => setNewSlot({ ...newSlot, start_time: e.target.value })}
                className="w-28"
              />
            </div>
            <div>
              <Label>End</Label>
              <Input
                type="time"
                value={newSlot.end_time}
                onChange={(e) => setNewSlot({ ...newSlot, end_time: e.target.value })}
                className="w-28"
              />
            </div>
            <Button onClick={handleAddSlot} size="sm">
              <Plus className="h-4 w-4 mr-1" /> Add
            </Button>
          </div>

          {slots.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              No availability set. Add your weekly hours above.
            </p>
          ) : (
            <div className="space-y-2">
              {slots.map((slot) => (
                <div key={slot.id} className="flex items-center gap-4 rounded-lg border p-3">
                  <Badge variant="secondary">{getDayName(slot.day_of_week)}</Badge>
                  <span className="text-sm">
                    {slot.start_time} - {slot.end_time}
                  </span>
                  {slot.is_blocked && <Badge variant="destructive">Blocked</Badge>}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="ml-auto h-8 w-8"
                    onClick={() => handleDeleteSlot(slot.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
