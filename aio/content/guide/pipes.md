# Pipes

Every application starts out with what seems like a simple task: get data, transform them, and show them to users.
Getting data could be as simple as creating a local variable or as complex as streaming data over a WebSocket.

Once data arrive, you could push their raw `toString` values directly to the view,
but that rarely makes for a good user experience.
For example, in most use cases, users prefer to see a date in a simple format like
<samp>April 15, 1988</samp> rather than the raw string format
<samp>Fri Apr 15 1988 00:00:00 GMT-0700 (Pacific Daylight Time)</samp>.

Clearly, some values benefit from a bit of editing. You may notice that you
desire many of the same transformations repeatedly, both within and across many applications.
You can almost think of them as styles.
In fact, you might like to apply them in your HTML templates as you do styles.

Introducing Angular pipes, a way to write display-value transformations that you can declare in your HTML.

You can run the <live-example></live-example> in Plunker and download the code from there.


## Using pipes

A pipe takes in data as input and transforms it to a desired output.
In this page, you'll use pipes to transform a component's birthday property into
a human-friendly date.


<code-example path="pipes/src/app/hero-birthday1.component.ts" title="src/app/hero-birthday1.component.ts" linenums="false">

</code-example>



Focus on the component's template.


<code-example path="pipes/src/app/app.component.html" region="hero-birthday-template" title="src/app/app.component.html" linenums="false">

</code-example>



