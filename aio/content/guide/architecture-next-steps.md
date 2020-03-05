<!--
# Next steps: tools and techniques
-->
# 다음 단계: 개발 도구와 테크닉

<!--
After you understand the basic Angular building blocks, you can learn more
about the features and tools that can help you develop and deliver Angular applications.

* Work through the [Tour of Heroes](tutorial/index) tutorial to get a feel for how to fit the basic building blocks together to create a well-designed application.

* Check out the [Glossary](guide/glossary) to understand Angular-specific terms and usage.

* Use the documentation to learn about key features in more depth, according to your stage of development and areas of interest.
-->
Angular의 기본 구성요소들에 대해 이해하고 나면 Angular 애플리케이션을 개발하는 데에 도움이 되는 기능과 툴에 대해 알아보는 것도 좋습니다.

* 기본 구성요소들이 어떻게 조합되는지, 애플리케이션을 어떻게 디자인하는 것이 좋은지 알아보려면 [히어로들의 여행](tutorial/index) 튜토리얼을 참고하는 것이 좋습니다.

* Angular에서 사용하는 용어에 대해 알아보려면 [찾아보기](guide/glossary) 문서를 참고하세요.

* 애플리케이션을 개발하면서 그때 그때 필요한 내용이 있다면 Angular의 각 기능에 대해 깊이있게 알아보는 것도 좋습니다.


<!--
## Application architecture
-->
## 애플리케이션 아키텍처

<!--
* The [NgModules](guide/ngmodules) guide provides in-depth information on the modular structure of an Angular application.

