<!--
# Managing data
-->
# 데이터 다루기

<!--
At the end of [In-app Navigation](start/start-routing "Try it: In-app Navigation"), the online store application has a product catalog with two views: a product list and product details.
Users can click on a product name from the list to see details in a new view, with a distinct URL, or route.

This page guides you through creating the shopping cart in three phases:

* Update the product details view to include a "Buy" button, which adds the current product to a list of products that a cart service manages.
* Add a cart component, which displays the items in the cart.
* Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's `HttpClient` to retrieve shipping data from a `.json` file.
-->
[네비게이션](start/start-routing "Try it: In-app Navigation") 단계를 끝내고 나면 온라인 샵 애플리케이션에는 상품 목록 화면과 상품 상세정보 화면이 존재합니다.
사용자가 상품 목록 화면에서 상품 이름을 클릭하면 해당 상품과 연결된 주소로 이동하면서 상품 상세정보 화면이 표시됩니다.

이 문서에서는 3단계를 거쳐 장바구니 기능을 구현하는 방법에 대해 알아봅시다:

* 상품 상세정보 화면에 "Buy" 버튼을 추가합니다. 이 버튼을 누르면 현재 화면에 표시된 상품을 장바구니 목록에 추가합니다.
* 장바구니 컴포넌트를 추가합니다. 이 컴포넌트는 장바구니에 담긴 항목을 화면에 표시합니다.
* 배송 컴포넌트를 추가합니다. 이 컴포넌트는 Angular `HttpClient`를 사용해서 `.json` 파일을 읽어 오는데, 이 파일의 내용을 활용해서 장바구니에 담긴 상품의 배송 금액을 가져옵니다.


{@a services}
<!--
## Services
-->
## 서비스(Services)

<!--
Services are an integral part of Angular applications. In Angular, a service is an instance of a class that you can make available to any part of your application using Angular's [dependency injection system](guide/glossary#dependency-injection-di "Dependency injection definition").

