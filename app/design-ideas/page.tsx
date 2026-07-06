"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowLeft, Check, ChevronDown, X } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Mock data (mirrors the real ValidationSection shape)
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
      { severity: "info", message: "TSR template version 4.2 detected" },
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

const SEVERITY_ORDER: Severity[] = ["error", "warning", "info", "not_applicable"]

const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  error: { label: "Errors", className: "text-red-600 dark:text-red-400" },
  warning: { label: "Warnings", className: "text-amber-600 dark:text-amber-400" },
  info: { label: "Info", className: "text-blue-600 dark:text-blue-400" },
  not_applicable: { label: "Not Applicable", className: "text-muted-foreground" },
}

const isReady = (s: SectionData) => !s.findings.some((f) => f.severity === "error")

function ReadyBadge({ ready }: { ready: boolean }) {
  return ready ? (
    <Badge className="bg-green-600 hover:bg-green-600 text-white gap-1 rounded-full px-2.5 min-w-[96px] justify-center">
      <Check className="h-3 w-3" />
      Ready
    </Badge>
  ) : (
    <Badge className="bg-red-600 hover:bg-red-600 text-white gap-1 rounded-full px-2.5 min-w-[96px] justify-center">
      <X className="h-3 w-3" />
      Not Ready
    </Badge>
  )
}

function HeaderMeta({ s }: { s: SectionData }) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <span className="w-20 text-right text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {s.passed}/{s.total} passed
      </span>
      <ReadyBadge ready={isReady(s)} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Findings grouped by severity with visible group titles (no icons)
// ---------------------------------------------------------------------------

function FindingsTable({ findings }: { findings: Finding[] }) {
  if (findings.length === 0) {
    return (
      <p className="flex items-center gap-2 text-sm text-muted-foreground py-1">
        <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
        All checks passed for this section.
      </p>
    )
  }

  const groups = SEVERITY_ORDER.map((sev) => ({
    severity: sev,
    items: findings.filter((f) => f.severity === sev),
  })).filter((g) => g.items.length > 0)

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-muted/50 hover:bg-muted/50">
            <TableHead className="w-10 text-xs text-right pr-0" aria-label="Number" />
            <TableHead className="text-xs">Finding</TableHead>
            <TableHead className="text-xs w-[42%]">How to fix</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {groups.map((g) => (
            <SeverityGroupRows key={g.severity} severity={g.severity} items={g.items} />
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

function SeverityGroupRows({ severity, items }: { severity: Severity; items: Finding[] }) {
  const meta = SEVERITY_META[severity]
  const dimmed = severity === "not_applicable"
  return (
    <>
      <TableRow className="bg-muted/30 hover:bg-muted/30">
        <TableCell colSpan={3} className="py-1.5">
          <span className={cn("text-xs font-semibold uppercase tracking-wide", meta.className)}>
            {meta.label}
            <span className="ml-1.5 font-normal text-muted-foreground normal-case tracking-normal">
              ({items.length})
            </span>
          </span>
        </TableCell>
      </TableRow>
      {items.map((f, i) => (
        <TableRow key={i} className={cn(dimmed && "opacity-60")}>
          <TableCell className="align-top text-sm text-muted-foreground tabular-nums text-right pr-0">
            {i + 1}
          </TableCell>
          <TableCell className="align-top text-sm leading-relaxed">{f.message}</TableCell>
          <TableCell className="align-top text-sm leading-relaxed text-muted-foreground">
            {f.action ?? <span className="text-muted-foreground/50">—</span>}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Final design: sidebar quick-select + full accordion list on the right
// ---------------------------------------------------------------------------

function ValidationOutput() {
  const [open, setOpen] = useState<string[]>(["TSR"])

  const handleSidebarClick = (name: string) => {
    setOpen((prev) => (prev.includes(name) ? [] : [name]))
  }

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
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] rounded-lg border overflow-hidden">
          {/* Sidebar rail: quick selection */}
          <nav
            className="border-b md:border-b-0 md:border-r bg-muted/30 p-2 space-y-1"
            aria-label="Validation sections"
          >
            {SECTIONS.map((s) => {
              const active = open.includes(s.name)
              return (
                <button
                  key={s.name}
                  onClick={() => handleSidebarClick(s.name)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    active ? "bg-background shadow-sm font-medium" : "hover:bg-background/60",
                  )}
                  aria-expanded={active}
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

          {/* Right pane: all sections as accordion rows */}
          <Accordion type="multiple" value={open} onValueChange={setOpen} className="divide-y min-w-0">
            {SECTIONS.map((s) => (
              <AccordionItem key={s.name} value={s.name} className="border-b-0 px-4">
                <AccordionTrigger className="hover:no-underline py-4 gap-3 [&>svg:last-of-type]:hidden">
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
        </div>
      </CardContent>
    </Card>
  )
}

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function DesignIdeasPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto max-w-6xl px-4 py-8 space-y-6">
        <div className="space-y-2">
          <Button variant="ghost" size="sm" asChild className="-ml-2">
            <Link href="/change-lookup">
              <ArrowLeft className="mr-1.5 h-4 w-4" />
              Back to CR Validator
            </Link>
          </Button>
          <h1 className="text-2xl font-semibold text-balance">Validation Output — Final Design</h1>
          <p className="text-sm text-muted-foreground max-w-2xl text-pretty">
            Sidebar for quick selection, with every subsection rendered as an accordion row on the right. Clicking a
            closed sidebar item closes the rest and opens it; clicking the open item closes all. Findings are grouped
            under visible Errors / Warnings / Info / Not Applicable titles — no icons.
          </p>
        </div>

        <ValidationOutput />
      </div>
    </main>
  )
}
