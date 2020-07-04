# Reusable animations

#### Prerequisites

A basic understanding of the following concepts:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)

<hr>

The [AnimationOptions](api/animations/AnimationOptions) interface in Angular animations enables you to create animations that you can reuse across different components.

## Creating reusable animations

To create a reusable animation, use the [`animation()`](api/animations/animation) method to define an animation in a separate `.ts` file and declare this animation definition as a `const` export variable. You can then import and reuse this animation in any of your app components using the [`useAnimation()`](api/animations/useAnimation) API.

<code-example path="animations/src/app/animations.ts" header="src/app/animations.ts" region="reusable" language="typescript"></code-example>

In the above code snippet, `transAnimation` is made reusable by declaring it as an export variable.

<div class="alert is-helpful">

**Note:** The `height`, `opacity`, `backgroundColor`, and `time` inputs are replaced during runtime.
</div>

You can import the reusable `transAnimation` variable in your component class and reuse it using the `useAnimation()` method as shown below.

<code-example path="animations/src/app/open-close.component.3.ts" header="src/app/open-close.component.ts" region="reusable" language="typescript"></code-example>

## More on Angular animations

You may also be interested in the following:

* [Introduction to Angular animations](guide/animations)
* [Transition and triggers](guide/transition-and-triggers)
* [Complex animation Sequences](guide/complex-animation-sequences)
* [Route transition animations](guide/route-animations)
