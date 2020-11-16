<!--
# Deploying an application
-->
# 애플리케이션 배포하기

<!--
To deploy your application, you have to compile it, and then host the JavaScript, CSS, and HTML on a web server. Built Angular applications are very portable and can live in any environment or served by any technology, such as Node, Java, .NET, PHP, and many others.

<div class="alert is-helpful">

Whether you came here directly from [Part 1](start "Try it: A basic app"), or completed the entire online store application through the [In-app navigation](start/start-routing "Try it: In-app navigation"), [Manage data](start/start-data "Try it: Manage data"), and [Forms for user input](start/start-forms "Try it: Forms for user input") sections, you have an application that you can deploy by following the instructions in this section.

</div>
-->
애플리케이션을 배포하려면 애플리케이션을 컴파일했을 때 생성되는 JavaScript, CSS, HTML 파일을 웹 서버에 호스팅해야 합니다.
이 때 Angular로 만든 애플리케이션은 호스팅 환경에 영향을 받지 않기 때문에 Node.js, Java, .NET, PHP 등 운영되는 서버 환경에 관계없이 서비스할 수 있습니다.

<div class="alert is-helpful">

[1단계](start "Try it: A basic app")에서 다룬 앱이나 [네비게이션](start/start-routing "Try it: In-app navigation"), [데이터 다루기](start/start-data "Try it: Manage data"), [폼으로 입력 받기](start/start-forms "Try it: Forms for user input") 섹션에서 다룬 앱은 모두 이 문서에서 설명하는 대로 배포할 수 있습니다.

</div>


<!--
## Share your application
-->
## 애플리케이션 공유하기

<!--
StackBlitz projects are public by default, allowing you to share your Angular app via the project URL. Keep in mind that this is a great way to share ideas and prototypes, but it is not intended for production hosting.

1. In your StackBlitz project, make sure you have forked or saved your project.
1. In the preview page, you should see a URL that looks like `https://<Project ID>.stackblitz.io`.
1. Share this URL with a friend or colleague.
1. Users that visit your URL will see a development server start up, and then your application will load.
-->
StackBlitz에서 만든 프로젝트는 기본적으로 공개된 상태이기 때문에 프로젝트 URL을 입력하면 Angular 앱을 실행할 수 있습니다.
운영용으로는 적합하지 않지만 프로토타입이라면 이런 방법도 좋습니다.

1. StackBlitz 프로젝트를 포크하거나 따로 저장하세요.
1. 미리보기 화면에 보이는 `https://<프로젝트 ID>.stackblitz.io` 주소를 기억하세요.
1. 이 주소를 친구나 동료들에게 공유해 보세요.
1. 이 주소로 접속하면 개발서버가 실행되면서 애플리케이션이 실행됩니다.


<!--
## Building locally
-->
## 로컬환경에서 빌드하기

<!--
To build your application locally or for production, download the source code from your StackBlitz project by clicking the `Download Project` icon in the left menu across from `Project` to download your files.

Once you have the source code downloaded and unzipped, install `Node.js` and serve your app with the Angular CLI.

From the terminal, install the Angular CLI globally with:

```sh
npm install -g @angular/cli
```

This installs the command `ng` on your system, which is the command you use to create new workspaces, new projects, serve your application during development, or produce builds to share or distribute.

Create a new Angular CLI workspace using the [`ng new`](cli/new "CLI ng new command reference") command:

```sh
ng new my-project-name
```

In your new CLI generated app, replace the `/src` folder with the one from your `StackBlitz` download, and then perform a build.

```sh
ng build --prod
```

This will produce the files that you need to deploy.

<div class="alert is-helpful">

If the above `ng build` command throws an error about missing packages, append the missing dependencies in your local project's `package.json` file to match the one in the downloaded StackBlitz project.

</div>
-->
애플리케이션을 로컬 환경에서 운영용으로 빌드하려면 먼저 StackBlitz 사이트 왼쪽 메뉴에 있는 `Download Project` 아이콘을 클릭해서 프로젝트를 다운받아야 합니다.

그 다음에는 내려받은 소스 코드 압축을 풀고 `Node.js` 환경에서 Angular CLI를 사용해서 서비스해야 합니다.

터미널에서 다음 명령을 실행해서 Angular CLI를 전역으로 설치합니다:

```sh
npm install -g @angular/cli
```

이제 시스템에서 Angular CLI가 제공하는 `ng` 명령을 실행할 수 있습니다.
Angular CLI를 사용하면 워크스페이스를 생성하거나 프로젝트를 생성할 수 있고, 애플리케이션을 개발 모드로 서비스하거나 운영용으로 빌드하고 배포할 수 있습니다.


Angular CLI 워크스페이스를 새로 생성하려면 [`ng new`](cli/new "CLI ng new command reference") 명령을 실행하면 됩니다:

```sh
ng new my-project-name
```

이렇게 생성된 앱의 `/src` 폴더를 `StackBlitz`에서 다운받은 프로젝트로 교체한 후에 다음 명령을 실행해서 애플리케이션을 빌드합니다:

```sh
ng build --prod
```

이 명령이 실행되고 나면 배포에 필요한 파일이 모두 준비됩니다.


<div class="alert is-helpful">

`ng build` 명령을 실행할 때 에러가 발생하면 프로젝트 설정 파일 `package.json` 파일에 명시된 패키지가 제대로 설치되었는지 확인해 보세요.

</div>


<!--
#### Hosting the built project
-->
### 프로젝트 호스팅하기

