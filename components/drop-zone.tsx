"use client"

import type React from "react"

import { useState, useRef, type ReactNode } from "react"
import { cn } from "@/lib/utils"
import { Upload } from "lucide-react"

interface DropZoneProps {
  onFilesDropped: (files: File[]) => void
  children: ReactNode
}

export function DropZone({ onFilesDropped, children }: DropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const dropRef = useRef<HTMLDivElement>(null)

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      onFilesDropped(files)
    }
  }

  return (
    <div
      ref={dropRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("relative transition-all duration-300", isDragging && "opacity-70")}
    >
      {isDragging && (
        <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg flex items-center justify-center z-10">
          <div className="text-center p-4">
            <Upload className="h-10 w-10 mx-auto mb-2 text-primary" />
            <p className="text-primary font-medium">Drop files to upload</p>
          </div>
        </div>
      )}
      {children}
    </div>
  )
}
