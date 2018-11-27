# Hierarchical Dependency Injectors

The Angular dependency injection system is _hierarchical_.
There is a tree of injectors that parallel an app's component tree.
You can reconfigure the injectors at any level of that component tree.

This guide explores this system and how to use it to your advantage.
It uses examples based on this <live-example></live-example>.

{@a ngmodule-vs-comp}
{@a where-to-register}

## Where to configure providers

You can configure providers for different injectors in the injector hierarchy.
An internal platform-level injector is shared by all running apps.
The `AppModule` injector is the root of an app-wide injector hierarchy, and within
an NgModule, directive-level injectors follow the structure of the component hierarchy.

The choices you make about where to configure providers lead to differences in the final bundle size, service _scope_, and service _lifetime_.

When you specify providers in the `@Injectable()` decorator of the service itself (typically at the app root level), optimization tools such as those used by the CLI's production builds can perform *tree shaking*, which removes services that aren't used by your app. Tree shaking results in smaller bundle sizes. 

* Learn more about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).

You're likely to inject `UserService` in many places throughout the app and will want to inject the same service instance every time. Providing `UserService` through the `root` injector is a good choice, and is the default that the [Angular CLI](cli) uses when you generate a service for your app.

<div class="alert is-helpful">
<header>Platform injector</header>

When you use `providedIn:'root'`, you are configuring the root injector for the _app_, which is the injector for `AppModule`.
The actual root of the entire injector hierarchy is a _platform injector_ that is the parent of app-root injectors. 
This allows multiple apps to share a platform configuration. For example, a browser has only one URL bar, no matter how many apps you have running.

The platform injector is used internally during bootstrap, to configure platform-specific dependencies. You can configure additional platform-specific providers at the platform level by supplying `extraProviders` using the `platformBrowser()` function. 

Learn more about dependency resolution through the injector hierarchy: 
[What you always wanted to know about Angular Dependency Injection tree](https://blog.angularindepth.com/angular-dependency-injection-and-tree-shakeable-tokens-4588a8f70d5d)


</div>

*NgModule-level* providers can be specified with `@NgModule()` `providers` metadata option, or in the `@Injectable()` `providedIn` option (with some module other than the root `AppModule`).

Use the `@NgModule()` `provides` option if a module is [lazy loaded](guide/lazy-loading-ngmodules). The module's own injector is configured with the provider when that module is loaded, and Angular can inject the corresponding services in any class it creates in that module. If you use the `@Injectable()` option `providedIn: MyLazyloadModule`, the provider could be shaken out at compile time, if it is not used anywhere else in the app. 

* Learn more about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).

For both root-level and module-level injectors, a service instance lives for the life of the app or module, and Angular injects this one service instance in every class that needs it.

*Component-level* providers configure each component instance's own injector. 
Angular can only inject the corresponding services in that component instance or one of its descendant component instances. 
Angular can't inject the same service instance anywhere else. 

A component-provided service may have a limited lifetime. 
Each new instance of the component gets its own instance of the service. 
When the component instance is destroyed, so is that service instance.

In our sample app, `HeroComponent` is created when the application starts 
and is never destroyed,
so the `HeroService` instance created for `HeroComponent` lives for the life of the app. 
If you want to restrict `HeroService` access to `HeroComponent` and its nested 
`HeroListComponent`, provide `HeroService` at the component level, in `HeroComponent` metadata.

