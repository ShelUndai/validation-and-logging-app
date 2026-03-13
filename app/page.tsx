"use client"

import { useState } from "react"
import Link from "next/link"
import { AlertTriangle, ChevronDown, CheckCircle, ChevronUp, Info, Search, FileSearch } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

// Initialize state variables outside the component
const initialSearchTerm = ""
const initialStatusFilter = "all"
// Update the initialJobs array to follow the new naming conventions
const initialJobs = [
  {
    id: 1,
    name: "WEB, DB - Default Firewall Template",
    template: "Default Firewall Template",
    status: "successful",
    started: "2025-04-21T14:30:00",
    finished: "2025-04-21T14:35:22",
    duration: "5m 22s",
    user: "admin",
    inventory: "All Data Centers",
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["WEB", "DB"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 4,
      driftingGroups: 3,
      complianceScore: 88,
    },
  },
  {
    id: 2,
    name: "AUTH - Default Firewall Template",
    template: "Default Firewall Template",
    status: "running",
    started: "2025-04-22T09:15:00",
    finished: null,
    duration: "Running",
    user: "system",
    inventory: "US Data Centers",
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["AUTH"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 3,
      driftingGroups: 2,
      complianceScore: 89,
    },
  },
  {
    id: 3,
    name: "WEB - PCI Compliance - GF1",
    template: "PCI Compliance",
    status: "failed",
    started: "2025-04-21T18:45:00",
    finished: "2025-04-21T18:46:12",
    duration: "1m 12s",
    user: "admin",
    inventory: "GF1 Data Center",
    dataCenters: ["GF1"],
    mnemonics: ["WEB"],
    reportType: "drift",
    driftSummary: {
      totalServers: 8,
      driftingServers: 3,
      complianceScore: 82,
    },
  },
  {
    id: 4,
    name: "DB - Default Firewall Template - GF1",
    template: "Default Firewall Template",
    status: "successful",
    started: "2025-04-21T11:20:00",
    finished: "2025-04-21T11:22:45",
    duration: "2m 45s",
    user: "devops",
    inventory: "GF1 Data Center",
    dataCenters: ["GF1"],
    mnemonics: ["DB"],
    reportType: "drift",
    driftSummary: {
      totalServers: 6,
      driftingServers: 1,
      complianceScore: 95,
    },
  },
  {
    id: 5,
    name: "AUTH - DMZ Configuration - GF2",
    template: "DMZ Configuration",
    status: "canceled",
    started: "2025-04-21T16:10:00",
    finished: "2025-04-21T16:11:30",
    duration: "1m 30s",
    user: "jenkins",
    inventory: "GF2 Data Center",
    dataCenters: ["GF2"],
    mnemonics: ["AUTH"],
    reportType: "drift",
    driftSummary: {
      totalServers: 5,
      driftingServers: 2,
      complianceScore: 78,
    },
  },
  {
    id: 6,
    name: "WEB - Default Firewall Template - GF2",
    template: "Default Firewall Template",
    status: "pending",
    started: null,
    finished: null,
    duration: "Pending",
    user: "system",
    inventory: "GF2 Data Center",
    dataCenters: ["GF2"],
    mnemonics: ["WEB"],
    reportType: "drift",
    driftSummary: null,
  },
  {
    id: 7,
    name: "WEB, DB - Default Firewall Template",
    template: "Default Firewall Template",
    status: "successful",
    started: "2025-04-21T00:01:00",
    finished: "2025-04-21T00:03:45",
    duration: "2m 45s",
    user: "system",
    inventory: "All Data Centers",
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["WEB", "DB"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 2,
      driftingGroups: 1,
      complianceScore: 93,
    },
  },
  {
    id: 8,
    name: "AUTH, WEB - PCI Compliance",
    template: "PCI Compliance",
    status: "failed",
    started: "2025-04-20T22:15:00",
    finished: "2025-04-20T22:15:48",
    duration: "48s",
    user: "admin",
    inventory: "All Data Centers",
    dataCenters: ["GF1", "GF2"],
    mnemonics: ["AUTH", "WEB"],
    reportType: "consistency",
    driftSummary: {
      totalGroups: 4,
      driftingGroups: 3,
      complianceScore: 88,
    },
  },
]

