# Transforming Data Using Pipes

<div class="alert is-helpful">

  For the sample app used in this topic, see the <live-example></live-example>.

</div>

Use [pipes](guide/glossary#pipe "Definition of a pipe") to transform and format strings, currency amounts, dates, and other display data.

<div class="alert is-important">

To use pipes, you should already know how to use [templates](guide/glossary#template "Definition of a template") and [components](guide/glossary#component "Definition of a component").

</div>

Pipes are simple functions you can use in [template expressions](/guide/glossary#template-expression "Definition of template expression") to accept an input value and return a transformed value.
For example, you would use a pipe to show a date as **April 15, 1988** rather than the raw string format.

Angular provides built-in pipes for typical data transformations, including the following:

* [`DatePipe`](api/common/DatePipe): Formats a date value according to locale rules.
* [`UpperCasePipe`](api/common/UpperCasePipe): Transforms text to all upper case.
* [`LowerCasePipe`](api/common/LowerCasePipe): Transforms text to all lower case.
* [`CurrencyPipe`](api/common/CurrencyPipe): Transforms a number to a currency string, formatted according to locale rules.
* [`DecimalPipe`](/api/common/DecimalPipe): Transforms a number into a string with a decimal point, formatted according to locale rules.
* [`PercentPipe`](api/common/PercentPipe): Transforms a number to a percentage string, formatted according to locale rules.

<div class="alert is-helpful">

  Pipes can help you with internationalization (i18n): the `DatePipe`, `CurrencyPipe`, `DecimalPipe` and `PercentPipe` use locale data to format data.
  For details and examples, see [i18n pipes](/guide/i18n#i18n-pipes "Internationalization (i18n)").

</div>

You can also create pipes to encapsulate custom transformations, and use your custom pipes in template expressions.

## Using a pipe in a template

To apply a pipe, use the pipe operator (`|`) within a template expression, as shown in the following template (`app.component.html`) that displays a birthday, and component that sets the birthday value (`app.component.ts`):

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    region="hero-birthday-template"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday1.component.ts"
    path="pipes/src/app/hero-birthday1.component.ts">
  </code-pane>
</code-tabs>

The component's `birthday` value flows through the
[pipe operator](guide/template-syntax#pipe) ( | ) to the [Date pipe](api/common/DatePipe)
function.

{@a parameterizing-a-pipe}

## Formatting data with parameters and chained pipes

Use optional parameters to fine-tune a pipe's output.
For example, `{{ amount | currency:'EUR' }}` transforms the `amount` to currency in euros.
Follow the pipe name (`currency`) with a colon (`:`) and the parameter value (`'EUR'`).

If the pipe accepts multiple parameters, separate the values with colons.
For example, `{{ slice:1:5 }}` uses the built-in [`SlicePipe`](/api/common/SlicePipe "API reference for SlicePipe") to create a new array or string containing a subset (slice) of the elements starting with element `1` and ending with element `5`.

You can use as a parameter any valid template expression such as a string literal or a component property.

### Example: Formatting a date

The tabs in the following example demonstrates toggling between two different formats (`'shortDate'` and `'fullDate'`):

1. The `app.component.html` template uses a format parameter for the `date` pipe to show the date as **04/15/88**.
2. The `hero-birthday2.component.ts` component binds the pipe's format parameter to the component's `format` property in the `template` section, and adds a button for a click event bound to the component's `toggleFormat()` method.
3. The `hero-birthday2.component.ts` component's `toggleFormat()` method toggles the component's `format` property between a short form
(`'shortDate'`) and a longer form (`'fullDate'`).

<code-tabs>
  <code-pane
    header="src/app/app.component.html"
    region="format-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday2.component.ts (template)"
    region="template"
    path="pipes/src/app/hero-birthday2.component.ts">
  </code-pane>
  <code-pane
    header="src/app/hero-birthday2.component.ts (class)"
    region="class"
    path="pipes/src/app/hero-birthday2.component.ts">
  </code-pane>
</code-tabs>

Clicking the **Toggle Format** button alternates the date format between **04/15/1988** and **Friday, April 15, 1988** as shown in Figure 1.

<div class="lightbox">
  <img src='generated/images/guide/pipes/date-format-toggle-anim.gif' alt="Date Format Toggle">
</div>

**Figure 1.** Clicking the button toggles the date format

<div class="alert is-helpful">

For `date` pipe format options, see [DatePipe](api/common/DatePipe "DatePipe API Reference page").

</div>

### Example: Applying two formats by chaining pipes

You can chain pipes together to apply multiple formats, such as formatting a date and converting it to uppercase characters.

In the following example, the first tab for the `src/app/app.component.html` template chains `DatePipe` and `UpperCasePipe` to display the birthday as **APR 15, 1988**.
The second tab for the `src/app/app.component.html` template passes the `fullDate` parameter to `date` before chaining to `uppercase`, which produces **FRIDAY, APRIL 15, 1988**.

<code-tabs>
  <code-pane
    header="src/app/app.component.html (1)"
    region="chained-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
  <code-pane
    header="src/app/app.component.html (2)"
    region="chained-parameter-birthday"
    path="pipes/src/app/app.component.html">
  </code-pane>
</code-tabs>

{@a Custom-pipes}

## Creating pipes for custom data transformations

Create custom pipes to encapsulate transformations that are not provided with the built-in pipes.
You can then use your custom pipe in template expressions—the same way you use built-in pipes—to transform input values to output values for display.

### Marking a class as a pipe

To mark a class as a pipe and supply configuration metadata, apply the [`@Pipe`](/api/core/Pipe "API reference for Pipe") [decorator](/guide/glossary#decorator--decoration "Definition for decorator") to the class.
The class name must be a valid JavaScript identifier.
Use the class name in template expressions as you would for a built-in pipe.

<div class="alert is-important">

You must include your pipe in the `declarations` field of the `NgModule` metadata in order for it to be available to a template.
You must also register custom pipes.
The [Angular CLI's](cli "CLI Overview and Command Reference") generator registers the pipe automatically.

</div>

### Using the PipeTransform interface

Implement the [`PipeTransform`](/api/core/PipeTransform "API reference for PipeTransform") interface in your custom pipe class to perform the transformation.

Angular invokes the `transform` method with the value of a binding as the first argument, and any parameters as the second argument in list form, and returns the transformed value.

### Example: Transforming a value exponentially

In a game, you may want to implement a transformation that raises a value exponentially to increase a hero's power.
For example, if the hero's score is 2, boosting the hero's power exponentially by 10 produces a score of 1024.
You can use a custom pipe for this transformation.

The following code example shows two tabs:

1. The `exponential-strength.pipe.ts` component defines a custom pipe named `exponentialStrength` with the `transform` method that performs the transformation.
It defines an argument to the `transform` method (`exponent`) for a parameter passed to the pipe.

2. The `power-booster.component.ts` component demonstrates how to use the pipe, specifying a value (`2`) and the exponent parameter (`10`).
Figure 2 shows the output.

<code-tabs>
  <code-pane
    header="src/app/exponential-strength.pipe.ts"
    path="pipes/src/app/exponential-strength.pipe.ts">
  </code-pane>
  <code-pane
    header="src/app/power-booster.component.ts"
    path="pipes/src/app/power-booster.component.ts">
  </code-pane>
</code-tabs>

<div class="lightbox">
  <img src='generated/images/guide/pipes/power-booster.png' alt="Power Booster">
</div>

**Figure 2.** Output from the `exponentialStrength` pipe

<div class="alert is-helpful">

To probe the behavior the `exponentialStrength` pipe in the <live-example></live-example>, change the value and optional exponent in the template.

</div>

{@a change-detection}

## Detecting changes with data binding in pipes

You use [data binding](/guide/glossary#data-binding "Definition of data binding") with a  pipe to display values and respond to user actions.
If the data is a primitive input value, such as `String` or `Number`, or an object reference as input, such as `Date` or `Array`, Angular executes the pipe whenever it detects a change for the input value or reference.

For example, you could change the previous custom pipe example to use two-way data binding with `ngModel` to input the amount and boost factor, as shown in the following code example.

<code-example path="pipes/src/app/power-boost-calculator.component.ts" header="src/app/power-boost-calculator.component.ts">

</code-example>

The `exponentialStrength` pipe executes every time the user changes the "normal power" value and/or the "boost factor", as shown in Figure 3.

<div class="lightbox">
  <img src='generated/images/guide/pipes/power-boost-calculator-anim.gif' alt="Power Boost Calculator">
</div>

**Figure 3.** Changing the amount and boost factor for the `exponentialStrength` pipe

Angular detects each change and immediately runs the pipe.
This is fine for primitive input values.
However, if you change something *inside* a composite object—such as changing just the month of a date, adding an element to an array, or updating an object property—you need to understand how change detection works, and how to use an `impure` pipe.

## How change detection works

Angular looks for changes to data-bound values in a change detection process that runs after every DOM event: every keystroke, mouse move, timer tick, and server response.
The following example, which doesn't use a pipe, demonstrates how Angular uses its default change detection strategy to monitor and update its display of every hero in the `heroes` array.
The example tabs show the following:

1. In the `flying-heroes.component.html (v1)` template, the `*ngFor` repeater displays the hero names.
2. Its companion component class `flying-heroes.component.ts (v1)` provides heroes, adds heroes into the array, and resets the array.

<code-tabs>
  <code-pane
    header="src/app/flying-heroes.component.html (v1)"
    region="template-1"
    path="pipes/src/app/flying-heroes.component.html">
  </code-pane>
  <code-pane
    header="src/app/flying-heroes.component.ts (v1)"
    region="v1"
    path="pipes/src/app/flying-heroes.component.ts">
  </code-pane>
</code-tabs>

Angular updates the display every time the user adds a hero.
If the user clicks the **Reset** button, Angular replaces `heroes` with a new array of the original heroes and updates the display.
If you add the ability to remove or change a hero, Angular would detect those changes and update the display as well.

However, executing a pipe to update the display with every change would slow down your app's performance.
So Angular uses a faster change-detection algorithm for executing a "pure" pipe as described in the next section.

{@a pure-and-impure-pipes}

### Detecting pure changes to primitives and object references

By default, pipes are defined as *pure* so that Angular executes the pipe only when it detects a *pure change* to the input value.
A pure change is either a change to a primitive input value (such as `String`, `Number`, `Boolean`, or `Symbol`), or a changed object reference (such as `Date`, `Array`, `Function`, or `Object`).

{@a pure-pipe-pure-fn}

A pure pipe must use a pure function, which is one that processes inputs and returns values without side effects—given the same input, a pure function should always return the same output.

With a pure pipe, Angular ignores changes within composite objects, such a newly added element of an existing array.
This may seem restrictive, but a primitive value or object reference check is much faster than a deep check for differences within objects.
Angular can quickly determine if it can skip executing the pipe and updating the view.

However, a pure pipe with an array as input may not work the way you want.
To demonstrate this issue, change the previous example to filter the list of heroes to just those heroes who can fly.
Use the `FlyingHeroesPipe` in the `*ngFor` repeater as shown in the following code example.
The tabs show the following:

1. The template (`flying-heroes.component.html (flyers)`) with the new pipe.
2. The `FlyingHeroesPipe` custom pipe implementation (`flying-heroes.pipe.ts`).

<code-tabs>
  <code-pane
    header="src/app/flying-heroes.component.html (flyers)"
    region="template-flying-heroes"
    path="pipes/src/app/flying-heroes.component.html">
  </code-pane>
  <code-pane
    header="src/app/flying-heroes.pipe.ts"
    region="pure"
    path="pipes/src/app/flying-heroes.pipe.ts">
  </code-pane>
</code-tabs>

The app now shows odd behavior—when the user adds flying heroes, none of them appear under "Heroes who fly."
Angular's change-detection algorithm ignores changes to elements of the array.
Since the code for adding a hero is to add it to the `heroes` array, as shown in the example below, the pipe doesn't run.

<code-example path="pipes/src/app/flying-heroes.component.ts" region="push" header="src/app/flying-heroes.component.ts"></code-example>

The problem is that the *reference* to the array hasn't changed.
From Angular's perspective, it's the same array—no change, therefore no display update.

One alternative is to change the object reference itself.
You can replace the array with a new array containing the newly changed elements, and then input the new array to the pipe.
In the above example, you can create an array with the new hero appended, and assign that to `heroes`. Angular detects the change in the array reference and executes the pipe.

In other words, if you mutate the input array, the pure pipe doesn't execute.
If you *replace* the input array, the pipe executes and the display is updated, as shown in Figure 4.

<div class="lightbox">
  <img src='generated/images/guide/pipes/flying-heroes-anim.gif' alt="Flying Heroes">
</div>

**Figure 4.** The `flyingHeroes` pipe filtering the display to flying heroes

Although you can change a component's code to accommodate a pipe (as shown in the above example of replacing an array), the best practice is to keep components as simple as possible and independent of HTML templates that use pipes.
To detect changes within composite objects such as arrays, use an *impure* pipe as described in the next section.

{@a impure-flying-heroes}

## Detecting impure changes within composite objects

To execute a custom pipe after a change *within* a composite object, such as a change to an element of an array, you need to define your pipe as `impure` to detect impure changes.
Angular executes an impure pipe every time it detects a change with every keystroke or mouse movement. 

<div class="alert is-important">

While an impure pipe can be useful, a long-running impure pipe could dramatically slow down your app.

</div>

Make a pipe impure by setting its `pure` flag to `false`:

<code-example path="pipes/src/app/flying-heroes.pipe.ts" region="pipe-decorator" header="src/app/flying-heroes.pipe.ts"></code-example>

The following code example shows the complete implementation of `FlyingHeroesImpurePipe`:

<code-tabs>
  <code-pane
    header="src/app/flying-heroes.pipe.ts (FlyingHeroesImpurePipe)"
    region="impure"
    path="pipes/src/app/flying-heroes.pipe.ts">
  </code-pane>
  <code-pane
    header="src/app/flying-heroes.pipe.ts (FlyingHeroesPipe)"
    region="pure"
    path="pipes/src/app/flying-heroes.pipe.ts">
  </code-pane>
</code-tabs>

`FlyingHeroesImpurePipe` extends `FlyingHeroesPipe` to inherit its characteristics.
This example shows that you don't have to change anything else—the only difference is setting the `pure` flag as `false` in the pipe metadata.
This example is a good candidate for an impure pipe because the `transform` function is trivial and fast.

<code-example path="pipes/src/app/flying-heroes.pipe.ts" header="src/app/flying-heroes.pipe.ts (filter)" region="filter"></code-example>

You can derive a `FlyingHeroesImpureComponent` from `FlyingHeroesComponent`.
As shown in the code below, only the pipe in the template changes.

<code-example path="pipes/src/app/flying-heroes-impure.component.html" header="src/app/flying-heroes-impure.component.html (excerpt)" region="template-flying-heroes"></code-example>

<div class="alert is-helpful">

  To confirm that the display updates as the user adds heroes, see the <live-example></live-example>.

</div>

{@a async-pipe}

## Unwrapping data from an observable

[Observables](/guide/glossary#observable "Definition of observable") let you pass messages between parts of your application.
Observables are recommended for event handling, asynchronous programming, and handling multiple values.
Observables can deliver single or multiple values of any type, either synchronously (as a function delivers a value to its caller) or asynchronously on a schedule.

<div class="alert is-helpful">

For details and examples of observables, see the [Observables Overview](/guide/observables#using-observables-to-pass-values "Using observables to pass values"").

</div>

Your component code needs to subscribe to the observable to consume its values, and when done, unsubscribe.
It also has to extract the resolved values, expose them for binding, and unsubscribe when the observable is destroyed in order to prevent memory leaks.

However, you can use the built-in [`AsyncPipe`](/api/common/AsyncPipe "API description of AsyncPipe") to accept an observable as input and subscribe to the input automatically.
`AsyncPipe` is an impure pipe that saves boilerplate code in your component to maintain a subscription to the input observable and keep delivering values from that observable as they arrive.

The following code example binds an observable of message strings
(`message$`) to a view with the `async` pipe.

<code-example path="pipes/src/app/hero-async-message.component.ts" header="src/app/hero-async-message.component.ts">

</code-example>

{@a no-filter-pipe}

## Caching HTTP requests

To [communicate with backend services using HTTP](/guide/http "Communicating with backend services using HTTP"), the `HttpClient` service uses observables and offers the `HTTPClient.get()` method to fetch data from a server.
The aynchronous method sends an HTTP request, and returns an observable that emits the requested data for the response.

As shown in the previous section, you can use the `AsyncPipe`, which is an impure pipe, to accept an observable as input and subscribe to the input automatically.
You can also create an impure pipe to make and cache an HTTP request.

Impure pipes are called every few milliseconds, which can punish a server with requests.
To avoid performance problems, call the server only when the requested URL changes, as shown in the following example, and use the pipe to cache the server response.
The tabs show the following:

1. The `fetch` pipe (`fetch-json.pipe.ts`).
2. A harness component (`hero-list.component.ts`) for demonstrating the request, using a template that defines two bindings to the pipe requesting the heroes from the `heroes.json` file. The second binding chains the `fetch` pipe with the built-in `JsonPipe` to display the same hero data in JSON format.

<code-tabs>
  <code-pane
    header="src/app/fetch-json.pipe.ts"
    path="pipes/src/app/fetch-json.pipe.ts">
  </code-pane>
  <code-pane
    header="src/app/hero-list.component.ts"
    path="pipes/src/app/hero-list.component.ts">
  </code-pane>
</code-tabs>

In the above example, a breakpoint on the pipe's request for data shows the following:

* Each binding gets its own pipe instance.
* Each pipe instance caches its own URL and data and calls the server only once.

The `fetch` and `fetch-json` pipes display the heroes as shown in Figure 5.

<div class="lightbox">
  <img src='generated/images/guide/pipes/hero-list.png' alt="Hero List">
</div>

**Figure 5.** The `fetch` and `fetch-json` pipes displaying the heroes

<div class="alert is-helpful">

The built-in [JsonPipe](api/common/JsonPipe "API description for JsonPipe") provides a way to diagnose a mysteriously failing data binding or to inspect an object for future binding.

</div>
