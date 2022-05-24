# Multi-slot content projection

A component is able to use multiple slots.
Each slot is able to specify a CSS selector that determines the content that goes into each slot.
This pattern is referred to as *multi-slot content projection*.
With this pattern, you must specify where you want the projected content to appear.
You accomplish this task by using the `select` attribute of `<ng-content>`.

## Prerequisites

Before you work with multi-slot content projection in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Add `<ng-content>` to template

To create a component that uses multi-slot content projection, complete the following tasks.

1.  In the template for your component, add an `<ng-content>` element where you want the projected content to appear.
1.  Add a `select` attribute to the `<ng-content>` elements.
    Angular supports [selectors][MdnDocsWebCssCssSelectors] for any combination of tag name, attribute, CSS class, and the `:not` pseudo-class.

    In the following code example, the component uses an `ng-content` element to display a message.

    <code-example format="typescript" header="Add ng-content to template" language="typescript">

    &commat;Component({
      selector: '{name-of-css-selector}',
      template: &grave;
        &lt;h2&gt;Multi-slot content projection&lt;/h2&gt;

        Default:
        &lt;ng-content&gt;&lt;/ng-content&gt;

        {ValueOfSelect}:
        &lt;ng-content select="[{valueofselect}]"&gt;&lt;/ng-content&gt;
      &grave;,
    })
    export class &lcub;NameOfComponent&rcub;Component {}

    </code-example>

## Create replacement content

Project HTML into the component.

1.  In the template where you want to project content, use the CSS selector of the component to specify the HTML content.
    Content that uses the `{ValueOfSelect}` attribute is projected into the `ng-content` element with the `select` attribute set to `{ValueOfSelect}`.

    <code-example format="html" header="Create content for ng-content" language="html">

    &lt;{name-of-css-selector}&gt;
      &lt;p&gt;Content projection is cool.&lt;/p&gt;
      &lt;p {ValueOfSelect}&gt;Learn more about content projection.&lt;/p&gt;
    &lt;/{name-of-css-selector}&gt;

    </code-example>

<div class="callout is-helpful">

<header><code>ng-content</code> element without a select attribute</header>

If a component includes the `ng-content` element without a `select` attribute, then the instance receives all projected components that do not match any of the other `ng-content` elements.

In the following code example, only the second `ng-content` element defines a `select` attribute.
As a result, the first `ng-content` element receives any other content projected into the component.

<code-example format="html" header="Create content for ng-content" language="html">

&lt;{name-of-css-selector}&gt;
  &lt;p&gt;Content projection is cool.&lt;/p&gt;
  &lt;p {ValueOfSelect}&gt;Learn more about content projection.&lt;/p&gt;
&lt;/{name-of-css-selector}&gt;

</code-example>

</div>

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

[MdnDocsWebCssCssSelectors]: https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors

<!-- "CSS selectors | MDN" -->

<!-- end links -->

@reviewed 2022-04-13
