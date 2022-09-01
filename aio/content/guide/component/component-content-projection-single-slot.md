# Use single-slot content projection

The most basic form of content projection is single-slot content projection.
Single-slot content projection refers to the creation of a component into which you are only able to project one component.

## Prerequisites

Before you work with single-slot content projection in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreateCli].

## Add `ng-content` element to HTML template

To create a component that uses single-slot content projection, complete the following tasks.

1.  In the template of the component, add an `ng-content` element where you want the projected content to appear.

    In the following code example, the component uses an `ng-content` element to display a message.

    <code-example format="typescript" header="Add ng-content element to HTML template" language="typescript">

    &commat;Component({
      selector: 'css-selector-name',
      template: &grave;
        &lt;h2&gt;Single-slot content projection&lt;/h2&gt;
        &lt;ng-content&gt;&lt;/ng-content&gt;
      &grave;,
    })
    export class ComponentName {}

    </code-example>

## Create replacement content

Project HTML into the component.

1.  In the template where you want to project content, use the CSS selector of the component to specify the HTML content.

    <code-example format="html" header="Create content for ng-content element" language="html">

    &lt;css-selector-name&gt;
        &lt;p&gt;Content projection is cool.&lt;/p&gt;
    &lt;/css-selector-name&gt;

    </code-example>

<div class="alert is-helpful">

**NOTE**: <br/>
The `ng-content` element tag is a placeholder that does not create a real DOM element.
Custom attributes applied to `ng-content` element tag are ignored.

</div>

<!-- links -->

[AioGuideComponentCreateCli]: guide/component/component-create-cli "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-01
