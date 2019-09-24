# Managing Data

At the end of [Routing](start/routing "Getting Started: Routing"), the online store application has a product catalog with two views: a product list and product details.
Users can click on a product name from the list to see details in a new view, with a distinct URL, or route.

This page guides you through creating the shopping cart in three phases:

* Update the product details page to include a "Buy" button, which adds the current product to a list of products that a cart service manages.
* Add a cart component, which displays the items in the cart.
* Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's `HttpClient` to retrieve shipping data from a `.json` file.

{@a services}
## Services

Services are an integral part of Angular applications. In Angular, a service is an instance of a class that you can make available to any part of your application using Angular's [dependency injection system](guide/glossary#dependency-injection-di "dependency injection definition").

Services are the place where you share data between parts of your application. For the online store, the cart service is where you store your cart data and methods.

{@a create-cart-service}
## Create the shopping cart service

Up to this point, users can view product information, and
simulate sharing and being notified about product changes.
They cannot, however, buy products.

In this section, you add a "Buy" button to the product
details page and set up a cart service to store information
about products in the cart.

<div class="alert is-helpful">

Later, the [Forms](start/forms "Getting Started: Forms") part of
this tutorial guides you through accessing this cart service
from the page where the user checks out.

Later, the [Forms](start/forms "Getting Started: Forms") part of this tutorial guides you through accessing this cart service from the page where the user checks out.

</div>

{@a generate-cart-service}
### Define a cart service

