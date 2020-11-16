<!--
# Hierarchical injectors
-->
# 인젝터 계층

<!--
Injectors in Angular have rules that you can leverage to
achieve the desired visibility of injectables in your apps.
By understanding these rules, you can determine in which
NgModule, Component or Directive you should declare a provider.
-->
인젝터(injector)는 어떤 규칙을 갖고 필요한 곳에 의존성으로 무언가를 주입합니다.
인젝터가 동작하는 규칙은 프로바이더를 등록한 NgModule, Component, Directive에 따라 달라집니다.

<!--
## Two injector hierarchies
-->
## 두 종류의 인젝터 계층

<!--
There are two injector hierarchies in Angular:

1. `ModuleInjector` hierarchy&mdash;configure a `ModuleInjector`
in this hierarchy using an `@NgModule()` or `@Injectable()` annotation.
1. `ElementInjector` hierarchy&mdash;created implicitly at each
DOM element. An `ElementInjector` is empty by default
unless you configure it in the `providers` property on
`@Directive()` or `@Component()`.
-->
Angular의 인젝터 계층은 두 종류로 구분할 수 있습니다:

1. `ModuleInjector` 계층&dash;`@NgModule`이나 `@Injectable()` 어노테이션을 사용하면 `ModuleInjector`에 등록됩니다.
1. `ElementInjector` 계층&mdash;`@Directive()`나 `@Component()`의 `providers` 프로퍼티를 설정하면 `ElementInjector`에 등록됩니다. 따로 등록하지 않으면 이 계층은 비어있으며, 프로바이더가 등록되면 개별 DOM 엘리먼트마다 구성됩니다.


{@a register-providers-injectable}

### `ModuleInjector`

<!--
The `ModuleInjector` can be configured in one of two ways:

* Using the `@Injectable()` `providedIn` property to
refer to `@NgModule()`, or `root`.
* Using the `@NgModule()` `providers` array.

<div class="is-helpful alert">

<h4>Tree-shaking and <code>@Injectable()</code></h4>

Using the `@Injectable()` `providedIn` property is preferable
to the `@NgModule()` `providers`
array because with `@Injectable()` `providedIn`, optimization
tools can perform
tree-shaking, which removes services that your app isn't
using and results in smaller bundle sizes.

Tree-shaking is especially useful for a library
because the application which uses the library may not have
a need to inject it. Read more
about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers)
in [DI Providers](guide/dependency-injection-providers).

</div>

`ModuleInjector` is configured by the `@NgModule.providers` and
`NgModule.imports` property. `ModuleInjector` is a flattening of
all of the providers arrays which can be reached by following the
`NgModule.imports` recursively.

Child `ModuleInjector`s are created when lazy loading other `@NgModules`.

Provide services with the `providedIn` property of `@Injectable()` as follows:

```ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // <--provides this service in the root ModuleInjector
})
export class ItemService {
  name = 'telephone';
}

```

The `@Injectable()` decorator identifies a service class.
The `providedIn` property configures a specific `ModuleInjector`,
here `root`, which makes the service available in the `root` `ModuleInjector`.
-->
`ModuleInjector`는 두가지 방법으로 설정할 수 있습니다:

* `@Injectable()` 데코레이터의 `providedIn` 프로퍼티에 `@NgModule()`이나 `root`를 지정합니다.
* `@NgModule`의 `providers` 배열을 사용합니다.

<div class="is-helpful alert">

<h4>트리 셰이킹(tree-shaking)과 <code>@Injectable()</code></h4>

`@NgModule()`에 `providers`를 등록하는 방법보다는 `@Injectable()`의 `providedIn` 프로퍼티를 사용하는 방법을 더 권장합니다.
`@Injectable()`의 `providedIn` 프로퍼티를 `root`로 설정하면 최적화 툴이 트리 셰이킹 대상인지 검사하고 사용되지 않는 빌드 결과물에서 제거하기 때문에 빌드 결과물의 크기를 더 줄일 수 있습니다.

