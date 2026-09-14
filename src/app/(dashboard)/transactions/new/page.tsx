"use client";

import { Minus, Plus, ShoppingCart, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getProducts } from "@/services/product.service";
import type { Product } from "@/types/product";
import type { CartItem, PaymentMethod } from "@/types/cart";
import { formatCurrency } from "@/utils/currency";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { checkout } from "@/services/transaction.service";

export default function NewTransactionPage(){
  const router = useRouter();
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const loadProducts = useCallback(async () => {
    if (!user) return;
    try {
      setLoading(true);
      setProducts(await getProducts(user.uid));
    } catch {
      setError("Gagal mengambil produk.");
    } finally {
      setLoading(false)
    }
  },[user]);

  useEffect(() => {
    void loadProducts();
  },[loadProducts]);

  const filtered = useMemo(() => {
    const keyword = search.toLowerCase();
    return products.filter((product) => product.name.toLowerCase().includes(keyword) || product.sku.toLowerCase().includes(keyword));
  }, [products, search]);

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.qty, 0), [cart]);

  const change = paymentMethod === "cash" ? Math.max(paymentAmount - total, 0) : 0;

  function addToCart(product: Product){
    if (product.stock <= 0) return;
    setCart((current) => {
      const existing = current.find((item) => item.productId === product.id);
      if(existing) {
        if(existing.qty >= product.stock) return current;
        return current.map((item) => item.productId === product.id ? { ...item, qty: item.qty + 1 } : item);
      }
      return [...current, {productId: product.id, name: product.name, sku: product.sku, price: product.price, qty: 1, stock: product.stock}];
    });
  }

  function updateQuantity(productId: string, delta: number){
    setCart((current) => current
    .map((item) => item.productId === productId ? {...item, qty: Math.min(item.stock, Math.max(0, item.qty + delta))} : item)
    .filter((item) => item.qty > 0));
  }

  function removeItem(productId: string){
    setCart((current) => current.filter((item) => item.productId !== productId));
  }

  async function handleCheckout() {
    if (!user) return;
    setError("");

    if (cart.length === 0) return setError("Keranjang masih kosong.");
    if (paymentMethod === "cash" && paymentAmount < total) return setError("Uang pembayaran masih kurang.");

    try {
      setSubmitting(true);
      const result = await checkout(user.uid, {
        items: cart,
        paymentMethod,
        paymentAmount: paymentMethod === "cash" ? paymentAmount : total,
      });
      router.push(`/transactions/${result.transactionId}`);
    } catch (err) {
      console.log(err)
      setError(err instanceof Error ? err.message : "Transaksi gagal disimpan.");
    } finally{
      setSubmitting(false);
    }
  }

  return (
  <div>
    <div className="mb-6">
      <p className="text-sm font-bold text-indigo-600">POINT OF SALE</p>
      <h1 className="mt-1 text-3xl font-black tracking-tight">Transaksi Baru</h1>
      <p className="mt-2 text-sm text-slate-500">Pilih produk, atur jumlah, lalu selesaikan pembayaran.</p>
    </div>

    <div className="grid gap-6 xl:grid-cols-[1fr_390px]">
      <section className="min-w-0">
        <div className="mb-4 max-w-md">
          <Input placeholder="Cari nama atau SKU..." value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        {loading ? (
          <div className="rounded-2xl bg-white p-8 text-slate-500">Memuat produk...</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((product) => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="rounded-2xl border border-slate-700 bg-white p-5 text-left shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-300 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-black text-slate-900">{product.name}</div>
                    <div className="mt-1 text-xs font-semibold text-slate-400">{product.sku}</div>
                  </div>
                  <span className={`rounded-full px-2 py-1 text-xs font-bold ${product.stock <= 5 ? "bg-amber-100 text-amber-800" : "bg-emerald-100 text-emerald-800"}`}>Stok {product.stock}</span>
                </div>
                <div className="mt-5 text-lg font-black text-indigo-600">{formatCurrency(product.price)}</div>
              </button>
            ))}
          </div>
        )}
      </section>

      <aside className="h-fit rounded-3xl bg-slate-950 p-5 text-white shadow-xl xl:sticky xl:top-6">
        <div className="mb-5 flex items-center gap-3">
          <div className="grid size-10 place-items-center rounded-xl bg-indigo-600"><ShoppingCart size={20} /></div>
          <div>
            <div className="font-black">Keranjang</div>
            <div className="text-xs text-slate-400">{cart.length} jenis produk</div>
          </div>
        </div>

        <div className="grid max-h-72 gap-3 overflow-y-auto pr-1">
          {cart.length === 0 && <div className="rounded-2xl border border-dashed border-slate-700 p-6 text-center text-sm text-slate-400">Belum ada produk.</div>}
          {cart.map((item) => (
            <div key={item.productId} className="rounded-2xl bg-slate-900 p-4">
              <div className="flex justify-between gap-3">
                <div>
                  <div className="font-bold">{item.name}</div>
                  <div className="mt-1 text-xs text-slate-400">{formatCurrency(item.price)} / item</div>
                </div>
                <button onClick={() => removeItem(item.productId)} className="text-slate-500 hover:text-rose-400"><Trash2 size={17} /></button>
              </div>
              <div className="mt-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, -1)} className="grid size-8 place-items-center rounded-lg bg-slate-800"><Minus size={15} /></button>
                  <span className="min-w-6 text-center font-black">{item.qty}</span>
                  <button onClick={() => updateQuantity(item.productId, 1)} disabled={item.qty >= item.stock} className="grid size-8 place-items-center rounded-lg bg-slate-800 disabled:opacity-30"><Plus size={15} /></button>
                </div>
                <div className="font-black">{formatCurrency(item.price * item.qty)}</div>
              </div>
            </div>
          ))}
        </div>

        <div className="my-5 border-t border-slate-800" />
        <div className="flex items-end justify-between">
          <span className="text-sm text-slate-400">Total</span>
          <span className="text-2xl font-black">{formatCurrency(total)}</span>
        </div>

        <div className="mt-5 grid gap-3">
          <label className="grid gap-2 text-sm font-bold">
            Metode Pembayaran
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)} className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-white outline-none">
              <option value="cash">Cash</option>
              <option value="transfer">Transfer</option>
              <option value="qris">QRIS</option>
            </select>
          </label>

          {paymentMethod === "cash" && (
            <label className="grid gap-2 text-sm font-bold">
              Uang Diterima
              <input type="number" min="0" value={paymentAmount || ""} onChange={(e) => setPaymentAmount(Number(e.target.value))} className="min-h-11 rounded-xl border border-slate-700 bg-slate-900 px-3 text-white outline-none" />
            </label>
          )}

          <div className="flex justify-between rounded-xl bg-slate-900 p-3 text-sm">
            <span className="text-slate-400">Kembalian</span>
            <strong>{formatCurrency(change)}</strong>
          </div>

          {error && <div className="rounded-xl bg-rose-950 p-3 text-sm font-semibold text-rose-200">{error}</div>}
          <Button onClick={() => void handleCheckout()} disabled={submitting || cart.length === 0} className="w-full">
            {submitting ? "Menyimpan..." : `Bayar ${formatCurrency(total)}`}
          </Button>
        </div>
      </aside>
    </div>
  </div>
);


}


