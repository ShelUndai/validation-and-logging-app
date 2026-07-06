"use client"

import { useState } from "react"
import { Check, ChevronDown, X, AlertTriangle } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { cn } from "@/lib/utils"

// ---------------------------------------------------------------------------
// Types (mirrors the ValidationSection shape from the CR validator)
// ---------------------------------------------------------------------------

export interface ValidationSection {
  info: string[]
  warning: string[]
  action_items: string[]
  error: string[]
  not_applicable: string[]
}

export type ValidationSections = Record<string, ValidationSection>

type Severity = "error" | "warning" | "info" | "not_applicable"

interface Finding {
  severity: Severity
  message: string
  action?: string
}

interface SectionView {
  key: string
  name: string
  passed: number
  total: number
  ready: boolean
  findings: Finding[]
}

// ---------------------------------------------------------------------------
// Severity metadata — visible group titles, no icons
// ---------------------------------------------------------------------------

const SEVERITY_ORDER: Severity[] = ["error", "warning", "info", "not_applicable"]

const SEVERITY_META: Record<Severity, { label: string; className: string }> = {
  error: { label: "Errors", className: "text-red-600 dark:text-red-400" },
  warning: { label: "Warnings", className: "text-amber-600 dark:text-amber-400" },
  info: { label: "Info", className: "text-blue-600 dark:text-blue-400" },
  not_applicable: { label: "Not Applicable", className: "text-muted-foreground" },
}

function buildSectionView(key: string, name: string, section: ValidationSection): SectionView {
  const findings: Finding[] = [
    // Pair each error with its corresponding action item by index
    ...section.error.map((message, i) => ({
      severity: "error" as const,
      message,
      action: section.action_items[i],
    })),
    ...section.warning.map((message) => ({ severity: "warning" as const, message })),
    ...section.info.map((message) => ({ severity: "info" as const, message })),
    ...section.not_applicable.map((message) => ({ severity: "not_applicable" as const, message })),
  ]

  const passed = section.info.length
  const total = section.info.length + section.warning.length + section.error.length

  return {
    key,
    name,
    passed,
    total,
    ready: section.error.length === 0,
    findings,
  }
}

// ---------------------------------------------------------------------------
// Shared bits
// ---------------------------------------------------------------------------

function ReadyBadge({ status }: { status: "ready" | "not_ready" | "caution" }) {
  if (status === "ready") {
    return (
      <Badge className="bg-green-600 hover:bg-green-600 text-white gap-1 rounded-full px-2.5 min-w-[96px] justify-center">
        <Check className="h-3 w-3" />
        Ready
      </Badge>
    )
  }
  if (status === "caution") {
    return (
      <Badge className="bg-yellow-500 hover:bg-yellow-500 text-white gap-1 rounded-full px-2.5 min-w-[96px] justify-center">
        <AlertTriangle className="h-3 w-3" />
        Caution
      </Badge>
    )
  }
  return (
    <Badge className="bg-red-600 hover:bg-red-600 text-white gap-1 rounded-full px-2.5 min-w-[96px] justify-center">
      <X className="h-3 w-3" />
      Not Ready
    </Badge>
  )
}

function HeaderMeta({ s }: { s: SectionView }) {
  return (
    <div className="flex items-center gap-4 shrink-0">
      <span className="w-20 text-left text-xs text-muted-foreground tabular-nums whitespace-nowrap">
        {s.total > 0 ? `${s.passed}/${s.total} passed` : ""}
      </span>
      <ReadyBadge status={s.ready ? "ready" : "not_ready"} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Findings grouped by severity with visible group titles
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
            {f.action ?? <span className="text-muted-foreground/50">{"—"}</span>}
          </TableCell>
        </TableRow>
      ))}
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component: sidebar quick-select + full accordion list on the right
// ---------------------------------------------------------------------------

export interface ValidationOutputProps {
  sections: ValidationSections
  humanizeSectionKey: (key: string) => string
  overallScore: number
  overallStatus: "pass" | "fail" | "warn"
  totalPassed: number
  totalChecks: number
  title?: string
  description?: string
  actions?: React.ReactNode
}

export function ValidationOutput({
  sections,
  humanizeSectionKey,
  overallScore,
  overallStatus,
  totalPassed,
  totalChecks,
  title = "Validation Output",
  description = "Automation script execution results",
  actions,
}: ValidationOutputProps) {
  const views = Object.entries(sections).map(([key, section]) =>
    buildSectionView(key, humanizeSectionKey(key), section),
  )

  const firstNotReady = views.find((v) => !v.ready)
  const [open, setOpen] = useState<string[]>(firstNotReady ? [firstNotReady.key] : [])

  const handleSidebarClick = (key: string) => {
    setOpen((prev) => (prev.includes(key) ? [] : [key]))
  }

  const overallBadgeStatus = overallStatus === "pass" ? "ready" : overallStatus === "warn" ? "caution" : "not_ready"

  // Guard against null/undefined/string scores from the backend; fall back to computing from pass counts.
  const numericScore = Number(overallScore)
  const safeScore = Number.isFinite(numericScore)
    ? Math.round(numericScore)
    : totalChecks > 0
      ? Math.round((totalPassed / totalChecks) * 100)
      : 0

  return (
    <Card>
      <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-4 space-y-0 pb-4">
        <div className="flex-1 min-w-0 basis-64 space-y-1">
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription className="text-pretty">{description}</CardDescription>
        </div>
        <div className="flex flex-col items-end gap-3 shrink-0">
          {actions && <div className="flex items-center gap-2">{actions}</div>}
          <div className="flex items-center gap-3">
            <div className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-2">
                <p className="text-xs font-medium text-muted-foreground">Overall Score</p>
                <span className="text-sm font-bold tabular-nums">{safeScore}%</span>
              </div>
              <div className="w-full">
                <Progress value={safeScore} className="h-1.5" />
              </div>
            </div>
            <div className="flex flex-col items-center gap-1 border-l pl-3">
              <ReadyBadge status={overallBadgeStatus} />
              <p className="text-xs text-muted-foreground tabular-nums">
                {totalPassed}/{totalChecks} passed
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-[260px_1fr] rounded-lg border overflow-hidden">
          {/* Sidebar rail: quick selection */}
          <nav
            className="border-b md:border-b-0 md:border-r bg-muted/30 p-2 space-y-1"
            aria-label="Validation sections"
          >
            {views.map((s) => {
              const active = open.includes(s.key)
              return (
                <button
                  key={s.key}
                  onClick={() => handleSidebarClick(s.key)}
                  className={cn(
                    "flex w-full items-center gap-2 rounded-md px-3 py-2.5 text-left text-sm transition-colors",
                    active ? "bg-background shadow-sm font-medium" : "hover:bg-background/60",
                  )}
                  aria-expanded={active}
                >
                  <span
                    className={cn(
                      "inline-block h-2 w-2 rounded-full shrink-0",
                      s.ready ? "bg-green-500" : "bg-red-500",
                    )}
                    aria-hidden="true"
                  />
                  <span className="flex-1 truncate">{s.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">
                    {s.total > 0 ? `${s.passed}/${s.total}` : ""}
                  </span>
                </button>
              )
            })}
          </nav>

          {/* Right pane: all sections as accordion rows */}
          <Accordion type="multiple" value={open} onValueChange={setOpen} className="divide-y min-w-0">
            {views.map((s) => (
              <AccordionItem key={s.key} value={s.key} className="border-b-0 px-4">
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
