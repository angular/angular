# Create an Angular component

You have two ways to create a new component.

*   The fastest and easiest way to create a component is to [use the Angular CLI][AioGuideComponentCreateUseTheAngularCliToCreateAComponent]
*   You are also able to [manually create an Angular component][AioGuideComponentCreateManual]

## Prerequisites

Before you create new Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.

    <div class="alert is-important">

    **IMPORTANT**: <br />
    If you do not have a project, run the `ng new` command and replace `new_project_name` with the name of your Angular application.

    <code-example format="shell" header="Create a new project for your Angular application" language="shell">

    ng new new_project_name

    </code-example>

    </div>

## Use the Angular CLI to create a component

The [`ng generate component`][AioCliGenerateComponentCommand] command does most of the work for you.

To create a component, complete the following actions.

1.  Open a command-line window and navigate to your Angular project directory.
1.  Run the `ng generate component` command and replace `NewComponentName` with the name of your new component.

    <code-example format="shell" header="ng generate component command" language="shell">

    ng generate component NewComponentName

    </code-example>

    <div class="alert is-helpful">

    <header>The <code>ng generate component</code> command<header>

    </div>

### Structure of a component

The [`ng generate component`][AioCliGenerateComponentCommand] command creates the following directory and file structure in your project directory.

<div class="filetree">
    <div class="file">
      NewComponentName
    </div>
    <div class="children">
        <div class="file">
          NewComponentName.component.css
        </div>
        <div class="file">
          NewComponentName.component.html
        </div>
        <div class="file">
          NewComponentName.component.spec.ts
        </div>
        <div class="file">
          NewComponentName.component.ts
        </div>
    </div>
</div>

| Directories and files              | Details |
|:---                                |:---     |
| NewComponentName                   | A directory named after the component.   |
| NewComponentName.component.css     | A style CSS file.                        |
| NewComponentName.component.html    | A template HTML file.                    |
| NewComponentName.component.spec.ts | A testing specification typescript file. |
| NewComponentName.component.ts      | A component typescript file.             |

To learn more about how to customize the [`ng generate component`][AioCliGenerateComponentCommand] command to create a new component, see [`ng generate component`][AioCliGenerateComponentCommand].

To learn more about the structure for a component, see [Understand the structure an Angular component][AioGuideComponentStructure].

## Lifecycle of a component

The Angular framework creates, updates, and destroys components while a user moves through your application.
To learn more about the lifecycle of a component, see [Understand the lifecycle of a component][AioGuideComponentLifecycleOverview].

<div class="alert is-helpful">

**NOTE**: <br />
The Angular framework provides optional lifecycle hook methods to access different phases of the rendering process.
<!-- To learn more about defining lifecycle hook methods in your component, see [Use an Angular lifecycle hook method][AioGuideComponentUseLifecycleHooks]. -->

</div>

<!-- ## Related content

*   [Manually create an Angular component][AioGuideComponentCreateManual]
*   [Use an Angular component][AioGuideComponentUse] -->

<!-- links -->

[AioCliGenerateComponentCommand]: cli/generate#component-command "component - ng generate | CLI | Angular"

[AioGuideComponentCreateManual]: guide/component/component-create-manual "Manually create an Angular component | Angular"

[AioGuideComponentCreateUseTheAngularCliToCreateAComponent]: guide/component/component-create-cli#use-the-angular-cli-to-create-a-component "Use the Angular CLI to create a component - Create an Angular component | Angular"

[AioGuideComponentLifecycleOverview]: guide/component/component-lifecycle-overview "Understand the lifecycle of a component | Angular"

[AioGuideComponentStructure]: guide/component/component-structure "Understand the structure an Angular component | Angular"

[AioGuideComponentUse]: guide/component/component-use "Use an Angular component | Angular"

<!-- [AioGuideComponentUseLifecycleHooks]: guide/component/component-use-lifecycle-hooks "Use an Angular lifecycle hook method | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-08-23
