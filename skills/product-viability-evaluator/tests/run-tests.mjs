#!/usr/bin/env node

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { calculateAssessment, calculateScenario, validateAssessment } from "../scripts/calculate-score.mjs";
import { validateCompleteness } from "../scripts/validate-assessment.mjs";

const directory = path.dirname(fileURLToPath(import.meta.url));
const cases = JSON.parse(fs.readFileSync(path.join(directory, "cases.json"), "utf8"));
const profiles = JSON.parse(fs.readFileSync(path.join(directory, "../config/profiles.json"), "utf8"));
const dimensionIds = Object.keys(profiles.default);

/**
 * Creates a complete synthetic assessment from a compact test case.
 * @param {object} testCase Test-case definition.
 * @returns {object} Assessment ready for calculation.
 * @example
 * createAssessment(cases[0]);
 */
function createAssessment(testCase) {
  const profile = profiles[testCase.type] ?? profiles.default;
  const dimensions = Object.fromEntries(dimensionIds.map((id, index) => {
    const score = testCase.scores[index];
    return [id, {
      weight: profile[id] ?? profiles.default[id],
      score,
      pre_red_team_score: score === null ? null : Math.min(100, score + 2),
      confidence: score === null ? 10 : testCase.confidence,
      evidence_strength: score === null ? 0 : Math.max(1, Math.min(4, Math.round(testCase.confidence / 25))),
      positive_factors: score !== null && score >= 60 ? ["Synthetic positive evidence"] : [],
      negative_factors: score === null || score < 60 ? ["Synthetic negative or missing evidence"] : [],
      evidence_ids: score === null ? [] : ["S01"],
      unknowns: score === null ? ["Decision-relevant value is unknown"] : [],
      rationale: "Synthetic fixture used to verify scoring and verdict-gate behavior."
    }];
  }));

  const dealBreakers = testCase.deal_breaker ? [{
    risk: testCase.deal_breaker.risk,
    status: "open",
    severity: testCase.deal_breaker.verdict_ceiling === "ABANDON" ? "critical" : "high",
    verdict_ceiling: testCase.deal_breaker.verdict_ceiling,
    evidence_ids: ["S01"],
    remediation: "Run the specified validation experiment before further commitment."
  }] : [];

  return {
    project: { name: testCase.name, type: testCase.type, classification_confidence: 90 },
    decision_frame: { decision: "Invest the next stage", commitment_scope: "Next bounded milestone", horizon: "12 months", currency: "USD" },
    founder_context: { weekly_hours: 20 },
    dimensions,
    evidence: [{
      id: "S01",
      label: "EVIDENCE",
      statement: "Synthetic evidence fixture; not a real market claim.",
      strength: 3,
      source: "tests/cases.json",
      date: "2026-08-13",
      direction: "mixed",
      limitations: "Validates methodology and arithmetic only."
    }],
    unknowns: testCase.critical_unknown ? [{
      item: "Core market and economics data",
      decision_impact: "critical",
      resolution: "Collect behavioral demand and cost evidence."
    }] : [],
    assumptions: [{ item: "Fixture scores", value: "synthetic", sensitivity: "Not used as real-world evidence." }],
    financial_scenarios: {
      pessimistic: { customers: 5, monthly_arpu: 100, variable_costs: 200, fixed_costs: 500, acquisition_spend: 500, new_customers: 5, monthly_churn_rate: 0.08, founder_hours: 40 },
      base: { customers: 20, monthly_arpu: 100, variable_costs: 400, fixed_costs: 700, acquisition_spend: 1000, new_customers: 10, monthly_churn_rate: 0.04, founder_hours: 30 },
      optimistic: { customers: 50, monthly_arpu: 100, variable_costs: 800, fixed_costs: 1000, acquisition_spend: 1500, new_customers: 15, monthly_churn_rate: 0.025, founder_hours: 35 }
    },
    red_team: {
      performed: true,
      attacks: [{
        id: "RT01",
        challenged_claim: "The initial case is sufficiently robust.",
        failure_mechanism: "A binding constraint may invalidate the aggregate score.",
        severity: "high",
        likelihood: "medium",
        affected_dimensions: ["acquisition"],
        score_impact: -2,
        falsification_test: "Run the highest-impact behavioral experiment."
      }],
      global_adjustment: 0
    },
    deal_breakers: dealBreakers,
    experiments: [{
      hypothesis: "The binding commercial hypothesis is true.",
      method: "Run a behavioral test with the target segment.",
      success_threshold: "Predefined positive behavior threshold is reached.",
      failure_threshold: "Predefined threshold is missed.",
      cost: "Low",
      duration: "Two weeks",
      decision_changed: "Proceed, pivot, or stop the next investment."
    }],
    proposed_verdict: testCase.expected_verdict,
    confidence_penalty: 0
  };
}

