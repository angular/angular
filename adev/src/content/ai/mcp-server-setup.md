# Angular CLI MCP Server

The Angular CLI includes a Model Context Protocol (MCP) server that enables AI assistants (like Cursor, Antigravity, JetBrains AI, etc.) to interact directly with the Angular CLI. It provides tools for code generation, workspace analysis, and running builds/tests.

<docs-callout title="Integration with Angular AI Agent Skills">
  If your host environment supports custom Agent Skills (such as Antigravity), you can combine the Angular CLI MCP server with the official [Angular AI Skills](https://angular.dev/ai/skills). While the skills provide the agent with deep instruction-level guidance and coding standards, the MCP server provides the action tools (like compiling, running tests, and analyzing workspaces) to execute those guidelines, resulting in a complete and powerful development agent.
</docs-callout>

## Get Started

To use the MCP server, you configure your host environment (IDE or CLI) to run `npx @angular/cli mcp`.

<docs-tab-group>
  <docs-tab label="Antigravity IDE">
    Create a file named `.antigravity/mcp.json` in your project's root:

    ```json
    {
      "mcpServers": {
        "angular-cli": {
          "command": "npx",
          "args": ["-y", "@angular/cli", "mcp"]
        }
      }
    }
    ```

  </docs-tab>

  <docs-tab label="Cursor">
    Create `.cursor/mcp.json` in the project root (or globally at `~/.cursor/mcp.json`):

    ```json
    {
      "mcpServers": {
        "angular-cli": {
          "command": "npx",
          "args": ["-y", "@angular/cli", "mcp"]
        }
      }
    }
    ```

  </docs-tab>

  <docs-tab label="VS Code">
    Create `.vscode/mcp.json`:

    ```json
    {
      "servers": {
        "angular-cli": {
          "command": "npx",
          "args": ["-y", "@angular/cli", "mcp"]
        }
      }
    }
    ```

  </docs-tab>
</docs-tab-group>

## Available Tools (Default)

When the MCP server is enabled, AI agents have access to the following tools:

| Name                        | Description                                                                                               |
| :-------------------------- | :-------------------------------------------------------------------------------------------------------- |
| `ai_tutor`                  | Launches an interactive AI-powered Angular tutor.                                                         |
| `devserver.start`           | Asynchronously starts a dev server (`ng serve`). Returns immediately.                                     |
| `devserver.stop`            | Stops the dev server.                                                                                     |
| `devserver.wait_for_build`  | Returns the logs of the most recent build in a running dev server.                                        |
| `get_best_practices`        | Retrieves the Angular Best Practices Guide (crucial for standalone components, typed forms, etc.).        |
| `list_projects`             | Lists all applications and libraries in the workspace by reading `angular.json`.                          |
| `onpush_zoneless_migration` | Analyzes code and provides a plan to migrate it to `OnPush` change detection (prerequisite for zoneless). |
| `run_target`                | Executes a configured target (e.g., build, test, lint, e2e, deploy).                                      |
| `search_documentation`      | Searches the official documentation at `https://angular.dev`.                                             |

## Common Workflows

These workflows demonstrate how AI assistants coordinate different MCP tools to automatically achieve complex developer stories.

### 1. Performance Tuning: Zoneless & OnPush Migration

The AI agent optimizes change detection performance and migrates components to a zoneless-ready state.

1. **Discover Workspace**: The AI agent calls `list_projects` to locate components, projects, and style/test configurations in the workspace.
2. **Schematic Modernization (Prerequisite)**: The AI agent runs any prerequisite signal migrations using standard `ng generate` commands (e.g., Signal Inputs, Signal Queries).
3. **Plan Migration**: The AI agent calls `onpush_zoneless_migration` with the absolute path of the directory or component file.
4. **Apply Changes**: The AI agent automatically applies the single actionable change returned by the tool to the codebase.
5. **Verify Changes**: The AI agent runs unit tests by calling `run_target` with the target parameter set to `"test"`.
6. **Repeat**: The AI agent calls `onpush_zoneless_migration` again to retrieve the next step, repeating until the tool indicates the migration is complete.

### 2. Feature Development & TDD Loop

The AI agent automates research, implementation, and verification when developing new features.

1. **API & Syntax Research**: The AI agent uses `search_documentation` to look up Angular APIs or syntax rules (e.g., `@defer` block options).
2. **Load Coding Standards**: The AI agent calls `get_best_practices` with the workspace path to load Angular version-aligned coding rules.
3. **Start Local Dev Server**: The AI agent starts a background server by calling `devserver.start`.
4. **Monitor Build**: The AI agent uses `devserver.wait_for_build` to watch build logs and ensure compilation succeeds as it edits the code.
5. **Write and Execute Tests**: The AI agent identifies the project's test framework (e.g., Jasmine, Jest, Vitest) via `list_projects`, writes the corresponding test file, and runs the tests using `run_target` with `"test"`.
6. **Stop Dev Server**: When finished, the AI agent stops the active dev server by calling `devserver.stop`.

### 3. Developer Onboarding and Learning

The AI agent guides the developer through Angular concepts in an interactive sandbox.

1. **Discover Projects**: The AI agent calls `list_projects` to scan the workspace and identify the codebase structure.
2. **Launch Tutor**: The AI agent runs `ai_tutor` to load the curriculum instructions, persona, and tutoring guidelines.
3. **Follow the Curriculum**: The AI agent guides the user through the curriculum, explaining concepts and instructing them on what components to build or modify.
4. **Implement & Verify**: The AI agent helps implement the sandbox code and verifies changes using `run_target` with `"test"` or `"build"`.

## Command Options

You can pass arguments to the MCP server in the `args` array of your configuration:

- `--read-only`: Only registers tools that do not modify the project.
- `--local-only`: Only registers tools that do not require an internet connection.

Example for read-only mode:

```json
"args": ["-y", "@angular/cli", "mcp", "--read-only"]
```
