"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

type Server = {
  value: string
  label: string
}

const servers: Server[] = [
  {
    value: "1",
    label: "Ubuntu Dev Server",
  },
  {
    value: "2",
    label: "Windows Production",
  },
]

interface ServerSelectorProps {
  selectedServer: string | null
  onServerChange: (value: string) => void
  className?: string
}

export function ServerSelector({ selectedServer, onServerChange, className }: ServerSelectorProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className={cn("justify-between", className)}>
          {selectedServer ? servers.find((server) => server.value === selectedServer)?.label : "Select server..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0">
        <Command>
          <CommandInput placeholder="Search server..." />
          <CommandList>
            <CommandEmpty>No server found.</CommandEmpty>
            <CommandGroup>
              {servers.map((server) => (
                <CommandItem
                  key={server.value}
                  value={server.value}
                  onSelect={(currentValue) => {
                    onServerChange(currentValue)
                    setOpen(false)
                  }}
                >
                  <Check
                    className={cn("mr-2 h-4 w-4", selectedServer === server.value ? "opacity-100" : "opacity-0")}
                  />
                  {server.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
