# Component interaction example

This guide contains common component communication scenarios in which two or more components share information.

<!--
# Contents

*   [Pass data from parent to child with input binding][AioGuideComponentExampleInteractionPassDataFromParentToChildWithInputBinding]
*   [Intercept input property changes with a setter][AioGuideComponentExampleInteractionInterceptInputPropertyChangesWithASetter]
*   [Intercept input property changes with `ngOnChanges()`][AioGuideComponentExampleInteractionInterceptInputPropertyChangesWithNgonchanges]
*   [Parent calls an `@ViewChild()`][AioGuideComponentExampleInteractionParentCallsAnViewchild]
*   [Parent and children communicate via a service][AioGuideComponentExampleInteractionParentAndChildrenCommunicateUsingAService]
-->

<div class="alert is-helpful">

To see or download the example code used in the following sections, see [Example Angular component applications][AioGuideComponentExample].

</div>

## Pass data from parent to child with input binding

`HeroChildComponent` component has two input properties, typically adorned with [@Input() decorator][AioGuideComponentShareDataToChild].

<code-example path="component-interaction/src/app/hero-child.component.ts" header="component-interaction/src/app/hero-child.component.ts"></code-example>

The second `@Input` aliases the child component property name `masterName` as `'master'`.

The `HeroParentComponent` parent component completes the following actions.

*   Nests the `HeroChildComponent` child component inside an `*ngFor` loop
*   Binds the `master` property to the `master` property in the `HeroChildComponent` child component
*   Binds each instance of the `hero` property to each iteration of the `heroes` property in the `HeroChildComponent` child component

<code-example path="component-interaction/src/app/hero-parent.component.ts" header="component-interaction/src/app/hero-parent.component.ts"></code-example>

The running application displays three heroes.

<div class="lightbox">

<img alt="Parent-to-child" src="generated/images/guide/component-interaction/parent-to-child.png">

</div>

### Test it for pass data from parent to child with input binding

The following E2E test that all children were instantiated and displayed as expected.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="parent-to-child" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentExampleInteraction]

## Intercept input property changes with a setter

Use an input property setter to intercept and act upon a value from the parent.

The setter of the `name` input property in the `NameChildComponent` child component trims the whitespace from a name and replaces an empty value with default text.

<code-example path="component-interaction/src/app/name-child.component.ts" header="component-interaction/src/app/name-child.component.ts"></code-example>

Here is the `NameParentComponent` component demonstrating name variations including a name with all spaces.

<code-example path="component-interaction/src/app/name-parent.component.ts" header="component-interaction/src/app/name-parent.component.ts"></code-example>

<div class="lightbox">

<img alt="Parent-to-child-setter" src="generated/images/guide/component-interaction/setter.png">

</div>

### Test it for intercept input property changes with a setter

E2E tests of input property setter with empty and non-empty names.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="parent-to-child-setter" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentExampleInteraction]

## Intercept input property changes with the `ngOnChanges` lifecycle hook method

Detect and act upon changes to input property values with the `ngOnChanges` method of the `OnChanges` lifecycle hook interface.

<div class="alert is-helpful">

You might prefer this approach to the property setter when watching several, interacting input properties.

<!-- To learn more about the `ngOnChanges` lifecycle hook method, see [Lifecycle Hook methods][AioGuideLifecycleHookUse]. -->

</div>

The following `VersionChildComponent` component detects changes to the `major` and `minor` input properties and composes a log message reporting these changes.

<code-example path="component-interaction/src/app/version-child.component.ts" header="component-interaction/src/app/version-child.component.ts"></code-example>

The `VersionParentComponent` component supplies the `minor` and `major` values and binds buttons to methods that change them.

<code-example path="component-interaction/src/app/version-parent.component.ts" header="component-interaction/src/app/version-parent.component.ts"></code-example>

The following is the output of a button-pushing sequence.

<div class="lightbox">

<img alt="Parent-to-child-onchanges" src="generated/images/guide/component-interaction/parent-to-child-on-changes.gif">

</div>

### Test it for intercept input property changes with the `ngOnChanges` lifecycle hook method

Test that both input properties are set initially and that selection of a button triggers the expected `ngOnChanges` calls and values.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="parent-to-child-onchanges" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentExampleInteraction]

## Parent listens for child event

The child component exposes an `EventEmitter` property with which it emits an event when something happens.
The parent binds to that event property and reacts to the event.

The `EventEmitter` property of the child is an output property, typically adorned with an [`@Output` decorator][AioGuideComponentShareDataToParent] as seen in this `VoterComponent` component.

