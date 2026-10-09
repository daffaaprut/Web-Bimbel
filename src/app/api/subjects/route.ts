import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      orderBy: { name: "asc" },
      include: {
        tutors: {
          include: { tutor: true },
        },
      },
    });
    return NextResponse.json({ success: true, data: subjects });
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
    const { name, code, description, color } = body;

    if (!name || !code) {
      return NextResponse.json(
        { success: false, message: "Nama mata pelajaran dan kode wajib diisi." },
        { status: 400 }
      );
    }

    const subject = await prisma.subject.create({
      data: {
        name,
        code: code.trim().toUpperCase(),
        description: description || null,
        color: color || "#3b82f6",
      },
    });

    return NextResponse.json({ success: true, data: subject });
  } catch (error: any) {
    if (error.code === "P2002") {
      return NextResponse.json(
        { success: false, message: "Kode mata pelajaran sudah digunakan." },
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
    const { id, name, code, description, color } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Mata Pelajaran diperlukan." },
        { status: 400 }
      );
    }

    const updated = await prisma.subject.update({
      where: { id },
      data: {
        name,
        code: code ? code.trim().toUpperCase() : undefined,
        description,
        color,
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
        { success: false, message: "ID Mata Pelajaran diperlukan." },
        { status: 400 }
      );
    }

    await prisma.subject.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Mata pelajaran berhasil dihapus.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
