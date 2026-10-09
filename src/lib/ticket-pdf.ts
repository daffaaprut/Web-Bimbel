import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";

/**
 * Generates a PDF file from a structured ticket data object
 * and triggers a direct browser download — NO print dialog.
 */
export async function downloadTicketPDF(
  _element: HTMLElement,
  ticketCode: string
): Promise<void> {
  const d = (_element as any).__bookingData__ || {};

  // ── Build a hidden off-screen div with the ticket layout ──────────────────
  const container = document.createElement("div");
  // Position it off-screen but still rendered (html2canvas needs it visible)
  Object.assign(container.style, {
    position: "fixed",
    top: "-9999px",
    left: "-9999px",
    width: "794px",   // A4 width in px @96dpi, works great for A5 landscape too
    background: "#ffffff",
    fontFamily: "'Inter', 'Segoe UI', sans-serif",
    zIndex: "-1",
  });

  container.innerHTML = buildTicketHTML(d, ticketCode);
  document.body.appendChild(container);

  try {
    // Wait one frame so browser paints the element
    await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));

    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      windowWidth: 794,
    });

    const imgData = canvas.toDataURL("image/png");

    // A5 landscape: 210 × 148 mm
    const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a5" });
    const pageW = pdf.internal.pageSize.getWidth();   // 210
    const pageH = pdf.internal.pageSize.getHeight();  // 148

    const margin = 8;
    const availW = pageW - margin * 2;
    const imgH = (canvas.height * availW) / canvas.width;
    const yPos = imgH < pageH - margin * 2 ? (pageH - imgH) / 2 : margin;

    pdf.addImage(imgData, "PNG", margin, yPos, availW, imgH);
    pdf.save(`Tiket-Bimbel-${ticketCode}.pdf`);
  } finally {
    document.body.removeChild(container);
  }
}

