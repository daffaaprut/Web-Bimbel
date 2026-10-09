import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const sessions = await prisma.timeSession.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: {
          select: { classSlots: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: sessions });
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
    const { name, startTime, endTime, order } = body;

    if (!name || !startTime || !endTime) {
      return NextResponse.json(
        { success: false, message: "Nama sesi, jam mulai, dan jam selesai wajib diisi." },
        { status: 400 }
      );
    }

    const session = await prisma.timeSession.create({
      data: {
        name,
        startTime,
        endTime,
        order: order ? Number(order) : 1,
      },
    });

    return NextResponse.json({ success: true, data: session });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, startTime, endTime, order, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Sesi diperlukan." },
        { status: 400 }
      );
    }

    const updated = await prisma.timeSession.update({
      where: { id },
      data: {
        name,
        startTime,
        endTime,
        order: order !== undefined ? Number(order) : undefined,
        isActive,
      },
    });

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
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
        { success: false, message: "ID Sesi diperlukan." },
        { status: 400 }
      );
    }

    await prisma.timeSession.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Sesi jam berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
