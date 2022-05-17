# Introduction to components and templates

A *component* controls a patch of screen called a [*view*][AioGuideGlossaryView].
It consists of a TypeScript class, an HTML template, and a CSS style sheet.
The TypeScript class defines the interaction of the HTML template and the rendered DOM structure, while the style definition describes the appearance.

An Angular application uses individual components to define and control different aspects of the application.
For example, an application may include components to describe:

*   The application root with the navigation links
*   The list of heroes
*   The hero editor

In the following example, the `HeroListComponent` class includes:

*   A `heroes` property that holds an array of heroes
*   A `selectedHero` property that holds the last hero selected by the user
*   A `selectHero()` method sets a `selectedHero` property when the user clicks to choose a hero from that list

The component initializes the `heroes` property by using the `HeroService` service, which is a TypeScript [parameter property][TypescriptlangDocsHandbook2ClassesHtmlParameterProperties] on the constructor.
The dependency injection system of the Angular framework provides the `HeroService` service to the component.

</div>

Angular creates, updates, and destroys components as the user moves through the application.
Your application is able to take action at each moment in this lifecycle through optional [lifecycle hooks][AioGuideComponentLifecycle], like `ngOnInit()`.

## Component metadata

<div class="lightbox">

<img alt="Metadata" class="left" src="generated/images/guide/architecture/metadata.png" />

</div>

The `@Component` decorator identifies the class immediately below it as a component class, and specifies the associated metadata.

The following code example is basic metadata for `HeroListComponent`.

<code-example header="src/app/hero-list.component.ts (metadata)" path="architecture/src/app/hero-list.component.ts" region="metadata"></code-example>

This example shows some of the most useful `@Component` configuration options:

| Options       | Details |
|:---           |:---     |
| `selector`    | A CSS selector that tells Angular to create and insert an instance of this component wherever it finds the corresponding element tag in template HTML. For example, if the HTML of an application contains `<app-hero-list></app-hero-list>`, then Angular inserts an instance of the `HeroListComponent` view between those elements. |
| `templateUrl` | The module-relative address of the HTML template of this component. Alternatively, you are able to provide the HTML template inline, as the value of the `template` property. This template defines the *host view* of the component.                                                                                                              |
| `providers`   | An array of [providers][AioGuideGlossaryProvider] for services that the component requires. In the example, this tells Angular how to provide the `HeroService` instance that the constructor of the component uses to get the list of heroes to display.                                                                                  |

In the code example, you are able to see that `HeroListComponent` is just a class, with no special Angular notation or syntax at all.
It is not a component until you mark it as one with the `@Component` decorator.

The metadata for a component tells Angular where to get the major building blocks that it needs to create and present the component and the associated view.
In particular, it associates a *template* with the component, either directly with inline code, or by reference.
Together, the component and the associated template describe a *view*.

In addition to containing or pointing to the template, the `@Component` metadata configures.
For example, how the component is referenced in HTML and what services it requires.

<div class="lightbox">

<img alt="Template" class="left" src="generated/images/guide/architecture/template.png" />

</div>

You define the view of a component with the associated companion template.
A template is a form of HTML that tells Angular how to render the component.

Views are typically organized hierarchically, allowing you to modify or show and hide entire UI sections or pages as a unit.
The template immediately associated with a component defines that *host view* of that component.
The component can also define a *view hierarchy*, which contains *embedded views*, hosted by other components.

<div class="lightbox">

<img alt="Component tree" class="left" src="generated/images/guide/architecture/component-tree.png" />

</div>

A view hierarchy can include views from components in the same NgModule and from those in different NgModules.

## Template syntax

A template looks like regular HTML, except that it also contains Angular [template syntax][AioGuideTemplateSyntax], which alters the HTML based on the logic of your application and the state of application and DOM data.
Your template can use *data binding* to coordinate the application and DOM data, *pipes* to transform data before it is displayed, and *directives* to apply application logic to what gets displayed.

The folloowing code example is a template for the `HeroListComponent` of the tutorial.

<code-example header="src/app/hero-list.component.html" path="architecture/src/app/hero-list.component.html"></code-example>

This template uses typical HTML elements like `<h2>` and `<p>`, and also includes Angular template-syntax elements, `*ngFor`, `{{hero.name}}`, `(click)`, `[hero]`, and `<app-hero-detail>`.
The template-syntax elements tell Angular how to render the HTML to the screen, using program logic and data.

*   The `*ngFor` directive tells Angular to iterate over a list
*   `{{hero.name}}`, `(click)`, and `[hero]` bind program data to and from the DOM, responding to user input.
    See more about [data binding][AioGuideArchitectureComponentsDataBinding] below.

