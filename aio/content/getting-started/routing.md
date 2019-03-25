# Routing

Welcome to lesson 2 of Angular Getting Started. 

At the end of [Lesson 1: Your First App](getting-started), the online store application had a basic product catalog: 

* The app displays a top bar and a product list
* Users can click a "Share" button to simulate sharing the product with someone else
* Users can click a "Notify Me" button to simulate signing up to be notified when a product over $700 goes on sale

Everything is done in the product list component and its child product alerts component. The app is effectively a single "page" with a single URL. 


<!--
## Introduction

Data your app needs can come from many different sources. Whether it be a static file, a backend API that exposes data through a JSON-based API, or other different formats, your app consumes and makes use of this data to make decisions and display content. Your app also needs data to be entered from users to fill out forms for processing. Angular provides libraries to help you consume and receive data by building on top of existing browser APIs. 
-->

<!--
JAF: I'd like to move routing to its own lesson between first app and managing data, but we'd have to redesign the flow or the app to make routing work at that point. 
-->

Up to this point, the app doesn't have any variable states or navigation. There is one URL, and that URL always displays the "My Store" page with a fixed list of products and changeable details below. You can see the URL in  the Stackblitz preview pane: `https://ng-getting-started-lesson2.stackblitz.io`.

In this section, you'll modify the app to display the product details in separate pages, with their own URLs.

To do this, you'll use the Angular *router*. 
The Angular [router](guide/glossary#router) allows us to show different components and data to the user based on where the user is in the application. 
The router enables navigation from one view to the next as users perform application tasks. 

* Enter a URL in the address bar and the browser navigates to a corresponding page.
* Click links on the page and the browser navigates to a new page.
* Click the browser's back and forward buttons and the browser navigates backward and forward through the history of pages you've seen.

1. Generate a new component for product details. Give the component the name `product-details`.

    Reminder: In the file list, right-click the `app` folder, choose `Angular Generator` and `Component`. 

## App-level setup

Open `app.module.ts`. This file defines functionality that is global to the app. 

Notice that the app is already set up to use routing in general:

* It imports the `RouterModule` from `@angular/router`. 

    ```
    import { RouterModule } from '@angular/router';
    ```

* In the `@NgModule` imports, `RouterModule.forRoot()` defines the base path as displaying the product list component. 

    ```
    @NgModule({
        imports: [
            BrowserModule,
            HttpClientModule,
            ReactiveFormsModule,
            RouterModule.forRoot([
                { path: '', component: ProductListComponent },
            ])
        ],
    ```
    
## Component-level setup

1. In `app.module.ts`, Add a route for product details, with a `path` of `products/:productId` and `ProductDetailsComponent` for the `component`.

    ```
    @NgModule({
        imports: [
            BrowserModule,
            HttpClientModule,
            ReactiveFormsModule,
            RouterModule.forRoot([
               { path: '', component: ProductListComponent },
               { path: 'products/:productId', component: ProductDetailsComponent },
            ])
        ],
    ```
    
    A route associates a URL suffix with a component. 

1. Define the router link. The router link defines how the user navigates to the route (or URL).

    We want the user to click a product name to display the details for that product. 

    1. Open `product-list.component.html`.

    1. Modify the product name anchor to include a router link: 

        ```
        <h3>
            <a [title]="product.name" [routerLink]="['/products', productId]">
            {{ product.name }}
            </a>
        </h3>
        ```

      The RouterLink directive give the router control over the anchor element. In this case, the route (URL) contains one fixed segment (`/products`) and the final segment is variable, inserting the id property of the current product. For example, the URL for a product with an `id` of 1 will be similar to `https://ng-getting-started-lesson2.stackblitz.io/products/1`. 

1. Test the router by clicking a product name. The app displays the product details component, which currently always says "product-details works." 

    Notice that the URL in the preview window changes. The final segment is `products/undefined`.

    We'll fix this in the next section. 

## ActivatedRoute

1. Open `product-details.component.ts`

1. Arrange to use product data from an external file. 

    In `product-details.component.ts`:

    1. Import `products` from `products.ts`.

    1. Define the product property.

        ```
        export class ProductDetailsComponent implements OnInit {
          product;
          ...
        }  
        ```

1. In `product-list.component.html`: 

    <div *ngFor="let product of products; index as productId">

1. Import `ActivatedRoute`.

1. Inject ActivatedRoute.

    ```
    constructor(
        private route: ActivatedRoute) { }
    ```

1. In the ngOnInit() method, subscribe to route params and fetch the product based on the id

    ```
    ngOnInit() {
        this.route.paramMap.subscribe(params => {
            this.product = products[+params.get('productId')];
        });
    }
    ```

1. Update template to display product details information inside an *ngIf

    ```
    <h2>Product Details</h2>

    <div *ngIf="product">
        <h3>{{ product.name }}</h3>
        <h4>{{ product.price | currency}}</h4>
        <p>{{ product.description }}</p>
    </div>
    ```



## Clean up

1. Update the product details component template (`product-list.component.html`), so that the title "Product Details" is always displayed, but the product details information is only displayed if a product exists. To do this, wrap the product details with an `*ngIf`. 

    Now, when the user clicks on a name in the product list, the product list is replaced by a product details view. 


## Next steps

Congratulations! You have an online store application with a product catalog and shopping cart: 

* The app displays a top bar and a product list
* Product data is retrieved from an external `json` file by a dedicated data service using the HttpClient
* Users can click on a product name from the list to see details in a new view, with a distinct URL (route)
* Users can click on the `Buy` button to add a product to the shopping cart


To continue exploring Angular, we recommend either of the following options:
* [Continue to the next Getting Started lesson: Managing Data.](getting-started/data) 
* [Skip ahead to the Deployment section](getting-started/deployment) to deploy your app to Firebase or move to local development. 



