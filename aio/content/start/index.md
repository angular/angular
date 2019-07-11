<!--
# Getting Started with Angular: Your First App
-->
# Angular 시작하기: 첫번째 앱 만들기

<!--
Welcome to Angular!

This tutorial introduces you to the essentials of Angular. 
It leverages what you already know about HTML and JavaScript&mdash;plus some useful Angular features&mdash;to build a simple online store application, with a catalog, shopping cart, and check-out form. 
You don't need to install anything: you'll build the app using the [StackBlitz](https://stackblitz.com/ "StackBlitz web site") online development environment.
-->
Angular의 세계에 오신 것을 환영합니다!

이 튜토리얼은 Angular의 기본 내용을 소개하기 위한 문서입니다.
이 문서에서는 이미 익숙하게 사용하던 HTML과 JavaScript를 바탕으로 Angular의 기능을 더해 상품 소개, 장바구니, 주문 폼으로 구성된 간단한 온라인 쇼핑몰 애플리케이션을 만들어 볼 것입니다.
아직까지는 아무것도 설치할 필요가 없습니다: 이 튜토리얼은 온라인 개발 환경인 [StackBlitz](https://stackblitz.com/ "StackBlitz web site")로 진행합니다.

<div class="callout is-helpful">
<!--
<header>New to web development?</header>
-->
<header>웹 개발이 처음인가요?</header>

<!--
You'll find many resources to complement the Angular docs. Mozilla's MDN docs include both [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials") and [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript") introductions. [TypeScript's docs](https://www.typescriptlang.org/docs/home.html "TypeScript documentation") include a 5-minute tutorial. Various online course platforms, such as [Udemy](http://www.udemy.com "Udemy online courses") and [Codeacademy](https://www.codecademy.com/ "Codeacademy online courses"), also cover web development basics. 
-->
Angular 가이드 문서 외에도 참고할만한 자료는 많습니다. [HTML](https://developer.mozilla.org/en-US/docs/Learn/HTML "Learning HTML: Guides and tutorials")과 [JavaScript](https://developer.mozilla.org/en-US/docs/Web/JavaScript "JavaScript")에 대해 알아보려면 Mozilla에서 제공하는 MDN 문서를 참고하는 것이 좋습니다. 그리고 [TypeScript에서 제공하는 문서](https://www.typescriptlang.org/docs/home.html "TypeScript documentation") 중 5분 튜토리얼 문서도 참고할 만 합니다. 그리고 웹 개발에 대한 기본적인 내용은 [Udemy](http://www.udemy.com "Udemy online courses")나 [Codeacademy](https://www.codecademy.com/ "Codeacademy online courses")와 같은 온라인 플랫폼에서 학습할 수도 있습니다.

</div> 



{@a new-project}
<!--
## Create a new project
-->
## 프로젝트 생성하기

<h4>
<!--
<live-example name="getting-started-v0" noDownload>Click here to create a new project in StackBlitz.</live-example> 
-->
<live-example name="getting-started-v0" noDownload>StackBlitz에 새로운 프로젝트를 생성하려면 여기를 클릭하세요.</live-example> 
</h4>

<!--
StackBlitz creates a starter Angular app. 
We've seeded this particular app with a top bar&mdash;containing the store name and checkout icon&mdash;and the title for a product list. 
-->
위 링크를 클릭하면 StackBlitz에 새로운 Angular 앱이 생성됩니다.
이렇게 생성된 프로젝트에는 쇼핑몰의 이름과 주문 버튼, 상품 목록이 표시되는 화면이 존재합니다.

<figure>
    <!--
    <img src="generated/images/guide/start/new-app.png" alt="Starter online store app">
    -->
    <img src="generated/images/guide/start/new-app.png" alt="온라인 쇼핑몰 앱 초기화면">
</figure>


<div class="callout is-helpful">
<!--
<header>StackBlitz tips</header>
-->
<header>StackBlitz 팁</header>

<!--
* Log into StackBlitz, so you can save and resume your work. If you have a GitHub account, you can log into StackBlitz with that account. 
* To copy a code example from this tutorial, click the icon at the top right of the code example box, and then paste the code snippet from the clipboard into StackBlitz. 
* If the StackBlitz preview pane isn't showing what you expect, save and then click the refresh button. 
* StackBlitz is continually improving, so there may be slight differences in generated code, but the app's behavior will be the same.
-->
* StackBlitz에 가입하면 작업한 내용을 저장했다가 다음에 다시 이어서 작업할 수 있습니다. 이 때 GitHub 계정을 사용해서 가입할 수도 있습니다.
* 이 튜토리얼에서 제공하는 예제 코드 오른쪽 위에 있는 버튼을 클릭하면 코드의 내용을 클립보드에 복사할 수 있습니다. 복사한 내용은 StackBlitz에 그대로 붙여넣을 수 있습니다.
* StackBlitz 미리보기 화면에 원하는 결과가 표시되지 않으면, 작업내용을 저장하고 새로고침 버튼을 클릭해 보세요.
* StackBlitz 플랫폼은 지속적으로 개선되고 있기 때문에 자동으로 생성되는 코드는 약간씩 달라질 수 있습니다. 하지만 애플리케이션의 동작은 동일할 것입니다.

</div>

{@a template-syntax}
<!--
## Template syntax
-->
## 템플릿 문법

<!-- 원래 문서에서 주석 -->
<!-- 
Angular extends HTML with a template syntax that gives components control over the display of content. 
This section introduces five things you can do in an Angular template to affect what your user sees, based on the component's state and behavior: 
-->

<!--
Angular's template syntax extends HTML and JavaScript. 
In this section, you'll learn about template syntax by enhancing the "Products" area. 

(So that you can focus on the template syntax, the following steps use predefined product data and methods from the `product-list.component.ts` file.) 
-->
Angular 템플릿 문법을 사용하면 HTML과 JavaScript을 확장할 수 있습니다.
이번 섹션에서는 "Products" 영역을 어떻게 확장할 수 있는지 알아봅시다.

(템플릿 문법에만 집중하기 위해 아래 예제에서는 `product-list.component.ts` 파일에 미리 정의된 제품 데이터와 메소드를 사용합니다.)

<!--
1. In the `product-list` folder, open the template file `product-list.component.html`. 

1. Modify the product list template to display a list of product names. 

    1. We want each product in the list to be displayed the same way, one after the other on the page. To iterate over the predefined list of products, use the `*ngFor` directive. Put the `*ngFor` directive on a `<div>`, as shown below:  
-->
1. `product-list` 폴더에 있는 `product-list.component.html` 템플릿 파일을 엽니다.

1. 제품의 이름을 표시할 수 있도록 템플릿을 수정합니다.

    1. 목록에 있는 제품들은 화면에 동일한 모습으로 표현하려고 합니다. 이 때 목록 안에 있는 제품 정보를 반복해서 표시하기 위해 `*ngFor` 디렉티브를 사용합니다. `*ngFor` 디렉티브를 `<div>` 엘리먼트에 다음과 같이 추가합니다:

      <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.2.html" region="ngfor">
      </code-example>

      <!--
      `*ngFor` causes the `<div>` to be repeated for each product in the list. 
      -->
      `<div>`에 `*ngFor`를 사용하면 목록에 있는 제품마다 같은 템플릿을 반복할 수 있습니다.

      <div class="alert is-helpful">

      <!--
      `*ngFor` is a "structural directive". Structural directives shape or reshape the DOM's structure, typically by adding, removing, and manipulating the elements to which they are attached. Any directive with an * is a structural directive.
      -->
      
      `*ngFor` 는 "구조 디렉티브(structural directive)" 중 하나입니다. 구조 디렉티브는 일반적으로 엘리먼트를 추가하거나 제거하고, 변형하는 방식으로 DOM 구조를 구성하는 디렉티브입니다. * 로 시작하는 디렉티브는 모두 구조 디렉티브입니다.
      </div>
    <!--
    1. To display the names of the products, use the interpolation syntax {{ }}. Interpolation renders a property's value as text. Inside the `<div>`, add an `<h3>` heading to display the interpolation of the product's name property: 
    -->
    1. 제품의 이름을 표시할 때는 문자열 바인딩 문법(interpolation syntax) `{{ }}` 를 사용합니다. 이 문법을 사용하면 프로퍼티 값을 문자열로 표시할 수 있습니다. 그래서 `<div>` 안에 제품의 이름을 표시하기 위해 다음과 같이 `<h3>` 엘리먼트를 추가합니다:

      <code-example path="getting-started/src/app/product-list/product-list.component.2.html" region="interpolation">
      </code-example>

      <!--
      The preview pane immediately updates to display the name of each product in the list. 
      -->
      그러면 다음과 같이 미리보기 화면에 제품 이름이 표시됩니다:

      <figure>
        <img src="generated/images/guide/start/template-syntax-product-names.png" alt="Product names added to list">
      </figure>

<!--
1. In the final app, each product name will be a link to product details. Add the anchor now, and set the anchor's title to be the product's name by using the property binding [ ] syntax, as shown below: 
-->
3. 최종 결과물에서는 각각의 제품 이름이 제품 상세정보 화면으로 연결되는 링크가 될 것입니다. 지금 단계에서는 앵커 엘리먼트를 추가하고 이 엘리먼트에 제품 이름을 다음과 같이 `[]` 문법으로 지정합시다:

    <code-example path="getting-started/src/app/product-list/product-list.component.2.html">
    </code-example>

    <!-- 
    To do: Description and code don't match exactly. Do we want to just use product name as the anchor hover text to show a simple property or append "details" to show an expression? Also affects screen shot. 
    -->

    <!--
    In the preview pane, hover over the displayed product name to see the bound name property value. They are the same. Interpolation {{ }} lets you render the property value as text; property binding [ ] lets you use the property value in a template expression. 
    -->
    이제 미리보기 화면에서 제품 이름에 마우스 커서를 올려보면 엘리먼트에 어떤 프로퍼티 값이 바인딩되었는지 확인할 수 있습니다. 이 예제처럼 문자열 바인딩 문법 `{{ }}` 를 사용하면 프로퍼티 값을 텍스트로 렌더링할 수 있으며, 프로퍼티 바인딩 문법 `[ ]` 를 사용하면 프로퍼티 값을 바인딩하는 템플릿 표현식을 정의할 수 있습니다.

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-anchor.png" alt="Product name anchor text is product name property">
    </figure>

<!--
1. Add the product descriptions. On the paragraph tag, use an `*ngIf` directive so that the paragraph element is only created if the current product has a description.
-->
4. 제품 설명을 추가합니다. 이 때 `<p>` 태그에 `*ngIf` 디렉티브를 사용했기 때문에, 실제로 제품 설명이 존재할 때만 `<p>` 태그가 생성됩니다.

    <code-example path="getting-started/src/app/product-list/product-list.component.3.html">
    </code-example>

    <!--
    The app now displays the name and description of each product in the list, as shown below. Notice that the final product does not have a description paragraph at all. Because the product's description property is empty, the paragraph element&mdash;including the word "Description"&mdash;is not created.  
    -->
    이제 애플리케이션 화면을 보면 목록에 존재하는 제품마다 제품의 이름과 설명을 표시합니다. 그리고 아래 그림에서 보듯이, 마지막 제품은 설명이 없기 때문에 제품 설명도 존재하지 않습니다. "Description" 이라는 문구도 마찬가지입니다.

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-description.png" alt="Product descriptions added to list">
    </figure>

<!--
1. Add a button so users can share a product with friends. Bind the button's `click` event to the `share()` event that we defined for you (in `product-list.component.ts`). Event binding is done by using ( ) around the event, as shown below: 
-->
5. 이제 친구에게 제품을 공유할 수 있는 버튼을 추가해 봅시다. 이 버튼에서 `click` 이벤트가 발생하면 `product-list.component.ts` 에 정의해 둔 `share()` 메소드를 실행하려고 합니다. 이벤트 바인딩은 다음 예제처럼 이벤트 이름을 `( )` 로 감싸는 문법을 사용합니다.

    <code-example path="getting-started/src/app/product-list/product-list.component.4.html">
    </code-example>

    <!--
    Each product now has a "Share" button: 
    -->
    이제는 각 제품마다 "Share" 버튼이 추가되었습니다:

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-share-button.png" alt="Share button added for each product">
    </figure>

    <!--
    Test the "Share" button: 
    -->
    "Share" 버튼이 동작하는 것을 확인해 봅시다:

    <figure>
      <img src="generated/images/guide/start/template-syntax-product-share-alert.png" alt="Alert box indicating product has been shared">
    </figure>

<!--
The app now has a product list and sharing feature. 
In the process, you've learned to use five common features of Angular's template syntax: 
* `*ngFor`
* `*ngIf`
* Interpolation `{{ }}`
* Property binding `[ ]`
* Event binding `( )`
-->
이제 앱에는 제품 목록이 표시되며 공유할 수 있는 기능도 추가되었습니다.
그리고 이렇게 진행하는 동안 Angular 템플릿 문법 중 자주 사용하는 5가지 기본 기능에 대해 살펴봤습니다:
* `*ngFor`
* `*ngIf`
* 문자열 바인딩(Interpolation) `{{ }}`
* 프로퍼티 바인딩 `[ ]`
* 이벤트 바인딩 `( )`


<div class="alert is-helpful">

<!--
Learn more: See the [Template Syntax guide](guide/template-syntax "Template Syntax") for information about the full capabilities of Angular's template syntax.
-->
더 알아보기: Angular가 제공하는 템플릿 문법에 대해 자세하게 알아보려면 [템플릿 문법](guide/template-syntax "Template Syntax") 문서를 참고하세요.

</div>


{@a components}
<!--
## Components
-->
## 컴포넌트(Components)

<!--
*Components* define areas of responsibility in your UI that let you reuse these sets of UI functionality. 
You've already built one with the product list component. 

A component is comprised of three things: 
* **A component class,** which handles data and functionality. In the previous section, the product data and the `share()` method were defined for you in the component class. 
* **An HTML template,** which determines what is presented to the user. In the previous section, you modified the product list's HTML template to display the name, description, and a "Share" button for each product. 
* **Component-specific styles** that define the look and feel. The product list does not define any styles.  
-->
특정 UI 영역을 재사용하기 위해 따로 분리해서 정의한 것을 *컴포넌트* 라고 합니다.
그래서 위에서 살펴본 제품 목록도 컴포넌트라고 할 수 있습니다.

컴포넌트는 다음 3가지로 구성됩니다:
* **컴포넌트 클래스**는 데이터를 처리하는 로직과 같은 컴포넌트의 동작을 담당합니다. 위 예제에서 제품 데이터와 `share()` 메소드는 컴포넌트 클래스에 정의되어 있습니다.
* **HTML 템플릿**은 사용자에게 표시되는 화면을 정의합니다. 위 예제에서 제품의 이름, 설명이 표시되도록 태그를 작성하고 "Share" 버튼을 추가한 것도 모두 HTML 템플릿을 수정한 것입니다.
* **컴포넌트 스타일**은 HTML 템플릿의 모양을 정의합니다. 위 예제에서는 아직 스타일을 정의하지 않았습니다.

<!--
아래 문단은 원문에서 주석
-->
<!-- 
### Class definition

Let's take a quick look a the product list component's class definition: 

1. In the `product-list` directory, open `product-list.component.ts`. 

1. Notice the `@Component` decorator. This provides metadata about the component, including its templates, styles, and a selector. 

    * The `selector` is used to identify the component. The selector is the name you give the Angular component when it is rendered as an HTML element on the page. By convention, Angular component selectors begin with the prefix such as `app-`, followed by the component name. 

    * The template and style filename also are provided here. By convention each of the component's parts is in a separate file, all in the same directory and with the same prefix. 

1. The component definition also includes an exported class, which handles functionality for the component. This is where the product list data and `Share()` method are defined. 

### Composition
-->

<!--
An Angular application is composed of a tree of components, in which each Angular component has a specific purpose and responsibility. 

Currently, our app has three components: 
-->
Angular 애플리케이션은 특정한 용도로 만든 컴포넌트 트리로 구성됩니다.

그리고 지금 시점에 예제 애플리케이션에는 컴포넌트가 3개 존재합니다:

<figure>
  <!--
  <img src="generated/images/guide/start/app-components.png" alt="Online store with three components">
  -->
  <img src="generated/images/guide/start/app-components.png" alt="컴포넌트 3개로 구성된 쇼핑몰 앱">
</figure>

<!--
* `app-root` (orange box) is the application shell. This is the first component to load, and the parent of all other components. You can think of it as the base page. 
* `app-top-bar` (blue background) is the store name and checkout button.
* `app-product-list` (purple box) is the product list that you modified in the previous section. 

In the next section, you'll expand the app's capabilities by adding a new component for a product alert. You'll add it as a child of the product list component. 
-->
* `app-root` (오렌지색 영역) 은 애플리케이션의 기본틀입니다. 이 컴포넌트는 가장 처음 로드되는 컴포넌트이며, 모든 컴포넌트의 부모 컴포넌트입니다. 페이지 전체를 의미하는 것으로 이해해도 됩니다.
* `app-top-bar` (파란색 영역) 은 쇼핑몰 이름과 주문 버튼이 존재하는 영역입니다.
* `app-product-list` (보라색 영역) 은 위 예제에서 수정한 제품 목록 화면입니다.

이제 다음 섹션에서는 제품할인 알림 버튼을 새로운 컴포넌트로 추가해봅시다. 이 컴포넌트는 제품 목록 컴포넌트의 자식 컴포넌트로 추가할 것입니다.

<div class="alert is-helpful">

<!--
Learn more: See [Introduction to Components](guide/architecture-components "Architecture > Introduction to Components") for more information about components and how they interact with templates.
-->
더 알아보기: 컴포넌트에 대해서, 컴포넌트가 템플릿과 어떻게 상호작용하는지 자세하게 알아보려면 [컴포넌트 소개](guide/architecture-components "Architecture > Introduction to Components") 문서를 참고하세요.

</div>


{@a input}
<!--
## Input
-->
## 입력 프로퍼티

<!--
Currently, the product list displays the name and description of each product. 
You might have noticed that the product list component also defines a `products` property that contains imported data for each product. (See the `products` array in `products.ts`.)

We're going to create a new alert feature. The alert feature will take a product as an input. It will then check the product's price, and, if the price is greater than $700, it will display a "Notify Me" button that lets users sign up for notifications when the product goes on sale. 
-->
지금까지 만든 앱을 보면 제품 목록에 있는 제품마다 이름과 설명이 표시됩니다.
그런데 제품 목록을 표시하는 컴포넌트를 보면 `products.ts` 파일의 `products` 배열에서 가져온 제품 목록이 `products` 프로퍼티에 할당되는 것도 확인할 수 있습니다.

이제 알림 기능을 추가해 봅시다. 알림 기능은 제품 정보를 입력 프로퍼티로 받아서 활용할 것입니다. 새로운 컴포넌트는 제품의 가격을 확인한 후에, 제품 가격이 $700 이상이면 이후에 제품을 세일할 때 알림을 받을 수 있도록 "Notify Me" 버튼을 표시할 것입니다. 그리고 이 버튼을 누르면 사용자가 회원가입할 수 있는 화면을 제공하려고 합니다.

<!--
1. Create a new product alerts component. 

    1. Right click on the `app` folder and use the `Angular Generator` to generate a new component named `product-alerts`.
-->
1. 새로운 컴포넌트를 생성합니다.

    1. `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator`를 선택한 후에 `product-alerts`라는 이름으로 컴포넌트를 생성합니다.

        <figure>
          <!--
          <img src="generated/images/guide/start/generate-component.png" alt="StackBlitz command to generate component">
          -->
          <img src="generated/images/guide/start/generate-component.png" alt="StackBlitz에서 컴포넌트를 생성하는 과정">
        </figure>

        <!--
        The generator creates starter files for all three parts of the component: 
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`
        -->
        그러면 컴포넌트를 구성하는 다음 3개의 파일이 생성됩니다:
        * `product-alerts.component.ts`
        * `product-alerts.component.html`
        * `product-alerts.component.css`

<!--
1. Open `product-alerts.component.ts`.
-->
2. `product-alerts.component.ts` 파일을 엽니다.

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="as-generated"></code-example>    

    1. `@Component` 데코레이터를 봅시다. 이 데코레이터는 데코레이터 아래에 있는 클래스가 컴포넌트라는 것을 지정하는 데코레이터입니다. 그리고 이 데코레이터는 템플릿, 스타일, 셀렉터와 같이 컴포넌트와 관련된 메타데이터를 인자로 받습니다. 
        
        * `selector` 는 컴포넌트를 구분하는 id입니다. 그리고 나중에 HTML이 렌더링될 때 이 셀렉터가 사용된 곳에 셀렉터에 해당되는 Angular 컴포넌트가 들어갑니다. 일반적으로 Angular 컴포넌트 셀렉터는 `app-` 접두사를 사용합니다.

        * 메타데이터에는 템플릿과 스타일 파일을 지정할 수 있습니다. 이 파일들은 컴포넌트를 생성할 때 자동으로 생성됩니다.
    
    1. 컴포넌트를 생성하면 클래스(`ProductAlertsComponent`)도 함께 생성되는데, 이 클래스는 컴포넌트의 동작을 처리합니다.

1. 이제 새로 만든 컴포넌트가 제품 정보를 입력 프로퍼티로 받도록 설정합시다:

    1. `@angular/core` 에서 `Input` 심볼을 로드합니다.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="imports"></code-example>

    <!--
    1. In the `ProductAlertsComponent` class definition, define a property named `product` with an `@Input` decorator. The `@Input` decorator indicates that the property value will be passed in from the component's parent (in this case, the product list component).
    -->
    1. 그리고 `ProductAlertsComponent` 클래스에 `product` 프로퍼티를 선언하면서 이 프로퍼티에 `@Input` 데코레이터를 지정합니다. 이 데코레이터를 사용하면 `product` 프로퍼티에 할당되는 값이 부모 컴포넌트(이 예제에서는 제품 목록 컴포넌트)에서 전달된다는 것을 의미합니다.

        <code-example path="getting-started/src/app/product-alerts/product-alerts.component.1.ts" region="input-decorator"></code-example>

<!--
1. Define the view for the new product alert component. 

    Open the `product-alerts.component.html` template and replace the placeholder paragraph with a "Notify Me" button that appears if the product price is over $700. 
-->
4. 새로운 컴포넌트 화면을 구성합니다.

    `product-alerts.component.html` 템플릿 파일을 열고 `<p>` 엘리먼트를 수정하는데, 제품의 가격이 $700을 넘을 때 "Notify Me" 버튼을 표시하도록 다음과 같이 작성합니다.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.1.html"></code-example>

<!--
1. Display the new product alert component as part of (a child of) the product list. 

    1. Open `product-list.component.html`.
    
    1. To include the new component, use its selector (`app-product-alert`) as you would an HTML element. 
    
    1. Pass the current product as input to the component using property binding. 

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

The new product alert component takes a product as input from the product list. With that input, it shows or hides the "Notify Me" button, based on the price of the product. The Phone XL price is over $700, so the "Notify Me" button appears on that product. 
-->
5. 제품할인 알림 컴포넌트를 제품 목록 컴포넌트의 자식 컴포넌트로 추가합니다.

    1. `product-list.component.html` 파일을 엽니다.
    
    1. 새로운 컴포넌트를 추가하기 위해 이 컴포넌트에 지정한 `app-product-alert` 셀렉터를 HTML 엘리먼트인 것처럼 추가합니다.
    
    1. 현재 `*ngFor` 루프에 해당하는 제품 정보를 프로퍼티 바인딩 문법으로 자식 컴포넌트에 전달합니다.

        <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html" region="app-product-alerts"></code-example>

이제 제품할인 알림 컴포넌트는 제품 목록 컴포넌트에서 제품 정보를 입력 프로퍼티로 받습니다. 그리고 이렇게 입력 프로퍼티로 받은 제품의 가격에 따라 "Notify Me" 버튼을 표시할지 결정합니다. 아래 예제에서 Phone XL의 가격은 $700을 넘기 때문에 "Notify Me"버튼이 표시되는 것을 확인할 수 있습니다.

<figure>
  <!--
  <img src="generated/images/guide/start/product-alert-button.png" alt="Product alert button added to products over $700">
  -->
  <img src="generated/images/guide/start/product-alert-button.png" alt="상품 가격이 $700 이상이기 때문에 제품할인 알림 버튼이 표시된 모습">
</figure>


<div class="alert is-helpful">

<!--
Learn more: See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about passing data from a parent to child component, intercepting and acting upon a value from the parent, and detecting and acting on changes to input property values.
-->
더 알아보기: 부모 컴포넌트에서 자식 컴포넌트로 데이터를 전달하는 것에 대해 더 자세하게 알아보려면 [컴포넌트 상호작용](guide/component-interaction "Components & Templates > Component Interaction") 문서를 참고하세요. 부모 컴포넌트에서 자식 컴포넌트로 전달한 데이터는 자식 컴포넌트가 추가로 변형할 수 있으며, 부모 컴포넌트에서 전달하는 값이 변경되는 것도 감지할 수 있습니다.

</div>


{@a output}
<!--
## Output
-->
## 출력 프로퍼티

<!--
The "Notify Me" button doesn't do anything yet. In this section, you'll set up the product alert component so that it emits an event up to the product list component when the user clicks "Notify Me". You'll define the notification behavior in the product list component. 

1. Open `product-alerts.component.ts`.

1. Import `Output` and `EventEmitter` from `@angular/core`: 
-->
아직까지 "Notify Me" 버튼은 아무 동작도 하지 않습니다. 이번 섹션에서는 사용자가 "Notify Me" 버튼을 클릭했을 때 제품 목록 컴포넌트로 이벤트를 보내도록 구현해 봅시다. 이 이벤트를 받아서 사용자에게 표시하는 동작은 제품 목록 컴포넌트에 구현할 것입니다.

1. `product-alerts.component.ts` 파일을 엽니다.

1. `@angular/core` 에서 `Output`과 `EventEmitter` 심볼을 로드합니다:

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="imports"></code-example>

<!--
1. In the component class, define a property named `notify` with an `@Output` decorator and an instance of event emitter. This makes it possible for the product alert component to emit an event when the value of the notify property changes.
-->
3. 이 컴포넌트 클래스에서 컴포넌트 밖으로 이벤트를 보낼 `notify` 프로퍼티를 정의하고, 이 프로퍼티에 `@Output` 데코레이터를 지정합니다. `@Output` 데코레이터를 지정하면 제품할인 컴포넌트에서 이벤트를 보낼 수 있습니다.

    <code-example path="getting-started/src/app/product-alerts/product-alerts.component.ts" region="input-output"></code-example>

<!--
1. In the product alert template (`product-alerts.component.html`), update the "Notify Me" button with an event binding to call the `notify.emit()` method.
-->
4. 그리고 템플릿 파일(`product-alerts.component.html`)의 "Notify Me" 버튼이 `notify.emit()` 메소드를 실행하도록 이벤트를 바인딩합니다.

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html"></code-example>

<!--
1. Next, define the behavior that should happen when the button is clicked. Recall that it's the parent (product list component)&mdash;not the product alerts component&mdash;that's going to take the action. In the `product-list.component.ts` file, define an `onNotify()` method, similar to the `share()` method: 
-->
5. 버튼이 클릭되었을 때 동작할 로직을 작성합니다. 이 로직은 제품할인 알림 컴포넌트가 아니라 부모 컴포넌트인 제품 목록 컴포넌트에 작성합니다. `product-list.component.ts` 파일에 `onNotify()` 메소드를 추가하고 `share()` 메소드와 비슷하게 다음과 같이 정의합니다: 

    <code-example header="src/app/product-list/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify"></code-example>

<!--
1. Finally, update the product list component to receive output from the product alerts component. 

    In `product-list.component.html`, bind the `app-product-alerts` component (which is what displays the "Notify Me" button) to the `onNotify()` method of the product list component. 
-->
6. 마지막으로 제품할인 알림 컴포넌트에서 발생하는 이벤트를 제품 목록 컴포넌트가 받을 수 있도록 제품 목록 컴포넌트의 템플릿을 수정합니다.

    `app-product-alerts` 컴포넌트가 보내는 `notify` 이벤트를 제품 목록 컴포넌트가 받으면 `onNotify()` 메고드를 실행하도록 `product-list.component.html` 파일을 수정합니다 

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.6.html" region="on-notify"></code-example>

<!--
1. Try out the "Notify Me" button: 
-->
7. "Notify Me" 버튼을 클릭해 봅시다: 

    <figure>
      <!--
      <img src="generated/images/guide/start/product-alert-notification.png" alt="Product alert notification confirmation dialog">
      -->
      <img src="generated/images/guide/start/product-alert-notification.png" alt="제품할인 알림 확인창">
    </figure>


<div class="alert is-helpful">

<!--
Learn more: See [Component Interaction](guide/component-interaction "Components & Templates > Component Interaction") for more information about listening for events from child components, reading child properties or invoking child methods, and using a service for bi-directional communication within the family.
-->
더 알아보기: 자식 컴포넌트에서 발생한 이벤트를 감지하거나, 자식 컴포넌트의 프로퍼티를 참조하는 방법, 자식 컴포넌트의 메소드를 실행하거나 서비스를 통해 자식 컴포넌트와 양방향 통신하는 방법에 대해 자세하게 알아보려면 [컴포넌트 상호작용](guide/component-interaction "Components & Templates > Component Interaction") 문서를 참고하세요.

</div>


{@a next-steps}
<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You've completed your first Angular app!

You have a basic online store catalog, with a product list, "Share" button, and "Notify Me" button. 
You've learned about the foundation of Angular: components and template syntax. 
You've also learned how the component class and template interact, and how components communicate with each other. 

To continue exploring Angular, choose either of the following options:
* [Continue to the "Routing" section](start/routing "Getting Started: Routing") to create a product details page that can be accessed by clicking a product name and that has its own URL pattern. 
* [Skip ahead to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.
-->
축하합니다! 첫번째 Angular 앱을 완성했습니다!

지금까지 작성한 온라인 쇼핑몰 앱에는 제품 목록 화면, "Share" 버튼, "Notify Me" 버튼이 존재합니다.
그리고 이렇게 작성하는 동안 Angular 앱을 개발하는 기본 지식인 컴포넌트와 템플릿 문법에 대해 알아봤습니다.
컴포넌트 클래스와 템플릿이 상호작용하는 방법, 컴포넌트가 다른 컴포넌트와 상호작용하는 방법도 알아봤습니다.

이제 Angular에 대해 더 알아보기 위해 다음 코스 중 하나를 선택해 보세요:
* 제품 목록 화면에서 제품 이름을 클릭했을 때 표시되는 제품 상세정보 화면을 만들려면 ["라우팅"](start/routing "시작하기: 라우팅") 문서를 참고하세요.
* 로컬 개발환경에 대해서 알아보거나 Angular 앱을 Firebase나 리모트 서버에 배포하는 방법에 대해 알아보려면 쭉 건너뛰고 ["개발"](start/deployment "시작하기: 배포") 문서를 참고하세요.
