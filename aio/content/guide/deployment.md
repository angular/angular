# Deployment

When you are ready to deploy your Angular application to a remote server, you have various options for deployment.

{@a dev-deploy}
{@a copy-files}


## Simple deployment options

Before fully deploying your application, you can test the process, build configuration, and deployed behavior by using one of these interim techniques.

### Building and serving from disk

During development, you typically use the `ng serve` command to build, watch, and serve the application from local memory, using [webpack-dev-server](https://webpack.js.org/guides/development/#webpack-dev-server).
When you are ready to deploy, however, you must use the `ng build` command to build the app and deploy the build artifacts elsewhere.

Both `ng build` and `ng serve` clear the output folder before they build the project, but only the `ng build` command writes the generated build artifacts to the output folder.

<div class="alert is-helpful">

The output folder is  `dist/project-name/` by default.
To output to a different folder, change the `outputPath` in `angular.json`.

</div>

As you near the end of the development process, serving the contents of your output folder from a local web server can give you a better idea of how your application will behave when it is deployed to a remote server.
You will need two terminals to get the live-reload experience.

* On the first terminal, run the [`ng build` command](cli/build) in *watch* mode to compile the application to the `dist` folder.

  <code-example language="none" class="code-shell">

   ng build --watch

  </code-example>

  Like the `ng serve` command, this regenerates output files when source files change.

* On the second terminal, install a web server (such as [lite-server](https://github.com/johnpapa/lite-server)), and run it against the output folder. For example:

  <code-example language="none" class="code-shell">

   lite-server --baseDir="dist/project-name"

  </code-example>

   The server will automatically reload your browser when new files are output.

<div class="alert is-critical">

This method is for development and testing only, and is not a supported or secure way of deploying an application.

</div>

### Automatic deployment with the CLI

The Angular CLI command `ng deploy` (introduced in version 8.3.0) executes the `deploy` [CLI builder](guide/cli-builder) associated with your project. A number of third-party builders implement deployment capabilities to different platforms. You can add any of them to your project by running `ng add [package name]`.

When you add a package with deployment capability, it'll automatically update your workspace configuration (`angular.json` file) with a `deploy` section for the selected project. You can then use the `ng deploy` command to deploy that project.

For example, the following command automatically deploys a project to Firebase.

<code-example language="none" class="code-shell">
ng add @angular/fire
ng deploy
</code-example>

The command is interactive. In this case, you must have or create a Firebase account, and authenticate using that account. The command prompts you to select a Firebase project for deployment

The command builds your application and uploads the production assets to Firebase.

In the table below, you can find a list of packages which implement deployment functionality to different platforms. The `deploy` command for each package may require different command line options. You can read more by following the links associated with the package names below:

| Deployment to                                                 | Package                                                                        |
|---------------------------------------------------------------|--------------------------------------------------------------------------------|
| [Firebase hosting](https://firebase.google.com/docs/hosting)  | [`@angular/fire`](https://npmjs.org/package/@angular/fire)                     |
| [Azure](https://azure.microsoft.com/en-us/)                   | [`@azure/ng-deploy`](https://npmjs.org/package/@azure/ng-deploy)               |
| [Now](https://zeit.co/now)                                    | [`@zeit/ng-deploy`](https://npmjs.org/package/@zeit/ng-deploy)                 |
| [Netlify](https://www.netlify.com/)                           | [`@netlify-builder/deploy`](https://npmjs.org/package/@netlify-builder/deploy) |
| [GitHub pages](https://pages.github.com/)                     | [`angular-cli-ghpages`](https://npmjs.org/package/angular-cli-ghpages)         |
| [NPM](https://npmjs.com/)                                     | [`ngx-deploy-npm`](https://npmjs.org/package/ngx-deploy-npm)                   |
| [Amazon Cloud S3](https://aws.amazon.com/s3/?nc2=h_ql_prod_st_s3) | [`@jefiozie/ngx-aws-deploy`](https://www.npmjs.com/package/@jefiozie/ngx-aws-deploy) |

If you're deploying to a self-managed server or there's no builder for your favorite cloud platform, you can either create a builder that allows you to use the `ng deploy` command, or read through this guide to learn how to manually deploy your app.

### Basic deployment to a remote server

For the simplest deployment, create a production build and copy the output directory to a web server.

1. Start with the production build:

  <code-example language="none" class="code-shell">

    ng build

  </code-example>


2. Copy _everything_ within the output folder (`dist/project-name/` by default) to a folder on the server.

3. Configure the server to redirect requests for missing files to `index.html`.
Learn more about server-side redirects [below](#fallback).

This is the simplest production-ready deployment of your application.

{@a deploy-to-github}

### Deploy to GitHub Pages

To deploy your Angular application to [GitHub Pages](https://help.github.com/articles/what-is-github-pages/), complete the following steps:

1. [Create a GitHub repository](https://help.github.com/articles/create-a-repo/) for your project.

1. Configure `git` in your local project by adding a remote that specifies the GitHub repo you created in previous step.
  GitHub provides these commands when you create the repo so that you can copy and paste them at your command prompt.
  The commands should be similar to the following, though GitHub fills in your project-specific settings for you:

  ```sh
  git remote add origin https://github.com/your-username/your-project-name.git
  git branch -M main
  git push -u origin main
  ```
  When you paste these commands from GitHub, they run automatically.

1. Create and check out a `git` branch named `gh-pages`.

  ```sh
  git checkout -b gh-pages
  ```

1. Build your project using the Github project name, with the Angular CLI command [`ng build`](cli/build) and the following options, where `your_project_name` is the name of the project that you gave the GitHub repository in step 1.

  Be sure to include the slashes on either side of your project name as in `/your_project_name/`.

  <code-example language="none" class="code-shell">

    ng build --output-path docs --base-href /your_project_name/

  </code-example>

1. When the build is complete, make a copy of `docs/index.html` and name it `docs/404.html`.

1. Commit your changes and push.

1. On the GitHub project page, go to Settings and scroll down to the GitHub Pages section to configure the site to [publish from the docs folder](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).

1. Click Save.

1. Click on the GitHub Pages link at the top of the GitHub Pages section to see your deployed application.
The format of the link is `https://<user_name>.github.io/<project_name>/`.

<div class="alert is-helpful">

Check out [angular-cli-ghpages](https://github.com/angular-buch/angular-cli-ghpages), a full featured package that does all this for you and has extra functionality.

</div>

{@a server-configuration}
## Server configuration

This section covers changes you may have to make to the server or to files deployed on the server.

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

* [Apache](https://httpd.apache.org/): add a
[rewrite rule](https://httpd.apache.org/docs/current/mod/mod_rewrite.html) to the `.htaccess` file as shown
  (https://ngmilk.rocks/2015/03/09/angularjs-html5-mode-or-pretty-urls-on-apache-using-htaccess/):

  <code-example>
    RewriteEngine On
    &#35 If an existing asset or directory is requested go to it as it is
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
    RewriteRule ^ - [L]<br>
    &#35 If the requested resource doesn't exist, use index.html
    RewriteRule ^ /index.html
  </code-example>


* [Nginx](https://nginx.org/): use `try_files`, as described in
[Front Controller Pattern Web Apps](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/#front-controller-pattern-web-apps),
modified to serve `index.html`:

  ```
  try_files $uri $uri/ /index.html;
  ```

* [Ruby](https://www.ruby-lang.org/): create a Ruby server using ([sinatra](http://sinatrarb.com/)) with a basic Ruby file that configures the server `server.rb`:

  ``` ruby
  require 'sinatra'

  # Folder structure
  # .
  # -- server.rb
  # -- public
  #    |-- project-name
  #        |-- index.html

  get '/' do
      folderDir = settings.public_folder + '/project-name'  # ng build output folder
      send_file File.join(folderDir, 'index.html')
  end
  ```


* [IIS](https://www.iis.net/): add a rewrite rule to `web.config`, similar to the one shown
[here](https://stackoverflow.com/a/26152011):

  <code-example format='.' language="xml">
    &lt;system.webServer&gt;
      &lt;rewrite&gt;
        &lt;rules&gt;
          &lt;rule name="Angular Routes" stopProcessing="true"&gt;
            &lt;match url=".*" /&gt;
            &lt;conditions logicalGrouping="MatchAll"&gt;
              &lt;add input="{REQUEST_FILENAME}" matchType="IsFile" negate="true" /&gt;
              &lt;add input="{REQUEST_FILENAME}" matchType="IsDirectory" negate="true" /&gt;
            &lt;/conditions&gt;
            &lt;action type="Rewrite" url="/index.html" /&gt;
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

  <code-example language="json">
    "rewrites": [ {
      "source": "**",
      "destination": "/index.html"
    } ]
  </code-example>

{@a cors}

### Requesting services from a different server (CORS)

Angular developers may encounter a
<a href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing" title="Cross-origin resource sharing">
<i>cross-origin resource sharing</i></a> error when making a service request (typically a data service request)
to a server other than the application's own host server.
Browsers forbid such requests unless the server permits them explicitly.

There isn't anything the client application can do about these errors.
The server must be configured to accept the application's requests.
Read about how to enable CORS for specific servers at
<a href="https://enable-cors.org/server.html" title="Enabling CORS server">enable-cors.org</a>.

{@a optimize}
## Production optimizations

The `production` configuration engages the following build optimization features.

* [Ahead-of-Time (AOT) Compilation](guide/aot-compiler): pre-compiles Angular component templates.
* [Production mode](#enable-prod-mode): deploys the production environment which enables _production mode_.
* Bundling: concatenates your many application and library files into a few bundles.
* Minification: removes excess whitespace, comments, and optional tokens.
* Uglification: rewrites code to use short, cryptic variable and function names.
* Dead code elimination: removes unreferenced modules and much unused code.

See [`ng build`](cli/build) for more about CLI build options and what they do.


{@a enable-prod-mode}

### Enable runtime production mode

In addition to build optimizations, Angular also has a runtime production mode. Angular apps run in development mode by default, as you can see by the following message on the browser console:

<code-example format="nocode">

  Angular is running in development mode. Call enableProdMode() to enable production mode.

</code-example>

_Production mode_ improves application performance by disabling development-only safety
checks and debugging utilities, such as the expression-changed-after-checked detection.
Building your application with the production configuration automatically enables Angular's
runtime production mode.

{@a lazy-loading}

### Lazy loading

You can dramatically reduce launch time by only loading the application modules that
absolutely must be present when the app starts.

Configure the Angular Router to defer loading of all other modules (and their associated code), either by
[waiting until the app has launched](guide/router-tutorial-toh#preloading  "Preloading")
or by [_lazy loading_](guide/router#lazy-loading "Lazy loading")
them on demand.

<div class="callout is-helpful">

<header>Don't eagerly import something from a lazy-loaded module</header>

If you mean to lazy-load a module, be careful not to import it
in a file that's eagerly loaded when the app starts (such as the root `AppModule`).
If you do that, the module will be loaded immediately.

The bundling configuration must take lazy loading into consideration.
Because lazy-loaded modules aren't imported in JavaScript, bundlers exclude them by default.
Bundlers don't know about the router configuration and can't create separate bundles for lazy-loaded modules.
You would have to create these bundles manually.

The CLI runs the
[Angular Ahead-of-Time Webpack Plugin](https://github.com/angular/angular-cli/tree/master/packages/ngtools/webpack)
which automatically recognizes lazy-loaded `NgModules` and creates separate bundles for them.

</div>

{@a measure}

### Measure performance

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

{@a inspect-bundle}

### Inspect the bundles

The <a href="https://github.com/danvk/source-map-explorer/blob/master/README.md">source-map-explorer</a>
tool is a great way to inspect the generated JavaScript bundles after a production build.

Install `source-map-explorer`:

<code-example language="none" class="code-shell">

  npm install source-map-explorer --save-dev

</code-example>

Build your app for production _including the source maps_

<code-example language="none" class="code-shell">

  ng build --source-map

</code-example>

List the generated bundles in the `dist/project-name/` folder.

<code-example language="none" class="code-shell">

  ls dist/project-name/*.js

</code-example>

Run the explorer to generate a graphical representation of one of the bundles.
The following example displays the graph for the _main_ bundle.

<code-example language="none" class="code-shell">

  node_modules/.bin/source-map-explorer dist/project-name/main*

</code-example>

The `source-map-explorer` analyzes the source map generated with the bundle and draws a map of all dependencies,
showing exactly which classes are included in the bundle.

Here's the output for the _main_ bundle of an example app called `cli-quickstart`.

<div class="lightbox">
  <img src="generated/images/guide/deployment/quickstart-sourcemap-explorer.png" alt="quickstart sourcemap explorer">
</div>

{@a base-tag}

## The `base` tag

The HTML [_&lt;base href="..."/&gt;_](/guide/router)
specifies a base path for resolving relative URLs to assets such as images, scripts, and style sheets.
For example, given the `<base href="/my/app/">`, the browser resolves a URL such as `some/place/foo.jpg`
into a server request for `my/app/some/place/foo.jpg`.
During navigation, the Angular router uses the _base href_ as the base path to component, template, and module files.

<div class="alert is-helpful">

See also the [*APP_BASE_HREF*](api/common/APP_BASE_HREF "API: APP_BASE_HREF") alternative.

</div>

In development, you typically start the server in the folder that holds `index.html`.
That's the root folder and you'd add `<base href="/">` near the top of `index.html` because `/` is the root of the app.

But on the shared or production server, you might serve the app from a subfolder.
For example, when the URL to load the app is something like `http://www.mysite.com/my/app/`,
the subfolder is `my/app/` and you should add `<base href="/my/app/">` to the server version of the `index.html`.

When the `base` tag is mis-configured, the app fails to load and the browser console displays `404 - Not Found` errors
for the missing files. Look at where it _tried_ to find those files and adjust the base tag appropriately.

{@a differential-loading}

## Differential Loading

When building web applications, you want to make sure your application is compatible with the majority of browsers.
Even as JavaScript continues to evolve, with new features being introduced, not all browsers are updated with support for these new features at the same pace.

The code you write in development using TypeScript is compiled and bundled into ES2015, the JavaScript syntax that is compatible with most browsers.
All modern browsers support ES2015 and beyond, but in most cases, you still have to account for users accessing your application from a browser that doesn't.
When targeting older browsers, [polyfills](guide/browser-support#polyfills) can bridge the gap by providing functionality that doesn't exist in the older versions of JavaScript supported by those browsers.

To maximize compatibility, you could ship a single bundle that includes all your compiled code, plus any polyfills that may be needed.
Users with modern browsers, however, shouldn't have to pay the price of increased bundle size that comes with polyfills they don't need.
Differential loading, which is supported in Angular CLI version 8 and higher, can help solve this problem.

Differential loading is a strategy that allows your web application to support multiple browsers, but only load the necessary code that the browser needs. When differential loading is enabled the CLI builds two separate bundles as part of your deployed application.

* The first bundle contains modern ES2015 syntax. This bundle takes advantage of built-in support in modern browsers, ships fewer polyfills, and results in a smaller bundle size.

* The second bundle contains code in the old ES5 syntax, along with all necessary polyfills. This second bundle is larger, but supports older browsers.

### Differential builds

When you deploy using the Angular CLI build process, you can choose how and when to support differential loading.
The [`ng build` CLI command](cli/build) queries the browser configuration and the configured build target to determine if support for legacy browsers is required, and whether the build should produce the necessary bundles used for differential loading.

The following configurations determine your requirements.

* Browserslist

   The Browserslist configuration file is included in your application [project structure](guide/file-structure#application-configuration-files) and provides the minimum browsers your application supports. See the [Browserslist spec](https://github.com/browserslist/browserslist) for complete configuration options.

* TypeScript configuration

   In the TypeScript configuration file, the "target" option in the `compilerOptions` section determines the ECMAScript target version that the code is compiled to.
   Modern browsers support ES2015 natively, while ES5 is more commonly used to support legacy browsers.

<div class="alert is-helpful">

   Differential loading is currently only supported when using `es2015` as a compilation target. When used with targets higher than `es2015`, the build process emits a warning.

</div>

For a development build, the output produced by `ng build` is simpler and easier to debug, allowing you to rely less on sourcemaps of compiled code.

For a production build, your configuration determines which bundles are created for deployment of your application.
When needed, the `index.html` file is also modified during the build process to include script tags that enable differential loading, as shown in the following example.

<code-example language="html" header="index.html">
&lt;body>
  &lt;app-root>&lt;/app-root>
  &lt;script src="runtime-es2015.js" type="module">&lt;/script>
  &lt;script src="runtime-es5.js" nomodule>&lt;/script>
  &lt;script src="polyfills-es2015.js" type="module">&lt;/script>
  &lt;script src="polyfills-es5.js" nomodule>&lt;/script>
  &lt;script src="styles-es2015.js" type="module">&lt;/script>
  &lt;script src="styles-es5.js" nomodule>&lt;/script>
  &lt;script src="vendor-es2015.js" type="module">&lt;/script>
  &lt;script src="vendor-es5.js" nomodule>&lt;/script>
  &lt;script src="main-es2015.js" type="module">&lt;/script>
  &lt;script src="main-es5.js" nomodule>&lt;/script>
&lt;/body>
</code-example>

Each script tag has a `type="module"` or `nomodule` attribute. Browsers with native support for ES modules only load the scripts with the `module` type attribute and ignore scripts with the `nomodule` attribute. Legacy browsers only load the scripts with the `nomodule` attribute, and ignore the script tags with the `module` type that load ES modules.

<div class="alert is-helpful">

   Some legacy browsers still download both bundles, but only execute the appropriate scripts based on the attributes mentioned above. You can read more on the issue [here](https://github.com/philipwalton/webpack-esnext-boilerplate/issues/1).

</div>

### Configuring differential loading

To include differential loading in your application builds, you must configure the Browserslist and TypeScript configuration files in your application project.

The following examples show a `.browserslistrc` and `tsconfig.json` file for a newly created Angular application. In this configuration, legacy browsers such as IE 9-11 are ignored, and the compilation target is ES2015.

<code-example language="none" header=".browserslistrc">
# This file is used by the build system to adjust CSS and JS output to support the specified browsers below.
# For additional information regarding the format and rule options, please see:
# https://github.com/browserslist/browserslist#queries

# For the full list of supported browsers by the Angular framework, please see:
# https://angular.io/guide/browser-support

# You can see what browsers were selected by your queries by running:
#   npx browserslist

last 1 Chrome version
last 1 Firefox version
last 2 Edge major versions
last 2 Safari major versions
last 2 iOS major versions
Firefox ESR
not IE 11 # Angular supports IE 11 only as an opt-in. To opt-in, remove the 'not' prefix on this line.
</code-example>

<code-example language="json" header="tsconfig.json">

{
  "compileOnSave": false,
  "compilerOptions": {
    "baseUrl": "./",
    "outDir": "./dist/out-tsc",
    "sourceMap": true,
    "declaration": false,
    "module": "esnext",
    "moduleResolution": "node",
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "importHelpers": true,
    "target": "es2015",
    "typeRoots": [
      "node_modules/@types"
    ],
    "lib": [
      "es2018",
      "dom"
    ]
  }
}

</code-example>

<div class="alert is-important">

   To see which browsers are supported and determine which settings meet to your browser support requirements, see the [Browserslist compatibility page](https://browserl.ist/?q=%3E+0.5%25%2C+last+2+versions%2C+Firefox+ESR%2C+not+dead%2C+not+IE+9-11).

</div>

The Browserslist configuration allows you to ignore browsers without ES2015 support. In this case, a single build is produced.

If your Browserslist configuration includes support for any legacy browsers, the build target in the TypeScript configuration determines whether the build will support differential loading.

{@a configuration-table }

| Browserslist | ES target | Build result |
| -------- | -------- | -------- |
| ES5 support disabled | es2015  | Single build, ES5 not required |
| ES5 support enabled  | es5     | Single build w/conditional polyfills for ES5 only |
| ES5 support enabled  | es2015  | Differential loading (two builds w/conditional polyfills) |

{@a test-and-serve}

## Local development in older browsers

Differential loading is not enabled by default for application projects that were generated with Angular CLI 10 and above.
The `ng serve`, `ng test`, and `ng e2e` commands, however, generate a single ES2015 build which cannot run in older browsers that don't support the modules, such as IE 11.

To maintain the benefits of differential loading, however, a better option is to define multiple configurations for `ng serve`, `ng e2e`, and `ng test`.

{@a differential-serve}

### Configuring serve for ES5

To do this for `ng serve`, create a new file, `tsconfig-es5.app.json` next to `tsconfig.app.json` with the following content.

<code-example language="json">

{
 "extends": "./tsconfig.app.json",
 "compilerOptions": {
     "target": "es5"
  }
}

</code-example>

In `angular.json` add two new configuration sections under the `build` and `serve` targets to point to the new TypeScript configuration.

<code-example language="json">

"build": {
  "builder": "@angular-devkit/build-angular:browser",
  "options": {
      ...
  },
  "configurations": {
    "production": {
        ...
    },
    "es5": {
      "tsConfig": "./tsconfig-es5.app.json"
    }
  }
},
"serve": {
  "builder": "@angular-devkit/build-angular:dev-server",
  "options": {
      ...
  },
  "configurations": {
    "production": {
     ...
    },
    "es5": {
      "browserTarget": "&lt;app-name&gt;:build:es5"
    }
  }
},

</code-example>

You can then run the `ng serve` command with this configuration. Make sure to replace `<app-name>` (in `"<app-name>:build:es5"`) with the actual name of the app, as it appears under `projects` in `angular.json`. For example, if your app name is `myAngularApp` the config will become `"browserTarget": "myAngularApp:build:es5"`.

<code-example language="none" class="code-shell">

ng serve --configuration es5

</code-example>

{@a differential-test}

### Configuring the test command

Create a new file, `tsconfig-es5.spec.json` next to `tsconfig.spec.json` with the following content.

<code-example language="json">

{
 "extends": "./tsconfig.spec.json",
 "compilerOptions": {
     "target": "es5"
  }
}

</code-example>

<code-example language="json">

"test": {
  "builder": "@angular-devkit/build-angular:karma",
  "options": {
      ...
  },
  "configurations": {
    "es5": {
      "tsConfig": "./tsconfig-es5.spec.json"
    }
  }
},

</code-example>

You can then run the tests with this configuration

<code-example language="none" class="code-shell">

ng test --configuration es5

</code-example>

### Configuring the e2e command

Create an [ES5 serve configuration](guide/deployment#configuring-serve-for-es5) as explained above, and configuration an ES5 configuration for the E2E target.

<code-example language="json">

"e2e": {
  "builder": "@angular-devkit/build-angular:protractor",
  "options": {
      ...
  },
  "configurations": {
	  "production": {
		  ...
	  },
    "es5": {
      "devServerTarget": "&lt;app-name&gt;:serve:es5"
    }
  }
},

</code-example>

You can then run the `ng e2e` command with this configuration. Make sure to replace `<app-name>` (in `"<app-name>:serve:es5"`) with the actual name of the app, as it appears under `projects` in `angular.json`. For example, if your app name is `myAngularApp` the config will become `"devServerTarget": "myAngularApp:serve:es5"`.

<code-example language="none" class="code-shell">

ng e2e --configuration es5

</code-example>