* See more [examples of component-level injection](#component-injectors) below.


{@a register-providers-injectable}

### @Injectable-level configuration 

The `@Injectable()` decorator identifies every service class. The `providedIn` metadata option for a service class configures a specific injector (typically `root`)
to use the decorated class as a provider of the service. 
When an injectable class provides its own service to the `root` injector, the service is available anywhere the class is imported. 

The following example configures a provider for `HeroService` using the `@Injectable()` decorator on the class.

<code-example path="dependency-injection/src/app/heroes/hero.service.0.ts"  header="src/app/heroes/heroes.service.ts" linenums="false"> </code-example> 

This configuration tells Angular that the app's root injector is responsible for creating an 
instance of `HeroService` by invoking its constructor,
and for making that instance available across the application. 

Providing a service with the app's root injector is a typical case,
and the CLI sets up this kind of a provider automatically for you
when generating a new service. 
However, you might not always want to provide your service at the root level.
You might, for instance, want users to explicitly opt-in to using the service.

Instead of specifying the `root` injector, you can set `providedIn` to a specific NgModule. 

For example, in the following excerpt, the `@Injectable()` decorator configures a provider
that is available in any injector that includes the `HeroModule`.

<code-example path="dependency-injection/src/app/heroes/hero.service.4.ts"  header="src/app/heroes/hero.service.ts" linenums="false"> </code-example>

This is generally no different from configuring the injector of the NgModule itself,
except that the service is tree-shakable if the NgModule doesn't use it.
It can be useful for a library that offers a particular service that some
components *might* want to inject optionally,
and leave it up to the app whether to provide the service.

* Learn more about [tree-shakable providers](guide/dependency-injection-providers#tree-shakable-providers).


### @NgModule-level injectors

You can configure a provider at the module level using the `providedIn` metadata option for a non-root NgModule, in order to limit the scope of the provider to that module.
This is the equivalent of specifying the non-root module in the `@Injectable()` metadata, except that the service provided this way is not tree-shakable.

You generally don't need to specify `AppModule` with `providedIn`, because the app's `root` injector is the `AppModule` injector. 
However, if you configure a app-wide provider in the`@NgModule()` metadata for `AppModule`,
it overrides one configured for `root` in the `@Injectable()` metadata. 
You can do this to configure a non-default provider of a service that is shared with multiple apps. 

Here is an example of the case where the component router configuration includes
a non-default [location strategy](guide/router#location-strategy) by listing its provider
in the `providers` list of the `AppModule`.

<code-example path="dependency-injection-in-action/src/app/app.module.ts" region="providers" header="src/app/app.module.ts (providers)" linenums="false">

</code-example>


{@a register-providers-component}

### @Component-level injectors

Individual components within an NgModule have their own injectors.
You can limit the scope of a provider to a component and its children
by configuring the provider at the component level using the `@Component` metadata.

The following example is a revised `HeroesComponent` that specifies `HeroService` in its `providers` array. `HeroService` can provide heroes to instances of this component, or to any child component instances. 

<code-example path="dependency-injection/src/app/heroes/heroes.component.1.ts" header="src/app/heroes/heroes.component.ts" linenums="false">
</code-example>

### Element injectors

An injector does not actually belong to a component, but rather to the component instance's anchor element in the DOM. A different component instance on a different DOM element uses a different injector.

Components are a special type of directive, and the `providers` property of
`@Component()` is inherited from `@Directive()`. 
Directives can also have dependencies, and you can configure providers
in their `@Directive()` metadata. 
When you configure a provider for a component or directive using the `providers` property, that provider belongs to the injector for the anchor DOM element. Components and directives on the same element share an injector.

<!--- TBD with examples
* For an example of how this works, see [Element-level providers](guide/dependency-injection-in-action#directive-level-providers).
--->

* Learn more about [Element Injectors in Angular](https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a).



## Injector bubbling

Consider this guide's variation on the Tour of Heroes application.
At the top is the `AppComponent` which has some subcomponents, such as the `HeroesListComponent`.
The `HeroesListComponent` holds and manages multiple instances of the `HeroTaxReturnComponent`.
The following diagram represents the state of this three-level component tree when there are three instances of `HeroTaxReturnComponent` open simultaneously.

<figure>
  <img src="generated/images/guide/dependency-injection/component-hierarchy.png" alt="injector tree">
</figure>

When a component requests a dependency, Angular tries to satisfy that dependency with a provider registered in that component's own injector.
If the component's injector lacks the provider, it passes the request up to its parent component's injector.
If that injector can't satisfy the request, it passes the request along to the next parent injector up the tree.
The requests keep bubbling up until Angular finds an injector that can handle the request or runs out of ancestor injectors.
If it runs out of ancestors, Angular throws an error. 

If you have registered a provider for the same DI token at different levels, the first one Angular encounters is the one it uses to provide the dependency. If, for example, a provider is registered locally in the component that needs a service, Angular doesn't look for another provider of the same service.  


<div class="alert is-helpful">

You can cap the bubbling by adding the `@Host()` parameter decorator on the dependant-service parameter
in a component's constructor. 
The hunt for providers stops at the injector for the host element of the component. 

* See an [example](guide/dependency-injection-in-action#qualify-dependency-lookup) of using `@Host` together with `@Optional`, another parameter decorator that lets you handle the null case if no provider is found.

* Learn more about the [`@Host` decorator and Element Injectors](https://blog.angularindepth.com/a-curios-case-of-the-host-decorator-and-element-injectors-in-angular-582562abcf0a).

</div>

If you only register providers with the root injector at the top level (typically the root `AppModule`), the tree of injectors appears to be flat.
All requests bubble up to the root injector, whether you configured it with the `bootstrapModule` method, or registered all providers with `root` in their own services.

{@a component-injectors}

## Component injectors

The ability to configure one or more providers at different levels opens up interesting and useful possibilities.
The guide sample offers some scenarios where you might want to do so.

### Scenario: service isolation

Architectural reasons may lead you to restrict access to a service to the application domain where it belongs. 
For example, the guide sample includes a `VillainsListComponent` that displays a list of villains.
It gets those villains from a `VillainsService`.

If you provide `VillainsService` in the root `AppModule` (where you registered the `HeroesService`),
that would make the `VillainsService` available everywhere in the application, including the _Hero_ workflows. If you later modified the `VillainsService`, you could break something in a hero component somewhere. Providing the service in the root `AppModule` creates that risk.

Instead, you can provide the `VillainsService` in the `providers` metadata of the `VillainsListComponent` like this:


<code-example path="hierarchical-dependency-injection/src/app/villains-list.component.ts" linenums="false" header="src/app/villains-list.component.ts (metadata)" region="metadata">

</code-example>

By providing `VillainsService` in the `VillainsListComponent` metadata and nowhere else,
the service becomes available only in the `VillainsListComponent` and its sub-component tree.
It's still a singleton, but it's a singleton that exist solely in the _villain_ domain.

Now you know that a hero component can't access it. You've reduced your exposure to error.

### Scenario: multiple edit sessions

Many applications allow users to work on several open tasks at the same time.
For example, in a tax preparation application, the preparer could be working on several tax returns,
switching from one to the other throughout the day.

This guide demonstrates that scenario with an example in the Tour of Heroes theme.
Imagine an outer `HeroListComponent` that displays a list of super heroes.

To open a hero's tax return, the preparer clicks on a hero name, which opens a component for editing that return.
Each selected hero tax return opens in its own component and multiple returns can be open at the same time.

Each tax return component has the following characteristics:

* Is its own tax return editing session.
* Can change a tax return without affecting a return in another component.
* Has the ability to save the changes to its tax return or cancel them.


<figure>
  <img src="generated/images/guide/dependency-injection/hid-heroes-anim.gif" alt="Heroes in action">
</figure>

Suppose that the `HeroTaxReturnComponent` has logic to manage and restore changes.
That would be a pretty easy task for a simple hero tax return.
In the real world, with a rich tax return data model, the change management would be tricky.
You could delegate that management to a helper service, as this example does.

Here is the `HeroTaxReturnService`.
It caches a single `HeroTaxReturn`, tracks changes to that return, and can save or restore it.
It also delegates to the application-wide singleton `HeroService`, which it gets by injection.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.service.ts" header="src/app/hero-tax-return.service.ts">

</code-example>

Here is the `HeroTaxReturnComponent` that makes use of it.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" header="src/app/hero-tax-return.component.ts">

</code-example>


The _tax-return-to-edit_ arrives via the input property which is implemented with getters and setters.
The setter initializes the component's own instance of the `HeroTaxReturnService` with the incoming return.
The getter always returns what that service says is the current state of the hero.
The component also asks the service to save and restore this tax return.

This won't work if the service is an application-wide singleton.
Every component would share the same service instance, and each component would overwrite the tax return that belonged to another hero.

To prevent this, we configure the component-level injector of `HeroTaxReturnComponent` to provide the service, using the  `providers` property in the component metadata.


<code-example path="hierarchical-dependency-injection/src/app/hero-tax-return.component.ts" linenums="false" header="src/app/hero-tax-return.component.ts (providers)" region="providers">

</code-example>

The `HeroTaxReturnComponent` has its own provider of the `HeroTaxReturnService`.
Recall that every component _instance_ has its own injector.
Providing the service at the component level ensures that _every_ instance of the component gets its own, private instance of the service, and no tax return gets overwritten.


<div class="alert is-helpful">


The rest of the scenario code relies on other Angular features and techniques that you can learn about elsewhere in the documentation.
You can review it and download it from the <live-example></live-example>.


</div>



### Scenario: specialized providers

Another reason to re-provide a service at another level is to substitute a _more specialized_ implementation of that service, deeper in the component tree.

Consider a Car component that depends on several services.
Suppose you configured the root injector (marked as A) with _generic_ providers for
`CarService`, `EngineService` and `TiresService`.

You create a car component (A) that displays a car constructed from these three generic services.

Then you create a child component (B) that defines its own, _specialized_ providers for `CarService` and `EngineService`
that have special capabilities suitable for whatever is going on in component (B).

Component (B) is the parent of another component (C) that defines its own, even _more specialized_ provider for `CarService`.


<figure>
  <img src="generated/images/guide/dependency-injection/car-components.png" alt="car components">
</figure>

Behind the scenes, each component sets up its own injector with zero, one, or more providers defined for that component itself.

When you resolve an instance of `Car` at the deepest component (C),
its injector produces an instance of `Car` resolved by injector (C) with an `Engine` resolved by injector (B) and
`Tires` resolved by the root injector (A).


<figure>
  <img src="generated/images/guide/dependency-injection/injector-tree.png" alt="car injector tree">
</figure>



<div class="alert is-helpful">


The code for this _cars_ scenario is in the `car.components.ts` and `car.services.ts` files of the sample
which you can review and download from the <live-example></live-example>.

</div>
