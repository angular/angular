# Managing data

This guide builds on the second step of the [Getting started with a basic Angular application](start) tutorial, [Adding navigation](start/start-routing "Adding navigation").
At this stage of development, the store application has a product catalog with two views: a product list and product details.
Users can click on a product name from the list to see details in a new view, with a distinct URL, or route.

This step of the tutorial guides you through creating a shopping cart in the following phases:

*   Update the product details view to include a **Buy** button, which adds the current product to a list of products that a cart service manages
*   Add a cart component, which displays the items in the cart
*   Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's `HttpClient` to retrieve shipping data from a `.json` file

<a id="create-cart-service"></a>

## Create the shopping cart service

In Angular, a service is an instance of a class that you can make available to any part of your application using Angular's [dependency injection system](guide/glossary#dependency-injection-di "Dependency injection definition").

Currently, users can view product information, and the application can simulate sharing and  notifications about product changes.

The next step is to build a way for users to add products to a cart.
This section walks you through adding a **Buy** button and setting up a cart service to store information about products in the cart.

<a id="generate-cart-service"></a>

### Define a cart service

This section walks you through creating the `CartService` that tracks products added to shopping cart.

1.  In the terminal generate a new `cart` service by running the following command:

    <code-example format="shell" language="shell">

    ng generate service cart

    </code-example>

1.  Import the `Product` interface from `./products.ts` into the `cart.service.ts` file, and in the `CartService` class, define an `items` property to store the array of the current products in the cart.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="props"></code-example>

1.  Define methods to add items to the cart, return cart items, and clear the cart items.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="methods"></code-example>

    *   The `addToCart()` method appends a product to an array of `items`
    *   The `getItems()` method collects the items users add to the cart and returns each item with its associated quantity
    *   The `clearCart()` method returns an empty array of items, which empties the cart

<a id="product-details-use-cart-service"></a>

### Use the cart service

This section walks you through using the `CartService` to add a product to the cart.

1.  In `product-details.component.ts`, import the cart service.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service"></code-example>

1.  Inject the cart service by adding it to the `constructor()`.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="inject-cart-service"></code-example>

1.  Define the `addToCart()` method, which adds the current product to the cart.

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

    The `addToCart()` method does the following:

    *   Takes the current `product` as an argument
    *   Uses the `CartService` `addToCart()` method to add the product to the cart
    *   Displays a message that you've added a product to the cart

1.  In `product-details.component.html`, add a button with the label **Buy**, and bind the `click()` event to the `addToCart()` method.
    This code updates the product details template with a **Buy** button that adds the current product to the cart.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html"></code-example>

1.  Verify that the new **Buy** button appears as expected by refreshing the application and clicking on a product's name to display its details.

    <div class="lightbox">

    <img alt="Display details for selected product with a Buy button" src="generated/images/guide/start/product-details-buy.png">

    </div>

1.  Click the **Buy** button to add the product to the stored list of items in the cart and display a confirmation message.

    <div class="lightbox">

    <img alt="Display details for selected product with a Buy button" src="generated/images/guide/start/buy-alert.png">

    </div>

## Create the cart view

For customers to see their cart, you can create the cart view in two steps:

1.  Create a cart component and configure routing to the new component.
1.  Display the cart items.

### Set up the cart component

 To create the cart view, follow the same steps you did to create the `ProductDetailsComponent` and configure routing for the new component.

1.  Generate a new component named `cart` in the terminal by running the following command:

    <code-example format="shell" language="shell">

    ng generate component cart

    </code-example>

    This command will generate the `cart.component.ts` file and its associated template and styles files.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1.  Notice that the newly created `CartComponent` is added to the module's `declarations` in `app.module.ts`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="declare-cart"></code-example>

1.  Still in `app.module.ts`, add a route for the component `CartComponent`, with a `path` of `cart`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route"></code-example>

1.  Update the **Checkout** button so that it routes to the `/cart` URL.
    In `top-bar.component.html`, add a `routerLink` directive pointing to `/cart`.

    <code-example header="src/app/top-bar/top-bar.component.html" path="getting-started/src/app/top-bar/top-bar.component.html" region="cart-route"></code-example>

1.  Verify the new `CartComponent` works as expected by clicking the **Checkout** button.
    You can see the "cart works!" default text, and the URL has the pattern `https://getting-started.stackblitz.io/cart`, where `getting-started.stackblitz.io` may be different for your StackBlitz project.

    <div class="lightbox">
    
    <img alt="Display cart view before customizing" src="generated/images/guide/start/cart-works.png">
    
    </div>

### Display the cart items

This section shows you how to use the cart service to display the products in the cart.

1.  In `cart.component.ts`, import the `CartService` from the `cart.service.ts` file.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports"></code-example>

1.  Inject the `CartService` so that the `CartComponent` can use it by adding it to the `constructor()`.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="inject-cart"></code-example>

