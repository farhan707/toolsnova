# TN-EOS

**ToolsNova Engineering Operating System**

TN-EOS is a repository-driven engineering framework for building, maintaining, and evolving high-quality ToolsNova pages using a structured engineering workflow.

The system separates engineering knowledge into independent layers so that standards, architecture, execution, and page specifications remain modular and reusable.

---

# Current Version

**TN-EOS 2.1.0**

Status: **Stable**

---

# Engineering Philosophy

Before making changes, read:

1. `MASTER.md`
2. `ARCHITECTURE.md`
3. `MANIFEST.yaml`

These documents define the engineering philosophy, system architecture, and repository bootstrap process.

---

# Architecture

TN-EOS is organized into layered responsibilities.

```
MASTER
      ↓
ARCHITECTURE
      ↓
MANIFEST
      ↓
RULES
      ↓
DOMAINS
      ↓
BLUEPRINTS
      ↓
FAMILIES
      ↓
SPECIFICATIONS
      ↓
TASKS
      ↓
IMPLEMENTATION
```

Each layer owns a single responsibility.

Lower layers may depend on higher layers.

Higher layers must never depend on lower layers.

---

# Repository Structure

```
engineering/

├── MASTER.md
├── ARCHITECTURE.md
├── MANIFEST.yaml
├── CHANGELOG.md
│
├── rules/
├── blueprints/
├── families/
├── specs/
├── tasks/
└── reports/
```

---

# Engineering Workflow

Every engineering task follows the same workflow.

```
Discovery

↓

Implementation

↓

Self Verification

↓

QA

↓

Remediation (if required)

↓

Delivery
```

Do not skip engineering stages.

---

# Building a New Page

Typical workflow:

1. Resolve the Family.
2. Load the Blueprint.
3. Apply Engineering Rules.
4. Open the Page Specification.
5. Execute the Task workflow.
6. Deliver verified engineering artifacts.

---

# Family Selection

Choose the appropriate family before implementation.

Examples:

- Trading
- Financial
- Converter
- Developer

Each family automatically determines:

- Blueprint
- Domain Rules
- Engineering Rules
- Workflow

---

# Engineering Principles

TN-EOS prioritizes:

- User-first engineering
- Maintainability
- Deterministic behavior
- Transparent calculations
- Educational value
- Search quality
- Reusable architecture

---

# Documentation

| Document | Responsibility |
|----------|----------------|
| MASTER | Engineering philosophy |
| ARCHITECTURE | System organization |
| MANIFEST | Repository bootstrap |
| Rules | Engineering standards |
| Blueprints | Reusable page architecture |
| Families | Engineering configuration |
| Specifications | Page contracts |
| Tasks | Engineering workflow |

---

# Versioning

Architecture evolves only when production experience identifies a genuine engineering gap.

Avoid modifying TN-EOS based on assumptions.

Production evidence should drive future versions.

---

# License

Internal engineering framework for ToolsNova.