"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { downloadTicketPDF } from "@/lib/ticket-pdf";
import { BookingDTO } from "@/lib/types";
import {
  Ticket,
  Trash2,
  Plus,
  RefreshCw,
  QrCode,
  Download,
  FileCheck,
  User,
} from "lucide-react";

async function fetchMyBookings(studentId: string): Promise<BookingDTO[]> {
  const res = await fetch(`/api/bookings?studentId=${studentId}`);
  const data = (await res.json()) as {
    success: boolean;
    data?: BookingDTO[];
    message?: string;
  };

  if (!data.success) {
    throw new Error(data.message || "Gagal memuat tiket.");
  }

  return data.data ?? [];
}

export default function MyTicketsPage() {
  const { currentUser, isLoading: isAuthLoading } = useAuth();
  const [bookings, setBookings] = useState<BookingDTO[]>([]);
  const [bookingsUserId, setBookingsUserId] = useState<string | null>(null);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const loading =
    isAuthLoading ||
    (currentUser !== null && bookingsUserId !== currentUser.id);
  const visibleBookings =
    currentUser && bookingsUserId === currentUser.id ? bookings : [];

  useEffect(() => {
    const studentId = currentUser?.id;
    if (!studentId) return;

    let cancelled = false;
    const loadBookings = async () => {
      try {
        const data = await fetchMyBookings(studentId);
        if (!cancelled) setBookings(data);
      } catch (error) {
        console.error(error);
        if (!cancelled) setBookings([]);
      } finally {
        if (!cancelled) setBookingsUserId(studentId);
      }
    };

    void loadBookings();
    return () => {
      cancelled = true;
    };
  }, [currentUser?.id]);

  const handleCancelBooking = async (bookingId: string, ticketCode: string) => {
    if (!currentUser) return;

    if (
      !confirm(
        `Apakah Anda yakin ingin membatalkan booking tiket ${ticketCode}? Kursi Anda akan segera dibebaskan untuk siswa lain.`
      )
    ) {
      return;
    }

    try {
      const res = await fetch(`/api/bookings?id=${bookingId}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage(data.message);
        const updatedBookings = await fetchMyBookings(currentUser.id);
        setBookings(updatedBookings);
      } else {
        alert(data.message || "Gagal membatalkan booking.");
      }
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  // Build ticket data object for the PDF renderer
  const buildTicketData = (booking: BookingDTO) => ({
    studentName: booking.student?.name || currentUser?.name || "-",
    studentEmail: booking.student?.email || currentUser?.email || "-",
    subject: booking.classSlot?.subject?.name || "-",
    subjectCode: booking.classSlot?.subject?.code || "-",
    tutor: booking.classSlot?.tutor?.name || "-",
    day: booking.classSlot?.dayOfWeek || "-",
    startTime: booking.classSlot?.timeSession?.startTime || "-",
    endTime: booking.classSlot?.timeSession?.endTime || "-",
    session: booking.classSlot?.timeSession?.name || "-",
    room: booking.classSlot?.room?.name || "-",
    roomCode: booking.classSlot?.room?.code || "-",
    capacity: booking.classSlot?.room?.capacity || "-",
    notes: booking.notes || "",
  });

  // Direct download — no print dialog
  const handleDownloadPDF = async (booking: BookingDTO) => {
    setDownloadingId(booking.id);
    try {
      const tempEl = document.createElement("div") as HTMLDivElement & {
        __bookingData__?: ReturnType<typeof buildTicketData>;
      };
      tempEl.__bookingData__ = buildTicketData(booking);
      await downloadTicketPDF(tempEl, booking.ticketCode);
      setActionMessage(`File PDF Tiket ${booking.ticketCode} berhasil diunduh!`);
    } catch (error: unknown) {
      console.error("Gagal generate PDF:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Gagal mengunduh PDF. Coba lagi."
      );
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header (Hidden in Print) */}
      <div className="no-print print:hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200 mb-2">
            <Ticket className="w-3.5 h-3.5 text-indigo-600" />
            Dashboard & E-Tiket Siswa
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Tiket & Jadwal Belajar Saya
          </h1>
          <p className="text-xs text-slate-500">
            Daftar jadwal bimbel yang telah Anda pesan dan terkonfirmasi secara otomatis oleh sistem.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/booking"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Pesan Jadwal Baru
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="no-print print:hidden p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{actionMessage}</span>
          </div>
          <button
            onClick={() => setActionMessage(null)}
            className="text-xs font-bold text-emerald-900 underline ml-2"
          >
            Tutup
          </button>
        </div>
      )}

      {/* Bookings List (Hidden in Print) */}
      <div className="no-print print:hidden">
        {loading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-blue-600 animate-spin mx-auto" />
            <p className="text-xs text-slate-500">Memuat tiket belajar Anda...</p>
          </div>
        ) : visibleBookings.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs space-y-4 max-w-lg mx-auto">
            <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto">
              <Ticket className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              Belum Ada Jadwal Yang Dipesan
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Anda belum memiliki jadwal belajar aktif. Gunakan fitur booking interaktif untuk memilih mata pelajaran, tutor, dan ruangan yang tersedia.
            </p>
            <div className="pt-2">
              <Link
                href="/booking"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition"
              >
                <Plus className="w-4 h-4" />
                Pesan Jadwal Belajar Sekarang
              </Link>
            </div>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {visibleBookings.map((b) => {
              const slot = b.classSlot;
              return (
                <div
                  key={b.id}
                  className="bg-white rounded-3xl border border-slate-200/90 shadow-md hover:shadow-lg transition overflow-hidden flex flex-col justify-between group"
                >
                  {/* Top Section - Ticket Header */}
                  <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-violet-800 p-5 text-white space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Ticket className="w-4 h-4 text-amber-300" />
                        <span className="text-[11px] font-extrabold uppercase tracking-wider text-blue-200">
                          E-TIKET BIMBEL AKTIF
                        </span>
                      </div>
                      <span className="font-mono font-black text-xs px-2.5 py-1 rounded-lg bg-white/20 text-white border border-white/30 tracking-wider">
                        {b.ticketCode}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-xl font-black text-white">
                        {slot.subject.name}
                      </h3>
                      <p className="text-xs text-blue-200 flex items-center gap-1.5 mt-0.5">
                        <User className="w-3.5 h-3.5 text-blue-300" />
                        Tutor: <strong>{slot.tutor.name}</strong>
                      </p>
                    </div>
                  </div>

                  {/* Perforation Cut-out effect (ticket look) */}
                  <div className="relative flex items-center justify-between bg-white px-3 py-1">
                    <div className="w-4 h-4 rounded-full bg-slate-50 -ml-5 border-r border-slate-200" />
                    <div className="w-full border-t-2 border-dashed border-slate-200" />
                    <div className="w-4 h-4 rounded-full bg-slate-50 -mr-5 border-l border-slate-200" />
                  </div>

                  {/* Middle Details */}
                  <div className="p-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Hari & Waktu
                        </span>
                        <strong className="text-slate-800 text-xs">
                          {slot.dayOfWeek}
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-0.5">
                          {slot.timeSession.startTime} - {slot.timeSession.endTime} ({slot.timeSession.name})
                        </p>
                      </div>

                      <div className="p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Ruang Kelas
                        </span>
                        <strong className="text-slate-800 text-xs">
                          {slot.room.name}
                        </strong>
                        <p className="text-[11px] text-slate-600 mt-0.5 font-mono">
                          Kode: {slot.room.code}
                        </p>
                      </div>
                    </div>

                    {b.notes && (
                      <div className="p-3 rounded-xl bg-blue-50/60 border border-blue-100 text-xs text-blue-900">
                        <span className="font-bold block text-[10px] text-blue-700 uppercase">Catatan Siswa:</span>
                        <span className="italic">{b.notes}</span>
                      </div>
                    )}

                    {/* QR Mockup & Verification Info */}
                    <div className="flex items-center justify-between pt-1 border-t border-slate-100 text-[11px] text-slate-500">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-700 font-bold border border-slate-200">
                          <QrCode className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-slate-700">Tunjukkan saat masuk</p>
                          <p className="text-[10px] text-slate-400">Verifikasi QR / Presensi</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                          Terkonfirmasi
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Actions */}
                  <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                    {/* Download PDF — langsung save file, no print dialog */}
                    <button
                      onClick={() => handleDownloadPDF(b)}
                      disabled={downloadingId === b.id}
                      className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold transition shadow-xs cursor-pointer disabled:opacity-60"
                      title="Download file PDF tiket ke komputer"
                    >
                      {downloadingId === b.id ? (
                        <><RefreshCw className="w-3.5 h-3.5 animate-spin" /><span>Generating PDF...</span></>
                      ) : (
                        <><Download className="w-3.5 h-3.5" /><span>Download PDF</span></>
                      )}
                    </button>

                    <button
                      onClick={() => handleCancelBooking(b.id, b.ticketCode)}
                      className="flex items-center gap-1.5 px-2.5 py-2 rounded-xl text-red-600 hover:bg-red-50 hover:border-red-200 border border-transparent text-xs font-semibold transition cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Batalkan</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
