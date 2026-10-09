import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Mulai seeding database Bimbel...");

  // 1. Clean existing records in correct order
  await prisma.booking.deleteMany();
  await prisma.classSlot.deleteMany();
  await prisma.tutorSubject.deleteMany();
  await prisma.tutor.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.room.deleteMany();
  await prisma.timeSession.deleteMany();
  await prisma.user.deleteMany();

  // 2. Users (Admin and Students)
  const admin = await prisma.user.create({
    data: {
      name: "Super Admin Bimbel",
      email: "admin@bimbel.id",
      role: "ADMIN",
      phone: "0812-3456-7890",
    },
  });

  const student1 = await prisma.user.create({
    data: {
      name: "Ahmad Rizky Pratama",
      email: "ahmad@siswa.id",
      role: "STUDENT",
      phone: "0813-1122-3344",
    },
  });

  const student2 = await prisma.user.create({
    data: {
      name: "Alya Putri Dewanti",
      email: "alya@siswa.id",
      role: "STUDENT",
      phone: "0813-2233-4455",
    },
  });

  const student3 = await prisma.user.create({
    data: {
      name: "Bima Arya Sena",
      email: "bima@siswa.id",
      role: "STUDENT",
      phone: "0813-3344-5566",
    },
  });

  const student4 = await prisma.user.create({
    data: {
      name: "Cantika Melani",
      email: "cantika@siswa.id",
      role: "STUDENT",
      phone: "0813-4455-6677",
    },
  });

  // 3. Rooms
  const room1 = await prisma.room.create({
    data: {
      name: "Ruang Einstein",
      code: "R-101",
      capacity: 3, // Small capacity to easily test capacity locking (PENUH)
      description: "Ruang intensif ber-AC dengan smartboard interaktif",
    },
  });

  const room2 = await prisma.room.create({
    data: {
      name: "Ruang Newton",
      code: "R-102",
      capacity: 5,
      description: "Ruang medium focus group diskusi dan latihan soal",
    },
  });

  const room3 = await prisma.room.create({
    data: {
      name: "Ruang Curie",
      code: "R-103",
      capacity: 8,
      description: "Laboratorium sains dan ruang praktikum terpadu",
    },
  });

  const room4 = await prisma.room.create({
    data: {
      name: "Ruang Galileo",
      code: "R-104",
      capacity: 10,
      description: "Ruang kelas besar untuk simulasi tryout dan pembahasan",
    },
  });

  // 4. Subjects
  const subjMtk = await prisma.subject.create({
    data: {
      name: "Matematika Intensif",
      code: "MTK",
      description: "Aljabar, Kalkulus, dan Trik Cepat UTBK",
      color: "#2563eb", // Blue
    },
  });

  const subjFis = await prisma.subject.create({
    data: {
      name: "Fisika Terapan",
      code: "FIS",
      description: "Mekanika, Listrik Magnet & Gelombang",
      color: "#7c3aed", // Violet
    },
  });

  const subjKim = await prisma.subject.create({
    data: {
      name: "Kimia UTBK & Olimpiade",
      code: "KIM",
      description: "Stoikiometri, Ikatan Kimia & Reaksi Organik",
      color: "#db2777", // Pink
    },
  });

  const subjBio = await prisma.subject.create({
    data: {
      name: "Biologi Medika",
      code: "BIO",
      description: "Anatomi, Fisiologi, Genetika & Sel",
      color: "#059669", // Emerald
    },
  });

  const subjEng = await prisma.subject.create({
    data: {
      name: "Bahasa Inggris TOEFL / IELTS",
      code: "ENG",
      description: "Grammar Mastery, Reading Comprehension & Vocab",
      color: "#d97706", // Amber
    },
  });

  // 5. Tutors
  const tutorDimas = await prisma.tutor.create({
    data: {
      name: "Kak Dimas Maulana, M.Pd",
      email: "dimas@tutor.bimbel.id",
      phone: "0821-1001-2001",
      bio: "Master Matematika UI, 7 tahun pengalaman membimbing siswa lolos PTN Favorit.",
    },
  });

  const tutorSarah = await prisma.tutor.create({
    data: {
      name: "Kak Sarah Octavia, S.Si",
      email: "sarah@tutor.bimbel.id",
      phone: "0821-1001-2002",
      bio: "Alumni Fisika ITB, spesialis konsep dasar fisika tanpa hafalan rumus mati.",
    },
  });

  const tutorFajar = await prisma.tutor.create({
    data: {
      name: "Kak Fajar Nugroho, S.Pd",
      email: "fajar@tutor.bimbel.id",
      phone: "0821-1001-2003",
      bio: "Tutor Kimia Berprestasi, penyusun modul pembahasan soal HOTS.",
    },
  });

  const tutorNadia = await prisma.tutor.create({
    data: {
      name: "Kak Nadia Larasati, S.Si",
      email: "nadia@tutor.bimbel.id",
      phone: "0821-1001-2004",
      bio: "Dokter muda & mentor Biologi Kedokteran berdedikasi tinggi.",
    },
  });

  const tutorKevin = await prisma.tutor.create({
    data: {
      name: "Kak Kevin Alexander, B.Ed",
      email: "kevin@tutor.bimbel.id",
      phone: "0821-1001-2005",
      bio: "Penerima beasiswa LPDP, TOEFL Score 640, pakar Academic English.",
    },
  });

  // Link Tutors with Subjects
  await prisma.tutorSubject.createMany({
    data: [
      { tutorId: tutorDimas.id, subjectId: subjMtk.id },
      { tutorId: tutorSarah.id, subjectId: subjFis.id },
      { tutorId: tutorFajar.id, subjectId: subjKim.id },
      { tutorId: tutorNadia.id, subjectId: subjBio.id },
      { tutorId: tutorKevin.id, subjectId: subjEng.id },
    ],
  });

  // 6. Time Sessions
  const session1 = await prisma.timeSession.create({
    data: {
      name: "Sesi 1 (Pagi)",
      startTime: "08:00",
      endTime: "09:30",
      order: 1,
    },
  });

  const session2 = await prisma.timeSession.create({
    data: {
      name: "Sesi 2 (Menjelang Siang)",
      startTime: "10:00",
      endTime: "11:30",
      order: 2,
    },
  });

  const session3 = await prisma.timeSession.create({
    data: {
      name: "Sesi 3 (Siang)",
      startTime: "13:00",
      endTime: "14:30",
      order: 3,
    },
  });

  const session4 = await prisma.timeSession.create({
    data: {
      name: "Sesi 4 (Sore)",
      startTime: "15:30",
      endTime: "17:00",
      order: 4,
    },
  });

  const session5 = await prisma.timeSession.create({
    data: {
      name: "Sesi 5 (Malam)",
      startTime: "18:30",
      endTime: "20:00",
      order: 5,
    },
  });

  // 7. Class Slots (Scheduled Offerings)
  // Slot A: Senin Sesi 1 - MTK - Kak Dimas di Ruang Einstein (Cap: 3)
  const slotA = await prisma.classSlot.create({
    data: {
      dayOfWeek: "Senin",
      timeSessionId: session1.id,
      subjectId: subjMtk.id,
      tutorId: tutorDimas.id,
      roomId: room1.id,
      notes: "Pembahasan Trik Cepat Aljabar & Fungsi",
    },
  });

  // Slot B: Senin Sesi 1 - FIS - Kak Sarah di Ruang Newton (Cap: 5)
  const slotB = await prisma.classSlot.create({
    data: {
      dayOfWeek: "Senin",
      timeSessionId: session1.id,
      subjectId: subjFis.id,
      tutorId: tutorSarah.id,
      roomId: room2.id,
      notes: "Konsep Gerak Parabola & Hukum Newton",
    },
  });

  // Slot C: Senin Sesi 2 - KIM - Kak Fajar di Ruang Curie (Cap: 8)
  const slotC = await prisma.classSlot.create({
    data: {
      dayOfWeek: "Senin",
      timeSessionId: session2.id,
      subjectId: subjKim.id,
      tutorId: tutorFajar.id,
      roomId: room3.id,
      notes: "Studi Kasus Reaksi Redoks & Elektrokimia",
    },
  });

  // Slot D: Selasa Sesi 2 - BIO - Kak Nadia di Ruang Einstein (Cap: 3)
  const slotD = await prisma.classSlot.create({
    data: {
      dayOfWeek: "Selasa",
      timeSessionId: session2.id,
      subjectId: subjBio.id,
      tutorId: tutorNadia.id,
      roomId: room1.id,
      notes: "Pendalaman Sistem Organ Manusia & Soal UTBK",
    },
  });

  // Slot E: Rabu Sesi 3 - ENG - Kak Kevin di Ruang Galileo (Cap: 10)
  const slotE = await prisma.classSlot.create({
    data: {
      dayOfWeek: "Rabu",
      timeSessionId: session3.id,
      subjectId: subjEng.id,
      tutorId: tutorKevin.id,
      roomId: room4.id,
      notes: "Reading Comprehension Strategy for UTBK",
    },
  });

  // Slot F: Kamis Sesi 1 - MTK - Kak Dimas di Ruang Newton (Cap: 5)
  await prisma.classSlot.create({
    data: {
      dayOfWeek: "Kamis",
      timeSessionId: session1.id,
      subjectId: subjMtk.id,
      tutorId: tutorDimas.id,
      roomId: room2.id,
      notes: "Trigonometri & Limit Fungsi Aljabar",
    },
  });

  // 8. Sample Bookings to demonstrate locking:
  // Slot A (Cap: 3) booked by student1, student2, and student3 -> FULL (Capacity 3 of 3)
  // This demonstrates Rule 3: Automatically LOCKED / DISABLED!
  await prisma.booking.create({
    data: {
      ticketCode: "TIK-202610-8001",
      studentId: student1.id,
      classSlotId: slotA.id,
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      ticketCode: "TIK-202610-8002",
      studentId: student2.id,
      classSlotId: slotA.id,
      status: "CONFIRMED",
    },
  });

  await prisma.booking.create({
    data: {
      ticketCode: "TIK-202610-8003",
      studentId: student3.id,
      classSlotId: slotA.id,
      status: "CONFIRMED",
    },
  });

  // Slot B (Cap: 5) booked by student4 -> Tersisa 4 Kursi
  await prisma.booking.create({
    data: {
      ticketCode: "TIK-202610-8004",
      studentId: student4.id,
      classSlotId: slotB.id,
      status: "CONFIRMED",
    },
  });

  // Slot D (Cap: 3) booked by student1 -> Tersisa 2 Kursi
  await prisma.booking.create({
    data: {
      ticketCode: "TIK-202610-8005",
      studentId: student1.id,
      classSlotId: slotD.id,
      status: "CONFIRMED",
    },
  });

  console.log("✅ Seeding database Bimbel berhasil diselesaikan!");
  console.log("   - Admin: admin@bimbel.id");
  console.log("   - Siswa 1: ahmad@siswa.id (memiliki 2 booking)");
  console.log("   - Siswa 2: alya@siswa.id");
  console.log("   - Siswa 3: bima@siswa.id");
  console.log("   - Siswa 4: cantika@siswa.id");
  console.log("   - Slot A (Senin Sesi 1 MTK R-101): Terisi 3/3 (PENUH / DISABLED)");
  console.log("   - Slot B (Senin Sesi 1 FIS R-102): Terisi 1/5 (Tersisa 4 Kursi)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
