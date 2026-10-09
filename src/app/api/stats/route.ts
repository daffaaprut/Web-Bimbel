import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const [
      totalRooms,
      totalTutors,
      totalSubjects,
      totalSessions,
      totalSlots,
      totalBookings,
      rooms,
      recentBookings,
    ] = await Promise.all([
      prisma.room.count(),
      prisma.tutor.count(),
      prisma.subject.count(),
      prisma.timeSession.count(),
      prisma.classSlot.count({ where: { isActive: true } }),
      prisma.booking.count({ where: { status: "CONFIRMED" } }),
      prisma.room.findMany({
        select: {
          id: true,
          name: true,
          code: true,
          capacity: true,
          classSlots: {
            select: {
              id: true,
              bookings: {
                where: { status: "CONFIRMED" },
                select: { id: true },
              },
            },
          },
        },
      }),
      prisma.booking.findMany({
        where: { status: "CONFIRMED" },
        take: 5,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: { name: true, email: true },
          },
          classSlot: {
            include: {
              subject: true,
              room: true,
              timeSession: true,
            },
          },
        },
      }),
    ]);

    // Calculate total theoretical capacity across all scheduled slots
    let totalSlotCapacity = 0;
    let totalSlotOccupancy = 0;

    rooms.forEach((room) => {
      room.classSlots.forEach((slot) => {
        totalSlotCapacity += room.capacity;
        totalSlotOccupancy += slot.bookings.length;
      });
    });

    const averageUtilizationRate =
      totalSlotCapacity > 0
        ? Math.round((totalSlotOccupancy / totalSlotCapacity) * 100)
        : 0;

    return NextResponse.json({
      success: true,
      data: {
        totalRooms,
        totalTutors,
        totalSubjects,
        totalSessions,
        totalSlots,
        totalBookings,
        averageUtilizationRate,
        recentBookings,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
