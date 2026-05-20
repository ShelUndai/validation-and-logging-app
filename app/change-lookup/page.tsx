"use client"

import React, { useState } from "react"
import Link from "next/link"
import {
  AlertCircle,
  AlertTriangle,
  Check,
  Clock,
  Download,
  RefreshCw,
  Search,
  X,
  Calendar,
  User,
  CheckCircle,
  Info,
  ChevronDown,
  ChevronUp,
  History,
  XCircle,
  ExternalLink,
  Filter,
} from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface ValidationResult {
  item: string
  category: string
  status: "pass" | "fail" | "warn"
  message: string
  details?: string
  required: boolean
}

interface ValidationLog {
  id: string
  change_number: string
  executed_by: string
  executed_at: string
  result: "pass" | "fail" | "warn"
  overall_score: number
  passed_checks: number
  failed_checks: number
  total_checks: number
  duration: string
  mnemonic: string
  description: string
  line_of_business: string
}

// Available lines of business for filtering
const LINES_OF_BUSINESS = [
  "All",
  "Technology",
  "Finance",
  "Operations",
  "Marketing",
  "Human Resources",
  "Legal",
  "Customer Service",
] as const

interface ChangeValidation {
  change_number: string
  validation_status: "pass" | "fail" | "warn"
  overall_score: number
  execution_time: string
  executed_by: string
  executed_on: string
  script_output: string
  change_info: {
    short_description: string
    state: string
    priority: string
    risk: string
    impact: string
    requested_by: string
    assigned_to: string
    start_date: string
    end_date: string
  }
  validation_results: ValidationResult[]
  summary: {
    total_checks: number
    passed: number
    failed: number
    warnings: number
    required_failed: number
  }
  failed_requirements: string[]
  approval_actions: string[]
}

// Mock data for all recent validation history
const mockAllHistory: ValidationLog[] = [
  {
    id: "VAL-CHG1234567-001",
    change_number: "CHG1234567",
    executed_by: "jsmith",
    executed_at: "2025-01-15T14:32:00Z",
    result: "pass",
    overall_score: 100,
    passed_checks: 17,
    failed_checks: 0,
    total_checks: 17,
    duration: "2.3s",
    mnemonic: "WEB",
    description: "Web Application Security Update",
    line_of_business: "Technology",
  },
  {
    id: "VAL-CHG1234568-001",
    change_number: "CHG1234568",
    executed_by: "mjohnson",
    executed_at: "2025-01-15T10:15:00Z",
    result: "fail",
    overall_score: 57,
    passed_checks: 8,
    failed_checks: 6,
    total_checks: 14,
    duration: "2.1s",
    mnemonic: "CSO",
    description: "Database Migration Phase 2",
    line_of_business: "Operations",
  },
  {
    id: "VAL-CHG1234569-001",
    change_number: "CHG1234569",
    executed_by: "agarcia",
    executed_at: "2025-01-14T16:45:00Z",
    result: "warn",
    overall_score: 71,
    passed_checks: 10,
    failed_checks: 4,
    total_checks: 14,
    duration: "2.5s",
    mnemonic: "AUTH",
    description: "Authentication Service Upgrade",
    line_of_business: "Technology",
  },
  {
    id: "VAL-CHG1234570-001",
    change_number: "CHG1234570",
    executed_by: "bwilson",
    executed_at: "2025-01-14T09:20:00Z",
    result: "pass",
    overall_score: 100,
    passed_checks: 17,
    failed_checks: 0,
    total_checks: 17,
    duration: "2.0s",
    mnemonic: "API",
    description: "API Gateway Configuration",
    line_of_business: "Finance",
  },
  {
    id: "VAL-CHG1234571-001",
    change_number: "CHG1234571",
    executed_by: "jsmith",
    executed_at: "2025-01-13T14:00:00Z",
    result: "fail",
    overall_score: 43,
    passed_checks: 6,
    failed_checks: 8,
    total_checks: 14,
    duration: "2.4s",
    mnemonic: "CSO",
    description: "Firewall Rule Update",
    line_of_business: "Operations",
  },
  {
    id: "VAL-CHG1234572-001",
    change_number: "CHG1234572",
    executed_by: "klee",
    executed_at: "2025-01-13T11:30:00Z",
    result: "pass",
    overall_score: 100,
    passed_checks: 17,
    failed_checks: 0,
    total_checks: 17,
    duration: "2.2s",
    mnemonic: "HR",
    description: "Employee Portal Update",
    line_of_business: "Human Resources",
  },
  {
    id: "VAL-CHG1234573-001",
    change_number: "CHG1234573",
    executed_by: "mchen",
    executed_at: "2025-01-12T15:45:00Z",
    result: "warn",
    overall_score: 78,
    passed_checks: 11,
    failed_checks: 3,
    total_checks: 14,
    duration: "2.6s",
    mnemonic: "MKT",
    description: "Marketing Analytics Dashboard",
    line_of_business: "Marketing",
  },
]

