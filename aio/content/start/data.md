<!--
# Managing Data
-->
# 데이터 다루기

<!--
At the end of [Routing](start/routing "Getting Started: Routing"), the online store application has a product catalog with two views: a product list and product details. 
Users can click on a product name from the list to see details in a new view, with a distinct URL (route). 

In this section, you'll create the shopping cart. You'll:
* Update the product details page to include a "Buy" button, which adds the current product to a list of products managed by a cart service. 
* Add a cart component, which displays the items you added to your cart.
* Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's HttpClient to retrieve shipping data from a `.json` file.
-->
[라우팅](start/routing "시작하기: 라우팅") 문서를 마지막까지 진행하고 나면 온라인 쇼핑몰 앱에는 제품 목록 화면과 제품 상세정보 화면이 존재합니다.
그래서 제품 목록 화면에서 사용자가 제품의 이름을 클릭하면 새로운 화면으로 전환되면서 제품의 상세정보를 확인할 수 있습니다. 이 때 URL도 변경됩니다.

이번 섹션에서는 장바구니 기능을 추가해봅시다. 이렇게 진행합니다:
* 제품 상세정보 화면에 "Buy" 버튼을 추가합니다. 이 버튼을 클릭하면 현재 화면에 표시된 제품을 장바구니 서비스에 추가합니다.
* 장바구니 컴포넌트를 추가합니다. 이 컴포넌트는 장바구니에 들어있는 제품 목록을 표시합니다.
* 배송 비용 안내 컴포넌트를 추가합니다. 이 컴포넌트는 Angular의 HttpClient 모듈을 사용해서 `.json` 파일에 있는 제품 배송 비용을 받아옵니다.

{@a services}
<!--
## Services
-->
## 서비스(Services)

<!--
Services are an integral part of Angular applications. In Angular, a service is an instance of a class that can be made available to any part of your application using Angular's [dependency injection system](guide/glossary#dependency-injection-di "dependency injection definition").

