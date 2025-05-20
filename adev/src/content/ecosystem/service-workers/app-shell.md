# App shell pattern

The [App shell pattern](https://developer.chrome.com/blog/app-shell) is a way to render a portion of your application using a route at build time.
It can improve the user experience by quickly launching a static rendered page (a skeleton common to all pages) while the browser downloads the full client version and switches to it automatically after the code loads.

This gives users a meaningful first paint of your application that appears quickly because the browser can render the HTML and CSS without the need to initialize any JavaScript.

<docs-workflow>
<docs-step title="Prepare the application">
Do this with the following Angular CLI command:

<docs-code language="shell">

ng new my-app

</docs-code>

For an existing application, you have to manually add the `Router` and defining a `<router-outlet>` within your application.
</docs-step>
<docs-step title="Create the application shell">
Use the Angular CLI to automatically create the application shell.

<docs-code language="shell">

ng generate app-shell

</docs-code>

For more information about this command, see [App shell command](cli/generate/app-shell).

The command updates the application code and adds extra files to the project structure.

<docs-code language="text">
src
├── app
│ ├── app.config.server.ts # server application configuration
│ └── app-shell # app-shell component
│   ├── app-shell.component.html
│   ├── app-shell.component.scss
│   ├── app-shell.component.spec.ts
│   └── app-shell.component.ts
└── main.server.ts # main server application bootstrapping
</docs-code>

<docs-step title="Verify the application is built with the shell content">

<docs-code language="shell">

ng build --configuration=development

</docs-code>

Or to use the production configuration.

<docs-code language="shell">

ng build

</docs-code>

To verify the build output, open <code class="no-auto-link">dist/my-app/browser/index.html</code>.
Look for default text `app-shell works!` to show that the application shell route was rendered as part of the output.
</docs-step>
</docs-workflow>