특히 트리 셰이킹은 다른 라이브러리를 많이 활용하는 라이브러리 프로젝트에 더 효율적입니다.
자세한 내용은 [트리 셰이킹 대상이 되는 프로바이더](guide/dependency-injection-providers#tree-shakable-providers) 문서와 [의존성 프로바이더](guide/dependency-injection-providers) 문서를 참고하세요.

</div>

`ModuleInjector`는 `@NgModule.providers`나 `@NgModule.imports` 프로퍼티에 의해 구성됩니다.
모듈에서 `imports` 배열로 로드하는 모든 프로바이더는 중첩된 모듈을 순회하며 이 계층에 병렬로 구성됩니다.

그리고 지연로딩되는 `@NgModules`가 있다면 자식 `ModuleInjector`가 따로 구성됩니다.

서비스 프로바이더를 등록하려면 `@Injectable()`의 `providedIn` 프로퍼티를 다음과 같이 구성하면 됩니다:

```ts

import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'  // <--이 서비스를 root ModuleInjector에 등록합니다.
})
export class ItemService {
  name = 'telephone';
}

```

`@Injectable()` 데코레이터는 서비스 클래스를 구분하는 데코레이터입니다.
그리고 `providedIn` 프로퍼티 값을 `root`로 설정하면 이 서비스가 `root` `ModuleInjector`에 등록됩니다.


<!--
#### Platform injector
-->
#### 플랫폼 인젝터

<!--
There are two more injectors above `root`, an
additional `ModuleInjector` and `NullInjector()`.

Consider how Angular bootstraps the app with the
following in `main.ts`:

```javascript
platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {...})
```

The `bootstrapModule()` method creates a child injector of
the platform injector which is configured by the `AppModule`.
This is the `root` `ModuleInjector`.

The `platformBrowserDynamic()` method creates an injector
configured by a `PlatformModule`, which contains platform-specific
dependencies. This allows multiple apps to share a platform
configuration.
For example, a browser has only one URL bar, no matter how
many apps you have running.
You can configure additional platform-specific providers at the
platform level by supplying `extraProviders` using the `platformBrowser()` function.

The next parent injector in the hierarchy is the `NullInjector()`,
which is the top of the tree. If you've gone so far up the tree
that you are looking for a service in the `NullInjector()`, you'll
get an error unless you've used `@Optional()` because ultimately,
everything ends at the `NullInjector()` and it returns an error or,
in the case of `@Optional()`, `null`. For more information on
`@Optional()`, see the [`@Optional()` section](guide/hierarchical-dependency-injection#optional) of this guide.

The following diagram represents the relationship between the
`root` `ModuleInjector` and its parent injectors as the
previous paragraphs describe.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/injectors.svg" alt="NullInjector, ModuleInjector, root injector">
</div>

While the name `root` is a special alias, other `ModuleInjector`s
don't have aliases. You have the option to create `ModuleInjector`s
whenever a dynamically loaded component is created, such as with
the Router, which will create child `ModuleInjector`s.

All requests forward up to the root injector, whether you configured it
with the `bootstrapModule()` method, or registered all providers
with `root` in their own services.

<div class="alert is-helpful">

<h4><code>@Injectable()</code> vs. <code>@NgModule()</code></h4>

If you configure an app-wide provider in the `@NgModule()` of
`AppModule`, it overrides one configured for `root` in the
`@Injectable()` metadata. You can do this to configure a
non-default provider of a service that is shared with multiple apps.

Here is an example of the case where the component router
configuration includes
a non-default [location strategy](guide/router#location-strategy)
by listing its provider
in the `providers` list of the `AppModule`.

<code-example path="dependency-injection-in-action/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)">

</code-example>

</div>
-->
`root` 인젝터보다 더 상위 계층에 존재하는 인젝터가 있습니다.
`ModuleInjector`와 `NullInjector()`가 이 계층에 존재합니다.

Angular 앱이 부트스트랩되는 `main.ts` 파일을 보면 이런 코드가 있습니다:

```javascript
platformBrowserDynamic().bootstrapModule(AppModule).then(ref => {...})
```

`bootstrapModule()` 메소드는 플랫폼 인젝터를 기준으로 `AppModule`부터 자식 모듈을 순회하며 자식 인젝터를 생성합니다.
그리고 이때 처음 구성되는 것이 `root` `ModuleInjector` 입니다.

`platformBrowserDynamic()` 메소드는 플랫폼마다 다르게 구성되는 `PlatformModule` 설정에 따라 인젝터를 생성합니다.
그리고 이 플랫폼 설정은 여러 앱이 공유할 수도 있습니다.
예를 들어 브라우저라면 주소표시줄이 하나밖에 없기 때문에 앱이 여러개 실행되더라도 관계없습니다.
그리고 `platformBrowser()` 함수에 `extraProviders` 옵션을 사용하면 플랫폼마다 필요한 서비스 프로바이더를 따로 등록할 수도 있습니다.

플랫폼 인젝터 바로 아래 계층에는 `NulInjector()`가 있습니다.
그래서 서비스 인스턴스를 찾아서 인젝터 트리를 쭉 따라 올라가다보면 마지막 단계에서 `NullInjector()`를 만나게 되며, `@Optional()` 데코레이터가 사용되지 않았다면 에러가 발생합니다.
`@Optional()` 데코레이터에 대해 자세하게 알아보려면 이 문서의 [`@Optional()` 섹션](guide/hierarchical-dependency-injection#optional)을 참고하세요.

`root` `ModuleInjector`와 플랫폼, `NullInjector`의 관계는 아래 그림으로 확인해 보세요.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/injectors.svg" alt="NullInjector, ModuleInjector, root injector">
</div>

`root` 인젝터는 다른 `ModuleInjector`와는 다르게 `root`라는 이름을 갖습니다.
다른 `ModuleInjector`는 이름이 없습니다.
모듈이 지연로딩되는 경우에는 컴포넌트도 동적으로 생성되기 때문에 라우터 설정이 따로 필요할 수 있습니다.
그래서 자식 `ModuleInjector`를 생성할 때 이 인젝터에 대한 옵션을 지정할 수 있습니다.

`bootstrapModule()` 메소드를 구성했거나 서비스 프로바이더를 `root`에 등록한 경우 모두 의존성 객체를 찾는 요청은 `root` 인젝터까지 올라갑니다.

<div class="alert is-helpful">

<h4><code>@Injectable()</code> vs. <code>@NgModule()</code></h4>

`@Injectable()`에 `providedIn: root`를 설정하는 것보다 `AppModule`의 `@NgModule()` 설정이 더 우선순위가 높습니다.
그래서 여러 앱에서 사용하지만 기본값을 변경하는 프로바이더는 이런 방식으로 등록하는 것이 더 좋습니다.

[로케이션 정책](guide/router#location-strategy)의 기본값을 바꾸는 라우터 설정이 필요하다면 다음과 같이 사용하면 됩니다:

<code-example path="dependency-injection-in-action/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers 배열)">

</code-example>

</div>


### `ElementInjector`

<!--
Angular creates `ElementInjector`s implicitly for each DOM element.

Providing a service in the `@Component()` decorator using
its `providers` or `viewProviders`
property configures an `ElementInjector`.
For example, the following `TestComponent` configures the `ElementInjector`
by providing the service as follows:

```ts
@Component({
  ...
  providers: [{ provide: ItemService, useValue: { name: 'lamp' } }]
})
export class TestComponent

```

<div class="alert is-helpful">

**Note:** Please see the
[resolution rules](guide/hierarchical-dependency-injection#resolution-rules)
section to understand the relationship between the `ModuleInjector` tree and
the `ElementInjector` tree.

</div>


When you provide services in a component, that service is available via
the `ElementInjector` at that component instance.
It may also be visible at
child component/directives based on visibility rules described in the [resolution rules](guide/hierarchical-dependency-injection#resolution-rules) section.

When the component instance is destroyed, so is that service instance.
-->
개별 DOM 엘리먼트에는 `ElementInjector`가 생성됩니다.

`@Component()` 데코레이터의 `providers`나 `viewProviders`를 설정하면 `ElementInjector`에 서비스 프로바이더가 등록됩니다.
그래서 `TestComponent`에 `ElementInjector`를 구성하려면 다음과 같이 서비스 프로바이더를 등록하면 됩니다:

```ts
@Component({
  ...
  providers: [{ provide: ItemService, useValue: { name: 'lamp' } }]
})
export class TestComponent

```

<div class="alert is-helpful">

**참고:** `ModuleInjector` 트리와 `ElementInjector` 트리의 관계에 대해 자세하게 알아보려면 [의존성 토큰 결정 규칙](guide/hierarchical-dependency-injection#resolution-rules) 섹션을 참고하세요.

</div>

컴포넌트에 서비스 프로바이더를 등록하면 이 컴포넌트에 `ElementInjector`가 구성되기 때문에 서비스 인스턴스를 사용할 수 있습니다.
그리고 [의존성 토큰 결정 규칙](guide/hierarchical-dependency-injection#resolution-rules)에 따라 이 컴포넌트의 자식 컴포넌트나 디렉티브에서도 서비스의 인스턴스를 사용할 수 있습니다.

컴포넌트 인스턴스가 종료되면 컴포넌트에 등록된 서비스의 인스턴스도 함께 종료됩니다.


<!--
#### `@Directive()` and `@Component()`
-->
#### `@Directive()`와 `@Component()`

<!--
A component is a special type of directive, which means that
just as `@Directive()` has a `providers` property, `@Component()` does too.
This means that directives as well as components can configure
providers, using the `providers` property.
When you configure a provider for a component or directive
using the `providers` property,
that provider belongs to the `ElementInjector` of that component or
directive.
Components and directives on the same element share an injector.
-->
컴포넌트는 디렉티브의 종류 중 하나라고 볼 수 있습니다.
그래서 `@Directive()`와 `@Component()`는 모두 `providers` 프로퍼티를 사용할 수 있습니다.
컴포넌트나 디렉티브의 `providers` 프로퍼티를 설정하면 서비스 프로바이더는 해당 컴포넌트나 디렉티브의 `ElementInjector`에 등록됩니다.
엘리먼트에 컴포넌트와 디렉티브가 함께 사용되었다면 같은 인젝터를 공유합니다.


{@a resolution-rules}

<!--
## Resolution rules
-->
## 의존성 토큰 결정 규칙

<!--
When resolving a token for a component/directive, Angular
resolves it in two phases:

1. Against the `ElementInjector` hierarchy (its parents)
1. Against the `ModuleInjector` hierarchy (its parents)

When a component declares a dependency, Angular tries to satisfy that
dependency with its own `ElementInjector`.
If the component's injector lacks the provider, it passes the request
up to its parent component's `ElementInjector`.

The requests keep forwarding up until Angular finds an injector that can
handle the request or runs out of ancestor `ElementInjector`s.

If Angular doesn't find the provider in any `ElementInjector`s,
it goes back to the element where the request originated and looks
in the `ModuleInjector` hierarchy.
If Angular still doesn't find the provider, it throws an error.

If you have registered a provider for the same DI token at
different levels, the first one Angular encounters is the one
it uses to resolve the dependency. If, for example, a provider
is registered locally in the component that needs a service,
Angular doesn't look for another provider of the same service.
-->
컴포넌트나 디렉티브에 의존성 토큰이 사용되면 인젝터는 다음 규칙에 따라 토큰을 결정합니다:

1. (부모를 따라가며) `ElementInjector` 계층에 따라
1. (부모를 따라가며) `ModuleInjector` 계층에 따라

컴포넌트가 의존성 객체를 요구하면 Angular는 먼저 이 객체의 프로바이더를 `ElementInjector`에서 찾습니다.
그리고 컴포넌트 인젝터에서 프로바이더를 찾지 못하면 부모 컴포넌트의 `ElementInjector`를 따라 올라가며 프로바이더를 찾습니다.

이 요청은 부모 인젝터를 따라가다가 원하는 프로바이더를 찾을 때까지 계속되며, 찾지 못하면 `ElementInjector` 계층이 끝날때까지 계속됩니다.

그리고 `ElementInjector` 트리 전체에서 원하는 프로바이더를 찾지 못하면 다시 원래 엘리먼트로 돌아가서 `ModuleInjector` 계층을 탐색합니다.
`ModuleInjector` 계층에서도 프로바이더를 찾지 못하면 에러가 발생합니다.

같은 의존성 토큰을 여러번 사용하면 프로바이더를 찾는 탐색과정에서 먼저 만나는 프로바이더가 사용됩니다.
그래서 서비스 프로바이더가 등록된 컴포넌트에서 이 서비스의 의존성 객체를 요청하면 언제나 같은 서비스 프로바이더를 사용합니다.


<!--
## Resolution modifiers
-->
## 의존성 토큰 결정 규칙을 변경하는 데코레이터

<!--
Angular's resolution behavior can be modified with `@Optional()`, `@Self()`,
`@SkipSelf()` and `@Host()`. Import each of them from `@angular/core`
and use each in the component class constructor when you inject your service.

For a working app showcasing the resolution modifiers that
this section covers, see the <live-example name="resolution-modifiers">resolution modifiers example</live-example>.
-->
`@Optional()`, `@Self()`, `SkipSelf()`, `@Host()` 데코레이터를 사용하면 의존성 토큰을 결정하는 규칙을 변경할 수 있습니다.
이 데코레이터들은 `@angular/core` 패키지에서 로드할 수 있으며 클래스 생성자에서 의존성으로 주입하려는 서비스 앞에 붙이면 됩니다.

각 데코레이터가 어떻게 동작하는지 직접 확인하려면 <live-example name="resolution-modifiers">의존성 토큰 결정 규칙을 변경하는 데코레이터 예제</live-example>를 참고하세요.

<!--
### Types of modifiers
-->
### 타입

<!--
Resolution modifiers fall into three categories:

1. What to do if Angular doesn't find what you're
looking for, that is `@Optional()`
2. Where to start looking, that is `@SkipSelf()`
3. Where to stop looking, `@Host()` and `@Self()`

By default, Angular always starts at the current `Injector` and keeps
searching all the way up. Modifiers allow you to change the starting
(self) or ending location.

Additionally, you can combine all of the modifiers except `@Host()` and `@Self()` and of course `@SkipSelf()` and `@Self()`.
-->
데코레이터는 용도에 따라 3종류로 구분할 수 있습니다:

1. `@Optional()` &mdash; 프로바이더를 찾지 못하면 생략해도 된다는 것을 의미합니다.
1. `@SkipSelf()` &mdash; 탐색을 시작할 지점을 변경합니다.
1. `@Host()`, `@Self()` &mdash; 탐색을 멈출 지점을 변경합니다.

기본적으로 Angular는 의존성 주입을 요구한 계층의 `Injector` 부터 탐색을 시작하며, 부모 인젝터를 따라 올라가는 방향으로 동작합니다.
위에서 언급한 데코레이터를 사용하면 이 탐색이 시작되는 위치나 종료되는 위치를 조정할 수 있습니다.

그리고 위 데코레이터 중에 역할이 충돌하는 `@Host()`와 `@Self()`, `@SkipSelf()`와 `@Self()`를 제외하면 함께 사용할 수 있습니다.


{@a optional}

### `@Optional()`

<!--
`@Optional()` allows Angular to consider a service you inject to be optional.
This way, if it can't be resolved at runtime, Angular simply
resolves the service as `null`, rather than throwing an error. In
the following example, the service, `OptionalService`, isn't provided in
the service, `@NgModule()`, or component class, so it isn't available
anywhere in the app.
-->
`@Optional()` 데코레이터를 사용하면 Angular가 서비스 프로바이더를 찾지 못했을 때 에러가 발생하는 대신 `null` 값을 주입합니다.
아래 예제에서 `OptionalService`는 `@NgModule()`이나 컴포넌트 클래스 어디에도 프로바이더가 등록되어 있지 않지만 에러 없이 실행됩니다.

<code-example path="resolution-modifiers/src/app/optional/optional.component.ts" header="resolution-modifiers/src/app/optional/optional.component.ts" region="optional-component">

</code-example>


### `@Self()`

<!--
Use `@Self()` so that Angular will only look at the `ElementInjector` for the current component or directive.

A good use case for `@Self()` is to inject a service but only if it is
available on the current host element. To avoid errors in this situation,
combine `@Self()` with `@Optional()`.

For example, in the following `SelfComponent`, notice
the injected `LeafService` in
the constructor.
-->
`@Self()` 데코레이터를 사용하면 Angular는 현재 계층의 컴포넌트/디렉티브의 `ElementInjector`에서만 서비스 프로바이더를 찾습니다.

이 데코레이터는 의존성으로 주입하는 서비스가 현재 계층에서 유효할 때만 주입하는 용도로 사용합니다.
그래서 보통 `@Optional()`과 함께 사용합니다.

아래 예제에서 `SelfComponent`는 `LeafService`가 현재 계층에 존재할 때만 의존성으로 주입받습니다.

<code-example path="resolution-modifiers/src/app/self-no-data/self-no-data.component.ts" header="resolution-modifiers/src/app/self-no-data/self-no-data.component.ts" region="self-no-data-component">

</code-example>

<!--
In this example, there is a parent provider and injecting the
service will return the value, however, injecting the service
with `@Self()` and `@Optional()` will return `null` because
`@Self()` tells the injector to stop searching in the current
host element.

Another example shows the component class with a provider
for `FlowerService`. In this case, the injector looks no further
than the current `ElementInjector` because it finds the `FlowerService` and returns the yellow flower 🌼.
-->
이렇게 구현하면 부모 컴포넌트에 서비스 프로바이더가 있더라도 `null`이 주입됩니다.
왜냐하면 현재 계층에서만 서비스 프로바이더를 탐색하도록 `@Self()` 데코레이터를 사용했기 때문입니다.

아래 코드에서는 컴포넌트 클래스에 `FlowerService`의 프로바이더가 등록되어 있습니다.
그러면 현재 계층의 `ElementInjector`에서 서비스 프로바이더를 찾을 수 있기 때문에 `FlowerService`에 🌼가 주입됩니다.


<code-example path="resolution-modifiers/src/app/self/self.component.ts" header="resolution-modifiers/src/app/self/self.component.ts" region="self-component">

</code-example>

### `@SkipSelf()`

<!--
`@SkipSelf()` is the opposite of `@Self()`. With `@SkipSelf()`, Angular
starts its search for a service in the parent `ElementInjector`, rather than
in the current one. So if the parent `ElementInjector` were using the value  `🌿`  (fern)
for `emoji` , but you had  `🍁`  (maple leaf) in the component's `providers` array,
Angular would ignore  `🍁`  (maple leaf) and use  `🌿`  (fern).

To see this in code, assume that the following value for `emoji` is what the parent component were using, as in this service:

<code-example path="resolution-modifiers/src/app/leaf.service.ts" header="resolution-modifiers/src/app/leaf.service.ts" region="leafservice">

</code-example>

Imagine that in the child component, you had a different value, `🍁` (maple leaf) but you wanted to use the parent's value instead. This is when you'd use `@SkipSelf()`:

<code-example path="resolution-modifiers/src/app/skipself/skipself.component.ts" header="resolution-modifiers/src/app/skipself/skipself.component.ts" region="skipself-component">

</code-example>

In this case, the value you'd get for `emoji` would be `🌿` (fern), not `🍁` (maple leaf).
-->
`@SkipSelf()`는 `@Self()`와 반대입니다.
`@SkipSelf()`를 사용하면 서비스 프로바이더를 찾을 때 현재 계층을 건너 뛰고 부모 계층의 `ElementInjector` 부터 탐색합니다.
그래서 부모 `@lementInjector`에 `emoji` 값이 `🌿`로 지정되어 있기 때문에 현재 컴포넌트 `providers` 배열에 지정된 `🍁` 대신 `🌿`가 주입됩니다.

이 내용을 코드로 봅시다.
아래 코드에서 `LeafService` 안에 지정된 `emoji`의 값은 `🌿`입니다:

<code-example path="resolution-modifiers/src/app/leaf.service.ts" header="resolution-modifiers/src/app/leaf.service.ts" region="leafservice">

</code-example>

자식 컴포넌트에는 이 값이 `🍁`로 지정되어 있지만, 현재 계층이 아니라 부모 계층에서 주입하는 값을 사용하도록 구현하려면 `@SkipSelf()` 데코레이터를 다음과 같이 사용하면 됩니다:

<code-example path="resolution-modifiers/src/app/skipself/skipself.component.ts" header="resolution-modifiers/src/app/skipself/skipself.component.ts" region="skipself-component">

</code-example>

그래서 이 코드가 실행되었을 때 받는 서비스의 `emoji` 프로퍼티 값은 `🍁`가 아니라 `🌿` 입니다.


<!--
#### `@SkipSelf()` with `@Optional()`
-->
#### `@SkipSelf()`과 함께 사용하는 `@Optional()`

<!--
Use `@SkipSelf()` with `@Optional()` to prevent an error if the value is `null`. In the following example, the `Person` service is injected in the constructor. `@SkipSelf()` tells Angular to skip the current injector and `@Optional()` will prevent an error should the `Person` service be `null`.
-->
의존성으로 주입되는 객체가 `null`이어도 괜찮다면 `@SkipSelf()`를 사용할 때 `@Optional()` 데코레이터도 함께 사용해야 합니다.
아래 예제에서 `Person` 클래스 생성자에는 `parent`가 의존성으로 주입되어야 합니다.
이 때 `@SkipSelf()`를 사용했기 때문에 현재 계층의 인젝터를 건너뛰고 프로바이더를 찾게 되며, 원하는 의존성 객체를 찾지 못하더라도 `@Optional()`을 사용했기 때문에 에러가 발생하지 않고 `null`이 주입됩니다.

``` ts
class Person {
  constructor(@Optional() @SkipSelf() parent?: Person) {}
}
```

### `@Host()`

<!--
`@Host()` lets you designate a component as the last stop in the injector tree when searching for providers. Even if there is a service instance further up the tree, Angular won't continue looking. Use `@Host()` as follows:

<code-example path="resolution-modifiers/src/app/host/host.component.ts" header="resolution-modifiers/src/app/host/host.component.ts" region="host-component">

</code-example>


Since `HostComponent` has `@Host()` in its constructor, no
matter what the parent of `HostComponent` might have as a
`flower.emoji` value,
the `HostComponent` will use `🌼` (yellow flower).
-->
`@Host()` 데코레이터를 사용하면 의존성으로 주입하는 객체의 프로바이더를 찾는 범위를 호스트 엘리먼트까지로 제한합니다.
그 위쪽에 실제로 서비스 인스턴스가 있더라도 이 인스턴스는 탐색대상이 아닙니다.
`@Host()`는 이렇게 사용합니다:

<code-example path="resolution-modifiers/src/app/host/host.component.ts" header="resolution-modifiers/src/app/host/host.component.ts" region="host-component">

</code-example>

`HostComponent`의 생성자에는 `@Host()` 데코레이터가 사용되었기 때문에 `HostComponent`의 부모 계층에 있는 `flower.emoji`의 값은 고려할 대상이 아닙니다.
`HostComponent`에는 `🌼`가 주입됩니다.


<!--
## Logical structure of the template
-->
## 템플릿의 논리 구조

<!--
When you provide services in the component class, services are
visible within the `ElementInjector` tree relative to where
and how you provide those services.

Understanding the underlying logical structure of the Angular
template will give you a foundation for configuring services
and in turn control their visibility.

Components are used in your templates, as in the following example:
-->
컴포넌트 클래스에 서비스 프로바이더가 등록되면 서비스는 `ElementInjector` 트리에 등록되기 때문에 자식 컴포넌트에서 이 서비스를 사용할 수 있습니다.

이번에는 이 서비스가 템플릿의 논리 구조 관점에서는 어떻게 구성되는지 살펴봅시다.

컴포넌트 템플릿 코드는 이렇게 작성되었습니다:

```
<app-root>
    <app-child></app-child>
</app-root>
```

<div class="alert is-helpful">

<!--
**Note:** Usually, you declare the components and their
templates in separate files. For the purposes of understanding
how the injection system works, it is useful to look at them
from the point of view of a combined logical tree. The term
logical distinguishes it from the render tree (your application
DOM tree). To mark the locations of where the component
templates are located, this guide uses the `<#VIEW>`
pseudo element, which doesn't actually exist in the render tree
and is present for mental model purposes only.
-->
**참고:** 일반적으로 컴포넌트 클래스 파일과 템플릿 파일은 별개로 구성합니다.
그리고 의존성 주입 시스템의 관점에서, 논리적 트리를 구성하는 관점에서는 이 방식이 더 효율적입니다.
이 때 논리적이라는 말은 렌더링되는 DOM 트리와 구별하기 위해 사용한 단어입니다.
컴포넌트 템플릿이 위치하는 곳을 표시하기 위해 이 섹션에서는 `<#VIEW>`라는 유사 엘리먼트를 사용해 봅시다.
이 엘리먼트가 실제로 존재하는 것은 아니며, 어떤 개념인지 설명하기 위한 것입니다.

</div>

<!--
The following is an example of how the `<app-root>` and `<app-child>` view trees are combined into a single logical tree:
-->
아래 예제에서 `<app-root>`와 `<app-child>` 뷰 트리는 다음과 같은 논리 트리로 구성됩니다:

```
<app-root>
  <#VIEW>
    <app-child>
     <#VIEW>
       ...content goes here...
     </#VIEW>
    </app-child>
  <#VIEW>
</app-root>
 ```

<!--
Understanding the idea of the `<#VIEW>` demarcation is especially significant when you configure services in the component class.
-->
컴포넌트 클래스에 등록되는 서비스 프로바이더가 어떤 범위까지 유효한지 `<#VIEW>`가 위치하는 곳을 기준으로 생각해 보세요.


{@a providing-services-in-component}

<!--
## Providing services in `@Component()`
-->
## `@Component()`에 서비스 프로바이더 등록하기

<!--
How you provide services via an `@Component()` (or `@Directive()`)
decorator determines their visibility. The following sections
demonstrate `providers` and `viewProviders` along with ways to
modify service visibility with `@SkipSelf()` and `@Host()`.

A component class can provide services in two ways:

1. with a `providers` array

```typescript=
@Component({
  ...
  providers: [
    {provide: FlowerService, useValue: {emoji: '🌺'}}
  ]
})
```

2. with a `viewProviders` array

```typescript=
@Component({
  ...
  viewProviders: [
    {provide: AnimalService, useValue: {emoji: '🐶'}}
  ]
})
```

To understand how the `providers` and `viewProviders` influence service
visibility differently, the following sections build
a <live-example name="providers-viewproviders"></live-example>
step-by-step and compare the use of `providers` and `viewProviders`
in code and a logical tree.

<div class="alert is-helpful">

**NOTE:** In the logical tree, you'll see `@Provide`, `@Inject`, and
`@NgModule`, which are not real HTML attributes but are here to demonstrate
what is going on under the hood.

- `@Inject(Token)=>Value` demonstrates that if `Token` is injected at
this location in the logical tree its value would be `Value`.
- `@Provide(Token=Value)` demonstrates that there is a declaration of
`Token` provider with value `Value` at this location in the logical tree.
- `@NgModule(Token)` demonstrates that a fallback `NgModule` injector
should be used at this location.

</div>
-->
`@Component()`(또는 `@Directive()`)에 서비스 프로바이더를 등록하면 이 서비스를 의존성으로 주입받을 수 있습니다.
다음 섹션에서는 `providers`, `viewProviders`를 `@SkipSelf()`, `@Host()`와 함께 사용할 때 어떻게 달라지는지 알아봅시다.

서비스 프로바이더를 컴포넌트 클래스에 등록하는 방법은 두 가지 입니다:

1. `providers` 배열을 사용하는 방법

```typescript=
@Component({
  ...
  providers: [
    {provide: FlowerService, useValue: {emoji: '🌺'}}
  ]
})
```

2. `viewProviders` 배열을 사용하는 방법

```typescript=
@Component({
  ...
  viewProviders: [
    {provide: AnimalService, useValue: {emoji: '🐶'}}
  ]
})
```

`providers`와 `viewProviders`의 차이점을 살펴보려면 다음 섹션부터 설명하는 내용을 <live-example name="providers-viewproviders"></live-example>와 참고하면서 알아보세요.

<div class="alert is-helpful">

**참고:** 논리 트리의 관점에서는 `@Provide`, `@Inject`, `@NgModule`가 존재하지 않지만 이 섹션에서는 설명을 위해 잠시 개념을 가져오겠습니다.

- `@Inject(Token)=>Value`는 해당 논리 트리의 `Token`에 `Value`를 주입한다는 것을 의미합니다.
- `@Provide(Token=Value)`는 해당 논리 트리의 `Token` 프로바이더로 `Value`를 사용한다는 것을 의미합니다.
- `@NgModule(Token)`은 해당 논리 트리에서 사용하는 인젝터가 `NgModule`까지 도달한다는 것을 의미합니다.

</div>


<!--
### Example app structure
-->
### 예제 앱 구조

<!--
The example app has a `FlowerService` provided in `root` with an `emoji`
value of `🌺` (red hibiscus).
-->
이제부터 살펴볼 예제 앱에서 `FlowerService`는 `root`에 등록되어 있으며 이 서비스의 `emijo` 프로퍼티 값은 `🌺`가 할당되어 있습니다.

<code-example path="providers-viewproviders/src/app/flower.service.ts" header="providers-viewproviders/src/app/flower.service.ts" region="flowerservice">

</code-example>

<!--
Consider a simple app with only an `AppComponent` and a `ChildComponent`.
The most basic rendered view would look like nested HTML elements such as
the following:
-->
그리고 `AppComponent`와 `ChildComponent`로 구성된 앱을 생각해 봅시다.
기본적으로 다음과 같이 구성할 것입니다:

```
<app-root> <!-- AppComponent 셀렉터 -->
    <app-child> <!-- ChildComponent 셀렉터 -->
    </app-child>
</app-root>
```

<!--
However, behind the scenes, Angular uses a logical view
representation as follows when resolving injection requests:
-->
그런데 이와 별개로 Angular는 의존성 주입을 처리하기 위해 다음과 같은 논리 구조의 화면을 구성합니다:


```
<app-root> <!-- AppComponent 셀렉터 -->
    <#VIEW>
        <app-child> <!-- ChildComponent 셀렉터 -->
            <#VIEW>
            </#VIEW>
        </app-child>
    </#VIEW>
</app-root>
 ```

<!--
The `<#VIEW>` here represents an instance of a template.
Notice that each component has its own `<#VIEW>`.

Knowledge of this structure can inform how you provide and
inject your services, and give you complete control of service visibility.

Now, consider that `<app-root>` simply injects the `FlowerService`:
-->
이 코드에서 사용한 `<#VIEW>`는 템플릿 인스턴스를 표현한 것입니다.
컴포넌트마다 `<#VIEW>`가 존재하는 것을 자세히 보세요.

이 구조를 명심하고 있어야 프로바이더가 어떻게 등록되는지, 어떻게 의존성 객체로 주입되는지, 서비스를 어느 범위까지 접근할 수 있을지 제대로 이해할 수 있습니다.

`<app-root>`에 `FlowerService`를 주입해 봅시다:


<code-example path="providers-viewproviders/src/app/app.component.1.ts" header="providers-viewproviders/src/app/app.component.ts" region="injection">

</code-example>

<!--
Add a binding to the `<app-root>` template to visualize the result:
-->
그리고 `<app-root>` 템플릿은 이렇게 작성합니다:

<code-example path="providers-viewproviders/src/app/app.component.html" header="providers-viewproviders/src/app/app.component.html" region="binding-flower">

</code-example>

<!--
The output in the view would be:
-->
이 예제 앱은 이렇게 표시됩니다:

```
Emoji from FlowerService: 🌺
```

<!--
In the logical tree, this would be represented as follows:
-->
그리고 논리 트리 관점에서는 이렇게 구성됩니다:

```
<app-root @NgModule(AppModule)
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW>
    <p>Emoji from FlowerService: {{flower.emoji}} (🌺)</p>
    <app-child>
      <#VIEW>
      </#VIEW>
     </app-child>
  </#VIEW>
</app-root>
```

<!--
When `<app-root>` requests the `FlowerService`, it is the injector's job
to resolve the `FlowerService` token. The resolution of the token happens
in two phases:

1. The injector determines the starting location in the logical tree and
an ending location of the search. The injector begins with the starting
location and looks for the token at each level in the logical tree. If
the token is found it is returned.
2. If the token is not found, the injector looks for the closest
parent `@NgModule()` to delegate the request to.

In the example case, the constraints are:

1. Start with `<#VIEW>` belonging to `<app-root>` and end with `<app-root>`.

  - Normally the starting point for search is at the point
  of injection. However, in this case `<app-root>`  `@Component`s
  are special in that they also include their own `viewProviders`,
  which is why the search starts at `<#VIEW>` belonging to `<app-root>`.
  (This would not be the case for a directive matched at the same location).
  - The ending location just happens to be the same as the component
  itself, because it is the topmost component in this application.

2. The `AppModule` acts as the fallback injector when the
injection token can't be found in the `ElementInjector`s.
-->
`<app-root>`에서 `FlowerService`를 의존성으로 주입하도록 요청하면 인젝터가 `FlowerService` 토큰을 탐색하기 시작하는데, 이 탐색 과정은 두 단계로 진행됩니다:

1. 논리 트리를 기준으로 인젝터가 탐색을 시작할 위치와 탐색을 종료할 위치를 결정합니다.
그 이후에 인젝터는 이 범위에서 의존성 토큰을 찾아서 반환합니다.

2. 토큰을 찾지 못하면 이 요청을 가까운 부모 `@NgModule()`에게 위임합니다.

이 과정이 예제 앱의 경우에는 이렇습니다:

1. `<app-root>`에 속한 `<#VIEW>` 범위에서 의존성 토큰을 찾습니다.

  - 기본적으로 탐색이 시작되는 지점은 의존성 주입이 선언된 부분입니다. 그런데 `<app-root>`의 `@Component`는 `viewProviders` 프로퍼티가 사용되었기 때문에 탐색 시작점이 `<app-root>`의 `<#VIEW>`가 됩니다. 같은 계층에 사용된 디렉티브는 이렇게 동작하지 않습니다.
  - 탐색이 종료되는 지점은 컴포넌트가 끝나는 지점입니다. 예제 앱에서 `<app-root>`는 최상위 컴포넌트입니다.

2. `ElementInjector`가 의존성 토큰을 찾지 못했기 때문에 의존성 주입 요청은 `AppModule`에게 넘어갑니다.


<!--
### Using the `providers` array
-->
### `providers` 사용하기

<!--
Now, in the `ChildComponent` class, add a provider for `FlowerService`
to demonstrate more complex resolution rules in the upcoming sections:
-->
이제 `ChildComponent` 클래스에 `FlowerService`의 프로바이더를 등록해서 의존성 토큰 규칙을 조금 복잡하게 만들어 봅시다:

<code-example path="providers-viewproviders/src/app/child/child.component.1.ts" header="providers-viewproviders/src/app/child.component.ts" region="flowerservice">

</code-example>

<!--
Now that the `FlowerService` is provided in the `@Component()` decorator,
when the `<app-child>` requests the service, the injector has only to look
as far as the `<app-child>`'s own `ElementInjector`. It won't have to
continue the search any further through the injector tree.

The next step is to add a binding to the `ChildComponent` template.
-->
이제는 `FlowerService`의 프로바이더가 `@Component()` 데코레이터에 등록되었기 때문에 `<app-child>`가 의존성으로 요청하는 서비스의 인스턴스는 `<app-child>`에 구성되는 `ElementInjector`만 봐도 찾을 수 있습니다.
아직까지는 인젝터 트리를 따라 올라갈 필요가 없습니다.

이 서비스를 `ChildComponent`의 템플릿에 다음과 같이 바인딩합니다.

<code-example path="providers-viewproviders/src/app/child/child.component.html" header="providers-viewproviders/src/app/child.component.html" region="flower-binding">

</code-example>

<!--
To render the new values, add `<app-child>` to the bottom of
the `AppComponent` template so the view also displays the sunflower:
-->
그리고 화면에 `AppComponent` 템플릿 제일 아래에 `<app-child>`를 추가하면 다음과 같은 문구가 표시됩니다:

```
Child Component
Emoji from FlowerService: 🌻
```

<!--
In the logical tree, this would be represented as follows:
-->
이 내용을 논리 트리에서 보면 이렇게 표현할 수 있습니다:

```
<app-root @NgModule(AppModule)
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW>
    <p>Emoji from FlowerService: {{flower.emoji}} (🌺)</p>
    <app-child @Provide(FlowerService="🌻")
               @Inject(FlowerService)=>"🌻"> <!-- 검색은 여기에서 끝납니다. -->
      <#VIEW> <!-- 검색이 여기에서 시작합니다. -->
        <h2>Parent Component</h2>
        <p>Emoji from FlowerService: {{flower.emoji}} (🌻)</p>
      </#VIEW>
     </app-child>
  </#VIEW>
</app-root>
```

<!--
When `<app-child>` requests the `FlowerService`, the injector begins
its search at the `<#VIEW>` belonging to `<app-child>` (`<#VIEW>` is
included because it is injected from `@Component()`) and ends with
`<app-child>`. In this case, the `FlowerService` is resolved in the
`<app-child>`'s `providers` array with sunflower 🌻. The injector doesn't
have to look any further in the injector tree. It stops as soon as it
finds the `FlowerService` and never sees the 🌺 (red hibiscus).
-->
`<app-child>`가 `FlowerService`를 요청하면 인젝터는 `<app-child>` 안에 있는 `<#VIEW>` 범위에서 인스턴스를 찾기 시작합니다.
이 때 `<#VIEW>`는 `@Component()` 데코레이터를 통해 `<app-child>` 안으로 주입되었기 때문에 탐색 대상이 됩니다.
이 예제의 경우에는 `FlowerService`는 `<app-child>`의 `providers` 배열에 등록된 🌻로 결정됩니다.
그리고 더 상위 인젝터를 탐색할 필요도 없습니다.
의존성 토큰 탐색은 중단되고 `FlowerService`를 주입하기 위해 🌺를 만날 일은 없습니다.


{@a use-view-providers}

<!--
### Using the `viewProviders` array
-->
### `viewProviders` 사용하기

<!--
Use the `viewProviders` array as another way to provide services in the
`@Component()` decorator. Using `viewProviders` makes services
visible in the `<#VIEW>`.

<div class="is-helpful alert">

The steps are the same as using the `providers` array,
with the exception of using the `viewProviders` array instead.

For step-by-step instructions, continue with this section. If you can
set it up on your own, skip ahead to [Modifying service availability](guide/hierarchical-dependency-injection#modify-visibility).

</div>


The example app features a second service, the `AnimalService` to
demonstrate `viewProviders`.

First, create an `AnimalService` with an `emoji` property of 🐳 (whale):
-->
서비스 프로바이더는 `@Component()` 데코레이터의 `providers` 대신 `viewProviders`에 등록해서 사용할 수도 있습니다.
`viewProviders`를 사용하면 `<#VIEW>` 범위에서 서비스에 접근할 수 있습니다.


<div class="is-helpful alert">

이 섹션에서 진행하는 과정은 `providers` 배열 대신 `viewProviders` 배열을 사용한다는 것만 빼면 이전과 같습니다.

설명하는 과정을 직접 진행해 보세요.
이 내용을 이미 이해하고 있다면 [서비스 접근가능 범위 조정하기](guide/hierarchical-dependency-injection#modify-visibility) 섹션으로 넘어가세요.

</div>

이번 섹션에서는 `viewProviders`를 설명하기 위해 또 다른 서비스 `AnimalService`를 만들어 봅니다.

먼저, `emoji` 프로퍼티 값이 `🐳`(고래)인 `AnimalService` 서비스를 생성합니다:


<code-example path="providers-viewproviders/src/app/animal.service.ts" header="providers-viewproviders/src/app/animal.service.ts" region="animal-service">

</code-example>


<!--
Following the same pattern as with the `FlowerService`, inject the
`AnimalService` in the `AppComponent` class:
-->
그리고 `FlowerService` 때와 마찬가지로 `AnimalService`도 `AppComponent` 클래스에 의존성으로 주입합니다:

<code-example path="providers-viewproviders/src/app/app.component.ts" header="providers-viewproviders/src/app/app.component.ts" region="inject-animal-service">

</code-example>

<div class="alert is-helpful">

<!--
**Note:** You can leave all the `FlowerService` related code in place
as it will allow a comparison with the `AnimalService`.
-->
**참고:** `FlowerService`는 이번 섹션에서 다루지 않기 때문에 제거해도 되지만, `AnimalService`와 비교하면서 보기 위해 이 문서에서는 그대로 두겠습니다.

</div>

<!--
Add a `viewProviders` array and inject the `AnimalService` in the
`<app-child>` class, too, but give `emoji` a different value. Here,
it has a value of 🐶 (puppy).
-->
`<app-child>` 클래스의 `viewProviders` 배열에 `AnimalService`를 추가하하는데 `emoji`에는 다른 값을 할당해 봅시다.
이번 예제에서는 🐶(강아지)를 할당했습니다.

<code-example path="providers-viewproviders/src/app/child/child.component.ts" header="providers-viewproviders/src/app/child.component.ts" region="provide-animal-service">

</code-example>

<!--
Add bindings to the `ChildComponent` and the `AppComponent` templates.
In the `ChildComponent` template, add the following binding:
-->
그리고 `AppComponent` 템플릿에 `ChildComponent`를 바인딩하고 `ChildComponent` 템플릿에는 다음과 같은 내용을 추가합니다:

<code-example path="providers-viewproviders/src/app/child/child.component.html" header="providers-viewproviders/src/app/child.component.html" region="animal-binding">

</code-example>

<!--
Additionally, add the same to the `AppComponent` template:
-->
그리고 같은 내용을 `AppComponent` 템플릿에도 추가합니다:

<code-example path="providers-viewproviders/src/app/app.component.html" header="providers-viewproviders/src/app/app.component.html" region="binding-animal">

</code-example>

<!--
Now you should see both values in the browser:
-->
그러면 브라우저에 이런 내용이 표시됩니다.

```
AppComponent
Emoji from AnimalService: 🐳

Child Component
Emoji from AnimalService: 🐶

```

<!--
The logic tree for this example of `viewProviders` is as follows:
-->
이 예제에서 `viewProviders`의 논리 트리를 따져보면 이렇습니다:


```
<app-root @NgModule(AppModule)
        @Inject(AnimalService) animal=>"🐳">
  <#VIEW>
    <app-child>
      <#VIEW
       @Provide(AnimalService="🐶")
       @Inject(AnimalService=>"🐶")>
       <!-- viewProviders를 사용한다는 것은 <#VIEW>에서 AnimalService를 사용할 수 있도록 등록하는 것을 의미합니다. -->
       <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
      </#VIEW>
     </app-child>
  </#VIEW>
</app-root>
```

<!--
Just as with the `FlowerService` example, the `AnimalService` is provided
in the `<app-child>` `@Component()` decorator. This means that since the
injector first looks in the `ElementInjector` of the component, it finds the
`AnimalService` value of 🐶 (puppy). It doesn't need to continue searching the
`ElementInjector` tree, nor does it need to search the `ModuleInjector`.
-->
`FlowerService`와 마찬가지로 `AnimalService`도 `<app-child>`의 `@Component()` 데코레이터에 등록되었습니다.
그래서 인젝터는 제일 먼저 이 컴포넌트의 `ElementInjector`에서 의존성 토큰을 찾게 되며 `AnimalService`의 값이 🐶(강아지)가 됩니다.
그 위쪽으로 `ElementInjector` 트리를 탐색할 필요가 없으며 `ModuleInjector`도 탐색할 필요가 없습니다.


### `providers` vs. `viewProviders`

<!--
To see the difference between using `providers` and `viewProviders`, add
another component to the example and call it `InspectorComponent`.
`InspectorComponent` will be a child of the `ChildComponent`. In
`inspector.component.ts`, inject the `FlowerService` and `AnimalService` in
the constructor:
-->
`providers`와 `viewProviders`가 어떻게 다른지 알아보기 위해 예제 앱에 `InspectorComponent`라는 컴포넌트를 추가해 봅시다.
`InspectorComponent`는 `ChildComponent`의 자식 컴포넌트로 구성하는데, `inspector.component.ts` 파일의 생성자에 `FlowerService`와 `AnimalService`를 의존성으로 주입합니다:

<code-example path="providers-viewproviders/src/app/inspector/inspector.component.ts" header="providers-viewproviders/src/app/inspector/inspector.component.ts" region="injection">

</code-example>

<!--
You do not need a `providers` or `viewProviders` array. Next, in
`inspector.component.html`, add the same markup from previous components:
-->
이 컴포넌트에는 `providers`나 `viewProviders`를 사용할 필요가 없습니다.
그리고 `inspector.component.html`에 이전과 같은 내용을 추가합니다:

<code-example path="providers-viewproviders/src/app/inspector/inspector.component.html" header="providers-viewproviders/src/app/inspector/inspector.component.html" region="binding">

</code-example>

<!--
Remember to add the `InspectorComponent` to the `AppModule` `declarations` array.
-->
`AppModule`의 `declarations` 배열에 `InspectorComponent`를 등록해야 한다는 것을 잊지 마세요.

<code-example path="providers-viewproviders/src/app/app.module.ts" header="providers-viewproviders/src/app/app.module.ts" region="appmodule">

</code-example>


<!--
Next, make sure your `child.component.html` contains the following:
-->
그리고 `child.component.html` 파일을 다음과 같이 수정합니다:

<code-example path="providers-viewproviders/src/app/child/child.component.html" header="providers-viewproviders/src/app/child/child.component.html" region="child-component">

</code-example>

<!--
The first two lines, with the bindings, are there from previous steps. The
new parts are  `<ng-content>` and `<app-inspector>`. `<ng-content>` allows
you to project content, and `<app-inspector>` inside the `ChildComponent`
 template makes the `InspectorComponent` a child component of
 `ChildComponent`.

Next, add the following to `app.component.html` to take advantage of content projection.
-->
처음 두 줄에는 이전에 설명했던 대로 바인딩이 사용되었습니다.
그리고 그 다음에는 `<ng-content>`와 `<app-inspector>`가 추가되었습니다.
`<ng-content>`는 컴포넌트에 프로젝션된 템플릿 조각이 표시되며 `<app-inspector>`는 `ChildComponent`의 자식 컴포넌트로 `InspectorComponent`가 표시되는 부분입니다.

이제 템플릿 조각을 프로젝션하기 위해 `app.component.html` 파일을 다음과 같이 수정합니다.

<code-example path="providers-viewproviders/src/app/app.component.html" header="providers-viewproviders/src/app/app.component.html" region="content-projection">

</code-example>

<!--
The browser now renders the following, omitting the previous examples
for brevity:

```

//...Omitting previous examples. The following applies to this section.

Content projection: This is coming from content. Doesn't get to see
puppy because the puppy is declared inside the view only.

Emoji from FlowerService: 🌻
Emoji from AnimalService: 🐳

Emoji from FlowerService: 🌻
Emoji from AnimalService: 🐶

```

These four bindings demonstrate the difference between `providers`
and `viewProviders`. Since the 🐶 (puppy) is declared inside the <#VIEW>,
it isn't visible to the projected content. Instead, the projected
content sees the 🐳 (whale).

The next section though, where `InspectorComponent` is a child component
of `ChildComponent`, `InspectorComponent` is inside the `<#VIEW>`, so
when it asks for the `AnimalService`, it sees the 🐶 (puppy).

The `AnimalService` in the logical tree would look like this:
-->
이제 브라우저 화면은 다음과 같이 표시됩니다.
간단하게 표시하기 위해 이전에 설명한 내용은 생략했습니다:

```

//...이전에 설명한 내용은 생략합니다. 이번 섹션에서 추가한 내용은 아래부터입니다.

컨텐츠 프로젝션(content projection): HTML 템플릿을를 전달하는 기능입니다.
프로젝션된 템플릿에는 🐶(강아지)가 표시되지 않습니다.
🐶는 화면에만 선언되어 있습니다.

Emoji from FlowerService: 🌻
Emoji from AnimalService: 🐳

Emoji from FlowerService: 🌻
Emoji from AnimalService: 🐶

```

바인딩이 사용된 곳을 보면 `providers`와 `viewProviders`의 차이를 알 수 있습니다.
이 결과로 볼 때 🐶(강아지)는 <#VIEW> 안에만 선언되어 있기 때문에 프로젝션된 템플릿으로 전달되지 않습니다.
프로젝션된 템플릿에는 🐳(고래)가 표시됩니다.

그 다음 부분은 `ChildComponent`의 자식 컴포넌트인 `InspectorComponent`가 표시되는 부분입니다.
`InspectorComponent`는 `<#VIEW>`에 속한 컴포넌트이기 때문에 `AnimalService`에서 가져온 값은 🐶(강아지)가 됩니다.

이 때 `AnimalService`를 논리 트리 관점에서 살펴보면 이렇습니다:

<!--
```
<app-root @NgModule(AppModule)
        @Inject(AnimalService) animal=>"🐳">
  <#VIEW>
    <app-child>
      <#VIEW
       @Provide(AnimalService="🐶")
       @Inject(AnimalService=>"🐶")>
       <!- ^^using viewProviders means AnimalService is available in <#VIEW>->
       <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
       <app-inspector>
        <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
       </app-inspector>
      </#VIEW>
      <app-inspector>
        <#VIEW>
          <p>Emoji from AnimalService: {{animal.emoji}} (🐳)</p>
        </#VIEW>
      </app-inspector>
     </app-child>
  </#VIEW>
</app-root>
```

The projected content of `<app-inspector>` sees the 🐳 (whale), not
the 🐶 (puppy), because the
🐶 (puppy) is inside the `<app-child>` `<#VIEW>`. The `<app-inspector>` can
only see the 🐶 (puppy)
if it is also within the `<#VIEW>`.
-->
```
<app-root @NgModule(AppModule)
        @Inject(AnimalService) animal=>"🐳">
  <#VIEW>
    <app-child>
      <#VIEW
       @Provide(AnimalService="🐶")
       @Inject(AnimalService=>"🐶")>
       <!-- viewProviders를 사용한다는 것은 <#VIEW>에서 AnimalService를 사용할 수 있도록 등록하는 것을 의미합니다. -->
       <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
       <app-inspector>
        <p>Emoji from AnimalService: {{animal.emoji}} (🐶)</p>
       </app-inspector>
      </#VIEW>
      <app-inspector>
        <#VIEW>
          <p>Emoji from AnimalService: {{animal.emoji}} (🐳)</p>
        </#VIEW>
      </app-inspector>
     </app-child>
  </#VIEW>
</app-root>
```

`<app-inspector>`에 프로젝션되는 값은 🐶(강아지)가 아니라 🐳(고래)입니다.
왜냐하면 🐶는 `<app-child>`의 `<#VIEW>`에서만 사용할 수 있기 때문입니다.
하지만 `<app-inspector>`는 `<#VIEW>` 안에 포함된 컴포넌트이기 때문에 🐶(강아지)가 표시됩니다.


{@a modify-visibility}
{@a modifying-service-visibility}

<!--
## Modifying service visibility
-->
## 서비스 접근가능 범위 변경하기

<!--
This section describes how to limit the scope of the beginning and
ending `ElementInjector` using the visibility decorators `@Host()`,
`@Self()`, and `@SkipSelf()`.
-->
이번 섹션에서는 `ElementInjector`의 탐색 시작지점과 종료지점을 변경할 때 사용하는 `@Host()`, `@Self()`, `@SkipSelf()` 데코레이터에 대해 알아봅시다.


<!--
### Visibility of provided tokens
-->
### 의존성 토큰의 접근가능 범위

<!--
Visibility decorators influence where the search for the injection
token begins and ends in the logic tree. To do this, place
visibility decorators at the point of injection, that is, the
`constructor()`, rather than at a point of declaration.

To alter where the injector starts looking for `FlowerService`, add
`@SkipSelf()` to the `<app-child>` `@Inject` declaration for the
`FlowerService`. This declaration is in the `<app-child>` constructor
as shown in `child.component.ts`:

```typescript=
  constructor(@SkipSelf() public flower : FlowerService) { }
```

With `@SkipSelf()`, the `<app-child>` injector doesn't look to itself for
the `FlowerService`. Instead, the injector starts looking for the
`FlowerService` at the `<app-root>`'s `ElementInjector`, where it finds
nothing. Then, it goes back to the `<app-child>` `ModuleInjector` and finds
the 🌺 (red hibiscus) value, which is available because the `<app-child>`
`ModuleInjector` and the `<app-root>` `ModuleInjector` are flattened into one
 `ModuleInjector`. Thus, the UI renders the following:

```
Emoji from FlowerService: 🌺
```

In a logical tree, this same idea might look like this:
-->
의존성 토큰의 접근가능 범위를 조정하는 데코레이터를 사용하면 의존성 토큰을 탐색하는 논리 트리의 시작 지점과 종료 지점을 변경할 수 있습니다.
그리고 이렇게 탐색 범위를 변경하는 데코레이터는 의존성 객체가 선언된 부분이 아니라 의존성 객체를 주입하는 `constructor()`에 사용합니다.

`FlowerService`를 탐색하는 시작 지점을 변경하려면 `<app-child>`에 `FlowerService`를 주입하는 `@Inject()` 데코레이터에 `@SkipSelf()`를 사용하면 됩니다.
`child.component.ts` 파일에 사용된 코드를 보면 이렇습니다:

```typescript
  constructor(@SkipSelf() public flower : FlowerService) { }
```

`<app-child>`에 주입되는 `FlowerService`에 `@SkipSelf()`를 사용하면 이 서비스의 프로바이더를 찾을 때 이 컴포넌트를 건너뜁니다.
그리고 이 컴포넌트의 부모 컴포넌트인 `<app-root>`의 `ElementInjector`에서 서비스 프로바이더를 찾지만, 부모 컴포넌트에는 서비스 프로바이더가 등록되어 있지 않기 때문에 탐색 요청이 `<app-child>`의 `ModuleInjector`로 넘겨지는데, 이 인젝터에서 🌺를 찾을 수 있습니다.
그래서 화면에는 다음과 같은 내용이 표시됩니다:

```
Emoji from FlowerService: 🌺
```

그리고 이 내용을 논리 트리 관점에서 보면 이렇게 표현할 수 있습니다:


<!--
```
<app-root @NgModule(AppModule)
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW>
    <app-child @Provide(FlowerService="🌻")>
      <#VIEW @Inject(FlowerService, SkipSelf)=>"🌺">
      <!- With SkipSelf, the injector looks to the next injector up the tree ->
      </#VIEW>
      </app-child>
  </#VIEW>
</app-root>
```

Though `<app-child>` provides the 🌻 (sunflower), the app renders
the 🌺 (red hibiscus) because `@SkipSelf()`  causes the current
injector to skip
itself and look to its parent.

If you now add `@Host()` (in addition to the `@SkipSelf()`) to the
`@Inject` of the `FlowerService`, the result will be `null`. This is
because `@Host()` limits the upper bound of the search to the
`<#VIEW>`. Here's the idea in the logical tree:

```
<app-root @NgModule(AppModule)
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW> <!- end search here with null->
    <app-child @Provide(FlowerService="🌻")> <!- start search here ->
      <#VIEW @Inject(FlowerService, @SkipSelf, @Host, @Optional)=>null>
      </#VIEW>
      </app-parent>
  </#VIEW>
</app-root>
```

Here, the services and their values are the same, but `@Host()`
stops the injector from looking any further than the `<#VIEW>`
for `FlowerService`, so it doesn't find it and returns `null`.

<div class="alert is-helpful">

**Note:** The example app uses `@Optional()` so the app does
not throw an error, but the principles are the same.

</div>
-->
```
<app-root @NgModule(AppModule)
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW>
    <app-child @Provide(FlowerService="🌻")>
      <#VIEW @Inject(FlowerService, SkipSelf)=>"🌺">
      <!-- SkipSelf를 사용하면 다음 인젝터로 넘어갑니다. -->
      </#VIEW>
      </app-child>
  </#VIEW>
</app-root>
```

`<app-child>`에도 🌻 값으로 프로바이더가 등록되어있긴 하지만 이 코드에서는 `@SkipSelf()`를 사용했기 때문에 해당 컴포넌트를 건너뛰고 부모 컴포넌트에 등록된 값인 🌺가 주입됩니다.

그리고 이 때 `@Host()`를 함께 사용하면 `FlowerService`에는 `null`이 주입됩니다.
왜냐하면 `@Host()`는 의존성 토큰의 탐색 범위를 `<#VIEW>`까지로 제한하기 때문입니다.
논리 트리로 보면 이렇습니다:

```
<app-root @NgModule(AppModule)
        @Inject(FlowerService) flower=>"🌺">
  <#VIEW> <!-- 탐색이 중단되고 null이 반환됩니다.-->
    <app-child @Provide(FlowerService="🌻")> <!-- 탐색이 여기에서 시작됩니다. -->
      <#VIEW @Inject(FlowerService, @SkipSelf, @Host, @Optional)=>null>
      </#VIEW>
      </app-parent>
  </#VIEW>
</app-root>
```

이 코드로 볼 때 서비스 프로바이더마다 어떤 값이 할당되어 있지만 `@Host()`를 사용하면 의존성 객체 탐색이 `<#VIEW>` 위쪽으로 진행되지 않습니다.
그래서 적절한 프로바이더를 찾지 못했기 때문에 `null`이 반환됩니다.

<div class="alert is-helpful">

**참고:** 이 예제 코드에서는 `@Optional()`을 사용했기 때문에 에러가 발생하지 않습니다.

</div>


<!--
### `@SkipSelf()` and `viewProviders`
-->
### `@SkipSelf()`와 `viewProviders`

<!--
The `<app-child>` currently provides the `AnimalService` in
the `viewProviders` array with the value of 🐶 (puppy). Because
the injector has only to look at the `<app-child>`'s `ElementInjector`
for the `AnimalService`, it never sees the 🐳 (whale).

Just as in the `FlowerService` example, if you add `@SkipSelf()`
to the constructor for the `AnimalService`, the injector won't
look in the current `<app-child>`'s `ElementInjector` for the
`AnimalService`.

```typescript=
export class ChildComponent {

// add @SkipSelf()
  constructor(@SkipSelf() public animal : AnimalService) { }

}
```

Instead, the injector will begin at the `<app-root>`
`ElementInjector`. Remember that the `<app-child>` class
provides the `AnimalService` in the `viewProviders` array
with a value of 🐶 (puppy):

```ts
@Component({
  selector: 'app-child',
  ...
  viewProviders:
  [{ provide: AnimalService, useValue: { emoji: '🐶' } }]
})
```

The logical tree looks like this with `@SkipSelf()` in `<app-child>`:

```
  <app-root @NgModule(AppModule)
          @Inject(AnimalService=>"🐳")>
    <#VIEW><!- search begins here ->
      <app-child>
        <#VIEW
         @Provide(AnimalService="🐶")
         @Inject(AnimalService, SkipSelf=>"🐳")>
         <!-Add @SkipSelf ->
        </#VIEW>
        </app-child>
    </#VIEW>
  </app-root>
```

With `@SkipSelf()` in the `<app-child>`, the injector begins its
search for the `AnimalService` in the `<app-root>` `ElementInjector`
and finds 🐳 (whale).
-->
`<app-child>`에는 `viewProviders`에 `AnimalService` 프로바이더가 🐶(강아지)라는 값으로 등록되어있습니다.
그래서 `<app-child>`에 `AnimalService`를 의존성으로 요청할 때 항상 이 값을 사용하며 🐳(고래)라는 값을 만날 일은 없습니다.

그리고 `FlowerService` 예제와 마찬가지로 생성자에 주입하는 `AnimalService`에 `@SkipSelf()`를 추가하면 인젝터는 현재 컴포넌트인 `<app-child>`의 `ElementInjector`에 등록된 `AnimalService`를 건너뜁니다.

```typescript=
export class ChildComponent {

// @SkipSelf()를 추가합니다.
  constructor(@SkipSelf() public animal : AnimalService) { }

}
```

대신, 인젝터는 `<app-root>`의 `ElementInjector`에서 서비스 프로바이더를 찾기 시작합니다.
`<app-child>` 클래스에는 `viewProviders`에 🐶라는 값으로 `AnimalService`를 등록했던 것을 잊지 마세요:

```ts
@Component({
  selector: 'app-child',
  ...
  viewProviders:
  [{ provide: AnimalService, useValue: { emoji: '🐶' } }]
})
```

`<app-child>`에 `@SkipSelf()`를 사용했을 때 논리 트리를 표현해보면 이렇습니다:

```
  <app-root @NgModule(AppModule)
          @Inject(AnimalService=>"🐳")>
    <#VIEW><!-- 탐색이 여기에서 시작됩니다. -->
      <app-child>
        <#VIEW
         @Provide(AnimalService="🐶")
         @Inject(AnimalService, SkipSelf=>"🐳")>
         <!-- @SkipSelf가 추가되었습니다. -->
        </#VIEW>
        </app-child>
    </#VIEW>
  </app-root>
```

`<app-child>`에 주입되는 `AnimalService`에 `@SkipSelf()`를 사용하면 현재 컴포넌트를 건너뛰고 `<app-root>`의 `ElementInjector`를 찾게되며, 이 인젝터에서 🐳(고래) 값을 찾을 수 있습니다.


<!--
### `@Host()` and `viewProviders`
-->
### `@Host()`와 `viewProviders`

<!--
If you add `@Host()` to the constructor for `AnimalService`, the
result is 🐶 (puppy) because the injector finds the `AnimalService`
in the `<app-child>` `<#VIEW>`. Here is the `viewProviders` array
in the `<app-child>` class and `@Host()` in the constructor:
-->
클래스 생성자에 주입하는 `AnimalService`에 `@Host()`를 사용하면 🐶(강아지) 값을 갖는 서비스가 주입됩니다.
왜냐하면 `<app-child>` 클래스의 `viewProviders` 배열에 `AnimalService`가 등록되어 있기 때문입니다.
클래스 선언부 코드는 이렇습니다. 이 코드의 의존성 주입 부분에는 `@Host()` 데코레이터도 사용되었습니다:

```typescript=
@Component({
  selector: 'app-child',
  ...
  viewProviders:
  [{ provide: AnimalService, useValue: { emoji: '🐶' } }]

})
export class ChildComponent {
  constructor(@Host() public animal : AnimalService) { }
}
```

<!--
`@Host()` causes the injector to look until it encounters the edge of the `<#VIEW>`.

```
  <app-root @NgModule(AppModule)
          @Inject(AnimalService=>"🐳")>
    <#VIEW>
      <app-child>
        <#VIEW
         @Provide(AnimalService="🐶")
         @Inject(AnimalService, @Host=>"🐶")> <!- @Host stops search here ->
        </#VIEW>
        </app-child>
    </#VIEW>
  </app-root>
```
-->
`@Host()` 데코레이터는 인젝터가 `<#VIEW>` 범위까지만 의존성 토큰을 탐색하도록 탐색 범위를 조정합니다.

```
  <app-root @NgModule(AppModule)
          @Inject(AnimalService=>"🐳")>
    <#VIEW>
      <app-child>
        <#VIEW
         @Provide(AnimalService="🐶")
         @Inject(AnimalService, @Host=>"🐶")> <!-- @Host를 사용했기 때문에 탐색은 여기에서 멈춥니다. -->
        </#VIEW>
        </app-child>
    </#VIEW>
  </app-root>
```

<!--
Add a `viewProviders` array with a third animal, 🦔 (hedgehog), to the
`app.component.ts` `@Component()` metadata:
-->
이제 `app.component.ts` 파일의 `@Component()` 메타데이터 `viewProviders` 배열에 또 다른 서비스 프로바이더를 추가해 봅시다.
이 서비스 프로바이더의 `emoji` 프로퍼티 값은 🦔(고슴도치)로 할당되어 있습니다:

```typescript
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: [ './app.component.css' ],
  viewProviders: [{ provide: AnimalService, useValue: { emoji: '🦔' } }]
})
```

<!--
Next, add `@SkipSelf()` along with `@Host()` to the constructor for the
`Animal Service` in `child.component.ts`. Here are `@Host()`
and `@SkipSelf()` in the `<app-child>`
constructor :
-->
그리고 `child.component.ts` 파일의 생성자에 주입되는 `AnimalService`에 `@SkipSelf()` 데코레이터와 `@Host()` 데코레이터를 추가해 봅시다.
그러면 클래스 생성자 부분은 이렇습니다:

```ts
export class ChildComponent {

  constructor(
  @Host() @SkipSelf() public animal : AnimalService) { }

}
```

<!--
When `@Host()` and `SkipSelf()` were applied to the `FlowerService`,
which is in the `providers` array, the result was `null` because
`@SkipSelf()` starts its search in the `<app-child>` injector, but
`@Host()` stops searching at `<#VIEW>`&mdash;where there is no
`FlowerService`. In the logical tree, you can see that the
`FlowerService` is visible in `<app-child>`, not its `<#VIEW>`.

However, the `AnimalService`, which is provided in the
`AppComponent` `viewProviders` array, is visible.

The logical tree representation shows why this is:
-->
`providers` 배열에 등록된 `FlowerService`에 `@Host()`와 `@SkipSelf()`를 적용하면 `null`이 주입됩니다.
왜냐하면 `@SkipSelf()`를 사용했기 때문에 `<app-child>` 인젝터를 건너 뛰며, `@Host()`를 사용했기 때문에 `<#VIEW>`를 범위 밖에서는 프로바이더를 찾지 않기 때문입니다.
이 범위 안에서는 `FlowerService`를 찾을 수 없기 때문에 의존성으로 주입되는 값은 `null`이 됩니다.
`FlowerService`는 `<app-child>`에서 접근할 수 있지 `<#VIEW>`에서 접근할 수 있는 것이 아닙니다.

그런데 `AnimalService`는 `AppComponent`의 `viewProviders` 배열에 등록되어 있기 때문에 접근할 수 있습니다.

이 내용을 논리 트리로 표현해보면 이렇습니다:

<!--
```html
<app-root @NgModule(AppModule)
        @Inject(AnimalService=>"🐳")>
  <#VIEW @Provide(AnimalService="🦔")
         @Inject(AnimalService, @SkipSelf, @Host, @Optional)=>"🦔">
    <!- ^^@SkipSelf() starts here,  @Host() stops here^^ ->
    <app-child>
      <#VIEW @Provide(AnimalService="🐶")
             @Inject(AnimalService, @SkipSelf, @Host, @Optional)=>"🐶">
               <!- Add @SkipSelf ^^->
      </#VIEW>
      </app-child>
  </#VIEW>
</app-root>
```
-->
```html
<app-root @NgModule(AppModule)
        @Inject(AnimalService=>"🐳")>
  <#VIEW @Provide(AnimalService="🦔")
         @Inject(AnimalService, @SkipSelf, @Host, @Optional)=>"🦔">
    <!-- 의존성 토큰 탐색은 여기에서 시작되고(@SkipSelf) 여기에서 끝납니다.(@Host) -->
    <app-child>
      <#VIEW @Provide(AnimalService="🐶")
             @Inject(AnimalService, @SkipSelf, @Host, @Optional)=>"🐶">
               <!-- @SkipSelf가 사용되었습니다. -->
      </#VIEW>
      </app-child>
  </#VIEW>
</app-root>
```

<!--
`@SkipSelf()`, causes the injector to start its search for
the `AnimalService` at the `<app-root>`, not the `<app-child>`,
where the request originates, and `@Host()` stops the search
at the `<app-root>` `<#VIEW>`. Since `AnimalService` is
provided via the `viewProviders` array, the injector finds 🦔
(hedgehog) in the `<#VIEW>`.
-->
`@SkipSelf()`를 사용하면 `AnimalService` 탐색범위의 시작 지점이 `<app-child>`가 아니라 `<app-root>`로 변경됩니다.
그리고 `@Host()`를 사용하면 탐색범위의 종료 지점이 `<app-root>`의 `<@VIEW>`로 변경됩니다.
이 범위에서는 `viewProviders` 배열에 `AnimalService` 프로바이더가 등록되어 있기 때문에 `<#VIEW>`에서 찾을 수 있는 값은 🦔(고슴도치)입니다.


{@a component-injectors}

<!--
## `ElementInjector` use case examples
-->
## `ElementInjector` 예제

<!--
The ability to configure one or more providers at different levels
opens up useful possibilities.
For a look at the following scenarios in a working app, see the <live-example>heroes use case examples</live-example>.
-->
서비스 프로바이더는 여러 계층에 등록할 수 있기 때문에 여러 방식으로 서비스를 활용할 수 있습니다.
과정을 진행하는 동안 설명하는 내용은 <live-example>히어로 예제</live-example>에서 참고할 수 있습니다.


<!--
### Scenario: service isolation
-->
### 시나리오: 독립 서비스 만들기

<!--
Architectural reasons may lead you to restrict access to a service to the application domain where it belongs.
For example, the guide sample includes a `VillainsListComponent` that displays a list of villains.
It gets those villains from a `VillainsService`.

If you provided `VillainsService` in the root `AppModule`
(where you registered the `HeroesService`),
that would make the `VillainsService` visible everywhere in the
application, including the _Hero_ workflows. If you later
modified the `VillainsService`, you could break something in a
hero component somewhere.

Instead, you can provide the `VillainsService` in the `providers` metadata of the `VillainsListComponent` like this:


<code-example path="hierarchical-dependency-injection/src/app/villains-list.component.ts" header="src/app/villains-list.component.ts (metadata)" region="metadata">

</code-example>

By providing `VillainsService` in the `VillainsListComponent` metadata and nowhere else,
the service becomes available only in the `VillainsListComponent` and its sub-component tree.

`VillainService` is a singleton with respect to `VillainsListComponent`
because that is where it is declared. As long as `VillainsListComponent`
does not get destroyed it will be the same instance of `VillainService`
but if there are multilple instances of `VillainsListComponent`, then each
instance of `VillainsListComponent` will have its own instance of `VillainService`.
-->
설계를 하다보면 어떤 서비스를 애플리케이션의 특정 도메인에서만 접근하도록 제한해야 하는 경우가 있습니다.
예재 앱을 보면 빌런의 목록을 화면에 표시하는 `VillainsListComponent`가 있습니다.
그리고 이 컴포넌트는 `VillainsService`에서 빌런의 목록을 가져옵니다.

그런데 `HeroService`와 마찬가지로 `VillainsService`를 `Appmodule`에 등록하면 `VillainsService`를 애플리케이션 전역에서 접근할 수 있습니다.
그래서 나중에 `VillainsService`를 수정하면 히어로와 관련된 컴포넌트 어딘가가 동작하지 않을 가능성도 함께 존재합니다.

이 때 `VillainsService`를 `VillainsListComponent`의 `providers` 메타데이터에 등록하면 어떻게 될까요:

<code-example path="hierarchical-dependency-injection/src/app/villains-list.component.ts" header="src/app/villains-list.component.ts (메타데이터)" region="metadata">

</code-example>

이렇게 구현하면 `VillainsService`는 이제 `VVillainsListComponent`와 그 자식 컴포넌트 트리에서만 접근할 수 있습니다.

그리고 `VillainsService`는 `VillainsListComponent`에 대해서 싱글턴으로 존재합니다.
`VillainsListComponent`가 종료되지 않는 한 `VillainsService`의 인스턴스도 계속 유지되며, `VillainsListComponent`의 인스턴스가 여러개 생성되면 `VillainsService`의 인스턴스도 각각 생성됩니다.


<!--
### Scenario: multiple edit sessions
-->
### 시나리오: 편집 세션 여러개 유지하기

<!--
Many applications allow users to work on several open tasks at the same time.
For example, in a tax preparation application, the preparer could be working on several tax returns,
switching from one to the other throughout the day.

This guide demonstrates that scenario with an example in the Tour of Heroes theme.
Imagine an outer `HeroListComponent` that displays a list of super heroes.

To open a hero's tax return, the preparer clicks on a hero name, which opens a component for editing that return.
Each selected hero tax return opens in its own component and multiple returns can be open at the same time.

Each tax return component has the following characteristics:

* Is its own tax return editing session.
* Can change a tax return without affecting a return in another component.
* Has the ability to save the changes to its tax return or cancel them.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/hid-heroes-anim.gif" alt="Heroes in action">
</div>

Suppose that the `HeroTaxReturnComponent` had logic to manage and restore changes.
That would be a pretty easy task for a simple hero tax return.
In the real world, with a rich tax return data model, the change management would be tricky.
You could delegate that management to a helper service, as this example does.

The `HeroTaxReturnService` caches a single `HeroTaxReturn`, tracks changes to that return, and can save or restore it.
It also delegates to the application-wide singleton `HeroService`, which it gets by injection.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.service.ts" header="src/app/hero-tax-return.service.ts">

</code-example>

Here is the `HeroTaxReturnComponent` that makes use of `HeroTaxReturnService`.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" header="src/app/hero-tax-return.component.ts">

</code-example>


The _tax-return-to-edit_ arrives via the `@Input()` property, which is implemented with getters and setters.
The setter initializes the component's own instance of the `HeroTaxReturnService` with the incoming return.
The getter always returns what that service says is the current state of the hero.
The component also asks the service to save and restore this tax return.

This won't work if the service is an application-wide singleton.
Every component would share the same service instance, and each component would overwrite the tax return that belonged to another hero.

To prevent this, configure the component-level injector of `HeroTaxReturnComponent` to provide the service, using the  `providers` property in the component metadata.



<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" header="src/app/hero-tax-return.component.ts (providers)" region="providers">

</code-example>

The `HeroTaxReturnComponent` has its own provider of the `HeroTaxReturnService`.
Recall that every component _instance_ has its own injector.
Providing the service at the component level ensures that _every_ instance of the component gets its own, private instance of the service, and no tax return gets overwritten.


<div class="alert is-helpful">

The rest of the scenario code relies on other Angular features and techniques that you can learn about elsewhere in the documentation.
You can review it and download it from the <live-example></live-example>.

</div>
-->
애플리케이션은 보통 한 번에 여러 작업을 할 수 있도록 구현합니다.
세금을 정산하는 애플리케이션이라면 대상을 바꿔가면서 여러명의 세금을 동시에 계산하도록 구현하는 식입니다.

이번 섹션에서는 히어로들의 여행 앱을 기준으로 이 내용에 대해 살펴봅시다.
`HeroListComponent`는 슈퍼 히어로의 목록이 표시되는 컴포넌트입니다.

이 화면에서 히어로의 이름을 클릭하면 히어로의 세금 계산 영역이 표시됩니다.
히어로마다 내야 할 세금을 이 영역에서 처리해 봅시다.

세금 계산 컴포넌트는 다음과 같이 동작합니다:

* 세금 계산 세션을 개별로 유지합니다.
* 다른 컴포넌트에 영향을 받지 않고 세금을 계산할 수 있습니다.
* 변경사항을 저장하거나 취소할 수 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/hid-heroes-anim.gif" alt="Heroes in action">
</div>

변경사항을 관리하고 원복하는 로직은 `HeroTaxReturnComponent`에 있다고 합시다.
현업에 사용하는 앱이라면 복잡한 데이터 모델을 처리해야 하며 변경사항을 관리하는 것도 까다롭겠지만, 이번 예제에서는 간단하게 개념만 가져와 봅시다.
세금을 계산하는 로직은 헬퍼 서비스에 모두 넘기는 방식으로 구현할 것입니다.

`HeroTaxReturnService`는 `HeroTaxReturn` 객체 하나를 캐싱하고 있으며, 이 객체가 변경되는 것을 관리하다가 저장하거나 원복합니다.
이 때 변경사항을 저장하는 기능은 앱 전역에 싱글턴으로 존재하는 `HeroService`가 처리합니다.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.service.ts" header="src/app/hero-tax-return.service.ts">

</code-example>

그리고 `HeroTaxReturnComponent`는 `HeroTaxReturnService`를 활용해서 다음과 같이 구현합니다.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" header="src/app/hero-tax-return.component.ts">

</code-example>

편집에 사용되는 `taxReturn` 프로퍼티는 게터(getter)와 세터(setter)로 구성되었으며, 이 때 세터에는 `@Input()` 데코레이터가 사용되었습니다.
세터는 컴포넌트에 있는 값을 변경하고 `HeroTaxReturnService`에 저장합니다.
게터는 현재 캐싱하고 있는 값을 반환합니다.
컴포넌트가 서비스와 통신하면서 값을 저장하거나 원복할 때도 이 게터/세터를 사용합니다.

만약 서비스가 앱 전역에 싱글턴으로 존재한다면 이 기능은 동작하지 않을 것입니다.
왜냐하면 이렇게 구현했을때 모든 컴포넌트가 같은 서비스 인스턴스를 공유하기 때문에 히어로가 누구냐에 관계없이 모든 컴포넌트가 같은 값을 다루기 때문입니다.

이런 상황을 방지하려면 컴포넌트 계층인 `HeroTaxReturnComponent`의 메타데이터 중 `providers`에 `HeroTaxReturnService` 서비스의 프로바이더를 등록하면 됩니다.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" header="src/app/hero-tax-return.component.ts (providers 배열)" region="providers">

</code-example>

그러면 `HeroTaxReturnComponent`에 `HeroTaxReturnService` 프로바이더가 직접 등록되었기 때문에 컴포넌트의 _인스턴스_ 마다 인젝터를 구성하며, 이 인젝터가 제공하는 서비스의 인스턴스도 컴포넌트마다 생성됩니다.
이제 컴포넌트마다 별개로 서비스의 인스턴스가 생성되었기 때문에 다른 컴포넌트의 영향을 받지 않습니다.


<div class="alert is-helpful">

<!--
The rest of the scenario code relies on other Angular features and techniques that you can learn about elsewhere in the documentation.
You can review it and download it from the <live-example></live-example>.
-->
이후부터는 의존성 주입 이외의 Angular 기능을 활용한 것이니 의존성 주입에 관련된 내용만 보려면 건너뛰어도 됩니다.
동작하는 앱에서 직접 확인하려면 <live-example></live-example>를 참고하세요.

</div>


<!--
### Scenario: specialized providers
-->
### 시나리오: 서비스 구체화하기

<!--
Another reason to re-provide a service at another level is to substitute a _more specialized_ implementation of that service, deeper in the component tree.

Consider a Car component that depends on several services.
Suppose you configured the root injector (marked as A) with _generic_ providers for
`CarService`, `EngineService` and `TiresService`.

You create a car component (A) that displays a car constructed from these three generic services.

Then you create a child component (B) that defines its own, _specialized_ providers for `CarService` and `EngineService`
that have special capabilities suitable for whatever is going on in component (B).

Component (B) is the parent of another component (C) that defines its own, even _more specialized_ provider for `CarService`.


<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/car-components.png" alt="car components">
</div>

Behind the scenes, each component sets up its own injector with zero, one, or more providers defined for that component itself.

When you resolve an instance of `Car` at the deepest component (C),
its injector produces an instance of `Car` resolved by injector (C) with an `Engine` resolved by injector (B) and
`Tires` resolved by the root injector (A).

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/injector-tree.png" alt="car injector tree">
</div>
-->
서비스 프로바이더를 컴포넌트 트리의 다른 계층에 등록하면 트리 더 아래쪽에 더 _구체적인_ 서비스를 주입할 수 있습니다.

서비스 여러개를 활용하는 자동차 컴포넌트가 있다고 합시다.
그리고 루트 인젝터(A)에는 `CarService`, `EngineService`, `TiresService`가 _제네릭(generic)_ 프로바이더로 등록되어 있습니다.

이 상태에서 자동차 컴포넌트(A)를 생성한다는 것은 3개의 서비스를 모두 활용한다는 것을 의미합니다.

그런데 자식 컴포넌트 (B)에는 이 컴포넌트의 사양에 맞는 `CarService`와 `EngineService`를 _더 구체적으로_ 구현한 서비스 프로바이더가 등록되어 있습니다.

그리고 이 컴포넌트(B)는 또 다른 컴포넌트(C)의 부모 컴포넌트이기도 합니다.
컴포넌트 C에는 `CarService`를 _더 구체적으로_ 구현한 서비스 프로바이더가 등록되어 있습니다.

<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/car-components.png" alt="car components">
</div>

이 관계로 보면 각 컴포넌트는 독립적으로 인젝터를 구성하며 여러개의 서비스 프로바이더를 관리하기도 합니다.

이제 가장 안쪽에 있는 컴포넌트 C에서 자동차 만들려고 하면 `CarService`는 컴포넌트 C에 등록된 서비스의 인스턴스를 사용하고, `EngineService`는 인젝터 B에 있는 것을 사용하며, `TiresService`는 루트 인젝터 A에 있는 것을 사용합니다.


<div class="lightbox">
  <img src="generated/images/guide/dependency-injection/injector-tree.png" alt="car injector tree">
</div>


<hr />


<!--
## More on dependency injection
-->
## 의존성 주입 더 알아보기

<!--
For more information on Angular dependency injection, see the [DI Providers](guide/dependency-injection-providers) and [DI in Action](guide/dependency-injection-in-action) guides.
-->
의존성 주입에 대해 더 알아보려면 [의존성 프로바이더](guide/dependency-injection-providers) 문서나 [실전 의존성 주입](guide/dependency-injection-in-action) 문서를 참고하세요.