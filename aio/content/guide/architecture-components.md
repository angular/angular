# Introduction to components

<img src="generated/images/guide/architecture/hero-component.png" alt="Component" class="left">

A _component_ controls a patch of screen called a *view*. For example, individual components define and control each of the following views from the [Tutorial](tutorial/index):

* The app root with the navigation links.
* The list of heroes.
* The hero editor.

You define a component's application logic&mdash;what it does to support the view&mdash;inside a class. The class interacts with the view through an API of properties and methods.

For example, the `HeroListComponent` has a `heroes` property that returns an array of heroes that it acquires from a service. `HeroListComponent` also has a `selectHero()` method that sets a `selectedHero` property when the user clicks to choose a hero from that list.

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (class)" region="class"></code-example>

Angular creates, updates, and destroys components as the user moves through the application. Your app can take action at each moment in this lifecycle through optional [lifecycle hooks](guide/lifecycle-hooks), like `ngOnInit()`.

<hr/>

## Component metadata

<img src="generated/images/guide/architecture/metadata.png" alt="Metadata" class="left">

The `@Component` decorator identifies the class immediately below it as a component class, and specifies its metadata. In the example code below, you can see that `HeroListComponent` is just a class, with no special Angular notation or syntax at all. It's not a component until mark it as one with the `@Component` decorator.

The metadata for a component tells Angular where to get the major building blocks it needs to create and present the component and its view. In particular, it associates a _template_ with the component, either directly with inline code, or by reference. Together, the component and its template describe a _view_.

In addition to containing or pointing to the template, the `@Component` metadata configures, for example, how the component can be referenced in HTML and what services it requires.

 Here's an example of basic metadata for `HeroListComponent`:

<code-example path="architecture/src/app/hero-list.component.ts" linenums="false" title="src/app/hero-list.component.ts (metadata)" region="metadata"></code-example>

 This example shows some of the most useful `@Component` configuration options:

* `selector`: A CSS selector that tells Angular to create and insert an instance of this component wherever it finds the corresponding tag in template HTML. For example, if an app's  HTML contains `<app-hero-list></app-hero-list>`, then
Angular inserts an instance of the `HeroListComponent` view between those tags.

* `templateUrl`: The module-relative address of this component's HTML template. Alternatively, you can provide the HTML template inline, as the value of the `template` property. This template defines the component's _host view_.

* `providers`: An array of **dependency injection providers** for services that the component requires. In the example, this tells Angular that the component's constructor requires a `HeroService` instance
in order to get the list of heroes to display.

<hr/>

## Templates and views

<img src="generated/images/guide/architecture/template.png" alt="Template" class="left">

You define a component's view with its companion template. A template is a form of HTML that tells Angular how to render the component.

Views are typically arranged hierarchically, allowing you to modify or show and hide entire UI sections or pages as a unit. The template immediately associated with a component defines that component's _host view_. The component can also define a _view hierarchy_, which contains _embedded views_, hosted by other components.

<figure>
<img src="generated/images/guide/architecture/component-tree.png" alt="Component tree" class="left">
</figure>

A view hierarchy can include views from components in the same NgModule, but it also can (and often does) include views from components that are defined in different NgModules.

## Template syntax

A template looks like regular HTML, except that it also contains Angular [template syntax](guide/template-syntax), which alters the HTML based on your app's logic and the state of app and DOM data. Your template can use _data binding_ to coordinate the app and DOM data, _pipes_ to transform data before it is displayed, and _directives_ to apply app logic to what gets displayed.

For example, here is a template for the Tutorial's `HeroListComponent`:

<code-example path="architecture/src/app/hero-list.component.html" title="src/app/hero-list.component.html"></code-example>

This template uses typical HTML elements like `<h2>` and  `<p>`, and also includes Angular template-syntax elements,  `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<app-hero-detail>`. The template-syntax elements tell Angular how to render the HTML to the screen, using program logic and data.