1. Generate a cart service.

    1. Right click on the `app` folder, choose `Angular Generator`, and choose `Service`. Name the new service `cart`.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. StackBlitz might generate the  `@Injectable()` decorator without the `{ providedIn: 'root' }` statement as above. Instead, the generator provides the cart service in `app.module.ts` by default. For the purposes
    of this tutorial, either way works. The `@Injectable()` `{ providedIn: 'root' }` syntax allows [tree shaking](/guide/dependency-injection-providers#tree-shakable-providers), which is beyond the scope of this guide.

1. In the `CartService` class, define an `items` property to store the array of the current products in the cart.

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="props"></code-example>

1. Define methods to add items to the cart, return cart items, and clear the cart items:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="methods"></code-example>

    * The `addToCart()` method appends a product to an array of `items`.

    * The `getItems()` method collects the items users add to the cart and returns each item with its associated quantity.

    * The `clearCart()` method returns an empty array of items.

{@a product-details-use-cart-service}
### Use the cart service

This section walks you through using the cart service to add a product to the cart with a "Buy" button.

1. Open `product-details.component.ts`.

1. Configure the component to use the cart service.

    1. Import the cart service.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. Inject the cart service by adding it to the `constructor()`.

        <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

        <!--
        To do: Consider defining "inject" and describing the concept of "dependency injection"
        -->

1. Define the `addToCart()` method, which adds the current product to the cart.

    The `addToCart()` method does the following three things:
    * Receives the current `product`.
    * Uses the cart service's `addToCart()` method to add the product the cart.
    * Displays a message that you've added a product to the cart.

    <code-example path="getting-started/src/app/product-details/product-details.component.ts" header="src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

1. Update the product details template with a "Buy" button that adds the current product to the cart.

    1. Open `product-details.component.html`.

    1. Add a button with the label "Buy", and bind the `click()` event to the `addToCart()` method:

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.

    <div class="lightbox">
      <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
    </div>

 1. Click the "Buy" button to add the product to the stored list of items in the cart and display a confirmation message.

    <div class="lightbox">
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
    </div>


## Create the cart page

At this point, users can put items in the cart by clicking "Buy", but they can't yet see their cart.

Create the cart page in two steps:

1. Create a cart component and configure routing to the new component. At this point, the cart page will only have default text.
1. Display the cart items.

### Set up the component

 To create the cart page, begin by following the same steps you did to create the product details component and configure routing for the new component.

1. Generate a cart component, named `cart`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. Add routing (a URL pattern) for the cart component.

    Open `app.module.ts` and add a route for the component `CartComponent`, with a `path` of `cart`:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

1. To see the new cart component, click the "Checkout" button. You can see the "cart works!" default text, and the URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project.

    <div class="alert is-helpful">

    The starter code for the "Checkout" button already includes a `routerLink` for `/cart` the top-bar component.

    </div>

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart page before customizing">
    </div>


### Display the cart items

You can use services to share data across components:

* The product details component already uses the cart service to add products to the cart.
* This section shows you how to use the cart service to display the products in the cart.


1. Open `cart.component.ts`.

1. Configure the component to use the cart service.

    1. Import the `CartService` from the `cart.service.ts` file.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
        </code-example>

    1. Inject the `CartService` so that the cart component can use it.

        <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="inject-cart">
        </code-example>

1. Define the `items` property to store the products in the cart.

    <code-example path="getting-started/src/app/cart/cart.component.2.ts" header="src/app/cart/cart.component.ts" region="items">
    </code-example>

1. Set the items using the cart service's `getItems()` method. Recall that you defined this method [when you generated `cart.service.ts`](#generate-cart-service).

    The resulting `CartComponent` class is as follows:

    <code-example path="getting-started/src/app/cart/cart.component.3.ts" header="src/app/cart/cart.component.ts" region="props-services">
    </code-example>

1. Update the template with a header, and use a `<div>` with an `*ngFor` to display each of the cart items with its name and price.

    The resulting `CartComponent` template is as follows:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
    </code-example>

1. Test your cart component.

    1. Click on "My Store" to go to the product list page.
    1. Click on a product name to display its details.
    1. Click "Buy" to add the product to the cart.
    1. Click "Checkout" to see the cart.
    1. To add another product, click "My Store" to return to the product list.

  Repeat to add more items to the cart.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart page with products added">
    </div>


<div class="alert is-helpful">

StackBlitz tip: Any time the preview refreshes, the cart is cleared. If you make changes to the app, the page refreshes, so you'll need to buy products again to populate the cart.

</div>

<div class="alert is-helpful">

For more information about services, see [Introduction to Services and Dependency Injection](guide/architecture-services "Architecture > Intro to Services and DI").

</div>


## Retrieve shipping prices
<!-- Accessing data with the HTTP client -->

Servers often return data in the form of a stream.
Streams are useful because they make it easy to transform the returned data and  make modifications to the way you request that data.
The Angular HTTP client, `HttpClient`, is a built-in way to fetch data from external APIs and provide them to your app as a stream.

This section shows you how to use the HTTP client to retrieve shipping prices from an external file.

### Predefined shipping data

The app StackBlitz generates for this guide comes with predefined shipping data in `assets/shipping.json`.
Use this data to add shipping prices for items in the cart.

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json">
</code-example>


### Use `HttpClient` in the `AppModule`

Before you can use Angular's HTTP client, you must configure your app to use `HttpClientModule`.

Angular's `HttpClientModule` registers the providers your app needs to use a single instance of the `HttpClient` service throughout your app.

1. Open `app.module.ts`.

  This file contains imports and functionality that is available to the entire app.

1. Import `HttpClientModule` from the `@angular/common/http` package at the top of the file with the other imports. As there are a number of other imports, this code snippet omits them for brevity. Be sure to leave the existing imports in place.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `AppModule` `@NgModule()` `imports` array to register Angular's `HttpClient` providers globally.

    <code-example path="getting-started/src/app/app.module.ts" header="src/app/app.module.ts" region="http-client-module">
    </code-example>

### Use `HttpClient` in the cart service

Now that the `AppModule` imports the `HttpClientModule`, the next step is to inject the `HttpClient` service into your service so your app can fetch data and interact with external APIs and resources.


1. Open `cart.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http">
    </code-example>

1. Inject `HttpClient` into the `CartService` constructor:

    <code-example path="getting-started/src/app/cart.service.ts" header="src/app/cart.service.ts" region="inject-http">
    </code-example>


### Define the `get()` method

Multiple components can leverage the same service.
Later in this tutorial, the shipping component uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file.
First, define a `get()` method.

1. Continue working in `cart.service.ts`.

1. Below the `clearCart()` method, define a new `getShippingPrices()` method that uses the `HttpClient` `get()` method to retrieve the shipping data.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>


<div class="alert is-helpful">

For more information about Angular's `HttpClient`, see [HttpClient](guide/http "HttpClient guide").

</div>

## Define the shipping page

Now that your app can retrieve shipping data, create a shipping component and  template.

1. Generate a new component named `shipping`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.1.ts"></code-example>

1. In `app.module.ts`, add a route for shipping. Specify a `path` of `shipping` and a component of `ShippingComponent`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>

    There's no link to the new shipping component yet, but you can see its template in the preview pane by entering the URL its route specifies. The URL has the pattern: `https://getting-started.stackblitz.io/shipping` where the `getting-started.stackblitz.io` part may be different for your StackBlitz project.

1. Modify the shipping component so it uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file.

    1. Import the cart service.

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. Define a `shippingCosts` property.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. Inject the cart service in the `ShippingComponent` constructor:

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

    1. Set the `shippingCosts` property using the `getShippingPrices()` method from the cart service.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" header="src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. Update the shipping component's template to display the shipping types and prices using the `async` pipe:

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

    The `async` pipe returns the latest value from a stream of data and continues to do so for the life of a given component. When Angular destroys that component, the `async` pipe automatically stops. For detailed information about the `async` pipe, see the [AsyncPipe API documentation](/api/common/AsyncPipe).

1. Add a link from the cart page to the shipping page:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

1. Test your shipping prices feature:

    Click the "Checkout" button to see the updated cart. Remember that changing the app causes the preview to refresh, which empties the cart.

    <div class="lightbox">
      <img src='generated/images/guide/start/cart-empty-with-shipping-prices.png' alt="Cart with link to shipping prices">
    </div>

    Click on the link to navigate to the shipping prices.

    <div class="lightbox">
      <img src='generated/images/guide/start/shipping-prices.png' alt="Display shipping prices">
    </div>


## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart. You can also look up and display shipping prices.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](start/forms "Getting Started: Forms") to finish the app by adding the shopping cart page and a checkout form.
* [Skip ahead to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.