// ── Ticket HTML template (inline styles only — no Tailwind) ─────────────────
function buildTicketHTML(d: Record<string, any>, ticketCode: string): string {
  const field = (label: string, value: string, extra = "") => `
    <div>
      <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px">${label}</div>
      <div style="font-size:13px;font-weight:900;color:#0f172a">${value}</div>
      ${extra}
    </div>`;

  const notesBlock = d.notes
    ? `<div style="margin-top:12px;padding:9px 11px;border-radius:8px;background:#f8fafc;border:1px solid #e2e8f0;font-size:10px;color:#475569">
         <strong>Catatan:</strong> ${d.notes}
       </div>`
    : "";

  return `
<div style="border:2px solid #1e293b;border-radius:16px;overflow:hidden;background:#fff;width:100%">

  <!-- ── HEADER ─────────────────────────────────────────── -->
  <div style="background:#0f172a;color:#fff;padding:16px 24px;display:flex;align-items:center;justify-content:space-between">
    <div style="display:flex;align-items:center;gap:12px">
      <div style="width:40px;height:40px;border-radius:10px;background:#2563eb;display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/>
        </svg>
      </div>
      <div>
        <div style="font-size:15px;font-weight:900;line-height:1.2">BIMBEL SCHEDULER INDONESIA</div>
        <div style="font-size:9px;text-transform:uppercase;letter-spacing:.15em;color:#93c5fd;margin-top:2px">E-Tiket Resmi Presensi Siswa</div>
      </div>
    </div>
    <div style="text-align:right">
      <div style="font-size:8px;text-transform:uppercase;color:#94a3b8;margin-bottom:3px">Kode Registrasi</div>
      <div style="font-family:monospace;font-size:14px;font-weight:900;padding:4px 12px;border-radius:6px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.2);color:#34d399;letter-spacing:.05em">${ticketCode}</div>
    </div>
  </div>

  <!-- ── BODY ───────────────────────────────────────────── -->
  <div style="display:flex;background:#fff">

    <!-- Main info -->
    <div style="flex:1;padding:20px 24px">
      <!-- Student -->
      <div style="border-bottom:1px solid #e2e8f0;padding-bottom:12px;margin-bottom:14px">
        <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px">Nama Siswa Terdaftar</div>
        <div style="font-size:18px;font-weight:900;color:#0f172a;line-height:1.2">${d.studentName || "-"}</div>
        <div style="font-size:10px;color:#64748b;margin-top:2px">${d.studentEmail || ""}</div>
      </div>

      <!-- Subject + Tutor -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:14px">
        <div>
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px">Mata Pelajaran</div>
          <div style="font-size:13px;font-weight:900;color:#1d4ed8">${d.subject || "-"}</div>
          <div style="display:inline-block;font-size:8px;font-weight:700;padding:2px 6px;border-radius:4px;background:#f1f5f9;color:#475569;margin-top:3px">Kode: ${d.subjectCode || "-"}</div>
        </div>
        <div>
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px">Tutor Pengajar</div>
          <div style="font-size:13px;font-weight:900;color:#0f172a">${d.tutor || "-"}</div>
        </div>
      </div>

      <!-- Day + Room -->
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;padding-top:12px;border-top:1px solid #f1f5f9">
        <div>
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px">Hari &amp; Waktu Belajar</div>
          <div style="font-size:13px;font-weight:900;color:#0f172a">${d.day || "-"}</div>
          <div style="font-size:10px;color:#475569;margin-top:2px">${d.startTime || ""} – ${d.endTime || ""}</div>
          <div style="font-size:8.5px;color:#94a3b8">(${d.session || ""})</div>
        </div>
        <div>
          <div style="font-size:8px;font-weight:800;text-transform:uppercase;letter-spacing:.12em;color:#94a3b8;margin-bottom:3px">Ruang Kelas</div>
          <div style="font-size:13px;font-weight:900;color:#0f172a">${d.room || "-"}</div>
          <div style="font-family:monospace;font-size:10px;color:#2563eb;font-weight:700">${d.roomCode || ""}</div>
          <div style="font-size:8.5px;color:#94a3b8">Kapasitas Maks: ${d.capacity || "-"} Siswa</div>
        </div>
      </div>

      ${notesBlock}
    </div>

    <!-- QR Stub -->
    <div style="width:130px;border-left:2px dashed #cbd5e1;padding:20px 14px;display:flex;flex-direction:column;align-items:center;justify-content:space-between;text-align:center">
      <div>
        <div style="font-size:7.5px;font-weight:800;text-transform:uppercase;letter-spacing:.1em;color:#94a3b8;margin-bottom:6px">Barcode Presensi</div>
        <div style="width:80px;height:80px;border:2px solid #1e293b;border-radius:10px;display:flex;align-items:center;justify-content:center;background:#fff;margin:0 auto">
          <svg width="58" height="58" viewBox="0 0 100 100" fill="#000">
            <rect x="2" y="2" width="36" height="36" fill="none" stroke="#000" stroke-width="7"/>
            <rect x="12" y="12" width="16" height="16"/>
            <rect x="62" y="2" width="36" height="36" fill="none" stroke="#000" stroke-width="7"/>
            <rect x="72" y="12" width="16" height="16"/>
            <rect x="2" y="62" width="36" height="36" fill="none" stroke="#000" stroke-width="7"/>
            <rect x="12" y="72" width="16" height="16"/>
            <rect x="54" y="54" width="10" height="10"/>
            <rect x="70" y="54" width="10" height="10"/>
            <rect x="86" y="54" width="10" height="10"/>
            <rect x="54" y="70" width="10" height="10"/>
            <rect x="86" y="70" width="10" height="10"/>
            <rect x="54" y="86" width="10" height="10"/>
            <rect x="70" y="86" width="10" height="10"/>
          </svg>
        </div>
        <div style="font-family:monospace;font-size:7px;font-weight:700;color:#475569;letter-spacing:.08em;margin-top:5px">${ticketCode}</div>
      </div>
      <div>
        <div style="padding:3px 8px;border-radius:20px;background:#d1fae5;color:#065f46;font-size:8.5px;font-weight:800;letter-spacing:.06em">VALID PASS</div>
        <div style="font-size:7.5px;color:#94a3b8;line-height:1.4;margin-top:5px">Hadir 10 mnt sebelum kelas. Tunjukkan kpd tutor/admin.</div>
      </div>
    </div>
  </div>

  <!-- ── FOOTER ─────────────────────────────────────────── -->
  <div style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:7px 22px;display:flex;align-items:center;justify-content:space-between;font-size:8.5px;color:#94a3b8">
    <span>Divalidasi oleh <strong style="color:#475569">System Engine BimbelScheduler</strong></span>
    <span style="letter-spacing:2px;font-family:monospace">||| | ||||| || |||| ||| ||||</span>
  </div>
</div>`;
}
