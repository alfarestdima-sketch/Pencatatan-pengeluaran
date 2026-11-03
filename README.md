# KostKu — Pencatat Pengeluaran Anak Kost

Aplikasi web sederhana tanpa backend untuk mencatat pengeluaran. Semua data tersimpan otomatis di browser Anda melalui `localStorage`, sehingga data tetap ada setelah halaman ditutup pada browser/perangkat yang sama.

## Fitur

- Tambah, edit, dan hapus transaksi.
- Kategori bawaan serta tambah/hapus kategori sendiri.
- Tanggal dan nominal transaksi.
- Ringkasan pengeluaran bulan ini, total keseluruhan, jumlah transaksi, dan kategori terbesar.
- Pencarian keterangan serta filter kategori dan bulan.
- Anggaran bulanan dengan indikator sisa atau kelebihan anggaran.
- Reset seluruh data.

## Cara menjalankan di VS Code

1. Buka folder `pencatat-pengeluaran-kost` di VS Code.
2. Pasang ekstensi **Live Server** bila belum ada: buka Extensions (`Ctrl+Shift+X`), cari `Live Server` oleh Ritwick Dey, lalu pilih Install.
3. Buka `index.html`.
4. Klik kanan pada file, lalu pilih **Open with Live Server**. Aplikasi akan terbuka di browser.

Alternatif paling sederhana: klik ganda file `index.html` untuk membukanya di browser. Live Server direkomendasikan agar perubahan kode langsung terlihat setelah disimpan.

## Struktur file

```
pencatat-pengeluaran-kost/
├── index.html   # tampilan aplikasi
├── style.css    # desain responsif
└── script.js    # logika dan localStorage
```

Tidak ada instalasi paket atau server yang diperlukan.
