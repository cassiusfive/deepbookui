"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Pair } from "@/hooks/useSummary";
import { Link } from "@tanstack/react-router";

// This type is used to define the shape of our data.
// You can use a Zod schema here if you want.

export const columns: ColumnDef<Pair>[] = [
  {
    id: "symbol",
    header: "Symbol",
    cell: ({ row }) => {
      return (
        <Link
          to="/trade/$contractAddress"
          params={{ contractAddress: row.original.trading_pairs }}
        >{`${row.original.base_currency}-${row.original.quote_currency}`}</Link>
      );
    },
  },
  {
    header: "Last Price",
    cell: ({ row }) => `$${row.original.last_price.toFixed(4)}`,
  },
  {
    header: "24hr Change",
    cell: ({ row }) => `${row.original.price_change_percent_24h.toFixed(2)}%`,
  },
  {
    header: "Volume",
    cell: ({ row }) => row.original.base_volume.toFixed(0),
  },
];
