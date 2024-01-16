# Change detection with pipes

Pipes are often used with data-bound values that might change based on user actions.
If the data is a primitive input value, such as `String` or `Number`, or an object reference as input, such as `Date` or `Array`, Angular executes the pipe whenever it detects a change for the value.

<docs-code-multifile path="adev/src/content/examples/pipes/src/app/power-booster.component.ts">
  <docs-code header="src/app/exponential-strength.pipe.ts" path="adev/src/content/examples/pipes/src/app/exponential-strength.pipe.ts"
             highlight="[16]" visibleRegion="pipe-class" />
  <docs-code header="src/app/power-booster.component.ts" path="adev/src/content/examples/pipes/src/app/power-booster.component.ts"/>
</docs-code-multifile>

The `exponentialStrength` pipe executes every time the user changes the value or the exponent. See the highlighted line above.

Angular detects each change and immediately runs the pipe.
This is fine for primitive input values.
However, if you change something *inside* a composite object (such as the month of a date, an element of an array, or an object property), you need to understand how change detection works, and how to use an `impure` pipe.

## How change detection works

Angular looks for changes to data-bound values in a change detection process that runs after every DOM event: every keystroke, mouse move, timer tick, and server response.
The following example, which doesn't use a pipe, demonstrates how Angular uses its default change detection strategy to monitor and update its display of every hero in the `heroes` array.
The example tabs show the following:

| Files                               | Details |
|:---                                 |:---     |
| `flying-heroes.component.html (v1)` | The `*ngFor` repeater displays the hero names.                     |
| `flying-heroes.component.ts (v1)`   | Provides heroes, adds heroes into the array, and resets the array. |

<docs-code-multifile>
    <docs-code header="src/app/flying-heroes.component.html (v1)" path="adev/src/content/examples/pipes/src/app/flying-heroes.component.html" visibleRegion="template-1"/>
    <docs-code header="src/app/flying-heroes.component.ts (v1)" path="adev/src/content/examples/pipes/src/app/flying-heroes.component.ts" visibleRegion="v1"/>
</docs-code-multifile>

Angular updates the display every time the user adds a hero.
If the user clicks the **Reset** button, Angular replaces `heroes` with a new array of the original heroes and updates the display.
If you add the ability to remove or change a hero, Angular would detect those changes and update the display as well.

However, executing a pipe to update the display with every change would slow down your application's performance.
So Angular uses a faster change-detection algorithm for executing a pipe, as described in the next section.

## Detecting pure changes to primitives and object references

By default, pipes are defined as *pure* so that Angular executes the pipe only when it detects a *pure change* to the input value or parameters.
A pure change is either a change to a primitive input value \(such as `String`, `Number`, `Boolean`, or `Symbol`\), or a changed object reference \(such as `Date`, `Array`, `Function`, or `Object`\).

A pure pipe must use a pure function, which is one that processes inputs and returns values without side effects.
In other words, given the same input, a pure function should always return the same output.

With a pure pipe, Angular ignores changes within objects and arrays because checking a primitive value or object reference is much faster than performing a deep check for differences within objects.
Angular can quickly determine if it can skip executing the pipe and updating the view.

However, a pure pipe with an array as input might not work the way you want.
To demonstrate this issue, change the previous example to filter the list of heroes to just those heroes who can fly.

For this, consider we use the `FlyingHeroesPipe` in the `*ngFor` repeater as shown in the following code.
The tabs for the example show the following:

| Files                          | Details |
|:---                            |:---     |
| flying-heroes.component.html   | Template with the new pipe used. |
| flying-heroes.pipe.ts          | File with custom pipe that filters flying heroes. |

<docs-code-multifile path="adev/src/content/examples/pipes/src/app/flying-heroes.component.ts_FlyingHeroesComponent" preview>
    <docs-code header="src/app/flying-heroes.component.html" path="adev/src/content/examples/pipes/src/app/flying-heroes.component.html" visibleRegion="template-flying-heroes"/>
    <docs-code header="src/app/flying-heroes.pipe.ts" path="adev/src/content/examples/pipes/src/app/flying-heroes.pipe.ts" visibleRegion="pure"/>
</docs-code-multifile>

The application now shows unexpected behavior: When the user adds flying heroes, none of them appear under "Heroes who fly."
This happens because the code that adds a hero does so by pushing it onto the `heroes` array that is used as input for the `flyingHeroes` pipe.

<docs-code header="src/app/flying-heroes.component.ts" path="adev/src/content/examples/pipes/src/app/flying-heroes.component.ts" visibleRegion="push"/>

The change detector ignores changes within elements of an array, so the pipe doesn't run.
The reason Angular ignores the changed array element is that the *reference* to the array hasn't changed.
Because the array is the same, Angular does not update the display.

One way to get the behavior you want is to change the object reference itself.
Replace the array with a new array containing the newly changed elements, and then input the new array to the pipe.
In the preceding example, create an array with the new hero appended, and assign that to `heroes`.
Angular detects the change in the array reference and executes the pipe.

To summarize, if you mutate the input array, the pure pipe doesn't execute.
If you *replace* the input array, the pipe executes and the display is updated.
As an alternative, use an *impure* pipe to detect changes within composite objects such as arrays, as described in the next section.

## Detecting impure changes within composite objects

To execute a custom pipe after a change *within* a composite object, such as a change to an element of an array, you need to define your pipe as `impure` to detect impure changes.
Angular executes an impure pipe every time it detects a change (e.g. every keystroke or mouse event).

IMPORTANT: While an impure pipe can be useful, be careful using one.
A long-running impure pipe could dramatically slow down your application.

Make a pipe impure by setting its `pure` flag to `false`:

<docs-code header="src/app/flying-heroes.pipe.ts" path="adev/src/content/examples/pipes/src/app/flying-heroes.pipe.ts"
           visibleRegion="pipe-decorator" highlight="[19]"/>

The following code shows the complete implementation of `FlyingHeroesImpurePipe`, which extends `FlyingHeroesPipe` to inherit its characteristics.
The example shows that you don't have to change anything else&mdash;the only difference is setting the `pure` flag as `false` in the pipe metadata.

<docs-code-multifile>
    <docs-code header="src/app/flying-heroes.pipe.ts (FlyingHeroesImpurePipe)" path="adev/src/content/examples/pipes/src/app/flying-heroes.pipe.ts" visibleRegion="impure"/>
    <docs-code header="src/app/flying-heroes.pipe.ts (FlyingHeroesPipe)" path="adev/src/content/examples/pipes/src/app/flying-heroes.pipe.ts" visibleRegion="pure"/>
</docs-code-multifile>

`FlyingHeroesImpurePipe` is a reasonable candidate for an impure pipe because the `transform` function is trivial and fast:

<docs-code header="src/app/flying-heroes.pipe.ts (filter)" path="adev/src/content/examples/pipes/src/app/flying-heroes.pipe.ts" visibleRegion="filter"/>

You can derive a `FlyingHeroesImpureComponent` from `FlyingHeroesComponent`.
As shown in the following code, only the pipe in the template changes.

<docs-code header="src/app/flying-heroes-impure.component.html (excerpt)" path="adev/src/content/examples/pipes/src/app/flying-heroes-impure.component.html" visibleRegion="template-flying-heroes"/>
