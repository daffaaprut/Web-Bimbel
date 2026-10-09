"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays,
  Clock,
  DoorOpen,
  User,
  BookOpen,
  Plus,
  Trash2,
  Lock,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowLeft,
  X,
  Users,
  ShieldAlert,
} from "lucide-react";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function AdminSchedulePage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === "STUDENT") {
      router.push("/booking");
    }
  }, [currentUser, router]);

  const [slots, setSlots] = useState<any[]>([]);
  const [rooms, setRooms] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedDay, setSelectedDay] = useState("Senin");
  const [showAddModal, setShowAddModal] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Form state
  const [slotForm, setSlotForm] = useState({
    dayOfWeek: "Senin",
    timeSessionId: "",
    subjectId: "",
    tutorId: "",
    roomId: "",
    notes: "",
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [rSlots, rRooms, rTutors, rSubjects, rSessions] = await Promise.all([
        fetch("/api/slots").then((r) => r.json()),
        fetch("/api/rooms").then((r) => r.json()),
        fetch("/api/tutors").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
        fetch("/api/sessions").then((r) => r.json()),
      ]);

      if (rSlots.success) setSlots(rSlots.data);
      if (rRooms.success) setRooms(rRooms.data);
      if (rTutors.success) setTutors(rTutors.data);
      if (rSubjects.success) setSubjects(rSubjects.data);
      if (rSessions.success) {
        setSessions(rSessions.data);
        if (rSessions.data.length > 0 && !slotForm.timeSessionId) {
          setSlotForm((prev) => ({
            ...prev,
            timeSessionId: rSessions.data[0].id,
            roomId: rRooms.data?.[0]?.id || "",
            subjectId: rSubjects.data?.[0]?.id || "",
            tutorId: rTutors.data?.[0]?.id || "",
          }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("/api/slots", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(slotForm),
      });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", text: data.message });
        setShowAddModal(false);
        loadData();
      } else {
        setNotification({
          type: "error",
          text: data.message || "Gagal membuat slot jadwal.",
        });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    }
  };

  const handleDeleteSlot = async (id: string, name: string) => {
    if (!confirm(`Hapus slot kelas ${name}? Booking siswa pada slot ini akan ikut terhapus.`)) return;
    try {
      const res = await fetch(`/api/slots?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setNotification({ type: "success", text: data.message });
        loadData();
      } else {
        setNotification({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setNotification({ type: "error", text: err.message });
    }
  };

  const daySlots = slots.filter((s) => s.dayOfWeek === selectedDay);

  return (
    <div className="container mx-auto max-w-7xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Kembali ke Dashboard
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Jadwal Keseluruhan & Matriks Kelas
          </h1>
          <p className="text-xs text-slate-500">
            Pemetaan slot belajar bimbel per hari dan sesi jam dengan pengawasan status kuota otomatis.
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

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Buka Slot Jadwal Baru</span>
          </button>
        </div>
      </div>

      {/* Notification banner */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            notification.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {notification.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-red-600" />
            )}
            <span>{notification.text}</span>
          </div>
          <button onClick={() => setNotification(null)} className="text-xs font-bold underline">
            Tutup
          </button>
        </div>
      )}

      {/* Day Selector Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => {
          const isSelected = selectedDay === day;
          const count = slots.filter((s) => s.dayOfWeek === day).length;
          return (
            <button
              key={day}
              onClick={() => setSelectedDay(day)}
              className={`px-5 py-2.5 rounded-2xl border text-xs font-bold transition cursor-pointer flex items-center gap-2 whitespace-nowrap ${
                isSelected
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/20"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
            >
              <span>{day}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full ${
                  isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {count} Kelas
              </span>
            </button>
          );
        })}
      </div>

      {/* Visual Schedule Matrix for Selected Day */}
      <div className="space-y-6">
        {sessions.map((sess) => {
          const sessionSlots = daySlots.filter((s) => s.timeSessionId === sess.id);

          return (
            <div
              key={sess.id}
              className="bg-white rounded-3xl border border-slate-200 shadow-xs p-6 space-y-4"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                    <Clock className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900">
                      {sess.name} ({sess.startTime} - {sess.endTime})
                    </h3>
                    <p className="text-[11px] text-slate-400">
                      Hari {selectedDay} • {sessionSlots.length} Kelas Berjalan
                    </p>
                  </div>
                </div>

                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
                  Operasional Bimbel
                </span>
              </div>

              {sessionSlots.length === 0 ? (
                <div className="py-6 text-center text-xs text-slate-400 italic">
                  Belum ada kelas yang dijadwalkan pada sesi ini.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {sessionSlots.map((slot) => {
                    const isFull = slot.isFull || slot.remainingSeats <= 0;
                    const percent = Math.min(
                      100,
                      Math.round((slot.bookingsCount / slot.capacity) * 100)
                    );

                    return (
                      <div
                        key={slot.id}
                        className={`p-4 rounded-2xl border transition flex flex-col justify-between ${
                          isFull
                            ? "bg-red-50/30 border-red-200"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="space-y-2.5">
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-black text-white"
                                style={{ backgroundColor: slot.subject.color || "#3b82f6" }}
                              >
                                {slot.subject.code}
                              </span>
                              <h4 className="text-sm font-bold text-slate-900 mt-1">
                                {slot.subject.name}
                              </h4>
                            </div>

                            {isFull ? (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black bg-red-100 text-red-700 border border-red-300">
                                <Lock className="w-3 h-3" />
                                PENUH
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                                Sisa {slot.remainingSeats}
                              </span>
                            )}
                          </div>

                          <div className="text-xs text-slate-600 space-y-1">
                            <div className="flex items-center gap-1.5 font-medium">
                              <User className="w-3.5 h-3.5 text-indigo-500" />
                              <span>{slot.tutor.name}</span>
                            </div>
                            <div className="flex items-center gap-1.5 font-medium">
                              <DoorOpen className="w-3.5 h-3.5 text-blue-500" />
                              <span>
                                {slot.room.name} ({slot.room.code})
                              </span>
                            </div>
                          </div>

                          {/* Capacity bar */}
                          <div className="space-y-1 pt-1">
                            <div className="flex items-center justify-between text-[10px] font-bold">
                              <span className="text-slate-500">Kuota Terisi:</span>
                              <span className={isFull ? "text-red-600" : "text-emerald-700"}>
                                {slot.bookingsCount} / {slot.capacity} Siswa
                              </span>
                            </div>
                            <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${
                                  isFull ? "bg-red-500" : "bg-emerald-500"
                                }`}
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>

                          {/* Student list preview */}
                          {slot.bookings && slot.bookings.length > 0 && (
                            <div className="pt-2 border-t border-slate-100 text-[10px] text-slate-500">
                              <p className="font-bold text-slate-600 mb-1">
                                Siswa Terdaftar:
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {slot.bookings.map((b: any) => (
                                  <span
                                    key={b.id}
                                    className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-medium"
                                  >
                                    {b.student?.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="pt-3 mt-3 border-t border-slate-100 flex justify-end">
                          <button
                            onClick={() =>
                              handleDeleteSlot(
                                slot.id,
                                `${slot.subject.name} di ${slot.room.name}`
                              )
                            }
                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Hapus Slot Jadwal"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* MODAL TAMBAH SLOT JADWAL BARU DENGAN VALIDASI SYSTEM ENGINE */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Buka Slot Jadwal Kelas Baru
                </h3>
                <p className="text-[11px] text-slate-500">
                  System Engine akan otomatis memvalidasi agar tidak terjadi bentrok ruangan & tutor.
                </p>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSlot} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hari
                  </label>
                  <select
                    value={slotForm.dayOfWeek}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, dayOfWeek: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Sesi Jam
                  </label>
                  <select
                    value={slotForm.timeSessionId}
                    onChange={(e) =>
                      setSlotForm({ ...slotForm, timeSessionId: e.target.value })
                    }
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  >
                    {sessions.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name} ({s.startTime} - {s.endTime})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Mata Pelajaran
                </label>
                <select
                  value={slotForm.subjectId}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, subjectId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  {subjects.map((sub) => (
                    <option key={sub.id} value={sub.id}>
                      {sub.name} ({sub.code})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Tutor Pengajar
                </label>
                <select
                  value={slotForm.tutorId}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, tutorId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  {tutors.map((tut) => (
                    <option key={tut.id} value={tut.id}>
                      {tut.name}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Aturan 2: Tutor tidak boleh bentrok di ruangan atau sesi lain pada jam yang sama.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ruangan Belajar
                </label>
                <select
                  value={slotForm.roomId}
                  onChange={(e) =>
                    setSlotForm({ ...slotForm, roomId: e.target.value })
                  }
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                >
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name} ({r.code}) - Kapasitas {r.capacity} Siswa
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Aturan 1: Ruangan tidak boleh digunakan untuk 2 kelas berbeda pada sesi yang sama.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan / Topik Pembahasan (Opsional)
                </label>
                <input
                  type="text"
                  placeholder="Contoh: Pembahasan Soal Tryout UTBK Saintek"
                  value={slotForm.notes}
                  onChange={(e) => setSlotForm({ ...slotForm, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 shadow-md shadow-blue-500/20"
                >
                  Buka Slot Kelas
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
