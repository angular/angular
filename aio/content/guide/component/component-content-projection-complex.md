# Project content in more complex environments

To help you project your content, [Multi-slot Content Projection][AioGuideComponentUseMultiSlotContentProjection] includes the following parts.

*   An attribute
*   An element
*   A CSS rule
*   A combination of all three of an attribute, an element and a CSS rule

The content you want to project lives inside another element.
To project the content, use the `ngProjectAs` attribute.
Angular uses a CSS selector as the value of the `ngProjectAs` attribute to project an entire `ng-container` element into a component.

## Prerequisites

Before you work with styles in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreateCli].

## Project content as a different element

To project content from one element into a component, complete the following actions.

1.  In the following code example, a `p` element uses the `SelectValue` custom attribute to project content into the `css-selector-name` component.

    <code-example format="html" header="Specify content using a custom attribute" language="html">

    &lt;css-selector-name&gt;
        &lt;p&gt;Content projection is cool.&lt;/p&gt;
        &lt;p SelectValue&gt;Learn more about content projection.&lt;/p&gt;
    &lt;/css-selector-name&gt;

    </code-example>

1.  Use the `ngProjectAs` attribute of the `ng-container` element to project the content from the child of another element.
    This projection is a simulated projection from a simple structure to a complex structure.

    <code-example format="html" header="Create content for ng-content element" language="html">

    &lt;ng-container ngProjectAs="[SelectValue]"&gt;
        &lt;p&gt;Content projection is super cool.&lt;/p&gt;
    &lt;/ng-container&gt;

    </code-example>

<div class="callout is-helpful">

**NOTE**: <br />
The `ng-container` element is a logical construct that is used to group other DOM elements.
The `ng-container` element does not get rendered in the DOM tree.

</div>

<!-- links -->

[AioGuideComponentCreateCli]: guide/component/component-create-cli "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-09-02
