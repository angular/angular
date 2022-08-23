# Manually create an Angular component

You have two ways to create a new Angular component.

*    The fastest and easiest way to create a component is to [use the Angular CLI][AioGuideComponentCreateCliUseTheAngularCliToCreateAComponent]
*    You are also able to [manually create an Angular component](#create-the-directory-and-file-structure-for-a-component)

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

## Create the directory and file structure for a component

The following table shows the stages to manually create a simple Angular component.

| Stage | Action |
|:---   |:---    |
| 1     | [Create the component file](#create-the-component-file)        |
| 2     | [Add the import statement](#add-the-import-statement)          |
| 3     | [Add the `@Component` decorator](#add-the-component-decorator) |
| 4     | [Specify the CSS selector](#specify-the-css-selector)          |
| 5     | [Define the HTML template](#define-the-html-template)          |
| 6     | [Declare the CSS styles](#declare-the-css-styles)              |
| 7     | [Add the class statement](#add-the-class-statement)            |

To learn more about the structure for an Angular component, see [Understand the structure an Angular component][AioGuideComponentStructure].

## Create the component file

1.  Navigate to your Angular project directory.
1.  Create a new TypeScript file named `NewComponentName.component.ts`.
    Replace `NewComponentName` with the name of your new component.

## Add the import statement

1.  Open the new `NewComponentName.component.ts` file.
1.  Add the following import statement.

    <code-example header="NewComponentName.component.ts: Add import statement" path="component-overview/src/app/component-overview/component-overview.component.ts" region="import"></code-example>

## Add the `@Component` decorator

To provide Angular-specific information for a component, add a `@Component` decorator on top of the TypeScript class.

1.  Below the `import` statement, add the following `@Component` decorator.

    <code-example header="NewComponentName.component.ts: Add &commat;Component decorator" path="component-overview/src/app/component-overview/component-overview.component.ts" region="decorator-skeleton"></code-example>

To learn more about the `@Component` decorator, see [Component class][AioGuideComponentStructure].

## Specify the CSS selector

1.  In the `@Component` decorator, add a `selector` statement.

    <code-example format="typescript" header="NewComponentName.component.ts: Add a selector statement" language="typescript">

    &commat;Component({
      selector: 'css-selector-name',
    })

    </code-example>

<!-- To learn more about the `selector` property, see [`selector` property][AioGuideComponentStructureSelectorProperty]. -->

## Define the HTML template

1.  In the `@Component` decorator, add a template for your component in one of the two following ways.

    | Reference type         | Details |
    |:---                    |:---     |
    | external template file | In the `@Component` decorator, add a `templateUrl` property. <code-example format="typescript" header="NewComponentName.component.ts: Add a selector statement" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: 'css-selector-name', &NewLine;&nbsp; templateUrl: 'relative/path/to/template/file-name.html', &NewLine;}) </code-example>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
    | inline template        | In the `@Component` decorator, add a `template` property that contains the HTML. <code-example format="typescript" header="NewComponentName.component.ts: Add a single-line templateUrl" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: 'css-selector-name', &NewLine;&nbsp; template: '&lt;h1&gt;Hello World&lt;/h1&gt;', &NewLine;}) </code-example> To allow the template to span several lines, use <code>&grave;</code> grave accent characters. <code-example format="typescript" header="NewComponentName.component.ts: Add a multiline templateUrl" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: 'css-selector-name', &NewLine;&nbsp; template: &grave; &NewLine;&nbsp;&nbsp;&nbsp; &lt;h1&gt;Hello World&lt;/h1&gt; &NewLine;&nbsp;&nbsp;&nbsp; &lt;p&gt;This template definition spans multiple lines.&lt;/p&gt; &NewLine;&nbsp; &grave;, &NewLine;}) </code-example> |

    <div class="alert is-important">

    **IMPORTANT**: <br />
    An Angular component requires a template defined using the `template` or `templateUrl` property.
    You must not use both properties in a component.

    </div>

<!-- To learn more about the `template` and `templateUrls` metadata, see [Metadata for HTML template][AioGuideComponentStructureMetadataForHtmlTemplate]. -->

## Declare the CSS styles

1.  In the `@Component` decorator, add the style associated with the template for your component in the following ways.

    | Reference type      | Details |
    |:---                 |:---     |
    | external style file | In the `@Component` decorator, add a `styleUrls` property. <code-example format="typescript" header="NewComponentName.component.ts" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: 'css-selector-name', &NewLine;&nbsp; templateUrl: 'relative/path/to/template/file-name.html', &NewLine;&nbsp; styleUrls: ['relative/path/to/style/file-name.css'], &NewLine;}) </code-example> The `stylesUrls` property takes an array of strings that contains the CSS style files.                                      |
    | inline style        | In the `@Component` decorator, add a `styles` property that contains the CSS style. <code-example format="typescript" header="NewComponentName.component.ts: Add a selector statement" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: 'css-selector-name', &NewLine;&nbsp; template: '&lt;h1&gt;Hello World&lt;/h1&gt;', &NewLine;&nbsp; styles: ['h1 { font-weight: normal; }'], &NewLine;}) </code-example> The `styles` property takes an array of strings that contains the CSS rule declarations. |

