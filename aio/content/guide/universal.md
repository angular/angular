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
이 문서는 **Angular Universal**에 대해 소개합니다. Angular Universal은 Angular 애플리케이션을 서버에서 실행하는 테크닉입니다.

일반적으로 Angular 애플리케이션은 _브라우저_ 에서 실행됩니다. DOM에 페이지가 렌더링되고 사용자의 동작에 반응하는 것도 모두 브라우저에서 이루어집니다.
그런데 Angular Universal은 애플리케이션 페이지를 _서버_ 에 _정적으로_ 만들어두는 방식입니다. 이 방식은 _서버 사이드 렌더링_ (Server-side rendering, SSR)이라고도 합니다.
Angular 앱에 Universal을 적용하면 클라이언트에서 앱을 빠르게 실행하기 위해 서버에서 직접 생성한 페이지를 브라우저로 보냅니다.
그리고 클라이언트 앱을 온전히 다운받은 후에는 클라이언트 앱으로 대체됩니다.

[Angular CLI](guide/glossary#cli)를 사용하면 서버 사이드 렌더링이 적용된 앱을 간단하게 만들 수 있습니다. 아래에서 설명하겠지만, CLI 스키매틱으로 제공되는 `@nguniversal/express-engine`을 적용하면 됩니다.

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
JavaScript를 지원하지 않는 디바이스가 존재하기도 하고 JavaScript를 실행하는 것이 오히려 사용자의 UX를 해치는 디바이스도 존재합니다.
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
사용자의 재방문을 유도하려면 첫 페이지를 빠르게 표시하는 것이 무엇보다 중요합니다.
심지어 첫 페이지가 3초 안에 표시되지 않는다면 [53%의 모바일 사용자가 재방문하지 않는다는 통계](https://www.doubleclickbygoogle.com/articles/mobile-speed-matters/)도 있습니다.
사이트를 방문한 사용자가 다른 곳으로 발길을 돌리는 것을 원하지 않는다면 앱을 최대한 빠르게 실행하는 것이 좋습니다.

이 때 Angular Universal을 사용하면 온전한 앱과 거의 비슷하게 동작하는 랜딩 페이지를 생성할 수 있습니다.
페이지는 HTML만으로 구성되기 때문에 JavaScript가 비활성화되어도 화면을 제대로 표시할 수 있습니다.
다만, JavaScript가 실행되지 않으면 브라우저 이벤트를 처리할 수 없기 때문에 네비게이션은 [`routerLink`](guide/router#router-link)를 사용하는 방식으로 구현되어야 합니다.

운영환경에서도 첫 페이지를 빠르게 표시하기 위해 페이지를 정적으로 렌더링해서 제공하는 경우가 많습니다.
그 이후에 온전한 버전의 Angular 앱을 로드하는 방법을 사용하기도 합니다.
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

이 문서에서는 널리 사용되는 [Express](https://expressjs.com/) 프레임워크를 사용해서 샘플 웹 서버를 구현해 봅니다.

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
이 때 라우팅 규칙은 클라이언트가 서버로 보낸 것이 사용됩니다.

클라이언트가 보낸 요청의 결과는 해당 라우팅 규칙과 연결된 애플리케이션 페이지가 됩니다.
그래서 `renderModuleFactory()` 함수는 템플릿의 `<app>` 태그에 뷰를 렌더링하며, 결과적으로 온전하게 HTML로 구성된 페이지가 생성됩니다.

이제 렌더링된 페이지를 클라이언트가 받으면 브라우저에 이 페이지가 표시됩니다.

{@a summary}
<!--
## Preparing for server-side rendering
-->
## 서버 사이드 렌더링 준비하기

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

  서버 사이드 렌더링이 동작하는 앱을 직접 실행해보려면 [Angular Universal starter](https://github.com/angular/universal-starter) 레파지토리를 복제해서 실행해도 됩니다.

</div>

<div class="callout is-critical">

<!--
<header>Security for server requests</header>
-->
<header>서버가 보내는 HTTP 요청에 대해 보안성 검토하기</header>

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
먼저, 프로젝트에 `@angular/platform-server` 패키지를 설치합니다. 이때 패키지 버전은 프로젝트에 이미 설치되어 있는 `@angular` 패키지의 버전과 같은 버전을 설치하면 됩니다. 그리고 웹팩으로 빌드하기 위해 `ts-loader`를 추가로 설치하고, 서버 사이드 렌더링하면서 지연로딩을 사용하기 위해 `@nguniversal/module-map-ngfactory-loader`도 설치합니다.

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
    // Universal 렌더링을 지원하기 위해 .withServerTransition()를 추가합니다.
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
서버에서 최상위 모듈로 동작하는 모듈을 `AppServerModule`이라고 합시다. 이 모듈은 `app.server.module.ts` 파일에 정의하는데, `app.module.ts`을 대체하는 용도로 사용하기 때문에 `app.module.ts` 파일과 같은 위치에 생성합니다. `AppServerModule`은 `AppModule`이 로드하는 것을 모두 로드하면서, 추가로 `ServerModule`을 로드합니다. 이 때 지연로딩하는 라우팅 규칙이 있다면 서버에서도 이것을 처리하기 위해 `ModuleMapLoaderModule`을 추가해야 합니다.

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
    ModuleMapLoaderModule // <-- *중요* 라우터에 지연로딩을 사용한다면 꼭 추가해야 합니다.
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

<!--
To run a Universal bundle, you need to send it to a server. 

The following example passes `AppServerModule` (compiled with AoT) to the `PlatformServer` method `renderModuleFactory()`, which serializes the app and returns the result to the browser.
-->
Universal 버전으로 번들링한 앱을 실행하려면 이 앱을 서버에서 보내면 됩니다.

아래 예제에서 AoT 방식으로 컴파일된 `AppServerModule`은 `renderModuleFactory()` 메소드의 인자로 전달되어 브라우저로 보내집니다.

<code-example format="." language="typescript" linenums="false">
app.engine('html', (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    // 앱이 실행되는 index.html
    document: template,
    url: options.req.url,
    // 지연 로딩을 지원하기 위해 DI 환경을 설정합니다.
    // (화면을 바로 렌더링하기 위한 코드입니다.)
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(html => {
    callback(null, html);
  });
});
</code-example>

<!--
This technique gives you complete flexibility. For convenience, you can also use the `@nguniversal/express-engine` tool that has some built-in features.
-->
구현 방식은 얼마든지 달라질 수 있습니다. 더 간단하게 구현하려면 `@nguniversal/express-engine` 툴을 사용해서 다음과 같이 구현해도 됩니다.

<code-example format="." language="typescript" linenums="false">
import { ngExpressEngine } from '@nguniversal/express-engine';

app.engine('html', ngExpressEngine({
  bootstrap: AppServerModuleNgFactory,
  providers: [
    provideModuleMap(LAZY_MODULE_MAP)
  ]
}));
</code-example>

<!--
The following simple example implements a bare-bones Node Express server to fire everything up. 
(Note that this is for demonstration only. In a real production environment, you need to set up additional authentication and security.)

At the root level of your project, next to `package.json`, create a file named `server.ts` and add the following content.
-->
아래 예제는 Node Express 서버가 제공하는 기능만으로 Universa 앱을 서비스하는 백엔드 서버 코드입니다
(다만, 이 코드는 Universal을 설명하기 위한 것일 뿐입니다. 실제 운영 환경에서는 인증과 보안 코드가 더 추가되어야 합니다.)

아래 예제 코드는 `package.json` 파일이 있는 프로젝트 최상위 폴더에 `server.ts`라는 이름으로 작성합니다.

<code-example format="." language="typescript" linenums="false">
// 아래 두 줄이 가장 중요하며 가장 먼저 로드되어야 합니다.
import 'zone.js/dist/zone-node';
import 'reflect-metadata';

import { renderModuleFactory } from '@angular/platform-server';
import { enableProdMode } from '@angular/core';

import * as express from 'express';
import { join } from 'path';
import { readFileSync } from 'fs';

// 운영모드로 동작해야 렌더링도 빠릅니다. (개발모드를 사용할 일은 없습니다.)
enableProdMode();

// Express 서버
const app = express();

const PORT = process.env.PORT || 4000;
const DIST_FOLDER = join(process.cwd(), 'dist');

// index.html 파일을 템플릿으로 사용합니다.
const template = readFileSync(join(DIST_FOLDER, 'browser', 'index.html')).toString();

// * 참고 :: 이 파일은 webpack으로 동적 빌드되기 때문에 require()를 사용해야 합니다.
const { AppServerModuleNgFactory, LAZY_MODULE_MAP } = require('./dist/server/main.bundle');

const { provideModuleMap } = require('@nguniversal/module-map-ngfactory-loader');

app.engine('html', (_, options, callback) => {
  renderModuleFactory(AppServerModuleNgFactory, {
    // index.html
    document: template,
    url: options.req.url,
    // 지연 로딩을 지원하기 위해 DI 환경을 설정합니다.
    // (화면을 바로 렌더링하기 위한 코드입니다.)
    extraProviders: [
      provideModuleMap(LAZY_MODULE_MAP)
    ]
  }).then(html => {
    callback(null, html);
  });
});

app.set('view engine', 'html');
app.set('views', join(DIST_FOLDER, 'browser'));

// /browser 폴더에 있는 파일은 정적으로 제공합니다.
app.get('*.*', express.static(join(DIST_FOLDER, 'browser')));

// 일반적인 라우팅은 Universal 엔진을 사용합니다.
app.get('*', (req, res) => {
  res.render(join(DIST_FOLDER, 'browser', 'index.html'), { req });
});

// Node 서버를 시작합니다.
app.listen(PORT, () => {
  console.log(`Node server listening on http://localhost:${PORT}`);
});
</code-example>

<!--
## Step 5: Pack and run the app on the server
-->
## 5단계: 빌드하고 서버에서 앱 서비스하기

<!--
Set up a webpack configuration to handle the Node Express `server.ts` file and serve your application.

In your app root directory, create a webpack configuration file (`webpack.server.config.js`) that compiles the `server.ts` file and its dependencies into `dist/server.js`.
-->
Node Express 서버로 작성한 `server.ts` 파일과 애플리케이션에는 webpack 환경설정 파일이 필요합니다.

앱 최상위 폴더에 webpack 설정 파일(`webpack.server.config.js`)을 만들고 이 환경 설정파일로 `dist/server.js` 파일을 빌드하도록 `server.ts` 파일을 컴파일합니다.

<code-example format="." language="typescript" linenums="false">
const path = require('path');
const webpack = require('webpack');

module.exports = {
  entry: {  server: './server.ts' },
  resolve: { extensions: ['.js', '.ts'] },
  target: 'node',
  // node_module과 서드파티 라이브러리를 모두 로드해야 합니다.
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
    // "WARNING Critical dependency: the request of a dependency is an expression"
    // https://github.com/angular/angular/issues/11580 이슈 대응을 위한 임시 코드
    new webpack.ContextReplacementPlugin(
      /(.+)?angular(\\|\/)core(.+)?/,
      path.join(__dirname, 'src'), // src 폴더 경로
      {} // 라우팅 설정 맵
    ),
    new webpack.ContextReplacementPlugin(
      /(.+)?express(\\|\/)(.+)?/,
      path.join(__dirname, 'src'),
      {}
    )
  ]
}
</code-example>

<!--
The  project's `dist/` folder now contains both browser and server folders.
-->
이제 `dist/` 폴더에는 browser 폴더와 server 폴더가 존재합니다.

<code-example format="." language="none" linenums="false">
dist/
   browser/
   server/
</code-example>

<!--
To run the app on the server, type the following in a command shell.
-->
그리고 앱을 서버에서 실행하려면 다음 명령을 실행하면 됩니다.

<code-example format="." language="bash" linenums="false">
node dist/server.js
</code-example>

<!--
### Creating scripts
-->
### 스크립트 추가하기

<!--
Now let's create a few handy scripts to help us do all of this in the future.
You can add these in the `"server"` section of the Angular configuration file, `angular.json`.
-->
이제 다음부터는 이 과정을 편하게 실행하기 위해 스크립트를 추가해 봅시다.
Angular 환경설정 파일 `angular.json` 파일에 다음과 같이 `"server"` 섹션을 추가합니다.

<code-example format="." language="none" linenums="false">
"architect": {
  "build": { ... }
  "server": {
    ...
     "scripts": {
      // Universal 동작을 위한 스크립트
      "build:ssr": "npm run build:client-and-server-bundles && npm run webpack:server",
      "serve:ssr": "node dist/server.js",

      // 헬퍼 스크립트
      "build:client-and-server-bundles": "ng build --prod && ng build --prod --app 1 --output-hashing=false",
      "webpack:server": "webpack --config webpack.server.config.js --progress --colors"
    }
   ...
</code-example>

<!--
To run a production build of your app with Universal on your local system, use the following command.
-->
이제 로컬 환경에서 Universal 버전으로 운영용 앱을 실행하려면 다음 명령을 실행하면 됩니다.

<code-example format="." language="bash" linenums="false">
npm run build:ssr && npm run serve:ssr
</code-example>

<!--
### Working around the browser APIs
-->
### 브라우저 API 활용하기

<!--
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
-->
Universal `platform-server` 앱은 브라우저에서 실행되지 않기 때문에 브라우저 API를 직접 활용할 수 없습니다.

그래서 서버 사이드 페이지는 브라우저에만 존재하는 `window`나 `document`, `navigator`, `location`과 같은 네이티브 API를 참조할 수 없습니다.
서버 사이드 페이지에서 이 API를 사용하지 않는다면 문제되지 않습니다.
하지만 이 API를 사용해야 한다면 Angular가 추상 클래스로 제공하는 `Localtion`이나 `Document`를 의존성으로 주입받아 사용해야 합니다.
그리고 Angular가 제공하는 추상 클래스로 해결할 수 없다면 개발자가 직접 이 추상 클래스를 정의해야 합니다.

이와 비슷하게, 마우스 이벤트나 키보드 이벤트도 서버 사이드 앱에는 존재하지 않습니다. 서버에서 페이지를 렌더링하는데 컴포넌트를 표시하는 버튼을 누를 사용자가 없기 때문입니다.
그렇다면 서버 사이드 앱은 클라이언트의 요청만으로 온전히 렌더링할 수 있는 로직으로 작성해야 합니다.
이 방식은 앱을 [라우팅할 수 있도록](guide/router) 구현한다는 측면에서도 활용할 수 있습니다.

결국 서버에서 렌더링된 페이지에서는 사용자가 링크를 클릭한다는 방식을 활용할 수 없기 때문에, 이와 유사한 UX를 제공할 수 있도록 구현방식을 수정해야 할 수도 있습니다.

{@a the-example}

<!--
## Universal tutorial 
-->
## Universal 튜토리얼

<!--
The [Tour of Heroes tutorial](tutorial) is the foundation for this walkthrough. 

The core application files are mostly untouched, with a few exceptions described below.
You'll add more files to support building and serving with Universal.

In this example, the Angular CLI compiles and bundles the Universal version of the app with the
[Ahead-of-Time (AoT) compiler](guide/aot-compiler).
A Node Express web server turns client requests into the HTML pages rendered by Universal.

To create server-side app module, `app.server.module.ts`, run the following CLI command.
-->
이번 섹션에서는 [히어로들의 여행](tutorial)을 기반으로 Universal에 대해 알아봅시다.

이 튜토리얼의 기본 기능은 수정하지 않습니다.
튜토리얼을 Universal 버전으로 빌드하고 서비스하기 위해 파일을 몇 개 추가해 봅시다.

그리고 이번에는 Universal 버전의 앱은 [Ahead-of-Time (AoT) 컴파일러](guide/aot-compiler)로 컴파일하고 번들링합니다.
Node Express 웹 서버는 클라이언트가 보낸 요청에 대한 응답으로 Universal 버전으로 렌더링된 HTML 페이지를 보냅니다.

서버 사이드 앱 모듈 `app.server.module.ts`을 만들기 위해 Angular CLI로 다음 명령을 실행합니다.

<code-example format="." language="bash">

ng add @nguniversal/express-engine --clientProject angular.io-example

</code-example>

<!--
The command creates the following folder structure.
-->
그러면 다음과 같은 폴더 구조가 생성됩니다.

<code-example format="." language="none" linenums="false">
src/
  index.html                 <i>앱이 시작되는 웹 페이지</i>
  main.ts                    <i>클라이언트에서 앱을 부트스트랩하는 파일</i>
  main.server.ts             <i>* 서버에서 앱을 부트스트랩하는 파일</i>
  tsconfig.app.json          <i>TypeScript 클라이언트 환경설정 파일</i>
  tsconfig.server.json       <i>* TypeScript 서버 환경설정 파일</i>
  tsconfig.spec.json         <i>TypeScript 테스트 환경설정 파일</i>
  style.css                  <i>앱 전역 스타일</i>
  app/ ...                   <i>애플리케이션 코드</i>
    app.server.module.ts     <i>* 서버 사이드 애플리케이션 모듈</i>
server.ts                    <i>* express 웹 서버</i>
tsconfig.json                <i>TypeScript 클라이언트 환경설정 파일</i>
package.json                 <i>npm 설정 파일</i>
webpack.server.config.js     <i>* webpack 서버 설정 파일</i>
</code-example>

<!--
The files marked with `*` are new and not in the original tutorial sample.
This guide covers them in the sections below.
-->
위 폴더 구조에서 `*`로 표시된 파일이 새로 추가된 파일입니다.
이 문서에서는 이 파일들에 대해 다룹니다.

{@a http-urls}

<!--
### Using absolute URLs for server requests
-->
### 서버에서 절대 URL로 요청 보내기

<!--
The tutorial's `HeroService` and `HeroSearchService` delegate to the Angular `HttpClient` module to fetch application data.
These services send requests to _relative_ URLs such as `api/heroes`.
In a Universal app, HTTP URLs must be _absolute_ (for example, `https://my-server.com/api/heroes`) even when the Universal web server is capable of handling relative requests.
This means you need to change your services to make requests with absolute URLs when running on the server and with relative URLs when running in the browser.

One solution is to provide the server's runtime origin under Angular's [`APP_BASE_HREF`](api/common/APP_BASE_HREF) token,
inject it into the service, and prepend the origin to the request URL.

Start by changing the `HeroService` constructor to take a second `origin` parameter that is optionally injected via the `APP_BASE_HREF` token.
-->
튜토리얼에서 `HeroService`와 `HeroSearchService`는 Angular `HttpClient` 모듈을 사용해서 애플리케이션 데이터를 가져옵니다.
그리고 이 서비스들은 `api/heroes`와 같은 _상대_ URL을 사용합니다.
하지만 Universal 앱에서는 서버가 상대주소를 지원하더라도 반드시 _절대_ 주소(ex. `https://my-server.com/api/heroes`)를 사용해야 합니다.
그래서 애플리케이션에 있는 서비스는 서버로 요청을 보낼 때 절대 URL을 사용해야 하며, 브라우저에서 실행될 때는 상대 URL을 사용해야 합니다.

두 경우를 모두 커버하려면 서버 사이드 앱에서는 서비스에 Angular [`APP_BASE_HREF`](api/common/APP_BASE_HREF) 토큰을 의존성으로 주입해서 서버로 요청하는 URL을 조정해야 합니다.

그래서 `APP_BASE_HREF` 토큰을 `HeroService`의 생성자의 두 번째 인자로 주입받도록 다음과 같이 수정합니다.

<!--
<code-example path="universal/src/app/hero.service.ts" region="ctor" header="src/app/hero.service.ts (constructor with optional origin)">
</code-example>
-->
<code-example path="universal/src/app/hero.service.ts" region="ctor" header="src/app/hero.service.ts (옵션 인자 origin을 추가한 생성자)">
</code-example>

<!--
The constructor uses the `@Optional()` directive to prepend the origin to `heroesUrl` _if it exists_.
You don't provide `APP_BASE_HREF` in the browser version, so `heroesUrl` remains relative.
-->
이 때 생성자에는 `APP_BASE_HREF`가 _존재할 때만_ 의존성을 주입하기 위해 `@Optional()` 디렉티브를 사용했습니다.
앱이 브라우저에서 실행될 때는 `APP_BASE_HREF`를 지정하지 않기 때문에 `heroesUrl`은 상대 주소로 사용됩니다.

<div class="alert is-helpful">

  <!--
  **Note:** You can ignore `APP_BASE_HREF` in the browser if you've specified `<base href="/">` in the `index.html` file to satisfy the router's need for a base address (as the tutorial sample does).
  -->
  **참고:** 라우터가 동작하는 기본 주소를 변경하기 위해 `index.html` 파일에 `<base href="/">`를 지정했으면 `APP_BASE_HREF`는 무시해도 됩니다. (튜토리얼 문서를 참고하세요.)

</div>

{@a universal-engine}
<!--
### Universal template engine
-->
### Universal 템플릿 엔진

<!--
The important bit in the `server.ts` file is the `ngExpressEngine()` function.
-->
`server.ts` 파일에서는 `ngExpressEngine()` 함수가 중요합니다.

<code-example path="universal/server.ts" header="server.ts" region="ngExpressEngine">
</code-example>

<!--
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
-->
`ngExpressEngine()` 함수는 Universal이 제공하는 `renderModuleFactory()` 함수를 랩핑한 함수이며, `renderModuleFactory()` 함수는 클라이언트의 요청을 서버가 렌더링한 HTML 페이지로 변경해서 요청하는 함수입니다.
이 함수는 서버에서 사용하는 _템플릿 엔진_ 에 따라 적절하게 실행하면 됩니다.

* 첫번째 인자는 `AppServerModule` 입니다.
이 모듈은 Universal 서버 사이드 렌더러와 애플리케이션을 이어주는 역할을 합니다.

* 두번째 인자 `extraProviders`는 생략할 수 있습니다. 이 인자에는 서버에만 필요한 의존성 객체의 프로바이더를 지정합니다.
이 인자는 서버 인스턴스와 관련된 정보를 앱에 사용해야 할 때 지정합니다.
그래서 이 예제에서처럼 서버 사이드 앱이 [HTTP URL을 절대 주소로](#http-urls) 요청해야 할 때 서버의 절대 주소를 `APP_BASE_HREF` 토큰으로 주입하는 방식으로 사용할 수 있습니다.

`ngExpressEngine()` 함수는 렌더링된 페이지를 `Promise` 콜백 형태로 반환합니다.
그리고 이 페이지를 어떻게 활용할 것인지는 서버에서 사용하는 엔진에 따라 달라집니다.
단순하게 구현하면, `Promise` 콜백 형태로 전달된 페이지를 웹 서버로 반환하고 웹 서버가 HTTP 응답으로 클라이언트에 전달하면 됩니다.

<div class="alert is-helpful">

  <!--
  **Note:**  These wrappers help hide the complexity of the `renderModuleFactory()` function. There are more wrappers for different backend technologies
  at the [Universal repository](https://github.com/angular/universal).
  -->
  **참고:** `renderModuleFactory()` 함수를 직접 사용하는 것보다는 `ngExpressEngine()` 랩핑 헬퍼를 사용하는 것이 편합니다. 이와 비슷한 방식으로 제공되는 랩퍼 함수들을 알아보려면 [Universal 레파지토리](https://github.com/angular/universal)를 참고하세요.

</div>

<!--
### Filtering request URLs
-->
### 요청으로 보내는 URL 필터링하기

<!--
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
-->
웹 서버는 _앱 페이지를 요청하는 것_ 과 데이터를 요청하는 것을 구별할 수 있어야 합니다.

하지만 최상위 주소 `/` 이외에는 이 요청이 어떤 용도로 사용되는 것인지 구분하기 어렵습니다.
브라우저가 사용하는 라우팅 경로가 `/dashboard`나 `heroes`, `/detail:12`와 같은 형식으로 존재할 수 있기 때문입니다.
그런데 앱이 서버에서 모두 렌더링되어 서비스된다고 하면, 사용자가 클릭할 수 있는 _모든_ 앱 링크는 페이지를 전환하는 URL에 해당하며 Angular 라우터가 모두 처리해야 한다고 간주할 수 있습니다.

다행히 애플리케이션 라우팅이 공통으로 활용할 수 있는 규칙이 있습니다: 파일 확장자가 없는 URL을 모두 라우팅 경로로 간주하는 방법입니다.
(데이터 요청도 확장자가 없지만, 이 경우에는 URL이 `/api`로 시작하기 때문에 쉽게 구분할 수 있습니다.)
앱에 필요한 정적 애셋(static asset)들은 모두 확장자가 존재합니다. (ex. `main.js`, `/node_modules/zone.js/dist/zone.js`)

Angular 앱은 라우터를 사용하기 때문에 다음과 같은 3가지 요청을 쉽게 구분하고 적절한 방법으로 처리할 수 있습니다.

1. 데이터 요청 - URL이 `/api`로 시작하는 경우
2. 앱 네비게이션 - 파일 확장자가 없는 경우
3. 정적 애셋 - 두 경우를 제외한 모든 경우

Node Express 서버는 미들웨어 파이프라인을 연결하는 방식으로 동작하기 때문에 클라이언트가 보낸 요청을 처리할 때 URL을 활용할 수 있습니다.
그래서 데이터 요청 URL을 처리하는 Node Express 서버의 파이프라인을 정의한다면 Express가 제공하는 `app.get()` 함수를 사용해서 다음과 같이 정의할 수 있습니다.

<!--
<code-example path="universal/server.ts" header="server.ts (data URL)" region="data-request" linenums="false">
</code-example>
-->
<code-example path="universal/server.ts" header="server.ts (데이터 URL)" region="data-request" linenums="false">
</code-example>

<div class="alert is-helpful">

  <!--
  **Note:** This sample server doesn't handle data requests.

  The tutorial's "in-memory web API" module, a demo and development tool, intercepts all HTTP calls and
  simulates the behavior of a remote data server.
  In practice, you would remove that module and register your web API middleware on the server here.
  -->
  **참고:** 튜토리얼 설정으로는 데이터 요청을 처리하지 않습니다.

  지금 살펴보고 있는 튜토리얼은 "인-메모리 웹 API" 모듈을 사용하기 때문에, 서버로 보내야 하는 모든 HTTP 요청을 가로채서 메모리 안에서 처리합니다.
  리모트 데이터 서버로 실제 요청을 보내려면 이 모듈을 제거하고 서버에 웹 API 미들웨어를 설정해야 합니다.

</div>

<!--
The following code filters for request URLs with no extensions and treats them as navigation requests.
-->
다음 코드는 URL에 확장자가 없을 때 이 요청을 네비게이션 요청으로 처리하는 코드입니다.

<!--
<code-example path="universal/server.ts" header="server.ts (navigation)" region="navigation-request" linenums="false">
</code-example>
-->
<code-example path="universal/server.ts" header="server.ts (네비게이션)" region="navigation-request" linenums="false">
</code-example>

<!--
### Serving static files safely
-->
### 정적 파일 안전하게 제공하기

<!--
A single `app.use()` treats all other URLs as requests for static assets
such as JavaScript, image, and style files.

To ensure that clients can only download the files that they are permitted to see, put all client-facing asset files in the `/dist` folder and only honor requests for files from the `/dist` folder.

The following Node Express code routes all remaining requests to `/dist`, and returns a `404 - NOT FOUND` error if the file isn't found.
-->
JavaScript 파일이나 이미지 파일, 스타일 파일과 같은 정적 애셋은 `app.use()` 하나로 간단하게 처리할 수 있습니다.

그리고 클라이언트가 이 파일들을 다운로드 받을 수 있는 권한을 지정하기 위해, 애셋 파일은 모두 `/dist` 폴더에 두는 것이 좋습니다.

아래 코드는 정적 애셋을 요청받았을 때 실행되는 Node Express 코드입니다. 요청받은 파일은 `/dist` 폴더에서 찾아 보내는데, 이 파일이 존재하지 않으면 `404 - NOT FOUND`를 반환합니다.

<!--
<code-example path="universal/server.ts" header="server.ts (static files)" region="static" linenums="false">
</code-example>
-->
<code-example path="universal/server.ts" header="server.ts (정적 파일)" region="static" linenums="false">
</code-example>


<!--
### Universal in action
-->
### Universal 동작 확인하기

<!--
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
-->
브라우저를 열고 http://localhost:4000/로 접속합니다.
그러면 이전에 봤던 "히어로들의 여행" 대시보드 페이지를 확인할 수 있습니다.

`routerLinks`를 사용하는 네비게이션도 잘 동작합니다.
대시보드 페이지에서 히어로 목록 페이지로 이동할 수 있고, 반대 경우도 마찬가지입니다.
대시보드 페이지에서 히어로를 한 명 클릭하면 상세정보 페이지로도 이동할 수 있습니다.

그런데 다음 기능은 동작하지 않습니다.

* 히어로 목록 페이지에서 히어로를 클릭하면 아무 반응이 없습니다.
* 히어로를 추가하거나 제거할 수 없습니다.
* 대시보드 페이지에 있는 검색 박스를 사용할 수 없습니다.
* 상세정보 페이지에 있는 *뒤로 가기* 버튼과 *저장* 버튼이 동작하지 않습니다.

사용자가 유발하는 이벤트는 `routerLink` 클릭 말고는 모두 사용할 수 없습니다.
클라이언트 앱을 전체 버전으로 내려받기 전까지는 그렇습니다.
그래서 클라이언트 앱을 컴파일해서 `dist/` 폴더에 둬야 합니다.

서버가 렌더링한 앱은 아주 짧은 시간 안에 클라이언트 앱으로 전환됩니다.
이 전환 동작을 확실하게 확인하려면 네트워크 속도를 제한하면 됩니다.
애초에 Universal 앱은 저사양의 장비나 네트워크 상황이 좋지 않은 상태를 보완하기 위해 제공되는 테크닉입니다.

Chrome 개발자 도구를 열고 Network 탭으로 이동하세요.
이 탭에서 메뉴바 가장 오른쪽에 있는 [Network Throttling](https://developers.google.com/web/tools/chrome-devtools/network-performance/reference#throttling) 드롭다운을 사용하면 네트워크 속도를 제한할 수 있습니다.

"3G" 설정에서 앱을 실행해 보세요.
서버가 렌더링한 앱은 여전히 빨리 실행되지만 클라이언트 앱으로 온전히 대체되는 것은 몇 초가 걸릴 것입니다.
