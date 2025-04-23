"use client"

import { useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/hooks/use-web3"
import { useToast } from "@/components/ui/use-toast"
import { FileText, FolderOpen, Upload, Download, X, RefreshCw, File, Folder, Edit, ExternalLink } from 'lucide-react'
import { ServerSelector } from "@/components/server-selector"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { DropZone } from "@/components/drop-zone"
import { FileEditor } from "@/components/file-editor"

type FileItem = {
  id: string
  name: string
  type: "file" | "directory"
  size?: string
  modified?: string
}

export default function FilesPage() {
  const searchParams = useSearchParams()
  const serverId = searchParams.get("server")
  const { isConnected } = useWeb3()
  const { toast } = useToast()
  const [selectedServer, setSelectedServer] = useState<string | null>(serverId)
  const [isConnecting, setIsConnecting] = useState(false)
  const [isConnectedToServer, setIsConnectedToServer] = useState(false)
  const [currentPath, setCurrentPath] = useState("/home/user")
  const [files, setFiles] = useState<FileItem[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<{
    path: string;
    name: string;
    content: string;
  } | null>(null)
  const [isLoadingFile, setIsLoadingFile] = useState(false)

  useEffect(() => {
    if (serverId) {
      setSelectedServer(serverId)
    }
  }, [serverId])

  useEffect(() => {
    if (isConnectedToServer) {
      loadFiles(currentPath)
    }
  }, [isConnectedToServer, currentPath])

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
      description: "File system connection established successfully.",
    })
  }

  const disconnectFromServer = () => {
    setIsConnectedToServer(false)
    setFiles([])
    setSelectedFile(null)
    toast({
      title: "Disconnected",
      description: "File system connection closed.",
    })
  }

  const loadFiles = async (path: string) => {
    setIsLoading(true)

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Mock file system data
    let mockFiles: FileItem[] = []

    if (path === "/home/user") {
      mockFiles = [
        { id: "1", name: "Documents", type: "directory", modified: "2023-04-15" },
        { id: "2", name: "Downloads", type: "directory", modified: "2023-04-20" },
        { id: "3", name: "Projects", type: "directory", modified: "2023-04-22" },
        { id: "4", name: ".ssh", type: "directory", modified: "2023-03-10" },
        { id: "5", name: "app.js", type: "file", size: "15 KB", modified: "2023-04-21" },
        { id: "6", name: "package.json", type: "file", size: "2 KB", modified: "2023-04-21" },
        { id: "7", name: "README.md", type: "file", size: "4 KB", modified: "2023-04-15" },
      ]
    } else if (path === "/home/user/Documents") {
      mockFiles = [
        { id: "8", name: "report.pdf", type: "file", size: "2.5 MB", modified: "2023-04-10" },
        { id: "9", name: "presentation.pptx", type: "file", size: "4.2 MB", modified: "2023-04-12" },
        { id: "10", name: "budget.xlsx", type: "file", size: "1.8 MB", modified: "2023-04-14" },
        { id: "11", name: "notes.txt", type: "file", size: "12 KB", modified: "2023-04-18" },
      ]
    } else if (path === "/home/user/Projects") {
      mockFiles = [
        { id: "11", name: "web3-project", type: "directory", modified: "2023-04-22" },
        { id: "12", name: "smart-contracts", type: "directory", modified: "2023-04-20" },
        { id: "13", name: "notes.txt", type: "file", size: "12 KB", modified: "2023-04-18" },
        { id: "14", name: "index.html", type: "file", size: "8 KB", modified: "2023-04-19" },
        { id: "15", name: "styles.css", type: "file", size: "4 KB", modified: "2023-04-19" },
        { id: "16", name: "script.js", type: "file", size: "6 KB", modified: "2023-04-20" },
      ]
    }

    setFiles(mockFiles)
    setIsLoading(false)
  }

  const navigateToDirectory = (directoryName: string) => {
    if (directoryName === "..") {
      // Go up one level
      const pathParts = currentPath.split("/")
      pathParts.pop()
      const newPath = pathParts.join("/") || "/"
      setCurrentPath(newPath)
    } else {
      // Go into directory
      setCurrentPath(`${currentPath === "/" ? "" : currentPath}/${directoryName}`)
    }
  }

  const handleFileUpload = (files: File[]) => {
    // In a real implementation, this would upload files to the server
    toast({
      title: "Files Uploaded",
      description: `${files.length} file(s) uploaded successfully.`,
    })
  }

  const openFile = async (fileName: string) => {
    setIsLoadingFile(true)
    
    try {
      // In a real implementation, this would fetch the file content from the server
      // For now, we'll simulate it with a delay and mock content
      await new Promise(resolve => setTimeout(resolve, 800))
      
      let fileContent = ""
      const filePath = `${currentPath}/${fileName}`
      
      // Generate mock content based on file extension
      const extension = fileName.split('.').pop()?.toLowerCase()
      
      switch (extension) {
        case 'js':
          fileContent = `// ${fileName}\n\nfunction hello() {\n  console.log("Hello, world!");\n}\n\nhello();`
          break
        case 'html':
          fileContent = `<!DOCTYPE html>\n<html>\n<head>\n  <title>${fileName}</title>\n</head>\n<body>\n  <h1>Hello, world!</h1>\n</body>\n</html>`
          break
        case 'css':
          fileContent = `/* ${fileName} */\n\nbody {\n  font-family: sans-serif;\n  margin: 0;\n  padding: 20px;\n}`
          break
        case 'json':
          fileContent = `{\n  "name": "example",\n  "version": "1.0.0",\n  "description": "Example package.json"\n}`
          break
        case 'md':
          fileContent = `# ${fileName}\n\nThis is an example markdown file.\n\n## Section 1\n\nHello, world!`
          break
        case 'txt':
          fileContent = `This is an example text file: ${fileName}.\n\nIt contains some plain text content for demonstration purposes.`
          break
        default:
          fileContent = `Content of ${fileName}`
      }
      
      setSelectedFile({
        path: filePath,
        name: fileName,
        content: fileContent
      })
    } catch (error) {
      console.error("Error opening file:", error)
      toast({
        title: "Error",
        description: "Failed to open file. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoadingFile(false)
    }
  }

  const saveFile = async (content: string) => {
    if (!selectedFile) return
    
    // In a real implementation, this would save the file content to the server
    // For now, we'll simulate it with a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Update the selected file with the new content
    setSelectedFile({
      ...selectedFile,
      content
    })
    
    return Promise.resolve()
  }

  const closeFile = () => {
    setSelectedFile(null)
  }

  const openInSystemEditor = async () => {
    if (!selectedFile) return
    
    // In a real implementation, this would request the daemon to open the file in the system editor
    // For now, we'll simulate it with a delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // This would normally make a request to the daemon
    return Promise.resolve()
  }

  const renderBreadcrumbs = () => {
    const pathParts = currentPath.split("/").filter(Boolean)

    return (
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink onClick={() => setCurrentPath("/")}>/</BreadcrumbLink>
          </BreadcrumbItem>
          {pathParts.map((part, index) => (
            <BreadcrumbItem key={index}>
              <BreadcrumbSeparator />
              <BreadcrumbLink
                onClick={() => {
                  const newPath = "/" + pathParts.slice(0, index + 1).join("/")
                  setCurrentPath(newPath)
                }}
              >
                {part}
              </BreadcrumbLink>
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    )
  }

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <DashboardHeader />
        <main className="flex-1 container mx-auto p-4 md:p-6 flex items-center justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Authentication Required</CardTitle>
              <p className="text-muted-foreground">Please connect your wallet to access the file system</p>
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
            <h1 className="text-3xl font-bold tracking-tight">File System</h1>
            <p className="text-muted-foreground">Browse and manage files securely with drag and drop</p>
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
                <FolderOpen className="h-4 w-4" />
                {isConnecting ? "Connecting..." : "Connect"}
              </Button>
            </div>
          )}
        </div>

        {isConnectedToServer ? (
          selectedFile ? (
            <FileEditor 
              filePath={selectedFile.path}
              fileName={selectedFile.name}
              fileContent={selectedFile.content}
              onSave={saveFile}
              onClose={closeFile}
              onOpenInSystemEditor={openInSystemEditor}
            />
          ) : (
            <Card className="w-full">
              <CardHeader className="pb-0">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                  <div className="w-full overflow-x-auto">{renderBreadcrumbs()}</div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => loadFiles(currentPath)}
                      disabled={isLoading}
                      className="gap-2"
                    >
                      <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </Button>
                    <Button variant="outline" size="sm" className="gap-2">
                      <Upload className="h-4 w-4" />
                      Upload
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <DropZone onFilesDropped={handleFileUpload}>
                  <div className="border rounded-md mt-4">
                    <div className="grid grid-cols-12 gap-2 p-2 border-b font-medium text-sm">
                      <div className="col-span-6 md:col-span-5">Name</div>
                      <div className="col-span-2 hidden md:block">Size</div>
                      <div className="col-span-4 md:col-span-3">Modified</div>
                      <div className="col-span-2">Actions</div>
                    </div>

                    {currentPath !== "/" && (
                      <div
                        className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigateToDirectory("..")}
                      >
                        <div className="col-span-6 md:col-span-5 flex items-center gap-2">
                          <Folder className="h-4 w-4 text-muted-foreground" />
                          <span>..</span>
                        </div>
                        <div className="col-span-2 hidden md:block">-</div>
                        <div className="col-span-4 md:col-span-3">-</div>
                        <div className="col-span-2">-</div>
                      </div>
                    )}

                    {isLoading ? (
                      <div className="p-8 text-center">
                        <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">Loading files...</p>
                      </div>
                    ) : files.length === 0 ? (
                      <div className="p-8 text-center">
                        <FileText className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                        <p className="text-muted-foreground">No files found in this directory</p>
                      </div>
                    ) : (
                      files.map((file) => (
                        <div
                          key={file.id}
                          className="grid grid-cols-12 gap-2 p-2 border-b hover:bg-muted/50 cursor-pointer"
                          onClick={() => file.type === "directory" && navigateToDirectory(file.name)}
                        >
                          <div className="col-span-6 md:col-span-5 flex items-center gap-2 overflow-hidden">
                            {file.type === "directory" ? (
                              <Folder className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <File className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}
                            <span className="truncate">{file.name}</span>
                          </div>
                          <div className="col-span-2 hidden md:block">{file.size || "-"}</div>
                          <div className="col-span-4 md:col-span-3">{file.modified || "-"}</div>
                          <div className="col-span-2 flex gap-1">
                            {file.type === "file" && (
                              <>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    openFile(file.name)
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Download file logic would go here
                                  }}
                                >
                                  <Download className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  className="h-8 w-8"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    // Open in system editor logic would go here
                                    openInSystemEditor()
                                  }}
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </Button>
                              </>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </DropZone>
              </CardContent>
            </Card>
          )
        ) : (
          <Card className="w-full">
            <CardContent className="flex items-center justify-center p-12 h-[70vh]">
              <div className="text-center">
                <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium">No Active Connection</h3>
                <p className="text-muted-foreground mt-2">Select a server and connect to browse files</p>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}
