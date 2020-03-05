<!--
# Getting Started with Angular: Forms
-->
# Angular 시작하기: 폼(Form)

<!--
At the end of [Managing Data](start/start-data "Getting Started: Managing Data"), the online store application has a product catalog and a shopping cart.

This section walks you through adding a form-based checkout feature to collect user information as part of checkout.
-->
[데이터 다루기](start/start-data "Getting Started: Managing Data") 과정까지 끝내고 나면 온라인 쇼핑몰 앱에는 상품 목록을 볼 수 있는 기능과 장바구니 기능이 존재합니다.

이번에는 사용자가 입력한 내용을 폼 형식으로 입력받는 주문 기능을 추가해 봅시다.

<!--
## Forms in Angular
-->
## Angular의 폼

<!--
Forms in Angular build upon the standard HTML forms to help you create custom form controls and easy validation experiences. There are two parts to an Angular Reactive form: the objects that live in the component to store and manage the form, and the visualization of the form that lives in the template.
-->
Angular의 폼은 표준 HTML 폼을 기반으로 커스텀 폼 컨트롤을 만들거나 유효성 검사를 더 편하게 할 수 있도록 확장한 것입니다. Angular가 제공하는 반응형 폼(Reactive Form)은 두 요소로 구성되는데, 컴포넌트 클래스에서는 폼을 관리하고 데이터를 보관하며, 템플릿에서는 폼 데이터를 화면에 표시합니다.


<!--
## Define the checkout form model
-->
## 주문 폼 모델 정의하기

<!--
First, set up the checkout form model. Defined in the component class, the form model is the source of truth for the status of the form.

1. Open `cart.component.ts`.

1. Angular's `FormBuilder` service provides convenient methods for generating controls. As with the other services you've used, you need to import and inject the service before you can use it:

    1. Import the `FormBuilder` service from the `@angular/forms` package.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
      </code-example>

      The `ReactiveFormsModule` provides the `FormBuilder` service, which `AppModule` (in `app.module.ts`) already imports.

    1. Inject the `FormBuilder` service.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="inject-form-builder">
      </code-example>

1. Still in the `CartComponent` class, define the `checkoutForm` property to store the form model.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form">
    </code-example>

1. To gather the user's name and address, set the `checkoutForm` property with a form model containing `name` and `address` fields, using the `FormBuilder` `group()` method. Add this between the curly braces, `{}`,
of the constructor.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form-group"></code-example>

1. For the checkout process, users need to submit their name and address. When they submit their order, the form should reset and the cart should clear.

    1. In `cart.component.ts`, define an `onSubmit()` method to process the form. Use the `CartService` `clearCart()` method to empty the cart items and reset the form after its submission. In a real-world app, this method would also submit the data to an external server. The entire cart component class is as follows:

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts">
    </code-example>

Now that you've defined the form model in the component class, you need a checkout form to reflect the model in the view.
-->
먼저, 주문 폼 모델을 정의해 봅시다. 폼 모델은 폼의 상태를 담고 있는 원천 소스이며 컴포넌트 클래스에 정의합니다.

1. `cart.component.ts` 파일을 엽니다.

1. Angular가 제공하는 `FormBuilder`를 활용하면 폼 컨트롤을 편하게 생성할 수 있습니다. 다른 서비스와 마찬가지로 이 서비스도 사용하려면 의존성으로 주입해야 합니다:

    1. `@angular/forms` 패키지에서 `FormBuilder` 서비스를 로드합니다.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
      </code-example>

      `FormBuilder` 서비스를 사용하려면 `AppModule`(`app.module.ts`)에 `ReactiveFormsModule`를 등록해야 합니다.

    1. `FormBuilder` 서비스를 의존성으로 주입합니다.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="inject-form-builder">
      </code-example>

1. 폼 모델을 저장하는 `checkoutForm` 프로퍼티를 `CartComponent` 클래스에 선언합니다.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form">
    </code-example>

1. 주문자의 이름과 주소를 입력받기 위해 `checkoutForm` 프로퍼티에는 `name` 필드와 `address` 필드가 필요합니다. `FormBuilder`의 `group()` 메소드를 사용해서 이 필드를 정의합니다.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form-group"></code-example>

