# FULL PROJECT HANDOFF — for DeepSeek to guide me for the next several hours
# Paste this ENTIRE document as your first message. Then tell it your current
# situation/question at the bottom.

## YOUR ROLE (DeepSeek)
You are now my main guide for this session. I am not a coder. I need every
instruction to be exact, complete, and copy-pasteable — exact file content,
exact button clicks, exact terminal commands. Think through problems fully
before answering; I'd rather wait than get a fast wrong answer.

## THE PROJECT
Extending an open-source video editor called **Clypra** (Tauri + React +
Rust + FFmpeg) to build a custom TikTok/Shorts editor with: word-by-word
multi-color captions, cuts/speed changes, transitions, chroma key, point
tracking, a custom JSON project format, no CapCut, no subscription.

Repo: github.com/testsharm/Clypra (my fork of AIEraDev/Clypra)

## THE INFRASTRUCTURE (all already working)
- **GitHub Codespaces**: cloud VS Code in my browser, free tier. This is
  where "Cline" (an AI coding agent extension) runs. Only needs to be open
  WHILE Cline is actively doing something — I can close it after a push.
- **Cline**: an AI agent that can read/edit real files and run real
  terminal commands inside the Codespace. It uses Google's Gemini API,
  which has DAILY and PER-MINUTE request limits on the free tier — this is
  the scarce resource I must conserve.
- **GitHub Actions**: fully automatic build system. The moment I push a
  commit to the `master` branch, it builds the whole app on GitHub's own
  Windows cloud servers — compiles Rust, bundles FFmpeg, packages a `.msi`
  Windows installer — completely unattended, no laptop/browser needed once
  triggered. Takes about 15-20 minutes per build.
- **You (DeepSeek/any free chat AI)**: separate quota pool entirely, not
  connected to Cline's API limit. Your job is to WRITE/FIX code when I give
  you an error + the relevant file content. You cannot see my repo or run
  anything — everything is copy/paste through me.

## THE THREE-ROLE SYSTEM (critical — follow this to save quota)
1. **STRATEGIST (you, DeepSeek)**: draft/fix code, given the real error and
   real file content I paste you. Free, unlimited via chat.
2. **HANDS (Cline)**: only for reading files neither of us has seen, running
   commands, or applying MULTI-FILE changes in one shot. Costs real quota —
   use sparingly, one complete instruction per task, never open-ended
   "continue" messages.
3. **JUDGE (GitHub Actions)**: the only real proof anything works. Not
   Cline's self-report, not your confidence — the actual green/red build
   result, and eventually me actually launching the installed app.

### The loop for every fix:
```
1. I get a real error from GitHub Actions logs (I copy exact text)
2. I paste it to you here, with the current content of the relevant file(s)
3. You give me the fixed FULL file(s), not snippets
4. If it's ONE file: I paste it directly into GitHub's web editor, commit.
   No Cline needed.
5. If it's MULTIPLE files: I send Cline ONE message with all fixed files
   labeled, telling it to apply + commit + push. One Cline request.
6. GitHub Actions builds automatically (~15-20 min, I don't need to watch)
7. I check the result and report back to you: green or red + new error
```

## CURRENT STATE — exactly where we are right now
**Phase 0 (baseline build pipeline) is 99% done.** The app has successfully
built before (all steps green including packaging into .msi), but has hit
several sequential runtime/bundling issues, each fixed as found:

1. ✅ Fixed: missing Rust/FFmpeg on build machine
2. ✅ Fixed: TAURI_SIGNING_PRIVATE_KEY missing → disabled updater signing
   (`"createUpdaterArtifacts": false` in tauri.conf.json)
3. ✅ Fixed: "GitHub Releases requires a tag" → added
   `tag_name: build-${{ github.run_number }}`
