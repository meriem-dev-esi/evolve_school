import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import MessagesClient, { type CourseTeacher } from "./messages-client";

type Props = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ courseId?: string }>;
};

export default async function MessagesPage({ params, searchParams }: Props) {
  const [{ locale }, { courseId }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/${locale}/sign-in`);
  }

  const { data: enrollments, error: enrollmentError } = await supabase
    .from("enrollments")
    .select("course_id, courses (id, title)")
    .eq("user_id", user.id)
    .eq("payment_status", "paid");

  if (enrollmentError) {
    throw new Error(
      `Could not load your enrolled courses: ${enrollmentError.message}`,
    );
  }

  const courses = (enrollments ?? [])
    .map((enrollment) => {
      const course = Array.isArray(enrollment.courses)
        ? enrollment.courses[0]
        : enrollment.courses;
      return course ? { id: String(course.id), title: course.title } : null;
    })
    .filter(
      (course): course is { id: string; title: string } => course !== null,
    );
  const courseIds = [...new Set(courses.map((course) => course.id))];

  let courseTeachers: CourseTeacher[] = [];
  if (courseIds.length > 0) {
    const { data: assignments, error: assignmentsError } = await supabase
      .from("teacher_courses")
      .select("course_id, teacher_id")
      .in("course_id", courseIds);

    if (assignmentsError) {
      throw new Error(
        `Could not load course teachers: ${assignmentsError.message}`,
      );
    }

    const courseTitles = new Map(
      courses.map((course) => [course.id, course.title]),
    );
    const uniqueAssignments = [
      ...new Map(
        (assignments ?? []).map((assignment) => [
          `${assignment.course_id}:${assignment.teacher_id}`,
          assignment,
        ]),
      ).values(),
    ];
    const teacherCounts = new Map<string, number>();
    for (const assignment of uniqueAssignments) {
      const id = String(assignment.course_id);
      teacherCounts.set(id, (teacherCounts.get(id) ?? 0) + 1);
    }
    const teacherIndexes = new Map<string, number>();
    courseTeachers = uniqueAssignments
      .map((assignment) => {
        const teacherId = String(assignment.teacher_id);
        const assignedCourseId = String(assignment.course_id);
        const title = courseTitles.get(assignedCourseId);
        if (!title) return null;
        const teacherIndex = (teacherIndexes.get(assignedCourseId) ?? 0) + 1;
        teacherIndexes.set(assignedCourseId, teacherIndex);
        return {
          courseId: assignedCourseId,
          courseTitle: title,
          teacherId,
          teacherName:
            teacherCounts.get(assignedCourseId) === 1
              ? "Course teacher"
              : `Teacher ${teacherIndex}`,
        };
      })
      .filter((item): item is CourseTeacher => item !== null);
  }

  return (
    <main className="min-h-dvh bg-canvas px-6 py-24 text-white lg:px-10">
      <div className="mx-auto max-w-5xl">
        <p className="text-sm font-semibold uppercase tracking-[0.25em] text-brand">
          Evolve
        </p>
        <h1 className="mt-3 text-4xl font-bold md:text-5xl">Messages</h1>
        <p className="mt-4 text-white/50">
          Ask your course teachers questions and continue the conversation here.
        </p>
        <MessagesClient
          courseTeachers={courseTeachers}
          initialCourseId={courseId ?? null}
        />
      </div>
    </main>
  );
}