Services are the place where you share data between parts of your application. For the online store, the cart service is where you store your cart data and methods.
-->
서비스는 Angular 애플리케이션의 구성요소를 통합하는 역할을 합니다.
서비스는 클래스 인스턴스이며 Angular의 [의존성 주입 시스템](guide/glossary#dependency-injection-di "Dependency injection definition")으로 주입할 수 있기 때문에 애플리케이션의 어느 곳에서도 자유롭게 활용할 수 있습니다.

서비스는 일반적으로 애플리케이션 구성요소끼리 데이터를 공유하는 용도로도 사용합니다.
그래서 이 문서에서는 장바구니 데이터를 저장하고 관리하는 기능을 장바구니 서비스에 구현해 봅시다.


{@a create-cart-service}
<!--
## Create the shopping cart service
-->
## 장바구니 서비스 생성하기

<!--
Up to this point, users can view product information, and
simulate sharing and being notified about product changes.
They cannot, however, buy products.

In this section, you add a "Buy" button to the product
details view and set up a cart service to store information
about products in the cart.

<div class="alert is-helpful">

A later part of this tutorial, [Use forms for user input](start/start-forms "Try it: Forms for user input"), guides you through accessing this cart service from the view where the user checks out.

</div>
-->
지금까지 구현된 애플리케이션에서는 사용자가 상품의 상세정보를 확인할 수 있지만 아직 구입할 수 없습니다.

이 섹션에서는 상품 상세정보 화면에 "Buy" 버튼을 추가하고, 장바구니에 상품을 담을 수 있는 장바구니 서비스를 구현해 봅시다.

<div class="alert is-helpful">

이후에 진행할 [폼으로 입력 받기](start/start-forms "Try it: Forms for user input") 문서에서 사용자가 주문을 진행할 때 이 장바구니 서비스를 다시 사용합니다.

</div>


{@a generate-cart-service}
<!--
### Define a cart service
-->
### 장바구니 서비스 생성하기

<!--
1. To generate a cart service, right click on the `app` folder, choose `Angular Generator`, and choose `Service`. Name the new service `cart`.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    <div class="alert is-helpful">

    The StackBlitz generator might provide the cart service in `app.module.ts` by default. That differs from the example, which uses a bundle-optimization technique, an  `@Injectable()` decorator with the `{ providedIn: 'root' }` statement.
    For more information about services, see [Introduction to Services and Dependency Injection](guide/architecture-services "Concepts > Intro to Services and DI").

    </div>

1. In the `CartService` class, define an `items` property to store the array of the current products in the cart.

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="props"></code-example>

1. Define methods to add items to the cart, return cart items, and clear the cart items:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="methods"></code-example>

    * The `addToCart()` method appends a product to an array of `items`.

    * The `getItems()` method collects the items users add to the cart and returns each item with its associated quantity.

    * The `clearCart()` method returns an empty array of items.
-->
1. 장바구니 서비스를 생성하려면 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Service`를 선택하면 됩니다. 이 때 서비스의 이름은 `cart`라고 지정합시다.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    <div class="alert is-helpful">

    StackBlitz에서 서비스를 생성하면 이 서비스가 `app.module.ts` 파일에 자동으로 등록됩니다.
    하지만 Angular CLI를 사용해서 서비스를 생성하면 번들링 최적화를 위해 `@Injectable()` 데코레이터에 `{ providedIn: 'root' }`가 지정되기 때문에 서비스가 앱 모듈에 등록되지 않습니다.
    더 자세한 내용은 [서비스와 의존성 주입](guide/architecture-services "Concepts > Intro to Services and DI") 문서를 참고하세요.

    </div>

1. `CartService` 클래스 안에 `items` 프로퍼티를 선언합니다. 이 프로퍼티는 장바구니에 담긴 상품을 저장할 때 사용합니다.

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="props"></code-example>

1. 장바구니에 상품을 추가하는 메소드, 장바구니에 담긴 상품 목록을 반환하는 메소드, 장바구니를 비우는 메소드를 선언합니다:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="methods"></code-example>

    * `addToCart()` 메소드는 `items` 배열에 상품을 추가합니다.

    * `getItems()` 메소드는 사용자가 장바구니에 추가한 상품 목록을 반환합니다.

    * `clearCart()` 메소드는 장바구니를 비우고 빈 배열을 반환합니다.


{@a product-details-use-cart-service}
<!--
### Use the cart service
-->
### 장바구니 서비스 활용하기

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

        <!-
        To do: Consider defining "inject" and describing the concept of "dependency injection"
        ->

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

    <div class="alert is-helpful">

    The line, `<h4>{{ product.price | currency }}</h4>`, uses the `currency` pipe to transform `product.price` from a number to a currency string. A pipe is a way you can transform data in your HTML template. For more information about Angular pipes, see [Pipes](guide/pipes "Pipes").

    </div>

1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.

    <div class="lightbox">
      <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
    </div>

 1. Click the "Buy" button to add the product to the stored list of items in the cart and display a confirmation message.

    <div class="lightbox">
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
    </div>
-->
이번 섹션에서는 장바구니 서비스를 활용해서 화면에 표시된 상품을 장바구니에 추가해 봅시다.

1. `product-details.component.ts` 파일을 엽니다.

1. 장바구니 서비스를 사용할 수 있도록 컴포넌트 코드를 수정합니다.

    1. 장바구니 서비스 심볼을 로드합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. `constructor()`에 장바구니 서비스를 의존성으로 주입합니다.

        <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

        <!--
        To do: Consider defining "inject" and describing the concept of "dependency injection"
        -->

1. 화면에 표시된 상품을 장바구니에 추가하는 `addToCart()` 메소드를 추가합니다.

    `addToCart()` 메소드는 다음 세 단계로 실행됩니다:
    * 현재 화면에 표시된 상품 `product`를 가져옵니다.
    * 장바구니 서비스의 `addToCart()` 메소드를 실행해서 장바구니에 상품을 추가합니다.
    * 장바구니에 상품이 추가되었다는 메시지를 표시합니다.

    <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

1. 상품 상세정보 화면의 템플릿에 "Buy" 버튼을 추가합니다. 이 버튼을 클릭하면 현재 화면에 표시된 상품을 장바구니에 추가합니다.

    1. `product-details.component.html` 파일을 엽니다.

    1. "Buy" 버튼을 추가하고 이 버튼에서 발생하는 `click` 이벤트를 `addToCart()` 메소드로 바인딩합니다:

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>
    
    <div class="alert is-helpful">

    `<h4>{{ product.price | currency }}</h4>` 코드에는 `product.price`에 있는 숫자값을 화폐 단위로 표시하기 위해 `currency` 파이프를 사용했습니다.
    파이프는 HTML 템플릿에서 데이터를 원하는 형태로 변형할 때 사용합니다.
    파이프에 대해 자세하게 알아보려면 [파이프](guide/pipes "Pipes") 문서를 참고하세요.

    </div>

1. 새로 추가한 "Buy" 버튼을 확인하기 위해 브라우저 새로고침 버튼을 클릭하고 상품 목록 화면에서 상품 이름을 클릭해서 상세정보 화면으로 이동합니다.

    <div class="lightbox">
      <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
    </div>

 1. "Buy" 버튼을 클릭하면 장바구니에 상품이 추가되고 상품이 추가되었다는 메시지가 표시됩니다.

    <div class="lightbox">
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
    </div>


<!--
## Create the cart view
-->
## 장바구니 화면 생성하기

<!--
At this point, users can put items in the cart by clicking "Buy", but they can't yet see their cart.

Create the cart view in two steps:

1. Create a cart component and configure routing to the new component. At this point, the cart view has only default text.
1. Display the cart items.
-->
이제 사용자가 "Buy" 버튼을 클릭하면 장바구니에 상품을 추가할 수 있습니다.
하지만 아직 장바구니에 어떤 상품이 담겼는지는 확인할 수 없습니다.

다음 두 단계를 거쳐 장바구니 화면을 만들어 봅시다:

1. 장바구니 컴포넌트를 생성하고 이 컴포넌트로 연결되는 라우팅 규칙을 추가합니다. 아직 장바구니 화면에는 컴포넌트를 생성할 때 함께 생성된 기본 텍스트만 존재합니다.

1. 장바구니에 담긴 아이템을 표시합니다.


<!--
### Set up the component
-->
### 컴포넌트 생성하기

<!--
 To create the cart view, begin by following the same steps you did to create the product details component and configure routing for the new component.

1. Generate a cart component, named `cart`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. Add routing (a URL pattern) for the cart component.

    Open `app.module.ts` and add a route for the component `CartComponent`, with a `path` of `cart`:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

1. Update the "Checkout" button so that it routes to the `/cart` url.

    Open `top-bar.component.html` and add a `routerLink` directive pointing to `/cart`.

    <code-example
        header="src/app/top-bar/top-bar.component.html"
        path="getting-started/src/app/top-bar/top-bar.component.html"
        region="cart-route">
    </code-example>

1. To see the new cart component, click the "Checkout" button. You can see the "cart works!" default text, and the URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart view before customizing">
    </div>
-->
장바구니 화면을 생성하는 과정은 상품 상세정보 컴포넌트를 생성했을 때와 비슷합니다.

1. `cart`라는 이름으로 장바구니 컴포넌트를 생성합니다.

    참고: 파일 목록에서 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Component`를 선택하면 됩니다.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. 장바구니 컴포넌트로 향하는 라우팅 규칙을 추가합니다.

    `app.module.ts` 파일을 열고 `path: cart` 주소에 `CartComponent`를 지정합니다:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

1. `/cart` 주소로 이동하도록 "Checkout" 버튼을 수정합니다.

    `top-bar.component.html` 파일을 열고 `routerLink`를 추가해서 `/cart`로 이동하도록 작성합니다.

    <code-example
        header="src/app/top-bar/top-bar.component.html"
        path="getting-started/src/app/top-bar/top-bar.component.html"
        region="cart-route">
    </code-example>

1. 이제 장바구니 컴포넌트로 이동하려면 "Checkout" 버튼을 클릭하면 됩니다. 그러면 `https://getting-started.stackblitz.io/cart` 형식의 주소로 이동하면서 기본 문구 `cart works!`가 화면에 표시됩니다. `getting-started.stackblitz.io` 부분은 StackBlitz 프로젝트에 따라 달라질 수 있습니다.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart view before customizing">
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

    1. Click on "My Store" to go to the product list view.
    1. Click on a product name to display its details.
    1. Click "Buy" to add the product to the cart.
    1. Click "Checkout" to see the cart.
    1. To add another product, click "My Store" to return to the product list.

  Repeat to add more items to the cart.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart view with products added">
    </div>


<div class="alert is-helpful">

StackBlitz tip: Any time the preview refreshes, the cart is cleared. If you make changes to the app, the page refreshes, so you'll need to buy products again to populate the cart.

</div>

<div class="alert is-helpful">

For more information about services, see [Introduction to Services and Dependency Injection](guide/architecture-services "Concepts > Intro to Services and DI").

</div>
-->
서비스를 활용하면 컴포넌트끼리 데이터를 주고 받을 수 있습니다:

* 상품 상세정보 컴포넌트는 장바구니에 상품을 추가할 때 장바구니 서비스를 활용합니다.
* 이번 섹션에서는 장바구니에 담긴 상품 목록을 표시하는 방법에 대해 알아봅시다.

1. `cart.component.ts` 파일을 엽니다.

1. 컴포넌트를 사용할 수 있도록 컴포넌트 코드를 수정합니다.

    1. `cart.service.ts` 파일에서 `CartService` 심볼을 로드합니다.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
        </code-example>

    1. `CartService`를 장바구니 컴포넌트에 의존성으로 주입합니다.

        <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="inject-cart">
        </code-example>

1. 장바구니에서 가져온 상품 목록을 저장할 `items` 프로퍼티를 선언합니다.

    <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="items">
    </code-example>

1. `items` 프로퍼티에는 장바구니 서비스의 `getItems()` 메소드를 실행한 결과를 할당합니다. 이 메소드는 [`cart.service.ts` 파일을 생성할 때](#generate-cart-service) 정의했습니다.

    그러면 `CartComponent` 클래스가 다음과 같이 완성됩니다:

    <code-example path="getting-started/src/app/cart/cart.component.3.ts" header="src/app/cart/cart.component.ts" region="props-services">
    </code-example>

1. 장바구니에 담긴 상품의 이름과 가격을 표시하기 위해 헤더 `<div>` 엘리먼트에 `*ngFor` 디렉티브를 사용합니다.

    `CartComponent` 템플릿을 이렇게 작성하면 됩니다:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
    </code-example>

1. 장바구니 컴포넌트가 동작하는 것을 확인해 봅시다.

    1. "My Store"를 클릭하면 상품 목록 화면으로 이동합니다.
    1. 상품 이름을 클릭하면 상품 상세정보 화면으로 이동합니다.
    1. "Buy" 버튼을 클릭하면 화면에 표시된 상품을 장바구니에 추가합니다.
    1. "Checkout" 버튼을 클릭하면 장바구니 화면으로 이동합니다.
    1. 다른 상품을 추가하려면 "My Store"를 클릭하고 상품 목록 화면으로 이동해서 같은 과정을 반복하면 됩니다.

  이 과정을 반복하면서 장바구니에 상품을 추가해 보세요.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart view with products added">
    </div>


<div class="alert is-helpful">

StackBlitz 팁: 앱을 수정하면 미리보기 화면이 자동으로 갱신되기 때문에 장바구니가 초기화됩니다. 미리보기 화면을 갱신하면 장바구니에 상품을 다시 담아야 합니다.

</div>

<div class="alert is-helpful">

서비스에 대해 자세하게 알아보려면 [서비스와 의존성 주입](guide/architecture-services "Concepts > Intro to Services and DI") 문서를 참고하세요.

</div>


<!--
## Retrieve shipping prices
-->
## 배송 가격 데이터 가져오기
<!-- Accessing data with the HTTP client -->

<!--
Servers often return data in the form of a stream.
Streams are useful because they make it easy to transform the returned data and make modifications to the way you request that data.
The Angular HTTP client, `HttpClient`, is a built-in way to fetch data from external APIs and provide them to your app as a stream.

This section shows you how to use the HTTP client to retrieve shipping prices from an external file.
-->
일반적으로 서버는 데이터를 스트림 형태로 제공합니다.
그런데 스트림은 그 흐름을 유지한 채로 다른 형태로 변환해서 다른 곳에 활용할 수 있다는 점에서 특히 유용합니다.
Angular가 제공하는 HTTP 클라이언트 `HttpClient`를 활용하면 외부 서버에서 제공하는 데이터를 스트림 형태로 가져올 수 있습니다.

이번 섹션에서는 HTTP 클라이언트를 활용해서 외부 파일에 있는 배송 가격 데이터를 가져와 봅시다.


<!--
### Predefined shipping data
-->
### 배송 가격 파일

<!--
The application that StackBlitz generates for this guide comes with predefined shipping data in `assets/shipping.json`.
Use this data to add shipping prices for items in the cart.
-->
이 문서에서 다루는 앱에는 `assets/shipping.json` 파일에 배송 가격이 저장되어 있습니다.
장바구니에 있는 상품와 이 데이터를 조합해 봅시다.

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json">
</code-example>


<!--
### Use `HttpClient` in the `AppModule`
-->
### `AppModule`에 `HttpClient` 등록하기

<!--
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
-->
Angular HTTP 클라이언트를 사용하려면 앱에 `HttpClientModule`을 로드해야 합니다.

`HttpClientModule`을 로드하면 `HttpClient`가 자동으로 앱에 등록되기 때문에 앱 전체 범위에서 `HttpClient` 인스턴스를 자유롭게 사용할 수 있습니다.

1. `app.module.ts` 파일을 엽니다.

  이 파일에는 앱 전역에 필요한 심볼과 기능이 등록됩니다.

1. `@angular/common/http` 패키지에 있는 `HttpClientModule`을 로드합니다. `app.module.ts` 파일에는 이 코드 말고도 심볼을 로드하는 코드가 많지만, 간단하게 `HttpClientModule`을 로드하는 부분만 살펴보면 이렇습니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. `HttpClientModule`을 `AppModule`에 붙은 `@NgModule()` 데코레이터 `imports` 배열에 추가합니다. 이 배열에  추가하면 `HttpClient`가 앱 전역 범위에 등록됩니다.

    <code-example path="getting-started/src/app/app.module.ts" header="src/app/app.module.ts" region="http-client-module">
    </code-example>


<!--
### Use `HttpClient` in the cart service
-->
### 장바구니 서비스에서 `HttpClient` 사용하기

<!--
Now that the `AppModule` imports the `HttpClientModule`, the next step is to inject the `HttpClient` service into your service so your app can fetch data and interact with external APIs and resources.


1. Open `cart.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http">
    </code-example>

1. Inject `HttpClient` into the `CartService` constructor:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="inject-http">
    </code-example>
-->
`AppModule`에 `HttpClientModule`을 등록하고 나면 이제 데이터를 가져올 서비스에 `HttpClient` 서비스를 의존성으로 주입해야 합니다.


1. `cart.service.ts` 파일을 엽니다.

1. `@angular/common/http` 패키지에 있는 `HttpClient` 심볼을 로드합니다:

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http">
    </code-example>

1. `CardService` 생성자에 `HttpClient`를 의존성으로 주입합니다:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="inject-http">
    </code-example>


<!--
### Define the `get()` method
-->
### `get()` 메소드 정의하기

<!--
Multiple components can leverage the same service.
Later in this tutorial, the shipping component uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file.
First, define a `get()` method.

1. Continue working in `cart.service.ts`.

1. Below the `clearCart()` method, define a new `getShippingPrices()` method that uses the `HttpClient` `get()` method to retrieve the shipping data.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>


<div class="alert is-helpful">

For more information about Angular's `HttpClient`, see the [Client-Server Interaction](guide/http "Server interaction through HTTP") guide.

</div>
-->
서비스를 한 번 만들어두면 여러 컴포넌트가 이 서비스를 활용할 수 있습니다.
그래서 이 튜토리얼 뒷부분에서는 배송 컴포넌트에서도 장바구니 서비스를 사용해서 `shipping.json` 파일에 있는 데이터를 다시 한 번 사용할 것입니다.
먼저, `get()` 메소드를 정의합니다.

1. `cart.service.ts` 파일을 계속 수정합니다.

1. `clearCart()` 메소드 아래에 `getShippingPrices()` 메소드를 추가합니다. 이 함수는 `HttpClient` `get()` 메소드를 사용해서 데이터를 가져옵니다.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>


<div class="alert is-helpful">

Angular `HttpClient`에 대해 자세하게 알아보려면 [클라이언트-서버 통신](guide/http "Server interaction through HTTP") 문서를 참고하세요.

</div>

<!--
## Define the shipping view
-->
## 배송 화면 생성하기

<!--
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

1. Add a link from the cart view to the shipping view:

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
-->
이제 배송 가격 데이터를 불러올 수 있습니다. 배송 화면 컴포넌트와 템플릿을 만들어 봅시다.

1. `shipping`이라는 이름으로 컴포넌트를 생성합니다.

    참고: 파일 목록에서 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Component`를 선택하면 됩니다.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.1.ts"></code-example>

1. `app.module.ts` 파일을 열고 배송 화면으로 연결되는 라우팅 규칙을 추가합니다. 이 때 `path`에는 `shipping`을 지정하고 `component`에는 `ShippingComponent`를 지정합니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>

    아직 배송 화면으로 이동하는 링크가 없지만 주소 표시줄에 URL을 입력하면 이 컴포넌트가 동작하는 것을 확인할 수 있습니다. URL 형식은 `https://getting-started.stackblitz.io/shipping`과 같은 형식입니다. `getting-started.stackblitz.io` 부분은 StackBlitz 프로젝트에 따라 다를 수 있습니다.

1. 배송 컴포넌트를 수정합니다. 장바구니 서비스에서 HTTP 클라이언트로 가져온 `shipping.json` 파일의 내용을 활용해 봅시다.

    1. 장바구니 서비스를 로드합니다.

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. `shippingCosts` 프로퍼티를 선언합니다.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. `ShippingComponent` 생성자에 장바구니 서비스를 의존성으로 주입합니다:

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

    1. 장바구니 서비스의 `getShippingPrices()` 메소드 실행 결과를 `shippingCosts` 프로퍼티에 할당합니다.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. 배송 형식과 가격을 화면에 표시하기 위해 컴포넌트 템플릿에 `async` 파이프를 다음과 같이 사용합니다:

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

    `async` 파이프는 스트림에서 전달되는 마지막 데이터를 반환하며 이 동작은 컴포넌트가 종료될 때까지 계속 실행됩니다.
    그리고 Angular가 컴포넌트를 종료하면 `async` 파이프도 자동으로 동작을 멈춥니다.
    `async` 파이프에 대해 자세하게 알아보려면 [AsyncPipe API  문서](/api/common/AsyncPipe)를 참고하세요.

1. 장바구니 화면에서 배송 화면으로 이동하는 링크를 추가합니다:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

1. 배송 가격이 제대로 표시되는지 확인해 보세요:

    장바구니를 확인하려면 "Checkout" 버튼을 클릭하면 됩니다.
    앱이 갱신되면 장바구니가 비워지는 것을 잊지 마세요.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-empty-with-shipping-prices.png' alt="Cart with link to shipping prices">
    </div>

    배송 컴포넌트로 이동하는 링크를 클릭합니다.

    <div class="lightbox">
      <img src='generated/images/guide/start/shipping-prices.png' alt="Display shipping prices">
    </div>


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have an online store application with a product catalog and shopping cart. You can also look up and display shipping prices.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](start/start-forms "Try it: Forms for User Input") to finish the app by adding the shopping cart view and a checkout form.
* [Skip ahead to the "Deployment" section](start/start-deployment "Try it: Deployment") to move to local development, or deploy your app to Firebase or your own server.
-->
축하합니다!
온라인 샵 애플리케이션에는 이제 상품 목록과 장바구니 화면이 추가되었습니다.
배송 금액이 얼마인지 확인할 수도 있습니다.

다음 내용에 대해서도 알아보세요:

* 장바구니 화면에 주문 폼을 추가하려면 ["Forms" 문서](start/start-forms "Try it: Forms for User Input")를 확인해 보세요.
* 로컬 환경에서 개발하던 앱을 Firebase에 배포하려면 [배포 문서](start/start-deployment "Try it: Deployment")를 참고하세요.
