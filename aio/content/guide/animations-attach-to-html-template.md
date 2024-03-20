# Define animations and attach to an HTML template

Animations are defined in the metadata of the component that controls the HTML element to be animated.

## Define the animation

Put the code that defines your animations under the `animations:` property within the `@Component()` decorator.

<code-example header="src/app/open-close.component.ts" path="animations/src/app/open-close.component.ts" region="component"></code-example>

When an animation trigger for a component is defined, attach it to an element in the template. Wrap the trigger name in brackets and precede it with an `@` symbol.
Bind the trigger to a template expression using standard Angular property binding syntax. The `triggerName` is the name of the trigger, and `expression` evaluates to a defined animation state.

<code-example format="typescript" language="typescript">

&lt;div [&commat;triggerName]="expression"&gt;&hellip;&lt;/div&gt;;

</code-example>

The animation is executed or triggered when the expression value changes to a new state.

The following code snippet binds the trigger to the value of the `isOpen` property.

<code-example header="src/app/open-close.component.html" path="animations/src/app/open-close.component.1.html" region="trigger"></code-example>

In this example, when the `isOpen` expression evaluates to a defined state of `open` or `closed`, it notifies the trigger `openClose` of a state change.
Then it's up to the `openClose` code to handle the state change and kick off a state change animation.

For elements entering or leaving a page \(inserted or removed from the DOM\), you can make the animations conditional.
For example, use `*ngIf` with the animation trigger in the HTML template.

<div class="alert is-helpful">

**NOTE**: <br />
In the component file, set the trigger that defines the animations as the value of the `animations:` property in the `@Component()` decorator.

## Attach an animation to an HTML template

In the HTML template file, use the trigger name to attach the defined animations to the HTML element to be animated.

</div>

@reviewed 2022-10-28
