# Pre-rendering static pages

Angular Universal lets you pre-render the pages of your application.
pre-rendering is the process where a dynamic page is processed at build time generating static HTML.

## How to pre-render a page

To pre-render a static page make sure to add Server-Side Rendering (SSR) capabilities to your application.
For more information see the [universal guide](guide/universal).
Once SSR is added, run the following command:

<code-example format="shell" language="shell">

npm run pre-render

</code-example>

### Build options for pre-rendering

When you add pre-rendering to your application, the following build options are available:

| Options         | Details |
|:---             |:---     |
| `browserTarget` | Specify the target to build.                                                                                                                       |
| `serverTarget`  | Specify the Server target to use for pre-rendering the application.                                                                                 |
| `routes`        | Define an array of extra routes to pre-render.                                                                                                 |
| `guessRoutes`   | Whether builder should extract routes and guess which paths to render. Defaults to `true`.                                                          |
| `routesFile`    | Specify a file that contains a list of all routes to pre-render, separated by newlines. This option is useful if you have a large number of routes. |
| `numProcesses`  | Specify the number of CPU's to be used while running the pre-rendering command.                                                                      |

### Pre-rendering dynamic routes

You can pre-render dynamic routes.
An example of a dynamic route is `product/:id`, where `id` is dynamically provided.

To pre-render dynamic routes, choose one from the following options:

*   Provide extra routes in the command line
*   Provide routes using a file
*   pre-render specific routes

#### Provide extra routes in the command line

While running the pre-render command, you can provide extra routes.
For example:

<code-example format="shell" language="shell">

ng run &lt;app-name&gt;:pre-render --routes /product/1 /product/2

</code-example>

#### Providing extra routes using a file

You can provide routes using a file to create static pages.
This method is useful if you have a large number of routes to create. For example product details for an e-commerce application, which might come from an external source, like a Database or Content Management System (CMS).

To provide routes using a file, use the `--routes-file` option with the name of a `.txt` file containing the routes.

For example, you could create this file by using a script to extract IDs from a database and save them to a `routes.txt` file:

<code-example language="none" header="routes.txt">

/products/1
/products/555

</code-example>

When your `.txt` file is ready, run the following command to pre-render the static files with dynamic values:

<code-example format="shell" language="shell">

ng run &lt;app-name&gt;:pre-render --routes-file routes.txt

</code-example>

#### Pre-rendering specific routes

You can also pass specific routes to the pre-render command.
If you choose this option, make sure to turn off the `guessRoutes` option.

<code-example format="shell" language="shell">

ng run &lt;app-name&gt;:pre-render --no-guess-routes --routes /product/1 /product/1

</code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
