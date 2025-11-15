# Angular Documentation Translation Plans

This folder contains the complete translation plan for translating all Angular documentation to Brazilian Portuguese (pt-BR).

## 📚 Overview

- **Total Files to Translate**: 339 markdown files (337 docs + 2 READMEs)
- **Total Estimated Words**: ~275,000 words
- **Translation Phases**: 31 phases (Phase 0-30)
- **Translation Agent**: [.claude/agents/translate-to-pt-br.md](../.claude/agents/translate-to-pt-br.md)

## 🎯 Getting Started

### Step 1: Read the Translation Agent Guide
Before starting any translation, familiarize yourself with the translation guidelines:
- **File**: [.claude/agents/translate-to-pt-br.md](../.claude/agents/translate-to-pt-br.md)
- **Key Requirement**: Every translated file MUST start with `<!-- ia-translate: true -->`
- **Important**: Learn which technical terms to keep in English vs translate to Portuguese

### Step 2: Choose a Phase to Work On
Start with **Phase 0** (most important!) or choose any phase based on priority:

#### 🌟 **PHASE 0** (Repository Docs) - DO THIS FIRST! ⭐
The most visible files - what people see when they visit the repo:
0. **[Phase 0: Repository README & Docs](phase-00-repository-docs.md) - 2 files** ⭐ **START HERE FIRST!**

#### 🔴 **Critical Priority** (Phases 1-8) - Documentation Introduction & Tutorials
Best for beginners and essential for users getting started with Angular:
1. [Phase 1: Introduction - Core Concepts](phase-01-introduction-core.md) - 5 files
2. [Phase 2: Introduction - Advanced Essentials](phase-02-introduction-advanced.md) - 4 files
3. [Phase 3: Tutorials - Learn Angular 1-5](phase-03-tutorials-learn-angular-1.md) - 10 files
4. [Phase 4: Tutorials - Learn Angular 8-15](phase-04-tutorials-learn-angular-2.md) - 10 files
5. [Phase 5: Tutorials - Learn Angular 18-25](phase-05-tutorials-learn-angular-3.md) - 10 files
6. [Phase 6: Tutorials - First App 1-10](phase-06-tutorials-first-app-1.md) - 10 files
7. [Phase 7: Tutorials - First App & Signals](phase-07-tutorials-first-app-signals.md) - 10 files
8. [Phase 8: Tutorials - Signals & Deferrable Views](phase-08-tutorials-signals-deferrable.md) - 8 files

#### 🟡 **High Priority** (Phases 9-20) - Guide Documentation
Core Angular concepts and features:
- Phases 9-20: [See full list in translation-plan.md](translation-plan.md#high-priority-phases-9-20---guide-documentation)

#### 🟢 **Medium Priority** (Phases 21-30) - Reference & Tools
API reference, error messages, CLI, and ecosystem:
- Phases 21-30: [See full list in translation-plan.md](translation-plan.md#medium-priority-phases-21-30---reference-tools--ecosystem)

### Step 3: Translate Files in Your Chosen Phase

For each file:

1. **Read** the original English file in `adev/src/content/`
2. **Translate** following the agent guidelines
3. **Add marker** `<!-- ia-translate: true -->` as the FIRST line
4. **Verify** your translation:
   - [ ] Marker is first line
   - [ ] Code blocks unchanged
   - [ ] Technical jargon follows guidelines
   - [ ] Links intact
   - [ ] Portuguese flows naturally
5. **Save** the translated file
6. **Commit & Push**:
   ```bash
   git add adev/src/content/[path-to-file]
   git commit -m "docs(pt-br): translate [filename] to Brazilian Portuguese"
   git push origin claude/create-translation-plan-01XgFntJfGVpnv8kDnf3eggF
   ```
7. **Mark complete** by changing `- [ ]` to `- [✅]` in the phase plan file

### Step 4: Track Your Progress

Each phase file has:
- Individual checkboxes for each file
- Progress counter (e.g., "0/10 (0%)")
- Phase completion checklist

Update the checkboxes as you complete files!

## 📁 Files in This Folder

- **[translation-plan.md](translation-plan.md)**: Master plan with overview and summary of all phases
- **[README.md](README.md)**: This file - your guide to the translation process
- **phase-01-*.md through phase-30-*.md**: Individual phase plans with file-by-file checklists

## 🔑 Key Translation Rules

### ✅ DO:
- Add `<!-- ia-translate: true -->` as the FIRST line of EVERY file
- Keep technical jargon in English (component, service, directive, etc.)
- Translate explanatory text to natural Brazilian Portuguese
- Preserve all code blocks exactly as they are
- Maintain all links and markdown formatting
- Use "você" (informal) instead of formal pronouns
- Commit and push after each file translation

### ❌ DON'T:
- Translate code examples
- Translate technical terms commonly used in English by Brazilian developers
- Skip the `<!-- ia-translate: true -->` marker
- Batch multiple files in one commit
- Change file structure or paths

## 📊 Progress Tracking

You can track overall progress in [translation-plan.md](translation-plan.md):

| Category | Files | Progress |
|----------|-------|----------|
| Introduction | 9 | 0% |
| Tutorials | 58 | 0% |
| Guide | 129 | 0% |
| Reference | 86 | 0% |
| Tools | 23 | 0% |
| Ecosystem | 13 | 0% |
| Best Practices | 9 | 0% |
| AI | 4 | 0% |
| Other | 6 | 0% |

## 💡 Tips for Success

1. **Start Small**: Begin with Phase 1 (only 5 files) to get comfortable
2. **Use the Agent**: Always refer to `.claude/agents/translate-to-pt-br.md`
3. **One File at a Time**: Complete, commit, and push each file individually
4. **Check the Marker**: Never forget `<!-- ia-translate: true -->` as the first line!
5. **Natural Portuguese**: Make sure the text sounds natural to Brazilian developers
6. **Ask for Help**: If unsure about a term, check existing translations or ask the community

## 🤝 Contributing

When translating:
1. Choose a phase that hasn't been started
2. Mark files as you complete them in the phase plan
3. Follow the commit message format: `docs(pt-br): translate [filename] to Brazilian Portuguese`
4. Push after each file to track progress

## 📝 Example Workflow

```bash
# 1. Read the translation agent
cat .claude/agents/translate-to-pt-br.md

# 2. Open a phase plan
cat plan/phase-01-introduction-core.md

# 3. Translate first file
# Edit: adev/src/content/introduction/what-is-angular.md
# Add: <!-- ia-translate: true --> as first line
# Translate content following agent guidelines

# 4. Commit and push
git add adev/src/content/introduction/what-is-angular.md
git commit -m "docs(pt-br): translate what-is-angular to Brazilian Portuguese"
git push origin claude/create-translation-plan-01XgFntJfGVpnv8kDnf3eggF

# 5. Update phase plan
# Change [ ] to [✅] for completed file in plan/phase-01-introduction-core.md
git add plan/phase-01-introduction-core.md
git commit -m "docs: update phase 1 progress"
git push origin claude/create-translation-plan-01XgFntJfGVpnv8kDnf3eggF
```

## 🎉 Ready to Start?

**IMPORTANT**: Begin with **[Phase 0: Repository README & Docs](phase-00-repository-docs.md)** ⭐

This translates the main README.md that everyone sees first when visiting the repository!

After Phase 0, continue to **[Phase 1: Introduction - Core Concepts](phase-01-introduction-core.md)**

Good luck with your translation! 🇧🇷

---

**Last Updated**: 2025-11-15
**Status**: Ready to Begin
