<!--
# Dynamic Component Loader
-->
# 동적 컴포넌트 로더

<!--
Component templates are not always fixed. An application may need to load new components at runtime.
-->
컴포넌트의 템플릿이 항상 애플리케이션 실행 전에 로드되어야만 하는 것은 아닙니다. 컴포넌트 템플릿은 애플리케이션이 실행되는 중에도 불러올 수 있습니다.

<!--
This cookbook shows you how to use `ComponentFactoryResolver` to add components dynamically.
-->
이 문서는 `ComponentFactoryResolver` 예제를 사용해서 컴포넌트를 동적으로 생성하는 방법을 알아봅니다.

<!--
See the <live-example name="dynamic-component-loader"></live-example>
of the code in this cookbook.
-->
이 문서에서 다루는 예제는 <live-example name="dynamic-component-loader"></live-example>에서 실행하거나 다운받을 수 있습니다.

<!--
{@a dynamic-loading}
-->
{@a 동적-컴포넌트-로딩}

<!--
## Dynamic component loading
-->
## 동적 컴포넌트 로딩

<!--
The following example shows how to build a dynamic ad banner.
-->
광고 배너를 동적으로 만드는 예제를 보면서 자세하게 알아봅시다.

<!--
The hero agency is planning an ad campaign with several different
ads cycling through the banner. New ad components are added
frequently by several different teams. This makes it impractical
to use a template with a static component structure.
-->
히어로 주식회사는 광고 캠페인을 몇가지 싸이클로 표시하려고 합니다. 그런데 이 광고의 내용은 여러 팀이 각자 추가하기 때문에 정적인 컴포넌트 구조로는 이 요구사항을 만족할 수 없다고 합시다.

<!--
Instead, you need a way to load a new component without a fixed
reference to the component in the ad banner's template.
-->
그러면 컴포넌트의 템플릿을 고정된 HTML 문서로 작성하지 않고 어딘가에서 불러오는 방법을 사용해야 합니다.

<!--
Angular comes with its own API for loading components dynamically.
-->
이 로직은 컴포넌트를 동적으로 로드하는 Angular API를 활용해서 구현할 수 있습니다.

{@a directive}

<!--
## The anchor directive
-->
## 앵커 디렉티브

<!--
Before you can add components you have to define an anchor point
to tell Angular where to insert components.
-->
컴포넌트를 정의하기 전에, 이 컴포넌트가 어디에 위치할지 지정하는 앵커를 지정해봅시다.

<!--
The ad banner uses a helper directive called `AdDirective` to
mark valid insertion points in the template.
-->
광고가 표시될 위치를 지정하도록 `AdDirective` 디렉티브를 다음과 같이 정의합니다.

<code-example path="dynamic-component-loader/src/app/ad.directive.ts" title="src/app/ad.directive.ts" linenums="false">

</code-example>


<!--
`AdDirective` injects `ViewContainerRef` to gain access to the view
container of the element that will host the dynamically added component.
-->
`AdDirective`는 컴포넌트가 들어갈 뷰 컨테이너를 참조할 수 있도록 `ViewContainerRef`를 의존성으로 주입받습니다.

<!--
In the `@Directive` decorator, notice the selector name, `ad-host`;
that's what you use to apply the directive to the element.
The next section shows you how.
-->
그리고 `@Directive` 데코레이터에는 셀렉터로 `ad-host`를 지정하는데, 우리가 만들 컴포넌트는 이 셀렉터에 해당하는 엘리먼트에 적용될 것입니다.

<!--
{@a loading-components}
-->
{@a 컴포넌트-불러오기}

<!--
## Loading components
-->
## 컴포넌트 불러오기

<!--
Most of the ad banner implementation is in `ad-banner.component.ts`.
To keep things simple in this example, the HTML is in the `@Component`
decorator's `template` property as a template string.
-->
광고 배너의 코드는 `ad-banner.component.ts`에 대부분 작성되어 있습니다.
예제를 간단하게 하기 위해 이 컴포넌트의 템플릿은 `@Component` 데코레이터의 `template` 프로퍼티로 간단하게 정의했습니다.

<!--
The `<ng-template>` element is where you apply the directive you just made.
To apply the `AdDirective`, recall the selector from `ad.directive.ts`,
`ad-host`. Apply that to `<ng-template>` without the square brackets. Now Angular knows
where to dynamically load components.
-->
이 코드에서 컴포넌트가 로드될 위치는 `<ng-template>` 엘리먼트 안입니다.
그리고 `AdDirective`를 적용하려면 `ad.directive.ts`에 선언된 것처럼 `ad-host` 셀렉터를 사용하면 됩니다.
`<ng-template>`에 `AdDirective`를 적용할 때 대괄호(`[`, `]`)를 사용하지 않은 것에 주의하세요.
이 문법은 어트리뷰트 셀렉터를 사용하는 것이 아니라 컴포넌트를 동적으로 로드하는 문법입니다.