<code-example path="component-interaction/src/app/voter.component.ts" header="component-interaction/src/app/voter.component.ts"></code-example>

Select a button to trigger emission of a `true` or `false`, the Boolean payload.

The parent `VoteTakerComponent` component binds the `onVoted` event handler that responds to the `$event` child event payload and updates a counter.

<code-example path="component-interaction/src/app/votetaker.component.ts" header="component-interaction/src/app/votetaker.component.ts"></code-example>

The framework passes the `$event` event argument to the handler method, and the method processes it.

<div class="lightbox">

<img alt="Child-to-parent" src="generated/images/guide/component-interaction/child-to-parent.gif">

</div>

### Test it for parent listens for child event

Test that when a user selects the **Agree** and **Disagree** buttons to update the appropriate counters.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="child-to-parent" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentExampleInteraction]

## Parent interacts with child using local variable

A parent component is not able to use data binding to read properties of the child component or invoke methods in the child component.
To do both, complete the following actions.

1.  Create a reference variable for the child element.
1.  Use the reference variable within the HTML template of the parent component as seen in the following example.

The following code example is a `CountdownTimerComponent` child component that counts down to zero and launches a rocket.
The `start` and `stop` methods control the clock and a countdown status message displays in the template of it.

<code-example path="component-interaction/src/app/countdown-timer.component.ts" header="component-interaction/src/app/countdown-timer.component.ts"></code-example>

The following `CountdownLocalVarParentComponent` component that hosts the timer component.

<code-example path="component-interaction/src/app/countdown-parent.component.ts" region="lv" header="component-interaction/src/app/countdown-parent.component.ts"></code-example>

The parent component is not able to data bind to the `start` and `stop` methods of the child nor to the `seconds` property of it.

Add the `#timer` variable to the `app-countdown-timer` element tag that represents the child component.
You have a reference to the child component and any property or method associated with it.
Use the reference from the HTML template of the parent component.

The following example connects the parent buttons to the `start` and `stop` methods of the child and uses interpolation to display the `seconds` property of the child.

Here, the parent and child are working together.

<div class="lightbox">

<img alt="countdown timer" src="generated/images/guide/component-interaction/countdown-timer-anim.gif">

</div>

### Test it for parent interacts with child using local variable

Test that the seconds displayed in the parent template match the seconds displayed in the status message of the child.
Test also that selecting the **Stop** button pauses the countdown timer.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="countdown-timer-tests" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentExampleInteraction]

## Parent calls an `@ViewChild`

The *local variable* approach is straightforward.
The *local variable* approach is limited, because the parent-child interactions must be entirely implemented in the parent template.
The parent component has no access to the child.

You are not able use the *local variable* technique if the parent component relies on the child component.
The parent-child relationship of the components is not established within each components respective class with the *local variable* technique.
Normally the parent component is not able to access the properties and methods associated with the child component.

When the parent component requires that kind of access, inject the child component into the parent as a `@ViewChild`.

The following example illustrates this technique with the same [Countdown Timer][AioGuideComponentExampleInteractionParentInteractsWithChildUsingLocalVariable] example.
Neither the associated appearance nor the associated behavior changes.
The child [CountdownTimerComponent][AioGuideComponentExampleInteractionParentInteractsWithChildUsingLocalVariable] is the same as well.

<div class="alert is-helpful">

The switch from the *local variable* technique to the `@ViewChild` is only useful as a demonstration.

</div>

The following code example is the `CountdownViewChildParentComponent` parent component.

<code-example path="component-interaction/src/app/countdown-parent.component.ts" region="vc" header="component-interaction/src/app/countdown-parent.component.ts"></code-example>

It takes a bit more work to get the rendered DOM structure of the child component into the parent component.

First, you have to import references to the `@ViewChild` decorator and the `AfterViewInit` lifecycle hook.

Next, inject the child `CountdownTimerComponent` component into the `timerComponent` private property using the `@ViewChild` property decoration.

The `#timer` local variable is gone from the metadata of the component.
Instead, complete the following actions.

1.  Bind the buttons to the `start` and `stop` methods of the parent component.
1.  Present the ticking seconds in an interpolation around the `seconds` method of the parent component.

These methods access the injected timer component directly.

The `ngAfterViewInit` lifecycle hook method is an important wrinkle.
The timer component is not available until after Angular displays the rendered DOM structure of the parent component.
The timer component initially displays `0` seconds.

