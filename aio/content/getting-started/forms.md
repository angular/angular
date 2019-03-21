# Forms

Welcome to lesson 3 of Angular Getting Started. 

At the end of [Lesson 2: Routing and Managing Data](getting-started), you had an online store application with a product catalog and shopping cart.

<div class="alert is-helpful">

[Return to the previous Getting Started lesson: Routing and Managing Data.](getting-started/data)

</div>

In this lesson, you'll finish the app by adding the shopping cart page and a form-based checkout feature. You'll create a form to collect user information as part of checkout. 

## Create cart page

1. Generate the cart component. 

1. Add a route in the `AppModule` for the cart, with a `path` of `cart` and `CartComponent` for the `component`.

<code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts">
</code-example>

## List cart items 

Import

1. Import the `FormBuilder` service from the `@angular/forms` package.
1. Import the `DataService` from the `data.service.ts` file.

<code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="imports">
</code-example>

Properties and Inject Services

1. Define `checkoutForm` and `items` properties in the cart component class to store the form model and cart items.
1. Inject the `FormBuilder`, and `DataService` services to build form models and access cart information.
1. Use the `FormBuilder#group()` method to set the `checkoutForm` property with a form model containing `name` and `address` fields.
1. Set the `items` property using the `DataService#getCartItems()` that returns the items in the cart.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="props-services">
        </code-example>

1. Add a `submit` method to process the form data and clear the cart. In a real-world app, you would submit this data to an external server.
1. Use the `DataService#clearCart()` method to empty the cart items and reset the form after it is submitted.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.ts" region="submit">
        </code-example>

Update Template to display cart items

1. Update the template with a header and use a div with an `*ngFor` to display the cart items and totals.

        <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="cart-items">
        </code-example>

## Create checkout form

1. Add an HTML form to your template to capture user information.
1. Use a `formGroup` property binding to bind the `checkoutForm` to the `form` tag in the template.
1. Use an `ngSubmit` event binding on the `form` tag to listen for form submission and call the `submit` method with the `checkoutForm` value.

        <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-1">
        </code-example>

1. Define input fields inside the `form` element for `name` and `address`.
1. Use the `formControlName` attribute binding to bind the `checkoutForm` fields for `name` and `address` to their input fields.
1. Add a `submit` button that says `Purchase` to trigger form submission.

<code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.html" region="checkout-form-2">
</code-example>

## Next steps

Congratulations! You have a complete online store application with a product catalog, a shopping cart, and a checkout function.  

* The app displays a top bar and a product list
* Product data is retrieved from an external `json` file by a dedicated data service using the HttpClient
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)
* Users can click on the `Buy` button to add a product to the shopping cart
* Users can check out to purchase the items in their shopping cart, entering their name and address through a form


To continue exploring Angular, we recommend any of the following options:
* Do the next add-on Getting Started lesson: Deployment to deploy your app to Firebase or move to local development. 
* Read more about the Angular app [architecture](guide/architecture).


[Continue to the next Getting Started lesson: Deployment.](getting-started/deployment)