const generateMockHistory = (changeNumber: string, lobFilter?: string): ValidationLog[] => {
  const isPassingChange = changeNumber.toLowerCase().includes("pass") || 
                          changeNumber.toLowerCase().includes("good") || 
                          changeNumber === "CHG0000001"
  
  const logs: ValidationLog[] = [
    {
      id: `VAL-${changeNumber}-001`,
      change_number: changeNumber,
      executed_by: "jsmith",
      executed_at: "2025-01-15T14:32:00Z",
      result: isPassingChange ? "pass" : "fail",
      overall_score: isPassingChange ? 100 : 57,
      passed_checks: isPassingChange ? 17 : 8,
      failed_checks: isPassingChange ? 0 : 6,
      total_checks: isPassingChange ? 17 : 14,
      duration: "2.3s",
      mnemonic: "CSO",
      description: "7/1 Production Release for PMC One Power Platform Apps (CSO)",
      line_of_business: "Technology",
    },
    {
      id: `VAL-${changeNumber}-002`,
      change_number: changeNumber,
      executed_by: "mjohnson",
      executed_at: "2025-01-14T09:15:00Z",
      result: "fail",
      overall_score: 43,
      passed_checks: 6,
      failed_checks: 8,
      total_checks: 14,
      duration: "2.1s",
      mnemonic: "CSO",
      description: "7/1 Production Release for PMC One Power Platform Apps (CSO)",
      line_of_business: "Technology",
    },
    {
      id: `VAL-${changeNumber}-003`,
      change_number: changeNumber,
      executed_by: "agarcia",
      executed_at: "2025-01-13T16:45:00Z",
      result: "warn",
      overall_score: 71,
      passed_checks: 10,
      failed_checks: 4,
      total_checks: 14,
      duration: "2.5s",
      mnemonic: "CSO",
      description: "7/1 Production Release for PMC One Power Platform Apps (CSO)",
      line_of_business: "Technology",
    },
  ]
  
  if (lobFilter && lobFilter !== "All") {
    return logs.filter(log => log.line_of_business === lobFilter)
  }
  return logs
}

