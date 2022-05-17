# Use an Angular component

There are two ways to load an Angular component.

    | Types                                   | Details |
    |:---                                     |:---     |
    | Fixed                                   | export            |
    | [Dynamic][AioGuideComponentDynamicLoad] | import and export |

A fixed component is the type of loading that is mentioned throughout the docs.
To learn about dynamically loading a component, see [Example: Dynamically load a component][AioGuideComponentDynamicLoad].

## Prerequisites

Before you work with styles in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Component styles and view encapsulation

### Learn about how to scope and define style defintions

<div class="card-container">
    <a href="guide/component/component-style" class="docs-card" title="Component style">
        <section>Component style</section>
        <p>Learn how to apply a style definition to a template of a component</p>
        <p class="card-footer">Component style</p>
    </a>
    <a href="guide/component/component-encapsulate-style" class="docs-card" title="Component view encapsulation">
        <section>Component view encapsulation</section>
        <p>Learn how to encapsulate a style defintion within a component.</p>
        <p class="card-footer">Component view encapsulation</p>
    </a>
</div>

## Component data sharing and inheritance

A common pattern for Angular is to share data between a parent component and one or more child components.
Implement the pattern with the `@Input()` and `@Output()` decorator functions.

Consider the following hierarchy of elements in a component.

<code-example format="html" header="Hierarchy of elements" hideCopy language="html">

&lt;parent-component&gt;
    &lt;child-component&gt;&lt;/child-component&gt;
&lt;/parent-component&gt;

</code-example>

The `parent-component` element tag serves as the context for the `child-component` element tag.

A child component uses the `@Input()` and `@Output()` decorator functions to communicate with the parent component.
A parent component uses the `@Input()` decorator function to update data in the child component.
A child component uses the `@Output()` decorator function to send data to a parent component.

### Learn about how to share data

<div class="card-container">
    <a href="guide/component/component-usage-send-data-to-child" class="docs-card" title="Send data to a child component">
        <section>Send data to a child component</section>
        <p>Learn how to use <code>&commat;input</code> decorator to send data from a parent component to a child component</p>
        <p class="card-footer">Send data to a child component</p>
    </a>
    <a href="guide/component/component-usage-send-data-to-parent" class="docs-card" title="Send data to a parent component">
        <section>Send data to a parent component</section>
        <p>Learn how to use <code>&commat;output</code> decorator to send data from a child component to a parent component.</p>
        <p class="card-footer">Send data to a parent component</p>
    </a>
    <a href="guide/component/component-usage-exchange-data" class="docs-card" title="Exchange data between to a child component and a parent component">
        <section>Exchange data between to a child component and a parent component</section>
        <p>Learn how to use <code>&commat;Input</code> and <code>&commat;Output</code> to exchange data between a child component and a parent component.</p>
        <p class="card-footer">Exchange data between to a child component and a parent component</p>
    </a>
</div>

## Content to component projection

Use content projection to create flexible, reusable components.

Content projection is a pattern in which you insert the content you want to use inside another component.
Insertion of content is also referenced as projection of content.
For example, your component may be a `Card` component that accepts content provided by another component.

### Learn about how to project a component

<div class="card-container">
    <a href="guide/component/component-usage-single-slot-content-projection" class="docs-card" title="Single-slot content projection">
        <section>Single-slot content projection</section>
        <p>Learn how to project content from one component into another component.</p>
        <p class="card-footer">Single-slot content projection</p>
    </a>
    <a href="guide/component/component-usage-multi-slot-content-projection" class="docs-card" title="Multi-slot content projection">
        <section>Multi-slot content projection</section>
        <p>Learn how to select and project content from one components into another component.</p>
        <p class="card-footer">Multi-slot content projection</p>
    </a>
    <a href="guide/component/component-usage-conditional-content-projection" class="docs-card" title="Conditional content projection">
        <section>Conditional content projection</section>
        <p>Learn how to project content based on conditions in the component.</p>
        <p class="card-footer">Conditional content projection</p>
    </a>
    <a href="guide/component/component-usage-complex-content-projection" class="docs-card" title="Project content in more complex environments">
        <section>Project content in more complex environments</section>
        <p>Learn how to project content from an elment into a component.</p>
        <p class="card-footer">Project content in more complex environments</p>
    </a>
</div>

<!-- links -->

[AioGuideComponentCreate]: guide/component/component-create "Create an Angular component | Angular"

[AioGuideComponentDynamicLoad]: guide/component/component-dynamic-load "Example: Dynamically load a component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