// export default function NewTransactionPage() {
//   const router = useRouter();
//   const [products, setProducts] = useState<Product[]>([]);
//   const [cartItems, setCartItems] = useState<CartItem[]>([]);
//   const [search, setSearch] = useState("");
//   // const [category, setCategory] = useState("semua");
//   const [discount, setDiscount] = useState(0);
//   const [paidAmount, setPaidAmount] = useState(0);
//   const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
//   const [loading, setLoading] = useState(true);

//   const subtotal = useMemo(() => {
//     return cartItems.reduce((total, item) => total + item.subtotal, 0);
//   }, [cartItems]);

//   const grandTotal = useMemo(() => {
//     return Math.max(subtotal - discount, 0);
//   }, [subtotal, discount]);

//   const changeAmount = useMemo(() => {
//     return Math.max(paidAmount - grandTotal, 0);
//   }, [paidAmount, grandTotal]);

//   useEffect(() => {
//     async function loadProducts() {
//       try {
//         setLoading(true);

//         const data = await getProducts();
//         setProducts(data);
//       } finally {
//         setLoading(false);
//       }
//     }
//     loadProducts();
//   }, []);

//   // const filteredProducts = useMemo(() => {
//   //   const keyword = search.toLowerCase();

//   //   return products.filter((product) => {
//   //     const matchesSearch =
//   //       product.name.toLowerCase().includes(keyword) ||
//   //       product.sku.toLowerCase().includes(keyword);

//   //     const matchesCategory =
//   //       category === "semua" || product.category === category;

//   //     return matchesSearch && matchesCategory;
//   //   });
//   // }, [products, search, category]);