*   The `<app-hero-detail>` element tag in the example is an element tag that represents the new `HeroDetailComponent` component.
    The `HeroDetailComponent` component defines the `hero-detail` portion of the rendered DOM structure specified by the `HeroListComponent` component.

    Notice how the custom components mix with native HTML.

### Data binding

Without a framework, you would be responsible for pushing data values into the HTML controls and turning user responses into actions and value updates.
Writing such push and pull logic by hand is tedious, error-prone, and a nightmare to read, as any experienced front-end JavaScript programmer can attest.

Angular supports *two-way data binding*, a mechanism for coordinating the parts of a template with the parts of a component.
Add binding markup to the template HTML to tell Angular how to connect both sides.

The following diagram shows the four forms of data binding markup.
Each form has a direction:
To the DOM, from the DOM, or both.

<div class="lightbox">

<img alt="Data Binding" class="left" src="generated/images/guide/architecture/databinding.png" />

</div>

This example from the `HeroListComponent` template uses three of these forms.

<code-example header="src/app/hero-list.component.html (binding)" path="architecture/src/app/hero-list.component.1.html" region="binding"></code-example>

| Data bindings                                                            | Details |
|:---                                                                      |:---     |
| `[hero]` [property binding](guide/property-binding)                      | Passes the value of `selectedHero` from the parent `HeroListComponent` to the `hero` property of the child `HeroDetailComponent`. |
| `(click)` [event binding](guide/user-input#binding-to-user-input-events) | Calls the component's `selectHero` method when the user clicks a hero's name.                                                     |
| `{{hero.name}}` [interpolation](guide/interpolation)                     | Displays the component's `hero.name` property value within the `<button>` element.                                                |

Two-way data binding \(used mainly in [template-driven forms](guide/forms)\) combines property and event binding in a single notation.
Here is an example from the `HeroDetailComponent` template that uses two-way data binding with the `ngModel` directive.

<code-example header="src/app/hero-detail.component.html (ngModel)" path="architecture/src/app/hero-detail.component.html" region="ngModel"></code-example>

In two-way binding, a data property value flows to the input box from the component as with property binding.
The user's changes also flow back to the component, resetting the property to the latest value, as with event binding.

Angular processes *all* data bindings once for each JavaScript event cycle, from the root of the application component tree through all child components.

<div class="lightbox">

<img alt="Data Binding" class="left" src="generated/images/guide/architecture/component-databinding.png" />

</div>

Data binding plays an important role in communication between a template and the associated component, and is also important for communication between parent and child components.

<div class="lightbox">

<img alt="Parent/Child binding" class="left" src="generated/images/guide/architecture/parent-child-binding.png" />

</div>

### Pipes

Angular pipes let you declare display-value transformations in your template HTML.
A class with the `@Pipe` decorator defines a function that transforms input values to output values for display in a view.

Angular defines various pipes, such as the [date][AioApiCommonDatepipe] pipe and [currency][AioApiCommonCurrencypipe] pipe; for a complete list, see the [Pipes API list][AioApiTypePipe].
You can also define new pipes.

To specify a value transformation in an HTML template, use the [pipe operator (`|`)][AioGuidePipes].

<code-example format="html" language="html">

{{interpolated_value &verbar; pipe_name}}

</code-example>

You can chain pipes, sending the output of one pipe function to be transformed by another pipe function.
A pipe can also take arguments that control how it performs the associated transformation.
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

<img alt="Directives" class="left" src="generated/images/guide/architecture/directive.png" />

</div>

An Angular template is *dynamic*.
When Angular renders it, Angular uses the instructions in the *directive* to transform the DOM.
A directive is a class with a `@Directive()` decorator.

A component is a specific type of directive.
A component is so distinctive and central to Angular applications that Angular defines the `@Component()` decorator.
The `@Component()` decorator extends the `@Directive()` decorator with template-oriented features.

In addition to components, there are two other kinds of directives:
*Structural* and *attribute*.
Use the several directives of both kinds provided in Angular.
Use the `@Directive()` decorator to define your own directive.

Just as for a component, the metadata for a directive associates the decorated class with a `selector` element tag that you use to insert it into HTML.
In templates, directives typically appear within an element tag as attributes, either by name or as the target of an assignment or a binding.

#### Structural directive

A *structural directive* adds, removes, and replaces DOM elements in order to alter layout.

<code-example header="src/app/hero-list.component.html (structural)" path="architecture/src/app/hero-list.component.1.html" region="structural"></code-example>

The example template uses two built-in structural directives to add application logic to how the view is rendered.

| Structural directives                                                 | Details |
|:---                                                                   |:---     |
| [`*ngFor`][AioGuideBuiltInDirectivesListingItemsWithNgfor]            | Is an iterative directive. It tells Angular to stamp out one `<li>` per hero in the `heroes` list. |
| [`*ngIf`][AioGuideBuiltInDirectivesAddingOrRemovingAnElementWithNgif] | Is a conditional directive. It includes the `HeroDetail` component only if a selected hero exists. |

#### Attribute directive

An *attribute directive* alters the appearance or behavior of an existing element tag.
It appears to be regular HTML attribute in a template, which is why it is named attribute directive.

<code-example header="src/app/hero-detail.component.html (ngModel)" path="architecture/src/app/hero-detail.component.html" region="ngModel"></code-example>

Angular includes pre-defined directives that perform the following actions.

| Actions                                       | Pre-defined attribute directives |
|:---                                           |:---                              |
| Alter the layout structure                    | [ngSwitch][AioGuideBuiltInDirectivesSwitchingCasesWithNgswitch]                                                                                   |
| Modify aspects of DOM elements and components | [ngClass][AioGuideBuiltInDirectivesAddingAndRemovingClassesWithNgclass] <br /> [ngStyle][AioGuideBuiltInDirectivesSettingInlineStylesWithNgstyle] |

<div class="alert is-helpful">

For more information, see [Attribute Directives][AioGuideAttributeDirectives] and [Structural Directives][AioGuideStructuralDirectives].

</div>

<!-- links -->

[AioApiCommonCurrencypipe]: api/common/CurrencyPipe "CurrencyPipe | @angular/common - API | Angular"

[AioApiCommonDatepipe]: api/common/DatePipe "DatePipe | @angular/common - API | Angular"

[AioApiTypePipe]: api?type=pipe "type=pipe - API List | Angular"

[AioGuideArchitectureComponentsDataBinding]: guide/architecture-components#data-binding "Data binding - Introduction to components and templates | Angular"

[AioGuideAttributeDirectives]: guide/attribute-directives "Attribute directives | Angular"

[AioGuideBuiltInDirectivesAddingAndRemovingClassesWithNgclass]: guide/built-in-directives#adding-and-removing-classes-with-ngclass "Adding and removing classes with NgClass - Built-in directives | Angular"
[AioGuideBuiltInDirectivesAddingOrRemovingAnElementWithNgif]: guide/built-in-directives#adding-or-removing-an-element-with-ngif "Adding or removing an element with NgIf - Built-in directives | Angular"
[AioGuideBuiltInDirectivesListingItemsWithNgfor]: guide/built-in-directives#listing-items-with-ngfor "Listing items with NgFor - Built-in directives | Angular"
[AioGuideBuiltInDirectivesSettingInlineStylesWithNgstyle]: guide/built-in-directives#setting-inline-styles-with-ngstyle "Setting inline styles with NgStyle - Built-in directives | Angular"
[AioGuideBuiltInDirectivesSwitchingCasesWithNgswitch]: guide/built-in-directives#switching-cases-with-ngswitch "Switching cases with NgSwitch - Built-in directives | Angular"

[AioGuideComponentLifecycle]: guide/component/component-lifecycle "Lifecycle hooks | Angular"

[AioGuideForms]: guide/forms "Building a template-driven form | Angular"

[AioGuideGlossaryProvider]: guide/glossary#provider "provider - Glossary | Angular"
[AioGuideGlossaryView]: guide/glossary#view "view - Glossary | Angular"

[AioGuideInterpolation]: guide/interpolation "Text interpolation | Angular"

[AioGuidePipes]: guide/pipes "Transforming Data Using Pipes | Angular"

[AioGuidePropertyBinding]: guide/property-binding "Property binding | Angular"

[AioGuideStructuralDirectives]: guide/structural-directives "Writing structural directives"

[AioGuideTemplateSyntax]: guide/template-syntax "Template syntax | Angular"

[AioGuideUserInputBindingToUserInputEvents]: guide/user-input#binding-to-user-input-events "Binding to user input events - User input | Angular"

[AioTutorial]: tutorial "Tour of Heroes app and tutorial | Angular"

<!-- external links -->

[TypescriptlangDocsHandbook2ClassesHtmlParameterProperties]: https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties "Parameter Properties - Classes | TypeScript"

<!-- end links -->

@reviewed 2022-04-13
