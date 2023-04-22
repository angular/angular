# Understanding dependency injection

Dependency injection, or DI, is one of the fundamental concepts in Angular. DI is wired into the Angular framework and allows classes with Angular decorators, such as Components, Directives, Pipes, and Injectables, to configure dependencies that they need. 

Two main roles exist in the DI system: dependency consumer and dependency provider. 

Angular facilitates the interaction between dependency consumers and dependency providers using an abstraction called [Injector](guide/glossary#injector). When a dependency is requested, the injector checks its registry to see if there is an instance already available there. If not, a new instance is created and stored in the registry. Angular creates an application-wide injector (also known as "root" injector) during the application bootstrap process, as well as any other injectors as needed. In most cases you don't need to manually create injectors, but you should know that there is a layer that connects providers and consumers.

This topic covers basic scenarios of how a class can act as a dependency. Angular also allows you to use functions, objects, primitive types such as string or Boolean, or any other types as dependencies. For more information, see [Dependency providers](guide/dependency-injection-providers).

## Providing dependency

Imagine there is a class called HeroService that needs to act as a dependency in a component.

The first step is to add the @Injectable decorator to show that the class can be injected.

<code-example language="typescript">
@Injectable()
class HeroService {}
</code-example>

The next step is to make it available in the DI by providing it.  A dependency can be provided in multiple places:

* At the Component level, using the `providers` field of the `@Component` decorator. In this case the `HeroService` becomes available to all instances of this component and other components and directives used in the template. For example:

<code-example language="typescript">
@Component({
  selector: 'hero-list',
  template: '...',
  providers: [HeroService]
})
class HeroListComponent {}
</code-example>

When you register a provider at the component level, you get a new instance of the service with each new instance of that component.

* At the NgModule level, using the `providers` field of the `@NgModule` decorator. In this scenario, the `HeroService` is available to all components, directives, and pipes declared in this NgModule or other NgModule which is within same ModuleInjector applicable for this NgModule. When you register a provider with a specific NgModule, the same instance of a service is available to all applicable components, directives and pipes.
To understand all edge-cases, see [Hierarchical injectors](guide/hierarchical-dependency-injection). For example:


<code-example language="typescript">
@NgModule({
  declarations: [HeroListComponent]
  providers: [HeroService]
})
class HeroListModule {}
</code-example>

* At the application root level, which allows injecting it into other classes in the application. This can be done by adding the `providedIn: 'root'` field to the `@Injectable` decorator:

<code-example language="typescript">
@Injectable({
  providedIn: 'root'
})
class HeroService {}
</code-example>

When you provide the service at the root level, Angular creates a single, shared instance of the `HeroService` and injects it into any class that asks for it. Registering the provider in the `@Injectable` metadata also allows Angular to optimize an app by removing the service from the compiled application if it isn't used, a process known as tree-shaking.

## Injecting a dependency

The most common way to inject a dependency is to declare it in a class constructor. When Angular creates a new instance of a component, directive, or pipe class, it determines which services or other dependencies that class needs by looking at the constructor parameter types. For example, if the `HeroListComponent` needs the `HeroService`, the constructor can look like this:

<code-example language="typescript">
@Component({ … })
class HeroListComponent {
  constructor(private service: HeroService) {}
}
</code-example>

When Angular discovers that a component depends on a service, it first checks if the injector has any existing instances of that service. If a requested service instance doesn't yet exist, the injector creates one using the registered provider, and adds it to the injector before returning the service to Angular.

When all requested services have been resolved and returned, Angular can call the component's constructor with those services as arguments.

<div class="lightbox">
  <img src="generated/images/guide/architecture/injector-injects.png" alt="Service" class="left">
</div>

## What's next

* [Creating and injecting services](guide/creating-injectable-service)
* [Dependency Injection in Action](guide/dependency-injection-in-action)

@reviewed 2022-08-02
