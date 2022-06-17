
# Example: lifecycle hook methods

## Lifecycle example set

<div class="alert is-helpful">

To view or download the example code used in the following sections, see [Example Angular component applications][AioGuideComponentExample].

</div>

The following table lists the exercises with brief descriptions.
The sample code is also used to illustrate specific tasks in the following sections.

| Component                                                                                | Details |
|:---                                                                                      |:---     |
| [Peek-a-boo][AioGuideComponentExampleLifecycleSequenceAndFrequencyOfAllLifecycleEvents] | Demonstrates every lifecycle hook. Each hook method writes to the on-screen log.                                                                                                                                                           |
| [Spy][AioGuideComponentExampleLifecycleUseDirectivesToWatchTheDom]                      | Shows how to use lifecycle hooks with a custom directive. The `SpyDirective` directive implements the `ngOnInit()` and `ngOnDestroy()` hook methods. The hook methods watch and report when an element goes in or out of the current view. |
| [OnChanges][AioGuideComponentExampleLifecycleUseChangeDetectionHooks]                   | Demonstrates how Angular runs the `ngOnChanges()` hook method every time one of the component input properties changes, and shows how to interpret the `changes` object passed to the hook method.                                         |
| [DoCheck][AioGuideComponentExampleLifecycleDefineCustomChangeDetection]                 | Implements the `ngDoCheck()` hook method with custom change detection. Watch the hook post changes to a log to see how often Angular runs this hook.                                                                                       |
| [AfterView][AioGuideComponentExampleLifecycleRespondToViewChanges]                      | Shows what Angular means by a [view][AioGuideGlossaryView]. Demonstrates the `ngAfterViewInit()` and `ngAfterViewChecked()` hook methods.                                                                                                  |
| [AfterContent][AioGuideComponentExampleLifecycleRespondToProjectedContentChanges]       | Shows how to project external content into a component and how to distinguish projected content from a component's view children. Demonstrates the `ngAfterContentInit()` and `ngAfterContentChecked()` hook methods.                      |
| [Counter][AioGuideComponentExampleLifecycleUseComponentAndDirectiveHooksTogether]       | Demonstrates a combination of a component and a directive, each with an associated set of hook methods.                                                                                                                                    |

## General examples

The following examples show the request sequence and relative frequency of the various lifecycle events, and how the hooks can be used separately or together for components and directives.

### Sequence and frequency of all lifecycle events

To show how Angular runs the hooks in the expected order, the `PeekABooComponent` component demonstrates all lifecycle hook methods in one component.

In practice, you rarely create and use all interfaces to described in the Lifecycle Hooks demo.

The following screen capture shows the state of the log after the user selects the **Create...** button and then the **Destroy...** button.

<div class="lightbox">

<img alt="Peek-a-boo" src="generated/images/guide/lifecycle-hooks/peek-a-boo.png" />

</div>

The sequence of log messages for the interfaces follows the prescribed hook method run order.

`OnChanges`, `OnInit`, `DoCheck`&nbsp;\(3x\), `AfterContentInit`, `AfterContentChecked`&nbsp;\(3x\), `AfterViewInit`, `AfterViewChecked`&nbsp;\(3x\), and `OnDestroy`.

