"use client"

import Link from "next/link"
import { ModeToggle } from "@/components/mode-toggle"
import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/hooks/use-web3"
import { Terminal, FileText, Database, Menu, X } from "lucide-react"
import { useState } from "react"
import { cn } from "@/lib/utils"

export function DashboardHeader() {
  const { isConnected } = useWeb3()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between">
        <div className="flex items-center gap-2 mr-4">
          <Link href="/" className="flex items-center space-x-2">
            <Terminal className="h-6 w-6" />
            <span className="font-bold hidden md:inline-block">SSH-WEB3</span>
          </Link>
        </div>

        <div className="hidden md:flex items-center gap-6">
          {isConnected && (
            <>
              <Link
                href="/terminal"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <Terminal className="h-4 w-4 mr-2" />
                Terminal
              </Link>
              <Link
                href="/files"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <FileText className="h-4 w-4 mr-2" />
                Files
              </Link>
              <Link
                href="/database"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
              >
                <Database className="h-4 w-4 mr-2" />
                Database
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          <ModeToggle />
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile menu */}
      <div
        className={cn(
          "md:hidden border-t absolute w-full bg-background transition-all duration-300 ease-in-out",
          isMenuOpen ? "max-h-[300px] opacity-100" : "max-h-0 opacity-0 overflow-hidden",
        )}
      >
        <div className="container py-4 space-y-4">
          {isConnected ? (
            <>
              <Link
                href="/terminal"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Terminal className="h-4 w-4 mr-2" />
                Terminal
              </Link>
              <Link
                href="/files"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <FileText className="h-4 w-4 mr-2" />
                Files
              </Link>
              <Link
                href="/database"
                className="flex items-center text-sm font-medium transition-colors hover:text-primary"
                onClick={() => setIsMenuOpen(false)}
              >
                <Database className="h-4 w-4 mr-2" />
                Database
              </Link>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">Connect your wallet to access features</p>
          )}
        </div>
      </div>
    </header>
  )
}