const validateChangeRecord = async (changeNumber: string): Promise<ChangeValidation | null> => {
  await new Promise((resolve) => setTimeout(resolve, 3000))

  if (changeNumber.toLowerCase().includes("notfound") || changeNumber === "CHG0000000") {
    return null
  }

  const isPassingExample =
    changeNumber.toLowerCase().includes("pass") ||
    changeNumber.toLowerCase().includes("good") ||
    changeNumber === "CHG0000001"

  if (isPassingExample) {
    const scriptOutput = `INFO:cr_validation.attachments:Testing required:
Regression Testing
SIT/Sprint Testing
Entitlement Testing
Cross Browser Testing
UAT
INFO:cr_validation.attachments:TSR file Found: ['TSR 25.07.01.xlsx']
INFO:cr_validation.attachments:TSA file Found: ['Test Strategy and Approach 25.07.01.xlsx']
INFO:cr_validation.attachments:Validation Plan file Found: ['CSO Post-Production Validation plan and Results GRC237720.25.07.01.xlsx']
INFO:cr_validation.callbacks:CI Field Check Passed: All required fields completed
INFO:cr_validation.callbacks:CI Start Time Valid: 2025/01/20 09:00
INFO:cr_validation.callbacks:Test filename 'CSO Test Workbook 25.07.01.xlsx' contains required mnemonic
INFO:cr_validation.attachments.tsr:Mnemonic CSO found in Project Name
INFO:cr_validation.attachments.tsr:Valid test-strategy provided
INFO:cr_validation.attachments.tsr:Valid test repository provided
INFO:cr_validation.attachments.tsr:TSR Data validation passed
INFO:cr_validation.callbacks:CI Validation Plan found and validated
Showing results for CHG127720, Mnemonic: CSO - Production Release
7/1 Production Release for PMC One Power Platform Apps (CSO) - Fully Validated
-----------
Name: Valid ETSAP Template Version; Satisfied: True
Name: All Template Questions Answered; Satisfied: True
Name: Valid Start Date / Lead Time; Satisfied: True
Name: Peer Reviewer Found; Satisfied: True
Name: Has CTasks; Satisfied: True
Name: QE Approvers Required & Present; Satisfied: True
Name: TSAT Required & Upload Found; Satisfied: True
Name: TSR Required & Upload Found; Satisfied: True
Name: TSA Required & Upload Found; Satisfied: True
Name: MTSA Required & Upload Found; Satisfied: True
Name: BAU Test Plan File Required, Found, and Reviewed; Satisfied: True
Name: Review TSAT File Data/Answers; Satisfied: True
Name: Review TSR File Data/Answers; Satisfied: True
Name: Review TSA File Data/Answers; Satisfied: True
Name: Review MTSA File Data/Answers; Satisfied: True
Name: Review Test Results; Satisfied: True
Name: Review Validation Plan File Data/Answers; Satisfied: True
-- Totals --
Passed: 17
Failed: 0
-----------`

    return {
      change_number: changeNumber,
      validation_status: "pass",
      overall_score: 100,
      execution_time: "1m 45s",
      executed_by: "automation-service",
      executed_on: new Date().toISOString(),
      script_output: scriptOutput,
      change_info: {
        short_description: "7/1 Production Release for PMC One Power Platform Apps (CSO) - Fully Validated",
        state: "Implement",
        priority: "3 - Moderate",
        risk: "Low",
        impact: "Medium",
        requested_by: "John Smith",
        assigned_to: "Network Team",
        start_date: "2025-01-20T09:00:00Z",
        end_date: "2025-01-20T11:00:00Z",
      },
      validation_results: [],
      summary: {
        total_checks: 17,
        passed: 17,
        failed: 0,
        warnings: 0,
        required_failed: 0,
      },
      failed_requirements: [],
      approval_actions: ["Approve CR"],
    }
  } else {
    const scriptOutput = `INFO:cr_validation.attachments:Testing required:
Regression Testing
SIT/Sprint Testing
Entitlement Testing
Cross Browser Testing
UAT
WARNING:cr_validation.attachments:More than 1 TSR file Found: ['TSR 25.07.01 Updated Link.xlsx', 'TSR 25.07.01.xlsx']
WARNING:cr_validation.attachments:More than 1 TSA file Found: ['Test Strategy and Approach 25.07.01.xlsx', 'T25 Strategy and Approach 25.07.01.Updated.xlsx']
WARNING:cr_validation.attachments:More than 1 Validation Plan file Found: ['CSO Post-Production Validation plan and Results GRC237720.25.07.01.xlsx', 'RESULTS CSO Post-Production Validation P
ERROR:cr_validation.callbacks:CI Field Check Failed for the following Regex: Provide a\ What\ will\ the\ post-implementation\ validation\ prove\?\w+\.\w+\.\w+\ Which\ applications\ will\ need\ to
ERROR:cr_validation.callbacks:CI Field Check Failed for the following Regex: \\ What\ will\ the\ post-implementation\ validation\ prove\?\w+\.\w+\.\w+\ Which\ applications\ will\ need\ to
ERROR:cr_validation.callbacks:CI Field Check Failed for the following Regex: \\ What\ will\ the\ post-implementation\ validation\ prove\?\w+\.\w+\.\w+\ Which\ applications\ will\ need\ to
WARNING:cr_validation.callbacks:CI Start Time Already Passed 2024/07/19 09:00
WARNING:cr_validation.callbacks:Test filename 'Test Workbook 25.07.01.xlsx' does not contain CSO mnemonic
ERROR:cr_validation.attachments.tsr:Mnemonic CSO not found in Project Name:
ERROR:cr_validation.attachments.tsr:Invalid test-strategy provided
ERROR:cr_validation.attachments.tsr:Invalid test repository provided
WARNING:cr_validation.attachments.tsr:Auto TSR: Data is missing for all columns, Manual review required for Test Sets!
WARNING:cr_validation.attachments.tsr:Auto TSR: Data is missing for certain columns: [['Component', 'Description', 'Values', 'Environment', 'Associated with Automated Control', 'Epic Link', '
ERROR:cr_validation.attachments.tsr:TSR file was not found
ERROR:cr_validation.callbacks:CI Field Check Failed for the following Regex: \\ What\ will\ the\ post-implementation\ validation\ prove\?\w+\.\w+\.\w+\ Which\ applications\ will\ need\ to
INFO:cr_validation.callbacks:CI Validation Plan Regex Parsing Failed - Checking for Validation Plan File
Showing results for CHG127720, Mnemonic: CSO - Rapid Prototyping
7/1 Production Release for PMC One Power Platform Apps (CSO)
-----------
Name: Valid ETSAP Template Version; Satisfied: True
Name: All Template Questions Answered; Satisfied: False
Name: Valid Start Date / Lead Time; Satisfied: False
Name: Peer Reviewer Found; Satisfied: True
Name: Has CTasks; Satisfied: True
Name: QE Approvers Required & Present; Satisfied: True
Name: TSAT Required & Upload Found; Satisfied: True
Name: TSR Required & Upload Found; Satisfied: True
Name: TSA Required & Upload Found; N/A
Name: MTSA Required & Upload Found; Satisfied: False
Name: BAU Test Plan File Required, Found, and Reviewed; N/A
Name: Review TSAT File Data/Answers; Satisfied: True
Name: Review TSR File Data/Answers; Satisfied: False
Name: Review TSA File Data/Answers; N/A
Name: Review MTSA File Data/Answers; Satisfied: False
Name: Review Test Results; Satisfied: True
Name: Review Validation Plan File Data/Answers; Satisfied: False
-- Totals --
Passed: 8
Failed: 6
-----------`

    return {
      change_number: changeNumber,
      validation_status: "fail",
      overall_score: 57,
      execution_time: "2m 34s",
      executed_by: "automation-service",
      executed_on: new Date().toISOString(),
      script_output: scriptOutput,
      change_info: {
        short_description: "7/1 Production Release for PMC One Power Platform Apps (CSO)",
        state: "Implement",
        priority: "3 - Moderate",
        risk: "Medium",
        impact: "Medium",
        requested_by: "John Smith",
        assigned_to: "Network Team",
        start_date: "2025-01-15T02:00:00Z",
        end_date: "2025-01-15T04:00:00Z",
      },
      validation_results: [],
      summary: {
        total_checks: 14,
        passed: 8,
        failed: 6,
        warnings: 5,
        required_failed: 6,
      },
      failed_requirements: [
        "All Template Questions Answered",
        "Valid Start Date / Lead Time",
        "MTSA Required & Upload Found",
        "Review TSR File Data/Answers",
        "Review MTSA File Data/Answers",
        "Review Validation Plan File Data/Answers",
      ],
      approval_actions: [],
    }
  }
}