<code-tabs>
    <code-pane header="peek-a-boo-parent.component.ts">import { Component } from '&commat;angular/core'; &NewLine; &NewLine;import { LoggerService } from './logger.service'; &NewLine; &NewLine;&commat;Component({ &NewLine; &nbsp;selector: 'peek-a-boo-parent', &NewLine; &nbsp;template: &grave; &NewLine; &nbsp;&lt;hr /&gt; &NewLine; &nbsp;&lt;div class="parent"&gt; &NewLine; &nbsp; &nbsp;&lt;h2&gt;Peek-A-Boo&lt;/h2&gt; &NewLine; &NewLine; &nbsp; &nbsp;&lt;button type="button" (click)="toggleChild()"&gt; &NewLine; &nbsp; &nbsp; &nbsp;{{hasChild ? 'Destroy' : 'Create'}} PeekABooComponent &NewLine; &nbsp; &nbsp;&lt;/button&gt; &NewLine; &nbsp; &nbsp;&lt;button type="button" (click)="updateHero()" [hidden]="!hasChild"&gt;Update Hero&lt;/button&gt; &NewLine; &NewLine; &nbsp; &nbsp;&lt;div class="info"&gt; &NewLine; &nbsp; &nbsp; &nbsp;&lt;peek-a-boo *ngIf="hasChild" [name]="heroName"&gt;&lt;/peek-a-boo&gt; &NewLine; &NewLine; &nbsp; &nbsp; &nbsp;&lt;h3&gt;Lifecycle Hook Log&lt;/h3&gt; &NewLine; &nbsp; &nbsp; &nbsp;&lt;div *ngFor="let msg of hookLog" class="log"&gt;{{msg}}&lt;/div&gt; &NewLine; &nbsp; &nbsp;&lt;/div&gt; &NewLine; &nbsp;&lt;/div&gt; &NewLine; &nbsp;&grave;, &NewLine; &nbsp;providers:  [ LoggerService ] &NewLine;}) &NewLine;export class PeekABooParentComponent { &NewLine; &NewLine; &nbsp;hasChild = false; &NewLine; &nbsp;hookLog: string[] = []; &NewLine; &NewLine; &nbsp;heroName = 'Windstorm'; &NewLine; &nbsp;private logger: LoggerService; &NewLine; &NewLine; &nbsp;constructor(logger: LoggerService) { &NewLine; &nbsp; &nbsp;this.logger = logger; &NewLine; &nbsp; &nbsp;this.hookLog = logger.logs; &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;toggleChild() { &NewLine; &nbsp; &nbsp;this.hasChild = !this.hasChild; &NewLine; &nbsp; &nbsp;if (this.hasChild) { &NewLine; &nbsp; &nbsp; &nbsp;this.heroName = 'Windstorm'; &NewLine; &nbsp; &nbsp; &nbsp;this.logger.clear(); // clear log on create &NewLine; &nbsp; &nbsp;} &NewLine; &nbsp; &nbsp;this.hookLog = this.logger.logs; &NewLine; &nbsp; &nbsp;this.logger.tick(); &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;updateHero() { &NewLine; &nbsp; &nbsp;this.heroName += '!'; &NewLine; &nbsp; &nbsp;this.logger.tick(); &NewLine; &nbsp;} &NewLine;} </code-pane>
    <code-pane header="peek-a-boo.component.ts">import { &NewLine; &nbsp;AfterContentChecked, &NewLine; &nbsp;AfterContentInit, &NewLine; &nbsp;AfterViewChecked, &NewLine; &nbsp;AfterViewInit, &NewLine; &nbsp;Component, &NewLine; &nbsp;DoCheck, &NewLine; &nbsp;Input, &NewLine; &nbsp;OnChanges, &NewLine; &nbsp;OnDestroy, &NewLine; &nbsp;OnInit, &NewLine; &nbsp;SimpleChanges &NewLine;} from '&commat;angular/core'; &NewLine; &NewLine;import { LoggerService } from './logger.service'; &NewLine;import { PeekABooDirective } from './peek-a-boo.directive'; &NewLine; &NewLine;&commat;Component({ &NewLine; &nbsp;selector: 'peek-a-boo', &NewLine; &nbsp;template: '&lt;p&gt;Now you see my hero, {{name}}&lt;/p&gt;' &NewLine;}) &NewLine;// Don't have to mention the interfaces for Lifecycle Hook methods &NewLine;// unless you want to type and tool support. &NewLine;export class PeekABooComponent extends PeekABooDirective implements &NewLine; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; OnChanges, OnInit, DoCheck, &NewLine; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; AfterContentInit, AfterContentChecked, &NewLine; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; AfterViewInit, AfterViewChecked, &NewLine; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; OnDestroy { &NewLine; &nbsp;&commat;Input() name = ''; &NewLine; &NewLine; &nbsp;private verb = 'initialized'; &NewLine; &NewLine; &nbsp;constructor(logger: LoggerService) { &NewLine; &nbsp; &nbsp;super(logger); &NewLine; &NewLine; &nbsp; &nbsp;const is = this.name ? 'is' : 'is not'; &NewLine; &nbsp; &nbsp;this.logIt(&grave;name &dollar;{is} known at construction&grave;); &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;// only run when there an &grave;&commat;input&grave; variable is set by parent. &NewLine; &nbsp;ngOnChanges(changes: SimpleChanges) { &NewLine; &nbsp; &nbsp;const changesMsgs: string[] = []; &NewLine; &nbsp; &nbsp;for (const propName in changes) { &NewLine; &nbsp; &nbsp; &nbsp;if (propName === 'name') { &NewLine; &nbsp; &nbsp; &nbsp; &nbsp;const name = changes['name'].currentValue; &NewLine; &nbsp; &nbsp; &nbsp; &nbsp;changesMsgs.push(&grave;name &dollar;{this.verb} to "&dollar;{name}"&grave;); &NewLine; &nbsp; &nbsp; &nbsp;} else { &NewLine; &nbsp; &nbsp; &nbsp; &nbsp;changesMsgs.push(propName + ' ' + this.verb); &NewLine; &nbsp; &nbsp; &nbsp;} &NewLine; &nbsp; &nbsp;} &NewLine; &nbsp; &nbsp;this.logIt(&grave;OnChanges: &dollar;{changesMsgs.join('; ')}&grave;); &NewLine; &nbsp; &nbsp;this.verb = 'changed'; // next time it is a change &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;// **WARNING**: Frequently run. &NewLine; &nbsp;// Run in every change detection cycle to the rendered DOM structure &NewLine; &nbsp;ngDoCheck() { this.logIt('DoCheck'); } &NewLine; &NewLine; &nbsp;ngAfterContentInit() { this.logIt('AfterContentInit'); } &NewLine; &NewLine; &nbsp;// **WARNING**: Frequently run. &NewLine; &nbsp;// Run in every change detection cycle to the rendered DOM structure &NewLine; &nbsp;ngAfterContentChecked() { this.logIt('AfterContentChecked'); } &NewLine; &NewLine; &nbsp;ngAfterViewInit() { this.logIt('AfterViewInit'); } &NewLine; &NewLine; &nbsp;// **WARNING**: Frequently run. &NewLine; &nbsp;// Run in every change detection cycle to the rendered DOM structure &NewLine; &nbsp;ngAfterViewChecked() { this.logIt('AfterViewChecked'); } &NewLine; &NewLine; &nbsp;ngOnDestroy() { this.logIt('OnDestroy'); } &NewLine;} </code-pane>
    <code-pane header="peek-a-boo.directive.ts">import { Directive, OnInit } from '@angular/core';&NewLine;import { LoggerService } from './logger.service';&NewLine; &NewLine;let nextId = 1;&NewLine; &NewLine;&commat;Directive({ &NewLine; &nbsp;selector: '[appPeekABoo]' &NewLine;}) &NewLine;export class PeekABooDirective implements OnInit { &NewLine; &nbsp;constructor(private logger: LoggerService) { } &NewLine; &NewLine; &nbsp;// implement OnInit's &grave;ngOnInit&grave; method &NewLine; &nbsp;ngOnInit() { &NewLine; &nbsp; &nbsp;this.logIt('OnInit'); &NewLine; &nbsp;} &NewLine; &NewLine; &nbsp;logIt(msg: string) { &NewLine; &nbsp; &nbsp;this.logger.log(&grave;#&dollar;{nextId++} &dollar;{msg}&grave;); &NewLine; &nbsp;} &NewLine;} </code-pane>
</code-tabs>

<div class="alert is-helpful">

**NOTE**: <br />
The log confirms that input properties \(the `name` property in this case\) have no assigned values at construction.
The input properties are available to the `onInit()` hook method for further initialization.

</div>

Had the user selected the **Update Hero** button, the log would show another `OnChanges` interface and two more triplets of the `DoCheck`, `AfterContentChecked`, and `AfterViewChecked` interfaces.

<div class="alert is-important">

**IMPORTANT**: <br />
The three hook methods run often, so keep your logic as lean.

</div>

### Use directives to watch the DOM

The `Spy` example demonstrates how to use the hook method for directives as well as components.
The `SpyDirective` implements the `ngOnInit()` and `ngOnDestroy()` hook methods to discover when a watched element is in the current view.

This template applies the `SpyDirective` to a `div` element in the `ngFor` *hero* repeater managed by the parent `SpyComponent`.

The example does not perform any initialization or clean-up.
It just tracks the appearance and disappearance of an element in the view by recording when the directive is instantiated and destroyed.

A spy directive like this can provide insight into a DOM object that you are not able to change directly.
You are not able to touch the implementation of a built-in `div` element, or change a third-party component.
You are able to watch the elements with a directive.

The directive defines the `ngOnInit()` and `ngOnDestroy()` hook methods that log messages to the parent using an injected `LoggerService`.

<code-example header="src/app/spy.directive.ts" path="lifecycle-hooks/src/app/spy.directive.ts" region="spy-directive"></code-example>

Apply the spy to any built-in or component element.
Verify that the spy is initialized and destroyed at the same time as that element.
The following code example shows the spy is attached to the repeated hero `div` element.

<code-example header="src/app/spy.component.html" path="lifecycle-hooks/src/app/spy.component.html" region="template"></code-example>

The creation and destruction of each spy marks the appearance and disappearance of the attached hero `div` element with an entry in the *Hook Log*.
Adding a hero results in a new hero `div` element.
The `ngOnInit()` hook method of the spy logs that event.

The **Reset** button clears the `heroes` list.
Angular removes all hero `div` elements from the DOM and destroys the associated spy directives at the same time.
The `ngOnDestroy()` hook method of the spy reports any last moments.

### Use component and directive hooks together

In this example, a `CounterComponent` component uses the `ngOnChanges()` hook method to log a change every time the parent component increments the associated `counter` input property.

This example applies the `SpyDirective` directive from the previous example to the `CounterComponent` component log, to watch the creation and destruction of log entries.

## Use change detection hooks

Angular runs the `ngOnChanges()` hook method of a component or directive whenever it detects changes to the  ***input properties***.
The *onChanges* example demonstrates this by monitoring the `OnChanges()` hook method.

<code-example header="on-changes.component.ts (excerpt)" path="lifecycle-hooks/src/app/on-changes.component.ts" region="ng-on-changes"></code-example>

The `ngOnChanges()` hook method takes an object that maps each changed property name to a [SimpleChange][AioApiCoreSimplechange] object holding the current and previous property values.
This hook iterates over the changed properties and logs them.

In the following code example, the `OnChangesComponent` component has the `hero` and `power` input properties.

<code-example header="src/app/on-changes.component.ts" path="lifecycle-hooks/src/app/on-changes.component.ts" region="inputs"></code-example>

In the following code example, the `OnChangesParentComponent` host component binds to the input properties.

<code-example header="src/app/on-changes-parent.component.html" path="lifecycle-hooks/src/app/on-changes-parent.component.html" region="on-changes"></code-example>

The following image shows the user changes in action.

<div class="lightbox">

<img alt="OnChanges" src="generated/images/guide/lifecycle-hooks/on-changes-anim.gif" />

</div>

The log entries appear as the string value of the *power* property changes.

<div class="alert is-helpful">

**IMPORTANT**: <br />
The `ngOnChanges()` hook method does not catch changes to `hero.name`.

</div>

This is because Angular only runs the hook method when the value of the input property changes.
In this case, `hero` is the input property, and the value of the `hero` property is the *reference to the hero object*.
The object reference did not change when the value changed for the associated `name` property.

### Respond to view changes

As Angular traverses the [view hierarchy][AioGuideGlossaryViewHierarchy] during change detection, it needs to be sure that a change in a child does not attempt to cause a change in the associated parent.
Such a change would not be rendered properly, because of how [unidirectional data flow][AioGuideGlossaryUnidirectionalDataFlow] works.

If you need to make a change that inverts the expected data flow, you must trigger a new change detection cycle to allow that change to be rendered.
The examples illustrate how to make such changes safely.

The "AfterView" sample explores the `ngAfterViewInit()` and `ngAfterViewChecked()` hook methods that Angular runs *after* it creates a component's child views.

The following code example shows a child view that displays the name of a hero in an `input` element.

<code-example header="ChildViewComponent" path="lifecycle-hooks/src/app/child-view.component.ts" region="child-view"></code-example>

The following code example shows the `AfterViewComponent` component displays the child view within the associated template.

<code-example header="AfterViewComponent (template)" path="lifecycle-hooks/src/app/after-view.component.ts" region="template"></code-example>

The following hooks take action based on changing values *within the child view*, which can only be reached by querying for the child view using the property decorated with [@ViewChild][AioApiCoreViewchild].

<code-example header="AfterViewComponent (class excerpts)" path="lifecycle-hooks/src/app/after-view.component.ts" region="hooks"></code-example>

#### Wait before updating the view

In this example, the `doSomething()` method updates the screen when the hero name exceeds 10 characters, but waits a tick before updating `comment`.

<code-example header="AfterViewComponent (doSomething)" path="lifecycle-hooks/src/app/after-view.component.ts" region="do-something"></code-example>

Both the `ngAfterViewInit()` and `ngAfterViewChecked()` hook methods fire after the view of the component is composed.
If you change the hook method to immediately update the data-bound `comment` property of the component, Angular throws an error.

The `LoggerService.tick_then()` statement postpones the log update for one turn of the JavaScript cycle of the browser, which triggers a new change-detection cycle.

#### Write lean hook methods to avoid performance problems

When you run the *AfterView* sample, notice how frequently Angular runs the `ngAfterViewChecked()` hook method.
Often when there are no changes of interest.
Be careful about how much logic or computation you put into one of these methods.

<div class="lightbox">

<img alt="AfterView" src="generated/images/guide/lifecycle-hooks/after-view-anim.gif" />

</div>

### Respond to projected content changes

*Content projection* is a way to import HTML content from outside the component and insert that content into the template of the component in a designated spot.
Identify content projection in a template by looking for the following constructs.

*   HTML between component elements
*   The presence of `ng-content` elements in the template of the component

<div class="alert is-helpful">

AngularJS developers know this technique as *transclusion*.

</div>

The *AfterContent* sample explores the `AfterContentInit()` and `AfterContentChecked()` hook methods that Angular runs *after* Angular projects external content into the component.

Consider this variation on the ["AfterView"][AioGuideComponentExampleLifecycleRespondToViewChanges] example.
This time, instead of including the child view within the template, it imports the content from the parent of the `AfterContentComponent` component.
The following is the template of the parent.

<code-example header="AfterContentParentComponent (template excerpt)" path="lifecycle-hooks/src/app/after-content-parent.component.ts" region="parent-template"></code-example>

<div class="alert is-helpful">

**NOTE**: <br />
The `app-child` element is tucked between the `after-content` elements.

</div>

Never put content between the elements of a component *unless you intend to project that content into the component*.

Now look at the template of the component.

<code-example header="AfterContentComponent (template)" path="lifecycle-hooks/src/app/after-content.component.ts" region="template"></code-example>

The `ng-content` element is a *placeholder* for the external content.
It tells Angular where to insert that content.
In this case, the projected content is the `app-child` element from the parent.

<div class="lightbox">

<img alt="Projected Content" src="generated/images/guide/lifecycle-hooks/projected-child-view.png" />

</div>

#### Use `AfterContent` hooks

The *AfterContent* hook method and *AfterView* hook method are similar.
The key difference is in the child component.

*   The *AfterView* hook method concern `ViewChildren`, the child components whose elements appear *within* the template of the component
*   The *AfterContent* hook method concern `ContentChildren`, the child components that Angular projected into the component

The following *AfterContent* hooks take action based on changing values in a *content child*, which can only be reached by querying for them using the property decorated with [@ContentChild][AioApiCoreContentchild].

<code-example header="AfterContentComponent (class excerpts)" path="lifecycle-hooks/src/app/after-content.component.ts" region="hooks"></code-example>

<div class="alert is-helpful">

<header>No need to wait for content updates</header>

The `doSomething()` method of this component immediately updates the data-bound `comment` property of the component.
There is no need to [delay the update to ensure proper rendering][AioGuideComponentExampleLifecycleWaitBeforeUpdatingTheView].

Angular uns both `AfterContent` hook methods before running either of the `AfterView` hook methods.
Angular completes composition of the projected content *before* finishing the composition of the view of this component.
There is a small window between the `AfterContent...` and `AfterView...` hook methods that lets you change the host view.

</div>

## Define custom change detection

To show the changes that occur where `ngOnChanges()` hook method does not check, create and use your change checker, as shown in the "DoCheck" example.
This example shows how to use the `ngDoCheck()` hook method to detect and act upon changes that Angular does not otherwise catch.

The following code example shows the "DoCheck" sample extends the "OnChanges" sample with the `ngDoCheck()` hook method.

<code-example header="DoCheckComponent (ngDoCheck)" path="lifecycle-hooks/src/app/do-check.component.ts" region="ng-do-check"></code-example>

The code completes the following actions.

1.  Inspects specific values of interest.
1.  Captures the associated current state.
1.  Compares the associated current state against previous values.

The Angular framework writes a special message to the log when there are no substantive changes to the `hero` or the `power`, so you are able to see how often your application runs the `ngDoCheck()` hook method.
The results are illuminating.

<div class="lightbox">

<img alt="DoCheck" src="generated/images/guide/lifecycle-hooks/do-check-anim.gif" />

</div>

While the `ngDoCheck()` hook method is able to detect when the `name` of the hero has changed, the hook method is resource intensive.
The hook method is run frequently after every change detection cycle regardless of where the change occurred.
The hook method is run over twenty times in the example before the user is able to do anything.

The first rendering in Angular of unrelated data on the page triggers most of the initial checks.
If you move the cursor into another `input` element, a request is triggered.
Relatively few requests reveal actual changes to pertinent data.
If you use this hook, your implementation must be extremely lightweight or the user experience suffers.

<!-- links -->

[AioApiCoreContentchild]: api/core/ContentChild

<!-- "ContentChild | @angular/core - API | Angular" -->

[AioApiCoreSimplechange]: api/core/SimpleChange

<!-- "SimpleChange | @angular/core - API | Angular" -->

[AioApiCoreViewchild]: api/core/ViewChild

<!-- "ViewChild | @angular/core - API | Angular" -->

[AioGuideComponentExample]: guide/component/component-example

<!-- "Example Angular component applications | Angular" -->

[AioGuideComponentExampleLifecycleDefineCustomChangeDetection]: guide/component/component-example-lifecycle#define-custom-change-detection

<!-- "Define custom change detection - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleRespondToViewChanges]: guide/component/component-example-lifecycle#respond-to-view-changes

<!-- "Respond to view changes - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleRespondToProjectedContentChanges]: guide/component/component-example-lifecycle#respond-to-projected-content-changes

<!-- "Respond to projected content changes - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleSequenceAndFrequencyOfAllLifecycleEvents]: guide/component/component-example-lifecycle#sequence-and-frequency-of-all-lifecycle-events

<!-- "Sequence and frequency of all lifecycle events - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleUseComponentAndDirectiveHooksTogether]: guide/component/component-example-lifecycle#use-component-and-directive-hooks-together

<!-- "Use component and directive hooks together - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleUseDirectivesToWatchTheDom]: guide/component/component-example-lifecycle#use-directives-to-watch-the-dom

<!-- "Use directives to watch the DOM - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleUseChangeDetectionHooks]: guide/component/component-example-lifecycle#use-change-detection-hooks

<!-- "Use change detection hooks - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentExampleLifecycleWaitBeforeUpdatingTheView]: guide/component/component-example-lifecycle#wait-before-updating-the-view

<!-- "Wait before updating the view - Example: lifecycle hook methods | Angular" -->

[AioGuideGlossaryUnidirectionalDataFlow]: guide/glossary#unidirectional-data-flow

<!-- "unidirectional data flow - Glossary | Angular" -->

[AioGuideGlossaryView]: guide/glossary#view

<!-- "view - Glossary | Angular" -->

[AioGuideGlossaryViewHierarchy]: guide/glossary#view-hierarchy

<!-- "view hierarchy - Glossary | Angular" -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
