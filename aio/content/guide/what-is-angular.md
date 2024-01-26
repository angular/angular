# What is Angular?

Angular is a development platform, built on [TypeScript](https://www.typescriptlang.org).

As a platform, Angular includes:

- A component-based framework for building scalable web applications
- A collection of well-integrated libraries that cover a wide variety of features, including routing, forms management, client-server communication, and more
- A suite of developer tools to help you develop, build, test, and update your code

With Angular, you're taking advantage of a platform that can scale from single-developer projects to enterprise-level applications. Best of all, the Angular ecosystem consists of a diverse group of over 1.7 million developers, library authors, and content creators.

<a id="essentials"></a>

## Prerequisites

Like most modern frameworks, Angular expects you to be familiar with HTML, CSS and JavaScript. In addition, it’s recommended to have familiarity with the following concepts and tools:

<a id="concepts"></a>

### Concepts

- [JavaScript Classes](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes)
- [TypeScript fundamentals](https://www.typescriptlang.org/docs/handbook/typescript-in-5-minutes.html)
- [TypeScript Decorators](https://www.typescriptlang.org/docs/handbook/decorators.html)

<a id="tools"></a>

### Tools

- **TypeScript** - This is shipped by default with every Angular app to provide improved tooling and enhanced maintainability for a better developer experience.
- **Command Line Interface (CLI)** - Angular uses a compiler in order to abstract tooling complexity and optimize your code so you can focus on building your app.

<a id="components"></a>

## Components

Components are the fundamental building block for creating applications in Angular. By leveraging component architecture, Angular aims to provide structure for organizing your project into manageable, well organized parts with clear responsibilities so that your code is maintainable and scalable.

An Angular component can be identified by the `component` suffix (e.g., `my-custom-name.component.ts` and has the following:

- A decorator to define configuration options for things like:
  - A selector that defines what the tag name is when referring a component in a template
  - An HTML template that controls what is rendered to the browser
- A TypeScript class that defines the behavior of the component. Examples include handling user input, managing state, defining methods, etc.

Here is a simplified example of a TodoListItem component.

```ts
// 📄 todo-list-item.component.ts
@Component({
  standalone: true,
  selector: 'todo-list-item',
  template: ` <li>(TODO) Read cup of coffee introduction</li> `,
  styles: ['li { color: papayawhip; }'],
})
export class TodoListItem {
  /* Component behavior is defined in here */
}
```

<a id="behavior"></a>

### Behavior

Now that we have the basic structure for the component, let’s learn more about how you define the component’s behavior.

#### State

When defining data that you want the component to manage, this can be accomplished by declaring it by defining [class fields](https://www.typescriptlang.org/docs/handbook/2/classes.html#fields).

In the example of a `todo-list-item.component.ts`, there are two properties we want to track: `taskTitle` and `isComplete`. Using the [class field syntax](https://www.typescriptlang.org/docs/handbook/2/classes.html#fields), they can be defined as follows:

```ts
// 📄 todo-list-item.component.ts
@Component({ ... })
export class TodoList {
  taskTitle = '';
  isComplete = false;
}
```

#### Methods

You can define functions for a component by declaring methods within the component class.

```ts
// 📄 todo-list-item.component.ts
@Component({ ... })
export class TodoList {
  taskTitle = '';
  isComplete = false;

  updateTitle(newTitle: string) {
    this.taskTitle = newTitle;
  }

  completeTask() {
    this.isComplete = true;
  }
}
```

<a id="templates"></a>

### Templates

Every component has an HTML template that defines what that component renders to the DOM.

HTML templates can be defined as an inline template within the TypeScript class, or in separate files with the `templateUrl` property. To learn more, check out [the docs on defining component templates](guide/component-overview#defining-a-components-template).

Within this document, the examples will use inline templates for more concise code snippets.

#### Rendering Dynamic Data

When you need to display dynamic content in your template, Angular uses the double curly brace syntax in order to distinguish between static and dynamic content.

```ts
@Component({
  template: ` <p>Title: {{ taskTitle }}</p> `,
})
export class TodoListItem {
  taskTitle = 'Read cup of coffee';
}
```

This is how it renders to the page.

```html
<p>Title: Read cup of coffee</p>
```

This syntax declares an **interpolation** between the dynamic data property inside of the HTML. As a result, whenever the data changes, Angular will automatically update the DOM reflecting the new value of the property.

#### Dynamic Properties and Attributes

When you need to dynamically set the value of attributes in an HTML element, the target property is wrapped in square brackets. This binds the attribute with the desired dynamic data by informing Angular that the declared value should be interpreted as a JavaScript-like statement ([with some Angular enhancements](guide/understanding-template-expr-overview)) instead of a plain string.

```html
<button [disabled]="hasPendingChanges"></button>
```

In this example, the disabled property is tied to the `hasPendingChanges` variable that Angular would expect to find within the component’s state.

#### Event Handling

You can bind event listeners by specifying the event name in parenthesis and invoking a method on the right-hand-side of the equals sign:

```html
<button (click)="saveChanges()">Save Changes</button>
```

If you need to pass the event object to your event listener, Angular provides an implicit `$event` variable that can be used inside the function call:

```html
<button (click)="saveChanges($event)">Save Changes</button>
```

<a id="styles"></a>

### Styles

When you need to style a component, there are two optional properties that you can configure inside of the `@Component` decorator.

Similar to component templates, you can manage a component's styles in the same file as the TypeScript class, or in separate files with the `styleUrls` properties.

Components can optionally include a list of CSS styles that apply to that component's DOM:

```ts
@Component({
  selector: 'profile-pic',
  template: `<img src="profile-photo.jpg" alt="Your profile photo" />`,
  styles: [
    `
      img {
        border-radius: 50%;
      }
    `,
  ],
})
export class ProfilePic {
  /* Your code goes here */
}
```

By default, a component's style will only apply to elements in that component's template in order to limit the side effects.

To learn more, check out [the docs on component styling](guide/component-styles).

<a id="directives"></a>

## Directives

When building applications, developers often need to extend on the behavior of an HTML element or Angular directives/components. Examples of this include: displaying content based on a certain condition, rendering a list of items based on application data, changing the styles on an element based on user interaction, etc.

To solve this problem, Angular uses the concept of directives, which allow you to add new behaviors to an element in a declarative and reusable way.

### Conditional rendering

One of the most common scenarios that developers encounter is the desire to show or hide content in templates based on a condition.

Similar to JavaScript's `if` control block, Angular provides a built-in `ngIf` directive to control whether an element will render if the expression returns a truthy value.

```html
<section class="admin-controls" *ngIf="hasAdminPrivileges">
  The content you are looking for is here.
</section>
```

If `hasAdminPrivileges` is true, the application will display the content to the user, otherwise, the element is removed from the DOM entirely.

### Rendering a list

Another common scenario is to render a list of items based on dynamic data.

Similar to JavaScript’s `for` loop, Angular provides another built-in directive called `ngFor`, The following code will render one `<li>` element for each item in `taskList`.

```html
<ul class="ingredient-list">
  <li *ngFor="let task of taskList">{{ task }}</li>
</ul>
```

### Custom directives

While built-in directives help to solve common problems that developers encounter, there are situations where developers require custom behavior that’s specific to their application. In these cases, Angular provides a way for you to create custom directives.

Custom Angular directives can be identified by the `directive` suffix (e.g., `my-custom-name.directive.ts`).

Similar to defining a component, directives are comprised of the following:

- A TypeScript decorator to define configuration options for things like:
  - A selector that defines the tag name is when the component is called
- A TypeScript class that defines the extended behavior the directive will add to the respective HTML element.

For example, here’s a custom directive for highlighting an element:

```ts
@Directive({
  selector: '[appHighlight]',
})
export class HighlightDirective {
  private el = inject(ElementRef);
  constructor() {
    this.el.nativeElement.style.backgroundColor = 'yellow';
  }
}
```

To apply this to an element, the directive is called by adding it as an attribute.

```html
<p appHighlight>Look at me!</p>
```

Directives can also leverage user events, take input for additional customization, but this goes beyond the scope of this article. To learn more, check out [the docs on creating custom directives](guide/attribute-directives).

<a id="services"></a>

## Services

When you need to share logic between components, Angular allows you to create a “service” which allows you to inject code into components while managing it from a single source of truth.

Angular services can be identified by the `service` suffix (e.g., `my-custom-name.service.ts`).

Similar to defining a component, services are comprised of the following:

- A TypeScript decorator to define configuration options for things like:
  - [`providedIn`](api/core/Injectable#providedIn) - This allows you to define what parts of the application can access the service. For example, ‘root’ will allow a service to be accessed anywhere within the application.
- A TypeScript class that defines the desired code that will be accessible when the service is injected

Here is an example of a `Calculator` service.

```ts
import {Injectable} from '@angular/core';

@Injectable({
  providedIn: 'root',
})
class CalculatorService {
  add(x: number, y: number) {
    return x + y;
  }
}
```

If we wanted to call the service in a Receipt component for example, here’s what it might look like:

```ts
import { Component } from '@angular/core';
import { CalculatorService } from './calculator.service';

@Component({
  selector: 'app-receipt',
  template: `<h1>The total is {{ totalCost }}</h1>`,
})
export class Receipt {
  private calculatorService = inject(CalculatorService);
  totalCost = this.calculatorService.add(50, 25);
}
```

In this example, the `CalculatorService` is being used by calling the Angular function `inject` and passing in the service to it.

<a id="organization"></a>

## Organization

Standalone components are a new organizational pattern that were introduced in Angular v15 and is the recommended place to start. In contrast to [NgModules](guide/ngmodules), it allows developers to organize code and manage dependencies through components rather than feature modules.

For example, in the traditional NgModule pattern, you would need to create a TodoModule and manage all of its dependencies through this module.

```ts (Todo.module.ts)
import {NgModule} from '@angular/core';
import {FormsModule} from '@angular/forms';
import {TodoList} from '../todo/todo-list.component';

@NgModule({
  declarations: [TodoList],
  imports: [FormsModule],
  exports: [TodoList, FormsModule],
})
export class TodoModule {}
```

However, you can now achieve something similar with a standalone component without the need for a module file:

```ts (Todo.component.ts)
import {FormsModule} from '@angular/forms';
import {TodoList} from '../todo/todo-list.component';

@Component({
  standalone: true,
  selector: 'todo-app',
  imports: [FormsModule, TodoList],
  template: ` ... <todo-list [tasks]="taskList"></todo-list> `,
})
export class PhotoGalleryComponent {
  // component logic
}
```

While most of this should be familiar (from the Components section), two things that are unique to this new pattern are the `standalone` flag and the `imports` key.

- `standalone` - When provided the value `true`, this tells Angular that the component does not need to be declared in an NgModule
- `imports` - Allows developers to declare what dependencies will be used in the component

In other words, rather than having to define a specific context in which code should be organized, developers are able to specify the dependencies directly within the component context itself.

<a id="cli"></a>

## Command Line Interface (CLI)

The Angular CLI is the recommended way to develop Angular applications and can make some tasks trouble-free.

Some examples of common Angular CLI commands include:

<!-- vale Angular.Google_WordListSuggestions = NO -->

| Command                     | Details                                                               |
| :-------------------------- | :-------------------------------------------------------------------- |
| [ng build](cli/build)       | Compiles an Angular application into an output directory.             |
| [ng serve](cli/serve)       | Builds and serves your application, rebuilding on file changes.       |
| [ng generate](cli/generate) | Generates or modifies files based on a schematic.                     |
| [ng test](cli/test)         | Runs unit tests on a given project.                                   |
| [ng e2e](cli/e2e)           | Builds and serves an Angular application, then runs end-to-end tests. |

<!-- vale Angular.Google_WordListSuggestions = YES -->

For more information about the Angular CLI, see the [Angular CLI Reference](cli) section.

<a id="1p-libraries"></a>

## First-party libraries

Angular provides many first-party libraries to support common functionality that developers often encounter when building their apps.

Some of the popular libraries available in the ecosystem include:

<!-- vale Angular.Google_Acronyms = NO -->

| Library                                                           | Details                                                                                                                                        |
| :---------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------- |
| [Angular Router](guide/router)                                    | Advanced client-side navigation and routing based on Angular components. Supports lazy-loading, nested routes, custom path matching, and more. |
| [Angular Forms](guide/forms-overview)                             | Uniform system for form participation and validation.                                                                                          |
| [Angular HttpClient](guide/understanding-communicating-with-http) | Robust HTTP client that can power more advanced client-server communication.                                                                   |
| [Angular Animations](guide/animations)                            | Rich system for driving animations based on application state.                                                                                 |
| [Angular PWA](guide/service-worker-intro)                         | Tools for building Progressive Web Applications \(PWA\) including a service worker and Web application manifest.                               |
| [Angular Schematics](guide/schematics)                            | Automated scaffolding, refactoring, and update tools that simplify development at large scale.                                                 |

<!-- vale Angular.Google_Acronyms = YES -->

## Next steps

To see Angular in action, see the [Getting Started](start) tutorial.
This tutorial uses [stackblitz.com](https://stackblitz.com), for you to explore a working example of Angular without any installation requirements.

If you’re interested in learning more about how you can build apps with Angular, check out the following resources:

- [Tutorials](tutorial/first-app)
- [In-Depth Guides](guide/developer-guide-overview)

@reviewed 2023-08-15
