# Try it: Use forms for user input

At the end of [Managing Data](start/start-data "Try it: Managing Data"), the online store application has a product catalog and a shopping cart.

This section walks you through adding a form-based checkout feature to collect user information as part of checkout.

## Forms in Angular

Forms in Angular build upon the standard HTML forms to help you create custom form controls and easy validation experiences. There are two parts to an Angular Reactive form: the objects that live in the component to store and manage the form, and the visualization of the form that lives in the template.

## Define the checkout form model

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

## Create the checkout form

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

## Next steps

Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](start/start-deployment "Try it: Deployment") to move to local development, or deploy your app to Firebase or your own server.
