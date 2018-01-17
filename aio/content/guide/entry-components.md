# Entry Components

#### Prerequisites:

A basic understanding of the following concepts:
* [Bootstrapping](guide/bootstrapping).

<hr />

An entry component is any component that Angular loads imperatively, (which means you’re not referencing it in the template), by type. You specify an entry component by bootstrapping it in an NgModule,or  including it in a routing definition.

<div class="alert is-helpful">

To contrast the two types of components, there are components which are included in the template, which are declarative.  Additionally, there are  components which you load imperatively; that is, entry components.

</div>


There are two main kinds of entry components:

* The bootstrapped root component.
* A component you specify in a route definition.


## A bootstrapped entry component


The following is an example of specifying a bootstrapped component,
`AppComponent`, in a basic `app.module.ts`:

```javascript
@NgModule({
 declarations: [
   AppComponent
 ],
 imports: [
   BrowserModule,
   FormsModule,
   HttpModule,
   AppRoutingModule
 ],
 providers: [],
 bootstrap: [AppComponent] // bootstrapped entry component
})
```
A bootstrapped component is an entry component
that Angular loads into the DOM during the bootstrap (application launch), process.
Other entry components are loaded dynamically by other means, such as with the router.

Angular loads a root `AppComponent` dynamically because it's listed by type in `@NgModule.bootstrap`.

<div class="alert is-helpful">

A component can also be bootstrapped imperatively with the module's `ngDoBootstrap()` method.
The `@NgModule.bootstrap` property tells the compiler that this is an entry component and
it should generate code to bootstrap the application with this component.

</div>


A bootstrapped component is necessarily an entry component because bootstrapping is an imperative process, thus it needs to have an entry component.

## A routed entry component


The second kind of entry component occurs in a route definition like
this:

```javascript
const routes: Routes = [
 {
   path: '',
   component: CustomerListComponent
 }
];
```

A route definition refers to a component by its type with `component: CustomerListComponent`.

All router components must be `entryComponents`. Because this would require you to add the component in two places (router and `entryComponent`) the Compiler is smart enough to recognize that this is a router definition and automatically add the router component into `entryComponents`.


## The `entryComponents` array

Though the `@NgModule` decorator has an `entryComponents` array, most of the time
you won't have to explicitly set any entry components because Angular adds components listed in `@NgModule.bootstrap` and those in route definitions to entry components automatically. Though these two mechanisms account for most entry components, if your app happens to bootstrap or dynamically load a component by type imperatively,
you must add it to `entryComponents` explicitly.

### `entryComponents` and the compiler

For production apps you want to load the smallest code possible.
The code should contain only the classes that you actually need and
exclude components that are never used. For this reason, the Angular compiler only generates code for components which are reachable from the `entryComponents`; This means that adding more references to `@NgModule.declarations` does not imply that they will necessarily be included in the final bundle.

In fact, many libraries declare and export components you'll never use.
For example, a material design library will export all components because it doesn’t know which ones the you will use. However, it is unlikely that the you will use them all.
For the ones you don't reference, the tree shaker drops these components from the final code package.

If a component isn't an _entry component_ or isn't found in a template,
The tree shaker will throw it away. So, it's best to add only the components that are truly entry components to help keep your app
as trim as possible.


<hr />

## More on Angular modules

You may also be interested in the following:
* [Types of NgModules](guide/module-types)
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
* [NgModules FAQ](guide/ngmodule-faq).




