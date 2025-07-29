# Angular CLI MCP Server setup
The Angular CLI includes an experimental [Model Context Protocol (MCP) server](https://modelcontextprotocol.io/) enabling AI assistants in your development environment to interact with the Angular CLI. We've included support for CLI powered code generation, adding packages, and more.

To get started, run the following command in your terminal:

```bash
ng mcp
```

Use this command to create the base JSON configuration for your environment. Note that the file structure differs depending on your IDE. The following sections provide the configurations for several popular editors.

### VS Code
In your project's root, create a file named `.vscode/mcp.json` and add the following configuration. Note the use of the `servers` property.

```json
{
  "servers": {
    "angular-cli": {
      "command": "npx",
      "args": ["@angular/cli", "mcp"]
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
    "@angular/cli",
    "mcp"
  ]
}
```

### Firebase Studio
Create a file named `.idx/mcp.json` in your project's root and add the following configuration:
```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["@angular/cli", "mcp"]
    }
  }
}
```

### Other IDEs
For these IDEs, create a configuration file and add the following snippet. Note the use of the `mcpServers` property.
*   **Cursor:** Create a file named `.cursor/mcp.json` in your project's root. You can also configure it globally in `~/.cursor/mcp.json`.
*   **Other IDEs:** Check your IDE's documentation for the proper location of the MCP configuration file (often `mcp.json`).

```json
{
  "mcpServers": {
    "angular-cli": {
      "command": "npx",
      "args": ["@angular/cli", "mcp"]
    }
  }
}
```

## Available Tools

The Angular CLI MCP server provides several tools to assist you in your development workflow. Here's an overview of the available tools:

### Get Angular Coding Best Practices Guide (`get_best_practices`)

This tool provides a guide on modern Angular coding best practices. Before you start writing or modifying code, you can use this tool to ensure your work aligns with current standards, such as using standalone components, typed forms, and the latest control flow syntax.

*   **Outputs:** The content of the best practices guide.

### Search Angular Documentation (`search_documentation`)

This tool allows you to search the official Angular documentation at [angular.dev](https://angular.dev). It's the recommended way to find up-to-date information on Angular APIs, tutorials, and guides.

*   **Outputs:** A list of search results, including title, breadcrumbs, and URL. May also include the content of the top-ranked page.

### List Angular Projects (`list_projects`)

This tool lists all the applications and libraries in your current Angular workspace. It reads the `angular.json` file to identify and provide details about each project.

*   **Outputs:** A list of project objects, with details for each project like its name, type (`application` or `library`), root directory, and component selector prefix.

## Feedback and New Ideas

The Angular team welcomes your feedback on the existing MCP capabilities and any ideas you have for new tools or features. Please share your thoughts by opening an issue on the [angular/angular GitHub repository](https://github.com/angular/angular/issues).
