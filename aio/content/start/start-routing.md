<!--
# Adding navigation
-->
# 네비게이션

<!--
At the end of [part 1](start "Get started with a basic Angular app"), the online store application has a basic product catalog.
The app doesn't have any variable states or navigation.
There is one URL, and that URL always displays the "My Store" page with a list of products and their descriptions.

This guide shows you how to use Angular [routing](guide/glossary#router "Router definition") to give the user in-app navigation. In a single-page app, instead of loading new pages, you show different components and data to the user based on where the user is in the application.

The router lets you display full product details in separate [views](guide/glossary#view "View definition"), each with its own URL. Routing enables navigation from one view to the next (within the same page) as users perform tasks such as the following:

* Entering a URL in the address bar to navigate to a corresponding view.
* Clicking links on the page to navigate to a new view.
* Clicking the browser's back and forward buttons to navigate backward and forward through the browser history.
-->
[1단계](start "Get started with a basic Angular app")를 마지막까지 진행하고 나면 온라인 샵 예제 애플리케이션에는 상품 목록을 표시하는 기능이 있습니다.
하지만 아직 이 앱에는 화면을 전환하는 기능이 없습니다.
접근할 수 있는 URL은 하나뿐이며, 이 주소로 접속하면 언제나 "My Store" 화면이 표시되면서 상품의 목록이 표시됩니다.

이 문서에서는 Angular [라우터](guide/glossary#router "Router definition") 기능을 활용해서 화면 전환 기능을 추가해 봅시다.
단일 페이지 애플리케이션에서는 화면을 전환할 때 새로운 페이지를 로드하지 않습니다.
대신 사용자가 접근한 위치에 맞는 데이터와 컴포넌트를 화면에 표시하는 방식을 사용합니다.

라우터를 사용하면 특정 상품에 대한 상세 정보를 URL로 구분해서 별도 [화면](guide/glossary#view "View definition")으로 표시할 수 있습니다.
다음과 같은 방식으로 활용할 수 있습니다:

* 주소표시줄에 URL을 입력하면 해당 URL에 맞는 화면으로 이동합니다.
* 화면에 있는 링크를 클릭하면 해당 화면으로 이동합니다.
* 브라우저의 뒤로 가기, 앞으로 가기 버튼을 누르면 브라우저 히스토리 기록에 따라 앞으로/뒤로 이동합니다.


<!--
## Registering a route
-->
## 라우팅 규칙 등록하기

<!--
The app is already set up to use the Angular `Router` and to use routing to navigate to the product list component you modified earlier. This section shows you how to define a route to show individual product details.

1. Generate a new component for product details. Give the component the name `product-details`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

1. In `app.module.ts`, add a route for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>

    A route associates one or more URL paths with a component.

1. The directive configures the component template to define how the user navigates to the route or URL. When the user clicks a product name, the app  displays the details for that product.

    1. Open `product-list.component.html`.

    1. Update the `*ngFor` directive to assign each index in the `products` array to the `productId` variable when iterating over the list.

    1. Modify the product name anchor to include a `routerLink`.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>

      The RouterLink directive gives the router control over the anchor element. In this case, the route, or URL, contains one fixed segment, `/products`, while the final segment is variable, inserting the id property of the current product. For example, the URL for a product with an `id` of 1 will be similar to `https://getting-started-myfork.stackblitz.io/products/1`.

1. Test the router by clicking a product name. The app displays the product details component, which currently always says "product-details works!"

    Notice that the URL in the preview window changes. The final segment is `products/#`  where `#` is the number of the route you clicked.

    <div class="lightbox">
      <img src="generated/images/guide/start/product-details-works.png" alt="Product details view with updated URL">
    </div>
-->
애플리케이션을 생성하면 Angular `Router`도 기본으로 구성되기 때문에 상품 목록 컴포넌트를 수정하면 화면 전환 기능을 바로 활용할 수 있습니다.
이 섹션에서는 각 상품의 상세정보를 표시하는 화면을 라우팅 규칙으로 어떻게 등록할 수 있는지 알아봅시다.

1. 상품 상세정보를 표시할 컴포넌트를 생성합니다. 이 컴포넌트의 이름은 `product-details`라고 합시다.

    참고: 파일 목록에서 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Component`를 선택하면 됩니다.

1. `app.module.ts` 파일에 상품 상세정보에 해당하는 라우팅 규칙을 등록합니다. 이 때 `path`는 `products/:productId`를 지정하고 `component`에는 `ProductDetailsComponent`를 지정합니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>

    컴포넌트 하나에는 URL 주소를 여러개 연결할 수도 있습니다.

1. 라우팅 규칙으로 등록한 주소로 이동하려면 컴포넌트 템플릿에 이 기능을 하는 디렉티브를 추가하면 됩니다. 사용자가 상품 이름을 클릭하면 상품의 상세정보를 표시하도록 구현해 봅시다.

    1. `product-list.component.html` 파일을 엽니다.

    1. `*ngFor` 디렉티브에서 목록을 순회하면서 할당되는 인덱스를 `productId`로 지정하기 위해 `*ngFor` 디렉티브를 수정합니다.

    1. 상품 이름을 표시하는 앵커  엘리먼트의 `routerLink`를 다음과 같이 수정합니다.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>

      RouterLink 디렉티브를 사용하면 앵커 엘리먼트의 동작을 가로채서 라우터가 제어합니다. 그리고 이 문서에서 다룬 경우라면 주소가 `/products`라는 접두사 뒤에 id 프로퍼티가 뒤에 붙는 형식으로 구성됩니다. 그래서 `id`가 1이라면 전체 주소는 `https://getting-started-myfork.stackblitz.io/products/1`이 됩니다.

1. 상품 이름을 클릭해서 라우터가 동작하는지 확인해 봅시다. 상품 이름을 클릭하면 상품 상세정보 컴포넌트로 전환되면서 "product-details works!" 라는 문구가 화면에 표시됩니다.

    미리보기 화면에서 URL이 변경되는 것을 확인해 보세요. URL의 마지막 부분은 `products/#`라는 형식으로 구성되는데, 이 때 `#` 부분은 클릭한 상품에 따라 달라집니다.

    <div class="lightbox">
      <img src="generated/images/guide/start/product-details-works.png" alt="Product details view with updated URL">
    </div>


<!--
## Using route information
-->
## 라우팅 규칙 활용하기

<!--
The product details component handles the display of each product. The Angular Router displays components based on the browser's URL and your defined routes. This section shows you how to use the Angular Router to combine the `products` data and route information to display the specific details for each product.

1. Open `product-details.component.ts`

1. Arrange to use product data from an external file.

    1. Import `ActivatedRoute` from the `@angular/router` package, and the `products` array from `../products`.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

    1. Define the `product` property and inject the `ActivatedRoute` into the constructor by adding it as an argument within the constructor's parentheses.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>

        The `ActivatedRoute` is specific to each routed component that the Angular Router loads. It contains information about the
        route, its parameters, and additional data associated with the route.

        By injecting the `ActivatedRoute`, you are configuring the component to use a *service*. The [Managing Data](start/start-data "Try it: Managing Data") page covers services in more detail.


1. In the `ngOnInit()` method, subscribe to route parameters and fetch the product based on the `productId`.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" header="src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

    The route parameters correspond to the path variables you define in the route. The URL that matches the route provides the `productId`. Angular uses the `productId` to display the details for each unique product.

1. Update the template to display product details information inside an `*ngIf`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

    <div class="alert is-helpful">

    The line, `<h4>{{ product.price | currency }}</h4>`, uses the `currency` pipe to transform `product.price` from a number to a currency string. A pipe is a way you can transform data in your HTML template. For more information about Angular pipes, see [Pipes](guide/pipes "Pipes").

    </div>

Now, when users click on a name in the product list, the router navigates them to the distinct URL for the product, swaps out the product list component for the product details component, and displays the product details.

<div class="lightbox">
  <img src="generated/images/guide/start/product-details-routed.png" alt="Product details page with updated URL and full details displayed">
</div>



<div class="alert is-helpful">

For more information about the Angular Router, see [Routing & Navigation](guide/router "Routing & Navigation guide").

</div>
-->
상품 상세정보 컴포넌트는 각 상품의 상세 정보를 화면에 표시하는 역할을 합니다.
그리고 Angular 라우터는 브라우저 URL에 해당하는 라우팅 규칙을 찾아서 적절한 컴포넌트를 화면에 표시합니다.
이 섹션에서는 `products` 데이터와 라우팅 규칙에 있는 데이터를 활용해서 원하는 상품을 찾아 상세정보를 화면에 표시하는 방법에 대해 알아봅시다.

1. `product-details.component.ts` 파일을 엽니다.

1. 외부 파일에서 상품 데이터를 가져옵니다.

    1. `@angular/router` 패키지에서 `ActivatedRoute` 심볼을 로드하고 `../products` 파일에서 `products` 배열을 로드합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

    1. 클래스에 `product` 프로퍼티를 선언하고 생성자에 `ActivatedRoute` 객체 타입으로 의존성으로 주입합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>

        `ActivatedRoute`는 Angular 라우터가 동작할 때 사용된 특정 라우팅 규칙을 의미합니다.
        이 객체에는 라우팅 규칙 자체와 라우팅 변수 등 라우팅과 관련된 데이터가 담겨 있습니다.

        `ActivatedRoute`를 의존성으로 주입하면서 컴포넌트에 사용할 *서비스*를 추가로 주입할 수도 있습니다. 자세한 내용은 [데이터 다루기](start/start-data "Try it: Managing Data") 문서를 참고하세요.


3. `ngOnInit()` 메소드에서 라우팅 변수를 구독해서 `productId` 변수를 가져오고, 이 id에 해당하는 상품 정보를 가져옵니다.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" header="src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

    라우팅 변수는 라우팅 규칙에 선언한 대로 전달됩니다.
    그래서 이 경우에는 `productId`에 해당하는 URL 부분이 라우팅 변수로 전달됩니다.

4. 템플릿에서 `*ngIf` 안쪽을 다음과 같이 수정합니다.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>
    
    <div class="alert is-helpful">

    `<h4>{{ product.price | currency }}</h4>`라는 코드를 보면 `product.price`를 숫자 형태에서 통화 형식으로 변환하기 위해 `currency` 파이프를 사용했습니다.
    파이프는 HTML 템플릿 안에서 데이터가 표시되는 형식을 변환하는 역할을 합니다.
    자세한 내용은 [파이프](guide/pipes "Pipes") 문서를 참고하세요.

    </div>

이제 사용자가 상품 목록에서 상품 이름을 클릭하면 Angular 라우터가 해당 상품에 해당하는 주소로 이동하며 상품 목록 컴포넌트를 화면에서 제거하고 상품의 상세정보 컴포넌트를 화면에 표시합니다.

<div class="lightbox">
  <img src="generated/images/guide/start/product-details-routed.png" alt="Product details page with updated URL and full details displayed">
</div>



<div class="alert is-helpful">

Angular Router에 대해 자세하게 알아보려면 [라우팅 & 네비게이션](guide/router "Routing & Navigation guide") 문서를 참고하세요.

</div>


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have integrated routing into your online store.

* Products are linked from the product list view to individual products.
* Users can click on a product name from the list to see details in a new view, with a distinct URL/route.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Managing Data" section](start/start-data "Try it: Managing Data") to add a shopping cart feature, use a service to manage the cart data and use HTTP to retrieve external data for shipping prices.
* [Skip ahead to the Deployment section](start/start-deployment "Try it: Deployment") to deploy your app to Firebase or move to local development.
-->
축하합니다! 이제 온라인 샵 애플리케이션에 라우팅 기능이 추가되었습니다.

* 상품 목록에 있는 각 상품은 상세정보 화면과 연결되었습니다.
* 사용자가 상품 이름을 클릭하면 새로운 화면으로 전환하면서 상세정보를 확인할 수 있습니다.

다음 내용에 대해서도 알아보세요:
* 장바구니 기능을 구현하려면 ["데이터 다루기" 문서](start/start-data "Try it: Managing Data")를 참고하세요. 서비스를 활용하면 장바구니 데이터를 관리할 수 있으며 HTTP를 사용해서 가격정보와 같은 외부 데이터를 가져올 수 있습니다.
* 로컬 환경에서 개발하던 앱을 Firebase에 배포하려면 [배포 문서](start/start-deployment "Try it: Deployment")를 참고하세요.
