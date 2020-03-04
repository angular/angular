<!--
# Getting Started with Angular: Managing Data
-->
# Angular 시작하기: 데이터 다루기

<!--
At the end of [Routing](start/start-routing "Getting Started: Routing"), the online store application has a product catalog with two views: a product list and product details.
Users can click on a product name from the list to see details in a new view, with a distinct URL, or route.

This page guides you through creating the shopping cart in three phases:

* Update the product details page to include a "Buy" button, which adds the current product to a list of products that a cart service manages.
* Add a cart component, which displays the items in the cart.
* Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's `HttpClient` to retrieve shipping data from a `.json` file.
-->
[라우팅](start/start-routing "Getting Started: Routing") 과정까지 끝내고 나면 온라인 쇼핑몰 애플리케이션에는 상품 목록 화면과 상품 상세정보 화면이 존재합니다.
사용자가 상품 목록 화면에서 상품 이름을 클릭하면 이 상품과 관련된 라우팅 규칙이 동작하면서 상품의 상세정보가 화면에 표시됩니다.

이 문서에서는 3단계에 걸쳐 장바구니 기능을 만들어 봅시다:

* 상품 상세정보 화면에 "Buy" 버튼을 추가합니다. 이 버튼을 클릭하면 현재 보고 있는 상품을 장바구니 서비스가 관리하는 목록에 추가합니다.
* 장바구니 컴포넌트를 추가합니다. 이 컴포넌트는 장바구니 안에 있는 상품 목록을 보여줍니다.
* 주문 컴포넌트를 추가합니다. 이 컴포넌트는 Angular `HttpClient`를 사용해서 `.json` 파일에서 데이터를 불러와서 상품의 가격을 가져옵니다.

{@a services}
<!--
## Services
-->
## 서비스(Service)

<!--
Services are an integral part of Angular applications. In Angular, a service is an instance of a class that you can make available to any part of your application using Angular's [dependency injection system](guide/glossary#dependency-injection-di "dependency injection definition").

