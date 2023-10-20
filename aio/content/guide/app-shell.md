# App shell

Application shell is a way to render a portion of your application using a route at build time.
It can improve the user experience by quickly launching a static rendered page \(a skeleton common to all pages\) while the browser downloads the full client version and switches to it automatically after the code loads.

This gives users a meaningful first paint of your application that appears quickly because the browser can render the HTML and CSS without the need to initialize any JavaScript.

Learn more in [The App Shell Model](https://developers.google.com/web/fundamentals/architecture/app-shell).

## Step 1: Generate an application

Do this with the following Angular CLI command:

<code-example format="shell" language="shell">

ng new my-app

</code-example>

For an existing application, you have to manually add the `Router` and defining a `<router-outlet>` within your application.

## Step 2: Create the application shell

Use the Angular CLI to automatically create the application shell.

<code-example format="shell" language="shell">

ng generate app-shell

</code-example>

For more information about this command, see [App shell command](cli/generate#app-shell-command).

The command updates the application code and adds extra files to the project structure.

<code-example language="text">

  src
  ├── app
  │   ├── app.config.server.ts               # server application configuration
  │   └── app-shell                          # app-shell component
  │       ├── app-shell.component.html
  │       ├── app-shell.component.scss
  │       ├── app-shell.component.spec.ts
  │       └── app-shell.component.ts
  └── main.server.ts                         # main server application bootstrapping

</code-example>


## Step 3: Verify the application is built with the shell content

<code-example format="shell" language="shell">

ng build --configuration=development

</code-example>

Or to use the production configuration.

<code-example format="shell" language="shell">

ng build

</code-example>

To verify the build output, open <code class="no-auto-link">dist/my-app/browser/index.html</code>.
Look for default text `app-shell works!` to show that the application shell route was rendered as part of the output.

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-10-20
