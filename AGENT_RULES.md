# AGENT_RULES.md — How to work within free AI quota

Give this file to Cline (or any agent) at the start of every session, alongside
PROJECT_CONTEXT.md. Its purpose: make each AI request do the work of many, so
the free Gemini quota lasts through a full session instead of dying after 15-20
calls.

---

## 1. The core principle

Every time the agent is tempted to send a small "just checking" prompt to the
model, it should instead batch that check into the next real request, or
answer it from a local script's output — not a new model call.

**Rule of thumb: one model call per *decision*, not per *action*.**

A decision is something that genuinely needs reasoning (e.g. "why did this
build fail and what's the fix"). An action is something deterministic
(checking a version number, listing files, running a build). Actions should
never cost a model call on their own.

---

## 2. Never do this (burns quota fast)

- Asking the model to check tool versions one at a time (Node, then Rust,
  then Cargo, then FFmpeg — that's 4 calls where 1 script + 1 read is enough)
- Re-explaining full project context every message instead of pointing to
  files already in the repo
- Retrying a failed request immediately after a rate-limit error
- Running multiple Cline sessions/tabs in parallel against the same API key
- Asking the model to "just double check" something it already confirmed

## 3. Always do this instead

- **Write one diagnostic script** (`scripts/diagnose.sh` or `.py`) that checks
  everything at once and prints a clean PASS/FAIL report. The agent reads that
  file's output in a single pass — zero model calls needed for the checking
  itself, only for *interpreting* a failure if one shows up.
- **Batch instructions.** Instead of sending Cline five small messages, send
  one message describing the whole task end-to-end with clear stop
  conditions (as in your existing plan's escalation rule).
- **Let deterministic tools do deterministic work.** Builds, installs, git
  operations, and tests should run via scripts and CI — not be narrated
  step-by-step by the model.
- **On a 429 error, wait, don't retry immediately.** Exponential backoff:
  wait ~15s, then 30s, then 60s if it happens again. Hammering retries just
  burns through the same short RPM window.
- **If the daily cap is hit (not just per-minute), stop for the day** — don't
  try workarounds like spinning up a second project/key to dodge it; that's
  against Google's terms and not worth the risk for a hobby project.

## 4. Session structure that conserves quota

At the start of each work session, the agent should:

1. Read `PROJECT_CONTEXT.md`, `AGENT_RULES.md` (this file), and the current
   task file only — not the entire project history.
2. Run the diagnostic script once, silently, before asking anything.
3. Do all deterministic work (installs, file edits it's confident about,
   running builds) without narrating each step back to the model.
4. Only call the model when it hits something it can't resolve
   deterministically — a real error to diagnose, or a design decision.
5. Batch multiple small fixes into one commit/one report back to you, instead
   of a call-per-fix.

## 5. Fallback when the quota is genuinely exhausted for the day

- Switch to a lighter/higher-limit model for routine tasks (e.g. a Lite
  variant) and reserve the stronger model for genuinely hard reasoning.
- Let GitHub Actions keep running (it doesn't need the model at all — it's
  deterministic CI). You can check on progress without touching Cline.
- If you're mid-task and hit a wall, just stop and resume tomorrow. Nothing
  is lost — the repo is the memory, not the chat session.

## 6. What "sustainable" looks like in practice

You are not trying to squeeze infinite free requests out of Google. You're
trying to make sure the 15-20 (or whatever today's real number is) requests
you get *before* a pause each accomplish as much as possible. A single
well-scoped Cline task ("install Rust, create the workflow file, commit, push,
self-heal per the escalation rule") should ideally complete in a handful of
model calls, not dozens — because the actual installing/building/testing
happens in scripts and CI, not in back-and-forth chat.
