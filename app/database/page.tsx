"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/hooks/use-web3"
import { useToast } from "@/components/ui/use-toast"
import { Database, RefreshCw, Play, X, Save, Plus } from "lucide-react"
import { ServerSelector } from "@/components/server-selector"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ScrollArea } from "@/components/ui/scroll-area"
import { DatabaseSchemaViewer } from "@/components/database-schema-viewer"
import { DatabaseQueryResults } from "@/components/database-query-results"

type DatabaseConnection = {
  id: string
  name: string
  type: "mysql" | "postgresql" | "mongodb"
  host: string
  port: number
  user: string
  database: string
}

export default function DatabasePage() {
  const searchParams = useSearchParams()
  const connectionId = searchParams.get("connection")
  const { isConnected } = useWeb3()
  const { toast } = useToast()
  const [selectedConnection, setSelectedConnection] = useState<string | null>(connectionId)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnectedToDatabase, setIsConnectedToDatabase] = useState(false)
  const [connections, setConnections] = useState<DatabaseConnection[]>([
    {
      id: "1",
      name: "Local MySQL",
      type: "mysql",
      host: "localhost",
      port: 3306,
      user: "root",
      database: "test",
    },
    {
      id: "2",
      name: "Production DB",
      type: "mysql",
      host: "db.example.com",
      port: 3306,
      user: "admin",
      database: "production",
    },
  ])
  const [currentQuery, setCurrentQuery] = useState("SELECT * FROM users LIMIT 10;")
  const [queryResults, setQueryResults] = useState<any>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [savedQueries, setSavedQueries] = useState([
    { id: "1", name: "Get Users", query: "SELECT * FROM users LIMIT 10;" },
    { id: "2", name: "Recent Orders", query: "SELECT * FROM orders ORDER BY created_at DESC LIMIT 20;" },
  ])

  useEffect(() => {
    if (connectionId) {
      setSelectedConnection(connectionId)
    }
  }, [connectionId])

  const connectToDatabase = async () => {
    if (!selectedConnection) {
      toast({
        title: "No Database Selected",
        description: "Please select a database connection.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsConnecting(false)
    setIsConnectedToDatabase(true)

    toast({
      title: "Connected",
      description: "Database connection established successfully.",
    })
  }

  const disconnectFromDatabase = () => {
    setIsConnectedToDatabase(false)
    setQueryResults(null)
    toast({
      title: "Disconnected",
      description: "Database connection closed.",
    })
  }

  const executeQuery = async () => {
    if (!currentQuery.trim()) {
      toast({
        title: "Empty Query",
        description: "Please enter a SQL query to execute.",
        variant: "destructive",
      })
      return
    }

    setIsExecuting(true)

    // Simulate query execution delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Mock query results
    if (currentQuery.toLowerCase().includes("select * from users")) {
      setQueryResults({
        columns: ["id", "username", "email", "created_at"],
        rows: [
          { id: 1, username: "john_doe", email: "john@example.com", created_at: "2023-01-15" },
          { id: 2, username: "jane_smith", email: "jane@example.com", created_at: "2023-02-20" },
          { id: 3, username: "bob_johnson", email: "bob@example.com", created_at: "2023-03-10" },
        ],
      })
    } else if (currentQuery.toLowerCase().includes("select * from orders")) {
      setQueryResults({
        columns: ["id", "user_id", "amount", "status", "created_at"],
        rows: [
          { id: 101, user_id: 1, amount: 99.99, status: "completed", created_at: "2023-04-01" },
          { id: 102, user_id: 2, amount: 149.99, status: "pending", created_at: "2023-04-02" },
          { id: 103, user_id: 1, amount: 29.99, status: "completed", created_at: "2023-04-03" },
        ],
      })
    } else {
      setQueryResults({
        columns: ["result"],
        rows: [{ result: "Query executed successfully. 0 rows affected." }],
      })
    }

    setIsExecuting(false)

    toast({
      title: "Query Executed",
      description: "The SQL query was executed successfully.",
    })
  }

  const saveCurrentQuery = () => {
    if (!currentQuery.trim()) return

    const newQuery = {
      id: Date.now().toString(),
      name: `Query ${savedQueries.length + 1}`,
      query: currentQuery,
    }

    setSavedQueries([...savedQueries, newQuery])

    toast({
      title: "Query Saved",
      description: "Your query has been saved for future use.",
    })
  }

  const loadSavedQuery = (query: string) => {
    setCurrentQuery(query)
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <p className="text-muted-foreground">Please connect your wallet to access the database management</p>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={() => (window.location.href = "/")}>
                Return to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Database Management</h1>
            <p className="text-muted-foreground">Execute queries and manage your databases securely</p>
          </div>
          {isConnectedToDatabase ? (
            <Button variant="destructive" onClick={disconnectFromDatabase} className="gap-2">
              <X className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <ServerSelector
                selectedServer={selectedConnection}
                onServerChange={setSelectedConnection}
                className="flex-1 md:w-[200px]"
              />
              <Button onClick={connectToDatabase} disabled={!selectedConnection || isConnecting} className="gap-2">
                <Database className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          )}
        </div>

        {isConnectedToDatabase ? (
          <Tabs defaultValue="query" className="w-full">
            <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
              <TabsTrigger value="query">Query Editor</TabsTrigger>
              <TabsTrigger value="schema">Database Schema</TabsTrigger>
              <TabsTrigger value="saved" className="hidden md:block">
                Saved Queries
              </TabsTrigger>
            </TabsList>

            <TabsContent value="query" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>SQL Query</CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={saveCurrentQuery}
                        disabled={!currentQuery.trim()}
                        className="gap-2"
                      >
                        <Save className="h-4 w-4" />
                        Save
                      </Button>
                      <Button
                        size="sm"
                        onClick={executeQuery}
                        disabled={!currentQuery.trim() || isExecuting}
                        className="gap-2"
                      >
                        <Play className="h-4 w-4" />
                        {isExecuting ? "Executing..." : "Execute"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <Textarea
                    value={currentQuery}
                    onChange={(e) => setCurrentQuery(e.target.value)}
                    placeholder="Enter SQL query..."
                    className="font-mono min-h-[200px]"
                  />
                </CardContent>
              </Card>

              {queryResults && (
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle>Results</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <DatabaseQueryResults results={queryResults} />
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="schema">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Database Schema</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <RefreshCw className="h-4 w-4" />
                      Refresh
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <DatabaseSchemaViewer />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="saved">
              <Card>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-center">
                    <CardTitle>Saved Queries</CardTitle>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Plus className="h-4 w-4" />
                      New Query
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <ScrollArea className="h-[400px]">
                    <div className="space-y-4">
                      {savedQueries.map((savedQuery) => (
                        <Card key={savedQuery.id}>
                          <CardHeader className="py-2">
                            <CardTitle className="text-base">{savedQuery.name}</CardTitle>
                          </CardHeader>
                          <CardContent className="py-2">
                            <pre className="text-sm bg-muted p-2 rounded-md overflow-x-auto">
                              <code>{savedQuery.query}</code>
                            </pre>
                          </CardContent>
                          <div className="px-6 pb-4">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => loadSavedQuery(savedQuery.query)}
                              className="w-full"
                            >
                              Load Query
                            </Button>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center p-12 h-[70vh]">
              <div className="text-center">
                <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Active Connection</h3>
                <p className="text-muted-foreground mt-2">Select a database and connect to start managing your data</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
