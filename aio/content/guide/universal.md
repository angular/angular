<!--
# Angular Universal: server-side rendering
-->
# Angular Universal: 서버 사이드 렌더링

<!--
This guide describes **Angular Universal**, a technology that runs your Angular application on the server.

A normal Angular application executes in the _browser_, rendering pages in the DOM in response to user actions. 
Angular Universal generates _static_ application pages on the _server_
through a process called _server-side rendering_ (SSR). 
When Universal is integrated with your app, it can generate and serve those pages in response to requests from browsers.
It can also pre-generate pages as HTML files that you serve later.

You can easily prepare an app for server-side rendering using the [Angular CLI](guide/glossary#cli). The CLI schematic `@nguniversal/express-engine` performs the required steps, as described below. 

This guide describes a Universal sample application that launches quickly as a server-rendered page.
Meanwhile, the browser downloads the full client version and switches to it automatically after the code loads.
-->
이 문서는 **Angular Universal**에 대해 소개합니다. Angular Universal은 Angular 애플리케이션을 서버에서 실행하는 테크닉을 의미합니다.

일반적으로 Angular 애플리케이션은 _브라우저_ 에서 실행됩니다. DOM에 페이지가 렌더링되고 사용자의 동작에 반응하는 것도 모두 브라우저에서 이루어집니다.
그런데 Angular Universal은 애플리케이션 페이지를 _서버_ 에 _정적으로_ 만들어두는 방식입니다. 이 방식은 _서버 사이드 렌더링_ (Server-side rendering, SSR)이라고도 합니다.
Angular 앱에 Universal을 적용해도 이전처럼 브라우저에서 애플리케이션 페이지를 렌더링하는 방식을 그대로 사용할 수 있습니다.
그런데 이 방식 외에도 서버에서 미리 생성해둔 페이지를 HTML 형식으로 직접 전달할 수도 있습니다.

[Angular CLI](guide/glossary#cli)를 사용하면 서버 사이드 렌더링이 적용된 앱을 간단하게 만들 수 있습니다.  아래에서 설명하겠지만, CLI 스키매틱으로 제공되는 `@nguniversal/express-engine`을 적용하면 됩니다.

이 문서에서는 Universal이 적용된 샘플 애플리케이션을 소개하는데, 이 앱은 서버에서 미리 렌더링되기 때문에 빠르게 실행됩니다. 그리고 나서는 이 앱을 통채로 다운로드받아 브라우저에 직접 로드하는 방법에 대해서도 알아봅시다.


<div class="alert is-helpful">

  <!--
  **Note:** [Download the finished sample code](generated/zips/universal/universal.zip),
  which runs in a [Node.js® Express](https://expressjs.com/) server.
  -->
  **참고:** [완성된 샘플 코드를 다운받아서](generated/zips/universal/universal.zip) [Node.js® Express](https://expressjs.com/) 서버에 직접 실행해볼 수 있습니다.

</div>

{@a why-do-it}

<!--
## Why use server-side rendering?
-->
## 서버 사이드 렌더링은 왜 필요한가요?

<!--
There are three main reasons to create a Universal version of your app.

1. Facilitate web crawlers (SEO)
1. Improve performance on mobile and low-powered devices
1. Show the first page quickly
-->
Angular 애플리케이션을 Universal 버전으로 제공해야 하는 이유는 크게 다음 3가지를 꼽아볼 수 있습니다.

1. 웹 크롤러에 대응하기 위해 (SEO)
1. 모바일 장비와 저사양 장비에서 동작하는 성능을 끌어올리기 위해
1. 첫 페이지를 빠르게 표시하기 위해

{@a seo}
{@a web-crawlers}
<!--
### Facilitate web crawlers
-->
### 웹 크롤러 대응하기

<!--
Google, Bing, Facebook, Twitter, and other social media sites rely on web crawlers to index your application content and make that content searchable on the web.
These web crawlers may be unable to navigate and index your highly interactive Angular application as a human user could do.

Angular Universal can generate a static version of your app that is easily searchable, linkable, and navigable without JavaScript.
Universal also makes a site preview available since each URL returns a fully rendered page.

Enabling web crawlers is often referred to as
[search engine optimization (SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf).
-->
Google, Bing, Facebook, Twitter와 같은 소셜 미디어 사이트는 웹 애플리케이션 컨텐츠를 수집하고 검색에 활용하기 위해 웹 크롤러를 사용합니다.
그런데 이런 웹 크롤러는 진짜 사람이 하는 것처럼 애플리케이션 페이지를 효율적으로 이동하면서 원하는 내용을 수집하지는 못합니다.

Angular Universal은 이런 경우에 사용합니다. Angular Universal을 적용하면 애플리케이션을 정적으로 빌드해둘 수 있기 때문에 컨텐츠를 검색하기 쉽고, 링크를 연결할 수 있으며, JavaScript를 사용하지 않아도 페이지를 전환할 수 있습니다.
그리고 Universal을 적용하면 완전히 렌더링된 페이지를 서버에 준비하기 때문에 웹사이트의 미리보기 화면을 제공할 수도 있습니다.

웹 크롤러에 대응하는 과정은 [검색 엔진 최적화(search engine optimization, SEO)](https://static.googleusercontent.com/media/www.google.com/en//webmasters/docs/search-engine-optimization-starter-guide.pdf)라고도 합니다.

{@a no-javascript}

<!--
### Improve performance on mobile and low-powered devices
-->
### 모바일 장비와 저사양 장비에서 동작하는 성능 끌어올리기

<!--
Some devices don't support JavaScript or execute JavaScript so poorly that the user experience is unacceptable.
For these cases, you may require a server-rendered, no-JavaScript version of the app.
This version, however limited, may be the only practical alternative for
people who otherwise couldn't use the app at all.
-->
JavaScript를 지원하지 않는 디바이스가 존재하기도 하고 JavaScript를 실행하는 것이 사용자의 UX를 오히려 해치는 디바이스도 존재합니다.
이런 경우에는 클라이언트에서 JavaScript를 실행하지 말고 서버에서 미리 렌더링된 앱을 보내서 간단하게 실행하는 것이 더 좋습니다.
앱을 이렇게 제공하면 원래 사용자에게 제공하려던 기능을 모두 제공할 수는 없겠지만, 앱을 전혀 사용할 수 없는 상황은 피할 수 있습니다.

{@a startup-performance}

<!--
### Show the first page quickly
-->
### 첫 페이지를 빠르게 표시하기

<!--
Displaying the first page quickly can be critical for user engagement.
[53 percent of mobile site visits are abandoned](https://www.doubleclickbygoogle.com/articles/mobile-speed-matters/) if pages take longer than 3 seconds to load.
Your app may have to launch faster to engage these users before they decide to do something else.

With Angular Universal, you can generate landing pages for the app that look like the complete app.
The pages are pure HTML, and can display even if JavaScript is disabled.
The pages don't handle browser events, but they _do_ support navigation through the site using [`routerLink`](guide/router#router-link).

In practice, you'll serve a static version of the landing page to hold the user's attention.
At the same time, you'll load the full Angular app behind it. 
The user perceives near-instant performance from the landing page
and gets the full interactive experience after the full app loads.
-->
사용자가 다시 찾는 웹사이트를 만들려면 첫 페이지를 빠르게 표시하는 것이 무엇보다 중요합니다.
그래서 첫 페이지가 3초 안에 표시되지 않는다면 [53%의 모바일 사용자가 재방문하지 않는다는 통계](https://www.doubleclickbygoogle.com/articles/mobile-speed-matters/)도 있습니다.
사이트를 방문한 사용자가 다른 곳으로 발길을 돌리는 것을 원하지 않는다면 앱을 최대한 빠르게 실행하는 것이 좋습니다.

이 때 Angular Universal을 사용하면 온전한 앱과 거의 비슷하게 동작하는 랜딩 페이지를 생성할 수 있습니다.
페이지는 HTML만으로 구성되기 때문에 JavaScript가 비활성화되어도 화면을 제대로 표시할 수 있습니다.
하지만 JavaScript가 실행되지 않으면 브라우저 이벤트를 처리할 수 없기 때문에 네비게이션은 [`routerLink`](guide/router#router-link)를 사용하는 방식으로 구현되어야 합니다.

운영환경에서도 첫 페이지를 빠르게 표시하기 위해 페이지를 정적으로 렌더링해서 제공하는 경우가 많습니다.
이와 동시에 온전한 버전의 Angular 앱을 로드하는 방법을 사용하기도 합니다.
그러면 애플리케이션 첫 페이지를 빠르게 표시하면서도 앱에 구현한 기능을 온전히 사용자에게 제공할 수 있습니다.


{@a how-does-it-work}

<!--
## Universal web servers
-->
## Universal 웹 서버

<!--
A Universal web server responds to application page requests with static HTML rendered by the [Universal template engine](#universal-engine). 
The server receives and responds to HTTP requests from clients (usually browsers), and serves static assets such as scripts, CSS, and images.
It may respond to data requests, either directly or as a proxy to a separate data server.

The sample web server for this guide is based on the popular [Express](https://expressjs.com/) framework.
-->
Universal 웹 서버는 애플리케이션 페이지 요청을 받았을 때 [Universal 템플릿 엔진](#universal-engine)으로 렌더링한 정적 HTML을 제공하는 역할을 담당합니다.
이 서버는 일반적으로 브라우저에서 HTTP 요청을 받고 HTTP 응답을 내려주는데, 스크립트 파일이나 CSS, 이미지 파일과 같은 정적 애셋들도 함께 제공합니다.
이 외에도 API로 통하는 데이터 요청은 Universal 웹 서버가 직접 처리하거나 프록시 역할을 하면서 다른 데이터 서버를 중개할 수도 있을 것입니다.

이 문서에서는 이미 유명한 [Express](https://expressjs.com/) 프레임워크를 사용해서 샘플 웹 서버를 구현해 봅니다.

<div class="alert is-helpful">

  <!--
  **Note:** _Any_ web server technology can serve a Universal app as long as it can call Universal's `renderModuleFactory()` function.
  The principles and decision points discussed here apply to any web server technology.
  -->
  **참고:** Angular Universal이 제공하는 `renderModuleFactory()` 함수를 실행할수만 있다면 _아무_ 웹 서버를 사용해도 Universal 앱을 제공할 수 있습니다.
  이 섹션에서는 웹 서버를 결정하는 기준에 대해서 조금 더 자세하게 알아봅시다.

</div>

<!--
To make a Universal app, install the `platform-server` package, which provides server implementations 
of the DOM, `XMLHttpRequest`, and other low-level features that don't rely on a browser.
Compile the client application with the `platform-server` module (instead of the `platform-browser` module)
and run the resulting Universal app on a web server.

The server ([Node Express](https://expressjs.com/) in this guide's example)
passes client requests for application pages to Universal's `renderModuleFactory()` function.

The `renderModuleFactory()` function takes as inputs a *template* HTML page (usually `index.html`),
an Angular *module* containing components,
and a *route* that determines which components to display.
The route comes from the client's request to the server.

Each request results in the appropriate view for the requested route.
The `renderModuleFactory()` function renders the view within the `<app>` tag of the template, 
creating a finished HTML page for the client. 

Finally, the server returns the rendered page to the client.
-->
Universal 앱을 만들려면 `platform-server` 패키지를 설치해야 하는데, 서버에서 DOM을 렌더링하고 `XMLHttpRequest`를 처리하는 등 브라우저의 기능이 필요한 로직에 이 패키지가 사용됩니다.
그래서 웹 서버에서 Universal 앱을 실행하려면 (`platform-browser` 모듈 대신) `platform-server` 모듈을 사용해서 클라이언트 애플리케이션을 컴파일하면 됩니다.

이 문서에서 다루는 것처럼 [Node Express](https://expressjs.com/)를 사용하는 서버라면 애플리케이션 페이지 요청을 Universal이 제공하는 `renderModuleFactory()` 함수로 전달합니다.

그러면 `renderModuleFactory()` 함수가 HTML *템플릿* 페이지(일반적으로 `index.html`)를 바탕으로 Angular 컴포넌트로 구성된 *모듈*을 생성하며, *라우팅 규칙*에 맞게 컴포넌트를 화면에 표시합니다.
이 때 라우팅 규칙은 클라이언트가 서버로 보낸 것입니다.

클라이언트가 보낸 요청의 결과는 해당 라우팅 규칙과 연결된 애플리케이션 페이지가 됩니다.
그래서 `renderModuleFactory()` 함수는 템플릿의 `<app>` 태그에 뷰를 렌더링하며, 결과적으로 온전하게 HTML로 구성된 페이지가 생성됩니다.

이제 렌더링된 페이지를 클라이언트가 받으면 브라우저에 이 페이지가 표시됩니다.

{@a summary}
<!--
## Preparing for server-side rendering
-->
## 서버사이드 렌더링 준비하기

<!--
Before your app can be rendered on a server, you must make changes in the app itself, and also set up the server.

1. Install dependencies.
1. Prepare your app by modifying both the app code and its configuration.  
1. Add a build target, and build a Universal bundle using the CLI with the `@nguniversal/express-engine` schematic.
1. Set up a server to run Universal bundles.
1. Pack and run the app on the server.

The following sections go into each of these main steps in more detail.
-->
애플리케이션을 서버에서 렌더링하려면 먼저 앱과 서버를 조금 수정해야 합니다.

1. 의존성 패키지를 설치합니다.
1. Universal을 지원하도록 앱 코드와 앱 설정파일을 수정합니다.
1. 빌드 타겟을 추가하고 Angular CLI로 `@nguniversal/express-engine` 스키매틱을 활용하도록 Universal 버전으로 빌드합니다.
1. 서버가 Universal 번들 파일을 제공하도록 수정합니다.
1. 애플리케이션을 빌드해서 서버에서 실행합니다.

각 단계에 대해서 하나씩 자세하게 알아봅시다.

<div class="alert is-helpful">

  <!--
  **Note:** The [Universal tutorial](#the-example) below walks you through the steps using the Tour of Heroes sample app, and goes into more detail about what you can do and why you might want to do it. 
 
  To see a working version of an app with server-side rendering, clone the [Angular Universal starter](https://github.com/angular/universal-starter). 
  -->
  **참고:** 아래에서 다루는 [Universal 튜토리얼](#the-example)은 "히어로들의 여행" 튜토리얼을 확장하는 방식으로 살펴봅니다.

  서버사이드 렌더링이 동작하는 앱을 직접 실행해보려면 [Angular Universal starter](https://github.com/angular/universal-starter) 레파지토리를 복제해서 실행해도 됩니다.

</div>

<div class="callout is-critical">

<!--
<header>Security for server requests</header>
-->
<header>서버가 보내는 HTTP 요청에 대해 보안성 검토</header>

<!--
HTTP requests issued from a browser app aren't the same as those issued by the Universal app on the server.
Universal HTTP requests have different security requirements

When a browser makes an HTTP request, the server can make assumptions about cookies, XSRF headers, and so on. 
For example, the browser automatically sends authentication cookies for the current user.
Angular Universal can't forward these credentials to a separate data server.
If your server handles HTTP requests, you'll have to add your own security plumbing.
-->
서버에서 실행되는 Universal 앱이 보내는 HTTP 요청과 브라우저에서 실행되는 앱이 보내는 HTTP 요청은 약간 다릅니다.
Universal 앱에서 HTTP 요청을 보내려면 보안에 대해 신경써야 할 것이 좀 더 있습니다.

브라우저에서 HTTP 요청을 보낸다면 쿠키나 XSRF 헤더와 같은 정보를 추가로 보낼 수 있습니다.
그래서 브라우저는 현재 사용자에 해당하는 인증 쿠키를 HTTP 요청에 자동으로 포함시킬 수도 있습니다.
하지만 Angular Universal에서는 이런 방식으로 인증을 처리할 수 없습니다.
Universal 앱이 또 다른 인증 서버로 HTTP 요청을 보낼 때 이 부분을 보완할 방법을 찾아야 합니다.

</div>

<!--
## Step 1: Install dependencies
-->
## 1단계: 의존성 패키지 설치하기

<!--
Install `@angular/platform-server` into your project. Use the same version as the other `@angular` packages in your project. You also need `ts-loader` for your webpack build and `@nguniversal/module-map-ngfactory-loader` to handle lazy-loading in the context of a server-render.
-->
먼저, 프로젝트에 `@angular/platform-server` 패키지를 설치합니다. 이때 패키지 버전은 프로젝트에 이미 설치되어 있는 `@angular` 패키지의 버전과 같은 버전을 설치하면 됩니다. 그리고 웹팩으로 빌드하기 위해 `ts-loader`를 추가로 설치하고, 서버사이드 렌더링하면서 지연로딩을 사용하기 위해 `@nguniversal/module-map-ngfactory-loader`도 설치합니다.

```
$ npm install --save @angular/platform-server @nguniversal/module-map-ngfactory-loader ts-loader
```

<!--
## Step 2: Prepare your app
-->
## 2단계: 앱 수정하기

<!--
To prepare your app for Universal rendering, take the following steps:

* Add Universal support to your app.

* Create a server root module.

* Create a main file to export the server root module.

* Configure the server root module.
-->
애플리케이션이 Universal 렌더링을 지원하려면 다음과 같이 작업해야 합니다:

* 앱에 Universal 기능을 추가합니다.

* 서버 최상위 모듈을 생성합니다.

* Universal 렌더링 메인 파일을 생성합니다.

* 이 서버 최상위 모듈을 빌드할 환경을 설정합니다.

<!--
### 2a. Add Universal support to your app
-->
### 2a. 앱에 Universal 기능 추가하기

<!--
Make your `AppModule` compatible with Universal by adding `.withServerTransition()` and an application ID to your `BrowserModule` import in `src/app/app.module.ts`.
-->
앱에 Universal 기능을 추가하려면 `src/app/app.module.ts` 파일에 정의된 `AppModule`이 로드하는 `BrowserModule`에 `.withServerTransition()`을 추가하고, 이 때 애플리케이션 ID를 지정하면 됩니다.

<code-example format="." language="typescript" linenums="false">
@NgModule({
  bootstrap: [AppComponent],
  imports: [
    //  Universal 렌더링을 지원하기 위해 .withServerTransition()를 추가합니다.
    // 애플리케이션 ID는 앱을 구분할 수 있는 값으로 자유롭게 지정할 수 있습니다.
    BrowserModule.withServerTransition({appId: 'my-app'}),
    ...
  ],

})
export class AppModule {}
</code-example>

<!--
### 2b. Create a server root module
-->
### 2b. 서버 최상위 모듈 생성하기

<!--
Create a module named `AppServerModule` to act as the root module when running on the server. This example places it alongside `app.module.ts` in a file named `app.server.module.ts`. The new module  imports everything from the root `AppModule`, and adds `ServerModule`. It also adds `ModuleMapLoaderModule` to help make lazy-loaded routes possible during server-side renders with the Angular CLI.

Here's an example in `src/app/app.server.module.ts`.
-->
서버에서 최상위 모듈로 동작하는 모듈을 `AppServerModule`이라고 합시다. 이 모듈은 `app.server.module.ts` 파일에 정의하는데, `app.module.ts`을 대체하는 용도로 사용하기 때문에 `app.module.ts` 파일과 같은 위치에 생성합니다. `AppServerModule`은 `AppModule`이 로드하는 것을 모두 로드하면서, 추가로 `ServerModule`을 로드합니다. 이 때 지연로딩하는 라우팅 규칙이 있다면 서버에서도 이것을 처리하기 위해 `ModuleMapLoaderModule`을 추가합니다.

그러면 `src/app/app.server.module.ts` 파일은 다음과 같이 구성됩니다.

<code-example format="." language="typescript" linenums="false">
import {NgModule} from '@angular/core';
import {ServerModule} from '@angular/platform-server';
import {ModuleMapLoaderModule} from '@nguniversal/module-map-ngfactory-loader';

import {AppModule} from './app.module';
import {AppComponent} from './app.component';

@NgModule({
  imports: [
    // AppModule을 로드한 후에는 @angular/platform-server에서 제공하는
    // AppServerModule을 로드해야 합니다.
    AppModule,
    ServerModule,
    ModuleMapLoaderModule // <-- *Important* to have lazy-loaded routes work
  ],
  // 앱을 부트스트랩하면서 로드하는 컴포넌트는 AppModule에 설정한 것과 별개입니다.
  // AppServerModule에도 이 컴포넌트를 추가합니다.
  bootstrap: [AppComponent],
})
export class AppServerModule {}
</code-example>

<!--
### 2c. Create a main file to export AppServerModule
-->
### 2c. Universal 렌더링 메인 파일 생성하기

<!--
Create a main file for your Universal bundle in the app `src/` folder  to export your `AppServerModule` instance. This example calls the file `main.server.ts`.
-->
`AppServerModule` 인스턴스를 파일 외부로 공개하는 Universal 번들 파일을 `src/` 폴더에 생성합니다.
이번 예제에서는 `main.server.ts`라는 이름으로 생성합니다.

<code-example format="." language="typescript" linenums="false">
export { AppServerModule } from './app/app.server.module';
</code-example>

<!--
### 2d. Create a configuration file for AppServerModule 
-->
### 2d. AppServerModule 환경설정 파일 생성하기

<!--
Copy `tsconfig.app.json` to `tsconfig.server.json` and modify it as follows:

* In `"compilerOptions"`, set the  `"module"` target to `"commonjs"`.
* Add a section for `"angularCompilerOptions"` and set `"entryModule"` to point to your `AppServerModule` instance. Use the format `importPath#symbolName`. In this example, the entry module is `app/app.server.module#AppServerModule`.
-->
`tsconfig.app.json` 파일을 복사해서 `tsconfig.server.json` 파일을 만들고 다음과 같이 수정합니다:

* `"compilerOptions"`에서 `"module"`에 지정된 값을 `"commonjs"`로 변경합니다.
* `"angularCompilerOptions"` 섹션을 추가하고 `"entryModule"` 필드에 `경로#심볼이름` 형식으로 `AppServerModule` 인스턴스를 지정합니다. 이 예제에서는 `app/app.server.module#AppServerModule`라고 지정했습니다.

<code-example format="." language="none" linenums="false">
{
  "extends": "../tsconfig.json",
  "compilerOptions": {
    "outDir": "../out-tsc/app",
    "baseUrl": "./",
    // 모듈 형식을 "commonjs"로 지정합니다:
    "module": "commonjs",
    "types": []
  },
  "exclude": [
    "test.ts",
    "**/*.spec.ts"
  ],
  // "angularCompilerOptions" 섹션을 추가하고
  // "entryModule" 키로 AppServerModule을 지정합니다.
  "angularCompilerOptions": {
    "entryModule": "app/app.server.module#AppServerModule"
  }
}
</code-example>

<!--
## Step 3: Create a new build target and build the bundle
-->
## 3단계: 새로운 설정으로 빌드하기

<!--
Open the Angular configuration file, `angular.json`, for your project, and add a new target in the `"architect"` section for the server build. The following example names the new target `"server"`.
-->
Angular 프로젝트 설정파일인 `angular.json` 파일을 열고 `"architect"` 섹션에 서버용 빌드 설정을 추가합니다. 이 예제에서는 `"server"`라는 이름으로 지정합니다.

<code-example format="." language="none" linenums="false">
"architect": {
  "build": { ... }
  "server": {
    "builder": "@angular-devkit/build-angular:server",
    "options": {
      "outputPath": "dist/my-project-server",
      "main": "src/main.server.ts",
      "tsConfig": "src/tsconfig.server.json"
    }
  }
}
</code-example>

<!--
To build a server bundle for your application, use the `ng run` command, with the format `projectName#serverTarget`. In our example, there are now two targets configured, `"build"` and `"server"`.
-->
이제 `"server"` 설정으로 애플리케이션을 빌드하려면 `ng run` 명령을 실행하면서 `프로젝트이름#서버타겟`을 지정하면 됩니다. 이 시점에 이 애플리케이션에는 `"build"` 빌드 설정과 `"server"` 빌드 설정이 존재합니다.

<code-example format="." language="none" linenums="false">
# 다음과 같이 실행하면 server 빌드 설정으로 앱이 빌드됩니다.
# 빌드 결과물이 생성되는 위치는 dist/my-project-server/ 입니다.
$ ng run my-project:server

Date: 2017-07-24T22:42:09.739Z
Hash: 9cac7d8e9434007fd8da
Time: 4933ms
chunk {0} main.js (main) 9.49 kB [entry] [rendered]
chunk {1} styles.css (styles) 0 bytes [entry] [rendered]
</code-example>

<!--
## Step 4: Set up a server to run Universal bundles
-->
## 4단계: Universal 번들을 실행하도록 서버 설정하기

To run a Universal bundle, you need to send it to a server. 

The following example passes `AppServerModule` (compiled with AoT) to the `PlatformServer` method `renderModuleFactory()`, which serializes the app and returns the result to the browser.

<code-example format="." language="typescript" linenums="false">
app.engine('html', (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    // Our index.html
    document: template,
    url: options.req.url,
    // configure DI to make lazy-loading work differently
    // (we need to instantly render the view)
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(html => {
    callback(null, html);
  });
});
</code-example>

This technique gives you complete flexibility. For convenience, you can also use the `@nguniversal/express-engine` tool that has some built-in features.

<code-example format="." language="typescript" linenums="false">
import { ngExpressEngine } from '@nguniversal/express-engine';

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));
</code-example>

The following simple example implements a bare-bones Node Express server to fire everything up. 
(Note that this is for demonstration only. In a real production environment, you need to set up additional authentication and security.)

At the root level of your project, next to `package.json`, create a file named `server.ts` and add the following content.

<code-example format="." language="typescript" linenums="false">
// These are important and needed before anything else
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

// Faster server renders w/ Prod mode (dev mode never needed)
enableProdMode();

// Express server
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// Our index.html we'll use as our template
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * NOTE :: leave this as require() since this file is built Dynamically from webpack
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

app.engine('html', (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    // Our index.html
    document: template,
    url: options.req.url,
    // DI so that we can get lazy-loading to work differently (since we need it to just instantly render it)
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(html => {
    callback(null, html);
  });
});

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// Server static files from /browser
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// All regular routes use the Universal engine
app.get('*', (req, res) => {
  res.render(join(DIST_FOLDER, 'browser', 'index.html'), { req });
});

// Start up the Node server
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
</code-example>

## Step 5: Pack and run the app on the server

Set up a webpack configuration to handle the Node Express `server.ts` file and serve your application.

In your app root directory, create a webpack configuration file (`webpack.server.config.js`) that compiles the `server.ts` file and its dependencies into `dist/server.js`.

<code-example format="." language="typescript" linenums="false">
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {  server: './server.ts' },
  resolve: { extensions: ['.js', '.ts'] },
  target: 'node',
  // this makes sure we include node_modules and other 3rd party libraries
  externals: [/(node_modules|main\..*\.js)/],
  output: {
    path: path.join(__dirname, 'dist'),
    filename: '[name].js'
  },
  module: {
    rules: [
      { test: /\.ts$/, loader: 'ts-loader' }
    ]
  },
  plugins: [
    // Temporary Fix for issue: https://github.com/angular/angular/issues/11580
    // for "WARNING Critical dependency: the request of a dependency is an expression"
    new webpack.ContextReplacementPlugin(
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // location of your src
      {} // a map of your routes
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
}
</code-example>

The  project's `dist/` folder now contains both browser and server folders.

<code-example format="." language="none" linenums="false">
dist/
   browser/
   server/
</code-example>

To run the app on the server, type the following in a command shell.

<code-example format="." language="bash" linenums="false">
node dist/server.js
</code-example>

### Creating scripts

Now let's create a few handy scripts to help us do all of this in the future.
You can add these in the `"server"` section of the Angular configuration file, `angular.json`.

<code-example format="." language="none" linenums="false">
"architect": {
  "build": { ... }
  "server": {
    ...
     "scripts": {
      // Common scripts
      "build:ssr": "npm run build:client-and-server-bundles && npm run webpack:server",
      "serve:ssr": "node dist/server.js",

      // Helpers for the scripts
      "build:client-and-server-bundles": "ng build --prod && ng build --prod --app 1 --output-hashing=false",
      "webpack:server": "webpack --config webpack.server.config.js --progress --colors"
    }
   ...
</code-example>

To run a production build of your app with Universal on your local system, use the following command.

<code-example format="." language="bash" linenums="false">
npm run build:ssr && npm run serve:ssr
</code-example>

### Working around the browser APIs

Because a Universal `platform-server` app doesn't execute in the browser, you may have to work around some of the browser APIs and capabilities that are missing on the server.

For example, your server-side page can't reference browser-only native objects such as `window`, `document`, `navigator`, or `location`. 
If you don't need these on the server-rendered page, you can side-step them with conditional logic.
Alternatively, you can find an injectable Angular abstraction over the object you need such as `Location` or `Document`;
it may substitute adequately for the specific API that you're calling.
If Angular doesn't provide it, you can write your own abstraction that delegates to the browser API while in the browser and to a satisfactory alternative implementation while on the server.

Similarly, without mouse or keyboard events, a server-side app can't rely on a user clicking a button to show a component.
The app must determine what to render based solely on the incoming client request.
This is a good argument for making the app [routable](guide/router).

Because the user of a server-rendered page can't do much more than click links,
you should swap in the real client app as quickly as possible for a proper interactive experience.

{@a the-example}

## Universal tutorial 

The [Tour of Heroes tutorial](tutorial) is the foundation for this walkthrough. 

The core application files are mostly untouched, with a few exceptions described below.
You'll add more files to support building and serving with Universal.

In this example, the Angular CLI compiles and bundles the Universal version of the app with the
[Ahead-of-Time (AoT) compiler](guide/aot-compiler).
A Node Express web server turns client requests into the HTML pages rendered by Universal.

To create server-side app module, `app.server.module.ts`, run the following CLI command.

<code-example format="." language="bash">

ng add @nguniversal/express-engine --clientProject angular.io-example

</code-example>

The command creates the following folder structure.

<code-example format="." language="none" linenums="false">
src/
  index.html                 <i>app web page</i>
  main.ts                    <i>bootstrapper for client app</i>
  main.server.ts             <i>* bootstrapper for server app</i>
  tsconfig.app.json          <i>TypeScript client configuration</i>
  tsconfig.server.json       <i>* TypeScript server configuration</i>
  tsconfig.spec.json         <i>TypeScript spec configuration</i>
  style.css                  <i>styles for the app</i>
  app/ ...                   <i>application code</i>
    app.server.module.ts     <i>* server-side application module</i>
server.ts                    <i>* express web server</i>
tsconfig.json                <i>TypeScript client configuration</i>
package.json                 <i>npm configuration</i>
webpack.server.config.js     <i>* webpack server configuration</i>
</code-example>

The files marked with `*` are new and not in the original tutorial sample.
This guide covers them in the sections below.


{@a http-urls}

### Using absolute URLs for server requests

The tutorial's `HeroService` and `HeroSearchService` delegate to the Angular `HttpClient` module to fetch application data.
These services send requests to _relative_ URLs such as `api/heroes`.
In a Universal app, HTTP URLs must be _absolute_ (for example, `https://my-server.com/api/heroes`) even when the Universal web server is capable of handling relative requests.
This means you need to change your services to make requests with absolute URLs when running on the server and with relative URLs when running in the browser.

One solution is to provide the server's runtime origin under Angular's [`APP_BASE_HREF`](api/common/APP_BASE_HREF) token,
inject it into the service, and prepend the origin to the request URL.

Start by changing the `HeroService` constructor to take a second `origin` parameter that is optionally injected via the `APP_BASE_HREF` token.

<code-example path="universal/src/app/hero.service.ts" region="ctor" header="src/app/hero.service.ts (constructor with optional origin)">
</code-example>

The constructor uses the `@Optional()` directive to prepend the origin to `heroesUrl` _if it exists_.
You don't provide `APP_BASE_HREF` in the browser version, so `heroesUrl` remains relative.

<div class="alert is-helpful">

  **Note:** You can ignore `APP_BASE_HREF` in the browser if you've specified `<base href="/">` in the `index.html` file to satisfy the router's need for a base address (as the tutorial sample does).

</div>

{@a universal-engine}
### Universal template engine

The important bit in the `server.ts` file is the `ngExpressEngine()` function.

<code-example path="universal/server.ts" header="server.ts" region="ngExpressEngine">
</code-example>

The `ngExpressEngine()` function is a wrapper around Universal's `renderModuleFactory()` function which turns a client's requests into server-rendered HTML pages.
You'll call that function within a _template engine_ that's appropriate for your server stack.

* The first parameter is `AppServerModule`.
It's the bridge between the Universal server-side renderer and your application.

* The second parameter, `extraProviders`, is optional. It lets you specify dependency providers that apply only when running on this server.
You can do this when your app needs information that can only be determined by the currently running server instance. 
The required information in this case is the running server's *origin*, provided under the `APP_BASE_HREF` token, so that the app can [calculate absolute HTTP URLs](#http-urls).

The `ngExpressEngine()` function returns a `Promise` callback that resolves to the rendered page. 
It's up to your engine to decide what to do with that page.
This engine's `Promise` callback returns the rendered page to the web server,
which then forwards it to the client in the HTTP response.

<div class="alert is-helpful">

  **Note:**  These wrappers help hide the complexity of the `renderModuleFactory()` function. There are more wrappers for different backend technologies
  at the [Universal repository](https://github.com/angular/universal).

</div>

### Filtering request URLs

The web server must distinguish _app page requests_ from other kinds of requests.

It's not as simple as intercepting a request to the root address `/`.
The browser could ask for one of the application routes such as `/dashboard`, `/heroes`, or `/detail:12`.
In fact, if the app were only rendered by the server, _every_ app link clicked would arrive at the server
as a navigation URL intended for the router.

Fortunately, application routes have something in common: their URLs lack file extensions. 
(Data requests also lack extensions but they're easy to recognize because they always begin with `/api`.)
All static asset requests have a file extension (such as `main.js` or `/node_modules/zone.js/dist/zone.js`).

Because we use routing, we can easily recognize the three types of requests and handle them differently.

1. Data request -  request URL that begins `/api`.
2. App navigation - request URL with no file extension.
3. Static asset - all other requests.

A Node Express server is a pipeline of middleware that filters and processes URL requests one after the other. 
You configure the Node Express server pipeline with calls to `app.get()` like this one for data requests.

<code-example path="universal/server.ts" header="server.ts (data URL)" region="data-request" linenums="false">
</code-example>

<div class="alert is-helpful">

  **Note:** This sample server doesn't handle data requests.

  The tutorial's "in-memory web API" module, a demo and development tool, intercepts all HTTP calls and
  simulates the behavior of a remote data server.
  In practice, you would remove that module and register your web API middleware on the server here.

</div>

The following code filters for request URLs with no extensions and treats them as navigation requests.

<code-example path="universal/server.ts" header="server.ts (navigation)" region="navigation-request" linenums="false">
</code-example>

### Serving static files safely

A single `app.use()` treats all other URLs as requests for static assets
such as JavaScript, image, and style files.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in the `/dist` folder and only honor requests for files from the `/dist` folder.

The following Node Express code routes all remaining requests to `/dist`, and returns a `404 - NOT FOUND` error if the file isn't found.

<code-example path="universal/server.ts" header="server.ts (static files)" region="static" linenums="false">
</code-example>


### Universal in action

Open a browser to http://localhost:4000/.
You should see the familiar Tour of Heroes dashboard page.

Navigation via `routerLinks` works correctly.
You can go from the Dashboard to the Heroes page and back.
You can click a hero on the Dashboard page to display its Details page.

Notice, however, that clicks, mouse-moves, and keyboard entries are inert.

* Clicking a hero on the Heroes page does nothing.
* You can't add or delete a hero.
* The search box on the Dashboard page is ignored.
* The *Back* and *Save* buttons on the Details page don't work.

User events other than `routerLink` clicks aren't supported.
You must wait for the full client app to arrive.
It won't arrive until you compile the client app
and move the output into the `dist/` folder.

The transition from the server-rendered app to the client app happens quickly on a development machine.
You can simulate a slower network to see the transition more clearly and
better appreciate the launch-speed advantage of a Universal app running on a low-powered, poorly connected device.

Open the Chrome Dev Tools and go to the Network tab.
Find the [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) dropdown on the far right of the menu bar.

Try one of the "3G" speeds.
The server-rendered app still launches quickly but the full client app may take seconds to load.
