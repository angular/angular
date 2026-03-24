# Agent Skills

Agent Skills are specialized, domain-specific instructions and capabilities designed for AI agents like Gemini CLI. These skills provide architectural guidance, generate idiomatic Angular code, and help scaffold new projects using modern best practices.

By using Agent Skills, you can ensure that the AI agent you are working with has the most up-to-date information about Angular's conventions, reactivity models (like Signals), and project structure.

## Available Skills

The Angular team maintains a collection of official skills that are regularly updated to stay in sync with the latest framework improvements.

| Skill                   | Description                                                                                                                                                                                                                                                                                       |
| :---------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **`angular-developer`** | Generates Angular code and provides architectural guidance. Useful for creating components, services, or obtaining best practices on reactivity (signals, linkedSignal, resource), forms, dependency injection, routing, SSR, accessibility (ARIA), animations, styling, testing, or CLI tooling. |
| **`angular-new-app`**   | Creates a new Angular app using the Angular CLI. Provides important guidelines for effectively setting up and structuring a modern Angular application.                                                                                                                                           |

## Using Agent Skills

Agent Skills are designed to be used with agentic coding tools like [Gemini CLI](https://geminicli.com/docs/cli/skills/), [Antigravity](https://antigravity.google/docs/skills) and more. Activating a skill loads the specific instructions and resources needed for that task.

To use these skills in your own environment you may follow the instructions for your specific tool or use a community tool like [skills.sh](https://skills.sh/).

```bash
npx skills add https://github.com/angular/skills
```
