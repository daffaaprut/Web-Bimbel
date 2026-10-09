import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
      },
    });

    return NextResponse.json({ success: true, data: users });
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
    const { name, email, role, phone } = body;

    if (!name || !email) {
      return NextResponse.json(
        { success: false, message: "Nama dan Email wajib diisi." },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json({
        success: true,
        data: existing,
        message: "Akun ditemukan.",
      });
    }

    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        role: role || "STUDENT",
        phone: phone || null,
      },
    });

    return NextResponse.json({
      success: true,
      data: newUser,
      message: "Akun berhasil dibuat.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
