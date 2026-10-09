# 🎓 Sistem Penjadwalan Otomatis Bimbel (BimbelScheduler)

Aplikasi web modern berbasis **Next.js (App Router)**, **Tailwind CSS**, dan **Prisma ORM** untuk otomatisasi penjadwalan bimbingan belajar dengan proteksi bentrok (Zero Double-Booking) dan penguncian kuota kursi secara real-time.

---

## 🌟 3 Aktor / Peran Utama

1. **Admin**:
   - Mengelola Master Data: Ruangan beserta kapasitas maksimalnya, Tutor pengajar, Mata Pelajaran, dan Sesi Jam operasional bimbel.
   - Mengatur dan membuka slot jadwal kelas.
   - Monitoring seluruh booking siswa serta utilisasi kuota ruangan secara menyeluruh.
2. **Siswa**:
   - Melakukan pemesanan jadwal belajar melalui **3-Step Interactive Wizard**:
     - *Step 1*: Pilih Hari & Sesi Jam
     - *Step 2*: Pilih Mata Pelajaran & Tutor Pengajar
     - *Step 3*: Pilih Ruangan (dengan indikator kuota real-time dan penguncian otomatis)
   - Melihat dashboard tiket belajar (E-Tiket pass), mencetak tiket, atau membatalkan booking (yang secara otomatis memulihkan kuota ruangan).
3. **System Engine**:
   - Mesin validasi transaksional di backend yang memastikan seluruh aturan bisnis dipatuhi secara ketat.

---

## 🛡️ 4 Aturan Utama & Logika Bisnis (Strictly Enforced)

1. **Aturan Ruangan & Kapasitas**:
   - Setiap ruangan memiliki batas maksimal siswa (`capacity`).
   - 1 Ruangan hanya boleh diisi siswa hingga batas kapasitasnya pada sesi jam dan hari yang sama.
   - 1 Ruangan tidak dapat dipakai untuk dua kelas berbeda pada hari dan sesi jam yang sama.
2. **Aturan Tutor**:
   - 1 Tutor **HANYA BISA** mengajar 1 Mapel di 1 Ruangan pada 1 Sesi Jam tertentu.
   - Tutor dicegah bentrok jadwalnya di ruangan atau sesi lain pada jam yang sama (*Anti Double-Teaching Clash*).
3. **Locking Slot Otomatis (Fitur Kunci)**:
   - Jika kombinasi `{Hari + Sesi Jam + Mapel + Tutor + Ruangan}` sudah mencapai kapasitas maksimum, status slot otomatis diubah menjadi `DISABLED/PENUH` secara real-time.
   - Tombol pemilihan slot dikunci (disabled) dan siswa dipaksa memilih opsi lain.
4. **Aturan Siswa**:
   - Siswa dicegah melakukan booking 2 kali pada Sesi Jam dan Hari yang sama (menghindari bentrok jadwal belajar siswa).

---

## 🚀 Panduan Menjalankan Aplikasi

### 1. Prasyarat
- Node.js v18+ (Disarankan v20 atau v24)
- npm / pnpm / yarn

### 2. Instalasi Dependensi & Database
```bash
# Install packages
npm install

# Push skema database Prisma (SQLite lokal zero-config)
npx prisma db push

# Jalankan Seeding Data Awal
node prisma/seed.mjs
```

### 3. Menjalankan Server Development
```bash
npm run dev
```
Akses aplikasi melalui browser di **`http://localhost:3000`**.

---

## 🔑 Akun Simulasi & Uji Coba Cepat (Pre-Seeded)

Anda dapat berganti peran secara instan menggunakan **Quick Switcher Dropdown** di pojok kanan atas Navbar atau melalui halaman `/login`:

| Peran | Nama | Email | Skenario Uji Coba |
|---|---|---|---|
| **Admin** | Super Admin Bimbel | `admin@bimbel.id` | Akses CRUD Master Data, monitoring seluruh booking & slot kelas |
| **Siswa 1** | Ahmad Rizky Pratama | `ahmad@siswa.id` | Memiliki 2 booking aktif |
| **Siswa 2** | Alya Putri Dewanti | `alya@siswa.id` | Terdaftar di kelas intensif Matematika |
| **Siswa 3** | Bima Arya Sena | `bima@siswa.id` | Terdaftar di kelas intensif Matematika |
| **Siswa 4** | Cantika Melani | `cantika@siswa.id` | Akun siap uji coba untuk booking baru |

### Skenario Uji Coba Penguncian Slot (Auto-Locking Demo):
1. Masuk sebagai siswa (contoh: **Cantika Melani**).
2. Buka menu **"Pesan Jadwal Belajar"** (`/booking`).
3. Pilih **Hari: Senin** dan **Sesi 1 (08:00 - 09:30)**.
4. Pilih **Matematika Intensif** dan tutor **Kak Dimas Maulana**.
5. Di Langkah 3 (Pilih Ruangan), perhatikan bahwa **Ruang Einstein (R-101)** berstatus **`PENUH (3/3 Siswa)`** dengan tombol terkunci **`DISABLED`**.
6. Pilih **Ruang Newton (R-102)** yang berstatus **`Tersisa 4 Kursi`** untuk menyelesaikan booking!

---

## 🗄️ Skema Database (Prisma)

- `User`: Menyimpan data Siswa dan Admin.
- `Room`: Menyimpan data Ruangan beserta batas `capacity`.
- `Subject`: Menyimpan Mata Pelajaran dan kode warna badge.
- `Tutor` & `TutorSubject`: Menyimpan data Tutor dan spesialisasi mapel.
- `TimeSession`: Menyimpan jam operasional bimbel (Sesi 1, 2, dst).
- `ClassSlot`: Kombinasi unik `{Hari + Sesi + Mapel + Tutor + Ruangan}` dengan unique constraint pencegah bentrok.
- `Booking`: Menyimpan data pendaftaran siswa dengan kode e-tiket unik (`TIK-YYYYMM-XXXX`) dan status pemesanan.
