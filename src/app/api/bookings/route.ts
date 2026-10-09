import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import {
  validateBookingAttempt,
  generateTicketCode,
} from "@/lib/scheduler-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get("studentId");
    const classSlotId = searchParams.get("classSlotId");
    const status = searchParams.get("status");

    const bookings = await prisma.booking.findMany({
      where: {
        ...(studentId ? { studentId } : {}),
        ...(classSlotId ? { classSlotId } : {}),
        ...(status ? { status } : {}),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        classSlot: {
          include: {
            room: true,
            subject: true,
            tutor: true,
            timeSession: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: bookings });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { studentId, classSlotId, notes } = body;

    if (!studentId || !classSlotId) {
      return NextResponse.json(
        { success: false, message: "ID Siswa dan ID Jadwal Kelas wajib diisi." },
        { status: 400 }
      );
    }

    // SYSTEM ENGINE VALIDATION 1: Preliminary check
    const validation = await validateBookingAttempt(studentId, classSlotId);
    if (!validation.valid) {
      return NextResponse.json(
        {
          success: false,
          errorType: validation.errorType,
          message: validation.message,
        },
        { status: 409 }
      );
    }

    // ATOMIC TRANSACTION: Re-check capacity right before inserting (prevents race conditions)
    const result = await prisma.$transaction(async (tx) => {
      // Re-fetch slot inside transaction with lock check
      const currentSlot = await tx.classSlot.findUnique({
        where: { id: classSlotId },
        include: {
          room: true,
          timeSession: true,
          subject: true,
          tutor: true,
          _count: {
            select: {
              bookings: {
                where: { status: "CONFIRMED" },
              },
            },
          },
        },
      });

      if (!currentSlot) {
        throw new Error("Jadwal kelas tidak ditemukan.");
      }

      if (currentSlot._count.bookings >= currentSlot.room.capacity) {
        throw new Error(
          `SLOT_FULL: Ruangan ${currentSlot.room.name} telah mencapai kapasitas maksimal (${currentSlot.room.capacity} siswa). Pilihan Anda baru saja penuh.`
        );
      }

      // Generate unique ticket
      let ticketCode = generateTicketCode();
      // Ensure ticket uniqueness
      let ticketExists = await tx.booking.findUnique({ where: { ticketCode } });
      while (ticketExists) {
        ticketCode = generateTicketCode();
        ticketExists = await tx.booking.findUnique({ where: { ticketCode } });
      }

      const newBooking = await tx.booking.create({
        data: {
          ticketCode,
          studentId,
          classSlotId,
          notes: notes || null,
          status: "CONFIRMED",
        },
        include: {
          student: true,
          classSlot: {
            include: {
              room: true,
              subject: true,
              tutor: true,
              timeSession: true,
            },
          },
        },
      });

      return newBooking;
    });

    return NextResponse.json({
      success: true,
      data: result,
      message: `Booking berhasil! Kode Tiket: ${result.ticketCode}`,
    });
  } catch (error: any) {
    const isSlotFull = error.message && error.message.includes("SLOT_FULL");
    return NextResponse.json(
      {
        success: false,
        errorType: isSlotFull ? "OVER_CAPACITY" : "SERVER_ERROR",
        message: isSlotFull
          ? error.message.replace("SLOT_FULL: ", "")
          : error.message || "Terjadi kesalahan saat memproses booking.",
      },
      { status: isSlotFull ? 409 : 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Booking diperlukan." },
        { status: 400 }
      );
    }

    // Cancel / Delete booking to free up seat quota
    const deleted = await prisma.booking.delete({
      where: { id },
      include: {
        classSlot: {
          include: {
            room: true,
            subject: true,
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      message: `Booking ${deleted.ticketCode} (${deleted.classSlot.subject.name} di ${deleted.classSlot.room.name}) berhasil dibatalkan. Kuota telah dikembalikan.`,
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
