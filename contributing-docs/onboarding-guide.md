# Onboarding Guide for New Angular Contributors

Welcome to the Angular framework repository! 👋

This guide will help you get started as a new contributor to the Angular framework. Whether you're fixing a bug, adding a feature, or improving documentation, this guide will walk you through everything you need to know.

## Table of Contents

- [What is This Repository?](#what-is-this-repository)
- [Quick Start (TL;DR)](#quick-start-tldr)
- [Understanding the Repository Structure](#understanding-the-repository-structure)
- [Your First Build](#your-first-build)
- [Your First Test](#your-first-test)
- [Making Your First Contribution](#making-your-first-contribution)
- [Common Development Tasks](#common-development-tasks)
- [Getting Help](#getting-help)
- [Next Steps](#next-steps)

---

## What is This Repository?

This is the **Angular framework repository** - the source code for Angular itself, not a sample application. Angular is a development platform for building mobile and desktop web applications using TypeScript/JavaScript.

**Important to understand:**
- This repository contains the framework code that gets published to npm as `@angular/core`, `@angular/common`, `@angular/router`, etc.
- Contributors here work on the framework itself, not applications built with Angular
- Changes you make here will affect all Angular developers worldwide
- The repository is a **monorepo** containing 24+ packages plus documentation and tooling

---

## Quick Start (TL;DR)

For experienced developers who want to get started immediately:

```bash
# 1. Fork and clone the repository
git clone git@github.com:<your-username>/angular.git
cd angular

# 2. Install dependencies (requires pnpm, NOT npm)
pnpm install

# 3. Build Angular
pnpm build

# 4. Run tests
pnpm test packages/core/...

# 5. Run the documentation site locally
pnpm adev

# 6. Make changes, format, and commit
# Edit files...
pnpm ng-dev format changed
git commit -m "feat(core): your change description"
```

**Key requirements:**
- Node.js v22.21.1 (see [`.nvmrc`](../.nvmrc))
- pnpm v10.20.0 (package manager - **NOT** npm or yarn)
- Git (Git Bash on Windows, PowerShell not supported)
- Bazel (build system, runs via pnpm)

---

## Understanding the Repository Structure

Understanding where things are will save you time. Here's the high-level structure:

```
angular/
├── packages/              # 📦 Core Angular packages (@angular/*)
│   ├── core/             # @angular/core - DI, components, lifecycle
│   ├── common/           # @angular/common - pipes, directives
│   ├── router/           # @angular/router - routing
│   ├── forms/            # @angular/forms - form handling
│   ├── compiler/         # Template compiler
│   └── ...               # 19 more packages
│
├── adev/                 # 📚 Documentation website (angular.dev)
│   ├── src/content/      # Markdown documentation files
│   └── src/assets/       # Images and media
│
├── contributing-docs/    # 📖 Developer contribution guides
│   ├── building-and-testing-angular.md
│   ├── commit-message-guidelines.md
│   ├── coding-standards.md
│   └── ...               # This file!
│
├── scripts/              # 🔧 Build and automation scripts
├── tools/                # 🛠️ Development tools
├── integration/          # 🧪 Integration tests
├── devtools/             # Angular DevTools browser extension
└── dev-app/              # Development test application
```

### Key Package Locations

When working on specific features, you'll typically work in these directories:

| Package | Location | What it contains |
|---------|----------|------------------|
| Core framework | `packages/core/` | DI, components, directives, change detection |
| Router | `packages/router/` | Routing and navigation |
| Forms | `packages/forms/` | Reactive and template-driven forms |
| HTTP Client | `packages/common/http/` | HTTP service |
| Animations | `packages/animations/` | Animation framework |
| Compiler | `packages/compiler/` | Template compilation |

Each package follows this structure:
```
package-name/
├── src/              # Source TypeScript files
├── test/             # Test files (*.spec.ts)
├── BUILD.bazel       # Build configuration
└── public_api.ts     # Public API exports
```

---

## Your First Build

Building Angular is powered by [Bazel](https://bazel.build), a fast, reliable build system.

### Step 1: Install Dependencies

```bash
# Make sure you're using the correct Node version
node --version  # Should be v22.21.1

# Install dependencies
pnpm install
```

### Step 2: Build All Packages

```bash
# Build everything (first build will take a few minutes)
pnpm build

# Or build a specific package
pnpm bazel build packages/core
```

**Where do build outputs go?**
- Distributable packages: `dist/packages-dist/`
- Build artifacts: `dist/bin/`
- Test results: `dist/testlogs/`

### Common Build Commands

```bash
# Build all packages
pnpm build

# Build a specific package
pnpm bazel build packages/router

# Build with watch mode (auto-rebuild on changes)
ibazel build packages/core

# Clean build (rarely needed, Bazel handles incremental builds)
pnpm bazel clean
```

---

## Your First Test

Testing is critical in Angular. All changes must include tests.

### Running Tests

```bash
# Run all tests in a package
pnpm test packages/core/...

# Run a specific test target
pnpm test packages/core/test:test

# Run tests in watch mode
ibazel test packages/core/test:test

# Run browser-based tests (Karma)
pnpm test packages/core/test:test_web
```

### Test Types

Angular uses different test runners:

| Test Type | When to use | Example |
|-----------|-------------|---------|
| **Node tests** | Unit tests that don't need a browser | `packages/core/test:test` |
| **Karma tests** | Tests requiring a browser environment | `packages/core/test:test_web` |
| **Integration tests** | Testing with external tools/packages | `integration/` directory |
| **E2E tests** | End-to-end UI testing | DevTools and adev |

### Debugging Tests

```bash
# Run tests with Node inspector
pnpm test packages/core/test:test --config=debug

# Then open chrome://inspect in Chrome
```

See [debugging-tips.md](./debugging-tips.md) for more advanced debugging techniques.

---

## Making Your First Contribution

Ready to make a contribution? Follow these steps:

### Step 1: Find Something to Work On

- **Good First Issues**: Look for issues labeled [`good first issue`](https://github.com/angular/angular/labels/good%20first%20issue)
- **Help Wanted**: Check issues labeled [`help wanted`](https://github.com/angular/angular/labels/help%20wanted)
- **Fix a Bug**: Browse [open bugs](https://github.com/angular/angular/labels/type%3A%20bug%2Ffix)
- **Improve Docs**: Documentation improvements are always welcome!

### Step 2: Create a Branch

```bash
# Create a new branch from main
git checkout -b my-fix-branch main
```

### Step 3: Make Your Changes

1. **Edit the code** - Make your changes in the appropriate package
2. **Write tests** - All changes require tests
3. **Build** - Ensure your code compiles
4. **Test** - Ensure all tests pass

```bash
# Make your changes in packages/*/src/
vim packages/core/src/di/injector.ts

# Write tests in packages/*/test/
vim packages/core/test/di/injector_spec.ts

# Build and test
pnpm bazel build packages/core
pnpm test packages/core/...
```

### Step 4: Format Your Code

Angular uses Prettier for automatic formatting:

```bash
# Format all changed files
pnpm ng-dev format changed

# Format specific files
pnpm ng-dev format files path/to/file.ts
```

### Step 5: Commit Your Changes

Angular has strict commit message conventions. Commit messages must follow this format:

```
<type>(<scope>): <short summary>
  │       │             │
  │       │             └─⫸ Summary in present tense. Not capitalized. No period at the end.
  │       │
  │       └─⫸ Commit Scope: core|common|router|forms|animations|compiler|etc.
  │
  └─⫸ Commit Type: feat|fix|docs|style|refactor|perf|test|build|ci|chore
```

**Examples:**
```bash
git commit -m "feat(core): add new dependency injection feature"
git commit -m "fix(router): resolve navigation timing issue"
git commit -m "docs(forms): update reactive forms documentation"
```

See [commit-message-guidelines.md](./commit-message-guidelines.md) for details.

### Step 6: Push and Create a Pull Request

```bash
# Push your branch to GitHub
git push origin my-fix-branch

# Create a pull request on GitHub
# Go to https://github.com/angular/angular/pulls
```

**Before submitting a PR:**
- ✅ All tests pass
- ✅ Code is formatted (`pnpm ng-dev format changed`)
- ✅ Commit messages follow conventions
- ✅ You've signed the [CLA](https://cla.developers.google.com/about/google-individual)

---

## Common Development Tasks

### Running the Documentation Site Locally

```bash
# Start the angular.dev documentation site
pnpm adev

# Open http://localhost:4200 in your browser
```

### Running the Dev App

The dev-app is a test application for manual testing:

```bash
# Start the dev app
pnpm dev

# Build for production
pnpm dev:prod
```

### Testing Your Changes in a Local Project

Want to test your framework changes in a real Angular application?

```bash
# Build and link Angular packages to your local project
pnpm ng-dev misc build-and-link /path/to/your/angular/project
```

**Important:** Disable the Angular CLI cache in your test project:
```bash
cd /path/to/your/project
ng cache disable
```

### Updating Dependencies

```bash
# Install new dependencies
pnpm install

# Update dependencies
pnpm update
```

### Checking for Lint Errors

```bash
# Run linting and format check
pnpm lint

# Auto-fix formatting issues
pnpm ng-dev format changed
```

---

## Getting Help

### Documentation Resources

Start with these contribution guides in `contributing-docs/`:

1. **[building-and-testing-angular.md](./building-and-testing-angular.md)** - Detailed build and test instructions
2. **[coding-standards.md](./coding-standards.md)** - Code style and best practices
3. **[commit-message-guidelines.md](./commit-message-guidelines.md)** - Commit message format
4. **[debugging-tips.md](./debugging-tips.md)** - Debugging techniques
5. **[building-with-bazel.md](./building-with-bazel.md)** - Bazel-specific documentation
6. **[public-api-surface.md](./public-api-surface.md)** - Understanding the public API

### Community Support

- **Discord**: Join the [Angular Discord server](https://discord.gg/angular)
- **Stack Overflow**: Ask questions with the [`angular`](https://stackoverflow.com/questions/tagged/angular) tag
- **GitHub Discussions**: For general questions (not bugs)
- **Office Hours**: Check the Angular blog for community office hours

### When You're Stuck

1. **Search existing issues** - Your question might already be answered
2. **Check the docs** - Read the contribution guides in `contributing-docs/`
3. **Ask on Discord** - The community is very helpful
4. **Comment on related issues** - Maintainers can provide guidance

**Please don't:**
- Open GitHub issues for support questions (use Stack Overflow)
- Ask for ETA on features (check the roadmap instead)
- Request help on personal projects (unless testing a bug in the framework)

---

## Next Steps

Now that you're set up, here are some recommended next steps:

### 1. Understand the Codebase

- **Read the architecture docs** - Understand how Angular works internally
- **Explore a package** - Pick a package (like `core` or `router`) and read the code
- **Read tests** - Tests are great documentation for how code should behave

### 2. Learn the Development Workflow

- **Make a small change** - Start with a documentation fix or small bug
- **Review PRs** - Learn from others by reviewing pull requests
- **Participate in discussions** - Engage with the community on issues

### 3. Deepen Your Knowledge

- **Read design docs** - Check for design documents in issues and PRs
- **Watch Angular talks** - YouTube has many Angular team presentations
- **Follow the blog** - Stay updated via [blog.angular.dev](https://blog.angular.dev)

### 4. Become a Regular Contributor

- **Fix bugs regularly** - Build expertise by fixing related bugs
- **Improve documentation** - Help others understand Angular better
- **Review PRs** - Help the team by reviewing community contributions
- **Mentor others** - Share your knowledge with new contributors

---

## Important Reminders

### Code of Conduct

Please read and follow our [Code of Conduct](../CODE_OF_CONDUCT.md). We're committed to providing a welcoming and inclusive environment.

### Contributor License Agreement (CLA)

Before your first PR can be merged, you must sign the [Google CLA](https://cla.developers.google.com/about/google-individual). It's quick and only needs to be done once.

### Stay Updated

- **Pull frequently** - The main branch moves fast, pull often to stay current
- **Watch the repo** - Get notifications for important changes
- **Read the changelog** - Understand what's changing in each release

### Quality Standards

- **Test everything** - All features and bug fixes require tests
- **Document public APIs** - All public methods need JSDoc comments
- **Follow style guide** - Use the auto-formatter and follow [Google's TypeScript Style Guide](https://google.github.io/styleguide/tsguide.html)
- **Keep PRs focused** - One logical change per PR

---

## Conclusion

Welcome to the Angular community! We're excited to have you here.

Remember:
- **Start small** - Your first contribution doesn't have to be big
- **Ask questions** - The community is here to help
- **Be patient** - Reviews can take time, especially for complex changes
- **Have fun!** - You're contributing to a framework used by millions

Happy coding! 🚀

---

**Additional Resources:**
- [Main Contributing Guide](../CONTRIBUTING.md)
- [Angular Documentation](https://angular.dev)
- [API Documentation](https://angular.dev/api)
- [Angular Blog](https://blog.angular.dev)
- [GitHub Repository](https://github.com/angular/angular)

If you have suggestions for improving this onboarding guide, please open an issue or submit a PR!