// Mock API function to simulate ServiceNow lookup
const mockServiceNowAPI = async (changeNumber: string) => {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Determine if this should be a passing or failing example based on change number
  const isPassingExample =
    changeNumber.toLowerCase().includes("pass") ||
    changeNumber.toLowerCase().includes("good") ||
    changeNumber.toLowerCase().includes("valid") ||
    changeNumber === "CHG0000001" ||
    changeNumber === "CHG0000002"

  if (isPassingExample) {
    return {
      found: true,
      change: {
        number: changeNumber,
        title: "Firewall Rule Update - Production Environment",
        description: "Update firewall rules to allow new application traffic on ports 8080-8090",
        state: "Implement",
        priority: "3 - Moderate",
        risk: "Low",
        impact: "Low",
        category: "Network",
        assignedTo: "Network Team",
        plannedStart: "2024-01-20 02:00:00",
        plannedEnd: "2024-01-20 04:00:00",
        approvalStatus: "Approved",
        implementationPlan:
          "1. Backup current firewall config\n2. Apply new rules\n3. Test connectivity\n4. Validate application access",
        backoutPlan: "1. Restore firewall config from backup\n2. Verify connectivity\n3. Notify stakeholders",
        testPlan:
          "1. Verify application can connect on new ports\n2. Confirm no impact to existing services\n3. Run automated connectivity tests",
        businessJustification: "Required for new application deployment to support increased customer demand",
        changeAdvisoryBoard: "Approved by CAB on 2024-01-15",
        riskAssessment: "Low risk - Standard firewall rule change with established procedures",
      },
      validationResults: {
        status: "PASS",
        checks: [
          { name: "Change State", status: "PASS", message: "Change is in 'Implement' state" },
          { name: "Approval Status", status: "PASS", message: "Change has been approved by CAB" },
          { name: "Risk Level", status: "PASS", message: "Risk level is acceptable (Low)" },
          { name: "Implementation Window", status: "PASS", message: "Planned during maintenance window" },
          { name: "Documentation", status: "PASS", message: "All required documentation is complete" },
          { name: "Approver Verification", status: "PASS", message: "Valid approvers have signed off" },
        ],
      },
    }
  } else {
    return {
      found: true,
      change: {
        number: changeNumber,
        title: "Emergency Database Patch - Critical Security Fix",
        description: "Apply critical security patch to production database servers",
        state: "New",
        priority: "1 - Critical",
        risk: "High",
        impact: "High",
        category: "Database",
        assignedTo: "Database Team",
        plannedStart: "2024-01-22 01:00:00",
        plannedEnd: "2024-01-22 05:00:00",
        approvalStatus: "Pending",
        implementationPlan: "Apply security patches to all database instances",
        backoutPlan: "Restore from backup if issues occur",
        testPlan: "Basic connectivity tests",
        businessJustification: "Critical security vulnerability requires immediate patching",
        changeAdvisoryBoard: "Emergency change - CAB approval pending",
        riskAssessment: "High risk due to critical nature and limited testing time",
      },
      validationResults: {
        status: "FAIL",
        checks: [
          { name: "Change State", status: "FAIL", message: "Change is in 'New' state, should be 'Implement'" },
          { name: "Approval Status", status: "FAIL", message: "Change approval is still pending" },
          { name: "Risk Level", status: "WARN", message: "High risk change requires additional oversight" },
          { name: "Implementation Window", status: "PASS", message: "Scheduled during maintenance window" },
          { name: "Documentation", status: "FAIL", message: "Implementation plan lacks sufficient detail" },
          { name: "Approver Verification", status: "FAIL", message: "Missing required approver signatures" },
        ],
      },
    }
  }
}

