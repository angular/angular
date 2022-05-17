# Create an Angular component

You have two ways to create a new Angular component.

*    The fastest and easiest way is to [use the Angular CLI to create a component][AioGuideComponentCreateUseTheAngularCliToCreateAComponent]
*    You are also able to [manually create a component][AioGuideComponentCreateManuallyCreateAComponent]

## Prerequisites

Before you create new Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.

    <div class="alert is-important">

    **IMPORTANT**: <br />

    If you do not have a project, run the following Angular CLI command and replace `{project_name}` with the name of your Angular application.

    <code-example format="shell" header="ng new Angular CLI command" language="shell">

    ng new {project_name}

    </code-example>

    </div>

## Use the Angular CLI to create a component

The [`ng generate component`][AioCliGenerateComponentCommand] Angular CLI command does most of the work for you.

To create a component, complete the following actions.

1.  Open a command-line window.
1.  Navigate to your Angular project directory.
1.  Run the following Angular CLI command and replace `&lcub;NameOfComponent&rcub;` with the name of your new component.

    <code-example format="shell" header="ng generate component Angular CLI command" language="shell">

    ng generate component &lcub;NameOfComponent&rcub;

    </code-example>

    <div class="alert is-helpful">

    <header>The <code>ng generate component</code> Angular CLI command<header>

    The [`ng generate component`][AioCliGenerateComponentCommand] Angular CLI command creates the following directory and files.

    <div class="filetree">
        <div class="file">
          &lcub;NameOfComponent&rcub;
        </div>
        <div class="children">
            <div class="file">
              &lcub;NameOfComponent&rcub;.component.css
            </div>
            <div class="file">
              &lcub;NameOfComponent&rcub;.component.html
            </div>
            <div class="file">
              &lcub;NameOfComponent&rcub;.component.spec.ts
            </div>
            <div class="file">
              &lcub;NameOfComponent&rcub;.component.ts
            </div>
        </div>
    </div>

    | Directories and files               | Details |
    |:---                                 |:---     |
    | &lcub;NameOfComponent&rcub;                   | A directory named after the component.   |
    | &lcub;NameOfComponent&rcub;.component.css     | A style CSS file.                        |
    | &lcub;NameOfComponent&rcub;.component.html    | A template HTML file.                    |
    | &lcub;NameOfComponent&rcub;.component.spec.ts | A testing specification typescript file. |
    | &lcub;NameOfComponent&rcub;.component.ts      | A component typescript file.             |

    </div>

To learn more about how to customize the [`ng generate component`][AioCliGenerateComponentCommand] Angular CLI command to create a new component, see [`ng generate component`][AioCliGenerateComponentCommand].

To learn more about the structure for an Angular component, see [Understand the structure an Angular component][AioGuideComponentStructure].

</div>

## Manually create a component

The following table shows the stages to manually create a simple Angular component.

