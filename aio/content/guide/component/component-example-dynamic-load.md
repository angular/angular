# Dynamically load a component

A template in a component is not always fixed.
Angular provides an API to dynamically load a component at runtime.

## Prerequisites

Before you work with styles in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreateCli].

## Reasons to dynamically load a component

You are not able to use a template with a static component structure due to practical limitations.

You need to load a new component without a fixed reference to the component in the template for the advertisement banner.

## The anchor directive

Before you add a component, you have to define an anchor point for Angular to insert the component.

Use a helper directive to mark valid insertion points in the HTML template.

<code-example format="typescript" header="DirectiveName.directive.ts" language="typescript">

import &lcub; Directive, ViewContainerRef &rcub; from '&commat;angular/core';

&commat;Directive(&lcub;
  selector: '[directive-css-selector-name]',
&rcub;)
export class DirectiveName &lcub;
  constructor(public viewContainerRef: ViewContainerRef) &lcub; &rcub;
&rcub;

</code-example>

| Part         | Details |
|:---          |:---     |
| `@Directive` | The directive decorator.                                                                                        |
| `selector`   | The name of the directive. Angular searches for the matching element and applies the view in the HTML template. |

| Part                         | Details |
|:---                           |:---     |
| `DirectiveName`               | The name of the helper directive class. Injects the `ViewContainerRef` component to gain access to the view container of the element that hosts the dynamically added component. |
| `directive-css-selector-name` | The selector. Use that name to apply the directive to the element.                                                                                                               |

## Load a component

Apply the `DirectiveName` directive to the `ng-template` element.

1.  Locate the `ng-template` element.
1.  Add the `directive-css-selector-name` selector as an attribute to the `ng-template` element.
    Be sure to remove the square brackets.

Now, Angular knows where to dynamically load your component.

<code-example format="typescript" header="ComponentName.component.ts: Add directive-css-selector-name to ng-template" language="typescript">

&commat;Component(&lcub;
  selector: 'css-selector-name',
  template: &grave;
    &lt;div&gt;
        &lt;h3&gt;Heading 3&lt;/h3&gt;
        &lt;ng-template directive-css-selector-name&gt;&lt;/ng-template&gt;
    &lt;/div&gt;
  &grave;,
&rcub;)
export class ComponentName implements OnInit, OnDestroy &lcub;
  &commat;Input() VariableName: ComponentNameItem[] = [];

  currentComponentNameIndex = -1;

  &commat;ViewChild(DirectiveName, &lcub;static: true&rcub;) directive-css-selector-name!: DirectiveName;
  interval: number&verbar;undefined;

  ngOnInit(): void &lcub;
    this.loadComponent();
    this.getComponentPluralName();
  &rcub;
&rcub;

</code-example>

<div class="alert is-helpful">

**NOTE**: <br />
The `ng-template` element is a good choice for a dynamic component, because it does not render any unspecified output.

</div>

## Resolve a component

Review the parts of the `ComponentName.component.ts` file.

| Part                   | Details |
|:---                    |:---     |
| `ComponentName`        | A method. Takes an array of `ComponentNameItem` objects as input, which ultimately comes from `ComponentNameService`. |
| `ComponentNameItem`    | An object. Specify the type of component to load and any data to bind to the component.                               |
| `ComponentNameService` | A method. Returns the actual items to display.                                                                        |

Pass an array of components to the `ComponentName` component to allow you to use a dynamic list of advertisements without static elements in the template.

The `ComponentName` component uses the `getComponentPluralName` method to cycle through the array of `ComponentNameItems` and run the `loadComponent` method every 3 seconds to load a new component.

<code-example format="typescript" header="ComponentName.component.ts: Add directive-css-selector-name to ng-template" language="typescript">

export class ComponentName implements OnInit, OnDestroy {
  &commat;Input() VariableName: ComponentNameItem[] = [];

  currentComponentNameIndex = -1;

  &commat;ViewChild(DirectiveName, {static: true}) directive-css-selector-name!: DirectiveName;
  interval: number&verbar;undefined;

  ngOnInit(): void {
    this.loadComponent();
    this.getComponentPluralName();
  }
}

</code-example>

Use the `loadComponent` method to complete the majority of the work for you.

1.  Use the `loadComponent` method to pick a target for the component.

    <div class="alert is-helpful">

    <header>How the <code>loadComponent</code> method chooses a target</header>

    The `loadComponent` method uses the following process to choose a target.

    1.  To set the `currentComponentNameIndex` variable, the `loadComponent` method completes the following steps.
        1.  Get the value of the current `currentComponentNameIndex` variable.
        1.  Add 1 to the value.
        1.  Divide the value by the length of the `ComponentNameItem` array.
        1.  Set the modulus value as the new value of the `currentComponentNameIndex` variable.
    1.  To select an `ComponentNameItem` object from the `ComponentNameItem` array, the `loadComponent` method uses the new value of the `currentComponentNameIndex` variable.

    </div>

1.  Target the `viewContainerRef` that exists on the specific instance of the component.
    Confirm the following items to determine if it is the specific instance.

    *   It references `directive-css-selector-name` selector
    *   `directive-css-selector-name` selector is the directive you set up earlier to tell Angular where to insert a dynamic component

The `DirectiveName` directive injects `ViewContainerRef` reference into the associated constructor.
To host the dynamic component, use the directive to access a specific element.

To add the component to the template, run the `createComponent` method on `ViewContainerRef` reference.

The `createComponent` method returns a reference to the loaded component.
Use that reference to interact with the component by assigning to the associated properties or running the associated methods.

## The interface

All components implement a common interface for the `ComponentName` component to standardize the API for passing data to the components.

<!-- links -->

[AioGuideComponentCreateCli]: guide/component/component-create-cli "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"

[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-08
