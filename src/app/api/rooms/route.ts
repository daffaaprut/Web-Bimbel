import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { code: "asc" },
      include: {
        _count: {
          select: { classSlots: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: rooms });
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
    const { name, code, capacity, description } = body;

    if (!name || !code || !capacity) {
      return NextResponse.json(
        { success: false, message: "Nama ruangan, kode, dan kapasitas wajib diisi." },
        { status: 400 }
      );
    }

    const room = await prisma.room.create({
      data: {
        name,
        code: code.trim().toUpperCase(),
        capacity: Number(capacity),
        description: description || null,
      },
    });

    return NextResponse.json({ success: true, data: room });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Kode ruangan sudah digunakan." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { id, name, code, capacity, description, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Ruangan diperlukan." },
        { status: 400 }
      );
    }

    const updated = await prisma.room.update({
      where: { id },
      data: {
        name,
        code: code ? code.trim().toUpperCase() : undefined,
        capacity: capacity ? Number(capacity) : undefined,
        description,
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
        { success: false, message: "ID Ruangan diperlukan." },
        { status: 400 }
      );
    }

    await prisma.room.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Ruangan berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
