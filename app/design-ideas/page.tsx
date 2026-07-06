"use client"

import { useState } from "react"
import Link from "next/link"
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronDown,
  AlertCircle,
  Minus,
  Wrench,
  X,
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Shared mock data (mirrors the real ValidationSection shape)
// ---------------------------------------------------------------------------

type Severity = "error" | "warning" | "info" | "not_applicable"

interface Finding {
  severity: Severity
  message: string
  action?: string
}

interface SectionData {
  name: string
  passed: number
  total: number
  findings: Finding[]
}

const SECTIONS: SectionData[] = [
  {
    name: "File Extraction",
    passed: 0,
    total: 6,
    findings: [{ severity: "warning", message: "An old validation template is used" }],
  },
  {
    name: "CR Fields Check",
    passed: 0,
    total: 2,
    findings: [
      {
        severity: "error",
        message: "CI Field Check failed: 'What will the post-implementation validation prove?' is incomplete",
        action: "Provide the post-implementation validation details in the required field",
      },
      {
        severity: "warning",
        message: "CI Start Time already passed: 2024/07/19 09:00",
        action: "Update the CR start time to a valid future date",
      },
    ],
  },
  {
    name: "BAU Test Plan",
    passed: 1,
    total: 1,
    findings: [],
  },
  {
    name: "TSR",
    passed: 0,
    total: 10,
    findings: [
      {
        severity: "error",
        message: "Release ID is blank, invalid, or does not match the release ID on record",
        action: "On the TSR, fill out Release ID to match the Release ID on the CR. If BAU, enter 'BAU.'",
      },
      {
        severity: "error",
        message: "Invalid location of test-strategy was written in TSR",
        action: "Ensure Test Strategy is embedded in the TSR or attached to the CR",
      },
      {
        severity: "error",
        message: "Invalid test repository provided",
        action: "Include a link to a Jira Test Repository on the TSR",
      },
      { severity: "warning", message: "Auto TSR: No stories found for BAU to be used as requirements" },
      {
        severity: "warning",
        message: "Auto TSR: Data is missing for all columns. Manual review required for Test Sets",
      },
      {
        severity: "warning",
        message:
          "Auto TSR: Data is missing for columns: Components, Labels, Environment, Epic Link, Linked Issues. Manual review required for Test Plan",
      },
      { severity: "not_applicable", message: "Automated Control check skipped — no automated controls linked" },
    ],
  },
  {
    name: "MTSA",
    passed: 0,
    total: 3,
    findings: [
      {
        severity: "error",
        message: "MTSA file required but not found on the CR",
        action: "Upload a valid MTSA file before requesting approval",
      },
    ],
  },
  {
    name: "Manager Approvers",
    passed: 1,
    total: 1,
    findings: [],
  },
]

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

const severityIcon = (s: Severity) => {
  switch (s) {
    case "error":
      return <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" aria-label="Error" />
    case "warning":
      return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" aria-label="Warning" />
    case "not_applicable":
      return <Minus className="h-4 w-4 text-muted-foreground" aria-label="Not applicable" />
    default:
      return <Check className="h-4 w-4 text-green-600 dark:text-green-400" aria-label="Passed" />
  }
}

const isReady = (s: SectionData) => !s.findings.some((f) => f.severity === "error")

function ReadyBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <Badge className="bg-green-600 hover:bg-green-600 text-white gap-1 rounded-full px-2.5">
      <Check className="h-3 w-3" />
      Ready
    </Badge>
  ) : (
    <Badge className="bg-red-600 hover:bg-red-600 text-white gap-1 rounded-full px-2.5">
      <X className="h-3 w-3" />
      Not Ready
    </Badge>
  )
}

function HeaderMeta({ s }: { s: SectionData }) {
  return (
    <div className="flex items-center gap-3 shrink-0">
      <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {s.passed}/{s.total} passed
      </span>
      <ReadyBadge ready={isReady(s)} />
    </div>
  )
}

