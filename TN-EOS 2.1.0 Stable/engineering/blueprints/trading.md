---
document:
  id: TN-BLUEPRINT-TRADING-001
  name: Trading Blueprint
  version: 0.4.0
  status: Stable
  owner: TN-EOS
  purpose: Extend the Calculator Blueprint for trading calculators.
compatible_with:
  tn_eos: ">=2.1.0"
---

inherits:
  - calculator.md

family:
  trading

---

# Trading Blueprint

## Purpose

Extend the Calculator Blueprint with trading-specific architecture and engineering requirements.

This blueprint inherits all common calculator behavior.

Only trading-specific extensions are defined here.

---

# Additional Sections

Trading calculators may additionally include:

- Trading Concepts
- Risk Explanation
- Market Context (when appropriate)

These sections should educate users without predicting market direction.

---

# Trading-Specific Validation

Whenever applicable, trading calculators should validate scenarios that are mathematically correct but practically unsafe.

Examples include:

✓ Unrealistic leverage

✓ Near-zero stop-loss distance

✓ Impossible position sizes

✓ Excessive account risk

✓ Unrealistic account growth projections

Business validation should protect users beyond mathematical correctness.

---

# Trading Workflow

Whenever appropriate, trading pages should support the natural trading workflow.

Examples:

Market Analysis

↓

Trade Planning

↓

Risk Management

↓

Position Sizing

↓

Trade Evaluation

Workflow guidance should help users complete trading tasks rather than simply navigate between pages.

---

# Trading Requirements

Every trading calculator should:

✓ Use realistic market terminology

✓ Explain trading-specific concepts

✓ Encourage responsible risk management

✓ Remain educational and neutral

Never imply:

- Guaranteed profit

- Winning strategies

- Market predictions

- Risk-free trading

---

# Completion

A Trading Blueprint is satisfied when the calculator:

✓ Inherits the Calculator Blueprint

✓ Applies Trading Domain rules

✓ Includes only trading-specific extensions

✓ Maintains educational neutrality

✓ Supports responsible trading decisions