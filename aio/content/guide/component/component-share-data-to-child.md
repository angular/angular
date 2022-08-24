# Send data to a child component

The `@Input` decorator function in a child component or directive signifies that the property is able to receive a value from the parent component.

<div class="lightbox">

<img alt="Input data flow diagram of data flowing from parent to child" src="generated/images/guide/inputs-outputs/input.svg">

</div>

The `@Input` decorator function marks a property in a child component as a connection for data to travel from the parent component to the child component.

## Prerequisites

Before you send data to a child component in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreateCli].

## Configure the child component to receive data

To use the `@Input` decorator function in a child component class, complete the following actions.

1.  Import the `Input` module.
1.  Add the `@Input` decorator function to the property.

    <code-example format="typescript" header="Add @Input property to child component" language="typescript">

    export class ChildComponentName {
      &commat;Input() ChildPropertyName = 'ChildPropertyValue';
    }

    </code-example>

    Types for a property of the `@Input` decorator function include `number`, `string`, `boolean`, and `object`.
    The value for the `ChildPropertyName` property comes from the parent component.

1.  Add the following HTML content to the template of the component.

    <code-example format="html" header="Add template to child component" language="html">

    &lt;div&gt;
      Value for today: {{ChildPropertyName}}
    &lt;/div&gt;

    </code-example>

## Configure the parent component to send data

To bind the property in the template of the parent component, complete the following actions.

1.  Use the `child-css-selector-name` selector of the child component, as a directive within the template of the parent component.
1.  Use [property binding][AioGuidePropertyBinding] to bind the `ChildPropertyName` property in the child component to the `ParentPropertyName` property of the parent component.

    <code-example format="html" header="Add template to parent component" language="html">

    &lt;child-css-selector-name [ChildPropertyName]="ParentPropertyName"&gt;&lt;/child-css-selector-name&gt;

    </code-example>

1.  In the parent component class, set a value for `ParentPropertyName`.

    <code-example format="typescript" header="Add property to class in parent component" language="typescript">

    export class ParentComponentName {
      ParentPropertyName = 'ParentPropertyValue';
    }

    </code-example>

Angular uses the `@Input` decorator to pass the value for `ParentPropertyName` property to the child component.
The `ChildPropertyName` property renders as `ParentPropertyValue` property.

The following diagram shows the structure.

<code-example format="html" header="Property binding diagram of the ChildPropertyName property in square brackets set to the ParentPropertyName property on the right of an equal sign" hideCopy language="html">

&lt;child-css-selector-name [ChildPropertyName]="ParentPropertyName"&gt;
 &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/  &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/   &bsol;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;&lowbar;/
       &verbar;                          &verbar;                       &verbar;
  CSS selector                  Target:                 Source:
    from                          &commat;Input property         property
    child component               from                    from
                                  child component         parent component

</code-example>

The target property placed between the square bracket \(`[` `]`\) characters is the property that you decorate with the `@Input` decorator function in the child component.
The binding source, the part to the right of the equal sign, is the data that the parent component passes to the nested component.

## Watch for `@Input()` changes

To watch for changes on a property of the `@Input` decorator, use the `ngOnChanges` Angular lifecycle hook method.

<!-- To watch for changes on a property of the `@Input` decorator, use the `ngOnChanges` Angular [lifecycle hook][AioGuideComponentUseLifecycleHooks] method. -->

<!-- To learn more about the `ngOnChanges` lifecycle hook method, see [Use change detection hook methods][AioGuideComponentLifecycleTutorialUseChangeDetectionHooks]. -->

<!-- links -->

[AioGuideComponentCreateCli]: guide/component/component-create-cli "Create an Angular component | Angular"

<!-- [AioGuideComponentLifecycleTutorialUseChangeDetectionHooks]: guide/component/component-example-lifecycle#use-change-detection-hooks "Use change detection hooks - Example: lifecycle hook methods | Angular" -->

<!-- [AioGuideComponentUseLifecycleHooks]: guide/component/component-use-lifecycle-hooks "Understand the lifecycle of a component | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuidePropertyBinding]: guide/property-binding "Property binding | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-08-24
