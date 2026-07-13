# TN-EOS Architecture

TN-EOS is organized into layered responsibilities.

Each layer owns one responsibility and builds upon the layer above it.

Knowledge flows downward.

Lower layers may depend on higher layers.

Higher layers must never depend on lower layers.

---

## Layer 1 — Constitution

MASTER.md

Defines the engineering philosophy.

Answers:

Why do we engineer software this way?

Contains principles only.

Never contains implementation details.

---

## Layer 2 — Rules

engineering/rules/

Defines engineering standards.

Examples:

- Validation
- Search
- Content
- Quality Gate
- Domain Rules

Rules define HOW engineering should be performed.

Rules never describe individual pages.

---

## Layer 3 — Blueprints

engineering/blueprints/

Defines reusable page architectures.

Examples:

- Calculator
- Converter
- Trading

Blueprints describe the structure of a page type.

Blueprints never contain page-specific requirements.

---

## Layer 4 — Families

engineering/families/

Defines product families.

A family selects:

- Blueprint
- Domain Rules
- Engineering Rules

Examples:

Trading

Developer

Utilities

Families configure reusable engineering assets.

---

## Layer 5 — Specifications

engineering/specs/

Defines page-specific requirements.

Examples:

- Fibonacci Calculator
- Margin Calculator
- JSON Formatter

Specifications describe only what makes a page unique.

Generic engineering rules belong elsewhere.

---

## Layer 6 — Tasks

engineering/tasks/

Defines the engineering workflow.

Discovery

↓

Implementation

↓

QA

↓

Delivery

Tasks define the engineering process.

They never define product requirements.

---

## Layer 7 — Tickets

engineering/tickets/

Represents individual engineering work.

Tickets reference:

- Specifications
- Families
- Blueprints
- Rules

Tickets never redefine engineering standards.

---

# Information Flow

Constitution

↓

Rules

↓

Blueprints

↓

Families

↓

Specifications

↓

Tasks

↓

Tickets

Engineering knowledge flows downward through the architecture.

Each layer has a single responsibility.