Services are the place where you share data between parts of your application. For the online store, the cart service is where you store your cart data and methods.
-->
서비스는 Angular 애플리케이션에서 사용하는 데이터를 처리하는 객체입니다. Angular에서 서비스는 어떤 클래스의 인스턴스이며, Angular가 제공하는 [의존성 주입 시스템](guide/glossary#dependency-injection-di "dependency injection definition")을 사용해서 애플리케이션 어디에라도 자유롭게 사용할 수 있습니다.

서비스는 보통 애플리케이션 안에서 여러번 사용하는 데이터를 공유하는 용도로 사용합니다. 그래서 온라인 쇼핑몰이라면 장바구니 기능을 구현하기 위해 필요한 데이터와 메소드를 장바구니 서비스로 구현할 수 있습니다.

{@a create-cart-service}
<!--
## Create the shopping cart service
-->
## 장바구니 서비스 생성하기

<!--
Up to this point, users can view product information, and simulate sharing and being notified about product changes. They cannot, however, buy products. 

In this section, you'll add a "Buy" button the product details page. 
You'll also set up a cart service to store information about products in the cart.
-->
지금까지 앱을 구현하면서 사용자가 제품의 정보를 확인하고, 공유하거나, 제품 가격이 변동되었을 때 알림을 받는 동작을 가상으로 구현해봤습니다. 아직까지 제품 구매 기능은 없습니다.

이 섹션에서는 제품 상세정보 페이지에 "Buy" 버튼을 추가할 것입니다.
그리고 장바구니에 제품을 추가하기 위해 장바구니 서비스도 만들어 봅시다.

<div class="alert is-helpful">

<!--
Later, in the [Forms](start/forms "Getting Started: Forms") part of this tutorial, this cart service also will be accessed from the page where the user checks out. 
-->
이 섹션에서 만드는 장바구니 서비스는 이후에 진행할 [폼](start/forms "시작하기: 폼") 문서에서도 활용합니다.

</div>

{@a generate-cart-service}
<!--
### Define a cart service
-->
### 서비스 정의하기

<!--
1. Generate a cart service.

    1. Right click on the `app` folder, choose `Angular Generator`, and choose `**Service**`. Name the new service `cart`.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. If the generated `@Injectable()` decorator does not include the `{ providedIn: 'root' }` statement, then insert it as shown above.

1. In the `CartService` class, define an `items` property to store the list (array) of the current products in the cart. 
-->
1. 장바구니 서비스를 생성합니다.

    1. `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator`를 선택합니다. 그리고 `**Service**`를 선택하고 `cart`라는 이름으로 서비스를 생성합니다.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. 자동으로 생성된 `@Injectable()` 데코레이터에 `{ providedIn: 'root' }` 구문이 없다면 위 예제 코드처럼 추가해 줍니다.

1. 장바구니에 담길 제품 목록을 저장하기 위해 `CartService` 클래스에 `items` 프로퍼티를 선언합니다.

    <code-example path="getting-started/src/app/cart.service.ts" region="props"></code-example>

<!--
1. Define methods to add items to the cart, return cart items, and clear the cart items: 
-->
3. 제품을 장바구니에 추가하는 메소드, 장바구니 목록을 반환하는 메소드, 장바구니를 비우는 메소드를 추가합니다:

    <code-example path="getting-started/src/app/cart.service.ts" region="methods" linenums="false"></code-example>

    <!--
    To check: StackBlitz includes the constructor. If it's important (and not obvious) that the methods be below the constructor, then we should show it or say something. 
    -->

    <!-- 
    * The `addToCart()` method appends a product to an array of `items`. 

    * The `getItems()` method collects the items added to the cart and returns each item with its associated quantity.

    * The `clearCart()` method returns an empty array of items. 
    -->

{@a product-details-use-cart-service}
<!--
### Use the cart service 
-->
### 서비스 활용하기

<!--
In this section, you'll update the product details component to use the cart service. 
You'll add a "Buy" button to the product details view. 
When the "Buy" button is clicked, you'll use the cart service to add the current product to the cart. 

1. Open `product-details.component.ts`.

1. Set up the component to be able to use the cart service. 

    1. Import the cart service. 

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. Inject the cart service.
-->
이번 섹션에서는 제품 상세정보 컴포넌트에서 장바구니 서비스를 활용할 수 있도록 수정해 봅시다.
제품 상세정보 화면에 "Buy" 버튼을 추가한 후에, 사용자가 이 버튼을 클릭하면 현재 화면에 표시된 상품을 장바구니에 추가하는 기능을 구현합니다.

1. `product-details.component.ts` 파일을 엽니다.

1. 컴포넌트가 장바구니 서비스에 접근할 수 있도록 설정합니다.

    1. 장바구니 서비스를 로드합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. 그리고 이 서비스를 컴포넌트에 의존성으로 주입합니다.

        <code-example path="getting-started/src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

        <!-- 
        To do: Consider defining "inject" and describing the concept of "dependency injection"
        -->

<!--
1. Define the `addToCart()` method, which adds the current product to the cart. 

    The `addToCart()` method:
    * Receives the current `product`
    * Uses the cart service's `#addToCart()` method to add the product the cart
    * Displays a message that the product has been added to the cart
-->
3. 현재 화면에 표시된 제품을 장바구니에 담을 수 있도록 `addToCart()` 메소드를 정의합니다. 

    `addToCart()` 메소드는:
    * 현재 할당된 `product` 객체를 인자로 받습니다.
    * 제품을 장바구니에 넣기 위해 장바구니 서비스의 `addCart()` 메소드를 실행합니다.
    * 제품이 장바구니에 담겼다는 메시지를 표시합니다.
    
    <code-example path="getting-started/src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

<!--
1. Update the product details template to have a "Buy" button that adds the current product to the cart. 

    1. Open `product-details.component.html`.

    1. Add a button with the label "Buy", and bind the `click()` event to the `addToCart()` method: 

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.
-->
4. 그리고 제품 상세정보 템플릿에 "Buy" 버튼을 추가합니다. 사용자가 이 버튼을 클릭하면 제품을 장바구니에 담을 것입니다.

    1. `product-details.component.html` 파일을 엽니다.

    1. "Buy" 라고 적힌 버튼을 추가하고 이 버튼에서 발생하는 `click` 이벤트를 `addToCart()` 메소드와 바인딩합니다: 

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

<!--
1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.
-->
5. "Buy" 버튼이 추가된 것을 확인하려면 애플리케이션을 새로고침한 후에 제품 목록에서 제품 이름을 클릭해서 상세정보 화면을 표시하면 됩니다.

   <figure>
     <!--
     <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
     -->
     <img src='generated/images/guide/start/product-details-buy.png' alt="Buy 버튼이 추가된 모습">
   </figure>
 
 <!--
 1. Click the "Buy" button. The product is added to the stored list of items in the cart, and a message is displayed. 
 -->
 6. 이제 "Buy" 버튼을 클릭하면 제품이 장바구니에 들어가고 다음과 같은 안내 메시지가 표시됩니다.

    <figure>
      <!--
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
      -->
      <img src='generated/images/guide/start/buy-alert.png' alt="Buy 버튼을 눌렀을 때 알림을 표시하는 화면">
    </figure>

<!--
## Create the cart page
-->
## 장바구니 화면 만들기

<!--
At this point, users can put items in the cart by clicking "Buy", but they can't yet see their cart. 

We'll create the cart page in two steps: 

1. Create a cart component and set up routing to the new component. At this point, the cart page will only have default text. 
1. Display the cart items. 
-->
지금까지 작성한 앱에서 사용자가 "Buy" 버튼을 클릭하면 현재 화면에 표시된 제품이 장바구니에 추가되지만, 아직 장바구니 목록을 볼 수 있는 화면은 없습니다.

이번에는 장바구니 화면을 만들어 봅시다:

1. 장바구니 컴포넌트를 만들고 이 컴포넌트로 라우팅하는 규칙을 추가합니다. 아직까지 장바구니 페이지에는 기본으로 생성된 문자열만 존재합니다.

1. 이 화면에 장바구니에 담긴 아이템을 표시합니다.

<!--
### Set up the component
-->
### 컴포넌트 준비하기

 <!--
 To create the cart page, you begin by following the same steps you did to create the product details component and to set up routing for the new component.

1. Generate a cart component, named `cart`. 

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 
-->
 장바구니 화면은 제품 상세정보 컴포넌트를 만들었던 것과 동일한 과정으로 생성합니다.

 1. `cart` 라는 이름으로 장바구니 컴포넌트를 생성합니다.

    리마인드: 파일 목록에서 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator`를 선택한 후에 `Component`를 선택하면 됩니다.
    
    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

<!--
1. Add routing (a URL pattern) for the cart component. 

    Reminder: Open `app.module.ts` and add a route for the component `CartComponent`, with a `path` of `cart`:
-->
2. 장바구니 컴포넌트로 연결되는 라우팅 규칙을 추가합니다.

    리마인드: `app.module.ts` 파일을 열고 `CartComponent` 컴포넌트를 가리키는 라우팅 규칙을 추가합니다. 이 때 `path` 값은 `cart`로 지정 합니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

    <!-- 
    To do: Can we shorten the example code to remove the extra at the bottom? 
    -->

<!--
1. To see the new cart component, click the "Checkout" button. You can see the "cart works!" default text, and the URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project. 

    (Note: The "Checkout" button that we provided in the top-bar component was already configured with a `routerLink` for `/cart`.)
-->
3. 이제 장바구니 컴포넌트를 확인하려면 화면에서 "Checkout" 버튼을 클릭하면 됩니다. 그러면 컴포넌트가 생성되면서 함께 생성된 문구 "cart works!"가 표시되면서 주소는 `https://getting-started.stackblitz.io/cart`로 변경됩니다. 이 때 `getting-started.stackblitz.io`는 StackBlitz 프로젝트 이름에 따라 달라질 수 있습니다.

    (참고: 맨 위쪽 영역에 있는 "Checkout" 버튼은 `routerLink`를 사용해서 `/cart`로 이동하도록 미리 작성해두었다고 가정합시다.)

    <figure>
      <!--
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart page before customizing">
      -->
      <img src='generated/images/guide/start/cart-works.png' alt="장바구니 화면이 표시된 모습">
    </figure>


<!--
### Display the cart items 
-->
### 장바구니에 담긴 제품 목록 표시하기

<!--
Services can be used to share data across components:

* The product details component already uses the cart service (`CartService`) to add products to the cart.
* In this section, you'll update the cart component to use the cart service to display the products in the cart.


1. Open `cart.component.ts`.

1. Set up the component to be able to use the cart service. (This is the same way you set up the product details component to use the cart service, above.)

    1. Import the `CartService` from the `cart.service.ts` file.
-->
일반적으로 서비스는 컴포넌트끼리 데이터를 공유하는 용도로 사용합니다:

* 제품 상세정보 컴포넌트는 이미 장바구니 서비스(`CartService`)를 활용하고 있습니다.
* 이번 섹션에서는 장바구니에 담긴 제품 목록을 표시하도록 장바구니 컴포넌트를 수정해 봅시다.


1. `cart.component.ts` 파일을 엽니다.

1. 컴포넌트가 장바구니 서비스를 사용할 수 있도록 의존성으로 주입합니다. (위에서 제품 상세정보 컴포넌트에 장바구니 서비스를 의존성으로 주입했던 과정과 동일합니다.)

    1. `cart.service.ts` 파일에 있는 `CartService`를 로드합니다.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
        </code-example>
    <!--
    1. Inject the `CartService` to manage cart information.
    -->
    1. 장바구니에 담긴 목록을 가져오기 위해 `CartService`를 컴포넌트에 의존성으로 주입합니다.

        <code-example path="getting-started/src/app/cart/cart.component.2.ts" region="inject-cart">
        </code-example>

<!--
1. Define the `items` property to store the products in the cart.
-->
3. 장바구니에 담긴 제품 목록을 저장할 `items` 프로퍼티를 선언합니다.

    <code-example path="getting-started/src/app/cart/cart.component.2.ts" region="items">
    </code-example>

<!--
1. Set the items using the cart service's `getItems()` method. (You defined this method [when you generated `cart.service.ts`](#generate-cart-service).)

    The resulting `CartComponent` class should look like this: 
-->
4. 장바구니 서비스의 `getItems()` 메소드를 사용해서 장바구니에 담긴 제품 목록을 가져옵니다. (이 메소드는 [`cart.service.ts`](#generate-cart-service)를 생성했을 때 정의했습니다.)

    <code-example path="getting-started/src/app/cart/cart.component.3.ts" region="props-services">
    </code-example>

<!--
1. Update the template with a header ("Cart"), and use a `<div>` with an `*ngFor` to display each of the cart items with its name and price.

    The resulting `CartComponent` template should look like this: 
-->
5. 템플릿에 "Cart" 헤더를 추가하고 `<div>` 엘리먼트에 `*ngFor`를 사용해서 장바구니에 담긴 아이템을 모두 화면에 표시합니다.

    `CartComponent` 템플릿을 다음과 같이 수정하면 됩니다:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
    </code-example>

<!--
1. Test your cart component. 

    1. Click on "My Store" to go to the product list page.
    1. Click on a product name to display its details.
    1. Click "Buy" to add the product to the cart.
    1. Click "Checkout" to see the cart. 
    1. To add another product, click "My Store" to return to the product list. Repeat the steps above. 
-->
6. 장바구니 컴포넌트가 동작하는 것을 확인해 봅시다.

    1. "My Store"를 클릭하면 제품 목록 화면으로 이동합니다.
    1. 제품 이름을 클릭하면 제품 상세정보 화면으로 이동합니다.
    1. "Buy" 버튼을 누르면 제품을 장바구니에 추가합니다.
    1. "Checkout" 버튼을 클릭하면 장바구니 화면으로 이동합니다.
    1. 다른 제품을 장바구니에 추가하려면 "My Store"를 클릭해서 제품 목록 화면으로 돌아가면 됩니다. 이 과정을 반복해 보세요.

    <figure>
      <!--
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart page with products added">
      -->
      <img src='generated/images/guide/start/cart-page-full.png' alt="장바구니에 담긴 제품 목록이 표시되는 화면">
    </figure>


<div class="alert is-helpful">

<!--
StackBlitz tip: Any time the preview refreshes, the cart is cleared. If you make changes to the app, the page refreshes, and you'll need to buy products again to populate the cart. 
-->
StackBlitz 팁: 앱 코드를 수정하면 미리보기 화면이 다시 로드되면서 장바구니에 담긴 목록이 초기화됩니다. 장바구니 화면이 동작하는 것을 확인하려면 제품을 구입하는 과정을 반복하세요.

</div>

<!-- 
To do: New screen shot. No shipping prices link yet. Show a few products in the cart. 
-->

<div class="alert is-helpful">

<!--
Learn more: See [Introduction to Services and Dependency Injection](guide/architecture-services "Architecture > Intro to Services and DI") for more information about services. 
-->
더 알아보기: 서비스에 대해 자세하게 알아보려면 [서비스와 의존성 주입](guide/architecture-services "아키텍처 > 서비스와 의존성 주입") 문서를 참고하세요.

</div>


<!--
## Retrieve shipping prices
-->
## 배송 비용 정보 받아오기
<!-- Accessing data with the HTTP client -->

<!--
Data returned from servers often takes the form of a stream. 
Streams are useful because they make it easy to transform the data that is returned, and to make modifications to the way data is requested. 
The Angular HTTP client (`HttpClient`) is a built-in way to fetch data from external APIs and provide them to your application as a stream.

In this section, you'll use the HTTP client to retrieve shipping prices from an external file. 
-->
서버에서 받아오는 데이터는 스트림 형태일 때도 있습니다.
이 때 스트림 데이터는 중간에 다른 형태로 변환해서 원하는 곳에 전달할 수 있기 때문에 자주 사용됩니다.
Angular 애플리케이션에서는 Angular가 제공하는 HTTP 클라이언트 (`HttpClient`)를 사용해서 외부에서 데이터를 받아오고 스트림 형태로 전달할 수 있습니다.

이번 섹션에서는 외부 파일에 있는 배송 비용 데이터를 HTTP 클라이언트로 받아와 봅시다.

<!--
### Predefined shipping data
-->
### 배송 비용 데이터

<!--
For the purpose of this Getting Started, we have provided shipping data in `assets/shipping.json`. 
You'll use this data to add shipping prices for items in the cart. 
-->
이 섹션을 진행하기 위해 필요한 배송 비용 데이터는 `assets/shipping.json` 파일에 저장되어 있습니다.
이 데이터를 가져와서 장바구니에 담긴 제품의 배송 비용을 표시해 봅시다.

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json">
</code-example>


<!--
### Enable HttpClient for app
-->
### HttpClient 활성화하기

<!--
Before you can use Angular's HTTP client, you must set up your app to use `HttpClientModule`. 

Angular's `HttpClientModule` registers the providers needed to use a single instance of the `HttpClient` service throughout your app. 
The `HttpClient` service is what you inject into your services to fetch data and interact with external APIs and resources. 

1. Open `app.module.ts`. 

  This file contains imports and functionality that is available to the entire app. 

1. Import `HttpClientModule` from the `@angular/common/http` package.
-->
Angular가 제공하는 HTTP 클라이언트를 사용하려면 애플리케이션에 `HttpClientModule`을 로드해야 합니다.

앱에 `HttpClientModule`을 등록하면 앱 어디에서도 `HttpClient` 서비스를 의존성으로 주입해서 사용할 수 있도록 프로바이더도 자동으로 등록합니다.
그래서 외부 데이터를 가져와야 하는 서비스가 있다면 이 `HttpClient` 서비스를 의존성으로 주입한 후에 `HttpClient` 서비스가 제공하는 API를 사용해서 데이터를 받아오면 됩니다.

1. `app.module.ts` 파일을 엽니다. 

  이 파일에는 앱 전역에 사용할 모듈을 등록합니다.

1. `@angular/common/http` 패키지에 있는 `HttpClientModule`을 로드합니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

<!--
1. Add `HttpClientModule` to the `imports` array of the app module (`@NgModule`).

    This registers Angular's `HttpClient` providers globally.
-->
3. 앱 모듈(`@NgModule`)의 `imports` 배열에 `HttpClientModule`을 추가합니다.

    그러면 Angular HttpClient 프로바이더가 앱 전역 범위에 등록됩니다.
 
    <code-example path="getting-started/src/app/app.module.ts" region="http-client-module">
    </code-example>

<!-- 
To do: Should ReactiveFormsModule already be here? Currently, it is in the starter stackblitz, so this doc assumes it is already included and not added in the forms section.
-->

<!-- 
To do: Should ReactiveFormsModule already be here? 
-->

<!--
### Enable HttpClient for cart service 
-->
### 장바구니 서비스에서 HttpClient 활용하기

<!--
1. Open `cart.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.
-->
1. `cart.service.ts` 파일을 엽니다.

1. 그리고 `@angular/common/http` 패키지에 있는 `HttpClient` 심볼을 로드합니다.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http">
    </code-example>

<!--
1. Inject `HttpClient` into the constructor of the `CartService` component class: 
-->
3. `HttpClient`를 `CartService` 클래스에 의존성으로 주입합니다:

    <code-example path="getting-started/src/app/cart.service.ts" region="inject-http">
    </code-example>

<!--
### Define the get() method
-->
### get() 메소드 정의하기

<!--
As you've seen, multiple components can leverage the same service. 
Later in this tutorial, the shipping component will use the cart service to retrieve shipping data via HTTP from the `shipping.json` file. 
Here you'll define the `get()` method that will be used.

1. Continue working in `cart.service.ts`.

1. Below the `clearCart()` method, define a new `getShippingPrices()` method that uses the `HttpClient#get()` method to retrieve the shipping data (types and prices).
-->
위에서 구현한 것처럼, 컴포넌트들은 같은 서비스를 함께 사용할 수 있습니다.
그래서 나중에 나오는 배송 비용 안내 컴포넌트에서도 장바구니 서비스를 사용하며, HTTP 통신으로 `shipping.json` 파일에서 배송 비용 데이터를 가져오는 용도로 사용할 것입니다.
지금은 `get()` 메소드를 정의해 봅시다.

1. `cart.service.ts` 파일을 계속 수정합니다.

1. `clearCart()` 메소드 아래에 `getShippingPrices()` 메소드를 추가하고 외부 데이터를 가져오기 위해 `HttpClient#get()` 메소드를 사용하도록 다음과 같이 작성합니다:

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>


<div class="alert is-helpful">

<!--
Learn more: See the [HttpClient guide](guide/http "HttpClient guide") for more information about Angular's HttpClient. 
-->
더 알아보기: Angular HttpClient에 대해 자세하게 알아보려면 [HttpClient](guide/http "HttpClient") 문서를 참고하세요.

</div>



<!--
## Define the shipping page
-->
## 배송 비용 안내 페이지 만들기

<!--
Now that your app can retrieve shipping data, you'll create a shipping component and associated template. 

1. Generate a new component named `shipping`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 
-->
Angular 앱은 이제 배송 비용 데이터를 가져올 수 있습니다. 배송 비용 안내 컴포넌트를 만들어 봅시다.

1. `shipping`이라는 이름으로 새로운 컴포넌트를 생성합니다.

    리마인드: 파일 목록의 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator`를 선택한 후에 `Component`를 선택합니다.
    
    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.1.ts"></code-example>

<!--
1. In `app.module.ts`, add a route for shipping. Specify a `path` of `shipping` and a component of `ShippingComponent`. 
-->
2. `app.module.ts` 파일에 배송 비용 안내 페이지에 해당하는 라우팅 규칙을 추가합니다. `path`를 `shipping`으로 지정하고 `ShippingComponent`와 연결하면 됩니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>
<!--
    The new shipping component isn't hooked into any other component yet, but you can see it in the preview pane by entering the URL specified by its route. The URL has the pattern: `https://getting-started.stackblitz.io/shipping` where the `getting-started.stackblitz.io` part may be different for your StackBlitz project. 

1. Modify the shipping component so it uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file. 

    1. Import the cart service.

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. Define a `shippingCosts` property. 

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. Inject the cart service into the `ShippingComponent` class: 

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

    1. Set the `shippingCosts` property using the `getShippingPrices()` method from cart service.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. Update the shipping component's template to display the shipping types and prices using async pipe:
-->
    새로 만든 배송 비용 안내 컴포넌트는 아직 다른 컴포넌트 어디에도 사용되지 않았지만, 배송 비용 안내 컴포넌트에 해당하는 URL을 입력하면 이 컴포넌트가 동작하는 것을 미리보기 화면으로 확인할 수 있습니다. URL을 `https://getting-started.stackblitz.io/shipping`처럼 입력하면 됩니다. 이 때 `getting-started.stackblitz.io` 부분은 StackBlitz에 생성된 프로젝트에 따라 달라질 수 있습니다.

1. `shipping.json` 파일에 있는 데이터를 HTTP 통신으로 가져오기 위해 장바구니 서비스를 배송 비용 안내 컴포넌트에 의존성으로 주입합니다.

    1. 장바구니 서비스를 로드합니다.

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. `shippingCosts` 프로퍼티를 선언합니다. 

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. `ShippingComponent` 클래스에 장바구니 서비스를 의존성으로 주입합니다: 

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

    1. 장바구니 서비스에 있는 `getShippingPrices()`를 실행한 결과를 `shippingCosts` 프로퍼티에 할당합니다.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. 서비스에서 가져온 데이터를 `async` 파이프로 컴포넌트 템플릿에 표시합니다:

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

    <!--
    To decide: Should we describe async pipe
    -->

<!--
1. Add a link from the cart page to the shipping page:
-->
5. 배송가격 안내 화면으로 이동하는 링크를 장바구니 페이지에 추가합니다:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

<!--
1. Test your shipping prices feature:
    
    Click on the "Checkout" button to see the updated cart. (Remember that changing the app causes the preview to refresh, which empties the cart.)
-->
6. 배송 비용이 제대로 표시되는 것을 확인해 보세요:

    장바구니에 담긴 제품 목록을 확인하려면 "Checkout" 버튼을 클릭하면 됩니다. (앱 코드를 수정하면 미리보기 화면이 갱신되면서 장바구니 목록이 초기화된다는 것을 잊지마세요.)

    <figure>
      <!--
      <img src='generated/images/guide/start/cart-empty-with-shipping-prices.png' alt="Cart with link to shipping prices">
      -->
      <img src='generated/images/guide/start/cart-empty-with-shipping-prices.png' alt="배송 비용 안내 페이지로 이동하는 링크">
    </figure>

    <!--
    Click on the link to navigate to the shipping prices.
    -->
    이제 `Shipping Prices` 링크를 클릭하면 화면이 전환됩니다.

    <figure>
      <!--
      <img src='generated/images/guide/start/shipping-prices.png' alt="Display shipping prices">
      -->
      <img src='generated/images/guide/start/shipping-prices.png' alt="배송 비용이 표시되는 모습">
    </figure>


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have an online store application with a product catalog and shopping cart. You also have the ability to look up and display shipping prices. 

To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](start/forms "Getting Started: Forms") to finish the app by adding the shopping cart page and a form-based checkout feature. You'll create a form to collect user information as part of checkout. 
* [Skip ahead to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server. 
-->
축하합니다! 이제 온라인 쇼핑몰 앱에는 전체 제품 목록과 장바구니에 담긴 제품 목록을 확인할 수 있는 기능이 추가되었습니다. 배송 비용을 확인할 수 있는 페이지도 추가되었습니다.

이제 Angular에 대해 더 알아보기 위해 다음 코스 중 하나를 선택해 보세요:
* 주문 페이지를 추가해서 앱을 완성하려면 ["폼"](start/forms "시작하기: 폼") 문서를 참고하세요. 폼을 활용하면 사용자가 입력한 내용을 처리할 수 있습니다.
* 로컬 개발환경에 대해서 알아보거나 Angular 앱을 Firebase나 리모트 서버에 배포하는 방법에 대해 알아보려면 쭉 건너뛰고 ["개발"](start/deployment "Getting Started: Deployment") 문서를 참고하세요.