"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight, Database, Table, Key, Circle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"

type Column = {
  name: string
  type: string
  isPrimary: boolean
  isNullable: boolean
}

type TableSchema = {
  name: string
  columns: Column[]
}

type DatabaseSchema = {
  tables: TableSchema[]
}

export function DatabaseSchemaViewer() {
  // Mock schema data
  const schema: DatabaseSchema = {
    tables: [
      {
        name: "users",
        columns: [
          { name: "id", type: "int", isPrimary: true, isNullable: false },
          { name: "username", type: "varchar(255)", isPrimary: false, isNullable: false },
          { name: "email", type: "varchar(255)", isPrimary: false, isNullable: false },
          { name: "password", type: "varchar(255)", isPrimary: false, isNullable: false },
          { name: "created_at", type: "timestamp", isPrimary: false, isNullable: true },
          { name: "updated_at", type: "timestamp", isPrimary: false, isNullable: true },
        ],
      },
      {
        name: "orders",
        columns: [
          { name: "id", type: "int", isPrimary: true, isNullable: false },
          { name: "user_id", type: "int", isPrimary: false, isNullable: false },
          { name: "amount", type: "decimal(10,2)", isPrimary: false, isNullable: false },
          { name: "status", type: "varchar(50)", isPrimary: false, isNullable: false },
          { name: "created_at", type: "timestamp", isPrimary: false, isNullable: true },
        ],
      },
      {
        name: "products",
        columns: [
          { name: "id", type: "int", isPrimary: true, isNullable: false },
          { name: "name", type: "varchar(255)", isPrimary: false, isNullable: false },
          { name: "description", type: "text", isPrimary: false, isNullable: true },
          { name: "price", type: "decimal(10,2)", isPrimary: false, isNullable: false },
          { name: "stock", type: "int", isPrimary: false, isNullable: false },
          { name: "created_at", type: "timestamp", isPrimary: false, isNullable: true },
        ],
      },
    ],
  }

  const [expandedTables, setExpandedTables] = useState<Record<string, boolean>>({})

  const toggleTable = (tableName: string) => {
    setExpandedTables((prev) => ({
      ...prev,
      [tableName]: !prev[tableName],
    }))
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 mb-4">
        <Database className="h-5 w-5 text-muted-foreground" />
        <span className="font-medium">test</span>
      </div>

      {schema.tables.map((table) => (
        <div key={table.name} className="border rounded-md overflow-hidden">
          <div
            className="flex items-center gap-2 p-2 bg-muted/50 cursor-pointer hover:bg-muted"
            onClick={() => toggleTable(table.name)}
          >
            {expandedTables[table.name] ? (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronRight className="h-4 w-4 text-muted-foreground" />
            )}
            <Table className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium">{table.name}</span>
            <Badge variant="outline" className="ml-auto">
              {table.columns.length} columns
            </Badge>
          </div>

          {expandedTables[table.name] && (
            <div className="p-2 space-y-1 border-t">
              {table.columns.map((column) => (
                <div key={column.name} className="flex items-center gap-2 px-6 py-1 text-sm">
                  {column.isPrimary ? (
                    <Key className="h-3 w-3 text-amber-500" />
                  ) : (
                    <Circle className="h-3 w-3 text-muted-foreground" />
                  )}
                  <span className={cn(column.isPrimary && "font-medium")}>{column.name}</span>
                  <span className="text-muted-foreground">{column.type}</span>
                  {column.isNullable ? (
                    <Badge variant="outline" className="ml-auto text-xs">
                      nullable
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="ml-auto text-xs">
                      required
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
