# Managing Data

At the end of [Routing](start/routing "Getting Started: Routing"), the online store application has a product catalog with two views: a product list and product details.
Users can click on a product name from the list to see details in a new view, with a distinct URL (route).

In this section, you'll create the shopping cart. You'll:
* Update the product details page to include a "Buy" button, which adds the current product to a list of products managed by a cart service.
* Add a cart component, which displays the items you added to your cart.
* Add a shipping component, which retrieves shipping prices for the items in the cart by using Angular's `HttpClient` to retrieve shipping data from a `.json` file.

{@a services}
## Services

Services are an integral part of Angular applications. In Angular, a service is an instance of a class that can be made available to any part of your application using Angular's [dependency injection system](guide/glossary#dependency-injection-di "dependency injection definition").

Services are the place where you share data between parts of your application. For the online store, the cart service is where you store your cart data and methods.

{@a create-cart-service}
## Create the shopping cart service

Up to this point, users can view product information, and simulate sharing and being notified about product changes. They cannot, however, buy products.

In this section, you'll add a "Buy" button the product details page.
You'll also set up a cart service to store information about products in the cart.

<div class="alert is-helpful">

Later, in the [Forms](start/forms "Getting Started: Forms") part of this tutorial, this cart service also will be accessed from the page where the user checks out.

</div>

{@a generate-cart-service}
### Define a cart service

1. Generate a cart service.

    1. Right click on the `app` folder, choose `Angular Generator`, and choose `Service`. Name the new service `cart`.

        <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts"></code-example>

    1. If the generated `@Injectable()` decorator does not include the `{ providedIn: 'root' }` statement, then insert it as shown above.

1. In the `CartService` class, define an `items` property to store the list (array) of the current products in the cart.

    <code-example path="getting-started/src/app/cart.service.ts" region="props"></code-example>

1. Define methods to add items to the cart, return cart items, and clear the cart items:

    <code-example path="getting-started/src/app/cart.service.ts" region="methods"></code-example>

    <!--
    To check: StackBlitz includes the constructor. If it's important (and not obvious) that the methods be below the constructor, then we should show it or say something.
    -->

    <!--
    * The `addToCart()` method appends a product to an array of `items`.

    * The `getItems()` method collects the items added to the cart and returns each item with its associated quantity.

    * The `clearCart()` method returns an empty array of items.
    -->

{@a product-details-use-cart-service}
### Use the cart service

In this section, you'll update the product details component to use the cart service.
You'll add a "Buy" button to the product details view.
When the "Buy" button is clicked, you'll use the cart service to add the current product to the cart.

1. Open `product-details.component.ts`.

1. Set up the component to be able to use the cart service.

    1. Import the cart service.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
        </code-example>

    1. Inject the cart service.

        <code-example path="getting-started/src/app/product-details/product-details.component.ts" region="inject-cart-service">
        </code-example>

        <!--
        To do: Consider defining "inject" and describing the concept of "dependency injection"
        -->

1. Define the `addToCart()` method, which adds the current product to the cart.

    The `addToCart()` method:
    * Receives the current `product`
    * Uses the cart service's `#addToCart()` method to add the product the cart
    * Displays a message that the product has been added to the cart

    <code-example path="getting-started/src/app/product-details/product-details.component.ts" region="add-to-cart"></code-example>

1. Update the product details template to have a "Buy" button that adds the current product to the cart.

    1. Open `product-details.component.html`.

    1. Add a button with the label "Buy", and bind the `click()` event to the `addToCart()` method:

        <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html">
        </code-example>

1. To see the new "Buy" button, refresh the application and click on a product's name to display its details.

   <figure>
     <img src='generated/images/guide/start/product-details-buy.png' alt="Display details for selected product with a Buy button">
   </figure>

 1. Click the "Buy" button. The product is added to the stored list of items in the cart, and a message is displayed.

    <figure>
      <img src='generated/images/guide/start/buy-alert.png' alt="Display details for selected product with a Buy button">
    </figure>


## Create the cart page

At this point, users can put items in the cart by clicking "Buy", but they can't yet see their cart.