Inside the interpolation expression, you flow the component's `birthday` value through the
[pipe operator](guide/template-syntax#pipe) ( | ) to the [Date pipe](api/common/DatePipe)
function on the right. All pipes work this way.


<div class="l-sub-section">



The `Date` and `Currency` pipes need the *ECMAScript Internationalization API*.
Safari and other older browsers don't support it. You can add support with a polyfill.


<code-example language="html">
  &lt;script src="https://cdn.polyfill.io/v2/polyfill.min.js?features=Intl.~locale.en"&gt;&lt;/script&gt;

</code-example>



</div>




## Built-in pipes
Angular comes with a stock of pipes such as
`DatePipe`, `UpperCasePipe`, `LowerCasePipe`, `CurrencyPipe`, and `PercentPipe`.
They are all available for use in any template.


<div class="l-sub-section">



Read more about these and many other built-in pipes in the [pipes topics](api?type=pipe) of the
[API Reference](api); filter for entries that include the word "pipe".

Angular doesn't have a `FilterPipe` or an `OrderByPipe` for reasons explained in the [Appendix](guide/pipes#no-filter-pipe) of this page.


</div>




## Parameterizing a pipe

A pipe can accept any number of optional parameters to fine-tune its output.
To add parameters to a pipe, follow the pipe name with a colon ( : ) and then the parameter value
(such as `currency:'EUR'`). If the pipe accepts multiple parameters, separate the values with colons (such as `slice:1:5`)

Modify the birthday template to give the date pipe a format parameter.
After formatting the hero's April 15th birthday, it renders as **<samp>04/15/88</samp>**:


<code-example path="pipes/src/app/app.component.html" region="format-birthday" title="src/app/app.component.html" linenums="false">

</code-example>



The parameter value can be any valid template expression,
(see the [Template expressions](guide/template-syntax#template-expressions) section of the
[Template Syntax](guide/template-syntax) page)
such as a string literal or a component property.
In other words, you can control the format through a binding the same way you control the birthday value through a binding.

Write a second component that *binds* the pipe's format parameter
to the component's `format` property. Here's the template for that component:


<code-example path="pipes/src/app/hero-birthday2.component.ts" region="template" title="src/app/hero-birthday2.component.ts (template)" linenums="false">

</code-example>



You also added a button to the template and bound its click event to the component's `toggleFormat()` method.
That method toggles the component's `format` property between a short form
(`'shortDate'`) and a longer form (`'fullDate'`).


<code-example path="pipes/src/app/hero-birthday2.component.ts" region="class" title="src/app/hero-birthday2.component.ts (class)" linenums="false">

</code-example>



As you click the button, the displayed date alternates between
"**<samp>04/15/1988</samp>**" and
"**<samp>Friday, April 15, 1988</samp>**".


<figure>
  <img src='generated/images/guide/pipes/date-format-toggle-anim.gif' alt="Date Format Toggle">
</figure>



<div class="l-sub-section">



Read more about the `DatePipe` format options in the [Date Pipe](api/common/DatePipe)
API Reference page.


</div>



## Chaining pipes

You can chain pipes together in potentially useful combinations.
In the following example, to display the birthday in uppercase,
the birthday is chained to the `DatePipe` and on to the `UpperCasePipe`.
The birthday displays as **<samp>APR 15, 1988</samp>**.


<code-example path="pipes/src/app/app.component.html" region="chained-birthday" title="src/app/app.component.html" linenums="false">

</code-example>



This example&mdash;which displays **<samp>FRIDAY, APRIL 15, 1988</samp>**&mdash;chains
the same pipes as above, but passes in a parameter to `date` as well.


<code-example path="pipes/src/app/app.component.html" region="chained-parameter-birthday" title="src/app/app.component.html" linenums="false">

</code-example>




## Custom pipes

You can write your own custom pipes.
Here's a custom pipe named `ExponentialStrengthPipe` that can boost a hero's powers:


<code-example path="pipes/src/app/exponential-strength.pipe.ts" title="src/app/exponential-strength.pipe.ts" linenums="false">

</code-example>



This pipe definition reveals the following key points:

* A pipe is a class decorated with pipe metadata.
* The pipe class implements the `PipeTransform` interface's `transform` method that
accepts an input value followed by optional parameters and returns the transformed value.
* There will be one additional argument to the `transform` method for each parameter passed to the pipe.
Your pipe has one such parameter: the `exponent`.
* To tell Angular that this is a pipe, you apply the
`@Pipe` decorator, which you import from the core Angular library.
* The `@Pipe` decorator allows you to define the
   pipe name that you'll use within template expressions. It must be a valid JavaScript identifier.
   Your pipe's name is `exponentialStrength`.


<div class="l-sub-section">



## The *PipeTransform* interface

The `transform` method is essential to a pipe.
The `PipeTransform` *interface* defines that method and guides both tooling and the compiler.
Technically, it's optional; Angular looks for and executes the `transform` method regardless.

</div>

Now you need a component to demonstrate the pipe.

<code-example path="pipes/src/app/power-booster.component.ts" title="src/app/power-booster.component.ts" linenums="false">
</code-example>

<figure>
  <img src='generated/images/guide/pipes/power-booster.png' alt="Power Booster">
</figure>



Note the following:

* You use your custom pipe the same way you use built-in pipes.
* You must include your pipe in the `declarations` array of the `AppModule`.


<div class="callout is-helpful">

<header>
  Remember the declarations array
</header>


You must manually register custom pipes.
If you don't, Angular reports an error.
In the previous example, you didn't list the `DatePipe` because all
Angular built-in pipes are pre-registered.


</div>



To probe the behavior in the <live-example></live-example>,
change the value and optional exponent in the template.

## Power Boost Calculator

It's not much fun updating the template to test the custom pipe.
Upgrade the example to a "Power Boost Calculator" that combines
your pipe and two-way data binding with `ngModel`.


<code-example path="pipes/src/app/power-boost-calculator.component.ts" title="src/app/power-boost-calculator.component.ts">

</code-example>



<figure>
  <img src='generated/images/guide/pipes/power-boost-calculator-anim.gif' alt="Power Boost Calculator">
</figure>




{@a change-detection}


## Pipes and change detection

Angular looks for changes to data-bound values through a *change detection* process that runs after every DOM event:
every keystroke, mouse move, timer tick, and server response. This could be expensive.
Angular strives to lower the cost whenever possible and appropriate.

Angular picks a simpler, faster change detection algorithm when you use a pipe.

<h3 class="no-toc">No pipe</h3>

In the next example, the component uses the default, aggressive change detection strategy to monitor and update
its display of every hero in the `heroes` array. Here's the template:


<code-example path="pipes/src/app/flying-heroes.component.html" region="template-1" title="src/app/flying-heroes.component.html (v1)" linenums="false">

</code-example>



The companion component class provides heroes, adds heroes into the array, and can reset the array.

<code-example path="pipes/src/app/flying-heroes.component.ts" region="v1" title="src/app/flying-heroes.component.ts (v1)" linenums="false">

</code-example>



You can add heroes and Angular updates the display when you do.
If you click the `reset` button, Angular replaces `heroes` with a new array of the original heroes and updates the display.
If you added the ability to remove or change a hero, Angular would detect those changes and update the display as well.

<h3 class="no-toc"><i>FlyingHeroesPipe</i></h3>

Add a `FlyingHeroesPipe` to the `*ngFor` repeater that filters the list of heroes to just those heroes who can fly.

<code-example path="pipes/src/app/flying-heroes.component.html" region="template-flying-heroes" title="src/app/flying-heroes.component.html (flyers)" linenums="false">

</code-example>



Here's the `FlyingHeroesPipe` implementation, which follows the pattern for custom pipes described earlier.

<code-example path="pipes/src/app/flying-heroes.pipe.ts" region="pure" title="src/app/flying-heroes.pipe.ts" linenums="false">

</code-example>



Notice the odd behavior in the <live-example></live-example>:
when you add flying heroes, none of them are displayed under "Heroes who fly."

Although you're not getting the behavior you want, Angular isn't broken.
It's just using a different change-detection algorithm that ignores changes to the list or any of its items.

Notice how a hero is added:

<code-example path="pipes/src/app/flying-heroes.component.ts" region="push" title="src/app/flying-heroes.component.ts" linenums="false">

</code-example>



You add the hero into the `heroes` array.  The reference to the array hasn't changed.
It's the same array. That's all Angular cares about. From its perspective, *same array, no change, no display update*.

To fix that, create an array with the new hero appended and assign that to `heroes`.
This time Angular detects that the array reference has changed.
It executes the pipe and updates the display with the new array, which includes the new flying hero.

If you *mutate* the array, no pipe is invoked and the display isn't updated;
if you *replace* the array, the pipe executes and the display is updated.
The Flying Heroes application extends the
code with checkbox switches and additional displays to help you experience these effects.


<figure>
  <img src='generated/images/guide/pipes/flying-heroes-anim.gif' alt="Flying Heroes">
</figure>



Replacing the array is an efficient way to signal Angular to update the display.
When do you replace the array? When the data change.
That's an easy rule to follow in *this* example
where the only way to change the data is by adding a hero.

More often, you don't know when the data have changed,
especially in applications that mutate data in many ways,
perhaps in application locations far away.
A component in such an application usually can't know about those changes.
Moreover, it's unwise to distort the component design to accommodate a pipe.
Strive to keep the component class independent of the HTML.
The component should be unaware of pipes.

For filtering flying heroes, consider an *impure pipe*.



## Pure and impure pipes

There are two categories of pipes: *pure* and *impure*.
Pipes are pure by default. Every pipe you've seen so far has been pure.
You make a pipe impure by setting its pure flag to false. You could make the `FlyingHeroesPipe`
impure like this:


<code-example path="pipes/src/app/flying-heroes.pipe.ts" region="pipe-decorator" title="src/app/flying-heroes.pipe.ts" linenums="false">

</code-example>



Before doing that, understand the difference between pure and impure, starting with a pure pipe.

<h3 class="no-toc">Pure pipes</h3>

Angular executes a *pure pipe* only when it detects a *pure change* to the input value.
A pure change is either a change to a primitive input value (`String`, `Number`, `Boolean`, `Symbol`)
or a changed object reference (`Date`, `Array`, `Function`, `Object`).

Angular ignores changes within (composite) objects.
It won't call a pure pipe if you change an input month, add to an input array, or update an input object property.

This may seem restrictive but it's also fast.
An object reference check is fast&mdash;much faster than a deep check for
differences&mdash;so Angular can quickly determine if it can skip both the
pipe execution and a view update.

For this reason, a pure pipe is preferable when you can live with the change detection strategy.
When you can't, you *can* use the impure pipe.


<div class="l-sub-section">



Or you might not use a pipe at all.
It may be better to pursue the pipe's purpose with a property of the component,
a point that's discussed later in this page.


</div>



<h3 class="no-toc">Impure pipes</h3>

Angular executes an *impure pipe*  during every component change detection cycle.
An impure pipe is called often, as often as every keystroke or mouse-move.

With that concern in mind, implement an impure pipe with great care.
An expensive, long-running pipe could destroy the user experience.


{@a impure-flying-heroes}


<h3 class="no-toc">An impure <i>FlyingHeroesPipe</i></h3>

A flip of the switch turns the `FlyingHeroesPipe` into a `FlyingHeroesImpurePipe`.
The complete implementation is as follows:

<code-tabs>

  <code-pane title="FlyingHeroesImpurePipe" path="pipes/src/app/flying-heroes.pipe.ts" region="impure">

  </code-pane>

  <code-pane title="FlyingHeroesPipe" path="pipes/src/app/flying-heroes.pipe.ts" region="pure">

  </code-pane>

</code-tabs>



You inherit from `FlyingHeroesPipe` to prove the point that nothing changed internally.
The only difference is the `pure` flag in the pipe metadata.

This is a good candidate for an impure pipe because the `transform` function is trivial and fast.


<code-example path="pipes/src/app/flying-heroes.pipe.ts" linenums="false" title="src/app/flying-heroes.pipe.ts (filter)" region="filter">

</code-example>



You can derive a `FlyingHeroesImpureComponent` from `FlyingHeroesComponent`.


<code-example path="pipes/src/app/flying-heroes-impure.component.html" linenums="false" title="src/app/flying-heroes-impure.component.html (excerpt)" region="template-flying-heroes">

</code-example>



The only substantive change is the pipe in the template.
You can confirm in the <live-example></live-example> that the _flying heroes_
display updates as you add heroes, even when you mutate the `heroes` array.


{@a async-pipe}
<h3 class="no-toc">The impure <i>AsyncPipe</i></h3>


The Angular `AsyncPipe` is an interesting example of an impure pipe.
The `AsyncPipe` accepts a `Promise` or `Observable` as input
and subscribes to the input automatically, eventually returning the emitted values.

The `AsyncPipe` is also stateful.
The pipe maintains a subscription to the input `Observable` and
keeps delivering values from that `Observable` as they arrive.

This next example binds an `Observable` of message strings
(`message$`) to a view with the `async` pipe.


<code-example path="pipes/src/app/hero-async-message.component.ts" title="src/app/hero-async-message.component.ts">

</code-example>



The Async pipe saves boilerplate in the component code.
The component doesn't have to subscribe to the async data source,
extract the resolved values and expose them for binding,
and have to unsubscribe when it's destroyed
(a potent source of memory leaks).

<h3 class="no-toc">An impure caching pipe</h3>

Write one more impure pipe, a pipe that makes an HTTP request.

Remember that impure pipes are called every few milliseconds.
If you're not careful, this pipe will punish the server with requests.

In the following code, the pipe only calls the server when the request URL changes and it caches the server response.
The code uses the [Angular http](guide/http) client to retrieve data</span>:


<code-example path="pipes/src/app/fetch-json.pipe.ts" title="src/app/fetch-json.pipe.ts">

</code-example>



Now demonstrate it in a harness component whose template defines two bindings to this pipe,
both requesting the heroes from the `heroes.json` file.


<code-example path="pipes/src/app/hero-list.component.ts" title="src/app/hero-list.component.ts">

</code-example>



The component renders as the following:


<figure>
  <img src='generated/images/guide/pipes/hero-list.png' alt="Hero List">
</figure>



A breakpoint on the pipe's request for data shows the following:

* Each binding gets its own pipe instance.
* Each pipe instance caches its own URL and data.
* Each pipe instance only calls the server once.

<h3 class="no-toc"><i>JsonPipe</i></h3>

In the previous code sample, the second `fetch` pipe binding demonstrates more pipe chaining.
It displays the same hero data in JSON format by chaining through to the built-in `JsonPipe`.


<div class="callout is-helpful">



<header>
  Debugging with the json pipe
</header>



The [JsonPipe](api/common/JsonPipe)
provides an easy way to diagnosis a mysteriously failing data binding or
inspect an object for future binding.


</div>



{@a pure-pipe-pure-fn}


<h3 class="no-toc">Pure pipes and pure functions</h3>

A pure pipe uses pure functions.
Pure functions process inputs and return values without detectable side effects.
Given the same input, they should always return the same output.

The pipes discussed earlier in this page are implemented with pure functions.
The built-in `DatePipe` is a pure pipe with a pure function implementation.
So are the `ExponentialStrengthPipe` and `FlyingHeroesPipe`.
A few steps back, you reviewed the `FlyingHeroesImpurePipe`&mdash;an impure pipe with a pure function.

But always implement a *pure pipe* with a *pure function*.
Otherwise, you'll see many console errors regarding expressions that changed after they were checked.



## Next steps

Pipes are a great way to encapsulate and share common display-value
transformations. Use them like styles, dropping them
into your template's expressions to enrich the appeal and usability
of your views.

Explore Angular's inventory of built-in pipes in the [API Reference](api?type=pipe).
Try writing a custom pipe and perhaps contributing it to the community.


{@a no-filter-pipe}



## Appendix: No *FilterPipe* or *OrderByPipe*

Angular doesn't provide pipes for filtering or sorting lists.
Developers familiar with AngularJS know these as `filter` and `orderBy`.
There are no equivalents in Angular.

This isn't an oversight. Angular doesn't offer such pipes because
they perform poorly and prevent aggressive minification.
Both `filter` and `orderBy` require parameters that reference object properties.
Earlier in this page, you learned that such pipes must be [impure](guide/pipes#pure-and-impure-pipes) and that
Angular calls impure pipes in almost every change-detection cycle.

Filtering and especially sorting are expensive operations.
The user experience can degrade severely for even moderate-sized lists when Angular calls these pipe methods many times per second.
`filter` and `orderBy` have often been abused in AngularJS apps, leading to complaints that Angular itself is slow.
That charge is fair in the indirect sense that AngularJS prepared this performance trap
by offering `filter` and `orderBy` in the first place.

The minification hazard is also compelling, if less obvious. Imagine a sorting pipe applied to a list of heroes.
The list might be sorted by hero `name` and `planet` of origin properties in the following way:

<code-example language="html">
  &lt;!-- NOT REAL CODE! -->
  &lt;div *ngFor="let hero of heroes | orderBy:'name,planet'">&lt;/div>
</code-example>



You identify the sort fields by text strings, expecting the pipe to reference a property value by indexing
(such as `hero['name']`).
Unfortunately, aggressive minification manipulates the `Hero` property names so that `Hero.name` and `Hero.planet`
become something like `Hero.a` and `Hero.b`. Clearly `hero['name']` doesn't work.

While some may not care to minify this aggressively,
the Angular product shouldn't prevent anyone from minifying aggressively.
Therefore, the Angular team decided that everything Angular provides will minify safely.

The Angular team and many experienced Angular developers strongly recommend moving
filtering and sorting logic into the component itself.
The component can expose a `filteredHeroes` or `sortedHeroes` property and take control
over when and how often to execute the supporting logic.
Any capabilities that you would have put in a pipe and shared across the app can be
written in a filtering/sorting service and injected into the component.

If these performance and minification considerations don't apply to you, you can always create your own such pipes
(similar to the [FlyingHeroesPipe](guide/pipes#impure-flying-heroes)) or find them in the community.
