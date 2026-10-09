"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  School,
  DoorOpen,
  Users,
  BookOpen,
  Clock,
  Ticket,
  CalendarDays,
  ShieldCheck,
  Search,
  Filter,
  Trash2,
  Plus,
  RefreshCw,
  ExternalLink,
  Layers,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === "STUDENT") {
      router.push("/booking");
    }
  }, [currentUser, router]);

  const [stats, setStats] = useState<any | null>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterDay, setFilterDay] = useState("ALL");
  const [actionNotice, setActionNotice] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const [resStats, resBookings] = await Promise.all([
        fetch("/api/stats").then((r) => r.json()),
        fetch("/api/bookings").then((r) => r.json()),
      ]);

      if (resStats.success) setStats(resStats.data);
      if (resBookings.success) setBookings(resBookings.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleDeleteBooking = async (id: string, ticketCode: string) => {
    if (
      !confirm(
        `Batalkan booking ${ticketCode}? Kuota kursi siswa akan segera dikembalikan ke slot jadwal.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setActionNotice(data.message);
        loadData();
      } else {
        alert(data.message || "Gagal menghapus booking.");
      }
    } catch (err: any) {
      alert(err.message || "Terjadi kesalahan.");
    }
  };

  // Filter bookings
  const filteredBookings = bookings.filter((b) => {
    const matchesSearch =
      b.ticketCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.student?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.classSlot?.subject?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.classSlot?.room?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDay =
      filterDay === "ALL" || b.classSlot?.dayOfWeek === filterDay;

    return matchesSearch && matchesDay;
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-xs font-bold border border-amber-200 mb-2">
            <School className="w-3.5 h-3.5 text-amber-700" />
            Panel Kontrol Administrator
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Overview & Monitoring Booking Bimbel
          </h1>
          <p className="text-xs text-slate-500">
            Monitoring operasional ruangan, utilisasi kuota siswa, dan data seluruh pemesanan jadwal secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => loadData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>

          <Link
            href="/admin/master"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            Kelola Master Data
          </Link>

          <Link
            href="/admin/schedule"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 transition cursor-pointer"
          >
            <CalendarDays className="w-4 h-4" />
            Jadwal Keseluruhan
          </Link>
        </div>
      </div>

      {actionNotice && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{actionNotice}</span>
          </div>
          <button
            onClick={() => setActionNotice(null)}
            className="text-xs font-bold text-emerald-900 underline"
          >
            Tutup
          </button>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ruangan</span>
            <DoorOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalRooms ?? 0}</p>
          <p className="text-[11px] text-slate-400">Total ruang aktif</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-indigo-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tutor</span>
            <Users className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalTutors ?? 0}</p>
          <p className="text-[11px] text-slate-400">Pengajar bimbel</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Mapel</span>
            <BookOpen className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalSubjects ?? 0}</p>
          <p className="text-[11px] text-slate-400">Mata pelajaran</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-amber-600">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Booking</span>
            <Ticket className="w-5 h-5" />
          </div>
          <p className="text-2xl font-black text-slate-900">{stats?.totalBookings ?? 0}</p>
          <p className="text-[11px] text-slate-400">Tiket siswa terdaftar</p>
        </div>

        <div className="bg-linear-to-br from-blue-600 to-indigo-700 text-white p-5 rounded-2xl shadow-sm space-y-1 col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-blue-200">
            <span className="text-xs font-bold uppercase tracking-wider">Utilisasi Kuota</span>
            <ShieldCheck className="w-5 h-5 text-emerald-300" />
          </div>
          <p className="text-2xl font-black">{stats?.averageUtilizationRate ?? 0}%</p>
          <p className="text-[11px] text-blue-100">Kapasitas kursi terisi</p>
        </div>
      </div>

      {/* Monitoring Table of All Student Bookings */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Tabel Overview Monitoring Seluruh Booking Siswa
            </h3>
            <p className="text-xs text-slate-500">
              Total {filteredBookings.length} booking ditemukan dalam sistem
            </p>
          </div>

          {/* Search & Filter Toolbar */}
          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
            <div className="relative grow sm:grow-0 sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Cari siswa, mapel, tiket..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filterDay}
              onChange={(e) => setFilterDay(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="ALL">Semua Hari</option>
              <option value="Senin">Senin</option>
              <option value="Selasa">Selasa</option>
              <option value="Rabu">Rabu</option>
              <option value="Kamis">Kamis</option>
              <option value="Jumat">Jumat</option>
              <option value="Sabtu">Sabtu</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 text-slate-500 uppercase font-bold text-[10px] tracking-wider border-y border-slate-200">
                <th className="py-3 px-4">No. Tiket</th>
                <th className="py-3 px-4">Nama Siswa</th>
                <th className="py-3 px-4">Hari & Sesi Jam</th>
                <th className="py-3 px-4">Mata Pelajaran & Tutor</th>
                <th className="py-3 px-4">Ruangan</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-600" />
                    Memuat data booking...
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400">
                    Tidak ada data booking yang cocok dengan pencarian.
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3.5 px-4 font-mono font-bold text-blue-700">
                      {b.ticketCode}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">
                      <div>{b.student?.name}</div>
                      <span className="text-[10px] font-normal text-slate-400">
                        {b.student?.email}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-bold">{b.classSlot?.dayOfWeek}</span>
                      <div className="text-[10px] text-slate-500">
                        {b.classSlot?.timeSession?.startTime} - {b.classSlot?.timeSession?.endTime}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <div className="font-bold text-slate-800">
                        {b.classSlot?.subject?.name}
                      </div>
                      <div className="text-[10px] text-indigo-600 font-medium">
                        Tutor: {b.classSlot?.tutor?.name}
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-slate-700">
                      <span className="font-bold">{b.classSlot?.room?.name}</span>
                      <div className="text-[10px] font-mono text-slate-400">
                        {b.classSlot?.room?.code} (Maks: {b.classSlot?.room?.capacity})
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {b.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => handleDeleteBooking(b.id, b.ticketCode)}
                        className="p-1.5 rounded-lg text-red-600 hover:bg-red-50 transition cursor-pointer"
                        title="Batalkan Booking"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
