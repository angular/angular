@title
Reactive Forms

@intro
Create a reactive form using FormBuilder, groups, and arrays.

@description


_Reactive forms_ is an Angular technique for creating forms in a _reactive_ style.
This guide explains reactive forms as you follow the steps to build a "Hero Detail Editor" form.


{@a toc}

<!--

## Contents

* [Introduction to reactive forms](guide/reactive-forms#intro)
* [Setup](guide/reactive-forms#setup)
* [Create a data model](guide/reactive-forms#data-model)
* [Create a _reactive forms_ component](guide/reactive-forms#create-component)
* [Create its template file](guide/reactive-forms#create-template)
* [Import the _ReactiveFormsModule_](guide/reactive-forms#import)
* [Display the _HeroDetailComponent_](guide/reactive-forms#update)
* [Add a FormGroup](guide/reactive-forms#formgroup)
* [Taking a look at the form model](guide/reactive-forms#json)
* [Introduction to _FormBuilder_](guide/reactive-forms#formbuilder)
* [Validators.required](guide/reactive-forms#validators)
* [Nested FormGroups](guide/reactive-forms#grouping)
* [Inspect _FormControl_ properties](guide/reactive-forms#properties)
* [Set form model data using _setValue_ and _patchValue_](guide/reactive-forms#set-data)
* [Use _FormArray_ to present an array of _FormGroups_](guide/reactive-forms#form-array)
* [Observe control changes](guide/reactive-forms#observe-control)
* [Save form data](guide/reactive-forms#save)

-->

Try the <live-example plnkr="final" title="Reactive Forms (final) in Plunker">Reactive Forms live-example</live-example>.

You can also run the <live-example title="Reactive Forms Demo in Plunker">Reactive Forms Demo</live-example> version
and choose one of the intermediate steps from the "demo picker" at the top.


{@a intro}


## Introduction to Reactive Forms

Angular offers two form-building technologies: _reactive_ forms and _template-driven_ forms.
The two technologies belong to the `@angular/forms` library
and share a common set of form control classes.

But they diverge markedly in philosophy, programming style, and technique.
They even have their own modules: the `ReactiveFormsModule` and the `FormsModule`.

### _Reactive_ forms
Angular _reactive_ forms facilitate a _reactive style_ of programming
that favors explicit management of the data flowing between
a non-UI _data model_ (typically retrieved from a server) and a
UI-oriented _form model_ that retains the states
and values of the HTML controls on screen. Reactive forms offer the ease
of using reactive patterns, testing, and validation.

With _reactive_ forms, you create a tree of Angular form control objects
in the component class and bind them to native form control elements in the
component template, using techniques described in this guide.

You create and manipulate form control objects directly in the
component class. As the component class has immediate access to both the data
model and the form control structure, you can push data model values into
the form controls and pull user-changed values back out. The component can
observe changes in form control state and react to those changes.

One advantage of working with form control objects directly is that value and validity updates
are [always synchronous and under your control](guide/reactive-forms#async-vs-sync "Async vs sync").
You won't encounter the timing issues that sometimes plague a template-driven form
and reactive forms can be easier to unit test.

In keeping with the reactive paradigm, the component
preserves the immutability of the _data model_,
treating it as a pure source of original values.
Rather than update the data model directly,
the component extracts user changes and forwards them to an external component or service,
which does something with them (such as saving them)
and returns a new _data model_ to the component that reflects the updated model state.

Using reactive form directives does not require you to follow all reactive priniciples,
but it does facilitate the reactive programming approach should you choose to use it.

### _Template-driven_ forms

_Template-driven_ forms, introduced in the [Template guide](guide/forms), take a completely different approach.

You place HTML form controls (such as `<input>` and `<select>`) in the component template and
bind them to _data model_ properties in the component, using directives
like `ngModel`.

You don't create Angular form control objects. Angular directives
create them for you, using the information in your data bindings.
You don't push and pull data values. Angular handles that for you with `ngModel`.
Angular updates the mutable _data model_ with user changes as they happen.

For this reason, the `ngModel` directive is not part of the ReactiveFormsModule.

While this means less code in the component class,
[template-driven forms are asynchronous](guide/reactive-forms#async-vs-sync "Async vs sync")
which may complicate development in more advanced scenarios.


{@a async-vs-sync}


### Async vs. sync

Reactive forms are synchronous. Template-driven forms are asynchronous. It's a difference that matters.

In reactive forms, you create the entire form control tree in code.
You can immediately update a value or drill down through the descendents of the parent form
because all controls are always available.

Template-driven forms delegate creation of their form controls to directives.
To avoid "_changed after checked_" errors,
these directives take more than one cycle to build the entire control tree.
That means you must wait a tick before manipulating any of the controls
from within the component class.

For example, if you inject the form control with a `@ViewChild(NgForm)` query and examine it in the
[`ngAfterViewInit` lifecycle hook](guide/lifecycle-hooks#afterview "Lifecycle hooks guide: AfterView"),
you'll discover that it has no children.
You must wait a tick, using `setTimeout`, before you can
extract a value from a control, test its validity, or set it to a new value.

The asynchrony of template-driven forms also complicates unit testing.
You must wrap your test block in `async()` or `fakeAsync()` to
avoid looking for values in the form that aren't there yet.
With reactive forms, everything is available when you expect it to be.

### Which is better, reactive or template-driven?

Neither is "better".
They're two different architectural paradigms,
with their own strengths and weaknesses.
Choose the approach that works best for you.
You may decide to use both in the same application.

The balance of this _reactive forms_ guide explores the _reactive_ paradigm and
concentrates exclusively on reactive forms techniques.
For information on _template-driven forms_, see the [_Forms_](guide/forms) guide.

In the next section, you'll set up your project for the reactive form demo.
Then you'll learn about the [Angular form classes](guide/reactive-forms#essentials) and how to use them in a reactive form.



{@a setup}


## Setup

Follow the steps in the [_Setup_ guide](guide/setup "Setup guide")
for creating a new project folder (perhaps called `reactive-forms`)
based on the _QuickStart seed_.



{@a data-model}


## Create a data model
The focus of this guide is a reactive forms component that edits a hero.
You'll need a `hero` class and some hero data.
Create a new `data-model.ts` file in the `app` directory and copy the content below into it.


<code-example path="reactive-forms/src/app/data-model.ts" title="src/app/data-model.ts" linenums="false">

</code-example>



The file exports two classes and two constants. The `Address`
and `Hero` classes define the application _data model_.
The `heroes` and `states` constants supply the test data.



{@a create-component}


## Create a _reactive forms_ component
Make a new file called
`hero-detail.component.ts` in the `app` directory and import these symbols:


<code-example path="reactive-forms/src/app/hero-detail-1.component.ts" region="imports" title="src/app/hero-detail.component.ts" linenums="false">

</code-example>



Now enter the `@Component` decorator that specifies the `HeroDetailComponent` metadata:


<code-example path="reactive-forms/src/app/hero-detail.component.ts" region="metadata" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



Next, create an exported `HeroDetailComponent` class with a `FormControl`.
`FormControl` is a directive that allows you to create and manage
a `FormControl` instance directly.



<code-example path="reactive-forms/src/app/hero-detail-1.component.ts" region="v1" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



Here you are creating a `FormControl` called `name`.
It will be bound in the template to an HTML `input` box for the hero name.

A `FormControl` constructor accepts three, optional arguments:
the initial data value, an array of validators, and an array of async validators.

This simple control doesn't have data or validators.
In real apps, most form controls have both.


<div class="l-sub-section">



This guide touches only briefly on `Validators`. For an in-depth look at them,
read the [Form Validation](guide/form-validation) guide.


</div>




{@a create-template}


## Create the template

Now create the component's template, `src/app/hero-detail.component.html`, with the following markup.


<code-example path="reactive-forms/src/app/hero-detail-1.component.html" region="simple-control" title="src/app/hero-detail.component.html" linenums="false">

</code-example>



To let Angular know that this is the input that you want to
associate to the `name` `FormControl` in the class,
you need `[formControl]="name"` in the template on the `<input>`.



<div class="l-sub-section">



Disregard the `form-control` _CSS_ class. It belongs to the
<a href="http://getbootstrap.com/" title="Bootstrap CSS">Bootstrap CSS library</a>,
not Angular.
It _styles_ the form but in no way impacts the logic of the form.


</div>



{@a import}


## Import the _ReactiveFormsModule_

The HeroDetailComponent template uses `formControlName`
directive from the `ReactiveFormsModule`.

In this sample, you declare the `HeroDetailComponent` in the `AppModule`.
Therefore, do the following three things in `app.module.ts`:

1. Use a JavaScript `import` statement to access
the `ReactiveFormsModule` and the `HeroDetailComponent`.
1. Add `ReactiveFormsModule` to the `AppModule`'s `imports` list.
1. Add `HeroDetailComponent` to the declarations array.


<code-example path="reactive-forms/src/app/app.module.ts" region="v1" title="src/app/app.module.ts (excerpt)" linenums="false">

</code-example>



{@a update}



## Display the _HeroDetailComponent_
Revise the `AppComponent` template so it displays the `HeroDetailComponent`.

<code-example path="reactive-forms/src/app/app.component.1.ts" title="src/app/app.component.ts" linenums="false">

</code-example>



{@a essentials}


### Essential form classes
It may be helpful to read a brief description of the core form classes.

* [_AbstractControl_](api/forms/AbstractControl "API Reference: AbstractControl")
is the abstract base class for the three concrete form control classes:
`FormControl`, `FormGroup`, and `FormArray`.
It provides their common behaviors and properties, some of which are _observable_.

* [_FormControl_](api/forms/FormControl "API Reference: FormControl")
tracks the value and validity status of an _individual_ form control.
It corresponds to an HTML form control such as an input box or selector.

* [_FormGroup_](api/forms/FormGroup "API Reference: FormGroup")
tracks the value and validity state of a _group_ of `AbstractControl` instances.
The group's properties include its child controls.
The top-level form in your component is a `FormGroup`.

* [_FormArray_](api/forms/FormArray "API Reference: FormArray")
tracks the value and validity state of a numerically indexed _array_ of `AbstractControl` instances.

You'll learn more about these classes as you work through this guide.



### Style the app
You used bootstrap CSS classes in the template HTML of both the `AppComponent` and the `HeroDetailComponent`.
Add the `bootstrap` _CSS stylesheet_ to the head of `index.html`:


<code-example path="reactive-forms/src/index.html" region="bootstrap" title="index.html" linenums="false">

</code-example>



Now that everything is wired up, the browser should display something like this:


<figure>
  <img src="generated/images/guide/reactive-forms/just-formcontrol.png" alt="Single FormControl">
</figure>



{@a formgroup}


## Add a FormGroup
Usually, if you have multiple *FormControls*, you'll want to register
them within a parent `FormGroup`.
This is simple to do. To add a `FormGroup`, add it to the imports section
of `hero-detail.component.ts`:


<code-example path="reactive-forms/src/app/hero-detail-2.component.ts" region="imports" title="src/app/hero-detail.component.ts" linenums="false">

</code-example>



In the class, wrap the `FormControl` in a `FormGroup` called `heroForm` as follows:


<code-example path="reactive-forms/src/app/hero-detail-2.component.ts" region="v2" title="src/app/hero-detail.component.ts" linenums="false">

</code-example>



Now that you've made changes in the class, they need to be reflected in the
template. Update `hero-detail.component.html` by replacing it with the following.


<code-example path="reactive-forms/src/app/hero-detail-2.component.html" region="basic-form" title="src/app/hero-detail.component.html" linenums="false">

</code-example>



Notice that now the single input is in a `form` element. The `novalidate`
attribute in the `<form>` element prevents the browser
from attempting native HTML validations.

`formGroup` is a reactive form directive that takes an existing
`FormGroup` instance and associates it with an HTML element.
In this case, it associates the `FormGroup` you saved as
`heroForm` with the form element.

Because the class now has a `FormGroup`, you must update the template
syntax for associating the input with the corresponding
`FormControl` in the component class.
Without a parent `FormGroup`,
`[formControl]="name"` worked earlier because that directive
can stand alone, that is, it works without being in a `FormGroup`.
With a parent `FormGroup`, the `name` input needs the syntax
`formControlName=name` in order to be associated
with the correct `FormControl`
in the class. This syntax tells Angular to look for the parent
`FormGroup`, in this case `heroForm`, and then _inside_ that group
to look for a `FormControl` called `name`.


<div class="l-sub-section">



Disregard the `form-group` _CSS_ class. It belongs to the
<a href="http://getbootstrap.com/" title="Bootstrap CSS">Bootstrap CSS library</a>,
not Angular.
Like the `form-control` class, it _styles_ the form
but in no way impacts its logic.



</div>



The form looks great. But does it work?
When the user enters a name, where does the value go?


{@a json}


## Taking a look at the form model

The value goes into the **_form model_** that backs the group's `FormControls`.
To see the form model, add the following line after the
closing `form` tag in the `hero-detail.component.html`:


<code-example path="reactive-forms/src/app/hero-detail-3.component.html" region="form-value-json" title="src/app/hero-detail.component.html" linenums="false">

</code-example>



The `heroForm.value` returns the _form model_.
Piping it through the `JsonPipe` renders the model as JSON in the browser:


<figure>
  <img src="generated/images/guide/reactive-forms/json-output.png" alt="JSON output">
</figure>



The initial `name` property value is the empty string.
Type into the _name_ input box and watch the keystokes appear in the JSON.




Great! You have the basics of a form.

In real life apps, forms get big fast.
`FormBuilder` makes form development and maintenance easier.




{@a formbuilder}


## Introduction to _FormBuilder_

The `FormBuilder` class helps reduce repetition and
clutter by handling details of control creation for you.

To use `FormBuilder`, you need to import it into `hero-detail.component.ts`:

<code-example path="reactive-forms/src/app/hero-detail-3a.component.ts" region="imports" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



Use it now to refactor the `HeroDetailComponent` into something that's a little easier to read and write,
by following this plan:

* Explicitly declare the type of the `heroForm` property to be `FormGroup`; you'll initialize it later.
* Inject a `FormBuilder` into the constructor.
* Add a new method that uses the `FormBuilder` to define the `heroForm`; call it `createForm`.
* Call `createForm` in the constructor.

The revised `HeroDetailComponent` looks like this:

<code-example path="reactive-forms/src/app/hero-detail-3a.component.ts" region="v3a" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



`FormBuilder.group` is a factory method that creates a `FormGroup`. &nbsp;
`FormBuilder.group` takes an object whose keys and values are `FormControl` names and their definitions.
In this example, the `name` control is defined by its initial data value, an empty string.

Defining a group of controls in a single object makes for a compact, readable style.
It beats writing an equivalent series of `new FormControl(...)` statements.


{@a validators}


### Validators.required
Though this guide doesn't go deeply into validations, here is one example that
demonstrates the simplicity of using `Validators.required` in reactive forms.

First, import the `Validators` symbol.

<code-example path="reactive-forms/src/app/hero-detail-3.component.ts" region="imports" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



To make the `name` `FormControl` required, replace the `name`
property in the `FormGroup` with an array.
The first item is the initial value for `name`;
the second is the required validator, `Validators.required`.


<code-example path="reactive-forms/src/app/hero-detail-3.component.ts" region="required" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



<div class="l-sub-section">



Reactive validators are simple, composable functions.
Configuring validation is harder in template-driven forms where you must wrap validators in a directive.

</div>



Update the diagnostic message at the bottom of the template to display the form's validity status.


<code-example path="reactive-forms/src/app/hero-detail-3.component.html" region="form-value-json" title="src/app/hero-detail.component.html (excerpt)" linenums="false">

</code-example>



The browser displays the following:


<figure>
  <img src="generated/images/guide/reactive-forms/validators-json-output.png" alt="Single FormControl">
</figure>



`Validators.required` is working. The status is `INVALID` because the input box has no value.
Type into the input box to see the status change from `INVALID` to `VALID`.

In a real app, you'd replace the diagnosic message with a user-friendly experience.


Using `Validators.required` is optional for the rest of the guide.
It remains in each of the following examples with the same configuration.

For more on validating Angular forms, see the
[Form Validation](guide/form-validation) guide.


### More FormControls
A hero has more than a name.
A hero has an address, a super power and sometimes a sidekick too.

The address has a state property. The user will select a state with a `<select>` box and you'll populate
the `<option>` elements with states. So import `states` from `data-model.ts`.

<code-example path="reactive-forms/src/app/hero-detail-4.component.ts" region="imports" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



Declare the `states` property and add some address `FormControls` to the `heroForm` as follows.


<code-example path="reactive-forms/src/app/hero-detail-4.component.ts" region="v4" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



Then add corresponding markup in `hero-detail.component.html`
within the `form` element.


<code-example path="reactive-forms/src/app/hero-detail-4.component.html" title="src/app/hero-detail.component.html" linenums="false">

</code-example>



<div class="alert is-helpful">



*Reminder*: Ignore the many mentions of `form-group`,
`form-control`, `center-block`, and `checkbox` in this markup.
Those are _bootstrap_ CSS classes that Angular itself ignores.
Pay attention to the `formGroupName` and `formControlName` attributes.
They are the Angular directives that bind the HTML controls to the
Angular `FormGroup` and `FormControl` properties in the component class.


</div>



The revised template includes more text inputs, a select box for the `state`, radio buttons for the `power`,
and a checkbox for the `sidekick`.

You must bind the option's value property with `[value]="state"`.
If you do not bind the value, the select shows the first option from the data model.

The component _class_ defines control properties without regard for their representation in the template.
You define the `state`, `power`, and `sidekick` controls the same way you defined the `name` control.
You tie these controls to the template HTML elements in the same way,
specifiying the `FormControl` name with the `formControlName` directive.

See the API reference for more information about
[radio buttons](api/forms/RadioControlValueAccessor "API: RadioControlValueAccessor"),
[selects](api/forms/SelectControlValueAccessor "API: SelectControlValueAccessor"), and
[checkboxes](api/forms/CheckboxControlValueAccessor "API: CheckboxControlValueAccessor").



{@a grouping}


### Nested FormGroups

This form is getting big and unwieldy. You can group some of the related `FormControls`
into a nested `FormGroup`. The `street`, `city`, `state`, and `zip` are properties
that would make a good _address_ `FormGroup`.
Nesting groups and controls in this way allows you to
mirror the hierarchical structure of the data model
and helps track validation and state for related sets of controls.

You used the `FormBuilder` to create one `FormGroup` in this component called `heroForm`.
Let that be the parent `FormGroup`.
Use `FormBuilder` again to create a child `FormGroup` that encapsulates the address controls;
assign the result to a new `address` property of the parent `FormGroup`.

<code-example path="reactive-forms/src/app/hero-detail-5.component.ts" region="v5" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



You’ve changed the structure of the form controls in the component class;
you must make corresponding adjustments to the component template.

In `hero-detail.component.html`, wrap the address-related `FormControls` in a `div`.
Add a `formGroupName` directive to the `div` and bind it to `"address"`.
That's the property of the _address_ child `FormGroup` within the parent `FormGroup` called `heroForm`.

To make this change visually obvious, slip in an `<h4>` header near the top with the text, _Secret Lair_.
The new _address_ HTML looks like this:


<code-example path="reactive-forms/src/app/hero-detail-5.component.html" region="add-group" title="src/app/hero-detail.component.html (excerpt)" linenums="false">

</code-example>



After these changes, the JSON output in the browser shows the revised _form model_
with the nested address `FormGroup`:


<figure>
  <img src="generated/images/guide/reactive-forms/address-group.png" alt="JSON output">
</figure>



Great! You’ve made a group and you can see that the template
and the form model are talking to one another.



{@a properties}


## Inspect _FormControl_ Properties
At the moment, you're dumping the entire form model onto the page.
Sometimes you're interested only in the state of one particular `FormControl`.

You can inspect an individual `FormControl` within a form by extracting it with the `.get()` method.
You can do this _within_ the component class or display it on the
page by adding the following to the template,
immediately after the `{{form.value | json}}` interpolation as follows:


<code-example path="reactive-forms/src/app/hero-detail-5.component.html" region="inspect-value" title="src/app/hero-detail.component.html" linenums="false">

</code-example>



To get the state of a `FormControl` that’s inside a `FormGroup`, use dot notation to path to the control.


<code-example path="reactive-forms/src/app/hero-detail-5.component.html" region="inspect-child-control" title="src/app/hero-detail.component.html" linenums="false">

</code-example>



You can use this technique to display _any_ property of a `FormControl`
such as one of the following:

<style>
  td, th {vertical-align: top}
</style>



<table width="100%">

  <col width="10%">

  </col>

  <col width="90%">

  </col>

  <tr>

    <th>
      Property
    </th>

    <th>
      Description
    </th>

  </tr>

  <tr>

    <td>
      <code>myControl.value</code>
    </td>

    <td>


      the value of a `FormControl`.
    </td>

  </tr>

  <tr>

    <td>
      <code>myControl.status</code>
    </td>

    <td>


      the validity of a `FormControl`. Possible values: `VALID`,
       `INVALID`, `PENDING`, or `DISABLED`.
    </td>

  </tr>

  <tr>

    <td>
      <code>myControl.pristine</code>
    </td>

    <td>


      `true` if the user has _not_ changed the value in the UI.
      Its opposite is `myControl.dirty`.
    </td>

  </tr>

  <tr>

    <td>
      <code>myControl.untouched</code>
    </td>

    <td>


      `true` if the control user has not yet entered the HTML control
       and triggered its blur event. Its opposite is `myControl.touched`.

    </td>

  </tr>

</table>



Learn about other `FormControl` properties in the
[_AbstractControl_](api/forms/AbstractControl) API reference.

One common reason for inspecting `FormControl` properties is to
make sure the user entered valid values.
Read more about validating Angular forms in the
[Form Validation](guide/form-validation) guide.



{@a data-model-form-model}


## The _data model_ and the _form model_

At the moment, the form is displaying empty values.
The `HeroDetailComponent` should display values of a hero,
possibly a hero retrieved from a remote server.

In this app, the `HeroDetailComponent` gets its hero from a parent `HeroListComponent`

The `hero` from the server is the **_data model_**.
The `FormControl` structure is the **_form model_**.

The component must copy the hero values in the _data model_ into the _form model_.
There are two important implications:

1. The developer must understand how the properties of the _data model_
map to the properties of the _form model_.

2. User changes flow from the DOM elements to the _form model_, not to the _data model_.
The form controls never update the _data model_.

The _form_ and _data_ model structures need not match exactly.
You often present a subset of the _data model_ on a particular screen.
But it makes things easier if the shape of the _form model_ is close to the shape of the _data model_.

In this `HeroDetailComponent`, the two models are quite close.

Recall the definition of `Hero` in `data-model.ts`:

<code-example path="reactive-forms/src/app/data-model.ts" region="model-classes" title="src/app/data-model.ts (classes)" linenums="false">

</code-example>



Here, again, is the component's `FormGroup` definition.


<code-example path="reactive-forms/src/app/hero-detail-6.component.ts" region="hero-form-model" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



There are two significant differences between these models:

1. The `Hero` has an `id`. The form model does not because you generally don't show primary keys to users.

1. The `Hero` has an array of addresses. This form model presents only one address,
a choice [revisited below](guide/reactive-forms#form-array "Form arrays").

Nonetheless, the two models are pretty close in shape and you'll see in a moment how this alignment facilitates copying the _data model_ properties
to the _form model_ with the `patchValue` and `setValue` methods.


Take a moment to refactor the _address_ `FormGroup` definition for brevity and clarity as follows:

<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="address-form-group" title="src/app/hero-detail-7.component.ts" linenums="false">

</code-example>



Also be sure to update the import from `data-model` so you can reference the `Hero` and `Address` classes:

<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="import-address" title="src/app/hero-detail-7.component.ts" linenums="false">

</code-example>




{@a set-data}


## Populate the form model with _setValue_ and _patchValue_
Previously you created a control and initialized its value at the same time.
You can also initialize or reset the values _later_ with the
`setValue` and `patchValue` methods.

### _setValue_
With **`setValue`**, you assign _every_ form control value _at once_
by passing in a data object whose properties exactly match the _form model_ behind the `FormGroup`.


<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="set-value" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



The `setValue` method checks the data object thoroughly before assigning any form control values.

It will not accept a data object that doesn't match the FormGroup structure or is
missing values for any control in the group. This way, it can return helpful
error messages if you have a typo or if you've nested controls incorrectly.
`patchValue` will fail silently.

On the other hand,`setValue` will catch
the error and report it clearly.

Notice that you can _almost_ use the entire `hero` as the argument to `setValue`
because its shape is similar to the component's `FormGroup` structure.

You can only show the hero's first address and you must account for the possibility that the `hero` has no addresses at all.
This explains the conditional setting of the `address` property in the data object argument:

<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="set-value-address" title="src/app/hero-detail-7.component.ts" linenums="false">

</code-example>



### _patchValue_
With **`patchValue`**, you can assign values to specific controls in a `FormGroup`
by supplying an object of key/value pairs for just the controls of interest.

This example sets only the form's `name` control.

<code-example path="reactive-forms/src/app/hero-detail-6.component.ts" region="patch-value" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



With **`patchValue`** you have more flexibility to cope with wildly divergent data and form models.
But unlike `setValue`,  `patchValue` cannot check for missing control
values and does not throw helpful errors.

### When to set form model values (_ngOnChanges_)

Now you know _how_ to set the _form model_ values. But _when_ do you set them?
The answer depends upon when the component gets the _data model_ values.

The `HeroDetailComponent` in this reactive forms sample is nested within a _master/detail_ `HeroListComponent` ([discussed below](guide/reactive-forms#hero-list)).
The `HeroListComponent` displays hero names to the user.
When the user clicks on a hero, the list component passes the selected hero into the `HeroDetailComponent`
by binding to its `hero` input property.


<code-example path="reactive-forms/src/app/hero-list.component.1.html" title="hero-list.component.html (simplified)" linenums="false">

</code-example>



In this approach, the value of `hero` in the `HeroDetailComponent` changes
every time the user selects a new hero.
You should call  _setValue_ in the [ngOnChanges](guide/lifecycle-hooks#onchanges)
hook, which Angular calls whenever the input `hero` property changes
as the following steps demonstrate.

First, import the `OnChanges` and `Input` symbols in `hero-detail.component.ts`.


<code-example path="reactive-forms/src/app/hero-detail-6.component.ts" region="import-input" title="src/app/hero-detail.component.ts (core imports)" linenums="false">

</code-example>



Add the `hero` input property.

<code-example path="reactive-forms/src/app/hero-detail-6.component.ts" region="hero" title="src/app/hero-detail-6.component.ts" linenums="false">

</code-example>



Add the `ngOnChanges` method to the class as follows:


<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="ngOnChanges-1" title="src/app/hero-detail.component.ts (ngOnchanges)" linenums="false">

</code-example>



### _reset_ the form flags

You should  reset the form when the hero changes so that
control values from the previous hero are cleared and
status flags are restored to the _pristine_ state.
You could call `reset` at the top of `ngOnChanges` like this.

<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="reset" title="src/app/hero-detail-7.component.ts" linenums="false">

</code-example>



The `reset` method has an optional `state` value so you can reset the flags _and_ the control values at the same time.
Internally, `reset` passes the argument to `setValue`.
A little refactoring and `ngOnChanges` becomes this:

<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="ngOnChanges" title="src/app/hero-detail.component.ts (ngOnchanges - revised)" linenums="false">

</code-example>



{@a hero-list}


### Create the _HeroListComponent_ and _HeroService_

The `HeroDetailComponent` is a nested sub-component of the `HeroListComponent` in a _master/detail_ view.
Together they look a bit like this:


<figure>
  <img src="generated/images/guide/reactive-forms/hero-list.png" alt="HeroListComponent">
</figure>



The `HeroListComponent` uses an injected `HeroService` to retrieve heroes from the server
and then presents those heroes to the user as a series of buttons.
The `HeroService` emulates an HTTP service.
It returns an `Observable` of heroes that resolves after a short delay,
both to simulate network latency and to indicate visually
the necessarily asynchronous nature of the application.

When the user clicks on a hero,
the component sets its `selectedHero` property which
is bound to the `hero` input property of the `HeroDetailComponent`.
The `HeroDetailComponent` detects the changed hero and re-sets its form
with that hero's data values.

A "Refresh" button clears the hero list and the current selected hero before refetching the heroes.

The remaining `HeroListComponent` and `HeroService` implementation details are not relevant to understanding reactive forms.
The techniques involved are covered elsewhere in the documentation, including the _Tour of Heroes_
[here](tutorial/toh-pt3 "ToH: Multiple Components") and [here](tutorial/toh-pt4 "ToH: Services").

If you're coding along with the steps in this reactive forms tutorial,
create the pertinent files based on the
[source code displayed below](guide/reactive-forms#source-code "Reactive Forms source code").
Notice that `hero-list.component.ts` imports `Observable` and `finally` while `hero.service.ts` imports `Observable`, `of`,
and `delay` from `rxjs`.
Then return here to learn about _form array_ properties.



{@a form-array}


## Use _FormArray_ to present an array of _FormGroups_
So far, you've seen `FormControls` and `FormGroups`.
A `FormGroup` is a named object whose property values are `FormControls` and other `FormGroups`.

Sometimes you need to present an arbitrary number of controls or groups.
For example, a hero may have zero, one, or any number of addresses.

The `Hero.addresses` property is an array of `Address` instances.
An _address_ `FormGroup` can display one `Address`.
An Angular `FormArray` can display an array of _address_ `FormGroups`.

To get access to the `FormArray` class, import it into `hero-detail.component.ts`:

<code-example path="reactive-forms/src/app/hero-detail-8.component.ts" region="imports" title="src/app/hero-detail.component.ts (excerpt)" linenums="false">

</code-example>



To _work_ with a `FormArray` you do the following:
1. Define the items (`FormControls` or `FormGroups`) in the array.
1. Initialize the array with items created from data in the _data model_.
1. Add and remove items as the user requires.

In this guide, you define a `FormArray` for `Hero.addresses` and
let the user add or modify addresses (removing addresses is your homework).

You’ll need to redefine the form model in the `HeroDetailComponent` constructor,
which currently only displays the first hero address in an _address_ `FormGroup`.

<code-example path="reactive-forms/src/app/hero-detail-7.component.ts" region="address-form-group" title="src/app/hero-detail-7.component.ts" linenums="false">

</code-example>



### From _address_ to _secret lairs_

From the user's point of view, heroes don't have _addresses_.
_Addresses_ are for mere mortals. Heroes have _secret lairs_!
Replace the _address_ `FormGroup` definition with a _secretLairs_ `FormArray` definition:

<code-example path="reactive-forms/src/app/hero-detail-8.component.ts" region="secretLairs-form-array" title="src/app/hero-detail-8.component.ts" linenums="false">

</code-example>



<div class="alert is-helpful">



Changing the form control name from `address` to `secretLairs` drives home an important point:
the _form model_ doesn't have to match the _data model_.

Obviously there has to be a relationship between the two.
But it can be anything that makes sense within the application domain.

_Presentation_ requirements often differ from _data_ requirements.
The reactive forms approach both emphasizes and facilitates this distinction.


</div>



### Initialize the "secretLairs" _FormArray_

The default form displays a nameless hero with no addresses.

You need a method to populate (or repopulate) the _secretLairs_ with actual hero addresses whenever
the parent `HeroListComponent` sets the `HeroListComponent.hero` input property to a new `Hero`.

The following `setAddresses` method replaces the _secretLairs_ `FormArray` with a new `FormArray`,
initialized by an array of hero address `FormGroups`.

<code-example path="reactive-forms/src/app/hero-detail-8.component.ts" region="set-addresses" title="src/app/hero-detail-8.component.ts" linenums="false">

</code-example>



Notice that you replace the previous `FormArray` with the **`FormGroup.setControl` method**, not with `setValue`.
You're replacing a _control_, not the _value_ of a control.

Notice also that the _secretLairs_ `FormArray` contains **`FormGroups`**, not `Addresses`.

### Get the _FormArray_
The `HeroDetailComponent` should be able to display, add, and remove items from the _secretLairs_ `FormArray`.

Use the `FormGroup.get` method to acquire a reference to that `FormArray`.
Wrap the expression in a `secretLairs` convenience property for clarity and re-use.

<code-example path="reactive-forms/src/app/hero-detail-8.component.ts" region="get-secret-lairs" title="src/app/hero-detail.component.ts (secretLayers property)" linenums="false">

</code-example>



### Display the _FormArray_

The current HTML template displays a single _address_ `FormGroup`.
Revise it to display zero, one, or more of the hero's _address_ `FormGroups`.

This is mostly a matter of wrapping the previous template HTML for an address in a `<div>` and
repeating that `<div>` with `*ngFor`.

The trick lies in knowing how to write the `*ngFor`. There are three key points:

1. Add another wrapping `<div>`, around the `<div>` with `*ngFor`, and
set its `formArrayName` directive to `"secretLairs"`.
This step establishes the _secretLairs_ `FormArray` as the context for form controls in the inner, repeated HTML template.

1. The source of the repeated items is the `FormArray.controls`, not the `FormArray` itself.
Each control is an _address_ `FormGroup`, exactly what the previous (now repeated) template HTML expected.

1. Each repeated `FormGroup` needs a unique `formGroupName` which must be the index of the `FormGroup` in the `FormArray`.
You'll re-use that index to compose a unique label for each address.

Here's the skeleton for the _secret lairs_ section of the HTML template:

<code-example path="reactive-forms/src/app/hero-detail-8.component.html" region="form-array-skeleton" title="src/app/hero-detail.component.html (*ngFor)" linenums="false">

</code-example>



Here's the complete template for the _secret lairs_ section:

<code-example path="reactive-forms/src/app/hero-detail-8.component.html" region="form-array" title="src/app/hero-detail.component.html (excerpt)">

</code-example>



### Add a new lair to the _FormArray_

Add an `addLair` method that gets the _secretLairs_ `FormArray` and appends a new _address_ `FormGroup` to it.

<code-example path="reactive-forms/src/app/hero-detail-8.component.ts" region="add-lair" title="src/app/hero-detail.component.ts (addLair method)" linenums="false">

</code-example>



Place a button on the form so the user can add a new _secret lair_ and wire it to the component's `addLair` method.


<code-example path="reactive-forms/src/app/hero-detail-8.component.html" region="add-lair" title="src/app/hero-detail.component.html (addLair button)" linenums="false">

</code-example>



<div class="alert is-important">



Be sure to **add the `type="button"` attribute**.
In fact, you should always specify a button's `type`.
Without an explict type, the button type defaults to "submit".
When you later add a _form submit_ action, every "submit" button triggers the submit action which
might do something like save the current changes.
You do not want to save changes when the user clicks the _Add a Secret Lair_ button.


</div>



### Try it!

Back in the browser, select the hero named "Magneta".
"Magneta" doesn't have an address, as you can see in the diagnostic JSON at the bottom of the form.


<figure>
  <img src="generated/images/guide/reactive-forms/addresses-array.png" alt="JSON output of addresses array">
</figure>



Click the "_Add a Secret Lair_" button.
A new address section appears. Well done!

### Remove a lair

This example can _add_ addresses but it can't _remove_ them.
For extra credit, write a `removeLair` method and wire it to a button on the repeating address HTML.



{@a observe-control}


## Observe control changes

Angular calls `ngOnChanges` when the user picks a hero in the parent `HeroListComponent`.
Picking a hero changes the `HeroDetailComponent.hero` input property.

Angular does _not_ call `ngOnChanges` when the user modifies the hero's _name_ or _secret lairs_.
Fortunately, you can learn about such changes by subscribing to one of the form control properties
that raises a change event.

These are properties, such as `valueChanges`, that return an RxJS `Observable`.
You don't need to know much about RxJS `Observable` to monitor form control values.

Add the following method to log changes to the value of the _name_ `FormControl`.

<code-example path="reactive-forms/src/app/hero-detail.component.ts" region="log-name-change" title="src/app/hero-detail.component.ts (logNameChange)" linenums="false">

</code-example>



Call it in the constructor, after creating the form.

<code-example path="reactive-forms/src/app/hero-detail-8.component.ts" region="ctor" title="src/app/hero-detail-8.component.ts" linenums="false">

</code-example>



The `logNameChange` method pushes name-change values into a `nameChangeLog` array.
Display that array at the bottom of the component template with this `*ngFor` binding:

<code-example path="reactive-forms/src/app/hero-detail.component.html" region="name-change-log" title="src/app/hero-detail.component.html (Name change log)" linenums="false">

</code-example>



Return to the browser, select a hero (e.g, "Magneta"), and start typing in the _name_ input box.
You should see a new name in the log after each keystroke.

### When to use it

An interpolation binding is the easier way to _display_ a name change.
Subscribing to an observable form control property is handy for triggering
application logic _within_ the component class.



{@a save}


## Save form data

The `HeroDetailComponent` captures user input but it doesn't do anything with it.
In a real app, you'd probably save those hero changes.
In a real app, you'd also be able to revert unsaved changes and resume editing.
After you implement both features in this section, the form will look like this:


<figure>
  <img src="generated/images/guide/reactive-forms/save-revert-buttons.png" alt="Form with save & revert buttons">
</figure>



### Save
In this sample application, when the user submits the form,
the `HeroDetailComponent` will pass an instance of the hero _data model_
to a save method on the injected `HeroService`.

<code-example path="reactive-forms/src/app/hero-detail.component.ts" region="on-submit" title="src/app/hero-detail.component.ts (onSubmit)" linenums="false">

</code-example>



This original `hero` had the pre-save values. The user's changes are still in the _form model_.
So you create a new `hero` from a combination of original hero values (the `hero.id`)
and deep copies of the changed form model values, using the `prepareSaveHero` helper.


<code-example path="reactive-forms/src/app/hero-detail.component.ts" region="prepare-save-hero" title="src/app/hero-detail.component.ts (prepareSaveHero)" linenums="false">

</code-example>



<div class="l-sub-section">



**Address deep copy**

Had you assigned the `formModel.secretLairs` to `saveHero.addresses` (see line commented out),
the addresses in `saveHero.addresses` array would be the same objects
as the lairs in the `formModel.secretLairs`.
A user's subsequent changes to a lair street would mutate an address street in the `saveHero`.

The `prepareSaveHero` method makes copies of the form model's `secretLairs` objects so that can't happen.


</div>



### Revert (cancel changes)
The user cancels changes and reverts the form to the original state by pressing the _Revert_ button.

Reverting is easy. Simply re-execute the `ngOnChanges` method that built the _form model_ from the original, unchanged `hero` _data model_.

<code-example path="reactive-forms/src/app/hero-detail.component.ts" region="revert" title="src/app/hero-detail.component.ts (revert)" linenums="false">

</code-example>



### Buttons
Add the "Save" and "Revert" buttons near the top of the component's template:

<code-example path="reactive-forms/src/app/hero-detail.component.html" region="buttons" title="src/app/hero-detail.component.html (Save and Revert buttons)" linenums="false">

</code-example>



The buttons are disabled until the user "dirties" the form by changing a value in any of its form controls (`heroForm.dirty`).

Clicking a button of type `"submit"` triggers the `ngSubmit` event which calls the component's `onSubmit` method.
Clicking the revert button triggers a call to the component's `revert` method.
Users now can save or revert changes.

This is the final step in the demo.
Try the <live-example plnkr="final" title="Reactive Forms (final) in Plunker"></live-example>.




## Conclusion

This page covered:

* How to create a reactive form component and its corresponding template.
* How to use `FormBuilder` to simplify coding a reactive form.
* Grouping `FormControls`.
* Inspecting `FormControl` properties.
* Setting data with `patchValue` and `setValue`.
* Adding groups dynamically with `FormArray`.
* Observing changes to the value of a `FormControl`.
* Saving form changes.


{@a source-code}


The key files of the final version are as follows:


<code-tabs>

  <code-pane title="src/app/app.component.ts" path="reactive-forms/src/app/app.component.ts">

  </code-pane>

  <code-pane title="src/app/app.module.ts" path="reactive-forms/src/app/app.module.ts">

  </code-pane>

  <code-pane title="src/app/hero-detail.component.ts" path="reactive-forms/src/app/hero-detail.component.ts">

  </code-pane>

  <code-pane title="src/app/hero-detail.component.html" path="reactive-forms/src/app/hero-detail.component.html">

  </code-pane>

  <code-pane title="src/app/hero-list.component.html" path="reactive-forms/src/app/hero-list.component.html">

  </code-pane>

  <code-pane title="src/app/hero-list.component.ts" path="reactive-forms/src/app/hero-list.component.ts">

  </code-pane>

  <code-pane title="src/app/data-model.ts" path="reactive-forms/src/app/data-model.ts">

  </code-pane>

  <code-pane title="src/app/hero.service.ts" path="reactive-forms/src/app/hero.service.ts">

  </code-pane>

</code-tabs>



You can download the complete source for all steps in this guide
from the <live-example title="Reactive Forms Demo in Plunker">Reactive Forms Demo</live-example> live example.
