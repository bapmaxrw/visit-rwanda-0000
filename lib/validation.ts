import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters")
  .max(72, "Password is too long")
  .regex(/[A-Za-z]/, "Include at least one letter")
  .regex(/[0-9]/, "Include at least one number");

export const phoneSchema = z
  .string()
  .trim()
  .min(7, "Enter a valid telephone number")
  .max(25, "Enter a valid telephone number")
  .regex(/^\+?[0-9 ()-]+$/, "Telephone may only contain digits, spaces, +, - and ()");

export const registerSchema = z
  .object({
    fullName: z.string().trim().min(2, "Enter your full name").max(120),
    email: z.string().trim().toLowerCase().email("Enter a valid email address"),
    phone: phoneSchema,
    password: passwordSchema,
    confirmPassword: z.string(),
    dateOfBirth: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Select your date of birth")
      .refine((value) => {
        const dob = new Date(`${value}T00:00:00Z`);
        if (Number.isNaN(dob.getTime())) return false;
        const age = (Date.now() - dob.getTime()) / (365.25 * 86400_000);
        return age >= 16 && age <= 120;
      }, "You must be at least 16 years old"),
    nationality: z.string().trim().min(2, "Select your nationality").max(80),
    hasNationalId: z.boolean(),
    nationalId: z.string().trim().max(40).optional().or(z.literal("")),
  })
  .refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  })
  .refine((data) => !data.hasNationalId || (data.nationalId ?? "").length >= 5, {
    path: ["nationalId"],
    message: "Enter your national ID number or choose “I do not have a national ID”",
  });

export const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Enter your email, username or telephone number"),
  password: z.string().min(1, "Enter your password"),
  remember: z.boolean().optional().default(false),
});

export const profileSchema = z.object({
  fullName: z.string().trim().min(2, "Enter your full name").max(120),
  phone: phoneSchema,
  dateOfBirth: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().or(z.literal("")),
  nationality: z.string().trim().max(80).optional().or(z.literal("")),
  hasNationalId: z.boolean(),
  nationalId: z.string().trim().max(40).optional().or(z.literal("")),
});

export const bookingSchema = z.object({
  destinationId: z.string().uuid("Select a destination"),
  activity: z.string().trim().max(120).optional().or(z.literal("")),
  visitDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Select a visit date")
    .refine((value) => new Date(`${value}T23:59:59Z`).getTime() > Date.now(), "Choose a future date"),
  adults: z.coerce.number().int().min(1, "At least one adult").max(60),
  children: z.coerce.number().int().min(0).max(60).default(0),
  visitorCategory: z.enum(["international", "resident", "african", "east_african", "citizen"]),
  specialRequests: z.string().trim().max(2000).optional().or(z.literal("")),
});

export const ENQUIRY_TOPICS = [
  { value: "general", label: "General enquiry" },
  { value: "booking", label: "Booking or permit support" },
  { value: "partnership", label: "Partnership or trade" },
  { value: "press", label: "Press and media" },
  { value: "accessibility", label: "Accessibility or special assistance" },
] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email: z.string().trim().toLowerCase().email("Enter a valid email address"),
  phone: phoneSchema.optional().or(z.literal("")),
  topic: z.enum(["general", "booking", "partnership", "press", "accessibility"]),
  subject: z.string().trim().min(3, "Add a short subject").max(160),
  message: z
    .string()
    .trim()
    .min(20, "Tell us a little more — at least 20 characters")
    .max(4000, "Please keep your message under 4000 characters"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type EnquiryInput = z.infer<typeof enquirySchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type BookingInput = z.infer<typeof bookingSchema>;

/** Collapses Zod issues into a field -> message map for form feedback. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path[0]?.toString() ?? "form";
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
