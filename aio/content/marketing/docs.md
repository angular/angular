<!--
<h1 class="no-toc">What is Angular?</h1>
-->
<h1 class="no-toc">Angular란?</h1>

<!--
Angular is a platform that makes it easy to build applications with the web. Angular combines declarative templates, dependency injection, end to end tooling, and integrated best practices to solve development challenges. Angular empowers developers to build applications that live on the web, mobile, or the desktop
-->
Angular는 좀 더 쉽게 웹 애플리케이션을 만들 수 있게 도와주는 플랫폼입니다.
웹 애플리케이션을 개발하다보면 여러 장애물을 만나게 되는데, 이 문제들은 Angular에서 제공하는 선언형 템플릿, 의존성 주입, 엔드-투-엔드 도구 등을 사용해서 쉽게 해결할 수 있습니다.
Angular와 함께라면 웹 애플리케이션을 개발하면서 모바일 웹과 데스크탑 애플리케이션도 함께 개발할 수 있습니다.

<div class="card-container">
  <a href="generated/live-examples/toh-pt1/stackblitz.html" target="_blank" class="docs-card"
    title="Experience Angular in a live coding environment">
      <!--
      <section>Get a Glimpse of Angular</section>
      <p>A quick look at an Angular "hello world" application.</p>
      <p class="card-footer">Angular in Action</p>
      -->
      <section>Angular 온라인 예제</section>
      <p>Angular로 작성한 "hello world" 애플리케이션이 어떻게 구성되는지 바로 확인해보세요.</p>
      <p class="card-footer">온라인 예제 확인하기</p>
  </a>

  <a href="guide/quickstart" class="docs-card" title="Angular Quickstart">
      <!--
      <section>Get Going with Angular</section>
      <p>Get going on your own environment with the Quickstart.</p>
      <p class="card-footer">Quickstart</p>
      -->
      <section>Angular 시작하기</section>
      <p>로컬 환경에서 Angular를 시작해보세요.</p>
      <p class="card-footer">시작하기</p>
  </a>

  <a href="guide/architecture" class="docs-card" title="Angular Architecture">
      <!--
      <section>Fundamentals</section>
      <p>Learn Angular application fundamentals, starting with an architecture overview.</p>
      <p class="card-footer">Architecture</p>
      -->
      <section>기초</section>
      <p>Angular 프레임워크가 제공하는 기능을 알아보세요. Angular 애플리케이션의 아키텍처부터 시작합니다.</p>
      <p class="card-footer">아키텍처</p>
  </a>
</div>

<!--
## Assumptions
-->
## 사전 지식
<!--
This documentation assumes that you are already familiar with
[JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript "Learn JavaScript"),
and some of the tools from the
[latest standards](https://babeljs.io/learn-es2015/ "Latest JavaScript standards") such as
[classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes "ES2015 Classes")
and [modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import "ES2015 Modules").
-->
이 문서는 [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript/A_re-introduction_to_JavaScript "JavaScript 소개")의 기본 지식이나 관련 툴, 그리고 [클래스](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes "ES2015 클래스")나 [모듈](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import "ES2015 모듈")과 같은 [JavaScript의 최신 기술](https://babeljs.io/learn-es2015/ "최신 JavaScript 기술")에 익숙한 개발자를 대상으로 합니다.
<!--
The code samples are written using [TypeScript](https://www.typescriptlang.org/ "TypeScript").
Most Angular code can be written with just the latest JavaScript,
using [types](https://www.typescriptlang.org/docs/handbook/classes.html "TypeScript Types") for dependency injection,
and using [decorators](https://www.typescriptlang.org/docs/handbook/decorators.html "Decorators") for metadata.
-->
그리고 이 문서에서 제공하는 예제 코드는 [TypeScript](https://www.typescriptlang.org/ "TypeScript")로 작성되었습니다.
TypeScript를 사용하면 최신 JavaScript에서 제공하는 문법은 물론이고, [타입](https://www.typescriptlang.org/docs/handbook/classes.html "TypeScript Types")을 지정해서 애플리케이션 로직의 안정성을 높일 수 있고, 메타데이터와 함께 [데코레이터](https://www.typescriptlang.org/docs/handbook/decorators.html "Decorators")를 사용해서 애플리케이션을 효율적으로 확장할 수 있습니다.

<!--
## Feedback
-->
## 피드백

<!--
You can sit with us!
-->
우리는 여러분과 멀리 있지 않습니다!

<!--
You can file documentation
[issues](https://github.com/angular/angular/issues "Angular Github issues") and create
[pull requests](https://github.com/angular/angular/pulls "Angular Github pull requests")
on the Angular Github repository.
-->
문제가 있다면 Angular Github에 있는 [이슈](https://github.com/angular/angular/issues "Angular Github 이슈")에 등록해 주세요. 그리고 [풀 리퀘스트](https://github.com/angular/angular/pulls "Angular Github 풀 리퀘스트")도 언제나 환영합니다.
<!--
The [contributing guide](https://github.com/angular/angular/blob/master/CONTRIBUTING.md "Contributing guide")
will help you contribute to the community.
Our community values  respectful, supportive communication.
Please consult and adhere to the
[code of conduct](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md "contributor code of conduct").
-->
Angular 커뮤니티에 기여하고 싶다면 [컨트리뷰트 가이드](https://github.com/angular/angular/blob/master/CONTRIBUTING.md "컨트리뷰트 가이드")를 참고하세요.
Angular 커뮤니티는 활발하게 운영되고 있으며, 문제가 생겼을 때 커뮤니티에서 지원을 받을 수도 있습니다.
[커뮤니티 활동 가이드](https://github.com/angular/code-of-conduct/blob/master/CODE_OF_CONDUCT.md "커뮤니티 활동 가이드")를 준수하며 Angular 커뮤니티에 참여해보세요.