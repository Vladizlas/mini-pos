"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import React from 'react'

export default function ProductPage() {
  const [search, setSearch] = useState();

  return (
    <div>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between'>
        <div>
          <p className='text-sm font-bold text-indigo-600'>
            MASTER DATA
          </p>

          <h1 className='mt-1 text-3xl font-black tracking-tight'>
            Produk
          </h1>

          <p className='mt-2 text-sm text-slate-500'>
            Kelola Produk, Harga dan Stok.
          </p>
        </div>
      <Link href="/products/create">
      <Button className='w-full sm:w-auto'>
        <Plus size={18} />
          Tambah Produk
      </Button>
      <Button>
        Simpan
      </Button>

      <Button variant='secondary'>
          Batal
      </Button>

      <Button variant='danger'>
          Hapus
      </Button>

      <Button disabled>
        Menyimpan...
      </Button>
      </Link>

      </div>
    
    <div>
      <div className='mb-5 max-w-md'>
        <Input
          placeholder='Cari Nama atau SKU...'
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> 
      </div>
        <EmptyState
          title='Belum Ada Produk'
          description='Tambahkan Produk Pertama Untuk Memulai Transaksi POS'
        />
    </div>
    </div>
)
}
