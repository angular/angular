# Dependency injection in Angular

When you develop a smaller part of your system, like a module or a class, you may need external dependencies. For example, you may need an HTTP service to make backend calls. Dependency Injection, or DI, is a design pattern in which a class declares which dependencies it has, using constructor arguments, and the framework that provides those dependencies while instantiating that class. Angular supports this design pattern and you can use it in your applications to increase flexibility and modularity. 

You need in-depth knowledge of DI in these circumstances:

* to configure the dependencies for a unit test
* to understand the unusual DI configuration of third-party module
* to create a third-party module that is to be shipped and used in multiple applications
* to design your application in a more modular way
* to ensure that different parts of your application are well isolated and do not interfere with each other


<div class="alert is-helpful">

See the <live-example></live-example> for a working example containing the code snippets in this guide.

</div>

## Prerequisites

Before creating DI, you should be familiar with the following:

[Tour of Heroes app and tutorial](tutorial)

## Learn about Angular Dependency Injection

<div class="card-container">
  <a href="guide/dependency-injection" class="docs-card" title="Understanding Dependency Injection">
    <section>Understanding Dependency Injection</section>
    <p>Learn how DI works in Angular.</p>
    <p class="card-footer">Introduction to DI</p>
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
    <p>Hierarchical DI enables you to share dependencies between different parts of the application only when and if you need to.</p>
    <p class="card-footer">Hierarchical injectors</p>
  </a>
</div>