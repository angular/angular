# Singleton services

A singleton service is a service for which only one instance exists in an application.

## Providing a singleton service

There are two ways to make a service a singleton in Angular:

* Set the `providedIn` property of the `@Injectable()` to `"root"`
* Include the service in the `AppModule` or in a module that is only imported by the `AppModule`

### Using `providedIn`

The preferred way to create a singleton service is to set `providedIn` to `root` on the service's `@Injectable()` decorator.
This tells Angular to provide the service in the application root.

<docs-code header="src/app/user.service.ts" highlight="[4]">
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class UserService {
}
</docs-code>

### NgModule `providers` array

In applications built with Angular versions prior to 6.0, services were commonly registered in the `@NgModule` `providers` field as followed:

<docs-code language="typescript">
@NgModule({
  // ...
  providers: [UserService],
})
</docs-code>

If this NgModule were the root `AppModule`, the `UserService` would be a singleton and available throughout the application.
Though you may see it coded this way, using the `providedIn` property of the `@Injectable()` decorator on the service itself is preferable as of Angular 6.0 as it makes your services tree-shakable.

## The `forRoot()` pattern

Generally, you'll only need `providedIn` for providing services and `forRoot()`/`forChild()` for routing.
However, understanding how `forRoot()` works to make sure a service is a singleton will inform your development at a deeper level.

If a module defines both providers and declarations (components, directives, pipes), then loading the module in multiple feature modules would duplicate the registration of the service.
This could result in multiple service instances and the service would no longer behave as a singleton.

There are multiple ways to prevent this:

* Use the [`providedIn` syntax](#using-providedin) instead of registering the service in the module.
* Separate your services into their own module that is imported once.
* Define `forRoot()` and `forChild()` methods in the module.

For an introductory explanation see the [Lazy Loading Feature Modules](guide/ngmodules/lazy-loading) guide.

Use `forRoot()` to separate providers from a module so you can import that module into the root module with `providers` and child modules without `providers`.

1. Create a static method `forRoot()` on the module.
1. Place the providers into the `forRoot()` method.

<docs-code header="src/app/greeting/greeting.module.ts" highlight="[3,6,7]" language="typescript">
@NgModule({...})
export class GreetingModule {
  static forRoot(config: UserServiceConfig): ModuleWithProviders<GreetingModule> {
    return {
      ngModule: GreetingModule,
      providers: [
        {provide: UserServiceConfig, useValue: config }
      ]
    };
  }
}
</docs-code>

### `forRoot()` and the `Router`

`RouterModule` provides the `Router` service, as well as router directives, such as `RouterOutlet` and `routerLink`.
The root application module imports `RouterModule` so that the application has a `Router` and the root application components can access the router directives.
Any feature modules must also import `RouterModule` so that their components can place router directives into their templates.

If the `RouterModule` didn't have `forRoot()` then each feature module would instantiate a new `Router` instance, which would break the application as there can only be one `Router`.
By using the `forRoot()` method, the root application module imports `RouterModule.forRoot(...)` and gets a `Router`, and all feature modules import `RouterModule.forChild(...)` which does not instantiate another `Router`.

HELPFUL: If you have a module which has both providers and declarations, you *can* use this technique to separate them out and you may see this pattern in legacy applications.
However, since Angular 6.0, the best practice for providing services is with the `@Injectable()` `providedIn` property.

### How `forRoot()` works

`forRoot()` takes a service configuration object and returns a [ModuleWithProviders](api/core/ModuleWithProviders), which is a simple object with the following properties:

| Properties  | Details |
|:---         |:---     |
| `ngModule`  | In this example, the `GreetingModule` class |
| `providers` | The configured providers                    |

Specifically, Angular accumulates all imported providers before appending the items listed in `@NgModule.providers`.
This sequence ensures that whatever you add explicitly to the `AppModule` providers takes precedence over the providers of imported modules.

The sample application imports `GreetingModule` and uses its `forRoot()` method one time, in `AppModule`.
Registering it once like this prevents multiple instances.

In the following example, the `UserServiceConfig` is optionally injected in the `UserService`.
If a config exists, the service sets the user name based on the retrieved config.

<docs-code header="src/app/greeting/user.service.ts (constructor)" language="typescript">
  constructor(@Optional() config?: UserServiceConfig) {
    if (config) {
      this._userName = config.userName;
    }
  }
</docs-code>

Here's `forRoot()` that takes a `UserServiceConfig` object:

<docs-code header="src/app/greeting/greeting.module.ts" highlight="[3,6,7]" language="typescript">
@NgModule({...})
export class GreetingModule {
  static forRoot(config: UserServiceConfig): ModuleWithProviders<GreetingModule> {
    return {
      ngModule: GreetingModule,
      providers: [
        {provide: UserServiceConfig, useValue: config }
      ]
    };
  }
}
</docs-code>

Lastly, call it within the `imports` list of the `AppModule`.
In the following snippet, other parts of the file are left out.

<docs-code header="src/app/app.module.ts (imports)" language="typescript">
import { GreetingModule } from './greeting/greeting.module';

@NgModule({
  // ...
  imports: [
    // ...
    GreetingModule.forRoot({userName: 'Miss Marple'}),
  ],
})
</docs-code>

The application will then display "Miss Marple" as the user.

Remember to import `GreetingModule` as a JavaScript import, and don't add usages of `forRoot` to more than one `@NgModule` `imports` list.

## Prevent reimport of the `GreetingModule`

Only the root `AppModule` should import the `GreetingModule`.
If a lazy-loaded module imports it too, the application can generate [multiple instances](guide/ngmodules/faq#why-is-it-bad-if-a-shared-module-provides-a-service-to-a-lazy-loaded-module?) of a service.

To guard against a lazy loaded module re-importing `GreetingModule`, add the following `GreetingModule` constructor.

<docs-code header="src/app/greeting/greeting.module.ts" language="typescript">
  constructor(@Optional() @SkipSelf() parentModule?: GreetingModule) {
    if (parentModule) {
      throw new Error(
        'GreetingModule is already loaded. Import it in the AppModule only');
    }
  }
</docs-code>

The constructor tells Angular to inject the `GreetingModule` into itself.
The injection would be circular if Angular looked for `GreetingModule` in the *current* injector, but the `@SkipSelf()` decorator means "look for `GreetingModule` in an ancestor injector, above me in the injector hierarchy".

By default, the injector throws an error when it can't find a requested provider.
The `@Optional()` decorator means not finding the service is OK.
The injector returns `null`, the `parentModule` parameter is null, and the constructor concludes uneventfully.

It's a different story if you improperly import `GreetingModule` into a lazy loaded module such as `CustomersModule`.

Angular creates a lazy loaded module with its own injector, a child of the root injector.
`@SkipSelf()` causes Angular to look for a `GreetingModule` in the parent injector, which this time is the root injector.
Of course it finds the instance imported by the root `AppModule`.
Now `parentModule` exists and the constructor throws the error.

## More on NgModules

<docs-pill-row>
  <docs-pill href="/guide/ngmodules/sharing" title="Sharing Modules"/>
  <docs-pill href="/guide/ngmodules/lazy-loading" title="Lazy Loading Modules"/>
  <docs-pill href="/guide/ngmodules/faq" title="NgModule FAQ"/>
</docs-pill-row>
