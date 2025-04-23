"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  Card, 
  CardContent, 
  CardFooter,
  CardHeader,
  CardTitle
} from "@/components/ui/card"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { Loader2, Save, ExternalLink, X } from 'lucide-react'

interface FileEditorProps {
  filePath: string
  fileContent: string
  fileName: string
  onSave: (content: string) => Promise<void>
  onClose: () => void
  onOpenInSystemEditor?: () => Promise<void>
  isReadOnly?: boolean
}

// Determine language based on file extension
const getLanguageFromFileName = (fileName: string) => {
  const extension = fileName.split('.').pop()?.toLowerCase()
  
  const languageMap: Record<string, string> = {
    js: 'javascript',
    jsx: 'javascript',
    ts: 'typescript',
    tsx: 'typescript',
    py: 'python',
    rb: 'ruby',
    php: 'php',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    cs: 'csharp',
    go: 'go',
    rs: 'rust',
    swift: 'swift',
    sh: 'bash',
    bash: 'bash',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    md: 'markdown',
    sql: 'sql',
    yaml: 'yaml',
    yml: 'yaml',
    xml: 'xml',
    conf: 'conf',
    ini: 'ini',
    txt: 'plain',
  }
  
  return extension && extension in languageMap ? languageMap[extension] : 'plain'
}

export function FileEditor({ 
  filePath, 
  fileContent,
  fileName,
  onSave, 
  onClose,
  onOpenInSystemEditor,
  isReadOnly = false
}: FileEditorProps) {
  const [content, setContent] = useState(fileContent || '')
  const [isSaving, setIsSaving] = useState(false)
  const [isOpeningExternal, setIsOpeningExternal] = useState(false)
  const [editorTheme, setEditorTheme] = useState('vs-dark')
  const [language, setLanguage] = useState(() => getLanguageFromFileName(fileName))
  const [isEditorLoaded, setIsEditorLoaded] = useState(false)
  const [monacoInstance, setMonacoInstance] = useState<any>(null)
  const [editorInstance, setEditorInstance] = useState<any>(null)
  const editorContainerRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Load Monaco editor dynamically on client side
  useEffect(() => {
    let isMounted = true
    
    const loadMonaco = async () => {
      try {
        // Dynamically import monaco editor
        const monaco = await import('monaco-editor')
        if (!isMounted) return
        
        setMonacoInstance(monaco)
        
        // Configure editor if container exists
        if (editorContainerRef.current && !editorInstance) {
          const editor = monaco.editor.create(
            editorContainerRef.current,
            {
              value: content,
              language,
              theme: editorTheme,
              automaticLayout: true,
              readOnly: isReadOnly,
              minimap: {
                enabled: true,
              },
              scrollBeyondLastLine: false,
              fontSize: 14,
              lineNumbers: 'on',
              tabSize: 2,
              wordWrap: 'on',
            }
          )

          // Update content when editor content changes
          editor.onDidChangeModelContent(() => {
            setContent(editor.getValue())
          })

          setEditorInstance(editor)
          setIsEditorLoaded(true)
        }
      } catch (error) {
        console.error("Failed to load Monaco editor:", error)
        toast({
          title: "Editor Error",
          description: "Failed to load code editor. Please try again.",
          variant: "destructive",
        })
      }
    }

    loadMonaco()

    return () => {
      isMounted = false
      // Dispose editor instance when component unmounts
      if (editorInstance) {
        editorInstance.dispose()
      }
    }
  }, [])

  // Update editor language/theme if they change
  useEffect(() => {
    if (monacoInstance && editorInstance) {
      monacoInstance.editor.setModelLanguage(editorInstance.getModel(), language)
      monacoInstance.editor.setTheme(editorTheme)
    }
  }, [language, editorTheme, monacoInstance, editorInstance])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      await onSave(content)
      toast({
        title: "File saved",
        description: `Successfully saved ${fileName}`,
      })
    } catch (error) {
      console.error("Failed to save file", error)
      toast({
        title: "Save failed",
        description: "Failed to save file. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleOpenInSystemEditor = async () => {
    if (!onOpenInSystemEditor) return
    
    setIsOpeningExternal(true)
    try {
      await onOpenInSystemEditor()
      toast({
        title: "Opening in system editor",
        description: "File opened in system editor",
      })
    } catch (error) {
      console.error("Failed to open in system editor", error)
      toast({
        title: "Failed to open",
        description: "Could not open file in system editor. This may not be supported on your system.",
        variant: "destructive",
      })
    } finally {
      setIsOpeningExternal(false)
    }
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-medium truncate" title={filePath}>
            {fileName}
          </CardTitle>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="plain">Plain Text</SelectItem>
                <SelectItem value="javascript">JavaScript</SelectItem>
                <SelectItem value="typescript">TypeScript</SelectItem>
                <SelectItem value="html">HTML</SelectItem>
                <SelectItem value="css">CSS</SelectItem>
                <SelectItem value="json">JSON</SelectItem>
                <SelectItem value="markdown">Markdown</SelectItem>
                <SelectItem value="python">Python</SelectItem>
                <SelectItem value="bash">Bash</SelectItem>
                <SelectItem value="sql">SQL</SelectItem>
                <SelectItem value="yaml">YAML</SelectItem>
                <SelectItem value="xml">XML</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={editorTheme} onValueChange={setEditorTheme}>
              <SelectTrigger className="w-[120px]">
                <SelectValue placeholder="Theme" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vs-dark">Dark</SelectItem>
                <SelectItem value="vs">Light</SelectItem>
                <SelectItem value="hc-black">High Contrast</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="border rounded-md relative">
          {!isEditorLoaded && (
            <div className="absolute inset-0 flex items-center justify-center bg-background/80 z-10">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          )}
          <div ref={editorContainerRef} className="h-[70vh]"></div>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-3">
        <div className="flex gap-2">
          {onOpenInSystemEditor && (
            <Button
              variant="outline"
              onClick={handleOpenInSystemEditor}
              disabled={isOpeningExternal}
              className="gap-2"
            >
              {isOpeningExternal ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <ExternalLink className="h-4 w-4" />
              )}
              System Editor
            </Button>
          )}
          <Button
            variant="outline"
            onClick={onClose}
            className="gap-2"
          >
            <X className="h-4 w-4" />
            Close
          </Button>
        </div>
        <Button 
          onClick={handleSave} 
          disabled={isSaving || isReadOnly}
          className="gap-2"
        >
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
