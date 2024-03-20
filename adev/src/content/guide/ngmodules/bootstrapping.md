# Launching your app with a root module

An NgModule describes how the application parts fit together.
Every application has at least one Angular module, the *root* module, which must be present for bootstrapping the application on launch.
By convention and by default, this NgModule is named `AppModule`.

When you use the [Angular CLI](/tools/cli) `ng new` command to generate an app, the default `AppModule` looks like the following:

<docs-code language="typescript">
import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }

</docs-code>

The `@NgModule` decorator identifies `AppModule` as an `NgModule` class.
`@NgModule` takes a metadata object that tells Angular how to compile and launch the application.

| Metadata field    | Details |
|:---               |:---     |
| `declarations`    | Includes the *root* application component.                                                                        |
| `imports`         | Imports `BrowserModule` to enable browser-specific services (such as DOM rendering, sanitization)                 |
| `providers`       | The service providers.                                                                                            |
| `bootstrap`       | The *root* component that Angular creates and inserts into the `index.html` host web page.                        |

## The `declarations` array

The module's `declarations` array tells Angular which components belong to that module.
As you create more components, add them to `declarations`.

The `declarations` array only takes declarables.
Declarables are [components](/guide/components), [directives](/guide/directives), and [pipes](/guide/pipes).
All of a module's declarables must be in the `declarations` array.
Declarables must belong to exactly one module.
The compiler returns an error if declare the same class in multiple modules.

These declared classes are usable within the module but private to components in a different module, unless they are exported from this module and the other module imports this one.

An example of what goes into a declarations array follows:

<docs-code language="typescript">

declarations: [
  YourComponent,
  YourPipe,
  YourDirective
],

</docs-code>

### Using directives with `@NgModule`

Use the `declarations` array for directives.
To use a directive, component, or pipe in a module, you must do a few things:

1. Export it from the TypeScript file where you wrote it
2. Import it into the appropriate file containing the `@NgModule` class.
3. Declare it in the `@NgModule` `declarations` array.

Those three steps look like the following. In the file where you create your directive, export it.
The following example shows an empty directive named `ItemDirective`.

<docs-code header="src/app/item.directive.ts" highlight="[6]">
import { Directive } from '@angular/core';

@Directive({
  selector: '[appItem]'
})
export class ItemDirective {
  // your code here
}
</docs-code>

The key point here is that you have to export it, so that you can import it elsewhere.
Next, import it into the file in which your `NgModule` lives. In this example, this is the `app.module.ts` file.

<docs-code header="src/app/app.module.ts">
import { ItemDirective } from './item.directive';
</docs-code>

And in the same file, add it to the `@NgModule` `declarations` array:

<docs-code header="src/app/app.module.ts" highlight="[3]">
  declarations: [
    AppComponent,
    ItemDirective
  ],
</docs-code>

Now you can use `ItemDirective` in a component.
This example uses `AppModule`, but you would follow the same steps for a feature module.
For more about directives, see [Attribute Directives](/guide/directives/attribute-directives) and [Structural Directives](/guide/directives/structural-directives).
You'd also use the same technique for [pipes](/guide/pipes) and [components](/guide/components).

Remember, components, directives, and pipes belong to one module only.
You only need to declare them once in your application because you share them by importing the necessary modules.
This saves you time and helps keep your application lean.

## The `imports` array

Modules accept an `imports` array in the `@NgModule` metadata object.
It tells Angular about other NgModules that this particular module needs to function properly.

<docs-code header="src/app/app.module.ts">
  imports: [
    BrowserModule,
    FormsModule,
    HttpClientModule
  ],
</docs-code>

This list of modules are those that export components, directives, or pipes that component templates in this module reference.
In this case, the component is `AppComponent`, which references components, directives, or pipes in `BrowserModule`, `FormsModule`, or  `HttpClientModule`.
A component template can reference another component, directive, or pipe when the referenced class is declared in this module, or the class was imported from another module.

## The `providers` array

The providers array is where you list the services the application needs.
When you list services here, they are available app-wide.
You can scope them when using feature modules and lazy loading.
For more information, see [Providers in modules](/guide/ngmodules/providers).

## The `bootstrap` array

The application launches by bootstrapping the root `AppModule`.
The bootstrapping process creates the component(s) listed in the `bootstrap` array and inserts each one into the browser DOM, if it finds an element matching the component's `selector`.

Each bootstrapped component is the base of its own tree of components.
Inserting a bootstrapped component usually triggers a cascade of component creations that builds up that tree.
While you can put more than one component tree on a host web page, most applications have only one component tree and bootstrap a single root component.

The root component is commonly called `AppComponent` and is in the root module's `bootstrap` array.

In a situation where you want to bootstrap a component based on an API response,
or you want to mount the `AppComponent` in a different DOM node that doesn't match the component selector, please refer to `ApplicationRef.bootstrap()` documentation.

## More about Angular Modules

See [Frequently Used Modules](guide/ngmodules/frequent) to learn more about modules you will commonly see in applications.
