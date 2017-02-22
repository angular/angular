@title
Forms

@intro
A form creates a cohesive, effective, and compelling data entry experience. An Angular form coordinates a set of data-bound user controls, tracks changes, validates input, and presents errors.

@description
We’ve all used a form to log in, submit a help request, place an order, book a flight,
schedule a meeting, and perform countless other data entry tasks.
Forms are the mainstay of business applications.

Any seasoned web developer can slap together an HTML form with all the right tags.
It's more challenging to create a cohesive data entry experience that guides the
user efficiently and effectively through the workflow behind the form.

*That* takes design skills that are, to be frank, well out of scope for this guide.

It also takes framework support for
**two-way data binding, change tracking, validation, and error handling**
... which we shall cover in this guide on Angular forms.

We will build a simple form from scratch, one step at a time. Along the way we'll learn how to:

- Build an Angular form with a component and template
- Use `ngModel` to create two-way data bindings for reading and writing input control values
- Track state changes and the validity of form controls
- Provide visual feedback using special CSS classes that track the state of the controls
- Display validation errors to users and enable/disable form controls
- Share information across HTML elements using template reference variables

Run the <live-example></live-example>.

## Template-driven forms

Many of us will build forms by writing templates in the Angular [template syntax](./template-syntax.html) with
the form-specific directives and techniques described in this guide.

That's not the only way to create a form but it's the way we'll cover in this guide.We can build almost any form we need with an Angular template &mdash; login forms, contact forms, pretty much any business form.
We can lay out the controls creatively, bind them to data, specify validation rules and display validation errors,
conditionally enable or disable specific controls, trigger built-in visual feedback, and much more.

It will be pretty easy because Angular handles many of the repetitive, boilerplate tasks we'd
otherwise wrestle with ourselves.

We'll discuss and learn to build a template-driven form that looks like this:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/hero-form-1.png" width="400px" alt="Clean Form">  </img>
</figure>

Here at the *Hero Employment Agency* we use this form to maintain personal information about heroes.
Every hero needs a job. It's our company mission to match the right hero with the right crisis!

Two of the three fields on this form are required. Required fields have a green bar on the left to make them easy to spot.

If we delete the hero name, the form displays a validation error in an attention-grabbing style:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/hero-form-2.png" width="400px" alt="Invalid, Name Required">  </img>
</figure>

Note that the submit button is disabled, and the "required" bar to the left of the input control changed from green to red.

We'll customize the colors and location of the "required" bar with standard CSS.
We'll build this form in small steps:

1. Create the `Hero` model class.
1. Create the component that controls the form.
1. Create a template with the initial form layout.
1. Bind data properties to each form control using the `ngModel` two-way data binding syntax.
1. Add a `name` attribute to each form input control.
1. Add custom CSS to provide visual feedback.
1. Show and hide validation error messages.
1. Handle form submission with **ngSubmit**.
1. Disable the form’s submit button until the form is valid.
## Setup

Follow the [setup](setup.html) instructions for creating a new project
named <span ngio-ex>angular-forms</span>.

## Create the Hero model class

As users enter form data, we'll capture their changes and update an instance of a model.
We can't lay out the form until we know what the model looks like.

A model can be as simple as a "property bag" that holds facts about a thing of application importance.
That describes well our `Hero` class with its three required fields (`id`, `name`, `power`)
and one optional field (`alterEgo`).

In the `!{_appDir}` directory, create the following file with the given content:


{@example 'forms/ts/src/app/hero.ts'}

It's an anemic model with few requirements and no behavior. Perfect for our demo.

The TypeScript compiler generates a public field for each `public` constructor parameter and
assigns the parameter’s value to that field automatically when we create new heroes.

The `alterEgo` is optional, so the constructor lets us omit it; note the (?) in `alterEgo?`.

We can create a new hero like this:

## Create a form component

An Angular form has two parts: an HTML-based _template_ and a component _class_ 
to handle data and user interactions programmatically.
We begin with the class because it states, in brief, what the hero editor can do.

Create the following file with the given content:
There’s nothing special about this component, nothing form-specific,
nothing to distinguish it from any component we've written before.

Understanding this component requires only the Angular concepts covered in previous guides.

