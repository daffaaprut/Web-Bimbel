"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  DoorOpen,
  Users,
  BookOpen,
  Clock,
  Plus,
  Trash2,
  Edit2,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowLeft,
  X,
  Layers,
} from "lucide-react";

export default function MasterDataPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser && currentUser.role === "STUDENT") {
      router.push("/booking");
    }
  }, [currentUser, router]);

  const [activeTab, setActiveTab] = useState<"ROOMS" | "TUTORS_SUBJECTS" | "SESSIONS">("ROOMS");

  // State data
  const [rooms, setRooms] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [sessions, setSessions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Modal states
  const [showRoomModal, setShowRoomModal] = useState(false);
  const [roomForm, setRoomForm] = useState({ id: "", name: "", code: "", capacity: 5, description: "" });

  const [showTutorModal, setShowTutorModal] = useState(false);
  const [tutorForm, setTutorForm] = useState({ id: "", name: "", email: "", phone: "", bio: "", subjectIds: [] as string[] });

  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [subjectForm, setSubjectForm] = useState({ id: "", name: "", code: "", description: "", color: "#2563eb" });

  const [showSessionModal, setShowSessionModal] = useState(false);
  const [sessionForm, setSessionForm] = useState({ id: "", name: "", startTime: "08:00", endTime: "09:30", order: 1 });

  const loadAllData = async () => {
    setLoading(true);
    try {
      const [rRooms, rTutors, rSubjects, rSessions] = await Promise.all([
        fetch("/api/rooms").then((r) => r.json()),
        fetch("/api/tutors").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
        fetch("/api/sessions").then((r) => r.json()),
      ]);

      if (rRooms.success) setRooms(rRooms.data);
      if (rTutors.success) setTutors(rTutors.data);
      if (rSubjects.success) setSubjects(rSubjects.data);
      if (rSessions.success) setSessions(rSessions.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAllData();
  }, []);

  // Room Actions
  const handleSaveRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!roomForm.id;
      const res = await fetch("/api/rooms", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(roomForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Ruangan berhasil ${isEdit ? "diperbarui" : "disimpan"}.` });
        setShowRoomModal(false);
        setRoomForm({ id: "", name: "", code: "", capacity: 5, description: "" });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message || "Gagal menyimpan ruangan." });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteRoom = async (id: string, name: string) => {
    if (!confirm(`Hapus ruangan ${name}?`)) return;
    try {
      const res = await fetch(`/api/rooms?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Tutor Actions
  const handleSaveTutor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!tutorForm.id;
      const res = await fetch("/api/tutors", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(tutorForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Tutor berhasil ${isEdit ? "diperbarui" : "disimpan"}.` });
        setShowTutorModal(false);
        setTutorForm({ id: "", name: "", email: "", phone: "", bio: "", subjectIds: [] });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteTutor = async (id: string, name: string) => {
    if (!confirm(`Hapus tutor ${name}?`)) return;
    try {
      const res = await fetch(`/api/tutors?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Subject Actions
  const handleSaveSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!subjectForm.id;
      const res = await fetch("/api/subjects", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(subjectForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Mata pelajaran berhasil ${isEdit ? "diperbarui" : "disimpan"}.` });
        setShowSubjectModal(false);
        setSubjectForm({ id: "", name: "", code: "", description: "", color: "#2563eb" });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`Hapus mata pelajaran ${name}?`)) return;
    try {
      const res = await fetch(`/api/subjects?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  // Session Actions
  const handleSaveSession = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const isEdit = !!sessionForm.id;
      const res = await fetch("/api/sessions", {
        method: isEdit ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sessionForm),
      });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: `Sesi jam berhasil ${isEdit ? "diperbarui" : "disimpan"}.` });
        setShowSessionModal(false);
        setSessionForm({ id: "", name: "", startTime: "08:00", endTime: "09:30", order: 1 });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  const handleDeleteSession = async (id: string, name: string) => {
    if (!confirm(`Hapus sesi jam ${name}?`)) return;
    try {
      const res = await fetch(`/api/sessions?id=${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setMessage({ type: "success", text: data.message });
        loadAllData();
      } else {
        setMessage({ type: "error", text: data.message });
      }
    } catch (err: any) {
      setMessage({ type: "error", text: err.message });
    }
  };

  return (
    <div className="container mx-auto max-w-6xl px-4 sm:px-6 py-10 space-y-8">
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
            Pengelolaan Master Data Bimbel
          </h1>
          <p className="text-xs text-slate-500">
            Kelola data Ruangan & Kapasitas, Tutor & Mapel, serta Sesi Jam operasional bimbel.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => loadAllData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Segarkan</span>
          </button>
        </div>
      </div>

      {/* Alert Notification */}
      {message && (
        <div
          className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
            message.type === "success"
              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          <div className="flex items-center gap-2">
            {message.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-600" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600" />
            )}
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs font-bold underline">
            Tutup
          </button>
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 gap-2 sm:gap-4 overflow-x-auto">
        <button
          onClick={() => setActiveTab("ROOMS")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === "ROOMS"
              ? "border-blue-600 text-blue-700 bg-blue-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <DoorOpen className="w-4 h-4" />
          <span>Data Ruangan & Kapasitas ({rooms.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("TUTORS_SUBJECTS")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === "TUTORS_SUBJECTS"
              ? "border-indigo-600 text-indigo-700 bg-indigo-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Data Tutor & Mapel ({tutors.length} Tutor / {subjects.length} Mapel)</span>
        </button>

        <button
          onClick={() => setActiveTab("SESSIONS")}
          className={`flex items-center gap-2 py-3 px-4 border-b-2 font-bold text-xs sm:text-sm transition cursor-pointer whitespace-nowrap ${
            activeTab === "SESSIONS"
              ? "border-emerald-600 text-emerald-700 bg-emerald-50/50 rounded-t-xl"
              : "border-transparent text-slate-500 hover:text-slate-800"
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Data Sesi Jam Operasional ({sessions.length})</span>
        </button>
      </div>

      {/* TAB 1: DATA RUANGAN & KAPASITAS MAKSIMAL */}
      {activeTab === "ROOMS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Daftar Ruangan Belajar & Batas Kapasitas Siswa
              </h3>
              <p className="text-xs text-slate-500">
                Aturan 1: Kapasitas menentukan batas maksimum booking siswa sebelum slot terkunci otomatis.
              </p>
            </div>
            <button
              onClick={() => {
                setRoomForm({ id: "", name: "", code: "", capacity: 5, description: "" });
                setShowRoomModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Ruangan</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {rooms.map((r) => (
              <div
                key={r.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4 hover:shadow-md transition"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="text-base font-black text-slate-900">{r.name}</h4>
                      <span className="text-xs font-mono font-bold text-blue-600">
                        Kode: {r.code}
                      </span>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-black bg-blue-100 text-blue-800 border border-blue-200">
                      Maks {r.capacity} Siswa
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 line-clamp-2">
                    {r.description || "Ruangan belajar reguler bimbel"}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    {r._count?.classSlots || 0} slot terjadwal
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setRoomForm({
                          id: r.id,
                          name: r.name,
                          code: r.code,
                          capacity: r.capacity,
                          description: r.description || "",
                        });
                        setShowRoomModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteRoom(r.id, r.name)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DATA TUTOR & MAPEL */}
      {activeTab === "TUTORS_SUBJECTS" && (
        <div className="space-y-10">
          {/* Section A: Tutor */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Data Tutor Pengajar Bimbel
                </h3>
                <p className="text-xs text-slate-500">
                  Aturan 2: 1 Tutor hanya dapat mengajar 1 Mapel di 1 Ruangan pada 1 Sesi Jam tertentu.
                </p>
              </div>
              <button
                onClick={() => {
                  setTutorForm({ id: "", name: "", email: "", phone: "", bio: "", subjectIds: [] });
                  setShowTutorModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tutor</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {tutors.map((t) => (
                <div
                  key={t.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white font-bold text-sm flex items-center justify-center shrink-0">
                        {t.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-slate-900">{t.name}</h4>
                        <p className="text-[11px] text-slate-400">{t.email || "Tanpa email"}</p>
                      </div>
                    </div>
                    <p className="text-xs text-slate-500 line-clamp-2">
                      {t.bio || "Tutor bimbel aktif"}
                    </p>
                    <div className="flex flex-wrap gap-1 pt-1">
                      {t.subjects?.map((s: any) => (
                        <span
                          key={s.subject.id}
                          className="px-2 py-0.5 rounded text-[10px] font-bold text-white"
                          style={{ backgroundColor: s.subject.color || "#4f46e5" }}
                        >
                          {s.subject.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                    <button
                      onClick={() => {
                        setTutorForm({
                          id: t.id,
                          name: t.name,
                          email: t.email || "",
                          phone: t.phone || "",
                          bio: t.bio || "",
                          subjectIds: t.subjects?.map((s: any) => s.subject.id) || [],
                        });
                        setShowTutorModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteTutor(t.id, t.name)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section B: Mata Pelajaran */}
          <div className="space-y-4 pt-6 border-t border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  Data Mata Pelajaran (Mapel)
                </h3>
                <p className="text-xs text-slate-500">
                  Kurikulum & bidang studi yang diajarkan pada bimbel.
                </p>
              </div>
              <button
                onClick={() => {
                  setSubjectForm({ id: "", name: "", code: "", description: "", color: "#2563eb" });
                  setShowSubjectModal(true);
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/20 transition cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Mapel</span>
              </button>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((s) => (
                <div
                  key={s.id}
                  className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl text-white font-black text-xs flex items-center justify-center shadow-xs"
                      style={{ backgroundColor: s.color || "#2563eb" }}
                    >
                      {s.code}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{s.name}</h4>
                      <p className="text-[11px] text-slate-500 line-clamp-1">{s.description}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => {
                        setSubjectForm({
                          id: s.id,
                          name: s.name,
                          code: s.code,
                          description: s.description || "",
                          color: s.color || "#2563eb",
                        });
                        setShowSubjectModal(true);
                      }}
                      className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteSubject(s.id, s.name)}
                      className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: DATA SESI JAM OPERASIONAL BIMBEL */}
      {activeTab === "SESSIONS" && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-slate-900">
                Data Sesi Jam Operasional Bimbel
              </h3>
              <p className="text-xs text-slate-500">
                Jadwal jam belajar tetap (contoh: Sesi 1: 08.00-09.30, Sesi 2: 10.00-11.30).
              </p>
            </div>
            <button
              onClick={() => {
                setSessionForm({ id: "", name: "", startTime: "08:00", endTime: "09:30", order: sessions.length + 1 });
                setShowSessionModal(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-500/20 transition cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sesi Jam</span>
            </button>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {sessions.map((sess) => (
              <div
                key={sess.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 font-bold flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                      Urutan #{sess.order}
                    </span>
                    <h4 className="text-sm font-black text-slate-900">{sess.name}</h4>
                    <p className="text-xs font-bold text-slate-600 mt-0.5">
                      {sess.startTime} - {sess.endTime}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => {
                      setSessionForm({
                        id: sess.id,
                        name: sess.name,
                        startTime: sess.startTime,
                        endTime: sess.endTime,
                        order: sess.order,
                      });
                      setShowSessionModal(true);
                    }}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleDeleteSession(sess.id, sess.name)}
                    className="p-1.5 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: FORM RUANGAN */}
      {showRoomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {roomForm.id ? "Edit Ruangan" : "Tambah Ruangan Baru"}
              </h3>
              <button onClick={() => setShowRoomModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveRoom} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Ruangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Ruang Archimedes"
                  value={roomForm.name}
                  onChange={(e) => setRoomForm({ ...roomForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Ruangan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: R-105"
                  value={roomForm.code}
                  onChange={(e) => setRoomForm({ ...roomForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Kapasitas Maksimal Siswa (Aturan Kunci)
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  required
                  value={roomForm.capacity}
                  onChange={(e) => setRoomForm({ ...roomForm, capacity: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-[10px] text-slate-400 mt-1">
                  Batas kursi maksimal sebelum slot otomatis dikunci (DISABLED) bagi siswa.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi / Fasilitas</label>
                <input
                  type="text"
                  placeholder="Contoh: AC, Smart TV, Kapasitas 6 Kursi Meja Bundar"
                  value={roomForm.description}
                  onChange={(e) => setRoomForm({ ...roomForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowRoomModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Simpan Ruangan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: FORM TUTOR */}
      {showTutorModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {tutorForm.id ? "Edit Tutor" : "Tambah Tutor Baru"}
              </h3>
              <button onClick={() => setShowTutorModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTutor} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Kak Dimas Maulana, M.Pd"
                  value={tutorForm.name}
                  onChange={(e) => setTutorForm({ ...tutorForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  placeholder="tutor@bimbel.id"
                  value={tutorForm.email}
                  onChange={(e) => setTutorForm({ ...tutorForm, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mata Pelajaran yang Diampu</label>
                <div className="max-h-32 overflow-y-auto space-y-1 p-2 border border-slate-200 rounded-xl">
                  {subjects.map((sub) => {
                    const isChecked = tutorForm.subjectIds.includes(sub.id);
                    return (
                      <label key={sub.id} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setTutorForm({ ...tutorForm, subjectIds: [...tutorForm.subjectIds, sub.id] });
                            } else {
                              setTutorForm({
                                ...tutorForm,
                                subjectIds: tutorForm.subjectIds.filter((id) => id !== sub.id),
                              });
                            }
                          }}
                        />
                        <span>{sub.name} ({sub.code})</span>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Bio / Pengalaman</label>
                <textarea
                  rows={2}
                  placeholder="Contoh: Lulusan ITB, spesialis kalkulus & trik cepat..."
                  value={tutorForm.bio}
                  onChange={(e) => setTutorForm({ ...tutorForm, bio: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTutorModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
                >
                  Simpan Tutor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: FORM MAPEL */}
      {showSubjectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {subjectForm.id ? "Edit Mata Pelajaran" : "Tambah Mata Pelajaran"}
              </h3>
              <button onClick={() => setShowSubjectModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSubject} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Mata Pelajaran</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Matematika Intensif"
                  value={subjectForm.name}
                  onChange={(e) => setSubjectForm({ ...subjectForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Kode Singkatan</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: MTK"
                  value={subjectForm.code}
                  onChange={(e) => setSubjectForm({ ...subjectForm, code: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Warna Badge</label>
                <input
                  type="color"
                  value={subjectForm.color}
                  onChange={(e) => setSubjectForm({ ...subjectForm, color: e.target.value })}
                  className="w-full h-9 p-1 rounded-xl border border-slate-200 cursor-pointer"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Deskripsi Mapel</label>
                <input
                  type="text"
                  placeholder="Contoh: Materi UTBK & Persiapan Masuk PTN"
                  value={subjectForm.description}
                  onChange={(e) => setSubjectForm({ ...subjectForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSubjectModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700"
                >
                  Simpan Mapel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FORM SESI JAM */}
      {showSessionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {sessionForm.id ? "Edit Sesi Jam" : "Tambah Sesi Jam Operasional"}
              </h3>
              <button onClick={() => setShowSessionModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveSession} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nama Sesi</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sesi 1 (Pagi)"
                  value={sessionForm.name}
                  onChange={(e) => setSessionForm({ ...sessionForm, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Mulai</label>
                  <input
                    type="time"
                    required
                    value={sessionForm.startTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, startTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Jam Selesai</label>
                  <input
                    type="time"
                    required
                    value={sessionForm.endTime}
                    onChange={(e) => setSessionForm({ ...sessionForm, endTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Urutan</label>
                <input
                  type="number"
                  min={1}
                  required
                  value={sessionForm.order}
                  onChange={(e) => setSessionForm({ ...sessionForm, order: Number(e.target.value) })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowSessionModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                >
                  Simpan Sesi Jam
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
