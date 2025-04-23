"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ConnectButton } from "@/components/connect-button"
import { ServerList } from "@/components/server-list"
import { RecentConnections } from "@/components/recent-connections"
import { DashboardHeader } from "@/components/dashboard-header"
import { DonateButton } from "@/components/donate-button"

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Manage your servers securely with Web3 authentication</p>
          </div>
          <div className="flex gap-2">
            <DonateButton />
            <ConnectButton />
          </div>
        </div>

        <Tabs defaultValue="servers" className="w-full">
          <TabsList className="grid w-full md:w-auto grid-cols-2 md:grid-cols-3">
            <TabsTrigger value="servers">Servers</TabsTrigger>
            <TabsTrigger value="connections">Recent Connections</TabsTrigger>
            <TabsTrigger value="database" className="hidden md:block">
              Database
            </TabsTrigger>
          </TabsList>
          <TabsContent value="servers" className="space-y-4">
            <ServerList />
            <Card>
              <CardHeader>
                <CardTitle>Add New Server</CardTitle>
                <CardDescription>Connect to a new server using SSH credentials</CardDescription>
              </CardHeader>
              <CardFooter>
                <Button className="w-full">Add Server</Button>
              </CardFooter>
            </Card>
          </TabsContent>
          <TabsContent value="connections">
            <RecentConnections />
          </TabsContent>
          <TabsContent value="database">
            <Card>
              <CardHeader>
                <CardTitle>Database Management</CardTitle>
                <CardDescription>Connect to and manage your databases with a secure Web3 connection</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Local MySQL</CardTitle>
                      <CardDescription>localhost:3306</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">Database: test</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => (window.location.href = "/database?connection=1")}
                      >
                        Connect
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Production DB</CardTitle>
                      <CardDescription>db.example.com:3306</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">Database: production</p>
                    </CardContent>
                    <CardFooter>
                      <Button
                        variant="outline"
                        className="w-full"
                        onClick={() => (window.location.href = "/database?connection=2")}
                      >
                        Connect
                      </Button>
                    </CardFooter>
                  </Card>
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-xl">Add Database</CardTitle>
                      <CardDescription>Connect to a new database</CardDescription>
                    </CardHeader>
                    <CardContent className="pb-2">
                      <p className="text-sm text-muted-foreground">MySQL, PostgreSQL, MongoDB</p>
                    </CardContent>
                    <CardFooter>
                      <Button className="w-full">Add Database</Button>
                    </CardFooter>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
