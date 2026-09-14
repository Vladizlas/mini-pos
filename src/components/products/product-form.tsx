"use client";
import { FormEvent, useEffect } from "react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "../ui/input";
import { ProductInput } from "@/types/product";
import { LoaderCircle } from "lucide-react";
// import { error } from 'console';

const initialValue: ProductInput = { name: "", sku: "", price: 0, stock: 0};

// type ProductFormProps = {
//   initialValues?: ProductInput;
//   submitLabel?: string;
//   onSubmit: (values: ProductInput) => void;
// };

type Props = {
  initialData?: ProductInput;
  submitLabel?: string;
  onSubmit: (data: ProductInput) => Promise<void>;
}

// const defaultValues: ProductInput = {
//   name: "",
//   sku: "",
//   price: 0,
//   stock: 0,
//   category: "makanan",
// };

export function ProductForm({
  initialData,
  submitLabel = "Simpan Produk",
  onSubmit,
}: Props) {
  // const [values, setValues] = useState<ProductInput>(initialValues);
  const [form, setForm] = useState<ProductInput>(initialData ?? initialValue);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // function updateField(field: keyof ProductInput, value: string) {
  //   setValues((current) => ({
  //     ...current,
  //     [field]: field === "price" || field === "stock" ? Number(value) : value,
  //   }));
  // }
  // const [errors, setErrors] = useState<FormErrors>({});

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  function setField<K extends keyof ProductInput>(field: K, value: ProductInput[K]) {
    setForm((current) => ({ ...current, [field]: value}));
  }

  // function handleSubmit(event: React.SyntheticEvent<HTMLFormElement>) {
  //   event.preventDefault();
  //   const validationErrors = validateProduct(values);
  //   setErrors(validationErrors);

  //   if (Object.keys(validationErrors).length > 0) {
  //     return;
  //   }
  //   onSubmit(values);
  // }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!form.name.trim() || !form.sku.trim()) return setError("Nama dan SKU wajib diisi.");
    if (form.price <= 0) return setError ("Harga harus lebih dari 0");
    if (form.stock < 0) return setError("Stock tidak boleh negatif");

    try {
      setLoading(true);
      await onSubmit({ ...form, name: form.name.trim(), sku: form.sku.trim().toUpperCase()});
    } catch (err) {
      setError(err instanceof Error ? err.message : "Gagal menyimpan produk.");
    } finally{
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="grid gap-5 rounded-2xl bg-white p-5 shadow-sm sm:p-6">
      <Input label="Nama Produk" placeholder="Contoh: Kopi Susu" value={form.name} onChange={(e) => setField("name", e.target.value)}/>
      <Input label="SKU" placeholder="Contoh: KOPI" value={form.sku} onChange={(e) => setField("sku", e.target.value)}/>
      <div className="grid gap-5 sm:grid-cols-2">
        <Input label="Harga" type="number" min="1" value={form.price} onChange={(e) => setField("price", Number(e.target.value))}/>
        <Input label="Stok" type="number" min="0" value={form.stock} onChange={(e) => setField("stock", Number(e.target.value))}/>
      </div>
      {error && <div className="rounded-xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</div>}
      <Button type="submit" disabled={loading} className="sm:w-fit">
        {loading && <LoaderCircle size={18} className="animate-spin"/>}
        {loading ? "Menyimpan..." : submitLabel}
      </Button>
    </form>
  )


}

//   return (
//     <form onSubmit={handleSubmit} className="space-y-5">
//       <div>
//         <label className="text-sm font-bold text-slate-700">Nama Produk</label>

//         <Input
//           value={values.name}
//           onChange={(event) => updateField("name", event.target.value)}
//           placeholder="Contoh : Kopi Susu"
//         />
//         {errors.name && (
//           <p className="mt-1 text-sm font-semibold text-red-600">
//             {errors.name}
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="text-sm font-bold text-slate-700">SKU Produk</label>

//         <Input
//           value={values.sku}
//           onChange={(event) => updateField("sku", event.target.value)}
//           placeholder="KOPI001"
//         />
//         {errors.sku && (
//           <p className="mt-1 text-sm font-semibold text-red-600">
//             {errors.sku}
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="text-sm font-bold text-slate-700">
//           Kategori Produk
//         </label>

//         <select
//           value={values.category}
//           onChange={(event) =>
//             updateField(
//               "category",
//               event.target.value as ProductInput["category"],
//             )
//           }
//           className="text-slate-700 mt-1 w-full rounded-xl border border-slate-300 p-2"
//         >
//           <option value="makanan">Makanan</option>
//           <option value="minuman">Minuman</option>
//           <option value="snack">Snack</option>
//         </select>
//       </div>

//       <div>
//         <label className="text-sm font-bold text-slate-700">Harga Produk</label>
//         <Input
//           type="number"
//           value={values.price}
//           onChange={(event) => updateField("price", event.target.value)}
//           placeholder="Contoh: 18000"
//         />
//         {errors.price && (
//           <p className="mt-1 text-sm font-semibold text-red-600">
//             {errors.price}
//           </p>
//         )}
//       </div>

//       <div>
//         <label className="text-sm font-bold text-slate-700">Stok Produk</label>
//         <Input
//           type="number"
//           value={values.stock}
//           onChange={(event) => updateField("stock", event.target.value)}
//           placeholder="Contoh: 12"
//         />
//         {errors.stock && (
//           <p className="mt-1 text-sm font-semibold text-red-600">
//             {errors.stock}
//           </p>
//         )}
//       </div>

//       <div className="flex items-center justify-end gap-3">
//         <Button variant="secondary">
//           <Link href="/products">Batal</Link>
//         </Button>
//         <Button type="submit">{submitLabel}</Button>
//       </div>
//     </form>
//   );
// }

// type FormErrors = Partial<Record<keyof ProductInput, string>>;
// function validateProduct(values: ProductInput) {
//   const errors: FormErrors = {};

//   if (!values.name.trim()) {
//     errors.name = "Nama produk wajib diisi.";
//   }

//   if (!values.sku.trim()) {
//     errors.sku = "SKU wajib diisi.";
//   }
//   if (values.price <= 0) {
//     errors.price = "Harga harus lebih dari nol.";
//   }
//   if (values.stock < 0) {
//     errors.stock = "Stock tidak boleh minus.";
//   }
//   return errors;
// }
