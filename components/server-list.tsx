"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Terminal, FileText, MoreVertical, Trash2, Edit } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

type Server = {
  id: string
  name: string
  host: string
  type: "linux" | "windows"
  lastConnected?: string
}

export function ServerList() {
  const router = useRouter()
  const [servers, setServers] = useState<Server[]>([
    {
      id: "1",
      name: "Ubuntu Dev Server",
      host: "dev.example.com",
      type: "linux",
      lastConnected: "2 hours ago",
    },
    {
      id: "2",
      name: "Windows Production",
      host: "prod.example.com",
      type: "windows",
      lastConnected: "1 day ago",
    },
  ])

  const handleDelete = (id: string) => {
    setServers(servers.filter((server) => server.id !== id))
  }

  const connectToTerminal = (serverId: string) => {
    router.push(`/terminal?server=${serverId}`)
  }

  const connectToFiles = (serverId: string) => {
    router.push(`/files?server=${serverId}`)
  }

  if (servers.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center p-6">
          <p className="text-muted-foreground mb-4">No servers added yet</p>
          <Button>Add Your First Server</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {servers.map((server) => (
        <Card key={server.id}>
          <CardHeader className="pb-2">
            <div className="flex justify-between items-start">
              <div>
                <CardTitle className="text-xl">{server.name}</CardTitle>
                <CardDescription>{server.host}</CardDescription>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreVertical className="h-4 w-4" />
                    <span className="sr-only">Open menu</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem className="gap-2">
                    <Edit className="h-4 w-4" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="gap-2 text-destructive focus:text-destructive"
                    onClick={() => handleDelete(server.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <Badge variant={server.type === "linux" ? "default" : "secondary"} className="mt-2 w-fit">
              {server.type === "linux" ? "Linux/Ubuntu" : "Windows"}
            </Badge>
          </CardHeader>
          <CardContent>
            {server.lastConnected && (
              <p className="text-sm text-muted-foreground">Last connected: {server.lastConnected}</p>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => connectToTerminal(server.id)}>
              <Terminal className="h-4 w-4" />
              Terminal
            </Button>
            <Button variant="outline" size="sm" className="gap-2 flex-1" onClick={() => connectToFiles(server.id)}>
              <FileText className="h-4 w-4" />
              Files
            </Button>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