function FindingsTable({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground py-1">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        All checks passed for this section.
      </p>
    )
  }
  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-10" aria-label="Severity" />
            <TableHead className="text-xs">Finding</TableHead>
            <TableHead className="text-xs w-[42%]">How to fix</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {findings.map((f, i) => (
            <TableRow key={i} className={cn(f.severity === "not_applicable" && "opacity-60")}>
              <TableCell className="align-top pt-3">{severityIcon(f.severity)}</TableCell>
              <TableCell className="align-top text-sm leading-relaxed">{f.message}</TableCell>
              <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
                {f.action ?? <span className="text-muted-foreground/50">—</span>}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function OutputCard({ children }: { children: React.ReactNode }) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-4">
        <div className="space-y-1">
          <CardTitle className="text-base">Validation Output</CardTitle>
          <CardDescription>Automation script execution results</CardDescription>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Overall Score</p>
            <p className="text-xs text-muted-foreground tabular-nums">2/23 passed</p>
          </div>
          <ReadyBadge ready={false} />
        </div>
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Idea 1 — Hybrid: sidebar rail + flat table detail, all inside one card
// ---------------------------------------------------------------------------

function IdeaHybrid() {
  const [selected, setSelected] = useState("TSR")
  const section = SECTIONS.find((s) => s.name === selected) ?? SECTIONS[0]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        A&apos;s table + C&apos;s sidebar, contained in a single Validation Output card. The rail is a permanent
        overview showing pass counts and the Ready badge for every section at once; the detail pane shows the flat
        findings table for the selected section. No accordions, nothing floats.
      </p>
      <OutputCard>
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] rounded-lg border overflow-hidden">
          <nav
            className="border-b md:border-b-0 md:border-r bg-muted/30 p-1.5 space-y-0.5"
            aria-label="Validation sections"
          >
            {SECTIONS.map((s) => {
              const active = s.name === selected
              return (
                <button
                  key={s.name}
                  onClick={() => setSelected(s.name)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                    active ? "bg-background shadow-sm font-medium" : "hover:bg-background/60",
                  )}
                  aria-current={active ? "true" : undefined}
                >
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full shrink-0",
                      isReady(s) ? "bg-green-500" : "bg-red-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {s.passed}/{s.total}
                  </span>
                </button>
              )
            })}
          </nav>
          <div className="p-4 space-y-3 min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-sm">{section.name}</h3>
              <HeaderMeta s={section} />
            </div>
            <FindingsTable findings={section.findings} />
          </div>
        </div>
      </OutputCard>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Idea 2 — Carded accordion: A's flat tables as divided rows inside one card
// ---------------------------------------------------------------------------

function IdeaCardedAccordion() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        Closest to your current layout, but the subsections are divided rows inside the Validation Output card
        instead of separate floating boxes. Expanding a row reveals the flat findings table. Least change for users
        already familiar with the current UI.
      </p>
      <OutputCard>
        <Accordion type="multiple" defaultValue={["TSR"]} className="rounded-lg border divide-y">
          {SECTIONS.map((s) => (
            <AccordionItem key={s.name} value={s.name} className="border-b-0 px-4">
              <AccordionTrigger className="hover:no-underline py-3 gap-3 [&>svg:last-of-type]:hidden">
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                <div className="flex flex-1 items-center justify-between gap-3 pr-1 min-w-0">
                  <span className="font-medium text-sm truncate">{s.name}</span>
                  <HeaderMeta s={s} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                <FindingsTable findings={s.findings} />
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </OutputCard>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Idea 3 — Unified triage table: one table, section group rows, no accordions
// ---------------------------------------------------------------------------

function IdeaTriageTable() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        A new alternative: everything visible at once in a single table. Each section becomes a group-header row
        carrying the pass count and Ready badge; its findings follow as rows beneath it. Passing sections collapse to
        just their header row. Fastest for &quot;show me everything wrong with this CR&quot; triage, and trivially
        maps to the CSV export.
      </p>
      <OutputCard>
        <div className="rounded-lg border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50 hover:bg-muted/50">
                <TableHead className="w-10" aria-label="Severity" />
                <TableHead className="text-xs">Finding</TableHead>
                <TableHead className="text-xs w-[42%]">How to fix</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {SECTIONS.map((s) => (
                <SectionGroupRows key={s.name} s={s} />
              ))}
            </TableBody>
          </Table>
        </div>
      </OutputCard>
    </div>
  )
}

function SectionGroupRows({ s }: { s: SectionData }) {
  return (
    <>
      <TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableCell colSpan={3} className="py-2.5">
          <div className="flex items-center justify-between gap-3">
            <span className="font-medium text-sm">{s.name}</span>
            <HeaderMeta s={s} />
          </div>
        </TableCell>
      </TableRow>
      {s.findings.length === 0 ? (
        <TableRow>
          <TableCell colSpan={3} className="py-2.5">
            <p className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
              All checks passed.
            </p>
          </TableCell>
        </TableRow>
      ) : (
        s.findings.map((f, i) => (
          <TableRow key={i} className={cn(f.severity === "not_applicable" && "opacity-60")}>
            <TableCell className="align-top pt-3">{severityIcon(f.severity)}</TableCell>
            <TableCell className="align-top text-sm leading-relaxed">{f.message}</TableCell>
            <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
              {f.action ?? <span className="text-muted-foreground/50">—</span>}
            </TableCell>
          </TableRow>
        ))
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DesignIdeasPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/change-lookup">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to CR Validator
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-balance">Validation Output — Design Ideas, Round 2</h1>
          <p className="text-sm text-muted-foreground max-w-2xl text-pretty">
            All three variants keep the &quot;n/m passed&quot; count and the Ready / Not Ready badge on each
            subsection header, wrap everything in a single Validation Output card, and flatten severity into a row
            attribute (icon) instead of nested Errors / Warnings / N&#47;A groups.
          </p>
        </div>

        <Tabs defaultValue="hybrid">
          <TabsList>
            <TabsTrigger value="hybrid">1 · Sidebar + table</TabsTrigger>
            <TabsTrigger value="carded">2 · Carded accordion</TabsTrigger>
            <TabsTrigger value="triage">3 · Triage table</TabsTrigger>
          </TabsList>
          <TabsContent value="hybrid" className="mt-4">
            <IdeaHybrid />
          </TabsContent>
          <TabsContent value="carded" className="mt-4">
            <IdeaCardedAccordion />
          </TabsContent>
          <TabsContent value="triage" className="mt-4">
            <IdeaTriageTable />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
