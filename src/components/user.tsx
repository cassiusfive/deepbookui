import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { BookX } from "lucide-react";

type Order = {
  time: Date;
  pair: string;
  type: "limit" | "market";
  side: "buy" | "sell";
  price: number;
  amount: number;
  status: "filled" | "failed" | "canceled";
};

const ORDERS: Order[] = [];

for (let i = 0; i < 10; i++) {
  ORDERS.push({
    time: new Date(new Date().getTime() - Math.random() * 25 * 60 * 60 * 1000),
    pair: "SUI-USDC",
    type: Math.random() < 0.5 ? "limit" : "market",
    side: Math.random() < 0.5 ? "buy" : "sell",
    price: parseFloat((Math.random() * 0.01).toFixed(8)), // Random price
    amount: parseFloat((Math.random() * 20).toFixed(2)), // Random amount
    status: "filled",
  });
}

ORDERS.sort((a, b) => b.time.getTime() - a.time.getTime());

function formatTime(date: Date): string {
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

export default function User() {
  return (
    <div className="h-full">
      <div className="border-b p-4">Orders</div>
      <div className="no-scrollbar h-[180px] overflow-y-auto">
        <Table>
          <TableHeader className="sticky top-0 text-nowrap bg-background text-xs shadow-[0_0_0_1px_rgb(229,231,235)] [&_tr]:border-none">
            <TableRow>
              <TableHead className="w-[100px] pl-4">TIME PLACED</TableHead>
              <TableHead>PAIR</TableHead>
              <TableHead>TYPE</TableHead>
              <TableHead>SIDE</TableHead>
              <TableHead>PRICE</TableHead>
              <TableHead>AMOUNT</TableHead>
              <TableHead>TOTAL</TableHead>
              <TableHead className="pr-4 text-right">STATUS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="text-nowrap text-xs [&_tr]:border-none [&_tr_td:first-child]:pl-4 [&_tr_td:first-child]:text-gray-500 [&_tr_td:last-child]:pr-4 [&_tr_td:last-child]:text-right">
            {ORDERS.length > 0 &&
              ORDERS.map((order) => (
                <TableRow>
                  <TableCell>{formatTime(order.time)}</TableCell>
                  <TableCell>{order.pair}</TableCell>
                  <TableCell>{order.type}</TableCell>
                  <TableCell>{order.side}</TableCell>
                  <TableCell>{order.price.toFixed(4)} USDC</TableCell>
                  <TableCell>{order.amount.toFixed(4)}</TableCell>
                  <TableCell>
                    {(order.price * order.amount).toFixed(4)} USDC
                  </TableCell>
                  <TableCell>{order.status}</TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        {!ORDERS.length && (
          <div className="flex h-[calc(100%-40px)] flex-col items-center justify-center text-xs text-gray-500">
            <BookX />
            <div>No orders</div>
          </div>
        )}
      </div>
    </div>
  );
}
