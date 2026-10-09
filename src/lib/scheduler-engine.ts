import prisma from "./prisma";

export interface BookingValidationResult {
  valid: boolean;
  message?: string;
  errorType?: "OVER_CAPACITY" | "TUTOR_CLASH" | "ROOM_CLASH" | "STUDENT_DOUBLE_BOOKING" | "SLOT_NOT_FOUND" | "ALREADY_BOOKED";
  slot?: any;
}

/**
 * Validates whether a student can book a specific ClassSlot.
 * Checks for:
 * 1. Slot existence and active status
 * 2. Room capacity (Rule 1 & 3: Locking Slot Otomatis)
 * 3. Student double-booking in same slot
 * 4. Student clash in same day + time session (Rule 4)
 */
export async function validateBookingAttempt(
  studentId: string,
  classSlotId: string
): Promise<BookingValidationResult> {
  const slot = await prisma.classSlot.findUnique({
    where: { id: classSlotId },
    include: {
      room: true,
      timeSession: true,
      subject: true,
      tutor: true,
      bookings: {
        where: { status: "CONFIRMED" },
      },
    },
  });

  if (!slot || !slot.isActive) {
    return {
      valid: false,
      errorType: "SLOT_NOT_FOUND",
      message: "Jadwal kelas tidak ditemukan atau sudah tidak aktif.",
    };
  }

  // 1. Check if student already booked this exact slot
  const alreadyBookedThisSlot = slot.bookings.some(
    (b) => b.studentId === studentId
  );
  if (alreadyBookedThisSlot) {
    return {
      valid: false,
      errorType: "ALREADY_BOOKED",
      message: "Anda sudah terdaftar pada jadwal kelas ini.",
      slot,
    };
  }

  // 2. Rule 3: Locking Slot Otomatis (Check Room Capacity)
  const currentOccupancy = slot.bookings.length;
  if (currentOccupancy >= slot.room.capacity) {
    return {
      valid: false,
      errorType: "OVER_CAPACITY",
      message: `Maaf, kapasitas kelas di ${slot.room.name} sudah PENUH (${currentOccupancy}/${slot.room.capacity} siswa). Slot ini otomatis terkunci.`,
      slot,
    };
  }

  // 3. Rule 4: Aturan Siswa - Siswa tidak boleh booking 2 kali pada Sesi Jam dan Hari yang sama
  const conflictingStudentBooking = await prisma.booking.findFirst({
    where: {
      studentId: studentId,
      status: "CONFIRMED",
      classSlot: {
        dayOfWeek: slot.dayOfWeek,
        timeSessionId: slot.timeSessionId,
      },
    },
    include: {
      classSlot: {
        include: {
          subject: true,
          timeSession: true,
        },
      },
    },
  });

  if (conflictingStudentBooking) {
    return {
      valid: false,
      errorType: "STUDENT_DOUBLE_BOOKING",
      message: `Bentrok Jadwal Siswa! Anda sudah memiliki jadwal belajar "${conflictingStudentBooking.classSlot.subject.name}" pada hari ${slot.dayOfWeek} (${slot.timeSession.startTime} - ${slot.timeSession.endTime}). Siswa tidak boleh mengambil 2 kelas di sesi jam yang sama.`,
      slot,
    };
  }

  return {
    valid: true,
    slot,
  };
}

/**
 * Validates Tutor & Room clash before creating a new ClassSlot (Admin rule)
 * Rule 1: Room can only host 1 class at a time session
 * Rule 2: Tutor can only teach 1 class at a time session
 */
export async function validateClassSlotAssignment(data: {
  dayOfWeek: string;
  timeSessionId: string;
  roomId: string;
  tutorId: string;
  excludeSlotId?: string;
}): Promise<{ valid: boolean; message?: string }> {
  // Check Tutor conflict
  const existingTutorSlot = await prisma.classSlot.findFirst({
    where: {
      dayOfWeek: data.dayOfWeek,
      timeSessionId: data.timeSessionId,
      tutorId: data.tutorId,
      id: data.excludeSlotId ? { not: data.excludeSlotId } : undefined,
    },
    include: {
      subject: true,
      room: true,
      tutor: true,
      timeSession: true,
    },
  });

  if (existingTutorSlot) {
    return {
      valid: false,
      message: `BENTROK TUTOR: ${existingTutorSlot.tutor.name} sudah dijadwalkan mengajar ${existingTutorSlot.subject.name} di ${existingTutorSlot.room.name} pada hari ${data.dayOfWeek} sesi ${existingTutorSlot.timeSession.name}. 1 Tutor hanya bisa mengajar di 1 ruangan pada sesi jam tertentu.`,
    };
  }

  // Check Room conflict
  const existingRoomSlot = await prisma.classSlot.findFirst({
    where: {
      dayOfWeek: data.dayOfWeek,
      timeSessionId: data.timeSessionId,
      roomId: data.roomId,
      id: data.excludeSlotId ? { not: data.excludeSlotId } : undefined,
    },
    include: {
      subject: true,
      room: true,
      tutor: true,
      timeSession: true,
    },
  });

  if (existingRoomSlot) {
    return {
      valid: false,
      message: `BENTROK RUANGAN: ${existingRoomSlot.room.name} sudah digunakan untuk kelas ${existingRoomSlot.subject.name} (Tutor: ${existingRoomSlot.tutor.name}) pada hari ${data.dayOfWeek} sesi ${existingRoomSlot.timeSession.name}.`,
    };
  }

  return { valid: true };
}

/**
 * Generates an official, unique e-ticket code
 * Format: TIK-YYYYMM-XXXX
 */
export function generateTicketCode(): string {
  const date = new Date();
  const yearMonth = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}`;
  const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
  return `TIK-${yearMonth}-${randomHex}`;
}
