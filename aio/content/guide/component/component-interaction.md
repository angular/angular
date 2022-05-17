# Component interaction

This guide contains common component communication scenarios in which two or more components share information.

<!--
# Contents

* [Pass data from parent to child with input binding][AioGuideComponentInteractionPassDataFromParentToChildWithInputBinding]
* [Intercept input property changes with a setter][AioGuideComponentInteractionInterceptInputPropertyChangesWithASetter]
* [Intercept input property changes with `ngOnChanges()`][AioGuideComponentInteractionInterceptInputPropertyChangesWithNgonchanges]
* [Parent calls an `@ViewChild()`][AioGuideComponentInteractionParentCallsAnViewchild]
* [Parent and children communicate via a service][AioGuideComponentInteractionParentAndChildrenCommunicateUsingAService]
-->

<div class="alert is-helpful">

To view or download the example code used in the following sections, see [Example Angular component applications][AioGuideComponentExample].

</div>

## Pass data from parent to child with input binding

`HeroChildComponent` has two ***input properties***, typically adorned with [@Input() decorator][AioGuideComponentUsageSendDataToChild].

<code-example path="component-interaction/src/app/hero-child.component.ts" header="component-interaction/src/app/hero-child.component.ts"></code-example>

The second `@Input` aliases the child component property name `masterName` as `'master'`.

The `HeroParentComponent` nests the child `HeroChildComponent` inside an `*ngFor` repeater, binding the `master` string property of it to the `master` alias of the child, and the `hero` instance of each iteration to the `hero` property of the child.

<code-example path="component-interaction/src/app/hero-parent.component.ts" header="component-interaction/src/app/hero-parent.component.ts"></code-example>

The running application displays three heroes.

<div class="lightbox">

<img alt="Parent-to-child" src="generated/images/guide/component-interaction/parent-to-child.png" />

</div>

<header>Test it</header>

E2E test that all children were instantiated and displayed as expected:

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="parent-to-child" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentInteraction]

## Intercept input property changes with a setter

Use an input property setter to intercept and act upon a value from the parent.

The setter of the `name` input property in the child `NameChildComponent` trims the whitespace from a name and replaces an empty value with default text.

<code-example path="component-interaction/src/app/name-child.component.ts" header="component-interaction/src/app/name-child.component.ts"></code-example>

Here is the `NameParentComponent` demonstrating name variations including a name with all spaces:

<code-example path="component-interaction/src/app/name-parent.component.ts" header="component-interaction/src/app/name-parent.component.ts"></code-example>

<div class="lightbox">

<img alt="Parent-to-child-setter" src="generated/images/guide/component-interaction/setter.png" />

</div>

<header>Test it</header>

E2E tests of input property setter with empty and non-empty names.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="parent-to-child-setter" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentInteraction]

## Intercept input property changes with *ngOnChanges()*

Detect and act upon changes to input property values with the `ngOnChanges()` method of the `OnChanges` lifecycle hook interface.

<div class="alert is-helpful">

You might prefer this approach to the property setter when watching multiple, interacting input properties.

To learn more about the `ngOnChanges()` method, see [Lifecycle Hooks][AioGuideComponentLifecycle].

</div>

This `VersionChildComponent` detects changes to the `major` and `minor` input properties and composes a log message reporting these changes:

<code-example path="component-interaction/src/app/version-child.component.ts" header="component-interaction/src/app/version-child.component.ts"></code-example>

The `VersionParentComponent` supplies the `minor` and `major` values and binds buttons to methods that change them.

<code-example path="component-interaction/src/app/version-parent.component.ts" header="component-interaction/src/app/version-parent.component.ts"></code-example>

Here is the output of a button-pushing sequence:

<div class="lightbox">

<img alt="Parent-to-child-onchanges" src="generated/images/guide/component-interaction/parent-to-child-on-changes.gif" />

</div>

<header>Test it</header>

Test that both input properties are set initially and that selection of a button triggers the expected `ngOnChanges` calls and values.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="parent-to-child-onchanges" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentInteraction]

## Parent listens for child event

The child component exposes an `EventEmitter` property with which it emits an event when something happens.
The parent binds to that event property and reacts to the event.

The `EventEmitter` property of the child is an ***output property***, typically adorned with an [@Output() decorator][AioGuideComponentUsageSendDataToParent] as seen in this `VoterComponent`:

