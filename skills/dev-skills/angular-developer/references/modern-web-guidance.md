# Using Modern Web Guidance with Angular

[Modern Web Guidance](https://github.com/GoogleChrome/modern-web-guidance) complements Angular guidance with current recommendations for HTML, CSS, browser APIs, accessibility, and browser compatibility. It is optional and must not be installed or executed unless it is already available or the user requests it.

## Responsibilities

Use Angular guidance for application architecture, including:

- components and templates;
- state management with signals or RxJS;
- Angular forms;
- HTTP communication;
- routing and dependency injection;
- rendering lifecycle, SSR, and testing.

Use Modern Web Guidance for web platform concerns, including:

- semantic HTML and native element behavior;
- modern CSS features;
- browser APIs without an Angular-specific equivalent;
- browser support, progressive enhancement, and fallbacks.

The project's Angular version, browser support policy, and existing architecture take precedence over defaults from either skill.

## Adapting Platform Guidance

Modern Web Guidance examples are framework-agnostic. Preserve the recommended platform feature, semantics, and compatibility behavior while expressing application code with Angular patterns:

- Prefer template event bindings and host metadata over manually registering DOM listeners for component events.
- Prefer Angular queries and dependency injection over global DOM queries when accessing elements or platform objects.
- Use the existing Angular forms strategy as the source of truth. Add native attributes such as `autocomplete`, `inputmode`, and validation constraints without creating a second, conflicting validation model.
- Prefer `HttpClient` or `httpResource` for application data access. Use a direct browser API only when the required platform capability is not represented by Angular's HTTP APIs.
- Guard browser-only APIs from SSR execution and acquire DOM state during the appropriate rendering lifecycle.
- Clean up observers, listeners, and other browser resources when their owner is destroyed.

Direct DOM access is appropriate when no Angular abstraction exists or when integrating a third-party API. Keep it localized instead of replacing component rendering or state management with DOM manipulation.
