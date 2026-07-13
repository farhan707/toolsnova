---
document:
  id: TN-RULE-QUALITY-001
  name: Quality Gate Rules
  version: 0.3.0
  status: Stable
  owner: TN-EOS
  purpose: Define the minimum quality requirements before any engineering work is considered complete and ready for delivery.
compatible_with:
  tn_eos: ">=2.1.0"
---

# Quality Gate Rules

## Purpose

Ensure every implementation meets functional, technical, accessibility, content, and engineering quality standards before completion.

Engineering is complete only after successful verification.

Quality is not inspected into software.

Quality is engineered throughout the entire workflow.

---

# Core Principles

Quality is mandatory.

Verification protects users.

Never assume correctness.

Always verify.

Evidence is stronger than assumptions.

---

# Functional Verification

Confirm:

✓ Calculator produces correct results

✓ Inputs behave correctly

✓ Validation works

✓ Edge cases are handled

✓ Existing functionality is preserved

---

# User Experience

Confirm:

✓ Page is easy to understand

✓ Navigation is intuitive

✓ Results are clearly presented

✓ Error messages are helpful

✓ Educational content supports the tool

---

# Accessibility

Confirm:

✓ Semantic HTML

✓ Keyboard navigation

✓ Form labels

✓ Logical heading hierarchy

✓ Sufficient contrast

✓ Accessible interactive elements

---

# Responsive Design

Confirm:

✓ Mobile layout

✓ Tablet layout

✓ Desktop layout

✓ Tables remain usable

✓ No horizontal scrolling

---

# Technical Quality

Confirm:

✓ Valid HTML

✓ No JavaScript errors

✓ No broken CSS

✓ No unnecessary dependencies

✓ Existing behavior remains unchanged

---

# Search Quality

Confirm:

✓ Metadata is complete

✓ Structured data is valid

✓ Canonical URL exists

✓ Internal links work

✓ Related tools are relevant

---

# Content Quality

Confirm:

✓ Facts are accurate

✓ Examples are correct

✓ Formula is correct

✓ FAQs match the page

✓ References are trustworthy

✓ No placeholder content

---

# Performance

Confirm:

✓ No unnecessary JavaScript

✓ Assets are reused

✓ Page remains responsive

✓ No excessive network requests

---

# Regression

Confirm:

✓ Existing calculator logic unchanged

✓ Existing layout preserved

✓ Existing styles preserved

✓ Existing navigation works

---

# Self Verification

Before requesting QA, the implementer must independently verify the completed work.

Self verification should include:

✓ Functional testing

✓ Edge-case testing

✓ Validation review

✓ Business logic review

✓ UI consistency

✓ Search requirements

✓ Content accuracy

✓ Regression checks

Implementation should be corrected before entering QA whenever possible.

QA is independent verification, not first verification.

---

# Verification Evidence

Quality decisions should be supported by evidence whenever practical.

Examples include:

- Manual calculation verification
- HTML validation
- Structured data validation
- Edge-case testing
- Visual inspection
- Cross-browser testing
- Responsive testing

Verification should be reproducible whenever possible.

---

# Release Gates

Quality issues are classified as:

## Critical

Release is blocked.

Must be fixed before delivery.

---

## Major

Release is blocked unless explicitly approved.

Must include documented justification.

---

## Minor

Release may proceed when issues are documented and accepted.

---

No engineering work may bypass mandatory quality gates.

---

# Definition of Done

A task is complete only when:

✓ Functional verification passes

✓ UX verification passes

✓ Accessibility passes

✓ Responsive checks pass

✓ Technical checks pass

✓ Search checks pass

✓ Content checks pass

✓ Performance checks pass

✓ Regression checks pass

✓ Self verification completed

✓ Release gates satisfied

---

# Quality Gate Deliverable

Every QA phase should produce:

## Summary

Pass / Fail

---

## Functional

Results

---

## UX

Results

---

## Accessibility

Results

---

## Responsive

Results

---

## Technical

Results

---

## Search

Results

---

## Content

Results

---

## Performance

Results

---

## Regression

Results

---

## Outstanding Issues

Document every remaining issue.

Never hide known limitations.

Classify each issue as:

- Critical
- Major
- Minor

---

## Release Recommendation

One of the following outcomes must be provided:

✓ PASS

✓ PASS WITH MINOR ISSUES

✓ FAIL

The recommendation should include a brief justification.

---

# Completion

Quality Gate Rules are satisfied only when every applicable verification has passed or all remaining issues have been documented and the appropriate release gate has been satisfied.