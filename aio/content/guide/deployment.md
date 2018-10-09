<!--
# Deployment
-->
# 배포

<!--
This page describes techniques for deploying your Angular application to a remote server.
-->
이 문서는 Angular 애플리케이션을 리모트 서버에 배포하는 방법을 안내합니다.

{@a dev-deploy}
{@a copy-files}

<!--
## Simplest deployment possible
-->
## 가장 간단한 배포 방법

<!--
For the simplest deployment, build for development and copy the output directory to a web server.
-->
가장 간단한 방법은 개발하던 애플리케이션을 빌드하고 빌드 결과물을 웹 서버로 복사하는 것입니다.

<!--
1. Start with the development build
-->
1. 애플리케이션을 빌드합니다.

  <code-example language="none" class="code-shell">
    ng build
  </code-example>


<!--
2. Copy _everything_ within the output folder (`dist/` by default) to a folder on the server.
-->
2. 빌드 결과물이 생성된 폴더(기본 위치는 `dist/`)에 있는 _모든 파일_ 을 서버로 복사합니다.

<!--
3. If you copy the files into a server _sub-folder_, append the build flag, `--base-href` and set the `<base href>` appropriately.<br><br>

  For example, if the `index.html` is on the server at `/my/app/index.html`, set the _base href_  to
  `<base href="/my/app/">` like this.

  <code-example language="none" class="code-shell">
    ng build --base-href=/my/app/
  </code-example>

  You'll see that the `<base href>` is set properly in the generated `dist/index.html`.<br><br>
  If you copy to the server's root directory, omit this step and leave the `<base href>` alone.<br><br>
  Learn more about the role of `<base href>` [below](guide/deployment#base-tag).
-->
3. 만약 서버의 _하위 폴더_ 에 빌드 결과물이 위치해야 한다면, 빌드 옵션에 `--base-href`을 지정해서 `<base href>`를 설정해야 합니다.<br><br>

  예를 들어 `index.html` 파일의 위치가 서버에서 `/my/app/index.html`이라면 `<base href="/my/app/">`와 같이 지정되어야 하는데, 다음 명령을 실행하면 됩니다.

  <code-example language="none" class="code-shell">
    ng build --base-href=/my/app/
  </code-example>

  이 옵션을 지정하면 `index.html` 파일 안의 `<base href>`의 위치가 지정하나 값으로 변경됩니다.
  서버의 최상위 폴더에 빌드 결과물이 위치한다면 이 단계를 건너뛰고 `<base href>`는 그대로 두면 됩니다.<br><br>
  자세한 내용은 [아래](guide/deployment#base-tag)에서 설명하는 `<base href>` 내용을 참고하세요.


<!--
4. Configure the server to redirect requests for missing files to `index.html`.
Learn more about server-side redirects [below](guide/deployment#fallback).
-->
4. 서버에서 파일을 요청하면 이 요청을 `index.html`로 리다이렉트하도록 설정합니다. 서버의 리다이렉트 동작은 [아래](guide/deployment#fallback) 섹션을 참고하세요.


<!--
This is _not_ a production deployment. It's not optimized and it won't be fast for users.
It might be good enough for sharing your progress and ideas internally with managers, teammates, and other stakeholders.
-->
하지만 이 방식이 진정한 운영용 배포는 _아닙니다_. 이 과정이 실행되는 동안 빌드 결과물은 최적화되지 않으며 사용자가 사용할 때도 그렇게 빠르다고 느끼지 않을 것입니다.
이 방식은 매니저와 팀원들과 함께 프로젝트의 진행률을 확인하거나 계획했던 방향으로 구현이 되고 있는지 단순하게 확인하는 용도로 사용하는 것이 좋습니다.

{@a optimize}

<!--
## Optimize for production
-->
## 배포용 빌드 최적화하기

<!--
Although deploying directly from the development environment works, 
you can generate an optimized build with additional CLI command line flags,
starting with `--prod`.
-->
단순하게 애플리케이션을 빌드해도 이 애플리케이션이 동작하는 것에는 문제가 없지만, Angular CLI 명령을 실행하면서 `--prod` 옵션을 주면 빌드 결과물을 좀 더 최적화할 수 있습니다.

<!--
### Build with _--prod_
-->
### _--prod_ 옵션으로 빌드하기

<code-example language="none" class="code-shell">
  ng build --prod
</code-example>

<!--
The `--prod` _meta-flag_ engages the following optimization features.
-->
`--prod` _메타 플래그(meta flag)_ 를 사용하면 다음과 같은 최적화 옵션이 적용됩니다.

<!--
* [Ahead-of-Time (AOT) Compilation](guide/aot-compiler): pre-compiles Angular component templates.
* [Production mode](#enable-prod-mode): deploys the production environment which enables _production mode_.
* Bundling: concatenates your many application and library files into a few bundles.
* Minification: removes excess whitespace, comments, and optional tokens.
* Uglification: rewrites code to use short, cryptic variable and function names.
* Dead code elimination: removes unreferenced modules and much unused code.
-->
* [AOT 컴파일러](guide/aot-compiler) 사용: Angular 컴포넌트의 템플릿을 미리 컴파일합니다.
* [운영 모드](#enable-prod-mode) 활성화: 애플리케이션이 동작하는 환경을 _운영 모드_ 로 변경합니다.
* 번들링(Bundling): 애플리케이션 파일과 라이브러리 파일들을 묶어서 몇개의 번들링 파일로 생성합니다.
* 코드 압축(Minification): 공백 문자, 주석, 옵션 토큰을 제거합니다.
* 난독화(Uglification): 변수와 함수 이름을 난독화하고 이름의 길이도 짧게 줄입니다.
* 데드 코드 제거: 사용하지 않는 모듈과 코드를 제거합니다.

<!---
The remaining [copy deployment steps](#copy-files) are the same as before.
-->
애플리케이션 빌드 이후에 [복사하는 과정](#copy-files)은 옵션을 사용하지 않을 때와 같습니다.

<!--
You may further reduce bundle sizes by adding the `build-optimizer` flag.
-->
그리고 여기에 `build-optimizer` 옵션을 함께 사용하면 최종 빌드 결과물의 크기를 더 줄일 수 있습니다.

<code-example language="none" class="code-shell">
  ng build --prod --build-optimizer
</code-example>

<!--
See the [CLI Documentation](https://github.com/angular/angular-cli/wiki/build) 
for details about available build options and what they do.
-->
애플리케이션 빌드에 사용할 수 있는 명령은 [CLI 문서](https://github.com/angular/angular-cli/wiki/build)를 참고하세요.

{@a enable-prod-mode}

<!--
### Enable production mode
-->
### 운영 모드 활성화하기

<!--
Angular apps run in development mode by default, as you can see by the following message on the browser
console:
-->
기본적으로 Angular 앱은 개발 모드로 동작하기 때문에 브라우저 콘솔을 확인해보면 다음과 같은 메시지가 표시되는 것을 확인할 수 있습니다.

<code-example format="nocode">
  Angular is running in the development mode. Call enableProdMode() to enable the production mode.
</code-example>

<!--
Switching to _production mode_ can make it run faster by disabling development specific checks such as the dual change detection cycles.
-->
애플리케이션이 동작하는 환경을 _운영_ 모드_ 로 변경하면 개발 모드에서 동작하는 이중 변화 감지 로직이 생략되기 때문에 애플리케이션 실행속도가 조금 더 빨라집니다.

<!--
Building for production (or appending the `--environment=prod` flag) enables _production mode_
Look at the CLI-generated `main.ts` to see how this works.
-->
애플리케이션을 운영 모드로 빌드하거나 `--environment=prod` 플래그로 실행하면 _운영 모드_ 를 활성화할 수 있습니다.

{@a lazy-loading}

<!--
### Lazy loading
-->
### 지연 로딩

<!--
You can dramatically reduce launch time by only loading the application modules that
absolutely must be present when the app starts.
-->
전체 모듈 중에서 애플리케이션 초기 실행에 필요한 모듈만 로딩하면 애플리케이션 초기 실행 속도를 훨씬 빠르게 만들 수 있습니다.

<!--
Configure the Angular Router to defer loading of all other modules (and their associated code), either by
[waiting until the app has launched](guide/router#preloading  "Preloading")
or by [_lazy loading_](guide/router#asynchronous-routing "Lazy loading")
them on demand.
-->
애플리케이션 초기 실행과 관련되지 않은 모듈은 Angular 라우터로 지연로딩하거나 [애플리케이션이 시작된 직후에](guide/router#preloading  "Preloading") 로딩할 수 있습니다.

<!--
#### Don't eagerly import something from a lazy loaded module
-->
#### 지연로딩 모듈되는 모듈에 있는 것을 직접 로드하지 마세요.

<!--
It's a common mistake.
You've arranged to lazy load a module.
But you unintentionally import it, with a JavaScript `import` statement,
in a file that's eagerly loaded when the app starts, a file such as the root `AppModule`.
If you do that, the module will be loaded immediately.
-->
개발자들이 많이 하는 실수가 있습니다.
모듈은 지연로딩하도록 설정해두고 이 모듈에 있는 것을 JavaScript `import`로 로드하면, 이 파일은 애플리케이션이 시작되면서 즉시 로드됩니다.
그러면 모듈도 즉시 로딩되기 때문에 지연로딩하는 의미가 없습니다.

<!--
The bundling configuration must take lazy loading into consideration.
Because lazy loaded modules aren't imported in JavaScript (as just noted), bundlers exclude them by default.
Bundlers don't know about the router configuration and won't create separate bundles for lazy loaded modules.
You have to create these bundles manually.
-->
지연로딩을 사용한다면 번들링 설정을 조정해야 합니다.
왜냐하면 지연로딩되는 모듈은 애플리케이션 실행 로직에 포함되지 않기 때문에 번들러가 이 모듈을 제외시키기 때문입니다.
번들러는 라우터 설정을 이해하지 못하며 지연로딩되는 모듈에 대한 번들링 파일도 만들지 않을 것입니다.
지연로딩되는 모듈은 번들링 옵션을 통해 번들링될 수 있도록 해야 합니다.

<!--
The CLI runs the
[Angular Ahead-of-Time Webpack Plugin](https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack)
which automatically recognizes lazy loaded `NgModules` and creates separate bundles for them.
-->
Angular CLI는 [Angular AoT Webpack 플러그인](https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack)을 사용하기 때문에 지연로딩되는 `NgModule`을 인식할 수 있고 개별 모듈마다 번들링 파일을 생성합니다.

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
  ng build --prod --source-map
</code-example>

List the generated bundles in the `dist/` folder.

<code-example language="none" class="code-shell">
  ls dist/*.bundle.js
</code-example>

Run the explorer to generate a graphical representation of one of the bundles.
The following example displays the graph for the _main_ bundle.

<code-example language="none" class="code-shell">
  node_modules/.bin/source-map-explorer dist/main.*.bundle.js
</code-example>

The `source-map-explorer` analyzes the source map generated with the bundle and draws a map of all dependencies,
showing exactly which classes are included in the bundle.

Here's the output for the _main_ bundle of the QuickStart.

<figure>
  <img src="generated/images/guide/cli-quickstart/quickstart-sourcemap-explorer.png" alt="quickstart sourcemap explorer">
</figure>

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

## _build_ vs. _serve_

You'll probably prefer `ng build` for deployments.

The **ng build** command is intended for building the app and deploying the build artifacts elsewhere.
The **ng serve** command is intended for fast, local, iterative development.

Both `ng build` and `ng serve` **clear the output folder** before they build the project.
The `ng build` command writes generated build artifacts to the output folder.
The `ng serve` command does not.
It serves build artifacts from memory instead for a faster development experience.

<div class="alert is-helpful">

The output folder is  `dist/` by default.
To output to a different folder, change the `outputPath` in `angular.json`.

</div>

The `ng serve` command builds, watches, and serves the application from a local CLI development server.

The `ng build` command generates output files just once and does not serve them.
The `ng build --watch` command will regenerate output files when source files change.
This `--watch` flag is useful if you're building during development and 
are automatically re-deploying changes to another server.


See the [CLI `build` topic](https://github.com/angular/angular-cli/wiki/build) for more details and options.

<hr>

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
[rewrite rule](http://httpd.apache.org/docs/current/mod/mod_rewrite.html) to the `.htaccess` file as shown
  (https://ngmilk.rocks/2015/03/09/angularjs-html5-mode-or-pretty-urls-on-apache-using-htaccess/):

  <code-example format=".">
    RewriteEngine On
    &#35 If an existing asset or directory is requested go to it as it is
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
    RewriteRule ^ - [L]

    &#35 If the requested resource doesn't exist, use index.html
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
<i>cross-origin resource sharing</i></a> error when making a service request (typically a data service request)
to a server other than the application's own host server.
Browsers forbid such requests unless the server permits them explicitly.

There isn't anything the client application can do about these errors.
The server must be configured to accept the application's requests.
Read about how to enable CORS for specific servers at
<a href="http://enable-cors.org/server.html" title="Enabling CORS server">enable-cors.org</a>.