Services are the place where you share data between parts of your application. For the online store, the cart service is where you store your cart data and methods.
-->
서비스는 Angular 애플리케이션을 통합하는 구성요소입니다. Angular에서 서비스는 어떤 클래스의 인스턴스이며, 이 인스턴스는 Angular [의존성 주입 시스템](guide/glossary#dependency-injection-di "dependency injection definition")을 통해 애플리케이션 어느 곳에서도 사용할 수 있습니다.

서비스는 애플리케이션 구성요소간 데이터를 공유하는 용도로 사용합니다. 온라인 쇼핑몰 앱에서는 장바구니를 구현하기 위해 필요한 데이터와 메소드를 장바구니 서비스에 구현할 것입니다.

{@a create-cart-service}
<!--
## Create the shopping cart service
-->
## 장바구니 서비스 만들기

<!--
Up to this point, users can view product information, and
simulate sharing and being notified about product changes.
They cannot, however, buy products.

In this section, you add a "Buy" button to the product
details page and set up a cart service to store information
about products in the cart.
-->
지금까지 작성한 앱에서는 사용자가 상품의 정보를 확인하고 공유하거나 상품 가격이 변동되었을 때 알림을 받을 수 있는 기능이 있습니다.
하지만 아직 상품을 구입할 수는 없습니다.

이 섹션에서는 상품 상세정보 화면에 "Buy" 버튼을 추가하고, 장바구니에 있는 상품 목록을 관리하는 장바구니 서비스를 만들어 봅시다.

<div class="alert is-helpful">

<!--
Later, the [Forms](start/start-forms "Getting Started: Forms") part of
this tutorial guides you through accessing this cart service
from the page where the user checks out.
-->
이후에 [폼](start/start-forms "Getting Started: Forms") 문서에서는 사용자가 주문을 입력하는 화면에서 장바구니 서비스를 연결합니다.

</div>

{@a generate-cart-service}
<!--
### Define a cart service
-->
### 장바구니 서비스 정의하기

<!--
1. Generate a cart service.

    1. Right click on the `app` folder, choose `Angular Generator`, and choose `Service`. Name the new service `cart`.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. StackBlitz might generate the  `@Injectable()` decorator without the `{ providedIn: 'root' }` statement as above. Instead, the generator provides the cart service in `app.module.ts` by default. For the purposes
    of this tutorial, either way works. The `@Injectable()` `{ providedIn: 'root' }` syntax allows [tree shaking](/guide/dependency-injection-providers#tree-shakable-providers), which is beyond the scope of this guide.

1. In the `CartService` class, define an `items` property to store the array of the current products in the cart.

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="props"></code-example>

1. Define methods to add items to the cart, return cart items, and clear the cart items:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="methods"></code-example>

    * The `addToCart()` method appends a product to an array of `items`.

    * The `getItems()` method collects the items users add to the cart and returns each item with its associated quantity.

    * The `clearCart()` method returns an empty array of items.
-->
1. 장바구니 서비스를 생성합니다.

    1. `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Service`를 선택합니다. 이 서비스의 이름은 `cart`로 합시다.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. StackBlitz가 서비스를 생성하면 서비스 클래스 선언 위에 있는 `@Injectable()` 데코레이터에 `{ providedIn: 'root' }` 구문을 지정하지 않을 것입니다. StackBlitz는 이 방법 대신 `app.module.ts` 파일에 이 서비스를 등록합니다. 지금 이 문서의 목적만 보면 두 방식 모두 동작하기 때문에 어떤 방식이든 관계없습니다. 대신, `@Injectable()`에 `{ providedIn: 'root'}` 를 지정하면 [트리 셰이킹(tree shaking)](/guide/dependency-injection-providers#tree-shakable-providers) 측면에서 유리할 수 있습니다.

1. `CartService` 클래스에 `items` 프로퍼티를 선언합니다. 이 프로퍼티에는 장바구니에 보관되는 상품 목록이 저장될 것입니다.

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="props"></code-example>

1. 장바구니에 상품을 추가하는 메소드, 장바구니에 있는 상품 목록을 반환하는 메소드, 장바구니를 비우는 메소드를 추가합니다:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="methods"></code-example>

    * `addToCart()` 메소드는 `items` 배열에 상품을 추가합니다.

    * `getItems()` 메소드는 사용자가 장바구니에 추가한 상품을 수량과 함께 반환합니다.

    * `clearCart()` 메소드는 장바구니 목록을 비웁니다.

{@a product-details-use-cart-service}
<!--
### Use the cart service
-->
### 장바구니 서비스 사용하기

<!--
This section walks you through using the cart service to add a product to the cart with a "Buy" button.

1. Open `product-details.component.ts`.

1. Configure the component to use the cart service.

    1. Import the cart service.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. Inject the cart service by adding it to the `constructor()`.

        <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

        <!- -
        To do: Consider defining "inject" and describing the concept of "dependency injection"
        - ->

1. Define the `addToCart()` method, which adds the current product to the cart.

    The `addToCart()` method does the following three things:
    * Receives the current `product`.
    * Uses the cart service's `addToCart()` method to add the product the cart.
    * Displays a message that you've added a product to the cart.

    <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

1. Update the product details template with a "Buy" button that adds the current product to the cart.

    1. Open `product-details.component.html`.

    1. Add a button with the label "Buy", and bind the `click()` event to the `addToCart()` method:

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.

    <div class="lightbox">
      <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
    </div>

 1. Click the "Buy" button to add the product to the stored list of items in the cart and display a confirmation message.

    <div class="lightbox">
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
    </div>
-->
이 섹션에서는 사용자가 "Buy" 버튼을 눌렀을 때 장바구니 서비스에 상품을 추가하는 기능을 만들어 봅시다.

1. `product-details.component.ts` 파일을 엽니다.

1. 컴포넌트가 장바구니 서비스를 사용할 수 있도록 수정합니다.

    1. 장바구니 서비스를 로드합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. `constructor()`에 장바구니 서비스를 추가해서 의존성으로 주입합니다.

        <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

1. `addToCart()` 메소드를 추가합니다. 이 메소드는 현재 화면에 표시하는 상품을 장바구니에 추가합니다.

    `addToCart()` 메소드는 3단계로 동작합니다:
    * `product`를 인자로 받습니다.
    * 상품을 장바구니에 추가하기 위해 장바구니 서비스의 `addToCart()` 메소드를 호출합니다.
    * 상품이 장바구니에 담겼다는 메시지를 표시합니다.

    <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

1. "Buy" 버튼을 누르면 장바구니에 상품을 추가할 수 있도록 상품 상세정보 화면의 템플릿을 수정합니다.

    1. `product-details.component.html` 파일을 엽니다.

    1. "Buy" 버튼을 추가하고 이 버튼의 `click` 이벤트를 `addToCart()` 메소드와 연결합니다:

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

1. 이렇게 만든 "Buy" 버튼을 확인하기 위해 화면을 다시 불러온 후에 상품 이름을 클릭해서 상품 상세정보 화면으로 갑니다.

    <div class="lightbox">
      <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
    </div>

 1. 이제 "Buy" 버튼을 누르면 화면에 표시된 상품이 장바구니에 추가되고 다음과 같은 메시지가 표시됩니다.

    <div class="lightbox">
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
    </div>


<!--
## Create the cart page
-->
## 장바구니 화면 만들기

<!--
At this point, users can put items in the cart by clicking "Buy", but they can't yet see their cart.

Create the cart page in two steps:

1. Create a cart component and configure routing to the new component. At this point, the cart page will only have default text.
1. Display the cart items.
-->
이제 사용자가 "Buy" 버튼을 누르면 화면에서 본 상품을 장바구니에 넣을 수 있지만, 아직 장바구니에 어떤 상품이 있는지는 알 수 없습니다.

다음 과정으로 장바구니 화면을 만들어 봅시다:

1. 장바구니 컴포넌트를 생성하고 이 컴포넌트로 이동하는 라우팅 규칙을 추가합니다. 아직 이 화면에는 기본 문구만 표시될 것입니다.
1. 장바구니에 있는 상품 목록을 화면에 표시합니다.

<!--
### Set up the component
-->
### 컴포넌트 설정하기

<!--
 To create the cart page, begin by following the same steps you did to create the product details component and configure routing for the new component.

1. Generate a cart component, named `cart`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. Add routing (a URL pattern) for the cart component.

    Open `app.module.ts` and add a route for the component `CartComponent`, with a `path` of `cart`:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

1. To see the new cart component, click the "Checkout" button. You can see the "cart works!" default text, and the URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project.

    <div class="alert is-helpful">

    The starter code for the "Checkout" button already includes a `routerLink` for `/cart` the top-bar component.

    </div>

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart page before customizing">
    </div>
-->
이전과 같은 방식으로 장바구니 화면을 생성합니다.

1. 장바구니 컴포넌트를 생성합니다. 이 컴포넌트의 이름은 `cart`라고 합시다.

    기억해 보세요: 파일 목록에서 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Component`를 선택하면 됩니다.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. 장바구니 컴포넌트로 연결되는 라우팅 규칙을 추가합니다.

    `app.module.ts` 파일을 열고 `CartComponent`로 연결되는 라우팅 규칙을 추가합니다. 이 라우팅 규칙의 `path`는 `cart`로 지정합니다:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

1. 장바구니 컴포넌트를 화면에 표시하려면 "Checkout" 버튼을 클릭하면 됩니다. 그러면 기본 문구인 "cart works!"가 화면에 표시되며 URL은 `https://getting-started.stackblitz.io/cart`와 같은 방식으로 표시될 것입니다. 이 주소는 StackBlitz 프로젝트에 따라 달라질 수 있습니다.

    <div class="alert is-helpful">

    컴포넌트 최상단에 있는 "Checkout" 버튼에는 이미 `/cart`로 이동하는 `routerLink`가 지정되어 있습니다.

    </div>

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart page before customizing">
    </div>

<!--
### Display the cart items
-->
### 장바구니 목록 표시하기

<!--
You can use services to share data across components:

* The product details component already uses the cart service to add products to the cart.
* This section shows you how to use the cart service to display the products in the cart.


1. Open `cart.component.ts`.

1. Configure the component to use the cart service.

    1. Import the `CartService` from the `cart.service.ts` file.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
        </code-example>

    1. Inject the `CartService` so that the cart component can use it.

        <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="inject-cart">
        </code-example>

1. Define the `items` property to store the products in the cart.

    <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="items">
    </code-example>

1. Set the items using the cart service's `getItems()` method. Recall that you defined this method [when you generated `cart.service.ts`](#generate-cart-service).

    The resulting `CartComponent` class is as follows:

    <code-example path="getting-started/src/app/cart/cart.component.3.ts" header="src/app/cart/cart.component.ts" region="props-services">
    </code-example>

1. Update the template with a header, and use a `<div>` with an `*ngFor` to display each of the cart items with its name and price.

    The resulting `CartComponent` template is as follows:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
    </code-example>

1. Test your cart component.

    1. Click on "My Store" to go to the product list page.
    1. Click on a product name to display its details.
    1. Click "Buy" to add the product to the cart.
    1. Click "Checkout" to see the cart.
    1. To add another product, click "My Store" to return to the product list.

  Repeat to add more items to the cart.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart page with products added">
    </div>
-->
서비스는 다음과 같이 컴포넌트끼리 데이터를 공유하는 용도로 활용할 수 있습니다:

* 상품 상세정보 컴포넌트는 장바구니에 상품을 추가하기 위해 서비스를 사용합니다.
* 이 섹션에서는 장바구니 서비스에 있는 상품 목록을 가져오도록 구현합니다.

1. `cart.component.ts` 파일을 엽니다.

1. 컴포넌트에서 장바구니 서비스를 사용할 수 있도록 수정합니다.

    1. `cart.service.ts` 파일에서 `CartService`를 로드합니다.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
        </code-example>

    1. 장바구니 컴포넌트 생성자로 `CartService`를 주입합니다.

        <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="inject-cart">
        </code-example>

1. 장바구니 서비스에서 가져온 목록을 담아둘 수 있도록 `items` 프로퍼티를 선언합니다.

    <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="items">
    </code-example>

1. 이 프로퍼티에 장바구니 서비스의 `getItems()` 메소드 실행 결과를 할당합니다. 이 메소드는 [`cart.service.ts` 파일을 생성할 때](#generate-cart-service) 정의했습니다.

    그러면 `CartComponent` 클래스 코드는 다음과 같습니다:

    <code-example path="getting-started/src/app/cart/cart.component.3.ts" header="src/app/cart/cart.component.ts" region="props-services">
    </code-example>

1. 템플릿을 수정합니다. `<div>` 엘리먼트에 `*ngFor`를 적용해서 장바구니 항목마다 이름과 가격을 반복합니다.

    그러면 `CartComponent` 템플릿이 이렇게 됩니다:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
    </code-example>

1. 장바구니 컴포넌트를 테스트해봅시다.

    1. "My Store"를 클릭하면 상품 목록 화면으로 이동합니다.
    1. 상품 이름을 클릭하면 그 상품의 상세정보 화면으로 이동합니다.
    1. "Buy" 버튼을 클릭하면 장바구니에 상품을 추가합니다.
    1. "Checkout" 버튼을 클릭하면 장바구니에 담긴 목록을 확인할 수 있습니다.
    1. 다른 상품을 장바구니에 추가하려면 "My Store"를 클릭하고 이 과정을 반복하면 됩니다.

  장바구니에 여러 상품을 추가해 보세요.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart page with products added">
    </div>

<div class="alert is-helpful">

<!--
StackBlitz tip: Any time the preview refreshes, the cart is cleared. If you make changes to the app, the page refreshes, so you'll need to buy products again to populate the cart.
-->
StackBlitz 팁: 미리보기 화면이 새로고침되면 장바구니가 초기화됩니다. 이 환경에서는 앱 코드가 변경될 때마다 "Buy" 버튼을 클릭해서 장바구니에 상품을 추가해야 합니다.

</div>

<div class="alert is-helpful">

<!--
For more information about services, see [Introduction to Services and Dependency Injection](guide/architecture-services "Architecture > Intro to Services and DI").
-->
서비스에 대해 더 알아보려면 [서비스와 의존성 주입](guide/architecture-services "Architecture > Intro to Services and DI") 문서를 참고하세요.

</div>


## Retrieve shipping prices
<!-- Accessing data with the HTTP client -->

Servers often return data in the form of a stream.
Streams are useful because they make it easy to transform the returned data and  make modifications to the way you request that data.
The Angular HTTP client, `HttpClient`, is a built-in way to fetch data from external APIs and provide them to your app as a stream.

This section shows you how to use the HTTP client to retrieve shipping prices from an external file.

### Predefined shipping data

The application that StackBlitz generates for this guide comes with predefined shipping data in `assets/shipping.json`.
Use this data to add shipping prices for items in the cart.

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json">
</code-example>


### Use `HttpClient` in the `AppModule`

Before you can use Angular's HTTP client, you must configure your app to use `HttpClientModule`.

Angular's `HttpClientModule` registers the providers your app needs to use a single instance of the `HttpClient` service throughout your app.

1. Open `app.module.ts`.

  This file contains imports and functionality that is available to the entire app.

1. Import `HttpClientModule` from the `@angular/common/http` package at the top of the file with the other imports. As there are a number of other imports, this code snippet omits them for brevity. Be sure to leave the existing imports in place.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `AppModule` `@NgModule()` `imports` array to register Angular's `HttpClient` providers globally.

    <code-example path="getting-started/src/app/app.module.ts" header="src/app/app.module.ts" region="http-client-module">
    </code-example>

### Use `HttpClient` in the cart service

Now that the `AppModule` imports the `HttpClientModule`, the next step is to inject the `HttpClient` service into your service so your app can fetch data and interact with external APIs and resources.


1. Open `cart.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http">
    </code-example>

1. Inject `HttpClient` into the `CartService` constructor:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="inject-http">
    </code-example>


### Define the `get()` method

Multiple components can leverage the same service.
Later in this tutorial, the shipping component uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file.
First, define a `get()` method.

1. Continue working in `cart.service.ts`.

1. Below the `clearCart()` method, define a new `getShippingPrices()` method that uses the `HttpClient` `get()` method to retrieve the shipping data.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>


<div class="alert is-helpful">

For more information about Angular's `HttpClient`, see [HttpClient](guide/http "HttpClient guide").

</div>

## Define the shipping page

Now that your app can retrieve shipping data, create a shipping component and  template.

1. Generate a new component named `shipping`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.1.ts"></code-example>

1. In `app.module.ts`, add a route for shipping. Specify a `path` of `shipping` and a component of `ShippingComponent`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>

    There's no link to the new shipping component yet, but you can see its template in the preview pane by entering the URL its route specifies. The URL has the pattern: `https://getting-started.stackblitz.io/shipping` where the `getting-started.stackblitz.io` part may be different for your StackBlitz project.

1. Modify the shipping component so that it uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file.

    1. Import the cart service.

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. Define a `shippingCosts` property.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. Inject the cart service in the `ShippingComponent` constructor:

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

    1. Set the `shippingCosts` property using the `getShippingPrices()` method from the cart service.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. Update the shipping component's template to display the shipping types and prices using the `async` pipe:

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

    The `async` pipe returns the latest value from a stream of data and continues to do so for the life of a given component. When Angular destroys that component, the `async` pipe automatically stops. For detailed information about the `async` pipe, see the [AsyncPipe API documentation](/api/common/AsyncPipe).

1. Add a link from the cart page to the shipping page:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

1. Test your shipping prices feature:

    Click the "Checkout" button to see the updated cart. Remember that changing the app causes the preview to refresh, which empties the cart.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-empty-with-shipping-prices.png' alt="Cart with link to shipping prices">
    </div>

    Click on the link to navigate to the shipping prices.

    <div class="lightbox">
      <img src='generated/images/guide/start/shipping-prices.png' alt="Display shipping prices">
    </div>


## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart. You can also look up and display shipping prices.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](start/start-forms "Getting Started: Forms") to finish the app by adding the shopping cart page and a checkout form.
* [Skip ahead to the "Deployment" section](start/start-deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.
