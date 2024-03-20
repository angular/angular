# Injection context

The dependency injection (DI) system relies internally on a runtime context where the current injector is available. 
This means that injectors can only work when code is executed in this context. 

The injection context is available in these situations: 

* Construction (via the `constructor`) of a class being instantiated by the DI system, such as an `@Injectable` or `@Component`.
* In the initializer for fields of such classes.
* In the factory function specified for `useFactory` of a `Provider` or an `@Injectable`.
* In the `factory` function specified for an `InjectionToken`.
* Within a stack frame that is run in an injection context.

Knowing when your are in an injection context, will allow you to use the [`inject`](api/core/inject) function to inject instances.

## Class constructors

Everytime the DI system instantiates a class, this is done in an injection context. This is being handled by the framework itself. The constructor of the class is executed in that runtime context thus allowing to inject a token using the [`inject`](api/core/inject) function. 

<code-example language="typescript">
class MyComponent  {
  private service1: Service1;
  private service2: Service2 = inject(Service2); // In context

  constructor() {
    this.service1 = inject(HeroService) // In context
  }
}
</code-example>

## Stack frame in context

Some APIs are designed to be run in an injection context. This is the case, for example, of the router guards. It allows the use of [`inject`](api/core/inject) to access a service within the guard function. 

Here is an example for `CanActivateFn`
<code-example format="typescript" language="typescript">
const canActivateTeam: CanActivateFn =
    (route: ActivatedRouteSnapshot, state: RouterStateSnapshot) => {
      return inject(PermissionsService).canActivate(inject(UserToken), route.params.id);
    };
</code-example>

## Run within an injection context

When you want to run a given function in an injection context without being in one, you can do it with `runInInjectionContext`. 
This requires to have access to a given injector like the `EnvironmentInjector` for example.  

<code-example path="dependency-injection/src/app/heroes/hero.service.5.ts" region="run-in-context" header="src/app/heroes/hero.service.ts">
</code-example>

Note that `inject` will return an instance only if the injector can resolve the required token. 

## Asserts the context 

Angular provides `assertInInjectionContext` helper function to assert that the current context is an injection context.

## Using DI outside of a context

Calling [`inject`](api/core/inject) or calling `assertInInjectionContext` outside of an injection context will throw [error NG0203](/errors/NG0203).



@reviewed 2023-04-11
