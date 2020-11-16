<!--
# Upgrading from AngularJS to Angular
-->
# AngularJS 앱을 Angular 앱으로 업그레이드하기

<!--
_Angular_ is the name for the Angular of today and tomorrow.<br />
_AngularJS_ is the name for all 1.x versions of Angular.

AngularJS apps are great.
Always consider the business case before moving to Angular.
An important part of that case is the time and effort to get there.
This guide describes the built-in tools for efficiently migrating AngularJS projects over to the
Angular platform, a piece at a time.

Some applications will be easier to upgrade than others, and there are
many ways to make it easier for yourself. It is possible to
prepare and align AngularJS applications with Angular even before beginning
the upgrade process. These preparation steps are all about making the code
more decoupled, more maintainable, and better aligned with modern development
tools. That means in addition to making the upgrade easier,
you will also improve the existing AngularJS applications.

One of the keys to a successful upgrade is to do it incrementally,
by running the two frameworks side by side in the same application, and
porting AngularJS components to Angular one by one. This makes it possible
to upgrade even large and complex applications without disrupting other
business, because the work can be done collaboratively and spread over
a period of time. The `upgrade` module in Angular has been designed to
make incremental upgrading seamless.
-->
_Angular_ 는 지금부터 Angular를 부를때 사용하는 이름입니다.<br/>
그리고 _AngularJS_ 는 1.x 버전대의 Angular를 부를때 사용하는 이름입니다.

AngularJS 앱도 훌륭합니다.
AngularJS 앱을 Angular로 꼭 전환하는 것이 좋을지 충분히 검토해 보세요.
전환하는 데에 들어가는 시간과 노력을 생각해 보는 것이 가장 중요합니다.
이 문서에서는 Angular가 제공하는 툴을 사용해서 AngularJS 프로젝트를 Angular 프로젝트를 단계적으로 적용하는 방법에 대해 설명합니다.

AngularJS 애플리케이션이 그 자체로 간결하고 최신 개발 툴을 적용하면서 유지보수하기 편하게 관리되고 있었다면 아닌 경우와 비교했을 때 Angular로 전환하는 작업이 더 수월합니다.
따라서 AngularJS 앱을 Angular로 전환하기 전에 AngularJS 앱 자체를 잘 관리하는 것도 중요합니다.

업그레이드를 할 때 가장 권장하는 방법은 한 애플리케이션에 AngularJS와 Angular를 모두 띄워두고 AngualrJS 컴포넌트를 Angular 컴포넌트로 하나씩 바꿔가면서 점진적으로 전환하는 것입니다.
이렇게하면 아무리 크고 복잡한 애플리케이션이라도 시간만 충분히 들이면 비즈니스 로직이 틀어지는 일 없이 애플리케이션을 재구성할 수 있습니다.
이렇게 점진적으로 업그레이드하는 작업을 위해 Angular는 `upgrade` 모듈을 제공합니다.


{@a preparation}
<!--
## Preparation
-->
## 사전준비

<!--
There are many ways to structure AngularJS applications. When you begin
to upgrade these applications to Angular, some will turn out to be
much more easy to work with than others. There are a few key techniques
and patterns that you can apply to future proof apps even before you
begin the migration.
-->
AngularJS 애플리케이션을 구성하는 방식은 다양하지만 이 중에서 Angular로 전환하기 쉬운 구조도 있습니다.
이 섹션에서는 앱을 마이그레이션하기 전에 알아두면 좋을 테크닉을 소개합니다.


{@a follow-the-angular-styleguide}
<!--
### Follow the AngularJS Style Guide
-->
### AngularJS 스타일 가이드를 따르세요.

<!--
The [AngularJS Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)
collects patterns and practices that have been proven to result in
cleaner and more maintainable AngularJS applications. It contains a wealth
of information about how to write and organize AngularJS code - and equally
importantly - how **not** to write and organize AngularJS code.

Angular is a reimagined version of the best parts of AngularJS. In that
sense, its goals are the same as the AngularJS Style Guide's: To preserve
the good parts of AngularJS, and to avoid the bad parts. There's a lot
more to Angular than just that of course, but this does mean that
*following the style guide helps make your AngularJS app more closely
aligned with Angular*.

There are a few rules in particular that will make it much easier to do
*an incremental upgrade* using the Angular `upgrade/static` module:

* The [Rule of 1](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility)
  states that there should be one component per file. This not only makes
  components easy to navigate and find, but will also allow us to migrate
  them between languages and frameworks one at a time. In this example application,
  each controller, component, service, and filter is in its own source file.