<!-- To learn more about the `style` and `styleUrls` metadata, see [Style metadata][AioGuideComponentStructureMetadataForCssStyles]. -->

To learn how to use styles in Angular components, see [Use of component style][AioGuideComponentStyle],

## Add the class statement

1.  Below the `@Component` decorator, add a `class` statement that includes the code for the component.
    In the following code example, the `class` is named `NewComponentName`.

    <code-example format="typescript" header="NewComponentName.component.ts: Add a class statement" language="typescript">

    export class NewComponentName {
      /* &hellip; */
    }

    </code-example>

To learn more about the component class, see [Component class][AioGuideComponentStructure].

## Review your component typescript file

The following code example shows the contents of your `NewComponentName.component.ts` file.

<code-example format="typescript" header="NewComponentName.component.ts: Add a class statement" language="typescript">

&commat;Component({
  selector: 'css-selector-name',
  templateUrl: 'relative/path/to/template/file-name.html',
  styleUrls: ['relative/path/to/style/file-name.css'],
})
export class NewComponentName {
  /* &hellip; */
}

</code-example>

To learn more about the structure for an Angular component, see [Understand the structure an Angular component][AioGuideComponentStructure].

## Lifecycle of a component

The Angular framework creates, updates, and destroys components while a user moves through your application.
To learn more about the lifecycle of a component, see [Understand the lifecycle of a component][AioGuideComponentLifecycleOverview].

<div class="alert is-helpful">

**NOTE**: <br />
The Angular framework provides optional lifecycle hook methods to access different phases of the rendering process.
<!-- To learn more about defining lifecycle hook methods in your component, see [Use an Angular lifecycle hook method][AioGuideComponentUseLifecycleHooks]. -->

</div>

<!-- ## Related content

*   [Create an Angular component][AioGuideComponentCreateCli]
*   [Use an Angular component][AioGuideComponentUse] -->

<!-- links -->

[AioGuideComponentManualCreate]: guide/component/component-manual-create "Manually create an Angular component | Angular"

[AioGuideComponentCreateCli]: guide/component/component-create-cli "Create an Angular component | Angular"
[AioGuideComponentCreateCliUseTheAngularCliToCreateAComponent]: guide/component/component-create-cli#use-the-angular-cli-to-create-a-component "Use the Angular CLI to create a component - Create an Angular component | Angular"

[AioGuideComponentLifecycleOverview]: guide/component/component-lifecycle-overview "Understand the lifecycle of a component | Angular"

[AioGuideComponentStructure]: guide/component/component-structure "Understand the structure an Angular component | Angular"

<!-- [AioGuideComponentStructureSelectorProperty]: guide/component/component-structure#selector-property "selector property - Understand the structure an Angular component | Angular"
[AioGuideComponentStructureMetadataForCssStyles]: guide/component/component-structure#metadata-for-css-styles "Metadata for CSS styles - Understand the structure an Angular component | Angular"
[AioGuideComponentStructureMetadataForHtmlTemplate]: guide/component/component-structure#metadata-for-html-template "Metadata for HTML template - Understand the structure an Angular component | Angular" -->

[AioGuideComponentStyle]: guide/component/component-style "Use of component style | Angular"

[AioGuideComponentUse]: guide/component/component-use "Use an Angular component | Angular"

<!-- [AioGuideComponentUseLifecycleHooks]: guide/component/component-use-lifecycle-hooks "Use an Angular lifecycle hook method | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-08-23
