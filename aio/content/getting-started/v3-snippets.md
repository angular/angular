# V3 snippets


Product Alerts Component

Generate product alerts component

Input 

Import Input from core
Define a property named “product” in the product-details.component class with an @Input decorator

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.1.ts">
    </code-example>

Template

Add a paragraph tag with an *ngIf to show the button if the price is a certain amount

    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html" region="input">
    </code-example>

Output

Import Output, EventEmitter from core

    <code-example header="src/app/product-alerts/product-alerts.component.ts" path="getting-started/src/app/product-alerts/product-alerts.component.ts">
    </code-example>

Properties

Define an output property named “notify” with an @Output decorator and an instance of EventEmitter
Template
Add a paragraph tag with an *ngIf to show the button if the price is a certain amount
Inside the paragraph, add a button to the template with a event binding to call the notify.emit() method


    <code-example header="src/app/product-alerts/product-alerts.component.html" path="getting-started/src/app/product-alerts/product-alerts.component.html">
    </code-example>

Define method in Product List Component

    <code-example header="src/app/product-alerts/product-list.component.ts" path="getting-started/src/app/product-list/product-list.component.ts" region="on-notify">
    </code-example>

Add Product Alerts to Product List


    <code-example header="src/app/product-alerts/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.5.html">
    </code-example>

Product Details Route

1. Generate product details component

2. Add route to AppModule

  <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
  </code-example>

Display product details

Import ActivatedRoute, products

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="imports">
    </code-example>

Define product property, inject ActivatedRoute

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="props-methods">
    </code-example>

In `ngOnInit()` method, use route parameters to retrieve product details

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="get-product">
    </code-example>

Update template to display product details

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

In Product list component template, add link to product details

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>


## Services and HTTP

### Services

...

Generate cart service

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.1.ts">
    </code-example>

Define property for cart items

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="props">
    </code-example>

Add method to add item to the cart

Add method to return the cart items

Add method to clear the cart items

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="methods">
    </code-example>


### Use Cart Service in product details

Import cart service

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="cart-service">
    </code-example>

Inject cart service

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="inject-cart-service">
    </code-example>

Define method to add product to the cart

Use cart service to call the method

    <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.ts" region="add-to-cart">
    </code-example>
    
### Import HttpClient

Before you can use Angular's HTTP client, you must set up your app to use HttpClientModule. 

Angular's HttpClientModule registers the providers needed to use a single instance of the HttpClient service throughout your app. The HttpClient service is what you inject into your services to fetch data and interact with external APIs and resources. 

1. Open `app.module.ts`. 

  This file contains imports and functionality that is available to the entire app. 

1. Import `HttpClientModule` from the `@angular/common/http` package.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module-import">
    </code-example>

1. Add `HttpClientModule` to the `imports` array of the app module.

    This registers Angular's HttpClient providers globally.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="http-client-module">
    </code-example>

Using HttpClient

1. Import HttpClient into `cart.service.ts` file
1. Inject HttpClient into constructor

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="import-inject">
    </code-example>

1. Add method to get shipping prices using the `HttpClient#get()` method.

    <code-example header="src/app/cart.service.ts" path="getting-started/src/app/cart.service.ts" region="shipping">
    </code-example>

Create shipping prices page

1. Generate component name `shipping`.

1. Define property named `shippingCosts`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="props">
    </code-example>

1. Inject CartService and set `shippingCosts` property using `getShippingPrices()` method from the `CartService`.

    <code-example header="src/app/shipping/shipping.component.ts" path="getting-started/src/app/shipping/shipping.component.ts" region="ctor">
    </code-example>

1. Update the template to display shipping costs.

    <code-example header="src/app/shipping/shipping.component.html" path="getting-started/src/app/shipping/shipping.component.html">
    </code-example>

Add shipping route

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="shipping-route">
    </code-example>