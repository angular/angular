# Animating your applications with `animate.enter` and `animate.leave`

Well-designed animations can make your application more fun and straightforward to use, but they aren't just cosmetic.
Animations can improve your application and user experience in a number of ways:

* Without animations, web page transitions can seem abrupt and jarring
* Motion greatly enhances the user experience, so animations give users a chance to detect the application's response to their actions
* Good animations can smoothly direct the user's attention throughout a workflow

Angular provides `animate.enter` and `animate.leave` to animate your application's elements. These two features apply enter and leave CSS classes at the appropriate times or call functions to apply animations from third party libraries. `animate.enter` and `animate.leave` are not directives. They are special API supported directly by the Angular compiler. They can be used on elements directly and can also be used as a host binding.

## `animate.enter`

You can use `animate.enter` to animate elements as they _enter_ the DOM. You can define enter animations using CSS classes with either transforms or keyframe animations.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts">
    <docs-code header="src/app/enter.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.ts" />
    <docs-code header="src/app/enter.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.html" />
    <docs-code header="src/app/enter.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter.css"/>
</docs-code-multifile>

When the animation completes, Angular removes the class or classes that you specified in `animate.enter` from the DOM. Animation classes are only be present while the animation is active.

NOTE: When using multiple keyframe animations or transition properties on an element, Angular removes all classes only _after_ the longest animation has completed.

You can use `animate.enter` with any other Angular features, such as control flow or dynamic expressions. `animate.enter` accepts both a single class string (with multiple classes separated by spaces), or an array of class strings.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts">
    <docs-code header="src/app/enter-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.ts" />
    <docs-code header="src/app/enter-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.html" />
    <docs-code header="src/app/enter-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/enter-binding.css"/>
</docs-code-multifile>

## `animate.leave`

You can use `animate.leave` to animate elements as they _leave_ the DOM. You can define leave animations using CSS classes with either transforms or keyframe animations.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts">
    <docs-code header="src/app/leave.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.ts" />
    <docs-code header="src/app/leave.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.html" />
    <docs-code header="src/app/leave.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave.css"/>
</docs-code-multifile>

When the animation completes, Angular automatically removes the animated element from the DOM.

NOTE: When using multiple keyframe animations or transition properties on a an element, Angular waits to remove the element only _after_ the longest of those animations has completed.

`animate.leave` can also be used with signals, and other bindings. You can use `animate.leave` with a single class or multiple classes. Either specify it as a simple string with spaces or a string array.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts">
    <docs-code header="src/app/leave-binding.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.ts" />
    <docs-code header="src/app/leave-binding.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.html" />
    <docs-code header="src/app/leave-binding.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-binding.css"/>
</docs-code-multifile>

## Event Bindings, Functions, and Third-party Libraries

Both `animate.enter` and `animate.leave` support event binding syntax that allows for function calls. You can use this syntax to call a function in your component code or utilize third-party animation libraries, like [GSAP](https://gsap.com/), [anime.js](https://animejs.com/), or any other JavaScript animation library.

<docs-code-multifile preview path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts">
    <docs-code header="src/app/leave-event.ts" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.ts" />
    <docs-code header="src/app/leave-event.html" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.html" />
    <docs-code header="src/app/leave-event.css" path="adev/src/content/examples/animations/src/app/enter-and-leave/leave-event.css"/>
</docs-code-multifile>

The `$event` object has the type `AnimationCallbackEvent`. It includes the element as the `target` and provides an `animationComplete()` function to notify the framework when the animation finishes.

IMPORTANT: You **must** call the `animationComplete()` function when using `animate.leave` for Angular to remove the element.

If you don't call `animationComplete()` when using `animate.leave`, Angular calls the function automatically after a four-second delay. You can configure the duration of the delay by providing the token `MAX_ANIMATION_TIMEOUT` in milliseconds.

```typescript
  { provide: MAX_ANIMATION_TIMEOUT, useValue: 6000 }
```

## Testing

TestBed provides built-in support for enabling or disabling animations in your test environment. CSS animations require a browser to run, and many of the APIs are not available in a test environment. By default, TestBed disables animations for you in your test environments.

If you want to test that the animations are animating in a browser test, for example an end-to-end test, you can configure TestBed to enable animations by specifying `animationsEnabled: true` in your test configuration.

```typescript
  TestBed.configureTestingModule({animationsEnabled: true});
```

This will configure animations in your test environment to behave normally.

NOTE: Some test environments do not emit animation events like `animationstart`, `animationend` and their transition event equivalents.

## More on Angular animations

You might also be interested in the following:

<docs-pill-row>
  <docs-pill href="guide/animations/css" title="Complex Animations with CSS"/>
  <docs-pill href="guide/routing/route-transition-animations" title="Route transition animations"/>
</docs-pill-row>