<!--
The files in the `dist/my-project-name` folder are static. This means you can host them on any web server capable of serving files (such as `Node.js`, Java, .NET), or any backend (such as Firebase, Google Cloud, or App Engine).
-->
`dist/프로젝트-이름` 폴더에 있는 파일은 모두 정적 파일입니다.
그래서 이렇게 빌드된 파일은 파일을 서비스할 수 있는 서버(`Node.js`, Java, .NET 등)나 백엔드 서비스(Firebase, Google Cloud, AppEngine)에서 모두 호스팅할 수 있습니다.


<!--
### Hosting an Angular app on Firebase
-->
### Firebase에 호스팅하기

<!--
One of the easiest ways to get your site live is to host it using Firebase.

1. Sign up for a firebase account on [Firebase](https://firebase.google.com/ "Firebase web site").
1. Create a new project, giving it any name you like.
1. Add the `@angular/fire` schematics that will handle your deployment using `ng add @angular/fire`.
1. Install [Firebase CLI](https://firebase.google.com/docs/cli) globally using `npm install -g firebase-tools`.
1. Connect your CLI to your Firebase account and initialize the connection to your project using `firebase login` and `firebase init`.
1. Follow the prompts to select the `Firebase` project you are creating for hosting.
    - Select the `Hosting` option on the first prompt.
    - Select the project you previously created on Firebase.
    - Select `dist/my-project-name` as the public directory.
1. Deploy your application with `ng deploy`.
1. Once deployed, visit https://your-firebase-project-name.firebaseapp.com to see it live!
-->
애플리케이션을 가장 간단하게 배포하는 방법은 Firebase를 활용하는 것입니다.

1. [Firebase](https://firebase.google.com/ "Firebase web site")에 가입합니다.
1. 새로운 프로젝트를 생성합니다. 이름은 어느것이든 관계없습니다.
1. Angular 프로젝트를 호스팅할 때 사용하는 `@angular/fire` 스키매틱을 설치합니다. `ng add @angular/fire` 명령을 실행하면 됩니다.
1. npm 전역 패키지로 [Firebase CLI](https://firebase.google.com/docs/cli)를 설치합니다. `npm install -g firebase-tools` 명령을 실행하면 됩니다.
1. Angualr CLI와 Firebase 계정을 연결합니다. 프로젝트에서 `firebase login`, `firebase init` 명령을 실행하면 됩니다.
1. 프롬프트에서 안내하는 대로 호스팅 정보를 설정합니다.
    - 첫번째 항목에서 `Hosting` 옵션을 선택합니다.
    - 프로젝트를 선택합니다.
    - `dist/프로젝트-이름` 폴더를 선택합니다.
1. `ng deploy` 명령을 실행해서 애플리케이션을 배포합니다.
1. 애플리케이션을 배포하고 나면 https://firebase-프로젝트-이름.firebaseapp.com 에 접속해서 Angular 애플리케이션이 동작하는 것을 확인해 보세요!


<!--
### Hosting an Angular app anywhere else
-->
### 다른 곳에 호스팅하기

<!--
To host an Angular app on another web host, upload or send the files to the host.
Because you are building a single page application, you'll also need to make sure you redirect any invalid URLs to your `index.html` file.
Read more about development and distribution of your application in the [Building & Serving](guide/build "Building and Serving Angular Apps") and [Deployment](guide/deployment "Deployment guide") guides.
-->
다른 환경에 Angular 애플리케이션을 호스팅하려면 Angular 애플리케이션을 빌드했을 때 생성되는 파일을 업로드하고 이 파일을 정적으로 서비스하면 됩니다.
이 때 Angular 애플리케이션은 단일 페이지 애플리케이션(SPA, Single Page Application)이기 때문에 애플리케이션과 관련된 요청은 모두 `index.html` 파일로 리다이렉트해야 합니다.
자세한 내용은 [빌드 & 실행](guide/build "Building and Serving Angular Apps") 문서와 [배포](guide/deployment "Deployment guide") 문서를 참고하세요.


<!--
## Join the Angular community
-->
## Angular 커뮤니티와 함께하세요

<!--
You are now an Angular developer! [Share this moment](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter"), tell us what you thought of this get-started exercise, or submit [suggestions for future editions](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form").

Angular offers many more capabilities, and you now have a foundation that empowers you to build an application and explore those other capabilities:

* Angular provides advanced capabilities for mobile apps, animation, internationalization, server-side rendering, and more.
* [Angular Material](https://material.angular.io/ "Angular Material web site") offers an extensive library of Material Design components.
* [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site") offers an end-to-end testing framework for Angular apps.
* Angular also has an extensive [network of 3rd-party tools and libraries](resources "Angular resources list").

Keep current by following the [Angular blog](https://blog.angular.io/ "Angular blog").
-->
당신은 이제 Angular 개발자가 되었습니다!
[이 순간을 다른 사람들과 공유](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter")하고 지금까지의 과정이 어땠는지 저희에게 말씀해 주세요.
개선할 아이디어가 있다면 [제안](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form")해주셔도 좋습니다.

* Angular는 모바일 앱 개발은 물론이고 애니메이션, 다국어 지원, 서버사이드 렌더링도 지원합니다.
* [Angular Material](https://material.angular.io/ "Angular Material web site")을 활용하면 매터리얼 디자인 컴포넌트를 간단하게 적용할 수 있습니다.
* [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site")를 사용하면 Angular 앱에 엔드-투-엔드 테스트를 적용할 수 있습니다.
* [서드파티 툴이나 라이브러리 생태계](resources "Angular resources list")도 확인해 보세요.

[Angular 블로그](https://blog.angular.io/ "Angular blog")에서 발행되는 최근 소식도 참고해 보세요.