const getStateBadge = (state: string) => {
  switch (state.toLowerCase()) {
    case "new":
      return (
        <Badge className="bg-blue-500 hover:bg-blue-600">
          <Clock className="w-3 h-3 mr-1" /> New
        </Badge>
      )
    case "assess":
      return (
        <Badge className="bg-yellow-500 hover:bg-yellow-600">
          <AlertCircle className="w-3 h-3 mr-1" /> Assess
        </Badge>
      )
    case "authorize":
      return (
        <Badge className="bg-orange-500 hover:bg-orange-600">
          <AlertCircle className="w-3 h-3 mr-1" /> Authorize
        </Badge>
      )
    case "scheduled":
      return (
        <Badge className="bg-purple-500 hover:bg-purple-600">
          <Calendar className="w-3 h-3 mr-1" /> Scheduled
        </Badge>
      )
    case "implement":
      return (
        <Badge className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className="w-3 h-3 mr-1" /> Implement
        </Badge>
      )
    case "review":
      return (
        <Badge className="bg-indigo-500 hover:bg-indigo-600">
          <Search className="w-3 h-3 mr-1" /> Review
        </Badge>
      )
    case "closed":
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Check className="w-3 h-3 mr-1" /> Closed
        </Badge>
      )
    case "canceled":
      return (
        <Badge variant="outline">
          <X className="w-3 h-3 mr-1" /> Canceled
        </Badge>
      )
    default:
      return <Badge variant="outline">{state}</Badge>
  }
}

const getPriorityBadge = (priority: string) => {
  if (priority.includes("1") || priority.toLowerCase().includes("critical")) {
    return <Badge className="bg-red-500 hover:bg-red-600">{priority}</Badge>
  } else if (priority.includes("2") || priority.toLowerCase().includes("high")) {
    return <Badge className="bg-orange-500 hover:bg-orange-600">{priority}</Badge>
  } else if (priority.includes("3") || priority.toLowerCase().includes("moderate")) {
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">{priority}</Badge>
  } else {
    return <Badge variant="outline">{priority}</Badge>
  }
}

const getRiskImpactBadge = (level: string) => {
  switch (level.toLowerCase()) {
    case "high":
      return <Badge className="bg-red-500 hover:bg-red-600">{level}</Badge>
    case "medium":
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">{level}</Badge>
    case "low":
      return <Badge className="bg-green-500 hover:bg-green-600">{level}</Badge>
    default:
      return <Badge variant="outline">{level}</Badge>
  }
}

const convertToCSV = (validationResult: ChangeValidation): string => {
  const headers = [
    "Change Number",
    "Validation Status",
    "Overall Score",
    "Execution Time",
    "Executed By",
    "Executed On",
    "Total Checks",
    "Passed",
    "Failed",
    "Warnings",
    "Required Failed",
  ]

  const values = [
    validationResult.change_number,
    validationResult.validation_status,
    validationResult.overall_score,
    validationResult.execution_time,
    validationResult.executed_by,
    validationResult.executed_on,
    validationResult.summary.total_checks,
    validationResult.summary.passed,
    validationResult.summary.failed,
    validationResult.summary.warnings,
    validationResult.summary.required_failed,
  ]

  let csv = headers.join(",") + "\n"
  csv += values.join(",") + "\n\n"

  csv += "Validation Results\n"
  csv += "Item,Category,Status,Required,Message,Details\n"
  validationResult.validation_results.forEach((result, index) => {
    csv += `"${result.item}","${result.category}","${result.status}","${result.required}","${result.message}","${result.details || ""}"\n`
  })

  return csv
}

