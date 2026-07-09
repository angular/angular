# Angular Skills

The Angular skills are designed to help coding agents create applications aligned with the latest versions of Angular, best practices, new features and manage Angular applications effectively. These skills provide architectural guidance, generate idiomatic Angular code, and help scaffold new projects using modern best practices.

## Available Skills

- **`angular-developer`**: Generates Angular code and provides architectural guidance. Useful for creating components, services, or obtaining best practices on reactivity (signals, linkedSignal, resource), forms, dependency injection, routing, SSR, accessibility (ARIA), animations, styling, testing, or CLI tooling.
- **`angular-new-app`**: Creates a new Angular app using the Angular CLI. Provides important guidelines for effectively setting up and structuring a modern Angular application.

## Using Agent Skills

Agent Skills are designed to be used with agentic coding tools like [Gemini CLI](https://geminicli.com/docs/cli/skills/), [Antigravity](https://antigravity.google/docs/skills) and more. Activating a skill loads the specific instructions and resources needed for that task.

To use these skills in your own environment you may follow the instructions for your specific tool or use a community tool like [skills.sh](https://skills.sh/).

```bash
npx skills add https://github.com/angular/skills
```

## Contributions

We welcome contributions to the Angular agent skills. If you would like to contribute to the skills, please make the updates directly in `angular/angular` repository, and to that repository will be output here as a part of our infrastructure setup.

### Feedback & Issues

If you encounter a bug, have feedback, or want to suggest an improvement to the skills, please file an issue in the [angular/angular](https://github.com/angular/angular/issues/new?template=3-docs-bug.yaml) issue tracker. Providing detailed context will help us address your feedback effectively.

### Features & Changes (Pull Requests)

We also accept pull requests for new features, updates, or bug fixes for the skills:

1. Make your changes within the `skills/dev-skills/` directory.
2. Follow the standard Angular [Commit Guidelines](https://github.com/angular/angular/blob/main/contributing-docs/commit-message-guidelines.md) and [Coding Standards](https://github.com/angular/angular/blob/main/contributing-docs/coding-standards.md).
3. Submit a Pull Request to the main `angular/angular` repository.