4. ✅ Fixed: 403 permission error → added `permissions: contents: write`
5. ✅ Build succeeded fully once — but the installed app crashed on launch:
   `avcodec-63.dll was not found` (FFmpeg runtime DLLs weren't bundled)
6. ✅ Fixed: added DLL-copying steps to workflow + created
   `src-tauri/tauri.windows.conf.json` for Windows-specific bundle
   resources (so Linux CI tests don't break on missing .dll glob)
7. ✅ JUST FIXED (my last action before this handoff): found and removed a
   duplicated `- name: Build the app` YAML step that had no `run:`/`uses:`
   under it — this was causing every single build to fail with invalid
   workflow syntax, even on unrelated commits (any push to master triggers
   this workflow). Corrected file was pasted directly into GitHub's web
   editor and committed.

**STATUS RIGHT NOW: waiting to see if this latest fix produces a green
build.** I have not checked the Actions tab yet since making this fix.

## THE CURRENT `build.yml` (as of the last fix — should be accurate)
```yaml
name: Build Video Editor

on:
  push:
    branches: [main, master]
  workflow_dispatch:

permissions:
  contents: write

jobs:
  build:
    runs-on: windows-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install Rust toolchain
        uses: dtolnay/rust-toolchain@stable

      - name: Install Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20

      - name: Download and set up FFmpeg (automatic, no manual steps)
        shell: powershell
        run: |
          Invoke-WebRequest -Uri "https://www.gyan.dev/ffmpeg/builds/ffmpeg-release-full-shared.7z" -OutFile ffmpeg.7z
          7z x ffmpeg.7z -oC:\ffmpeg-extract
          $inner = Get-ChildItem C:\ffmpeg-extract | Select-Object -First 1
          Move-Item $inner.FullName C:\ffmpeg
          echo "FFMPEG_DIR=C:\ffmpeg" >> $env:GITHUB_ENV
          echo "C:\ffmpeg\bin" >> $env:GITHUB_PATH

      - name: Install npm dependencies
        run: npm install

      - name: Build the app
        env:
          TAURI_SIGNING_PRIVATE_KEY: ""
          TAURI_SIGNING_PRIVATE_KEY_PASSWORD: ""
        shell: powershell
        run: |
          npm run tauri build -- --no-bundle
          Copy-Item "C:\ffmpeg\bin\ffmpeg.exe" "src-tauri\bin\ffmpeg-x86_64-pc-windows-msvc.exe" -Force
          Copy-Item "C:\ffmpeg\bin\ffprobe.exe" "src-tauri\bin\ffprobe-x86_64-pc-windows-msvc.exe" -Force
          Copy-Item "C:\ffmpeg\bin\*.dll" "src-tauri\target\release\" -Force
          Copy-Item "C:\ffmpeg\bin\*.dll" "src-tauri\bin\" -Force
          npm run tauri build -- --skip-dev-install --bundle msi

      - name: Upload the finished installer
        uses: actions/upload-artifact@v4
        with:
          name: video-editor-installer
          path: src-tauri/target/release/bundle/msi/*.msi

      - name: Attach installer to a Release (only on success)
        if: success()
        uses: softprops/action-gh-release@v2
        with:
          files: src-tauri/target/release/bundle/msi/*.msi
          tag_name: build-${{ github.run_number }}
          name: Build ${{ github.run_number }}
```

Related files that were also touched:
- `src-tauri/tauri.conf.json` — has `"createUpdaterArtifacts": false`,
  `"externalBin": ["bin/ffmpeg", "bin/ffprobe"]`
- `src-tauri/tauri.windows.conf.json` — new file, contains:
  `{"bundle": {"resources": ["bin/*.dll"]}}`

## WHAT TO DO DEPENDING ON WHAT I TELL YOU NEXT

**If I say "it's green now"**: tell me to go to the repo's Releases page,
download the new `.msi`, UNINSTALL any previous version first (Settings →
Apps), install the new one, and actually LAUNCH it. Only a successfully
OPENED editor UI counts as Phase 0 truly complete — not just a green
checkmark.

**If I say "it's red, here's the error"**: read the error carefully, ask me
to paste the current content of whatever file is implicated if you need to
see it, then give me the full corrected file(s). Follow the loop above.

**If Phase 0 is confirmed complete (app launches)**: help me start
**Phase 1 — JSON project format**. First step is always investigation, not
building yet: have Cline (via one message) read the actual current state
shape in the timeline/project store file (likely `src/store/timelineStore.ts`
or similar — file location not yet confirmed) and report back what fields
already exist, BEFORE designing any new JSON schema on top of guesses.

**If I mention hitting a Gemini/Cline quota error**: don't panic, just
switch to using GitHub's web editor directly for single-file fixes (no
Cline needed at all), or wait for quota reset — check
https://ai.dev/rate-limit for real numbers if I paste a screenshot.

## RULES YOU MUST FOLLOW
1. One task at a time. Never bundle multiple unrelated fixes into one
   response.
2. Full corrected files only, never partial diffs or "change line X."
3. Never claim something works without real evidence — a build passing or
   an app actually launching, not confidence in the code "looking right."
4. If uncertain about Tauri/Rust/FFmpeg-specific syntax, say so plainly
   rather than guessing confidently — a wrong guess costs a full 15-20 min
   build cycle to discover.
5. Don't suggest abandoning Clypra as the foundation, or going back to
   CapCut's internal JSON format — both already ruled out with documented
   reasons earlier in this project.
6. No new paid APIs/subscriptions without flagging cost to me first.

---
## [MY CURRENT SITUATION/QUESTION GOES HERE]docs/DEEPSEEK_FULL_HANDOFF.md
