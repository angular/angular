# Entry Components

## Prerequisites:

A basic understanding of the following concepts:
* [Bootstrapping](guide/bootstrapping).

<hr />

An entry component is any component that Angular loads imperatively by type. This means that you specify the component in an NgModule by bootstrapping it or including it in a routing definition.

<!--Does "imperatively by type" mean more than this? We also use imperatively, dynamically, and declaratively...-->

There are two main kinds of entry components: 
<!--Or are there only two? Or are there others?-->

* The bootstrapped root component. 
* A component you specify in a route definition.


### A bootstrapped entry component

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
that Angular loads into the DOM during the bootstrap, or application launch, process.
Other entry components are loaded dynamically by other means, such as with the router.

<!--Why does "dynamically" matter here?-->
Angular loads a root `AppComponent` dynamically because it's either listed by type in `@NgModule.bootstrap`
or bootstrapped imperatively with the module's `ngDoBootstrap()` method.
The `@NgModule.bootstrap` property tells the compiler that this is an entry component and
it should generate code to bootstrap the application with this component. 

A bootstrapped component is necessarily an entry component because 
it tells Angular which component to start with. Though the
`AppComponent` selector matches an element tag in `index.html`, it is still an entry component because 
`index.html` isn't a component template and the `AppComponent`
selector doesn't match an element in any component template. 

<!--so we can do things imperatively and dynamically at the same time?^^ Also, just above this (line 35) we say that other entry components are loaded dynamically which seems to exclude the bootstrapped component. Is there a difference?-->

<!--Regarding `ngDoBootstrap()` method, does that mean it's not being loaded by type? I thought the type would be part of the parameter requirements, no?-->

### A routed entry component

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
If the component has a selector, the router ignores it and
loads the component dynamically into a `RouterOutlet`.
<!--What does dynamically mean here?^^ -->

The compiler can only discover routed entry components through the routes configuration. 

It can't find them by looking for them in other 
component templates. 
<!--You must tell it about them by adding them to the `entryComponents` list.-->
<!--^^Earlier (in a couple of FAQs), we said that Angular automatically adds them. Does this
still apply here?-->


## The `entryComponents` array

Though the `@NgModule` decorator has an `entryComponents` array, most of the time 
you won't have to explicitly set any entry components because Angular adds components listed in `@NgModule.bootstrap` and those in route definitions to entry components automatically. Though these two mechanisms account for almost all entry components, if your app happens to bootstrap or dynamically load a component by type in some other manner,
you must add it to `entryComponents` explicitly.

<!--What is meant by "in some other manner"? Can we give an example?-->


### `entryComponents` and the compiler

For production apps you want to load the smallest, fastest code possible.
The code should contain only the classes that you actually need and 
exclude components that are never used. For this reason, the Angular compiler doesn't generate code for every component in `@NgModule.declarations`. It does, however, generate code for components in `entryComponents`.

In fact, many libraries declare and export components you'll never use.
If you don't reference them, the tree shaker drops these components from the final code package.

The compiler starts with the entry components,
then it generates code for the declared components it [finds](guide/ngmodule-faq#q-template-reference) in an entry component's template,
then for the declared components it discovers in the templates of previously compiled components,
and so on. At the end of the process, the compiler has generated code for every  entry component
and every component reachable from an entry component.

If a component isn't an _entry component_ or wasn't found in a template,
the compiler omits it. So while it's harmless to add components to `entryComponents`,
it's best to add only the components that are truly entry components to help keep your app 
as trim as possible.
<!--What kinds would we add to the array since the two types discussed here are added automatically?-->

## Entry components vs. regular components

Entry components are declared in NgModules, as opposed to referenced as selectors in other components.
When an app loads a component via its selector, it's loading it declaratively.
A component loaded declaratively via its selector is a regular component, _not_ an entry component.

Most application components are loaded declaratively.
Angular uses the component's selector to locate the element in the template.
It then creates the HTML representation of the component and inserts it into the DOM at the selected element.
These aren't entry components.

A few components are only loaded dynamically and are _never_ referenced in a component template.
<!--What are some examples?^^-->

<hr />

## More on Angular modules

You may also be interested in the following:
* [Types of NgModules](guide/module-types)
* [Lazy Loading Modules with the Angular Router](guide/lazy-loading-ngmodules).
* [Providers](guide/providers).
* [NgModules FAQ](guide/ngmodule-faq).