<code-example path="dynamic-component-loader/src/app/ad-banner.component.ts" region="ad-host" title="src/app/ad-banner.component.ts (template)" linenums="false">

</code-example>


<!--
The `<ng-template>` element is a good choice for dynamic components
because it doesn't render any additional output.
-->
`<ng-template>` 엘리먼트는 컴포넌트 외부에서 내용을 받아 컴포넌트를 구성하기 때문에 동적 컴포넌트를 구성하기에도 좋습니다.

<!--
{@a resolving-components}
-->
{@a 동적-컴포넌트-구성하기}

<!--
## Resolving components
-->
## 동적 컴포넌트 구성하기

<!--
Take a closer look at the methods in `ad-banner.component.ts`.
-->
`ad-banner.component.ts`에 정의된 메소드들을 좀 더 자세하게 봅시다.

<!--
`AdBannerComponent` takes an array of `AdItem` objects as input,
which ultimately comes from `AdService`.  `AdItem` objects specify
the type of component to load and any data to bind to the
component.`AdService` returns the actual ads making up the ad campaign.
-->
`AdBannerComponent`는 `AdItem` 객체의 배열을 입력 프로퍼티로 받는데, 이 배열은 `AdService`에서 받아올 것입니다.
`AdItem` 객체는 컴포넌트를 구성하기 위해 필요한 정보를 담는 용도로 사용하며, 요구사항을 만족시키기 위해 이 객체의 구체적인 값은 컴포넌트 외부인 `AdService`에서 받아옵니다.

<!--
Passing an array of components to `AdBannerComponent` allows for a
dynamic list of ads without static elements in the template.
-->
결국 `AdBannerComponent`에는 템플릿이 정적으로 지정되지 않은 컴포넌트 데이터가 배열 형태로 전달될 것입니다.

<!--
With its `getAds()` method, `AdBannerComponent` cycles through the array of `AdItems`
and loads a new component every 3 seconds by calling `loadComponent()`.
-->
`AdBannerComponent`는 `getAds()` 메소드를 사용해서 `AdItems` 배열을 각각 순회하는데, 3초마다 `loadComponent()` 메소드를 실행해서 컴포넌트를 하나씩 뷰에 표시합니다.

<code-example path="dynamic-component-loader/src/app/ad-banner.component.ts" region="class" title="src/app/ad-banner.component.ts (excerpt)" linenums="false">

</code-example>


<!--
The `loadComponent()` method is doing a lot of the heavy lifting here.
Take it step by step. First, it picks an ad.
-->
이 코드에서 `loadComponent()` 메소드의 로직은 조금 복잡합니다.
하나씩 확인해 봅시다. 제일 먼저 어떤 광고를 표시할지 결정합니다.

<div class="l-sub-section">


<!--
**How _loadComponent()_ chooses an ad**
-->
**_loadComponent()_가 뷰에 표시할 광고를 결정하는 방법**

<!--
The `loadComponent()` method chooses an ad using some math.
-->
`loadComponent()` 메소드는 뷰에 표시할 광고를 선택합니다.

<!--
First, it sets the `currentAdIndex` by taking whatever it
currently is plus one, dividing that by the length of the `AdItem` array, and
using the _remainder_ as the new `currentAdIndex` value. Then, it uses that
value to select an `adItem` from the array.
-->
이 함수는 현재 `currentAdIndex` 값에 1을 더한 값을 `AdItem` 배열의 길이로 나눈 _나머지_를 `currentAdIndex` 값으로 할당합니다.
그리고 이 값을 인덱스로 활용해서 `adItem` 배열을 참조합니다.

</div>


<!--
After `loadComponent()` selects an ad, it uses `ComponentFactoryResolver`
to resolve a `ComponentFactory` for each specific component.
The `ComponentFactory` then creates an instance of each component.
-->
`loadComponent()`에서 뷰에 표시할 광고를 결정하고 나면, 광고로 표시할 컴포넌트를 구성하기 위해 `ComponentFactoryResolver`를 사용합니다.
컴포넌트 데이터를 인자로 사용해서 `ComponentFactoryResolver.resolveComponentFactory()` 함수를 실행하고 나면 `ComponentFactory` 타입으로 컴포넌트의 인스턴스가 생성됩니다.

