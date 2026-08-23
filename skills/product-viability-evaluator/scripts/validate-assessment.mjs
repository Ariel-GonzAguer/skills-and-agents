#!/usr/bin/env node

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAssessment, calculateAssessment } from "./calculate-score.mjs";

/**
 * Validates cross-field completeness beyond arithmetic requirements.
 * @param {object} assessment Assessment object.
 * @returns {string[]} Validation errors.
 * @example
 * validateCompleteness(assessment);
 */
export function validateCompleteness(assessment) {
  const errors = validateAssessment(assessment);
  const evidenceIds = new Set((assessment.evidence ?? []).map((item) => item.id));

  if (!Array.isArray(assessment.evidence) || assessment.evidence.length === 0) {
    errors.push("Evidence ledger must contain at least one item.");
  }
  for (const [id, dimension] of Object.entries(assessment.dimensions ?? {})) {
    for (const evidenceId of dimension.evidence_ids ?? []) {
      if (!evidenceIds.has(evidenceId)) errors.push(`dimensions.${id} references missing evidence ${evidenceId}.`);
    }
    if (!Array.isArray(dimension.positive_factors) || !Array.isArray(dimension.negative_factors)) {
      errors.push(`dimensions.${id} requires positive_factors and negative_factors arrays.`);
    }
    if (!dimension.rationale?.trim()) errors.push(`dimensions.${id}.rationale is required.`);
  }

  for (const scenarioName of ["pessimistic", "base", "optimistic"]) {
    if (assessment.financial_scenarios && !assessment.financial_scenarios[scenarioName]) {
      errors.push(`financial_scenarios.${scenarioName} is required when scenarios are supplied.`);
    }
  }

  for (const [index, experiment] of (assessment.experiments ?? []).entries()) {
    for (const field of ["hypothesis", "method", "success_threshold", "failure_threshold", "decision_changed"]) {
      if (!experiment[field]?.toString().trim()) errors.push(`experiments[${index}].${field} is required.`);
    }
  }
  return [...new Set(errors)];
}

/**
 * Runs the assessment validation command-line interface.
 * @returns {void}
 * @example
 * // node validate-assessment.mjs assessment.json
 */
function runCli() {
  const inputPath = process.argv[2];
  if (!inputPath) {
    console.error("Usage: node validate-assessment.mjs <assessment.json>");
    process.exitCode = 1;
    return;
  }
  try {
    const assessment = JSON.parse(fs.readFileSync(path.resolve(inputPath), "utf8"));
    const errors = validateCompleteness(assessment);
    if (errors.length) {
      console.error(`Assessment validation failed:\n- ${errors.join("\n- ")}`);
      process.exitCode = 1;
      return;
    }
    const result = calculateAssessment(assessment);
    console.log(`Assessment is valid. Score ${result.overall_score}, confidence ${result.confidence}, coverage ${result.evidence_coverage}, ceiling ${result.verdict_ceiling}.`);
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}

const isMain = process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1]);
if (isMain) runCli();
