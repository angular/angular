<!--
# Upgrading for performance
-->
# 업그레이드 방식과 성능의 관계

<div class="alert is-helpful">

  <!--
  _Angular_ is the name for the Angular of today and tomorrow.<br />
  _AngularJS_ is the name for all 1.x versions of Angular.
  -->
  Angular 프레임워크의 정식 명칭은 _Angular_ 입니다.<br/>
  _AngularJS_ 는 Angular 1.x 버전을 의미하는 이름입니다.

</div>

<!--
This guide describes some of the built-in tools for efficiently migrating AngularJS projects over to
the Angular platform, one piece at a time. It is very similar to
[Upgrading from AngularJS](guide/upgrade) with the exception that this one uses the {@link
downgradeModule downgradeModule()} helper function instead of the {@link UpgradeModule
UpgradeModule} class. This affects how the app is bootstrapped and how change detection is
propagated between the two frameworks. It allows you to upgrade incrementally while improving the
speed of your hybrid apps and leveraging the latest of Angular in AngularJS apps early in the
process of upgrading.
-->
이 문서에서는 AngularJS 프로젝트를 Angular 플랫폼으로 전환할 때 사용하는 툴에 대해 설명합니다.
이전에 다뤘던 [업그레이드 방법](guide/upgrade) 문서와 거의 비슷하지만, 이 문서에서는 {@link UpgradeModule UpgradeModule} 대신 {@link downgradeModule downgradeModule()} 헬퍼 함수를 사용하는 방식에 대해 설명합니다.
방식이 다르기 때문에 앱을 부트스트랩하거나 AngularJS와 Angular 사이에서 변화를 감지하는 방식이 조금 다릅니다.
AngularJS 앱을 최신 Angular 플랫폼에 맞게 구성요소를 하나씩 업그레이드하는 방법에 대해 알아봅시다.


<!--
## Preparation
-->
## 사전준비