<!--
Next, you're targeting the `viewContainerRef` that
exists on this specific instance of the component. How do you know it's
this specific instance? Because it's referring to `adHost` and `adHost` is the
directive you set up earlier to tell Angular where to insert dynamic components.
-->
그리고 나면 `AdDirective` 컴포넌트의 인스턴스에 있는 `viewContainerRef`를 참조합니다.
이 객체는 `adHost`를 가리키는데, `adHost`는 이전에 언급했던 것처럼 Angular가 컴포넌트를 동적으로 로드할 위치를 지정한 디렉티브입니다.

<!--
As you may recall, `AdDirective` injects `ViewContainerRef` into its constructor.
This is how the directive accesses the element that you want to use to host the dynamic component.
-->
이전 설명에서 `AdDirective`에는 `ViewContainerRef`가 생성자를 통해 주입된다고 했습니다.
그래서 동적 컴포넌트를 구성하는 컴포넌트에서는 `AdDirective`의 인스턴스에 직접 접근할 수 있습니다.

<!--
To add the component to the template, you call `createComponent()` on `ViewContainerRef`.
-->
그리고 컴포넌트의 템플릿을 구성하기 위해 `ViewContainerRef`에 있는 `createComponent()` 함수를 실행합니다.

<!--
The `createComponent()` method returns a reference to the loaded component.
Use that reference to interact with the component by assigning to its properties or calling its methods.
-->
`createComponent()` 메소드는 이렇게 만들어진 컴포넌트의 인스턴스를 반환합니다.
이 인스턴스의 프로퍼티를 직접 지정하면 컴포넌트의 내용을 바꿀 수 있습니다.

<!--
{@a selector-references}
-->

<!--
#### Selector references
-->
#### 셀렉터 참조

<!--
Generally, the Angular compiler generates a `ComponentFactory`
for any component referenced in a template. However, there are
no selector references in the templates for
dynamically loaded components since they load at runtime.
-->
일반적으로 Angular 컴파일러는 컴포넌트에서 지정한 템플릿을 사용해서 `ComponentFactory` 타입의 컴포넌트 인스턴스를 생성합니다.
그런데 이렇게 만든 컴포넌트는 Angular 애플리케이션이 동작하는 중에 동적으로 생성되기 때문에 셀렉터가 없습니다.

<!--
To ensure that the compiler still generates a factory,
add dynamically loaded components to the `NgModule`'s `entryComponents` array:
-->
컴파일러가 생성하는 것을 `ComponentFactory` 타입으로 보정하기 위해 `NgModule` 메타데이터의 `entryComponents` 프로퍼티를 다음과 같이 지정합니다:

<code-example path="dynamic-component-loader/src/app/app.module.ts" region="entry-components" title="src/app/app.module.ts (entry components)" linenums="false">

</code-example>


<!--
{@a common-interface}
-->
{@a 공통-인터페이스}

<!--
## The _AdComponent_ interface
-->
## _AdComponent_ 인터페이스

<!--
In the ad banner, all components implement a common `AdComponent` interface to
standardize the API for passing data to the components.
-->
광고 배너 안에서는 `AdService`에서 받은 광고 데이터를 컴포넌트에 적용할 수 있도록 `AdComponent` 인터페이스를 사용합니다.

<!--
Here are two sample components and the `AdComponent` interface for reference:
-->
그래서 아래 두 컴포넌트는 컴포넌트 클래스를 정의할 때 `AdComponent` 인터페이스를 활용합니다:

<code-tabs>

  <code-pane title="hero-job-ad.component.ts" path="dynamic-component-loader/src/app/hero-job-ad.component.ts">

  </code-pane>

  <code-pane title="hero-profile.component.ts" path="dynamic-component-loader/src/app/hero-profile.component.ts">

  </code-pane>

  <code-pane title="ad.component.ts" path="dynamic-component-loader/src/app/ad.component.ts">

  </code-pane>

</code-tabs>


<!--
{@a final-ad-baner}
-->
{@a 최종-결과}

<!--
## Final ad banner
-->
## 최종 결과

<!--
 The final ad banner looks like this:
-->
우리가 구현한 광고 배너의 최종 결과물은 다음과 같습니다:

<figure>
  <img src="generated/images/guide/dynamic-component-loader/ads.gif" alt="Ads">
</figure>


<!--
See the <live-example name="dynamic-component-loader"></live-example>.
-->
예제를 직접 실행하거나 다운로드 받으려면 <live-example name="dynamic-component-loader"></live-example>를 확인해 보세요.