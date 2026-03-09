# Inspect the Router Tree

The **Router Tree** tab lets you visualize the routing tree of your application. You can explore how routes are nested and view details about specific routes.

<img src="assets/images/guide/devtools/router-tree.png" alt="A screenshot of the 'Router Tree' tab in Angular DevTools showing a tree of configured routes. The active routes are highlighted in green, while inactive ones are white.">

### View route details

When you select a specific route in the tree, Angular DevTools displays its properties in the sidebar on the right. This information includes:

- **Path**: The URL path for the route. If the route uses a custom URL matcher, DevTools displays the **Matcher** instead.
- **Component**: The component rendered for this route. If the route is a redirect, DevTools displays the **Redirect to** target instead.
- **Path Match**: The path matching strategy (`prefix` or `full`), if configured.
- **Data**: Static data associated with the route, displayed as a JSON tree.
- **Resolvers**: Route resolvers, displayed as key-value pairs.
- **Guards**: Any guards configured on the route, grouped by type — `canActivate`, `canActivateChild`, `canDeactivate`, and `canMatch`.
- **Providers**: Route-level providers, if configured.
- **Title**: The route title, if configured.
- **RunGuardsAndResolvers**: The re-run strategy for guards and resolvers, if configured.
- **Active**: Whether this route is currently active.
- **Auxiliary**: Indicates if the route is an auxiliary route (e.g., in a named outlet).
- **Lazy**: Indicates if the route is lazily loaded.

Note: Properties like Path Match, Data, Resolvers, Guards, Providers, Title, and RunGuardsAndResolvers only appear in the sidebar when they are configured on the selected route.

### Navigate to a specific route

You can easily trigger navigation directly from the DevTools. While inspecting a route's details in the right sidebar, click on the **Navigate** icon next to the path string. This triggers the Angular router to navigate to that URL in your application.

<img src="assets/images/guide/devtools/router-tree-navigate.png" alt="A screenshot showing the 'Navigate to' tooltip on the route path in the 'Routes Details' sidebar.">
