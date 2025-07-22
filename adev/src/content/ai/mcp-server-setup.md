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
In JetBrains IDEs (like IntelliJ IDEA or WebStorm), after installing the MCP Server plugin, go to `Settings | Tools | AI Assistant | Model Context Protocol (MCP)`. Add a new server and select `As JSON`. Paste the following configuration, which does not use a top-level property for the server list.

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
