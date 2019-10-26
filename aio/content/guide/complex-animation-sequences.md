# Complex animation sequences

#### Prerequisites

A basic understanding of the following concepts:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)

<hr>

So far, we've learned simple animations of single HTML elements. Angular also lets you animate coordinated sequences, such as an entire grid or list of elements as they enter and leave a page. You can choose to run multiple animations in parallel, or run discrete animations sequentially, one following another.

Functions that control complex animation sequences are as follows:

* `query()` finds one or more inner HTML elements.
* `stagger()` applies a cascading delay to animations for multiple elements.
* [`group()`](api/animations/group) runs multiple animation steps in parallel.
* `sequence()` runs animation steps one after another.

{@a complex-sequence}

## Animate multiple elements using query() and stagger() functions

The `query()` function allows you to find inner elements within the element that is being animated. This function targets specific HTML elements within a parent component and applies animations to each element individually. Angular intelligently handles setup, teardown, and cleanup as it coordinates the elements across the page.

The `stagger()` function allows you to define a timing gap between each queried item that is animated and thus animates elements with a delay between them.

The Filter/Stagger tab in the live example shows a list of heroes with an introductory sequence. The entire list of heroes cascades in, with a slight delay from top to bottom.

The following example demonstrates how to use `query()` and `stagger()` functions on the entry of an animated element.

* Use `query()` to look for an element entering the page that meets certain criteria.

* For each of these elements, use `style()` to set the same initial style for the element. Make it invisible and use `transform` to move it out of position so that it can slide into place.

* Use `stagger()` to delay each animation by 30 milliseconds.

* Animate each element on screen for 0.5 seconds using a custom-defined easing curve, simultaneously fading it in and un-transforming it.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="page-animations" language="typescript"></code-example>

## Parallel animation using group() function

You've seen how to add a delay between each successive animation. But you may also want to configure animations that happen in parallel. For example, you may want to animate two CSS properties of the same element but use a different `easing` function for each one. For this, you can use the animation [`group()`](api/animations/group) function.

<div class="alert is-helpful">

**Note:** The [`group()`](api/animations/group) function is used to group animation *steps*, rather than animated elements.
</div>

In the following example, using groups on both `:enter` and `:leave` allow for two different timing configurations. They're applied to the same element in parallel, but run independently.

<code-example path="animations/src/app/hero-list-groups.component.ts" region="animationdef" header="src/app/hero-list-groups.component.ts (excerpt)" language="typescript"></code-example>

## Sequential vs. parallel animations

Complex animations can have many things happening at once. But what if you want to create an animation involving several animations happening one after the other? Earlier we used [`group()`](api/animations/group) to run multiple animations all at the same time, in parallel.

A second function called `sequence()` lets you run those same animations one after the other. Within `sequence()`, the animation steps consist of either `style()` or `animate()` function calls.

* Use `style()` to apply the provided styling data immediately.
* Use `animate()` to apply styling data over a given time interval.

## Filter animation example

Let's take a look at another animation on the live example page. Under the Filter/Stagger tab, enter some text into the **Search Heroes** text box, such as `Magnet` or `tornado`.

The filter works in real time as you type. Elements leave the page as you type each new letter and the filter gets progressively stricter. The heroes list gradually re-enters the page as you delete each letter in the filter box.

The HTML template contains a trigger called `filterAnimation`.

<code-example path="animations/src/app/hero-list-page.component.html" header="src/app/hero-list-page.component.html" region="filter-animations"></code-example>

The component file contains three transitions.

<code-example path="animations/src/app/hero-list-page.component.ts" header="src/app/hero-list-page.component.ts" region="filter-animations" language="typescript"></code-example>

The animation does the following:

* Ignores any animations that are performed when the user first opens or navigates to this page. The filter narrows what is already there, so it assumes that any HTML elements to be animated already exist in the DOM.

* Performs a filter match for matches.

For each match:

* Hides the element by making it completely transparent and infinitely narrow, by setting its opacity and width to 0.

* Animates in the element over 300 milliseconds. During the animation, the element assumes its default width and opacity.

* If there are multiple matching elements, staggers in each element starting at the top of the page, with a 50-millisecond delay between each element.

## Animation sequence summary

Angular functions for animating multiple elements start with `query()` to find inner elements, for example gathering all images within a `<div>`. The remaining functions, `stagger()`, [`group()`](api/animations/group), and `sequence()`, apply cascades or allow you to control how multiple animation steps are applied.

## More on Angular animations

You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Reusable animations](guide/reusable-animations)
* [Route transition animations](guide/route-animations)
