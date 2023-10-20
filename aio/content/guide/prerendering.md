# Prerendering (SSG)

Prerendering, commonly referred to as Static Site Generation (SSG), represents the method by which pages are rendered to static HTML files during the build process.

Prerendering maintains the same performance benefits of [server-side rendering](/guide/universal/#why-do-it). But achieves a reduced Time to First Byte (TTFB), ultimately enhancing user experience. The key distinction lies in its approach that pages are served as static content, and there is no request-based rendering.

When the data necessary for server-side rendering remains consistent across all users, the strategy of prerendering emerges as a valuable alternative. Rather than dynamically rendering pages for each user request, prerendering takes a proactive approach by rendering them in advance.

## How to prerender a page

To prerender a static page add server-side rendering (SSR) capabilities to your application.
By the following Angular CLI command into your application:

<code-example format="shell" language="shell">

ng add &commat;angular/ssr

</code-example>

Once SSR is added, you can generate the static pages by running the build command:

<code-example format="shell" language="shell">

ng build

</code-example>

### Build options for prerender

The `prerender` application builder option can be either a Boolean or an Object for more fine-tune configuration.

| Options          | Details                                                                                                                                                        | Default Value |
| :--------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------ |
| `discoverRoutes` | Whether the builder should discover routers using the Angular Router.                                                                                          | `true`        |
| `routesFile`     | Specify a file that contains a list of all routes to prerender, separated by newlines. This option is useful if you have a routes that has parameterized URLs. |               |

<code-example format="json" language="json">

&hellip;
"architect": {
"build": {
"builder": "&commat;angular-devkit/build-angular:application",
"options": {
"prerender": {
"discoverRoutes": false
},
},
&hellip;

</code-example>

### Prerendering parameterized routes

You can prerender parameterized routes using the `routesFile` option. An example of a parameterized route is `product/:id`, where `id` is dynamically provided. To specify these routes, they should be listed in a text file, with each route on a separate line.

<code-example language="none" header="routes.txt">

/products/1
/products/555

</code-example>

<code-example format="json" language="json">

&hellip;
"architect": {
"build": {
"builder": "&commat;angular-devkit/build-angular:application",
"options": {
"prerender": {
"routesFile": "routes.txt"
},
},
&hellip;

</code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2023-10-20
