"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  GraduationCap,
  Calendar,
  CreditCard,
  FileText,
  Bell,
  Sparkles,
  Users,
  Star,
  TrendingUp,
  Clock,
  Shield,
  Zap,
  ArrowRight,
  Check,
  Play,
  Menu,
  ChevronRight,
  Quote,
} from "lucide-react";
import Image from "next/image";

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Pricing", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

const FEATURES = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description:
      "Set your availability in minutes. Share your booking link with parents. Recurring lessons, 24h availability updates, and timezone awareness built in.",
  },
  {
    icon: CreditCard,
    title: "Lesson Packages",
    description:
      "Create prepaid lesson bundles, collect deposits via Stripe, track remaining credits automatically, and get renewal alerts before they run out.",
  },
  {
    icon: FileText,
    title: "Session Notes",
    description:
      "Write quick notes after each session. Generate polished, parent-friendly AI summaries with one click. Track weekly progress at a glance.",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description:
      "Booking confirmations, lesson reminders, and renewal prompts sent automatically via email. Never chase a parent for a follow-up again.",
  },
  {
    icon: Sparkles,
    title: "AI Parent Updates",
    description:
      "Turn your rough session notes into professional, polished parent summaries. Save hours each week and keep families fully in the loop.",
  },
  {
    icon: Shield,
    title: "Flexible Payments",
    description:
      "Accept Stripe payments online or mark Venmo, Zelle, Cash, or Bank Transfer. Full support for make-up credits and partial refunds.",
  },
];

const HOW_IT_WORKS_STEPS = [
  {
    step: 1,
    icon: Users,
    title: "Add Students",
    description:
      "Import or manually add your students. Set up their contact details and lesson preferences in seconds.",
  },
  {
    step: 2,
    icon: Calendar,
    title: "Schedule Lessons",
    description:
      "Set your weekly availability and share your custom booking link. Parents book directly without endless back-and-forth.",
  },
  {
    step: 3,
    icon: CreditCard,
    title: "Get Paid",
    description:
      "Sell lesson packages, collect online payments via Stripe, or log cash and Venmo. Track everything in one clean ledger.",
  },
  {
    step: 4,
    icon: Sparkles,
    title: "Send AI Reports",
    description:
      "Write quick session notes, then generate polished, parent-ready AI summaries with one click. Families love the transparency.",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "TutorFlow cut my admin time by 80%. I went from 5 different spreadsheets to one dashboard.",
    name: "Priya K.",
    role: "Math Tutor, grades 6–12",
  },
  {
    quote:
      "The AI parent summaries are a game changer. Families rave about the professional updates they get.",
    name: "Marcus T.",
    role: "SAT Prep & English Tutor",
  },
  {
    quote:
      "I make more money now because I actually track my packages and send renewal reminders. Worth every penny.",
    name: "Jennifer L.",
    role: "Science Tutor, K–8",
  },
];

const FAQS = [
  {
    question: "Is TutorFlow really free to start?",
    answer:
      "Yes. The Free plan gives you up to 5 students, basic scheduling, manual payment tracking, and session notes. No credit card required.",
  },
  {
    question: "Can parents book directly without calling me?",
    answer:
      "Absolutely. Your unique public booking link lets families view availability and request sessions — you approve them with one click.",
  },
  {
    question: "How do lesson packages work?",
    answer:
      "Create a package (e.g., \"10 Algebra Lessons\"), sell it via your Stripe checkout, and TutorFlow automatically tracks unused credits. You get renewal alerts, and parents can buy again anytime.",
  },
  {
    question: "What payment methods do you support?",
    answer:
      "Online via Stripe (cards, Apple Pay, etc.) and manual methods like Venmo, Zelle, Cash, or Bank Transfer. You can use both in parallel.",
  },
  {
    question: "How does the AI summary feature work?",
    answer:
      "After a session, jot down a few bullet notes. Hit the AI button, and we generate a polished, professional paragraph for parents — covering what was covered, progress made, and next steps.",
  },
  {
    question: "Is my students' data secure?",
    answer:
      "Yes. We use industry-standard encryption and never share student data with third parties. You own your data and can export it anytime.",
  },
];