| Stage | Action |
|:---   |:---    |
| 1     | [Create the component file](#create-the-component-file)          |
| 2     | [Add the import statement](#add-the-import-statement)            |
| 3     | [Add the `@Component()` decorator](#add-the-component-decorator) |
| 4     | [Specify the CSS selector](#specify-the-css-selector)            |
| 5     | [Define the template](#define-the-template)                      |
| 6     | [Declare the styles](#declare-the-styles)                        |
| 7     | [Add the class statement](#add-the-class-statement)              |

### Create the component file

1.  Navigate to your Angular project directory.
1.  Create a new TypeScript file named `&lcub;NameOfComponent&rcub;.component.ts`.
    Replace `&lcub;NameOfComponent&rcub;` with the name of your new component.

### Add the import statement

1.  Open the new `&lcub;NameOfComponent&rcub;.component.ts` file.
1.  Add the following import statement.

    <code-example header="&lcub;NameOfComponent&rcub;.component.ts: Add import statement" path="component-overview/src/app/component-overview/component-overview.component.ts" region="import"></code-example>

### Add the `@Component()` decorator

1.  Below the `import` statement, add the following `@Component()` decorator.

    <code-example header="&lcub;NameOfComponent&rcub;.component.ts: Add &commat;Component decorator" path="component-overview/src/app/component-overview/component-overview.component.ts" region="decorator-skeleton"></code-example>

To learn more about the `@Component()` decorator, see [Component class][AioGuideComponentStructureComponentClass].

### Specify the CSS selector

1.  In the `@Component()` decorator, add a `selector` statement.

    <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a selector statement" language="typescript">

    &commat;Component({
      selector: '{name-of-css-selector}',
    })

    </code-example>

To learn more about the `selector` metadata, see [`selector`][AioGuideComponentStructureSelector].

### Define the template

1.  In the `@Component()` decorator, add a template for your component in one of the two following ways.

    | Reference type         | Details |
    |:---                    |:---     |
    | external template file | In the the `@Component()` decorator, add a `templateUrl` property. <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a selector statement" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: '{name-of-css-selector}', &NewLine;&nbsp; templateUrl: '{relative/path/to/template/file}.html', &NewLine;}) </code-example>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
    | inline template        | In the the `@Component()` decorator, add a `template` property that contains the HTML. <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a single-line templateUrl" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: '{name-of-css-selector}', &NewLine;&nbsp; template: '&lt;h1&gt;Hello World&lt;/h1&gt;', &NewLine;}) </code-example> To allow the template to span multiple lines, use grave accent \(<code>&grave;</code>\) characters. <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a multiline templateUrl" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: '{name-of-css-selector}', &NewLine;&nbsp; template: &grave; &NewLine;&nbsp;&nbsp;&nbsp; &lt;h1&gt;Hello World&lt;/h1&gt; &NewLine;&nbsp;&nbsp;&nbsp; &lt;p&gt;This template definition spans multiple lines.&lt;/p&gt; &NewLine;&nbsp; &grave;, &NewLine;}) </code-example> |

    <div class="alert is-important">

    **IMPORTANT**: <br />
    An Angular component requires a template defined using the `template` or `templateUrl` property.
    You must not use both properties in a component.

    </div>

To learn more about the `template` and `templateUrls` metadata, see [Template metadata][AioGuideComponentStructureTemplateMetadata].

### Declare the styles

1.  In the `@Component()` decorator, add the style associated with the template for your component in the following ways.

    | Reference type      | Details |
    |:---                 |:---     |
    | external style file | In the the `@Component()` decorator, add a `styleUrls` property. <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: '{name-of-css-selector}', &NewLine;&nbsp; templateUrl: '{relative/path/to/template/file}.html', &NewLine;&nbsp; styleUrls: ['{relative/path/to/style/file}.css'], &NewLine;}) </code-example> The `stylesUrls` property takes an array of strings that contains the CSS style files.                                      |
    | inline style        | In the the `@Component()` decorator, add a `styles` property that contains the CSS style. <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a selector statement" language="typescript"> &commat;Component({ &NewLine;&nbsp; selector: '{name-of-css-selector}', &NewLine;&nbsp; template: '&lt;h1&gt;Hello World&lt;/h1&gt;', &NewLine;&nbsp; styles: ['h1 { font-weight: normal; }'], &NewLine;}) </code-example> The `styles` property takes an array of strings that contains the CSS rule declarations. |

To learn more about the `style` and `styleUrls` metadata, see [Style metadata][AioGuideComponentStructureStyleMetadata].

To learn how to use styles in Angular components, see [Component style][AioGuideComponentStyle],

### Add the class statement

1.  Below the `@Component()` decorator, add a `class` statement that includes the code for the component.
    In the following code example, the `class` is named `&lcub;NameOfComponent&rcub;Component`.

    <code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a class statement" language="typescript">

    export class &lcub;NameOfComponent&rcub;Component {
      /* &hellip; */
    }

    </code-example>

To learn more about the component class, see [Component class][AioGuideComponentStructureComponentClass].

### Review your component typescript file

Your `&lcub;NameOfComponent&rcub;.component.ts` file should appear similar to the following code example.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts: Add a class statement" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  templateUrl: '{relative/path/to/template/file}.html',
  styleUrls: ['{relative/path/to/style/file}.css'],
})
export class &lcub;NameOfComponent&rcub;Component {
  /* &hellip; */
}

</code-example>

To learn more about the structure for an Angular component, see [Understand the structure an Angular component][AioGuideComponentStructure].

## What's Next

*   [Use an Angular component][AioGuideComponentUsage]

<!-- links -->

[AioCliGenerateComponentCommand]: cli/generate#component-command "component - ng generate | CLI | Angular"
[AioCliNew]: cli/new "ng new | CLI | Angular"

[AioGuideComponentCreateDeclareTheStyles]: guide/component/component-create#declare-the-styles "Declare the styles - Create an Angular component | Angular"
[AioGuideComponentCreateDefineTheTemplate]: guide/component/component-create#define-the-template "Define the template - Create an Angular component | Angular"
[AioGuideComponentCreateManuallyCreateAComponent]: guide/component/component-create#manually-create-a-component "Manually create a component - Create an Angular component | Angular"
[AioGuideComponentCreateSpecifyTheCssSelector]: guide/component/component-create#specify-the-css-selector "Specify the CSS selector - Create an Angular component | Angular"
[AioGuideComponentCreateUseTheAngularCliToCreateAComponent]: guide/component/component-create#use-the-angular-cli-to-create-a-component "Use the Angular CLI to create a component - Create an Angular component | Angular"

[AioGuideComponentStructure]: guide/component/component-structure "Understand the structure an Angular component | Angular"
[AioGuideComponentStructureComponentClass]: guide/component/component-structure#component-class "Component class - Understand the structure an Angular component | Angular"
[AioGuideComponentStructureSelector]: guide/component/component-structure#selector  "selector - Understand the structure an Angular component | Angular"
[AioGuideComponentStructureStyleMetadata]: guide/component/component-structure#style-metadata  "Style metadata - Understand the structure an Angular component | Angular"
[AioGuideComponentStructureTemplateMetadata]: guide/component/component-structure#template-metadata  "Template metadata - Understand the structure an Angular component | Angular"
[AioGuideComponentStructureComponentMetadata]: guide/component/component-structure#component-metadata  "Component metadata - Understand the structure an Angular component | Angular"

[AioGuideComponentStyle]: guide/component/component-style "Component style | Angular"

[AioGuideComponentUsage]: guide/component/component-usage "Use an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
