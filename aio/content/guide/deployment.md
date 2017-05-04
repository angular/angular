@title
Deployment

@intro
Learn how to deploy your Angular app.

@description


This page describes tools and techniques for deploy and optimize your Angular application.


{@a toc}

<!--

## Table of contents

* [Overview](guide/deployment#overview)
* [Simplest deployment possible](guide/deployment#dev-deploy)
* [Optimize for production](guide/deployment#optimize)
  * [Ahead-of-Time (AOT) compilation](guide/deployment#aot)
  * [Webpack](guide/deployment#webpack)
  * [Tree shaking with _rollup_](guide/deployment#rollup)
  * [Pruned libraries](guide/deployment#prune)
  * [Measure performance first](guide/deployment#measure)
* [Angular configuration](guide/deployment#angular-configuration)
  * [The `base` tag](guide/deployment#base-tag)
  * [Enable production mode](guide/deployment#enable-prod-mode)
  * [Lazy loading](guide/deployment#lazy-loading)
* [Server configuration](guide/deployment#server-configuration)
  * [Routed apps must fallback to `index.html`](guide/deployment#fallback)
  * [CORS: requesting services from a different server](guide/deployment#cors)

-->

{@a overview}



## Overview

This guide describes techniques for preparing and deploying an Angular application to a server running remotely.
The techniques progress from _easy but suboptimal_ to _more optimal and more involved_.

* The [simple way](guide/deployment#dev-deploy "Simplest deployment possible") is to copy the development environment to the server.

* [_Ahead of Time_ compilation (AOT)](guide/deployment#aot "AOT Compilation") is the first of
[several optimization strategies](guide/deployment#optimize).
You'll also want to read the [detailed instructions in the AOT Cookbook](guide/aot-compiler "AOT Cookbook").

* [Webpack](guide/deployment#webpack "Webpack Optimization") is a popular general purpose packaging tool with a rich ecosystem, including plugins for AOT.
The Angular [webpack guide](guide/webpack "Webpack: an introduction") can get you started and
_this_ page provides additional optimization advice, but you'll probably have to learn more about webpack on your own.

* The [Angular configuration](guide/deployment#angular-configuration "Angular configuration") section calls attention to
specific client application changes that could improve performance.

* The [Server configuration](guide/deployment#server-configuration "Server configuration") section describes
server-side changes that may be necessary, _no matter how you deploy the application_.



{@a dev-deploy}


## Simplest deployment possible

The simplest way to deploy the app is to publish it to a web server
directly out of the development environment.

It's already running locally. You'll just copy it, almost _as is_,
to a non-local server that others can reach.

1. Copy _everything_ (or [_almost_ everything](guide/deployment#node-modules "Loading npm packages from the web"))
from the local project folder to a folder on the server.

1. If you're serving the app out of a subfolder,
edit a version of `index.html` to set the `<base href>` appropriately.
For example, if the URL to `index.html` is `www.mysite.com/my/app/`, set the _base href_  to
`<base href="/my/app/">`.
Otherwise, leave it alone.
[More on this below](guide/deployment#base-tag).

1. Configure the server to redirect requests for missing files to `index.html`.
[More on this below](guide/deployment#fallback).

1. Enable production mode as [described below](guide/deployment#enable-prod-mode) (optional).

That's the simplest deployment you can do.


<div class="alert is-helpful">



This is _not_ a production deployment. It's not optimized and it won't be fast for users.
It might be good enough for sharing your progress and ideas internally with managers, teammates, and other stakeholders.
Be sure to read about [optimizing for production](guide/deployment#optimize "Optimizing for production") below.



</div>



{@a node-modules}


### Load npm package files from the web (SystemJS)

The `node_modules` folder of _npm packages_ contains much more code
than is needed to actually run your app in the browser.
The `node_modules` for the Quickstart installation is typically 20,500+ files and 180+ MB.
The application itself requires a tiny fraction of that to run.

It takes a long time to upload all of that useless bulk and
users will wait unnecessarily while library files download piecemeal.

Load the few files you need from the web instead.

(1) Make a copy of `index.html` for deployment and replace all `node_module` scripts
with versions that load from the web. It might look like this.


<code-example path="deployment/src/index.html" region="node-module-scripts" linenums="false">

</code-example>



(2) Replace the `systemjs.config.js` script with a script that
loads `systemjs.config.server.js`.

<code-example path="deployment/src/index.html" region="systemjs-config" linenums="false">

</code-example>



(3) Add `systemjs.config.server.js` (shown in the code sample below) to the `src/` folder.
This alternative version configures _SystemJS_ to load _UMD_ versions of Angular
(and other third-party packages) from the web.

Modify `systemjs.config.server.js` as necessary to stay in sync with changes
you make to `systemjs.config.js`.

Notice the `paths` key:


<code-example path="deployment/src/systemjs.config.server.js" region="paths" linenums="false">

</code-example>



In the standard SystemJS config, the `npm` path points to the `node_modules/`.
In this server config, it points to
<a href="https://unpkg.com/" title="unpkg.com">https://unpkg.com</a>,
a site that hosts _npm packages_,
and loads them from the web directly.
There are other service providers that do the same thing.

If you are unwilling or unable to load packages from the open web,
the inventory in `systemjs.config.server.js` identifies the files and folders that
you would copy to a library folder on the server.
Then change the config's  `'npm'` path to point to that folder.

### Practice with an example

The following trivial router sample app shows these changes.


<code-tabs>

  <code-pane title="index.html" path="deployment/src/index.html">

  </code-pane>

  <code-pane title="systemjs.config.server.js" path="deployment/src/systemjs.config.server.js">

  </code-pane>

  <code-pane title="main.ts" path="deployment/src/main.ts">

  </code-pane>

  <code-pane title="app/app.module.ts" path="deployment/src/app/app.module.ts">

  </code-pane>

  <code-pane title="app/app.component.ts" path="deployment/src/app/app.component.ts">

  </code-pane>

  <code-pane title="app/crisis-list.component.ts" path="deployment/src/app/crisis-list.component.ts">

  </code-pane>

  <code-pane title="app/hero-list.component.ts" path="deployment/src/app/hero-list.component.ts">

  </code-pane>

</code-tabs>



Practice with this sample before attempting these techniques on your application.

1. Follow the [setup instructions](guide/setup "Angular QuickStart setup") for creating a new project
named <code>simple-deployment</code>.

1. Add the "Simple deployment" sample files shown above.

1. Run it with `npm start` as you would any project.

1. Inspect the network traffic in the browser developer tools.
Notice that it loads all packages from the web.
You could delete the `node_modules` folder and the app would still run
(although you wouldn't be able to recompile or launch `lite-server`
until you restored it).

1. Deploy the sample to the server (minus the `node_modules` folder!).

When you have that working, try the same process on your application.


{@a optimize}



## Optimize for production

Although deploying directly from the development environment works, it's far from optimal.

The client makes many small requests for individual application code and template files,
a fact you can quickly confirm by looking at the network tab in a browser's developer tools.
Each small file download can spend more time communicating with the server than transferring data.

Development files are full of comments and whitespace for easy reading and debugging.
The browser downloads entire libraries, instead of just the parts the app needs.
The volume of code passed from server to client (the "payload")
can be significantly larger than is strictly necessary to execute the application.

The many requests and large payloads mean
the app takes longer to launch than it would if you optimized it.
Several seconds may pass (or worse) before the user can see or do anything useful.

Does it matter? That depends upon business and technical factors you must evaluate for yourself.

If it _does_ matter, there are tools and techniques to reduce the number of requests and the size of responses.

* Ahead-of-Time (AOT) Compilation: pre-compiles Angular component templates.
* Bundling: concatenates modules into a single file (bundle).
* Inlining: pulls template html and css into the components.
* Minification: removes excess whitespace, comments, and optional tokens.
* Uglification: rewrites code to use short, cryptic variable and function names.
* Dead code elimination: removes unreferenced modules and unused code.
* Pruned libraries: drop unused libraries and pare others down to the features you need.
* Performance measurement: focus on optimizations that make a measurable difference.

Each tool does something different.
They work best in combination and are mutually reinforcing.

You can use any build system you like.
Whatever system you choose, be sure to automate it so that
building for production is a single step.


{@a aot}


### Ahead-of-Time (AOT) compilation

The Angular _Ahead-of-Time_ compiler pre-compiles application components and their templates
during the build process.

Apps compiled with AOT launch faster for several reasons.

* Application components execute immediately, without client-side compilation.
* Templates are embedded as code within their components so there is no client-side request for template files.
* You don't download the Angular compiler, which is pretty big on its own.
* The compiler discards unused Angular directives that a tree-shaking tool can then exclude.

Learn more about AOT Compilation in the [AOT Cookbook](guide/aot-compiler "AOT Cookbook")
which describes running the AOT compiler from the command line
and using [_rollup_](guide/deployment#rollup) for bundling, minification, uglification and tree shaking.


{@a webpack}


### Webpack (and AOT)

<a href="https://webpack.js.org/" title="Webpack 2">Webpack 2</a> is another
great option for inlining templates and style-sheets, for bundling, minifying, and uglifying the application.
The "[Webpack: an introduction](guide/webpack "Webpack: an introduction")" guide will get you started
using webpack with Angular.

Consider configuring _Webpack_ with the official
<a href="https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack" title="Ahead-of-Time Webpack Plugin">
Angular Ahead-of-Time Webpack Plugin</a>.
This plugin transpiles the TypeScript application code,
bundles lazy loaded `NgModules` separately,
and performs AOT compilation &mdash; without any changes to the source code.


{@a rollup}


### Dead code elimination with _rollup_

Any code that you don't call is _dead code_.
You can reduce the total size of the application substantially by removing dead code from the application and from third-party libraries.

_Tree shaking_ is a _dead code elimination_ technique that removes entire exports from JavaScript modules.
If a library exports something that the application doesn't import, a tree shaking tool removes it from the code base.

Tree shaking was popularized by
<a href="http://rollupjs.org/" title="Rollup">Rollup</a>, a popular tool with an ecosystem of
plugins for bundling, minification, and uglification.
Learn more about tree shaking and dead code elmination in
<a href="https://medium.com/@Rich_Harris/tree-shaking-versus-dead-code-elimination-d3765df85c80#.15ih9cyvl" title="Tree-shaking and Dead Code Elimination">
this post</a> by rollup-creator, Rich Harris.


{@a prune}


### Pruned libraries

Don't count on automation to remove all dead code.

Remove libraries that you don't use, especially unnecessary scripts in `index.html`.
Consider smaller alternatives to the libraries that you do use.

Some libraries offer facilities for building a custom, skinny version with just the features you need.
Other libraries let you import features _a la carte_.
**RxJS** is a good example; import RxJS `Observable` operators individually instead of the entire library.


{@a measure}


### Measure performance first

You can make better decisions about what to optimize and how when you have a clear and accurate understanding of
what's making the application slow.
The cause may not be what you think it is.
You can waste a lot of time and money optimizing something that has no tangible benefit or even makes the app slower.
You should measure the app's actual behavior when running in the environments that are important to you.

The
<a href="https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing" title="Chrome DevTools Network Performance">
Chrome DevTools Network Performance page</a> is a good place to start learning about measuring performance.

The [WebPageTest](https://www.webpagetest.org/) tool is another good choice
that can also help verify that your deployment was successful.


{@a angular-configuration}



## Angular configuration

Angular configuration can make the difference between whether the app launches quickly or doesn't load at all.


{@a base-tag}


### The `base` tag

The HTML [_&lt;base href="..."/&gt;_](/guide/router)
specifies a base path for resolving relative URLs to assets such as images, scripts, and style sheets.
For example, given the `<base href="/my/app/">`, the browser resolves a URL such as `some/place/foo.jpg`
into a server request for `my/app/some/place/foo.jpg`.
During navigation, the Angular router uses the _base href_ as the base path to component, template, and module files.


<div class="l-sub-section">



See also the [*APP_BASE_HREF*](api/common/APP_BASE_HREF "API: APP_BASE_HREF") alternative.

</div>



In development, you typically start the server in the folder that holds `index.html`.
That's the root folder and you'd add `<base href="/">` near the top of `index.html` because `/` is the root of the app.

But on the shared or production server, you might serve the app from a subfolder.
For example, when the URL to load the app is something like `http://www.mysite.com/my/app/`,
the subfolder is `my/app/` and you should add `<base href="/my/app/">` to the server version of the `index.html`.

When the `base` tag is misconfigured, the app fails to load and the browser console displays `404 - Not Found` errors
for the missing files. Look at where it _tried_ to find those files and adjust the base tag appropriately.


{@a enable-prod-mode}


### Enable production mode

Angular apps run in development mode by default, as you can see by the following message on the browser
console:


<code-example format="nocode">
  Angular is running in the development mode. Call enableProdMode() to enable the production mode.
</code-example>



Switching to production mode can make it run faster by disabling development specific checks such as the dual change detection cycles.

To enable [production mode](api/core/enableProdMode) when running remotely, add the following code to the `main.ts`.


<code-example path="deployment/src/main.ts" region="enableProdMode" title="src/main.ts (enableProdMode)" linenums="false">

</code-example>



{@a lazy-loading}


### Lazy loading

You can dramatically reduce launch time by only loading the application modules that
absolutely must be present when the app starts.

Configure the Angular Router to defer loading of all other modules (and their associated code), either by
[waiting until the app has launched](guide/router#preloading  "Preloading")
or by [_lazy loading_](guide/router#asynchronous-routing "Lazy loading")
them on demand.

#### Don't eagerly import something from a lazy loaded module

It's a common mistake.
You've arranged to lazy load a module.
But you unintentionally import it, with a JavaScript `import` statement,
in a file that's eagerly loaded when the app starts, a file such as the root `AppModule`.
If you do that, the module will be loaded immediately.

The bundling configuration must take lazy loading into consideration.
Because lazy loaded modules aren't imported in JavaScript (as just noted), bundlers exclude them by default.
Bundlers don't know about the router configuration and won't create separate bundles for lazy loaded modules.
You have to create these bundles manually.

The
[Angular Ahead-of-Time Webpack Plugin](https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack)
automatically recognizes lazy loaded `NgModules` and creates separate bundles for them.



{@a server-configuration}



## Server configuration

This section covers changes you may have make to the server or to files deployed to the server.


{@a fallback}


### Routed apps must fallback to `index.html`

Angular apps are perfect candidates for serving with a simple static HTML server.
You don't need a server-side engine to dynamically compose application pages because
Angular does that on the client-side.

If the app uses the Angular router, you must configure the server
to return the application's host page (`index.html`) when asked for a file that it does not have.


{@a deep-link}


A routed application should support "deep links".
A _deep link_ is a URL that specifies a path to a component inside the app.
For example, `http://www.mysite.com/heroes/42` is a _deep link_ to the hero detail page
that displays the hero with `id: 42`.

There is no issue when the user navigates to that URL from within a running client.
The Angular router interprets the URL and routes to that page and hero.

But clicking a link in an email, entering it in the browser address bar,
or merely refreshing the browser while on the hero detail page &mdash;
all of these actions are handled by the browser itself, _outside_ the running application.
The browser makes a direct request to the server for that URL, bypassing the router.

A static server routinely returns `index.html` when it receives a request for `http://www.mysite.com/`.
But it rejects `http://www.mysite.com/heroes/42` and returns a `404 - Not Found` error *unless* it is
configured to return `index.html` instead.

#### Fallback configuration examples

There is no single configuration that works for every server.
The following sections describe configurations for some of the most popular servers.
The list is by no means exhaustive, but should provide you with a good starting point.

#### Development servers

* [Lite-Server](https://github.com/johnpapa/lite-server): the default dev server installed with the
[Quickstart repo](https://github.com/angular/quickstart) is pre-configured to fallback to `index.html`.

* [Webpack-Dev-Server](https://github.com/webpack/webpack-dev-server):  setup the
`historyApiFallback` entry in the dev server options as follows:


<code-example>
  historyApiFallback: {
    disableDotRule: true,
    htmlAcceptHeaders: ['text/html', 'application/xhtml+xml']
  }

</code-example>



#### Production servers

* [Apache](https://httpd.apache.org/): add a
[rewrite rule](http://httpd.apache.org/docs/current/mod/mod_rewrite.html)
to the `.htaccess` file as show
[here](https://ngmilk.rocks/2015/03/09/angularjs-html5-mode-or-pretty-urls-on-apache-using-htaccess/):


<code-example format=".">
  RewriteEngine On
  # If an existing asset or directory is requested go to it as it is
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
  RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
  RewriteRule ^ - [L]

  # If the requested resource doesn't exist, use index.html
  RewriteRule ^ /index.html

</code-example>



* [NGinx](http://nginx.org/): use `try_files`, as described in
[Front Controller Pattern Web Apps](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/#front-controller-pattern-web-apps),
modified to serve `index.html`:


<code-example format=".">
  try_files $uri $uri/ /index.html;

</code-example>



* [IIS](https://www.iis.net/): add a rewrite rule to `web.config`, similar to the one shown
[here](http://stackoverflow.com/a/26152011/2116927):

<code-example format='.'>
  &lt;system.webServer&gt;
    &lt;rewrite&gt;
      &lt;rules&gt;
        &lt;rule name="Angular Routes" stopProcessing="true"&gt;
          &lt;match url=".*" /&gt;
          &lt;conditions logicalGrouping="MatchAll"&gt;
            &lt;add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /&gt;
            &lt;add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /&gt;
          &lt;/conditions&gt;
          &lt;action type="Rewrite" url="/src/" /&gt;
        &lt;/rule&gt;
      &lt;/rules&gt;
    &lt;/rewrite&gt;
  &lt;/system.webServer&gt;

</code-example>



* [GitHub Pages](https://pages.github.com/): you can't
[directly configure](https://github.com/isaacs/github/issues/408)
the GitHub Pages server, but you can add a 404 page.
Copy `index.html` into `404.html`.
It will still be served as the 404 response, but the browser will process that page and load the app properly.
It's also a good idea to
[serve from `docs/` on master](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch)
and to
[create a `.nojekyll` file](https://www.bennadel.com/blog/3181-including-node-modules-and-vendors-folders-in-your-github-pages-site.htm)

* [Firebase hosting](https://firebase.google.com/docs/hosting/): add a
[rewrite rule](https://firebase.google.com/docs/hosting/url-redirects-rewrites#section-rewrites).


<code-example format=".">
  "rewrites": [ {
    "source": "**",
    "destination": "/index.html"
  } ]

</code-example>



{@a cors}



### Requesting services from a different server (CORS)

Angular developers may encounter a
<a href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing" title="Cross-origin resource sharing">
<i>cross-origin resource sharing</i></a> error when making a service request (typically a data service request).
to a server other than the application's own host server.
Browsers forbid such requests unless the server permits them explicitly.

There isn't anything the client application can do about these errors.
The server must be configured to accept the application's requests.
Read about how to enable CORS for specific servers at
<a href="http://enable-cors.org/server.html" title="Enabling CORS server">enable-cors.org</a>.


{@a next-steps}



## Next steps
 If you want to go beyond the [simple _copy-deploy_](guide/deployment#dev-deploy "Simplest deployment possible") approach,
 read the [AOT Cookbook](guide/aot-compiler "AOT Cookbook") next.
