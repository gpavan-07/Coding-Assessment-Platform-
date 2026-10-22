import { pgTable, text, timestamp, uuid, integer, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role").notNull().default("student"), // 'student' | 'company_admin'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const exams = pgTable("exams", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: text("company_name").notNull(),
  companyLogo: text("company_logo"),
  title: text("title").notNull(),
  description: text("description").notNull(),
  category: text("category").notNull(),
  difficulty: text("difficulty").notNull(), // 'Beginner' | 'Intermediate' | 'Advanced'
  durationMinutes: integer("duration_minutes").notNull().default(60),
  totalPoints: integer("total_points").notNull().default(100),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const problems = pgTable("problems", {
  id: uuid("id").defaultRandom().primaryKey(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  difficulty: text("difficulty").notNull(),
  description: text("description").notNull(),
  initialCode: jsonb("initial_code").notNull(), // { javascript: string, python: string, cpp: string, java: string }
  sampleTestCases: jsonb("sample_test_cases").notNull(), // [{ input: string, expectedOutput: string, explanation?: string }]
  hiddenTestCases: jsonb("hidden_test_cases").notNull(),
  constraints: text("constraints"),
});

export const submissions = pgTable("submissions", {
  id: uuid("id").defaultRandom().primaryKey(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  studentEmail: text("student_email").notNull(),
  studentPhone: text("student_phone").notNull(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  examTitle: text("exam_title").notNull(),
  companyName: text("company_name").notNull(),
  submittedCode: text("submitted_code").notNull(),
  language: text("language").notNull().default("javascript"),
  testCasesPassed: integer("test_cases_passed").notNull().default(0),
  totalTestCases: integer("total_test_cases").notNull().default(0),
  scorePercentage: integer("score_percentage").notNull().default(0),
  executionTimeMs: integer("execution_time_ms").notNull().default(42),
  memoryKb: integer("memory_kb").notNull().default(18400),
  status: text("status").notNull().default("submitted"),
  submittedAt: timestamp("submitted_at").defaultNow().notNull(),
});

export const certificates = pgTable("certificates", {
  id: uuid("id").defaultRandom().primaryKey(),
  certificateNumber: text("certificate_number").notNull().unique(),
  studentId: uuid("student_id").references(() => users.id, { onDelete: "cascade" }),
  studentName: text("student_name").notNull(),
  examId: uuid("exam_id").references(() => exams.id, { onDelete: "cascade" }),
  examTitle: text("exam_title").notNull(),
  companyName: text("company_name").notNull(),
  submissionId: uuid("submission_id").references(() => submissions.id, { onDelete: "cascade" }),
  scorePercentage: integer("score_percentage").notNull(),
  verificationHash: text("verification_hash").notNull(),
  issuedAt: timestamp("issued_at").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Exam = typeof exams.$inferSelect;
export type Problem = typeof problems.$inferSelect;
export type Submission = typeof submissions.$inferSelect;
export type Certificate = typeof certificates.$inferSelect;