We'll create the cart page in two steps:

1. Create a cart component and set up routing to the new component. At this point, the cart page will only have default text.
1. Display the cart items.

### Set up the component

 To create the cart page, you begin by following the same steps you did to create the product details component and to set up routing for the new component.

1. Generate a cart component, named `cart`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.1.ts"></code-example>

1. Add routing (a URL pattern) for the cart component.

    Reminder: Open `app.module.ts` and add a route for the component `CartComponent`, with a `path` of `cart`:

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="cart-route">
    </code-example>

    <!--
    To do: Can we shorten the example code to remove the extra at the bottom?
    -->

1. To see the new cart component, click the "Checkout" button. You can see the "cart works!" default text, and the URL has the pattern `https://getting-started.stackblitz.io/cart`,  where `getting-started.stackblitz.io` may be different for your StackBlitz project.

    (Note: The "Checkout" button that we provided in the top-bar component was already configured with a `routerLink` for `/cart`.)

    <figure>
      <img src='generated/images/guide/start/cart-works.png' alt="Display cart page before customizing">
    </figure>


### Display the cart items

Services can be used to share data across components:

* The product details component already uses the cart service (`CartService`) to add products to the cart.
* In this section, you'll update the cart component to use the cart service to display the products in the cart.


1. Open `cart.component.ts`.

1. Set up the component to be able to use the cart service. (This is the same way you set up the product details component to use the cart service, above.)

    1. Import the `CartService` from the `cart.service.ts` file.

        <code-example header="src/app/cart/cart.component.ts" path="getting-started/src/app/cart/cart.component.2.ts" region="imports">
        </code-example>

    1. Inject the `CartService` to manage cart information.

        <code-example path="getting-started/src/app/cart/cart.component.2.ts" region="inject-cart">
        </code-example>

1. Define the `items` property to store the products in the cart.

    <code-example path="getting-started/src/app/cart/cart.component.2.ts" region="items">
    </code-example>

1. Set the items using the cart service's `getItems()` method. (You defined this method [when you generated `cart.service.ts`](#generate-cart-service).)

    The resulting `CartComponent` class should look like this:

    <code-example path="getting-started/src/app/cart/cart.component.3.ts" region="props-services">
    </code-example>

1. Update the template with a header ("Cart"), and use a `<div>` with an `*ngFor` to display each of the cart items with its name and price.

    The resulting `CartComponent` template should look like this:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html" region="prices">
    </code-example>

1. Test your cart component.

    1. Click on "My Store" to go to the product list page.
    1. Click on a product name to display its details.
    1. Click "Buy" to add the product to the cart.
    1. Click "Checkout" to see the cart.
    1. To add another product, click "My Store" to return to the product list. Repeat the steps above.

    <figure>
      <img src='generated/images/guide/start/cart-page-full.png' alt="Cart page with products added">
    </figure>


<div class="alert is-helpful">

StackBlitz tip: Any time the preview refreshes, the cart is cleared. If you make changes to the app, the page refreshes, and you'll need to buy products again to populate the cart.

</div>

<!--
To do: New screen shot. No shipping prices link yet. Show a few products in the cart.
-->

<div class="alert is-helpful">

Learn more: See [Introduction to Services and Dependency Injection](guide/architecture-services "Architecture > Intro to Services and DI") for more information about services.

</div>



## Retrieve shipping prices
<!-- Accessing data with the HTTP client -->

Data returned from servers often takes the form of a stream.
Streams are useful because they make it easy to transform the data that is returned, and to make modifications to the way data is requested.
The Angular HTTP client (`HttpClient`) is a built-in way to fetch data from external APIs and provide them to your application as a stream.

In this section, you'll use the HTTP client to retrieve shipping prices from an external file.

### Predefined shipping data

For the purpose of this Getting Started guide, we have provided shipping data in `assets/shipping.json`.
You'll use this data to add shipping prices for items in the cart.

<code-example header="src/assets/shipping.json" path="getting-started/src/assets/shipping.json">
</code-example>


### Enable HttpClient for app

Before you can use Angular's HTTP client, you must set up your app to use `HttpClientModule`.

