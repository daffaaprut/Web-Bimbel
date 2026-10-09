import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const tutors = await prisma.tutor.findMany({
      orderBy: { name: "asc" },
      include: {
        subjects: {
          include: {
            subject: true,
          },
        },
      },
    });
    return NextResponse.json({ success: true, data: tutors });
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
    const { name, email, phone, bio, subjectIds } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: "Nama tutor wajib diisi." },
        { status: 400 }
      );
    }

    const tutor = await prisma.tutor.create({
      data: {
        name,
        email: email || null,
        phone: phone || null,
        bio: bio || null,
        subjects: Array.isArray(subjectIds) && subjectIds.length > 0
          ? {
              create: subjectIds.map((sid: string) => ({
                subjectId: sid,
              })),
            }
          : undefined,
      },
      include: {
        subjects: {
          include: { subject: true },
        },
      },
    });

    return NextResponse.json({ success: true, data: tutor });
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
    const { id, name, email, phone, bio, subjectIds, isActive } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, message: "ID Tutor diperlukan." },
        { status: 400 }
      );
    }

    // Update basic info
    await prisma.tutor.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        bio,
        isActive,
      },
    });

    // Update subject relations if provided
    if (Array.isArray(subjectIds)) {
      await prisma.tutorSubject.deleteMany({
        where: { tutorId: id },
      });
      if (subjectIds.length > 0) {
        await prisma.tutorSubject.createMany({
          data: subjectIds.map((sid: string) => ({
            tutorId: id,
            subjectId: sid,
          })),
        });
      }
    }

    const updated = await prisma.tutor.findUnique({
      where: { id },
      include: {
        subjects: {
          include: { subject: true },
        },
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
        { success: false, message: "ID Tutor diperlukan." },
        { status: 400 }
      );
    }

    await prisma.tutor.delete({
      where: { id },
    });

    return NextResponse.json({ success: true, message: "Tutor berhasil dihapus." });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
