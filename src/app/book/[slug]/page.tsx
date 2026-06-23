"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { GraduationCap, Check } from "lucide-react";
import { formatCurrency, formatDate, formatTime } from "@/lib/utils";
import { loadStripe } from "@stripe/stripe-js";

export default function BookingPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [tutor, setTutor] = useState<any>(null);
  const [packages, setPackages] = useState<any[]>([]);
  const [slots, setSlots] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedPackage, setSelectedPackage] = useState<string>("");
  const [selectedSlot, setSelectedSlot] = useState<string>("");
  const [recurring, setRecurring] = useState(false);
  const [form, setForm] = useState({ student_name: "", student_email: "", parent_name: "", parent_email: "", parent_phone: "" });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch(`/api/public/${slug}`).then(r => r.json()),
      fetch(`/api/public/${slug}/availability`).then(r => r.json()),
    ]).then(([tutorData, availData]) => {
      setTutor(tutorData.tutor);
      setPackages(tutorData.packages || []);
      setSlots(availData.slots || []);
      setLoading(false);
    });
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSubmitting(true);

    try {
      const res = await fetch(`/api/public/${slug}/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          package_id: selectedPackage,
          start_time: selectedSlot,
          ...form,
          recurring,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Booking failed");
        setSubmitting(false);
        return;
      }

      // If payment is required, redirect to Stripe
      if (data.requires_payment) {
        const checkoutRes = await fetch("/api/payments/create-checkout-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            package_id: selectedPackage,
            student_id: data.booking.student_id,
            student_package_id: data.booking.student_package_id,
            booking_slug: slug,
          }),
          credentials: "include",
        });

        const checkoutData = await checkoutRes.json();

        if (checkoutData.url) {
          window.location.href = checkoutData.url;
          return;
        }
      }

      // No payment required, show confirmation
      window.location.href = `/book/${slug}/confirmation`;
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // Group slots by date
  const slotsByDate = slots.reduce((acc: Record<string, any[]>, slot: any) => {
    const date = slot.date || new Date(slot.start_time).toISOString().split("T")[0];
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!tutor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <GraduationCap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Tutor Not Found</h2>
            <p className="text-muted-foreground">This booking link is invalid or the tutor profile doesn't exist.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-lg mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <GraduationCap className="h-10 w-10 text-primary mx-auto mb-2" />
          <h1 className="text-2xl font-bold">Book with {tutor.name}</h1>
          {tutor.business_name && tutor.business_name !== tutor.name && (
            <p className="text-muted-foreground">{tutor.business_name}</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Select Package */}
          <Card>
            <CardHeader><CardTitle className="text-lg">1. Choose a Package</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {packages.map(pkg => (
                <label key={pkg.id} className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${selectedPackage === pkg.id ? "border-primary bg-primary/5" : "hover:bg-muted/50"}`}>
                  <input type="radio" name="package" value={pkg.id} checked={selectedPackage === pkg.id} onChange={() => setSelectedPackage(pkg.id)} className="mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{pkg.name}</p>
                    <p className="text-sm text-muted-foreground">{pkg.lesson_count} lessons &middot; {pkg.lesson_duration} min each</p>
                    <p className="font-bold mt-1">{formatCurrency(pkg.price)}{pkg.deposit_amount ? ` (Deposit: ${formatCurrency(pkg.deposit_amount)})` : ""}</p>
                  </div>
                </label>
              ))}
            </CardContent>
          </Card>

          {/* Select Time */}
          <Card>
            <CardHeader><CardTitle className="text-lg">2. Select a Time</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(slotsByDate).map(([date, dateSlots]: [string, any]) => (
                <div key={date}>
                  <p className="font-medium text-sm mb-2">{formatDate(date)}</p>
                  <div className="flex flex-wrap gap-2">
                    {dateSlots.map((slot: any) => (
                      <Button
                        key={slot.start_time}
                        type="button"
                        variant={selectedSlot === slot.start_time ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedSlot(slot.start_time)}
                      >
                        {formatTime(slot.start_time)}
                      </Button>
                    ))}
                  </div>
                </div>
              ))}
              {Object.keys(slotsByDate).length === 0 && (
                <p className="text-muted-foreground text-sm">No available times. Please check back later.</p>
              )}
              <div className="flex items-center gap-2 pt-2">
                <Checkbox id="recurring" checked={recurring} onCheckedChange={(v) => setRecurring(v as boolean)} />
                <Label htmlFor="recurring" className="text-sm">Make this a recurring weekly lesson</Label>
              </div>
            </CardContent>
          </Card>

          {/* Contact Info */}
          <Card>
            <CardHeader><CardTitle className="text-lg">3. Your Information</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div><Label>Student Name *</Label><Input value={form.student_name} onChange={e => setForm({ ...form, student_name: e.target.value })} required /></div>
              <div><Label>Student Email</Label><Input type="email" value={form.student_email} onChange={e => setForm({ ...form, student_email: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><Label>Parent Name *</Label><Input value={form.parent_name} onChange={e => setForm({ ...form, parent_name: e.target.value })} required /></div>
                <div><Label>Parent Email *</Label><Input type="email" value={form.parent_email} onChange={e => setForm({ ...form, parent_email: e.target.value })} required /></div>
              </div>
              <div><Label>Parent Phone</Label><Input value={form.parent_phone} onChange={e => setForm({ ...form, parent_phone: e.target.value })} /></div>
            </CardContent>
          </Card>

          {error && <p className="text-destructive text-sm">{error}</p>}

          <Button type="submit" className="w-full" size="lg" disabled={submitting || !selectedPackage || !selectedSlot}>
            {submitting ? "Processing..." : "Book Now"}
          </Button>
        </form>

        <p className="text-center text-xs text-muted-foreground">Powered by TutorFlow</p>
      </div>
    </div>
  );
}