Angular's `HttpClientModule` registers the providers needed to use a single instance of the `HttpClient` service throughout your app.
The `HttpClient` service is what you inject into your services to fetch data and interact with external APIs and resources.

1. Open `app.module.ts`.

  This file contains imports and functionality that is available to the entire app.

1. Import `HttpClientModule` from the `@angular/common/http` package.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `imports` array of the app module (`@NgModule`).

    This registers Angular's `HttpClient` providers globally.

    <code-example path="getting-started/src/app/app.module.ts" region="http-client-module">
    </code-example>

<!--
To do: Should ReactiveFormsModule already be here? Currently, it is in the starter stackblitz, so this doc assumes it is already included and not added in the forms section.
-->

<!--
To do: Should ReactiveFormsModule already be here?
-->

### Enable HttpClient for cart service

1. Open `cart.service.ts`.

1. Import `HttpClient` from the `@angular/common/http` package.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-http">
    </code-example>

1. Inject `HttpClient` into the constructor of the `CartService` component class:

    <code-example path="getting-started/src/app/cart.service.ts" region="inject-http">
    </code-example>


### Define the get() method

As you've seen, multiple components can leverage the same service.
Later in this tutorial, the shipping component will use the cart service to retrieve shipping data via HTTP from the `shipping.json` file.
Here you'll define the `get()` method that will be used.

1. Continue working in `cart.service.ts`.

1. Below the `clearCart()` method, define a new `getShippingPrices()` method that uses the `HttpClient#get()` method to retrieve the shipping data (types and prices).

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="get-shipping"></code-example>


<div class="alert is-helpful">

Learn more: See the [HttpClient guide](guide/http "HttpClient guide") for more information about Angular's `HttpClient`.

</div>




## Define the shipping page

Now that your app can retrieve shipping data, you'll create a shipping component and associated template.

1. Generate a new component named `shipping`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.1.ts"></code-example>

1. In `app.module.ts`, add a route for shipping. Specify a `path` of `shipping` and a component of `ShippingComponent`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route"></code-example>

    The new shipping component isn't hooked into any other component yet, but you can see it in the preview pane by entering the URL specified by its route. The URL has the pattern: `https://getting-started.stackblitz.io/shipping` where the `getting-started.stackblitz.io` part may be different for your StackBlitz project.

1. Modify the shipping component so it uses the cart service to retrieve shipping data via HTTP from the `shipping.json` file.

    1. Import the cart service.

        <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="imports"></code-example>

    1. Define a `shippingCosts` property.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="props"></code-example>

    1. Inject the cart service into the `ShippingComponent` class:

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="inject-cart-service"></code-example>

    1. Set the `shippingCosts` property using the `getShippingPrices()` method from cart service.

        <code-example path="getting-started/src/app/shipping/shipping.component.ts" region="ctor"></code-example>

1. Update the shipping component's template to display the shipping types and prices using async pipe:

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html"></code-example>

    <!--
    To decide: Should we describe async pipe
    -->

1. Add a link from the cart page to the shipping page:

    <code-example header="src/app/cart/cart.component.html" path="getting-started/src/app/cart/cart.component.2.html"></code-example>

1. Test your shipping prices feature:

    Click on the "Checkout" button to see the updated cart. (Remember that changing the app causes the preview to refresh, which empties the cart.)

    <figure>
      <img src='generated/images/guide/start/cart-empty-with-shipping-prices.png' alt="Cart with link to shipping prices">
    </figure>

    Click on the link to navigate to the shipping prices.

    <figure>
      <img src='generated/images/guide/start/shipping-prices.png' alt="Display shipping prices">
    </figure>


## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart. You also have the ability to look up and display shipping prices.

To continue exploring Angular, choose either of the following options:
* [Continue to the "Forms" section](start/forms "Getting Started: Forms") to finish the app by adding the shopping cart page and a form-based checkout feature. You'll create a form to collect user information as part of checkout.
* [Skip ahead to the "Deployment" section](start/deployment "Getting Started: Deployment") to move to local development, or deploy your app to Firebase or your own server.


