"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Terminal, FileText, Clock } from "lucide-react"

type Connection = {
  id: string
  serverName: string
  serverHost: string
  type: "terminal" | "files"
  timestamp: string
  serverType: "linux" | "windows"
}

export function RecentConnections() {
  const router = useRouter()
  const [connections, setConnections] = useState<Connection[]>([
    {
      id: "1",
      serverName: "Ubuntu Dev Server",
      serverHost: "dev.example.com",
      type: "terminal",
      timestamp: "2 hours ago",
      serverType: "linux",
    },
    {
      id: "2",
      serverName: "Windows Production",
      serverHost: "prod.example.com",
      type: "files",
      timestamp: "1 day ago",
      serverType: "windows",
    },
    {
      id: "3",
      serverName: "Ubuntu Dev Server",
      serverHost: "dev.example.com",
      type: "files",
      timestamp: "3 days ago",
      serverType: "linux",
    },
  ])

  const reconnect = (connection: Connection) => {
    const route = connection.type === "terminal" ? "terminal" : "files"
    router.push(`/${route}?server=${connection.id}`)
  }

  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground">No recent connections</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {connection.type === "terminal" ? (
                  <Terminal className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
                <div>
                  <CardTitle className="text-base">{connection.serverName}</CardTitle>
                  <p className="text-sm text-muted-foreground">{connection.serverHost}</p>
                </div>
              </div>
              <Badge variant={connection.serverType === "linux" ? "default" : "secondary"} className="w-fit">
                {connection.serverType === "linux" ? "Linux" : "Windows"}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pb-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {connection.timestamp}
              </div>
              <Button size="sm" onClick={() => reconnect(connection)}>
                Reconnect
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
