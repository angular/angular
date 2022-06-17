# Use an Angular lifecycle hook method

Use a [lifecycle hook method][AioGuideGlossaryLifecycleHook] to tap into a key event in the lifecycle of a component or directive, and complete the following actions.

*   Initialize new instances
*   Interact with lifecycle hook method
*   Clean up before deletion of instances

<div class="alert is-helpful">

**NOTE**: <br />
The information in this topic applies to either an Angular [component][AioGuideGlossaryComponent] or an Angular [directive][AioGuideGlossaryDirective].
To reduce confusion, only [component][AioGuideGlossaryComponent] is used.

</div>

## Prerequisites

Before you work with a lifecycle hook method in an Angular [component][AioGuideGlossaryComponent] or [directive][AioGuideGlossaryDirective], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

### Respond to lifecycle events

Create and use a lifecycle hook interface to respond to events in the lifecycle of a component.
A lifecycle hook interface is imported from the Angular `core` library.
Use a lifecycle hook interface to act on the instance of a component at a specific moment.
The specific moments include when the Angular framework creates, updates, or destroys an instance.

Each interface defines the prototype for a single hook method.
The name of each method is the name of the interface prefixed with `ng`.
One example is the `OnInit` interface that has the `ngOnInit` hook method.
After you create a method in your component class and use it, the Angular framework completes the following tasks.

1.  Check the input properties for your component.
1.  Run the requested method.

<code-example format="typescript" header="Add ngOnInit hook method" language="typescript">

import { Component, OnInit } from '&commat;angular/core';

&commat;Component({
  selector: '{name-of-css-selector}',
})
export class &lcub;NameOfComponent&rcub;Component implements OnInit {
  constructor(private logger: LoggerService) { }

  ngOnInit() {
    this.logIt('OnInit');
  }

  logIt(msg: string) {
    this.logger.log(`#${nextId++} ${msg}`);
  }
}

</code-example>

You do not have to create and use any or all lifecycle hook methods, just the ones that you need.

#### Lifecycle hook event sequence

The Angular framework completes the following actions.

1.  Run the associated constructor to instantiate a component.
1.  Run the lifecycle hook method that you implemented.
1.  Implement the lifecycle hook method at the appropriate point in the lifecycle.

To learn more, see [Understand the lifecycle of a component][AioGuideComponentLifecycle].

The Angular framework runs each lifecycle hook method in the following sequence.

<code-example format="none" header="Lifecycle hook method sequence" hideCopy language="none">

ngOnInit() &rarr; ngAfterContentChecked() &rarr; ngAfterViewInit() &rarr; ngAfterViewChecked()

</code-example>

<code-example format="none" header="Lifecycle hook method sequence: Detect changes when data-bound input is used" hideCopy language="none">

ngOnChanges() &rarr; ngOnInit() &rarr; ngDoCheck() &rarr; ngAfterContentInit()
 &rarr; ngAfterContentChecked() &rarr; ngAfterViewInit() &rarr; ngAfterViewChecked()

 &rarr; ngOnChanges() &rarr; ngDoCheck() &rarr; ngAfterContentChecked() &rarr; ngAfterViewChecked()
 &rarr; ngOnChanges() &rarr; ngDoCheck() &rarr; ngAfterContentChecked() &rarr; ngAfterViewChecked()
 &rarr; &hellip;

</code-example>

<code-example format="none" header="Lifecycle hook method sequence: Tasks before deletion of instances" hideCopy language="none">

ngOnDestroy()

</code-example>

##### Lifecycle hook method list

The following table

| Hook method             | Purpose |
|:---                     |:---     |
| `ngOnChanges`           | Respond when the Angular framework sets or resets data-bound input properties. The method receives a `SimpleChanges` object of the current and previous property values. <br /> **NOTE**: <br /> The action happens frequently, so any operation you perform here impacts performance significantly. <br /> To learn more, see [Using change detection hooks][AioGuideComponentLifecycleTutorialUseChangeDetectionHooks]. |
| `ngOnInit`              | Initialize the component after the Angular framework first displays the data-bound properties and sets the input properties of the component. To learn more, see [Initialize a component][AioGuideComponentLifecycleInitializeAComponent].                                                                                                                         |
| `ngDoCheck`             | Detect and act upon changes that the Angular framework does not detect. To learn more, see [Define custom change detection][AioGuideComponentLifecycleTutorialDefineCustomChangeDetection].                                                                                                                                                                                                                          |
| `ngAfterContentInit`    | Respond after the Angular framework projects external content into the rendered DOM structure associated the following requesting code. <ul> <li>the component</li> <li>the descendants of the component</li> </ul>                                                                        <br /> To learn more, see [Responding to changes in content][AioGuideLifecycleHooksRespondingToProjectedContentChanges].                                                                                                                                                             |
| `ngAfterContentChecked` | Respond after the Angular framework checks the content projected into the component. <br /> To learn more, see [Respond to projected content changes][AioGuideLifecycleHooksRespondingToProjectedContentChanges].                                                                                                                                                                                       |
| `ngAfterViewInit`       | Respond after the Angular framework initializes the rendered DOM structure associated the following requesting code. <ul> <li>the component</li> <li>the descendants of the component</li> </ul> To learn more, see [Respond to view changes][AioGuideComponentLifecycleTutorialRespondToViewChanges].                                                                                                                                                                     |
| `ngAfterViewChecked`    | Respond after the Angular framework checks the rendered DOM structure associated the following requesting code. <ul> <li>the component</li> <li>the descendants of the component</li> </ul>                                                                                                                                                                                                                                                                                       |
| `ngOnDestroy`           | Clean-up just before the Angular framework destroys the component. Unsubscribe `Observables` and detach event handlers to avoid memory leaks. To learn more, see [Clean before instance destruction][AioGuideComponentLifecycleCleanBeforeInstanceDestruction].                                                                                                                                         |                                                                                                                                                                                                                                  |