export default function HomePage() {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-dvh bg-background">
      {/* ─── Navbar ─── */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <GraduationCap className="h-7 w-7 text-primary transition-transform group-hover:scale-110" />
            <span className="text-xl font-bold">TutorFlow</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-0.5 after:w-0 hover:after:w-full after:bg-primary after:transition-all after:duration-300"
              >
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" size="sm">
                Log in
              </Button>
            </Link>
            <Link href="/signup">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>

          <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
            <SheetTrigger className="md:hidden" render={<Button variant="ghost" size="icon" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right" className="w-72">
              <SheetHeader>
                <SheetTitle className="flex items-center gap-2">
                  <GraduationCap className="h-6 w-6 text-primary" />
                  TutorFlow
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-4 mt-8">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-base font-medium text-muted-foreground hover:text-foreground transition-colors py-2"
                  >
                    {link.label}
                  </a>
                ))}
                <div className="pt-4 border-t flex flex-col gap-3">
                  <Link href="/login" onClick={() => setMobileOpen(false)}>
                    <Button variant="outline" className="w-full">
                      Log in
                    </Button>
                  </Link>
                  <Link href="/signup" onClick={() => setMobileOpen(false)}>
                    <Button className="w-full">Get Started</Button>
                  </Link>
                </div>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </header>

      {/* ─── Hero ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.03] via-transparent to-background pointer-events-none" />
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/[0.04] rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 sm:pt-28 pb-16 sm:pb-24 relative">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              Now with AI-powered parent updates
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground leading-[1.1]">
              Run your tutoring business{" "}
              <span className="text-primary">without the spreadsheets</span>
            </h1>

            <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Scheduling, payments, session notes, and AI-powered parent updates — all in one place.
              Built from the ground up for independent tutors.
            </p>

            <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/signup">
                <Button size="lg" className="text-base px-8">
                  Start Free
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing">
                <Button size="lg" variant="outline" className="text-base px-8">
                  View Pricing
                </Button>
              </Link>
            </div>

            <div className="mt-4 flex items-center justify-center gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> No credit card
                required
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Free forever
                plan
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-emerald-500" /> Setup in 10
                minutes
              </span>
            </div>
          </div>

          {/* Dashboard Screenshot */}
          <div className="mt-16 sm:mt-20 relative max-w-5xl mx-auto">
            <div className="rounded-xl border bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Browser Chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-md mx-auto bg-background rounded-md px-3 py-1 text-xs text-muted-foreground text-center border">
                    app.tutorflow.io/dashboard
                  </div>
                </div>
              </div>
              {/* Dashboard Mock */}
              <div className="bg-card p-6">
                <div className="grid grid-cols-12 gap-6">
                  {/* Sidebar */}
                  <div className="hidden lg:block col-span-2 space-y-3">
                    <div className="h-9 w-full bg-primary/10 rounded-lg flex items-center px-3 gap-2">
                      <TrendingUp className="h-4 w-4 text-primary" />
                      <span className="text-sm font-medium">Dashboard</span>
                    </div>
                    <div className="h-9 w-full bg-muted/50 rounded-lg flex items-center px-3 gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Sessions</span>
                    </div>
                    <div className="h-9 w-full bg-muted/50 rounded-lg flex items-center px-3 gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Students</span>
                    </div>
                    <div className="h-9 w-full bg-muted/50 rounded-lg flex items-center px-3 gap-2">
                      <CreditCard className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Payments</span>
                    </div>
                    <div className="h-9 w-full bg-muted/50 rounded-lg flex items-center px-3 gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Notes</span>
                    </div>
                  </div>
                  {/* Main area */}
                  <div className="col-span-12 lg:col-span-10">
                    {/* Stats row */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                      {[
                        { label: "Active Students", value: "24" },
                        { label: "Sessions Today", value: "5" },
                        { label: "Revenue This Month", value: "$3,240" },
                        { label: "Upcoming", value: "12" },
                      ].map((stat) => (
                        <div
                          key={stat.label}
                          className="p-4 border rounded-lg bg-background"
                        >
                          <p className="text-sm text-muted-foreground">
                            {stat.label}
                          </p>
                          <p className="text-2xl font-bold mt-1">{stat.value}</p>
                        </div>
                      ))}
                    </div>
                    {/* Calendar strip */}
                    <div className="border rounded-lg p-4 bg-background">
                      <div className="flex items-center justify-between mb-4">
                        <p className="font-medium">Today&apos;s Schedule</p>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-1 rounded">
                          June 23, 2026
                        </span>
                      </div>
                      <div className="space-y-3">
                        {[
                          { time: "3:00 PM", student: "Emma Johnson", subject: "Algebra II", status: "Confirmed" },
                          { time: "4:30 PM", student: "Liam Chen", subject: "Calculus I", status: "In Progress" },
                          { time: "6:00 PM", student: "Sophia Martinez", subject: "SAT Math", status: "Upcoming" },
                        ].map((session, i) => (
                          <div
                            key={i}
                            className="flex items-center gap-4 p-3 rounded-lg bg-muted/50 border"
                          >
                            <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm">
                                {session.time} — {session.student}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {session.subject}
                              </p>
                            </div>
                            <span
                              className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                                session.status === "In Progress"
                                  ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                                  : session.status === "Confirmed"
                                  ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                                  : "bg-muted text-muted-foreground"
                              }`}
                            >
                              {session.status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Social Proof ─── */}
      <section className="border-y bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center flex flex-col sm:flex-row items-center justify-center gap-2 text-sm text-muted-foreground">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 border-2 border-background flex items-center justify-center text-xs font-medium"
                >
                  <Users className="h-3 w-3 text-primary/60" />
                </div>
              ))}
            </div>
            <span>
              Trusted by <strong className="text-foreground">2,400+</strong>{" "}
              independent tutors
            </span>
            <span className="hidden sm:inline">·</span>
            <span className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star
                  key={s}
                  className="h-3.5 w-3.5 fill-amber-400 text-amber-400"
                />
              ))}
              <span className="ml-1">4.9/5 rating</span>
            </span>
          </div>
        </div>
      </section>

      {/* ─── Problem / Solution ─── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              The Problem
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Spreadsheets, sticky notes, and endless back-and-forth?
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Independent tutors lose 5–8 hours a week on admin. Booking
              emails, payment tracking, session notes — it&apos;s a juggling act
              that drains energy and limits growth.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Chasing parents via text and email for availability",
                "Lost track of who paid and how many lessons are left",
                "Session notes scattered in notebooks and Google Docs",
                "No time to send proper progress updates to families",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-destructive/10 flex items-center justify-center">
                    <span className="text-xs text-destructive font-bold">✕</span>
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              The Solution
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              One platform for everything tutors need
            </h2>
            <p className="mt-4 text-muted-foreground text-lg">
              TutorFlow replaces your toolkit of spreadsheets, calendars, and
              payment apps with a single, beautifully designed platform built by
              tutors, for tutors.
            </p>
            <ul className="mt-6 space-y-3">
              {[
                "Share one booking link. Parents book in seconds.",
                "Track packages, payments, and credits automatically.",
                "Write session notes once, send AI summaries instantly.",
                "Reclaim 5+ hours a week to focus on teaching.",
              ].map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-muted-foreground"
                >
                  <div className="mt-1 shrink-0 w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                    <Check className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ─── Feature Grid ─── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Features
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Everything you need to run your tutoring business
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            From scheduling to payment tracking to AI-powered parent updates —
            TutorFlow has you covered.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <Card
              key={f.title}
              className="group border-0 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 bg-card/50 backdrop-blur-sm"
            >
              <CardContent className="pt-6">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/15 group-hover:scale-110 transition-all duration-300">
                  <f.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-lg mb-2">{f.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {f.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ─── Dashboard Showcase ─── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
                Your Command Center
              </p>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
                Get a bird&apos;s-eye view of your entire business
              </h2>
              <p className="mt-4 text-muted-foreground text-lg">
                Your dashboard surfaces what matters: today&apos;s sessions,
                unpaid packages, upcoming renewals, and weekly revenue. No
                digging required.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { label: "Revenue tracker", desc: "See monthly income at a glance with Stripe + manual payments combined" },
                  { label: "Package countdown", desc: "Spot low-credit packages and send renewal reminders proactively" },
                  { label: "AI summary queue", desc: "See which sessions need notes, and generate summaries in one click" },
                ].map((p) => (
                  <div
                    key={p.label}
                    className="flex items-start gap-3 p-4 rounded-lg bg-background border"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center shrink-0">
                      <Check className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{p.label}</p>
                      <p className="text-sm text-muted-foreground">
                        {p.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="border rounded-xl bg-card shadow-lg shadow-black/5 overflow-hidden">
              <div className="flex items-center gap-2 px-4 py-3 border-b bg-muted/50">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-400" />
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="max-w-xs mx-auto bg-background rounded-md px-3 py-1 text-xs text-muted-foreground text-center border">
                    app.tutorflow.io
                  </div>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {/* Revenue chart bars */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <p className="font-medium">Earnings Overview</p>
                    <span className="text-xs text-muted-foreground">This Month: $3,240</span>
                  </div>
                  <div className="flex items-end gap-2 h-32">
                    {[40, 65, 45, 80, 55, 90, 50, 70, 85, 60, 75, 50].map(
                      (h, i) => (
                        <div
                          key={i}
                          className="flex-1 bg-primary/20 rounded-t-sm relative group cursor-pointer hover:bg-primary/30 transition-colors"
                        >
                          <div
                            className="absolute bottom-0 left-0 right-0 bg-primary/60 rounded-t-sm group-hover:bg-primary/70 transition-colors"
                            style={{ height: `${h}%` }}
                          />
                        </div>
                      )
                    )
                    }
                  </div>
                </div>
                {/* Recent activity */}
                <div>
                  <p className="font-medium mb-3">Recent Activity</p>
                  <div className="space-y-2">
                    {[
                      { action: "New booking", detail: "Emma — Algebra II", time: "2 min ago" },
                      { action: "Payment received", detail: "$240 from Chen Family", time: "15 min ago" },
                      { action: "AI summary sent", detail: "Liam — Calculus I", time: "1 hr ago" },
                      { action: "Package renewed", detail: "10 lessons — Martinez", time: "3 hrs ago" },
                    ].map((item, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 rounded-lg bg-background border text-sm"
                      >
                        <div>
                          <p className="font-medium">{item.action}</p>
                          <p className="text-muted-foreground text-xs">
                            {item.detail}
                          </p>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {item.time}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How It Works ─── */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            How It Works
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            From setup to first student in under 10 minutes
          </h2>
        </div>
        <div className="grid md:grid-cols-4 gap-8">
          {HOW_IT_WORKS_STEPS.map((step, index) => (
            <div key={step.step} className="relative text-center">
              {index < HOW_IT_WORKS_STEPS.length - 1 && (
                <div className="hidden md:block absolute top-8 left-[60%] w-[80%] border-t-2 border-dashed border-muted-foreground/20" />
              )}
              <div className="relative inline-flex">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:bg-primary/15 transition-colors">
                  <step.icon className="h-7 w-7 text-primary" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center z-20">
                  {step.step}
                </div>
              </div>
              <h3 className="font-semibold text-lg mb-2">{step.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Testimonials ─── */}
      <section className="bg-muted/30 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-16">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              Testimonials
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Loved by tutors everywhere
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t) => (
              <Card
                key={t.name}
                className="border-0 shadow-sm hover:shadow-md transition-shadow"
              >
                <CardContent className="pt-6">
                  <Quote className="h-8 w-8 text-primary/20 mb-4" />
                  <p className="text-foreground text-sm leading-relaxed mb-6">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {t.name.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{t.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Pricing Preview ─── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
        <div className="text-center mb-16">
          <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
            Pricing
          </p>
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Start free, upgrade when you&apos;re ready
          </h2>
          <p className="mt-4 text-muted-foreground text-lg max-w-2xl mx-auto">
            No hidden fees. Cancel anytime. Pay only when TutorFlow helps you
            grow.
          </p>
        </div>
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          {/* Free */}
          <Card className="border-0 shadow-sm">
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Free</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$0</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Get started with the basics
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Up to 5 students",
                  "Basic scheduling",
                  "Manual payment tracking",
                  "Session notes",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button variant="outline" className="w-full">
                  Get Started
                </Button>
              </Link>
            </CardContent>
          </Card>
          {/* Pro */}
          <Card className="border-primary/30 shadow-md shadow-primary/5 relative overflow-hidden">
            <div className="absolute top-0 right-6 bg-primary text-primary-foreground text-xs font-medium px-3 py-1 rounded-b-lg">
              Most Popular
            </div>
            <CardContent className="pt-8 pb-6 px-6">
              <div className="mb-6">
                <h3 className="text-xl font-bold">Pro</h3>
                <div className="mt-2">
                  <span className="text-4xl font-bold">$12</span>
                  <span className="text-muted-foreground">/month</span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  Everything you need to run your tutoring business
                </p>
              </div>
              <ul className="space-y-3 mb-8">
                {[
                  "Unlimited students",
                  "Online booking page",
                  "Stripe payments",
                  "Automated reminders via email",
                  "AI parent summaries",
                  "Lesson packages",
                  "Make-up credit tracking",
                  "Package renewal alerts",
                ].map((f) => (
                  <li key={f} className="flex items-start gap-3 text-sm">
                    <Check className="h-4 w-4 text-emerald-500 mt-0.5 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href="/signup">
                <Button className="w-full">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section id="faq" className="bg-muted/30 border-y">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="text-center mb-10">
            <p className="text-sm font-semibold text-primary uppercase tracking-wider mb-3">
              FAQ
            </p>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight">
              Frequently asked questions
            </h2>
          </div>
          <Accordion multiple={false} className="w-full">
            {FAQS.map((faq, i) => (
              <AccordionItem key={i} value={i}>
                <AccordionTrigger className="text-left text-base font-medium hover:no-underline">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-muted-foreground leading-relaxed">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* ─── Final CTA ─── */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-primary" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary-foreground/5 rounded-full blur-3xl" />
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center relative">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-primary-foreground">
            Ready to run your tutoring business like a pro?
          </h2>
          <p className="mt-4 text-primary-foreground/80 text-lg max-w-2xl mx-auto">
            Get started in under 10 minutes. No credit card required. Join
            2,400+ tutors who&apos;ve reclaimed their time.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/signup">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8"
              >
                Create Your Account
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
            <Link href="/pricing">
              <Button
                size="lg"
                variant="secondary"
                className="text-base px-8"
              >
                View Pricing
              </Button>
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/60">
            Loved by 2,400+ tutors · 4.9/5 average rating
          </p>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <GraduationCap className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">TutorFlow</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Scheduling, payments, and operations for independent tutors.
                Built with care.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#features" className="hover:text-foreground transition-colors">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-foreground transition-colors">
                    Pricing
                  </a>
                </li>
                <li>
                  <Link href="/signup" className="hover:text-foreground transition-colors">
                    Get Started
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Resources</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#how-it-works" className="hover:text-foreground transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-foreground transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Support
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-3">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    About
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Privacy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-foreground transition-colors">
                    Terms
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              <span>TutorFlow</span>
            </div>
            <p>Built for independent tutors. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