1. The code imports the Angular core library, and the `Hero` model we just created.
1. The `@Component` selector value of "hero-form" means we can drop this form in a parent template with a `<hero-form>` tag.
1. The `moduleId: module.id` property sets the base for module-relative loading of the `templateUrl`.
1. The `templateUrl` property points to a separate file for the template HTML.
1. We defined dummy data for `model` and `powers`, as befits a demo.
Down the road, we can inject a data service to get and save real data
or perhaps expose these properties as
[inputs and outputs](./template-syntax.html#inputs-outputs) for binding to a
parent component. None of this concerns us now and these future changes won't affect our form.
1. We threw in a `diagnostic` property to return a JSON representation of our model.
It'll help us see what we're doing during our development; we've left ourselves a cleanup note to discard it later.

### Why the separate template file?

Why don't we write the template inline in the component file as we often do elsewhere?

There is no “right” answer for all occasions. We like inline templates when they are short.
Most form templates won't be short. TypeScript and JavaScript files generally aren't the best place to
write (or read) large stretches of HTML and few editors are much help with files that have a mix of HTML and code.
We also like short files with a clear and obvious purpose like this one.

Form templates tend to be quite large even when displaying a small number of fields
so it's usually best to put the HTML template in a separate file.
We'll write that template file in a moment. Before we do, we'll take a step back
and revise the `app.module.ts` and `app.component.ts` to make use of the new `HeroFormComponent`.

## Revise *app.module.ts*

`app.module.ts` defines the application's root module. In it we identify the external modules we'll use in our application
and declare the components that belong to this module, such as our `HeroFormComponent`.

Because template-driven forms are in their own module, we need to add the `FormsModule` to the array of
`imports` for our application module before we can use forms.

Replace the contents of the "QuickStart" version with the following:

{@example 'forms/ts/src/app/app.module.ts'}


There are three changes:

1. We import `FormsModule` and our new `HeroFormComponent`.

1. We add the `FormsModule` to the list of `imports` defined in the `ngModule` decorator. This gives our application
access to all of the template-driven forms features, including `ngModel`.

1. We add the `HeroFormComponent` to the list of `declarations` defined in the `ngModule` decorator. This makes
the `HeroFormComponent` component visible throughout this module.


~~~ {.alert.is-important}

If a component, directive, or pipe belongs to a module in the `imports` array, ​_DON'T_​ re-declare it in the `declarations` array.
If you wrote it and it should belong to this module, ​_DO_​ declare it in the `declarations` array.


~~~


## Revise *app.component.ts*

`AppComponent` is the application's root component. It will host our new `HeroFormComponent`.

Replace the contents of the "QuickStart" version with the following:


{@example 'forms/ts/src/app/app.component.ts'}


There are only two changes.
The `template` is simply the new element tag identified by the component's `selector` property.
This will display the hero form when the application component is loaded.
We've also dropped the `name` field from the class body.

## Create an initial HTML form template

Create the new template file with the following contents:


{@example 'forms/ts/src/app/hero-form.component.html' region='start'}

That is plain old HTML 5. We're presenting two of the `Hero` fields, `name` and `alterEgo`, and
opening them up for user input in input boxes.

The *Name* `<input>` control has the HTML5 `required` attribute;
the *Alter Ego* `<input>` control does not because `alterEgo` is optional.

We've got a *Submit* button at the bottom with some classes on it for styling.

**We are not using Angular yet**. There are no bindings, no extra directives, just layout.

The `container`, `form-group`, `form-control`, and `btn` classes
come from [Twitter Bootstrap](http://getbootstrap.com/css/). Purely cosmetic.
We're using Bootstrap to give the form a little style!


~~~ {.callout.is-important}


<header>
  Angular forms do not require a style library
</header>

Angular makes no use of the `container`, `form-group`, `form-control`, and `btn` classes or
the styles of any external library. Angular apps can use any CSS library, or none at all.


~~~

Let's add the stylesheet. Open `index.html` and add the following link to the `<head>`:

## Add powers with _*ngFor_

Our hero must choose one super power from a fixed list of Agency-approved powers.
We maintain that list internally (in `HeroFormComponent`).

We'll add a `select` to our
form and bind the options to the `powers` list using `ngFor`,
a technique seen previously in the [Displaying Data](./displaying-data.html) guide.

Add the following HTML *immediately below* the *Alter Ego* group:
This code repeats the `<option>` tag for each power in the list of powers.
The `pow` template input variable is a different power in each iteration;
we display its name using the interpolation syntax.

## Two-way data binding with _ngModel_

Running the app right now would be disappointing.

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/hero-form-3.png" width="400px" alt="Early form with no binding">  </img>
</figure>

We don't see hero data because we are not binding to the `Hero` yet.
We know how to do that from earlier guides.
[Displaying Data](./displaying-data.html) taught us property binding.
[User Input](./user-input.html) showed us how to listen for DOM events with an
event binding and how to update a component property with the displayed value.

Now we need to display, listen, and extract at the same time.

We could use the techniques we already know, but
instead we'll introduce something new: the `[(ngModel)]` syntax, which
makes binding the form to the model super easy.

Find the `<input>` tag for *Name* and update it like this:

We added a diagnostic interpolation after the input tag
so we can see what we're doing.
We left ourselves a note to throw it away when we're done.
Focus on the binding syntax: `[(ngModel)]="..."`.

If we run the app right now and started typing in the *Name* input box,
adding and deleting characters, we'd see them appearing and disappearing
from the interpolated text.
At some point it might look like this.

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/ng-model-in-action.png" width="400px" alt="ngModel in action">  </img>
</figure>

The diagnostic is evidence that values really are flowing from the input box to the model and
back again.

That's **two-way data binding**!
For more information about `[(ngModel)]` and two-way data bindings, see
the [Template Syntax](template-syntax.html#ngModel) page.
Notice that we also added a `name` attribute to our `<input>` tag and set it to "name"
which makes sense for the hero's name. Any unique value will do, but using a descriptive name is helpful.
Defining a `name` attribute is a requirement when using `[(ngModel)]` in combination with a form.

Internally Angular creates `FormControl` instances and 
registers them with an `NgForm` directive that Angular attached to the `<form>` tag.
Each `FormControl` is registered under the name we assigned to the `name` attribute.
We'll talk about `NgForm` [later in this guide](#ngForm).
Let's add similar `[(ngModel)]` bindings and `name` attributes to *Alter Ego* and *Hero Power*.
We'll ditch the input box binding message
and add a new binding (at the top) to the component's `diagnostic` property.
Then we can confirm that two-way data binding works *for the entire hero model*.

After revision, the core of our form should look like this:

- Each input element has an `id` property that is used by the `label` element's `for` attribute
to match the label to its input control.
- Each input element has a `name` property that is required by Angular forms to register the control with the form.
If we run the app now and changed every hero model property, the form might display like this:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/ng-model-in-action-2.png" width="400px" alt="ngModel in action">  </img>
</figure>

The diagnostic near the top of the form
confirms that all of our changes are reflected in the model.

**Delete** the `{{diagnostic}}` binding at the top as it has served its purpose.

## Track control state and validity with _ngModel_

A form isn't just about data binding. We'd also like to know the state of the controls in our form.

Using `ngModel` in a form gives us more than just a two way data binding. It also tells
us if the user touched the control, if the value changed, or if the value became invalid.

The *NgModel* directive doesn't just track state; it updates the control with special Angular CSS classes that reflect the state.
We can leverage those class names to change the appearance of the control.

<table>

  <tr>

    <th>
      State
    </th>


    <th>
      Class if true
    </th>


    <th>
      Class if false
    </th>


  </tr>


  <tr>

    <td>
      Control has been visited
    </td>


    <td>
      <code>ng-touched</code>
    </td>


    <td>
      <code>ng-untouched</code>
    </td>


  </tr>


  <tr>

    <td>
      Control's value has changed
    </td>


    <td>
      <code>ng-dirty</code>
    </td>


    <td>
      <code>ng-pristine</code>
    </td>


  </tr>


  <tr>

    <td>
      Control's value is valid
    </td>


    <td>
      <code>ng-valid</code>
    </td>


    <td>
      <code>ng-invalid</code>
    </td>


  </tr>


</table>

Let's temporarily add a [template reference variable](./template-syntax.html#ref-vars) named `spy`
to the _Name_ `<input>` tag and use it to display the input's CSS classes.
Now run the app, and look at the _Name_ input box.
Follow the next four steps *precisely*:

1. Look but don't touch.
1. Click inside the name box, then click outside it.
1. Add slashes to the end of the name.
1. Erase the name.

The actions and effects are as follows:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/control-state-transitions-anim.gif" alt="Control State Transition">  </img>
</figure>

We should see the following transitions and class names:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/ng-control-class-changes.png" width="500px" alt="Control state transitions">  </img>
</figure>

The `ng-valid`/`ng-invalid` pair is the most interesting to us, because we want to send a
strong visual signal when the values are invalid. We also want to mark required fields.
To create such visual feedback, let's add definitions for the `ng-*` CSS classes.

**Delete** the `#spy` template reference variable and the `TODO` as they have served their purpose.

## Add custom CSS for visual feedback

We can mark required fields and invalid data at the same time with a colored bar
on the left of the input box:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/validity-required-indicator.png" width="400px" alt="Invalid Form">  </img>
</figure>

We achieve this effect by adding these class definitions to a new `forms.css` file
that we add to our project as a sibling to `index.html`:


{@example 'forms/ts/src/forms.css'}

Update the `<head>` of `index.html` to include this style sheet:
## Show and hide validation error messages

We can do better. The _Name_ input box is required and clearing it turns the bar red.
That says *something* is wrong but we don't know *what* is wrong or what to do about it.
We can leverage the control's state to reveal a helpful message.

Here's the way it should look when the user deletes the name:

<figure class='image-display'>
  <img src="/resources/images/devguide/forms/name-required-error.png" width="400px" alt="Name required">  </img>
</figure>

To achieve this effect we extend the `<input>` tag with
1. a [template reference variable](./template-syntax.html#ref-vars)
1. the "*is required*" message in a nearby `<div>` which we'll display only if the control is invalid.

Here's an example of adding an error message to the _name_ input box:
We need a template reference variable to access the input box's Angular control from within the template.
Here we created a variable called `name` and gave it the value "ngModel".

Why "ngModel"?
A directive's [exportAs](../api/core/index/Directive-decorator.html) property
tells Angular how to link the reference variable to the directive.
We set `name` to `ngModel` because the `ngModel` directive's `exportAs` property happens to be "ngModel".
We control visibility of the name error message by binding properties of the `name` 
control to the message `<div>` element's `hidden` property.
In this example, we hide the message when the control is valid or pristine;
pristine means the user hasn't changed the value since it was displayed in this form.

This user experience is the developer's choice. Some folks want to see the message at all times.
If we ignore the `pristine` state, we would hide the message only when the value is valid.
If we arrive in this component with a new (blank) hero or an invalid hero,
we'll see the error message immediately, before we've done anything.

Some folks find that behavior disconcerting.
They only want to see the message when the user makes an invalid change.
Hiding the message while the control is "pristine" achieves that goal.
We'll see the significance of this choice when we [add a new hero](#new-hero) to the form.

The hero *Alter Ego* is optional so we can leave that be.

Hero *Power* selection is required.
We can add the same kind of error handling to the `<select>` if we  want,
but it's not imperative because the selection box already constrains the
power to valid values.

We'd like to add a new hero in this form.
We place a "New Hero" button at the bottom of the form and bind its click event to a `newHero` component method.


{@example 'forms/ts/src/app/hero-form.component.html' region='new-hero-button-no-reset'}



{@example 'forms/ts/src/app/hero-form.component.ts' region='new-hero'}

Run the application again, click the *New Hero* button, and the form clears.
The *required* bars to the left of the input box are red, indicating invalid `name` and `power` properties.
That's understandable as these are required fields.
The error messages are hidden because the form is pristine; we haven't changed anything yet.

Enter a name and click *New Hero* again.
The app displays a **_Name is required_** error message! 
We don't want error messages when we create a new (empty) hero.
Why are we getting one now?

Inspecting the element in the browser tools reveals that the *name* input box is _no longer pristine_.
The form remembers that we entered a name before clicking *New Hero*.
Replacing the hero object *did not restore the pristine state* of the form controls.

We have to clear all of the flags imperatively which we can do
by calling the form's `reset()` method after calling the `newHero()` method.


{@example 'forms/ts/src/app/hero-form.component.html' region='new-hero-button-form-reset'}

Now clicking "New Hero" both resets the form and its control flags.

## Submit the form with _ngSubmit_

The user should be able to submit this form after filling it in.
The Submit button at the bottom of the form
does nothing on its own, but it will
trigger a form submit because of its type (`type="submit"`).

A "form submit" is useless at the moment.
To make it useful, bind the form's `ngSubmit` event property
to the hero form component's `onSubmit()` method:
We slipped in something extra there at the end!  We defined a
template reference variable, **`#heroForm`**, and initialized it with the value "ngForm".

The variable `heroForm` is now a reference to the `NgForm` directive that governs the form as a whole.

### The _NgForm_ directive

What `NgForm` directive?
We didn't add an [NgForm](../api/forms/index/NgForm-directive.html) directive!

Angular did. Angular creates and attaches an `NgForm` directive to the `<form>` tag automatically.

The `NgForm` directive supplements the `form` element with additional features.
It holds the controls we created for the elements with an `ngModel` directive 
and `name` attribute, and monitors their properties including their validity.
It also has its own `valid` property which is true only *if every contained
control* is valid.
We'll bind the form's overall validity via
the `heroForm` variable to the button's `disabled` property
using an event binding. Here's the code:
If we run the application now, we find that the button is enabled
&mdash; although it doesn't do anything useful yet.

Now if we delete the Name, we violate the "required" rule, which
is duly noted in the error message.
The Submit button is also disabled.

Not impressed?  Think about it for a moment. What would we have to do to
wire the button's enable/disabled state to the form's validity without Angular's help?

For us, it was as simple as:

1. Define a template reference variable on the (enhanced) form element.
2. Refer to that variable in a button many lines away.

## Toggle two form regions (extra credit)

Submitting the form isn't terribly dramatic at the moment.

An unsurprising observation for a demo. To be honest,
jazzing it up won't teach us anything new about forms.
But this is an opportunity to exercise some of our newly won
binding skills.
If you aren't interested, go ahead and skip to this guide's conclusion.
Let's do something more strikingly visual.
Let's hide the data entry area and display something else.

Start by wrapping the form in a `<div>` and bind
its `hidden` property to the `HeroFormComponent.submitted` property.
The main form is visible from the start because the
`submitted` property is false until we submit the form,
as this fragment from the `HeroFormComponent` shows:
When we click the Submit button, the `submitted` flag becomes true and the form disappears
as planned.

Now the app needs to show something else while the form is in the submitted state.
Add the following HTML below the `<div>` wrapper we just wrote:
There's our hero again, displayed read-only with interpolation bindings.
This `<div>` appears only while the component is in the submitted state.

The HTML includes an _Edit_ button whose click event is bound to an expression
that clears the `submitted` flag.

When we click the _Edit_ button, this block disappears and the editable form reappears.

That's as much drama as we can muster for now.

## Conclusion

The Angular form discussed in this guide takes advantage of the following 
framework features to provide support for data modification, validation, and more:

- An Angular HTML form template.
- A form component class with a `@Component` decorator.
- Handling form submission by binding to the `NgForm.ngSubmit` event property.
- Template reference variables such as `#heroForm` and `#name`.
- `[(ngModel)]` syntax for two-way data binding.
- The use of `name` attributes for validation and form element change tracking.
- The reference variable’s `valid` property on input controls to check if a control is valid and show/hide error messages.
- Controlling the submit button's enabled state by binding to `NgForm` validity.
- Custom CSS classes that provide visual feedback to users about invalid controls.

Our final project folder structure should look like this:

<aio-filetree>

  <aio-folder>
    angular-forms
    <aio-folder>
      src
      <aio-folder>
        app
        <aio-file>
          app.component.ts
        </aio-file>


        <aio-file>
          app.module.ts
        </aio-file>


        <aio-file>
          hero.ts
        </aio-file>


        <aio-file>
          hero-form.component.html
        </aio-file>


        <aio-file>
          hero-form.component.ts
        </aio-file>


      </aio-folder>


      <aio-file>
        main.ts
      </aio-file>


      <aio-file>
        tsconfig.json
      </aio-file>


      <aio-file>
        index.html
      </aio-file>


    </aio-folder>


    <aio-file>
      node_modules ...
    </aio-file>


    <aio-file>
      package.json
    </aio-file>


  </aio-folder>


</aio-filetree>

Here’s the code for the final version of the application:

<md-tab-group>

  <md-tab label="hero-form.component.ts">
    {@example 'forms/ts/src/app/hero-form.component.ts' region='final'}
  </md-tab>


  <md-tab label="hero-form.component.html">
    {@example 'forms/ts/src/app/hero-form.component.html' region='final'}
  </md-tab>


  <md-tab label="hero.ts">
    {@example 'forms/ts/src/app/hero.ts'}
  </md-tab>


  <md-tab label="app.module.ts">
    {@example 'forms/ts/src/app/app.module.ts'}
  </md-tab>


  <md-tab label="app.component.ts">
    {@example 'forms/ts/src/app/app.component.ts'}
  </md-tab>


  <md-tab label="main.ts">
    {@example 'forms/ts/src/main.ts'}
  </md-tab>


  <md-tab label="index.html">
    {@example 'forms/ts/src/index.html'}
  </md-tab>


  <md-tab label="forms.css">
    {@example 'forms/ts/src/forms.css'}
  </md-tab>


</md-tab-group>

