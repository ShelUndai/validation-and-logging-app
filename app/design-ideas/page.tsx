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
} from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
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
  actionItems: string[]
}

const SECTIONS: SectionData[] = [
  {
    name: "File Extraction",
    passed: 0,
    total: 6,
    findings: [{ severity: "warning", message: "An old validation template is used" }],
    actionItems: [],
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
    actionItems: [
      "Provide the post-implementation validation details in the required field",
      "Update the CR start time to a valid future date",
    ],
  },
  {
    name: "BAU Test Plan",
    passed: 1,
    total: 1,
    findings: [],
    actionItems: [],
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
    actionItems: [
      "On the TSR, fill out Release ID to match the Release ID on the CR. If BAU, enter 'BAU.'",
      "Ensure Test Strategy is embedded in the TSR or attached to the CR",
      "Include a link to a Jira Test Repository on the TSR",
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
    actionItems: ["Upload a valid MTSA file before requesting approval"],
  },
  {
    name: "Manager Approvers",
    passed: 1,
    total: 1,
    findings: [],
    actionItems: [],
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

const sectionStatus = (s: SectionData): "ready" | "issues" | "warnings" => {
  if (s.findings.some((f) => f.severity === "error")) return "issues"
  if (s.findings.some((f) => f.severity === "warning")) return "warnings"
  return "ready"
}

function StatusDot({ status }: { status: "ready" | "issues" | "warnings" }) {
  return (
    <span
      className={cn(
        "inline-block h-2 w-2 rounded-full shrink-0",
        status === "ready" && "bg-green-500",
        status === "warnings" && "bg-amber-500",
        status === "issues" && "bg-red-500",
      )}
      aria-hidden="true"
    />
  )
}

function StatusText({ s }: { s: SectionData }) {
  const status = sectionStatus(s)
  const errs = s.findings.filter((f) => f.severity === "error").length
  const warns = s.findings.filter((f) => f.severity === "warning").length
  return (
    <span className="text-xs text-muted-foreground tabular-nums whitespace-nowrap">
      {status === "ready" ? (
        <span className="text-green-700 dark:text-green-400">Ready</span>
      ) : (
        <>
          {errs > 0 && <span className="text-red-700 dark:text-red-400">{errs} error{errs !== 1 && "s"}</span>}
          {errs > 0 && warns > 0 && <span> · </span>}
          {warns > 0 && (
            <span className="text-amber-700 dark:text-amber-500">
              {warns} warning{warns !== 1 && "s"}
            </span>
          )}
        </>
      )}
    </span>
  )
}

// ---------------------------------------------------------------------------
// Idea A — Flat table: severity is a row attribute, action lives on the row
// ---------------------------------------------------------------------------

function IdeaFlatTable() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        One accordion level, one table per section. Severity is an icon column instead of grouped sub-sections, and
        the fix is paired directly with the finding it belongs to. Empty severity groups simply produce no rows, so
        the &quot;sometimes N/A shows up&quot; problem disappears.
      </p>
      <Accordion type="multiple" defaultValue={["TSR"]} className="space-y-2">
        {SECTIONS.map((s) => {
          const status = sectionStatus(s)
          return (
            <AccordionItem key={s.name} value={s.name} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="hover:no-underline py-3 gap-3 [&>svg:last-of-type]:hidden">
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                <div className="flex flex-1 items-center justify-between gap-3 pr-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StatusDot status={status} />
                    <span className="font-medium text-sm truncate">{s.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground tabular-nums hidden sm:inline">
                      {s.passed}/{s.total} passed
                    </span>
                    <StatusText s={s} />
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-3">
                {s.findings.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    All checks passed for this section.
                  </p>
                ) : (
                  <div className="rounded-md border overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableHead className="w-10" aria-label="Severity" />
                          <TableHead className="text-xs">Finding</TableHead>
                          <TableHead className="text-xs w-[45%]">How to fix</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {s.findings.map((f, i) => (
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
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Idea B — Quiet list: no tables, no badges, severity via icon + left border
// ---------------------------------------------------------------------------

function IdeaQuietList() {
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        The calmest option: no badges, no tables, no columns. Findings are a simple list sorted by severity, and
        action items render as a single checklist at the bottom of the section. Best if most sections usually pass.
      </p>
      <Accordion type="multiple" defaultValue={["TSR"]} className="space-y-2">
        {SECTIONS.map((s) => {
          const status = sectionStatus(s)
          const sorted = [...s.findings].sort((a, b) => {
            const order: Severity[] = ["error", "warning", "info", "not_applicable"]
            return order.indexOf(a.severity) - order.indexOf(b.severity)
          })
          return (
            <AccordionItem key={s.name} value={s.name} className="border rounded-lg bg-card px-4">
              <AccordionTrigger className="hover:no-underline py-3 gap-3 [&>svg:last-of-type]:hidden">
                <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
                <div className="flex flex-1 items-center justify-between gap-3 pr-2 min-w-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <StatusDot status={status} />
                    <span className="font-medium text-sm truncate">{s.name}</span>
                  </div>
                  <StatusText s={s} />
                </div>
              </AccordionTrigger>
              <AccordionContent className="pb-4">
                {sorted.length === 0 ? (
                  <p className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                    All checks passed for this section.
                  </p>
                ) : (
                  <div className="space-y-4">
                    <ul className="space-y-2">
                      {sorted.map((f, i) => (
                        <li
                          key={i}
                          className={cn(
                            "flex items-start gap-2.5 pl-3 border-l-2 py-0.5",
                            f.severity === "error" && "border-red-500",
                            f.severity === "warning" && "border-amber-500",
                            f.severity === "not_applicable" && "border-border opacity-60",
                          )}
                        >
                          {severityIcon(f.severity)}
                          <span className="text-sm leading-relaxed">{f.message}</span>
                        </li>
                      ))}
                    </ul>
                    {s.actionItems.length > 0 && (
                      <div className="rounded-md bg-muted/50 p-3">
                        <p className="flex items-center gap-1.5 text-xs font-medium text-foreground mb-2">
                          <Wrench className="h-3.5 w-3.5" />
                          To get this section ready
                        </p>
                        <ol className="space-y-1.5 list-decimal list-inside">
                          {s.actionItems.map((a, i) => (
                            <li key={i} className="text-sm leading-relaxed text-muted-foreground">
                              {a}
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Idea C — Master-detail: no accordions at all
// ---------------------------------------------------------------------------

function IdeaMasterDetail() {
  const [selected, setSelected] = useState("TSR")
  const section = SECTIONS.find((s) => s.name === selected) ?? SECTIONS[0]

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground text-pretty">
        No expand/collapse at all. The left rail is a permanent scannable overview; clicking a section shows its
        detail on the right. Scales best when sections have lots of findings, since only one section&apos;s content is
        on screen at a time.
      </p>
      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-4">
        <nav className="rounded-lg border bg-card p-1.5 h-fit" aria-label="Validation sections">
          {SECTIONS.map((s) => {
            const status = sectionStatus(s)
            const active = s.name === selected
            return (
              <button
                key={s.name}
                onClick={() => setSelected(s.name)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                  active ? "bg-muted font-medium" : "hover:bg-muted/50",
                )}
                aria-current={active ? "true" : undefined}
              >
                <StatusDot status={status} />
                <span className="flex-1 truncate">{s.name}</span>
                <span className="text-xs text-muted-foreground tabular-nums">
                  {s.passed}/{s.total}
                </span>
              </button>
            )
          })}
        </nav>

        <Card>
          <CardContent className="p-4 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-medium text-sm">{section.name}</h3>
              <StatusText s={section} />
            </div>
            {section.findings.length === 0 ? (
              <p className="flex items-center gap-2 text-sm text-muted-foreground">
                <Check className="h-4 w-4 text-green-600 dark:text-green-400" />
                All checks passed for this section.
              </p>
            ) : (
              <div className="space-y-3">
                {section.findings.map((f, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded-md border p-3",
                      f.severity === "not_applicable" && "opacity-60",
                    )}
                  >
                    <div className="flex items-start gap-2.5">
                      {severityIcon(f.severity)}
                      <div className="flex-1 space-y-1.5 min-w-0">
                        <p className="text-sm leading-relaxed">{f.message}</p>
                        {f.action && (
                          <p className="flex items-start gap-1.5 text-sm text-muted-foreground">
                            <Wrench className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                            {f.action}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
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
          <h1 className="text-2xl font-semibold text-balance">Validation Output — Design Ideas</h1>
          <p className="text-sm text-muted-foreground max-w-2xl text-pretty">
            Three alternatives to the current badge-heavy accordion layout, all using the same mock data. Common to
            all three: badges are replaced with a status dot plus quiet text counts, and severity is flattened into a
            row attribute instead of nested groups.
          </p>
        </div>

        <Tabs defaultValue="flat">
          <TabsList>
            <TabsTrigger value="flat">A · Flat table</TabsTrigger>
            <TabsTrigger value="quiet">B · Quiet list</TabsTrigger>
            <TabsTrigger value="master">C · Master-detail</TabsTrigger>
          </TabsList>
          <TabsContent value="flat" className="mt-4">
            <IdeaFlatTable />
          </TabsContent>
          <TabsContent value="quiet" className="mt-4">
            <IdeaQuietList />
          </TabsContent>
          <TabsContent value="master" className="mt-4">
            <IdeaMasterDetail />
          </TabsContent>
        </Tabs>
      </div>
    </main>
  )
}
