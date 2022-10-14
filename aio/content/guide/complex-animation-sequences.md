# Complex animation sequences

Angular also lets you animate coordinated sequences, such as an entire grid or list of elements as they enter and leave a page.
You can choose to run multiple animations in parallel, or run discrete animations sequentially, one following another.

## Prerequisites

A basic understanding of the following concepts:

*   [Introduction to Angular animations](guide/animations)
*   [Transition and triggers](guide/transition-and-triggers)

## Animation sequence functions

The functions that control complex animation sequences are:

| Functions                         | Details |
|:---                               |:---     |
| `query()`                         | Finds one or more inner HTML elements. |
| `stagger()`                       | Applies a cascading delay to animations for multiple elements. |
| [`group()`](api/animations/group) | Runs multiple animation steps in parallel. |
| `sequence()`                      | Runs animation steps one after another. |

<a id="complex-sequence"></a>

## The query() function

Most complex animations rely on the `query()` function to find child elements and apply animations to them, basic examples of such are:

| Examples                               | Details |
|:---                                    |:---     |
| `query()` followed by `animate()`      | Used to query simple HTML elements and directly apply animations to them.                                                                                                                            |
| `query()` followed by `animateChild()` | Used to query child elements, which themselves have animations metadata applied to them and trigger such animation that would otherwise be blocked by the current/parent element's animation. |

The first argument of `query()` is a [css selector](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) string which can also contain the following Angular-specific tokens:

| Tokens                     | Details |
|:---                        |:---     |
| `:enter` <br /> `:leave`   | For entering/leaving elements.               |
| `:animating`               | For elements currently animating.            |
| `@*` <br /> `@triggerName` | For elements with any—or a specific—trigger. |
| `:self`                    | The animating element itself.                |

<div class="callout is-helpful">

<header>Entering and Leaving Elements</header>

Not all child elements are actually considered as entering/leaving. This can, at times, be counterintuitive and confusing. Please see the [query api docs](api/animations/query#entering-and-leaving-elements) for more information.

You can also see an illustration of this in the animations live example \(introduced in the animations [introduction section](guide/animations#about-this-guide)\) under the Querying tab.

</div>

## Animate multiple elements using query() and stagger() functions

After querying child elements via `query()`, the `stagger()` function lets you define a timing gap between each queried item that is animated. This animates elements with a delay between them.

The following example demonstrates how to use the `query()` and `stagger()` functions to animate a list, adding each in sequence with a slight delay from top to bottom.

*   Use `query()` to look for an element entering the page that meets certain criteria
*   For each of these elements, use `style()` to set the same initial style for the element.
    Make it transparent and use `transform` to move it out of position so that it can slide into place.

*   Use `stagger()` to delay each animation by 30 milliseconds
*   Animate each element on screen for 0.5 seconds using a custom-defined easing curve, simultaneously fading it in and un-transforming it

<code-example header="src/app/hero-list-page.component.ts" path="animations/src/app/hero-list-page.component.ts" region="page-animations"></code-example>

## Parallel animation using group() function

Animations can be configured to happen in parallel using the `group()` function. For example, you might want to animate two CSS properties of the same element but use a different `easing` function for each one.
For this, you can use the animation [`group()`](api/animations/group) function.

<div class="alert is-helpful">

**NOTE**: <br />
The [`group()`](api/animations/group) function is used to group animation *steps*, rather than animated elements.

</div>

The following example uses [`group()`](api/animations/group)s on both `:enter` and `:leave` for two different timing configurations, thus applying two independent animations to the same element in parallel.

<code-example header="src/app/hero-list-groups.component.ts (excerpt)" path="animations/src/app/hero-list-groups.component.ts" region="animationdef"></code-example>

## Sequential vs. parallel animations

Complex animations can have many things happening at the same time. Use the `sequence()` function to create an animation involving several animations happening one after the other.
Within `sequence()`, the animation steps consist of either `style()` or `animate()` function calls.

*   Use `style()` to apply the provided styling data immediately.
*   Use `animate()` to apply styling data over a given time interval.

## Filter animation example

Take a look at another animation on the live example page.
Under the Filter/Stagger tab, enter some text into the **Search Heroes** text box, such as `Magnet` or `tornado`.

The filter works in real time as you type.
Elements leave the page as you type each new letter and the filter gets progressively stricter.
The heroes list gradually re-enters the page as you delete each letter in the filter box.

The HTML template contains a trigger called `filterAnimation`.

<code-example header="src/app/hero-list-page.component.html" path="animations/src/app/hero-list-page.component.html" region="filter-animations"></code-example>

The `filterAnimation` in the component's decorator contains three transitions.

<code-example header="src/app/hero-list-page.component.ts" path="animations/src/app/hero-list-page.component.ts" region="filter-animations"></code-example>

The code in this example performs the following tasks:

*   Skips animations when the user first opens or navigates to this page \(the filter animation narrows what is already there, so it only works on elements that already exist in the DOM\)
*   Filters heroes based on the search input's value

For each change:

*   Hides an element leaving the DOM by setting its opacity and width to 0
*   Animates an element entering the DOM over 300 milliseconds.
    During the animation, the element assumes its default width and opacity.

*   If there are multiple elements entering or leaving the DOM, staggers each animation starting at the top of the page, with a 50-millisecond delay between each element

## Animate the items of a reordering list

Although Angular animates correctly `*ngFor` list items out of the box, it cannot do so if their ordering changes.
This is because it loses track of which element is which, resulting in broken animations.

The only way to help Angular keep track of such elements is by assigning a `TrackByFunction` to the `NgForOf` directive.
This makes sure that Angular always knows which element is which, thus allowing it to apply the correct animations to the correct elements all the time.

<div class="alert is-important">

**IMPORTANT**: <br />
When animating the items of an `*ngFor` list with a possibility that the order of such items may change during runtime, always use a `TrackByFunction`.

</div>

## Animations and component view encapsulation

Angular animations are based on the components DOM structure and do not directly take [View Encapsulation](/guide/view-encapsulation) into account. This means that components using `ViewEncapsulation.Emulated` behave exactly as if they where using `ViewEncapsulation.None` (`ViewEncapsulation.ShadowDom` behaves differently).

The `query()` function applied at the top of a component tree using the emulated view encapsulation, can identify DOM elements on any depth of the tree.

The `ViewEncapsulation.ShadowDom` changes the component's DOM structure by "hiding" DOM elements inside [`ShadowRoot`](https://developer.mozilla.org/en-US/docs/Web/API/ShadowRoot) elements. Such DOM manipulations prevent some of the animations implementation from working properly since it relies on simple DOM structures and doesn't take `ShadowRoot` elements into account. Because of this, it is advised to avoid applying animations to views incorporating components using the ShadowDom view encapsulation.

## Animation sequence summary

Angular functions for animating multiple elements start with `query()` to find inner elements, such as gathering all images within a `<div>`.
The remaining functions, `stagger()`, [`group()`](api/animations/group), and `sequence()`, apply cascades or let you control how multiple animation steps are applied.

## More on Angular animations

You might also be interested in the following:

*   [Introduction to Angular animations](guide/animations)
*   [Transition and triggers](guide/transition-and-triggers)
*   [Reusable animations](guide/reusable-animations)
*   [Route transition animations](guide/route-animations)

@reviewed 2022-10-14