1.  Define the `items` property to store the products in the cart.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="items"></code-example>

    This code sets the items using the `CartService` `getItems()` method.
    You defined this method [when you created `cart.service.ts`](#generate-cart-service).

1.  Update the cart template with a header, and use a `<div>` with an `*ngFor` to display each of the cart items with its name and price.
    The resulting `CartComponent` template is as follows.

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices"></code-example>

1.  Verify that your cart works as expected:

    1.  Click **My Store**.
    1.  Click on a product name to display its details.
    1.  Click **Buy** to add the product to the cart.
    1.  Click **Checkout** to see the cart.

    <div class="lightbox">

    <img alt="Cart view with products added" src="generated/images/guide/start/cart-page-full.png">

    </div>

For more information about services, see [Introduction to Services and Dependency Injection](guide/architecture-services "Concepts > Intro to Services and DI").

## Retrieve shipping prices

Servers often return data in the form of a stream.
Streams are useful because they make it easy to transform the returned data and make modifications to the way you request that data.
Angular `HttpClient` is a built-in way to fetch data from external APIs and provide them to your application as a stream.

This section shows you how to use `HttpClient` to retrieve shipping prices from an external file.

The application that StackBlitz generates for this guide comes with predefined shipping data in `assets/shipping.json`.
Use this data to add shipping prices for items in the cart.

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json"></code-example>

### Configure `AppModule` to use `HttpClient`

To use Angular's `HttpClient`, you must configure your application to use `HttpClientModule`.

Angular's `HttpClientModule` registers the providers your application needs to use the `HttpClient` service throughout your application.

1.  In `app.module.ts`, import `HttpClientModule` from the `@angular/common/http` package at the top of the file with the other imports.
    As there are a number of other imports, this code snippet omits them for brevity.
    Be sure to leave the existing imports in place.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import"></code-example>

1.  To register Angular's `HttpClient` providers globally, add `HttpClientModule` to the `AppModule` `@NgModule()` `imports` array.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module"></code-example>

### Configure `CartService` to use `HttpClient`

The next step is to inject the `HttpClient` service into your service so your application can fetch data and interact with external APIs and resources.

1.  In `cart.service.ts`, import `HttpClient` from the `@angular/common/http` package.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http"></code-example>

1.  Inject `HttpClient` into the `CartService` `constructor()`.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="inject-http"></code-example>

### Configure `CartService` to get shipping prices

To get shipping data, from `shipping.json`, You can use the `HttpClient` `get()` method.

1.  In `cart.service.ts`, below the `clearCart()` method, define a new `getShippingPrices()` method that uses the `HttpClient` `get()` method.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>

For more information about Angular's `HttpClient`, see the [Client-Server Interaction](guide/http "Server interaction through HTTP") guide.

## Create a shipping component

Now that you've configured your application to retrieve shipping data, you can create a place to render that data.

1.  Generate a cart component named `shipping` in the terminal by running the following command:

    <code-example format="shell" language="shell">

    ng generate component shipping

    </code-example>

    This command will generate the `shipping.component.ts` file and it associated template and styles files.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.1.ts"></code-example>

1.  In `app.module.ts`, add a route for shipping.
    Specify a `path` of `shipping` and a component of `ShippingComponent`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>

    There's no link to the new shipping component yet, but you can see its template in the preview pane by entering the URL its route specifies.
    The URL has the pattern: `https://angular-ynqttp--4200.local.webcontainer.io/shipping` where the `angular-ynqttp--4200.local.webcontainer.io` part may be different for your StackBlitz project.

### Configuring the `ShippingComponent` to use `CartService`

This section guides you through modifying the `ShippingComponent` to retrieve shipping data via HTTP from the `shipping.json` file.

1.  In `shipping.component.ts`, import `CartService`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

1.  Inject the cart service in the `ShippingComponent` `constructor()`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

1. Define a `shippingCosts` property that sets the `shippingCosts` property using the `getShippingPrices()` method from the `CartService`.
   Initialize the `shippingCosts` property inside `ngOnInit()` method.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="props"></code-example>

1.  Update the `ShippingComponent` template to display the shipping types and prices using the `async` pipe.

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

    The `async` pipe returns the latest value from a stream of data and continues to do so for the life of a given component.
    When Angular destroys that component, the `async` pipe automatically stops.
    For detailed information about the `async` pipe, see the [AsyncPipe API documentation](api/common/AsyncPipe).

1.  Add a link from the `CartComponent` view to the `ShippingComponent` view.

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

1.  Click the **Checkout** button to see the updated cart.
    Remember that changing the application causes the preview to refresh, which empties the cart.

    <div class="lightbox">

    <img alt="Cart with link to shipping prices" src="generated/images/guide/start/cart-empty-with-shipping-prices.png">

    </div>

    Click on the link to navigate to the shipping prices.

    <div class="lightbox">

    <img alt="Display shipping prices" src="generated/images/guide/start/shipping-prices.png">

    </div>

## What's next

You now have a store application with a product catalog, a shopping cart, and you can look up shipping prices.

To continue exploring Angular:

*   Continue to [Forms for User Input](start/start-forms "Forms for User Input") to finish the application by adding the shopping cart view and a checkout form
*   Skip ahead to [Deployment](start/start-deployment "Deployment") to move to local development, or deploy your application to Firebase or your own server

@reviewed 2022-02-28
