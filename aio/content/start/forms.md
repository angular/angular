<!--
# Forms
-->
# 폼(Forms)

<!--
At the end of [Managing Data](start/data "Getting Started: Managing Data"), the online store application has a product catalog and a shopping cart.

In this section, you'll finish the app by adding a form-based checkout feature. You'll create a form to collect user information as part of checkout. 
-->
[데이터 다루기](start/data "시작하기: 데이터 다루기")를 끝낸 시점에 온라인 쇼핑몰 앱에는 제품 목록 화면과 장바구니 화면이 존재합니다.

이번에는 폼으로 주문 기능을 추가해서 앱을 완성해 봅시다. 폼은 사용자의 정보를 입력받을 때 사용합니다.

<!--
## Forms in Angular
-->
## Angular가 제공하는 폼

<!--
Forms in Angular take the standard capabilities of the HTML based forms and add an orchestration layer to help with creating custom form controls, and to supply great validation experiences. There are two parts to an Angular Reactive form, the objects that live in the component to store and manage the form, and the visualization of the form that lives in the template.
-->
Angular 폼은 HTML이 제공하는 폼을 바탕으로 커스텀 폼 컨트롤을 정의하거나 Angular가 제공하는 유효성 검사 메커니즘을 활용합니다. Angular가 제공하는 폼 기능은 컴포넌트에 존재하는 객체를 기반으로 데이터를 처리하는 반응형 폼(Reactive form)과 템플릿만으로 처리하는 템플릿 기반 폼으로 구분할 수 있습니다.

<!--
## Define the checkout form model
-->
## 폼 모델 정의하기

<!--
First, you'll set up the checkout form model. The form model is the source of truth for the status of the form and is defined in the component class. 

1. Open `cart.component.ts`.

1. Angular's `FormBuilder` service provides convenient methods for generating controls. As with the other services you've used, you need to import and inject the service before you can use it: 

    1. Import the `FormBuilder` service from the `@angular/forms` package.
-->
가장 먼저, 주문 정보를 저장할 폼 모델을 정의해야 합니다. 컴포넌트 클래스에 정의하는 폼 모델은 폼의 상태와 데이터를 저장하는 원천 데이터 역할을 합니다.

1. `cart.component.ts` 파일을 엽니다.

1. 폼 컨트롤은 Angular가 제공하는 `FormBuilder` 서비스를 사용하면 간단하게 만들 수 있습니다. 지금까지 사용했던 다른 서비스와 마찬가지로, `FormBuilder`를 사용하려면 이 서비스를 컴포넌트에 의존성으로 주입해야 합니다: 

    1. `@angular/forms` 패키지에서 `FormBuilder` 서비스를 로드합니다.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
      </code-example>

      <!--
      The `FormBuilder` service is provided by the `ReactiveFormsModule`, which is already defined in the `AppModule` you modified previously (in `app.module.ts`).

    1. Inject the `FormBuilder` service. 
  -->
      `FormBuilder`는 `ReactiveFormsModule`이 제공하는 서비스입니다. 이 모듈은 `app.module.ts` 파일에서 정의하는 `AppModule`에 이미 추가되어 있습니다.

    1. `FormBuilder` 서비스를 의존성으로 주입합니다.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="inject-form-builder">
      </code-example>

<!--
1. In the `CartComponent` class, define the `checkoutForm` property to store the form model.
-->
3. 폼 모델을 할당할 `checkoutForm` 프로퍼티를 `CartComponent` 클래스에  선언합니다.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form">
    </code-example>

<!--
1. During checkout, the app will prompt the user for a name and address. So that you can gather that information later, set the `checkoutForm` property with a form model containing `name` and `address` fields, using the `FormBuilder#group()` method.
-->
4. 제품을 주문하려면 사용자가 이름과 주소를 입력해야 합니다. 그래서 이 정보를 저장하기 위해 `name`과 `address` 필드를 `checkoutForm` 프로퍼티에 할당되는 폼 모델에 선언해야 합니다. `FormBuilder#group()` 메소드를 다음과 같이 사용하면 됩니다:

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form-group" linenums="false">
    </code-example>

