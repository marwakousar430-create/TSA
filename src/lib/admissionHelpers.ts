export interface TuitionEstimate {
  baseTuition: number;
  discountPercent: number;
  discountAmount: number;
  transportFee: number;
  netMonthlyFee: number;
}

export const AVAILABLE_INTERESTS = [
  'STEM & Robotics',
  'Competitive Athletics',
  'Visual & Performing Arts',
  'Debate & Model UN',
  'Computer Science & AI',
  'Music & Orchestra',
];

export const TRANSPORT_ROUTES = [
  'North Campus Shuttle (Route A1)',
  'Westwood Express (Route B2)',
  'Downtown Direct (Route C3)',
  'Oakridge East Loop (Route D4)',
];

export const REQUIRED_DOCUMENTS = [
  'Birth Certificate / National ID Copy',
  'Previous 2 Years Academic Transcripts',
  'Transfer / Leaving Certificate',
  'Immunization & Medical Clearance Form',
];

export const SCHOLARSHIP_OPTIONS = [
  { label: 'None (Standard Tuition)', value: 'None', percent: 0 },
  { label: 'Academic Merit (90%+ Score) — 30% Off', value: 'Academic Merit (30%)', percent: 30 },
  { label: 'Honor Roll (85%+ Score) — 15% Off', value: 'Honor Roll (15%)', percent: 15 },
  { label: 'STEM / Olympiad Fellow — 40% Off', value: 'STEM Fellowship (40%)', percent: 40 },
  { label: 'Sibling Enrollment Discount — 15% Off', value: 'Sibling Discount (15%)', percent: 15 },
  { label: 'Need-Based Financial Aid — 25% Off', value: 'Financial Aid (25%)', percent: 25 },
];

export function calculateTuitionEstimate(
  applyingClass: string,
  scholarshipType: string,
  transportRequired: boolean
): TuitionEstimate {
  let baseTuition = 165;
  if (applyingClass.includes('7') || applyingClass.includes('8')) {
    baseTuition = 140;
  } else if (applyingClass.includes('11') || applyingClass.includes('12')) {
    baseTuition = 210;
  }

  const foundScholarship = SCHOLARSHIP_OPTIONS.find((s) => s.value === scholarshipType);
  const discountPercent = foundScholarship ? foundScholarship.percent : 0;
  const discountAmount = Math.round((baseTuition * discountPercent) / 100);
  const transportFee = transportRequired ? 45 : 0;
  const netMonthlyFee = Math.max(0, baseTuition - discountAmount + transportFee);

  return {
    baseTuition,
    discountPercent,
    discountAmount,
    transportFee,
    netMonthlyFee,
  };
}
