@title
Form Validation

@intro
Validate user's form entries.

@description


{@a top}


Improve overall data quality by validating user input for accuracy and completeness.

This cookbook shows how to validate user input in the UI and display useful validation messages
using first the template-driven forms and then the reactive forms approach.

<div class="l-sub-section">



Read more about these choices in the [Forms](guide/forms)
and the [Reactive Forms](guide/reactive-forms) guides.


</div>



{@a toc}

<!--

## Contents

  * [Simple template-driven forms](guide/form-validation#template1)
  * [Template-driven forms with validation messages in code](guide/form-validation#template2)

    * [Component Class](guide/form-validation#component-class)
    * [The benefits of messages in code](guide/form-validation#improvement)
    * [`FormModule` and template-driven forms](guide/form-validation#formmodule)

  * [Reactive forms with validation in code](guide/form-validation#reactive)

    * [Switch to the `ReactiveFormsModule`](guide/form-validation#reactive-forms-module)
    * [Component template](guide/form-validation#reactive-component-template)
    * [Component class](guide/form-validation#reactive-component-class)

      * [`FormBuilder` declaration](guide/form-validation#formbuilder)
      * [Committing hero value changes](guide/form-validation#committing-changes)

  * [Custom validation](guide/form-validation#custom-validation)

    * [Custom validation directive](guide/form-validation#custom-validation-directive)

  * [Testing considerations](guide/form-validation#testing)

-->

{@a live-example}


**Try the live example to see and download the full cookbook source code.**

<live-example name="form-validation" embedded=true img="guide/form-validation/plunker.png">

</live-example>




{@a template1}


## Simple template-driven forms

In the template-driven approach, you arrange
[form elements](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML) in the component's template.

You add Angular form directives (mostly directives beginning `ng...`) to help
Angular construct a corresponding internal control model that implements form functionality.
In template-drive forms, the control model is _implicit_ in the template.

To validate user input, you add [HTML validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation)
to the elements. Angular interprets those as well, adding validator functions to the control model.

Angular exposes information about the state of the controls including
whether the user has "touched" the control or made changes and if the control values are valid.

In this first template validation example,
notice the HTML that reads the control state and updates the display appropriately.
Here's an excerpt from the template HTML for a single input control bound to the hero name:

<code-example path="form-validation/src/app/template/hero-form-template1.component.html" region="name-with-error-msg" title="template/hero-form-template1.component.html (Hero name)" linenums="false">

</code-example>



Note the following:

* The `<input>` element carries the HTML validation attributes: `required`, `minlength`, and `maxlength`.

* The `name` attribute of the input is set to `"name"` so Angular can track this input element and associate it
with an Angular form control called `name` in its internal control model.

* The `[(ngModel)]` directive allows two-way data binding between the input box to the `hero.name` property.

* The template variable (`#name`) has the value `"ngModel"` (always `ngModel`).
This gives you a reference to the Angular `NgModel` directive
associated with this control that you can use _in the template_
to check for control states such as `valid` and `dirty`.

* The `*ngIf` on the `<div>` element reveals a set of nested message `divs` but only if there are "name" errors and
the control is either `dirty` or `touched`.

* Each nested `<div>` can present a custom message for one of the possible validation errors.
There are messages for `required`, `minlength`, and `maxlength`.

The full template repeats this kind of layout for each data entry control on the form.

{@a why-check}


<div class="l-sub-section">



#### Why check _dirty_ and _touched_?

The app shouldn't show errors for a new hero before the user has had a chance to edit the value.
The checks for `dirty` and `touched` prevent premature display of errors.

Learn about `dirty` and `touched` in the [Forms](guide/forms) guide.

</div>



The component class manages the hero model used in the data binding
as well as other code to support the view.


<code-example path="form-validation/src/app/template/hero-form-template1.component.ts" region="class" title="template/hero-form-template1.component.ts (class)">

</code-example>



Use this template-driven validation technique when working with static forms with simple, standard validation rules.

Here are the complete files for the first version of `HeroFormTemplateCompononent` in the template-driven approach:


<code-tabs>

  <code-pane title="template/hero-form-template1.component.html" path="form-validation/src/app/template/hero-form-template1.component.html">

  </code-pane>

  <code-pane title="template/hero-form-template1.component.ts" path="form-validation/src/app/template/hero-form-template1.component.ts">

  </code-pane>

</code-tabs>




{@a template2}


## Template-driven forms with validation messages in code

While the layout is straightforward,
there are obvious shortcomings with the way it's handling validation messages:

* It takes a lot of HTML to represent all possible error conditions.
This gets out of hand when there are many controls and many validation rules.

* There's a lot of JavaScript logic in the HTML.

* The messages are static strings, hard-coded into the template.
It's easier to maintain _dynamic_ messages in the component class.

In this example, you can move the logic and the messages into the component with a few changes to
the template and component.

Here's the hero name again, excerpted from the revised template
(Template 2), next to the original version:

<code-tabs>

  <code-pane title="hero-form-template2.component.html (name #2)" path="form-validation/src/app/template/hero-form-template2.component.html" region="name-with-error-msg">

  </code-pane>

  <code-pane title="hero-form-template1.component.html (name #1)" path="form-validation/src/app/template/hero-form-template1.component.html" region="name-with-error-msg">

  </code-pane>

</code-tabs>



The `<input>` element HTML is almost the same. There are noteworthy differences:

* The hard-code error message `<divs>` are gone.

* There's a new attribute, `forbiddenName`, that is actually a custom validation directive.
It invalidates the control if the user enters "bob" in the name `<input>`([try it](guide/form-validation#live-example)).
See the [custom validation](guide/form-validation#custom-validation) section later in this cookbook for more information
on custom validation directives.

* The `#name` template variable is gone because the app no longer refers to the Angular control for this element.

* Binding to the new `formErrors.name` property is sufficent to display all name validation error messages.


{@a component-class}


### Component class
The original component code for Template 1 stayed the same; however,
Template 2 requires some changes in the component. This section covers the code
necessary in Template 2's component class to acquire the Angular
form control and compose error messages.

The first step is to acquire the form control that Angular created from the template by querying for it.

Look back at the top of the component template at the
`#heroForm` template variable in the `<form>` element:

<code-example path="form-validation/src/app/template/hero-form-template1.component.html" region="form-tag" title="template/hero-form-template1.component.html (form tag)" linenums="false">

</code-example>



The `heroForm` variable is a reference to the control model that Angular derived from the template.
Tell Angular to inject that model into the component class's `currentForm` property using a `@ViewChild` query:

<code-example path="form-validation/src/app/template/hero-form-template2.component.ts" region="view-child" title="template/hero-form-template2.component.ts (heroForm)" linenums="false">

</code-example>



Some observations:

* Angular `@ViewChild` queries for a template variable when you pass it
the name of that variable as a string (`'heroForm'` in this case).

* The `heroForm` object changes several times during the life of the component, most notably when you add a new hero.
Periodically inspecting it reveals these changes.

* Angular calls the `ngAfterViewChecked` [lifecycle hook method](guide/lifecycle-hooks#afterview)
when anything changes in the view.
That's the right time to see if there's a new `heroForm` object.

* When there _is_ a new `heroForm` model, `formChanged()` subscribes to its `valueChanges` _Observable_ property.
The `onValueChanged` handler looks for validation errors after every keystroke.

<code-example path="form-validation/src/app/template/hero-form-template2.component.ts" region="handler" title="template/hero-form-template2.component.ts (handler)" linenums="false">

</code-example>



The `onValueChanged` handler interprets user data entry.
The `data` object passed into the handler contains the current element values.
The handler ignores them. Instead, it iterates over the fields of the component's `formErrors` object.

The `formErrors` is a dictionary of the hero fields that have validation rules and their current error messages.
Only two hero properties have validation rules, `name` and `power`.
The messages are empty strings when the hero data are valid.

For each field, the `onValueChanged` handler does the following:
  * Clears the prior error message, if any.
  * Acquires the field's corresponding Angular form control.
  * If such a control exists _and_ it's been changed ("dirty")
  _and_ it's invalid, the handler composes a consolidated error message for all of the control's errors.

Next, the component needs some error messages of course&mdash;a set for each validated property with
one message per validation rule:

<code-example path="form-validation/src/app/template/hero-form-template2.component.ts" region="messages" title="template/hero-form-template2.component.ts (messages)" linenums="false">

</code-example>



Now every time the user makes a change, the `onValueChanged` handler checks for validation errors and produces messages accordingly.


{@a improvement}


### The benefits of messages in code

Clearly the template got substantially smaller while the component code got substantially larger.
It's not easy to see the benefit when there are just three fields and only two of them have validation rules.

Consider what happens as the number of validated
fields and rules increases.
In general, HTML is harder to read and maintain than code.
The initial template was already large and threatening to get rapidly worse
with the addition of more validation message `<div>` elements.

After moving the validation messaging to the component,
the template grows more slowly and proportionally.
Each field has approximately the same number of lines no matter its number of validation rules.
The component also grows proportionally, at the rate of one line per validated field
and one line per validation message.

Both trends are manageable.

Now that the messages are in code, you have more flexibility and can compose messages more efficiently.
You can refactor the messages out of the component, perhaps to a service class that retrieves them from the server.
In short, there are more opportunities to improve message handling now that text and logic have moved from template to code.


{@a formmodule}


### _FormModule_ and template-driven forms

Angular has two different forms modules&mdash;`FormsModule` and
`ReactiveFormsModule`&mdash;that correspond with the
two approaches to form development. Both modules come
from the same `@angular/forms` library package.

You've been reviewing the "Template-driven" approach which requires the `FormsModule`.
Here's how you imported it in the `HeroFormTemplateModule`.


<code-example path="form-validation/src/app/template/hero-form-template.module.ts" title="template/hero-form-template.module.ts" linenums="false">

</code-example>



<div class="l-sub-section">



This guide hasn't talked about the `SharedModule` or its `SubmittedComponent` which appears at the bottom of every
form template in this cookbook.

They're not germane to the validation story. Look at the [live example](guide/form-validation#live-example) if you're interested.


</div>




{@a reactive}


## Reactive forms with validation in code

In the template-driven approach, you markup the template with form elements, validation attributes,
and `ng...` directives from the Angular `FormsModule`.
At runtime, Angular interprets the template and derives its _form control model_.

**Reactive Forms** takes a different approach.
You create the form control model in code. You write the template with form elements
and `form...` directives from the Angular `ReactiveFormsModule`.
At runtime, Angular binds the template elements to your control model based on your instructions.

This approach requires a bit more effort. *You have to write the control model and manage it*.

This allows you to do the following:

* Add, change, and remove validation functions on the fly.
* Manipulate the control model dynamically from within the component.
* [Test](guide/form-validation#testing) validation and control logic with isolated unit tests.

The following cookbook sample re-writes the hero form in _reactive forms_ style.


{@a reactive-forms-module}


### Switch to the _ReactiveFormsModule_
The reactive forms classes and directives come from the Angular `ReactiveFormsModule`, not the `FormsModule`.
The application module for the reactive forms feature in this sample looks like this:

<code-example path="form-validation/src/app/reactive/hero-form-reactive.module.ts" title="src/app/reactive/hero-form-reactive.module.ts" linenums="false">

</code-example>



The reactive forms feature module and component are in the `src/app/reactive` folder.
Focus on the `HeroFormReactiveComponent` there, starting with its template.


{@a reactive-component-template}


### Component template

Begin by changing the `<form>` tag so that it binds the Angular `formGroup` directive in the template
to the `heroForm` property in the component class.
The `heroForm` is the control model that the component class builds and maintains.


<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="form-tag" title="form-validation/src/app/reactive/hero-form-reactive.component.html" linenums="false">

</code-example>



Next, modify the template HTML elements to match the _reactive forms_ style.
Here is the "name" portion of the template again, revised for reactive forms and compared with the template-driven version:

<code-tabs>

  <code-pane title="hero-form-reactive.component.html (name #3)" path="form-validation/src/app/reactive/hero-form-reactive.component.html" region="name-with-error-msg">

  </code-pane>

  <code-pane title="hero-form-template1.component.html (name #2)" path="form-validation/src/app/template/hero-form-template2.component.html" region="name-with-error-msg">

  </code-pane>

</code-tabs>



Key changes are:
* The validation attributes are gone (except `required`) because
validating happens in code.

* `required` remains, not for validation purposes (that's in the code),
but rather for css styling and accessibility.


<div class="l-sub-section">



A future version of reactive forms will add the `required` HTML validation attribute to the DOM element
(and perhaps the `aria-required` attribute) when the control has the `required` validator function.

Until then, apply the `required` attribute _and_ add the `Validator.required` function
to the control model, as you'll see below.


</div>



* The `formControlName` replaces the `name` attribute; it serves the same
purpose of correlating the input with the Angular form control.

* The two-way `[(ngModel)]` binding is gone.
The reactive approach does not use data binding to move data into and out of the form controls.
That's all in code.


<div class="l-sub-section">



The retreat from data binding is a principle of the reactive paradigm rather than a technical limitation.

</div>



{@a reactive-component-class}


### Component class

The component class is now responsible for defining and managing the form control model.

Angular no longer derives the control model from the template so you can no longer query for it.
You can create the Angular form control model explicitly with
the help of the `FormBuilder` class.

Here's the section of code devoted to that process, paired with the template-driven code it replaces:

<code-tabs>

  <code-pane title="reactive/hero-form-reactive.component.ts (FormBuilder)" path="form-validation/src/app/reactive/hero-form-reactive.component.ts" region="form-builder">

  </code-pane>

  <code-pane title="template/hero-form-template2.component.ts (ViewChild)" path="form-validation/src/app/template/hero-form-template2.component.ts" region="view-child">

  </code-pane>

</code-tabs>



* Inject `FormBuilder` in a constructor.

* Call a `buildForm` method in the `ngOnInit` [lifecycle hook method](guide/lifecycle-hooks#hooks-overview)
because that's when you'll have the hero data. Call it again in the `addHero` method.

<div class="l-sub-section">



A real app would retrieve the hero asynchronously from a data service, a task best performed in the `ngOnInit` hook.

</div>



* The `buildForm` method uses the `FormBuilder`, `fb`, to declare the form control model.
Then it attaches the same `onValueChanged` handler (there's a one line difference)
to the form's `valueChanges` event and calls it immediately
to set error messages for the new control model.


{@a formbuilder}


#### _FormBuilder_ declaration
The `FormBuilder` declaration object specifies the three controls of the sample's hero form.

Each control spec is a control name with an array value.
The first array element is the current value of the corresponding hero field.
The optional second value is a validator function or an array of validator functions.

Most of the validator functions are stock validators provided by Angular as static methods of the `Validators` class.
Angular has stock validators that correspond to the standard HTML validation attributes.

The `forbiddenName` validator on the `"name"` control is a custom validator,
discussed in a separate [section below](guide/form-validation#custom-validation).


<div class="l-sub-section">



Learn more about `FormBuilder` in the [Introduction to FormBuilder](guide/reactive-forms#formbuilder) section of Reactive Forms guide.


</div>



{@a committing-changes}


#### Committing hero value changes

In two-way data binding, the user's changes flow automatically from the controls back to the data model properties.
Reactive forms do not use data binding to update data model properties.
The developer decides _when and how_ to update the data model from control values.

This sample updates the model twice:

1. When the user submits the form.
1. When the user adds a new hero.

The `onSubmit()` method simply replaces the `hero` object with the combined values of the form:

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.ts" region="on-submit" title="form-validation/src/app/reactive/hero-form-reactive.component.ts" linenums="false">

</code-example>



<div class="l-sub-section">



This example is lucky in that the `heroForm.value` properties _just happen_ to
correspond _exactly_ to the hero data object properties.

</div>



The `addHero()` method discards pending changes and creates a brand new `hero` model object.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.ts" region="add-hero" title="form-validation/src/app/reactive/hero-form-reactive.component.ts" linenums="false">

</code-example>



Then it calls `buildForm()` again which replaces the previous `heroForm` control model with a new one.
The `<form>` tag's `[formGroup]` binding refreshes the page with the new control model.

Here's the complete reactive component file, compared to the two template-driven component files.

<code-tabs>

  <code-pane title="reactive/hero-form-reactive.component.ts (#3)" path="form-validation/src/app/reactive/hero-form-reactive.component.ts">

  </code-pane>

  <code-pane title="template/hero-form-template2.component.ts (#2)" path="form-validation/src/app/template/hero-form-template2.component.ts">

  </code-pane>

  <code-pane title="template/hero-form-template1.component.ts (#1)" path="form-validation/src/app/template/hero-form-template1.component.ts">

  </code-pane>

</code-tabs>



<div class="l-sub-section">



Run the [live example](guide/form-validation#live-example) to see how the reactive form behaves,
and to compare all of the files in this cookbook sample.


</div>




{@a custom-validation}


## Custom validation
This cookbook sample has a custom `forbiddenNameValidator()` function that's applied to both the
template-driven and the reactive form controls. It's in the `src/app/shared` folder
and declared in the `SharedModule`.

Here's the `forbiddenNameValidator()` function:

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="custom-validator" title="shared/forbidden-name.directive.ts (forbiddenNameValidator)" linenums="false">

</code-example>



The function is actually a factory that takes a regular expression to detect a _specific_ forbidden name
and returns a validator function.

In this sample, the forbidden name is "bob";
the validator rejects any hero name containing "bob".
Elsewhere it could reject "alice" or any name that the configuring regular expression matches.

The `forbiddenNameValidator` factory returns the configured validator function.
That function takes an Angular control object and returns _either_
null if the control value is valid _or_ a validation error object.
The validation error object typically has a property whose name is the validation key, `'forbiddenName'`,
and whose value is an arbitrary dictionary of values that you could insert into an error message (`{name}`).


{@a custom-validation-directive}


### Custom validation directive
In the reactive forms component, the `'name'` control's validator function list
has a `forbiddenNameValidator` at the bottom.

<code-example path="form-validation/src/app/reactive/hero-form-reactive.component.ts" region="name-validators" title="reactive/hero-form-reactive.component.ts (name validators)" linenums="false">

</code-example>



In the _template-driven_ example, the `<input>` has the selector (`forbiddenName`)
of a custom _attribute directive_, which rejects "bob".

<code-example path="form-validation/src/app/template/hero-form-template2.component.html" region="name-input" title="template/hero-form-template2.component.html (name input)" linenums="false">

</code-example>



The corresponding `ForbiddenValidatorDirective` is a wrapper around the `forbiddenNameValidator`.

Angular `forms` recognizes the directive's role in the validation process because the directive registers itself
with the `NG_VALIDATORS` provider, a provider with an extensible collection of validation directives.

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive-providers" title="shared/forbidden-name.directive.ts (providers)" linenums="false">

</code-example>



Here is the rest of the directive to help you get an idea of how it all comes together:

<code-example path="form-validation/src/app/shared/forbidden-name.directive.ts" region="directive" title="shared/forbidden-name.directive.ts (directive)">

</code-example>





<div class="l-sub-section">



If you are familiar with Angular validations, you may have noticed
that the custom validation directive is instantiated with `useExisting`
rather than `useClass`. The registered validator must be _this instance_ of
the `ForbiddenValidatorDirective`&mdash;the instance in the form with
its `forbiddenName` property bound to “bob". If you were to replace
`useExisting` with `useClass`, then you’d be registering a new class instance, one that
doesn’t have a `forbiddenName`.

To see this in action, run the example and then type “bob” in the name of Hero Form 2.
Notice that you get a validation error. Now change from `useExisting` to `useClass` and try again.
This time, when you type “bob”, there's no "bob" error message.


</div>





<div class="l-sub-section">



For more information on attaching behavior to elements,
see [Attribute Directives](guide/attribute-directives).


</div>




{@a testing}


## Testing Considerations

You can write _isolated unit tests_ of validation and control logic in _Reactive Forms_.

_Isolated unit tests_ probe the component class directly, independent of its
interactions with its template, the DOM, other dependencies, or Angular itself.

Such tests have minimal setup, are quick to write, and easy to maintain.
They do not require the `Angular TestBed` or asynchronous testing practices.

That's not possible with _template-driven_ forms.
The template-driven approach relies on Angular to produce the control model and
to derive validation rules from the HTML validation attributes.
You must use the `Angular TestBed` to create component test instances,
write asynchronous tests, and interact with the DOM.

While not difficult, this takes more time, work and
skill&mdash;factors that tend to diminish test code
coverage and quality.
