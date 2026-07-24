# Angular CLI MCP Server

The Angular CLI includes a Model Context Protocol (MCP) server that enables AI assistants (like Cursor, Gemini CLI, JetBrains AI, etc.) to interact directly with the Angular CLI. It provides tools for project analysis, guided migrations, and running builds/tests.

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
| `run_target`                | Executes a configured target.                                                                             |
| `search_documentation`      | Searches the official documentation at `https://angular.dev`.                                             |

## Configuration

To use the MCP server, you configure your host environment (IDE or CLI) to run `npx @angular/cli mcp`.

### Antigravity IDE

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

### Gemini CLI

Create `.gemini/settings.json` in the project root:

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

### Cursor

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

### VS Code

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

## Command Options

You can pass arguments to the MCP server in the `args` array of your configuration:

- `--read-only`: Only registers tools that do not modify the project.
- `--local-only`: Only registers tools that do not require an internet connection.

Example for read-only mode:

```json
"args": ["-y", "@angular/cli", "mcp", "--read-only"]
```
