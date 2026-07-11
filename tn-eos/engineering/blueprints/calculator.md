---
document:
  id: TN-BLUEPRINT-CALCULATOR-001
  name: Calculator Blueprint
  version: 0.3.0
  status: Stable
  owner: TN-EOS
  purpose: Define the standard architecture for calculator pages.
compatible_with:
  tn_eos: ">=0.2.0"
---

# Calculator Blueprint

## Purpose

Provide a consistent engineering structure for all calculator pages.

Every calculator should follow the same high-level architecture while allowing domain-specific customization.

---

# Required Sections

1. Hero
2. Calculator
3. Quick Answer
4. Explanation
5. Formula (if applicable)
6. Examples
7. FAQ
8. References
9. Related Tools

---

# Calculator Requirements

Every calculator must:

✓ Accept valid user input

✓ Validate incorrect input

✓ Display clear output

✓ Handle edge cases

✓ Preserve calculation accuracy

---

# Content Requirements

Every page should explain:

- What the calculator does
- When to use it
- How the calculation works
- Common mistakes

---

# UX Requirements

The calculator should remain above the fold whenever practical.

Results should update clearly.

Error messages should be understandable.

---

# Completion

A calculator blueprint is satisfied when every calculator follows this architecture while allowing family-specific extensions.