/**
 * Runs the required ten archetype and failure-mode fixtures.
 * @returns {void}
 * @example
 * runFixtureTests();
 */
function runFixtureTests() {
  assert.equal(cases.length, 10, "Exactly ten required cases must be present.");
  for (const testCase of cases) {
    const assessment = createAssessment(testCase);
    assert.deepEqual(validateAssessment(assessment), [], `${testCase.id} should pass calculation validation.`);
    assert.deepEqual(validateCompleteness(assessment), [], `${testCase.id} should pass completeness validation.`);
    const result = calculateAssessment(assessment);
    assert.ok(result.overall_score >= testCase.expected_score[0] && result.overall_score <= testCase.expected_score[1], `${testCase.id} score ${result.overall_score} is outside expected range.`);
    assert.equal(result.verdict_check.valid, true, `${testCase.id} verdict must respect gates.`);
    if (testCase.deal_breaker) assert.equal(result.verdict_ceiling, testCase.deal_breaker.verdict_ceiling, `${testCase.id} must apply its deal-breaker ceiling.`);
    if (testCase.expected_max_coverage) assert.ok(result.evidence_coverage <= testCase.expected_max_coverage, `${testCase.id} coverage must remain low.`);
    console.log(`PASS ${testCase.id}: score=${result.overall_score}, confidence=${result.confidence}, coverage=${result.evidence_coverage}, ceiling=${result.verdict_ceiling}`);
  }
}

/**
 * Runs arithmetic and methodological regression tests.
 * @returns {void}
 * @example
 * runRegressionTests();
 */
function runRegressionTests() {
  const financial = calculateScenario({ customers: 10, monthly_arpu: 100, variable_costs: 200, fixed_costs: 300, acquisition_spend: 500, new_customers: 5, monthly_churn_rate: 0.05, founder_hours: 25 });
  assert.equal(financial.monthly_revenue, 1000);
  assert.equal(financial.gross_profit, 800);
  assert.equal(financial.operating_profit, 500);
  assert.equal(financial.gross_margin_pct, 80);
  assert.equal(financial.cac, 100);
  assert.equal(financial.ltv, 1600);
  assert.equal(financial.ltv_cac, 16);
  assert.equal(financial.return_per_founder_hour, 20);

  const negativeHighConfidence = calculateAssessment(createAssessment(cases.find((item) => item.id === "excellent-tech-no-market")));
  assert.ok(negativeHighConfidence.overall_score < 40 && negativeHighConfidence.confidence > 80, "Confidence must measure certainty, not optimism.");

  const unknownAssessment = createAssessment(cases.find((item) => item.id === "insufficient-information"));
  const unknownResult = calculateAssessment(unknownAssessment);
  assert.ok(unknownResult.overall_score > 50, "Unknown dimensions must not be silently scored as zero or 50.");
  assert.ok(unknownResult.evidence_coverage < 50, "Unknown dimensions must reduce evidence coverage.");
  assert.notEqual(unknownResult.verdict_ceiling, "BUILD", "Low coverage must block BUILD.");

  const invalidWeights = createAssessment(cases[0]);
  invalidWeights.dimensions.problem.weight += 1;
  assert.ok(validateAssessment(invalidWeights).some((error) => error.includes("sum to 100")), "Invalid weights must fail validation.");

  const missingField = createAssessment(cases[0]);
  delete missingField.decision_frame.decision;
  assert.ok(validateAssessment(missingField).some((error) => error.includes("decision_frame.decision")), "Missing decision frame must fail validation.");

  const missingEvidenceReference = createAssessment(cases[0]);
  missingEvidenceReference.dimensions.problem.evidence_ids = ["S99"];
  assert.ok(validateCompleteness(missingEvidenceReference).some((error) => error.includes("missing evidence S99")), "Dangling evidence references must fail completeness validation.");

  const nullScenario = calculateScenario({ customers: 10, monthly_arpu: 100 });
  assert.equal(nullScenario.monthly_revenue, 1000);
  assert.equal(nullScenario.gross_profit, null, "Missing costs must remain unknown.");
  assert.equal(nullScenario.ltv, null, "Missing churn must not create LTV.");
}

runFixtureTests();
runRegressionTests();
for (const [profileName, profile] of Object.entries(profiles)) {
  const total = Object.values(profile).reduce((sum, value) => sum + value, 0);
  assert.equal(total, 100, `${profileName} profile weights must sum to 100.`);
  for (const id of dimensionIds) assert.equal(typeof profile[id], "number", `${profileName} must define ${id}.`);
}
console.log("All product viability tests passed.");