### Initialize a component


Use the `ngOnInit` hook method to perform the following initialization tasks.

| Task                                                         | Details |
|:---                                                          |:---     |
| Perform complex initializations outside of the constructor   | Components should be cheap and safe to construct. Do not fetch data in a component constructor. Do not worry that a new component tries to contact a remote server when created under test, or before you decide to display it. <br /> An `ngOnInit` hook method is a good place for a component to fetch the initial data. For an example, see the [Tour of Heroes tutorial][AioTutorialTohPt4CallItInNgoninit].                                                                                                                                                                  |
| Set up the component after the Angular framework sets the input properties | Constructors should do no more than set the initial local variables to simple values. <br /> The data-bound input properties of a directive are set after construction. If you need to initialize the directive based on those properties, set them you run the `ngOnInit` hook method. <div class="alert is-helpful"> The `ngOnChanges` hook method is your first opportunity to access those properties. The Angular framework runs the `ngOnChanges` hook method before the `ngOnInit` hook method, but also many times after that. It only runs `ngOnInit` hook method once. </div> |

### Clean before instance destruction

Put cleaning logic in the `ngOnDestroy` hook method.

*   Unsubscribe from Observables and DOM events
*   Stop interval timers
*   Unregister all callbacks that the directive registered with global or application services

The cleaning logic that must run before the Angular framework destroys the component.

The time before the Angular framework destroys a component is when you should free a resource that is not automatically garbage-collected.
You risk memory leaks if you neglect to free a unused resource.

The `ngOnDestroy` hook method is also the time to notify other parts of the application that the component is being removed.

<!-- links -->

[AioGuideComponentCreate]: guide/component/component-create

<!-- "Create an Angular component | Angular" -->

[AioGuideComponentLifecycleCleanBeforeInstanceDestruction]: guide/component/component-usage-lifecycle-hooks#clean-before-instance-destruction

<!-- "Clean before instance destruction - Use an Angular lifecycle hook method | Angular" -->

[AioGuideComponentLifecycleInitializeAComponentOrDirective]: guide/component/component-usage-lifecycle-hooks#initialize-a-component-or-directive

<!-- "Initialize a component - Use an Angular lifecycle hook method | Angular" -->

[AioGuideComponentLifecycle]: guide/component/component-lifecycle

<!-- "Understand the lifecycle of a component | Angular" -->

[AioGuideComponentLifecycleTutorialDefineCustomChangeDetection]: guide/component/component-example-lifecycle#define-custom-change-detection

<!-- "Define custom change detection - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentLifecycleTutorialRespondToViewChanges]: guide/component/component-example-lifecycle#respond-to-view-changes

<!-- "Respond to view changes - Example: lifecycle hook methods | Angular" -->

[AioGuideComponentLifecycleTutorialUseChangeDetectionHooks]: guide/component/component-example-lifecycle#use-change-detection-hooks

<!-- "Use change detection hooks - Example: lifecycle hook methods | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component

<!-- "component - Glossary | Angular" -->

[AioGuideGlossaryDirective]: guide/glossary#directive

<!-- "directive - Glossary | Angular" -->

[AioGuideGlossaryLifecycleHook]: guide/glossary#lifecycle-hook

<!-- "lifecycle hook - Glossary | Angular" -->

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application

<!-- "Create a workspace and initial application - Setting up the local environment and workspace | Angular" -->

[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli

<!-- "Install the Angular CLI - Setting up the local environment and workspace | Angular" -->

[AioTutorialTohPt4CallItInNgoninit]: tutorial/toh-pt4#call-it-in-ngoninit

<!-- "Call it in ngOnInit() - Add services | Angular" -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
