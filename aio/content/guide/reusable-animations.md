# Reusable animations

This topic provides some examples of how to create reusable animations.

## Prerequisites

Before continuing with this topic, you should be familiar with the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)

## Creating reusable animations

To create a reusable animation, use the <code>[animation](api/animations/animation)()</code> function to define an animation in a separate `.ts` file and declare this animation definition as a `const` export variable. You can then import and reuse this animation in any of your application components using the <code>[useAnimation](api/animations/useAnimation)()</code> function.

<code-example path="animations/src/app/animations.1.ts" header="src/app/animations.ts" region="animation-const" language="typescript"></code-example>

In the preceding code snippet, `transitionAnimation` is made reusable by declaring it as an export variable.

<div class="alert is-helpful">

**Note:** The `height`, `opacity`, `backgroundColor`, and `time` inputs are replaced during runtime.
</div>

You can also export a part of an animation. For example, the following snippet exports the animation `trigger`.

<code-example path="animations/src/app/animations.1.ts" header="src/app/animations.1.ts" region="trigger-const" language="typescript"></code-example>

From this point, you can import reusable animation variables in your component class. For example, the following code snippet imports the `transitionAnimation` variable and uses it via the `useAnimation()` function.

<code-example path="animations/src/app/open-close.component.3.ts" header="src/app/open-close.component.ts" region="reusable" language="typescript"></code-example>

## More on Angular animations

You might also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Complex animation Sequences](guide/complex-animation-sequences)
* [Route transition animations](guide/route-animations)
