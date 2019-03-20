# Forms

At the end of [Managing Data](getting-started/data "Getting Started: Managing Data"), the online store application has a product catalog and a shopping cart.

In this section, you'll finish the app by adding a form-based checkout feature. You'll create a form to collect user information as part of checkout. 

## Forms in Angular

Forms in Angular take the standard capabilities of the HTML based forms and add an orchestration layer to help with creating custom form controls, and to supply great validation experiences. There are two parts to an Angular Reactive form, the objects that live in the component to store and manage the form, and the visualization of the form that lives in the template.

## Define the checkout form model

First, you'll set up the checkout form model. The form model is the source of truth for the status of the form and is defined in the component class. 

1. Open `cart.component.ts`.

1. Angular's `FormBuilder` service provides convenient methods for generating controls. As with the other services you've used, you need to import and inject the service before you can use it: 

    1. Import the `FormBuilder` service from the `@angular/forms` package.

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
      </code-example>

      The `FormBuilder` service is provided by the `ReactiveFormsModule`, which is already defined in the `AppModule` you modified previously (in `app.module.ts`).

    1. Inject the `FormBuilder` service. 

        ```
        export class CartComponent {
          items;

          constructor(
            private cartService: CartService,
            private formBuilder: FormBuilder,
          ) { }
        }
        ```

        <!-- 
        To do: Replace with docregion  
        -->

1. In the `CartComponent` class, define the `checkoutForm` property to store the form model.

    ```
    export class CartComponent {
      items;
      checkoutForm;
    }
    ```
    <!-- 
      To do: Replace with docregion  
    -->

1. During checkout, the app will prompt the user for a name and address. So that you can gather that information later, set the `checkoutForm` property with a form model containing `name` and `address` fields, using the `FormBuilder#group()` method.

    ```
    export class CartComponent {
      items;
      checkoutForm;

      constructor(
        private formBuilder: FormBuilder,
        private cartService: CartService
      ) {
        this.items = this.cartService.getItems();

        this.checkoutForm = this.formBuilder.group({
          name: '',
          address: ''
        });
      }
    ```
    <!-- 
      To do: Replace with docregion  
    --->

    <!-- 
    The resulting `CartComponent` class should look like this: 

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="props-services">
    </code-example>
    -->

1. For the checkout process, users need to be able to submit the form data (their name and address). When the order is submitted, the form should reset and the cart should clear. 

    In `cart.component.ts`, define an `onSubmit()` method to process the form. Use the `CartService#clearCart()` method to empty the cart items and reset the form after it is submitted. (In a real-world app, this method also would submit the data to an external server.) 

    The entire cart component is shown below: 

      <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts">
      </code-example>

The form model is defined in the component class. To reflect the model in the view, you'll need a checkout form.

## Create the checkout form

Next, you'll add a checkout form at the bottom of the "Cart" page. 

1. Open `cart.component.html`.

1. At the bottom of the template, add an empty HTML form to capture user information. 

1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template. Also include a "Purchase" button to submit the form. 

  ```
  <form [formGroup]="checkoutForm">

    <button class="button" type="submit">Purchase</button>  

  </form>
  ```
  
    <!-- 
      Note: The preview might contain an error message, which will be resolved by the following steps. 
      To do: Replace with docregion
      If you define the name and address fields here, it generates and error in the preview. 
      I had to add the formGroup property before the message would resolve. 
    -->

<!--
1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template.

    ```    
    <form [formGroup]="checkoutForm">
    ...
    </form>
    ```

    To do: Replace with docregion
-->

1. On the `form` tag, use an `ngSubmit` event binding to listen for the form submission and call the `onSubmit()` method with the `checkoutForm` value.

    ```    
    <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit(checkoutForm.value)">
    ...
    </form>
    ```

    <!-- 
      To do: Replace with docregion
    -->

1. Add input fields for `name` and `address`.  Use the `formControlName` attribute binding to bind the `checkoutForm` form controls for `name` and `address` to their input fields. The final complete component is shown below: 

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-2">
    </code-example>

After putting a few items in the cart, users can now review their items, enter name and address, and submit their purchase: 

<figure>
  <img src='generated/images/guide/getting-started/cart-with-items-and-form.png' alt="Cart page with checkout form">
</figure>


## Next steps

Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](getting-started/deployment "Getting Started: Deployment") to deploy your app to Firebase or move to local development. 

