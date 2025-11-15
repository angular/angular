# Phase 0: Repository Documentation (HIGHEST Priority - Start Here!)

## 📋 Phase Information
- **Total Files**: 2
- **Estimated Words**: ~600
- **Priority**: 🔴🔴🔴 CRITICAL - START HERE FIRST!
- **Status**: Not Started

## 🎯 Why Start Here?

These are the **first files** people see when they visit the repository! Translating these creates an immediate welcoming experience for Brazilian developers.

## 🤖 Translation Agent
Use the translation agent: `.claude/agents/translate-to-pt-br.md`

## 📖 Translation Instructions

### Before You Start
1. Read the translation agent guidelines in `.claude/agents/translate-to-pt-br.md`
2. Remember: **EVERY translated file MUST start with `<!-- ia-translate: true -->`**
3. Keep technical terms in English (Angular, TypeScript, CLI, npm, etc.)
4. Translate descriptions and explanatory text to Portuguese

### For Each File
1. **Read** the original English file
2. **Translate** using the agent guidelines
3. **Add** `<!-- ia-translate: true -->` as the FIRST line
4. **Verify**:
   - [ ] First line is `<!-- ia-translate: true -->`
   - [ ] Code blocks unchanged
   - [ ] Technical jargon follows guidelines
   - [ ] Links intact (keep links to external English docs)
   - [ ] Portuguese flows naturally
5. **Save** the translated file
6. **Commit** and **Push**
7. **Mark** the file as complete below with [✅]

### Git Commands for Each File
```bash
# After translating a file
git add [filename]
git commit -m "docs(pt-br): translate [filename] to Brazilian Portuguese

Co-authored-by: Ulisses, Mago do Flutter <ulisseshen@gmail.com>"
git push origin claude/create-translation-plan-01XgFntJfGVpnv8kDnf3eggF
```

**Note**: The blank line before "Co-authored-by" is required!

## ✅ Files to Translate

### File 1 of 2 - 🌟 REPOSITORY README
- [ ] `README.md` (root of repository)
  - **Description**: Main repository README - First impression for visitors
  - **Estimated Words**: ~500
  - **Key Sections**:
    - Angular platform description
    - Documentation links
    - Development setup
    - Quick start
    - Ecosystem
    - Contributing
    - Community links
  - **Key Terms to Keep in English**:
    - Angular, TypeScript, JavaScript, Node.js, npm, CLI
    - Components, Templates, Forms, API
    - Server Side Rendering, Schematics, Lazy Loading, Animations
  - **Translation Notes**:
    - Translate: "The modern web developer's platform" → "A plataforma do desenvolvedor web moderno"
    - Translate: "Get started" → "Começando"
    - Translate: "Contributing Guidelines" → "Diretrizes de Contribuição"
    - Keep links to external English documentation
  - **Status**: Not Started
  - **Commit Message**:
    ```bash
    git commit -m "docs(pt-br): translate README to Brazilian Portuguese

    Co-authored-by: Ulisses, Mago do Flutter <ulisseshen@gmail.com>"
    ```

---

### File 2 of 2 - 📘 ADEV README
- [ ] `adev/README.md`
  - **Description**: Angular.dev documentation site README
  - **Estimated Words**: ~100
  - **Key Terms**: adev, documentation, local development
  - **Translation Notes**:
    - This explains how to contribute to Angular docs
    - Keep technical commands in English
    - Translate explanatory text
  - **Status**: Not Started
  - **Commit Message**:
    ```bash
    git commit -m "docs(pt-br): translate adev/README to Brazilian Portuguese

    Co-authored-by: Ulisses, Mago do Flutter <ulisseshen@gmail.com>"
    ```

---

## 📊 Phase Progress
- **Completed**: 0/2 (0%)
- **In Progress**: 0/2
- **Not Started**: 2/2

## ✅ Phase Completion Checklist
Once all files are translated, verify:
- [ ] Both files contain `<!-- ia-translate: true -->` as first line
- [ ] Main README.md translated and welcoming to Brazilian devs
- [ ] All code examples remain in English
- [ ] All links work correctly
- [ ] Technical terms follow agent guidelines
- [ ] Portuguese is natural and clear
- [ ] Both files committed and pushed
- [ ] All checkboxes above marked as complete [✅]

## 🎯 Next Phase
After completing Phase 0, proceed to:
- **Phase 1**: `plan/phase-01-introduction-core.md` - Introduction documentation

---

## 💡 Translation Tips for README

### Title
```markdown
<!-- ia-translate: true -->
<h1 align="center">Angular - A plataforma do desenvolvedor web moderno</h1>
```

### Description
Keep: "Angular", "TypeScript", "JavaScript"
Translate: "development platform", "mobile and desktop web applications"

### Sections to Translate
- "Documentation" → "Documentação"
- "Getting Started" → "Começando"
- "Development Setup" → "Configuração de Desenvolvimento"
- "Prerequisites" → "Pré-requisitos"
- "Quickstart" → "Início Rápido"
- "Ecosystem" → "Ecossistema"
- "Changelog" → "Registro de Alterações"
- "Upgrading" → "Atualizando"
- "Contributing" → "Contribuindo"
- "Community" → "Comunidade"

### Links to Keep
Keep all URLs in English (they point to English documentation):
- https://angular.dev
- https://github.com/angular/angular
- https://material.angular.dev
- etc.

---

## 🎉 Important Note

**This is the MOST VISIBLE translation!** The README is what people see first when they visit the repository. Take your time to make it welcoming, clear, and natural in Brazilian Portuguese!

---

**Last Updated**: 2025-11-15
**Phase Status**: Ready to Start - DO THIS FIRST! 🚀
