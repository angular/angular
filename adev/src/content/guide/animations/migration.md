# Migrating away from Angular's Animations package

Almost all the features supported by `@angular/animations` have simpler alternatives with native CSS. Consider removing the Angular Animations package from your application, as the package can contribute around 60 kilobytes to your JavaScript bundle. Native CSS animations offer superior performance, as they can benefit from hardware acceleration. Animations defined in the animations package lack that ability. This guide walks through the process of refactoring your code from `@angular/animations` to native CSS animations.

## How to write animations in native CSS

If you've never written any native CSS animations, there are a number of excellent guides to get you started. Here's a few of them:  
[MDN's CSS Animations guide](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_animations/Using_CSS_animations)  
[W3Schools CSS3 Animations guide](https://www.w3schools.com/css/css3_animations.asp)  
[The Complete CSS Animations Tutorial](https://www.lambdatest.com/blog/css-animations-tutorial/)  
[CSS Animation for Beginners](https://thoughtbot.com/blog/css-animation-for-beginners)  

and a couple of videos:  
[Learn CSS Animation in 9 Minutes](https://www.youtube.com/watch?v=z2LQYsZhsFw)  
[Net Ninja CSS Animation Tutorial Playlist](https://www.youtube.com/watch?v=jgw82b5Y2MU&list=PL4cUxeGkcC9iGYgmEd2dm3zAKzyCGDtM5)

Check some of these various guides and tutorials out, and then come back to this guide.

## Creating Reusable Animations

Just like with the animations package, you can create reusable animations that can be shared across your application. The animations package version of this had you using the `animation()` function in a shared typescript file. The native CSS version of this is similar, but lives in a shared CSS file.

#### With Animations Package
<docs-code header="src/app/animations.ts" path="adev/src/content/examples/animations/src/app/animations.1.ts" visibleRegion="animation-example"/>

#### With Native CSS
<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-shared"/>

Adding the class `animated-class` to an element would trigger the animation on that element.

## Animating a Transition

### Animating State and Styles

The animations package allowed you to define various states using the [`state()`](api/animations/state) function within a component. Examples might be an `open` or `closed` state containing the styles for each respective state within the definition. For example:

#### With Animations Package
<docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/open-close.component.ts" visibleRegion="state1"/>

This same behavior can be accomplished natively by using CSS classes either using a keyframe animation or transition styling.

#### With Native CSS
<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-states"/>

Triggering the `open` or `closed` state is done by toggling classes on the element in your component. You can find examples of how to do this in our [template guide](guide/templates/binding#css-class-and-style-property-bindings).

You can see similar examples in the template guide for [animating styles directly](guide/templates/binding#css-style-properties).

### Transitions, Timing, and Easing

The animations package `animate()` function allows for providing timing, like duration, delays and easing. This can be done natively with CSS using several css properties or shorthand properties.

Specify `animation-duration`, `animation-delay`, and `animation-timing-function` for a keyframe animation in CSS, or alternatively use the `animation` shorthand property.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="animation-timing"/>

Similarly, you can use `transition-duration`, `transition-delay`, and `transition-timing-function` and the `transition` shorthand for animations that are not using `@keyframes`.

<docs-code header="src/app/animations.css" path="adev/src/content/examples/animations/src/app/animations.css" visibleRegion="transition-timing"/>

### Triggering an Animation

The animations package required specifying triggers using the `trigger()` function and nesting all of your states within it. With native CSS, this is unnecessary. Animations can be triggered by toggling CSS styles or classes. Once a class is present on an element, the animation will occur. Removing the class will revert the element back to whatever CSS is defined for that element. This results in significantly less code to do the same animation. Here's an example:

#### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.ts" />
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.html" />
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/animations-package/open-close.component.css"/>
</docs-code-multifile>

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts">
    <docs-code header="src/app/open-close.component.ts" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.ts" />
    <docs-code header="src/app/open-close.component.html" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.html" />
    <docs-code header="src/app/open-close.component.css" path="adev/src/content/examples/animations/src/app/native-css/open-close.component.css"/>
</docs-code-multifile>

## Transition and Triggers

### Predefined State and wildcard matching

The animations package offers the ability to match your defined states to a transition via strings. For example, animating from open to closed would be `open => closed`. You can use wildcards to match any state to a target state, like `* => closed` and the `void` keyword can be used for entering and exiting states. For example: `* => void` for when an element leaves a view or `void => *` for when the element enters a view.

These state matching patterns are not needed at all when animating with CSS directly. You can manage what transitions and `@keyframes` animations apply based on whatever classes you set and / or styles you set on the elements. You can also add `@starting-style` to control how the element looks upon immediately entering the DOM.

### Automatic Property Calculation with Wildcards

The animations package offers the ability to animate things that have been historically difficult to animate, like animating a set height to `height: auto`. You can now do this with pure CSS as well.

#### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/auto-height.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.ts" />
    <docs-code header="src/app/auto-height.component.html" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.html" />
    <docs-code header="src/app/auto-height.component.css" path="adev/src/content/examples/animations/src/app/animations-package/auto-height.component.css" />
</docs-code-multifile>

You can use css-grid to animate to auto height.

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts">
    <docs-code header="src/app/auto-height.component.ts" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.ts" />
    <docs-code header="src/app/auto-height.component.html" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.html" />
    <docs-code header="src/app/auto-height.component.css" path="adev/src/content/examples/animations/src/app/native-css/auto-height.component.css"  />
</docs-code-multifile>

If you don't have to worry about supporting all browsers, you can also check out `calc-size()`, which is the true solution to animating auto height. See [MDN's docs](https://developer.mozilla.org/en-US/docs/Web/CSS/calc-size) and (this tutorial)[https://frontendmasters.com/blog/one-of-the-boss-battles-of-css-is-almost-won-transitioning-to-auto/] for more information.

### Animate entering and leaving a view

The animations package offered the previously mentioned pattern matching for entering and leaving but also included the shorthand aliases of `:enter` and `:leave`.

#### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/insert-remove.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.ts" />
    <docs-code header="src/app/insert-remove.component.html" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.html" />
    <docs-code header="src/app/insert-remove.component.css" path="adev/src/content/examples/animations/src/app/animations-package/insert-remove.component.css" />
</docs-code-multifile>

Here's how the same thing can be accomplished without the animations package.

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts">
    <docs-code header="src/app/insert.component.ts" path="adev/src/content/examples/animations/src/app/native-css/insert.component.ts" />
    <docs-code header="src/app/insert.component.html" path="adev/src/content/examples/animations/src/app/native-css/insert.component.html" />
    <docs-code header="src/app/insert.component.css" path="adev/src/content/examples/animations/src/app/native-css/insert.component.css"  />
</docs-code-multifile>

Leaving a view is slightly more complex. The element removal needs to be delayed until the exit animation is complete. This requires a bit of extra code in your component class to accomplish.

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts">
    <docs-code header="src/app/remove.component.ts" path="adev/src/content/examples/animations/src/app/native-css/remove.component.ts" />
    <docs-code header="src/app/remove.component.html" path="adev/src/content/examples/animations/src/app/native-css/remove.component.html" />
    <docs-code header="src/app/remove.component.css" path="adev/src/content/examples/animations/src/app/native-css/remove.component.css"  />
</docs-code-multifile>

### Animating increment and decrement

Along with the aforementioned `:enter` and `:leave`, there's also `:increment` and `:decrement`. You can animate these also by adding and removing classes. Unlike the animation package built-in aliases, there is no automatic application of classes when the values go up or down. You can apply the appropriate classes programmatically. Here's an example:

#### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.ts" />
    <docs-code header="src/app/increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.html" />
    <docs-code header="src/app/increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/animations-package/increment-decrement.component.css" />
</docs-code-multifile>

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts">
    <docs-code header="src/app/increment-decrement.component.ts" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.ts" />
    <docs-code header="src/app/increment-decrement.component.html" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.html" />
    <docs-code header="src/app/increment-decrement.component.css" path="adev/src/content/examples/animations/src/app/native-css/increment-decrement.component.css" />
</docs-code-multifile>

### Parent / Child Animations

Unlike the animations package, when multiple animations are specified within a given component, no animation has priority over another and nothing blocks any animation from firing. Any sequencing of animations would have to be handled by your definition of your CSS animation, using animation / transition delay, and / or using `animationend` or `transitionend` to handle adding the next css to be animated.

### Disabling an animation or all animations

With native CSS animations, if you'd like to disable the animations that you've specified, you have multiple options.

1. Create a custom class that forces animation and transition to `none`.

```css
.no-animation {
  animation: none !important;
  transition: none !important;
}
```

Applying this class to an element prevents any animation from firing on that element. You could alternatively scope this to your entire DOM or section of your DOM to enforce this behavior. However, this prevents animation events from firing. If you are awaiting animation events for element removal, this solution won't work. A workaround is to set durations to 1 millisecond instead.

2. Use the [`prefers-reduced-motion`](https://developer.mozilla.org/en-US/docs/Web/CSS/@media/prefers-reduced-motion) media query to ensure no animations play for users that prefer less animation.

3. Prevent adding animation classes programatically

### Animation Callbacks

The animations package exposed callbacks for you to use in the case that you want to do something when the animation has finished. Native CSS animations also have these callbacks.

[`OnAnimationStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationstart_event)  
[`OnAnimationEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationend_event)  
[`OnAnimationIteration`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationitration_event)  
[`OnAnimationCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/animationcancel_event)  

[`OnTransitionStart`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionstart_event)  
[`OnTransitionRun`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionrun_event)  
[`OnTransitionEnd`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitionend_event)  
[`OnTransitionCancel`](https://developer.mozilla.org/en-US/docs/Web/API/Element/transitioncancel_event)  

The Web Animations API has a lot of additional functionality. [Take a look at the documentation](https://developer.mozilla.org/en-US/docs/Web/API/Web_Animations_API) to see all the available animation APIs.

NOTE: Be aware of bubbling issues with these callbacks. If you are animating children and parents, the events bubble up from children to parents. Consider stopping propagation or looking at more details within the event to determine if you're responding to the desired event target rather than an event bubbling up from a child node. You can examine the `animationname` property or the properties being transitioned to verify you have the right nodes.

## Complex Sequences

The animations package has built-in functionality for creating complex sequences. These sequences are all entirely possible without the animations package.

### Targeting specific elements

In the animations package, you could target specific elements by using the `query()` function to find specific elements by a CSS class name, similar to [`document.querySelector()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/querySelector). This is unnecessary in a native CSS animation world. Instead, you can use your CSS selectors to target sub-classes and apply any desired `transform` or `animation`.

To toggle classes for child nodes within a template, you can use class and style bindings to add the animations at the right points.

### Stagger()

The `stagger()` function allowed you to delay the animation of each item in a list of items by a specified time to create a cascade effect. You can replicate this behavior in native CSS by utilizing `animation-delay` or `transition-delay`. Here is an example of what that CSS might look like.

#### With Animations Package
<docs-code-multifile>
    <docs-code header="src/app/stagger.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.ts" />
    <docs-code header="src/app/stagger.component.html" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.html" />
    <docs-code header="src/app/stagger.component.css" path="adev/src/content/examples/animations/src/app/animations-package/stagger.component.css" />
</docs-code-multifile>

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts">
    <docs-code header="src/app/stagger.component.ts" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.ts" />
    <docs-code header="src/app/stagger.component.html" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.html" />
    <docs-code header="src/app/stagger.component.css" path="adev/src/content/examples/animations/src/app/native-css/stagger.component.css" />
</docs-code-multifile>

### Parallel Animations

The animations package has a `group()` function to play multiple animations at the same time. In CSS, you have full control over animation timing. If you have multiple animations defined, you can apply all of them at once.

```css
.target-element {
  animation: rotate 3s, fade-in 2s;
}
```

In this example, the `rotate` and `fade-in` animations fire at the same time.

### Animating the items of a reordering list

Items reordering in a list works out of the box using the previously described techniques. No additional special work is required. Items in a `@for` loop will be removed and re-added properly, which will fire off animations using `@starting-styles` for entry animations. Removal animations will require additional code to add the event listener, as seen in the example above.

#### With Animations Package<
<docs-code-multifile>
    <docs-code header="src/app/reorder.component.ts" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.ts" />
    <docs-code header="src/app/reorder.component.html" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.html" />
    <docs-code header="src/app/reorder.component.css" path="adev/src/content/examples/animations/src/app/animations-package/reorder.component.css" />
</docs-code-multifile>

#### With Native CSS
<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts">
    <docs-code header="src/app/reorder.component.ts" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.ts" />
    <docs-code header="src/app/reorder.component.html" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.html" />
    <docs-code header="src/app/reorder.component.css" path="adev/src/content/examples/animations/src/app/native-css/reorder.component.css" />
</docs-code-multifile>


## Migrating usages of AnimationPlayer

The `AnimationPlayer` class allows access to an animation to do more advanced things like pause, play, restart, and finish an animation through code. All of these things can be handled natively as well.

You can retrieve animations off an element directly using [`Element.getAnimations()`](https://developer.mozilla.org/en-US/docs/Web/API/Element/getAnimations). This returns an array of every [`Animation`](https://developer.mozilla.org/en-US/docs/Web/API/Animation) on that element. You can use the `Animation` API to do much more than you could with what the `AnimationPlayer` from the animations package offered. From here you can `cancel()`, `play()`, `pause()`, `reverse()` and much more. This native API should provide everything you need to control your animations.

## Route Transitions

You can use view transitions to animate between routes. See the [Route Transition Animations Guide](guide/routing/route-transition-animations) to get started.