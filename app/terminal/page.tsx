"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/hooks/use-web3"
import { useToast } from "@/components/ui/use-toast"
import { TerminalIcon, Send, X } from "lucide-react"
import { Input } from "@/components/ui/input"
import { TerminalEmulator } from "@/components/terminal-emulator"
import { ServerSelector } from "@/components/server-selector"

export default function TerminalPage() {
  const searchParams = useSearchParams()
  const serverId = searchParams.get("server")
  const { isConnected } = useWeb3()
  const { toast } = useToast()
  const [selectedServer, setSelectedServer] = useState<string | null>(serverId)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnectedToServer, setIsConnectedToServer] = useState(false)
  const [command, setCommand] = useState("")

  useEffect(() => {
    if (serverId) {
      setSelectedServer(serverId)
    }
  }, [serverId])

  const connectToServer = async () => {
    if (!selectedServer) {
      toast({
        title: "No Server Selected",
        description: "Please select a server to connect to.",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)

    // Simulate connection delay
    await new Promise((resolve) => setTimeout(resolve, 2000))

    setIsConnecting(false)
    setIsConnectedToServer(true)

    toast({
      title: "Connected",
      description: "Terminal connection established successfully.",
    })
  }

  const disconnectFromServer = () => {
    setIsConnectedToServer(false)
    toast({
      title: "Disconnected",
      description: "Terminal connection closed.",
    })
  }

  const sendCommand = (e: React.FormEvent) => {
    e.preventDefault()
    if (!command.trim()) return

    // In a real implementation, this would send the command to the server
    console.log("Sending command:", command)
    setCommand("")
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <CardDescription>Please connect your wallet to access the terminal</CardDescription>
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
            <h1 className="text-3xl font-bold tracking-tight">SSH Terminal</h1>
            <p className="text-muted-foreground">Connect to your server via secure SSH terminal</p>
          </div>
          {isConnectedToServer ? (
            <Button variant="destructive" onClick={disconnectFromServer} className="gap-2">
              <X className="h-4 w-4" />
              Disconnect
            </Button>
          ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <ServerSelector
                selectedServer={selectedServer}
                onServerChange={setSelectedServer}
                className="flex-1 md:w-[200px]"
              />
              <Button onClick={connectToServer} disabled={!selectedServer || isConnecting} className="gap-2">
                <TerminalIcon className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          )}
        </div>

        <Card className="w-full">
          <CardContent className="p-0">
            {isConnectedToServer ? (
              <div className="flex flex-col h-[70vh]">
                <div className="flex-1 bg-black text-green-500 p-4 font-mono text-sm overflow-auto">
                  <TerminalEmulator />
                </div>
                <form onSubmit={sendCommand} className="border-t p-2 flex gap-2">
                  <Input
                    value={command}
                    onChange={(e) => setCommand(e.target.value)}
                    placeholder="Enter command..."
                    className="font-mono"
                  />
                  <Button type="submit" size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </form>
              </div>
            ) : (
              <div className="flex items-center justify-center p-12 h-[70vh]">
                <div className="text-center">
                  <TerminalIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="text-lg font-medium">No Active Connection</h3>
                  <p className="text-muted-foreground mt-2">Select a server and connect to start a terminal session</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
