"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DatabaseQueryResultsProps {
  results: {
    columns: string[]
    rows: Record<string, any>[]
  }
}

export function DatabaseQueryResults({ results }: DatabaseQueryResultsProps) {
  if (!results || !results.columns || !results.rows) {
    return <div className="text-center p-4">No results to display</div>
  }

  return (
    <ScrollArea className="h-[400px]">
      <Table>
        <TableHeader>
          <TableRow>
            {results.columns.map((column, index) => (
              <TableHead key={index} className="font-medium">
                {column}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {results.rows.map((row, rowIndex) => (
            <TableRow key={rowIndex}>
              {results.columns.map((column, colIndex) => (
                <TableCell key={colIndex}>{row[column] !== undefined ? String(row[column]) : ""}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </ScrollArea>
  )
}
