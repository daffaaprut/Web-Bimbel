import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Sistem Penjadwalan Otomatis Bimbel | BMB Scheduler",
  description: "Platform penjadwalan cerdas bimbingan belajar dengan proteksi over-capacity dan zero-conflict scheduling.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900 font-sans selection:bg-blue-500 selection:text-white">
        <AuthProvider>
          <Navbar />
          <main className="flex-1">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-xs text-slate-500 no-print print:hidden">
            <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p>
                &copy; 2026 <strong>BimbelScheduler</strong>. Sistem Penjadwalan Otomatis & Kuota Ruangan Pintar.
              </p>
              <div className="flex items-center gap-4 text-slate-400">
                <span>Next.js App Router</span>
                <span>•</span>
                <span>Prisma ORM</span>
                <span>•</span>
                <span>Tailwind CSS</span>
              </div>
            </div>
          </footer>
        </AuthProvider>
      </body>
    </html>
  );
}
