"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChevronDown, Download, History, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const SCORE = 57
const PASSED = 8
const TOTAL = 14
const DESC =
  "CHG1342646 | Mnemonic: MOZ - Mosaic | MOZ Q2 Software Release - CR Validator Enterprise Garage Onboarding"

function NotReadyBadge() {
  return (
    <Badge className="bg-red-600 hover:bg-red-600 text-white gap-1 rounded-full px-2.5 min-w-[96px] justify-center">
      <X className="h-3 w-3" />
      Not Ready
    </Badge>
  )
}

function ActionButtons({ ghost = false }: { ghost?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <Button size="sm" variant={ghost ? "ghost" : "outline"}>
        <History className="mr-2 h-4 w-4" />
        View History
      </Button>
      <Button size="sm" variant={ghost ? "ghost" : "default"}>
        <Download className="mr-2 h-4 w-4" />
        Download CSV
      </Button>
    </div>
  )
}

/* Faint stand-in for the sections list so each header reads in context */
function BodyStub() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] rounded-lg border overflow-hidden opacity-50">
      <div className="border-b md:border-b-0 md:border-r bg-muted/30 p-2 space-y-1">
        {["File Extraction", "CR Fields Check", "TSR", "MTSA"].map((n) => (
          <div key={n} className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm">
            <span className="h-2 w-2 rounded-full bg-red-500 shrink-0" aria-hidden="true" />
            <span className="truncate">{n}</span>
          </div>
        ))}
      </div>
      <div className="p-4">
        <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-2 text-sm font-medium">
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
            TSR
          </div>
          <div className="flex items-center gap-4">
            <span className="w-20 text-left text-xs text-muted-foreground tabular-nums">0/10 passed</span>
            <NotReadyBadge />
          </div>
        </div>
        <p className="pt-4 text-sm text-muted-foreground">Findings table…</p>
      </div>
    </div>
  )
}

/* Option 1 — Larger title, current stacked metrics on the right */
function Option1() {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0 basis-64 space-y-1.5">
          <CardTitle className="text-2xl">Validation Results</CardTitle>
          <CardDescription className="text-pretty">{DESC}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <ActionButtons />
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">Overall Score</p>
                <span className="text-sm font-bold tabular-nums">{SCORE}%</span>
              </div>
              <div className="w-full">
                <Progress value={SCORE} className="h-1.5" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 border-l pl-3">
              <NotReadyBadge />
              <p className="text-xs text-muted-foreground tabular-nums">
                {PASSED}/{TOTAL} passed
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BodyStub />
      </CardContent>
    </Card>
  )
}

/* Option 2 — KPI stat tiles under the title row */
function Option2() {
  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-2xl">Validation Results</CardTitle>
            <CardDescription className="text-pretty">{DESC}</CardDescription>
          </div>
          <ActionButtons />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Overall Score</p>
            <div className="mt-1 flex items-center gap-3">
              <span className="text-xl font-bold tabular-nums">{SCORE}%</span>
              <Progress value={SCORE} className="h-1.5 flex-1" />
            </div>
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Checks Passed</p>
            <p className="mt-1 text-xl font-bold tabular-nums">
              {PASSED}
              <span className="text-sm font-normal text-muted-foreground"> / {TOTAL}</span>
            </p>
          </div>
          <div className="rounded-lg border bg-muted/30 px-4 py-3">
            <p className="text-xs font-medium text-muted-foreground">Status</p>
            <div className="mt-1.5">
              <NotReadyBadge />
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BodyStub />
      </CardContent>
    </Card>
  )
}

/* Option 3 — Status banner strip between title and results */
function Option3() {
  return (
    <Card>
      <CardHeader className="space-y-4 pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0 space-y-1.5">
            <CardTitle className="text-2xl">Validation Results</CardTitle>
            <CardDescription className="text-pretty">{DESC}</CardDescription>
          </div>
          <ActionButtons />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 dark:border-red-900/50 dark:bg-red-950/30">
          <div className="flex items-center gap-3">
            <NotReadyBadge />
            <p className="text-sm text-red-900 dark:text-red-200">
              {TOTAL - PASSED} checks failing across 6 sections
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground tabular-nums">
              {PASSED}/{TOTAL} passed
            </span>
            <div className="w-28">
              <Progress value={SCORE} className="h-1.5" />
            </div>
            <span className="text-sm font-bold tabular-nums">{SCORE}%</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BodyStub />
      </CardContent>
    </Card>
  )
}

