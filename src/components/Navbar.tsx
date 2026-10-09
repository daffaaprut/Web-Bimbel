"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import {
  CalendarDays,
  ShieldCheck,
  GraduationCap,
  Layers,
  Ticket,
  Home,
  LogOut,
} from "lucide-react";

export default function Navbar() {
  const { currentUser } = useAuth();
  const pathname = usePathname();

  const isAdmin = currentUser?.role === "ADMIN";

  const adminNav = [
    { name: "Overview & Monitoring", href: "/admin", icon: Home },
    { name: "Kelola Master Data", href: "/admin/master", icon: Layers },
    { name: "Jadwal Keseluruhan", href: "/admin/schedule", icon: CalendarDays },
  ];

  const studentNav = [
    { name: "Pesan Jadwal Belajar", href: "/booking", icon: CalendarDays },
    { name: "Tiket & Jadwal Saya", href: "/my-tickets", icon: Ticket },
  ];

  const currentNav = isAdmin ? adminNav : studentNav;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print print:hidden">
      {/* Top Banner: System Engine Protection Status */}
      <div className="bg-linear-to-r from-blue-700 via-indigo-700 to-violet-800 text-white text-xs px-4 py-1.5">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 font-medium">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
            </span>
            <span className="text-blue-100 flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
              <strong className="text-white">System Engine Aktif:</strong> Validasi Real-Time Anti Over-Capacity &amp; Zero Double-Booking
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs text-blue-100">
            <span className="hidden sm:inline">Role aktif:</span>
            <span
              className={`px-2 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                isAdmin
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40"
                  : "bg-emerald-400/20 text-emerald-300 border border-emerald-400/40"
              }`}
            >
              {currentUser ? currentUser.role : "GUEST"}
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/25 group-hover:scale-105 transition-transform">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-lg tracking-tight bg-linear-to-r from-blue-700 via-indigo-700 to-slate-900 bg-clip-text text-transparent">
                  BimbelScheduler
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 border border-blue-200">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium -mt-1">
                Sistem Penjadwalan Otomatis &amp; Kuota Pintar
              </p>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {currentNav.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    isActive
                      ? "bg-blue-50 text-blue-700 font-bold border border-blue-200/60 shadow-xs"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-blue-600" : "text-slate-400"}`} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* Right side: User Profile + Ganti Akun */}
          <div className="flex items-center gap-2">
            {/* Profile chip (non-clickable, just info) */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white shadow-xs">
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs text-white ${
                  isAdmin ? "bg-amber-600" : "bg-blue-600"
                }`}
              >
                {currentUser?.name?.charAt(0) || "U"}
              </div>
              <div className="hidden sm:block">
                <p className="text-xs font-bold text-slate-800 leading-tight">
                  {currentUser?.name || "Tamu"}
                </p>
                <p className="text-[10px] text-slate-500">
                  {currentUser?.role === "ADMIN" ? "Administrator" : "Siswa Bimbel"}
                </p>
              </div>
            </div>

            {/* Ganti Akun → Login */}
            <Link
              href="/login"
              title="Ganti akun / Logout"
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 hover:border-red-300 hover:bg-red-50 text-slate-500 hover:text-red-600 text-xs font-semibold transition cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Ganti Akun</span>
            </Link>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="flex md:hidden items-center justify-around py-2 border-t border-slate-100 text-xs">
          {currentNav.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition ${
                  isActive
                    ? "bg-blue-50 text-blue-700 border border-blue-200"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.name}
              </Link>
            );
          })}
          {/* Mobile logout */}
          <Link
            href="/login"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold text-slate-500 hover:bg-red-50 hover:text-red-600 transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            Ganti
          </Link>
        </div>
      </div>
    </header>
  );
}
