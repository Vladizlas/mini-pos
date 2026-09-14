import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { Product, ProductInput } from "@/types/product";

// const DEMO_USER_ID = "demo-user";

function productCollection(uid: string) {
  // return collection(db, "users", DEMO_USER_ID, "products");

  return collection(db, "users", uid, "products")
}

export async function getProducts(uid: string): Promise<Product[]> {
  // const productsQuery = query(
  //   productCollection(uid),
  //   orderBy("createdAt", "desc"),
  // );

  // const snapshot = await getDocs(productsQuery);

  // return snapshot.docs.map((doc) => ({
  //   id: doc.id,
  //   ...doc.data(),
  // })) as Product[];

  const snapshot = await getDocs(query(productCollection(uid), orderBy("createdAt", "desc")))
  console.log(snapshot);
  return snapshot.docs.map((item) => ({id: item.id, ...item.data()} as Product));
}

export async function getProduct(uid: string, productId: string): Promise<Product | null>{
  const snapshot = await getDoc(doc(db, "users", uid, "products", productId));
   
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data()} as Product
}

export async function createProduct(uid: string, input: ProductInput) {
  // await addDoc(productCollection(), {
  //   ...input,
  //   createdAt: serverTimestamp(),
  //   updatedAt: serverTimestamp(),
  // });

  return   await addDoc(productCollection(uid), {
     ...input,
     createdAt: serverTimestamp(),
     updatedAt: serverTimestamp(),
  });
}

export async function updateProduct(uid: string, productId: string, input: ProductInput) {
  // const productRef = doc(db, "users", DEMO_USER_ID, "products", id);

  // await updateDoc(productRef, {
  //   ...input,
  //   updatedAt: serverTimestamp(),
  // });

  return updateDoc(doc(db, "users", uid, "products", productId), {
    ...input,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteProduct(uid: string, productId: string) {
  // const productRef = doc(db, "users", DEMO_USER_ID, "products", id);

  // await deleteDoc(productRef);

  return deleteDoc(doc(db, "users", uid, "products", productId));
}

// export async function restockProduct(id: string, quantity: number) {
//   if (quantity <= 0) {
//     throw new Error("Jumlah stock harus lebih dari 0");
//   }

//   const productRef = doc(db, "users", DEMO_USER_ID, "products", id);

//   const snapshot = await getDoc(productRef);

//   if (!snapshot.exists()) {
//     throw new Error("Produk tidak ditemukan");
//   }

//   const product = snapshot.data();

//   const currentStock = Number(product.stock) || 0;
//   const newStock = currentStock + quantity;

//   await updateDoc(productRef, {
//     stock: newStock,
//     updatedAt: serverTimestamp(),
//   });
// }
