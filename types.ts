export enum Role {
  Student = 'Student',
  Teacher = 'Teacher',
  Admin = 'Admin',
}

export enum Difficulty {
  Beginner = 'Beginner',
  Intermediate = 'Intermediate',
  Advanced = 'Advanced',
}

export enum UserStatus {
  Active = 'Active',
  Disabled = 'Disabled',
}

export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // Added for auth
  role: Role;
  status: UserStatus;
  bio?: string;
  profilePicture?: string;
  pronoun?: string;
}

export interface CourseModule {
  id: string;
  title: string;
  content: string;
  videoUrl?: string;
}

export interface Course {
  id: string;
  title: string;
  description: string;
  category: string;
  thumbnail: string;
  teacherId: string;
  modules: CourseModule[];
  difficulty: Difficulty;
}

export enum EnrollmentStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface Enrollment {
  id: string;
  courseId: string;
  studentId: string;
  status: EnrollmentStatus;
}

export enum ReviewStatus {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected',
}

export interface Review {
  id: string;
  courseId: string;
  studentId: string;
  rating: number; // 1-5
  comment: string;
  status: ReviewStatus;
  createdAt: string;
}