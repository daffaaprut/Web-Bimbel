"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays,
  ShieldCheck,
  Users,
  DoorOpen,
  BookOpen,
  Clock,
  ArrowRight,
  CheckCircle,
  AlertTriangle,
  Lock,
  Sparkles,
  Ticket,
  ChevronRight,
  School,
} from "lucide-react";

export default function HomePage() {
  const { currentUser, loginAs, usersList } = useAuth();
  const [stats, setStats] = useState<{
    totalRooms: number;
    totalTutors: number;
    totalSubjects: number;
    totalSessions: number;
    totalSlots: number;
    totalBookings: number;
    averageUtilizationRate: number;
  } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setStats(data.data);
      })
      .catch((err) => console.error(err));
  }, []);

  return (
    <div className="space-y-16 pb-20">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-linear-to-b from-blue-900 via-indigo-900 to-slate-900 text-white pt-20 pb-28 px-4 sm:px-6 lg:px-8">
        {/* Ambient Glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

        <div className="container mx-auto max-w-6xl relative z-10 text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs sm:text-sm font-semibold backdrop-blur-md animate-pulse-subtle">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Sistem Penjadwalan Otomatis & Alokasi Kuota Pintar</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight max-w-4xl mx-auto">
            Belajar Mau Ngebut Ya Sama Aprut, <br className="hidden sm:inline" />
            <span className="bg-linear-to-r from-blue-300 via-sky-200 to-indigo-300 bg-clip-text text-transparent">
              Anjay Kata gua mahh
            </span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            Platform bimbel generasi baru yang menjamin <strong>Zero Double-Booking</strong>, pencegahan bentrok tutor, dan penguncian kuota kursi secara real-time.
          </p>

          {/* Quick CTA Actions */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <Link
              href="/booking"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-600/30 transition hover:-translate-y-0.5"
            >
              <CalendarDays className="w-5 h-5" />
              Pesan Jadwal Belajar (Siswa)
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              href="/admin"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 font-bold text-sm sm:text-base backdrop-blur-md transition hover:-translate-y-0.5"
            >
              <School className="w-5 h-5 text-indigo-400" />
              Buka Dashboard Admin
            </Link>

            <Link
              href="/my-tickets"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-400/30 font-semibold text-sm transition"
            >
              <Ticket className="w-4 h-4" />
              Lihat Tiket Booking
            </Link>
          </div>

          {/* Current Logged In Persona Quick Badge */}
          <div className="pt-4 flex items-center justify-center gap-2 text-xs text-slate-300">
            <span>Saat ini masuk sebagai:</span>
            <span className="font-bold text-white bg-white/10 px-3 py-1 rounded-full border border-white/20">
              {currentUser ? `${currentUser.name} (${currentUser.role})` : "Belum Login"}
            </span>
          </div>
        </div>
      </section>

      {/* Live Operational Metrics Section */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6 -mt-16 relative z-20">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <DoorOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats?.totalRooms ?? "4"}
              </p>
              <p className="text-xs font-medium text-slate-500">Ruangan Bimbel</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats?.totalTutors ?? "5"}
              </p>
              <p className="text-xs font-medium text-slate-500">Tutor Pengajar</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats?.totalSubjects ?? "5"}
              </p>
              <p className="text-xs font-medium text-slate-500">Mata Pelajaran</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-5 shadow-lg shadow-slate-200/50 border border-slate-100 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Ticket className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-slate-800">
                {stats?.totalBookings ?? "5"}
              </p>
              <p className="text-xs font-medium text-slate-500">Booking Terkonfirmasi</p>
            </div>
          </div>
        </div>
      </section>

      {/* 3 Main Actors Architecture Section */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
            Arsitektur 3 Aktor Utama
          </span>
          <h2 className="text-3xl font-extrabold text-slate-900">
            Bagaimana Sistem Bekerja
          </h2>
          <p className="text-slate-500 text-sm max-w-xl mx-auto">
            Dirancang secara presisi untuk memisahkan wewenang Admin, alur interaktif Siswa, dan validasi System Engine di backend.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Aktor 1: Admin */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 relative overflow-hidden group">
            <div className="w-2 h-full absolute left-0 top-0 bg-blue-600" />
            <div className="w-12 h-12 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
              <School className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-blue-600 tracking-wide">
              AKTOR 1
            </span>
            <h3 className="text-xl font-bold text-slate-900">Admin Bimbel</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Mengelola Master Data secara menyeluruh: Ruangan beserta kapasitas kursi maksimalnya, Tutor pengajar, Mapel, Sesi Jam, serta monitoring seluruh jadwal.
            </p>
            <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                CRUD Ruangan & Batas Kapasitas
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                CRUD Tutor & Mata Pelajaran
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                Matriks Monitoring Jadwal
              </li>
            </ul>
            <Link
              href="/admin"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-blue-600 group-hover:text-blue-700 pt-2"
            >
              Masuk Panel Admin &rarr;
            </Link>
          </div>

          {/* Aktor 2: Siswa */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:shadow-md transition space-y-4 relative overflow-hidden group">
            <div className="w-2 h-full absolute left-0 top-0 bg-indigo-600" />
            <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-indigo-600 tracking-wide">
              AKTOR 2
            </span>
            <h3 className="text-xl font-bold text-slate-900">Siswa Bimbel</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Memilih jadwal belajar secara interaktif bertahap (Hari & Sesi &rarr; Mapel & Tutor &rarr; Ruangan & Kuota) serta menyimpan e-tiket barcode booking.
            </p>
            <ul className="text-xs text-slate-500 space-y-2 pt-2 border-t border-slate-100">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                3-Step Booking Wizard
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                Indikator Kuota Real-time
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                E-Tiket & Manajemen Jadwal
              </li>
            </ul>
            <Link
              href="/booking"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 group-hover:text-indigo-700 pt-2"
            >
              Mulai Pemesanan Siswa &rarr;
            </Link>
          </div>

          {/* Aktor 3: System Engine */}
          <div className="bg-slate-900 text-white rounded-2xl p-6 border border-slate-800 shadow-xl space-y-4 relative overflow-hidden group">
            <div className="w-2 h-full absolute left-0 top-0 bg-emerald-500" />
            <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-xs font-bold text-emerald-400 tracking-wide">
              AKTOR 3 (ENGINE OTOMATIS)
            </span>
            <h3 className="text-xl font-bold text-white">System Engine</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Lapisan validasi cerdas di backend yang mengeksekusi 4 aturan utama: proteksi bentrok tutor, kapasitas ruangan, dan auto-locking slot saat penuh.
            </p>
            <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Auto-Lock Slot (Kunci Tombol & Badge Penuh)
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Anti Tutor Double-Teaching Clash
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                Cek Transaksional Sebelum Simpan DB
              </li>
            </ul>
            <div className="text-xs font-bold text-emerald-400 pt-2 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              Engine Siaga & Berjalan Aktif
            </div>
          </div>
        </div>
      </section>

      {/* 4 Rules Core Explanation */}
      <section className="container mx-auto max-w-6xl px-4 sm:px-6">
        <div className="bg-linear-to-br from-slate-100 to-blue-50/50 rounded-3xl p-8 border border-slate-200">
          <div className="max-w-2xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-100 px-3 py-1 rounded-full">
              Pilar Logika Bisnis
            </span>
            <h2 className="text-2xl font-black text-slate-900 mt-2">
              4 Aturan Utama & Logika Bisnis Sistem
            </h2>
            <p className="text-xs text-slate-600 mt-1">
              Seluruh transaksi booking diproteksi ketat sesuai spesifikasi sistem:
            </p>
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                <DoorOpen className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  1. Aturan Ruangan & Kapasitas
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Setiap ruangan memiliki batas maksimal siswa. 1 Ruangan hanya boleh diisi siswa hingga batas kapasitasnya pada sesi jam dan hari yang sama.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
                <Users className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  2. Aturan Tutor
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  1 Tutor HANYA BISA mengajar 1 Mapel di 1 Ruangan pada 1 Sesi Jam tertentu. Tutor tidak boleh bentrok jadwalnya di ruangan atau sesi lain pada jam yang sama.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-red-200 shadow-xs flex items-start gap-4 relative overflow-hidden">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <Lock className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold text-slate-900">
                    3. Locking Slot Otomatis (Fitur Kunci)
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 text-red-700">
                    KUNCI
                  </span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Jika kombinasi <code className="bg-slate-100 px-1 py-0.5 rounded text-[11px] font-mono text-red-600">&#123;Hari + Sesi + Mapel + Tutor + Ruangan&#125;</code> sudah mencapai kuota maksimal, tombol slot otomatis DISABLED & berbadge PENUH.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                <CheckCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-slate-900">
                  4. Aturan Siswa
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Siswa tidak boleh melakukan booking 2 kali pada Sesi Jam dan Hari yang sama (mencegah double-booking jadwal siswa secara otomatis).
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
