<!--
# Getting Started with Angular: Routing
-->
# Angular 시작하기: 라우팅

<!--
At the end of [Your First App](start "Getting Started: Your First App"), the online store application has a basic product catalog.
The app doesn't have any variable states or navigation.
There is one URL, and that URL always displays the "My Store" page with a list of products and their descriptions.

This guide shows you how to use the Angular Router to display full product details in separate pages, each with their own URLs.

The Angular [Router](guide/glossary#router "Router definition") enables you to show different components and data to the user based on where the user is in the application.
The router enables navigation from one view to the next as users perform tasks such as the following:

* Entering a URL in the address bar to navigate to a corresponding page.
* Clicking links on the page to navigate to a new page.
* Clicking the browser's back and forward buttons to navigate backward and forward through the browser history.
-->
[첫번째 앱 만들기](start "Getting Started: Your First App") 과정을 끝낸 후에 온라인 쇼핑몰 애플리케이션에는 상품 정보를 간단하게 소개하는 화면이 있습니다.
그리고 이 앱에는 아직 상태를 관리하거나 네비게이션하는 기능이 없습니다.
URL은 하나만 존재하며 이 앱은 언제나 "My Store" 페이지에서 상품의 목록과 간단한 설명만 표시하고 있습니다.

이 문서에서는 Angular Router를 이용해서 각 상품에 해당하는 URL을 할당하고, 각 URL에서 개별 상품의 상세 정보를 표시하도록 앱을 개선해 봅시다.

Angular [Router](guide/glossary#router "Router definition")를 사용하면 사용자가 애플리케이션에 접근하는 위치에 따라 어울리는 컴포넌트와 데이터를 화면에 표시할 수 있습니다.
라우터는 다음과 같은 사용자 동작에 반응해서 네비게이션을 수행합니다:

* 주소표시줄에 URL을 직접 입력했을 때
* 화면에 있는 링크를 클릭해서 새로운 페이지로 이동할 때
* 브라우저의 뒤로 가기, 앞으로 가기 버튼을 눌러서 브라우저 히스토리를 이동할 때


<!--
## Registering a route
-->
## 라우팅 규칙(route) 등록하기

<!--
The app is already set up to use the Angular Router and to use routing to navigate to the product list component you modified earlier. This section shows you how to define a route to show individual product details.

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
      <img src="generated/images/guide/start/product-details-works.png" alt="Product details page with updated URL">
    </div>
-->
사실 지금까지 만든 앱에는 이미 Angular Router가 설정되어 있으며 상품 목록 화면이 표시된 것도 라우터가 동작한 결과입니다. 이번 섹션에서는 라우팅 규칙을 추가해서 개별 상품의 상세정보를 표시해 봅시다.

1. 상품 상세정보 컴포넌트를 새로 만듭니다. 이 컴포넌트의 이름은 `product-details`라고 합시다.

    기억해 보세요: 파일 목록에서 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator` - `Component`를 선택하면 됩니다.

1. `app.module.ts` 파일을 열고 새로운 라우팅 규칙을 추가합니다. 이 때 `path`에는 `products/:productId`, `component`에는 `ProductDetailsComponent`를 지정합니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>

    라우팅 규칙을 지정할 때는 한 컴포넌트를 여러 URL과 연결할 수 있습니다.

1. 컴포넌트 템플릿에 디렉티브를 사용해서 라우팅 규칙에 지정된 URL로 사용자가 이동하게 합시다. 사용자가 상품 이름을 클릭하면 그 상품의 상세정보를 표시하려고 합니다.

    1. `product-list.component.html` 파일을 엽니다.

    1. `products` 배열마다 반복되는 `*ngFor` 디렉티브에서 현재 인덱스를 `productId`로 활용하도록 수정합니다.

    1. 상품의 이름이 표시되는 `<a>` 엘리먼트에 `routerLink`를 추가합니다.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>

      RouterLink 디렉티브를 사용하면 `<a>` 엘리먼트의 실행 주도권을 라우터로 옮깁니다. 이 경우에는 라우팅 규칙의 첫번째 항목 `/products`는 고정되어 있지만 마지막 항목은 변수로 처리되며, 상품 배열을 돌면서 할당되는 인덱스가 id로 활용됩니다. 예를 들어 상품의 `id`가 1이라면 이 상품의 상세정보를 가리키는 주소는 `https://getting-started-myfork.stackblitz.io/products/1`가 됩니다.

1. 상품 이름을 클릭해서 라우터가 동작하는 것을 확인해 보세요. 화면에 상품 상세정보 컴포넌트가 표시되면서 "product-details works!" 문구가 표시될 것입니다.

    미리보기 영역의 URL이 변경된 것도 확인해 보세요. 주소는 `products/#`와 같이 변경되며, 이 때 `#`는 클릭한 상품의 숫자가 됩니다.

    <div class="lightbox">
      <img src="generated/images/guide/start/product-details-works.png" alt="Product details page with updated URL">
    </div>


<!--
## Using route information
-->
## 라우팅 규칙에 있는 정보 활용하기

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

        By injecting the `ActivatedRoute`, you are configuring the component to use a service. While this part of the Getting Started tutorial uses this syntax briefly, the [Managing Data](start/start-data "Getting Started: Managing Data") page covers services in more detail.


1. In the `ngOnInit()` method, subscribe to route parameters and fetch the product based on the `productId`.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" header="src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

    The route parameters correspond to the path variables you define in the route. The URL that matches the route provides the `productId`. Angular uses the `productId` to display the details for each unique product.

1. Update the template to display product details information inside an `*ngIf`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

Now, when users click on a name in the product list, the router navigates them to the distinct URL for the product, swaps out the product list component for the product details component, and displays the product details.
-->
상품 상세정보 컴포넌트는 개별 상품의 상세정보를 화면에 표시하는 역할을 합니다. 이 때 Angular Router는 브라우저의 URL과 라우팅 규칙을 기반으로 적절한 컴포넌트를 화면에 표시합니다. 이번 섹션에서는 Angular Router가 `products` 데이터와 라우팅 규칙에 있는 정보를 어떻게 활용하는지 알아봅시다.

1. `product-details.component.ts` 파일을 엽니다.

1. 외부 파일에서 상품 데이터를 가져오도록 수정합니다.

    1. `@angular/router` 패키지에서 `ActivatedRoute` 심볼을 로드하고, `../products` 파일에서 `products` 심볼을 로드합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

    1. `product` 프로퍼티를 선언하고 컴포넌트 생성자에 `ActivatedRoute`를 의존성으로 주입합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>

        `ActivatedRoute`는 현재 화면을 표시하기 위해 라우터가 로드한 라우팅 규칙을 의미합니다. 이 객체에는 관련된 라우팅 규칙, 라우팅에 사용된 변수 등의 정보가 포함되어 있습니다.

        `ActivatedRoute`를 의존성으로 주입하는 것처럼 컴포넌트에는 서비스도 주입해서 사용할 수 있습니다. 이 문서에서는 간단하게만 알아봤지만, [데이터 다루기](start/start-data "Getting Started: Managing Data") 문서에서 이 내용을 자세하게 다룹니다.


3. `ngOnInit()` 메소드에서 라우팅 변수를 구독해서 `productId`를 참조합니다.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" header="src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

    라우팅 변수는 라우팅 규칙에서 변수로 선언된 부분을 의미합니다. 이 예제에서는 `productId`로 선언된 부분을 URL에서 추출하며, 이 정보를 사용해서 원하는 상품의 상세 정보를 화면에 표시할 수 있습니다.

1. 제품의 상세정보를 표시할 수 있도록 템플릿을 수정합니다. 이 내용은 `*ngIf` 안쪽에 작성합니다.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

이제 사용자가 상품 목록에서 상품 이름을 클릭하면 라우터가 해당 상품의 상세정보를 표시하는 URL로 이동하면서 상품 목록 컴포넌트가 상품 상세정보 컴포넌트로 변경되고 상품의 상세정보가 표시됩니다.

<div class="lightbox">
  <img src="generated/images/guide/start/product-details-routed.png" alt="Product details page with updated URL and full details displayed">
</div>


<div class="alert is-helpful">

<!--
For more information about the Angular Router, see [Routing & Navigation](guide/router "Routing & Navigation").
-->
Angular Router에 대해 자세히 알아보려면 [라우팅 & 네비게이션](guide/router "Routing & Navigation") 문서를 참고하세요.

</div>


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have integrated routing into your online store.

* Products are linked from the product list page to individual products.
* Users can click on a product name from the list to see details in a new view, with a distinct URL/route.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Managing Data" section](start/start-data "Getting Started: Managing Data") to add a shopping cart feature, use a service to manage the cart data and use HTTP to retrieve external data for shipping prices.
* [Skip ahead to the Deployment section](start/start-deployment "Getting Started: Deployment") to deploy your app to Firebase or move to local development.
-->
축하합니다! 이제 온라인 쇼핑몰 앱에 라우터가 추가되었습니다.

* 상품 목록 화면에 있는 상품들은 개별 상품 화면과 연결되었습니다.
* 사용자가 상품 이름을 클릭하면 상품의 상세정보가 화면에 표시되며, 이 때 URL도 변경됩니다.

이런 내용에 대해서도 알아보세요:
* 장바구니 기능과 외부에서 데이터를 가져오는 기능을 추가하려면 ["데이터 다루기"](start/start-data "Getting Started: Managing Data") 문서를 참고하세요.
* 앱을 Firebase에 배포하거나 로컬 개발환경을 설정하는 방법에 대해 알아보려면 [배포](start/start-deployment "Getting Started: Deployment") 문서를 참고하세요.