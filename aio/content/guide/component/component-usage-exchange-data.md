# Exchange data between to a child component and a parent component

Use the `@Input()` and `@Output()` decorator functions on the same child component as shown in the following code snippet.

## Prerequisites

Before you exchange data between a child component and a parent component in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Configure the child component to receive and send data

In the following code example, the `@Input()` and `@Output()` decorator functions share data between the template of the parent component to the template of the child component using the `{name-of-child-css-selector}` CSS selector.

<code-example format="html" header="Add template to child component" language="html">

&lt;{name-of-child-css-selector} [{nameOfChildProperty}]="current{nameOfParentProperty}"
                                 ({nameOfAction}Request)="{slangNameOfAction}{nameOfParentProperty}(&dollar;event)"&gt;
&lt;/{name-of-child-css-selector}&gt;

</code-example>

| Parts                                         | Details |
|:---                                           |:---     |
| `{name-of-child-css-selector}`                | The CSS selector of the child component |
| `{nameOfChildProperty}`                       | The property of the `@Input()` decorator function in the child component. Receives a value from the `{nameOfParentProperty}` property of the parent component. |
| `{nameOfAction}Request`                       | The event property of the `@Output()` decorator function in the child component. The argument for the `{slangNameOfAction}{nameOfParentProperty}()` method of the parent component |
| `{nameOfParentProperty}`                      | The property of the parent component |
| `{slangNameOfAction}{nameOfParentProperty}()` | The method of the parent component |

When a user chooses the `{nameOfAction}` button in the UI, Angular completes the following actions.

1.  The CSS selector of the child component emits the `{nameOfAction}Request` event property of the child component.
1.  The `{nameOfAction}Request` event property runs the `{slangNameOfAction}{nameOfParentProperty}()` method of the parent component.
1.  The `{slangNameOfAction}{nameOfParentProperty}()` method uses the `$event`.
1.  The template of the parent component displays the changes in the UI.

To learn more about how to combine property and event bindings using the banana-in-a-box \(`[(` `)]`\) syntax, see [Two-way Binding][AioGuideTwoWayBinding].

<!-- links -->

[AioGuideComponentCreate]: guide/component/component-create "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

[AioGuideTwoWayBinding]: guide/two-way-binding "Two-way binding | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
