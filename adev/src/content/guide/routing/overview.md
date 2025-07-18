<docs-decorative-header title="Angular Routing" imgSrc="adev/src/assets/images/routing.svg"> <!-- markdownlint-disable-line -->
Routing helps you change what the user sees in a single-page app.
</docs-decorative-header>

Angular Router (`@angular/router`) is the official library for managing navigation in Angular applications and a core part of the framework. It is included by default in all projects created by Angular CLI.

## Installation

Angular Router is included by default in all Angular projects setup with the Angular CLI `ng new` command.

### Prerequisite

- Angular CLI

### Add to an existing project

If your project does not include Angular Router, you can install it manually with the following command:

```bash
ng add @angular/router
```

The Angular CLI will then install all the necessary dependencies.

## Why is routing necessary in a SPA?

When you navigate to a URL in your web browser, the browser normally makes a network request to a web server and displays the returned HTML page. When you navigate to a different URL, such as clicking a link, the browser makes another network request and replaces the entire page with a new one.

A single-page application (SPA) differs in that the browser only makes a request to a web server for the first page, the `index.html`. After that, a client-side router takes over, controlling which content displays based on the URL. When a user navigates to a different URL, the router updates the page's content in place without triggering a full-page reload.

## How Angular manages routing

Routing in Angular is comprised of three primary parts:

1. **Routes** define which component displays when a user visits a specific URL.
2. **Outlets** are placeholders in your templates that dynamically load and render components based on the active route.
3. **Links** provide a way for users to navigate between different routes in your application without triggering a full page reload.

In addition, the Angular Routing library offers additional functionality such as:

- Nested routes
- Programmatic navigation
- Route params, queries and wildcards
- Activated route information with `ActivatedRoute`
- View transition effects
- Navigation guards

## Next steps

Learn about how you can [define routes using Angular router](/guide/routing/define-routes).
