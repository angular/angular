<!--
# Deployment
-->
# 배포


<!--
To deploy your application, you have to compile it, and then host the JavaScript, CSS, and HTML on a web server. Built Angular applications are very portable and can live in any environment or served by any technology, such as Node, Java, .NET, PHP, and many others.
-->
애플리케이션을 배포하려면 앱을 컴파일 한 후에 생성되는 JavaScript, CSS, HTML 파일을 웹 서버에 호스팅해야 합니다. Angular 애플리케이션은 플랫폼을 가리지 않습니다. Angular 애플리케이션을 빌드한 결과물은 Node, Java, .NET, PHP 등과 같이 다양한 플랫폼에 적용할 수 있습니다.

<div class="alert is-helpful">

<!--
Whether you came here directly from [Your First App](start "Getting Started: Your First App"), or completed the entire online store application through the [Routing](start/routing "Getting Started: Routing"), [Managing Data](start/data "Getting Started: Managing Data"), and [Forms](start/forms "Getting Started: Forms") sections, you have an application that you can deploy by following the instructions in this section. 
-->
이 문서를 보기 전에 [첫번째 앱 만들기](start "시작하기: 첫번째 앱 만들기")를 끝내고 이 문서로 바로 왔거나 [라우팅](start/routing "시작하기: 라우팅"), [데이터 다루기](start/data "시작하기: 데이투 다루기"), and [폼](start/forms "시작하기: 폼") 문서를 쭉 보고 온 것은 중요하지 않습니다. 튜토리얼을 얼마나 진행했는지에 관계없이 이 문서를 활용하면 애플리케이션을 배포하는 방법에 대해 알게 될 것입니다.

</div>


<!--
## Share your application
-->
## 애플리케이션 공유하기

<!--
StackBlitz projects are public by default, allowing you to share your Angular app via the project URL. Keep in mind that this is a great way to share ideas and prototypes, but it is not intended for production hosting.

1. In your StackBlitz project, make sure you have forked or saved your project.
1. In the preview pane, you should see a URL that looks like `https://<Project ID>.stackblitz.io`.
1. Share this URL with a friend or colleague.
1. Users that visit your URL will see a development server start up, and then your application will load.
-->
StackBlitz 프로젝트는 기본적으로 모두에게 공유되어 있기 때문에 프로젝트 URL을 공유하면 지금까지 작성한 Angular 앱을 자유롬게 공유할 수 있습니다. 앱을 호스팅해서 운영용으로 배포하는 것과는 다르지만, 프로토타입을 공유하기에는 이 방법으로도 충분할 수 있습니다.

1. StackBlitz 프로젝트를 공유하려면 다른 프로젝트를 포크(fork)하거나 스스로 만든 프로젝트가 있어야 합니다.
1. 미리보기 화면을 보면 `https://<Project ID>.stackblitz.io`과 같은 URL을 확인할 수 있습니다.
1. 이 URL을 친구나 동료에게 공유해 보세요.
1. 이렇게 공유한 URL로 접속하면 애플리케이션이 동작하는 것을 확인할 수 있습니다.

<!--
## Building locally
-->
## 로컬 환경에서 빌드하기

<!--
To build your application locally or for production, you will need to download the source code from your StackBlitz project. Click the `Download Project` icon in the left menu across from `Project` to download your files.

