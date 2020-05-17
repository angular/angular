<!--
# Overview of Angular libraries
-->
# Angular 라이브러리 개요

<!--
Many applications need to solve the same general problems, such as presenting a unified user interface, presenting data, and allowing data entry.
Developers can create general solutions for particular domains that can be adapted for re-use in different apps.
Such a solution can be built as Angular *libraries* and these libraries can be published and shared as *npm packages*.

An Angular library is an Angular [project](guide/glossary#project) that differs from an app in that it cannot run on its own.
A library must be imported and used in an app.

Libraries extend Angular's base functionality. For example, to add [reactive forms](guide/reactive-forms) to an app, add the library package using `ng add @angular/forms`, then import the `ReactiveFormsModule` from the `@angular/forms` library in your application code.
Similarly, adding the [service worker](guide/service-worker-intro) library to an Angular application is one of the steps for turning an application into a [Progressive Web App](https://developers.google.com/web/progressive-web-apps/) (PWA).
[Angular Material](https://material.angular.io/) is an example of a large, general-purpose library that provides sophisticated, reusable, and adaptable UI components.

Any app developer can use these and other libraries that have been published as npm packages by the Angular team or by third parties. See [Using Published Libraries](guide/using-libraries).
-->
애플리케이션마다 일반적으로 발생하는 문제들이 있습니다.
사용자가 무언가 할 수 있는 화면을 구성하거나, 데이터를 표시하고, 데이터를 입력받는 기능은 어느 어플리케이션에나 필요합니다.
다른 애플리케이션에도 해결해야 하는 문제라면 해결방법을 따로 만들어 두고 다시 활용하는 것이 더 효율적입니다.
이런 경우에 이 해결방법을 Angular *라이브러리*로 만들어서 *npm 패키지*로 배포할 수 있습니다.

Angular 라이브러리도 Angular [프로젝트](guide/glossary#project)지만 단독으로 실행할 수 없다는 점이 Angular 애플리케이션 프로젝트와 다릅니다.
라이브러리는 다른 앱에 로드되는 형태로 사용합니다.

라이브러리는 Angular의 기본 기능을 확장하는 것입니다.
`ng add @angular/forms` 명령을 실행하거나 `@angular/forms` 패키지로 제공하는 `ReactiveFormsModule`을 앱에 추가해서 앱에 [반응형 폼](guide/reactive-forms) 기능을 추가하는 것도 이러한 맥락이며, 앱을 [프로그레시브 웹 앱, PWA](https://developers.google.com/web/progressive-web-apps/)로 전환하기 위해 [서비스 워커](guide/service-worker-intro) 라이브러리를 적용하는 것도 같은 맥락입니다.
복잡한 UI 컴포넌트를 재사용하기 편하게 만든 [Angular Material](https://material.angular.io/)도 이런 용도로 만들어진 라이브러리라고 할 수 있습니다.

Angular 코어팀이나 서드 파티 누군가가 Angular 라이브러리를 자유롭게 만들고 배포하면, Angular 앱 개발자가 이 라이브러리를 가져다 사용할 수 있습니다. [배포된 라이브러리 활용하기](guide/using-libraries) 문서를 참고하세요.


<!--
## Creating libraries
-->
## 라이브러리 만들기

<!--
If you have developed functionality that is suitable for reuse, you can create your own libraries.
These libraries can be used locally in your workspace, or you can publish them as [npm packages](guide/npm-packages) to share with other projects or other Angular developers.
These packages can be published to the npm registry, a private npm Enterprise registry, or a private package management system that supports npm packages.
See [Creating Libraries](guide/creating-libraries).

Whether you decide to package functionality as a library is an architectural decision, similar to deciding whether a piece of functionality is a component or a service, or deciding on the scope of a component.

Packaging functionality as a library forces the artifacts in the library to be decoupled from the application's business logic.
This can help to avoid various bad practices or architecture mistakes that can make it difficult to decouple and reuse code in the future.

Putting code into a separate library is more complex than simply putting everything in one app.
It requires more of an investment in time and thought for managing, maintaining, and updating the library.
This complexity can pay off, however, when the library is being used in multiple apps.
-->
재사용할만한 기능이 있다면 누구나 라이브러리를 만들수 있습니다.
이렇게 만든 라이브러리는 로컬 환경에 있는 여러 프로젝트에 적용하는 것도 물론 가능하지만 [npm 패키지](guide/npm-packages)로 배포해서 다른 Angular 개발자에게 도움을 줄 수도 있습니다.
npm 일반 저장소 뿐만 아니라 프라이빗 npm 기업용 저장소나 npm 패키지를 지원하는 다른 관리 시스템을 사용할 수도 있습니다.
자세한 내용은 [라이브러리 만들기](guide/creating-libraries). 문서를 참고하세요.

어떤 기능을 라이브러리로 만들겠다고 결정했으면 라이브러리를 어떤 요소로 만들지 결정해야 합니다.
제공하려는 기능은 컴포넌트 단위일 수 있고 서비스 단위일수도 있으며, 컴포넌트의 일부 영역만 담당할 수도 있습니다.

라이브러리 기능을 구현할 때는 비즈니스 로직과 섞이지 않도록 주의해야 합니다.
특정 문제를 해결하는 기능이 비즈니스 로직과 섞이면 재사용하기 힘들며 Angular 애플리케이션 구조 설계에도 악영향을 미칠 수 있습니다.

앱 하나에 모든 기능을 구현하는 것보다는 특정 기능만 담당하는 라이브러리를 만드는 것이 더 복잡합니다.
관리하는 측면에서도 유지보수하면서 업데이트하는 시간이 일반 앱보다 더 많이 필요합니다.
하지만 이 라이브러리가 여러 앱에 사용된다면, 개발에 들어가는 총 비용은 확실히 줄어들 것입니다.


<div class="alert is-helpful">

<!--
Note that libraries are intended to be used by Angular apps.
To add Angular functionality to non-Angular web apps, you can use [Angular custom elements](guide/elements).
-->
Angular 라이브러리는 Angular 앱이 로드해서 사용하는 것이 기본입니다.
Angular가 아닌 웹 앱에서 Angular의 기능을 활용하려면 [Angular 커스텀 엘리먼트](guide/elements) 문서를 참고하세요.

</div>
