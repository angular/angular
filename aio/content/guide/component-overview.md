# Angular components overview

Components are the main building block for Angular applications.
Each component consists of:

*   An HTML template that declares what renders on the page
*   A TypeScript class that defines behavior
*   A CSS selector that defines how the component is used in a template
*   Optionally, CSS styles applied to the template

This topic describes how to create and configure an Angular component.

<div class="alert is-helpful">

To view or download the example code used in this topic, see the <live-example></live-example>.

</div>

## Prerequisites

To create a component, verify that you have met the following prerequisites:

1.  [Install the Angular CLI.](guide/setup-local#install-the-angular-cli)
1.  [Create an Angular workspace](guide/setup-local#create-a-workspace-and-initial-application) with initial application.
    If you don't have a project, create one using `ng new <project-name>`, where `<project-name>` is the name of your Angular application.

## Creating a component

The best way to create a component is with the Angular CLI.
You can also create a component manually.

### Creating a component using the Angular CLI

To create a component using the Angular CLI:

1.  From a terminal window, navigate to the directory containing your application.
1.  Run the `ng generate component <component-name>` command, where `<component-name>` is the name of your new component.

By default, this command creates the following:

*   A directory named after the component
*   A component file, `<component-name>.component.ts`
*   A template file, `<component-name>.component.html`
*   A CSS file, `<component-name>.component.css`
*   A testing specification file, `<component-name>.component.spec.ts`

Where `<component-name>` is the name of your component.

<div class="alert is-helpful">

You can change how `ng generate component` creates new components.
For more information, see [ng generate component](cli/generate#component-command) in the Angular CLI documentation.

</div>

### Creating a component manually

Although the Angular CLI is the best way to create an Angular component, you can also create a component manually.
This section describes how to create the core component file within an existing Angular project.

To create a new component manually:

1.  Navigate to your Angular project directory.
1.  Create a new file, `<component-name>.component.ts`.
1.  At the top of the file, add the following import statement.

    <code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="import"></code-example>

1.  After the `import` statement, add a `@Component` decorator.

    <code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="decorator-skeleton"></code-example>

1.  Choose a CSS selector for the component.

    <code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="selector"></code-example>

    For more information on choosing a selector, see [Specifying a component's selector](#specifying-a-components-css-selector).

1.  Define the HTML template that the component uses to display information.
    In most cases, this template is a separate HTML file.

    <code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="templateUrl"></code-example>

    For more information on defining a component's template, see [Defining a component's template](#defining-a-components-template).

1.  Select the styles for the component's template.
    In most cases, you define the styles for your component's template in a separate file.

    <code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="decorator"></code-example>

1.  Add a `class` statement that includes the code for the component.

    <code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="class"></code-example>

## Specifying a component's CSS selector

Every component requires a CSS *selector*. A selector instructs Angular to instantiate this component wherever it finds the corresponding tag in template HTML.
For example, consider a component `hello-world.component.ts` that defines its selector as `app-hello-world`.
This selector instructs Angular to instantiate this component any time the tag `<app-hello-world>` appears in a template.

Specify a component's selector by adding a `selector` statement to the `@Component` decorator.

<code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="selector"></code-example>

## Defining a component's template

A template is a block of HTML that tells Angular how to render the component in your application.
Define a template for your component in one of two ways: by referencing an external file, or directly within the component.

To define a template as an external file, add a `templateUrl` property to the `@Component` decorator.

<code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="templateUrl"></code-example>

To define a template within the component, add a `template` property to the `@Component` decorator that contains the HTML you want to use.

<code-example path="component-overview/src/app/component-overview/component-overview.component.1.ts" region="template"></code-example>

If you want your template to span multiple lines, use backticks \(<code>&grave;</code>\).
For example:

<code-example path="component-overview/src/app/component-overview/component-overview.component.2.ts" region="templatebacktick"></code-example>

<div class="alert is-helpful">

An Angular component requires a template defined using `template` or `templateUrl`.
You cannot have both statements in a component.

</div>

## Declaring a component's styles

Declare component styles used for its template in one of two ways:
By referencing an external file, or directly within the component.

To declare the styles for a component in a separate file, add a `styleUrls` property to the `@Component` decorator.

<code-example path="component-overview/src/app/component-overview/component-overview.component.ts" region="decorator"></code-example>

To declare the styles within the component, add a `styles` property to the `@Component` decorator that contains the styles you want to use.

<code-example path="component-overview/src/app/component-overview/component-overview.component.3.ts" region="styles"></code-example>

The `styles` property takes an array of strings that contain the CSS rule declarations.

## Next steps

*   For an architectural overview of components, see [Introduction to components and templates](guide/architecture-components)
*   For additional options to use when creating a component, see [Component](api/core/Component) in the API Reference
*   For more information on styling components, see [Component styles](guide/component-styles)
*   For more information on templates, see [Template syntax](guide/template-syntax)

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
