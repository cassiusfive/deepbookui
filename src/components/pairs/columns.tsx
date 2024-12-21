"use client"

import { ColumnDef } from "@tanstack/react-table"
import { Pair } from "@/hooks/useSummary"

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Pair>[] = [
  {
    accessorKey: "symbol",
    header: "Symbol",
  },
  {
    accessorKey: "lastPrice",
    header: "Last Price",
  },
  {
    accessorKey: "change",
    header: "24hr Change",
  },
  {
    accessorKey: "volume",
    header: "Volume"
  }
]
