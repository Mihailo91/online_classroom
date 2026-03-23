/**
 * Purchase Order Test Fixtures
 * Provides realistic mock data for courses and lesson packages
 */

export const MOCK_COURSE_DATA = {
  spanish_beginner: {
    id: "course-spanish-beginner-001",
    title: "Spanish for Beginners",
    price: 29.99,
    currency: "EUR",
    description: "Learn the basics of Spanish",
  },
  german_advanced: {
    id: "course-german-advanced-001",
    title: "Advanced German Conversation",
    price: 49.99,
    currency: "EUR",
    description: "Master advanced German conversational skills",
  },
  french_business: {
    id: "course-french-business-001",
    title: "Business French",
    price: 39.99,
    currency: "EUR",
    description: "Professional French for business environments",
  },
};

export const MOCK_LESSON_PACKAGES = {
  starter_pack: {
    id: "package-starter-001",
    name: "Starter Pack",
    lessons: 4,
    validity_days: 30,
    price: 79.99,
    currency: "EUR",
  },
  standard_pack: {
    id: "package-standard-001",
    name: "Standard Pack",
    lessons: 8,
    validity_days: 60,
    price: 149.99,
    currency: "EUR",
  },
  premium_pack: {
    id: "package-premium-001",
    name: "Premium Pack",
    lessons: 12,
    validity_days: 90,
    price: 219.99,
    currency: "EUR",
  },
  single_lesson: {
    id: "lesson-single-001",
    name: "Single Lesson",
    lessons: 1,
    validity_days: null,
    price: 25.0,
    currency: "EUR",
  },
};

export const MOCK_PROFESSORS = {
  maria_garcia: {
    id: "prof-maria-001",
    name: "Maria García",
    email: "maria@example.com",
    language: "Spanish",
    timezone: "Europe/Madrid",
  },
  stefan_mueller: {
    id: "prof-stefan-001",
    name: "Stefan Mueller",
    email: "stefan@example.com",
    language: "German",
    timezone: "Europe/Berlin",
  },
  jean_dupont: {
    id: "prof-jean-001",
    name: "Jean Dupont",
    email: "jean@example.com",
    language: "French",
    timezone: "Europe/Paris",
  },
};

export const MOCK_STUDENTS = {
  john_doe: {
    id: "student-john-001",
    email: "john.doe@example.com",
    name: "John Doe",
  },
  jane_smith: {
    id: "student-jane-001",
    email: "jane.smith@example.com",
    name: "Jane Smith",
  },
};

export const MOCK_COUPONS = [
  {
    code: "WELCOME10",
    description: "10% off any course",
    discountType: "percentage",
    discountValue: 10,
    applicableTo: "course",
    maxUses: 100,
    maxUsesPerUser: 1,
  },
  {
    code: "LESSON15",
    description: "15 EUR off lesson packages",
    discountType: "fixed",
    discountValue: 15.0,
    applicableTo: "package",
    maxUses: 50,
    maxUsesPerUser: 1,
  },
  {
    code: "SUMMER20",
    description: "20% off all items",
    discountType: "percentage",
    discountValue: 20,
    applicableTo: null, // applies to all
    maxUses: 200,
    maxUsesPerUser: 2,
  },
];

export function generateCoursePurchaseScenario(
  courseKey: keyof typeof MOCK_COURSE_DATA,
  studentKey: keyof typeof MOCK_STUDENTS,
  couponCode?: string
) {
  const course = MOCK_COURSE_DATA[courseKey];
  const student = MOCK_STUDENTS[studentKey];
  const coupon = couponCode ? MOCK_COUPONS.find((c) => c.code === couponCode) : null;

  let finalAmount = course.price;
  let discount = 0;

  if (coupon) {
    if (coupon.discountType === "percentage") {
      discount = (course.price * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, course.price);
    }
    finalAmount = course.price - discount;
  }

  return {
    course,
    student,
    coupon,
    originalAmount: course.price,
    discount,
    finalAmount,
    currency: course.currency,
  };
}

/**
 * Generate a complete lesson package purchase scenario
 */
export function generateLessonPurchaseScenario(
  packageKey: keyof typeof MOCK_LESSON_PACKAGES,
  professorKey: keyof typeof MOCK_PROFESSORS,
  studentKey: keyof typeof MOCK_STUDENTS,
  couponCode?: string
) {
  const pkg = MOCK_LESSON_PACKAGES[packageKey];
  const professor = MOCK_PROFESSORS[professorKey];
  const student = MOCK_STUDENTS[studentKey];
  const coupon = couponCode ? MOCK_COUPONS.find((c) => c.code === couponCode) : null;

  let finalAmount = pkg.price;
  let discount = 0;

  if (coupon) {
    if (coupon.discountType === "percentage") {
      discount = (pkg.price * coupon.discountValue) / 100;
    } else {
      discount = Math.min(coupon.discountValue, pkg.price);
    }
    finalAmount = pkg.price - discount;
  }

  return {
    package: pkg,
    professor,
    student,
    coupon,
    originalAmount: pkg.price,
    discount,
    finalAmount,
    currency: pkg.currency,
  };
}

/**
 * Common purchase test cases
 */
export const PURCHASE_TEST_CASES = {
  course_no_coupon: {
    type: "course",
    description: "Course purchase without coupon",
    scenario: () => generateCoursePurchaseScenario("spanish_beginner", "john_doe"),
  },
  course_with_percentage_coupon: {
    type: "course",
    description: "Course purchase with 10% discount coupon",
    scenario: () => generateCoursePurchaseScenario("spanish_beginner", "john_doe", "WELCOME10"),
  },
  course_with_fixed_coupon: {
    type: "course",
    description: "Course purchase with fixed amount discount",
    scenario: () => generateCoursePurchaseScenario("spanish_beginner", "jane_smith", "LESSON15"),
  },
  lesson_starter_no_coupon: {
    type: "lesson",
    description: "Starter pack without coupon",
    scenario: () =>
      generateLessonPurchaseScenario("starter_pack", "stefan_mueller", "john_doe"),
  },
  lesson_premium_with_coupon: {
    type: "lesson",
    description: "Premium pack with 20% discount coupon",
    scenario: () =>
      generateLessonPurchaseScenario("premium_pack", "maria_garcia", "jane_smith", "SUMMER20"),
  },
  single_lesson_no_coupon: {
    type: "lesson",
    description: "Single lesson without coupon",
    scenario: () =>
      generateLessonPurchaseScenario("single_lesson", "jean_dupont", "john_doe"),
  },
};

/**
 * Get a test case by name
 */
export function getTestCase(testCaseName: keyof typeof PURCHASE_TEST_CASES) {
  const testCase = PURCHASE_TEST_CASES[testCaseName];
  if (!testCase) {
    throw new Error(`Test case "${testCaseName}" not found`);
  }
  return testCase.scenario();
}

/**
 * Get all test case names
 */
export function getAllTestCaseNames(): (keyof typeof PURCHASE_TEST_CASES)[] {
  return Object.keys(PURCHASE_TEST_CASES) as (keyof typeof PURCHASE_TEST_CASES)[];
}

/**
 * Generate a mock purchase order request payload
 */
export function generatePurchaseOrderRequest(
  referenceType: "course" | "lesson",
  couponCode?: string
) {
  const scenario =
    referenceType === "course"
      ? generateCoursePurchaseScenario("spanish_beginner", "john_doe", couponCode)
      : generateLessonPurchaseScenario("starter_pack", "maria_garcia", "john_doe", couponCode);

  return {
    couponCode: couponCode || undefined,
  };
}