* The [Routing and navigation](guide/router) guide provides in-depth information on how to construct applications that allow a user to navigate to different [views](guide/glossary#view) within your single-page app.

* The [Dependency injection](guide/dependency-injection) guide provides in-depth information on how to construct an application such that each component class can acquire the services and objects it needs to perform its function.
-->
* Angular 애플리케이션을 모듈 단위로 구성하는 방법에 대해 알아보려면 [NgModule](guide/ngmodules) 문서를 참고하세요.

* 단일 페이지 앱에서 사용자가 여러 [뷰](guide/glossary#view)를 전환하는 방법에 대해 알아보려면 [라우팅과 네비게이션](guide/router) 문서를 참고하세요.

* 컴포넌트 클래스가 서비스를 활용하는 방법에 대해 알아보려면 [의존성 주입](guide/dependency-injection) 문서를 참고하세요.


<!---
## Responsive programming
-->
## 반응형 프로그래밍

<!--
The **Components and Templates** guide provides guidance and details of the [template syntax](guide/template-syntax) that you use to display your component data when and where you want it within a view, and to collect input from users that you can respond to.

Additional pages and sections describe some basic programming techniques for Angular apps.

* [Lifecycle hooks](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction, by implementing the lifecycle hook interfaces.

* [Observables and event processing](guide/observables): How to use observables with components and services to publish and subscribe to messages of any type, such as user-interaction events and asynchronous operation results.

* [Angular elements](guide/elements): How to package components as *custom elements* using Web Components, a web standard for defining new HTML elements in a framework-agnostic way.

* [Forms](guide/forms-overview): Support complex data entry scenarios with HTML-based input validation.

* [Animations](guide/animations): Use Angular's animation library to animate component behavior
without deep knowledge of animation techniques or CSS.
-->
**컴포넌트와 템플릿** 가이드 문서는 화면에 컴포넌트 데이터를 표시하거나 사용자의 입력을 받을 때 사용하는 [템플릿 문법](guide/template-syntax)에 대해 자세하게 안내하고 있습니다.

이 문서 외에 Angular 앱을 개발하는 기본 테크닉에 대해서도 알아보세요.

* [라이프싸이클 후킹](guide/lifecycle-hooks): 컴포넌트는 생성되면서 종료될 때까지 Angular가 정의하는 생명주기를 따릅니다. 그리고 라이프싸이클 후킹 함수를 사용하면 컴포넌트의 생명주기에 원하는 동작을 실행할 수 있습니다.

* [옵저버블, 이벤트 처리](guide/observables): 컴포넌트나 서비스에서 옵저버블을 사용하면 어떻게 메시지를 발행하고 구독할 수 있는지 알아봅니다. 옵저버블은 사용자의 동작 이벤트나 비동기 로직도 모두 처리할 수 있습니다.

* [Angular elements](guide/elements): *커스텀 엘리먼트* 를 프레임워크와 상관없는 표준 HTML 엘리먼트 기반의 웹 컴포넌트로 묶는 방법에 대해 알아보세요.

* [폼](guide/forms-overview): HTML 기반에서 복잡한 데이터를 다루고 입력값의 유효성을 검증해 보세요.

* [애니메이션](guide/animations): Angular가 제공하는 애니메이션 라이브러리를 활용하면 복잡한 애니메이션 테크닉이나 깊은 CSS 지식없이도 컴포넌트에 애니메이션을 적용할 수 있습니다.


<!--
## Client-server interaction
-->
## 클라이언트-서버 통신

<!--
Angular provides a framework for single-page apps, where most of the logic and data resides on the client.
Most apps still need to access a server using the `HttpClient` to access and save data.
For some platforms and applications, you might also want to use the PWA (Progressive Web App) model to improve the user experience.

* [HTTP](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.
* [Server-side rendering](guide/universal): Angular Universal generates static application pages on the server through server-side rendering (SSR). This allows you to run your Angular app on the server in order to improve performance and show the first page quickly on mobile and low-powered devices, and also facilitate web crawlers.

* [Service workers and PWA](guide/service-worker-intro): Use a service worker to reduce dependency on the network and significantly improve the user experience.

* [Web workers](guide/web-worker): Learn how to run CPU-intensive computations in a background thread.
-->
Angular는 단일 페이지 애플리케이션을 만들때 사용하는 프레임워크이기 때문에 로직과 데이터는 대부분 클라이언트쪽에 존재합니다.
하지만 서버에서 데이터를 추가로 받아오거나 데이터를 서버에 저장하려면 `HttpClient`가 필요할 할 때도 있습니다.
사용자의 UX를 향상시키기 위해 PWA(Progressive Web App)을 도입해야 할 수도 있습니다.

* [HTTP](guide/http): 서버에서 데이터를 가져오거나 서버로 데이터를 보낼 때 사용하는 HTTP 서비스입니다.

* [서버사이드 렌더링](guide/universal): Angular Universal을 사용하면 서버사이드 렌더링(Server-side rendering, SSR) 기법으로 앱을 정적으로 서버에 빌드해 둘 수 있습니다. 이 방식을 활용하면 앱 성능이 향상되며 모바일과 저사양 장비에서도 첫번째 페이지를 더 빠르게 띄울  수 있습니다. 웹 크롤러도 대응할 수 있습니다.

* [서비스 워커와 PWA](guide/service-worker-intro): 네트워크 사용량을 줄이고 사용자의 UX를 대폭 향상시키려면 서비스 워커를 활용하는 것도 좋습니다.

* [웹 워커](guide/web-worker): CPU 부하가 많이 걸리는 작업은 백그라운드 스레드에서 실행할 수 있습니다.


<!--
## Support for the development cycle
-->
## 개발 단계에서 활용할 수 있는 팁

<!--
The **Development Workflow** section describes the tools and processes you use to compile, test, and  and deploy Angular applications.

* [CLI Command Reference](cli): The Angular CLI is a command-line tool that you use to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.

* [Compilation](guide/aot-compiler): Angular provides just-in-time (JIT) compilation for the development environment, and ahead-of-time (AOT) compilation for the production environment.

* [Testing platform](guide/testing): Run unit tests on your application parts as they interact with the Angular framework.

* [Deployment](guide/deployment): Learn techniques for deploying your Angular application to a remote server.

* [Security guidelines](guide/security): Learn about Angular's built-in protections against common web-app vulnerabilities and attacks such as cross-site scripting attacks.

* [Internationalization](guide/i18n): Make your app available in multiple languages with Angular's internationalization (i18n) tools.

* [Accessibility](guide/accessibility): Make your app accessible to all users.
-->
**개발 흐름** 섹션에서는 개발자가 앱을 컴파일하고 테스트하거나 배포하는 방법에 대해 안내합니다.

* [CLI 커맨드](cli): Angular CLI는 프로젝트나 애플리케이션, 라이브러리를 생성하거나 앱 개발에 필요한 테스트, 번들링, 배포를 할 때 활용할 수 있습니다.

* [컴파일](guide/aot-compiler): Angular는 AOT(ahead-of-time) 컴파일러를 사용합니다.

* [테스트](guide/testing): Angular 프레임워크와 상호작용하는 유닛 테스트를 실행해 보세요.

* [배포](guide/deployment): Angular 애플리케이션을 리모트 서버에 배포하는 방법에 대해 안내합니다.

* [보안 가이드라인](guide/security): Angular는 일반적으로 발생할 수 있는 웹앱 취약점과 크로스 사이트 스크립트 공격을 방어하는 기능을 기본으로 지원합니다.

* [다국어 번역](guide/i18n): 애플리케이션에 다국어를 지원하려면 Angular가 제공하는 i18n(internationalization) 툴을 활용할 수 있습니다.

* [접근성 지원](guide/accessibility): 모든 사용자가 앱을 사용할 수 있도록 앱 접근성을 개선해 보세요.


<!--
## File structure, configuration, and dependencies
-->
## 파일 구조, 환경 설정, 의존성 관리

<!--
* [Workspace and file structure](guide/file-structure): Understand the structure of Angular workspace and project folders.

* [Building and serving](guide/build): Learn to define different build and proxy server configurations for your project, such as development, staging, and production.

* [npm packages](guide/npm-packages): The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm](https://docs.npmjs.com/) packages and distributed via the npm registry. The Angular CLI creates a default `package.json` file, which specifies a starter set of packages that work well together and jointly support many common application scenarios.

* [TypeScript configuration](guide/typescript-configuration): TypeScript is the primary language for Angular application development.

* [Browser support](guide/browser-support): Make your apps compatible across a wide range of browsers.
-->
* [워크스페이스와 파일 구조](guide/file-structure): Angular의 워크스페이스와 프로젝트 파일 구조에 대해 알아보세요.

* [빌드, 실행](guide/build): 개발, 스테이징, 운영 환경마다 각각 다른 빌드 설정과 프록시 서버 설정을 적용할 수 있습니다.

* [npm 패키지](guide/npm-packages): Angular 프레임워크와 Angular CLI, 컴포넌트는 모두 [npm](https://docs.npmjs.com/)이 제공하는 패키지를 활용합니다. Angular CLI로 프로젝트를 생성하면 `package.json` 파일이 생성되며, 이 파일을 확장하면서 앱에 더 많은 기능을 추가할 수 있습니다.

* [TypeScript 환경설정](guide/typescript-configuration): TypeScript는 Angular 애플리케이션을 개발하는 언어입니다.

* [브라우저 지원](guide/browser-support): 애플리케이션이 실행되는 브라우저의 호환성을 확인해 보세요.


<!--
## Extending Angular
-->
## Angular 그 외에도

<!--
* [Angular libraries](guide/libraries): Learn about using and creating re-usable libraries.

* [Schematics](guide/schematics): Learn about customizing and extending the CLI's generation capabilities.

* [CLI builders](guide/cli-builder): Learn about customizing and extending the CLI's ability to apply tools to perform complex tasks, such as building and testing applications.
-->
* [Angular 라이브러리](guide/libraries): 재사용할 수 있는 라이브러리를 만들수 있습니다.

* [스키매틱(schematic)](guide/schematics): Angular CLI가 생성할 수 있는 구성요소를 추가하거나 커스터마이징 할 수 있습니다.

* [CLI 빌더](guide/cli-builder): 애플리케이션을 빌드하거나 테스트하는 복잡한 작업을 Angular CLI로 제어할 수 있습니다.