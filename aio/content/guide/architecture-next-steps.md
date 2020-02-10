<!--
# Next steps: tools and techniques
-->
# 다음 단계: 개발 도구와 테크닉

<<<<<<< HEAD
<!--
After you understand the basic Angular building blocks, you can begin to learn more
about the features and tools that are available to help you develop and deliver Angular applications.
Here are some key features.
-->
Angular 애플리케이션을 구성하는 기본 요소에 대해 이해했다면, 이제 Angular 애플리케이션을 개발하고 배포할 때 도움이 되는 툴과 기능에 대해 알아보는 것도 좋습니다. 이 문서에서는 Angular에서 제공하는 기능과 서비스에 대해 알아봅니다.
=======
After you understand the basic Angular building blocks, you can learn more
about the features and tools that can help you develop and deliver Angular applications.

* Work through the [Tour of Heroes](tutorial/index) tutorial to get a feel for how to fit the basic building blocks together to create a well-designed application.

* Check out the [Glossary](guide/glossary) to understand Angular-specific terms and usage.

* Use the documentation to learn about key features in more depth, according to your stage of development and areas of interest.

## Application architecture

* The [NgModules](guide/ngmodules) guide provides in-depth information on the modular structure of an Angular application.

* The [Routing and navigation](guide/router) guide provides in-depth information on how to construct applications that allow a user to navigate to different [views](guide/glossary#view) within your single-page app.

* The [Dependency injection](guide/dependency-injection) guide provides in-depth information on how to construct an application such that each component class can acquire the services and objects it needs to perform its function.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!---
## Responsive programming
-->
## 반응형 프로그래밍

<<<<<<< HEAD
<!--
=======
The **Components and Templates** guide provides guidance and details of the [template syntax](guide/template-syntax) that you use to display your component data when and where you want it within a view, and to collect input from users that you can respond to.

Additional pages and sections describe some basic programming techniques for Angular apps.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
* [Lifecycle hooks](guide/lifecycle-hooks): Tap into key moments in the lifetime of a component, from its creation to its destruction, by implementing the lifecycle hook interfaces.
-->
* [라이프싸이클 후킹](guide/lifecycle-hooks): 컴포넌트는 생성되면서 종료될 때까지 Angular가 정의하는 생명주기를 따릅니다. 그리고 라이프싸이클 후킹 함수를 사용하면 컴포넌트의 생명주기에 원하는 동작을 실행할 수 있습니다.

<!--
* [Observables and event processing](guide/observables): How to use observables with components and services to publish and subscribe to messages of any type, such as user-interaction events and asynchronous operation results.
-->
* [옵저버블, 이벤트 처리](guide/observables): 컴포넌트나 서비스에서 옵저버블을 사용하면 어떻게 메시지를 발행하고 구독할 수 있는지 알아봅니다. 옵저버블은 사용자의 동작 이벤트나 비동기 로직도 모두 처리할 수 있습니다.

<<<<<<< HEAD
<!--
=======
* [Angular elements](guide/elements): How to package components as *custom elements* using Web Components, a web standard for defining new HTML elements in a framework-agnostic way.

* [Forms](guide/forms-overview): Support complex data entry scenarios with HTML-based input validation.

* [Animations](guide/animations): Use Angular's animation library to animate component behavior
without deep knowledge of animation techniques or CSS.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
## Client-server interaction
-->
## 클라이언트-서버 통신

<<<<<<< HEAD
<!--
=======
Angular provides a framework for single-page apps, where most of the logic and data resides on the client.
Most apps still need to access a server using the `HttpClient` to access and save data.
For some platforms and applications, you might also want to use the PWA (Progressive Web App) model to improve the user experience.

>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
* [HTTP](guide/http): Communicate with a server to get data, save data, and invoke server-side actions with an HTTP client.
-->
* [HTTP](guide/http): 서버에서 데이터를 가져오거나 서버로 데이터를 보낼 때 사용하는 HTTP 서비스입니다.

<<<<<<< HEAD
<!--
* [Server-side Rendering](guide/universal): Angular Universal generates static application pages on the server through server-side rendering (SSR). This allows you to run your Angular app on the server in order to improve performance and show the first page quickly on mobile and low-powered devices, and also facilitate web crawlers.
-->
* [서버 사이드 렌더링(SSR)](guide/universal): 서버에서 서버 사이드 렌더링을 사용하려면 Angular Universal로 정적 애플리케이션 페이지를 생성할 수 있습니다. Angular 애플리케이션을 빌드된 상태로 제공하면 애플리케이션의 실행 성능을 향상시킬 수 있고, 모바일에서 첫 페이지를 빨리 띄울 수 있으며, 웹 크롤러에도 대응할 수 있습니다.

<!--
* [Service Workers](guide/service-worker-intro): Use a service worker to reduce dependency on the network
significantly improving the user experience.
-->
* [서비스 워커](guide/service-worker-intro): 네트워크 연결에 관계없이 동작하는 서비스 워커를 사용해 보세요. 사용성이 대폭 향상될 것입니다.

<!--
## Domain-specific libraries
-->
## 라이브러리

<!--
* [Animations](guide/animations): Use Angular's animation library to animate component behavior
without deep knowledge of animation techniques or CSS.
-->
* [애니메이션](guide/animations): 애니메이션 테크닉이나 CSS 애니메이션에 대해 자세히 알지 못해도 Angular 애니메이션 라이브러리를 활용하면 컴포넌트에 애니메이션을 간단하게 적용할 수 있습니다.

<!--
* [Forms](guide/forms): Support complex data entry scenarios with HTML-based validation and dirty checking.
-->
* [폼](guide/forms): 복잡한 데이터 입력을 폼으로 구성할 수 있습니다. HTML 기반의 유효성 검증과 폼 접근 확인도 지원합니다.

<!--
## Support for the development cycle
-->
## 개발 지원
=======
* [Server-side rendering](guide/universal): Angular Universal generates static application pages on the server through server-side rendering (SSR). This allows you to run your Angular app on the server in order to improve performance and show the first page quickly on mobile and low-powered devices, and also facilitate web crawlers.

* [Service workers and PWA](guide/service-worker-intro): Use a service worker to reduce dependency on the network and significantly improve the user experience.

* [Web workers](guide/web-worker): Learn how to run CPU-intensive computations in a background thread.

## Support for the development cycle

The **Development Workflow** section describes the tools and processes you use to compile, test, and  and deploy Angular applications.

* [CLI Command Reference](cli): The Angular CLI is a command-line tool that you use to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
* [Compilation](guide/aot-compiler): Angular provides just-in-time (JIT) compilation for the development environment, and ahead-of-time (AOT) compilation for the production environment.
-->
* [컴파일](guide/aot-compiler): Angular 애플리케이션을 개발할 때는 JIT(Just-In-Time) 컴파일러를 사용하며, 애플리케이션을 배포할 때는 AOT(Ahead-Of-Time) 컴파일러를 사용합니다.

<!--
* [Testing platform](guide/testing): Run unit tests on your application parts as they interact with the Angular framework.
-->
* [테스트 플랫폼](guide/testing): Angular 프레임워크가 지원하는 유닛 테스트를 애플리케이션에 적용해 보세요.

<<<<<<< HEAD
<!--
* [Internationalization](guide/i18n):  Make your app available in multiple languages with Angular's internationalization (i18n) tools.
-->
* [Internationalization](guide/i18n): Angular에서 지원하는 i18n 기능을 활용해서 애플리케이션에 다국어를 적용해 보세요.
=======
* [Deployment](guide/deployment): Learn techniques for deploying your Angular application to a remote server.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
* [Compilation](guide/aot-compiler): Angular provides just-in-time (JIT) compilation for the development environment, and ahead-of-time (AOT) compilation for the production environment.
-->
* [컴파일](guide/aot-compiler): Angular의 컴파일 방식은 개발용으로 사용하는 JIT(just-in-time) 컴파일과 운영용으로 사용하는 AOT(ahead-of-time) 컴파일이 있습니다.

<!--
* [Security guidelines](guide/security): Learn about Angular's built-in protections against common web-app vulnerabilities and attacks such as cross-site scripting attacks.
-->
* [보안 가이드라인](guide/security):  크로스사이트 스크립트 공격과 같은 일반적인 웹앱의 취약점을 Angular에서 어떻게 방어하는지 확인해 보세요.

<<<<<<< HEAD
<!--
## Setup, build, and deployment configuration
-->
## 개발, 빌드, 배포 환경 설정

<!--
* [CLI Command Reference](cli): The Angular CLI is a command-line tool that you use to create projects, generate application and library code, and perform a variety of ongoing development tasks such as testing, bundling, and deployment.
-->
* [CLI 명령어](cli): Angular CLI는 다양한 용도로 사용할 수 있는 커맨드라인 툴입니다. 프로젝트를 생성하거나 애플리케이션 코드를 생성할 때, 라이브러리 코드를 생성할 때도 사용하며 테스트, 번들링, 배포에도 사용할 수 있습니다.

<!--
* [Workspace and File Structure](guide/file-structure): Understand the structure of Angular workspace and project folders. 
-->
* [개발 환경과 파일 구성](guide/file-structure): Angular의 개발환경과 프로젝트 폴더에 대해 알아보세요.

<!--
* [npm Packages](guide/npm-packages): The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm](https://docs.npmjs.com/) packages and distributed via the npm registry. The Angular CLI creates a default `package.json` file, which specifies a starter set of packages that work well together and jointly support many common application scenarios.
-->
* [npm 패키지](guide/npm-packages): Angular 프레임워크와 Angular CLI, Angular 애플리케이션에서 사용하는 컴포넌트도 모두 [npm](https://docs.npmjs.com/) 패키지를 사용하며, 배포될 때도 npm 패키지 형태로 배포됩니다. Angular CLI로 프로젝트를 생성하면 기본 `package.json` 파일이 생성되며 애플리케이션이 확장되면서 이 파일도 함께 확장될 것입니다.
=======
* [Internationalization](guide/i18n): Make your app available in multiple languages with Angular's internationalization (i18n) tools.

* [Accessibility](guide/accessibility): Make your app accessible to all users.


## File structure, configuration, and dependencies

* [Workspace and file structure](guide/file-structure): Understand the structure of Angular workspace and project folders.

* [Building and serving](guide/build): Learn to define different build and proxy server configurations for your project, such as development, staging, and production.

* [npm packages](guide/npm-packages): The Angular Framework, Angular CLI, and components used by Angular applications are packaged as [npm](https://docs.npmjs.com/) packages and distributed via the npm registry. The Angular CLI creates a default `package.json` file, which specifies a starter set of packages that work well together and jointly support many common application scenarios.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072

<!--
* [TypeScript configuration](guide/typescript-configuration): TypeScript is the primary language for Angular application development.
-->
* [Typescript 설정](guide/typescript-configuration): TypeScript는 Angular 애플리케이션 개발에 사용되는 언어입니다.

<!--
* [Browser support](guide/browser-support): Make your apps compatible across a wide range of browsers.
-->
* [브라우저 지원](guide/browser-support): 개발하려는 앱이 얼마나 많은 브라우저에서 동작할 수 있는지 확인해 보세요.

<<<<<<< HEAD
<!--
* [Building and Serving](guide/build): Learn to define different build and proxy server configurations for your project, such as development, staging, and production.
-->
* [빌드와 개발서버](guide/build): 개발, 스테이징, 운영 환경에 맞게 개발 서버를 띄우거나 빌드할 수 있습니다.

<!--
* [Deployment](guide/deployment): Learn techniques for deploying your Angular application to a remote server.
-->
* [배포](guide/deployment): Angular 애플리케이션을 서버에 배포하는 방법을 알아보세요.
=======
## Extending Angular

* [Angular libraries](guide/libraries): Learn about using and creating re-usable libraries.

* [Schematics](guide/schematics): Learn about customizing and extending the CLI's generation capabilities.

* [CLI builders](guide/cli-builder): Learn about customizing and extending the CLI's ability to apply tools to perform complex tasks, such as building and testing applications.
>>>>>>> ae0253f34adad0e37d2a5e6596a08aa049ba3072
