<!--
# Routing
-->
# 라우팅 (Routing)

<!--
At the end of [Your First App](start "Getting Started: Your First App"), the online store application has a basic product catalog. 
The app doesn't have any variable states or navigation. 
There is one URL, and that URL always displays the "My Store" page with a list of products and their descriptions. 

In this section, you'll extend the app to display full product details in separate pages, with their own URLs.

To do this, you'll use the Angular *router*. 
The Angular [router](guide/glossary#router "router definition") enables you to show different components and data to the user based on where the user is in the application. 
The router enables navigation from one view to the next as users perform application tasks: 

* Enter a URL in the address bar, and the browser navigates to a corresponding page.
* Click links on the page, and the browser navigates to a new page.
* Click the browser's back and forward buttons, and the browser navigates backward and forward through the history of pages you've seen.
-->
[첫번째 Angular 앱](start "Getting Started: Your First App")을 끝낸 시점에 우리가 만든 온라인 쇼핑몰 애플리케이션에는 간단한 제품 목록만 존재합니다.
그래서 아직까지 앱의 상태를 관리하거나 네비게이션하는 기능은 없습니다.
앱이 동작하는 URL은 하나뿐이고, 이 URL에서는 언제나 제품의 목록과 간단한 설명을 표시하는 "My Page" 페이지만 표시됩니다.

이번 섹션에서는 제품에 대한 상세정보를 표시하는 화면을 만들어 봅시다. 이 페이지가 표시되는 URL도 새로 할당할 것입니다.

이렇게 구현하려면 Angular *라우터(router)*를 사용하면 됩니다.
[라우터](guide/glossary#router "router definition")를 사용하면 사용자가 접속한 주소에 어울리는 컴포넌트와 데이터를 사용자에게 보여줄 수 있습니다.
라우터는 다음과 같은 경우에 동작합니다:

* 주소표시줄에 URL을 새로 입력해서 새로운 페이지로 이동할 때
* 페이지에 있는 링크를 클릭해서 새로운 페이지로 이동할 때
* 브라우저의 뒤로가기, 앞으로 가기 버튼을 눌러서 브라우저 히스토리에 있는 페이지로 이동할 때

<!--
## Registering a route
-->
## 라우팅 규칙(route) 등록하기

<!--
The app is already set up to use the Angular router and to use routing to navigate to the product list component you modified earlier. Let's define a route to show individual product details.

1. Generate a new component for product details. Give the component the name `product-details`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 

1. In `app.module.ts`, add a route for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.
-->
지금까지 만든 앱은 이미 Angular 라우터를 사용할 준비가 되어있고, 제품 목록 컴포넌트도 이 라우터를 활용해서 표시되고 있습니다. 이제 제품 상세정보 화면으로 전환하는 라우팅 규칙을 추가해 봅시다.

1. 제품 상세정보 컴포넌트를 생성합니다. 컴포넌트의 이름은 `product-details`로 합니다.

    리마인드: 파일 목록의 `app` 폴더에 마우스 오른쪽 버튼을 클릭하고 `Angular Generator`를 선택한 후에 `Component`를 선택하면 됩니다.

1. `app.module.ts` 파일에 제품 상세정보에 해당하는 라우팅 규칙을 추가합니다. `RouterModule`을 로드하는 곳에 새로운 `path`를 추가하고 `ProductDetailsComponent`를 다음과 같이 지정합니다.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>
<!--    
    A route associates one or more URL paths with a component.

1. Define a link using the `RouterLink` directive. The `routerLink` defines how the user navigates to the route (or URL) declaratively
    in the component template.

    We want the user to click a product name to display the details for that product. 

    1. Open `product-list.component.html`.

    1. Update the `*ngFor` directive to assign each index in the `products` array to the `productId` variable when iterating over the list.
    
    1. Modify the product name anchor to include a `routerLink`.
-->
    라우팅 규칙은 URL과 컴포넌트를 연결하는 규칙을 의미합니다.

1. `RouterLink` 디렉티브를 사용해서 링크를 연결합니다. `routerLink`를 사용하면 사용자가 템플릿에서 원하는 방식으로 페이지를 전환할 수 있습니다.

    지금은 사용자가 제품 이름을 클릭했을 때 페이지를 전환하려고 합니다.

    1. `product-list.component.html` 파일을 엽니다.

    1. 제품 목록이 저장된 `products` 배열을 `*ngFor` 디렉티브로 순회할 때 인덱스 변수가 할당되는데, 이 인덱스를 제품 ID로 사용하도록 수정합니다.
    
    1. 제품 이름을 표시하는 앵커에 `routerLink` 디렉티브를 다음과 같이 추가합니다.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>

    <!-- 
    To do: I see a comment line with ellipses between the closing of h3 and div. It's an interesting way to show that we've clipped out some code. Should we use this elsewhere? 
    -->

      <!--
      The RouterLink directive gives the router control over the anchor element. In this case, the route (URL) contains one fixed segment (`/products`) and the final segment is variable, inserting the id property of the current product. For example, the URL for a product with an `id` of 1 will be similar to `https://getting-started-myfork.stackblitz.io/products/1`. 
      -->
      앵커 엘리먼트에 RouterLink 디렉티브를 사용하면 앵커 엘리먼트 원래의 역할보다 Angular 라우터의 역할이 우선 처리됩니다. 그리고 이 예제에서는 RouterLink 디렉티브에 연결된 라우팅 규칙은 고정된 URL(`/products`)과 `*ngFor`에서 반복되는 변수(`productId`)로 구성됩니다. 그래서 `https://getting-started-myfork.stackblitz.io/products/1`와 같은 URL이 있다면 이 URL은 ID가 1인 제품의 상세정보를 표시하는 화면을 의미한다고 할 수 있습니다 

<!--
1. Test the router by clicking a product name. The app displays the product details component, which currently always says "product-details works!" (We'll fix this in the next section.)

    Notice that the URL in the preview window changes. The final segment is `products/1`.
-->
4. 제품 이름을 클릭해서 라우터가 동작하는 것을 확인해 보세요. 링크를 클릭하면 제품 상세정보 컴포넌트가 표시되지만, 아직까지는 항상 "product-details works!"라는 문구만 표시될 것입니다. (이 문구는 다음 섹션에서 수정합니다.)

    미리보기 창에 있는 URL이 변경된 것을 확인해 보세요. URL은 `products/1`으로 끝납니다.

    <figure>
      <!--
      <img src="generated/images/guide/start/product-details-works.png" alt="Product details page with updated URL">
      -->
      <img src="generated/images/guide/start/product-details-works.png" alt="URL이 변경되면서 제품 상세정보 화면이 표시된 모습">
    </figure>

    
<!--
## Using route information
-->
## 라우팅 규칙 활용하기

<!--
The product details component handles the display of each product. The Angular Router displays components based on the browser's URL and your defined routes. You'll use the Angular Router to combine the `products` data and route information to display the specific details for each product.

1. Open `product-details.component.ts`

1. Arrange to use product data from an external file. 

    1. Import `ActivatedRoute` from the `@angular/router` package, and the `products` array from `../products`.
-->
제품 상세정보 컴포넌트는 각 제품에 대한 설명을 표시하는 컴포넌트입니다. 그리고 Angular 라우터는 브라우저의 URL과 해당 URL에 연결된 라우팅 규칙을 기반으로 컴포넌트를 표시합니다. 이번에는 `products` 데이터와 라우팅 규칙을 활용해서 원하는 제품의 상세정보를 표시해 봅시다.

1. `product-details.component.ts` 파일을 엽니다.

1. 외부 파일에서 제품 데이터를 가져옵니다. 

    1. `@angular/router` 패키지에 있는 `ActivatedRoute`를 로드합니다. 그리고 `../products` 파일에서 `products` 배열을 로드합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>
    <!--
    1. Define the `product` property and inject the `ActivatedRoute` into the constructor.
    -->
    1. `product` 프로퍼티를 선언하고 컴포넌트 클래스의 생성자에 `ActivatedRoute`를 의존성으로 주입합니다.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>
        <!--
        The `ActivatedRoute` is specific to each routed component loaded by the Angular Router. It contains information about the
        route, its parameters, and additional data associated with the route.
        -->
        `ActivatedRoute`은 Angular 라우터가 컴포넌트를 로드할 때 사용한 라우팅 규칙을 의미합니다. 이 객체에는 현재 사용된 라우팅 규칙, 라우팅 변수 등의 데이터가 들어있습니다.

        <!-- 
        To do: This is the first time we inject anything into a component. Should we mention it here? There's also a comment about maybe explaining it a bit in the services section (in data.md).
        -->

<!--
1. In the `ngOnInit()` method, _subscribe_ to route params and fetch the product based on the `productId`.
-->
3. `ngOnInit()` 메소드에서 라우팅 변수를 _구독(subscribe)_ 한 후에 옵저버에서 `productId`를 참조합니다.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" region="get-product">
    </code-example>

    <!--
    The route parameters correspond to the path variables defined in the route. The `productId` is provided from
    the URL that was matched to the route. You use the `productId` to display the details for each unique product. 

1. Update the template to display product details information inside an `*ngIf`.
-->
    라우팅 변수는 라우팅 규칙에 사용된 path 변수에 따라 달라집니다. 그리고 이 예제에서는 위에서 정의한 라우팅 규칙에 따라 `productId`가 라우팅 변수로 사용되었습니다. `productId` 변수는 특정 제품을 구분하는 용도로 사용합니다.

1. 템플릿에서 제품의 상세정보가 표시되는 영역을 `*ngIf`로 감쌉니다.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

<!--
Now, when the user clicks on a name in the product list, the router navigates you to the distinct URL for the product, swaps out the product list component for the product details component, and displays the product details. 
-->
이제 사용자가 제품 목록에서 제품 이름을 클릭하면 라우터가 동작하면서 해당 제품에 해당하는 URL로 이동하는데, 이 때 화면에는 제품 목록 컴포넌트 대신 제품 상세정보 컴포넌트가 표시됩니다.

  <figure>
    <!--
    <img src="generated/images/guide/start/product-details-routed.png" alt="Product details page with updated URL and full details displayed">
    -->
    <img src="generated/images/guide/start/product-details-routed.png" alt="URL이 변경되고 제품 상세정보 페이지가 표시되는 모습">
  </figure>



<div class="alert is-helpful">

<!--
Learn more: See [Routing & Navigation](guide/router "Routing & Navigation") for more information about the Angular router. 
-->
더 알아보기: Angular 라우터에 대해 자세하게 알아보려면 [라우팅 & 네비게이션](guide/router "라우팅 & 네비게이션") 문서를 참고하세요.

</div>


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have integrated routing into your online store.

* Products are linked from the product list page to individual products
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)

To continue exploring Angular, choose either of the following options:
* [Continue to the "Managing Data" section](start/data "Getting Started: Managing Data") to add the shopping cart feature, using a service to manage the cart data and using HTTP to retrieve external data for shipping prices. 
* [Skip ahead to the Deployment section](start/deployment "Getting Started: Deployment") to deploy your app to Firebase or move to local development. 
-->
축하합니다! 이제 온라인 쇼핑몰에 라우팅 기능을 추가했습니다.

* 제품 목록 화면에 있는 제품들은 이제 상세정보를 표시하는 화면과 연결되었습니다.
* 사용자가 제품 목록 화면에서 제품 이름을 클릭하면 새로운 화면으로 전환되면서 제품의 상세정보가 표시됩니다. 이 때 URL도 변경됩니다.

이제 Angular에 대해 더 알아보기 위해 다음 코스 중 하나를 선택해 보세요:
* 서비스를 활용하는 장바구니 기능을 추가하고 HTTP 통신을 통해 제품의 가격정보와 같은 외부 데이터를 받아오는 기능에 대해 알아보려면 ["데이터 다루기"](start/data "Getting Started: Managing Data") 문서를 참고하세요.
* 로컬 개발환경에 대해서 알아보거나 Angular 앱을 Firebase나 리모트 서버에 배포하는 방법에 대해 알아보려면 쭉 건너뛰고 ["개발"](start/deployment "Getting Started: Deployment") 문서를 참고하세요.
