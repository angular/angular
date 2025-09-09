# Angular CLI MCP Server setup

The Angular CLI includes an experimental [Model Context Protocol (MCP) server](https://modelcontextprotocol.io/) enabling AI assistants in your development environment to interact with the Angular CLI. We've included support for CLI powered code generation, adding packages, and more.

## Available Tools

The Angular CLI MCP server provides several tools to assist you in your development workflow. By default, the following tools are enabled:

| Name                   | Description                                                                                                                                                                                        | `local-only` | `read-only` |
| :--------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :----------: | :---------: |
| `get_best_practices`   | Retrieves the Angular Best Practices Guide. This guide is essential for ensuring that all code adheres to modern standards, including standalone components, typed forms, and modern control flow. |      ✅      |      ✅     |
| `list_projects`        | Lists the names of all applications and libraries defined within an Angular workspace. It reads the `angular.json` configuration file to identify the projects.                                    |      ✅      |      ✅     |
| `search_documentation` | Searches the official Angular documentation at https://angular.dev. This tool should be used to answer any questions about Angular, such as for APIs, tutorials, and best practices.               |      ❌      |      ✅     |

## Get Started

To get started, run the following command in your terminal:

```bash
ng mcp
```

When run from an interactive terminal, this command displays instructions on how to configure a host environment to use the MCP server. The following sections provide example configurations for several popular editors and tools.

### Cursor

Create a file named `.cursor/mcp.json` in your project's root and add the following configuration. You can also configure it globally in `~/.cursor/mcp.json`.

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

### Firebase Studio

Create a file named `.idx/mcp.json` in your project's root and add the following configuration:

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

Create a file named `.gemini/settings.json` in your project's root and add the following configuration:

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

### JetBrains IDEs

In JetBrains IDEs (like IntelliJ IDEA or WebStorm), after installing the JetBrains AI Assistant plugin, go to `Settings | Tools | AI Assistant | Model Context Protocol (MCP)`. Add a new server and select `As JSON`. Paste the following configuration, which does not use a top-level property for the server list.

```json
{
  "name": "Angular CLI",
  "command": "npx",
  "args": [
    "-y",
    "@angular/cli",
    "mcp"
  ]
}
```

### VS Code

In your project's root, create a file named `.vscode/mcp.json` and add the following configuration. Note the use of the `servers` property.

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

### Other IDEs

For other IDEs, check your IDE's documentation for the proper location of the MCP configuration file (often `mcp.json`). The configuration should contain the following snippet.

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

## Command Options

The `mcp` command can be configured with the following options passed as arguments in your IDE's MCP configuration:

| Option         | Type      | Description                                                                                                | Default |
| :------------- | :-------- | :--------------------------------------------------------------------------------------------------------- | :------ |
| `--read-only`  | `boolean` | Only register tools that do not make changes to the project. Your editor or coding agent may still perform edits. | `false` |
| `--local-only` | `boolean` | Only register tools that do not require an internet connection. Your editor or coding agent may still send data over the network. | `false` |


For example, to run the server in read-only mode in VS Code, you would update your `mcp.json` like this:

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["-y", "@angular/cli", "mcp", "--read-only"]
    }
  }
}
```

## Feedback and New Ideas

The Angular team welcomes your feedback on the existing MCP capabilities and any ideas you have for new tools or features. Please share your thoughts by opening an issue on the [angular/angular GitHub repository](https://github.com/angular/angular/issues).