const downloadCSV = (validationResult: ChangeValidation) => {
  const csv = convertToCSV(validationResult)
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  const url = URL.createObjectURL(blob)
  link.setAttribute("href", url)
  link.setAttribute("download", `${validationResult.change_number}_validation.csv`)
  link.style.visibility = "hidden"
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const getHistoryResultBadge = (result: string) => {
  switch (result) {
    case "pass":
      return (
        <Badge className="bg-green-100 text-green-800 hover:bg-green-100">
          <CheckCircle className="mr-1 h-3 w-3" />
          Pass
        </Badge>
      )
    case "fail":
      return (
        <Badge className="bg-red-100 text-red-800 hover:bg-red-100">
          <XCircle className="mr-1 h-3 w-3" />
          Fail
        </Badge>
      )
    case "warn":
      return (
        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">
          <AlertTriangle className="mr-1 h-3 w-3" />
          Warn
        </Badge>
      )
    default:
      return null
  }
}

const formatHistoryDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

const extractShowingResultsLine = (scriptOutput: string): string => {
  const lines = scriptOutput.split("\n")
  const showingResultsIndex = lines.findIndex((line) => line.startsWith("Showing results for"))

  if (showingResultsIndex !== -1) {
    let fullDescription = ""
    let currentIndex = showingResultsIndex

    while (currentIndex < lines.length && !lines[currentIndex].startsWith("-----------")) {
      if (currentIndex === showingResultsIndex) {
        fullDescription += lines[currentIndex]
      } else if (lines[currentIndex].trim() !== "") {
        fullDescription += " " + lines[currentIndex].trim()
      }
      currentIndex++
    }

    const match = fullDescription.match(/Showing results for ([^,]+), Mnemonic: ([A-Z]+)\s*-\s*(.+)/)
    if (match) {
      const changeNumber = match[1].trim()
      const mnemonic = match[2].trim()
      const description = match[3].trim()
      return `${changeNumber} | Mnemonic: ${mnemonic} | ${description}`
    }

    const fallbackMatch = fullDescription.match(/Showing results for ([^,]+), (.+)/)
    if (fallbackMatch) {
      const changeNumber = fallbackMatch[1].trim()
      const rest = fallbackMatch[2].trim()
      return `${changeNumber} | ${rest}`
    }
  }

  return "No results found"
}

export default function ChangeLookupPage() {
  const [changeNumber, setChangeNumber] = useState("")
  const [validationResult, setValidationResult] = useState<ChangeValidation | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showHelp, setShowHelp] = useState(false)
  const [showHistoryHelp, setShowHistoryHelp] = useState(false)
  const [activeTab, setActiveTab] = useState("validation")
  
  // History tab state
  const [historySearchQuery, setHistorySearchQuery] = useState("")
  const [historySubmittedQuery, setHistorySubmittedQuery] = useState("")
  const [historyLobFilter, setHistoryLobFilter] = useState("All")
  const [historyLogs, setHistoryLogs] = useState<ValidationLog[]>(mockAllHistory)
  const [historyExpandedRows, setHistoryExpandedRows] = useState<Set<string>>(new Set())
  const [historyLoading, setHistoryLoading] = useState(false)

  const handleValidation = async () => {
    if (!changeNumber.trim()) {
      setError("Please enter a change number")
      return
    }

    setLoading(true)
    setError(null)
    setValidationResult(null)

    try {
      const result = await validateChangeRecord(changeNumber.trim())
      if (result === null) {
        setError(`Change number "${changeNumber}" was not found. Please verify the change number and try again.`)
      } else {
        setValidationResult(result)
      }
    } catch (err) {
      setError("Failed to validate change record. Please check the change number and try again.")
      console.error("API Error:", err)
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleValidation()
    }
  }

  // History functions
  const fetchHistory = async (changeNum: string, lobFilter: string = "All") => {
    setHistoryLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 500))
    
    let filteredLogs: ValidationLog[]
    
    if (changeNum) {
      filteredLogs = generateMockHistory(changeNum, lobFilter)
    } else {
      filteredLogs = lobFilter === "All" 
        ? mockAllHistory 
        : mockAllHistory.filter(log => log.line_of_business === lobFilter)
    }
    
    setHistoryLogs(filteredLogs)
    setHistoryLoading(false)
  }

  const handleHistorySearch = () => {
    setHistorySubmittedQuery(historySearchQuery)
    fetchHistory(historySearchQuery, historyLobFilter)
  }

  const handleLobFilterChange = (value: string) => {
    setHistoryLobFilter(value)
    fetchHistory(historySubmittedQuery, value)
  }

  const handleHistoryKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleHistorySearch()
    }
  }

  const toggleHistoryRow = (id: string) => {
    const newExpanded = new Set(historyExpandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setHistoryExpandedRows(newExpanded)
  }

  const downloadHistoryCSV = () => {
    const headers = ["Validation ID", "Change Number", "Executed By", "Date", "Result", "Score", "Passed", "Failed", "Total", "Duration", "Mnemonic", "Description"]
    const rows = historyLogs.map((log) => [
      log.id,
      log.change_number,
      log.executed_by,
      formatHistoryDate(log.executed_at),
      log.result,
      `${log.overall_score}%`,
      log.passed_checks,
      log.failed_checks,
      log.total_checks,
      log.duration,
      log.mnemonic,
      log.description,
    ])

    const csvContent = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `validation-history${historySubmittedQuery ? `-${historySubmittedQuery}` : ""}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex flex-col border-b bg-background">
        <div className="flex h-14 items-center gap-4 px-4 sm:px-6">
          <h1 className="text-lg font-semibold">MOZ Dash</h1>
          <span className="text-muted-foreground">|</span>
          <span className="text-sm text-muted-foreground">CR Validation Automation</span>
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="px-4 sm:px-6">
          <TabsList className="h-10">
            <TabsTrigger value="validation" className="gap-2">
              <Search className="h-4 w-4" />
              Validation
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <History className="h-4 w-4" />
              Historical Logs
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </header>

      <main className="flex-1 grid grid-rows-[auto_1fr] gap-4 p-4 md:gap-6 md:p-6 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsContent value="validation" className="mt-0 space-y-4">
        {/* Help Section */}
        <Collapsible open={showHelp} onOpenChange={setShowHelp}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Info className="h-4 w-4" />
              <span>Help & Information</span>
              {showHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <Card className="mb-4">
              <CardHeader>
                <CardTitle className="text-base">How to Use CR Validation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div>
                  <h4 className="font-medium mb-1">Getting Started:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>Enter a ServiceNow Change Request number (e.g., CHG0000123)</li>
                    <li>Click "Validate Change" or press Enter to run validation</li>
                    <li>Review the automation script output and action items</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Test Examples:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <code className="bg-muted px-1 rounded">CHG0000001</code> or{" "}
                      <code className="bg-muted px-1 rounded">pass</code> - Shows a passing validation
                    </li>
                    <li>
                      <code className="bg-muted px-1 rounded">CHG0000002</code> - Shows a failing validation with action
                      items
                    </li>
                    <li>
                      <code className="bg-muted px-1 rounded">notfound</code> - Simulates a change not found error
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Understanding Results:</h4>
                  <ul className="list-disc list-inside space-y-1 ml-2">
                    <li>
                      <span className="text-green-600 font-medium">Ready</span> - All validation checks passed, ready
                      for approval
                    </li>
                    <li>
                      <span className="text-red-600 font-medium">Not Ready</span> - Failed validation checks require
                      attention
                    </li>
                    <li>
                      <span className="text-yellow-600 font-medium">Caution</span> - Some warnings present but may
                      proceed
                    </li>
                  </ul>
                </div>
              </CardContent>
            </Card>
          </CollapsibleContent>
        </Collapsible>

        <Card>
          <CardHeader>
            <CardTitle>Enter a Change Number to Validate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 md:flex-row md:items-end">
              <div className="flex-1">
                <Label htmlFor="change-number">Enter a Change Number to Validate</Label>
                <Input
                  id="change-number"
                  placeholder="CHG0000123"
                  value={changeNumber}
                  onChange={(e) => setChangeNumber(e.target.value)}
                  onKeyPress={handleKeyPress}
                  disabled={loading}
                />
              </div>
              <Button
                onClick={handleValidation}
                disabled={loading || !changeNumber.trim()}
                className="md:w-auto w-full"
              >
                {loading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Validating...
                  </>
                ) : (
                  <>
                    <Search className="mr-2 h-4 w-4" />
                    Validate Change
                  </>
                )}
              </Button>
              <Link href="/change-lookup/history">
                <Button variant="outline" className="md:w-auto w-full">
                  <History className="mr-2 h-4 w-4" />
                  View Historical Logs
                </Button>
              </Link>
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-md">
                <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                  <AlertCircle className="h-4 w-4" />
                  <span>{error}</span>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {validationResult && (
          <div className="grid grid-rows-[auto_auto_1fr_auto] gap-4 h-full overflow-hidden">
            <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
              <div>
                <h3 className="text-lg font-semibold">Validation Results</h3>
                <p className="text-sm text-muted-foreground">
                  {extractShowingResultsLine(validationResult.script_output)}
                </p>
              </div>
              <div className="flex items-start gap-2 md:mt-0 mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => {
                    setHistorySearchQuery(validationResult.change_number)
                    setHistorySubmittedQuery(validationResult.change_number)
                    fetchHistory(validationResult.change_number)
                    setActiveTab("history")
                  }}
                >
                  <History className="mr-2 h-4 w-4" />
                  View History
                </Button>
                <Button size="sm" onClick={() => downloadCSV(validationResult)}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 flex-1 overflow-hidden">
              <Card className="flex flex-col overflow-hidden">
                <CardHeader className="pb-3 flex-shrink-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-base">Validation Output</CardTitle>
                      <CardDescription className="text-sm">Automation script execution results</CardDescription>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex flex-col gap-1 text-left items-start">
                        <div className="text-xs font-medium text-muted-foreground">Overall Score</div>
                        <div className="flex items-center gap-2">
                          <div className="w-16">
                            <Progress value={validationResult.overall_score} className="h-1.5" />
                          </div>
                          <div className="text-sm font-bold min-w-[3rem]">{validationResult.overall_score}%</div>
                        </div>
                      </div>
                      <div className="flex flex-col items-center gap-0.5">
                        {validationResult.validation_status === "pass" ? (
                          <Badge className="bg-green-500 hover:bg-green-600 text-xs px-2 py-0.5">
                            <Check className="w-2.5 h-2.5 mr-1" /> Ready
                          </Badge>
                        ) : validationResult.validation_status === "warn" ? (
                          <Badge className="bg-yellow-500 hover:bg-yellow-600 text-xs px-2 py-0.5">
                            <AlertTriangle className="w-2.5 h-2.5 mr-1" /> Caution
                          </Badge>
                        ) : (
                          <Badge className="bg-red-500 hover:bg-red-600 text-xs px-2 py-0.5">
                            <X className="w-2.5 h-2.5 mr-1" /> Not Ready
                          </Badge>
                        )}
                        <div className="text-xs text-muted-foreground">
                          {validationResult.summary.passed}/{validationResult.summary.total_checks} passed
                        </div>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 overflow-hidden">
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg font-mono text-sm h-full overflow-auto">
                    <pre className="whitespace-pre-wrap">
                      {validationResult.script_output.split("\n").map((line, index) => {
                        const lineNumber = index + 1
                        let lineClass = "text-gray-100"

                        if (line.startsWith("INFO:")) {
                          lineClass = "text-blue-400"
                        } else if (line.startsWith("WARNING:")) {
                          lineClass = "text-yellow-400"
                        } else if (line.startsWith("ERROR:")) {
                          lineClass = "text-red-400"
                        } else if (line.includes("Satisfied: True")) {
                          lineClass = "text-green-400"
                        } else if (line.includes("Satisfied: False")) {
                          lineClass = "text-red-400"
                        } else if (line.includes("Passed:") || line.includes("Failed:")) {
                          lineClass = "text-white font-semibold"
                        }

                        return (
                          <div key={index} className="flex">
                            <span className="text-gray-500 select-none w-8 text-right mr-4 flex-shrink-0">
                              {lineNumber}
                            </span>
                            <span className={lineClass}>{line}</span>
                          </div>
                        )
                      })}
                    </pre>
                  </div>
                </CardContent>
              </Card>

              <div className="flex flex-col gap-4 overflow-hidden">
                <div className="flex-1 flex flex-col overflow-hidden">
                  <div className="pb-3 flex-shrink-0">
                    <div className="flex items-center gap-2 mb-1">
                      {validationResult.validation_status === "pass" ? (
                        <>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                          <h3 className="text-base font-semibold">Ready for Approval</h3>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="h-4 w-4 text-amber-500" />
                          <h3 className="text-base font-semibold">Next Steps & Action Items</h3>
                        </>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {validationResult.validation_status === "pass"
                        ? "All validation checks passed - ready to proceed"
                        : "Complete these items to improve validation score"}
                    </p>
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <div className="space-y-3 h-full overflow-y-auto">
                      {validationResult.approval_actions.map((action, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-green-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                            {index + 1}
                          </div>
                          <Card className="flex-1">
                            <CardContent className="p-3">
                              <span className="text-sm font-medium text-green-700 dark:text-green-300">{action}</span>
                            </CardContent>
                          </Card>
                        </div>
                      ))}

                      {validationResult.failed_requirements.map((requirement, index) => (
                        <div key={index} className="flex items-start gap-3">
                          <div className="flex items-center justify-center w-6 h-6 bg-amber-500 text-white text-xs font-bold rounded-full flex-shrink-0">
                            {index + 1}
                          </div>
                          <Card className="flex-1">
                            <CardContent className="p-3">
                              <span className="text-sm font-medium">{requirement}</span>
                            </CardContent>
                          </Card>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Card className="flex-shrink-0">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Execution Details</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Executed By</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <User className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{validationResult.executed_by}</span>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs font-medium text-muted-foreground">Executed On</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">{new Date(validationResult.executed_on).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
          </TabsContent>

          <TabsContent value="history" className="mt-0 space-y-4">
            {/* History Help Section */}
            <Collapsible open={showHistoryHelp} onOpenChange={setShowHistoryHelp}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
                >
                  <Info className="h-4 w-4" />
                  <span>Help & Information</span>
                  {showHistoryHelp ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <Card className="mb-4">
                  <CardHeader>
                    <CardTitle className="text-base">How to Use Historical Logs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3 text-sm">
                    <div>
                      <h4 className="font-medium mb-1">Browsing Logs:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>By default, view all recent validation attempts across all changes</li>
                        <li>Click on a <span className="text-primary font-medium">Change #</span> to filter and see all validation runs for that specific change</li>
                        <li>Click the expand arrow to view additional details for any log entry</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Searching:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Enter a change number in the search box and click "Search" to filter results</li>
                        <li>Use the <span className="text-primary font-medium">Line of Business</span> dropdown to filter by department or business unit</li>
                        <li>Combine both filters to narrow down results further</li>
                        <li>Click "Clear All" to reset all filters and return to viewing all logs</li>
                        <li>Use "Export CSV" to download the current filtered view for reporting</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Understanding Results:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>
                          <span className="text-green-600 font-medium">Pass</span> - Validation completed successfully
                        </li>
                        <li>
                          <span className="text-red-600 font-medium">Fail</span> - Validation failed with issues requiring attention
                        </li>
                        <li>
                          <span className="text-yellow-600 font-medium">Warn</span> - Validation passed with warnings
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Actions:</h4>
                      <ul className="list-disc list-inside space-y-1 ml-2">
                        <li>Click "Run New Validation" in the expanded row to re-validate a change</li>
                        <li>Use the Validation tab to run fresh validations on any change</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </CollapsibleContent>
            </Collapsible>

            {/* History Search Card */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Search Validation History</CardTitle>
                <CardDescription>
                  Search for validation history by change number, filter by line of business, or browse all recent validation attempts
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Enter change number (e.g., CHG1234567) or leave blank for all"
                      value={historySearchQuery}
                      onChange={(e) => setHistorySearchQuery(e.target.value)}
                      onKeyPress={handleHistoryKeyPress}
                      className="pl-9"
                    />
                  </div>
                  <Button onClick={handleHistorySearch} disabled={historyLoading}>
                    {historyLoading ? "Searching..." : "Search"}
                  </Button>
                  {(historySubmittedQuery || historyLobFilter !== "All") && (
                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setHistorySearchQuery("")
                        setHistorySubmittedQuery("")
                        setHistoryLobFilter("All")
                        setHistoryLogs(mockAllHistory)
                      }}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* History Results Card */}
            <Card className="flex-1">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-base">
                      {historySubmittedQuery ? `Validation History for ${historySubmittedQuery}` : "Recent Validation Logs"}
                    </CardTitle>
                    <CardDescription>
                      {historyLogs.length} validation attempt{historyLogs.length !== 1 ? "s" : ""} found
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <Label htmlFor="lob-filter" className="text-sm text-muted-foreground whitespace-nowrap">Line of Business:</Label>
                      <Select value={historyLobFilter} onValueChange={handleLobFilterChange}>
                        <SelectTrigger id="lob-filter" className="w-[180px]">
                          <SelectValue placeholder="All" />
                        </SelectTrigger>
                        <SelectContent>
                          {LINES_OF_BUSINESS.map((lob) => (
                            <SelectItem key={lob} value={lob}>
                              {lob}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {historyLobFilter !== "All" && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => {
                            setHistoryLobFilter("All")
                            fetchHistory(historySubmittedQuery, "All")
                          }}
                          className="h-8 w-8 p-0"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    {historyLogs.length > 0 && (
                      <Button size="sm" variant="outline" onClick={downloadHistoryCSV}>
                        <Download className="mr-2 h-4 w-4" />
                        Export CSV
                      </Button>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {historyLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : historyLogs.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    No validation logs found. Try a different search term.
                  </div>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead className="w-[40px]"></TableHead>
                          {!historySubmittedQuery && <TableHead>Change #</TableHead>}
                          <TableHead>Validation ID</TableHead>
                          <TableHead>Line of Business</TableHead>
                          <TableHead>Executed By</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Result</TableHead>
                          <TableHead className="text-right">Score</TableHead>
                          <TableHead className="text-right">Checks</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {historyLogs.map((log) => (
                          <React.Fragment key={log.id}>
                            <TableRow className="cursor-pointer hover:bg-muted/50" onClick={() => toggleHistoryRow(log.id)}>
                              <TableCell>
                                <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                  {historyExpandedRows.has(log.id) ? (
                                    <ChevronUp className="h-4 w-4" />
                                  ) : (
                                    <ChevronDown className="h-4 w-4" />
                                  )}
                                </Button>
                              </TableCell>
                              {!historySubmittedQuery && (
                                <TableCell className="font-mono text-sm">
                                  <Button
                                    variant="link"
                                    size="sm"
                                    className="h-auto p-0 text-primary font-mono"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setHistorySearchQuery(log.change_number)
                                      setHistorySubmittedQuery(log.change_number)
                                      fetchHistory(log.change_number, historyLobFilter)
                                    }}
                                  >
                                    {log.change_number}
                                  </Button>
                                </TableCell>
                              )}
                              <TableCell className="font-mono text-sm">{log.id}</TableCell>
                              <TableCell>
                                <Badge variant="outline" className="font-normal">
                                  {log.line_of_business}
                                </Badge>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <User className="h-3 w-3 text-muted-foreground" />
                                  {log.executed_by}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3 text-muted-foreground" />
                                  {formatHistoryDate(log.executed_at)}
                                </div>
                              </TableCell>
                              <TableCell>{getHistoryResultBadge(log.result)}</TableCell>
                              <TableCell className="text-right font-medium">{log.overall_score}%</TableCell>
                              <TableCell className="text-right">
                                <span className="text-green-600">{log.passed_checks}</span>
                                <span className="text-muted-foreground">/</span>
                                <span className="text-red-600">{log.failed_checks}</span>
                              </TableCell>
                            </TableRow>
                            {historyExpandedRows.has(log.id) && (
                              <TableRow className="bg-muted/30">
                                <TableCell colSpan={historySubmittedQuery ? 8 : 9} className="p-4">
                                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                    <div>
                                      <span className="text-muted-foreground">Mnemonic:</span>
                                      <span className="ml-2 font-medium">{log.mnemonic}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Duration:</span>
                                      <span className="ml-2 font-medium">{log.duration}</span>
                                    </div>
                                    <div>
                                      <span className="text-muted-foreground">Total Checks:</span>
                                      <span className="ml-2 font-medium">{log.total_checks}</span>
                                    </div>
                                    <div>
                                      <Button
                                        variant="link"
                                        size="sm"
                                        className="h-auto p-0 text-primary"
                                        onClick={(e) => {
                                          e.stopPropagation()
                                          setChangeNumber(log.change_number)
                                          setActiveTab("validation")
                                        }}
                                      >
                                        <ExternalLink className="h-3 w-3 mr-1" />
                                        Run New Validation
                                      </Button>
                                    </div>
                                  </div>
                                  <div className="mt-2 text-sm">
                                    <span className="text-muted-foreground">Description:</span>
                                    <span className="ml-2">{log.description}</span>
                                  </div>
                                </TableCell>
                              </TableRow>
                            )}
                          </React.Fragment>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
