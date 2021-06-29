# What is Angular?

This topic can help you understand Angular: what Angular is, what advantages it provides, and what you might expect as you start to build your applications.

Angular is a development platform, built on [TypeScript](https://www.typescriptlang.org/). As a platform, Angular includes:

* A component-based framework for building scalable web applications
* A collection of well-integrated libraries that cover a wide variety of features, including routing, forms management, client-server communication, and more
* A suite of developer tools to help you develop, build, test, and update your code

With Angular, you're taking advantage of a platform that can scale from single-developer projects to enterprise-level applications. Angular is designed to make updating as straightforward as possible, so take advantage of the latest developments with a minimum of effort. Best of all, the Angular ecosystem consists of a diverse group of over 1.7 million developers, library authors, and content creators.

<div class="alert is-helpful">

See the <live-example name="what-is-angular"></live-example> for a working example containing the code snippets in this guide.

</div>

{@a essentials}
## Angular applications: The essentials

This section explains the core ideas behind Angular. Understanding these ideas can help you design and build your applications more effectively.

{@a components}
### Components

Components are the building blocks that compose an application. A component includes a TypeScript class with a `@Component()` decorator, an HTML template, and styles. The `@Component()` decorator specifies the following Angular-specific information:

* A CSS selector that defines how the component is used in a template. HTML elements in your template that match this selector become instances of the component.
* An HTML template that instructs Angular how to render the component.
* An optional set of CSS styles that define the appearance of the template's HTML elements.

The following is a minimal Angular component.

<code-example
  path="what-is-angular/src/app/hello-world/hello-world.component.ts"></code-example>

To use this component, you write the following in a template:

<code-example path="what-is-angular/src/app/app.component.html" region="hello-world-selector"></code-example>

When Angular renders this component, the resulting DOM looks like this:

<code-example path="what-is-angular/src/app/hello-world-example.html" language="html"></code-example>

Angular's component model offers strong encapsulation and an intuitive application structure. Components also make your application painless to unit test and can improve the overall readability of your code.

For more information on what to do with components, see the [Components](guide/component-overview) section.

{@a templates}
### Templates

Every component has an HTML template that declares how that component renders. You define this template either inline or by file path.

Angular extends HTML with additional syntax that lets you insert dynamic values from your component. Angular automatically updates the rendered DOM when your component’s state changes. One application of this feature is inserting dynamic text, as shown in the following example.

<code-example path="what-is-angular/src/app/hello-world-interpolation/hello-world-interpolation.component.html" region="say-hello"></code-example>

The value for message comes from the component class:

<code-example path="what-is-angular/src/app/hello-world-interpolation/hello-world-interpolation.component.ts"></code-example>

When the application loads the component and its template, the user sees the following:

<code-example language="html">
&lt;p&gt;Hello, World!&lt;/p&gt;
</code-example>

Notice the use of double curly braces--they instruct Angular to interpolate the contents within them.

Angular also supports property bindings, to help you set values for properties and attributes of HTML elements and pass values to your application's presentation logic.

<code-example path="what-is-angular/src/app/hello-world-bindings/hello-world-bindings.component.html" region="bindings"></code-example>

Notice the use of the square brackets--that syntax indicates that you're binding the property or attribute to a value in the component class.

Declare event listeners to listen for and respond to user actions such as keystrokes, mouse movements, clicks, and touches. You declare an event listener by specifying the event name in parentheses:

<code-example path="what-is-angular/src/app/hello-world-bindings/hello-world-bindings.component.html" region="event-binding"></code-example>

The preceding example calls a method, which is defined in the component class:

<code-example path="what-is-angular/src/app/hello-world-bindings/hello-world-bindings.component.ts" region="method"></code-example>

The following is a combined example of Interpolation, Property Binding and Event Binding within an Angular template:

<code-tabs linenums="true">
  <code-pane
    header="hello-world-bindings.component.ts"
    path="what-is-angular/src/app/hello-world-bindings/hello-world-bindings.component.ts">
  </code-pane>
  <code-pane
    header="hello-world-bindings.component.html"
    path="what-is-angular/src/app/hello-world-bindings/hello-world-bindings.component.html"
    linenums="false">
  </code-pane>
</code-tabs>

Add additional functionality to your templates through the use of [directives](guide/built-in-directives). The most popular directives in Angular are `*ngIf` and `*ngFor`. Use directives to perform a variety of tasks, such as dynamically modifying the DOM structure. And create your own custom directives to create great user experiences.

The following code is an example of the `*ngIf` directive.

<code-tabs linenums="true">
  <code-pane
    header="hello-world-ngif.component.ts"
    path="what-is-angular/src/app/hello-world-ngif/hello-world-ngif.component.ts">
  </code-pane>
  <code-pane
    header="hello-world-ngif.component.html"
    path="what-is-angular/src/app/hello-world-ngif/hello-world-ngif.component.html"
    linenums="false">
  </code-pane>
</code-tabs>

Angular's declarative templates let you cleanly separate your application's logic from its presentation. Templates are based on standard HTML, for ease in building, maintaining, and updating.

For more information on templates, see the [Templates](guide/template-syntax) section.

{@a di}
### Dependency injection

Dependency injection lets you declare the dependencies of your TypeScript classes without taking care of their instantiation. Instead, Angular handles the instantiation for you. This design pattern lets you write more testable and flexible code. Even though understanding dependency injection is not critical to start using Angular, we strongly recommend it as a best practice and many aspects of Angular take advantage of it to some degree.

To illustrate how dependency injection works, consider the following example. The first file, `logger.service.ts`, defines a `Logger` class. This class contains a `writeCount` function that logs a number to the console.

<code-example path="what-is-angular/src/app/logger.service.ts"></code-example>

Next, the `hello-world-di.component.ts` file defines an Angular component. This component contains a button that uses the `writeCount` function of the Logger class. To access that function, the `Logger` service is injected into the `HelloWorldDI` class by adding `private logger: Logger` to the constructor.

<code-example path="what-is-angular/src/app/hello-world-di/hello-world-di.component.ts"></code-example>

For more information about dependency injection and Angular, see the [Dependency injection in Angular](guide/dependency-injection) section.

{@a cli}

## Angular CLI

The Angular CLI is the fastest, straightforward, and recommended way to develop Angular applications. The Angular CLI makes a number of tasks trouble-free. Here are some examples:

<table>
<tr>
<td><a href="cli/build">ng build</a></td>
<td>Compiles an Angular app into an output directory.</td>
</tr>
<tr>
<td><a href="cli/serve">ng serve</a></td>
<td>Builds and serves your application, rebuilding on file changes.</td>
</tr>
<tr>
<td><a href="cli/generate">ng generate</a></td>
<td>Generates or modifies files based on a schematic.</td>
</tr>
<tr>
<td><a href="cli/test">ng test</a></td>
<td>Runs unit tests on a given project.</td>
</tr>
<tr>
<td><a href="cli/e2e">ng e2e</a></td>
<td>Builds and serves an Angular application, then runs end-to-end tests.</td>
</tr>
</table>

You'll find the Angular CLI a valuable tool for building out your applications.

For more information about the Angular CLI, see the [CLI Reference](/cli) section.

{@a 1p-libraries}
## First-party libraries

The section, [Angular applications: The essentials](#essentials), provides a brief overview of a couple of the key architectural elements you'll use when building Angular applications. But the many benefits of Angular really become apparent when your application grows and you want to add additional functions such as site navigation or user input. Use the Angular platform to incorporate one of the many first-party libraries that Angular provides.

Some of the libraries available to you include:
<table>
<tr>
<td><a href="guide/router">Angular Router</a></td>
<td>Advanced client-side navigation and routing based on Angular components. Supports lazy-loading, nested routes, custom path matching, and more.</td>
</tr>
<tr>
<td><a href="guide/forms-overview">Angular Forms</td>
<td>Uniform system for form participation and validation.</td>
<tr>
<td><a href="guide/http">Angular HttpClient</a></td>
<td>Robust HTTP client that can power more advanced client-server communication.</td>
</tr>
<tr>
<td><a href="guide/animations">Angular Animations</a></td>
<td>Rich system for driving animations based on application state.</td>
</tr>
<tr>
<td><a href="guide/service-worker-intro">Angular PWA</a>
<td>Tools for building Progressive Web Applications (PWAs) including a service worker and Web app manifest.</td>
</tr>
<tr>
<td><a href="guide/schematics">Angular Schematics</td>
<td>Automated scaffolding, refactoring, and update tools that simplify development at large scale.</td>
</tr>
</table>

These libraries expand your application's functionality while also letting you focus more on the features that make your application unique. Add these libraries knowing that they're designed to integrate seamlessly into and update simultaneously with the Angular framework.

These libraries are only required if and when they can help you add functionality to your applications or solve a particular problem.

## Next steps

This topic is intended to give you a brief overview of what Angular is, the advantages it provides, and what to expect as you start to build your applications.

To see Angular in action, see our [Getting Started](https://angular.io/start) tutorial. This tutorial uses [stackblitz.com](https://stackblitz.com/), for you to explore a working example of Angular without any installation requirements.

To explore Angular's capabilities further, we recommend reading through the sections, Understanding Angular and Developer Guides.

@reviewed 2021-03-08
