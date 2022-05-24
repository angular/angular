# Example: Dynamically load a component

A template in a component is not always fixed.
Angular provides an API to dynamically load a component at runtime.

## Prerequisites

Before you work with styles in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Reasons to dynamically load a component

You are not able to use a template with a static component structure due to practical limitations.

You need to load a new component without a fixed reference to the component in the template for the advertisement banner.

## The anchor directive

Before you add a component, you have to define an anchor point for Angular to insert the component.

Use a helper directive to mark valid insertion points in the HTML template.

<code-example format="typescript" header="{NameOfDirective}Directive.directive.ts" language="typescript">

import { Directive, ViewContainerRef } from '&commat;angular/core';

&commat;Directive({
  selector: '[{name-of-directive-css-selector}]',
})
export class {nameOfDirective}Directive {
  constructor(public viewContainerRef: ViewContainerRef) { }
}

</code-example>

| Parts        | Details |
|:---          |:---     |
| `@Directive` | The directive decorator.                                                                                            |
| `selector`   | The name of the directive. Angular searches for the matching element and applies the view in the HTML template. |

| Parts                        | Details |
|:---                          |:---     |
| `{NameOfDirective}Directive` | The name of the helper directive class. Injects the `ViewContainerRef` component to gain access to the view container of the element that hosts the dynamically added component. |
| `{name-of-directive-css-selector}`     | The selector. Use that name to apply the directive to the element.                                                                                                               |

## Load a component

Apply the `{NameOfDirective}Directive` directive to the `ng-template` element.

1.  Locate the `ng-template` element.
1.  Add the `{name-of-directive-css-selector}` selector as an attribute to the `ng-template` element.
    Be sure to remove the square brackets.

Now, Angular knows where to dynamically load your component.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add {name-of-directive-css-selector} to ng-template" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  template: &grave;
    &lt;div&gt;
      &lt;h3&gt;Heading 3&lt;/h3&gt;
      &lt;ng-template {name-of-directive-css-selector}&gt;&lt;/ng-template&gt;
    &lt;/div&gt;
  &grave;,
})
export class &lcub;NameOfComponent&rcub;Component implements OnInit, OnDestroy {
  &commat;Input() {nameOfVariable}: &lcub;NameOfComponent&rcub;Item[] = [];

  current&lcub;NameOfComponent&rcub;Index = -1;

  &commat;ViewChild({NameOfDirective}Directive, {static: true}) {name-of-directive-css-selector}!: {NameOfDirective}Directive;
  interval: number&verbar;undefined;

  ngOnInit(): void {
    this.loadComponent();
    this.get{PluralNameOfComponent}();
  }
}

</code-example>

<div class="alert is-helpful">

**NOTE**: <br />
The `ng-template` element is a good choice for a dynamic component, because it does not render any additional output.

</div>

## Resolve a component

Review the parts of the `&lcub;NameOfComponent&rcub;.component.ts` file.

|                              | Details |
|:---                          |:---     |
| `&lcub;NameOfComponent&rcub;Component` | A method. Takes an array of `&lcub;NameOfComponent&rcub;Item` objects as input, which ultimately comes from `&lcub;NameOfComponent&rcub;Service`. |
| `&lcub;NameOfComponent&rcub;Item`      | An object. Specify the type of component to load and any data to bind to the component.                                       |
| `&lcub;NameOfComponent&rcub;Service`   | A method. Returns the actual items to display.                                               |

Pass an array of components to the `&lcub;NameOfComponent&rcub;Component` component to allow you to use a dynamic list of advertisements without static elements in the template.

The `&lcub;NameOfComponent&rcub;Component` component uses the `get{PluralNameOfComponent}()` method to cycle through the array of `&lcub;NameOfComponent&rcub;Items` and run the `loadComponent()` method every 3 seconds to load a new component.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add {nameSelector} to ng-template" language="typescript">

export class &lcub;NameOfComponent&rcub;Component implements OnInit, OnDestroy {
  &commat;Input() {nameOfVariable}: &lcub;NameOfComponent&rcub;Item[] = [];

  current&lcub;NameOfComponent&rcub;Index = -1;

  &commat;ViewChild({NameOfDirective}Directive, {static: true}) {name-of-directive-css-selector}!: {NameOfDirective}Directive;
  interval: number&verbar;undefined;

  ngOnInit(): void {
    this.loadComponent();
    this.get{PluralNameOfComponent}();
  }
}

</code-example>

Use the `loadComponent()` method to complete the majority of the work for you.

1.  Use the `loadComponent()` method to pick a target for the component.

    <div class="alert is-helpful">

    <header>How <code>loadComponent()</code> chooses a target</header>

    The `loadComponent()` method uses the following process to choose a target.

    1.  To set the `current&lcub;NameOfComponent&rcub;Index` variable, the `loadComponent()` method completes the following steps.
        1.  Get the value of the current `current&lcub;NameOfComponent&rcub;Index` variable.
        1.  Add 1 to the value.
        1.  Divide the value by the length of the `&lcub;NameOfComponent&rcub;Item` array.
        1.  Set the remainder as the new value of the `current&lcub;NameOfComponent&rcub;Index` variable.
    1.  To select an `&lcub;NameOfComponent&rcub;Item` object from the `&lcub;NameOfComponent&rcub;Item` array, the `loadComponent()` method uses the new value of the `current&lcub;NameOfComponent&rcub;Index` variable.

    </div>

1.  Target the `viewContainerRef` that exists on the specific instance of the component.
    Confirm the following items to determine if it is the specific instance.

    *   It references `{name-of-directive-css-selector}` selector
    *   `{name-of-directive-css-selector}` selector is the directive you set up earlier to tell Angular where to insert a dynamic component

The `{NameOfDirective}Directive` directive injects `ViewContainerRef` reference into the associated constructor.
To host the dynamic component, use the directive to access a specific element.

To add the component to the template, run the `createComponent()` method on `ViewContainerRef` reference.

The `createComponent()` method returns a reference to the loaded component.
Use that reference to interact with the component by assigning to the associated properties or running the associated methods.

## The interface

All components implement a common interface for the `&lcub;NameOfComponent&rcub;Component` component to standardize the API for passing data to the components.

<!-- links -->

[AioGuideComponentCreate]: guide/component/component-create

<!-- "Create an Angular component | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component

<!-- "component - Glossary | Angular" -->

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application

<!-- "Create a workspace and initial application - Setting up the local environment and workspace | Angular" -->

[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli

<!-- "Install the Angular CLI - Setting up the local environment and workspace | Angular" -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
