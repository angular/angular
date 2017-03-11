@title
Component Interaction

@intro
Share information between different directives and components.

@description
<a id="top"></a>This cookbook contains recipes for common component communication scenarios
in which two or more components share information.
<a id="toc"></a>## Table of contents

[Pass data from parent to child with input binding](guide/component-communication#parent-to-child)

[Intercept input property changes with a setter](guide/component-communication#parent-to-child-setter)

[Intercept input property changes with *ngOnChanges*](guide/component-communication#parent-to-child-on-changes)

[Parent listens for child event](guide/component-communication#child-to-parent)

[Parent interacts with child via a *local variable*](guide/component-communication#parent-to-child-local-var)

[Parent calls a *ViewChild*](guide/component-communication#parent-to-view-child)

[Parent and children communicate via a service](guide/component-communication#bidirectional-service)
**See the <live-example name="cb-component-communication"></live-example>**.

<a id="parent-to-child"></a>## Pass data from parent to child with input binding

`HeroChildComponent` has two ***input properties***, 
typically adorned with [@Input decorations](guide/template-syntax).


{@example 'cb-component-communication/ts/src/app/hero-child.component.ts'}

The second `@Input` aliases the child component property name `masterName` as `'master'`.

The `HeroParentComponent` nests the child `HeroChildComponent` inside an `*ngFor` repeater, 
binding its `master` string property to the child's `master` alias
and each iteration's `hero` instance to the child's `hero` property.


{@example 'cb-component-communication/ts/src/app/hero-parent.component.ts'}

The running application displays three heroes:

<figure class='image-display'>
  <img src="assets/images/cookbooks/component-communication/parent-to-child.png" alt="Parent-to-child">  </img>
</figure>

### Test it

E2E test that all children were instantiated and displayed as expected:


{@example 'cb-component-communication/e2e-spec.ts' region='parent-to-child'}

[Back to top](guide/component-communication#top)

<a id="parent-to-child-setter"></a>## Intercept input property changes with a setter

Use an input property setter to intercept and act upon a value from the parent.

The setter of the `name` input property in the child `NameChildComponent` 
trims the whitespace from a name and replaces an empty value with default text. 


{@example 'cb-component-communication/ts/src/app/name-child.component.ts'}

Here's the `NameParentComponent` demonstrating name variations including a name with all spaces:


{@example 'cb-component-communication/ts/src/app/name-parent.component.ts'}


<figure class='image-display'>
  <img src="assets/images/cookbooks/component-communication/setter.png" alt="Parent-to-child-setter">  </img>
</figure>

### Test it

E2E tests of input property setter with empty and non-empty names:


{@example 'cb-component-communication/e2e-spec.ts' region='parent-to-child-setter'}

[Back to top](guide/component-communication#top)

<a id="parent-to-child-on-changes"></a>## Intercept input property changes with *ngOnChanges*

Detect and act upon changes to input property values with the `ngOnChanges` method of the `OnChanges` lifecycle hook interface.
May prefer this approach to the property setter when watching multiple, interacting input properties.

Learn about `ngOnChanges` in the [LifeCycle Hooks](guide/lifecycle-hooks) chapter.This `VersionChildComponent` detects changes to the `major` and `minor` input properties and composes a log message reporting these changes:


{@example 'cb-component-communication/ts/src/app/version-child.component.ts'}

The `VersionParentComponent` supplies the `minor` and `major` values and binds buttons to methods that change them.


{@example 'cb-component-communication/ts/src/app/version-parent.component.ts'}

Here's the output of a button-pushing sequence:

<figure class='image-display'>
  <img src="assets/images/cookbooks/component-communication/parent-to-child-on-changes.gif" alt="Parent-to-child-onchanges">  </img>
</figure>

### Test it

Test that ***both*** input properties are set initially and that button clicks trigger 
the expected `ngOnChanges` calls and values:


{@example 'cb-component-communication/e2e-spec.ts' region='parent-to-child-onchanges'}

[Back to top](guide/component-communication#top)

<a id="child-to-parent"></a>## Parent listens for child event

The child component exposes an `EventEmitter` property with which it `emits` events when something happens. 
The parent binds to that event property and reacts to those events.

The child's `EventEmitter` property is an ***output property***, 
  typically adorned with an [@Output decoration](guide/template-syntax)
  as seen in this `VoterComponent`:


{@example 'cb-component-communication/ts/src/app/voter.component.ts'}

Clicking a button triggers emission of a `true` or `false` (the boolean *payload*).

The parent `VoteTakerComponent` binds an event handler (`onVoted`) that responds to the child event
payload (`$event`) and updates a counter.


{@example 'cb-component-communication/ts/src/app/votetaker.component.ts'}

The framework passes the event argument &mdash; represented by `$event` &mdash; to the handler method, 
and the method processes it:

<figure class='image-display'>
  <img src="assets/images/cookbooks/component-communication/child-to-parent.gif" alt="Child-to-parent">  </img>
</figure>

### Test it

Test that clicking the *Agree* and *Disagree* buttons update the appropriate counters:


{@example 'cb-component-communication/e2e-spec.ts' region='child-to-parent'}

[Back to top](guide/component-communication#top)

## Parent interacts with child via *local variable*

A parent component cannot use data binding to read child properties
or invoke child methods. We can do both 
by creating a template reference variable for the child element
and then reference that variable *within the parent template*
as seen in the following example.

<a id="countdown-timer-example"></a>
We have a child `CountdownTimerComponent` that repeatedly counts down to zero and launches a rocket.
It has `start` and `stop` methods that control the clock and it displays a
countdown status message in its own template.

{@example 'cb-component-communication/ts/src/app/countdown-timer.component.ts'}

Let's see the `CountdownLocalVarParentComponent` that hosts the timer component.


{@example 'cb-component-communication/ts/src/app/countdown-parent.component.ts' region='lv'}

The parent component cannot data bind to the child's 
`start` and `stop` methods nor to its `seconds` property.

We can place a local variable (`#timer`) on the tag (`<countdown-timer>`) representing the child component.
That gives us a reference to the child component itself and the ability to access
*any of its properties or methods* from within the parent template.

In this example, we wire parent buttons to the child's `start` and `stop` and
use interpolation to display the child's `seconds` property.

Here we see the parent and child working together.

<figure class='image-display'>
  <img src="assets/images/cookbooks/component-communication/countdown-timer-anim.gif" alt="countdown timer">  </img>
</figure>



{@a countdown-tests}
### Test it

Test that the seconds displayed in the parent template
match the seconds displayed in the child's status message.
Test also that clicking the *Stop* button pauses the countdown timer:


{@example 'cb-component-communication/e2e-spec.ts' region='countdown-timer-tests'}

[Back to top](guide/component-communication#top)

<a id="parent-to-view-child"></a>## Parent calls a *ViewChild*

The *local variable* approach is simple and easy. But it is limited because 
the parent-child wiring must be done entirely within the parent template.
The parent component *itself* has no access to the child.

We can't use the *local variable* technique if an instance of the parent component *class*
must read or write child component values or must call child component methods.

When the parent component *class* requires that kind of access, 
we ***inject*** the child component into the parent as a *ViewChild*.

We'll illustrate this technique with the same [Countdown Timer](guide/component-communication#countdown-timer-example) example. 
We won't change its appearance or behavior. 
The child [CountdownTimerComponent](guide/component-communication#countdown-timer-example) is the same as well.
We are switching from the *local variable* to the *ViewChild* technique
solely for the purpose of demonstration.Here is the parent, `CountdownViewChildParentComponent`:

{@example 'cb-component-communication/ts/src/app/countdown-parent.component.ts' region='vc'}

It takes a bit more work to get the child view into the parent component *class*.
 
We import references to the `ViewChild` decorator and the `AfterViewInit` lifecycle hook.

We inject the child `CountdownTimerComponent` into the private `timerComponent` property
via the `@ViewChild` property decoration.

The `#timer` local variable is gone from the component metadata. 
Instead we bind the buttons to the parent component's own `start` and `stop` methods and
present the ticking seconds in an interpolation around the parent component's `seconds` method.

These methods access the injected timer component directly.

The `ngAfterViewInit` lifecycle hook is an important wrinkle.
The timer component isn't available until *after* Angular displays the parent view.
So we display `0` seconds initially.

Then Angular calls the `ngAfterViewInit` lifecycle hook at which time it is *too late*
to update the parent view's display of the countdown seconds.
Angular's unidirectional data flow rule prevents us from updating the parent view's
in the same cycle. We have to *wait one turn* before we can display the seconds.

We use `setTimeout` to wait one tick and then revise the `seconds` method so 
that it takes future values from the timer component.

### Test it
Use [the same countdown timer tests](guide/component-communication#countdown-tests) as before.[Back to top](guide/component-communication#top)

<a id="bidirectional-service"></a>## Parent and children communicate via a service

A parent component and its children share a service whose interface enables bi-directional communication
*within the family*.

The scope of the service instance is the parent component and its children. 
Components outside this component subtree have no access to the service or their communications.

This `MissionService` connects the `MissionControlComponent` to multiple `AstronautComponent` children.


{@example 'cb-component-communication/ts/src/app/mission.service.ts'}

The `MissionControlComponent` both provides the instance of the service that it shares with its children
(through the `providers` metadata array) and injects that instance into itself through its constructor:


{@example 'cb-component-communication/ts/src/app/missioncontrol.component.ts'}

The `AstronautComponent` also injects the service in its constructor.
Each `AstronautComponent` is a child of the `MissionControlComponent` and therefore receives its parent's service instance:


{@example 'cb-component-communication/ts/src/app/astronaut.component.ts'}


Notice that we capture the `subscription` and unsubscribe when the `AstronautComponent` is destroyed.
This is a memory-leak guard step. There is no actual risk in this app because the
lifetime of a `AstronautComponent` is the same as the lifetime of the app itself.
That *would not* always be true in a more complex application.

We do not add this guard to the `MissionControlComponent` because, as the parent,
it controls the lifetime of the `MissionService`.The *History* log demonstrates that messages travel in both directions between
the parent `MissionControlComponent` and the `AstronautComponent` children,
facilitated by the service:

<figure class='image-display'>
  <img src="assets/images/cookbooks/component-communication/bidirectional-service.gif" alt="bidirectional-service">  </img>
</figure>

### Test it

Tests click buttons of both the parent `MissionControlComponent` and the `AstronautComponent` children
and verify that the *History* meets expectations:


{@example 'cb-component-communication/e2e-spec.ts' region='bidirectional-service'}

[Back to top](guide/component-communication#top)