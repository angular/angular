# Using forms for user input

This guide builds on the [Managing Data](start/start-data "Try it: Managing Data") step of the Getting Started tutorial, [Get started with a basic Angular app](start "Get started with a basic Angular app").

This section walks you through adding a form-based checkout feature to collect user information as part of checkout.

## Define the checkout form model

This step shows you how to set up the checkout form model in the component class.
The form model determines the status of the form.

1. Open `cart.component.ts`.

1. Import the `FormBuilder` service from the `@angular/forms` package.
  This service provides convenient methods for generating controls.

  <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
  </code-example>

1. Inject the `FormBuilder` service in the `CartComponent` `constructor()`.
  This service is part of the `ReactiveFormsModule` module, which you've already imported.

  <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="inject-form-builder">
  </code-example>

1. To gather the user's name and address, use the `FormBuilder` `group()` method to set the `checkoutForm` property to a form model containing `name` and `address` fields.

  <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="checkout-form-group"></code-example>

1. Define an `onSubmit()` method to process the form.
  This method allows users to submit their name and address.
  In addition, this method uses the `clearCart()` method of the `CartService` to reset the form and clear the cart.

  The entire cart component class is as follows:

  <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts">
  </code-example>

## Create the checkout form

Use the following steps to add a checkout form at the bottom of the Cart view.

1. At the bottom of `cart.component.html`, add an HTML `<form>` element and a **Purchase** button.

1. Use a `formGroup` property binding to bind `checkoutForm` to the HTML `<form>`.

  <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.3.html" region="checkout-form">
  </code-example>

1. On the `form` tag, use an `ngSubmit` event binding to listen for the form submission and call the `onSubmit()` method with the `checkoutForm` value.

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html (cart component template detail)" region="checkout-form-1">
  </code-example>

1. Add `<input>` fields for `name` and `address`, each with a `formControlName` attribute that binds to the `checkoutForm` form controls for `name` and `address` to their `<input>` fields.
  The complete component is as follows:

  <code-example path="getting-started/src/app/cart/cart.component.html" header="src/app/cart/cart.component.html" region="checkout-form-2">
  </code-example>

After putting a few items in the cart, users can review their items, enter their name and address, and submit their purchase.

<div class="lightbox">
  <img src='generated/images/guide/start/cart-with-items-and-form.png' alt="Cart view with checkout form">
</div>

To confirm submission, open the console to see an object containing the name and address you submitted.

## What's next

You have a complete online store application with a product catalog, a shopping cart, and a checkout function.

[Continue to the "Deployment" section](start/start-deployment "Try it: Deployment") to move to local development, or deploy your app to Firebase or your own server.
