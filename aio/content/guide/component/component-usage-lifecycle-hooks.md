# Use an Angular lifecycle hook method

Use a [lifecycle hook method][AioGuideGlossaryLifecycleHook] to tap into key events in the lifecycle of a component or directive, and complete the following actions.

*   Initialize new instances
*   Initiate change detection
*   Respond to updates during change detection
*   Clean up before deletion of instances

## Prerequisites

Before you work with a lifecycle hook method in an Angular [component][AioGuideGlossaryComponent] or [directive][AioGuideGlossaryDirective], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate] or an Angular directive.

### Respond to lifecycle events

Implement one or more of the *lifecycle hook* interfaces in the Angular `core` library to respond to events in the lifecycle of a component or directive.
The hook interface gives you the opportunity to act on the instance of a component or directive at a specific moment.
For example, when Angular creates, updates, or destroys an instance.

Each interface defines the prototype for a single hook method.
The name of each method is the interface name prefixed with `ng`.
For example, the `OnInit` interface has the `ngOnInit()` hook method.
If you implement the method in your component or directive class, Angular runs the method after the first time it checks the input properties for the component or directive.

<code-example format="typescript" header="Add ngOnInit() hook method" language="typescript">

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

You do not have to implement all \(or any\) of the lifecycle hook methods, just the ones that you need.

#### Lifecycle hook event sequence

After Angular runs the associated constructor to instantiate a component or directive, Angular runs the hook methods you implemented.
Angular implements the the hook methods at the appropriate point in the lifecycle.
To learn more about the Angular lifecycle, see [Understand the lifecycle of a component][AioGuideComponentLifecycle].

Angular runs hook methods to perform the several kinds of operations in the following sequence.

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

| Hook method               | Purpose |
|:---                       |:---     |
| `ngOnChanges()`           | Respond when Angular sets or resets data-bound input properties. The method receives a `SimpleChanges` object of current and previous property values. <br /> **NOTE**: <br /> This happens very frequently, so any operation you perform here impacts performance significantly. <br /> To learn more, see [Using change detection hooks][AioGuideComponentLifecycleTutorialUseChangeDetectionHooks]. |
| `ngOnInit()`              | Initialize the directive or component after Angular first displays the data-bound properties and sets the input properties of the directive or component. To learn more, see [Initialize a component or directive][AioGuideComponentLifecycleInitializeAComponentOrDirective].                                                                                                                         |
| `ngDoCheck()`             | Detect and act upon changes that Angular does not detect. To learn more, see [Define custom change detection][AioGuideComponentLifecycleTutorialDefineCustomChangeDetection].                                                                                                                                                                                                                          |
| `ngAfterContentInit()`    | Respond after Angular projects external content into the view of the component, or into the view for a directive. <br /> To learn more, see [Responding to changes in content][AioGuideLifecycleHooksRespondingToProjectedContentChanges].                                                                                                                                                             |
| `ngAfterContentChecked()` | Respond after Angular checks the content projected into the directive or component. <br /> To learn more, see [Respond to projected content changes][AioGuideLifecycleHooksRespondingToProjectedContentChanges].                                                                                                                                                                                       |
| `ngAfterViewInit()`       | Respond after Angular initializes the views and child views of the component or the view that contains the directive. <br /> To learn more, see [Respond to view changes][AioGuideComponentLifecycleTutorialRespondToViewChanges].                                                                                                                                                                     |
| `ngAfterViewChecked()`    | Respond after Angular checks the views and child views of the component or the view that contains the directive.                                                                                                                                                                                                                                                                                       |
| `ngOnDestroy()`           | Cleanup just before Angular destroys the directive or component. Unsubscribe Observables and detach event handlers to avoid memory leaks. To learn more, see [Clean prior to instance destruction][AioGuideComponentLifecycleCleanPriorToInstanceDestruction].                                                                                                                                         |                                                                                                                                                                                                                                  |

### Initialize a component or directive

Use the `ngOnInit()` hook method to perform the following initialization tasks.

| Task                                                         | Details |
|:---                                                          |:---     |
| Perform complex initializations outside of the constructor   | Components should be cheap and safe to construct. Do not fetch data in a component constructor. Do not worry that a new component tries to contact a remote server when created under test, or before you decide to display it. <br /> An `ngOnInit()` hook method is a good place for a component to fetch the initial data. For an example, see the [Tour of Heroes tutorial][AioTutorialTohPt4CallItInNgoninit].                                                                                                                                                                  |
| Set up the component after Angular sets the input properties | Constructors should do no more than set the initial local variables to simple values. <br /> The data-bound input properties of a directive are set after construction. If you need to initialize the directive based on those properties, set them you run the `ngOnInit()` hook method. <div class="alert is-helpful"> The `ngOnChanges()` hook method is your first opportunity to access those properties. Angular runs the `ngOnChanges()` hook method before the `ngOnInit()` hook method, but also many times after that. It only runs `ngOnInit()` hook method once. </div> |

### Clean prior to instance destruction

Put cleaning logic in the `ngOnDestroy()` hook method.

*   Unsubscribe from Observables and DOM events
*   Stop interval timers
*   Unregister all callbacks that the directive registered with global or application services

The cleaning logic that must run before Angular destroys the directive.

This is the place to free a resource that is not automatically garbage-collected.
You risk memory leaks if you neglect to do so.

The `ngOnDestroy()` hook method is also the time to notify other parts of the application that the component is being removed.

<!-- links -->

[AioGuideComponentCreate]: guide/component/component-create "Create an Angular component | Angular"

[AioGuideComponentLifecycleCleanPriorToInstanceDestruction]: guide/component/component-usage-lifecycle-hooks#clean-prior-to-instance-destruction "Clean prior to instance destruction - Use an Angular lifecycle hook method | Angular"
[AioGuideComponentLifecycleInitializeAComponentOrDirective]: guide/component/component-usage-lifecycle-hooks#initialize-a-component-or-directive "Initialize a component or directive - Use an Angular lifecycle hook method | Angular"

[AioGuideComponentLifecycle]: guide/component/component-lifecycle "Understand the lifecycle of a component | Angular"

[AioGuideComponentLifecycleTutorialDefineCustomChangeDetection]: guide/component/component-example-lifecycle#define-custom-change-detection "Define custom change detection - Example: lifecycle hook methods | Angular"
[AioGuideComponentLifecycleTutorialRespondToViewChanges]: guide/component/component-example-lifecycle#respond-to-view-changes "Respond to view changes - Example: lifecycle hook methods | Angular"
[AioGuideComponentLifecycleTutorialUseChangeDetectionHooks]: guide/component/component-example-lifecycle#use-change-detection-hooks "Use change detection hooks - Example: lifecycle hook methods | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"
[AioGuideGlossaryDirective]: guide/glossary#directive "directive - Glossary | Angular"
[AioGuideGlossaryLifecycleHook]: guide/glossary#lifecycle-hook "lifecycle hook - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

[AioTutorialTohPt4CallItInNgoninit]: tutorial/toh-pt4#call-it-in-ngoninit "Call it in ngOnInit() - Add services | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
