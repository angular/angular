# Dependency injection in Angular

When you develop a smaller part of your system, like a module or a class, you may need to use features from other classes. For example, you may need an HTTP service to make backend calls. Dependency Injection, or DI, is a design pattern and mechanism for creating and delivering some parts of an application to other parts of an application that require them. Angular supports this design pattern and you can use it in your applications to increase flexibility and modularity. 

In Angular, dependencies are typically services, but they also can be values, such as strings or functions. An injector for an application (created automatically during bootstrap) instantiates dependencies when needed, using a configured provider of the service or value. 

<div class="alert is-helpful">

See the <live-example name="dependency-injection"></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

You should be familiar with the Angular apps in general, and have the fundamental knowledge of Components, Directives, and NgModules. It's highly recommended that you complete the following tutorial:

[Tour of Heroes application and tutorial](tutorial/tour-of-heroes)

## Learn about Angular dependency injection

<div class="card-container">
  <a href="guide/dependency-injection" class="docs-card" title="Understanding dependency injection">
    <section>Understanding dependency injection</section>
    <p>Learn basic principles of dependency injection in Angular.</p>
    <p class="card-footer">Understanding dependency injection</p>
  </a>
  <a href="guide/creating-injectable-service" class="docs-card" title="Creating and injecting service">
    <section>Creating and injecting service</section>
    <p>Describes how to create a service and inject it in other services and components.</p>
    <p class="card-footer">Creating an injectable service</p>
  </a>
  <a href="guide/dependency-injection-providers" class="docs-card" title="Configuring dependency providers">
    <section>Configuring dependency providers</section>
    <p>Describes how to configure dependencies using the providers field on the @Component and @NgModule decorators. Also describes how to use InjectionToken to provide and inject values in DI, which can be helpful when you want to use a value other than classes as dependencies.</p>
    <p class="card-footer">Configuring dependency providers</p>
  </a>
  <a href="guide/hierarchical-dependency-injection" class="docs-card" title="Hierarchical injectors">
    <section>Hierarchical injectors</section>
    <p>Hierarchical DI enables you to share dependencies between different parts of the application only when and if you need to. This is an advanced topic.</p>
    <p class="card-footer">Hierarchical injectors</p>
  </a>
</div>

@reviewed 2022-08-02