* The [Folders-by-Feature Structure](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#folders-by-feature-structure)
  and [Modularity](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#modularity)
  rules define similar principles on a higher level of abstraction: Different parts of the
  application should reside in different directories and NgModules.

When an application is laid out feature per feature in this way, it can also be
migrated one feature at a time. For applications that don't already look like
this, applying the rules in the AngularJS style guide is a highly recommended
preparation step. And this is not just for the sake of the upgrade - it is just
solid advice in general!
-->
[AngularJS 스타일 가이드](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md) 문서는 AngularJS 애플리케이션을 깔끔하고 유지보수하기 쉽게 구현하기 위해 사용되는 패턴과 예제들을 다루고 있습니다.
AngularJS 코드를 어떻게 작성하고 관리해야 하는지, 어떤 방식으로는 작성하면 **안되는지** 에 대해 방대하게 안내하는 문서입니다.

Angular는 이 중에서도 가장 효율적인 내용을 모아서 새롭게 설계되었습니다.
그래서 AngularJS 스타일 가이드에서 안내한 대로 최대한 좋은 방식으로 구현하면서 안좋은 방식은 최소화하는 방향도 그대로입니다.
물론 Angular는 여기에서 더 많은 것을 제공하지만 결국 *Angular 스타일 가이드를 충실하게 따르는 것이 Angular 앱을 구현하는 방향과 같다는 것은 마찬가지 입니다.*

Angular가 제공하는 `upgrade/static` 모듈을 사용해서 점진적으로 업그레이드할 때는 명심해야 할 내용이 몇가지 있습니다:

* [하나만 구현하는 규칙](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility)은 파일 하나에 한 컴포넌트만 구현하는 것이 좋다는 것을 설명하고 있습니다.
그리고 이렇게 구현하면 컴포넌트를 찾기 쉽다는 장점 외에도 AngularJS에서 Angular로 점진적으로 업그레이드하는 데에 도움이 됩니다.
이 문서에서 설명하는 예제 애플리케이션은 컨트롤러, 컴포넌트, 서비스, 필터는 모두 한 파일에 하나씩 정의되어 있습니다.

* [폴더를 기능별로 구분하는 구조](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#folders-by-feature-structure)와 [모듈화(Modularity)](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#modularity)는 이 규칙을 좀 더 확장한 것으로 볼 수 있습니다.
애플리케이션에서 서로 연관되지 않은 기능은 서로 다른 폴더나 NgModule로 구분되는 것이 좋습니다.

애플리케이션이 기능별로 구성되어 있다면 앱을 마이그레이션할 때도 기능단위로 작업할 수 있습니다.
지금은 이렇게 구현되어 있지 않다고 해도 AngularJS 스타일 가이드는 최대한 따르는 것을 권장하며, 애플리케이션을 Angular 버전으로 업그레이드하는 것 뿐만 아니라 좋은 애플리케이션을 만드는 관점에서도 강력하게 권장합니다!


<!--
### Using a Module Loader
-->
### 모듈 로더 사용하기

<!--
When you break application code down into one component per file, you often end
up with a project structure with a large number of relatively small files. This is
a much neater way to organize things than a small number of large files, but it
doesn't work that well if you have to load all those files to the HTML page with
&lt;script&gt; tags. Especially when you also have to maintain those tags in the correct
order. That's why it's a good idea to start using a *module loader*.

Using a module loader such as [SystemJS](https://github.com/systemjs/systemjs),
[Webpack](http://webpack.github.io/), or [Browserify](http://browserify.org/)
allows us to use the built-in module systems of TypeScript or ES2015.
You can use the `import` and `export` features that explicitly specify what code can
and will be shared between different parts of the application. For ES5 applications
you can use CommonJS style `require` and `module.exports` features. In both cases,
the module loader will then take care of loading all the code the application needs
in the correct order.

When moving applications into production, module loaders also make it easier
to package them all up into production bundles with batteries included.
-->
파일 하나에 컴포넌트를 하나씩만 구현한다는 것은 애플리케이션을 세분화한다는 것을 의미하며, 결국 프로젝트는 작은 파일들이 많이 존재하는 구조가 됩니다.
하지만 반대로 큰 파일 몇개로만 이루어진 애플리케이션은 이 파일들을 모두 내려받아 HTML 페이지의 `<script>` 태그에 로드되기 전까지는 동작하지 않아서 문제가 됩니다.
게다가 이 파일들은 `<script>`에 올바른 순서로 로드되어야 합니다.
이 방식보다는 *모듈 로더*를 사용하는 것이 더 좋습니다.

[SystemJS](https://github.com/systemjs/systemjs)나 [Webpack](http://webpack.github.io/), [Browserify](http://browserify.org/)와 같은 모듈 로더를 사용하면 TypeScript나 ES2015로 작성한 코드도 내장 모듈 시스템에 로드할 수 있습니다.
그리고 `import`, `export` 키워드를 사용하면 애플리케이션의 다른 모듈에 있는 코드를 가져다 활용할 수도 있습니다.
애플리케이션 코드가 ES5로 작성되었다면 CommonJS 스타일로 `require`와 `module.exports`를 사용하면 됩니다.
두 방식 모두 모듈을 로드할 때 자동으로 순서를 맞춰서 에러 없이 로드할 수 있습니다.

모듈 로더는 애플리케이션을 운영용으로 빌드할 때도 활용됩니다.
모듈 로더를 사용하면 운영용 빌드 파일과 라이브러리를 패키지 하나로 간단하게 빌드할 수 있습니다.


<!--
### Migrating to TypeScript
-->
### TypeScript 도입하기

<!--
If part of the Angular upgrade plan is to also take TypeScript into use, it makes
sense to bring in the TypeScript compiler even before the upgrade itself begins.
This means there's one less thing to learn and think about during the actual upgrade.
It also means you can start using TypeScript features in your AngularJS code.

Since TypeScript is a superset of ECMAScript 2015, which in turn is a superset
of ECMAScript 5, "switching" to TypeScript doesn't necessarily require anything
more than installing the TypeScript compiler and renaming files from
`*.js` to `*.ts`. But just doing that is not hugely useful or exciting, of course.
Additional steps like the following can give us much more bang for the buck:

* For applications that use a module loader, TypeScript imports and exports
  (which are really ECMAScript 2015 imports and exports) can be used to organize
  code into modules.

* Type annotations can be gradually added to existing functions and variables
  to pin down their types and get benefits like build-time error checking,
  great autocompletion support and inline documentation.

* JavaScript features new to ES2015, like arrow functions, `let`s and `const`s,
  default function parameters, and destructuring assignments can also be gradually
  added to make the code more expressive.

* Services and controllers can be turned into *classes*. That way they'll be a step
  closer to becoming Angular service and component classes, which will make
  life easier after the upgrade.
-->
Angular로 업그레이드하면서 TypeScript도 사용하기로 정했다면 Angular보다 TypeScript 컴파일러를 먼저 도입하는 것이 좋습니다.
그러면 이후에 Angular로 업그레이드 했을 때는 물론이고 AngularJS 코드에도 TypeScript 기능을 활용할 수 있습니다.

TypeScript는 ECMAScript 201의 상위 집합(superset)이기 때문에 ECMAScript 5의 상위 집합이기도 합니다.
그래서 TypeScript 컴파일러를 설치하고 `*.js` 파일을 `*.ts` 파일로 바꾸면 그 자체로도 애플리케이션은 동작합니다.
물론 아직까지 TypeScript 스타일로 작성한 것처럼 효율적이진 않습니다.
TypeScript 컴파일러를 도입하고 나면 다음 과정을 진행하면 됩니다:

* TypeScript가 제공하는 `import`, `export`를 활용하면 코드를 모듈 단위로 구성할 수 있습니다. 이 기능은 ECMAScript 2015 스펙입니다.

* 타입 어노테이션을 활용하면 기존에 있던 함수나 변수에 타입을 추가할 수 있고 빌드 시점에 발생하는 에러를 찾아내는 데에도 도움이 됩니다.
코드 자동완성 기능도 이에 맞게 확장됩니다.

* ES2015에 추가된 화살표 함수나 `let`, `const`, 함수 인자 기본값 지정, 분해연산자를 활용하면 코드를 더 간결하게 작성할 수 있습니다.

* 서비스나 컨트롤러는 *클래스*로 변경할 수 있습니다.
클래스로 변경하고 나면 이후에 Angular 서비스나 컴포넌트 클래스로 변환하는 작업도 수월해집니다.


{@a using-component-directives}
<!--
### Using Component Directives
-->
### 컴포넌트 디렉티브 사용하기

<!--
In Angular, components are the main primitive from which user interfaces
are built. You define the different portions of the UI as components and
compose them into a full user experience.

You can also do this in AngularJS, using *component directives*. These are
directives that define their own templates, controllers, and input/output bindings -
the same things that Angular components define. Applications built with
component directives are much easier to migrate to Angular than applications
built with lower-level features like `ng-controller`,  `ng-include`, and scope
inheritance.

To be Angular compatible, an AngularJS component directive should configure
these attributes:

* `restrict: 'E'`. Components are usually used as elements.
* `scope: {}` - an isolate scope. In Angular, components are always isolated
  from their surroundings, and you should do this in AngularJS too.
* `bindToController: {}`. Component inputs and outputs should be bound
  to the controller instead of using the `$scope`.
* `controller` and `controllerAs`. Components have their own controllers.
* `template` or `templateUrl`. Components have their own templates.

Component directives may also use the following attributes:

* `transclude: true/{}`, if the component needs to transclude content from elsewhere.
* `require`, if the component needs to communicate with some parent component's
  controller.

Component directives **should not** use the following attributes:

* `compile`. This will not be supported in Angular.
* `replace: true`. Angular never replaces a component element with the
  component template. This attribute is also deprecated in AngularJS.
* `priority` and `terminal`. While AngularJS components may use these,
  they are not used in Angular and it is better not to write code
  that relies on them.

An AngularJS component directive that is fully aligned with the Angular
architecture may look something like this:
-->
Angular에서 사용자가 보는 화면을 구성하는 기본 단위는 컴포넌트입니다.
그래서 화면은 컴포넌트를 조합하는 방식으로 구성하며 이 컴포넌트가 모여 모든 UX를 완성합니다.

이 방식은 AngularJS에서 *컴포넌트 디렉티브*를 사용해서 구현할 수 있습니다.
템플릿을 구성하거나 컨트롤러 클래스를 구현하고 입출력 프로퍼티를 바인딩하는 방식도 Angular의 컴포넌트와 같습니다.
그래서 컴포넌트 디렉티브를 기반으로 작성된 AngularJS 애플리케이션은 Angular 애플리케이션으로 업그레이드하기 쉽습니다.

Angular로 업그레이드하는 것을 대비하기 위해 AngularJS에는 컴포넌트 디렉티브 어트리뷰트를 이렇게 구성합니다:

* `restrict: 'E'` - 컴포넌트는 일반적으로 엘리먼트입니다.
* `scope: {}` - 독립된 스코프를 구성합니다. Angular에서 컴포넌트는 그 자체로 독립적인 스코프를 구성하기 때문에 AngularJS에서도 이렇게 지정하는 것이 좋습니다.
* `bindToController: {}` - 컴포넌트의 입출력 프로퍼티는 `$scope`가 아니라 컨트롤러에 직접 바인딩하는 것이 좋습니다.
* `controller`, `controllerAs` - 컴포넌트 컨트롤러 클래스를 구성합니다.
* `template`, `templateUrl` - 컴포넌트 템플릿을 구성합니다.

그리고 컴포넌트 디렉티브에는 이런 어트리뷰트를 활용할 수도 있습니다:

* `transclude: true/{}` - 컴포넌트에 들어갈 내용물이 다른 컴포넌트에서 올 때 사용합니다.
* `require` - 부모 컴포넌트의 컨트롤러를 활용할 때 사용합니다.

그리고 컴포넌트 디렉티브에는 이런 어트리뷰트가 들어가면 **안됩니다**:

* `compile` - Angular에서 지원하지 않습니다.
* `replace: true` - Angular에서는 템플릿에 사용된 컴포넌트의 호스트 엘리먼트가 사라지지 않습니다.
이 어트리뷰트는 AngularJS에서도 지원이 중단되었습니다.
* `priority`, `teminal` - Angular에서 지원하지 않습니다. 이 어트리뷰트를 사용하는 코드는 작성하지 않는 것이 좋습니다.

이 내용대로 AngularJS 컴포넌트를 구현하면 이런 모습이 됩니다:

<code-example path="upgrade-module/src/app/hero-detail.directive.ts" header="hero-detail.directive.ts">
</code-example>

<!--
AngularJS 1.5 introduces the [component API](https://docs.angularjs.org/api/ng/type/angular.Module#component)
that makes it easier to define component directives like these. It is a good idea to use
this API for component directives for several reasons:

* It requires less boilerplate code.
* It enforces the use of component best practices like `controllerAs`.
* It has good default values for directive attributes like `scope` and `restrict`.

The component directive example from above looks like this when expressed
using the component API:
-->
[컴포넌트 API](https://docs.angularjs.org/api/ng/type/angular.Module#component)는 AngularJS 1.5 버전부터 지원합니다.
이 API는 AngularJS 컴포넌트를 Angular 스타일로 구현하기 위해 도입되었으며 이런 장점이 있습니다:

* 기본 코드가 더 단순합니다.
* AngularJS 컴포넌트를 Angular 스타일로 작성하도록 강제합니다.
* `scope`나 `restrict`를 활용해서 디렉티브 어트리뷰트의 기본값을 지정할 수 있습니다.

위에서 살펴본 AngularJS 컴포넌트 코드에 컴포넌트 API를 적용하면 이렇게 작성할 수 있습니다:

<code-example path="upgrade-module/src/app/upgrade-io/hero-detail.component.ts" region="hero-detail-io" header="hero-detail.component.ts">
</code-example>

<!--
Controller lifecycle hook methods `$onInit()`, `$onDestroy()`, and `$onChanges()`
are another convenient feature that AngularJS 1.5 introduces. They all have nearly
exact [equivalents in Angular](guide/lifecycle-hooks), so organizing component lifecycle
logic around them will ease the eventual Angular upgrade process.
-->
AngularJS 1.5 버전에는 컴포넌트 라이프싸이클 후킹 함수 `$onInit()`, `$onDestroy()`, `$onChanges()`도 도입되었습니다.
이 메소드들은 [Angular에도 정확히 동일한 역할을 하는 함수](guide/lifecycle-hooks)가 존재합니다.
그래서 AngularJS에서 활용하는 컴포넌트 라이프싸이클 관련 로직은 Angular에도 그대로 활용할 수 있습니다.


{@a upgrading-with-ngupgrade}
<!--
## Upgrading with ngUpgrade
-->
## ngUpgrade로 업그레이드하기

<!--
The ngUpgrade library in Angular is a very useful tool for upgrading
anything but the smallest of applications. With it you can mix and match
AngularJS and Angular components in the same application and have them interoperate
seamlessly. That means you don't have to do the upgrade work all at once,
since there's a natural coexistence between the two frameworks during the
transition period.
-->
애플리케이션의 규모가 그렇게 크지 않다면 Angular가 제공하는 ngUpgrade 라이브러리만 사용해도 업그레이드하는 데에는 문제가 없습니다.
애플리케이션에 AngularJS 컴포넌트와 Angular 컴포넌트를 함께 사용하면서 상호작용하는 것도 물론 가능합니다.
업그레이드는 한번에 끝내는 것이 아니라 시간을 충분히 들여 전환하는 것이 좋습니다.


{@a how-ngupgrade-works}
<!--
### How ngUpgrade Works
-->
### ngUpgrade가 동작하는 방식

<!--
One of the primary tools provided by ngUpgrade is called the `UpgradeModule`.
This is a module that contains utilities for bootstrapping and managing hybrid
applications that support both Angular and AngularJS code.

When you use ngUpgrade, what you're really doing is *running both AngularJS and
Angular at the same time*. All Angular code is running in the Angular
framework, and AngularJS code in the AngularJS framework. Both of these are the
actual, fully featured versions of the frameworks. There is no emulation going on,
so you can expect to have all the features and natural behavior of both frameworks.

What happens on top of this is that components and services managed by one
framework can interoperate with those from the other framework. This happens
in three main areas: Dependency injection, the DOM, and change detection.
-->
ngUpgrade의 중심이 되는 툴은 `UpgradeModule`입니다.
이 모듈은 Angular와 AngularJS 코드가 동시에 존재하는 애플리케이션을 부트스트랩하고 관리하는 도구를 제공합니다.

ngUpgrade를 사용할 때 개발자가 해야하는 것은 *AngularJS와 Angular를 동시에 실행하는 것*뿐입니다.
이 때 Angular 코드는 Angular 프레임워크 환경에서 동작하고 AngularJS 코드는 AngularJS 프레임워크 환경에서 동작합니다.
두 프레임워크는 동시에 존재할 수 있으며 각 프레임워크의 기능도 모두 활용할 수 있습니다.
프레임워크를 중개하기 위한 에뮬레이터 기능은 필요없습니다.

각 프레임워크에 속한 컴포넌트와 서비스는 다른 프레임워크에 속한 것들과 상호작용할 수 있습니다.
의존성 주입, DOM 관리, 변화 감지 측면에서 그렇습니다.


<!--
#### Dependency Injection
-->
#### 의존성 주입

<!--
Dependency injection is front and center in both AngularJS and
Angular, but there are some key differences between the two
frameworks in how it actually works.
-->
의존성 주입은 AngularJS와 Angular에 모두 중요한 기능이지만, 두 프레임워크에서 동작하는 방식은 조금 다릅니다.

<table>
  <tr>
    <th>
      AngularJS
    </th>
    <th>
      Angular
    </th>
  </tr>
  <tr>
    <td>
      <!--
      Dependency injection tokens are always strings
      -->
      의존성 객체 토큰은 언제나 문자열입니다.
    </td>
    <td>

      <!--
      Tokens [can have different types](guide/dependency-injection).
      They are often classes. They may also be strings.
      -->
      의존성 객체 토큰은 일반적으로 클래스를 사용하지만 문자열을 사용할 수도 있습니다.
      [이 문서](guide/dependency-injection)를 참고하세요.

    </td>
  </tr>
  <tr>
    <td>

      <!--
      There is exactly one injector. Even in multi-module applications,
      everything is poured into one big namespace.
      -->
      인젝터는 하나만 존재합니다. 애플리케이션에 모듈이 여러개 존재하더라도 의존성 토큰은 모두 한 네임스페이스에 존재합니다.

    </td>
    <td>

      <!--
      There is a [tree hierarchy of injectors](guide/hierarchical-dependency-injection),
      with a root injector and an additional injector for each component.
      -->
      인젝터는 [트리 계층](guide/hierarchical-dependency-injection)으로 구성됩니다.
      최상위 인젝터를 시작으로 각 컴포넌트마다 인젝터가 구성될 수 있습니다.

    </td>
  </tr>
</table>

<!--
Even accounting for these differences you can still have dependency injection
interoperability. `upgrade/static` resolves the differences and makes
everything work seamlessly:

* You can make AngularJS services available for injection to Angular code
  by *upgrading* them. The same singleton instance of each service is shared
  between the frameworks. In Angular these services will always be in the
  *root injector* and available to all components.

* You can also make Angular services available for injection to AngularJS code
  by *downgrading* them. Only services from the Angular root injector can
  be downgraded. Again, the same singleton instances are shared between the frameworks.
  When you register a downgraded service, you must explicitly specify a *string token* that you want to
  use in AngularJS.
-->
두 프레임워크에서 동작하는 의존성 주입 객체는 이렇게 다르지만 두 체계가 상호작용할 수 있다는 것은 여전히 유효합니다.
두 프레임워크의 차이는 `upgrad/estatic`이 다음과 같이 처리합니다:

* AngularJS 서비스를 *업그레이드해서* Angular에 의존성으로 주입할 수 있게 만들어 줍니다.
그러면 프레임워크와 무관하게 서비스의 인스턴스는 싱글턴으로 존재합니다.
Angular의 관점에서 보면 이렇게 변환된 서비스는 *루트 인젝터*에 존재하기 때문에 모든 컴포넌트에 사용할 수 있습니다.

* Angular 서비스를 *다운그레이드해서* AngularJS에 의존성으로 주입할 수 있게 만들어 줍니다.
이 때 Angular의 루트 인젝터에 존재하는 서비스만 다운그레이드할 수 있으며, 이 경우에도 서비스 인스턴스는 프레임워크와 관계없이 싱글턴으로 존재합니다.
다운그레이드한 Angular 서비스는 AngularJS 의존성 주입 체계에 맞게 *문자열 토큰*으로 로 주입합니다.


<div class="lightbox">
  <img src="generated/images/guide/upgrade/injectors.png" alt="The two injectors in a hybrid application">
</div>

<!--
#### Components and the DOM
-->
#### 컴포넌트와 DOM

<!--
In the DOM of a hybrid ngUpgrade application are components and
directives from both AngularJS and Angular. These components
communicate with each other by using the input and output bindings
of their respective frameworks, which ngUpgrade bridges together. They may also
communicate through shared injected dependencies, as described above.

The key thing to understand about a hybrid application is that every element in the DOM is owned by exactly one of the two frameworks.
The other framework ignores it. If an element is
owned by AngularJS, Angular treats it as if it didn't exist,
and vice versa.

So normally a hybrid application begins life as an AngularJS application,
and it is AngularJS that processes the root template, e.g. the index.html.
Angular then steps into the picture when an Angular component is used somewhere
in an AngularJS template. That component's template will then be managed
by Angular, and it may contain any number of Angular components and
directives.

Beyond that, you may interleave the two frameworks.
You always cross the boundary between the two frameworks by one of two
ways:

1. By using a component from the other framework: An AngularJS template
   using an Angular component, or an Angular template using an
   AngularJS component.

2. By transcluding or projecting content from the other framework. ngUpgrade
    bridges the related concepts of AngularJS transclusion and Angular content
    projection together.

<div class="lightbox">
  <img src="generated/images/guide/upgrade/dom.png" alt="DOM element ownership in a hybrid application">
</div>

Whenever you use a component that belongs to the other framework, a
switch between framework boundaries occurs. However, that switch only
happens to the elements in the template of that component. Consider a situation
where you use an Angular component from AngularJS like this:

<code-example language="html" escape="html">
  &lt;a-component&gt;&lt;/a-component&gt;
</code-example>

The DOM element `<a-component>` will remain to be an AngularJS managed
element, because it's defined in an AngularJS template. That also
means you can apply additional AngularJS directives to it, but *not*
Angular directives. It is only in the template of the `<a-component>`
where Angular steps in. This same rule also applies when you
use AngularJS component directives from Angular.
-->
ngUpgrade가 적용된 하이브리으 애플리케이션에는 AngularJS 스타일과 Angular 스타일의 컴포넌트/디렉티브가 존재합니다.
이 컴포넌트는 입출력 프로퍼티로 상호작용할 수 있으며 각 프레임워크가 제대로 동작하도록 ngUpgrade가 중개합니다.
위에서 설명한 것처럼 컴포넌트는 의존성으로 주입받은 서비스도 활용할 수 있습니다.

하이브리드 애플리케이션에서 중요한 것은 DOM에 존재하는 컴포넌트는 반드시 두 프레임워크 중 하나에만 속한다는 것입니다.
속하지 않은 프레임워크는 영향을 주지 않습니다.
AngularJS 위에서 동작하는 컴포넌트는 Angular의 영향을 받지 않으며, 반대 경우도 마찬가지입니다.

일반적으로 하이브리드 애플리케이션은 AngularJS 애플리케이션이 기본틀을 구성하기 때문에 `index.html` 파일에서 루트 컴포넌트가 되는 것은 AngularJS 컴포넌트일 것입니다.
그리고 Angular 컴포넌트는 AngularJS 템플릿에 추가되는 방식으로 동작합니다.
Angular 컴포넌트의 템플릿은 Angular가 관리하며 템플릿 안에서는 Angular 컴포넌트나 디렉티브를 자유롭게 사용할 수 있습니다.

두 프레임워크는 서로 호환되기 때문에 이런 방식으로 사용할 수 있습니다.

1. 다릍 프레임워크에 있는 컴포넌트를 사용할 수 있습니다:
AngularJS 템플릿에 Angular 컴포넌트를 사용할 수 있으며, Angular 템플릿에 AngularJS 컴포넌트를 사용할 수도 있습니다.

2. 다른 프레임워크의 컴포넌트에 HTML 조각을 프로젝션할 수 있습니다.
ngUpgrade는 AngularJS 트랜스클루전(transclusion)과 Angular 프로젝션(projection)을 중개합니다.

<div class="lightbox">
  <img src="generated/images/guide/upgrade/dom.png" alt="DOM element ownership in a hybrid application">
</div>

컴포넌트를 다른 프레임워크 영역에 사용하면 프레임워크의 경계를 넘어서는 동작이 발생합니다.
그런데 이 작업은 컴포넌트의 템플릿에서만 발생합니다.
AngularJS 템플릿에 Angular 컴포넌트를 사용하는 경우를 생각해 봅시다:

<code-example language="html" escape="html">
  &lt;a-component&gt;&lt;/a-component&gt;
</code-example>

DOM 엘리먼트 `<a-component>`는 AngularJS 템플릿에 사용되었기 때문에 AngularJS가 관리하는 엘리먼트입니다.
따라서 이 엘리먼트에는 AngularJS 디렉티브를 자유롭게 사용할 수 있지만 Angular 디렉티브는 *사용할 수 없습니다*.
Angular가 동작하는 영역은 `<a-component>` 템플릿 내부입니다.
이 동작 방식은 Angular 템플릿에 사용하느느 AngularJS 컴포넌트 디렉티브에서도 마찬가지입니다.


{@a change-detection}
<!--
#### Change Detection
-->
#### 변화 감지

<!--
The `scope.$apply()` is how AngularJS detects changes and updates data bindings.
After every event that occurs, `scope.$apply()` gets called. This is done either
automatically by the framework, or manually by you.

In Angular things are different. While change detection still
occurs after every event, no one needs to call `scope.$apply()` for
that to happen. This is because all Angular code runs inside something
called the [Angular zone](api/core/NgZone). Angular always
knows when the code finishes, so it also knows when it should kick off
change detection. The code itself doesn't have to call `scope.$apply()`
or anything like it.

In the case of hybrid applications, the `UpgradeModule` bridges the
AngularJS and Angular approaches. Here's what happens:

* Everything that happens in the application runs inside the Angular zone.
  This is true whether the event originated in AngularJS or Angular code.
  The zone triggers Angular change detection after every event.

* The `UpgradeModule` will invoke the AngularJS `$rootScope.$apply()` after
  every turn of the Angular zone. This also triggers AngularJS change
  detection after every event.
-->
AngularJS에서 변화 감지를 시작하고 바인딩된 데이터를 갱신하는 것은 `scope.$apply()`입니다.
그리고 이 메소드는 이벤트가 발생할 때마다 프레임워크가 자동으로 실행하며, 필요하면 개발자가 직접 실행할 수도 있습니다.

Angular에서는 조금 다릅니다.
이벤트가 발생할 때마다 변화 감지 로직이 시작되는 것은 동일하지만, 이 때 `scope.$apply()`는 실행되지 않습니다.
이 현상은 Angular 코드가 [Angular 존](api/core/NgZone) 안에서 실행되기 때문입니다.
Angular는 실행된 코드가 종료되는 것을 감지하고 있으며 필요할 때만 변화 감지 로직을 시작합니다.
코드 자체는 `scope.$apply()`를 실행하지 않습니다.

하이브리드 애플리케이션에서는 `UpgradeModule`이 AngularJS와 Angular를 이렇게 중개합니다:

* 애플리케이션에서 발생하는 모든 이벤트는 Angular 존 안에서 동작합니다.
이벤트가 AngularJS 코드에서 발생했더라도 그렇습니다.
그래서 이벤트를 처리하는 변화 감지 로직은 Angular 존에서 시작됩니다.

* Angular 존에서 작업이 종료된 이후에 `UpgradeModule`이 AngularJS `$rootScope.$apply()`를 실행합니다.
그래서 모든 이벤트가 발애한 후에는 AngularJS의 변화 감지 로직도 시작됩니다.

<div class="lightbox">
  <img src="generated/images/guide/upgrade/change_detection.png" alt="Change detection in a hybrid application">
</div>

<!--
In practice, you do not need to call `$apply()`,
regardless of whether it is in AngularJS or Angular. The
`UpgradeModule` does it for us. You *can* still call `$apply()` so there
is no need to remove such calls from existing code. Those calls just trigger
additional AngularJS change detection checks in a hybrid application.

When you downgrade an Angular component and then use it from AngularJS,
the component's inputs will be watched using AngularJS change detection.
When those inputs change, the corresponding properties in the component
are set. You can also hook into the changes by implementing the
[OnChanges](api/core/OnChanges) interface in the component,
just like you could if it hadn't been downgraded.

Correspondingly, when you upgrade an AngularJS component and use it from Angular,
all the bindings defined for the component directive's `scope` (or `bindToController`)
will be hooked into Angular change detection. They will be treated
as regular Angular inputs. Their values will be written to the upgraded component's
scope (or controller) when they change.
-->
실제로는 `UpgradeModule`이 `$apply()`를 자동으로 실행하기 때문에 AngularJS 코드나 Angular 코드에서 이 함수를 직접 실행할 필요가 없습니다.
그래서 기존에 있던 코드에 `$apply()`를 사용하던 코드는 모두 제거해도 됩니다.
이 코드를 제거해도 하이브리드 애플리케이션에 필요한 AngularJS 변화 감지 로직은 자동으로 실행됩니다.

Angular 컴포넌트를 AngularJS 용으로 다운그레이드해서 사용하면 AngularJS 변화 감지 로직이 컴포넌트의 입력 프로퍼티를 감시합니다.
그래서 입력값이 변경되면 컴포넌트의 프로퍼티 값도 변경됩니다.
그리고 이 변경시점은 [OnChanges](api/core/OnChanges)로 받아서 확장할 수 있습니다.

이와 비슷하게 AngularJS 컴포넌트를 업그레이드해서 Angular에 사용하면 Angular 변화 감지 로직이 컴포넌트 디렉티브의 `scope`나 `bindToController`에 바인딩된 항목들을 감시합니다.
그래서 이 항목들은 Angular의 입력 프로퍼티와 동일하게 처리됩니다.
입력값이 변경될 때 입력 프로퍼티의 값이 변경되는 것도 같은 방식으로 이루어집니다.


<!--
### Using UpgradeModule with Angular _NgModules_
-->
### Angular _NgModule_ 과 UpgradeModule 사용하기

<!--
Both AngularJS and Angular have their own concept of modules
to help organize an application into cohesive blocks of functionality.

Their details are quite different in architecture and implementation.
In AngularJS, you add Angular assets to the `angular.module` property.
In Angular, you create one or more classes adorned with an `NgModule` decorator
that describes Angular assets in metadata. The differences blossom from there.

In a hybrid application you run both versions of Angular at the same time.
That means that you need at least one module each from both AngularJS and Angular.
You will import `UpgradeModule` inside the NgModule, and then use it for
bootstrapping the AngularJS module.
-->
AngularJS와 Angular는 애플리케이션을 모듈 단위로 구성합니다.

그런데 두 프레임워크가 모듈을 구성하는 방식은 설계 구조나 구현 코드의 관점에서 볼 때 상당히 다릅니다.
AngularJS에서는 Angular 구성요소를 `angular.module` 프로퍼티에 등록하며, Angular에서는 클래스에 `NgModule` 데코레이터를 사용해서 등록합니다.
두 방식의 차이는 여기에서 시작됩니다.

하이브리드 앱에서는 두 버전의 Angular가 동시에 실행됩니다.
따라서 AngularJS와 Angular 양쪽에 각각 모듈 하나씩은 반드시 존재해야 합니다.
Angular의 NgModule 안에서 `UpgradeModule` 심볼을 사용하면 AngularJS 모듈을 부트스트랩할 수 있습니다.

<div class="alert is-helpful">

<!--
For more information, see [NgModules](guide/ngmodules).
-->
더 자세한 내용은 [NgModules](guide/ngmodules) 문서를 참고하세요.

</div>


{@a bootstrapping-hybrid-applications}
<!--
### Bootstrapping hybrid applications
-->
### 하이브리드 앱 부트스트랩하기

<!--
To bootstrap a hybrid application, you must bootstrap each of the Angular and
AngularJS parts of the application. You must bootstrap the Angular bits first and
then ask the `UpgradeModule` to bootstrap the AngularJS bits next.

In an AngularJS application you have a root AngularJS module, which will also
be used to bootstrap the AngularJS application.

<code-example path="upgrade-module/src/app/ajs-bootstrap/app.module.ts" region="ng1module" header="app.module.ts">
</code-example>

Pure AngularJS applications can be automatically bootstrapped by using an `ng-app`
directive somewhere on the HTML page. But for hybrid applications, you manually bootstrap via the
`UpgradeModule`. Therefore, it is a good preliminary step to switch AngularJS applications to use the
manual JavaScript [`angular.bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap)
method even before switching them to hybrid mode.

Say you have an `ng-app` driven bootstrap such as this one:

<code-example path="upgrade-module/src/index-ng-app.html">
</code-example>

You can remove the `ng-app` and `ng-strict-di` directives from the HTML
and instead switch to calling `angular.bootstrap` from JavaScript, which
will result in the same thing:

<code-example path="upgrade-module/src/app/ajs-bootstrap/app.module.ts" region="bootstrap" header="app.module.ts">
</code-example>

To begin converting your AngularJS application to a hybrid, you need to load the Angular framework.
You can see how this can be done with SystemJS by following the instructions in [Setup for Upgrading to AngularJS](guide/upgrade-setup) for selectively copying code from the [QuickStart github repository](https://github.com/angular/quickstart).

You also need to install the `@angular/upgrade` package via `npm install @angular/upgrade --save`
and add a mapping for the `@angular/upgrade/static` package:

<code-example path="upgrade-module/src/systemjs.config.1.js" region="upgrade-static-umd" header="systemjs.config.js (map)">
</code-example>

Next, create an `app.module.ts` file and add the following `NgModule` class:

<code-example path="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts" region="ngmodule" header="app.module.ts">
</code-example>

This bare minimum `NgModule` imports `BrowserModule`, the module every Angular browser-based app must have.
It also imports `UpgradeModule` from `@angular/upgrade/static`, which exports providers that will be used
for upgrading and downgrading services and components.

In the constructor of the `AppModule`, use dependency injection to get a hold of the `UpgradeModule` instance,
and use it to bootstrap the AngularJS app in the `AppModule.ngDoBootstrap` method.
The `upgrade.bootstrap` method takes the exact same arguments as [angular.bootstrap](https://docs.angularjs.org/api/ng/function/angular.bootstrap):

<div class="alert is-helpful">

Note that you do not add a `bootstrap` declaration to the `@NgModule` decorator, since
AngularJS will own the root template of the application.

</div>

Now you can bootstrap `AppModule` using the `platformBrowserDynamic.bootstrapModule` method.

<code-example path="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts" region="bootstrap" header="app.module.ts'">
</code-example>

Congratulations! You're running a hybrid application! The
existing AngularJS code works as before _and_ you're ready to start adding Angular code.
-->
하이브리드 애플리케이션을 부트스트랩하려면 Angular 부분과 AngularJS 부분을 따로 부트스트랩해야 합니다.
그리고 이 때 Angular 부분을 먼저 부트스트랩해야 하며 그 다음에 `UpgradeModule`을 사용해서 AngularJS를 부트스트랩해야 합니다.

하이브리드 애플리케이션의 AngularJS 부분은 원래 AngularJS 애플리케이션을 부트스트랩 하듯이 최상위 AngularJS 모듈을 대상으로 합니다.

<code-example path="upgrade-module/src/app/ajs-bootstrap/app.module.ts" region="ng1module" header="app.module.ts">
</code-example>

AngularJS 애플리케이션은 HTML 페이지에 있는 `ng-app` 디렉티브를 자동으로 찾아서 부트스트랩 하지만, 하이브리드 애플리케이션에서는 `UpgradeModule`로 대상을 직접 찾아서 부트스트랩해야 합니다.
그래서 AngularJS 애플리케이션을 하이브리드 모드로 실행하기 위해 JavaScript 메소드 [`angular.bootstrap`](https://docs.angularjs.org/api/ng/function/angular.bootstrap)를 사용합니다.

이런 애플리케이션 코드가 있다고 합시다:

<code-example path="upgrade-module/src/index-ng-app.html">
</code-example>

이 코드에서 `ng-app`과 `ng-strict-di` 디렉티브를 HTML 문서에서 제거하고 `angular.bootstrap` 메소드를 실행하는 방식으로 대체해도 이 애플리케이션은 이전처럼 동작합니다:

<code-example path="upgrade-module/src/app/ajs-bootstrap/app.module.ts" region="bootstrap" header="app.module.ts">
</code-example>

그리고 AngularJS 애플리케이션을 하이브리드 모드로 시작하려면 Angular 프레임워크를 로드해야 합니다.
이 작업은 SystemJS를 활용하며 자세한 과정은 [Setup for Upgrading to AngularJS](guide/upgrade-setup)에서 확인할 수 있으며, [QuickStart github 저장소](https://github.com/angular/quickstart)에서 코드를 내려받아 필요한 부분만 적용할 수도 있습니다.

그 다음에는 `npm install @angular/upgrade --save` 명령을 실행해서 `@angular/upgrade` 패키지를 설치해야 합니다.
패키지를 설치한 후에는 SystemJS 환경설정 파일에 다음과 같이 로드합니다:

<code-example path="upgrade-module/src/systemjs.config.1.js" region="upgrade-static-umd" header="systemjs.config.js (map)">
</code-example>

그리고 `app.module.ts` 파일을 만들어서 다음과 같은 `NgModule` 클래스를 정의합니다:

<code-example path="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts" region="ngmodule" header="app.module.ts">
</code-example>

이 코드는 모듈에 필요한 설정을 최소한으로 구현한 코드입니다.
이 모듈은 Angular를 브라우저에서 실행하기 위해 `BrowserModule`을 로드하고 있으며, `@angular/upgrade/static`이 제공하는 `UpgradeModule`도 로드하고 있습니다.
그리고 서비스와 컴포넌트를 업그레이드하거나 다운그레이드하는 서비스 프로바이더도 등록했습니다.

`AppModule`의 생성자에는 `UpgradeModule` 인스턴스를 의존성으로 주입하는데, 이 인스턴스는 `AppModule.ngDoBootstrap()` 메소드에서 `UpgradeModule.bootstrap` 메소드로 AngularJS 애플리케이션을 부트스트랩합니다.
이 메소드의 사용방법은 [angular.bootstrap](https://docs.angularjs.org/api/ng/function/angular.bootstrap)과 같습니다:

<div class="alert is-helpful">

`@NgModule` 데코레이터의 `bootstrap` 항목은 사용하지 않았습니다.
AngularJS는 독립적인 최상위 템플릿을 구성합니다.

</div>

이제 `platformBrowserDynamic.bootstrapModule` 메소드를 사용하면 `AppModule`을 부트스트랩할 수 있습니다.

<code-example path="upgrade-module/src/app/ajs-a-hybrid-bootstrap/app.module.ts" region="bootstrap" header="app.module.ts'">
</code-example>

축하합니다! 이제 하이브리드 애플리케이션이 동작합니다!
이제 AngularJS 코드로 작성한 애플리케이션에 Angular 코드를 추가할 준비는 끝났습니다.


{@a using-angular-components-from-angularjs-code}
<!--
### Using Angular Components from AngularJS Code
-->
### AngularJS 영역에 Angular 컴포넌트 사용하기

<!--
<img src="generated/images/guide/upgrade/ajs-to-a.png" alt="Using an Angular component from AngularJS code" class="left">

Once you're running a hybrid app, you can start the gradual process of upgrading
code. One of the more common patterns for doing that is to use an Angular component
in an AngularJS context. This could be a completely new component or one that was
previously AngularJS but has been rewritten for Angular.

Say you have a simple Angular component that shows information about a hero:

<code-example path="upgrade-module/src/app/downgrade-static/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

If you want to use this component from AngularJS, you need to *downgrade* it
using the `downgradeComponent()` method. The result is an AngularJS
*directive*, which you can then register in the AngularJS module:

<code-example path="upgrade-module/src/app/downgrade-static/app.module.ts" region="downgradecomponent" header="app.module.ts">
</code-example>

<div class="alert is-helpful">

By default, Angular change detection will also run on the component for every
AngularJS `$digest` cycle. If you wish to only have change detection run when
the inputs change, you can set `propagateDigest` to `false` when calling
`downgradeComponent()`.

</div>

Because `HeroDetailComponent` is an Angular component, you must also add it to the
`declarations` in the `AppModule`.

And because this component is being used from the AngularJS module, and is an entry point into
the Angular application, you must add it to the `entryComponents` for the
NgModule.

<code-example path="upgrade-module/src/app/downgrade-static/app.module.ts" region="ngmodule" header="app.module.ts">
</code-example>

<div class="alert is-helpful">

All Angular components, directives and pipes must be declared in an NgModule.

</div>

The net result is an AngularJS directive called `heroDetail`, that you can
use like any other directive in AngularJS templates.

<code-example path="upgrade-module/src/index-downgrade-static.html" region="usecomponent">
</code-example>

<div class="alert is-helpful">

Note that this AngularJS is an element directive (`restrict: 'E'`) called `heroDetail`.
An AngularJS element directive is matched based on its _name_.
*The `selector` metadata of the downgraded Angular component is ignored.*

</div>

Most components are not quite this simple, of course. Many of them
have *inputs and outputs* that connect them to the outside world. An
Angular hero detail component with inputs and outputs might look
like this:

<code-example path="upgrade-module/src/app/downgrade-io/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

These inputs and outputs can be supplied from the AngularJS template, and the
`downgradeComponent()` method takes care of wiring them up:

<code-example path="upgrade-module/src/index-downgrade-io.html" region="usecomponent">
</code-example>

Note that even though you are in an AngularJS template, **you're using Angular
attribute syntax to bind the inputs and outputs**. This is a requirement for downgraded
components. The expressions themselves are still regular AngularJS expressions.

<div class="callout is-important">

<header>
  Use kebab-case for downgraded component attributes
</header>

There's one notable exception to the rule of using Angular attribute syntax
for downgraded components. It has to do with input or output names that consist
of multiple words. In Angular, you would bind these attributes using camelCase:

<code-example format="">
  [myHero]="hero"
  (heroDeleted)="handleHeroDeleted($event)"
</code-example>

But when using them from AngularJS templates, you must use kebab-case:

<code-example format="">
  [my-hero]="hero"
  (hero-deleted)="handleHeroDeleted($event)"
</code-example>

</div>

The `$event` variable can be used in outputs to gain access to the
object that was emitted. In this case it will be the `Hero` object, because
that is what was passed to `this.deleted.emit()`.

Since this is an AngularJS template, you can still use other AngularJS
directives on the element, even though it has Angular binding attributes on it.
For example, you can easily make multiple copies of the component using `ng-repeat`:

<code-example path="upgrade-module/src/index-downgrade-io.html" region="userepeatedcomponent">
</code-example>
-->
<img src="generated/images/guide/upgrade/ajs-to-a.png" alt="Using an Angular component from AngularJS code" class="left">

하이브리드 앱을 실행했다면 이제 코드를 업그레이드 할 시간입니다.
그 중 가장 먼저 할 수 있는 것은 AngularJS 컨텍스트에 Angular 컴포넌트를 사용하는 것입니다.
AngularJS로 작성된 컴포넌트를 Angular로 재작성하면 됩니다.

히어로의 정보를 표시하는 Angular 컴포넌트 코드가 다음과 같다고 합시다:

<code-example path="upgrade-module/src/app/downgrade-static/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

이 컴포넌트를 AngularJS 템플릿에 사용하려면 `downgradeComponent()` 메소드를 사용해서 컴포넌트를 *다운그레이드*해야 하는데, 이 메소드는 AngularJS *디렉티브*를 반환하기 때문에 AngularJS 모듈에 등록할 수 있습니다:

<code-example path="upgrade-module/src/app/downgrade-static/app.module.ts" region="downgradecomponent" header="app.module.ts">
</code-example>

`HeroDetailComponent`는 Angulara 컴포넌트이기 때문에 `AppModule`의 `declarations` 배열에도 등록해야 합니다.

그리고 이 컴포넌트는 AngularJS 모듈에 사용될 것이기 때문에 Angular 애플리케이션의 진입 포인트로 지정되어야 합니다.
NgModule의 `entryComponents`에 다음과 같이 등록합니다.

<code-example path="upgrade-module/src/app/downgrade-static/app.module.ts" region="ngmodule" header="app.module.ts">
</code-example>

<div class="alert is-helpful">

Angular 컴포넌트와 디렉티브, 파이프는 반드시 NgModule에 등록해야 합니다.

</div>

이렇게 구현하고 나면 AngularJS에서 사용할 수 있는 `heroDetail` 디렉티브가 만들어지기 때문에 이제 AngularJS 템플릿에 보통 디렉티브처럼 사용할 수 있습니다.

<code-example path="upgrade-module/src/index-downgrade-static.html" region="usecomponent">
</code-example>

<div class="alert is-helpful">

이 컴포넌트는 이제 Angular 엘리먼트 디렉티브(`restrict: 'E'`)이며 셀렉터는 `heroDetail`입니다.
이제 AngularJS 디렉티브는 HTML 페이지에 사용된 엘리먼트의 _이름_ 과 매칭되며, *Angular 컴포넌트에서 지정한 `selector` 메타데이터는 무시됩니다.*

</div>

당연히 모든 컴포넌트가 이렇게 간단하지만은 않습니다.
컴포넌트에 *입출력* 프로퍼티가 있어서 외부와 연결되었을 수도 있습니다.
이런 컴포넌트 코드를 생각해 봅시다:

<code-example path="upgrade-module/src/app/downgrade-io/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

입출력 프로퍼티는 AngularJS 템플릿에서도 사용할 수 있습니다.
AngularJS에서 다음과 같이 작성하면 `downgradeComponent()` 메소드가 Angular 컴포넌트의 입출력 프로퍼티를 연결할 수 있습니다::

<code-example path="upgrade-module/src/index-downgrade-io.html" region="usecomponent">
</code-example>

이 때 작업하는 것은 분명히 AngularJS 템플릿이지만 **입출력 프로퍼티를 바인딩할 때는 Angular 어트리뷰트 바인딩 문법을 사용합니다**.
Angular 컴포넌트를 다운그레이드할 때 이 규칙은 꼭 지켜야 합니다.
다만 어트리뷰트에 바인딩되는 표현식은 AngularJS 문법입니다.

<div class="callout is-important">

<header>
  다운그레이드한 컴포넌트 어트리뷰트에는 케밥 케이스(kebab-case)를 사용합니다.
</header>

Angular 컴포넌트를 다운그레이드해서 사용할 때 어트리뷰트 문법에 주의해야 할 점이 있습니다.
입출력 프로퍼티의 이름이 여러 단어로 구성되었다면 Angular에서는 캐멀 케이스(camelCase)로 지정했습니다:

<code-example format="">
  [myHero]="hero"
  (heroDeleted)="handleHeroDeleted($event)"
</code-example>

하지만 AngularJS 템플릿에서는 케밥 케이스를 사용해야 합니다:

<code-example format="">
  [my-hero]="hero"
  (hero-deleted)="handleHeroDeleted($event)"
</code-example>

</div>

컴포넌트 안에서 외부로 보내는 객체는 `$event` 변수에 담겨 전달됩니다.
위에서 살펴본 코드로 보면 `this.deleted.emit()`을 실행했을 때 전달되는 객체는 `Hero` 객체입니다.

그런데 지금 작업하고 있는 것은 AngularJS 템플릿이기 때문에 다른 AngularJS 디렉티브처럼 Angular 어트리뷰트도 바인딩할 수 있습니다.
그래서 `ng-repeat`로 배열을 순회할 때도 다음과 같이 사용할 수 있습니다:

<code-example path="upgrade-module/src/index-downgrade-io.html" region="userepeatedcomponent">
</code-example>


{@a using-angularjs-component-directives-from-angular-code}
<!--
### Using AngularJS Component Directives from Angular Code
-->
### Angular 영역에 AngularJS 컴포넌트 사용하기

<img src="generated/images/guide/upgrade/a-to-ajs.png" alt="Using an AngularJS component from Angular code" class="left">

<!--
So, you can write an Angular component and then use it from AngularJS
code. This is useful when you start to migrate from lower-level
components and work your way up. But in some cases it is more convenient
to do things in the opposite order: To start with higher-level components
and work your way down. This too can be done using the `upgrade/static`.
You can *upgrade* AngularJS component directives and then use them from
Angular.

Not all kinds of AngularJS directives can be upgraded. The directive
really has to be a *component directive*, with the characteristics
[described in the preparation guide above](guide/upgrade#using-component-directives).
The safest bet for ensuring compatibility is using the
[component API](https://docs.angularjs.org/api/ng/type/angular.Module)
introduced in AngularJS 1.5.

A simple example of an upgradable component is one that just has a template
and a controller:
-->
이제는 Angular 컴포넌트를 정의할 수 있고 이 컴포넌트를 AngularJS 영역에 사용할 수 있습니다.
AngularJS 애플리케이션을 가장 안쪽 컴포넌트부터 작업할 때에도 이 방식을 활용할 수 있습니다.
하지만 반대 방향으로 작업하는 것이 편할 때도 있습니다.
가장 바깥쪽에 있는 컴포넌트부터 시작해서 안쪽 컴포넌트로 나아가는 방향인데, 이 경우에도 `upgrade/static` 패키지를 사용합니다.
AngularJS 컴포넌트 디렉티브는 Angular 컴포넌트로 *업그레이드*할 수 있습니다.

AngularJS에 있는 모든 디렉티브를 업그레이드할 수 있는 것은 아닙니다.
업그레이드할 수 있는 것은 *컴포넌트 디렉티브* 이며, [위에서 설명한 조건](guide/upgrade#using-component-directives)을 갖추고 있어야 합니다.
좀 더 자세하게 이야기하면 AngularJS 1.5에 도입된 [컴포넌트 API](https://docs.angularjs.org/api/ng/type/angular.Module)를 사용한 컴포넌트가 업그레이드하기 쉽습니다.

다음과 같이 `template`과 `controller`로 구성된 AngularJS 컴포넌트가 있다고 합시다:

<code-example path="upgrade-module/src/app/upgrade-static/hero-detail.component.ts" region="hero-detail" header="hero-detail.component.ts">
</code-example>

<!--
You can *upgrade* this component to Angular using the `UpgradeComponent` class.
By creating a new Angular **directive** that extends `UpgradeComponent` and doing a `super` call
inside its constructor, you have a fully upgraded AngularJS component to be used inside Angular.
All that is left is to add it to `AppModule`'s `declarations` array.
-->
이 컴포넌트는 `UpgradeComponent`를 상속받은 클래스의 생성자에서 `super` 함수를 실행하면 **업그레이드 된** Angular **디렉티브** 를 정의할 수 있으며, Angular 영역에서도 AngularJS의 모든 기능을 활용할 수 있습니다.
이제는 업그레이드한 AngularJS 컴포넌트를 `AppModule`의 `declarations`에 등록하면 됩니다.

<code-example path="upgrade-module/src/app/upgrade-static/hero-detail.component.ts" region="hero-detail-upgrade" header="hero-detail.component.ts">
</code-example>

<code-example path="upgrade-module/src/app/upgrade-static/app.module.ts" region="hero-detail-upgrade" header="app.module.ts">
</code-example>

<div class="alert is-helpful">

<!--
Upgraded components are Angular **directives**, instead of **components**, because Angular
is unaware that AngularJS will create elements under it. As far as Angular knows, the upgraded
component is just a directive - a tag - and Angular doesn't have to concern itself with
its children.
-->
이렇게 업그레이드한 AngularJS 컴포넌트는 Angular **컴포넌트**가 아니라 **디렉티브**입니다.
Angular와는 다르게 AngularJS는 호스트 엘리먼트 안쪽으로 컴포넌트를 구성하기 때문이며, 이런 방식 때문에 Angular는 컴포넌트 안쪽을 신경쓸 필요가 없습니다.

</div>

<!--
An upgraded component may also have inputs and outputs, as defined by
the scope/controller bindings of the original AngularJS component
directive. When you use the component from an Angular template,
provide the inputs and outputs using **Angular template syntax**,
observing the following rules:
-->
AngularJS 컴포넌트에는 `scope`나 `controller`에 정의된 입출력 프로퍼티가 있을 수 있습니다.
이 프로퍼티들은 Angular 템플릿에서도 **Angular 템플릿 문법**을 사용해서 연결할 수 있습니다:

<table>
  <tr>
    <th>
    </th>
    <th>
      <!--
      Binding definition
      -->
      바인딩 방법
    </th>
    <th>
      <!--
      Template syntax
      -->
      템플릿 문법
    </th>
  </tr>
  <tr>
    <th>
      <!--
      Attribute binding
      -->
      어트리뷰트 바인딩
    </th>
    <td>

      `myAttribute: '@myAttribute'`

    </td>

    <td>

      `<my-component myAttribute="value">`

    </td>
  </tr>
  <tr>
    <th>
      <!--
      Expression binding
      -->
      표현식 바인딩
    </th>
    <td>

      `myOutput: '&myOutput'`

    </td>
    <td>

      `<my-component (myOutput)="action()">`

    </td>
  </tr>
  <tr>
    <th>
      <!--
      One-way binding
      -->
      단방향 바인딩
    </th>
    <td>

      `myValue: '<myValue'`

    </td>
    <td>

      `<my-component [myValue]="anExpression">`

    </td>
  </tr>
  <tr>
    <th>
      <!--
      Two-way binding
      -->
      양방향 바인딩
    </th>
    <td>

      `myValue: '=myValue'`

    </td>
    <td>

      <!--
      As a two-way binding: `<my-component [(myValue)]="anExpression">`.
      Since most AngularJS two-way bindings actually only need a one-way binding
      in practice, `<my-component [myValue]="anExpression">` is often enough.
      -->
      양방향 바인딩 문법은 `<my-component [(myValue)]="anExpression">`와 같은 형식입니다.
      그런데 AngularJS에서 사용하는 양방향 바인딩은 일반적으로 단방향 바인딩만으로도 처리할 수 있기 때문에 `<my-component [myValue]="anExpression">`라고만 사용해도 충분합니다.

    </td>
  </tr>
</table>

<!--
For example, imagine a hero detail AngularJS component directive
with one input and one output:
-->
히어로의 정보를 표시하는 AngularJS 컴포넌트 디렉티브에 다음과 같은 입출력 프로퍼티가 있다고 합시다:

<code-example path="upgrade-module/src/app/upgrade-io/hero-detail.component.ts" region="hero-detail-io" header="hero-detail.component.ts">
</code-example>

<!--
You can upgrade this component to Angular, annotate inputs and outputs in the upgrade directive,
and then provide the input and output using Angular template syntax:
-->
이 컴포넌트는 Angular가 제공하는 `Input`/`Output` 데코레이터와 템플릿 문법을 사용해서 다음과 같이 연결할 수 있습니다:

<code-example path="upgrade-module/src/app/upgrade-io/hero-detail.component.ts" region="hero-detail-io-upgrade" header="hero-detail.component.ts">
</code-example>

<code-example path="upgrade-module/src/app/upgrade-io/container.component.ts" header="container.component.ts">
</code-example>


{@a projecting-angularjs-content-into-angular-components}
<!--
### Projecting AngularJS Content into Angular Components
-->
### Angular 컴포넌트에 AngularJS 내용 프로젝션하기

<!--
<img src="generated/images/guide/upgrade/ajs-to-a-with-projection.png" alt="Projecting AngularJS content into Angular" class="left">

When you are using a downgraded Angular component from an AngularJS
template, the need may arise to *transclude* some content into it. This
is also possible. While there is no such thing as transclusion in Angular,
there is a very similar concept called *content projection*. `upgrade/static`
is able to make these two features interoperate.

Angular components that support content projection make use of an `<ng-content>`
tag within them. Here's an example of such a component:

<code-example path="upgrade-module/src/app/ajs-to-a-projection/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

When using the component from AngularJS, you can supply contents for it. Just
like they would be transcluded in AngularJS, they get projected to the location
of the `<ng-content>` tag in Angular:

<code-example path="upgrade-module/src/index-ajs-to-a-projection.html" region="usecomponent">
</code-example>

<div class="alert is-helpful">

When AngularJS content gets projected inside an Angular component, it still
remains in "AngularJS land" and is managed by the AngularJS framework.

</div>
-->
<img src="generated/images/guide/upgrade/ajs-to-a-with-projection.png" alt="Projecting AngularJS content into Angular" class="left">

Angular 컴포넌트를 AngularJS 템플릿에 사용하기 위해 다운그레이드하면서 HTML 조각 일부를 전달해야 하는 경우가 있습니다.
AngularJS에서는 이 동작을 트랜스클루전(transclusion)이라고 하며 Angular에서는 컨텐츠 프로젝션(content projection)이라고 하는데, `upgrade/static`을 사용하면 두 방식의 호환성을 맞출 수 있습니다.

Angular에서 프로젝션을 사용하려면 `<ng-content>` 태그를 사용합니다.
이런 컴포넌트가 있다고 합시다:

<code-example path="upgrade-module/src/app/ajs-to-a-projection/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

이 컴포넌트는 이대로 AngularJS 영역에 사용해도 그대로 동작합니다.

<code-example path="upgrade-module/src/index-ajs-to-a-projection.html" region="usecomponent">
</code-example>

<div class="alert is-helpful">

Angular 컴포넌트에 프로젝션 된 AngularJS의 내용물은 여전히 "AngularJS 세계"에 존재하며 AngularJS 프레임워크가 관리합니다.

</div>


{@a transcluding-angular-content-into-angularjs-component-directives}
<!--
### Transcluding Angular Content into AngularJS Component Directives
-->
### AngularJS 컴포넌트 디렉티브에 Angular 내용 트랜스클루전하기

<!--
<img src="generated/images/guide/upgrade/a-to-ajs-with-transclusion.png" alt="Projecting Angular content into AngularJS" class="left">

Just as you can project AngularJS content into Angular components,
you can *transclude* Angular content into AngularJS components, whenever
you are using upgraded versions from them.

When an AngularJS component directive supports transclusion, it may use
the `ng-transclude` directive in its template to mark the transclusion
point:

<code-example path="upgrade-module/src/app/a-to-ajs-transclusion/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

If you upgrade this component and use it from Angular, you can populate
the component tag with contents that will then get transcluded:

<code-example path="upgrade-module/src/app/a-to-ajs-transclusion/container.component.ts" header="container.component.ts">
</code-example>
-->
<img src="generated/images/guide/upgrade/a-to-ajs-with-transclusion.png" alt="Projecting Angular content into AngularJS" class="left">

AngularJS의 내용을 Angular 컴포넌트에 프로젝션하듯이 Angular 내용도 AngularJS 컴포넌트 디렉티브로 *트랜스클루전(transclude)* 할 수 있습니다.
이 때 AngularJS 컴포넌트 디렉티브는 업그레이드된 것이어야 합니다.

AngularJS 컴포넌트 디렉티브에 트랜스클루전하려면 컨텐츠가 표시될 위치를 지정하기 위해 다음과 같이 `ng-transclude` 디렉티브를 사용해야 합니다:

<code-example path="upgrade-module/src/app/a-to-ajs-transclusion/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

그러면 이 컴포넌트를 업그레이드한 후에 Angular 영역에서 다음과 같이 사용할 수 있습니다:

<code-example path="upgrade-module/src/app/a-to-ajs-transclusion/container.component.ts" header="container.component.ts">
</code-example>


{@a making-angularjs-dependencies-injectable-to-angular}
<!--
### Making AngularJS Dependencies Injectable to Angular
-->
### AngularJS 의존성 객체를 Angular에 등록하기

<!--
When running a hybrid app, you may encounter situations where you need to inject
some AngularJS dependencies into your Angular code.
Maybe you have some business logic still in AngularJS services.
Maybe you want access to AngularJS's built-in services like `$location` or `$timeout`.

In these situations, it is possible to *upgrade* an AngularJS provider to
Angular. This makes it possible to then inject it somewhere in Angular
code. For example, you might have a service called `HeroesService` in AngularJS:

<code-example path="upgrade-module/src/app/ajs-to-a-providers/heroes.service.ts" header="heroes.service.ts">
</code-example>

You can upgrade the service using a Angular [factory provider](guide/dependency-injection-providers#factory-providers)
that requests the service from the AngularJS `$injector`.

Many developers prefer to declare the factory provider in a separate `ajs-upgraded-providers.ts` file
so that they are all together, making it easier to reference them, create new ones and
delete them once the upgrade is over.

It's also recommended to export the `heroesServiceFactory` function so that Ahead-of-Time
compilation can pick it up.

<div class="alert is-helpful">

**Note:** The 'heroes' string inside the factory refers to the AngularJS `HeroesService`.
It is common in AngularJS apps to choose a service name for the token, for example "heroes",
and append the "Service" suffix to create the class name.

</div>

<code-example path="upgrade-module/src/app/ajs-to-a-providers/ajs-upgraded-providers.ts" header="ajs-upgraded-providers.ts">
</code-example>

You can then provide the service to Angular by adding it to the `@NgModule`:

<code-example path="upgrade-module/src/app/ajs-to-a-providers/app.module.ts" region="register" header="app.module.ts">
</code-example>

Then use the service inside your component by injecting it in the component constructor using its class as a type annotation:

<code-example path="upgrade-module/src/app/ajs-to-a-providers/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

<div class="alert is-helpful">

In this example you upgraded a service class.
You can use a TypeScript type annotation when you inject it. While it doesn't
affect how the dependency is handled, it enables the benefits of static type
checking. This is not required though, and any AngularJS service, factory, or
provider can be upgraded.

</div>
-->
하이브리드 앱을 실행하다보면 AngularJS의 의존성 객체를 Angular에 의존성으로 주입해야 하는 경우가 있습니다.
AngularJS에 비즈니스 로직을 작성했거나 AngularJS의 내장 서비스인 `$location`이나 `$timeout`을 사용하는 경우가 그렇습니다.

이런 경우에는 AngularJS 프로바이더를 Angular용으로 *업그레이드* 하면 Angular 코드에 의존성으로 주입할 수 있습니다.
AngularJS로 작성한 `HeroesService`가 있다고 합시다:

<code-example path="upgrade-module/src/app/ajs-to-a-providers/heroes.service.ts" header="heroes.service.ts">
</code-example>

이 서비스를 업그레이드 하려면 AngularJS `$injector`로 서비스 인스턴스를 가져와서 Angular [팩토리 프로바이더](guide/dependency-injection-providers#factory-providers)로 등록하면 됩니다.

일반적으로 AngularJS 서비스 프로바이더는 `ajs-upgraded-providers.ts` 파일에 모두 모아서 선언하는 것이 좋습니다.
이렇게 구현하면 서비스를 참조하기 더 편하며 업그레이드가 진행될 때마다 하나씩 제거하기도 수월합니다.

그리고 이렇게 작성한 팩토리 프로바이더는 AOT 컴파일러가 접근할 수 있도록 `heroesServiceFactory` 함수도 파일 외부로 공개하는 것을 권장합니다.

<div class="alert is-helpful">

**참고:** 팩토리 함수 안에서 사용한 `heroes` 문자열은 AngularJS `HeroesService`를 가리키기 위한 것입니다.
일반적으로 AngularJS 앱에서는 서비스 토큰을 문자열로 사용하며, 클래스 이름에 "Service" 접미사를 붙입니다.

</div>

<code-example path="upgrade-module/src/app/ajs-to-a-providers/ajs-upgraded-providers.ts" header="ajs-upgraded-providers.ts">
</code-example>

이렇게 업그레이드한 서비스는 Angular `@NgModule`에 다음과 같이 등록합니다:

<code-example path="upgrade-module/src/app/ajs-to-a-providers/app.module.ts" region="register" header="app.module.ts">
</code-example>

이제 컴포넌트 생성자에 원하는 서비스의 타입을 지정하면 해당 서비스의 인스턴스를 주입받을 수 있습니다:

<code-example path="upgrade-module/src/app/ajs-to-a-providers/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>

<div class="alert is-helpful">

이 섹션에서는 AngularJS 서비스 클래스를 업그레이드하는 방법에 대해 알아봤습니다.
이 때 TypeScript 타입 어노테이션을 사용할 수도 있는데 이 방식은 의존성 객체를 직접 조작하지 않지만 정적 타입을 체크할 수 있기 때문에 도움이 될 수 있습니다.
타입 어노테이션은 옵션 사항이며 AngularJS 서비스, 팩토리는 어떤 것이든 업그레이드할 수 있습니다.

</div>


{@a making-angular-dependencies-injectable-to-angularjs}
<!--
### Making Angular Dependencies Injectable to AngularJS
-->
### Angular 의존성 객체를 AngularJS에 등록하기

<!--
In addition to upgrading AngularJS dependencies, you can also *downgrade*
Angular dependencies, so that you can use them from AngularJS. This can be
useful when you start migrating services to Angular or creating new services
in Angular while retaining components written in AngularJS.

For example, you might have an Angular service called `Heroes`:

<code-example path="upgrade-module/src/app/a-to-ajs-providers/heroes.ts" header="heroes.ts">
</code-example>

Again, as with Angular components, register the provider with the `NgModule` by adding it to the module's `providers` list.

<code-example path="upgrade-module/src/app/a-to-ajs-providers/app.module.ts" region="ngmodule" header="app.module.ts">
</code-example>

Now wrap the Angular `Heroes` in an *AngularJS factory function* using `downgradeInjectable()`
and plug the factory into an AngularJS module.
The name of the AngularJS dependency is up to you:

<code-example path="upgrade-module/src/app/a-to-ajs-providers/app.module.ts" region="register" header="app.module.ts">
</code-example>

After this, the service is injectable anywhere in AngularJS code:

<code-example path="upgrade-module/src/app/a-to-ajs-providers/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>
-->
AngularJS 의존성 객체를 업그레이드하는 것과 비슷하게 Angular 의존성 객체도 *다운그레이드해서* AngularJS에 주입할 수 있습니다.
이 과정은 AngularJS 서비스를 Angular로 전환할 때나 Angular 쪽에 새로 만든 서비스를 AngularJS 컴포넌트에 적용할 때 활용할 수 있습니다.

다음과 같은 `Heroes` Angular 서비스가 있다고 합시다:

<code-example path="upgrade-module/src/app/a-to-ajs-providers/heroes.ts" header="heroes.ts">
</code-example>

이 서비스는 Angular 컴포넌트에 주입하기 위해 `NgModule`의 `providers` 배열에 등록할 수 있습니다.

<code-example path="upgrade-module/src/app/a-to-ajs-providers/app.module.ts" region="ngmodule" header="app.module.ts">
</code-example>

Angular `Heroes` 서비스는 `downgradeInjectable()` 함수를 사용해서 *AngularJS 팩토리 함수*로 전환해서 AngularJS 모듈에 등록할 수 있습니다.
이 때 AngularJS에서 어떤 이름을 사용할지는 개발자가 결정하면 됩니다:

<code-example path="upgrade-module/src/app/a-to-ajs-providers/app.module.ts" region="register" header="app.module.ts">
</code-example>

이렇게 작성하고 나면 이 서비스는 AngularJS 코드에 다음과 같이 의존성으로 주입할 수 있습니다:

<code-example path="upgrade-module/src/app/a-to-ajs-providers/hero-detail.component.ts" header="hero-detail.component.ts">
</code-example>


<!--
## Lazy Loading AngularJS
-->
## AngularJS의 지연 로딩

<!--
When building applications, you want to ensure that only the required resources are loaded when necessary. Whether that be loading of assets or code, making sure everything that can be deferred until needed keeps your application running efficiently. This is especially true when running different frameworks in the same application.

[Lazy loading](guide/glossary#lazy-loading) is a technique that defers the loading of required assets and code resources until they are actually used. This reduces startup time and increases efficiency, especially when running different frameworks in the same application.

When migrating large applications from AngularJS to Angular using a hybrid approach, you want to migrate some of the most commonly used features first, and only use the less commonly used features if needed. Doing so helps you ensure that the application is still providing a seamless experience for your users while you are migrating.

In most environments where both Angular and AngularJS are used to render the application, both frameworks are loaded in the initial bundle being sent to the client. This results in both increased bundle size and possible reduced performance.

Overall application performance is affected in cases where the user stays on Angular-rendered pages because the AngularJS framework and application are still loaded and running, even if they are never accessed.

You can take steps to mitigate both bundle size and performance issues. By isolating your AngularJS app to a separate bundle, you can take advantage of [lazy loading](guide/glossary#lazy-loading) to load, bootstrap, and render the AngularJS application only when needed. This strategy reduces your initial bundle size, defers any potential impact from loading both frameworks until absolutely necessary, and keeps your application running as efficiently as possible.

The steps below show you how to do the following:

* Setup a callback function for your AngularJS bundle.
* Create a service that lazy loads and bootstraps your AngularJS app.
* Create a routable component for AngularJS content
* Create a custom `matcher` function for AngularJS-specific URLs and configure the Angular `Router` with the custom matcher for AngularJS routes.
-->
애플리케이션을 개발하다보면 애플리케이션 리소스를 필요한 경우에만 불러오고 싶은 경우가 있습니다.
이 리소스가 정적 파일일 수도 있고 코드일 수도 있지만, 이와 관계없이 애플리케이션 리소스는 꼭 필요한 경우가 되기 전까지는 내려받지 않는 것이 애플리케이션에도 효율적입니다.
한 애플리케이션 안에 실행되는 프레임워크가 여러개라면 더욱 그렇습니다.

[지연 로딩(lazy loading)](guide/glossary#lazy-loading)은 애플리케이션 리소스가 실제로 필요할 때까지 로딩 시점을 지연시키는 테크닉입니다.
이 테크닉을 활용하면 애플리케이션의 초기 실행시간을 줄일 수 있으며 애플리케이션을 효율적으로 관리할 수 있습니다.

대규모 AngularJS 애플리케이션을 하이브리드로 실행하면서 Angular 버전으로 업그레이드할 때는, 가장 많이 사용되는 공통기능을 먼저 작업하고 일부에만 사용되는 로직은 가장 나중에 작업하는 것이 일반적입니다.
이 작업을 진행되는 동안에도 애플리케이션 사용자는 앱이 이전과 동일하게 동작한다고 느낄 것입니다.

Angular와 AngularJS가 함께 실행되는 환경은 애플리케이션을 렌더링하기 위해 두 프레임워크가 모두 번들 결과물에 포함되어 클라이언트로 전달되어야 합니다.
따라서 번들 결과물의 크기도 커지고 애플리케이션 실행 성능도 저하될 수 있습니다.

하이브리드 앱에서는 Angular로 렌더링한 페이지에 사용자가 머물러 있더라도 AngularJS 프레임워크와 애플리케이션이 여전히 로드되고 실행되기 때문에 앱 전체 성능에 영향을 줍니다.

번들 결과물의 크기나 성능 저하를 줄일 수 있는 방법이 있습니다.
AngularJS 애플리케이션을 따로 빌드하고 필요할 때 [지연 로딩](guide/glossary#lazy-loading)하면 되는데, 이 방식을 활요하면 초기 실행에 필요한 빌드 결과물의 크기가 작아지며 두 프레임워크가 함께 실행되기 때문에 발생할 수 있는 충돌 가능성도 줄일 수 있습니다.
애플리케이션을 좀 더 효율적으로 관리할 수 있다고도 볼 수 있습니다.

이렇게 구현하려면 다음 과정대로 진행하면 됩니다:

* AngularJS 번들용 콜백 함수를 추가합니다.
* 지연로딩용 서비스를 정의합니다.
* 라우팅 컴포넌트를 정의합니다.
* AngularJS용 URL에 사용할 커스텀 `matcher` 함수를 정의하고 이 매처를 Angular `Router`에서 AngularJS 라우팅 규칙과 연결합니다.


<!--
### Create a service to lazy load AngularJS
-->
### AngularJS 애플리케이션을 지연 로딩하는 서비스 정의하기

<!--
As of Angular version 8, lazy loading code can be accomplished simply by using the dynamic import syntax `import('...')`. In your application, you create a new service that uses dynamic imports to lazy load AngularJS.

<code-example path="upgrade-lazy-load-ajs/src/app/lazy-loader.service.ts" header="src/app/lazy-loader.service.ts">
</code-example>

The service uses the `import()` method to load your bundled AngularJS application lazily. This decreases the initial bundle size of your application as you're not loading code your user doesn't need yet. You also need to provide a way to _bootstrap_ the application manually after it has been loaded. AngularJS provides a way to manually bootstrap an application using the [angular.bootstrap()](https://docs.angularjs.org/api/ng/function/angular.bootstrap) method with a provided HTML element. Your AngularJS app should also expose a `bootstrap` method that bootstraps the AngularJS app.

To ensure any necessary teardown is triggered in the AngularJS app, such as removal of global listeners, you also implement a method to call the `$rootScope.destroy()` method.

<code-example path="upgrade-lazy-load-ajs/src/app/angularjs-app/index.ts" header="angularjs-app">
</code-example>

Your AngularJS application is configured with only the routes it needs to render content. The remaining routes in your application are handled by the Angular Router. The exposed `bootstrap` method is called in your Angular app to bootstrap the AngularJS application after the bundle is loaded.

<div class="alert is-important">

**Note:** After AngularJS is loaded and bootstrapped, listeners such as those wired up in your route configuration will continue to listen for route changes. To ensure listeners are shut down when AngularJS isn't being displayed, configure an `otherwise` option with the [$routeProvider](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider) that renders an empty template. This assumes all other routes will be handled by Angular.

</div>
-->
Angular 8 버전부터는 지연 로딩을 지원하는 코드가 동적 로딩을 사용하도록 `import('...')`와 같은 형태로 단순해졌습니다.
AngularJS 애플리케이션을 지연 로딩하는 Angular 서비스는 다음과 같이 정의합니다.

<code-example path="upgrade-lazy-load-ajs/src/app/lazy-loader.service.ts" header="src/app/lazy-loader.service.ts">
</code-example>

이 서비스는 `import()` 메소드를 활용해서 AngularJS 애플리케이션을 지연로딩합니다.
따라서 AngularJS 앱은 이제 초기 실행에 필요한 빌드 결과물에 포함되지 않으며, 그만큼 첫 실행할 때 받아야 할 빌드 결과물의 크기도 작아집니다.
AngularJS 앱을 지연 로딩한 후에는 이 앱을 수동으로 _부트스트랩_ 해야 하는데, 이 과정은 [angular.bootstrap()](https://docs.angularjs.org/api/ng/function/angular.bootstrap) 메소드로 처리할 수 있습니다.

그리고 이 서비스에는 AngularJS 앱이 종료될 때 필요한 로직을 실행하기 위해 `$rootScope.destroy()` 메소드를 실행하는 `destroy()` 함수를 정의했습니다.

<code-example path="upgrade-lazy-load-ajs/src/app/angularjs-app/index.ts" header="angularjs-app">
</code-example>

아직 AngularJS 앱에 정의된 라우팅 규칙들은 화면을 표시하기 위한 용도로만 구성되었습니다.
그리고 애플리케이션의 전체 라우팅은 Angular 라우터가 처리합니다.
Angular 앱이 AngularJS 애플리케이션을 로딩한 후에 실행할 수 있도록 `bootstrap` 메소드를 다음과 같이 정의했습니다.

<div class="alert is-important">

**참고:** AngularJS 앱을 로드하고 부트스트랩한 후에는 AngularJS 라우팅 설정에서도 라우팅 규칙이 변경되는 것을 감지합니다.
그러면 AngularJS 쪽의 리스너를 제거하기 위해 AngularJS 라우팅 규칙에 `otherwise` 옵션을 추가하고 [$routeProvider](https://docs.angularjs.org/api/ngRoute/provider/$routeProvider)을 연결해야 합니다.
이 라우팅 규칙은 Angular가 관리합니다.

</div>


<!--
### Create a component to render AngularJS content
-->
### AngularJS 앱을 렌더링하는 컴포넌트 생성하기

<!--
In your Angular application, you need a component as a placeholder for your AngularJS content. This component uses the service you create to load and bootstrap your AngularJS app after the component is initialized.

<code-example path="upgrade-lazy-load-ajs/src/app/angular-js/angular-js.component.ts" header="src/app/angular-js/angular-js.component.ts">
</code-example>

When the Angular Router matches a route that uses AngularJS, the `AngularJSComponent` is rendered, and the content is rendered within the AngularJS [`ng-view`](https://docs.angularjs.org/api/ngRoute/directive/ngView) directive. When the user navigates away from the route, the `$rootScope` is destroyed on the AngularJS application.
-->
Angular 애플리케이션에는 AngularJS 앱을 렌더링하는 컴포넌트가 필요할 수도 있습니다.
이 컴포넌트는 초기화된 직후에 지연로딩 서비스를 사용해서 AngularJS 앱을 로드하는 역할을 합니다.

<code-example path="upgrade-lazy-load-ajs/src/app/angular-js/angular-js.component.ts" header="src/app/angular-js/angular-js.component.ts">
</code-example>

이제 Angular 라우터가 AngularJS와 연관된 라우팅 규칙을 찾으면 `AngularJSComponent`가 렌더링 되면서 AngularJS [`ng-view`](https://docs.angularjs.org/api/ngRoute/directive/ngView) 디렉티브에 AngularJS 앱이 렌더링됩니다.
그리고 사용자가 이 화면에서 벗어나면 `$rooteScope.destroy()`를 실행하는 AngularJS 애플리케이션 정리 로직이 실행됩니다.


<!--
### Configure a custom route matcher for AngularJS routes
-->
### AngularJS용 커스텀 라우팅 규칙 매처 구성하기

<!--
To configure the Angular Router, you must define a route for AngularJS URLs. To match those URLs, you add a route configuration that uses the `matcher` property. The `matcher` allows you to use custom pattern matching for URL paths. The Angular Router tries to match on more specific routes such as static and variable routes first. When it doesn't find a match, it then looks at custom matchers defined in your route configuration. If the custom matchers don't match a route, it then goes to catch-all routes, such as a 404 page.

The following example defines a custom matcher function for AngularJS routes.

<code-example path="upgrade-lazy-load-ajs/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts" region="matcher">
</code-example>

The following code adds a route object to your routing configuration using the `matcher` property and custom matcher, and the `component` property with `AngularJSComponent`.

<code-example path="upgrade-lazy-load-ajs/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts">
</code-example>

When your application matches a route that needs AngularJS, the AngularJS app is loaded and bootstrapped, the AngularJS routes match the necessary URL to render their content, and your application continues to run with both AngularJS and Angular frameworks.
-->
하이브리드 앱에서 Angular 라우터를 구성하려면 AngularJS URL과 연결된 라우팅 규칙을 정의해야 합니다.
그리고 이 라우팅 규칙은 `matcher` 프로퍼티로 연결해야 하는데, `matcher`를 사용하면 URL 경로를 커스텀 패턴으로 매칭할 때 사용하는 프로퍼티입니다.
Angular 라우터는 URL이 변경되었을 때 정적 라우팅 규칙을 먼저 탐색합니다.
그리고 이 안에서 적절한 라우팅 규칙을 찾지 못하면 커스텀 매처를 탐색합니다.
커스텀 매처에서도 적절한 라웉이 규칙을 찾지 못하면 catch-all(`**`) 라우팅 규칙으로 떨어지며, 404 화면이 표시될 것입니다.

AngularJS 라우팅 규칙에 사용할 커스텀 매처는 다음과 같이 정의합니다.

<code-example path="upgrade-lazy-load-ajs/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts" region="matcher">
</code-example>

그리고 이 커스텀 매처는 `matcher` 프로퍼티를 사용해서 다음과 같이 라우팅 규칙으로 등록합니다.
이 때 `component` 프로퍼티에는 `AngularJSComponent`를 연결했습니다.

<code-example path="upgrade-lazy-load-ajs/src/app/app-routing.module.ts" header="src/app/app-routing.module.ts">
</code-example>

이제 AngularJS와 연결된 라우팅 규칙을 만나면 AngularJS 앱이 로드되고 부트스트랩된 이후에 AngularJS 라우팅 규칙이 다시 선택되어 앱을 화면에 표시합니다.
결국 Angular와 Angular 프레임워크는 동시에 동작하는 모양이 됩니다.


{@a using-the-unified-angular-location-service}
<!--
## Using the Unified Angular Location Service
-->
## Angular Location 서비스 통합하기

<!--
In AngularJS, the [$location service](https://docs.angularjs.org/api/ng/service/$location) handles all routing configuration and navigation, encoding and decoding of URLS, redirects, and interactions with browser APIs. Angular uses its own underlying `Location` service for all of these tasks.

When you migrate from AngularJS to Angular you will want to move as much responsibility as possible to Angular, so that you can take advantage of new APIs. To help with the transition, Angular provides the `LocationUpgradeModule`. This module enables a _unified_ location service that shifts responsibilities from the AngularJS `$location` service to the Angular `Location` service.

To use the `LocationUpgradeModule`, import the symbol from `@angular/common/upgrade` and add it to your `AppModule` imports using the static `LocationUpgradeModule.config()` method.

```ts
// Other imports ...
import { LocationUpgradeModule } from '@angular/common/upgrade';

@NgModule({
  imports: [
    // Other NgModule imports...
    LocationUpgradeModule.config()
  ]
})
export class AppModule {}
```

The `LocationUpgradeModule.config()` method accepts a configuration object that allows you to configure options including the `LocationStrategy` with the `useHash` property, and the URL prefix with the `hashPrefix` property.

The `useHash` property defaults to `false`, and the `hashPrefix` defaults to an empty `string`. Pass the configuration object to override the defaults.

```ts
LocationUpgradeModule.config({
  useHash: true,
  hashPrefix: '!'
})
```

<div class="alert is-important">

**Note:** See the `LocationUpgradeConfig` for more configuration options available to the `LocationUpgradeModule.config()` method.

</div>

This registers a drop-in replacement for the `$location` provider in AngularJS. Once registered, all navigation, routing broadcast messages, and any necessary digest cycles in AngularJS triggered during navigation are handled by Angular. This gives you a single way to navigate within both sides of your hybrid application consistently.

For usage of the `$location` service as a provider in AngularJS, you need to downgrade the `$locationShim` using a factory provider.

```ts
// Other imports ...
import { $locationShim } from '@angular/common/upgrade';
import { downgradeInjectable } from '@angular/upgrade/static';

angular.module('myHybridApp', [...])
  .factory('$location', downgradeInjectable($locationShim));
```

Once you introduce the Angular Router, using the Angular Router triggers navigations through the unified location service, still providing a single source for navigating with AngularJS and Angular.
-->
AngularJS에서 사용했던 [$location 서비스](https://docs.angularjs.org/api/ng/service/$location)는 모든 라우팅 규칙과 네비게이션 동작을 관리하며, URL을 인코딩/디코딩하고 리다이렉션을 수행하면서 브라우저 API와 상호작용합니다.
그리고 이 작업들은 Angular에서 `Location` 서비스가 그대로 담당하고 있습니다.

AngularJS 애플리케이션을 Angular로 옮기다보면 이 서비스와 관련된 기능도 함께 수정해야 할 수 있습니다.
그리고 이 과정에서 새로운 API를 도입하면서 더 나은 코드를 작성할 수도 있습니다.
AngularJS `$location`를 Angular `Location`로 변환하는 작업을 돕기 위해 Angular는 `LocationUpgradeModule`을 제공합니다.
이 모듈은 두 서비스를 _통합하는_ Location 서비스를 제공합니다.

`LocationUpgradeModule`을 사용하려면 `@angular/common/upgrade` 패키지에서 이 모듈을 로드하고 `AppModule` 메타데이터에 `LocationUpgradeModule.config()` 메소드를 실행한 결과를 로드하면 됩니다.

```ts
// 로드 구문들 ...
import { LocationUpgradeModule } from '@angular/common/upgrade';

@NgModule({
  imports: [
    // NgModule 로드 ...
    LocationUpgradeModule.config()
  ]
})
export class AppModule {}
```

`LocationUpgradeModule.config()` 메소드에 옵션을 전달하면서 실행하면 `LocationStrategy`나 URL 접두사에 대한 정책을 지정할 수 있습니다.

`LocationStrategy`에 사용하는 `useHash` 프로퍼티 기본값은 `false`이며 URL 접두사를 지정하는 `hashPrefix` 프로퍼티 기본값은 빈 문자열인데, 이 정책을 변경하려면 다음과 같이 구현하면 됩니다.

```ts
LocationUpgradeModule.config({
  useHash: true,
  hashPrefix: '!'
})
```

<div class="alert is-important">

**참고:** `LocationUpgradeModule.config()` 메소드에 사용할 수 있는 옵션 목록은 `LocationUpgradeConfig` 문서를 참고하세요.

</div>

이렇게 구현하면 AngularJS에서 등록한 `$location` 프로바이더를 교체합니다.
그래서 이전에 AngularJS가 관여했던 네비게이션 동작, 라우팅 브로드캐스팅 메시지, 그리고 네비게이션 과정 중에 발생하는 모든 이벤트는 이제 Angular가 처리하게 됩니다.
이제는 하이브리드 애플리케이션의 모든 라우팅 과정을 Angular가 처리하기 때문에 애플리케이션을 관리하기 편해집니다.

그리고 AngularJS 쪽에서 Location 서비스를 다운그레이드해서 사용하려면 `$locationShim` 팩토리 프로바이더를 사용해서 다음과 같이 등록하면 됩니다.

```ts
// 로드 구문들 ...
import { $locationShim } from '@angular/common/upgrade';
import { downgradeInjectable } from '@angular/upgrade/static';

angular.module('myHybridApp', [...])
  .factory('$location', downgradeInjectable($locationShim));
```

이렇게 구현하고 나면 AngularJS와 Angular의 Location 서비스를 Angular 라우터가 통합해서 처리합니다.
그러면서 Angular와 AngularJS 각 영역에서 이 서비스를 단일 소스로 활용할 수 있습니다.

<!--
TODO:
Correctly document how to use AOT with SystemJS-based `ngUpgrade` apps (or better yet update the
`ngUpgrade` examples/guides to use `@angular/cli`).
See https://github.com/angular/angular/issues/35989.

## Using Ahead-of-time compilation with hybrid apps

You can take advantage of Ahead-of-time (AOT) compilation on hybrid apps just like on any other
Angular application.
The setup for a hybrid app is mostly the same as described in
[the Ahead-of-time Compilation chapter](guide/aot-compiler)
save for differences in `index.html` and `main-aot.ts`

The `index.html` will likely have script tags loading AngularJS files, so the `index.html`
for AOT must also load those files.
An easy way to copy them is by adding each to the `copy-dist-files.js` file.

You'll need to use the generated `AppModuleFactory`, instead of the original `AppModule` to
bootstrap the hybrid app:

<code-example path="upgrade-phonecat-2-hybrid/app/main-aot.ts" header="app/main-aot.ts">
</code-example>

And that's all you need do to get the full benefit of AOT for Angular apps!
-->

<!--
## PhoneCat Upgrade Tutorial
-->
## PhoneCat 업그레이드 튜토리얼

<!--
In this section, you'll learn to prepare and upgrade an application with `ngUpgrade`.
The example app is [Angular PhoneCat](https://github.com/angular/angular-phonecat)
from [the original AngularJS tutorial](https://docs.angularjs.org/tutorial),
which is where many of us began our Angular adventures. Now you'll see how to
bring that application to the brave new world of Angular.

During the process you'll learn how to apply the steps outlined in the
[preparation guide](guide/upgrade#preparation). You'll align the application
with Angular and also start writing in TypeScript.

To follow along with the tutorial, clone the
[angular-phonecat](https://github.com/angular/angular-phonecat) repository
and apply the steps as you go.

In terms of project structure, this is where the work begins:
-->
이번 섹션에서는 `ngUpgrade`로 AngularJS 애플리케이션을 업그레이드하는 방법에 대해 알아봅시다.
예제로 다뤄볼 앱은 [AngularJS 튜토리얼](https://docs.angularjs.org/tutorial) 앱이며 완성본은 [Angular PhoneCat 저장소](https://github.com/angular/angular-phonecat)에 있습니다.
이제 이 앱을 Angular 세계로 어떻게 옮겨갈 수 있는지 알아봅시다.

이 과정은 [사전 준비 가이드 섹션](guide/upgrade#preparation)에서 다룬 내용을 그대로 따라갑니다.
그래서 애플리케이션에 Angular와 TypeScript를 도입하는 것부터 시작해 봅시다.

앱을 직접 수정해 보려면 [angular-phonecat](https://github.com/angular/angular-phonecat) 저장소를 복제해서 그대로 따라해보는 것도 좋습니다.

작업을 시작하기 전에는 프로젝트가 이런 구조일 것입니다:


<div class='filetree'>
  <div class='file'>
    angular-phonecat
  </div>
  <div class='children'>
    <div class='file'>
      bower.json
    </div>
    <div class='file'>
      karma.conf.js
    </div>
    <div class='file'>
      package.json
    </div>
    <div class='file'>
      app
    </div>
    <div class='children'>
      <div class='file'>
        core
      </div>
      <div class='children'>
        <div class='file'>
          checkmark
        </div>
        <div class='children'>
          <div class='file'>
            checkmark.filter.js
          </div>
          <div class='file'>
            checkmark.filter.spec.js
          </div>
        </div>
        <div class='file'>
          phone
        </div>
        <div class='children'>
          <div class='file'>
            phone.module.js
          </div>
          <div class='file'>
            phone.service.js
          </div>
          <div class='file'>
            phone.service.spec.js
          </div>
        </div>
        <div class='file'>
          core.module.js
        </div>
      </div>
      <div class='file'>
        phone-detail
      </div>
      <div class='children'>
        <div class='file'>
          phone-detail.component.js
        </div>
        <div class='file'>
          phone-detail.component.spec.js
        </div>
        <div class='file'>
          phone-detail.module.js
        </div>
        <div class='file'>
          phone-detail.template.html
        </div>
      </div>
      <div class='file'>
        phone-list
      </div>
      <div class='children'>
        <div class='file'>
          phone-list.component.js
        </div>
        <div class='file'>
          phone-list.component.spec.js
        </div>
        <div class='file'>
          phone-list.module.js
        </div>
        <div class='file'>
          phone-list.template.html
        </div>
      </div>
      <div class='file'>
        img
      </div>
      <div class='children'>
        <div class='file'>
           ...
        </div>
      </div>
      <div class='file'>
        phones
      </div>
      <div class='children'>
        <div class='file'>
           ...
        </div>
      </div>
      <div class='file'>
        app.animations.js
      </div>
      <div class='file'>
        app.config.js
      </div>
      <div class='file'>
        app.css
      </div>
      <div class='file'>
        app.module.js
      </div>
      <div class='file'>
        index.html
      </div>
    </div>
    <div class='file'>
      e2e-tests
    </div>
    <div class='children'>
      <div class='file'>
        protractor-conf.js
      </div>
      <div class='file'>
        scenarios.js
      </div>
    </div>
  </div>
</div>

<!--
This is actually a pretty good starting point. The code uses the AngularJS 1.5
component API and the organization follows the
[AngularJS Style Guide](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md),
which is an important [preparation step](guide/upgrade#follow-the-angular-styleguide) before
a successful upgrade.

* Each component, service, and filter is in its own source file, as per the
  [Rule of 1](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility).

* The `core`, `phone-detail`, and `phone-list` modules are each in their
  own subdirectory. Those subdirectories contain the JavaScript code as well as
  the HTML templates that go with each particular feature. This is in line with the
  [Folders-by-Feature Structure](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#folders-by-feature-structure)
  and [Modularity](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#modularity)
  rules.

* Unit tests are located side-by-side with application code where they are easily
  found, as described in the rules for
  [Organizing Tests](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#organizing-tests).
-->
시작점으로는 아주 좋은 구조입니다.
이 예제 코드는 AngularJS 1.5 컴포넌트 API를 사용하고 있으며 [AngularJS 스타일 가이드](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md)를 준수하며 작성되었기 때문에 [기본적인 준비](guide/upgrade#follow-the-angular-styleguide)는 이미 마쳤다고 봐도 됩니다.

* 컴포넌트, 서비스, 필터는 개별 파일에 구현되어 있습니다. [하나만 구현하는 규칙](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#single-responsibility)을 준수하고 있습니다.

* `core`, `phone-detail`, `phone-list` 모듈은 각각 폴더로 구분되어 있습니다. 그리고 각 폴더에는 해당 모듈에만 필요한 코드가 모여 있습니다. [폴더를 기능별로 구분하는 구조](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#folders-by-feature-structure)와 [모듈화](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#modularity) 규칙도 지키고 있습니다.

* 유닛 테스트 파일은 애플리케이션 코드와 같은 위치에 있기 때문에 찾기 쉽습니다. [테스트를 최적화](https://github.com/johnpapa/angular-styleguide/blob/master/a1/README.md#organizing-tests)하는 규칙도 잘 적용되었습니다.


<!--
### Switching to TypeScript
-->
### TypeScript로 전환하기

<!--
Since you're going to be writing Angular code in TypeScript, it makes sense to
bring in the TypeScript compiler even before you begin upgrading.

You'll also start to gradually phase out the Bower package manager in favor
of NPM, installing all new dependencies using NPM, and eventually removing Bower from the project.

Begin by installing TypeScript to the project.

<code-example format="">
  npm i typescript --save-dev
</code-example>

Install type definitions for the existing libraries that
you're using but that don't come with prepackaged types: AngularJS, AngularJS Material, and the
Jasmine unit test framework.

For the PhoneCat app, we can install the necessary type definitions by running the following command:

<code-example format="">
  npm install @types/jasmine @types/angular @types/angular-animate @types/angular-aria @types/angular-cookies @types/angular-mocks @types/angular-resource @types/angular-route @types/angular-sanitize --save-dev
</code-example>

If you are using AngularJS Material, you can install the type definitions via:

<code-example format="">
  npm install @types/angular-material --save-dev
</code-example>

You should also configure the TypeScript compiler with a `tsconfig.json` in the project directory
as described in the [TypeScript Configuration](guide/typescript-configuration) guide.
The `tsconfig.json` file tells the TypeScript compiler how to turn your TypeScript files
into ES5 code bundled into CommonJS modules.

Finally, you should add some npm scripts in `package.json` to compile the TypeScript files to
JavaScript (based on the `tsconfig.json` configuration file):

<code-example format="">
  "scripts": {
    "tsc": "tsc",
    "tsc:w": "tsc -w",
    ...
</code-example>

Now launch the TypeScript compiler from the command line in watch mode:

<code-example format="">
  npm run tsc:w
</code-example>

Keep this process running in the background, watching and recompiling as you make changes.

Next, convert your current JavaScript files into TypeScript. Since
TypeScript is a super-set of ECMAScript 2015, which in turn is a super-set
of ECMAScript 5, you can simply switch the file extensions from `.js` to `.ts`
and everything will work just like it did before. As the TypeScript compiler
runs, it emits the corresponding `.js` file for every `.ts` file and the
compiled JavaScript is what actually gets executed. If you start
the project HTTP server with `npm start`, you should see the fully functional
application in your browser.

Now that you have TypeScript though, you can start benefiting from some of its
features. There's a lot of value the language can provide to AngularJS applications.

For one thing, TypeScript is a superset of ES2015. Any app that has previously
been written in ES5 - like the PhoneCat example has - can with TypeScript
start incorporating all of the JavaScript features that are new to ES2015.
These include things like `let`s and `const`s, arrow functions, default function
parameters, and destructuring assignments.

Another thing you can do is start adding *type safety* to your code. This has
actually partially already happened because of the AngularJS typings you installed.
TypeScript are checking that you are calling AngularJS APIs correctly when you do
things like register components to Angular modules.

But you can also start adding *type annotations* to get even more
out of TypeScript's type system. For instance, you can annotate the checkmark
filter so that it explicitly expects booleans as arguments. This makes it clearer
what the filter is supposed to do.

<code-example path="upgrade-phonecat-1-typescript/app/core/checkmark/checkmark.filter.ts" header="app/core/checkmark/checkmark.filter.ts">
</code-example>

In the `Phone` service, you can explicitly annotate the `$resource` service dependency
as an `angular.resource.IResourceService` - a type defined by the AngularJS typings.

<code-example path="upgrade-phonecat-1-typescript/app/core/phone/phone.service.ts" header="app/core/phone/phone.service.ts">
</code-example>

You can apply the same trick to the application's route configuration file in `app.config.ts`,
where you are using the location and route services. By annotating them accordingly TypeScript
can verify you're calling their APIs with the correct kinds of arguments.

<code-example path="upgrade-phonecat-1-typescript/app/app.config.ts" header="app/app.config.ts">
</code-example>
-->
Angular는 TypeScript로 구현하기 때문에 AngularJS 앱을 업그레이드하기 전에 TypeScript 컴파일러를 먼저 도입하는 방법도 고려할 수 있습니다.

그리고 의존성 패키지를 설치할 때 Bower 패키지 매니저를 사용했다면 이제는 모든 의존성 패키지를 npm으로 설치하기 때문에 최종적으로 Bower는 프로젝트에서 제거될 것입니다.

프로젝트에 TypeScript를 설치하는 것부터 시작해 봅시다.

<code-example format="">
  npm i typescript --save-dev
</code-example>

Install type definitions for the existing libraries that
you're using but that don't come with prepackaged types: AngularJS, AngularJS Material, and the
Jasmine unit test framework.

For the PhoneCat app, we can install the necessary type definitions by running the following command:

<code-example format="">
  npm install @types/jasmine @types/angular @types/angular-animate @types/angular-aria @types/angular-cookies @types/angular-mocks @types/angular-resource @types/angular-route @types/angular-sanitize --save-dev
</code-example>

If you are using AngularJS Material, you can install the type definitions via:

<code-example format="">
  npm install @types/angular-material --save-dev
</code-example>

필요한 패키지를 설치하고 나면 [TypeScript 환경 설정](guide/typescript-configuration) 가이드 문서에 따라 `tsconfig.json` TypeScript 컴파일러 환경 설정 파일을 프로젝트에 생성해야 합니다.
`tsconfig.json` 파일을 정의하면 TypeScript 문법으로 작성한 파일을 CommonJS 모듈 형식로 구성되는 ES5 코드로 변환할 수 있습니다.

그리고 `package.json` 파일에 TypeScript 파일들을 JavaScript로 변환하는 npm 스크립트를 추가합니다. 설정 파일을 지정하지 않으면 `tsconfig.json` 파일이 기본값으로 사용됩니다.:

<code-example format="">
  "scripts": {
    "tsc": "tsc",
    "tsc:w": "tsc -w",
    ...
</code-example>

그리고 커맨드창에서 다음 명령을 실행하면 TypeScript 컴파일러를 워치 모드로 실행할 수 있습니다:

<code-example format="">
  npm run tsc:w
</code-example>

이제 이 프로세스를 백그라운드에서 실행되도록 두면 소스 코드가 저장될 때마다 감지하고 다시 컴파일합니다.

다음으로 해야할 것은 JavaScript 파일을 TypeScript 문법으로 바꾸는 것입니다.
그런데 TypeScript는 ECMAScript 2015의 상위 집합(super-set)이기 때문에 파일의 확장자를 `.js`에서 `.ts`로 바꾸기만 해도 모든 코드는 이전과 동일하게 동작합니다.
그리고 위에서 실행한 TypeScript 컴파일러가 백그라운드에서 돌고 있기 때문에 `.js` 파일을 `.ts` 확장자로 바꾸는대로 다시 실행용 `.js` 파일로 컴파일됩니다.
`npm start` 명령으로 HTTP 서버를 실행하고 있다면 브라우저로 빌드 결과를 확인할 수도 있습니다.

이제 프로젝트에 TypeScript를 적용했기 때문에 이제 TypeScript 기능을 자유롭게 활용할 수 있습니다.
AngularJS 애플리케이션의 활용도는 크게 넓어질 것입니다.

다시 한 번 언급하지만 TypeScript는 ES2015의 상위집합입니다.
그래서 ES5로 작성된 앱(PhoneCat 예제 포함)을 TypeScript로 전환하면 ES2015에 새로 도입된 기능을 포함해서 JavaScript 기능을 모두 통합할 수 있습니다.
`let`이나 `const`는 물론이고 화살표 함수, 함수 인자 기본값, 비구조화 할당과 같은 문법이 이런 내용에 포함됩니다.

다른 장점은 *안전한 타입으로* 코드를 작성할 수 있다는 것입니다.
사실 이 기능은 AngularJS 타입 정의 패키지를 설치했을 때부터 이미 동작하고 있습니다.
TypeScript는 Angular 모듈에 컴포넌트가 등록될 때와 같이 AngularJS API를 사용할 때마다 이 API가 올바르게 사용되었는지 계속 검사합니다.

*타입 어노테이션(type annotation)*을 추가하면 TypeScript 타입 시스템에서 지원하는 기능 외에도 더 많은 기능을 추가할 수 있습니다.
예를 들면 체크표시 필터의 인자는 반드시 불리언 타입이라는 것을 명시하는 식입니다.
이런 정보를 추가하면 필터가 어떤 역할을 하는지 좀 더 명확하게 지정할 수 있습니다.

<code-example path="upgrade-phonecat-1-typescript/app/core/checkmark/checkmark.filter.ts" header="app/core/checkmark/checkmark.filter.ts">
</code-example>

`Phone` 서비스에서 `$resource` 의존성 패키지는 `angular.resource.IResourceService`라는 타입으로 지정되어 있습니다.
AngularJS를 위한 타입을 정의한 것입니다.

<code-example path="upgrade-phonecat-1-typescript/app/core/phone/phone.service.ts" header="app/core/phone/phone.service.ts">
</code-example>

이 방식은 애플리케이션의 라우팅 규칙을 설정하는 `app.config.ts` 파일에도 적용할 수 있습니다.
이 파일에 타입을 지정하면 API에 사용된 인자가 올바른지 검사할 수 있습니다.

<code-example path="upgrade-phonecat-1-typescript/app/app.config.ts" header="app/app.config.ts">
</code-example>


<div class="alert is-helpful">

<!--
The [AngularJS 1.x type definitions](https://www.npmjs.com/package/@types/angular)
you installed are not officially maintained by the Angular team,
but are quite comprehensive. It is possible to make an AngularJS 1.x application
fully type-annotated with the help of these definitions.

If this is something you wanted to do, it would be a good idea to enable
the `noImplicitAny` configuration option in `tsconfig.json`. This would
cause the TypeScript compiler to display a warning when there's any code that
does not yet have type annotations. You could use it as a guide to inform
us about how close you are to having a fully annotated project.
-->
[AngularJS 1.x 타입 정의 파일](https://www.npmjs.com/package/@types/angular)은 Angular 팀이 관리하는 공식 패키지가 아닙니다.
하지만 이 패키지를 활용하면 AngularJS 1.x 애플리케이션에 모든 타입을 지정할 수 있습니다.

`tsconfig.json` 옵션에 `noImplicitAny`를 사용하는 것도 좋습니다.
이 옵션을 설정하면 타입이 지정되지 않은 코드를 TypeScript 컴파일러가 발견했을 때 경고 메시지를 표시합니다.
그래서 이렇게 설정해두면 프로젝트 전체에 타입을 지정하는 작업에 가이드로 활용할 수 있습니다.

</div>

<!--
Another TypeScript feature you can make use of is *classes*. In particular, you
can turn component controllers into classes. That way they'll be a step
closer to becoming Angular component classes, which will make life
easier once you upgrade.

AngularJS expects controllers to be constructor functions. That's exactly what
ES2015/TypeScript classes are under the hood, so that means you can just plug in a
class as a component controller and AngularJS will happily use it.

Here's what the new class for the phone list component controller looks like:

<code-example path="upgrade-phonecat-1-typescript/app/phone-list/phone-list.component.ts" header="app/phone-list/phone-list.component.ts">
</code-example>

What was previously done in the controller function is now done in the class
constructor function. The dependency injection annotations are attached
to the class using a static property `$inject`. At runtime this becomes the
`PhoneListController.$inject` property.

The class additionally declares three members: The array of phones, the name of
the current sort key, and the search query. These are all things you have already
been attaching to the controller but that weren't explicitly declared anywhere.
The last one of these isn't actually used in the TypeScript code since it's only
referred to in the template, but for the sake of clarity you should define all of the
controller members.

In the Phone detail controller, you'll have two members: One for the phone
that the user is looking at and another for the URL of the currently displayed image:

<code-example path="upgrade-phonecat-1-typescript/app/phone-detail/phone-detail.component.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

This makes the controller code look a lot more like Angular already. You're
all set to actually introduce Angular into the project.

If you had any AngularJS services in the project, those would also be
a good candidate for converting to classes, since like controllers,
they're also constructor functions. But you only have the `Phone` factory
in this project, and that's a bit special since it's an `ngResource`
factory. So you won't be doing anything to it in the preparation stage.
You'll instead turn it directly into an Angular service.
-->
TypeScript 기능 중에서는 *클래스*도 활용해볼만 합니다.
컴포넌트 컨트롤러를 클래스로 전환하면 좀 더 Angular 컴포넌트 클래스에 가깝게 구현할 수 있으며, 이후에 Angular로 업그레이드하는 데에도 도움이 됩니다.

AngularJS는 컨트롤러를 생성자 함수처럼 간주하는데 이것은 ES2015/TypeScript에서 클래스가 맡는 역할과 정확히 동일하기 때문에 AngularJS에서도 클래스를 사용하는 것은 문제되지 않습니다.

이 방식으로 컴포넌트 컨트롤러를 클래스로 구현하면 다음과 같은 코드가 됩니다:

<code-example path="upgrade-phonecat-1-typescript/app/phone-list/phone-list.component.ts" header="app/phone-list/phone-list.component.ts">
</code-example>

이전에 컨트롤러 함수에 작성했던 로직을 클래스 생성자 함수에 작성해도 이전과 동일하게 동작합니다.
의존성을 주입하기 위해 `$inject`는 정적 프로퍼티로 선언했기 때문에 실행시점에는 `PhoneListController.$inject`로 접근할 수 있습니다.

그리고 이 클래스는 전화번호 목록, 정렬키 이름, 검색 쿼리 이렇게 3개의 멤버가 더 정의되어 있습니다.
이 멤버들도 이전에는 컨트롤러에 정의했던 것이지만 어디에 정의했는지는 확실하지 않을 수 있습니다.
이 때 마지막 멤버는 TypeScript 코드 중에는 아무곳에서도 사용되지 않고 템플릿에서만 사용하기 때문에 그대로 옮겨주었습니다.

Phone 상세정보 컨트롤러에는 2개의 멤버가 있습니다.
하나는 사용자가 찾으려고 하는 핸드폰 객체이며, 다른 하나는 화면에 표시될 이미지 파일의 URL입니다:

<code-example path="upgrade-phonecat-1-typescript/app/phone-detail/phone-detail.component.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

이렇게만 작성해도 컨트롤러 코드는 좀 더 Angular처럼 보입니다.
그리고 프로젝트에 Angular를 도입하기 위한 준비도 모두 끝났습니다.

AngularJS 프로젝트에 서비스가 있다면 이 서비스도 컨트롤러와 마찬가지로 클래스로 전환할만 합니다.
서비스도 생성자 함수이기 때문입니다.
다만 지금 다루는 예제 앱에서는 `Phone` 팩토리만 존재하기 때문에 준비단계에서 해야할 것은 끝났습니다.
이제부터 추가되는 서비스는 Angular로 직접 구현하면 됩니다.


<!--
### Installing Angular
-->
### Angular 설치하기

<!--
Having completed the preparation work, get going with the Angular
upgrade of PhoneCat. You'll do this incrementally with the help of
[ngUpgrade](#upgrading-with-ngupgrade) that comes with Angular.
By the time you're done, you'll be able to remove AngularJS from the project
completely, but the key is to do this piece by piece without breaking the application.

<div class="alert is-important">

The project also contains some animations.
You won't upgrade them in this version of the guide.
Turn to the [Angular animations](guide/animations) guide to learn about that.

</div>

Install Angular into the project, along with the SystemJS module loader.
Take a look at the results of the [upgrade setup instructions](guide/upgrade-setup)
and get the following configurations from there:

* Add Angular and the other new dependencies to `package.json`
* The SystemJS configuration file `systemjs.config.js` to the project root directory.

Once these are done, run:

<code-example format="">
  npm install
</code-example>

Soon you can load Angular dependencies into the application via `index.html`,
but first you need to do some directory path adjustments.
You'll need to load files from `node_modules` and the project root instead of
from the `/app` directory as you've been doing to this point.

Move the `app/index.html` file to the project root directory. Then change the
development server root path in `package.json` to also point to the project root
instead of `app`:

<code-example format="">
  "start": "http-server ./ -a localhost -p 8000 -c-1",
</code-example>

Now you're able to serve everything from the project root to the web browser. But you do *not*
want to have to change all the image and data paths used in the application code to match
the development setup. For that reason, you'll add a `<base>` tag to `index.html`, which will
cause relative URLs to be resolved back to the `/app` directory:

<code-example path="upgrade-phonecat-2-hybrid/index.html" region="base" header="index.html">
</code-example>

Now you can load Angular via SystemJS. You'll add the Angular polyfills and the
SystemJS config to the end of the `<head>` section, and then you'll use `System.import`
to load the actual application:

<code-example path="upgrade-phonecat-2-hybrid/index.html" region="angular" header="index.html">
</code-example>

You also need to make a couple of adjustments
to the `systemjs.config.js` file installed during [upgrade setup](guide/upgrade-setup).

Point the browser to the project root when loading things through SystemJS,
instead of using the `<base>` URL.

Install the `upgrade` package via `npm install @angular/upgrade --save`
and add a mapping for the `@angular/upgrade/static` package.

<code-example path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="paths" header="systemjs.config.js">
</code-example>
-->
사전작업을 마치고 나면 이제 PhoneCat 프로젝트를 Angular 버전으로 업그레이드 해봅시다.
이 과정은 [ngUpgrade](#upgrading-with-ngupgrade)를 활용해서 단계별로 작업하며, 이 과정을 끝내고 나면 프로젝트에서 AngularJS를 완전히 제거해도 됩니다.
과정을 진행하는 동안 애플리케이션이 계속 동작하도록 하나씩 전환하는 것이 가장 중요합니다.

<div class="alert is-important">

프로젝트에 애니메이션을 활용했다면 지금 당장 이 코드를 Angular 버전으로 전환하지 않아도 됩니다.
자세한 내용은 [Angular 애니메이션](guide/animations) 문서를 참고하세요.

</div>

프로젝트에 Angular를 설치하고 SystemJS 모듈 로더로 프로젝트에 로드해 봅시다.
작업을 끝낸 결과는 [업그레이드 환경 설정](guide/upgrade-setup) 문서에서 확인할 수 있으며, 이 문서에서는 이렇게 작업합니다:

* `package.json` 파일의 의존성 패키지 목록에 Angular를 추가합니다.
* 프로젝트 최상위 폴더에 SystemJS 환경설정 파일 `systemjs.config.js`를 생성합니다.

그리고 다음 명령을 실행해 봅시다:

<code-example format="">
  npm install
</code-example>

이제 Angular 패키지가 설치되었으니 `index.html` 파일로 앱을 로드할 수 있지만, 일부 폴더의 위치를 먼저 변경해두는 것이 좋습니다.
지금까지는 애플리케이션에 필요한 패키지와 파일들을 `/app` 폴더에서 로드했습니다.
이제는 `node_modules`와 프로젝트 최상위 폴더에서 로드해야 합니다.

`app/index.html` 파일을 프로젝트 루트 폴더로 옮깁니다.
그리고 `package.json`의 `start` 스크립트를 다음과 같이 수정합니다:

<code-example format="">
  "start": "http-server ./ -a localhost -p 8000 -c-1",
</code-example>

이제 프로젝트 최상위 폴더에 있는 모든 파일은 웹 브라우저로 보낼 수 있습니다.
하지만 이 작업때문에 애플리케이션 코드에 사용한 이미지 파일이나 데이터를 가리키는 경로가 변경되는 것은 아무도 원하지 *않습니다*.
그래서 `index.html` 파일에 `<base>` 태그를 추가해서 이전에 참조했던 `/app` 폴더를 그대로 가리키도록 다음 내용을 추가합니다:

<code-example path="upgrade-phonecat-2-hybrid/index.html" region="base" header="index.html">
</code-example>

이번에는 SystemJS로 Angular를 로드해 봅시다.
`<head>` 마지막에 Angular 폴리필과 SystemJS 환경설정 파일을 로드하고 `System.import`를 사용해서 애플리케이션을 로드합니다:

<code-example path="upgrade-phonecat-2-hybrid/index.html" region="angular" header="index.html">
</code-example>

필요하다면 [환경 설정](guide/upgrade-setup) 문서에서 설명하는 대로 `systemjs.config.js` 파일을 수정해서 원하는 환경을 지정할 수도 있습니다.

예를 들면 `<base>`를 사용하지 않고 SystemJS 설정으로 프로젝트 루트를 지정할 수 있습니다.

여기까지 작업하고 나면 `npm install @angular/upgrade --save` 명령을 실행해서 `upgrade` 새키지를 설치하고 이 패키지를 `@angular/upgrade/static`으로 맵핑합니다.

<code-example path="upgrade-phonecat-2-hybrid/systemjs.config.1.js" region="paths" header="systemjs.config.js">
</code-example>


<!--
### Creating the _AppModule_
-->
### _AppModule_ 생성하기

<!--
Now create the root `NgModule` class called `AppModule`.
There is already a file named `app.module.ts` that holds the AngularJS module.
Rename it to `app.module.ajs.ts` and update the corresponding script name in the `index.html` as well.
The file contents remain:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ajs.ts" header="app.module.ajs.ts">
</code-example>

Now create a new `app.module.ts` with the minimum `NgModule` class:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="bare" header="app.module.ts">
</code-example>
-->
이제 최상위 `NgModule`인 `AppModule` 클래스를 생성해 봅시다.
지금 작업하고 있는 앱에는 `app.module.ts` 파일에 모듈이 정의되어 있습니다.
이 파일의 이름을 `app.module.ajs.ts`로 변경하고 이 파일을 로드하는 `index.html` 파일도 수정합니다.
이 파일은 이렇게 작성되어 있습니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ajs.ts" header="app.module.ajs.ts">
</code-example>

이제 새로운 `app.module.ts` 파일을 만들고 최소한의 코드로 다음과 같은 `NgModule` 클래스를 정의합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="bare" header="app.module.ts">
</code-example>


<!--
### Bootstrapping a hybrid PhoneCat
-->
### 하이브리드 프로젝트 부트스트랩하기

<!--
Next, you'll bootstrap the application as a *hybrid application*
that supports both AngularJS and Angular components. After that,
you can start converting the individual pieces to Angular.

The application is currently bootstrapped using the AngularJS `ng-app` directive
attached to the `<html>` element of the host page. This will no longer work in the hybrid
app. Switch to the [ngUpgrade bootstrap](#bootstrapping-hybrid-applications) method
instead.

First, remove the `ng-app` attribute from `index.html`.
Then import `UpgradeModule` in the `AppModule`, and override its `ngDoBootstrap` method:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="upgrademodule" header="app/app.module.ts">
</code-example>

Note that you are bootstrapping the AngularJS module from inside `ngDoBootstrap`.
The arguments are the same as you would pass to `angular.bootstrap` if you were manually
bootstrapping AngularJS: the root element of the application; and an array of the
AngularJS 1.x modules that you want to load.

Finally, bootstrap the `AppModule` in `app/main.ts`.
This file has been configured as the application entrypoint in `systemjs.config.js`,
so it is already being loaded by the browser.

<code-example path="upgrade-phonecat-2-hybrid/app/main.ts" region="bootstrap" header="app/main.ts">
</code-example>

Now you're running both AngularJS and Angular at the same time. That's pretty
exciting! You're not running any actual Angular components yet. That's next.
-->
이번에는 AngularJS 컴포넌트와 Angular 컴포넌트가 모두 동작하는 *하이브리드 애플리케이션* 을 부트스트랩 해 봅시다.
이 과정을 끝내고 나면 AngularJS 컴포넌트를 하나씩 Angular로 전환할 준비는 모두 끝납니다.

지금까지는 AngularJS `ng-app` 디렉티브를 `<html>` 엘리먼트에 붙이는 방식으로 앱을 부트스트랩했지만 하이브리드 앱은 이제 이 방식을 사용하지 않습니다.
[ngUpgrade bootstrap](#bootstrapping-hybrid-applications) 메소드를 사용하는 방식으로 바꿔봅시다.

먼저 `index.html` 파일에서 `ng-app` 어트리뷰트를 제거합니다.
그리고 `AppModule`에 `UpgradeModule`을 로드하고 `ngDoBootstrap` 메소드를 다음과 같이 오버라이드합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="upgrademodule" header="app/app.module.ts">
</code-example>

`ngDoBootstrap` 메소드 안에서 부트스트랩 하는 것은 AngularJS 모듈이라는 것을 명심하세요.
그리고 `upgrade.bootstrap` 메소드에 전달하는 인자는 AngularJS 앱을 수동으로 부트스트랩할 때 사용했던 `angular.bootstrap` 메소드의 인자와 같습니다.
첫번째 인자는 애플리케이션이 들어갈 엘리먼트이며, 두번째 인자는 로드하려는 AngularJS 1.x 모듈을 배열로 전달합니다.

그리고 이제 `app/main.ts` 파일에서 `AppModule`을 부트스트랩합니다.
이 파일은 `systemjs.config.js`에서 애플리케이션의 진입점으로 브라우저가 로드하는 파일입니다.

<code-example path="upgrade-phonecat-2-hybrid/app/main.ts" region="bootstrap" header="app/main.ts">
</code-example>

이제 AngularJS와 Angular가 동시에 실행됩니다.
대단하네요!
이제 Angular 컴포넌트를 만들어 봅시다.

<div class="alert is-helpful">

<!--
#### Why declare _angular_ as _angular.IAngularStatic_?
-->
#### 왜 _angular_ 를 _angular.IAngularStatic_ 으로 선언할까요?

<!--
`@types/angular` is declared as a UMD module, and due to the way
<a href="https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#support-for-umd-module-definitions">UMD typings</a>
work, once you have an ES6 `import` statement in a file all UMD typed modules must also be
imported via `import` statements instead of being globally available.

AngularJS is currently loaded by a script tag in `index.html`, which means that the whole app
has access to it as a global and uses the same instance of the `angular` variable.
If you used `import * as angular from 'angular'` instead, you'd also have to
load every file in the AngularJS app to use ES2015 modules in order to ensure AngularJS was being
loaded correctly.

This is a considerable effort and it often isn't worth it, especially since you are in the
process of moving your code to Angular.
Instead, declare `angular` as `angular.IAngularStatic` to indicate it is a global variable
and still have full typing support.
-->
`@types/angular`는 UMD 모듈 포맷으로 선언되어 있으며 <a href="https://github.com/Microsoft/TypeScript/wiki/What's-new-in-TypeScript#support-for-umd-module-definitions">UMD 모듈 스펙</a>에 따라 ES6 `import` 구문을 쓰는 파일이 있으면 모든 UMD 타입의 모듈은 `import` 구문으로 로드됩니다.

그리고 지금까지 작업한 앱에서 AngularJS는 `index.html` 파일에서 스크립트 태그로 로드되고 있기 때문에 앱 전역에서 `angular`라는 변수로 AngularJS에 접근할 수 있습니다.
그래서 `import * as angular from 'angular'`라고 구현하면 AngularJS 앱에 있는 모든 파일을 ES2015 모듈 방식으로 순서대로 로드해야 합니다.

이 작업은 수고가 많이 들지만 그에 비해 얻는 것이 없습니다.
중요한 것은 AngularJS로 작성한 코드를 Angular로 옮기는 것이지 모듈을 로드하는 올바른 순서를 따지는 것이 아닙니다.
`angular`를 `angular.IAngularStatic`으로 선언하면 이 과정을 간단하게 처리할 수 있습니다.

</div>

<!--
### Upgrading the Phone service
-->
### Phone 서비스 업그레이드하기

<!--
The first piece you'll port over to Angular is the `Phone` service, which
resides in `app/core/phone/phone.service.ts` and makes it possible for components
to load phone information from the server. Right now it's implemented with
ngResource and you're using it for two things:

* For loading the list of all phones into the phone list component.
* For loading the details of a single phone into the phone detail component.

You can replace this implementation with an Angular service class, while
keeping the controllers in AngularJS land.

In the new version, you import the Angular HTTP module and call its `HttpClient` service instead of `ngResource`.

Re-open the `app.module.ts` file, import and add `HttpClientModule` to the `imports` array of the `AppModule`:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="httpclientmodule" header="app.module.ts">
</code-example>

Now you're ready to upgrade the Phone service itself. Replace the ngResource-based
service in `phone.service.ts` with a TypeScript class decorated as `@Injectable`:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="classdef" header="app/core/phone/phone.service.ts (skeleton)"></code-example>

The `@Injectable` decorator will attach some dependency injection metadata
to the class, letting Angular know about its dependencies. As described
by the [Dependency Injection Guide](guide/dependency-injection),
this is a marker decorator you need to use for classes that have no other
Angular decorators but still need to have their dependencies injected.

In its constructor the class expects to get the `HttpClient` service. It will
be injected to it and it is stored as a private field. The service is then
used in the two instance methods, one of which loads the list of all phones,
and the other loads the details of a specified phone:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="fullclass" header="app/core/phone/phone.service.ts">
</code-example>

The methods now return observables of type `PhoneData` and `PhoneData[]`. This is
a type you don't have yet. Add a simple interface for it:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="phonedata-interface" header="app/core/phone/phone.service.ts (interface)"></code-example>

`@angular/upgrade/static` has a `downgradeInjectable` method for the purpose of making
Angular services available to AngularJS code. Use it to plug in the `Phone` service:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="downgrade-injectable" header="app/core/phone/phone.service.ts (downgrade)"></code-example>

Here's the full, final code for the service:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" header="app/core/phone/phone.service.ts">
</code-example>

Notice that you're importing the `map` operator of the RxJS `Observable` separately.
Do this for every RxJS operator.

The new `Phone` service has the same features as the original, `ngResource`-based service.
Because it's an Angular service, you register it with the `NgModule` providers:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phone" header="app.module.ts">
</code-example>

Now that you are loading `phone.service.ts` through an import that is resolved
by SystemJS, you should **remove the &lt;script&gt; tag** for the service from `index.html`.
This is something you'll do to all components as you upgrade them. Simultaneously
with the AngularJS to Angular upgrade you're also migrating code from scripts to modules.

At this point, you can switch the two components to use the new service
instead of the old one. While you `$inject` it as the downgraded `phone` factory,
it's really an instance of the `Phone` class and you annotate its type accordingly:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ajs.ts" header="app/phone-list/phone-list.component.ts">
</code-example>

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.ajs.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

Now there are two AngularJS components using an Angular service!
The components don't need to be aware of this, though the fact that the
service returns observables and not promises is a bit of a giveaway.
In any case, what you've achieved is a migration of a service to Angular
without having to yet migrate the components that use it.

<div class="alert is-helpful">

You could use the `toPromise` method of `Observable` to turn those
observables into promises in the service. In many cases that reduce
the number of changes to the component controllers.

</div>
-->
AngularJS 구성요소 중에 가장 먼저 Angular로 전환할 것은 `Phone` 서비스입니다.
이 서비스는 `app/core/phone/phone.service.ts` 파일에 정의되어 있으며 컴포넌트가 서버에서 스마트폰 정보를 가져올 때 사용합니다.
그리고 AngularJS 버전에서 이 서비스는 ngResource를 사용하는 방식으로 구현되어 있으며 다음 두가지 기능을 제공합니다:

* 스마트폰 목록을 제공합니다. 이 데이터는 스마트폰 목록을 표시하는 컴포넌트에서 사용합니다.
* 스마트폰의 상세정보를 제공합니다. 이 데이터는 스마트폰 상세정보를 표시하는 컴포넌트에서 사용합니다.

이 기능을 Angular 서비스로 대체해 봅시다.
일단 AngularJS에는 컨트롤러를 그대로 남겨둔 채로 Angular 서비스 클래스를 정의합니다.

새로 만드는 Angular 서비스에서는 `ngResource` 대신 Angular HTTP 모듈이 제공하는 `HttpClient` 서비스를 사용합니다.

`app.module.ts` 파일을 열고 `AppModule`의 `imports` 배열에 `HttpClientModule`을 추가합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="httpclientmodule" header="app.module.ts">
</code-example>

이제는 Phone 서비스를 업그레이드할 준비가 끝났습니다.
`phone.service.ts` 파일에 ngResource를 사용하도록 구현된 서비스를 TypeScript 클래스로 다시 정의하는데, 이 때 `@Injectable` 데코레이터를 함께 사용합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="classdef" header="app/core/phone/phone.service.ts (기본 코드)"></code-example>

클래스에 `@Injectable` 데코레이터를 붙이면 이 클래스가 의존성으로 주입되는 서비스라는 것을 Angular가 인식할 수 있습니다.
[의존성 주입](guide/dependency-injection) 문서에서 설명한 것처럼 `@Injectable` 데코레이터는 이 클래스에 의존성 객체를 주입하려는 용도가 아니라 이 클래스가 다른 곳에 의존성으로 주입된다는 것을 표시하는 데코레이터입니다.

클래스에 `HttpClient` 서비스가 필요하다면 클래스 생성자에서 이 서비스를 요청하면 됩니다.
그러면 Angular가 적절한 의존성 객체의 인스턴스를 찾아서 주입라며 클래스의 `private` 멤버로 할당할 수 있습니다.
스마트폰의 목록을 불러오거나 특정 스마트폰의 상세정보를 요청하는 기능은 이전과 비슷하게 구현합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="fullclass" header="app/core/phone/phone.service.ts">
</code-example>

이제는 메소드가 반환하는 `PhoneData`와 `PhoneData[]`가 옵저버블 타입입니다.
그리고 `PhoneData`는 아직 정의되지 않았기 때문에 다음과 같이 간단하게 인터페이스로 정의합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="phonedata-interface" header="app/core/phone/phone.service.ts (인터페이스)"></code-example>

`@angular/upgrade/static` 패키지가 제공하는 `downgradeInjectable` 메소드를 사용하면 Angular 서비스를 AngularJS 용으로 다운그레이드 할 수 있습니다.
이 메소드를 사용해서 `Phone` 서비스를 연결합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" region="downgrade-injectable" header="app/core/phone/phone.service.ts (다운그레이드)"></code-example>

이제 `Phone` 서비스를 Angular 버전으로 새로 작성한 코드는 이렇습니다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.ts" header="app/core/phone/phone.service.ts">
</code-example>

새롭게 만든 `Phone` 서비스는 이전에 `ngResource`를 활용하던 서비스와 동일하게 동작합니다.
이렇게 만든 서비스를 `NgModule` 프로바이더에 등록합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phone" header="app.module.ts">
</code-example>

이제는 SystemJS로 `phone.service.ts` 파일을 불러오기 때문에 `index.html`에서 서비스를 **&lt;script&gt;로 로드하던 코드를 제거해도**, Angular 버전으로 구현한 서비스를 사용할 수 있습니다.

AngularJS 컴포넌트가 Angular로 구현한 서비스를 활용할 수 있도록 관련 컴포넌트 2개를 수정해 봅시다.
컴포넌트 안쪽에서는 `$inject`를 사용해서 다운그레이드한 `phone` 팩토리를 사용하지만, 이렇게 주입되는 서비스는 새로 만든 `Phone` 클래스의 인스턴스가 될 것입니다. 생성자에 이 클래스의 타입을 명확하게 명시해 줍니다:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ajs.ts" header="app/phone-list/phone-list.component.ts">
</code-example>

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.ajs.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

이제 AngularJS 컴포넌트 2개는 Angular 서비스를 사용합니다!
그리고 컴포넌트는 이 서비스의 구현방식을 신경쓸 필요가 없으며 이 서비스가 반환하는 데이터의 타입이 이제는 프로미스가 아니라 옵저버블이라는 것만 신경쓰면 됩니다.
AngularJS 앱을 업그레이드 할 때는 컴포넌트를 마이그레이션하기 전에 서비스부터 먼저 작업하는 것이 좋습니다.


<div class="alert is-helpful">

서비스가 반환하는 옵저버블 타입을 프로미스 타입으로 변환하려면 `toPromise` 메소드를 사용하는 방법도 있습니다.
컴포넌트 코드를 아직 수정하지 않으려면 이 메소드를 사용하는 것도 고려해볼만 합니다.

</div>

<!--
### Upgrading Components
-->
### 컴포넌트 업그레이드하기

<!--
Upgrade the AngularJS components to Angular components next.
Do it one component at a time while still keeping the application in hybrid mode.
As you make these conversions, you'll also define your first Angular *pipes*.

Look at the phone list component first. Right now it contains a TypeScript
controller class and a component definition object. You can morph this into
an Angular component by just renaming the controller class and turning the
AngularJS component definition object into an Angular `@Component` decorator.
You can then also remove the static `$inject` property from the class:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="initialclass" header="app/phone-list/phone-list.component.ts">
</code-example>

The `selector` attribute is a CSS selector that defines where on the page the component
should go. In AngularJS you do matching based on component names, but in Angular you
have these explicit selectors. This one will match elements with the name `phone-list`,
just like the AngularJS version did.

Now convert the template of this component into Angular syntax.
The search controls replace the AngularJS `$ctrl` expressions
with Angular's two-way `[(ngModel)]` binding syntax:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.template.html" region="controls" header="app/phone-list/phone-list.template.html (search controls)"></code-example>

Replace the list's `ng-repeat` with an `*ngFor` as
[described in the Template Syntax page](guide/built-in-directives).
Replace the image tag's `ng-src` with a binding to the native `src` property.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.template.html" region="list" header="app/phone-list/phone-list.template.html (phones)"></code-example>
-->
이번에는 AngularJS 컴포넌트를 Angular 컴포넌트로 업그레이드 해봅시다.
이 작업은 애플리케이션이 하이브리드 모드로 계속 실행되는 것을 유지하기 위해 한 번에 컴포넌트 하나씩 진행합니다.
가장 먼저 업그레이드할 부분을 찾아봅시다.

스마트폰 목록 컴포넌트를 봅시다.
이 컴포넌트는 TypeScript 컨트롤러 클래스와 컴포넌트를 정의하는 객체로 구성되어 있는데, 이 코드에서 컨트롤러 클래스의 이름을 바꾸고 컴포넌트 정의 객체를 Angular `@Component` 데코레이터로 바꾸기만 하면 이 컴포넌트는 Angular 컴포넌트가 됩니다.
그리고 나서 클래스에 정적으로 선언된 `$inject` 프로퍼티를 제거하면 됩니다:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="initialclass" header="app/phone-list/phone-list.component.ts">
</code-example>

`selector` 어트리뷰트는 컴포넌트가 화면에서 어느 부분에 위치할지 지정하는 CSS 셀렉터입니다.
이 셀렉터는 AngularJS에서 컴포넌트 이름과 매칭되는 것을 그대로 사용했지만 Angular에서는 명시적으로 지정해 줘야 합니다.
AngularJS 버전과 동일하게 `phone-list`라는 이름을 지정해 줍시다.

그리고 컴포넌트 템플릿을 Angular 문법으로 변경합니다.
AngularJS의 `$ctrl`를 사용하는 표현식을 Angular의 양방향 바인딩 문법 `[(ngModel)]`로 변경합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.template.html" region="controls" header="app/phone-list/phone-list.template.html (검색 컨트롤)"></code-example>

`ng-repeat`을 사용한 부분은 `*ngFor`로 변경합니다.
`*ngFor`를 사용하는 방법은 [기본 디렉티브](guide/built-in-directives) 가이드 문서를 참고하세요.
그리고 이미지 태그의 `ng-src`도 `src` 프로퍼티로 변경합니다.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.template.html" region="list" header="app/phone-list/phone-list.template.html (스마트폰 목록 템플릿)"></code-example>


<!--
#### No Angular _filter_ or _orderBy_ filters
-->
#### Angular에는 _filter_, _orderBy_ 필터가 없습니다.

<!--
The built-in AngularJS `filter` and `orderBy` filters do not exist in Angular,
so you need to do the filtering and sorting yourself.

You replaced the `filter` and `orderBy` filters with bindings to the `getPhones()` controller method,
which implements the filtering and ordering logic inside the component itself.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="getphones" header="app/phone-list/phone-list.component.ts">
</code-example>

Now you need to downgrade the Angular component so you can use it in AngularJS.
Instead of registering a component, you register a `phoneList` *directive*,
a downgraded version of the Angular component.

The `as angular.IDirectiveFactory` cast tells the TypeScript compiler
that the return value of the `downgradeComponent` method is a directive factory.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="downgrade-component" header="app/phone-list/phone-list.component.ts">
</code-example>

The new `PhoneListComponent` uses the Angular `ngModel` directive, located in the `FormsModule`.
Add the `FormsModule` to `NgModule` imports, declare the new `PhoneListComponent` and
finally add it to `entryComponents` since you downgraded it:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phonelist" header="app.module.ts">
</code-example>

Remove the &lt;script&gt; tag for the phone list component from `index.html`.

Now set the remaining `phone-detail.component.ts` as follows:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

This is similar to the phone list component.
The new wrinkle is the `RouteParams` type annotation that identifies the `routeParams` dependency.

The AngularJS injector has an AngularJS router dependency called `$routeParams`,
which was injected into `PhoneDetails` when it was still an AngularJS controller.
You intend to inject it into the new `PhoneDetailsComponent`.

Unfortunately, AngularJS dependencies are not automatically available to Angular components.
You must upgrade this service via a [factory provider](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)
to make `$routeParams` an Angular injectable.
Do that in a new file called `ajs-upgraded-providers.ts` and import it in `app.module.ts`:

<code-example path="upgrade-phonecat-2-hybrid/app/ajs-upgraded-providers.ts" header="app/ajs-upgraded-providers.ts">
</code-example>

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="routeparams" header="app/app.module.ts ($routeParams)"></code-example>

Convert the phone detail component template into Angular syntax as follows:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.template.html" header="app/phone-detail/phone-detail.template.html">
</code-example>

There are several notable changes here:

* You've removed the `$ctrl.` prefix from all expressions.

* You've replaced `ng-src` with property
  bindings for the standard `src` property.

* You're using the property binding syntax around `ng-class`. Though Angular
  does have [a very similar `ngClass`](guide/built-in-directives)
  as AngularJS does, its value is not magically evaluated as an expression.
  In Angular, you always specify in the template when an attribute's value is
  a property expression, as opposed to a literal string.

* You've replaced `ng-repeat`s with `*ngFor`s.

* You've replaced `ng-click` with an event binding for the standard `click`.

* You've wrapped the whole template in an `ngIf` that causes it only to be
  rendered when there is a phone present. You need this because when the component
  first loads, you don't have `phone` yet and the expressions will refer to a
  non-existing value. Unlike in AngularJS, Angular expressions do not fail silently
  when you try to refer to properties on undefined objects. You need to be explicit
  about cases where this is expected.

Add `PhoneDetailComponent` component to the `NgModule` _declarations_ and _entryComponents_:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phonedetail" header="app.module.ts">
</code-example>

You should now also remove the phone detail component &lt;script&gt; tag from `index.html`.
-->
AngularJS가 제공하는 `filter`나 `orderBy` 필터는 Angular에 존재하지 않습니다.
이 기능은 개발자가 직접 구현해야 합니다.

이 예제에서는 두 필터의 기능을 컨트롤러 메소드 중 `getPhones()`에 구현해 봅시다.
데이터를 필터링하고 정렬하는 로직을 컴포넌트 안에 두기 위한 의도입니다.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="getphones" header="app/phone-list/phone-list.component.ts">
</code-example>

그러면 이제 Angular 컴포넌트를 다운그레이드 하면 AngularJS에도 사용할 수 잇습니다.
이 문서에서는 AngularJS의 컴포넌트로 등록하지 않고 `phoneList` *디렉티브*로 등록해 봅시다.

`as angular.IDirectiveFactory`라는 코드는 `downgradeComponent` 메소드가 반환한 결과물이 디렉티브 팩토리라는 것을 TypeScript 컴파일러에게 알려주기 위한 코드입니다.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.ts" region="downgrade-component" header="app/phone-list/phone-list.component.ts">
</code-example>

새로 만든 `PhoneListComponent`는 Angular `FormsModule`이 제공하는 `ngModel` 디렉티브를 활용합니다.
그래서 `FormsModule`을 `NgModule`의 `imports` 배열에 추가하고 `entryComponents`에 `PhoneListComponent`를 추가하면 컴포넌트 다운그레이드가 끝납니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phonelist" header="app.module.ts">
</code-example>

`index.html`에서 스마트폰 목록 컴포넌트를 로드하는 &lt;script&gt; 태그를 제거하세요.

그리고 `phone-detail.component.ts` 파일도 같은 방식으로 처리합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

이 컴포넌트는 스마트폰 목록을 표시하는 컴포넌트와 비슷합니다.
`RouteParams` 타입으로 받은 의존성 객체를 `routeParams` 프로퍼티로 받는다는 점이 가장 큰 차이입니다.

AngularJS에는 `routeParams`이라는 의존성 객체가 있는데 이 객체는 AngularJS 버전의 `PhoneDetails` 컴포넌트 컨트롤러에서 라우터와 관련된 기능을 활용하기 위해 주입받는 객체입니다.
새로 만든 `PhoneDetailsComponent`에도 이 의존성 객체를 주입해 봅시다.

하지만 AngularJS에서 활용하는 의존성 객체들을 Angular 컴포넌트에 그대로 사용할 수 있는 것은 아닙니다.
`$routeParams`를 Angular에 의존성으로 주입하려면 [팩토리 프로바이더](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)를 사용해서 이 서비스를 업그레이드해야 합니다.
이 동작은 `ajs-upgraded-providers.ts`라는 파일을 새로 만들어서 구현하고, `app.module.ts`이 불러오도록 구현해 봅시다:

<code-example path="upgrade-phonecat-2-hybrid/app/ajs-upgraded-providers.ts" header="app/ajs-upgraded-providers.ts">
</code-example>

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="routeparams" header="app/app.module.ts ($routeParams)"></code-example>

그리고 스마트폰 상세정보 컴포넌트의 템플릿을 Angular 문법으로 변환합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.template.html" header="app/phone-detail/phone-detail.template.html">
</code-example>

변경사항 중에서 이런 내용을 주의깊게 봅시다:

* 모든 표현식에서 `$ctrl.` 접두사를 제거했습니다.

* 프로퍼티 바인딩에 사용된 `ng-src`는 표준 프로퍼티 `src`를 바인딩하는 방식으로 변경했습니다.

* AngularJS에서는 클래스를 바인딩하기 위해 `ng-class`를 사용했습니다.
이 코드는 Angular에서 [거의 비슷한 동작을 하는 `ngClass`](guide/built-in-directives)로 변경되었으며 사용법도 비슷합니다.
그리고 표현식이 실행된 결과는 객체이기 때문에 프로퍼티 바인딩으로 연결했습니다.

* `ng-repeat`은 `*ngFor`로 변경했습니다.

* `ng-click`은 표준 이벤트 `click`으로 변경되었습니다.

* 스마트폰 객체가 유효할 때만 화면을 렌더링하기 위해 템플릿 전체는 `ngIf`로 감쌌습니다.
컴포넌트가 처음 로드된 시점에는 `phone`이 존재하지 않기 때문에 빈값을 참조하는 표현식이 모두 제대로 실행되지 않습니다.
AngularJS와는 다르게 Angular 표현식은 빈 객체를 참조할 때 에러를 출력하기 때문에, 실제로 객체가 존재할 때만 표현식을 실행하기 위해 작성했습니다.

그리고 `PhoneDetailComponent`를 `NgModule`의 _declarations_ 와 _entryComponents_ 에 추가합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="phonedetail" header="app.module.ts">
</code-example>

이제는 이전과 마찬가지로 `index.html`에서 컴포넌트 파일을 불러오던 &lt;script&gt; 태그를 제거해도 됩니다.


<!--
#### Add the _CheckmarkPipe_
-->
#### _CheckmarkPipe_ 변환하기

<!--
The AngularJS directive had a `checkmark` _filter_.
Turn that into an Angular **pipe**.

There is no upgrade method to convert filters into pipes.
You won't miss it.
It's easy to turn the filter function into an equivalent Pipe class.
The implementation is the same as before, repackaged in the `transform` method.
Rename the file to `checkmark.pipe.ts` to conform with Angular conventions:

<code-example path="upgrade-phonecat-2-hybrid/app/core/checkmark/checkmark.pipe.ts" header="app/core/checkmark/checkmark.pipe.ts"></code-example>

Now import and declare the newly created pipe and
remove the filter &lt;script&gt; tag from `index.html`:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="checkmarkpipe" header="app.module.ts">
</code-example>
-->
AngularJS 프로젝트에 정의된 디렉티브 중에는 `checkmark`라는 _필터_ 가 있습니다.
이 필터를 Angular **파이프**로 변환해 봅시다.

AngularJS 필터를 Angular 파이프로 변환하는 메소드는 따로 지원되지 않지만 이 과정은 간단합니다.
필터 함수를 파이프 클래스로 새로 구현하면 됩니다.
그리고 이 때 Angular 파이프 클래스에 `PipeTransform` 클래스를 확장해서 `transform` 메소드를 정의하면 됩니다.
Angular 스타일에 맞게 파이프 파일의 이름을 `checkmark.pipe.ts`로 바꾸고 다음과 같이 수정해 봅시다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/checkmark/checkmark.pipe.ts" header="app/core/checkmark/checkmark.pipe.ts"></code-example>

그리고 이렇게 만든 파이프는 `AppModule`에 등록해서 로드하기 때문에 `index.html` 파일에서 필터를 로드하는 &lt;script&gt; 부분은 제거해도 됩니다:

<code-example path="upgrade-phonecat-2-hybrid/app/app.module.ts" region="checkmarkpipe" header="app.module.ts">
</code-example>


<!--
### AOT compile the hybrid app
-->
### 하이브리드 앱을 AOT 컴파일하기

<!--
To use AOT with a hybrid app, you have to first set it up like any other Angular application,
as shown in [the Ahead-of-time Compilation chapter](guide/aot-compiler).

Then change `main-aot.ts` to bootstrap the `AppComponentFactory` that was generated
by the AOT compiler:

<code-example path="upgrade-phonecat-2-hybrid/app/main-aot.ts" header="app/main-aot.ts">
</code-example>

You need to load all the AngularJS files you already use in `index.html` in `aot/index.html`
as well:

<code-example path="upgrade-phonecat-2-hybrid/aot/index.html" header="aot/index.html">
</code-example>

These files need to be copied together with the polyfills. The files the application
needs at runtime, like the `.json` phone lists and images, also need to be copied.

Install `fs-extra` via `npm install fs-extra --save-dev` for better file copying, and change
`copy-dist-files.js` to the following:

<code-example path="upgrade-phonecat-2-hybrid/copy-dist-files.js" header="copy-dist-files.js">
</code-example>

And that's all you need to use AOT while upgrading your app!
-->
하이브리드 앱을 AOT 컴파일하려면 [AOT 컴파일러 챕터](guide/aot-compiler)에서 설명한 것처럼 Angular 애플리케이션 빌드 환경을 설정해야 합니다.

그리고 AOT 컴파일러가 만든 `ApPComponentFactory`를 부트스트랩하도록 `main-aot.ts` 파일을 수정합니다:

<code-example path="upgrade-phonecat-2-hybrid/app/main-aot.ts" header="app/main-aot.ts">
</code-example>

그 다음에는 `index.html`에서 로드하던 AngularJS 파일을 모두 `aot/index.html` 파일에 추가합니다:

<code-example path="upgrade-phonecat-2-hybrid/aot/index.html" header="aot/index.html">
</code-example>

AngularJS 코드가 담긴 파일들과 폴리필을 `aot` 프로젝트 폴더에 복사합니다.
그리고 애플리케이션이 실행되면서 필요한 스마트폰 목록이 담긴 `.json` 파일이나 이미지 파일도 함께 복사해야 합니다.

`npm install fs-extra --save-dev` 명령을 실행해서 `fs-extra` 패키지를 설치하면 파일 복사 과정을 쉽게 처리할 수 있습니다.
`copy-dist-files.js` 파일을 이렇게 작성하면 됩니다:

<code-example path="upgrade-phonecat-2-hybrid/copy-dist-files.js" header="copy-dist-files.js">
</code-example>

이제 애플리케이션에 AOT 컴파일러를 적용할 수 있습니다!


<!--
### Adding The Angular Router And Bootstrap
-->
### Angular 라우터 추가하고 부트스트랩하기

<!--
At this point, you've replaced all AngularJS application components with
their Angular counterparts, even though you're still serving them from the AngularJS router.
-->
여기까지 AngularJS 애플리케이션의 모든 컴포넌트를 Angular로 변환했지만 아직 애플리케이션은 AngularJS 라우터를 사용하고 있습니다.


<!--
#### Add the Angular router
-->
#### Angular 라우터 추가하기

<!--
Angular has an [all-new router](guide/router).

Like all routers, it needs a place in the UI to display routed views.
For Angular that's the `<router-outlet>` and it belongs in a *root component*
at the top of the applications component tree.

You don't yet have such a root component, because the app is still managed as an AngularJS app.
Create a new `app.component.ts` file with the following `AppComponent` class:

<code-example path="upgrade-phonecat-3-final/app/app.component.ts" header="app/app.component.ts">
</code-example>

It has a simple template that only includes the `<router-outlet>`.
This component just renders the contents of the active route and nothing else.

The selector tells Angular to plug this root component into the `<phonecat-app>`
element on the host web page when the application launches.

Add this `<phonecat-app>` element to the `index.html`.
It replaces the old AngularJS `ng-view` directive:

<code-example path="upgrade-phonecat-3-final/index.html" region="appcomponent" header="index.html (body)"></code-example>
-->
Angular가 제공하는 라우터는 [이전과 완전히 다른 라우터](guide/router) 입니다.

그리고 다른 라우터들과 마찬가지로 Angular 라우터를 사용할 때도 화면에 라우팅된 화면을 표시할 부분을 지정해야 합니다.
Angular에서는 이 영역을 `<router-outlet>`으로 지정하는데, 최상위 라우팅 영역은 애플리케이션 컴포넌트 트리의 *최상위 컴포넌트*에 추가하는 것이 일반적입니다.

하지만 아직까지는 AngularJS 애플리케이션이 화면을 전환하기 때문에 최상위 컴포넌트가 없다고 볼 수 있습니다.
`app.component.ts` 파일을 생성하고 이 파일에 `AppComponent` 클래스를 다음과 같이 정의합니다:

<code-example path="upgrade-phonecat-3-final/app/app.component.ts" header="app/app.component.ts">
</code-example>

이 컴포넌트 템플릿에는 `<router-outlet>`만 간단하게 존재합니다.
왜냐하면 이 컴포넌트는 활성화되는 라우팅 규칙과 연결되는 컴포넌트를 표시하는 것 외에 다른 역할을 하지 않기 때문입니다.

그리고 셀렉터에 `phonecat-app`을 지정했기 때문에 이 최상위 컴포넌트는 애플리케이션이 실행되는 호스트 웹 페이지의 `<phonecat-app>`에 렌더링됩니다.

`index.html` 파일에 `<phonecat-app>` 엘리먼트를 추가하고 이전에 있던 AngularJS `ng-view` 디렉티브를 제거합니다:

<code-example path="upgrade-phonecat-3-final/index.html" region="appcomponent" header="index.html (body)"></code-example>


<!--
#### Create the _Routing Module_
-->
#### _라우팅 모듈_ 생성하기

<!--
A router needs configuration whether it's the AngularJS or Angular or any other router.

The details of Angular router configuration are best left to the [Routing documentation](guide/router)
which recommends that you create a `NgModule` dedicated to router configuration
(called a _Routing Module_).

<code-example path="upgrade-phonecat-3-final/app/app-routing.module.ts" header="app/app-routing.module.ts">
</code-example>

This module defines a `routes` object with two routes to the two phone components
and a default route for the empty path.
It passes the `routes` to the `RouterModule.forRoot` method which does the rest.

A couple of extra providers enable routing with "hash" URLs such as `#!/phones`
instead of the default "push state" strategy.

Now update the `AppModule` to import this `AppRoutingModule` and also the
declare the root `AppComponent` as the bootstrap component.
That tells Angular that it should bootstrap the app with the _root_ `AppComponent` and
insert its view into the host web page.

You must also remove the bootstrap of the AngularJS module from `ngDoBootstrap()` in `app.module.ts`
and the `UpgradeModule` import.

<code-example path="upgrade-phonecat-3-final/app/app.module.ts" header="app/app.module.ts">
</code-example>

And since you are routing to `PhoneListComponent` and `PhoneDetailComponent` directly rather than
using a route template with a `<phone-list>` or `<phone-detail>` tag, you can do away with their
Angular selectors as well.
-->
AngularJS, Angular에 관계없이 라우터는 환경설정이 필요합니다.

그리고 Angular 라우터 설정은 [라우팅 문서](guide/router)에서 설명하는 것처럼 라우터와 관련된 설정을 따로 모아 _라우팅 모듈_ 을 선언하는 방식을 권장합니다.

<code-example path="upgrade-phonecat-3-final/app/app-routing.module.ts" header="app/app-routing.module.ts">
</code-example>

이 모듈에는 URL과 컴포넌트를 연결하는 라우팅 규칙 2개와 빈 주소로 접근했을 때 기본 주소로 이동하는 라우팅 규칙이 `routes` 객체에 할당되어 있습니다.
이 객체는 `RouterModule.forRoot` 메소드에 전달되어 애플리케이션 전체 라우팅 규칙을 정의할 것입니다.

이 코드에 사용된 프로바이더는 기본 로케이션 정책 대신 `#!/phones`와 같은 해시 URL을 사용하기 위해 등록한 것입니다.

이제 `AppModule`에 `AppRoutingModule`을 로드하고 _최상위_ 컴포넌트인 `AppComponent`를 부트스트랩하는 컴포넌트로 지정합니다.
그러면 애플리케이션이 시작되면서 `AppComponent`가 함께 부트스트랩되고, 접근하는 주소와 연결된 컴포넌트가 호스트 웹 페이지에 표시됩니다.

그 다음에는 `app.module.ts` 파일에서 AngularJS 모듈을 부트스트랩하는 `ngDoBootstrap()`과 `UpgradeModule` 부분을 제거하면 됩니다.

<code-example path="upgrade-phonecat-3-final/app/app.module.ts" header="app/app.module.ts">
</code-example>

이제는 `<phone-list>`나 `<phone-detail>` 태그를 사용하지 않아도 `PhoneListComponent`나 `PhoneDetailComponent`로 전환할 수 있습니다.
이 컴포넌트들의 셀렉터는 이제 신경쓰지 않아도 됩니다.


<!--
#### Generate links for each phone
-->
#### 링크 연결하기

<!--
You no longer have to hardcode the links to phone details in the phone list.
You can generate data bindings for each phone's `id` to the `routerLink` directive
and let that directive construct the appropriate URL to the `PhoneDetailComponent`:

<code-example path="upgrade-phonecat-3-final/app/phone-list/phone-list.template.html" region="list" header="app/phone-list/phone-list.template.html (list with links)"></code-example>

<div class="alert is-helpful">

See the [Routing](guide/router) page for details.

</div><br>
-->
이제는 스마트폰 목록화면에서 상세정보 화면으로 이동하는 링크를 하드코딩 할 필요가 없습니다.
스마트폰의 `id`를 `routerLink` 디렉티브와 바인딩해서 URL을 구성하도록 다음과 같이 구현하면 됩니다:

<code-example path="upgrade-phonecat-3-final/app/phone-list/phone-list.template.html" region="list" header="app/phone-list/phone-list.template.html (링크가 수정된 목록)"></code-example>

<div class="alert is-helpful">

자세한 내용은 [라우팅](guide/router) 문서를 참고하세요.

</div><br>


<!--
#### Use route parameters
-->
#### 라우팅 인자 사용하기

<!--
The Angular router passes route parameters differently.
Correct the `PhoneDetail` component constructor to expect an injected `ActivatedRoute` object.
Extract the `phoneId` from the `ActivatedRoute.snapshot.params` and fetch the phone data as before:

<code-example path="upgrade-phonecat-3-final/app/phone-detail/phone-detail.component.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

You are now running a pure Angular application!
-->
Angular 라우터는 라우팅하면서 라우팅 인자를 함께 전달합니다.
`PhoneDetail` 컴포넌트의 생성자에 `ActivatedRoute` 객체를 의존성으로 주입하도록 수정합니다.
그러고나면 `ActivatedRoute.snapshot.params`에서 참조하는 `phoneId`로 특정 스마트폰의 데이터를 가져올 수 있습니다:

<code-example path="upgrade-phonecat-3-final/app/phone-detail/phone-detail.component.ts" header="app/phone-detail/phone-detail.component.ts">
</code-example>

이제 애플리케이션 기본 틀은 모두 Angular로 동작합니다!


<!--
### Say Goodbye to AngularJS
-->
### AngularJS 탈출하기

<!--
It is time to take off the training wheels and let the application begin
its new life as a pure, shiny Angular app. The remaining tasks all have to
do with removing code - which of course is every programmer's favorite task!

The application is still bootstrapped as a hybrid app.
There's no need for that anymore.

Switch the bootstrap method of the application from the `UpgradeModule` to the Angular way.

<code-example path="upgrade-phonecat-3-final/app/main.ts" header="main.ts">
</code-example>

If you haven't already, remove all references to the `UpgradeModule` from `app.module.ts`,
as well as any [factory provider](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)
for AngularJS services, and the `app/ajs-upgraded-providers.ts` file.

Also remove any `downgradeInjectable()` or `downgradeComponent()` you find,
together with the associated AngularJS factory or directive declarations.
Since you no longer have downgraded components, you no longer list them
in `entryComponents`.

<code-example path="upgrade-phonecat-3-final/app/app.module.ts" header="app.module.ts">
</code-example>

You may also completely remove the following files. They are AngularJS
module configuration files and not needed in Angular:

* `app/app.module.ajs.ts`
* `app/app.config.ts`
* `app/core/core.module.ts`
* `app/core/phone/phone.module.ts`
* `app/phone-detail/phone-detail.module.ts`
* `app/phone-list/phone-list.module.ts`

The external typings for AngularJS may be uninstalled as well. The only ones
you still need are for Jasmine and Angular polyfills.
The `@angular/upgrade` package and its mapping in `systemjs.config.js` can also go.

<code-example format="">
  npm uninstall @angular/upgrade --save
  npm uninstall @types/angular @types/angular-animate @types/angular-cookies @types/angular-mocks @types/angular-resource @types/angular-route @types/angular-sanitize --save-dev
</code-example>

Finally, from `index.html`, remove all references to AngularJS scripts and jQuery.
When you're done, this is what it should look like:

<code-example path="upgrade-phonecat-3-final/index.html" region="full" header="index.html">
</code-example>

That is the last you'll see of AngularJS! It has served us well but now
it's time to say goodbye.
-->
이제 준비과정은 모두 끝났고 이제부터는 순수한 Angular 앱으로 변환하는 작업을 시작하면 됩니다.
필요없는 코드는 모두 제거해 버리세요!

아직 애플리케이션은 하이브리드 앱으로 부트스트랩 됩니다.
하지만 이제 이렇게 실행할 필요가 없습니다.

`UpgradeModule`을 사용해서 애플리케이션을 부트스트랩하던 것을 Angular 방식으로 바꿔봅시다.

<code-example path="upgrade-phonecat-3-final/app/main.ts" header="main.ts">
</code-example>

그리고 `app.module.ts` 파일에서 `UpgradeModule`과 관련된 코드, AngularJS 서비스를 사용하기 위해 등록한 [팩토리 프로바이더](guide/upgrade#making-angularjs-dependencies-injectable-to-angular), `app/ajs-upgraded-providers.ts` 파일을 제거합니다.

`downgradeInjectable()`이나 `downgradeComponent()`는 보이는 대로 제거하면 됩니다.
이 메소드와 관련된 팩토리와 디렉티브도 물론 제거해도 됩니다.
컴포넌트를 Angular 용으로 모두 변환하고 나면 컴포넌트를 다운그레이드할 필요도 없고 이 컴포넌트들을 `entryComponents`에 등록할 필요도 없습니다.

<code-example path="upgrade-phonecat-3-final/app/app.module.ts" header="app.module.ts">
</code-example>

아래 파일들도 제거해도 됩니다.
이 파일들은 AngularJS 모듈을 구성하는 파일이며 Angular에서는 더이상 사용되지 않습니다:

* `app/app.module.ajs.ts`
* `app/app.config.ts`
* `app/core/core.module.ts`
* `app/core/phone/phone.module.ts`
* `app/phone-detail/phone-detail.module.ts`
* `app/phone-list/phone-list.module.ts`

AngularJS의 타입 정보를 제공하는 패키지도 삭제합니다.
이 때 Jasmine과 Angular 폴리필은 남겨둬야 합니다.
`@angular/upgrade` 패키지를 제거하면 `systemjs.config.js` 파일에서 관련된 코드도 제거하면 됩니다.

<code-example format="">
  npm uninstall @angular/upgrade --save
  npm uninstall @types/angular @types/angular-animate @types/angular-cookies @types/angular-mocks @types/angular-resource @types/angular-route @types/angular-sanitize --save-dev
</code-example>

마지막으로 `index.html` 파일에서 AngularJS 스크립트 파일과 jQuery를 로드하는 코드를 모두 제거합니다.
이 코드를 제거하고 나면 `index.html` 파일의 내용은 다음과 같이 남을 것입니다:

<code-example path="upgrade-phonecat-3-final/index.html" region="full" header="index.html">
</code-example>

AngularJS를 보는 일은 이것이 마지막입니다!
지금까지는 고마웠지만 이제 AngularJS를 놓아줍시다.


<!--
## Appendix: Upgrading PhoneCat Tests
-->
## 부록: PhoneCat 테스트 업그레이드하기

<!--
Tests can not only be retained through an upgrade process, but they can also be
used as a valuable safety measure when ensuring that the application does not
break during the upgrade. E2E tests are especially useful for this purpose.
-->
AngularJS 앱을 Angular로 업그레이드할 때 테스트 코드는 업그레이드하지 않아도 앱 실행에 영향을 주지 않지만, 애플리케이션이 제대로 동작하는 것을 계속 유지하려면 테스트 코드도 함께 업그레이드 하는 것이 좋습니다.
E2E 테스트인 경우는 특히 그렇습니다.


<!--
### E2E Tests
-->
### E2E 테스트

<!--
The PhoneCat project has both E2E Protractor tests and some Karma unit tests in it.
Of these two, E2E tests can be dealt with much more easily: By definition,
E2E tests access the application from the *outside* by interacting with
the various UI elements the app puts on the screen. E2E tests aren't really that
concerned with the internal structure of the application components. That
also means that, although you modify the project quite a bit during the upgrade, the E2E
test suite should keep passing with just minor modifications. You
didn't change how the application behaves from the user's point of view.

During TypeScript conversion, there is nothing to do to keep E2E tests
working. But when you change the bootstrap to that of a Hybrid app,
you must make a few changes.

Update the `protractor-conf.js` to sync with hybrid apps:
-->
우리가 다루고 있는 PhoneCat 프로젝트에는 E2E Protractor 테스트와 Karma 유닛 테스트가 모두 구현되어 있습니다.
그리고 둘 중에서는 E2E 테스트가 좀 더 다루기 쉽습니다.
E2E 테스트는 애플리케이션 *밖에서* UI 엘리먼트를 조작하며 앱이 어떻게 표시되는지 검사하는 용도로 설계되었습니다.
그래서 E2E 테스트는 애플리케이션 내부 구조와는 직접적인 관계가 없습니다.
그렇기 때문에 오랜 시간을 들여서 프로젝트를 업그레이드 하더라도 이 변경사항에 맞게 E2E 테스트 스윗을 수정하는 것은 그리 복잡하지 않습니다.
애플리케이션의 변경사항과 관계없이 사용자의 입장에서만 조작하면 되기 때문입니다.

E2E 테스트 코드는 TypeScript를 도입한다고 해서 크게 달라지지 않지만 하이브리드 앱을 부트스트랩하는 구조가 변경되면 수정해야할 내용이 조금 있습니다.

하디브리드 앱에 맞게 `protractor-conf.js` 파일을 다음과 같이 수정합니다:


<code-example format="">
  ng12Hybrid: true
</code-example>

<!--
When you start to upgrade components and their templates to Angular, you'll make more changes
because the E2E tests have matchers that are specific to AngularJS.
For PhoneCat you need to make the following changes in order to make things work with Angular:
-->
컴포넌트를 업그레이드하면서 템플릿을 변경하게 되면 E2E 테스트 코드에 수정해야 하는 내용은 좀 더 많아집니다.
AngularJS에서 사용하던 매처를 사용하기 때문입니다.
그래서 PhoneCat 프로젝트를 Angular 버전으로 E2E 테스트하려면 다음과 같이 수정해야 합니다:

<table>
  <tr>
    <th>
      <!--
      Previous code
      -->
      수정 전
    </th>
    <th>
      <!--
      New code
      -->
      수정 후
    </th>
    <th>
      <!--
      Notes
      -->
      설명
    </th>
  </tr>
  <tr>
    <td>

      `by.repeater('phone in $ctrl.phones').column('phone.name')`

    </td>
    <td>

      `by.css('.phones .name')`

    </td>
    <td>

      <!--
      The repeater matcher relies on AngularJS `ng-repeat`
      -->
      이전에는 AngularJS `ng-repeat`에 해당하는 매처를 사용했습니다.

    </td>
  </tr>
  <tr>
    <td>

      `by.repeater('phone in $ctrl.phones')`

    </td>
    <td>

      `by.css('.phones li')`

    </td>

    <td>

      <!--
      The repeater matcher relies on AngularJS `ng-repeat`
      -->
      이전에는 AngularJS `ng-repeat`에 해당하는 매처를 사용했습니다.

    </td>
  </tr>
  <tr>
    <td>

      `by.model('$ctrl.query')`

    </td>
    <td>

      `by.css('input')`

    </td>
    <td>

      <!--
      The model matcher relies on AngularJS `ng-model`
      -->
      이전에는 AngularJS `ng-model`에 해당하는 매처를 사용했습니다.

    </td>
  </tr>
  <tr>
    <td>

      `by.model('$ctrl.orderProp')`

    </td>
    <td>

      `by.css('select')`

    </td>
    <td>

      <!--
      The model matcher relies on AngularJS `ng-model`
      -->
      이전에는 AngularJS `ng-model`에 해당하는 매처를 사용했습니다.

    </td>
  </tr>
  <tr>
    <td>

      `by.binding('$ctrl.phone.name')`

    </td>
    <td>

      `by.css('h1')`

    </td>
    <td>

      <!--
      The binding matcher relies on AngularJS data binding
      -->
      이전에는 AngularJS 데이터 바인딩에 해당하는 매처를 사용했습니다.

    </td>
  </tr>
</table>

<!--
When the bootstrap method is switched from that of `UpgradeModule` to
pure Angular, AngularJS ceases to exist on the page completely.
At this point, you need to tell Protractor that it should not be looking for
an AngularJS app anymore, but instead it should find *Angular apps* from
the page.

Replace the `ng12Hybrid` previously added with the following in `protractor-conf.js`:
-->
`UpgradeModule`를 사용하던 부트스트랩 메소드를 Angular 버전으로 바꾸면 이제 화면에 AngularJS는 존재하지 않습니다.
그래서 Protractor도 AngularJS 앱 대신 Angular 앱을 탐색해야 합니다.

이전에 수정했던 `protractor-conf.js` 파일에 다음 내용을 추가합니다:

<code-example format="">
  useAllAngular2AppRoots: true,
</code-example>

<!--
Also, there are a couple of Protractor API calls in the PhoneCat test code that
are using the AngularJS `$location` service under the hood. As that
service is no longer present after the upgrade, replace those calls with ones
that use WebDriver's generic URL APIs instead. The first of these is
the redirection spec:
-->
그리고 아직까지는 PhoneCat 프로젝트 테스트 코드에 AngularJS `$location` 서비스를 사용하는 부분이 있습니다.
애플리케이션을 업그레이드한 후에는 이 서비스도 사용하지 않으며, 이제 WebDriver가 제공하는 URL API를 사용해야 합니다.
리다이렉션을 테스트하는 코드는 다음과 같이 수정합니다:

<code-example path="upgrade-phonecat-3-final/e2e-spec.ts" region="redirect" header="e2e-tests/scenarios.ts">
</code-example>

<!--
And the second is the phone links spec:
-->
그리고 스마트폰 링크를 테스트하는 코드는 다음과 같이 수정합니다:

<code-example path="upgrade-phonecat-3-final/e2e-spec.ts" region="links" header="e2e-tests/scenarios.ts">
</code-example>


<!--
### Unit Tests
-->
### 유닛 테스트

<!--
For unit tests, on the other hand, more conversion work is needed. Effectively
they need to be *upgraded* along with the production code.

During TypeScript conversion no changes are strictly necessary. But it may be
a good idea to convert the unit test code into TypeScript as well.

For instance, in the phone detail component spec, you can use ES2015
features like arrow functions and block-scoped variables and benefit from the type
definitions of the AngularJS services you're consuming:

<code-example path="upgrade-phonecat-1-typescript/app/phone-detail/phone-detail.component.spec.ts" header="app/phone-detail/phone-detail.component.spec.ts">
</code-example>

Once you start the upgrade process and bring in SystemJS, configuration changes
are needed for Karma. You need to let SystemJS load all the new Angular code,
which can be done with the following kind of shim file:

<code-example path="upgrade-phonecat-2-hybrid/karma-test-shim.1.js" header="karma-test-shim.js">
</code-example>

The shim first loads the SystemJS configuration, then Angular's test support libraries,
and then the application's spec files themselves.

Karma configuration should then be changed so that it uses the application root dir
as the base directory, instead of `app`.

<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="basepath" header="karma.conf.js">
</code-example>

Once done, you can load SystemJS and other dependencies, and also switch the configuration
for loading application files so that they are *not* included to the page by Karma. You'll let
the shim and SystemJS load them.

<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="files" header="karma.conf.js">
</code-example>

Since the HTML templates of Angular components will be loaded as well, you must help
Karma out a bit so that it can route them to the right paths:

<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="html" header="karma.conf.js">
</code-example>

The unit test files themselves also need to be switched to Angular when their production
counterparts are switched. The specs for the checkmark pipe are probably the most straightforward,
as the pipe has no dependencies:

<code-example path="upgrade-phonecat-2-hybrid/app/core/checkmark/checkmark.pipe.spec.ts" header="app/core/checkmark/checkmark.pipe.spec.ts">
</code-example>

The unit test for the phone service is a bit more involved. You need to switch from the mocked-out
AngularJS `$httpBackend` to a mocked-out Angular Http backend.

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.spec.ts" header="app/core/phone/phone.service.spec.ts">
</code-example>

For the component specs, you can mock out the `Phone` service itself, and have it provide
canned phone data. You use Angular's component unit testing APIs for both components.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.spec.ts" header="app/phone-detail/phone-detail.component.spec.ts">
</code-example>

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.spec.ts" header="app/phone-list/phone-list.component.spec.ts">
</code-example>

Finally, revisit both of the component tests when you switch to the Angular
router. For the details component, provide a mock of Angular `ActivatedRoute` object
instead of using the AngularJS `$routeParams`.

<code-example path="upgrade-phonecat-3-final/app/phone-detail/phone-detail.component.spec.ts" region="activatedroute" header="app/phone-detail/phone-detail.component.spec.ts">
</code-example>

And for the phone list component, a few adjustments to the router make
the `RouteLink` directives work.

<code-example path="upgrade-phonecat-3-final/app/phone-list/phone-list.component.spec.ts" region="routestuff" header="app/phone-list/phone-list.component.spec.ts">
</code-example>
-->
유닛 테스트의 경우에는 작업할 내용이 좀 더 있습니다.
유닛 테스트 코드는 애플리케이션이 *업그레이드*되는 것에 직접 영향을 받습니다.

애플리케이션에 TypeScript를 적용하는 동안에는 유닛 테스트 코드를 수정하지 않아도 됩니다.
하지만 되도록이면 테스트 코드도 TypeScript로 변환하는 것이 좋습니다.

그래서 스마트폰 상세정보 컴포넌트를 테스트하는 스펙이라면 화살표 함수나 블록 안에서만 유효한 변수와 같은 ES2015 기능을 사용할 수도 있고 타입을 지정하는 기능을 활용하는 것도 좋습니다:

<code-example path="upgrade-phonecat-1-typescript/app/phone-detail/phone-detail.component.spec.ts" header="app/phone-detail/phone-detail.component.spec.ts">
</code-example>

그리고 SysmsJS 환경에서 앱을 업그레이드하면 Karma를 실행하기 위한 환경 설정도 수정해야 합니다.
다음과 같은 스크립트 파일을 사용해서 SystemJS가 새로 만든 Angular 코드를 로드하도록 합시다:

<code-example path="upgrade-phonecat-2-hybrid/karma-test-shim.1.js" header="karma-test-shim.js">
</code-example>

이 스크립트 파일은 제일 먼저 SystemJS 환경 설정을 로드합니다.
그 다음에 Angular 테스트 라이브러리를 로드하고 애플리케이션 스펙 파일을 로드합니다.

Karma 설정은 `app` 대신 애플리케이션 루트 폴더를 기본 폴더로 사용하도록 변경해야 합니다.

<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="basepath" header="karma.conf.js">
</code-example>

그리고 나면 이제 Karma가 스크립트 파일과 SystemJS를 로드하도록 다음과 같이 구성합니다.

<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="files" header="karma.conf.js">
</code-example>

아직 Angular 컴포넌트의 HTML 템플릿은 `basePath`가 변경되지 않은 경로에서 리소스를 참조하고 있습니다.
이 파일들이 제대로 로드될 수 있도록 다음과 같이 프록시를 설정합니다:

<code-example path="upgrade-phonecat-2-hybrid/karma.conf.ajs.js" region="html" header="karma.conf.js">
</code-example>

애플리케이션 코드가 Angular로 업그레이드 되면 유닛 테스트 파일도 Angular로 업그레이드하는 것이 좋습니다.
테스트 코드 중 가장 간단한 체크마크 파이프를 Angular 버전으로 변환해 봅시다.
이 파이프에는 의존성으로 주입되는 패키지가 아무 것도 없어서 변환하기도 쉽습니다:

<code-example path="upgrade-phonecat-2-hybrid/app/core/checkmark/checkmark.pipe.spec.ts" header="app/core/checkmark/checkmark.pipe.spec.ts">
</code-example>

스마트폰 서비스와 관련된 유닛 테스트 코드는 조금 더 복잡합니다.
AngularJS에서 사용하던 `$httpBackend`를 Angular HTTP 백엔드 모킹 함수로 대체합니다.

<code-example path="upgrade-phonecat-2-hybrid/app/core/phone/phone.service.spec.ts" header="app/core/phone/phone.service.spec.ts">
</code-example>

컴포넌트를 테스트하는 코드에서는 `Phone` 서비스 자체를 모킹하는 것이 좋습니다.
Angular가 제공하는 컴포넌트 유닛 테스트 API를 다음과 같이 활용하면 됩니다.

<code-example path="upgrade-phonecat-2-hybrid/app/phone-detail/phone-detail.component.spec.ts" header="app/phone-detail/phone-detail.component.spec.ts">
</code-example>

<code-example path="upgrade-phonecat-2-hybrid/app/phone-list/phone-list.component.spec.ts" header="app/phone-list/phone-list.component.spec.ts">
</code-example>

마지막으로 Angular 라우터가 동작할 때 지금까지 만든 컴포넌트가 제대로 동작하도록 프로바이더를 등록합니다.
스마트폰 상세정보 컴포넌트는 이제 AngularJS `$routeParams`에서 라우팅 인자를 받지 않고 Angular `ActivatedRoute` 객체에서 라우팅 인자를 받습니다.

<code-example path="upgrade-phonecat-3-final/app/phone-detail/phone-detail.component.spec.ts" region="activatedroute" header="app/phone-detail/phone-detail.component.spec.ts">
</code-example>

그리고 스마트폰 목록 컴포넌트를 테스트하는 코드에서는 `RouterLink` 디렉티브가 제대로 동작하도록 다음과 같이 구성합니다.

<code-example path="upgrade-phonecat-3-final/app/phone-list/phone-list.component.spec.ts" region="routestuff" header="app/phone-list/phone-list.component.spec.ts">
</code-example>