<code-example path="component-interaction/src/app/voter.component.ts" header="component-interaction/src/app/voter.component.ts"></code-example>

Select a button to trigger emission of a `true` or `false`, the boolean *payload*.

The parent `VoteTakerComponent` binds an event handler called `onVoted()` that responds to the `$event` child event payload and updates a counter.

<code-example path="component-interaction/src/app/votetaker.component.ts" header="component-interaction/src/app/votetaker.component.ts"></code-example>

The framework passes the event \(`$event`\) argument to the handler method, and the method processes it.

<div class="lightbox">

<img alt="Child-to-parent" src="generated/images/guide/component-interaction/child-to-parent.gif" />

</div>

<header>Test it</header>

Test that when a user selects the *Agree* and *Disagree* buttons update the appropriate counters.

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="child-to-parent" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentInteraction]

## Parent interacts with child using *local variable*

A parent component cannot use data binding to read child properties or invoke child methods.
Do both by creating a template reference variable for the child element and then reference that variable *within the parent template* as seen in the following example.

The following is a child `CountdownTimerComponent` that repeatedly counts down to zero and launches a rocket.
The `start` and `stop` methods control the clock and a countdown status message displays in the template of it.

<code-example path="component-interaction/src/app/countdown-timer.component.ts" header="component-interaction/src/app/countdown-timer.component.ts"></code-example>

The `CountdownLocalVarParentComponent` that hosts the timer component is as follows:

<code-example path="component-interaction/src/app/countdown-parent.component.ts" region="lv" header="component-interaction/src/app/countdown-parent.component.ts"></code-example>

The parent component cannot data bind to the `start` and `stop` methods of the child nor to the `seconds` property of it.

Place a local variable, `#timer`, on the tag `<countdown-timer>` representing the child component.
That gives you a reference to the child component and the ability to access *any of the properties or methods of it* from within the parent template.

This example wires parent buttons to the `start` and `stop` methods of the child and uses interpolation to display the `seconds` property of the child.

Here, the parent and child are working together.

<div class="lightbox">

<img alt="countdown timer" src="generated/images/guide/component-interaction/countdown-timer-anim.gif" />

</div>

<header>Test it</header>

Test that the seconds displayed in the parent template match the seconds displayed in the status message of the child.
Test also that selecting the *Stop* button pauses the countdown timer:

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="countdown-timer-tests" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentInteraction]

## Parent calls an `@ViewChild()`

The *local variable* approach is straightforward.
But it is limited because the parent-child wiring must be done entirely within the parent template.
The parent component has no access to the child.

You cannot use the *local variable* technique if the *class* of the parent component relies on the *class* of the child component.
The parent-child relationship of the components is not established within each components respective *class* with the *local variable* technique.
Because the *class* instances are not connected to one another, the parent *class* cannot access the child *class* properties and methods.

When the parent component *class* requires that kind of access, ***inject*** the child component into the parent as a *ViewChild*.

The following example illustrates this technique with the same [Countdown Timer][AioGuideComponentInteractionParentInteractsWithChildUsingLocalVariable] example.
Neither the associated appearance nor the associated behavior changes.
The child [CountdownTimerComponent][AioGuideComponentInteractionParentInteractsWithChildUsingLocalVariable] is the same as well.

<div class="alert is-helpful">

The switch from the *local variable* to the *ViewChild* technique is solely for the purpose of demonstration.

</div>

Here is the parent, `CountdownViewChildParentComponent`:

<code-example path="component-interaction/src/app/countdown-parent.component.ts" region="vc" header="component-interaction/src/app/countdown-parent.component.ts"></code-example>

It takes a bit more work to get the child view into the parent component *class*.

First, you have to import references to the `ViewChild` decorator and the `AfterViewInit` lifecycle hook.

Next, inject the child `CountdownTimerComponent` into the private `timerComponent` property using the `@ViewChild` property decoration.

The `#timer` local variable is gone from the component metadata.
Instead, bind the buttons to the `start` and `stop` methods of the parent component and present the ticking seconds in an interpolation around the `seconds` method of the parent component.

These methods access the injected timer component directly.

The `ngAfterViewInit()` lifecycle hook is an important wrinkle.
The timer component is not available until *after* Angular displays the parent view.
So it displays `0` seconds initially.

Then Angular calls the `ngAfterViewInit` lifecycle hook at which time it is *too late* to update the parent views display of the countdown seconds.
Unidirectional data flow rule in Angular prevents updating the parent views in the same cycle.
The application must *wait one turn* before it can display the seconds.

