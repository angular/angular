# Dependency injection in Angular

When you are developing a smaller part of your system, like a module or a class, you may need external dependencies. For example, you may need an HTTP service to make backend calls. Dependencies are services or objects that a class needs to perform its function. Dependency injection, or DI, is a design pattern in which a class requests dependencies from external sources rather than creating them. Angular's DI framework provides dependencies to a class upon instantiation. You can use Angular DI to increase flexibility and modularity in your applications. 

Most of the times, dependency injection just works without much configuration. Other times, you need to configure it manually.

You need in-depth knowledge of dependency injection in these circumstances:

* to troubleshoot dependency injection error
* to configure the dependencies for a unit test
* to understand the unusual dependency injection configuration of third-party module
* to create a third-party module that is to be shipped and used in multiple applications
* to design your application in a more modular way
* to ensure that different parts of your application are well isolated and do not interfere with each other


<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

Before creating dependency injection, you should be familiar with the following:

[Tour of Heroes app and tutorial](tutorial)

## Learn about Angular Dependency Injection

<div class="card-container">
  <a href="guide/dependency-injection" class="docs-card" title="Understanding Dependency Injection">
    <section>Understanding Dependency Injection</section>
    <p>Learn how dependency injection works in Angular.</p>
    <p class="card-footer">Introduction to Dependency Injection</p>
  </a>
  <a href="guide/creating-injectable-service" class="docs-card" title="Creating an injectable service">
    <section>Creating an injectable service</section>
    <p>Describes how to create an injectable service.</p>
    <p class="card-footer">Creating an injectable service</p>
  </a>
  <a href="guide/inject-service-in-component" class="docs-card" title="Injecting services">
    <section>Injecting services</section>
    <p>Describes how to inject services in components.</p>
    <p class="card-footer">injecting services</p>
  </a>
  <a href="guide/inject-service-in-service" class="docs-card" title="Injecting services in other services">
    <section>Injecting services in other services</section>
    <p>Describes how to inject services in other services.</p>
    <p class="card-footer">Injecting services in other services</p>
  </a>
  <a href="guide/dependency-injection-providers"" class="docs-card" title="Defining Dependency providers">
    <section>Defining Dependency providers</section>
    <p>By configuring providers, you can make services available to the parts of your application that need them.</p>
    <p class="card-footer">Defining Dependency providers</p>
  </a>
  <a href="guide/inject-object" class="docs-card" title="Injecting an object">
    <section>Injecting an object</section>
    <p>Describes how to inject an object.</p>
    <p class="card-footer">Injecting an object</p>
  </a>
  <a href="guide/hierarchical-dependency-injection" class="docs-card" title="Hierarchical injectors">
    <section>Hierarchical injectors</section>
    <p>DHierarchical dependency injection enables you to share dependencies between different parts of the application only when and if you need to.</p>
    <p class="card-footer">Hierarchical injectors</p>
  </a>
</div>