<!--
1. For the checkout process, users need to be able to submit the form data (their name and address). When the order is submitted, the form should reset and the cart should clear. 

    In `cart.component.ts`, define an `onSubmit()` method to process the form. Use the `CartService#clearCart()` method to empty the cart items and reset the form after it is submitted. (In a real-world app, this method also would submit the data to an external server.) 

    The entire cart component is shown below: 
-->
5. 사용자는 이름과 주소를 폼에 입력해야 주문을 진행할 수 있습니다. 그리고 주문을 하고 나면 이 폼을 초기화하고 장바구니를 비우도록 구현해 봅시다.

    `cart.component.ts` 파일에 `onSubmit()` 메소드를 정의합니다. 그리고 폼을 제출하고 나면 `CartService#clearCart()` 메소드를 실행해서 장바구니를 비우도록 구현합시다. (실제 운영하는 앱에서는 이 때 폼 데이터를 외부 서버에 보낼 것입니다.)

    여기까지 구현하면 장바구니 컴포넌트 코드는 다음과 같은 모양이 될 것입니다:

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts">
    </code-example>

<!--
The form model is defined in the component class. To reflect the model in the view, you'll need a checkout form.
-->
폼 모델은 컴포넌트 클래스에 정의되어 있습니다. 이 폼 모델을 화면과 연결하려면 템플릿에 주문 폼을 구성해야 합니다.

<!--
## Create the checkout form
-->
## 주문 폼 구성하기

<!--
Next, you'll add a checkout form at the bottom of the "Cart" page. 

1. Open `cart.component.html`.

1. At the bottom of the template, add an empty HTML form to capture user information. 

1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template. Also include a "Purchase" button to submit the form. 
-->
다음에는 "장바구니" 페이지 맨 아래에 주문 폼을 추가해 봅시다.

1. `cart.component.html` 파일을 엽니다.

1. 템플릿 제일 아래에 HTML 폼을 추가합니다.

1. `checkoutForm` 프로퍼티와 `form` 태그는 `formGroup` 프로퍼티로 바인딩하면 됩니다. 그리고 폼을 제출하기 위해 "Purchase" 버튼도 추가합니다.

  <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.3.html" region="checkout-form">
  </code-example>

<!--
1. On the `form` tag, use an `ngSubmit` event binding to listen for the form submission and call the `onSubmit()` method with the `checkoutForm` value.
-->
4. `form` 태그에 `ngSubmit` 이벤트를 바인딩하면 폼을 제출하는 동작을 감지할 수 있습니다. `ngSubmit` 이벤트가 발생하면 `checkoutForm` 안에 있는 값을 인자로 사용해서 `onSubmit()` 메소드를 실행하도록 다음과 같이 작성합니다:

  <code-example path="getting-started/src/app/cart/cart.component.html" region="checkout-form-1">
  </code-example>

<!--
1. Add input fields for `name` and `address`.  Use the `formControlName` attribute binding to bind the `checkoutForm` form controls for `name` and `address` to their input fields. The final complete component is shown below: 
-->
5. `name`과 `address` 입력 필드를 추가합니다. `formControlName` 어트리뷰트를 사용하면 `checkoutForm` 폼 컨트롤에 있는 `name`과 `address` 필드를 각각 바인딩할 수 있습니다. 여기까지 진행하면 컴포넌트 템플릿을 다음과 같이 작성할 수 있습니다:

  <code-example path="getting-started/src/app/cart/cart.component.html" region="checkout-form-2">
  </code-example>

<!--
After putting a few items in the cart, users can now review their items, enter name and address, and submit their purchase: 
-->
이제 장바구니에 제품을 몇개 추가하고 난 후에 사용자가 이름과 주소를 입력해서 주문을 요청할 수 있는 화면이 구성되었습니다:

<figure>
  <!--
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="Cart page with checkout form">
  -->
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="주문 폼이 추가된 장바구니 페이지">
</figure>


<!--
## Next steps
-->
## 다음 단계

<!--
Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.
-->
축하합니다! 이제 제품 목록, 장바구니, 주문 기능이 모두 추가된 온라인 쇼핑몰 앱을 완성했습니다.

이제 로컬 개발환경을 구성하거나 Angular 앱을 Firebase나 리모트 서버에 배포하는 방법에 대해 알아보기 위해 ["개발"](start/deployment "시작하기: 배포") 문서를 확인해 보세요.
