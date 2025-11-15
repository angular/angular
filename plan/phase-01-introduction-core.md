# Phase 1: Introduction - Core Concepts (Critical Priority)

## 📋 Phase Information
- **Total Files**: 5
- **Estimated Words**: ~3,000
- **Priority**: 🔴 Critical
- **Status**: Not Started

## 🤖 Translation Agent
Use the translation agent: `.claude/agents/translate-to-pt-br.md`

## 📖 Translation Instructions

### Before You Start
1. Read the translation agent guidelines in `.claude/agents/translate-to-pt-br.md`
2. Understand the technical terms to keep in English vs translate to Portuguese
3. Remember: **EVERY translated file MUST start with `<!-- ia-translate: true -->`**

### For Each File
1. **Read** the original English file
2. **Translate** using the agent guidelines
3. **Add** `<!-- ia-translate: true -->` as the FIRST line
4. **Verify**:
   - [ ] First line is `<!-- ia-translate: true -->`
   - [ ] Code blocks unchanged
   - [ ] Technical jargon follows guidelines
   - [ ] Links and formatting intact
   - [ ] Portuguese flows naturally
5. **Save** the translated file
6. **Commit** with message: `docs(pt-br): translate [filename]`
7. **Push** to branch
8. **Mark** the file as complete below with [✅]

### Git Commands for Each File
```bash
# After translating a file
git add adev/src/content/[path-to-file]
git commit -m "docs(pt-br): translate [filename] to Brazilian Portuguese"
git push origin claude/create-translation-plan-01XgFntJfGVpnv8kDnf3eggF
```

## ✅ Files to Translate

### File 1 of 5
- [ ] `adev/src/content/introduction/what-is-angular.md`
  - **Description**: Main introduction to Angular
  - **Estimated Words**: ~800
  - **Key Terms**: Angular, framework, web applications
  - **Status**: Not Started
  - **Commit**: `docs(pt-br): translate what-is-angular to Brazilian Portuguese`

---

### File 2 of 5
- [ ] `adev/src/content/introduction/installation.md`
  - **Description**: Installation guide
  - **Estimated Words**: ~600
  - **Key Terms**: npm, CLI, Node.js, installation
  - **Status**: Not Started
  - **Commit**: `docs(pt-br): translate installation to Brazilian Portuguese`

---

### File 3 of 5
- [ ] `adev/src/content/introduction/essentials/overview.md`
  - **Description**: Overview of Angular essentials
  - **Estimated Words**: ~700
  - **Key Terms**: components, templates, dependency injection
  - **Status**: Not Started
  - **Commit**: `docs(pt-br): translate essentials/overview to Brazilian Portuguese`

---

### File 4 of 5
- [ ] `adev/src/content/introduction/essentials/components.md`
  - **Description**: Introduction to components
  - **Estimated Words**: ~600
  - **Key Terms**: component, decorator, class, template
  - **Status**: Not Started
  - **Commit**: `docs(pt-br): translate essentials/components to Brazilian Portuguese`

---

### File 5 of 5
- [ ] `adev/src/content/introduction/essentials/templates.md`
  - **Description**: Introduction to templates
  - **Estimated Words**: ~300
  - **Key Terms**: template, binding, interpolation
  - **Status**: Not Started
  - **Commit**: `docs(pt-br): translate essentials/templates to Brazilian Portuguese`

---

## 📊 Phase Progress
- **Completed**: 0/5 (0%)
- **In Progress**: 0/5
- **Not Started**: 5/5

## ✅ Phase Completion Checklist
Once all files are translated, verify:
- [ ] All 5 files contain `<!-- ia-translate: true -->` as first line
- [ ] All files committed and pushed
- [ ] All checkboxes above marked as complete [✅]
- [ ] Spot-check 2 files for quality
- [ ] Technical terms are consistent across all files
- [ ] All code blocks remain in English
- [ ] All links work correctly

## 🎯 Next Phase
After completing this phase, proceed to:
- **Phase 2**: `plan/phase-02-introduction-advanced.md`

---

**Last Updated**: 2025-11-15
**Phase Status**: Ready to Start
