# Getting Started - Architecture
So far, the application has relied on a single module, but as the application continues to grow, we should consider breaking our application into multiple [NgModules](/guide/architecture-modules).

Every component, directive, and pipe of our application belongs to exactly one NgModule, and the context of these objects is set by the NgModule they belong to.

When you refer to another component from within your template, that component must belong to the same NgModule, or be imported at the NgModule level.

At runtime, our application will be a tree of components, but each component could come from a different module. The structure of our component tree will likely be different than the structure of our modules.

<figure>
  <img src='generated/images/guide/toh/component-hierarchy.gif' alt="Components can be nested and belong to different modules">
</figure>

## Libraries
It is very common to create a "dumb" component library as a module or set of modules that can be imported by other teams. A great example of this is Angular Material which has [a module for each visual component](https://material.angular.io/components/categories) you may want to add to an application.

## Lazy Loading
Lazy loading is a common and recommended strategy in Angular where we take our application and split it into modules using the router. We can define these modules in such a way that Angular only loads the code for a given module when the router has identified that user is attempting to access the route that requires it.

Following this strategy makes your application smaller and will improve the experience of your users.

### Parent Route
To get started with Lazy Loading, start in your route configuration at the top of your application and add a reference to a module, instead of a component.

```
RouterModule.forRoot([
  {path: '', component: ProductListComponent},
  {path: 'products/:id', loadChildren: './product-details/product-details.module#ProductDetailsModule'}
])
```

The string provided in `loadChildren` references the path of our module's TypeScript file, and then after the `#` sign, references the symbol that contains our module.

When the user navigates to `products/42`, the router will automatically load an execute the code for the Lazy Loaded Product Details Module.

### Child Route
To setup our Product Details Module to act as a lazy loaded route, we must configure its router in a child configuratino.


```
imports: [
  RouterModule.forChild({
    {path: '', component: ProductDetailsComponent}
  })  
]
```

As the router descends the tree, it removes the matched pieces of the route. This means our empty string `''` route in the child module will match `/products/42` in the URL bar because that part was removed by the parent module.

## Tasks
* Create a lazy loaded product details module



## Summary
The application now has a very basic landing page, pull data from the internet, and lazily loads Angular code as the user moves around the application.

The next step is to [deploy our application](/tutorial/getting-started-deployment).
