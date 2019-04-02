# Routing

At the end of [Your First App](start "Getting Started: Your First App"), the online store application has a basic product catalog. 
The app doesn't have any variable states or navigation. 
There is one URL, and that URL always displays the "My Store" page with a list of products and their descriptions. 

In this section, you'll extend the app to display full product details in separate pages, with their own URLs.

To do this, you'll use the Angular *router*. 
The Angular [router](guide/glossary#router "router definition") enables you to show different components and data to the user based on where the user is in the application. 
The router enables navigation from one view to the next as users perform application tasks: 

* Enter a URL in the address bar, and the browser navigates to a corresponding page.
* Click links on the page, and the browser navigates to a new page.
* Click the browser's back and forward buttons, and the browser navigates backward and forward through the history of pages you've seen.


## Registering a route

The app is already set up to use the Angular router and to use routing to navigate to the product list component you modified earlier. Let's define a route to show individual product details.

1. Generate a new component for product details. Give the component the name `product-details`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 

1. In `app.module.ts`, add a route for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

    <code-example header="src/app/app.module.ts" path="getting-started/src/app/app.module.ts" region="product-details-route">
    </code-example>
    
    A route associates one or more URL paths with a component.

1. Define a link using the `RouterLink` directive. The `routerLink` defines how the user navigates to the route (or URL) declaratively
    in the component template.

    We want the user to click a product name to display the details for that product. 

    1. Open `product-list.component.html`.

    1. Update the `*ngFor` directive to assign each index in the `products` array to the `productId` variable when iterating over the list.
    
    1. Modify the product name anchor to include a `routerLink`.

    <code-example header="src/app/product-list/product-list.component.html" path="getting-started/src/app/product-list/product-list.component.html" region="router-link">
    </code-example>

    <!-- 
    To do: I see a comment line with ellipses between the closing of h3 and div. It's an interesting way to show that we've clipped out some code. Should we use this elsewhere? 
    -->

      The RouterLink directive gives the router control over the anchor element. In this case, the route (URL) contains one fixed segment (`/products`) and the final segment is variable, inserting the id property of the current product. For example, the URL for a product with an `id` of 1 will be similar to `https://getting-started-myfork.stackblitz.io/products/1`. 

1. Test the router by clicking a product name. The app displays the product details component, which currently always says "product-details works!" (We'll fix this in the next section.)

    Notice that the URL in the preview window changes. The final segment is `products/1`.

    <figure>
      <img src="generated/images/guide/start/product-details-works.png" alt="Product details page with updated URL">
    </figure>

    

## Using route information

The product details component handles the display of each product. The Angular Router displays components based on the browser's URL and your defined routes. You'll use the Angular Router to combine the `products` data and route information to display the specific details for each product.

1. Open `product-details.component.ts`

1. Arrange to use product data from an external file. 

    1. Import `ActivatedRoute` from the `@angular/router` package, and the `products` array from `../products`.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="imports">
        </code-example>

    1. Define the `product` property and inject the `ActivatedRoute` into the constructor.

        <code-example header="src/app/product-details/product-details.component.ts" path="getting-started/src/app/product-details/product-details.component.1.ts" region="props-methods">
        </code-example>

        The `ActivatedRoute` is specific to each routed component loaded by the Angular Router. It contains information about the
        route, its parameters, and additional data associated with the route.

        <!-- 
        To do: This is the first time we inject anything into a component. Should we mention it here? There's also a comment about maybe explaining it a bit in the services section (in data.md).
        -->

1. In the `ngOnInit()` method, _subscribe_ to route params and fetch the product based on the `productId`.

    <code-example path="getting-started/src/app/product-details/product-details.component.1.ts" region="get-product">
    </code-example>

    The route parameters correspond to the path variables defined in the route. The `productId` is provided from
    the URL that was matched to the route. You use the `productId` to display the details for each unique product. 

1. Update the template to display product details information inside an `*ngIf`.

    <code-example header="src/app/product-details/product-details.component.html" path="getting-started/src/app/product-details/product-details.component.html" region="details">
    </code-example>

Now, when the user clicks on a name in the product list, the router navigates you to the distinct URL for the product, swaps out the product list component for the product details component, and displays the product details. 

  <figure>
    <img src="generated/images/guide/start/product-details-routed.png" alt="Product details page with updated URL and full details displayed">
  </figure>



<div class="alert is-helpful">

Learn more: See [Routing & Navigation](guide/router "Routing & Navigation") for more information about the Angular router. 

</div>


## Next steps

Congratulations! You have integrated routing into your online store.

* Products are linked from the product list page to individual products
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)

To continue exploring Angular, choose either of the following options:
* [Continue to the "Managing Data" section](start/data "Getting Started: Managing Data") to add the shopping cart feature, using a service to manage the cart data and using HTTP to retrieve external data for shipping prices. 
* [Skip ahead to the Deployment section](start/deployment "Getting Started: Deployment") to deploy your app to Firebase or move to local development. 

