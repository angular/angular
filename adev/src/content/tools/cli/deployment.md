# Deployment

When you are ready to deploy your Angular application to a remote server, you have various options.

## Automatic deployment with the CLI

The Angular CLI command `ng deploy` executes the `deploy` [CLI builder](tools/cli/cli-builder) associated with your project.
A number of third-party builders implement deployment capabilities to different platforms.
You can add any of them to your project with `ng add`.

When you add a package with deployment capability, it will automatically update your workspace configuration (`angular.json` file) with a `deploy` section for the selected project.
You can then use the `ng deploy` command to deploy that project.

For example, the following command automatically deploys a project to [Firebase](https://firebase.google.com/).

<docs-code language="shell">

ng add @angular/fire
ng deploy

</docs-code>

The command is interactive.
In this case, you must have or create a Firebase account and authenticate using it.
The command prompts you to select a Firebase project for deployment before building your application and uploading the production assets to Firebase.

The table below lists tools which implement deployment functionality to different platforms.
The `deploy` command for each package may require different command line options.
You can read more by following the links associated with the package names below:

| Deployment to                                                     | Setup Command                                                                              |
|:---                                                               |:---                                                                                  |
| [Firebase hosting](https://firebase.google.com/docs/hosting)      | [`ng add @angular/fire`](https://npmjs.org/package/@angular/fire)                           |
| [Vercel](https://vercel.com/solutions/angular)                    | [`vercel init angular`](https://github.com/vercel/vercel/tree/main/examples/angular) |
| [Netlify](https://www.netlify.com)                                | [`ng add @netlify-builder/deploy`](https://npmjs.org/package/@netlify-builder/deploy)       |
| [GitHub pages](https://pages.github.com)                          | [`ng add angular-cli-ghpages`](https://npmjs.org/package/angular-cli-ghpages)               |
| [Amazon Cloud S3](https://aws.amazon.com/s3/?nc2=h_ql_prod_st_s3) | [`ng add @jefiozie/ngx-aws-deploy`](https://www.npmjs.com/package/@jefiozie/ngx-aws-deploy) |

If you're deploying to a self-managed server or there's no builder for your favorite cloud platform, you can either [create a builder](tools/cli/cli-builder) that allows you to use the `ng deploy` command, or read through this guide to learn how to manually deploy your application.

## Manual deployment to a remote server

To manually deploy your application, create a production build and copy the output directory to a web server or content delivery network (CDN).
By default, `ng build` uses the `production` configuration.
If you have customized your build configurations, you may want to confirm [production optimizations](tools/cli/deployment#production-optimizations) are being applied before deploying.

`ng build` outputs the built artifacts to `dist/my-app/` by default, however this path can be configured with the `outputPath` option in the `@angular-devkit/build-angular:browser` builder.
Copy this directory to the server and configure it to serve the directory.

While this is a minimal deployment solution, there are a few requirements for the server to serve your Angular application correctly.

## Server configuration

This section covers changes you may need to configure on the server to run your Angular application.

### Routed apps must fall back to `index.html`

Client-side rendered Angular applications are perfect candidates for serving with a static HTML server because all the content is static and generated at build time.

If the application uses the Angular router, you must configure the server to return the application's host page (`index.html`) when asked for a file that it does not have.

A routed application should support "deep links".
A *deep link* is a URL that specifies a path to a component inside the application.
For example, `http://my-app.test/users/42` is a *deep link* to the user detail page that displays the user with `id` 42.

There is no issue when the user initially loads the index page and then navigates to that URL from within a running client.
The Angular router performs the navigation *client-side* and does not request a new HTML page.

But clicking a deep link in an email, entering it in the browser address bar, or even refreshing the browser while already on the deep linked page will all be handled by the browser itself, *outside* the running application.
The browser makes a direct request to the server for `/users/42`, bypassing Angular's router.

A static server routinely returns `index.html` when it receives a request for `http://my-app.test/`.
But most servers by default will reject `http://my-app.test/users/42` and returns a `404 - Not Found` error *unless* it is configured to return `index.html` instead.
Configure the fallback route or 404 page to `index.html` for your server, so Angular is served for deep links and can display the correct route.
Some servers call this fallback behavior "Single-Page Application" (SPA) mode.

Once the browser loads the application, Angular router will read the URL to determine which page it is on and display `/users/42` correctly.

For "real" 404 pages such as `http://my-app.test/does-not-exist`, the server does not require any additional configuration.
[404 pages implemented in the Angular router](guide/routing/common-router-tasks#displaying-a-404-page) will be displayed correctly.

### Requesting data from a different server (CORS)

Web developers may encounter a [*cross-origin resource sharing*](https://developer.mozilla.org/docs/Web/HTTP/CORS "Cross-origin resource sharing") error when making a network request to a server other than the application's own host server.
Browsers forbid such requests unless the server explicitly permits them.

There isn't anything Angular or the client application can do about these errors.
The _server_ must be configured to accept the application's requests.
Read about how to enable CORS for specific servers at [enable-cors.org](https://enable-cors.org/server.html "Enabling CORS server").

## Production optimizations

`ng build` uses the `production` configuration unless configured otherwise. This configuration enables the following build optimization features.

| Features                                                           | Details                                                                                       |
|:---                                                                |:---                                                                                           |
| [Ahead-of-Time (AOT) Compilation](tools/cli/aot-compiler)          | Pre-compiles Angular component templates.                                                     |
| [Production mode](tools/cli/deployment#development-only-features) | Optimizes the application for the best runtime performance                                    |
| Bundling                                                           | Concatenates your many application and library files into a minimum number of deployed files. |
| Minification                                                       | Removes excess whitespace, comments, and optional tokens.                                     |
| Mangling                                                           | Renames functions, classes, and variables to use shorter, arbitrary identifiers.              |
| Dead code elimination                                              | Removes unreferenced modules and unused code.                                                 |

See [`ng build`](cli/build) for more about CLI build options and their effects.

### Development-only features

When you run an application locally using `ng serve`, Angular uses the development configuration
at runtime which enables:

* Extra safety checks such as [`expression-changed-after-checked`](errors/NG0100) detection.
* More detailed error messages.
* Additional debugging utilities such as the global `ng` variable with [debugging functions](api#core-global) and [Angular DevTools](tools/devtools) support.

These features are helpful during development, but they require extra code in the app, which is
undesirable in production. To ensure these features do not negatively impact bundle size for end users, Angular CLI
removes development-only code from the bundle when building for production.

Building your application with `ng build` by default uses the `production` configuration which removes these features from the output for optimal bundle size.

## `--deploy-url`

`--deploy-url` is a command line option used to specify the base path for resolving relative URLs for assets such as images, scripts, and style sheets at *compile* time.

<docs-code language="shell">

ng build --deploy-url /my/assets

</docs-code>

The effect and purpose of `--deploy-url` overlaps with [`<base href>`](guide/routing/common-router-tasks). Both can be used for initial scripts, stylesheets, lazy scripts, and css resources.

Unlike `<base href>` which can be defined in a single place at runtime, the `--deploy-url` needs to be hard-coded into an application at build time.
Prefer `<base href>` where possible.
