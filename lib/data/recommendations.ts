import "server-only";

import { getLearningProfile } from "@/lib/data/learning-profile";
import { createClient } from "@/lib/supabase/server";

type Recommendation = {
  id: string;
  title: string;
  description: string | null;
  image_url: string | null;
  level: string | null;
  domain: string | null;
  type: string | null;
  duration: string | null;
  score: number;
  reasons: string[];
};

function normalize(value: string | null | undefined) {
  return (value ?? "")
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function domainsMatch(
  first: string | null | undefined,
  second: string | null | undefined,
) {
  const a = normalize(first);
  const b = normalize(second);

  if (!a || !b) {
    return false;
  }

  if (a === b) {
    return true;
  }

  const groups = [
    [
      "ai",
      "artificial intelligence",
      "machine learning",
      "data science",
      "data analytics",
    ],
    [
      "web development",
      "frontend",
      "backend",
      "full stack",
      "programming",
      "software development",
    ],
    ["mobile development", "android", "ios", "flutter", "react native"],
    ["cloud", "devops", "cloud computing"],
    ["cybersecurity", "cyber security", "security", "ethical hacking"],
    ["design", "ui ux", "ux", "ui design", "graphic design"],
    ["business", "business product", "entrepreneurship", "product management"],
    ["marketing", "digital marketing", "social media marketing"],
  ];

  return groups.some((group) => {
    const firstMatches = group.some((item) => a.includes(item));

    const secondMatches = group.some((item) => b.includes(item));

    return firstMatches && secondMatches;
  });
}

function courseRelatedToHistory(
  courseDomain: string | null | undefined,
  historyDomains: string[],
) {
  return historyDomains.some((domain) => domainsMatch(courseDomain, domain));
}

function textMatches(
  text: string | null | undefined,
  target: string | null | undefined,
) {
  const a = normalize(text);
  const b = normalize(target);

  if (!a || !b) {
    return false;
  }

  const words = b.split(" ").filter((word) => word.length >= 3);

  return (
    a.includes(b) || b.includes(a) || words.some((word) => a.includes(word))
  );
}

/**
 * Maps the user's difficulty preference
 * to the course level.
 *
 * Easy   -> Beginner
 * Medium -> Intermediate
 * Hard   -> Advanced
 */
function difficultyMatches(
  courseLevel: string | null | undefined,
  difficulty: string | null | undefined,
) {
  const level = normalize(courseLevel);
  const difficultyValue = normalize(difficulty);

  if (!level || !difficultyValue) {
    return false;
  }

  const mapping: Record<string, string[]> = {
    easy: ["beginner"],
    medium: ["intermediate"],
    hard: ["advanced"],
  };

  return (
    mapping[difficultyValue]?.some((value) => level.includes(value)) ?? false
  );
}

function durationMatches(
  courseDuration: string | null | undefined,
  learningTime: string | null | undefined,
) {
  const course = normalize(courseDuration);
  const available = normalize(learningTime);

  if (!course || !available) {
    return false;
  }

  // Direct text match
  if (course.includes(available) || available.includes(course)) {
    return true;
  }

  const courseNumbers = course.match(/\d+/g)?.map(Number) ?? [];

  const availableNumbers = available.match(/\d+/g)?.map(Number) ?? [];

  if (courseNumbers.length === 0 || availableNumbers.length === 0) {
    return false;
  }

  const courseValue = courseNumbers[0];

  const availableValue = availableNumbers[0];

  if (courseValue === undefined || availableValue === undefined) {
    return false;
  }

  if (courseValue <= availableValue && available.includes("hour")) {
    return true;
  }

  if (courseValue <= availableValue && available.includes("minute")) {
    return true;
  }

  return false;
}
const MAX_SCORE = 137;

export async function getRecommendedCourses(
  limit = 8,
): Promise<Recommendation[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return [];
  }

  // --------------------------------------------------
  // 1. Get user preferences
  // --------------------------------------------------

  const { data: preferences } = await supabase
    .from("user_learning_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle();

  // --------------------------------------------------
  // 2. Get learning history
  // --------------------------------------------------

  const learningProfile = await getLearningProfile();

  if (!learningProfile) {
    return [];
  }

  const enrolledIds = learningProfile.enrolledCourses.map(
    (course) => course.id,
  );

  const completedIds = learningProfile.completedCourses;

  // --------------------------------------------------
  // 3. Get published courses
  // --------------------------------------------------

  const { data: courses, error } = await supabase
    .from("courses")
    .select(
      `
      id,
      title,
      description,
      image_url,
      level,
      domain,
      type,
      duration,
      is_trending,
      is_exclusive,
      is_partner,
      is_beginner
      `,
    )
    .eq("is_published", true);

  if (error) {
    throw new Error(error.message);
  }

  if (!courses) {
    return [];
  }

  // --------------------------------------------------
  // 4. Build learning-history domains
  // --------------------------------------------------

  const historyDomains = learningProfile.enrolledCourses
    .map((course) => course.domain)
    .filter((domain): domain is string => Boolean(domain));

  // --------------------------------------------------
  // 5. Remove enrolled/completed courses
  // --------------------------------------------------

  const candidates = courses.filter(
    (course) =>
      !enrolledIds.includes(course.id) && !completedIds.includes(course.id),
  );

  // --------------------------------------------------
  // 6. Score courses
  // --------------------------------------------------

  const recommendations = candidates.map((course) => {
    let score = 0;

    const reasons: string[] = [];

    // ----------------------------------------------
    // Preferred category +30
    // ----------------------------------------------

    if (domainsMatch(course.domain, preferences?.preferred_category)) {
      score += 30;

      reasons.push("Matches your preferred category");
    }

    // ----------------------------------------------
    // Interests +10 / +20
    // ----------------------------------------------

    const interests = preferences?.interests ?? [];

    const matchedInterests = interests.filter(
      (interest: string) =>
        domainsMatch(course.domain, interest) ||
        textMatches(course.title, interest) ||
        textMatches(course.description, interest),
    );

    if (matchedInterests.length > 0) {
      const interestScore = Math.min(matchedInterests.length * 10, 20);

      score += interestScore;

      reasons.push(`Matches ${matchedInterests.length} of your interests`);
    }

    // ----------------------------------------------
    // Current level +15
    // ----------------------------------------------

    if (textMatches(course.level, preferences?.current_level)) {
      score += 15;

      reasons.push("Matches your current level");
    }

    // ----------------------------------------------
    // Skills +6 / +12 / +18
    // ----------------------------------------------

    const skills = preferences?.skills ?? [];

    const matchedSkills = skills.filter(
      (skill: string) =>
        textMatches(course.title, skill) ||
        textMatches(course.description, skill) ||
        textMatches(course.domain, skill),
    );

    if (matchedSkills.length > 0) {
      const skillScore = Math.min(matchedSkills.length * 6, 18);

      score += skillScore;

      reasons.push(`Matches ${matchedSkills.length} of your skills`);
    }

    // ----------------------------------------------
    // Preferred difficulty +10
    // ----------------------------------------------

    if (difficultyMatches(course.level, preferences?.preferred_difficulty)) {
      score += 10;

      reasons.push("Matches your preferred difficulty");
    }

    // ----------------------------------------------
    // Learning goal +10
    // ----------------------------------------------

    if (
      textMatches(course.domain, preferences?.learning_goal) ||
      textMatches(course.title, preferences?.learning_goal) ||
      textMatches(course.description, preferences?.learning_goal)
    ) {
      score += 10;

      reasons.push("Relevant to your learning goal");
    }

    // ----------------------------------------------
    // Preferred learning format +8
    // ----------------------------------------------

    if (
      preferences?.preferred_learning_format &&
      textMatches(course.type, preferences.preferred_learning_format)
    ) {
      score += 8;

      reasons.push("Matches your preferred learning format");
    }

    // ----------------------------------------------
    // Learning time +5
    // ----------------------------------------------

    if (
      preferences?.learning_time &&
      durationMatches(course.duration, preferences.learning_time)
    ) {
      score += 5;

      reasons.push("Fits your available learning time");
    }

    // ----------------------------------------------
    // Learning history +5
    // ----------------------------------------------

    if (courseRelatedToHistory(course.domain, historyDomains)) {
      score += 5;

      reasons.push("Related to your learning history");
    }

    // ----------------------------------------------
    // Beginner +5
    // ----------------------------------------------

    if (preferences?.current_level === "Beginner" && course.is_beginner) {
      score += 5;

      reasons.push("Suitable for beginners");
    }

    // ----------------------------------------------
    // Trending +5
    // ----------------------------------------------

    if (course.is_trending) {
      score += 5;

      reasons.push("Currently trending");
    }

    // ----------------------------------------------
    // Exclusive +3
    // ----------------------------------------------

    if (course.is_exclusive) {
      score += 3;

      reasons.push("Exclusive Evolve course");
    }

    // ----------------------------------------------
    // Partner +3
    // ----------------------------------------------

    if (course.is_partner) {
      score += 3;

      reasons.push("Partner course");
    }

    return {
      id: course.id,
      title: course.title,
      description: course.description,
      image_url: course.image_url,
      level: course.level,
      domain: course.domain,
      type: course.type,
      duration: course.duration,
      score: Math.round((score / MAX_SCORE) * 100),
      reasons,
    };
  });

  // --------------------------------------------------
  // 7. Sort by score
  // --------------------------------------------------

  recommendations.sort((a, b) => b.score - a.score);
  const relevantRecommendations = recommendations.filter(
    (course) => course.score >= 20,
  );

  // --------------------------------------------------
  // 8. Return top recommendations
  // --------------------------------------------------

  return relevantRecommendations.slice(0, limit);
}
