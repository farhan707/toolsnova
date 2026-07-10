# ToolsNova Engineering System

## ⚠️ Mandatory

Every AI assistant working on this repository MUST read this directory before modifying any production code.

The `/engineering` directory is the official Engineering System for ToolsNova.

These documents define how every page should be researched, engineered, reviewed, and maintained.

Do not modify production code until you understand the Engineering System.

---

# Purpose

The Engineering System exists to build reusable quality rather than isolated improvements.
The Engineering System exists to ensure every ToolsNova page is:

- Helpful for users
- Technically correct
- Accessible
- AI-readable
- Search-friendly
- Maintainable
- Consistent with the ToolsNova design system

Our goal is not simply to rank.

Our goal is to build pages that deserve to rank.

---

# Engineering Workflow

Follow this workflow for every implementation.

## Step 1

Read this README.

## Step 2

Read:

MASTER_ENGINEERING_PROMPT.md

## Step 3

Read every applicable engineering standard inside:

engineering/standards/

## Step 4

Read the relevant page specification inside:

engineering/pages/

## Step 5

Read any applicable template inside:

engineering/templates/

## Step 6

Analyze the existing implementation.

## Step 7

Research the market.

## Step 8

Create an implementation plan.

## Step 9

Implement.

## Step 10

Run QA.

## Step 11

Return the result as a GitHub Pull Request.

---

# Engineering Document Priority

If two documents conflict, use this priority order.

1. engineering/pages/
2. MASTER_ENGINEERING_PROMPT.md
3. engineering/standards/
4. engineering/templates/

---

# Directory Structure

engineering/

├── README.md

Repository entry point.

├── MASTER_ENGINEERING_PROMPT.md

Global engineering philosophy.

├── standards/

Engineering standards.

├── templates/

Reusable page templates.

├── pages/

Page specifications.

├── review/

Pull Request templates.

---

# Important Rules

Never redesign the website without instruction.

Never remove working functionality.

Never reduce accessibility.

Never introduce unnecessary dependencies.

Never optimise only for search engines.

Always prioritise user value.

Always preserve the existing design language.

---

# Conversation Behaviour

When starting a new conversation:

1. Read the Engineering System.
2. Summarize your understanding.
3. Wait for approval before implementation.

During the same conversation:

- Treat the Engineering System as the source of truth.
- Do not reread engineering documents unless:
  - the Engineering System has changed,
  - a required document has not yet been read,
  - you are explicitly instructed to reload it,
  - or you determine that the current context is no longer sufficient.

When reloading is necessary, reload only the documents relevant to the current task whenever practical rather than the entire Engineering System.
---

# Continuous Improvement

Every completed implementation should also improve the Engineering System.

After every sprint recommend:

- New engineering standards
- Improvements to existing standards
- Improvements to reusable templates
- New reusable components
- Site-wide improvements

Do not modify the Engineering System automatically.

Instead recommend changes for review.