//   // const filteredProducts = useMemo(() => {
//   //   return products.filter((product) => {
//   //     const keyword = search.toLowerCase();

//   //     return (
//   //       product.name.toLowerCase().includes(keyword) ||
//   //       product.sku.toLowerCase().includes(keyword)
//   //     );
//   //   });
//   // }, [products, search]);

//   function handleAddCart(product: Product) {
//     if (product.stock <= 0) {
//       alert("Stock produk sudah habis.");
//       return;
//     }

//     setCartItems((curretItem) => {
//       const existingItem = curretItem.find(
//         (item) => item.productId === product.id,
//       );

//       if (existingItem) {
//         if (existingItem.qty >= product.stock) {
//           alert(`Stock ${product.name} hanya ${product.stock}`);
//           return curretItem;
//         }

//         return curretItem.map((item) =>
//           item.productId === product.id
//             ? {
//                 ...item,
//                 qty: item.qty + 1,
//                 subtotal: (item.qty + 1) * item.price,
//               }
//             : item,
//         );
//       }

//       return [
//         ...curretItem,
//         {
//           productId: product.id,
//           name: product.name,
//           price: product.price,
//           qty: 1,
//           subtotal: product.price,
//         },
//       ];
//     });
//   }

//   function handleUpdateQty(productId: string, qty: number) {
//     const product = products.find((product) => product.id === productId);
//     if (!product) return;

//     if (qty < 1) return;

//     if (qty > product.stock) {
//       alert(`Stock ${product.name} hanya ${product.stock}`);
//       return;
//     }

//     setCartItems((currentItems) =>
//       currentItems.map((item) =>
//         item.productId === productId
//           ? { ...item, qty, subtotal: qty * item.price }
//           : item,
//       ),
//     );
//   }

//   function handleRemoveItem(productId: string) {
//     setCartItems((currentItems) =>
//       currentItems.filter((item) => item.productId !== productId),
//     );
//   }

//   async function handleCheckout() {
//     if (cartItems.length === 0) {
//       alert("Keranjang Masih Kosong");
//       return;
//     }

//     if (paidAmount < grandTotal) {
//       alert("Jumlah pembayaran masih kurang.");
//       return;
//     }

//     try {
//       // Cek stock
//       for (const item of cartItems) {
//         const product = products.find(
//           (product) => product.id === item.productId,
//         );

//         if (!product) {
//           throw new Error(`Produk ${item.name} tidak ditemukan`);
//         }

//         if (item.qty > product.stock) {
//           throw new Error(
//             `Stock ${item.name} tidak cukup. Stock Tersedia: ${product.stock}`,
//           );
//         }
//       }
//       // Simpan Transaksi
//       const transactionId = await createTransaction({
//         items: cartItems,
//         total: grandTotal,
//         paidAmount,
//         paymentMethod,
//       });

//       //  Kurangi stock setiap product
//       for (const item of cartItems) {
//         const product = products.find(
//           (product) => product.id === item.productId,
//         );

//         if (!product) continue;

//         const newStock = product.stock - item.qty;

//         // await updateProduct(product.id, {
//         //   name: product.name,
//         //   sku: product.sku,
//         //   price: product.price,
//         //   stock: newStock,
//         //   category: product.category,
//         // });

//         console.log(`Stock ${product.name}: ${product.stock} -> ${newStock}`);
//       }

//       // masuk ke halaman detail transaksi
//       router.push("/transactions/" + transactionId);
//     } catch (error) {
//       console.error("Chekout gagal:", error);
//       alert(error instanceof Error ? error.message : "Checkout Gagal");
//     }

//     // Ini Kode Sebelum ada Update
//     // const payload = {
//     //   items: cartItems,
//     //   subtotal,
//     //   discount,
//     //   grandTotal,
//     //   paymentMethod,
//     // };

//     // console.log("checkout payload", payload);
//     // alert("Checkout berhasil disiapkan. Lihat Console");
//   }
//   return (
//     <div className="grid gap-3">
//       <h1>Kasir / POS</h1>
//       <p>Halaman transaksi baru.</p>
// {/* 
//       <div className="flex flex-wrap gap-2">
//         {[
//           { value: "semua", label: "Semua" },
//           { value: "makanan", label: "Makanan" },
//           { value: "minuman", label: "Minuman" },
//           { value: "snack", label: "Snack" },
//         ].map((item) => (
//           <button
//             key={item.value}
//             type="button"
//             onClick={() => setCategory(item.value)}
//             className={`rounded-xl px-4 py-2 text-sm font-bold transition ${
//               category === item.value
//                 ? "bg-indigo-600 text-white"
//                 : "bg-slate-100 text-slate-600 hover:bg-slate-200"
//             }`}
//           >
//             {item.label}
//           </button>
//         ))}
//       </div> */}

