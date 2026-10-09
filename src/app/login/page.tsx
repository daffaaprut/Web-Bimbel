"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  GraduationCap,
  School,
  User,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { usersList, loginAs, refreshUsers } = useAuth();
  const [roleTab, setRoleTab] = useState<"STUDENT" | "ADMIN">("STUDENT");

  // Registration / Custom login states
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const filteredUsers = usersList.filter((u) => u.role === roleTab);

  const handleSelectUser = (u: any) => {
    loginAs(u);
    if (u.role === "ADMIN") {
      router.push("/admin");
    } else {
      router.push("/booking");
    }
  };

  const handleSubmitNew = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) {
      setErrorMsg("Nama dan email wajib diisi.");
      return;
    }

    setIsSubmitting(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: roleTab,
          phone,
        }),
      });
      const data = await res.json();
      if (data.success) {
        await refreshUsers();
        loginAs(data.data);
        if (roleTab === "ADMIN") {
          router.push("/admin");
        } else {
          router.push("/booking");
        }
      } else {
        setErrorMsg(data.message || "Gagal masuk.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Terjadi kesalahan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 bg-linear-to-b from-slate-50 to-blue-50/40">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200/60 border border-slate-200/80 p-6 sm:p-8 space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-14 h-14 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-md shadow-blue-500/25">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Masuk ke Sistem Bimbel
          </h1>
          <p className="text-xs text-slate-500">
            Pilih peran simulasi atau daftarkan akun baru Anda
          </p>
        </div>

        {/* Role Tab Selector */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 rounded-2xl gap-1">
          <button
            type="button"
            onClick={() => setRoleTab("STUDENT")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleTab === "STUDENT"
                ? "bg-white text-blue-700 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            Sebagai Siswa
          </button>
          <button
            type="button"
            onClick={() => setRoleTab("ADMIN")}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              roleTab === "ADMIN"
                ? "bg-white text-amber-700 shadow-xs border border-slate-200/60"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <School className="w-4 h-4" />
            Sebagai Admin
          </button>
        </div>

        {/* Fast 1-Click Persona Pick */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              {roleTab === "STUDENT" ? "Pilih Akun Siswa Tersedia" : "Pilih Akun Admin"}
            </p>
            <span className="text-[11px] text-blue-600 font-semibold">1-Klik Langsung Masuk</span>
          </div>

          <div className="space-y-2">
            {filteredUsers.length === 0 ? (
              <p className="text-xs text-slate-400 italic">Tidak ada user tersedia.</p>
            ) : (
              filteredUsers.map((u) => (
                <button
                  key={u.id}
                  onClick={() => handleSelectUser(u)}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-200 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/50 transition text-left cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs text-white ${
                        u.role === "ADMIN" ? "bg-amber-600" : "bg-blue-600"
                      }`}
                    >
                      {u.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition">
                        {u.name}
                      </p>
                      <p className="text-[11px] text-slate-400">{u.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-slate-400 group-hover:text-blue-600">
                    <span>Masuk</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>

        {/* Divider */}
        <div className="relative flex py-1 items-center">
          <div className="grow border-t border-slate-200"></div>
          <span className="shrink mx-4 text-[11px] uppercase font-bold text-slate-400">
            atau gunakan form
          </span>
          <div className="grow border-t border-slate-200"></div>
        </div>

        {/* Custom Input Form */}
        <form onSubmit={handleSubmitNew} className="space-y-3.5">
          {errorMsg && (
            <div className="p-3 rounded-xl bg-red-50 text-red-700 text-xs border border-red-200 font-medium">
              {errorMsg}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Alamat Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Contoh: budi@gmail.com"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              No. WhatsApp / HP (Opsional)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="0812-xxxx-xxxx"
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 rounded-xl bg-linear-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md shadow-blue-500/25 transition cursor-pointer disabled:opacity-50"
          >
            {isSubmitting
              ? "Memproses..."
              : `Masuk / Buat Akun ${roleTab === "ADMIN" ? "Admin" : "Siswa"}`}
          </button>
        </form>

        <div className="pt-2 text-center">
          <p className="text-[11px] text-slate-400 flex items-center justify-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            Validasi proteksi data terintegrasi dengan System Engine
          </p>
        </div>
      </div>
    </div>
  );
}
