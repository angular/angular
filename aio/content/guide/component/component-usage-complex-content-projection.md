# Project content in more complex environments

Typically usage for [Multi-slot Content Projection][AioGuideComponentUsageMultiSlotContentProjection] includes using an attribute, element, style definition, or some combination of all three to identify where to project your content.

The content you want to project lives inside another element.
To project this content, use the `ngProjectAs` attribute.
Angular uses a CSS selector as the value of the `ngProjectAs` attribute in order to project an entire `ng-container` element into a component.

## Prerequisites

Before you work with styles in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Project content as a different element

To project content from one element into a component, complete the following actions.

1.  In the following code example, a `p` element uses the `{ValueOfSelect}` custom attribute to project content into the `{name-of-css-selector}` component.

    <code-example format="html" header="Specify content using a custom attribute" language="html">

    &lt;{name-of-css-selector}&gt;
      &lt;p&gt;Content projection is cool.&lt;/p&gt;
      &lt;p {ValueOfSelect}&gt;Learn more about content projection.&lt;/p&gt;
    &lt;/{name-of-css-selector}&gt;

    </code-example>

1.  Use the `ngProjectAs` attribute of the `ng-container` element to project the content from the child of another element.
    This projection is a simulated projection from a simple structure to a complex structure.

    <code-example format="html" header="Create content for ng-content" language="html">

    <ng-container ngProjectAs="[{ValueOfSelect}]">
      <p>Content projection is super cool.</p>
    </ng-container>

    </code-example>

<div class="callout is-helpful">

**NOTE**: <br />
The `ng-container` element is a logical construct that is used to group other DOM elements.
The `ng-container` element does not get rendered in the DOM tree.

</div>

<!-- links -->

[AioGuideComponentCreate]: guide/component/component-create "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