function ServiceNowLookup() {
  const [changeNumber, setChangeNumber] = useState("")
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [showHelp, setShowHelp] = useState(false)

  const handleLookup = async () => {
    if (!changeNumber.trim()) return

    setLoading(true)
    try {
      const data = await mockServiceNowAPI(changeNumber.trim())
      setResult(data)
    } catch (error) {
      setResult({ found: false, error: "Failed to lookup change record" })
    } finally {
      setLoading(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleLookup()
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "PASS":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "FAIL":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "WARN":
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return null
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case "PASS":
        return <Badge className="bg-green-500 hover:bg-green-600">PASS</Badge>
      case "FAIL":
        return <Badge className="bg-red-500 hover:bg-red-600">FAIL</Badge>
      case "WARN":
        return <Badge className="bg-yellow-500 hover:bg-yellow-600">WARN</Badge>
      default:
        return <Badge variant="outline">UNKNOWN</Badge>
    }
  }

  const overallStatus = result?.validationResults?.status
  const failedChecks = result?.validationResults?.checks?.filter((check) => check.status === "FAIL") || []

  return (
    <div className="flex min-h-screen w-full flex-col bg-muted/40">
      <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <h1 className="text-lg font-semibold">ServiceNow Change Lookup</h1>
        <div className="ml-auto">
          <Button variant="outline" asChild>
            <Link href="/change-lookup">
              <FileSearch className="mr-2 h-4 w-4" />
              Change Lookup
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex-1 p-4 md:p-6 max-w-4xl mx-auto w-full">
        <div className="space-y-6">
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
                  <CardTitle className="text-base">How to Use This Tool</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div>
                    <h4 className="font-medium mb-1">Change Number Format</h4>
                    <p className="text-muted-foreground">
                      Enter a ServiceNow change number (e.g., CHG0000001, CHG0000002)
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Validation Checks</h4>
                    <p className="text-muted-foreground">
                      The system validates change state, approval status, risk level, documentation completeness, and
                      more.
                    </p>
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Test Examples</h4>
                    <ul className="text-muted-foreground space-y-1">
                      <li>
                        • <code className="bg-muted px-1 rounded">CHG0000001</code> - Example of a passing validation
                      </li>
                      <li>
                        • <code className="bg-muted px-1 rounded">CHG0000003</code> - Example of a failing validation
                      </li>
                    </ul>
                  </div>
                </CardContent>
              </Card>
            </CollapsibleContent>
          </Collapsible>

          {/* Search Section */}
          <Card>
            <CardHeader>
              <CardTitle>Change Number to Validate</CardTitle>
              <CardDescription>
                Enter a ServiceNow change number to validate its readiness for implementation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter change number (e.g., CHG0000001)"
                    value={changeNumber}
                    onChange={(e) => setChangeNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                  />
                </div>
                <Button onClick={handleLookup} disabled={loading || !changeNumber.trim()}>
                  {loading ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                  {loading ? "Looking up..." : "Lookup"}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Results Section */}
          {result && (
            <div className="space-y-6">
              {result.found ? (
                <>
                  {/* Change Details */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Change Details</CardTitle>
                        <Badge variant={result.change.state === "Implement" ? "default" : "secondary"}>
                          {result.change.state}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid gap-4 md:grid-cols-2">
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Change Number</h4>
                            <p className="text-sm text-muted-foreground">{result.change.number}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Title</h4>
                            <p className="text-sm text-muted-foreground">{result.change.title}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Priority</h4>
                            <p className="text-sm text-muted-foreground">{result.change.priority}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Risk</h4>
                            <p className="text-sm text-muted-foreground">{result.change.risk}</p>
                          </div>
                        </div>
                        <div className="space-y-3">
                          <div>
                            <h4 className="font-medium text-sm">Assigned To</h4>
                            <p className="text-sm text-muted-foreground">{result.change.assignedTo}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Planned Start</h4>
                            <p className="text-sm text-muted-foreground">{result.change.plannedStart}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Planned End</h4>
                            <p className="text-sm text-muted-foreground">{result.change.plannedEnd}</p>
                          </div>
                          <div>
                            <h4 className="font-medium text-sm">Approval Status</h4>
                            <p className="text-sm text-muted-foreground">{result.change.approvalStatus}</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Validation Results */}
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle>Validation Results</CardTitle>
                        {getStatusBadge(overallStatus)}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {result.validationResults.checks.map((check, index) => (
                          <div key={index} className="flex items-start gap-3 p-3 rounded-lg border">
                            {getStatusIcon(check.status)}
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-sm">{check.name}</h4>
                                {getStatusBadge(check.status)}
                              </div>
                              <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Action Steps */}
                  {overallStatus === "PASS" ? (
                    <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
                      <CardHeader>
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-5 w-5 text-green-500" />
                          <CardTitle className="text-green-700 dark:text-green-300">Ready for Approval</CardTitle>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="text-center py-6">
                          <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                          <h3 className="text-lg font-medium text-green-700 dark:text-green-300 mb-2">
                            All Validations Passed
                          </h3>
                          <p className="text-green-600 dark:text-green-400">
                            This change request has passed all validation checks and is ready for implementation.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card>
                      <CardHeader>
                        <CardTitle>Action Steps</CardTitle>
                        <CardDescription>
                          The following items must be addressed before this change can be approved:
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {failedChecks.map((check, index) => (
                            <div key={index} className="flex gap-4">
                              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-amber-100 dark:bg-amber-900 text-amber-700 dark:text-amber-300 flex items-center justify-center text-sm font-medium">
                                {index + 1}
                              </div>
                              <Card className="flex-1">
                                <CardContent className="pt-4">
                                  <div className="flex items-start gap-3">
                                    <AlertTriangle className="h-4 w-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <h4 className="font-medium text-sm">{check.name}</h4>
                                      <p className="text-sm text-muted-foreground mt-1">{check.message}</p>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </>
              ) : (
                <Card>
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
                      <h3 className="text-lg font-medium mb-2">Change Not Found</h3>
                      <p className="text-muted-foreground">
                        {result.error || "The specified change number could not be found in ServiceNow."}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function Home() {
  return <ServiceNowLookup />
}