<!--
Before discussing how you can use `downgradeModule()` to create hybrid apps, there are things that
you can do to ease the upgrade process even before you begin upgrading. Because the steps are the
same regardless of how you upgrade, refer to the [Preparation](guide/upgrade#preparation) section of
[Upgrading from AngularJS](guide/upgrade).
-->
하이브리드 앱에 `downgradeModule()`을 어떻게 사용해야 하는지 설명하기 전에 업그레이드 작업을 편하게 진행하기 위해 알아두어야 할 것이 있습니다.
이전에 다뤘던 [업그레이드 방법](guide/upgrade) 문서의 [사전준비](guide/upgrade#preparation) 섹션을 참고하세요.


<!--
## Upgrading with `ngUpgrade`
-->
## `ngUpgrade` 사용하기

<!--
With the `ngUpgrade` library in Angular you can upgrade an existing AngularJS app incrementally by
building a hybrid app where you can run both frameworks side-by-side. In these hybrid apps you can
mix and match AngularJS and Angular components and services and have them interoperate seamlessly.
That means you don't have to do the upgrade work all at once as there is a natural coexistence
between the two frameworks during the transition period.
-->
Angular `ngUpgrade` 라이브러리를 사용하면 AngularJS와 Angular 두 프레임워크가 모두 실행되는 하이브리드 앱에서 AngularJS 앱의 컴포넌트와 서비스 같은 구성요소를 하나씩 Angular용으로 변환하는 방식으로 앱을 업그레이드 합니다.
그래서 이 방식은 애플리케이션이 제공하는 기능이 끊기지 않기 때문에 자연스럽게 변환작업을 진행할 수 있습니다.
한 번에 모든 것을 바꾸다가 문제가 생기는 것보다는 이 방식이 더 안전합니다.


<!--
### How `ngUpgrade` Works
-->
### `ngUpgrade`가 동작하는 방식

<!--
Regardless of whether you choose `downgradeModule()` or `UpgradeModule`, the basic principles of
upgrading, the mental model behind hybrid apps, and how you use the {@link upgrade/static
upgrade/static} utilities remain the same. For more information, see the
[How `ngUpgrade` Works](guide/upgrade#how-ngupgrade-works) section of
[Upgrading from AngularJS](guide/upgrade).
-->
`downgradeModule()`을 사용하는지 `UpgradeModule`을 사용하는지에 관계없이 업그레이드는 하이브리드 앱에서 진행하는 것이 기본이기 때문에 {@link upgrade/static upgrade/static} 유틸리티를 사용하는 방식은 동일합니다.
자세한 내용은 [업그레이드 방법](guide/upgrade) 문서의 [`ngUpgrade`가 동작하는 방식](guide/upgrade#how-ngupgrade-works) 섹션을 참고하세요.

<div class="alert is-helpful">

  <!--
  The [Change Detection](guide/upgrade#change-detection) section of
  [Upgrading from AngularJS](guide/upgrade) only applies to apps that use `UpgradeModule`. Though
  you handle change detection differently with `downgradeModule()`, which is the focus of this
  guide, reading the [Change Detection](guide/upgrade#change-detection) section provides helpful
  context for what follows.
  -->
  [업그레이드 방법](guide/upgrade) 문서의 [변화 감지](guide/upgrade#change-detection) 섹션에서 설명하는 내용은 `UpgradeModule`을 사용하는 앱에만 적용되는 내용입니다.
  `downgradeModule()`을 사용하는 앱이라면 변화 감지 로직이 조금 다르게 동작하기 때문에 이 문서에서 설명하는 [변화 감지](guide/upgrade#change-detection) 섹션을 참고하세요.

</div>


<!--
#### Change Detection with `downgradeModule()`
-->
#### `downgradeModule()`을 사용했을 때 동작하는 변화 감지

<!--
As mentioned before, one of the key differences between `downgradeModule()` and `UpgradeModule` has
to do with change detection and how it is propagated between the two frameworks.

With `UpgradeModule`, the two change detection systems are tied together more tightly. Whenever
something happens in the AngularJS part of the app, change detection is automatically triggered on
the Angular part and vice versa. This is convenient as it ensures that neither framework misses an
important change. Most of the time, though, these extra change detection runs are unnecessary.

`downgradeModule()`, on the other side, avoids explicitly triggering change detection unless it
knows the other part of the app is interested in the changes. For example, if a downgraded component
defines an `@Input()`, chances are that the app needs to be aware when that value changes. Thus,
`downgradeComponent()` automatically triggers change detection on that component.

In most cases, though, the changes made locally in a particular component are of no interest to the
rest of the app. For example, if the user clicks a button that submits a form, the component usually
handles the result of this action. That being said, there _are_ cases where you want to propagate
changes to some other part of the app that may be controlled by the other framework. In such cases,
you are responsible for notifying the interested parties by manually triggering change detection.

If you want a particular piece of code to trigger change detection in the AngularJS part of the app,
you need to wrap it in
[scope.$apply()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply). Similarly, for
triggering change detection in Angular you would use {@link NgZone#run ngZone.run()}.

In many cases, a few extra change detection runs may not matter much. However, on larger or
change-detection-heavy apps they can have a noticeable impact. By giving you more fine-grained
control over the change detection propagation, `downgradeModule()` allows you to achieve better
performance for your hybrid apps.
-->
위에서 언급한 것처럼 `downgradeModule()`을 사용하는 방식과 `UpgradeModule`을 사용하는 방식은 변화가 감지되는 방식이 다르기 때문에 두 프레임워크간에 이 변화가 전달되는 방식도 다릅니다.

`UpgradeModule`을 사용하면 AngularJS와 Angular의 변화 감지 시스템이 긴밀하게 엮여서 동작합니다.
AngularJS 쪽에서 어떤 변화가 발생하면 이 변화는 자동으로 Angular 쪽으로 전달되며, 반대의 경우도 마찬가지입니다.
보통은 이런 변화 감지 로직이 필요 없는 경우가 대부분이지만, `UpgradeModule`을 사용하면 어느 한쪽에서 발생한 변화가 누락되지 않고 전달된다는 것을 보장받을 수 있습니다.

하지만 `downgradeModule()`를 사용하면 다른 프레임워크로 전달될 필요가 있는 경우에만 변화 감지 로직이 전달됩니다.
예를 들면 다운그레이드한 컴포넌트에 `@Input()` 프로퍼티가 있다면 이 프로퍼티에 바인딩되는 값이 변경되는 경우가 이런 경우에 해당됩니다.
이런 경우에는 `downgradeComponent()`가 컴포넌트의 변화 감지 로직을 자동으로 실행합니다.

보통 변화가 발생하는 것은 작은 곳에서 시작되기 때문에 관련된 컴포넌트가 아니라면 이 변화 자체를 알 필요도 없습니다.
사용자가 컴포넌트에 있는 버튼을 클릭해서 폼을 제출했다면 후속 처리도 그 컴포넌트가 하는 식입니다.
그런데 이 말을 다시 생각해보면 보면 변화가 발생한 것을 컴포넌트밖 다른 곳으로 보내야 한다면 수동으로 무언가를 해야한다는 것을 의미합니다.
변화가 발생한 컴포넌트 외에 다른 서비스나 컴포넌트가 이 변화에 반응해야 하는 경우가 그렇습니다.

AngularJS 쪽에서 변화 감지 로직을 시작하려면 [scope.$apply()](https://docs.angularjs.org/api/ng/type/$rootScope.Scope#$apply)를 실행하면 됩니다.
그리고 Angular 쪽에서 변화 감지 로직을 시작하려면 {@link NgZone#run ngZone.run()}를 실행하면 됩니다.

직접 변화 감지 싸이클을 직접 시작한다고 해도 문제가 되는 경우는 거의 없습니다.
하지만 앱의 규모가 크거나 변화 감지 동작이 많이 발생하는 앱은 이 동작에 영향을 받을 수 있습니다.
그래서 AngularJS 앱을 업그레이드하면서 변화 감지를 신경쓰지 않으려면 `downgradeModule()`을 사용하는 방식이 더 좋습니다.


<!--
## Using `downgradeModule()`
-->
## `downgradeModule()` 사용하기

<!--
Both AngularJS and Angular have their own concept of modules to help organize an app into cohesive
blocks of functionality.

Their details are quite different in architecture and implementation. In AngularJS, you create a
module by specifying its name and dependencies with
[angular.module()](https://docs.angularjs.org/api/ng/function/angular.module). Then you can add
assets using its various methods. In Angular, you create a class adorned with an {@link NgModule
NgModule} decorator that describes assets in metadata.

In a hybrid app you run both frameworks at the same time. This means that you need at least one
module each from both AngularJS and Angular.

For the most part, you specify the modules in the same way you would for a regular app. Then, you
use the `upgrade/static` helpers to let the two frameworks know about assets they can use from each
other. This is known as "upgrading" and "downgrading".
-->
AngularJS와 Angular는 모두 애플리케이션을 구조화해서 효율적으로 관리하기 위해 각각 모듈이라는 개념을 제공합니다.

하지만 두 프레임워크의 모듈이 설계된 방향과 구현된 결과물은 많이 다릅니다.
AngularJS에서는 [angular.module()](https://docs.angularjs.org/api/ng/function/angular.module)를 사용해서 모듈의 이름과 의존성 객체를 지정합니다.
모듈의 애셋은 모듈 API가 제공하는 메소드로 등록합니다.
Angular에서는 {@link NgModule NgModule} 데코레이터를 사용해서 클래스를 모듈로 선언할 수 있습니다.
모듈에 사용하는 애셋은 메타데이터에 정의합니다.

하이브리드 앱을 실행하면 AngularJS와 Angular가 동시에 실행됩니다.
그렇기 때문에 각 프레임워크에는 최소한 1개 이상의 모듈을 정의해야 합니다.

일반 Angular 앱과 마찬가지로 하이브리드 앱에서도 모듈을 선언하는 방법은 같습니다.
다만 `upgrade/static` 헬퍼를 사용해서 프레임워크 양쪽에서도 모듈과 애셋을 사용할 수 있도록 등록해야 합니다.
이 과정이 "업그레이드"와 "다운그레이드" 입니다.


<div class="alert is-helpful">

  <!--
  <b>Definitions:</b>

  - _Upgrading_: The act of making an AngularJS asset, such as a component or service, available to
    the Angular part of the app.
  - _Downgrading_: The act of making an Angular asset, such as a component or service, available to
    the AngularJS part of the app.
  -->
  <b>용어 정의:</b>

  - _업그레이드(Upgrading)_: AngularJS용 애셋(컴포넌트, 서비스)을 Angular 환경에 사용할 수 있도록 변환하는 것.
  - _다운그레이드(Downgrading)_: Angular용 애셋(컴포넌트, 서비스)을 AngularJS 환경에 사용할 수 있도록 변환하는 것.

</div>

<!--
An important part of inter-linking dependencies is linking the two main modules together. This is
where `downgradeModule()` comes in. Use it to create an AngularJS module&mdash;one that you can use
as a dependency in your main AngularJS module&mdash;that will bootstrap your main Angular module and
kick off the Angular part of the hybrid app. In a sense, it "downgrades" an Angular module to an
AngularJS module.

There are a few things to note, though:

1. You don't pass the Angular module directly to `downgradeModule()`. All `downgradeModule()` needs
   is a "recipe", for example, a factory function, to create an instance for your module.

2. The Angular module is not instantiated until the app actually needs it.

The following is an example of how you can use `downgradeModule()` to link the two modules.

```ts
// Import `downgradeModule()`.
import { downgradeModule } from '@angular/upgrade/static';

// Use it to downgrade the Angular module to an AngularJS module.
const downgradedModule = downgradeModule(MainAngularModuleFactory);

// Use the downgraded module as a dependency to the main AngularJS module.
angular.module('mainAngularJsModule', [
  downgradedModule
]);
```
-->
양쪽의 의존성을 연결하는 작업 중에서는 양쪽의 메인 모듈을 연결하는 것이 가장 중요합니다.
`downgradeModule()`은 이 작업을 위해 도입되었습니다.
이 메소드를 사용하면 AngularJS 쪽에서 메인 모듈로 사용할 수 있는 AngularJS 모듈을 만들 수 있기 때문에, 하이브리드 앱에서도 Angular 모듈을 부트스트랩하면서 바로 Angular로 변환하는 작업을 할 수 있습니다.
이름을 봐도 용도를 짐작할 수 있듯이, 이 메소드는 Angular 모듈을 AngularJS 모듈로 "다운그레이드" 하는 메소드입니다.

알아둬야 할 내용이 몇가지 있습니다:

1. `downgradeModule()`에는 Angular 모듈의 인스턴스를 직접 전달하지 않습니다. `downgradeModule()`에 필요한 것은 클래스를 만드는 "레시피(recipe)" 입니다. 모듈의 인스턴스를 생성하는 팩토리 함수를 전달하는 방법은 사용할 수 있습니다.

2. 이렇게 전달한 Angular 모듈이 실제로 필요하지 않으면 인스턴스가 생성되지 않습니다.

실제 코드에서는 `downgradeModule()`을 다음과 같이 사용합니다.

```ts
// `downgradeModule()`을 로드합니다.
import { downgradeModule } from '@angular/upgrade/static';

// Angular 모듈을 AngularJS 용으로 다운그레이드합니다.
const downgradedModule = downgradeModule(MainAngularModuleFactory);

// AngularJS의 메인 모듈을 등록하면서 다운그레이드한 모듈을 의존성 객체로 전달합니다.
angular.module('mainAngularJsModule', [
  downgradedModule
]);
```


<!--
#### Specifying a factory for the Angular module
-->
#### Angular 모듈 팩토리 지정하기

<!--
As mentioned earlier, `downgradeModule()` needs to know how to instantiate the Angular module. It
needs a recipe. You define that recipe by providing a factory function that can create an instance
of the Angular module. `downgradeModule()` accepts two types of factory functions:

1. `NgModuleFactory`
2. `(extraProviders: StaticProvider[]) => Promise<NgModuleRef>`

When you pass an `NgModuleFactory`, `downgradeModule()` uses it to instantiate the module using
{@link platformBrowser platformBrowser}'s {@link PlatformRef#bootstrapModuleFactory
bootstrapModuleFactory()}, which is compatible with ahead-of-time (AOT) compilation. AOT compilation
helps make your apps load faster. For more about AOT and how to create an `NgModuleFactory`, see the
[Ahead-of-Time Compilation](guide/aot-compiler) guide.

Alternatively, you can pass a plain function, which is expected to return a promise resolving to an
{@link NgModuleRef NgModuleRef} (i.e. an instance of your Angular module). The function is called
with an array of extra {@link StaticProvider Providers} that are expected to be available on the
returned `NgModuleRef`'s {@link Injector Injector}. For example, if you are using {@link
platformBrowser platformBrowser} or {@link platformBrowserDynamic platformBrowserDynamic}, you can
pass the `extraProviders` array to them:

```ts
const bootstrapFn = (extraProviders: StaticProvider[]) => {
  const platformRef = platformBrowserDynamic(extraProviders);
  return platformRef.bootstrapModule(MainAngularModule);
};
// or
const bootstrapFn = (extraProviders: StaticProvider[]) => {
  const platformRef = platformBrowser(extraProviders);
  return platformRef.bootstrapModuleFactory(MainAngularModuleFactory);
};
```

Using an `NgModuleFactory` requires less boilerplate and is a good default option as it supports AOT
out-of-the-box. Using a custom function requires slightly more code, but gives you greater
flexibility.
-->
위에서 언급한 것처럼 `downgradeModule()` 메소드를 실행하려면 Angular 모듈의 인스턴스를 어떻게 만드는지 알려줘야 합니다.
레시피가 필요한데, 이때 Angular 모듈의 인스턴스를 생성할 수 잇는 팩토리 함수를 사용할 수 있습니다.
`downgradeModule()`에는 두 종류의 팩토리 함수를 사용할 수 있습니다:

1. `NgModuleFactory`
2. `(extraProviders: StaticProvider[]) => Promise<NgModuleRef>`

`NgModuleFactory`를 사용하면 `downgradeModule()` 메소드가 {@link platformBrowser platformBrowser}의 {@link PlatformRef#bootstrapModuleFactory bootstrapModuleFactory()}를 사용해서 모듈의 인스턴스를 생성하기 때문에 AOT 컴파일러와도 호환이 됩니다.
AOT 컴파일러를 사용하면 앱이 실행되는 시간을 줄일 수 있습니다.
AOT 컴파일러로 `NgModuleFactory`를 사용하는 방법에 대해서 자세하게 알아보려면 [AOT 컴파일](guide/aot-compiler) 문서를 참고하세요.

아니면 프로미스 타입으로 Angular 모듈의 {@link NgModuleRef NgModuleRef}를 반환하는 함수를 사용하는 방법도 있습니다.
이 함수는 {@link StaticProvider Providers} 배열을 인자로 받아서 `NgModuleRef`에 {@link Injector Injector}가 구성하고 반환해야 합니다.
{@link platformBrowser platformBrowser}나 {@link platformBrowserDynamic platformBrowserDynamic}를 다운그레이드한다면 다음과 같이 사용할 수 있습니다:

```ts
const bootstrapFn = (extraProviders: StaticProvider[]) => {
  const platformRef = platformBrowserDynamic(extraProviders);
  return platformRef.bootstrapModule(MainAngularModule);
};
// or
const bootstrapFn = (extraProviders: StaticProvider[]) => {
  const platformRef = platformBrowser(extraProviders);
  return platformRef.bootstrapModuleFactory(MainAngularModuleFactory);
};
```

두 방식 중에는 `NgModuleFactory`를 사용하는 방식이 더 간단하고 AOT도 지원하기 때문에 이 방식을 먼저 고려해보는 것이 좋습니다.
그리고 커스텀 함수를 사용하는 방식은 코드가 좀 더 필요하지만 모듈을 좀 더 유연하게 활용할 수 있습니다.


<!--
#### Instantiating the Angular module on-demand
-->
#### Angular 모듈 인스턴스 생성하기

<!--
Another key difference between `downgradeModule()` and `UpgradeModule` is that the latter requires
you to instantiate both the AngularJS and Angular modules up-front. This means that you have to pay
the cost of instantiating the Angular part of the app, even if you don't use any Angular assets
until later. `downgradeModule()` is again less aggressive. It will only instantiate the Angular part
when it is required for the first time; that is, as soon as it needs to create a downgraded
component.

You could go a step further and not even download the code for the Angular part of the app to the
user's browser until it is needed. This is especially useful when you use Angular on parts of the
hybrid app that are not necessary for the initial rendering or that the user doesn't reach.


A few examples are:

- You use Angular on specific routes only and you don't need it until/if a user visits such a route.
- You use Angular for features that are only visible to specific types of users; for example,
  logged-in users, administrators, or VIP members. You don't need to load Angular until a user is
  authenticated.
- You use Angular for a feature that is not critical for the initial rendering of the app and you
  can afford a small delay in favor of better initial load performance.
-->
`UpgradeModule`을 사용하는 방식은 `downgradeModule()`을 사용하는 방식과 다르게 모든 AngularJS 모듈과 Angular 모듈의 인스턴스를 앱 실행 시점에 생성합니다.
이 효과는 사용자가 실제로 사용하지 않는 모듈에도 유효하며, 결국 앱을 실행하기 위해 시간이 더 오래 걸릴 수 있다는 것을 의미합니다.
하지만 `downgradeModule()`은 그렇지 않습니다.
이 메소드를 사용하면 Angular 구성요소가 처음 필요할 때 인스턴스를 생성하며 이렇게 생성된 인스턴스를 다운그레이드해서 AngularJS 쪽으로 전달합니다.

좀 더 대비한다면 브라우저에서 필요한 시기까지 코드 자체를 내려받지 않을수도 있습니다.
이런 방식은 하이브리드 앱을 업그레이드하는 동안 사용자가 접근하지 않아도 되는 부분을 대비하지 않아도 된다는 점에서 특히 유용합니다.

이런 경우에 활용할 수 있습니다:

- 사용자가 접근하지 않는 주소와 관련된 라우팅 규칙은 신경쓸 필요가 없습니다.
- 사용자가 실제로 화면에서 보는 항목만 신경쓰면 됩니다. 로그인 한 사용자만 보는 항목, 관리자만 보는 항목, VIP 멤버만 보는 항목은 로그인하지 않은 사용자의 화면을 작업할 때 신경쓸 필요가 없습니다.
- 앱 초기 실행을 빠르게 끝내기 위해 당장 렌더링하지 않아도 되는 부분은 잠시 미뤄놓을 수 있습니다.


<!--
### Bootstrapping with `downgradeModule()`
-->
### `downgradeModule()`로 부트스트랩하기

<!--
As you might have guessed, you don't need to change anything in the way you bootstrap your existing
AngularJS app. Unlike `UpgradeModule`&mdash;which requires some extra steps&mdash;
`downgradeModule()` is able to take care of bootstrapping the Angular module, as long as you provide
the recipe.

In order to start using any `upgrade/static` APIs, you still need to load the Angular framework as
you would in a normal Angular app. You can see how this can be done with SystemJS by following the
instructions in the [Upgrade Setup](guide/upgrade-setup "Setup for Upgrading from AngularJS") guide, selectively copying code from the
[QuickStart github repository](https://github.com/angular/quickstart).

You also need to install the `@angular/upgrade` package via `npm install @angular/upgrade --save`
and add a mapping for the `@angular/upgrade/static` package:
-->
기존에 있던 AngularJS 앱을 부트스트랩하는 로직은 변경할 필요가 없습니다.
`downgradeModule()`을 사용하는 방식은 `UpgradeModule`을 사용했던 것과는 다르게 레시피만 지정하면 Angular 모듈을 자동으로 부트스트랩할 수 있습니다.

다만 `upgrade/static` API를 사용하려면 일반 Angular 앱처럼 Angular 프레임워크에서 이 패키지를 로드해야 합니다.
SystemJS에서 이렇게 설정하는 방법은 [로컬 개발환경 설정하기](guide/upgrade-setup "Setup for Upgrading from AngularJS") 문서를 참고하거나 [QuickStart github 저장소](https://github.com/angular/quickstart)에서 필요한 코드를 가져와도 됩니다.

그리고 `@angular/upgrade/static` 패키지를 맵핑하려면 `npm install @angular/upgrade --save` 명령을 실행해서 `@angular/upgrade` 패키지를 설치해야 할 수도 있습니다:


<code-example header="system.config.js">
'@angular/upgrade/static': 'npm:@angular/upgrade/bundles/upgrade-static.umd.js',
</code-example>

<!--
Next, create an `app.module.ts` file and add the following `NgModule` class:

<code-example header="app.module.ts">
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule
  ]
})
export class MainAngularModule {
  // Empty placeholder method to satisfy the `Compiler`.
  ngDoBootstrap() {}
}
</code-example>
-->
그리고 `app.module.ts` 파일을 생성한 다음에 다음과 같은 `NgModule` 클래스를 추가합니다:

<code-example header="app.module.ts">
import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

@NgModule({
  imports: [
    BrowserModule
  ]
})
export class MainAngularModule {
  // `Compiler`에 필요한 메소드를 선언만 합니다.
  ngDoBootstrap() {}
}
</code-example>


<!--
This bare minimum `NgModule` imports `BrowserModule`, the module every Angular browser-based app
must have. It also defines an empty `ngDoBootstrap()` method, to prevent the {@link Compiler
Compiler} from returning errors. This is necessary because the module will not have a `bootstrap`
declaration on its `NgModule` decorator.
-->
이 `NgModule`은 최소한의 코드로만 작성되었습니다.
브라우저에서 실행되는 모든 Angular 앱이 그렇듯이 `BrowserModule`을 로드하고 있으며, {@link Compiler Compiler}의 요구사항에 맞게 `ngDoBootstrap()` 메소드를 빈 내용으로 선언했습니다.
이 메소드는 `NgModule` 데코레이터에서 `bootstrap`을 지정하지 않았기 때문에 꼭 필요합니다.


<div class="alert is-important">

  <!--
  You do not add a `bootstrap` declaration to the `NgModule` decorator since AngularJS owns the root
  template of the app and `ngUpgrade` bootstraps the necessary components.
  -->
  `NgModule` 데코레이터에는 `bootstrap`을 지정하지 않았습니다. AngularJS는 직접 앱의 최상위 템플릿을 관리하며 `ngUpgrade`를 사용해서 부트스트랩합니다.

</div>

<!--
You can now link the AngularJS and Angular modules together using `downgradeModule()`.
-->
그리고 `downgradeModule()`를 다음과 같이 사용하면 AngularJS 모듈과 Angular 모듈을 연결할 수 있습니다.

<code-example header="app.module.ts">
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { downgradeModule } from '@angular/upgrade/static';

const bootstrapFn = (extraProviders: StaticProvider[]) => {
  const platformRef = platformBrowserDynamic(extraProviders);
  return platformRef.bootstrapModule(MainAngularModule);
};
const downgradedModule = downgradeModule(bootstrapFn);

angular.module('mainAngularJsModule', [
  downgradedModule
]);
</code-example>

<!--
The existing AngularJS code works as before _and_ you are ready to start adding Angular code.
-->
AngularJS 쪽에 원래 있던 코드는 이전과 마찬가지로 동작하며, 여기에 Angular 코드를 추가할 준비는 끝났습니다.


<!--
### Using Components and Injectables
-->
### 컴포넌트와 의존성 객체 활용하기

<!--
The differences between `downgradeModule()` and `UpgradeModule` end here. The rest of the
`upgrade/static` APIs and concepts work in the exact same way for both types of hybrid apps.
See [Upgrading from AngularJS](guide/upgrade) to learn about:

- [Using Angular Components from AngularJS Code](guide/upgrade#using-angular-components-from-angularjs-code).<br />
  _NOTE: If you are downgrading multiple modules, you need to specify the name of the downgraded
  module each component belongs to, when calling `downgradeComponent()`._
- [Using AngularJS Component Directives from Angular Code](guide/upgrade#using-angularjs-component-directives-from-angular-code).
- [Projecting AngularJS Content into Angular Components](guide/upgrade#projecting-angularjs-content-into-angular-components).
- [Transcluding Angular Content into AngularJS Component Directives](guide/upgrade#transcluding-angular-content-into-angularjs-component-directives).
- [Making AngularJS Dependencies Injectable to Angular](guide/upgrade#making-angularjs-dependencies-injectable-to-angular).
- [Making Angular Dependencies Injectable to AngularJS](guide/upgrade#making-angular-dependencies-injectable-to-angularjs).<br />
  _NOTE: If you are downgrading multiple modules, you need to specify the name of the downgraded
  module each injectable belongs to, when calling `downgradeInjectable()`._
-->
`downgradeModule()`을 사용하는 방식과 `UpgradeModule`을 사용하는 방식의 차이는 위에서 언급한 것까지 입니다.
`upgrade/static` API를 사용하는 방법와 작업 진행 방향은 이전에 하이브리드 앱에서 했던 것과 같습니다.
다음 내용에 대해 자세하게 알아보려면 [업그레이드 방법](guide/upgrade) 문서를 참고하세요:

- [AngularJS 영역에서 Angular 컴포넌트 사용하기](guide/upgrade#using-angular-components-from-angularjs-code).<br />
  _참고: 다운그레이드하는 모듈이 여러개라면 `downgradeComponent()`를 실행할 때 컴포넌트가 포함될 모듈의 이름을 정확하게 지정해야 합니다._
- [Angular 영역에서 AngularJS 컴포넌트 디렉티브 사용하기](guide/upgrade#using-angularjs-component-directives-from-angular-code)
- [AngularJS 컨텐츠를 Angular 컴포넌트로 프로젝션하기](guide/upgrade#projecting-angularjs-content-into-angular-components)
- [Angular 컨텐츠를 AngularJS 컴포넌트 디렉티브에 트랜스클루전하기](guide/upgrade#transcluding-angular-content-into-angularjs-component-directives)
- [AngularJS 의존성 객체를 Angular 영역에 주입하기](guide/upgrade#making-angularjs-dependencies-injectable-to-angular)
- [Angular 의존성 객체를 AngularJS 영역에 주입하기](guide/upgrade#making-angular-dependencies-injectable-to-angularjs).<br />
  _참고: 다운그레이드하는 모듈이 여러개라면 `downgradeInjectable()`을 실행할 때 의존성 객체가 포함될 모듈을 정확하게 지정해야 합니다._


<div class="alert is-important">

  <!--
  While it is possible to downgrade injectables, downgraded injectables will not be available until
  the Angular module that provides them is instantiated. In order to be safe, you need to ensure
  that the downgraded injectables are not used anywhere _outside_ the part of the app where it is
  guaranteed that their module has been instantiated.

  For example, it is _OK_ to use a downgraded service in an upgraded component that is only used
  from a downgraded Angular component provided by the same Angular module as the injectable, but it
  is _not OK_ to use it in an AngularJS component that may be used independently of Angular or use
  it in a downgraded Angular component from a different module.
  -->
  Angular 영역에 정의한 의존성 객체는 AngularJS용으로 다운그레이드할 수 있지만 이 객체의 인스턴스를 관리하는 Angular 모듈이 생성되기 전까지는 사용할 수 없습니다.
  그래서 이 객체를 안전하게 다루려면 Angular 모듈의 인스턴스가 확실하게 생성되지 않은 영역에서는 다운그레이드한 의존성 객체를 사용하지 않아야 합니다.

  예를 들면 이런식입니다.
  어떤 Angular 모듈에 있는 컴포넌트(A) 안에 AngularJS 컴포넌트(B)를 업그레이드해서 사용하는데, 같은 모듈에 있는 서비스를 다운그레이드해서 컴포넌트 B에 의존성으로 주입하는 경우는 괜찮습니다.
  컴포넌트 B는 컴포넌트 A가 있을 때만 존재하며 서비스도 같은 모듈에 있기 때문입니다.
  하지만 Angular 영역과는 관련이 없는 컴포넌트이거나 Angular 서비스가 선언된 모듈과 다른 모듈의 Angular 컴포넌트 안에 사용된 AngularJS 컴포넌트라면 Angular 서비스를 의존성으로 주입하면 안됩니다.

</div>


<!--
## Using ahead-of-time compilation with hybrid apps
-->
## 하이브리드 앱에 AOT 컴파일러 활용하기

<!--
You can take advantage of ahead-of-time (AOT) compilation in hybrid apps just like in any other
Angular app. The setup for a hybrid app is mostly the same as described in the
[Ahead-of-Time Compilation](guide/aot-compiler) guide save for differences in `index.html` and
`main-aot.ts`.

AOT needs to load any AngularJS files that are in the `<script>` tags in the AngularJS `index.html`.
An easy way to copy them is to add each to the `copy-dist-files.js` file.

You also need to pass the generated `MainAngularModuleFactory` to `downgradeModule()` instead of the
custom bootstrap function:
-->
하이브리드 앱에서도 물론 AOT 컴파일러를 사용할 수 있습니다.
그리고 설정방법은 [AOT 컴팜일러](guide/aot-compiler) 문서에서 설명한 것과 거의 비슷하며 `index.html` 파일과 `main-aot.ts` 파일에 작성하는 내용만 조금 다릅니다.

AOT 컴파일러가 AngularJS 파일을 로드하려면 AngularJS용 `index.html` 파일에서 `<script>` 태그로 로드해야 합니다.
그리고 이 과정은 `copy-dist-files.js` 스크립트 파일로 처리하는 것이 간단합니다.

그리고 AngularJS 영역에 모듈을 등록하기 위해 `MainAngularModuleNgFactory`를 `downgradeModule()`로 변환하는 코드를 다음과 같이 작성하면 됩니다:

<code-example header="app/main-aot.ts">
import { downgradeModule } from '@angular/upgrade/static';
import { MainAngularModuleNgFactory } from '../aot/app/app.module.ngfactory';

const downgradedModule = downgradeModule(MainAngularModuleNgFactory);

angular.module('mainAngularJsModule', [
  downgradedModule
]);
</code-example>

<!--
And that is all you need to do to get the full benefit of AOT for hybrid Angular apps.
-->
이제 하이브리드 Angular 앱에서도 AOT 컴파일러의 효과를 체험할 준비는 끝났습니다.


<!--
## Conclusion
-->
## 정리

<!--
This page covered how to use the {@link upgrade/static upgrade/static} package to incrementally
upgrade existing AngularJS apps at your own pace and without impeding further development of the app
for the duration of the upgrade process.

Specifically, this guide showed how you can achieve better performance and greater flexibility in
your hybrid apps by using {@link downgradeModule downgradeModule()} instead of {@link UpgradeModule
UpgradeModule}.

To summarize, the key differentiating factors of `downgradeModule()` are:

1. It allows instantiating or even loading the Angular part lazily, which improves the initial
   loading time. In some cases this may waive the cost of running a second framework altogether.
2. It improves performance by avoiding unnecessary change detection runs while giving the developer
   greater ability to customize.
3. It does not require you to change how you bootstrap your AngularJS app.

Using `downgradeModule()` is a good option for hybrid apps when you want to keep the AngularJS and
Angular parts less coupled. You can still mix and match components and services from both
frameworks, but you might need to manually propagate change detection. In return,
`downgradeModule()` offers more control and better performance.
-->
이 문서에서는 {@link upgrade/static upgrade/static} 패키지를 사용해서 AngularJS 앱을 업그레이드하는 방법에 대해 알아봤습니다.

특히 이 문서에서는 {@link UpgradeModule UpgradeModule} 방식 대신 {@link downgradeModule downgradeModule()}를 사용해서 이전보다 더 빠르고 유연하게 동작하는 환경을 구성해 봤습니다.

`downgradeModule()`을 사용하는 방식의 특징은 이렇습니다:

1. 이 방식은 Angular 구성요소를 지연로딩하기 때문에 최초 실행 속도가 빠릅니다. 상황에 따라 AngularJS 프레임워크는 로드하지 않을수도 있습니다.
2. 필요하지 않은 변화 감지는 생략하기 때문에 앱 실행 성능도 향상됩니다.
3. AngularJS 앱을 부트스트랩하는 코드는 변경하지 않아도 됩니다.

AngularJS 부분과 Angular 부분의 결합도를 높이지 않으면서 앱을 업그레이드하려면 `downgradeModule()`을 사용하는 방식이 더 유리할 수 있습니다.
그리고 이전과 마찬가지로 양쪽 프레임워크의 컴포넌트와 서비스를 함께 활용할 수 있으며 필요하면 다른 프레임워크 쪽으로 변화 감지 트리거를 전달할 수도 있습니다.
`downgradeModule()`을 활용하면 `UpgradeModule`을 사용하는 방식과 비교해서 좀 더 타이트하게 앱을 조작할 수 있으며 앱 실행 성능도 더 향상시킬 수 있습니다.
