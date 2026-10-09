"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays,
  Clock,
  BookOpen,
  User,
  DoorOpen,
  CheckCircle,
  AlertCircle,
  Lock,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  Ticket,
  ShieldCheck,
  Check,
  RefreshCw,
} from "lucide-react";

const DAYS = ["Senin", "Selasa", "Rabu", "Kamis", "Jumat", "Sabtu"];

export default function BookingWizardPage() {
  const router = useRouter();
  const { currentUser } = useAuth();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(1);

  // Master data lists
  const [sessions, setSessions] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [tutors, setTutors] = useState<any[]>([]);
  const [allSlots, setAllSlots] = useState<any[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  // Form selections
  const [selectedDay, setSelectedDay] = useState<string>("Senin");
  const [selectedSessionId, setSelectedSessionId] = useState<string>("");
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>("");
  const [selectedTutorId, setSelectedTutorId] = useState<string>("");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [notes, setNotes] = useState<string>("");

  // Submission & Confirmation modal states
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null);

  // Load master data
  const loadInitialData = async () => {
    setLoadingData(true);
    try {
      const [resSessions, resSubjects, resTutors, resSlots] = await Promise.all([
        fetch("/api/sessions").then((r) => r.json()),
        fetch("/api/subjects").then((r) => r.json()),
        fetch("/api/tutors").then((r) => r.json()),
        fetch("/api/slots").then((r) => r.json()),
      ]);

      if (resSessions.success) setSessions(resSessions.data);
      if (resSubjects.success) setSubjects(resSubjects.data);
      if (resTutors.success) setTutors(resTutors.data);
      if (resSlots.success) setAllSlots(resSlots.data);

      if (resSessions.success && resSessions.data.length > 0) {
        setSelectedSessionId(resSessions.data[0].id);
      }
      if (resSubjects.success && resSubjects.data.length > 0) {
        setSelectedSubjectId(resSubjects.data[0].id);
      }
    } catch (err) {
      console.error("Failed to load booking data:", err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Filter slots based on selections
  // Step 2 & 3: Find scheduled slots for current Day & Session
  const daySessionSlots = allSlots.filter(
    (s) => s.dayOfWeek === selectedDay && s.timeSessionId === selectedSessionId
  );

  // Available subjects for the selected Day & Session
  const availableSubjectIds = Array.from(
    new Set(daySessionSlots.map((s) => s.subjectId))
  );

  // Filter tutors based on selected subject and day/session
  const availableSlotsForSubject = daySessionSlots.filter(
    (s) => s.subjectId === selectedSubjectId
  );

  // When step 2 is active and tutors change, auto-select first tutor if available
  useEffect(() => {
    if (availableSlotsForSubject.length > 0) {
      const currentValid = availableSlotsForSubject.find(
        (s) => s.tutorId === selectedTutorId
      );
      if (!currentValid) {
        setSelectedTutorId(availableSlotsForSubject[0].tutorId);
      }
    } else {
      setSelectedTutorId("");
    }
  }, [selectedSubjectId, selectedDay, selectedSessionId, allSlots]);

  // Available slots for Step 3 (Room & Quota selection)
  const candidateRoomSlots = daySessionSlots.filter(
    (s) =>
      s.subjectId === selectedSubjectId &&
      (!selectedTutorId || s.tutorId === selectedTutorId)
  );

  // Selected slot object
  const activeSlot = allSlots.find((s) => s.id === selectedSlotId);
  const selectedSession = sessions.find((s) => s.id === selectedSessionId);
  const selectedSubject = subjects.find((s) => s.id === selectedSubjectId);
  const selectedTutor = tutors.find((t) => t.id === selectedTutorId);

  // Handle final submission with backend re-check
  const handleConfirmBooking = async () => {
    if (!currentUser) {
      setErrorMessage("Silakan login terlebih dahulu untuk melakukan booking.");
      return;
    }
    if (!selectedSlotId) {
      setErrorMessage("Silakan pilih ruangan kelas terlebih dahulu.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentUser.id,
          classSlotId: selectedSlotId,
          notes,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        setErrorMessage(data.message || "Gagal melakukan pemesanan jadwal.");
      } else {
        setConfirmedBooking(data.data);
        // Refresh slot quotas
        fetch("/api/slots")
          .then((r) => r.json())
          .then((d) => {
            if (d.success) setAllSlots(d.data);
          });
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto max-w-5xl px-4 sm:px-6 py-10 space-y-8">
      {/* Header Wizard */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold border border-blue-200 mb-2">
            <Sparkles className="w-3.5 h-3.5 text-blue-600" />
            Alur Pemesanan Jadwal Siswa
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Pesan Jadwal Belajar Bimbel
          </h1>
          <p className="text-xs text-slate-500">
            Pilih hari, sesi jam, mapel, tutor, dan ruangan dengan kuota kursi yang valid secara real-time.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => loadInitialData()}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 shadow-xs cursor-pointer"
            title="Muat Ulang Kuota"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Segarkan Kuota</span>
          </button>

          <Link
            href="/my-tickets"
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition"
          >
            <Ticket className="w-4 h-4" />
            Tiket Saya
          </Link>
        </div>
      </div>

      {/* Progress Steps Breadcrumb */}
      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        {[
          { step: 1, label: "1. Hari & Sesi Jam", icon: CalendarDays },
          { step: 2, label: "2. Mapel & Tutor", icon: BookOpen },
          { step: 3, label: "3. Ruangan & Kuota", icon: DoorOpen },
        ].map((item) => {
          const Icon = item.icon;
          const isActive = currentStep === item.step;
          const isDone = currentStep > item.step;
          return (
            <button
              key={item.step}
              onClick={() => {
                if (isDone || item.step < currentStep) setCurrentStep(item.step);
              }}
              className={`flex items-center justify-center sm:justify-start gap-2.5 p-3 rounded-2xl border text-xs font-bold transition text-left cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25"
                  : isDone
                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                  : "bg-white text-slate-400 border-slate-200"
              }`}
            >
              <div
                className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                  isActive
                    ? "bg-white/20 text-white"
                    : isDone
                    ? "bg-emerald-200 text-emerald-800"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {isDone ? <Check className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
              </div>
              <span className="hidden sm:inline">{item.label}</span>
              <span className="sm:hidden">Step {item.step}</span>
            </button>
          );
        })}
      </div>

      {/* STEP 1: PILIH HARI & SESI JAM */}
      {currentStep === 1 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div>
            <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
              <CalendarDays className="w-5 h-5 text-blue-600" />
              Langkah 1: Tentukan Hari & Sesi Jam Operasional
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Pilih hari dan jam belajar bimbel yang paling sesuai dengan jadwal Anda.
            </p>
          </div>

          {/* Day Selection Chips */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Hari Belajar:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
              {DAYS.map((day) => {
                const isSelected = selectedDay === day;
                const slotCount = allSlots.filter((s) => s.dayOfWeek === day).length;
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => setSelectedDay(day)}
                    className={`py-3 px-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center justify-center ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/25"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span className="text-sm font-black">{day}</span>
                    <span
                      className={`text-[10px] mt-0.5 ${
                        isSelected ? "text-blue-100" : "text-slate-400"
                      }`}
                    >
                      {slotCount} Jadwal Tersedia
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Time Session Cards */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilih Sesi Jam ({selectedDay}):
            </label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {sessions.map((sess) => {
                const isSelected = selectedSessionId === sess.id;
                const scheduledForDaySession = allSlots.filter(
                  (s) => s.dayOfWeek === selectedDay && s.timeSessionId === sess.id
                );

                return (
                  <div
                    key={sess.id}
                    onClick={() => setSelectedSessionId(sess.id)}
                    className={`p-4 rounded-2xl border transition cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                        : "bg-white hover:bg-slate-50 border-slate-200"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-blue-600">
                        <CheckCircle className="w-5 h-5 fill-blue-600 text-white" />
                      </div>
                    )}
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider">
                      {sess.name}
                    </span>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <p className="text-base font-black text-slate-900">
                        {sess.startTime} - {sess.endTime}
                      </p>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <span>{scheduledForDaySession.length} Kelas Aktif</span>
                      {scheduledForDaySession.length > 0 ? (
                        <span className="text-emerald-600 font-bold">Tersedia</span>
                      ) : (
                        <span className="text-slate-400 italic">Belum ada kelas</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer"
            >
              <span>Lanjut ke Pilih Mapel & Tutor</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PILIH MAPEL & TUTOR */}
      {currentStep === 2 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-600" />
                Langkah 2: Pilih Mata Pelajaran & Tutor Pengajar
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Jadwal: <strong>{selectedDay}</strong>, Sesi:{" "}
                <strong>{selectedSession?.name} ({selectedSession?.startTime} - {selectedSession?.endTime})</strong>
              </p>
            </div>
          </div>

          {daySessionSlots.length === 0 ? (
            <div className="p-8 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-3">
              <AlertCircle className="w-8 h-8 text-amber-500 mx-auto" />
              <p className="text-sm font-bold text-amber-900">
                Belum ada jadwal kelas yang dibuka pada {selectedDay} ({selectedSession?.name}).
              </p>
              <p className="text-xs text-amber-700 max-w-md mx-auto">
                Silakan kembali ke Langkah 1 untuk memilih hari/sesi jam lain, atau hubungi Admin untuk membuka slot kelas pada sesi ini.
              </p>
              <button
                onClick={() => setCurrentStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                Kembali ke Pilih Hari & Sesi
              </button>
            </div>
          ) : (
            <>
              {/* Subject Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Mata Pelajaran:
                </label>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {subjects
                    .filter((subj) => availableSubjectIds.includes(subj.id))
                    .map((subj) => {
                      const isSelected = selectedSubjectId === subj.id;
                      return (
                        <div
                          key={subj.id}
                          onClick={() => setSelectedSubjectId(subj.id)}
                          className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? "bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20"
                              : "bg-white hover:bg-slate-50 border-slate-200"
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span
                                className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white shadow-xs"
                                style={{ backgroundColor: subj.color || "#4f46e5" }}
                              >
                                {subj.code}
                              </span>
                              {isSelected && (
                                <CheckCircle className="w-4 h-4 text-indigo-600" />
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-slate-900">
                              {subj.name}
                            </h4>
                            <p className="text-[11px] text-slate-500 line-clamp-2">
                              {subj.description || "Program intensif pembelajaran bimbel"}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* Tutor Selection */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Pilih Tutor Pengajar:
                </label>
                <div className="grid sm:grid-cols-2 gap-3">
                  {availableSlotsForSubject.map((slot) => {
                    const tutor = slot.tutor;
                    const isSelected = selectedTutorId === tutor.id;
                    return (
                      <div
                        key={slot.id}
                        onClick={() => {
                          setSelectedTutorId(tutor.id);
                          setSelectedSlotId(slot.id);
                        }}
                        className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                          isSelected
                            ? "bg-blue-50/80 border-blue-500 shadow-sm ring-2 ring-blue-500/20"
                            : "bg-white hover:bg-slate-50 border-slate-200"
                        }`}
                      >
                        <div className="w-12 h-12 rounded-xl bg-linear-to-tr from-indigo-500 to-blue-500 text-white flex items-center justify-center font-black text-sm shrink-0">
                          {tutor.name.charAt(0)}
                        </div>
                        <div className="space-y-1 grow">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-slate-900">
                              {tutor.name}
                            </h4>
                            {isSelected && (
                              <CheckCircle className="w-4 h-4 text-blue-600" />
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 line-clamp-2">
                            {tutor.bio || "Tutor berpengalaman di bidangnya"}
                          </p>
                          <div className="flex items-center gap-2 pt-1 text-[10px] text-blue-700 font-semibold">
                            <span>Ruang Kelas: {slot.room.name} ({slot.room.code})</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setCurrentStep(1)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedTutorId}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer"
                >
                  <span>Lanjut ke Pilih Ruangan & Kuota</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* STEP 3: PILIH RUANGAN & CEK KUOTA (FITUR KUNCI: AUTO-LOCKING SLOT) */}
      {currentStep === 3 && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs space-y-8 animate-in fade-in duration-200">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 flex items-center gap-2">
                  <DoorOpen className="w-5 h-5 text-emerald-600" />
                  Langkah 3: Pilih Ruangan & Validasi Kuota Kursi
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Aturan Ruangan: Kapasitas terbatas. Jika kuota penuh, slot otomatis <strong>DIKUNCI (DISABLED)</strong>.
                </p>
              </div>

              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-100 text-[11px] font-semibold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>Real-Time Engine Check</span>
              </div>
            </div>
          </div>

          {/* Slots Cards with Quota Indicators & Disabled Locking State */}
          <div className="space-y-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Pilihan Ruangan Tersedia:
            </label>

            <div className="grid md:grid-cols-2 gap-4">
              {candidateRoomSlots.map((slot) => {
                const isSelected = selectedSlotId === slot.id;
                const isFull = slot.isFull || slot.remainingSeats <= 0;
                const capacity = slot.capacity || slot.room.capacity;
                const bookingsCount = slot.bookingsCount ?? 0;
                const remaining = slot.remainingSeats;

                // Percentage
                const percentage = Math.min(100, Math.round((bookingsCount / capacity) * 100));

                return (
                  <div
                    key={slot.id}
                    onClick={() => {
                      if (!isFull) {
                        setSelectedSlotId(slot.id);
                      }
                    }}
                    className={`p-5 rounded-2xl border transition relative overflow-hidden flex flex-col justify-between ${
                      isFull
                        ? "bg-slate-100 border-red-200 opacity-80 cursor-not-allowed shadow-none"
                        : isSelected
                        ? "bg-emerald-50/50 border-emerald-500 shadow-md ring-2 ring-emerald-500/20 cursor-pointer"
                        : "bg-white hover:bg-slate-50 border-slate-200 hover:border-slate-300 shadow-xs cursor-pointer"
                    }`}
                  >
                    {/* Header: Room Name & Status Badge */}
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3
                              className={`text-base font-black ${
                                isFull ? "text-slate-600" : "text-slate-900"
                              }`}
                            >
                              {slot.room.name}
                            </h3>
                            <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                              {slot.room.code}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {slot.room.description || "Fasilitas lengkap ber-AC"}
                          </p>
                        </div>

                        {/* FITUR KUNCI: BADGE PENUH ATAU TERSISA KURSI */}
                        {isFull ? (
                          <div className="flex items-center gap-1 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black border border-red-300 shrink-0">
                            <Lock className="w-3.5 h-3.5" />
                            <span>PENUH</span>
                          </div>
                        ) : remaining <= 2 ? (
                          <div className="px-3 py-1 rounded-full bg-amber-100 text-amber-800 text-xs font-bold border border-amber-300 shrink-0 animate-pulse">
                            Tersisa {remaining} Kursi!
                          </div>
                        ) : (
                          <div className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-300 shrink-0">
                            Tersisa {remaining} Kursi
                          </div>
                        )}
                      </div>

                      {/* Tutor & Subject Info */}
                      <div className="pt-2 text-xs text-slate-600 space-y-1">
                        <div className="flex items-center gap-1.5">
                          <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                          <span>{slot.subject.name}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-indigo-600" />
                          <span>{slot.tutor.name}</span>
                        </div>
                      </div>

                      {/* Quota Progress Bar */}
                      <div className="pt-3 space-y-1.5">
                        <div className="flex items-center justify-between text-[11px] font-bold">
                          <span className="text-slate-500">Kapasitas Terisi:</span>
                          <span
                            className={
                              isFull
                                ? "text-red-600"
                                : remaining <= 2
                                ? "text-amber-600"
                                : "text-emerald-600"
                            }
                          >
                            {bookingsCount} dari {capacity} Siswa ({percentage}%)
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-300 ${
                              isFull
                                ? "bg-red-500"
                                : remaining <= 2
                                ? "bg-amber-500"
                                : "bg-emerald-500"
                            }`}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Action Select or Disabled Locked Button */}
                    <div className="mt-5 pt-3 border-t border-slate-100">
                      {isFull ? (
                        <button
                          type="button"
                          disabled
                          className="w-full py-2.5 rounded-xl bg-slate-200 text-slate-500 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed border border-slate-300"
                        >
                          <Lock className="w-3.5 h-3.5" />
                          <span>Slot Terkunci (Kapasitas Maksimal)</span>
                        </button>
                      ) : isSelected ? (
                        <div className="w-full py-2.5 rounded-xl bg-emerald-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm">
                          <CheckCircle className="w-4 h-4" />
                          <span>Ruangan Terpilih</span>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setSelectedSlotId(slot.id)}
                          className="w-full py-2.5 rounded-xl bg-white hover:bg-slate-50 text-blue-600 hover:text-blue-700 text-xs font-bold border border-blue-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                        >
                          <span>Pilih Ruangan Ini</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Booking Summary & Confirmation Card */}
          {activeSlot && (
            <div className="p-6 rounded-2xl bg-linear-to-br from-blue-50 to-indigo-50 border border-blue-200 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-blue-900 uppercase tracking-wider">
                  Ringkasan Pemesanan Jadwal
                </span>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-200 text-blue-800">
                  Siap Konfirmasi
                </span>
              </div>

              <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Hari & Sesi</span>
                  <strong className="text-slate-800 text-xs">
                    {activeSlot.dayOfWeek}, {activeSlot.timeSession.startTime} - {activeSlot.timeSession.endTime}
                  </strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Mata Pelajaran</span>
                  <strong className="text-slate-800 text-xs">
                    {activeSlot.subject.name}
                  </strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Tutor Pengajar</span>
                  <strong className="text-slate-800 text-xs">
                    {activeSlot.tutor.name}
                  </strong>
                </div>
                <div className="bg-white p-3 rounded-xl border border-blue-100 shadow-2xs">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Ruangan Terpilih</span>
                  <strong className="text-slate-800 text-xs">
                    {activeSlot.room.name} ({activeSlot.room.code})
                  </strong>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Catatan Tambahan Siswa (Opsional):
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Misal: Ingin fokus pada latihan soal UTBK Aljabar..."
                  className="w-full p-2.5 rounded-xl border border-blue-200 bg-white text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {errorMessage && (
                <div className="p-4 rounded-xl bg-red-100 border border-red-300 text-red-800 text-xs font-semibold flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <strong className="block text-red-900 font-bold mb-0.5">
                      Validasi System Engine Menolak:
                    </strong>
                    <span>{errorMessage}</span>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-2">
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-600 text-xs font-semibold hover:bg-slate-50 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>

                <button
                  type="button"
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-extrabold text-xs shadow-lg shadow-blue-500/30 transition cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Memvalidasi Ketersediaan di Backend...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>Konfirmasi Booking Sekarang</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* SUCCESS CONFIRMATION MODAL & E-TICKET PREVIEW */}
      {confirmedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/20">
                <CheckCircle className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                Booking Berhasil Terkonfirmasi!
              </h3>
              <p className="text-xs text-slate-500">
                System Engine telah memverifikasi kuota ruangan dan mengunci slot untuk Anda.
              </p>
            </div>

            {/* E-Ticket Card Preview */}
            <div className="bg-linear-to-br from-blue-600 via-indigo-600 to-violet-700 text-white rounded-2xl p-5 shadow-lg relative overflow-hidden space-y-4">
              <div className="flex items-center justify-between border-b border-white/20 pb-3">
                <div className="flex items-center gap-2">
                  <Ticket className="w-4 h-4 text-amber-300" />
                  <span className="text-xs font-extrabold tracking-wider uppercase text-blue-100">
                    E-Tiket Bimbel Resmi
                  </span>
                </div>
                <span className="font-mono font-black text-xs px-2.5 py-1 rounded bg-white/20 text-white border border-white/30">
                  {confirmedBooking.ticketCode}
                </span>
              </div>

              <div className="space-y-1">
                <h4 className="text-lg font-black text-white">
                  {confirmedBooking.classSlot?.subject?.name}
                </h4>
                <p className="text-xs text-blue-100">
                  Tutor: {confirmedBooking.classSlot?.tutor?.name}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-white/10 text-xs">
                <div>
                  <span className="text-[10px] text-blue-200 block uppercase font-bold">Waktu Belajar</span>
                  <span className="font-bold">
                    {confirmedBooking.classSlot?.dayOfWeek}, {confirmedBooking.classSlot?.timeSession?.startTime} - {confirmedBooking.classSlot?.timeSession?.endTime}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-blue-200 block uppercase font-bold">Ruangan</span>
                  <span className="font-bold">
                    {confirmedBooking.classSlot?.room?.name} ({confirmedBooking.classSlot?.room?.code})
                  </span>
                </div>
              </div>

              <div className="pt-2 text-[10px] text-blue-200 flex items-center justify-between border-t border-white/10">
                <span>Nama Siswa: <strong>{confirmedBooking.student?.name}</strong></span>
                <span className="font-mono tracking-widest opacity-80">||||||||||||||||||</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setConfirmedBooking(null);
                  setSelectedSlotId("");
                  setCurrentStep(1);
                }}
                className="w-full sm:w-1/2 py-3 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold transition cursor-pointer text-center"
              >
                Pesan Jadwal Lain
              </button>
              <Link
                href="/my-tickets"
                className="w-full sm:w-1/2 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/25 transition text-center"
              >
                Lihat Tiket & Jadwal Saya &rarr;
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
