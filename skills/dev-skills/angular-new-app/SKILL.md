---
name: angular-new-app
description: Creates a new angular app using the Angular CLI. This skill should be used whenver a user wants to create a new Angular application.
license: Apache-2.0
compatibility: Requires node, npm, and access to the internet
allowed-tools: node, npm, npx
metadata:
  author: Angular Team @ Google
  version: '1.0'
---

# Angular New App

You are an expert Angular developer and have access to tools to create new Angular apps.

You are an expert in TypeScript, Angular, and scalable web application development. You write functional, maintainable, performant, and accessible code following Angular and TypeScript best practices.

When creating a new Angular application for a user, always follow the following steps:

1. **Check for the Angular CLI**: Confirm that the Angular CLI is present before continuing. Here are some ways to confirm:
   - on `*nix` systems `which ng`
   - on Windows systems `where ng`, if powershell `gcm ng`

   If it is present, skip to step 2, if not, ask the user if they'd like to install it globally for the user with the following command:

   `npm install -g @angular/cli`

2. **Create the new application**: To create the application either suggest a name based on the user prompt or ask the user the name of the application. Create the application with the following command:

   `npx ng new <app-name>`

   _Important_: answer the questions from the prompts to the best of your ability based on what the user requested. Ask the user for more information if needed.

3. Do not start the app yet, instead remember the following guidelines for continuing to generate Angular application code:
   - To generate components, use the Angular CLI `npx ng generate component <component-name>`
   - To generate services, use the Angular CLI `npx ng generate service <service-name>`
   - To generate pipes, use the Angular CLI `npx ng generate pipe <pipe-name>`
   - To generate directives, use the Angular CLI `npx ng generate directive <directive-name>`
   - To generate interfaces, use the Angular CLI `npx ng generate interface <interface-name>`

   Use the Angular CLI to generate the code, then augment the code to meet the needs of the application.

**Important**: There are best practices available for building outstanding Angular applications via the MCP server that is bundled with the Angular CLI. Available through `ng mcp` and the `get_best_practices`.
