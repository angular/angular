# Introduction to components and templates

A *component* controls a patch of screen called a [*view*](guide/glossary#view "Definition of view"). It consists
of a TypeScript class, an HTML template, and a CSS style sheet. The TypeScript class defines the interaction 
of the HTML template and the rendered DOM structure, while the style sheet describes its appearance.

An Angular application uses individual components to define and control different aspects of the application.
For example, an application could include components to describe:

*   The application root with the navigation links
*   The list of heroes
*   The hero editor

In the following example, the `HeroListComponent` class includes:

* A `heroes` property that holds an array of heroes.
* A `selectedHero` property that holds the last hero selected by the user.
* A `selectHero()` method sets a `selectedHero` property when the user clicks to choose a hero from that list.

The component initializes the `heroes` property by using the `HeroService` service, which is a TypeScript [parameter property](https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties) on the constructor. Angular's dependency injection system provides the `HeroService` service to the component.

<code-example header="src/app/hero-list.component.ts (class)" path="architecture/src/app/hero-list.component.ts" region="class"></code-example>

Angular creates, updates, and destroys components as the user moves through the application.
Your application can take action at each moment in this lifecycle through optional [lifecycle hooks](guide/lifecycle-hooks), like `ngOnInit()`.

## Component metadata

<div class="lightbox">

<img alt="Metadata" class="left" src="generated/images/guide/architecture/metadata.png">

</div>

The `@Component` decorator identifies the class immediately below it as a component class, and specifies its metadata.
In the example code below, you can see that `HeroListComponent` is just a class, with no special Angular notation or syntax at all.
It's not a component until you mark it as one with the `@Component` decorator.

The metadata for a component tells Angular where to get the major building blocks that it needs to create and present the component and its view.
In particular, it associates a *template* with the component, either directly with inline code, or by reference.
Together, the component and its template describe a *view*.

In addition to containing or pointing to the template, the `@Component` metadata configures, for example, how the component can be referenced in HTML and what services it requires.

Here's an example of basic metadata for `HeroListComponent`.

<code-example header="src/app/hero-list.component.ts (metadata)" path="architecture/src/app/hero-list.component.ts" region="metadata"></code-example>

This example shows some of the most useful `@Component` configuration options:

| Configuration options | Details |
|:---                   |:---     |
| `selector`            | A CSS selector that tells Angular to create and insert an instance of this component wherever it finds the corresponding tag in template HTML. For example, if an application's HTML contains `<app-hero-list></app-hero-list>`, then Angular inserts an instance of the `HeroListComponent` view between those tags. |
| `templateUrl`         | The module-relative address of this component's HTML template. Alternatively, you can provide the HTML template inline, as the value of the `template` property. This template defines the component's *host view*.                                                                                                  |
| `providers`           | An array of [providers](guide/glossary#provider) for services that the component requires. In the example, this tells Angular how to provide the `HeroService` instance that the component's constructor uses to get the list of heroes to display.                                                                   |

## Templates and views

<div class="lightbox">

<img alt="Template" class="left" src="generated/images/guide/architecture/template.png">

</div>

You define a component's view with its companion template.
A template is a form of HTML that tells Angular how to render the component.

Views are typically organized hierarchically, allowing you to modify or show and hide entire UI sections or pages as a unit.
The template immediately associated with a component defines that component's *host view*.
The component can also define a *view hierarchy*, which contains *embedded views*, hosted by other components.

<div class="lightbox">

<img alt="Component tree" class="left" src="generated/images/guide/architecture/component-tree.png">

</div>

A view hierarchy can include views from components in the same NgModule and from those in different NgModules.

## Template syntax

A template looks like regular HTML, except that it also contains Angular [template syntax](guide/template-syntax), which alters the HTML based on your application's logic and the state of application and DOM data.
Your template can use *data binding* to coordinate the application and DOM data, *pipes* to transform data before it is displayed, and *directives* to apply application logic to what gets displayed.

For example, here is a template for the Tutorial's `HeroListComponent`.

<code-example header="src/app/hero-list.component.html" path="architecture/src/app/hero-list.component.html" ></code-example>

This template uses typical HTML elements like `<h2>` and  `<p>`. It also includes Angular template-syntax elements, `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<app-hero-detail>`.
The template-syntax elements tell Angular how to render the HTML to the screen, using program logic and data.

*   The `*ngFor` directive tells Angular to iterate over a list
*   `{{hero.name}}`, `(click)`, and `[hero]` bind program data to and from the DOM, responding to user input.
    See more about [data binding](#data-binding) below.

*   The `<app-hero-detail>` element tag in the example represents a new component, `HeroDetailComponent`.
    The `HeroDetailComponent`  defines the `hero-detail` portion of the rendered DOM structure specified by the `HeroListComponent` component.

    Notice how these custom components mix with native HTML.

### Data binding

Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses into actions and value updates.
Writing such push and pull logic by hand is tedious, error-prone, and a nightmare to read, as any experienced front-end JavaScript programmer can attest.

Angular supports *two-way data binding*, a mechanism for coordinating the parts of a template with the parts of a component.
Add binding markup to the template HTML to tell Angular how to connect both sides.

The following diagram shows the four forms of data binding markup.
Each form has a direction: to the DOM, from the DOM, or both.

<div class="lightbox">

<img alt="Data Binding" class="left" src="generated/images/guide/architecture/databinding.png">

</div>

This example from the `HeroListComponent` template uses three of these forms.

<code-example header="src/app/hero-list.component.html (binding)" path="architecture/src/app/hero-list.component.1.html" region="binding"></code-example>

| Data bindings                                                            | Details |
|:---                                                                      |:---     |
| `[hero]` [property binding](guide/property-binding)                      | Passes the value of `selectedHero` from the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`. |
| `(click)` [event binding](guide/user-input#binding-to-user-input-events) | Calls the component's `selectHero` method when the user clicks a hero's name.                                                     |
| `{{hero.name}}` [interpolation](guide/interpolation)                     | Displays the component's `hero.name` property value within the `<button>` element.                                                |

Two-way data binding \(used mainly in [template-driven forms](guide/forms)\) combines property and event binding in a single notation.
Here's an example from the `HeroDetailComponent` template that uses two-way data binding with the `ngModel` directive.

<code-example header="src/app/hero-detail.component.html (ngModel)" path="architecture/src/app/hero-detail.component.html" region="ngModel"></code-example>

In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value, as with event binding.

Angular processes *all* data bindings once for each JavaScript event cycle, from the root of the application component tree through all child components.

<div class="lightbox">

<img alt="Data Binding" class="left" src="generated/images/guide/architecture/component-databinding.png">

</div>

Data binding plays an important role in communication between a template and its component, and is also important for communication between parent and child components.

<div class="lightbox">

<img alt="Parent/Child binding" class="left" src="generated/images/guide/architecture/parent-child-binding.png">

</div>

### Pipes

Angular pipes let you declare display-value transformations in your template HTML.
A class with the `@Pipe` decorator defines a function that transforms input values to output values for display in a view.

Angular defines various pipes, such as the [date](api/common/DatePipe) pipe and [currency](api/common/CurrencyPipe) pipe. For a complete list, see the [Pipes API list](api?type=pipe).
You can also define new pipes.

To specify a value transformation in an HTML template, use the [pipe operator (`|`)](guide/pipes).

<code-example format="html" language="html">

{{interpolated_value &verbar; pipe_name}}

</code-example>

You can chain pipes, sending the output of one pipe function to be transformed by another pipe function.
A pipe can also take arguments that control how it performs its transformation.
For example, you can pass the desired format to the `date` pipe.

<code-example format="html" language="html">

&lt;!-- Default format: output 'Jun 15, 2015'--&gt;
&lt;p&gt;Today is {{today &verbar; date}}&lt;/p&gt;

&lt;!-- fullDate format: output 'Monday, June 15, 2015'--&gt;
&lt;p&gt;The date is {{today &verbar; date:'fullDate'}}&lt;/p&gt;

&lt;!-- shortTime format: output '9:43 AM'--&gt;
&lt;p&gt;The time is {{today &verbar; date:'shortTime'}}&lt;/p&gt;

</code-example>

### Directives

<div class="lightbox">

<img alt="Directives" class="left" src="generated/images/guide/architecture/directive.png">

</div>

Angular templates are *dynamic*.
When Angular renders them, it transforms the DOM according to the instructions given by *directives*.
A directive is a class with a `@Directive()` decorator.

A component is technically a directive.
However, components are so distinctive and central to Angular applications that Angular defines the `@Component()` decorator, which extends the `@Directive()` decorator with template-oriented features.

In addition to components, there are two other kinds of directives: *structural* and *attribute*.
Angular defines a number of directives of both kinds, and you can define your own using the  `@Directive()` decorator.

Just as for components, the metadata for a directive associates the decorated class with a `selector` element that you use to insert it into HTML.
In templates, directives typically appear within an element tag as attributes, either by name or as the target of an assignment or a binding.

#### Structural directives

*Structural directives* alter layout by adding, removing, and replacing elements in the DOM.
The example template uses two built-in structural directives to add application logic to how the view is rendered.

<code-example header="src/app/hero-list.component.html (structural)" path="architecture/src/app/hero-list.component.1.html" region="structural"></code-example>

| Directives                                  | Details |
|:---                                         |:---     |
| [`*ngFor`](guide/built-in-directives#ngFor) | An *iterative*, which tells Angular to create one `<li>` per hero in the `heroes` list. |
| [`*ngIf`](guide/built-in-directives#ngIf)   | A *conditional*, which includes the `HeroDetail` component only if a selected hero exists. |

#### Attribute directives

*Attribute directives* alter the appearance or behavior of an existing element.
In templates they look like regular HTML attributes, hence the name.

The `ngModel` directive, which implements two-way data binding, is an example of an attribute directive.
`ngModel` modifies the behavior of an existing element \(typically `<input>`\) by setting its display value property and responding to change events.

<code-example header="src/app/hero-detail.component.html (ngModel)" path="architecture/src/app/hero-detail.component.html" region="ngModel"></code-example>

Angular includes pre-defined directives that change: 

* The layout structure, such as [ngSwitch](guide/built-in-directives#ngSwitch), and
* Aspects of DOM elements and components, such as [ngStyle](guide/built-in-directives#ngstyle) and [ngClass](guide/built-in-directives#ngClass).

<div class="alert is-helpful">

Learn more in the [Attribute Directives](guide/attribute-directives) and [Structural Directives](guide/structural-directives) guides.

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