Once you have the source code downloaded and unzipped, use the [Angular Console](https://angularconsole.com "Angular Console web site") to serve the application, or you install Node and have the Angular CLI installed.

From the terminal, install the Angular CLI globally with:
-->
로컬 환경에서 애플리케이션을 운영용을 빌드하려면 StackBlitz 프로젝트의 소스 코드를 다운받아야 합니다. 메뉴 왼쪽에 있는 `Download Project` 아이콘을 클릭해서 프로젝트를 다운로드 받으세요.

소스 코드를 다운로드받고 압축을 해제했다면 [Angular 콘솔](https://angularconsole.com "Angular Console web site")로 애플리케이션을 실행해볼 수 있습니다. 이 때 Node.js와 Angular CLI가 먼저 설치되어 있어야 합니다.

Angular CLI를 설치하려면 터미널에서 다음 명령을 실행하면 됩니다:

```sh
npm install -g @angular/cli
```

<!--
This will install the command `ng` into your system, which is the command you use to create new workspaces, new projects, serve your application during development, or produce builds that can be shared or distributed.

Create a new Angular CLI workspace using the [`ng new`](cli/new "CLI ng new command reference") command:
-->
이 명령을 실행해서 Angular CLI를 설치하고 나면 터미널에서 `ng` 명령을 실행할 수 있습니다. Angular CLI를 활용하면 새로운 워크스페이스를 만들거나 새로운 프로젝트를 만들 수 있고, 애플리케이션을 개발용 서버에서 띄울 수 있으며 운영용으로 빌드할 수도 있습니다.

새로운 Angular CLI 워크스페이스를 생성하려면 [`ng new`](cli/new "CLI ng new command reference") 명령을 다음과 같이 실행하면 됩니다:

```sh
ng new my-project-name
```

<!--
From there you replace the `/src` folder with the one from your `StackBlitz` download, and then perform a build.
-->
그리고 이렇게 생성한 프로젝트나 StackBlitz 에서 다운로드받은 프로젝트의 `/src` 폴더로 이동한 후에 다음 명령을 실행하면 애플리케이션을 빌드할 수 있습니다:

```sh
ng build --prod
```

<!--
This will produce the files that you need to deploy.
-->
이제 배포할 준비는 끝났습니다.

<!--
#### Hosting the built project
-->
#### 호스팅하기

<!--
The files in the `dist/my-project-name` folder are static and can be hosted on any web server capable of serving files (node, Java, .NET) or any backend (Firebase, Google Cloud, App Engine, others).
-->
`dist/my-project-name` 폴더에 있는 파일들은 정적 파일로 취급할 수 있기 때문에 파일을 호스팅할 수 있는 웹 서버라면 Node, Java, .NET에 관계없이 호스팅할 수 있습니다. 백엔드는 Firebase, Google Cloud, App Engine 중 어떤 것이라도 상관없습니다.

<!--
### Hosting an Angular app on Firebase
-->
### Firebase에 Angular 앱 호스팅하기

<!--
One of the easiest ways to get your site live is to host it using Firebase.

1. Sign up for a firebase account on [Firebase](https://firebase.google.com/ "Firebase web site").
1. Create a new project, giving it any name you like.
1. Install the `firebase-tools` CLI that will handle your deployment using `npm install -g firebase-tools`.
1. Connect your CLI to your Firebase account and initialize the connection to your project using `firebase login` and `firebase init`.
1. Follow the prompts to select the `Firebase` project you creating for hosting.
1. Deploy your application with `firebase deploy` because StackBlitz has created a `firebase.json` that tells Firebase how to serve your app.
1. Once deployed, visit https://your-firebase-project-name.firebaseapp.com to see it live!
-->
애플리케이션을 Firebase에 호스팅 하는 것은 아주 간단합니다.

1. [Firebase](https://firebase.google.com/ "Firebase web site") 에 가입합니다.
1. 원하는 이름으로 새로운 프로젝트를 생성합니다.
1. 애플리케이션을 배포하기 위해 `firebase-tools` CLI를 설치합니다. `npm install -g firebase-tools` 명령을 실행하면 됩니다.
1. CLI를 사용해서 Firebase 계정에 연결하고 프로젝트를 초기화하기 위해 Angular 프로젝트 폴더에서 `firebase login` 명령과 `firebase init` 명령을 실행합니다.
1. 프롬프트에서 안내하는 대로 호스팅할 `Firebase` 프로젝트를 선택합니다.
1. `firebase deploy` 명령을 실행해서 애플리케이션을 배포합니다. StackBlitz에서 만든 프로젝트는 이미 Firebase로 배포할 수 있도록 `firebase.json` 파일이 준비되어 있습니다.
1. 애플리케이션을 배포하고 나면 https://your-firebase-project-name.firebaseapp.com 에 접속해서 애플리케이션이 동작하는 것을 확인해 보세요!

<!--
### Hosting an Angular app anywhere else
-->
### 다른 환경에 Angular 앱 호스팅하기

<!--
To host an Angular app on another web host, you'll need to upload or send the files to the host. 
Because you are building a Single Page Application, you'll also need to make sure you redirect any invalid URLs to your `index.html` file. 
Learn more about development and distribution of your application in the [Building & Serving](guide/build "Building and Serving Angular Apps") and [Deployment](guide/deployment "Deployment guide") guides.
-->
Angular 앱을 Firebase가 아닌 다른 환경에 호스팅하려면 빌드 결과물을 어딘가에 업로드하는 방식을 사용하는 경우가 많습니다.
Angular 앱을 빌드한 결과물은 싱글 페이지 애플리케이션(Single Page Application)이기 때문에, 앱에 존재하지 않는 URL로 요청이 오더라도 언제나 `index.html` 파일로 리다이렉트하도록 지정하면 됩니다.
애플리케이션을 배포하는 것에 대해 자세하게 알아보려면 [프로젝트 빌드 & 실행 설정](guide/build "프로젝트 빌드 & 실행 설정") 문서나 [배포](guide/deployment "배포") 문서를 참고하세요.

<!--
## Join our community
-->
## 커뮤니티에 참여하세요

<!--
You are now an Angular developer! [Share this moment](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter"), tell us what you thought of this Getting Started, or submit [suggestions for future editions](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form"). 

Angular offers many more capabilities, and you now have a foundation that empowers you to build an application and explore those other capabilities:

* Angular provides advanced capabilities for mobile apps, animation, internationalization, server-side rendering, and more. 
* [Angular Material](https://material.angular.io/ "Angular Material web site") offers an extensive library of Material Design components. 
* [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site") offers an end-to-end testing framework for Angular apps. 
* Angular also has an extensive [network of 3rd-party tools and libraries](https://angular.io/resources "Angular resources list"). 

Keep current by following the [Angular blog](https://blog.angular.io/ "Angular blog"). 
-->
여기까지 진행했다면 이제 자랑스럽게 Angular 개발자라고 해도 됩니다! 튜토리얼을 진행하면서 어땠는지 [여기](https://twitter.com/intent/tweet?url=https://angular.io/start&text=I%20just%20finished%20the%20Angular%20Getting%20Started%20Tutorial "Angular on Twitter")에 공유해 보세요. 개선할 내용이 있다면 [Angular Github 레파지토리](https://github.com/angular/angular/issues/new/choose "Angular GitHub repository new issue form")에 이슈를 등록해도 됩니다.

* Angular를 활용할 수 있는 방법은 무궁무진합니다. 모바일 최적화, 애니메이션, i18n, 서버 사이드 렌더링에 대해서도 더 알아보세요
* [Angular Material](https://material.angular.io/ "Angular Material web site")을 활용하면 Angular 앱에 머티리얼 디자인 컴포넌트를 간단하게 적용할 수 있습니다.
* [Angular Protractor](https://protractor.angular.io/ "Angular Protractor web site")를 활용하면 Angular 앱에 엔드-투-엔드(end-to-end) 테스트를 적용할 수 있습니다.
* Angular 앱에는 [서드 파티 툴이나 라이브러리](https://angular.io/resources "Angular resources list")도 얼마든지 활용할 수 있습니다.

[Angular blog](https://blog.angular.io/ "Angular blog")에서 최신 Angular 소식을 빠르게 확인해 보세요.
