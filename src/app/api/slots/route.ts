import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { validateClassSlotAssignment } from "@/lib/scheduler-engine";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const dayOfWeek = searchParams.get("dayOfWeek");
    const timeSessionId = searchParams.get("timeSessionId");
    const subjectId = searchParams.get("subjectId");
    const roomId = searchParams.get("roomId");

    const slots = await prisma.classSlot.findMany({
      where: {
        isActive: true,
        ...(dayOfWeek ? { dayOfWeek } : {}),
        ...(timeSessionId ? { timeSessionId } : {}),
        ...(subjectId ? { subjectId } : {}),
        ...(roomId ? { roomId } : {}),
      },
      include: {
        room: true,
        timeSession: true,
        subject: true,
        tutor: true,
        bookings: {
          where: { status: "CONFIRMED" },
          select: {
            id: true,
            studentId: true,
            ticketCode: true,
            student: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: [
        { dayOfWeek: "asc" },
        { timeSession: { order: "asc" } },
        { room: { code: "asc" } },
      ],
    });

    // Map and enrich with real-time capacity and locking status
    const enrichedSlots = slots.map((slot) => {
      const bookingsCount = slot.bookings.length;
      const capacity = slot.room.capacity;
      const remainingSeats = Math.max(0, capacity - bookingsCount);
      const isFull = remainingSeats <= 0;

      return {
        id: slot.id,
        dayOfWeek: slot.dayOfWeek,
        timeSessionId: slot.timeSessionId,
        subjectId: slot.subjectId,
        tutorId: slot.tutorId,
        roomId: slot.roomId,
        notes: slot.notes,
        isActive: slot.isActive,
        room: slot.room,
        timeSession: slot.timeSession,
        subject: slot.subject,
        tutor: slot.tutor,
        bookingsCount,
        capacity,
        remainingSeats,
        isFull, // RULE 3: Auto-locking flag
        bookings: slot.bookings,
      };
    });

    return NextResponse.json({ success: true, data: enrichedSlots });
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
    const { dayOfWeek, timeSessionId, subjectId, tutorId, roomId, notes } = body;

    if (!dayOfWeek || !timeSessionId || !subjectId || !tutorId || !roomId) {
      return NextResponse.json(
        {
          success: false,
          message: "Hari, Sesi Jam, Mapel, Tutor, dan Ruangan wajib dipilih.",
        },
        { status: 400 }
      );
    }

    // SYSTEM ENGINE CHECK: Check Tutor & Room Conflict (Rules 1 & 2)
    const validation = await validateClassSlotAssignment({
      dayOfWeek,
      timeSessionId,
      roomId,
      tutorId,
    });

    if (!validation.valid) {
      return NextResponse.json(
        { success: false, message: validation.message },
        { status: 409 }
      );
    }

    const slot = await prisma.classSlot.create({
      data: {
        dayOfWeek,
        timeSessionId,
        subjectId,
        tutorId,
        roomId,
        notes: notes || null,
      },
      include: {
        room: true,
        timeSession: true,
        subject: true,
        tutor: true,
      },
    });

    return NextResponse.json({
      success: true,
      data: slot,
      message: "Jadwal kelas berhasil ditambahkan ke sistem.",
    });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        {
          success: false,
          message:
            "Jadwal bentrok: Ruangan atau Tutor sudah memiliki agenda pada Hari dan Sesi Jam ini.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Jadwal Kelas diperlukan." },
        { status: 400 }
      );
    }

    await prisma.classSlot.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Jadwal kelas berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
