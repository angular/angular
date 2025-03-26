# Migrating away from Angular's Animations package

Almost all of what the Angular Animations package provides can now be accomplished via native CSS animations.
You may consider removing the Angular Animations package from your application to save on some bytes, as the
package adds ~60 kilobytes to every application that uses it. We'll guide you through the process of how to
migrate your app off of the Animations Package and on to native CSS animations.

## How to write animations in native CSS

If you've never written any native CSS animations, there are a number of excellent guides to get you started.
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations]) is a great primer. Start there and then come back to this guide.

## Creating Reusable Animations

Just like with the animations package, you can create reusable animations that can be shared across your application. The animations package version of this had you using the `animation()` function in a shared typescript file. The native CSS version of this is similar, but lives in a shared CSS file.

Here's an example of creating a reusable animation with the animations package:

<docs-code header="src/app/animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" visibleRegion="animation-example"/>

Here's how this same animation would be defined without the animations package.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-shared"/>

Adding the class `animated-class` to an element would trigger the animation on that element.

## Animating State and Styles

The animations package allowed you to define various states using the [`state()`](api/animations/state) function within a component. Examples might be an `open` or `closed` state containing the styles for each respective state within the definition. For example:

<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="state1"/>

This same behavior can be accomplished natively by using CSS classes either using a keyframe animation or transition styling.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-states"/>

Triggering the `open` or `closed` state is done by toggling classes on the element in your component. You can find examples of how to do this in our [template guide](guide/templates/binding#css-class-and-style-property-bindings).

You can see similar examples in the template guide for [animating styles directly](guide/templates/binding#css-style-properties).

## Transitions, Timing, and Easing

The animations package `animate()` function allows for providing timing, like duration, delays and easing. This can be done natively with CSS using several css properties or shorthand properties.

Specify `animation-duration`, `animation-delay`, and `animation-timing-function` for a keyframe animation in CSS, or alternatively use the `animation` shorthand property.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-timing"/>

Similarly, you can use `transition-duration`, `transition-delay`, and `transition-timing-function` and the `transition` shorthand for animations that are not using `@keyframes`.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="transition-timing"/>

## Triggering an Animation

The animations package required specifying triggers using the `trigger()` function and nesting all of your states within it. With native CSS, this is unnecessary. Animations can be triggered by toggling CSS styles or classes. Once a class is present on an element, the animation will occur. Removing the class will revert the element back to whatever CSS is defined for that element. This results in significantly less code to do the same animation.

For example, this is all the code required to trigger an open and close animation for an element using the animations package.

<docs-code-multifile>
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="component"/>
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/open-close.component.1.html" visibleRegion="trigger"/>
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/open-close.component.css"/>
</docs-code-multifile>

And here's the same animation using native CSS.

<docs-code-multifile>
    <docs-code header="src/app/open-close-css.component.ts" path="adev/src/content/examples/animations/src/app/open-close-css.component.ts" />
    <docs-code header="src/app/open-close-css.component.html" path="adev/src/content/examples/animations/src/app/open-close-css.component.html" visibleRegion="trigger"/>
    <docs-code header="src/app/open-close-css.component.css" path="adev/src/content/examples/animations/src/app/open-close-css.component.css"/>
</docs-code-multifile>

