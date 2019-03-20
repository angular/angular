# Architecture

So far, the application has relied on a single module, but as the application continues to grow, you should consider breaking the application into multiple [NgModules](guide/architecture-modules).

Every component, directive, and pipe of the application belongs to exactly one `NgModule`, and the context of these objects is set by the `NgModule` they belong to.

When you refer to another component from within your template, that component must belong to the same `NgModule`, or be imported at the `NgModule` level.

At runtime, the application is a tree of components, but each component could come from a different module. The structure of the component tree is different than the structure of the NgModules.

<figure>
  <img src='generated/images/guide/toh/component-hierarchy.svg' alt="Components can be nested and belong to different modules">
</figure>

## Using Libraries

It is very common to create a component library as a module or set of modules that can be imported by other teams. A great example of this is Angular Material which has [a module for each visual component](https://material.angular.io/components/categories) you may want to add to an application.

You have the same ability to create and publish libraries that can be imported by other teams. Read more about using, creating, and publish libraries in the libraries guide.

## Lazy Loading Features

Lazy loading is a common and recommended strategy in Angular where you take your application and split it into modules using the router. You define these modules in such a way that Angular only loads the code for a given module when the router has identified that user is attempting to access the route that requires it.

Following this strategy makes your application smaller to load initially, and improves the experience of your users.

## Lazy loading product details

To get started with lazy loading, start in your route configuration at the top of your application and add a reference to a module, instead of a component.

#### Create products NgModule

As mentioned earlier, an `NgModule` contains metadata about injector creation at runtime. Because you are lazy loading the product details, a separate child injector will need to be created at runtime. Use an `NgModule` to store the metadata for the injector in the code that will be lazy loaded. 

Right click on the `app` folder, use the `Angular Generator` and generate an `NgModule` named `products`.

*example snippet here*

The `ProductsModule` contains its own metadata for its `declarations` and `imports`. Its doesn't need the `BrowserModule` because it only needs to be loaded once in your application.

#### Import `ProductDetailsComponent`

The `ProductDetailsComponent` is owned by the `AppModule` currently. You'll need to move it to the `ProductsModule` so it will have ownership over the component's compilation.

In the `product.module.ts` file, import `ProductDetailsComponent`.

*example snippet here*

#### Register `ProductDetailsComponent` declaration

Add `ProductDetailsComponent` to the `declarations` array of the `ProductsModule`.

*example snippet here*

#### Register product details route

Import `RouterModule` from the `@angular/router` package.

*example snippet here*

Add the `RouterModule.forChild()` method to the `imports` array of the `ProductsModule` and and a variable route for the product details. 
Set the route path to `:productId`, and the component to `ProductDetailsComponent`.

*example snippet here*

The `RouterModule.forChild()` method is used when you need to register additional routes. The `RouterModule.forRoot()` is only registered once in the `AppModule`.

#### Lazy load products module

The `AppModule` currently builds the application as one complete bundle. When you're lazy loading, boundaries are made so that the application is broken into distinct bundles when built. All references to lazy loaded modules must be removed from their parent bundle.

1. For the product details route, update the `path` from `products/:productId` to `products`
2. Use the `loadChildren` property with a path to `./products/products.module.ts` file and the `ProductModule` symbol.
3. Remove all references to `ProductDetailsComponent` in the `app.module.ts` file.

*example snippet here*

The string provided in `loadChildren` references the path of the module's TypeScript file, and then after the `#` sign, references the symbol that contains the module.

When the user navigates to `products/42`, the router automatically loads and executes the code for the lazy loaded `ProductsModule`.

As the router descends the tree, it consumes the matched segements of the route. This means the `:productId` route in the child module matches `/products/42` in the URL bar because `products` was consumed by the parent module.

You continue to move other parts of your application to be lazy loaded as needed.

## Next steps

The application now has a very basic landing page, pull data from the internet, and lazily loads Angular code as the user moves around the application.

The next step is to [deploy the application](getting-started/getting-started-deployment).