* The  `*ngFor` directive tells Angular to iterate over a list.
* The `{{hero.name}}`, `(click)`, and `[hero]` bind program data to and from the DOM, responding to user input. See more about [data binding](#data-binding) below.
* The `<app-hero-detail>` tag in the example is an element that represents a new component, `HeroDetailComponent`.  The `HeroDetailComponent`  (code not shown) is a child component of the `HeroListComponent` that defines the Hero-detail view. Notice how custom components like this mix seamlessly with native HTML in the same layouts.

### Data binding

Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses into actions and value updates. Writing such push/pull logic by hand is tedious, error-prone, and a nightmare to read, as any experienced jQuery programmer can attest.

Angular supports *two-way data binding*, a mechanism for coordinating parts of a template with parts of a component. Add binding markup to the template HTML to tell Angular how to connect both sides. 

The following diagram shows the four forms of data binding markup. Each form has a direction&mdash;to the DOM, from the DOM, or in both directions.

<figure>
<img src="generated/images/guide/architecture/databinding.png" alt="Data Binding" class="left">
</figure>

This example from the `HeroListComponent` template uses three of these forms:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (binding)" region="binding"></code-example>

* The `{{hero.name}}` [*interpolation*](guide/displaying-data#interpolation)
displays the component's `hero.name` property value within the `<li>` element.

* The `[hero]` [*property binding*](guide/template-syntax#property-binding) passes the value of `selectedHero` from
the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`.

* The `(click)` [*event binding*](guide/user-input#binding-to-user-input-events) calls the component's `selectHero` method when the user clicks a hero's name.

**Two-way data binding** is an important fourth form that combines property and event binding in a single notation. Here's an example from the `HeroDetailComponent` template that uses two-way data binding with the `ngModel` directive:

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value,
as with event binding.

Angular processes *all* data bindings once per JavaScript event cycle,
from the root of the application component tree through all child components.

<figure>
  <img src="generated/images/guide/architecture/component-databinding.png" alt="Data Binding" class="left">
</figure>

Data binding plays an important role in communication between a template and its component, and is also important for communication between parent and child components.

<figure>
  <img src="generated/images/guide/architecture/parent-child-binding.png" alt="Parent/Child binding" class="left">
</figure>

### Pipes

 Angular pipes let you declare display-value transformations in your template HTML. A class with the `@Pipe` decorator defines a function that transforms input values to output values for display in a view.

 Angular defines various pipes, such as the [date](https://angular.io/api/common/DatePipe) pipe and [currency](https://angular.io/api/common/CurrencyPipe) pipe; for a complete list, see the [Pipes API list](https://angular.io/api?type=pipe). You can also define new pipes.

 To specify a value transformation in an HTML template, use the [pipe operator (|)](https://angular.io/guide/template-syntax#pipe):

 `{{interpolated_value | pipe_name}}`

 You can chain pipes, sending the output of one pipe function to be transformed by another pipe function. A pipe can also take arguments that control how it performs its transformation. For example, you can pass the desired format to the `date` pipe:

 ```
  <!-- Default format: output 'Jun 15, 2015'-->
  <p>Today is {{today | date}}</p>

 <!-- fullDate format: output 'Monday, June 15, 2015'-->
 <p>The date is {{today | date:'fullDate'}}</p>

  <!-- shortTime format: output '9:43 AM'-->
  <p>The time is {{today | date:'shortTime'}}</p>
```

<hr/>

### Directives

<img src="generated/images/guide/architecture/directive.png" alt="Directives" class="left">

Angular templates are *dynamic*. When Angular renders them, it transforms the DOM according to the instructions given by *directives*. A directive is a class with a `@Directive` decorator.

A component is technically a directive - but components are so distinctive and central to Angular applications that Angular defines the `@Component` decorator, which extends the `@Directive` decorator with template-oriented features.

There are two kinds of directives besides components:  _structural_ and _attribute_ directives. Just as for components, the metadata for a directive associates the class with a `selector` that you use to insert it into HTML. In templates, directives typically appear within an element tag as attributes, either by name or as the target of an assignment or a binding.

#### Structural directives

Structural directives alter layout by adding, removing, and replacing elements in DOM. The example template uses two built-in structural directives to add application logic to how the view is rendered:

<code-example path="architecture/src/app/hero-list.component.1.html" linenums="false" title="src/app/hero-list.component.html (structural)" region="structural"></code-example>

  * [`*ngFor`](guide/displaying-data#ngFor) is an iterative; it tells Angular to stamp out one `<li>` per hero in the `heroes` list.
  * [`*ngIf`](guide/displaying-data#ngIf) is a conditional; it includes the `HeroDetail` component only if a selected hero exists.

#### Attribute directives

Attribute directives alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is an example of an attribute directive. `ngModel` modifies the behavior of an existing element (typically an `<input>`) by setting its display value property and responding to change events.

<code-example path="architecture/src/app/hero-detail.component.html" linenums="false" title="src/app/hero-detail.component.html (ngModel)" region="ngModel"></code-example>

Angular has more pre-defined directives that either alter the layout structure
(for example, [ngSwitch](guide/template-syntax#ngSwitch))
or modify aspects of DOM elements and components
(for example, [ngStyle](guide/template-syntax#ngStyle) and [ngClass](guide/template-syntax#ngClass)).

You can also write your own directives. Components such as `HeroListComponent` are one kind of custom directive. You can also create custom structural and attribute directives.

<!-- PENDING: link to where to learn more about other kinds! -->