//       {/* <div className="grid gap-3 grid-cols-1 sm:grid-cols-2 sm lg:grid-cols-3">
//         {filteredProducts.map((product) => (
//           <div
//             key={product.id}
//             className="flex items-center justify-between rounded-2xl border bg-white p-4"
//           >
//             <div>
//               <h3 className="font-bold text-black">{product.name}</h3>
//               <p className="text-sm text-slate-500">
//                 {formatCurrency(product.price)}
//               </p>
//               <p
//                 className={
//                   product.stock <= 5
//                     ? "text-sm font-bold text-amber-600"
//                     : "text-sm font-bold text-emerald-600"
//                 }
//               >
//                 Stock: {product.stock}
//               </p>
//             </div>
//             <Button
//               onClick={() => handleAddCart(product)}
//               disabled={product.stock <= 0}
//             >
//               {product.stock <= 0 ? "Habis" : "Tambah"}
//             </Button>
//           </div>
//         ))}
//       </div> */}
//       {cartItems.length === 0 ? (
//         <div className="rounded-2xl border border-dashed p-8 text-center">
//           <ShoppingCart className="mx-auto text-slate-400" />
//           <h3 className="mt-4 font-bold">Keranjang masih kosong</h3>

//           <p className="mt-1 text-sm text-slate-500">
//             Pilih produk dari daftar sebelah kiri
//           </p>
//         </div>
//       ) : (
//         <div>Render cart items</div>
//       )}
//       {cartItems.map((item) => (
//         <div key={item.productId} className="rounded-2xl border bg-white p-4">
//           <div className="flex items-start justify-between gap-4">
//             <div>
//               <h3 className="font-bold text-black">{item.name}</h3>
//               <p className="text-sm text-slate-500">
//                 {formatCurrency(item.price)} x {item.qty}
//               </p>
//             </div>

//             <button onClick={() => handleRemoveItem(item.productId)}>
//               Hapus
//             </button>
//           </div>
//           <Input
//             type="number"
//             min={1}
//             value={item.qty}
//             onChange={(e) =>
//               handleUpdateQty(item.productId, Number(e.target.value))
//             }
//           />
//         </div>
//       ))}

//       {cartItems.length > 0 && (
//         <div className="rounded-2xl border bg-white p-4">
//           <h2 className="font-bold text-black">Pembayaran</h2>

//           <label className="block font-medium text-black">Discount</label>

//           <Input
//             type="number"
//             min={0}
//             value={discount}
//             onChange={(e) => setDiscount(Number(e.target.value))}
//             className="mt-1"
//           />

//           <label className="mt-3 block font-medium text-black">
//             Metode Pembayaran
//           </label>

//           <select
//             value={paymentMethod}
//             onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
//             className="mt-1 w-full rounded-xl border p-2 text-black"
//           >
//             <option value="cash">Cash</option>
//             <option value="transfer">Transfer</option>
//             <option value="qris">QRIS</option>
//           </select>

//           <div className="mt-4 border-t pt-4">
//             <div className="flex items-center justify-between">
//               <span className="font-bold text-black">Grand Total</span>
//               <span className="text-xl font-black text-indigo-600">
//                 {formatCurrency(grandTotal)}
//               </span>
//             </div>

//             <div className="mt-4">
//               <label className="block font-medium text-black">
//                 Jumlah Dibayar
//               </label>

//               <Input
//                 type="number"
//                 min={0}
//                 value={paidAmount}
//                 onChange={(e) => setPaidAmount(Number(e.target.value))}
//                 placeholder="Masukkan jumlah pembayaran"
//                 className="mt-1"
//               />
//             </div>

//             <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-50 p-4">
//               <span className="font-bold text-emerald-700">Kembalian</span>

//               <span className="text-xl font-black text-emerald-700">
//                 {formatCurrency(changeAmount)}
//               </span>
//             </div>
//           </div>
//         </div>
//       )}

//       <Button
//         type="button"
//         disabled={cartItems.length === 0}
//         onClick={handleCheckout}
//         className="w-full"
//       >
//         Checkout
//       </Button>
//     </div>
//   );
// }
