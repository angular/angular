<!--
# Using forms for user input
-->
# 폼으로 입력 받기

<!--
At the end of [Managing Data](start/start-data "Try it: Managing Data"), the online store application has a product catalog and a shopping cart.

This section walks you through adding a form-based checkout feature to collect user information as part of checkout.
-->
[데이터 다루기](start/start-data "Try it: Managing Data") 단계를 끝내고 나면 온라인 샵 애플리케이션에 상품 목록 화면과 장바구니 화면이 존재합니다.

이번 섹션에서는 폼으로 주문 기능을 만들어서 주문에 필요한 사용자 정보를 입력받아 봅시다.


<!--
## Forms in Angular
-->
## Angular가 제공하는 폼

<!--
Forms in Angular build upon the standard HTML forms to help you create custom form controls and easy validation experiences. There are two parts to an Angular Reactive form: the objects that live in the component to store and manage the form, and the visualization of the form that lives in the template.
-->
Angular가 제공하는 폼 기능은 표준 HTML 폼을 기반으로 동작하며 폼 유효성 검사를 편하게 실행할 수 있도록 커스텀 폼 컨트롤을 제공합니다.
Angular가 제공하는 반응형 폼은 두 부분으로 구분할 수 있습니다.
하나는 컴포넌트 코드에서 폼을 구성하고 관리하는 코드이며, 다른 하나는 이 폼을 화면에 표시하는 템플릿 부분입니다.


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
제일 먼저 폼 모델을 구성해 봅시다.
폼 모델은 폼 데이터가 저장되고 폼의 상태를 표현하는 원천 소스이며 컴포넌트 클래스에 정의합니다.

1. `cart.component.ts` 파일을 엽니다.

1. 폼 컨트롤을 생성할 때 Angular `FormBuilder` 서비스를 사용하면 편합니다. 이 서비스를 사용하려면 다른 서비스와 마찬가지로 서비스 심볼을 로드하고 원하는 곳에 의존성으로 주입하면 됩니다:

    1. `@angular/forms` 패키지에서 `FormBuilder` 심볼을 로드합니다:

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
      </code-example>

      `FormBuilder` 서비스는 `ReactiveFormsModule`이 제공하는 기능입니다. 이 모듈은 `AppModule` (`app.module.ts` 파일)에 등록해야 제대로 동작하며, 애플리케이션을 생성하면 기본으로 등록되어 있습니다.

    1. `FormBuilder` 서비스를 컴포넌트에 의존성으로 주입합니다:

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="inject-form-builder">
      </code-example>

1. `CartComponent` 클래스에 `checkoutForm` 프로퍼티를 선언합니다. 이 프로퍼티에는 폼 모델이 할당됩니다:

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form">
    </code-example>

1. 사용자의 이름과 주소를 저장하기 위해 `checkoutForm` 프로퍼티에 `name` 필드와 `address` 필드가 존재하는 폼 모델을 할당합니다. 이 폼 모델은 `FormBuilder` `group()` 메소드에 객체를 전달하면 생성할 수 있습니다.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form-group"></code-example>

1. 사용자가 주문을 진행하려면 이름과 주소를 입력해야 합니다. 이 내용을 입력하고 폼을 제출하면 폼을 초기화하고 장바구니도 비워봅시다.

    1. `cart.component.ts` 파일에 `onSubmit()` 메소드를 정의합니다. 이 메소드는 `CartService` `clearCart()` 메소드를 사용해서 장바구니를 비우고 폼도 초기화합니다. 실제로 동작하는 앱에서는 외부 서버로 데이터를 전달하는 로직도 이 메소드에 구현합니다. 여기까지 작성하고 나면 장바구니 컴포넌트는 다음과 같이 구성됩니다:

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts">
    </code-example>

이제 컴포넌트 클래스에 폼 모델이 추가되었습니다.
이 폼 모델을 화면에 연결해 봅시다.


<!--
## Create the checkout form
-->
## 주문 폼 구성하기

<!--
Use the following steps to add a checkout form at the bottom of the "Cart" view.

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
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="Cart view with checkout form">
</div>

To confirm submission, open the console where you should see an object containing the name and address you submitted.
-->
장바구니 화면에 주문 폼을 구성하려면 다음과 같이 진행하면 됩니다.

1. `cart.component.html` 파일을 엽니다.

1. 템플릿 제일 아래쪽에 사용자 입력을 받을 수 있는 HTML 폼을 추가합니다.

1. 템플릿 `<form>` 엘리먼트의 `formGroup` 프로퍼티에 `checkoutForm`을 바인딩합니다. 그리고 폼을 제출하는 "Purchase" 버튼을 추가합니다.

  <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.3.html" region="checkout-form">
  </code-example>

1. `<form>` 엘리먼트에서 폼을 제출할 때 발생하는 `ngSubmit` 이벤트를 `onSubmit()` 메소드와 바인딩합니다.이 때 `checkoutForm` 값도 함께 전달합니다.

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html (cart component template detail)" region="checkout-form-1">
  </code-example>

1. `name`과 `address`에 해당하는 입력 필드를 추가합니다. 그리고 입력 필드에 `formControlName` 어트리뷰트를 바인딩하면 `checkoutForm`에 있는 해당 필드와 연결할 수 있습니다. 여기까지 구현하고 나면 컴포넌트 코드가 다음과 같이 구성됩니다:

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html" region="checkout-form-2">
  </code-example>

이제는 사용자가 장바구니에 상품을 담은 후에 이름과 주소를 입력하면 상품을 주문할 수 있습니다:

<div class="lightbox">
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="Cart view with checkout form">
</div>

제출이 제대로 되는지 확인하려면 개발자도구를 열고 콘솔에 출력된 내용을 확인하면 됩니다.


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](start/start-deployment "Try it: Deployment") to move to local development, or deploy your app to Firebase or your own server.
-->
축하합니다!
이제 온라인 샵 애플리케이션에는 제품 목록 화면, 장바구니 화면, 주문 기능이 구현되었습니다.

* 로컬 환경에서 개발하던 앱을 Firebase에 배포하려면 [배포 문서](start/start-deployment "Try it: Deployment")를 참고하세요.