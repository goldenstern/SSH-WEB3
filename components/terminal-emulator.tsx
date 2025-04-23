"use client"

import { useEffect, useRef, useState } from "react"

type TerminalLine = {
  id: number
  content: string
  isCommand?: boolean
}

export function TerminalEmulator() {
  const [lines, setLines] = useState<TerminalLine[]>([
    { id: 1, content: "Welcome to SSH-WEB3 Terminal" },
    { id: 2, content: "Connected to server via secure Web3 authentication" },
    { id: 3, content: "Type 'help' for available commands" },
    { id: 4, content: "$ ", isCommand: true },
  ])
  const terminalRef = useRef<HTMLDivElement>(null)

  // Auto-scroll to bottom when new lines are added
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight
    }
  }, [lines])

  // Simulate terminal responses
  useEffect(() => {
    const lastLine = lines[lines.length - 1]

    if (lastLine.isCommand && lastLine.content !== "$ ") {
      const command = lastLine.content.replace("$ ", "")

      // Process command after a small delay
      const timer = setTimeout(() => {
        let response: string[] = []

        switch (command) {
          case "help":
            response = [
              "Available commands:",
              "  ls - List files",
              "  pwd - Print working directory",
              "  whoami - Show current user",
              "  clear - Clear terminal",
              "  uname -a - Show system information",
              "  date - Show current date and time",
            ]
            break
          case "ls":
            response = ["Documents/  Downloads/  Projects/  .ssh/", "app.js  package.json  README.md"]
            break
          case "pwd":
            response = ["/home/user"]
            break
          case "whoami":
            response = ["web3user"]
            break
          case "uname -a":
            response = [
              "Linux web3server 5.15.0-76-generic #83-Ubuntu SMP Thu Jun 15 19:16:32 UTC 2023 x86_64 GNU/Linux",
            ]
            break
          case "date":
            response = [new Date().toString()]
            break
          case "clear":
            setLines([{ id: Date.now(), content: "$ ", isCommand: true }])
            return
          default:
            response = [`Command not found: ${command}`]
        }

        const newLines = [
          ...lines,
          ...response.map((content, index) => ({
            id: Date.now() + index,
            content,
          })),
          { id: Date.now() + response.length, content: "$ ", isCommand: true },
        ]

        setLines(newLines)
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [lines])

  return (
    <div ref={terminalRef} className="h-full overflow-auto">
      {lines.map((line) => (
        <div key={line.id} className="whitespace-pre-wrap">
          {line.content}
        </div>
      ))}
    </div>
  )
}
