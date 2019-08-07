<!--
# Deployment
-->
# 배포

<!--
When you are ready to deploy your Angular application to a remote server, you have various options for deployment.
-->
이 문서는 Angular 애플리케이션을 리모트 서버에 배포하는 방법에 대해 자세하게 안내합니다.

{@a dev-deploy}
{@a copy-files}

<!--
## Simple deployment options
-->
## 간단한 배포 옵션

<!--
Before fully deploying your application, you can test the process, build configuration, and deployed behavior by using one of these interim techniques
-->
Angular가 제공하는 배포 도구를 활용하면 애플리케이션을 배포가 이루어지는 각 단계가 제대로 동작하는지, 빌드 설정은 올바른지, 배포 동작은 제대로 수행되는지 확인할 수 있습니다.

<!--
### Building and serving from disk
-->
### 로컬 환경에서 빌드하고 실행해보기

<!--
During development, you typically use the `ng serve` command to build, watch, and serve the application from local memory, using [webpack-dev-server](https://webpack.js.org/guides/development/#webpack-dev-server).
When you are ready to deploy, however, you must use the `ng build` command to build the app and deploy the build artifacts elsewhere.

Both `ng build` and `ng serve` clear the output folder before they build the project, but only the `ng build` command writes the generated build artifacts to the output folder.
-->
앱을 개발하는 단계에서는 보통 `ng serve` 명령을 실행해서 코드가 변경되는 것을 감지하는 모드로 앱을 빌드하는데, 이렇게 빌드한 애플리케이션은 로컬 메모리에서 실행되는 [webpack-dev-server](https://webpack.js.org/guides/development/#webpack-dev-server)로 띄워볼 수 있습니다.
하지만 제대로 배포하려면 이 명령 대신 `ng build` 명령을 실행해서 애플리케이션 빌드 결과물을 로컬 환경에 파일로 생성해야 합니다.

`ng serve` 명령과 `ng build` 명령은 모두 프로젝트를 빌드하기 전에 빌드 결과물이 생성될 폴더를 깨끗하게 비웁니다. 이 때 `ng serve` 명령이 대상 폴더에 빌드 결과물을 생성하지 않는 것과 다르게, `ng build` 명령을 실행하면 대상 폴더에 빌드 결과물을 실제로 생성합니다.

<div class="alert is-helpful">

<!--
The output folder is  `dist/project-name/` by default.
To output to a different folder, change the `outputPath` in `angular.json`.
-->
따로 수정하지 않았다면 빌드 결과물이 생성되는 위치는 `dist/프로젝트-이름` 폴더입니다.
이 위치를 변경하려면 `angular.json` 파일에 지정된 `outputPath` 옵션을 변경하면 됩니다.

</div>

<!--
As you near the end of the development process, serving the contents of your output folder from a local web server can give you a better idea of how your application will behave when it is deployed to a remote server.
You will need two terminals to get the live-reload experience.

* On the first terminal, run the [`ng build` command](cli/build) in *watch* mode to compile the application to the `dist` folder.
-->
개발 단계를 마무리할 때쯤 되었을 때 `ng build` 명령을 실행해서 애플리케이션을 빌드해보면, 빌드 결과물이 실제로 로컬 환경에 생성되기 때문에 리모트 서버에 이 파일들을 어떻게 둬야 하는지 생각해 볼 수 있습니다.
이 과정은 다음과 같은 방법으로 확인할 수도 있습니다.

* 터미널에서 [`ng build` 명령](cli/build)을 실행하면서 *워치* 모드를 활성화할 수 있습니다. 이렇게 실행하면 애플리케이션 코드가 변경될 때마다 `dist` 폴더의 내용물도 다시 생성됩니다. `ng serve` 명령이 실행되는 동작과 비슷합니다.

  <code-example language="none" class="code-shell">
   ng build --watch
  </code-example>

<!--
  Like the `ng serve` command, this regenerates output files when source files change.

* On the second terminal, install a web server (such as [lite-server](https://github.com/johnpapa/lite-server)), and run it against the output folder. For example:
-->
* 아니면 [lite-server](https://github.com/johnpapa/lite-server)와 같은 웹 서버를 실행해서 빌드 결과물이 위치한 폴더를 직접 띄워볼 수도 있습니다. 보통 이렇게 실행합니다:

  <code-example language="none" class="code-shell">
   lite-server --baseDir="dist"
  </code-example>
<!--
   The server will automatically reload your browser when new files are output.
-->
   이 방법도 이전과 마찬가지로 빌드 결과물 파일이 변경되면 브라우저에도 새로운 파일의 내용이 반영됩니다.

<div class="alert is-critical">

<!--
This method is for development and testing only, and is not a supported or secure way of deploying an application.
-->
위에서 설명한 방법은 애플리케이션을 개발하거나 테스트하는 용도로만 사용하세요. 이 방법은 애플리케이션을 온전히 배포하는 방법은 아닙니다.

</div>

<!--
### Basic deployment to a remote server
-->
### 리모트 서버에 배포하기

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

<!--
3. Configure the server to redirect requests for missing files to `index.html`.
Learn more about server-side redirects [below](#fallback).

This is the simplest production-ready deployment of your application.
-->
3. 서버로 오는 요청 중에서 실제로 존재하지 않는 파일에 대한 요청은 `index.html`로 리다이렉트하도록 합니다.
자세한 내용은 [아래](#fallback)에서 다룹니다.

이 방법이 애플리케이션을 배포하는 방법 중 가장 간단한 방법입니다.

{@a deploy-to-github}

<!--
### Deploy to GitHub pages
-->
### GitHub 페이지에 배포하기

<!--
Another simple way to deploy your Angular app is to use [GitHub Pages](https://help.github.com/articles/what-is-github-pages/).

1. You need to [create a GitHub account](https://github.com/join) if you don't have one, and then [create a repository](https://help.github.com/articles/create-a-repo/) for your project.
Make a note of the user name and project name in GitHub.

1. Build your project using Github project name, with the Angular CLI command [`ng build`](cli/build) and the options shown here:
-->
또 다른 방법은 Angular 앱을 [GitHub Pages](https://help.github.com/articles/what-is-github-pages/)에 배포하는 것입니다.

1. GitHub 페이지에 배포하려면 먼저 [GitHub 계정을 생성](https://github.com/join)해야 합니다. 그리고 프로젝트가 위치할 [코드 저장소를 하나 만듭니다](https://help.github.com/articles/create-a-repo/).

1. Github 프로젝트 이름을 기본 주소로 지정하면서 Angular 프로젝트를 빌드합니다. [`ng build`](cli/build)를 실행할 때 옵션을 다음과 같이 사용하면 됩니다:
   <code-example language="none" class="code-shell">
     ng build --prod --output-path docs --base-href /<project_name>/
    </code-example>

<!--
1. When the build is complete, make a copy of `docs/index.html` and name it `docs/404.html`.

1. Commit your changes and push.

1. On the GitHub project page, configure it to [publish from the docs folder](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch).

You can see your deployed page at `https://<user_name>.github.io/<project_name>/`.
-->
3. 빌드가 끝나면 `docs/index.html` 파일을 복사해서 `docs/404.html` 파일을 생성합니다.

1. 변경사항을 커밋하고 레파지토리에 푸시합니다.

1. GitHub 프로젝트 페이지에서 [docs 폴더가 static으로 동작하도록 설정](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch)합니다.

이제 `https://<user_name>.github.io/<project_name>/`에 접속하면 Angular 애플리케이션이 동작하는 것을 확인할 수 있습니다.

<div class="alert is-helpful">

<!--
Check out [angular-cli-ghpages](https://github.com/angular-buch/angular-cli-ghpages), a full featured package that does all this for you and has extra functionality.
-->
[angular-cli-ghpages](https://github.com/angular-buch/angular-cli-ghpages)도 확인해 보세요.
이 프로젝트를 활용하면 Angular CLI를 사용하는 환경에서 GitHub 페이지 설정을 더 간단하고 다양하게 할 수 있습니다.

</div>

<hr>

{@a server-configuration}

<!--
## Server configuration
-->
## 서버 설정

<!--
This section covers changes you may have make to the server or to files deployed to the server.
-->
이 섹션에서는 Angular 애플리케이션을 서버에 배포할 때 수정해야 할 수도 있는 서버 설정에 대해 다룹니다.

{@a fallback}

<!--
### Routed apps must fallback to `index.html`
-->
### Angular 앱이 동작해야 하는 경우는 모두 `index.html`로 보내야 합니다.

<!--
Angular apps are perfect candidates for serving with a simple static HTML server.
You don't need a server-side engine to dynamically compose application pages because
Angular does that on the client-side.

If the app uses the Angular router, you must configure the server
to return the application's host page (`index.html`) when asked for a file that it does not have.
-->
Angular 애플리케이션은 간단한 정적 HTML 서버로 호스팅하는 것도 아주 간단합니다.
이 경우에는 Angular 애플리케이션이 클라이언트에서 실행되기 때문에 서버에서 동적으로 애플리케이션 페이지를 처리해야 하는 엔진도 필요 없습니다.

그런데 Angular 애플리케이션을 이렇게 활용하는 경우에는 실제로 존재하는 파일을 요청하지 않는 이상 모든 GET 요청이 Angular 호스트 페이지(`index.html`)로 향하도록(fallback) 서버 설정을 조정해야 합니다.

{@a deep-link}

<!--
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
-->
Angular 라우터를 사용하는 애플리케이션은 "딥 링크(deep links)"를 지원해야 합니다.
Angular에서 _딥 링크_ 란 Angular 애플리케이션 안에 있는 특정 컴포넌트를 가리키는 URL을 의미합니다.
그래서 `http://www.mysite.com/heroes/42`라는 _딥 링크_ 는 `id: 42`에 해당하는 히어로의 상세 정보를 표현하는 페이지를 가리킵니다.

이 주소는 클라이언트쪽에서 네비게이션하는 방식으로 이동했을 때는 전혀 문제가 없습니다.
Angular 라우터가 이 URL을 확인하면 해당 페이지로 이동하고 원하는 히어로의 정보도 화면에 표시할 것입니다.

그런데 이메일에 있는 링크를 클릭하거나 브라우저 주소표시줄에 이 주소를 직접 입력했을 때, 히어로 상세정보 페이지에서 브라우저를 새로고침한 경우에는 이 주소를 브라우저가 직접 처리하기 때문에 Angular 애플리케이션이 관여하는 영역을 _벗어나게_ 됩니다.
그래서 이 경우에는 브라우저가 Angular 라우터를 건너뛰고 해당 URL로 직접 서버 요청을 보냅니다.

일반적으로 정적 서버는 `http://www.mysite.com`과 같은 요청을 받았을 때 `index.html`을 반환합니다.
하지만 `http://www.mysite.com/heroes/42`라는 요청을 정적 서버가 받으면 `index.html`을 보내도록 따로 설정하지 않은 이상 `404 - Not Found`를 반환합니다.

<!--
#### Fallback configuration examples
-->
#### 폴백(fallback) 설정 예

<!--
There is no single configuration that works for every server.
The following sections describe configurations for some of the most popular servers.
The list is by no means exhaustive, but should provide you with a good starting point.

* [Apache](https://httpd.apache.org/): add a
[rewrite rule](http://httpd.apache.org/docs/current/mod/mod_rewrite.html) to the `.htaccess` file as shown
  (https://ngmilk.rocks/2015/03/09/angularjs-html5-mode-or-pretty-urls-on-apache-using-htaccess/):
-->
모든 서버에 동일하게 적용할 수 있는 만능 설정은 없습니다.
그래서 이제부터는 개발자들이 많이 사용하는 서버를 대상으로 폴백을 어떻게 설정할 수 있는지 알아봅시다.
이 문서에서 모든 서버를 다루지는 않지만, 이렇게 사용한다는 것을 참고하면 설명하지 않은 서버를 설정할 때도 도움이 될 것입니다.

* [Apache](https://httpd.apache.org/): `.htaccess` 파일에 [rewrite rule](http://httpd.apache.org/docs/current/mod/mod_rewrite.html)을 추가합니다. ([참고](https://ngmilk.rocks/2015/03/09/angularjs-html5-mode-or-pretty-urls-on-apache-using-htaccess/))

  <code-example format=".">
    RewriteEngine On
    &#35 서버에 존재하는 리소스나 폴더를 요청하면 해당 리소스를 보냅니다.
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -f [OR]
    RewriteCond %{DOCUMENT_ROOT}%{REQUEST_URI} -d
    RewriteRule ^ - [L]

    &#35 실제로 존재하지 않는 리소스를 요청하면 index.html을 보냅니다.
    RewriteRule ^ /index.html
  </code-example>


<!--
* [Nginx](http://nginx.org/): use `try_files`, as described in
[Front Controller Pattern Web Apps](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/#front-controller-pattern-web-apps),
modified to serve `index.html`:
-->
* [Nginx](http://nginx.org/): [Front Controller Pattern Web Apps](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/#front-controller-pattern-web-apps)에서 설명하는 대로 `try_files`를 사용해서 `index.html`을 보내도록 설정합니다.

  <code-example format=".">
    try_files $uri $uri/ /index.html;
  </code-example>


<!--
* [IIS](https://www.iis.net/): add a rewrite rule to `web.config`, similar to the one shown
[here](http://stackoverflow.com/a/26152011/2116927):
-->
* [IIS](https://www.iis.net/): [이 글](http://stackoverflow.com/a/26152011/2116927)에서 설명한 것과 비슷하게 `web.config`에 rewrite rule을 추가합니다.

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

<!--
* [GitHub Pages](https://pages.github.com/): you can't
[directly configure](https://github.com/isaacs/github/issues/408)
the GitHub Pages server, but you can add a 404 page.
Copy `index.html` into `404.html`.
It will still be served as the 404 response, but the browser will process that page and load the app properly.
It's also a good idea to
[serve from `docs/` on master](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch)
and to
[create a `.nojekyll` file](https://www.bennadel.com/blog/3181-including-node-modules-and-vendors-folders-in-your-github-pages-site.htm)
-->
* [GitHub Pages](https://pages.github.com/): 개발자가 GitHub Pages 서버 설정을 [직접 변경할 수는 없지만](https://github.com/isaacs/github/issues/408), 404 페이지를 활용할 수 있습니다.
이 방법은 아주 간단합니다.
`index.html` 파일을 복사해서 `404.html` 파일로 만들기만 하면 됩니다.
그러면 서버가 404 응답을 반환하더라도 브라우저는 Angular 앱을 실행하기 때문에 원하는 페이지로 접근할 수 있습니다.
이 방법 외에도 [master 브랜치의 `docs/` 폴더](https://help.github.com/articles/configuring-a-publishing-source-for-github-pages/#publishing-your-github-pages-site-from-a-docs-folder-on-your-master-branch)에서 Angular 애플리케이션을 서비스하거나, [`.nojekyll` 파일을 만들어서](https://www.bennadel.com/blog/3181-including-node-modules-and-vendors-folders-in-your-github-pages-site.htm) 설정하는 방법도 있습니다.

<!--
* [Firebase hosting](https://firebase.google.com/docs/hosting/): add a
[rewrite rule](https://firebase.google.com/docs/hosting/url-redirects-rewrites#section-rewrites).
-->
* [Firebase hosting](https://firebase.google.com/docs/hosting/): [rewrite rule](https://firebase.google.com/docs/hosting/url-redirects-rewrites#section-rewrites)을 다음과 같이 추가합니다.

  <code-example format=".">
    "rewrites": [ {
      "source": "**",
      "destination": "/index.html"
    } ]

  </code-example>

{@a cors}

<!--
### Requesting services from a different server (CORS)
-->
### 다른 서버로 요청 보내기 (CORS)

<!--
Angular developers may encounter a
<a href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing" title="Cross-origin resource sharing">
<i>cross-origin resource sharing</i></a> error when making a service request (typically a data service request)
to a server other than the application's own host server.
Browsers forbid such requests unless the server permits them explicitly.

There isn't anything the client application can do about these errors.
The server must be configured to accept the application's requests.
Read about how to enable CORS for specific servers at
<a href="http://enable-cors.org/server.html" title="Enabling CORS server">enable-cors.org</a>.
-->
Angular 애플리케이션을 개발하다보면 애플리케이션이 호스팅되는 서버와 다른 서버로 요청을 보낼 때 <a href="https://en.wikipedia.org/wiki/Cross-origin_resource_sharing" title="Cross-origin resource sharing">
<i>교차 출처 리소스 공유(cross-origin resource sharing, CORS)</i></a> 에러가 발생하는 일이 종종 있습니다.
이 에러는 서버에서 명시적으로 허용하지 않는 한 거절됩니다.

이 에러가 발생할 때 클라이언트 애플리케이션 쪽에서 처리할 수 있는 것은 아무것도 없습니다.
클라이언트 애플리케이션이 요청하는 것을 서버가 처리할 수 있도록 서버의 설정을 변경해야 합니다.
서버 종류에 따라 CORS를 허용하는 방법은 <a href="http://enable-cors.org/server.html" title="Enabling CORS server">enable-cors.org</a> 문서를 참고하세요.

<hr>

{@a optimize}

<!--
## Production optimizations
-->
## 운영 배포 최적화

<!--
The `--prod` _meta-flag_ engages the following build optimization features.
-->
`--prod` _메타 플래그_ 를 사용하면 Angular 애플리케이션을 운영용으로 최적화해서 빌드할 수 있습니다.

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
* 난독화(Uglification): 변수와 함수 이름을 난독화하고 길이도 짧게 줄입니다.
* 데드 코드 제거: 사용하지 않는 모듈과 코드를 제거합니다.

<!--
See [`ng build`](cli/build) for more about CLI build options and what they do.
-->
이 때 활용할 수 있는 Angular CLI 빌드 옵션은 [`ng build`](cli/build) 문서를 참고하세요.


{@a enable-prod-mode}

<!--
### Enable runtime production mode
-->
### 운영 모드 활성화하기

<!--
In addition to build optimizations, Angular also has a runtime production mode. Angular apps run in development mode by default, as you can see by the following message on the browser console:
-->
빌드 최적화와 함께 Angular에도 운영 모드가 존재합니다.
Angular 애플리케이션은 기본적으로 개발모드로 동작하며, 이 모드에서는 브라우저 콘솔에 다음과 같은 메시지가 출력됩니다:

<code-example format="nocode">
  Angular is running in the development mode. Call enableProdMode() to enable the production mode.
</code-example>

<!--
Switching to _production mode_ makes it run faster by disabling development specific checks such as the dual change detection cycles.
-->
애플리케이션이 동작하는 환경을 _운영 모드_ 로 변경하면 개발 모드에서 동작하는 이중 변화 감지 로직이 생략되기 때문에 애플리케이션 실행속도가 조금 더 빨라집니다.

<!--
When you enable production builds via `--prod` command line flag, the runtime production mode is enabled as well.
-->
Angular 애플리케이션을 빌드할 때 `--prod` 플래그를 사용하면 Angular 실행 환경이 자동으로 운영 모드로 변경됩니다.

{@a lazy-loading}

<!--
### Lazy loading
-->
### 지연 로딩

<!--
You can dramatically reduce launch time by only loading the application modules that
absolutely must be present when the app starts.
-->
전체 모듈 중에서 애플리케이션 초기 실행에 필요한 모듈만 로딩하면 애플리케이션 초기 실행 속도를 더 빠르게 만들 수 있습니다.

<!--
Configure the Angular Router to defer loading of all other modules (and their associated code), either by
[waiting until the app has launched](guide/router#preloading  "Preloading")
or by [_lazy loading_](guide/router#asynchronous-routing "Lazy loading")
them on demand.
-->
그리고 애플리케이션 초기 실행과 관련되지 않은 모듈은 Angular 라우터로 지연로딩하거나 [애플리케이션이 시작된 직후에](guide/router#preloading  "Preloading") 로딩할 수 있습니다.

<div class="alert is-helpful">

<!--
#### Don't eagerly import something from a lazy-loaded module
-->
#### 지연로딩하는 모듈에 있는 심볼을 즉시로딩하지 마세요.

<!--
If you mean to lazy-load a module, be careful not import it
in a file that's eagerly loaded when the app starts (such as the root `AppModule`).
If you do that, the module will be loaded immediately.

The bundling configuration must take lazy loading into consideration.
Because lazy-loaded modules aren't imported in JavaScript, bundlers exclude them by default.
Bundlers don't know about the router configuration and can't create separate bundles for lazy-loaded modules.
You would have to create these bundles manually.
-->
지연로딩하는 모듈이 있다면 애플리케이션이 시작할 때 즉시 로드되는 모듈(ex. `AppModule`)에서 지연로딩되는 모듈의 구성요소를 로드하지 않도록 주의해야 합니다.
이런 경우에는 모듈이 지연로딩되지 않고 즉시 로드됩니다.

번들링 설정에서도 지연로딩을 고려해야 합니다.
왜냐하면 지연로딩되는 모듈은 기본 번들링 결과물에 포함되지 않고 따로 번들링되기 때문입니다.
하지만 번들러는 라우터 설정이나 지연로딩되는 모듈을 스스로 인식해서 가장 효율적인 방법으로 번들링하지는 않습니다.
이런 설정은 개발자가 직접 해줘야 합니다.

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
애플리케이션의 성능을 측정할 때는 <a href="https://developers.google.com/web/tools/chrome-devtools/network-performance/understanding-resource-timing" title="Chrome DevTools Network Performance">Chrome 개발자도구의 네트워크 퍼포먼트 페이지</a>를 사용하는 것이 좋습니다.

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
`source-map-explorer`는 다음 명령을 실행해서 설치합니다:

<code-example language="none" class="code-shell">
  npm install source-map-explorer --save-dev
</code-example>

<!--
Build your app for production _including the source maps_
-->
그리고 애플리케이션을 운영용으로 빌드할 때 _소스 맵_ 을 함께 생성하도록 다음과 같이 실행합니다.

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
그러면 `source-map-explorer`가 번들링 결과물과 소스 맵을 처리해서 이 번들링 파일에 어떤 클래스가 포함되어 있는지 분석할 수 있는 정보를 제공합니다.

<!--
Here's the output for the _main_ bundle of an example app called `cli-quickstart`.
-->
`cli-quickstart` 프로젝트의 _main_ 파일을 번들링한 결과로 이 프로그램을 실행시켜보면 다음과 같은 결과를 확인할 수 있습니다.

<figure>
  <img src="generated/images/guide/deployment/quickstart-sourcemap-explorer.png" alt="quickstart sourcemap explorer">
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
[*APP_BASE_HREF*](api/common/APP_BASE_HREF "API: APP_BASE_HREF")를 사용하면 이 설정을 대체할 수 있습니다.

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
`base` 태그가 잘못된 값으로 설정되면 애플리케이션 파일을 찾을 수 없기 때문에 애플리케이션을 실행할 수 없어서 브라우저 콘솔에 `404 - Not Found` 에러가 출력됩니다.
이 에러가 발생하면 `base` 태그값을 바꿔보면서 정확한 위치를 지정해야 합니다.


<!--
## Differential Loading
-->
## 선택적 로딩(Differential Loading)

<!--
When building web applications, making sure your application is compatible with the majority of browsers is a goal. Even as JavaScript continues to evolve, with new features being introduced, not all browsers are updated with support for these new features at the same pace. This is where compilation and [polyfills](guide/browser-support#polyfills) come in. The code you write in development using TypeScript is compiled and bundled into a format that is compatible with most browsers, commonly known as ES5. Polyfills are used bridge the gap, providing functionality that simply doesn't exist in some legacy browsers. 

There is a cost to ensure this browser compatibility, and it comes in the form of larger bundle size. All modern browsers support ES2015 and beyond, but in most cases, you still have to account for users accessing your application from a browser that doesn't. To maximize compatibility, you ship a single bundle that includes all your compiled code, plus any polyfills that may be needed. Users with modern browsers shouldn't pay the price of increased bundle size when used in a modern browser that supports many of the latest features in JavaScript. This is where differential loading comes into play.

Differential loading is a strategy where the CLI builds two separate bundles as part of your deployed application. The modern bundle contains modern syntax, takes advantage of built-in support in modern browsers, ships less polyfills, and results in a smaller bundle size. The second bundle, includes the additional compiled code, all necessary polyfills, and results in a larger bundle size. This strategy allows you to continue to build your web application to support multiple browsers, but only load the necessary code that the browser needs.
-->
애플리케이션은 결국 더 많은 브라우저에서 정상적으로 실행되는지가 가장 중요합니다. 하지만 JavaScript 자체도 새로운 기능을 도입하면서 끊임없이 진보하기 때문에 모든 브라우저들이 JavaScript 표준에 있는 기능을 같은 수준으로 지원하지는 않습니다. 그래서 해결책으로 컴파일이라는 과정과 [폴리필(polyfills)](guide/browser-support#polyfills)이라는 개념이 등장했습니다. 이제는 개발자가 TypeScript로 작성한 코드가 컴파일 단계를 거쳐 브라우저에서 원활하게 실행되는 ES5 코드로 변환됩니다. 그리고 이 과정에서 JavaScript 문법으로 새로 추가되어 브라우저가 아직 지원하지 않는 기능은 폴리필을 활용해서 지원하기도 합니다.

브라우저 호환성을 신경쓰다보면 번들 결과물의 크기가 점점 커질 수 있습니다. 최근에 나온 브라우저들은 보통 ES2015나 이후 버전을 지원하지만 그렇지 못한 브라우저를 사용하는 사용자가 있을 수 있고, 이런 사용자들을 위해 개발자가 작성한 코드 이외에 폴리필을 추가로 넣어야 하기 때문입니다. 하지만 최신 JavaScript 문법을 지원하는 브라우저를 사용하는 사용자는 이 증가분이 필요없습니다. 그래서 선택적 로딩이 등장했습니다.

선택적 로딩은 Angular CLI로 애플리케이션을 빌드할 때 이 애플리케이션의 빌드 결과물을 두 벌로 생성하는 방식입니다. 첫번째 세트에는 최신 JavaScript 문법을 지원하는 코드가 들어갑니다. 이 결과물에는 폴리필이 최소한으로 들어가기 때문에 번들 결과물의 크기도 상대적으로 작습니다. 그리고 두번째 세트에는 조금 더 낮은 JavaScript 버전으로 빌드된 코드와 오래된 브라우저에서 지원하지 않는 문법을 실행하기 위한 폴리필이 모두 포함되는데, 따라서 번들 결과물의 크기는 상대적으로 좀 더 큽니다. 선택적 로딩 방식을 사용하면 애플리케이션이 동작하는 브라우저를 더 확보할 수 있으면서도, 브라우저에 꼭 필요한 코드만 로딩할 수 있습니다.


<!--
### Differential builds
-->
### 선택적 빌드(Differential builds)

<!--
The Angular CLI handles differential loading for you as part of the _build_ process for deployment. The Angular CLI will produce the necessary bundles used for differential loading, based on your browser support requirements and compilation target. 

The Angular CLI uses two configurations for differential loading:

- Browserslist - The `browserslist` configuration file is included in your application [project structure](guide/file-structure#application-configuration-files) and provides the minimum browsers your application supports. See the [Browserslist spec](https://github.com/browserslist/browserslist) for complete configuration options.
- tsconfig.json - The `target` in the TypeScript `compilerOptions` determines the ECMAScript target version that the code is compiled to. Modern browsers support ES2015 natively, while ES5 is more commonly used to support legacy browsers.
-->
Angular는 CLI를 사용해서 애플리케이션을 배포용으로 _빌드_ 하는 단계에 선택적 로딩을 지원합니다. Angular CLI는 빌드하는 프로젝트에 지정된 브라우저 지원 정책이나 컴파일 대상을 분석한 후에 빌드 결과물을 선택적 로딩할 수 있게 생성합니다.

이 때 두 가지 환경설정 파일이 활용됩니다:

- `browserlist` - 애플리케이션 [프로젝트](guide/file-structure#application-configuration-files)에 생성된 Browserlist 설정 파일을 사용하면 애플리케이션이 지원해야 하는 브라우저 목록을 지정할 수 있습니다. 자세한 내용은 [Browserlist 스펙](https://github.com/browserslist/browserslist) 문서를 참고하세요.
- tsconfig.json - TypeScript 환경 설정 옵션 중에서 `compilerOptions.target` 옵션을 사용하면 TypeScript 코드를 어떤 ECMAScript 버전으로 컴파일할지 지정할 수 있습니다. 최신 브라우저들은 보통 ES2015를 기본으로 지원하지만, ES5 문법으로 컴파일하면 지원하는 브라우저를 더 확보할 수 있습니다.

<div class="alert is-helpful">

<!--
**Note:** Differential loading is currently only supported when using `es2015` as a compilation `target`. When used with targets higher than `es2015`, a warning is emitted during build time.
-->
**참고:** 선택적 로딩은 아직 컴파일 옵션 중 `target` 옵션을 `es2015`로 설정했을 때만 동작합니다. `es2015` 이후 버전을 지정했다면 빌드할 때 에러가 발생합니다.

</div>

<!--
The CLI queries the Browserslist configuration, and checks the `target` to determine if support for legacy browsers is required. The combination of these two configurations determines whether multiple bundles are produced when you create a _build_. When you create a development build using [`ng build`](cli/build) and differential loading is enabled, the output produced is simpler and easier to debug, allowing you to rely less on sourcemaps of compiled code. When you create a production build using [`ng build --prod`](cli/build), the CLI uses the defined configurations above to determine the bundles to build for deployment of your application. 

The `index.html` file is also modified during the build process to include script tags that enable differential loading. See the sample output below from the `index.html` file produced during a build using `ng build`.
-->
Angular CLI는 Browserlist 설정파일과 `target` 컴파일 옵션을 분석해서 어떤 폴리필이 필요한지 판단합니다. 이 상태에서 [`ng build`](cli/build) 명령을 실행하면 선택적 로딩이 활성화되지만 빌드 결과물은 원래 코드와 비슷하고 소스맵도 제공하기 때문에 디버깅하기 쉬운 상태로 생성됩니다. 그리고 [`ng build --prod`](cli/build) 명령을 실행해서 애플리케이션을 운영용으로 빌드하면 이 때는 조금 다른 형태로 빌드 결과물이 생성됩니다.

`index.html` 파일은 선택적 로딩을 지원하기 위해 `<script>` 태그 부분이 조금 수정됩니다. 아래 코드를 확인해 보세요.

```html
<!-- ... -->
<body>
  <app-root></app-root>
  <script src="runtime-es2015.js" type="module"></script>
  <script src="runtime-es5.js" nomodule></script>
  <script src="polyfills-es2015.js" type="module"></script>
  <script src="polyfills-es5.js" nomodule></script>
  <script src="styles-es2015.js" type="module"></script>
  <script src="styles-es5.js" nomodule></script>
  <script src="vendor-es2015.js" type="module"></script>
  <script src="vendor-es5.js" nomodule></script>
  <script src="main-es2015.js" type="module"></script>
  <script src="main-es5.js" nomodule></script>
</body>
<!-- ... -->
```

<!--
Each script tag has a `type="module"` or `nomodule` attribute. Browsers with native support for ES modules only load the scripts with the `module` type attribute and ignore scripts with the `nomodule` attribute. Legacy browsers only load the scripts with the `nomodule` attribute, and ignore the script tags with the `module` type that load ES modules. 
-->
이 코드에서 개별 `<script>` 태그에는 `type="module"` 이나 `nomodule`이라는 어트리뷰트가 있습니다. ES 모듈을 지원하는 브라우저는 `module` 타입 어트리뷰트가 지정된 스크립트 파일만 로드하며 `nomodule` 어트리뷰트가 지정된 스크립트 파일은 무시합니다. 그리고 오래된 브라우저들은 반대로 `nomodule` 어트리뷰트가 지정된 스크립트 파일만 로드하며 `module` 타입 어트리뷰트가 지정된 스크립트 파일은 무시합니다.

<div class="alert is-helpful">

<!--
**Note:** Some legacy browsers still download both bundles, but only execute the appropriate scripts based on the attributes mentioned above. You can read more on the issue [here](https://github.com/philipwalton/webpack-esnext-boilerplate/issues/1).
-->
**참고:** 그럼에도 불구하고 두 종류의 파일을 모두 다운받는 브라우저가 있을 수 있습니다. 하지만 이 경우에도 브라우저는 다운받은 스크립트 파일을 모두 실행하지 않고 위에서 설명한 것과 같은 방식으로 한 종류만 실행합니다. 자세한 내용은 [이 문서](https://github.com/philipwalton/webpack-esnext-boilerplate/issues/1)를 참고하세요.

</div>

<!--
See the [configuration table](#configuration-table) below for the configurations for enabling differential loading.
-->
선택적 로딩이 활성화되는 조건은 아래에 있는 [비교 표](#configuration-table)를 참고하세요.

<!--
### Configuring differential loading
-->
### 선택적 로딩 활성화하기

<!--
Differential loading for creating builds is already supported with version 8 and later of the Angular CLI. For each application project in your workspace, you can configure how builds are produced based on the mentioned `browserslist` and `tsconfig.json` files in your application project.

Look at the default configuration for a newly created Angular application:

The `browserslist` looks like this:
-->
선택적 로딩 설정은 Angular CLI 8 버전부터 이미 지원하고 있습니다. 워크스페이스에 있는 애플리케이션 프로젝트를 보면 `browserlist` 파일과 `tsconfig.json` 파일이 존재하는 것을 확인할 수 있습니다.

파일의 내용은 조금씩 달라질 수 있기 때문에 최신 Angular 애플리케이션에 생성된 파일을 기준으로 합시다.

`browserlist` 파일은 이렇게 구성됩니다:

```
> 0.5%
last 2 versions
Firefox ESR
not dead
not IE 9-11 # For IE 9-11 support, remove 'not'.
```

<!--
The `tsconfig.json` looks like this:
-->
그리고 `tsconfig.json` 파일은 이렇게 구성됩니다:


```
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
```

<!--
By default, legacy browsers such as IE 9-11 are ignored, and the compilation target is ES2015. As a result, this produces two builds, and differential loading is enabled. If you ignore browsers without ES2015 support, a single build is produced. To see the build result for differential loading based on different configurations, refer to the table below. 
-->
기본적으로 IE 9-11과 같이 오래된 브라우저는 지원하지 않고 컴파일 결과물도 ES2015 문법으로 생성합니다. 이 상태로 애플리케이션을 빌드하면 선택적 로딩을 지원하기 때문에 브라우저 빌드 결과물이 두 벌로 생성됩니다. 나중에 ES2015 문법을 지원하지 않는 브라우저를 지원 브라우저 목록에서 제외하면 빌드 결과물은 한 벌만 생성될 것입니다. 빌드 환경설정에 따라 빌드 결과물이 어떻게 생성되는지 확인하려면 아래 표를 참고하세요.

<div class="alert is-important">

<!--
**Note:** To see which browsers are supported with the above configuration, see which settings meet to your browser support requirements, see the [Browserslist compatibility page](https://browserl.ist/?q=%3E+0.5%25%2C+last+2+versions%2C+Firefox+ESR%2C+Chrome+41%2C+not+dead%2C+not+IE+9-11).
-->
**참고:** 위 설정이 구체적으로 어떤 브라우저를 지원하는 것인지 확인하려면 [Browserslist 호환성 페이지](https://browserl.ist/?q=%3E+0.5%25%2C+last+2+versions%2C+Firefox+ESR%2C+Chrome+41%2C+not+dead%2C+not+IE+9-11)를 참고하세요.

</div>

{@a configuration-table }

<!--
| ES5 Browserslist Result | ES Target | Build Result |
| -------- | -------- | -------- |
| disabled | es5     | Single build |
| enabled  | es5     | Single build w/Conditional Polyfills |
| disabled | es2015  | Single build |
| enabled  | es2015  | Differential Loading (Two builds w/Conditional Polyfills |

When the ES5 Browserslist result is `disabled`, then ES5 browser support is not required. Otherwise, ES5 browser support is required.
-->
| ES5 Browserslist 지원대상 | ES 문법 | 빌드 결과물 |
| -------- | -------- | -------- |
| 지원하지 않음 | es5     | 1벌 |
| 지원  | es5     | 1벌 + 폴리필 |
| 지원하지 않음 | es2015  | 1벌 |
| 지원  | es2015  | 선택적 빌드 (2벌 + 폴리필)

<!--
### Opting out of differential loading
-->
### 선택적 로딩 비활성화하기

<!--
Differential loading can be explicitly disabled if it causes unexpected issues or you need to target ES5 specifically for legacy browser support. 

To explicitly disable differential loading:

- Enable the `dead` or `IE` browsers in the `browserslist` config file by removing the `not` keyword in front of them.
- Set the `target` in the `compilerOptions` to `es5`.
-->
예상하지 못한 이슈가 있거나 오래된 브라우저를 확실하게 지원하기 위해 ES5 문법으로 빌드한다면 선택적 로딩을 명시적으로 비활성화할 수 있습니다.

이렇게 설정하면 됩니다:

- `browserlist` 파일에서 `dead`나 `IE` 앞에 설정된 `not` 키워드를 제거합니다.
- `compilerOptions` 중 `target` 옵션을 `es5`로 지정합니다.