Use `setTimeout()` to wait one tick and then revise the `seconds()` method so that it takes future values from the timer component.

<header>Test it</header>

Use [the same countdown timer tests][AioGuideComponentInteractionParentInteractsWithChildUsingLocalVariable] as before.

[Back to top][AioGuideComponentInteraction]

## Parent and children communicate using a service

A parent component and the associated children share a service whose interface enables bi-directional communication *within the family*.

The scope of the service instance is the parent component and the associated children.
Components outside this component subtree have no access to the service or their communications.

This `MissionService` connects the `MissionControlComponent` to multiple `AstronautComponent` children.

<code-example path="component-interaction/src/app/mission.service.ts" header="component-interaction/src/app/mission.service.ts"></code-example>

The `MissionControlComponent` both provides the instance of the service that it shares with the associated children \(through the `providers` metadata array\) and self injects that instance through the associated constructor:

<code-example path="component-interaction/src/app/missioncontrol.component.ts" header="component-interaction/src/app/missioncontrol.component.ts"></code-example>

The `AstronautComponent` also injects the service in the associated constructor.
Each `AstronautComponent` is a child of the `MissionControlComponent` and therefore receives the service instance of the associated parent:

<code-example path="component-interaction/src/app/astronaut.component.ts" header="component-interaction/src/app/astronaut.component.ts"></code-example>

<div class="alert is-helpful">

Notice that this example captures the `subscription` and `unsubscribe()` when the `AstronautComponent` is destroyed.
This is a memory-leak guard step.
There is no actual risk in this application because the lifetime of a `AstronautComponent` is the same as the lifetime of the application.
That *would not* always be true in a more complex application.

You do not add this guard to the `MissionControlComponent` because, as the parent, it controls the lifetime of the `MissionService`.

</div>

The *History* log demonstrates that messages travel in both directions between the parent `MissionControlComponent` and the `AstronautComponent` children, facilitated by the service:

<div class="lightbox">

<img alt="bidirectional-service" src="generated/images/guide/component-interaction/bidirectional-service.gif" />

</div>

<header>Test it</header>

Tests select buttons of both the parent `MissionControlComponent` and the `AstronautComponent` children and verify that the history meets expectations:

<code-example path="component-interaction/e2e/src/app.e2e-spec.ts" region="bidirectional-service" header="component-interaction/e2e/src/app.e2e-spec.ts"></code-example>

[Back to top][AioGuideComponentInteraction]

<!-- links -->

[AioGuideComponentInteraction]: guide/component/component-interaction "Component interaction | Angular"
[AioGuideComponentInteractionInterceptInputPropertyChangesWithASetter]: guide/component/component-interaction#intercept-input-property-changes-with-a-setter "Intercept input property changes with a setter - Component interaction | Angular"
[AioGuideComponentInteractionInterceptInputPropertyChangesWithNgonchanges]: guide/component/component-interaction#intercept-input-property-changes-with-ngonchanges "Intercept input property changes with ngOnChanges() - Component interaction | Angular"
[AioGuideComponentInteractionParentAndChildrenCommunicateUsingAService]: guide/component/component-interaction#parent-and-children-communicate-using-a-service "Parent and children communicate using a service - Component interaction | Angular"
[AioGuideComponentInteractionParentCallsAnViewchild]: guide/component/component-interaction#parent-calls-an-viewchild "Parent calls an @ViewChild() - Component interaction | Angular"
[AioGuideComponentInteractionParentInteractsWithChildUsingLocalVariable]: guide/component/component-interaction#parent-interacts-with-child-using-local-variable "Parent interacts with child using local variable - Component interaction | Angular"
[AioGuideComponentInteractionPassDataFromParentToChildWithInputBinding]: guide/component/component-interaction#pass-data-from-parent-to-child-with-input-binding "Pass data from parent to child with input binding - Component interaction | Angular"

[AioGuideComponentUsageSendDataToChild]: guide/component/component-usage-send-data-to-child "Send data to a child component | Angular"
[AioGuideComponentUsageSendDataToParent]: guide/component/component-usage-send-data-to-parent "Send data to a parent component | Angular"

[AioGuideComponentExample]: guide/component/component-example "Example Angular component applications | Angular"

[AioGuideComponentLifecycle]: guide/component/component-lifecycle "Component Lifecycle | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
