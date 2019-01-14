<!--
# Deployment
-->
# 배포

When you are ready to deploy your Angular application to a remote server, you have various options for
deployment.

{@a dev-deploy}
{@a copy-files}

<!--
## Simplest deployment possible
-->
## 가장 간단한 배포 방법

<!--
For the simplest deployment, create a production build and copy the output directory to a web server.
-->
애플리케이션을 배포하는 방법중 가장 간단한 것은 애플리케이션을 운영용으로 빌드한 후에 생성되는 빌드 결과물을 웹 서버로 복사하는 것입니다.

<!--
1. Start with the production build:
-->
1. 애플리케이션을 운영용으로 빌드합니다.

  <code-example language="none" class="code-shell">
    ng build --prod
  </code-example>


<!--
2. Copy _everything_ within the output folder (`dist/` by default) to a folder on the server.
-->
2. 빌드 결과물이 생성된 폴더(기본 위치는 `dist/`)에 있는 _모든 파일_ 을 서버로 복사합니다.

3. Configure the server to redirect requests for missing files to `index.html`.
Learn more about server-side redirects [below](#fallback).

This is the simplest production-ready deployment of your application.

{@a deploy-to-github}

## Deploy to GitHub pages

Another simple way to deploy your Angular app is to use [GitHub Pages](https://help.github.com/articles/what-is-github-pages/).

1. You need to [create a GitHub account](https://github.com/join) if you don't have one, and then [create a repository](https://help.github.com/articles/create-a-repo/) for your project.
Make a note of the user name and project name in GitHub.

1. Build your project using Github project name, with the Angular CLI command [`ng build`](cli/build) and the options shown here:
   <code-example language="none" class="code-shell">
     ng build --prod --output-path docs --base-href <project_name>
    </code-example>

1. When the build is complete, make a copy of `docs/index.html` and name it `docs/404.html`.

1. Commit your changes and push.

1. On the GitHub project page, configure it to [publish from the docs folder](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).

You can see your deployed page at `https://<user_name>.github.io/<project_name>/`.

<div class="alert is-helpful">

Check out [angular-cli-ghpages](https://github.com/angular-buch/angular-cli-ghpages), a full featured package that does all this for you and has extra functionality.

</div>

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


* [Nginx](http://nginx.org/): use `try_files`, as described in
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

<hr>

{@a optimize}

## Production optimizations

The `--prod` _meta-flag_ engages the following build optimization features.

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

See [`ng build`](cli/build) for more about CLI build options and what they do.


{@a enable-prod-mode}

<!--
### Enable runtime production mode
-->
### 운영 모드 활성화하기

In addition to build optimizations, Angular also has a runtime production mode. Angular apps run in development mode by default, as you can see by the following message on the browser console:

<code-example format="nocode">
  Angular is running in the development mode. Call enableProdMode() to enable the production mode.
</code-example>

<!--
Switching to _production mode_ makes it run faster by disabling development specific checks such as the dual change detection cycles.
-->
애플리케이션이 동작하는 환경을 _운영 모드_ 로 변경하면 개발 모드에서 동작하는 이중 변화 감지 로직이 생략되기 때문에 애플리케이션 실행속도가 조금 더 빨라집니다.

When you enable production builds via `--prod` command line flag, the runtime production mode is enabled as well.

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
그리고 애플리케이션 초기 실행과 관련되지 않은 모듈은 Angular 라우터로 지연로딩하거나 [애플리케이션이 시작된 직후에](guide/router#preloading  "Preloading") 로딩할 수 있습니다.

<div class="alert is-helpful>

#### Don't eagerly import something from a lazy-loaded module

If you mean to lazy-load a module, be careful not import it
in a file that's eagerly loaded when the app starts (such as the root `AppModule`).
If you do that, the module will be loaded immediately.

The bundling configuration must take lazy loading into consideration.
Because lazy-loaded modules aren't imported in JavaScript, bundlers exclude them by default.
Bundlers don't know about the router configuration and can't create separate bundles for lazy-loaded modules.
You would have to create these bundles manually.

<!--
The CLI runs the
[Angular Ahead-of-Time Webpack Plugin](https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack)
which automatically recognizes lazy-loaded `NgModules` and creates separate bundles for them.
-->
Angular CLI는 [Angular AoT Webpack 플러그인](https://github.com/angular/angular-cli/tree/master/packages/%40ngtools/webpack)을 사용하기 때문에 지연로딩되는 `NgModule`을 자동으로 인식하고 번들링 파일을 생성합니다.

</div>

{@a measure}

<!--
### Measure performance
-->
### 성능 측정하기

<!--
You can make better decisions about what to optimize and how when you have a clear and accurate understanding of
what's making the application slow.
The cause may not be what you think it is.
You can waste a lot of time and money optimizing something that has no tangible benefit or even makes the app slower.
You should measure the app's actual behavior when running in the environments that are important to you.
-->
애플리케이션의 동작 성능을 최적화하려면 애플리케이션의 어떤 부분을 어떻게 수정해야 하는지 정확하게 알고 있는 것이 좋습니다.
하지만 애플리케이션을 잘 알고 있다고 해도 예상치 못한 결과는 언제든지 생길 수 있습니다.
수많은 시간과 자금을 들여 애플리케이션을 최적화했는데 이전과 크게 차이나지 않거나 오히려 더 느려질 수도 있습니다.
그래서 애플리케이션을 최적화 할 때는 실제로 동작하는 환경에서 어떻게 동작하는지 측정해야 합니다.

<!--
The
<a href="https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing" title="Chrome DevTools Network Performance">
Chrome DevTools Network Performance page</a> is a good place to start learning about measuring performance.
-->
애플리케이션의 성능을 측정할 때는 <a href="https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing" title="Chrome DevTools Network Performance">Chrome 개발자도구의 네트워크 퍼포먼트 페이지</a>를 사용하는 것도 좋습니다.

<!--
The [WebPageTest](https://www.webpagetest.org/) tool is another good choice
that can also help verify that your deployment was successful.
-->
그리고 이미 배포된 애플리케이션은 [WebPageTest](https://www.webpagetest.org/)과 같은 툴로 성능을 측정할 수 있습니다.

{@a inspect-bundle}

<!--
### Inspect the bundles
-->
### 번들파일 분석하기

<!--
The <a href="https://github.com/danvk/source-map-explorer/blob/master/README.md">source-map-explorer</a>
tool is a great way to inspect the generated JavaScript bundles after a production build.
-->
애플리케이션을 운영용으로 빌드한 후라면 <a href="https://github.com/danvk/source-map-explorer/blob/master/README.md">source-map-explorer</a>를 사용해서 JavaScript로 번들링 된 파일을 분석할 수 있습니다.

<!--
Install `source-map-explorer`:
-->
`source-map-explorer`는 다음 명령어로 설치합니다:

<code-example language="none" class="code-shell">
  npm install source-map-explorer --save-dev
</code-example>

<!--
Build your app for production _including the source maps_
-->
그리고 애플리케이션을 운영용으로 빌드하면서 _소스 맵_ 을 함께 생성합니다.

<code-example language="none" class="code-shell">
  ng build --prod --source-map
</code-example>

<!--
List the generated bundles in the `dist/` folder.
-->
빌드가 끝나면 `dist/` 폴더의 내용을 확인해 봅시다.

<code-example language="none" class="code-shell">
  ls dist/*.bundle.js
</code-example>

<!--
Run the explorer to generate a graphical representation of one of the bundles.
The following example displays the graph for the _main_ bundle.
-->
이제 `source-map-explorer`로 번들링 파일을 로드하면 번들링 파일의 구조를 시각화해볼 수 있습니다.
예를 들어 _main_ 파일이 번들링된 결과물을 분석하려면 다음과 같이 실행합니다.

<code-example language="none" class="code-shell">
  node_modules/.bin/source-map-explorer dist/main.*.bundle.js
</code-example>

<!--
The `source-map-explorer` analyzes the source map generated with the bundle and draws a map of all dependencies,
showing exactly which classes are included in the bundle.
-->
그러면 `source-map-explorer`가 번들링 결과물과 소스 맵을 분석해서 이 번들링 파일에 어떤 클래스가 포함되어 있는지 분석할 수 있습니다.

<!--
Here's the output for the _main_ bundle of the QuickStart.
-->
퀵스타트 프로젝트의 _main_ 파일을 번들링한 결과로 이 프로그램을 실행시켜보면 다음과 같은 결과를 확인할 수 있습니다.

<figure>
  <img src="generated/images/guide/cli-quickstart/quickstart-sourcemap-explorer.png" alt="quickstart sourcemap explorer">
</figure>

{@a base-tag}

<!--
## The `base` tag
-->
## `base` 태그

<!--
The HTML [_&lt;base href="..."/&gt;_](/guide/router)
specifies a base path for resolving relative URLs to assets such as images, scripts, and style sheets.
For example, given the `<base href="/my/app/">`, the browser resolves a URL such as `some/place/foo.jpg`
into a server request for `my/app/some/place/foo.jpg`.
During navigation, the Angular router uses the _base href_ as the base path to component, template, and module files.
-->
이미지 파일이나 스크립트 파일, 스타일 시트는 상대 URL로 참조하는데, 상대 URL이 시작하는 위치는 HTML 문서에 [_&lt;base href="..."/&gt;_](/guide/router)로 지정합니다.
그래서 예를 들어 `<base href="/my/app/">`라고 지정된 HTML 문서가 있고 `some/place/foo.jpg` 경로의 이미지 파일을 참조한다고 하면, 결과적으로 `my/app/some/place/foo.jpg` 경로에 요청을 보내게 됩니다.
그리고 Angular 라우터를 사용해서 네비게이션을 할 때도 _base href_ 를 참조해서 컴포넌트의 위치를 결정하며, 템플릿과 모듈 파일을 참조할 때도 이 주소를 기본으로 사용합니다.

<div class="alert is-helpful">

<!--
See also the [*APP_BASE_HREF*](api/common/APP_BASE_HREF "API: APP_BASE_HREF") alternative.
-->
[*APP_BASE_HREF*](api/common/APP_BASE_HREF "API: APP_BASE_HREF")를 사용하면 이 동작을 대체할 수 있습니다.

</div>

<!--
In development, you typically start the server in the folder that holds `index.html`.
That's the root folder and you'd add `<base href="/">` near the top of `index.html` because `/` is the root of the app.
-->
개발 중에는 일반적으로 `index.html`이 있는 폴더를 서버로 띄웁니다.
이 경우에는 `index.html` 파일 위쪽에 `<base href="/">`를 지정하면 애플리케이션 최상위 주소를 `/`로 연결할 수 있습니다.

<!--
But on the shared or production server, you might serve the app from a subfolder.
For example, when the URL to load the app is something like `http://www.mysite.com/my/app/`,
the subfolder is `my/app/` and you should add `<base href="/my/app/">` to the server version of the `index.html`.
-->
하지만 다른 앱과 함께 사용하는 서버라면 애플리케이션을 서브 폴더에 두어야 하는 경우도 생깁니다.
그래서 애플리케이션이 시작되는 위치가 `http://www.mysite.com/my/app/`이고 이 애플리케이션이 위치하는 폴더가 `my/app/`이라면 `index.html` 파일에서 기본 주소를 `<base href="/my/app/">`으로 지정해야 합니다.

<!--
When the `base` tag is mis-configured, the app fails to load and the browser console displays `404 - Not Found` errors
for the missing files. Look at where it _tried_ to find those files and adjust the base tag appropriately.
-->
`base` 태그가 잘못된 값으로 설정되면 애플리케이션 파일을 찾을 수 없기 때문에 애플리케이션을 실행할 수 없고 브라우저 콘솔에 `404 - Not Found` 에러가 출력됩니다.
이 에러가 발생하면 `base` 태그값을 바꿔보면서 정확한 위치를 지정해야 합니다.

## Building and serving for deployment

When you are designing and developing applications, you typically use `ng serve` to build your app for fast, local, iterative development.
When you are ready to deploy, however, you must use the `ng build` command to build the app and deploy the build artifacts elsewhere.

Both `ng build` and `ng serve` clear the output folder before they build the project, but only the `ng build` command writes the generated build artifacts to the output folder.

<div class="alert is-helpful">

<!--
The output folder is  `dist/` by default.
To output to a different folder, change the `outputPath` in `angular.json`.
-->
빌드 결과물이 생성되는 폴더의 기본값은 `dist/` 입니다.
다른 폴더에 빌드 결과물을 생성하려면 `angular.json` 파일의 `outputPath`를 수정하세요.

</div>

The `ng serve` command builds, watches, and serves the application from local memory, using a local development server.
When you have deployed your app to another server, however, you might still want to serve the app so that you can continue to see changes that you make in it.
You can do this by adding the `--watch` option to the `ng build` command.

```
ng build --watch
```
Like the `ng serve` command, this regenerates output files when source files change.

For complete details of the CLI commands, see the [CLI command reference](cli).
