@title
Form Validation

@intro
Validate user's form entries

@description


{@a top}
We can improve overall data quality by validating user input for accuracy and completeness.

In this cookbook we show how to validate user input in the UI and display useful validation messages 
using first the template-driven forms and then the reactive forms approach.
Learn more about these choices in the [Forms chapter.](../guide/forms.html)


{@a toc}
## Table of Contents

  [Simple Template-Driven Forms](#template1)

  [Template-Driven Forms with validation messages in code](#template2)

  [Reactive Forms with validation in code](#reactive)

  [Custom validation](#custom-validation)

  [Testing](#testing)


{@a live-example}
**Try the live example to see and download the full cookbook source code**
<live-example name="cb-form-validation" embedded=true img="cookbooks/form-validation/plunker.png">

</live-example>




{@a template1}
## Simple Template-Driven Forms

In the template-driven approach, you arrange 
[form elements](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/Forms_in_HTML) in the component's template.

You add Angular form directives (mostly directives beginning `ng...`) to help
Angular construct a corresponding internal control model that implements form functionality.
We say that the control model is _implicit_ in the template.

To validate user input, you add [HTML validation attributes](https://developer.mozilla.org/en-US/docs/Web/Guide/HTML/HTML5/Constraint_validation) 
to the elements. Angular interprets those as well, adding validator functions to the control model.

Angular exposes information about the state of the controls including 
whether the user has "touched" the control or made changes and if the control values are valid.

In the first template validation example, 
we add more HTML to read that control state and update the display appropriately.
Here's an excerpt from the template html for a single input box control bound to the hero name:

{@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.html' region='name-with-error-msg'}

Note the following:
- The `<input>` element carries the HTML validation attributes: `required`, `minlength`, and `maxlength`.

- We set the `name` attribute of the input box to `"name"` so Angular can track this input element and associate it
with an Angular form control called `name` in its internal control model.

- We use the `[(ngModel)]` directive to two-way data bind the input box to the `hero.name` property.

- We set a template variable (`#name`) to the value `"ngModel"` (always `ngModel`).
This gives us a reference to the Angular `NgModel` directive 
associated with this control that we can use _in the template_
to check for control states such as `valid` and `dirty`.

- The `*ngIf` on `<div>` element reveals a set of nested message `divs` but only if there are "name" errors and
the control is either `dirty` or `touched`.

- Each nested `<div>` can present a custom message for one of the possible validation errors.
We've prepared messages for `required`, `minlength`, and `maxlength`.

The full template repeats this kind of layout for each data entry control on the form.
#### Why check _dirty_ and _touched_?

We shouldn't show errors for a new hero before the user has had a chance to edit the value.
The checks for `dirty` and `touched` prevent premature display of errors.

Learn about `dirty` and `touched` in the [Forms](../guide/forms.html) chapter.The component class manages the hero model used in the data binding
as well as other code to support the view.


{@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.ts' region='class'}

Use this template-driven validation technique when working with static forms with simple, standard validation rules.

Here are the complete files for the first version of `HeroFormTemplateCompononent` in the template-driven approach:

<md-tab-group>

  <md-tab label="template/hero-form-template1.component.html">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.html'}
  </md-tab>


  <md-tab label="template/hero-form-template1.component.ts">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.ts'}
  </md-tab>


</md-tab-group>




{@a template2}
## Template-Driven Forms with validation messages in code

While the layout is straightforward, 
there are obvious shortcomings with the way we handle validation messages:

* It takes a lot of HTML to represent all possible error conditions. 
This gets out of hand when there are many controls and many validation rules.

* We're not fond of so much JavaScript logic in HTML.

* The messages are static strings, hard-coded into the template. 
We often require dynamic messages that we should shape in code.

We can move the logic and the messages into the component with a few changes to 
the template and component.

Here's the hero name again, excerpted from the revised template ("Template 2"), next to the original version:
<md-tab-group>

  <md-tab label="hero-form-template2.component.html (name #2)">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.html' region='name-with-error-msg'}
  </md-tab>


  <md-tab label="hero-form-template1.component.html (name #1)">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.html' region='name-with-error-msg'}
  </md-tab>


</md-tab-group>

The `<input>` element HTML is almost the same. There are noteworthy differences:
- The hard-code error message `<divs>` are gone.

- There's a new attribute, `forbiddenName`, that is actually a custom validation directive.
It invalidates the control if the user enters "bob" anywhere in the name ([try it](#live-example)).
We discuss [custom validation directives](#custom-validation) later in this cookbook.

- The `#name` template variable is gone because we no longer refer to the Angular control for this element.

-  Binding to the new `formErrors.name` property is sufficent to display all name validation error messages.

#### Component class
The original component code stays the same.
We _added_ new code to acquire the Angular form control and compose error messages.

The first step is to acquire the form control that Angular created from the template by querying for it.

Look back at the top of the component template where we set the 
`#heroForm` template variable in the `<form>` element:

{@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.html' region='form-tag'}

The `heroForm` variable is a reference to the control model that Angular derived from the template.
We tell Angular to inject that model into the component class's `currentForm` property using a `@ViewChild` query:

{@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.ts' region='view-child'}

Some observations:

- Angular `@ViewChild` queries for a template variable when you pass it 
the name of that variable as a string (`'heroForm'` in this case).

- The `heroForm` object changes several times during the life of the component, most notably when we add a new hero.
We'll have to re-inspect it periodically.

- Angular calls the `ngAfterViewChecked` [lifecycle hook method](../guide/lifecycle-hooks.html#afterview) 
when anything changes in the view.
That's the right time to see if there's a new `heroForm` object.

- When there _is_ a new `heroForm` model, we subscribe to its `valueChanged` _Observable_ property.
The `onValueChanged` handler looks for validation errors after every user keystroke.  

{@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.ts' region='handler'}

The `onValueChanged` handler interprets user data entry. 
The `data` object passed into the handler contains the current element values.
The handler ignores them. Instead, it iterates over the fields of the component's `formErrors` object.

The `formErrors` is a dictionary of the hero fields that have validation rules and their current error messages.
Only two hero properties have validation rules, `name` and `power`.
The messages are empty strings when the hero data are valid.

For each field, the handler
  - clears the prior error message if any
  - acquires the field's corresponding Angular form control 
  - if such a control exists _and_ its been changed ("dirty") _and_ its invalid ...
  - the handler composes a consolidated error message for all of the control's errors.

We'll need some error messages of course, a set for each validated property, one message per validation rule:

{@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.ts' region='messages'}

Now every time the user makes a change, the `onValueChanged` handler checks for validation errors and produces messages accordingly.

### Is this an improvement?

Clearly the template got substantially smaller while the component code got substantially larger. 
It's not easy to see the benefit when there are just three fields and only two of them have validation rules.

Consider what happens as we increase the number of validated fields and rules.
In general, HTML is harder to read and maintain than code. 
The initial template was already large and threatening to get rapidly worse as we add more validation message `<divs>`.

After moving the validation messaging to the component, 
the template grows more slowly and proportionally.
Each field has approximately the same number of lines no matter its number of validation rules.
The component also grows proportionally, at the rate of one line per validated field
and one line per validation message.

Both trends are manageable.

Now that the messages are in code, we have more flexibility. We can compose messages more intelligently. 
We can refactor the messages out of the component, perhaps to a service class that retrieves them from the server.
In short, there are more opportunities to improve message handling now that text and logic have moved from template to code.

### _FormModule_ and template-driven forms

Angular has two different forms modules &mdash; `FormsModule` and `ReactiveFormsModule` &mdash; 
that correspond with the two approaches to form development.
Both modules come from the same `@angular/forms` library package.

We've been reviewing the "Template-driven" approach which requires the `FormsModule`
Here's how we imported it in the `HeroFormTemplateModule`.


{@example 'cb-form-validation/ts/src/app/template/hero-form-template.module.ts'}


We haven't talked about the `SharedModule` or its `SubmittedComponent` which appears at the bottom of every
form template in this cookbook.  

They're not germane to the validation story. Look at the [live example](#live-example) if you're interested.



{@a reactive}
## Reactive Forms

In the template-driven approach, you markup the template with form elements, validation attributes, 
and `ng...` directives from the Angular `FormsModule`.
At runtime, Angular interprets the template and derives its _form control model_.

**Reactive Forms** takes a different approach. 
You create the form control model in code. You write the template with form elements
and`form...` directives from the Angular `ReactiveFormsModule`.
At runtime, Angular binds the template elements to your control model based on your instructions.

This approach requires a bit more effort. *You have to write the control model and manage it*.

In return, you can
* add, change, and remove validation functions on the fly
* manipulate the control model dynamically from within the component
* [test](#testing) validation and control logic with isolated unit tests.

The third cookbook sample re-writes the hero form in _reactive forms_ style.

### Switch to the _ReactiveFormsModule_
The reactive forms classes and directives come from the Angular `ReactiveFormsModule`, not the `FormsModule`.
The application module for the "Reactive Forms" feature in this sample looks like this:

{@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.module.ts'}

The "Reactive Forms" feature module and component are in the `src/app/reactive` folder. 
Let's focus on the `HeroFormReactiveComponent` there, starting with its template.

### Component template

We begin by changing the `<form>` tag so that it binds the Angular `formGroup` directive in the template
to the `heroForm` property in the component class. 
The `heroForm` is the control model that the component class builds and maintains.


{@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.html' region='form-tag'}

Then we modify the template HTML elements to match the _reactive forms_ style.
Here is the "name" portion of the template again, revised for reactive forms and compared with the template-driven version:
<md-tab-group>

  <md-tab label="hero-form-reactive.component.html (name #3)">
    {@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.html' region='name-with-error-msg'}
  </md-tab>


  <md-tab label="hero-form-template1.component.html (name #2)">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.html' region='name-with-error-msg'}
  </md-tab>


</md-tab-group>

Key changes:
- the validation attributes are gone (except `required`) because we'll be validating in code.

- `required` remains, not for validation purposes (we'll cover that in the code), 
but rather for css styling and accessibility.

A future version of reactive forms will add the `required` HTML validation attribute to the DOM element
(and perhaps the `aria-required` attribute) when the control has the `required` validator function. 

Until then, apply the `required` attribute _and_ add the `Validator.required` function
to the control model, as we'll do below.
- the `formControlName` replaces the `name` attribute; it serves the same
purpose of correlating the input box with the Angular form control.

- the two-way `[(ngModel)]` binding is gone. 
The reactive approach does not use data binding to move data into and out of the form controls.
We do that in code.

The retreat from data binding is a principle of the reactive paradigm rather than a technical limitation.### Component class

The component class is now responsible for defining and managing the form control model. 

Angular no longer derives the control model from the template so we can no longer query for it.
We create the Angular form control model explicitly with the help of the `FormBuilder`.

Here's the section of code devoted to that process, paired with the template-driven code it replaces:
<md-tab-group>

  <md-tab label="reactive/hero-form-reactive.component.ts (FormBuilder)">
    {@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.ts' region='form-builder'}
  </md-tab>


  <md-tab label="template/hero-form-template2.component.ts (ViewChild)">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.ts' region='view-child'}
  </md-tab>


</md-tab-group>

- we inject the `FormBuilder` in a constructor.

- we call a `buildForm` method in the `ngOnInit` [lifecycle hook method](../guide/lifecycle-hooks.html#hooks-overview)
because that's when we'll have the hero data. We'll call it again in the `addHero` method.
A real app would retrieve the hero asynchronously from a data service, a task best performed in the `ngOnInit` hook.- the `buildForm` method uses the `FormBuilder` (`fb`) to declare the form control model.
Then it attaches the same `onValueChanged` handler (there's a one line difference) 
to the form's `valueChanged` event and calls it immediately 
to set error messages for the new control model.
#### _FormBuilder_ declaration
The `FormBuilder` declaration object specifies the three controls of the sample's hero form. 

Each control spec is a control name with an array value. 
The first array element is the current value of the corresponding hero field.
The (optional) second value is a validator function or an array of validator functions.

Most of the validator functions are stock validators provided by Angular as static methods of the `Validators` class.
Angular has stock validators that correspond to the standard HTML validation attributes.

The `forbiddenNames` validator on the `"name"` control is a custom validator, 
discussed in a separate [section below](#custom-validation).

 Learn more about `FormBuilder` in a _forthcoming_ chapter on reactive forms. 
#### Committing hero value changes

In two-way data binding, the user's changes flow automatically from the controls back to the data model properties.
Reactive forms do not use data binding to update data model properties. 
The developer decides _when and how_ to update the data model from control values.

This sample updates the model twice:
1. when the user submits the form
1. when the user chooses to add a new hero

The `onSubmit` method simply replaces the `hero` object with the combined values of the form:

{@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.ts' region='on-submit'}


This example is "lucky" in that the `heroForm.value` properties _just happen_ to
correspond _exactly_ to the hero data object properties.The `addHero` method discards pending changes and creates a brand new `hero` model object.

{@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.ts' region='add-hero'}

Then it calls `buildForm` again which replaces the previous `heroForm` control model with a new one.
The `<form>` tag's `[formGroup]` binding refreshes the page with the new control model.

Here's the complete reactive component file, compared to the two template-driven component files.
<md-tab-group>

  <md-tab label="reactive/hero-form-reactive.component.ts (#3)">
    {@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.ts'}
  </md-tab>


  <md-tab label="template/hero-form-template2.component.ts (#2)">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.ts'}
  </md-tab>


  <md-tab label="template/hero-form-template1.component.ts (#1)">
    {@example 'cb-form-validation/ts/src/app/template/hero-form-template1.component.ts'}
  </md-tab>


</md-tab-group>


Run the [live example](#live-example) to see how the reactive form behaves
and to compare all of the files in this cookbook sample.



{@a custom-validation}
## Custom validation
This cookbook sample has a custom `forbiddenNamevalidator` function that's applied to both the 
template-driven and the reactive form controls. It's in the `src/app/shared` folder
and declared in the `SharedModule`.

Here's the `forbiddenNamevalidator` function itself:

{@example 'cb-form-validation/ts/src/app/shared/forbidden-name.directive.ts' region='custom-validator'}

The function is actually a factory that takes a regular expression to detect a _specific_ forbidden name
and returns a validator function.

In this sample, the forbidden name is "bob"; 
the validator rejects any hero name containing "bob".
Elsewhere it could reject "alice" or any name that the configuring regular expression matches.

The `forbiddenNamevalidator` factory returns the configured validator function.
That function takes an Angular control object and returns _either_
null if the control value is valid _or_ a validation error object.
The validation error object typically has a property whose name is the validation key ('forbiddenName')
and whose value is an arbitrary dictionary of values that we could insert into an error message (`{name}`).

Learn more about validator functions in a _forthcoming_ chapter on custom form validation.#### Custom validation directive
In the reactive forms component we added a configured `forbiddenNamevalidator`
to the bottom of the `'name'` control's validator function list.

{@example 'cb-form-validation/ts/src/app/reactive/hero-form-reactive.component.ts' region='name-validators'}

In the template-driven component template, we add the selector (`forbiddenName`) of a custom _attribute directive_ to the name's input box
and configured it to reject "bob".

{@example 'cb-form-validation/ts/src/app/template/hero-form-template2.component.html' region='name-input'}

The corresponding `ForbiddenValidatorDirective` is a wrapper around the `forbiddenNamevalidator`.

Angular forms recognizes the directive's role in the validation process because the directive registers itself
with the `NG_VALIDATORS` provider, a provider with an extensible collection of validation directives.

{@example 'cb-form-validation/ts/src/app/shared/forbidden-name.directive.ts' region='directive-providers'}

The rest of the directive is unremarkable and we present it here without further comment.

{@example 'cb-form-validation/ts/src/app/shared/forbidden-name.directive.ts' region='directive'}


See the [Attribute Directives](../guide/attribute-directives.html) chapter.



{@a testing}
## Testing Considerations

We can write _isolated unit tests_ of validation and control logic in _Reactive Forms_.

_Isolated unit tests_ probe the component class directly, independent of its
interactions with its template, the DOM, other dependencies, or Angular itself.

Such tests have minimal setup, are quick to write, and easy to maintain.
They do not require the `Angular TestBed` or asynchronous testing practices.

That's not possible with _Template-driven_ forms.
The template-driven approach relies on Angular to produce the control model and 
to derive validation rules from the HTML validation attributes.
You must use the `Angular TestBed` to create component test instances,
write asynchronous tests, and interact with the DOM.

While not difficult, this takes more time, work and skill &mdash; 
factors that tend to diminish test code coverage and quality.