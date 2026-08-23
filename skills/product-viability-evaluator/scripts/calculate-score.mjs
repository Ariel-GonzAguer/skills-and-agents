#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const VERDICT_ORDER = ["ABANDON", "RECONSIDER", "PIVOT", "VALIDATE", "BUILD"];
const REQUIRED_DIMENSIONS = [
  "problem",
  "customer",
  "market",
  "competition",
  "differentiation",
  "product",
  "monetization",
  "acquisition",
  "economics",
  "execution_risk",
  "founder_fit"
];
const policyPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../config/decision-policy.json");
const DECISION_POLICY = JSON.parse(fs.readFileSync(policyPath, "utf8"));

/**
 * Clamps a numeric value to an inclusive range.
 * @param {number} value Value to clamp.
 * @param {number} minimum Minimum allowed value.
 * @param {number} maximum Maximum allowed value.
 * @returns {number} Clamped value.
 * @example
 * clamp(120, 0, 100); // 100
 */
export function clamp(value, minimum, maximum) {
  return Math.min(maximum, Math.max(minimum, value));
}

/**
 * Rounds a number to two decimal places.
 * @param {number} value Value to round.
 * @returns {number} Rounded value.
 * @example
 * round2(12.345); // 12.35
 */
export function round2(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

/**
 * Validates the fields required for deterministic calculations.
 * @param {object} assessment Assessment object.
 * @returns {string[]} Validation errors.
 * @example
 * validateAssessment({ dimensions: {} });
 */
export function validateAssessment(assessment) {
  const errors = [];
  if (!assessment || typeof assessment !== "object" || Array.isArray(assessment)) {
    return ["Assessment must be a JSON object."];
  }

  if (!assessment.project?.name) errors.push("project.name is required.");
  if (!assessment.project?.type) errors.push("project.type is required.");
  if (!assessment.decision_frame?.decision) errors.push("decision_frame.decision is required.");
  if (!assessment.dimensions || typeof assessment.dimensions !== "object") {
    errors.push("dimensions is required.");
    return errors;
  }

  for (const id of REQUIRED_DIMENSIONS) {
    const dimension = assessment.dimensions[id];
    if (!dimension) {
      errors.push(`dimensions.${id} is required.`);
      continue;
    }
    if (!Number.isFinite(dimension.weight) || dimension.weight <= 0) {
      errors.push(`dimensions.${id}.weight must be greater than 0.`);
    }
    for (const field of ["score", "pre_red_team_score"]) {
      const value = dimension[field];
      if (value !== null && (!Number.isFinite(value) || value < 0 || value > 100)) {
        errors.push(`dimensions.${id}.${field} must be null or between 0 and 100.`);
      }
    }
    if (!Number.isFinite(dimension.confidence) || dimension.confidence < 0 || dimension.confidence > 100) {
      errors.push(`dimensions.${id}.confidence must be between 0 and 100.`);
    }
    if (!Number.isInteger(dimension.evidence_strength) || dimension.evidence_strength < 0 || dimension.evidence_strength > 4) {
      errors.push(`dimensions.${id}.evidence_strength must be an integer from 0 to 4.`);
    }
  }

  const totalWeight = Object.values(assessment.dimensions).reduce(
    (sum, dimension) => sum + (Number.isFinite(dimension?.weight) ? dimension.weight : 0),
    0
  );
  if (Math.abs(totalWeight - 100) > 0.01) {
    errors.push(`Dimension weights must sum to 100; received ${round2(totalWeight)}.`);
  }
  if (!assessment.red_team?.performed || !assessment.red_team?.attacks?.length) {
    errors.push("A performed red team with at least one attack is required.");
  }
  if (!Array.isArray(assessment.experiments) || assessment.experiments.length === 0) {
    errors.push("At least one validation experiment is required.");
  }
  return errors;
}

/**
 * Calculates common financial metrics without inventing missing inputs.
 * @param {object} scenario Financial scenario.
 * @returns {object} Calculated metrics; unavailable values are null.
 * @example
 * calculateScenario({ customers: 10, monthly_arpu: 100, variable_costs: 200, fixed_costs: 300, founder_hours: 20 });
 */
export function calculateScenario(scenario = {}) {
  const customers = numberOrNull(scenario.customers);
  const arpu = numberOrNull(scenario.monthly_arpu);
  const explicitRevenue = numberOrNull(scenario.monthly_revenue);
  const revenue = explicitRevenue ?? multiplyOrNull(customers, arpu);
  const variableCosts = numberOrNull(scenario.variable_costs);
  const fixedCosts = numberOrNull(scenario.fixed_costs);
  const grossProfit = subtractOrNull(revenue, variableCosts);
  const operatingProfit = subtractOrNull(grossProfit, fixedCosts);
  const grossMarginPct = revenue && grossProfit !== null ? (grossProfit / revenue) * 100 : null;
  const acquisitionSpend = numberOrNull(scenario.acquisition_spend);
  const newCustomers = numberOrNull(scenario.new_customers);
  const cac = acquisitionSpend !== null && newCustomers > 0 ? acquisitionSpend / newCustomers : null;
  const churn = numberOrNull(scenario.monthly_churn_rate);
  const monthlyGrossProfitPerCustomer = customers > 0 && grossProfit !== null ? grossProfit / customers : null;
  const ltv = arpu !== null && grossMarginPct !== null && churn > 0
    ? (arpu * (grossMarginPct / 100)) / churn
    : null;
  const ltvCac = ltv !== null && cac > 0 ? ltv / cac : null;
  const cacPaybackMonths = cac !== null && monthlyGrossProfitPerCustomer > 0
    ? cac / monthlyGrossProfitPerCustomer
    : null;
  const founderHours = numberOrNull(scenario.founder_hours);
  const returnPerFounderHour = operatingProfit !== null && founderHours > 0
    ? operatingProfit / founderHours
    : null;

  return mapRounded({
    monthly_revenue: revenue,
    annual_revenue: revenue === null ? null : revenue * 12,
    gross_profit: grossProfit,
    gross_margin_pct: grossMarginPct,
    operating_profit: operatingProfit,
    cac,
    ltv,
    ltv_cac: ltvCac,
    cac_payback_months: cacPaybackMonths,
    return_per_founder_hour: returnPerFounderHour
  });
}

/**
 * Calculates weighted scores, confidence, coverage, scenarios, and verdict ceilings.
 * @param {object} assessment Valid assessment object.
 * @returns {object} Deterministic calculation output.
 * @example
 * calculateAssessment(assessment);
 */
export function calculateAssessment(assessment) {
  const errors = validateAssessment(assessment);
  if (errors.length) {
    const error = new Error(`Invalid assessment:\n- ${errors.join("\n- ")}`);
    error.validationErrors = errors;
    throw error;
  }

  const dimensions = Object.entries(assessment.dimensions);
  const totalWeight = dimensions.reduce((sum, [, item]) => sum + item.weight, 0);
  const scored = dimensions.filter(([, item]) => item.score !== null);
  const preScored = dimensions.filter(([, item]) => item.pre_red_team_score !== null);
  const knownWeight = scored.reduce((sum, [, item]) => sum + item.weight, 0);
  const preKnownWeight = preScored.reduce((sum, [, item]) => sum + item.weight, 0);
  const weightedScore = weightedAverage(scored, "score", knownWeight);
  const preRedTeamScore = weightedAverage(preScored, "pre_red_team_score", preKnownWeight);
  const globalAdjustment = clamp(
    assessment.red_team.global_adjustment ?? 0,
    DECISION_POLICY.maximum_global_red_team_adjustment,
    0
  );
  const finalScore = clamp(weightedScore + globalAdjustment, 0, 100);
  const evidenceCoverage = (knownWeight / totalWeight) * 100;
  const dimensionConfidence = weightedAverage(scored, "confidence", knownWeight);
  const confidencePenalty = clamp(
    assessment.confidence_penalty ?? 0,
    0,
    DECISION_POLICY.maximum_confidence_penalty
  );
  const confidence = clamp(
    0.7 * dimensionConfidence + 0.3 * evidenceCoverage - confidencePenalty,
    0,
    100
  );
  const verdictCeiling = calculateVerdictCeiling(assessment, evidenceCoverage, confidence);
  const scenarios = Object.fromEntries(
    Object.entries(assessment.financial_scenarios ?? {}).map(([name, scenario]) => [name, calculateScenario(scenario)])
  );

  return {
    project: assessment.project.name,
    project_type: assessment.project.type,
    weights_total: round2(totalWeight),
    known_weight: round2(knownWeight),
    pre_red_team_score: round2(preRedTeamScore),
    red_team_global_adjustment: round2(globalAdjustment),
    overall_score: round2(finalScore),
    confidence: round2(confidence),
    evidence_coverage: round2(evidenceCoverage),
    verdict_ceiling: verdictCeiling,
    proposed_verdict: assessment.proposed_verdict ?? null,
    verdict_check: checkVerdict(assessment.proposed_verdict, verdictCeiling),
    financial_scenarios: scenarios
  };
}

/**
 * Determines the most permissive verdict allowed by open gates.
 * @param {object} assessment Assessment object.
 * @param {number} evidenceCoverage Evidence coverage percentage.
 * @param {number} confidence Overall confidence percentage.
 * @returns {string} Verdict ceiling.
 * @example
 * calculateVerdictCeiling(assessment, 80, 70); // "BUILD" or stricter
 */
export function calculateVerdictCeiling(assessment, evidenceCoverage, confidence) {
  let ceiling = "BUILD";
  if (
    evidenceCoverage < DECISION_POLICY.low_coverage_threshold ||
    confidence < DECISION_POLICY.low_confidence_threshold
  ) {
    ceiling = stricterVerdict(ceiling, "RECONSIDER");
  } else if (
    evidenceCoverage < DECISION_POLICY.build_minimum_evidence_coverage ||
    confidence < DECISION_POLICY.build_minimum_confidence
  ) {
    ceiling = stricterVerdict(ceiling, "VALIDATE");
  }

  const highImpactUnknown = (assessment.unknowns ?? []).some(
    (item) => item.decision_impact === "critical"
  );
  if (highImpactUnknown) ceiling = stricterVerdict(ceiling, "VALIDATE");

  for (const item of assessment.deal_breakers ?? []) {
    if (item.status === "open") ceiling = stricterVerdict(ceiling, item.verdict_ceiling);
  }
  return ceiling;
}

/**
 * Calculates a weighted average for one dimension field.
 * @param {Array<[string, object]>} entries Scored dimension entries.
 * @param {string} field Numeric field to aggregate.
 * @param {number} weight Sum of included weights.
 * @returns {number} Weighted average or zero when no weight is available.
 * @example
 * weightedAverage([["problem", { score: 80, weight: 10 }]], "score", 10); // 80
 */
function weightedAverage(entries, field, weight) {
  if (weight <= 0) return 0;
  return entries.reduce((sum, [, item]) => sum + item[field] * item.weight, 0) / weight;
}

/**
 * Returns the stricter of two verdict ceilings.
 * @param {string} current Current ceiling.
 * @param {string} candidate Candidate ceiling.
 * @returns {string} Stricter verdict.
 * @example
 * stricterVerdict("BUILD", "VALIDATE"); // "VALIDATE"
 */
function stricterVerdict(current, candidate) {
  return VERDICT_ORDER.indexOf(candidate) < VERDICT_ORDER.indexOf(current) ? candidate : current;
}

/**
 * Checks whether a proposed verdict respects a calculated ceiling.
 * @param {string | undefined} proposed Proposed verdict.
 * @param {string} ceiling Calculated verdict ceiling.
 * @returns {{valid: boolean | null, message: string}} Check result.
 * @example
 * checkVerdict("VALIDATE", "VALIDATE");
 */
function checkVerdict(proposed, ceiling) {
  if (!proposed) return { valid: null, message: "No proposed verdict supplied." };
  const valid = VERDICT_ORDER.indexOf(proposed) <= VERDICT_ORDER.indexOf(ceiling);
  return {
    valid,
    message: valid
      ? `Proposed verdict ${proposed} respects ceiling ${ceiling}.`
      : `Proposed verdict ${proposed} exceeds ceiling ${ceiling}.`
  };
}

/**
 * Converts finite numeric inputs to numbers and all other values to null.
 * @param {unknown} value Candidate value.
 * @returns {number | null} Finite number or null.
 * @example
 * numberOrNull(undefined); // null
 */
function numberOrNull(value) {
  return Number.isFinite(value) ? value : null;
}

/**
 * Multiplies two available numbers without inventing missing inputs.
 * @param {number | null} left Left operand.
 * @param {number | null} right Right operand.
 * @returns {number | null} Product or null.
 * @example
 * multiplyOrNull(10, 20); // 200
 */
function multiplyOrNull(left, right) {
  return left === null || right === null ? null : left * right;
}

/**
 * Subtracts two available numbers without treating missing values as zero.
 * @param {number | null} left Left operand.
 * @param {number | null} right Right operand.
 * @returns {number | null} Difference or null.
 * @example
 * subtractOrNull(100, 40); // 60
 */
function subtractOrNull(left, right) {
  return left === null || right === null ? null : left - right;
}

/**
 * Rounds every non-null numeric value in an object.
 * @param {Record<string, number | null>} object Metrics object.
 * @returns {Record<string, number | null>} Rounded metrics.
 * @example
 * mapRounded({ value: 1.234, missing: null });
 */
function mapRounded(object) {
  return Object.fromEntries(
    Object.entries(object).map(([key, value]) => [key, value === null ? null : round2(value)])
  );
}

/**
 * Runs the score calculator command-line interface.
 * @returns {void}
 * @example
 * // node calculate-score.mjs assessment.json
 */
function runCli() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node calculate-score.mjs <assessment.json> [output.json]");
    process.exitCode = 1;
    return;
  }
  try {
    const assessment = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
    const result = calculateAssessment(assessment);
    const output = `${JSON.stringify(result, null, 2)}\n`;
    if (process.argv[3]) fs.writeFileSync(path.resolve(process.argv[3]), output, "utf8");
    else process.stdout.write(output);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) runCli();
