# MASTER PLAN — Quota-Optimized Execution Strategy

## The core problem this solves
Cline's Gemini API quota keeps hitting daily caps (RPD) because every small
question — "check this," "what does this mean," "try again" — costs a
request. This plan minimizes total API requests while maximizing what each
one accomplishes.

## The three-role system

### Role 1: STRATEGIST (DeepSeek / ChatGPT / Gemini-web / Claude.ai — free
chat interfaces, NOT the API)
- Writes and fixes code, given a specific task + real file content
- Unlimited rotation — when one session's context fills up or hits a
  message cap, start a fresh session with CORE_CONTEXT.md
- Zero connection to Cline's API quota — completely separate pool
- Cannot execute anything or see your repo directly — everything is
  copy-paste in/out

### Role 2: HANDS (Cline, using Gemini API — the limited resource)
- Only used for: reading real files Cline hasn't seen, running commands
  (install, build, test), applying multi-file changes at once, diagnosing
  live error output
- NEVER used for: drafting code from scratch (that's the Strategist's job),
  open-ended "continue" or "check on it" messages, repeated small checks
- Every message to Cline should be ONE complete, specific, bounded
  instruction — ideally with the actual code already written and just
  needing to be applied + committed + pushed

### Role 3: JUDGE (GitHub Actions)
- Free, unlimited (if repo is public), runs the real Windows build
- The only source of truth for "does this actually work" — not Cline's
  self-reported score, not the Strategist's confidence
- Runs unattended once triggered by a push — no AI, no laptop needed

## The exact loop for every fix, going forward

```
1. Error appears in Actions log
   → Copy exact error text (free, no AI needed)
   → Copy current content of the relevant file from GitHub (free)

2. Open CORE_CONTEXT.md, fill in "CURRENT TASK" with error + file content
   → Paste into a fresh Strategist chat session
   → Get back the fixed code

3. Decide: single file or multiple files?
   → SINGLE FILE: paste directly into GitHub web editor, commit.
     Zero Cline requests used.
   → MULTIPLE FILES: send ONE Cline message containing all the finished
     code blocks, labeled by filename, with instruction: "apply these
     exact changes to these files, commit, push." One request, not five.

4. Wait for Actions to build (~15-20 min, unattended)

5. Check result yourself — green means done, red means back to step 1
   with the new error
```

## Quota math — why this works
- Old pattern: Cline explores, guesses, tries, fails, explores again =
  5-15 API requests per single bug fix
- New pattern: 0 API requests for drafting (done by Strategist) + 1 API
  request to apply + push = massive reduction
- At 15 RPM / 500 RPD (gemini-3.1-flash-lite currently), this comfortably
  covers many fix-cycles per day, since each cycle now costs ~1 request
  instead of ~10

## When you genuinely still need Cline to "think"
Not everything can be pre-drafted blind. Cline still needs to:
- Read a file none of us have seen yet, to report its real content back
  (1 request)
- Diagnose an error that depends on live system state, not just code
  (1 request)
These are legitimate, unavoidable uses — the goal isn't zero Cline usage,
it's zero WASTED Cline usage.

## House rules (apply to every AI in every role)
1. One task at a time — never bundle unrelated fixes in one exchange
2. Full files, never partial diffs, when output is code
3. No claiming something works without real evidence (Actions log,
   screenshot, actual app launch) — self-reported scores are not proof
4. If uncertain, say so — a flagged uncertainty costs nothing; a
   confidently wrong fix costs a full 15-20 min build cycle
5. Repo stays public if possible (removes Actions build-minute limits
   entirely — check current repo visibility in Settings)
6. Don't create multiple accounts/API keys to multiply quota — against
   provider terms, risks losing access entirely mid-project

## What "done" looks like for THIS optimization effort
You can hit a build error, get it diagnosed and fixed, and pushed — using
1 Cline API request total, with all actual code thinking happening for
free in a rotating chat AI session guided by CORE_CONTEXT.md.
