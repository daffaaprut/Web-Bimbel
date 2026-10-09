export type Role = "ADMIN" | "STUDENT";

export interface UserSession {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string | null;
}

export interface RoomDTO {
  id: string;
  name: string;
  code: string;
  capacity: number;
  description?: string | null;
  isActive: boolean;
  _count?: {
    classSlots: number;
  };
}

export interface SubjectDTO {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  color: string;
}

export interface TutorDTO {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  bio?: string | null;
  avatar?: string | null;
  isActive: boolean;
  subjects?: {
    subject: SubjectDTO;
  }[];
}

export interface TimeSessionDTO {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  order: number;
  isActive: boolean;
}

export interface ClassSlotDTO {
  id: string;
  dayOfWeek: string;
  timeSessionId: string;
  subjectId: string;
  tutorId: string;
  roomId: string;
  notes?: string | null;
  isActive: boolean;
  timeSession: TimeSessionDTO;
  subject: SubjectDTO;
  tutor: TutorDTO;
  room: RoomDTO;
  bookingsCount: number;
  remainingSeats: number;
  isFull: boolean;
  bookings?: BookingDTO[];
}

export interface BookingDTO {
  id: string;
  ticketCode: string;
  studentId: string;
  classSlotId: string;
  status: "CONFIRMED" | "CANCELLED" | "COMPLETED";
  notes?: string | null;
  createdAt: string;
  student: {
    id: string;
    name: string;
    email: string;
    phone?: string | null;
  };
  classSlot: {
    id: string;
    dayOfWeek: string;
    notes?: string | null;
    timeSession: TimeSessionDTO;
    subject: SubjectDTO;
    tutor: TutorDTO;
    room: RoomDTO;
  };
}
