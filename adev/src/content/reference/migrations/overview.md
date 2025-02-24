# Migrations

Learn about how you can migrate your existing angular project to the latest features incrementally.

<docs-card-container>
  <docs-card title="Standalone" link="Migrate now" href="reference/migrations/standalone">
    Standalone components provide a simplified way to build Angular applications. Standalone components specify their dependencies directly instead of getting them through NgModules.
  </docs-card>
  <docs-card title="Control Flow Syntax" link="Migrate now" href="reference/migrations/control-flow">
    Built-in Control Flow Syntax allows you to use more ergonomic syntax which is close to JavaScript and has better type checking. It replaces the need to import `CommonModule` to use functionality like `*ngFor`, `*ngIf` and `*ngSwitch`.
  </docs-card>
  <docs-card title="inject() Function" link="Migrate now" href="reference/migrations/inject-function">
    Angular's `inject` function offers more accurate types and better compatibility with standard decorators, compared to constructor-based injection.
  </docs-card>
  <docs-card title="Lazy-loaded routes" link="Migrate now" href="reference/migrations/route-lazy-loading">
    Convert eagerly loaded component routes to lazy loaded ones. This allows the build process to split production bundles into smaller chunks, to load less JavaScript at initial page load.
  </docs-card>
  <docs-card title="New `input()` API" link="Migrate now" href="reference/migrations/signal-inputs">
    Convert existing `@Input` fields to the new signal input API that is now production ready.
  </docs-card>
  <docs-card title="New `output()` function" link="Migrate now" href="reference/migrations/outputs">
    Convert existing `@Output` custom events to the new output function that is now production ready.
  </docs-card>
  <docs-card title="Queries as signal" link="Migrate now" href="reference/migrations/signal-queries">
    Convert existing decorator query fields to the improved signal queries API. The API is now production ready.
  </docs-card>
  <docs-card title="Cleanup unused imports" link="Try it now" href="reference/migrations/cleanup-unused-imports">
    Clean up unused imports in your project.
  </docs-card>
  <docs-card title="Self-closing tags" link="Migrate now" href="reference/migrations/self-closing-tags">
    Convert component templates to use self-closing tags where possible.
  </docs-card>
</docs-card-container>
