<!--
# Next steps: tools and techniques
-->
# 다음 단계: 개발 도구와 테크닉

<!--
Once you have understood the basic building blocks, you can begin to learn more about the features and tools that are available to help you develop and deliver Angular applications.  Angular provides a lot more features and services that are covered in this documentation.
-->
Angular 애플리케이션을 구성하는 기본 요소에 대해 이해했다면, 이제 Angular 애플리케이션을 개발하고 배포할 때 도움이 되는 툴과 기능에 대해 알아보는 것도 좋습니다. 이 문서에서는 Angular에서 제공하는 기능과 서비스에 대해 알아봅니다.

<!--
#### Responsive programming tools
-->
#### 반응형 프로그래밍

<!--
   * [Lifecycle hooks](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction, by implementing the lifecycle hook interfaces.
-->
   * [라이프싸이클 후킹](guide/lifecycle-hooks): 컴포넌트는 생성되면서 종료될 때까지 Angular가 정의하는 생명주기를 따릅니다. 그리고 라이프싸이클 후킹 함수를 사용하면 컴포넌트의 생명주기에 원하는 동작을 실행할 수 있습니다.

<!--
   * [Observables and event processing](guide/observables): How to use observables with components and services to publish and subscribe to messages of any type, such as user-interaction events and asynchronous operation results.
-->
   * [옵저버블, 이벤트 처리](guide/observables): 컴포넌트나 서비스는 옵저버블을 사용해서 메시지를 구독하거나 발핼할 수 있습니다. 사용자의 동작 이벤트나 비동기 로직을 이 방식으로 처리할 수 있습니다.

<!--
#### Client-server interaction tools
-->
#### 클라이언트-서버 통신

<!--
  * [HTTP](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.
-->
  * [HTTP](guide/http): 서버에서 데이터를 가져오거나 서버로 데이터를 보낼 때 사용하는 HTTP 서비스입니다.

<!--
  * [Server-side Rendering](guide/universal): Angular Universal generates static application pages on the server through server-side rendering (SSR). This allows you to run your Angular app on the server in order to improve performance and show the first page quickly on mobile and low-powered devices, and also facilitate web crawlers.
-->
  * [서버 사이드 렌더링](guide/universal): 서버에서 서버 사이드 렌더링을 사용하려면 Angular Universal로 정적 애플리케이션 페이지를 생성할 수 있습니다. Angular 애플리케이션을 빌드된 상태로 제공하면 애플리케이션의 실행 성능을 향상시킬 수 있고, 모바일에서 첫 페이지를 빨리 띄울 수 있으며, 웹 크롤러에도 대응할 수 있습니다.

<!--
  * [Service Workers](guide/service-worker-intro): A service worker is a script that runs in the web browser and manages caching for an application. Service workers function as a network proxy. They intercept outgoing HTTP requests and can, for example, deliver a cached response if one is available. You can significantly improve the user experience by using a service worker to reduce dependency on the network.
-->
  * [서비스 워커](guide/service-worker-intro): 서비스 워커는 웹 브라우저 캐시에서 실행되며 애플리케이션의 캐시를 관리하는 스크립트입니다. 그리고 이 서비스 워커는 외부로 나가는 HTTP 요청을 가로채서 서버의 응답을 캐싱할 수 있기 때문에 네트워크 프록시로 사용할 수도 있습니다. 서버의 응답을 캐싱하면 서버와 통신하는 횟수를 줄일 수 있기 때문에 사용자의 애플리케이션 실행 성능을 대폭 향상시킬 수 있습니다.

<!--
#### Domain-specific libraries
-->
#### 라이브러리

<!--
   * [Animations](guide/animations): Animate component behavior
without deep knowledge of animation techniques or CSS with Angular's animation library.
-->
   * [애니메이션](guide/animations): 애니메이션 테크닉이나 CSS 애니메이션에 대해 자세히 알지 못해도 Angular 애니메이션 라이브러리를 활용하면 컴포넌트에 애니메이션을 간단하게 적용할 수 있습니다.

<!--
   * [Forms](guide/forms): Support complex data entry scenarios with HTML-based validation and dirty checking.
-->
   * [폼](guide/forms): 복잡한 데이터 입력을 폼으로 구성할 수 있습니다. HTML 기반의 유효성 검증과 폼 접근 확인도 지원합니다.

<!--
#### Support for the development cycle
-->
#### 개발 지원

<!--
   * [Testing Platform](guide/testing): Run unit tests on your application parts as they interact with the Angular framework.
-->
   * [테스트](guide/testing): Angular 프레임워크에서 지원하는 유닛 테스트를 애플리케이션에 적용해 보세요.

<!--
   * [Internationalization](guide/i18n):  Angular's internationalization (i18n) tools can help you make your app available in multiple languages.
-->
   * [Internationalization](guide/i18n): Angular에서 지원하는 i18n 기능을 활용해서 애플리케이션에 다국어를 적용해 보세요.

<!--
   * [Compilation](guide/aot-compiler): Angular provides just-in-time (JIT) compilation for the development environment, and ahead-of-time (AOT) compilation for the production environment.
-->
   * [컴파일](guide/aot-compiler): Angular의 컴파일 방식은 개발용으로 사용하는 JIT(just-in-time) 컴파일과 운영용으로 사용하는 AOT(ahead-of-time) 컴파일이 있습니다.

<!--
   * [Security guidelines](guide/security): Learn about Angular's built-in protections against common web-app vulnerabilities and attacks such as cross-site scripting attacks.
-->
   * [보안 가이드라인](guide/security):  크로스사이트 스크립트 공격과 같은 일반적인 웹앱의 취약점을 Angular에서 어떻게 방어하는지 확인해 보세요.

<!--
#### Setup and deployment tools
-->
#### 개발 환경 설정

<!--
   * [Setup for local development](guide/setup): Learn how to set up a new project for development with QuickStart.
-->
   * [로컬 개발환경 설정](guide/setup): 퀵스타트 문서를 확인하면서 새로운 프로젝트를 개발하기 위한 로컬 개발 환경을 설정해 보세요.

<!--
   * [Installation](guide/npm-packages): The [Angular CLI](https://cli.angular.io/), Angular applications, and Angular itself depend on features and functionality provided by libraries that are available as [npm](https://docs.npmjs.com/) packages.
-->
   * [npm 패키지 설치](guide/npm-packages): [Angular CLI](https://cli.angular.io/)와 Angular 애플리케이셔, Angular 프레임워크는 모두 [npm](https://docs.npmjs.com/) 패키지를 활용합니다. Angular는 어떤 npm를 활용하는지, Angular 프레임워크는 어떤 패키지로 구성되는지 확인해 보세요.

<!--
   * [Typescript Configuration](guide/typescript-configuration): TypeScript is the primary language for Angular application development.
-->
   * [Typescript 설정](guide/typescript-configuration): TypeScript는 Angular 애플리케이션 개발에 사용되는 언어입니다.

<!--
   * [Browser support](guide/browser-support): Learn how to make your apps compatible across a wide range of browsers.
-->
   * [브라우저 지원](guide/browser-support): 개발하려는 앱이 얼마나 많은 브라우저에서 동작할 수 있는지 확인해 보세요.

<!--
   * [Deployment](guide/deployment): Learn techniques for deploying your Angular application to a remote server.
-->
   * [배포](guide/deployment): Angular 애플리케이션을 서버에 배포하는 방법을 알아보세요.

<hr/>
