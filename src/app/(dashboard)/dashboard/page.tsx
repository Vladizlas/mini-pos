"use client";

import Link from "next/link";
import { Boxes, CircleDollarSign, ReceiptText, TriangleAlert } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getProducts } from "@/services/product.service";
import { getTransactions } from "@/services/transaction.service";
import type { Product } from "@/types/product";
import type { Transaction } from "@/types/transaction";
import { formatCurrency, formatDate, } from "@/utils/currency";
import { Button } from "@/components/ui/Button";


function isToday(date?: Transaction["createdAt"]) {
  if (!date) return false;
  const value = date.toDate();
  const today = new Date();
  return value.getFullYear() === today.getFullYear() && value.getMonth() === today.getMonth() && value.getDate() === today.getDate();
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [productData, transactionData] = await Promise.all([getProducts(user.uid), getTransactions(user.uid)]);
      setProducts(productData);
      setTransactions(transactionData);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => { void load(); }, [load]);

  const todayTransactions = useMemo(() => transactions.filter((trx) => isToday(trx.createdAt)), [transactions]);
  const todayRevenue = useMemo(() => todayTransactions.reduce((sum, trx) => sum + trx.total, 0), [todayTransactions]);
  const lowStock = useMemo(() => products.filter((product) => product.stock <= 5).length, [products]);

  const cards = [
    { label: "Total Produk", value: String(products.length), icon: Boxes },
    { label: "Transaksi Hari Ini", value: String(todayTransactions.length), icon: ReceiptText },
    { label: "Omzet Hari Ini", value: formatCurrency(todayRevenue), icon: CircleDollarSign },
    { label: "Stok Menipis", value: String(lowStock), icon: TriangleAlert },
  ];

  return (
    <div>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-bold text-indigo-600">OVERVIEW</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-500">Ringkasan aktivitas MiniPOS hari ini.</p>
        </div>
        <Link href="/transactions/new"><Button>Mulai Transaksi</Button></Link>
      </div>

      {loading ? (
        <div className="rounded-2xl bg-white p-8 text-sm text-slate-500">Memuat dashboard...</div>
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {cards.map((card) => {
              const Icon = card.icon;
              return (
                <div key={card.label} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><Icon size={19} /></div>
                  <div className="mt-5 text-sm font-semibold text-slate-500">{card.label}</div>
                  <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">{card.value}</div>
                </div>
              );
            })}
          </div>

          <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-black">Transaksi Terbaru</h2>
                <p className="mt-1 text-sm text-slate-500">5 transaksi terakhir.</p>
              </div>
              <Link href="/transactions" className="text-sm font-bold text-indigo-600 hover:underline">Lihat semua</Link>
            </div>
            <div className="grid gap-3">
              {transactions.slice(0, 5).map((trx) => (
                <Link key={trx.id} href={`/transactions/${trx.id}`} className="flex items-center justify-between gap-4 rounded-xl bg-slate-50 p-4 hover:bg-slate-100">
                  <div>
                    <div className="font-bold">{trx.invoiceNumber}</div>
                    <div className="mt-1 text-xs text-slate-500">{formatDate(trx.createdAt)}</div>
                  </div>
                  <div className="font-black">{formatCurrency(trx.total)}</div>
                </Link>
              ))}
              {transactions.length === 0 && <div className="rounded-xl border border-dashed border-slate-300 p-8 text-center text-sm text-slate-500">Belum ada transaksi.</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// "use client";

// import { useEffect, useMemo, useState } from "react";
// import {
//   Boxes,
//   CircleDollarSign,
//   ReceiptText,
//   TriangleAlert,
// } from "lucide-react";

// import { getProducts } from "@/services/product.service";
// import { getTransactions } from "@/services/transaction.service";
// import type { Product } from "@/types/product";
// import type { Transaction } from "@/types/transaction";
// import { formatCurrency } from "@/utils/currency";

// export default function DashboardPage() {
//   const [products, setProducts] = useState<Product[]>([]);
//   const [transactions, setTransactions] = useState<Transaction[]>([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState("");
//   const [period, setPeriod] = useState<"today" | "7days" | "30days" | "all">(
//     "today",
//   );

//   // const todayTransactions = useMemo(() => {
//   //   return transactions.filter((transaction) => {
//   //     const createdAt = new Date(transaction.createdAt);

//   //     return isToday(createdAt);
//   //   });
//   // }, [transactions]);

//   // const todayRevenue = useMemo(() => {
//   //   return todayTransactions.reduce((total, transaction) => {
//   //     return total + transaction.total;
//   //   }, 0);
//   // }, [todayTransactions]);

//   function isWithinPeriod(date: Date) {
//     if (period === "all") {
//       return true;
//     }

//     const now = new Date();

//     if (period === "today") {
//       return isToday(date);
//     }

//     const days = period === "7days" ? 7 : 30;

//     const startDate = new Date();
//     startDate.setDate(now.getDate() - (days - 1));
//     startDate.setHours(0, 0, 0, 0);

//     return date >= startDate && date <= now;
//   }

//   const filteredTransactions = useMemo(() => {
//     return transactions.filter((transaction) => {
//       return isWithinPeriod(new Date(transaction.createdAt));
//     });
//   }, [transactions, period]);

//   const periodTransactions = filteredTransactions;

//   const periodRevenue = useMemo(() => {
//     return periodTransactions.reduce((total, transaction) => {
//       return total + transaction.total;
//     }, 0);
//   }, [periodTransactions]);

//   const dailyRevenue = useMemo(() => {
//     const summary: Record<string, number> = {};

//     periodTransactions.forEach((transaction) => {
//       const date = new Date(transaction.createdAt);

//       const key = date.toLocaleDateString("id-ID", {
//         day: "2-digit",
//         month: "short",
//       });

//       summary[key] = (summary[key] || 0) + transaction.total;
//     });

//     const days: { key: string; label: string }[] = [];

//     const totalDays =
//       period === "today"
//         ? 1
//         : period === "7days"
//           ? 7
//           : period === "30days"
//             ? 30
//             : 0;

//     if (period === "all") {
//       const dates = periodTransactions.map(
//         (transaction) => new Date(transaction.createdAt),
//       );

//       if (dates.length > 0) {
//         const oldestDate = new Date(
//           Math.min(...dates.map((date) => date.getTime())),
//         );

//         const currentDate = new Date();

//         while (oldestDate <= currentDate) {
//           const key = oldestDate.toLocaleDateString("id-ID", {
//             day: "2-digit",
//             month: "short",
//           });

//           days.push({
//             key,
//             label: key,
//           });

//           oldestDate.setDate(oldestDate.getDate() + 1);
//         }
//       }
//     } else {
//       for (let i = totalDays - 1; i >= 0; i--) {
//         const date = new Date();

//         date.setDate(date.getDate() - i);

//         const key = date.toLocaleDateString("id-ID", {
//           day: "2-digit",
//           month: "short",
//         });

//         days.push({
//           key,
//           label: key,
//         });
//       }
//     }

//     return days.map((day) => ({
//       date: day.label,
//       revenue: summary[day.key] || 0,
//     }));
//   }, [periodTransactions, period]);

//   const lowStockProducts = useMemo(() => {
//     return products.filter((product) => {
//       return product.stock <= 5;
//     });
//   }, [products]);
//   const totalLowStock = lowStockProducts.length;

//   const bestSellingProducts = useMemo(() => {
//     const summary: Record<string, number> = {};

//     // todayTransactions.forEach((transaction) => {
//     periodTransactions.forEach((transaction) => {
//       transaction.items.forEach((item) => {
//         summary[item.name] = (summary[item.name] || 0) + item.qty;
//       });
//     });

//     return Object.entries(summary)
//       .sort((a, b) => b[1] - a[1])
//       .slice(0, 5);
//   }, [periodTransactions]);

//   const cards = [
//     {
//       label: "Total Produk",
//       value: products.length,
//       icon: Boxes,
//     },
//     {
//       label: "Transaksi Hari ini",
//       // value: todayTransactions.length,
//       value: periodTransactions.length,
//       icon: ReceiptText,
//     },
//     {
//       label: "Omzet hari ini",
//       // value: formatCurrency(todayRevenue),
//       value: formatCurrency(periodRevenue),
//       icon: CircleDollarSign,
//     },
//     {
//       label: "Stok Menipis",
//       value: totalLowStock,
//       icon: TriangleAlert,
//     },
//   ];

//   // formatCurency

//   function isToday(date: Date) {
//     const today = new Date();

//     return (
//       date.getDate() === today.getDate() &&
//       date.getMonth() === today.getMonth() &&
//       date.getFullYear() === today.getFullYear()
//     );
//   }

//   async function loadDashboardData() {
//     try {
//       setLoading(true);
//       setError("");

//       const [productData, transacationData] = await Promise.all([
//         getProducts(),
//         getTransactions(),
//       ]);

//       setProducts(productData);
//       setTransactions(transacationData);
//     } catch (err) {
//       setError("Gagal memuat data Dashboard");
//     } finally {
//       setLoading(false);
//     }
//   }

//   useEffect(() => {
//     loadDashboardData();
//   }, []);

//   if (loading) {
//     return (
//       <div className="rounded-2xl border bg-white p-8 text-center text-slate-600">
//         Memuat dashboard...
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="rounded-2xl border border-red-200 bg-red-50 p-8 text-red-700">
//         {error}
//       </div>
//     );
//   }

//   return (
//     <div>
//       <div className="mb-7">
//         <p className="text-sm font-bold text-indigo-600">OVERVIEW</p>
//         <h1 className="mt-1 text-3xl font-black tracking-tight">Dashboard</h1>
//         <p className="mt-2 text-sm text-slate-500">
//           Ringkasan aktivitas MiniPOS hari ini.
//         </p>
//       </div>

//       <div className="my-4 flex flex-wrap gap-2">
//         {[
//           { value: "today", label: "Hari Ini" },
//           { value: "7days", label: "7 Hari" },
//           { value: "30days", label: "30 Hari" },
//           { value: "all", label: "Semua" },
//         ].map((item) => (
//           <button
//             key={item.value}
//             type="button"
//             onClick={() =>
//               setPeriod(item.value as "today" | "7days" | "30days" | "all")
//             }
//             className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
//               period === item.value
//                 ? "bg-indigo-600 text-white"
//                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//             }`}
//           >
//             {item.label}
//           </button>
//         ))}
//       </div>

//       <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
//         {cards.map((card) => {
//           const Icon = card.icon;

//           return (
//             <div
//               key={card.label}
//               className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
//             >
//               <div className="grid size-10 place-items-center rounded-xl bg-indigo-50 text-indigo-600">
//                 <Icon size={19} />
//               </div>

//               <div className="mt-5 text-sm font-semibold text-slate-500">
//                 {card.label}
//               </div>

//               <div className="mt-1 text-2xl font-black tracking-tight text-slate-950">
//                 {card.value}
//               </div>
//             </div>
//           );
//         })}
//       </div>

//       <div className="my-2 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
//         <div className="mb-6">
//           <h2 className="text-lg font-black text-slate-900">Produk Terlaris</h2>

//           <p className="mt-1 text-sm text-slate-500">
//             5 produk dengan penjualan terbanyak hari ini.
//           </p>
//         </div>

//         {bestSellingProducts.length > 0 ? (
//           <div className="space-y-5">
//             {bestSellingProducts.map(([name, quantity]) => {
//               const maxQuantity = bestSellingProducts[0][1];

//               const percentage = (quantity / maxQuantity) * 100;

//               const barColor =
//                 quantity >= 10
//                   ? "bg-emerald-500"
//                   : quantity >= 7
//                     ? "bg-blue-500"
//                     : quantity >= 4
//                       ? "bg-amber-500"
//                       : "bg-rose-500";

//               return (
//                 <div key={name}>
//                   <div className="mb-2 flex items-center justify-between">
//                     <span className="text-sm font-semibold text-slate-700">
//                       {name}
//                     </span>

//                     <span className="text-sm font-bold text-indigo-600">
//                       {quantity} terjual
//                     </span>
//                   </div>

//                   <div className="h-3 overflow-hidden rounded-full bg-slate-100">
//                     <div
//                       className={`h-full rounded-full transition-all duration-500 ${barColor}`}
//                       style={{
//                         width: `${percentage}%`,
//                       }}
//                     />
//                   </div>
//                 </div>
//               );
//             })}
//           </div>
//         ) : (
//           <div className="rounded-xl bg-slate-50 p-8 text-center">
//             <p className="text-sm text-slate-500">
//               Belum ada transaksi hari ini.
//             </p>
//           </div>
//         )}
//       </div>

//       {/* <div className="rounded-2xl border bg-white p-5 shadow-sm my-2">
//         <h2 className="text-lg font-black text-black">Produk Terlaris</h2>

//         <div className="mt-4 space-y-3">
//           {bestSellingProducts.length > 0 ? (
//             bestSellingProducts.map(([name, quantity]) => (
//               <div
//                 key={name}
//                 className="flex items-center justify-between rounded-xl bg-slate-50 p-3"
//               >
//                 <span className="font-semibold text-slate-500">{name}</span>
//                 <span className="text-sm text-slate-500">
//                   {quantity} terjual
//                 </span>
//               </div>
//             ))
//           ) : (
//             <p className="rounded-xl bg-slate-50 p-4 text-center text-sm text-slate-500">
//               Belum ada transaksi hari ini.
//             </p>
//           )}
//         </div>
//       </div> */}

//       <div className="my-2 rounded-2xl border bg-white p-5 shadow-sm">
//         <h2 className="text-lg font-black text-black">Omzet Harian</h2>

//         <p className="mt-1 text-sm text-slate-500">
//           Omzet berdasarkan periode yang dipilih
//         </p>

//         <div className="mt-6 flex h-64 items-end gap-3 overflow-x-auto">
//           {dailyRevenue.length === 0 ? (
//             <div className="flex h-full w-full items-center justify-center text-sm text-slate-500">
//               Belum ada data penjualan.
//             </div>
//           ) : (
//             dailyRevenue.map(({ date, revenue }) => {
//               const maxRevenue = Math.max(
//                 ...dailyRevenue.map((item) => item.revenue),
//               );

//               const height = maxRevenue > 0 ? (revenue / maxRevenue) * 100 : 0;

//               return (
//                 <div
//                   key={date}
//                   className="flex min-w-16 flex-1 flex-col items-center justify-end"
//                 >
//                   <span className="mb-2 text-xs font-bold text-slate-600">
//                     {formatCurrency(revenue)}
//                   </span>

//                   <div className="flex h-48 w-full items-end justify-center">
//                     <div
//                       className="w-8 rounded-t-xl bg-indigo-500 transition-all duration-500 hover:bg-indigo-600"
//                       style={{
//                         height: `${height}%`,
//                       }}
//                     />
//                   </div>

//                   <span className="mt-2 text-xs font-semibold text-slate-500">
//                     {date}
//                   </span>
//                 </div>
//               );
//             })
//           )}
//         </div>
//       </div>

//       <div className="rounded-2xl border bg-white p-5 shadow-sm">
//         <h2 className="text-lg font-black text-black">Stok Menipis</h2>

//         <div className="mt-4 space-y-3">
//           {lowStockProducts.length > 0 ? (
//             lowStockProducts.map((product) => (
//               <div
//                 key={product.id}
//                 className="flex items-center justify-between rounded-xl bg-amber-50 p-3"
//               >
//                 <span className="font-semibold text-amber-700">
//                   {product.name}
//                 </span>
//                 <span className="text-sm font-bold text-amber-700">
//                   Stok {product.stock}
//                 </span>
//               </div>
//             ))
//           ) : (
//             <p className="rounded-xl bg-emerald-50 p-4 text-center text-sm text-emerald-700">
//               Semua stok masih aman.
//             </p>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