/* Option 4 — Hero score number on the right */
function Option4() {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0 basis-64 space-y-1.5">
          <CardTitle className="text-2xl">Validation Results</CardTitle>
          <CardDescription className="text-pretty">{DESC}</CardDescription>
          <div className="pt-2">
            <ActionButtons />
          </div>
        </div>
        <div className="flex items-center gap-4 shrink-0">
          <div className="text-right">
            <p className="text-4xl font-bold tabular-nums leading-none">{SCORE}%</p>
            <p className="mt-1 text-xs text-muted-foreground tabular-nums">
              {PASSED}/{TOTAL} checks passed
            </p>
          </div>
          <div className="border-l pl-4">
            <NotReadyBadge />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BodyStub />
      </CardContent>
    </Card>
  )
}

/* Option 5 — Metadata chips instead of a pipe-delimited subtitle */
function Option5() {
  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0 basis-64 space-y-2.5">
          <CardTitle className="text-2xl">Validation Results</CardTitle>
          <div className="flex flex-wrap items-center gap-1.5">
            <Badge variant="secondary" className="font-mono text-xs">
              CHG1342646
            </Badge>
            <Badge variant="secondary" className="text-xs">
              MOZ - Mosaic
            </Badge>
            <span className="text-sm text-muted-foreground text-pretty">
              MOZ Q2 Software Release - CR Validator Enterprise Garage Onboarding
            </span>
          </div>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          <ActionButtons />
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">Overall Score</p>
                <span className="text-sm font-bold tabular-nums">{SCORE}%</span>
              </div>
              <div className="w-full">
                <Progress value={SCORE} className="h-1.5" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 border-l pl-3">
              <NotReadyBadge />
              <p className="text-xs text-muted-foreground tabular-nums">
                {PASSED}/{TOTAL} passed
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <BodyStub />
      </CardContent>
    </Card>
  )
}

/* Option 6 — Clean header + slim toolbar row above the results */
function Option6() {
  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="space-y-1.5">
          <CardTitle className="text-2xl">Validation Results</CardTitle>
          <CardDescription className="text-pretty">{DESC}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-lg border bg-muted/30 px-4 py-2.5">
          <div className="flex flex-wrap items-center gap-4">
            <NotReadyBadge />
            <span className="text-xs text-muted-foreground tabular-nums">
              {PASSED}/{TOTAL} passed
            </span>
            <div className="flex items-center gap-2">
              <div className="w-28">
                <Progress value={SCORE} className="h-1.5" />
              </div>
              <span className="text-sm font-bold tabular-nums">{SCORE}%</span>
            </div>
          </div>
          <ActionButtons ghost />
        </div>
        <BodyStub />
      </CardContent>
    </Card>
  )
}

export default function DesignIdeasPage() {
  const [tab, setTab] = useState("1")

  return (
    <main className="min-h-screen bg-muted/20 p-6">
      <div className="mx-auto max-w-5xl space-y-4">
        <header className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/change-lookup">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to CR Validator
            </Link>
          </Button>
          <h1 className="text-xl font-semibold text-balance">Header Ideas — Round 3</h1>
          <p className="text-sm text-muted-foreground max-w-2xl text-pretty">
            Six alternatives for the Validation Results header. All use the larger title to match the search
            card. The results body below each header is a faded stand-in for context.
          </p>
        </header>

        <Tabs value={tab} onValueChange={setTab}>
          <TabsList className="flex h-auto flex-wrap justify-start">
            <TabsTrigger value="1">1 · Bigger title</TabsTrigger>
            <TabsTrigger value="2">2 · KPI tiles</TabsTrigger>
            <TabsTrigger value="3">3 · Status banner</TabsTrigger>
            <TabsTrigger value="4">4 · Hero score</TabsTrigger>
            <TabsTrigger value="5">5 · Metadata chips</TabsTrigger>
            <TabsTrigger value="6">6 · Toolbar row</TabsTrigger>
          </TabsList>
          <TabsContent value="1" className="mt-4">
            <Option1 />
          </TabsContent>
          <TabsContent value="2" className="mt-4">
            <Option2 />
          </TabsContent>
          <TabsContent value="3" className="mt-4">
            <Option3 />
          </TabsContent>
          <TabsContent value="4" className="mt-4">
            <Option4 />
          </TabsContent>
          <TabsContent value="5" className="mt-4">
            <Option5 />
          </TabsContent>
          <TabsContent value="6" className="mt-4">
            <Option6 />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