1. 주문을 진행하려면 주문자가 이름과 주소를 제출해야 합니다.그리고 폼을 제출하고 나면 폼은 초기화되고 장바구니도 비워져야 합니다.

    1. 폼을 제출하기 위해 `cart.component.ts` 파일에 `onSubmit()` 메소드를 정의합니다. 이 메소드는 `CartService`의 `clartCart()` 메소드를 사용해서 장바구니를 비우며, 폼 제출이 완료된 후에는 폼을 초기화 합니다. 현업에서는 이런 메소드에서 외부 서버로 데이터를 제출합니다. 여기까지 작성하고 나면 장바구니 컴포넌트 클래스가 이렇게 작성됩니다:

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts">
    </code-example>

지금까지 컴포넌트 클래스에 폼 모델을 정의했고, 이 모델을 화면에 반영해 봅시다.


<!--
## Create the checkout form
-->
## 주문 화면 만들기

<!--
Use the following steps to add a checkout form at the bottom of the "Cart" page.

1. Open `cart.component.html`.

1. At the bottom of the template, add an HTML form to capture user information.

1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template. Also include a "Purchase" button to submit the form.

  <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.3.html" region="checkout-form">
  </code-example>

1. On the `form` tag, use an `ngSubmit` event binding to listen for the form submission and call the `onSubmit()` method with the `checkoutForm` value.

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html (cart component template detail)" region="checkout-form-1">
  </code-example>

1. Add input fields for `name` and `address`.  Use the `formControlName` attribute binding to bind the `checkoutForm` form controls for `name` and `address` to their input fields. The final complete component is as follows:

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html" region="checkout-form-2">
  </code-example>

After putting a few items in the cart, users can now review their items, enter their name and address, and submit their purchase:

<div class="lightbox">
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="Cart page with checkout form">
</div>

To confirm submission, open the console where you should see an object containing the name and address you submitted.
-->
장바구니 화면 아래쪽에 다음과 같은 순서로 주문 화면을 구성해 봅시다.

1. `cart.component.html` 파일을 엽니다.

1. 템플릿 제일 아래쪽에 사용자의 입력을 받을 HTML 폼을 추가합니다.

1. `<form>` 엘리먼트의 `formGroup` 프로퍼티를 `checkoutForm` 클래스 프로퍼티와 바인딩합니다. 그리고 폼 제출용으로 사용할 "Purchase" 버튼을 추가합니다.

  <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.3.html" region="checkout-form">
  </code-example>

1. `<form>` 엘리먼트에서 발생하는 `ngSubmit` 이벤트를 `onSubmit()` 메소드와 바인딩합니다. 이 때 `checkoutForm`의 값을 함께 전달합니다.

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html (장바구니 컴포넌트 템플릿)" region="checkout-form-1">
  </code-example>

1. `name` 필드와 `address` 필드에 연결되는 입력 필드를 추가합니다. 이 입력 필드의 `formControlName` 어트리뷰트를 바인딩하면 `checkoutForm` 폼 컨트롤의 `name` 필드와 `address` 필드를 연결할 수 있습니다. 그러면 컴포넌트 코드가 다음과 같이 작성될 것입니다:

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html" region="checkout-form-2">
  </code-example>

이제 사용자가 장바구니에 상품을 넣고 나면 장바구니에 어떤 상품이 담겼는지 확인할 수 있고, 주문자의 이름과 주소를 입력하고 폼을 제출할 수 있습니다:

<div class="lightbox">
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="Cart page with checkout form">
</div>

주문 폼이 제대로 제출되었는지 확인하려면 브라우저 콘솔을 열고 사용자가 입력한 이름과 주소가 제대로 출력되는지 확인하면 됩니다.


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](start/start-deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.
-->
축하합니다! 이제 온라인 쇼핑몰 애플리케이션에는 상품 목록을 볼 수 있는 기능과 장바구니 기능, 주문 기능이 추가되었습니다.

* 앱을 Firebase에 배포하거나 로컬 개발환경을 설정하는 방법에 대해 알아보려면 [배포](start/start-deployment "Getting Started: Deployment") 문서를 참고하세요.