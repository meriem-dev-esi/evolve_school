import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function jsonResponse(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const authorization = request.headers.get("Authorization");
  if (!authorization?.startsWith("Bearer ")) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    console.error("Supabase function environment is not configured.");
    return jsonResponse({ error: "Analytics service is not configured" }, 500);
  }

  const token = authorization.slice("Bearer ".length).trim();
  if (!token) {
    return jsonResponse({ error: "Authentication required" }, 401);
  }

  const userClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: authData, error: authError } =
    await userClient.auth.getUser(token);
  if (authError || !authData.user) {
    return jsonResponse({ error: "Invalid authentication token" }, 401);
  }

  const adminClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const { data: profile, error: profileError } = await adminClient
    .from("profiles")
    .select("role")
    .eq("id", authData.user.id)
    .maybeSingle();
  if (profileError) {
    console.error("Admin authorization lookup failed:", profileError.message);
    return jsonResponse(
      { error: "Unable to verify administrator access" },
      500,
    );
  }
  if (profile?.role !== "admin") {
    return jsonResponse({ error: "Administrator access required" }, 403);
  }

  const now = new Date();
  let reportMonth = now.toISOString().slice(0, 7);
  const requestBody = await request.text();
  if (requestBody.trim()) {
    let parsedBody: unknown;
    try {
      parsedBody = JSON.parse(requestBody);
    } catch {
      return jsonResponse({ error: "Invalid analytics request" }, 400);
    }
    if (
      typeof parsedBody !== "object" ||
      parsedBody === null ||
      Array.isArray(parsedBody)
    ) {
      return jsonResponse({ error: "Invalid analytics request" }, 400);
    }
    const requestedMonth = (parsedBody as Record<string, unknown>).month;
    if (requestedMonth !== undefined) {
      const match =
        typeof requestedMonth === "string"
          ? /^(\d{4})-(0[1-9]|1[0-2])$/.exec(requestedMonth)
          : null;
      if (!match || Number(match[1]) < 1000) {
        return jsonResponse({ error: "Month must use YYYY-MM format" }, 400);
      }
      reportMonth = requestedMonth;
    }
  }
  const [reportYear, reportMonthNumber] = reportMonth.split("-").map(Number);
  const reportStart = new Date(Date.UTC(reportYear, reportMonthNumber - 1, 1));
  const reportEnd = new Date(Date.UTC(reportYear, reportMonthNumber, 1));
  const reportPreviousStart = new Date(
    Date.UTC(reportYear, reportMonthNumber - 2, 1),
  );
  const reportPreviousMonth = reportPreviousStart.toISOString().slice(0, 7);
  const monthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
  );
  const currentMonthStart = monthStart.toISOString();
  const previousMonthStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1),
  ).toISOString();
  const sixMonthsStart = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 5, 1),
  );
  const sixMonthsStartIso = sixMonthsStart.toISOString();
  const pageSize = 1000;

  const [
    usersResult,
    studentsResult,
    teachersResult,
    newUsersResult,
    coursesResult,
    publishedCoursesResult,
    draftCoursesResult,
    lessonsResult,
    formationsResult,
    assignmentsResult,
    publishedAssignmentsResult,
    submissionsResult,
    ungradedSubmissionsResult,
  ] = await Promise.all([
    adminClient.from("profiles").select("id", { count: "exact", head: true }),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "student"),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("role", "teacher"),
    adminClient
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .gte("created_at", currentMonthStart),
    adminClient.from("courses").select("id", { count: "exact", head: true }),
    adminClient
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    adminClient
      .from("courses")
      .select("id", { count: "exact", head: true })
      .eq("is_published", false),
    adminClient.from("lessons").select("id", { count: "exact", head: true }),
    adminClient
      .from("course_series")
      .select("id", { count: "exact", head: true }),
    adminClient
      .from("assignments")
      .select("id", { count: "exact", head: true }),
    adminClient
      .from("assignments")
      .select("id", { count: "exact", head: true })
      .eq("is_published", true),
    adminClient
      .from("assignment_submissions")
      .select("id", { count: "exact", head: true }),
    adminClient
      .from("assignment_submissions")
      .select("id", { count: "exact", head: true })
      .is("grade", null),
  ]);

  const summaryErrors = [
    usersResult.error,
    studentsResult.error,
    teachersResult.error,
    newUsersResult.error,
    coursesResult.error,
    publishedCoursesResult.error,
    draftCoursesResult.error,
    lessonsResult.error,
    formationsResult.error,
    assignmentsResult.error,
    publishedAssignmentsResult.error,
    submissionsResult.error,
    ungradedSubmissionsResult.error,
  ].filter((error) => error !== null);
  if (summaryErrors.length > 0) {
    console.error("Admin analytics summary failed:", summaryErrors[0].message);
    return jsonResponse({ error: "Unable to load management analytics" }, 500);
  }

  const courseMap = new Map<
    string,
    {
      title: string;
      enrollments: number;
      paidEnrollments: number;
      revenueMinorUnits: number;
    }
  >();
  let offset = 0;
  while (true) {
    const { data: courses, error } = await adminClient
      .from("courses")
      .select("id, title")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error("Analytics course query failed:", error.message);
      return jsonResponse({ error: "Unable to load course analytics" }, 500);
    }
    for (const course of courses) {
      courseMap.set(course.id, {
        title: course.title || "Untitled course",
        enrollments: 0,
        paidEnrollments: 0,
        revenueMinorUnits: 0,
      });
    }
    if (courses.length < pageSize) break;
    offset += pageSize;
  }

  const statusCounts: Record<string, number> = {};
  const monthly = Array.from({ length: 6 }, (_, index) => {
    const date = new Date(
      Date.UTC(
        sixMonthsStart.getUTCFullYear(),
        sixMonthsStart.getUTCMonth() + index,
        1,
      ),
    );
    return {
      month: date.toISOString().slice(0, 7),
      signups: 0,
      enrollments: 0,
    };
  });
  const monthIndices = new Map(
    monthly.map((month, index) => [month.month, index]),
  );
  const reportCourseRevenue = new Map<
    string,
    {
      title: string;
      enrollments: number;
      previousEnrollments: number;
      paidEnrollments: number;
      revenueMinorUnits: number;
    }
  >();
  const report = {
    month: reportMonth,
    previous_month: reportPreviousMonth,
    enrollments: 0,
    paid_enrollments: 0,
    pending_enrollments: 0,
    previous_pending_enrollments: 0,
    enrollments_without_amount: 0,
    paid_revenue_minor_units: 0,
    refunds_minor_units: 0,
    expenses_minor_units: 0,
    previous_enrollments: 0,
    previous_paid_enrollments: 0,
    previous_paid_revenue_minor_units: 0,
    previous_refunds_minor_units: 0,
    previous_expenses_minor_units: 0,
    historical_paid_without_timestamp: 0,
  };
  let enrollmentsThisMonth = 0;
  let enrollmentsPreviousMonth = 0;
  let paidRevenueThisMonthMinorUnits = 0;
  let paidRevenuePreviousMonthMinorUnits = 0;
  offset = 0;
  while (true) {
    const { data: enrollments, error } = await adminClient
      .from("enrollments")
      .select(
        "id, course_id, payment_status, payment_amount, enrolled_at, paid_at",
      )
      .order("enrolled_at")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error("Analytics enrollment query failed:", error.message);
      return jsonResponse(
        { error: "Unable to load enrollment analytics" },
        500,
      );
    }

    for (const enrollment of enrollments) {
      const status = String(
        enrollment.payment_status ?? "unknown",
      ).toLowerCase();
      statusCounts[status] = (statusCounts[status] ?? 0) + 1;
      const enrolledAt = new Date(enrollment.enrolled_at);
      const inReportMonth = enrolledAt >= reportStart && enrolledAt < reportEnd;
      const inPreviousReportMonth =
        enrolledAt >= reportPreviousStart && enrolledAt < reportStart;
      const paidAt = enrollment.paid_at ? new Date(enrollment.paid_at) : null;
      const inReportPaymentMonth =
        paidAt !== null && paidAt >= reportStart && paidAt < reportEnd;
      const inPreviousPaymentMonth =
        paidAt !== null &&
        paidAt >= reportPreviousStart &&
        paidAt < reportStart;
      const monthIndex = monthIndices.get(enrolledAt.toISOString().slice(0, 7));
      if (monthIndex !== undefined) monthly[monthIndex].enrollments++;
      if (enrolledAt >= monthStart) enrollmentsThisMonth++;
      else if (enrolledAt >= new Date(previousMonthStart)) {
        enrollmentsPreviousMonth++;
      }

      const courseId = enrollment.course_id ?? "unavailable";
      let course = courseMap.get(courseId);
      if (!course) {
        course = {
          title: "Course unavailable",
          enrollments: 0,
          paidEnrollments: 0,
          revenueMinorUnits: 0,
        };
        courseMap.set(courseId, course);
      }
      course.enrollments++;

      let reportCourse = reportCourseRevenue.get(courseId);
      if (
        !reportCourse &&
        (inReportMonth ||
          inPreviousReportMonth ||
          inReportPaymentMonth ||
          inPreviousPaymentMonth)
      ) {
        reportCourse = {
          title: course.title,
          enrollments: 0,
          previousEnrollments: 0,
          paidEnrollments: 0,
          revenueMinorUnits: 0,
        };
        reportCourseRevenue.set(courseId, reportCourse);
      }
      if (inReportMonth) {
        report.enrollments++;
        if (status === "paid") report.paid_enrollments++;
        if (status === "pending") report.pending_enrollments++;
        if (reportCourse) reportCourse.enrollments++;
      } else if (inPreviousReportMonth) {
        report.previous_enrollments++;
        if (status === "pending") report.previous_pending_enrollments++;
        if (reportCourse) reportCourse.previousEnrollments++;
      }
      if (status === "paid" && enrollment.paid_at === null) {
        report.historical_paid_without_timestamp++;
      }

      if (status === "paid") {
        course.paidEnrollments++;
        if (enrollment.payment_amount !== null) {
          const amount = Number(enrollment.payment_amount);
          const amountMinorUnits = Math.round(amount * 100);
          if (
            !Number.isFinite(amount) ||
            amount < 0 ||
            !Number.isSafeInteger(amountMinorUnits)
          ) {
            console.error("Invalid amount in analytics enrollment.");
            return jsonResponse(
              { error: "Invalid stored payment amount" },
              500,
            );
          }
          course.revenueMinorUnits += amountMinorUnits;
          if (!Number.isSafeInteger(course.revenueMinorUnits)) {
            console.error("Course revenue exceeds safe precision.");
            return jsonResponse(
              { error: "Course revenue exceeds safe precision" },
              500,
            );
          }
          if (inReportPaymentMonth) {
            report.paid_enrollments++;
            report.paid_revenue_minor_units += amountMinorUnits;
            if (reportCourse) {
              reportCourse.paidEnrollments++;
              reportCourse.revenueMinorUnits += amountMinorUnits;
            }
            if (
              !Number.isSafeInteger(report.paid_revenue_minor_units) ||
              (reportCourse &&
                !Number.isSafeInteger(reportCourse.revenueMinorUnits))
            ) {
              console.error("Monthly report revenue exceeds safe precision.");
              return jsonResponse(
                { error: "Monthly report revenue exceeds safe precision" },
                500,
              );
            }
          } else if (inPreviousPaymentMonth) {
            report.previous_paid_enrollments++;
            report.previous_paid_revenue_minor_units += amountMinorUnits;
            if (
              !Number.isSafeInteger(report.previous_paid_revenue_minor_units)
            ) {
              console.error(
                "Previous-month report revenue exceeds safe precision.",
              );
              return jsonResponse(
                { error: "Monthly report revenue exceeds safe precision" },
                500,
              );
            }
          }
          if (paidAt && paidAt >= monthStart) {
            paidRevenueThisMonthMinorUnits += amountMinorUnits;
          } else if (paidAt && paidAt >= new Date(previousMonthStart)) {
            paidRevenuePreviousMonthMinorUnits += amountMinorUnits;
          }
        } else if (inReportPaymentMonth) {
          report.paid_enrollments++;
          report.enrollments_without_amount++;
        } else if (inPreviousPaymentMonth) {
          report.previous_paid_enrollments++;
        }
      }
    }
    if (enrollments.length < pageSize) break;
    offset += pageSize;
  }

  offset = 0;
  while (true) {
    const { data: entries, error } = await adminClient
      .from("admin_financial_entries")
      .select("entry_type, amount_minor_units, occurred_at")
      .gte("occurred_at", reportPreviousStart.toISOString())
      .lt("occurred_at", reportEnd.toISOString())
      .order("occurred_at")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error("Financial report query failed:", error.message);
      return jsonResponse({ error: "Unable to load financial report" }, 500);
    }
    for (const entry of entries) {
      const amount = Number(entry.amount_minor_units);
      if (!Number.isSafeInteger(amount) || amount < 0) {
        console.error("Invalid amount in financial entry.");
        return jsonResponse({ error: "Invalid financial entry amount" }, 500);
      }
      const occurredAt = new Date(entry.occurred_at);
      const isCurrentMonth = occurredAt >= reportStart;
      if (entry.entry_type === "refund") {
        if (isCurrentMonth) report.refunds_minor_units += amount;
        else report.previous_refunds_minor_units += amount;
      } else if (entry.entry_type === "expense") {
        if (isCurrentMonth) report.expenses_minor_units += amount;
        else report.previous_expenses_minor_units += amount;
      }
    }
    if (
      !Number.isSafeInteger(report.refunds_minor_units) ||
      !Number.isSafeInteger(report.expenses_minor_units) ||
      !Number.isSafeInteger(report.previous_refunds_minor_units) ||
      !Number.isSafeInteger(report.previous_expenses_minor_units)
    ) {
      console.error("Monthly expenses or refunds exceed safe precision.");
      return jsonResponse(
        { error: "Financial totals exceed safe precision" },
        500,
      );
    }
    if (entries.length < pageSize) break;
    offset += pageSize;
  }

  offset = 0;
  while (true) {
    const { data: users, error } = await adminClient
      .from("profiles")
      .select("created_at")
      .gte("created_at", sixMonthsStartIso)
      .order("created_at")
      .order("id")
      .range(offset, offset + pageSize - 1);
    if (error) {
      console.error("Analytics signup query failed:", error.message);
      return jsonResponse({ error: "Unable to load signup trends" }, 500);
    }
    for (const user of users) {
      const monthIndex = monthIndices.get(
        new Date(user.created_at).toISOString().slice(0, 7),
      );
      if (monthIndex !== undefined) monthly[monthIndex].signups++;
    }
    if (users.length < pageSize) break;
    offset += pageSize;
  }

  const topCourses = [...courseMap.entries()]
    .map(([courseId, course]) => ({
      course_id: courseId,
      course_title: course.title,
      enrollments: course.enrollments,
      previous_enrollments: course.previousEnrollments,
      paid_enrollments: course.paidEnrollments,
      revenue_minor_units: course.revenueMinorUnits,
    }))
    .sort(
      (first, second) =>
        second.enrollments - first.enrollments ||
        second.revenue_minor_units - first.revenue_minor_units,
    )
    .slice(0, 10);

  return jsonResponse({
    users: usersResult.count ?? 0,
    students: studentsResult.count ?? 0,
    teachers: teachersResult.count ?? 0,
    new_users_this_month: newUsersResult.count ?? 0,
    courses: coursesResult.count ?? 0,
    published_courses: publishedCoursesResult.count ?? 0,
    draft_courses: draftCoursesResult.count ?? 0,
    lessons: lessonsResult.count ?? 0,
    formations: formationsResult.count ?? 0,
    assignments: assignmentsResult.count ?? 0,
    published_assignments: publishedAssignmentsResult.count ?? 0,
    submissions: submissionsResult.count ?? 0,
    ungraded_submissions: ungradedSubmissionsResult.count ?? 0,
    enrollment_statuses: statusCounts,
    enrollments_this_month: enrollmentsThisMonth,
    enrollments_previous_month: enrollmentsPreviousMonth,
    paid_revenue_this_month_minor_units: paidRevenueThisMonthMinorUnits,
    paid_revenue_previous_month_minor_units: paidRevenuePreviousMonthMinorUnits,
    monthly_activity: monthly,
    top_courses: topCourses,
    monthly_financial_report: {
      ...report,
      net_minor_units:
        report.paid_revenue_minor_units -
        report.refunds_minor_units -
        report.expenses_minor_units,
      previous_net_minor_units:
        report.previous_paid_revenue_minor_units -
        report.previous_refunds_minor_units -
        report.previous_expenses_minor_units,
      course_revenues: [...reportCourseRevenue.entries()]
        .map(([courseId, course]) => ({
          course_id: courseId,
          course_title: course.title,
          enrollments: course.enrollments,
          previous_enrollments: course.previousEnrollments,
          paid_enrollments: course.paidEnrollments,
          revenue_minor_units: course.revenueMinorUnits,
        }))
        .sort(
          (first, second) =>
            second.revenue_minor_units - first.revenue_minor_units ||
            second.paid_enrollments - first.paid_enrollments,
        ),
    },
  });
});