The Angular framework runs the `ngAfterViewInit` lifecycle hook method.
The `ngAfterViewInit` lifecycle hook method is too late to update the display of the countdown seconds in the rendered DOM structure of the parent component.
Unidirectional data flow rule in Angular prevents updates in the same cycle for the rendered DOM structure of the parent component.
The application must wait one turn before it can display the seconds.

Use `setTimeout` method to wait one tick and then revise the `seconds` method so that it takes future values from the timer component.

### Test it for parent calls an `@ViewChild`

Use [the same countdown timer tests][AioGuideComponentExampleInteractionParentInteractsWithChildUsingLocalVariable] as before.

[Back to top][AioGuideComponentExampleInteraction]

## Parent and children communicate using a service

A parent component and the associated children share a service whose interface enables bi-directional communication *within the family*.

The scope of the service instance is the parent component and the associated children.
Components outside the component subtree have no access to the service or the associated communications.

The `MissionService` connects the `MissionControlComponent` component to several `AstronautComponent` child components.

<code-example path="component-interaction/src/app/mission.service.ts" header="component-interaction/src/app/mission.service.ts"></code-example>

The `MissionControlComponent` component completes the following actions.

*   Uses the `providers` metadata array to provide the instance of the service that it shares with the associated child components
*   Self-injects the instance of the service through the associated constructor

<code-example path="component-interaction/src/app/missioncontrol.component.ts" header="component-interaction/src/app/missioncontrol.component.ts"></code-example>

The `AstronautComponent` component also injects the service in the associated constructor.
Each `AstronautComponent` component is a child of the `MissionControlComponent` component and receives the service instance of the associated parent.

<code-example path="component-interaction/src/app/astronaut.component.ts" header="component-interaction/src/app/astronaut.component.ts"></code-example>

<div class="alert is-helpful">

Notice that this example captures the `subscription` and `unsubscribe()` when the `AstronautComponent` component is destroyed.
This is a memory-leak guard step.
There is no actual risk in this application because the lifetime of a `AstronautComponent` component is the same as the lifetime of the application.
That would not always be true in a more complex application.

You do not add this guard to the `MissionControlComponent` component because, as the parent, it controls the lifetime of the `MissionService`.

</div>

The History log demonstrates that messages travel in both directions between the parent `MissionControlComponent` component and the `AstronautComponent` child components, facilitated by the service.

<div class="lightbox">

<img alt="bidirectional-service" src="generated/images/guide/component-interaction/bidirectional-service.gif">

</div>

### Test it for parent and children communicate using a service

Tests select buttons of both the parent `MissionControlComponent` component and the `AstronautComponent` child components and verify that the history meets expectations.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="bidirectional-service" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentExampleInteraction]

<!-- links -->

[AioGuideComponentExampleInteraction]: guide/component/component-example-interaction "Component interaction example | Angular"
[AioGuideComponentExampleInteractionInterceptInputPropertyChangesWithASetter]: guide/component/component-example-interaction#intercept-input-property-changes-with-a-setter "Intercept input property changes with a setter - Component interaction example | Angular"
[AioGuideComponentExampleInteractionInterceptInputPropertyChangesWithNgonchanges]: guide/component/component-example-interaction#intercept-input-property-changes-with-ngonchanges "Intercept input property changes with ngOnChanges() - Component interaction example | Angular"
[AioGuideComponentExampleInteractionParentAndChildrenCommunicateUsingAService]: guide/component/component-example-interaction#parent-and-children-communicate-using-a-service "Parent and children communicate using a service - Component interaction example | Angular"
[AioGuideComponentExampleInteractionParentCallsAnViewchild]: guide/component/component-example-interaction#parent-calls-an-viewchild "Parent calls an @ViewChild() - Component interaction example | Angular"
[AioGuideComponentExampleInteractionParentInteractsWithChildUsingLocalVariable]: guide/component/component-example-interaction#parent-interacts-with-child-using-local-variable "Parent interacts with child using local variable - Component interaction example | Angular"
[AioGuideComponentExampleInteractionPassDataFromParentToChildWithInputBinding]: guide/component/component-example-interaction#pass-data-from-parent-to-child-with-input-binding "Pass data from parent to child with input binding - Component interaction example | Angular"

[AioGuideComponentShareDataToChild]: guide/component/component-share-data-to-child "Send data to a child component | Angular"

[AioGuideComponentShareDataToParent]: guide/component/component-share-data-to-parent "Send data to a parent component | Angular"

[AioGuideComponentExample]: guide/component/component-example "Example Angular component applications | Angular"

<!-- [AioGuideLifecycleHookUse]: guide/lifecycle-hook/lifecycle-hook-use "Use an Angular lifecycle hook method | Angular" -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-08
