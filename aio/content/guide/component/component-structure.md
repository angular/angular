# Understand the parts of an Angular component

The logic of a [component][AioGuideGlossaryComponent] class defines the following information.

*   All behaviors for the component.
    The following list includes some of the possible behaviors.

    *   Management of user interactions
    *   Management of network requests
*   A public API for developers to programmatically interact with the component

<div class="alert is-helpful">

**TIP**: <br />
The Angular framework provides lifecycle hook methods to access [different phases of the rendering process][AioGuideComponentLifecycleOverview] for each component.
<!-- The Angular framework provides [lifecycle hook methods][AioGuideComponentUseLifecycleHooks] to access [different phases of the rendering process][AioGuideComponentLifecycleOverview] for each component. -->
To learn more about the different phases of the rendering process, see [Understand the lifecycle of a component][AioGuideComponentLifecycleOverview].
<!-- To learn more about the lifecycle hook methods, see [Use an Angular lifecycle hook method][AioGuideComponentUseLifecycleHooks]. -->

</div>

<div class="alert is-helpful">

**TIP**: <br />
To simplify interactions with a part of the browser screen, the Angular framework may specify a [view][AioGuideGlossaryView].

</div>

Each [component][AioGuideGlossaryComponent] class must have the following parts.

| Part                   | Details |
|:---                    |:---     |
| `@component` decorator | Informs the Angular framework that Angular-specific information is included in the TypeScript class. |
| metadata object        | Includes the `selector` and other properties for the component class.                                |

## `@component` decorator

In the following code example, pseudo-code replaces the properties of the metadata in a component class.

<code-example format="typescript" header="A component without metadata" language="typescript">

&commat;Component({
  // metadata properties and values
})
export class ComponentName { }

</code-example>

Each component in your application has separate metadata and allows you to use a different combination of inline and file references for each component.

The metadata for each component must include the `selector` property.

The following table lists the properties of the metadata object.

| Property                               | Details |
|:---                                    |:---     |
| [`selector`](#selector-property)       | **REQUIRED**. The name of the CSS selector the Angular framework replaces in the HTML [template][AioGuideGlossaryTemplate] with an instance of the component. |
| [`template`](#template-property)       | The inline HTML template of the component. If you specify the `templateUrl` property, you must not specify the `template` property.                           |
| [`templateUrl`](#templateurl-property) | The relative path to the HTML template file of the component. If you specify the `template` property, you must not specify the `templateUrl` property.        |
| [`styles`](#styles-property)           | The inline CSS styles for the template of the component.                                                                                                      |
| [`styleUrls`](#styleurls-property)     | The relative path to each CSS style file for the template of the component.                                                                                   |
| [`providers`](#providers-property)     | An array of [providers][AioGuideGlossaryProvider] for services that the component requires.                                                                   |

## `selector` property

Every component requires a CSS selector.
The `selector` property takes a string that contains the CSS selector.
The Angular framework uses the value of `selector` property to completes the following actions.

1.  Search the HTML template for the element tag that matches the value.
1.  Replace the element tag with an instance of the component, the HTML template, and the rendered DOM structure.

In the following code example, a component with metadata includes the `selector` property.

<code-example format="typescript" header="A component with metadata for CSS selector" language="typescript">

&commat;Component({
  selector: 'css-selector-name'
})
export class ComponentName { }

</code-example>

## Metadata for HTML template

The Angular framework uses an HTML template to render the component in your application.
The use of separate files may help separate the concerns of presentation from behavior in your project.
Specify the `template` or `templateUrl` property to add an HTML template to your component.
To learn more about Angular template syntax, see [Template syntax][AioGuideTemplateSyntax].

<div class="alert is-important">

**IMPORTANT**: <br />
Only specify a value for the `template` property or the `templateUrl` property, not both.

</div>

### `template` property

The inline HTML template of the component.
The `template` property takes a string that contains an HTML template.

In the following code example, the metadata in a component includes the `selector` and `template` properties.

<code-example format="typescript" header="A component with metadata for inline HTML template" language="typescript">

&commat;Component({
  selector: 'css-selector-name',
  template: &grave; &lt;!-- inline html --&gt; &grave;
})
export class ComponentName { }

</code-example>

### `templateUrl` property

The relative path to the HTML template file of the component.
The `templateUrl` property takes a string that specifies an HTML template file.
The path for the `templateUrl` property is relative to the directory in which the component resides.

In the following code example, the metadata in a component includes the `selector` and `templateUrl` properties.

<code-example format="typescript" header="A component with metadata for HTML template file" language="typescript">

&commat;Component({
  selector: 'css-selector-name',
  templateUrl: 'relative/path/to/template/file-name.html'
})
export class ComponentName { }

</code-example>

## Metadata for CSS styles

The Angular framework uses style definitions to style the HTML template in your application.
The use of separate files may help separate the concerns of presentation from behavior in your project.
By default, the style definitions of a component only affect elements defined in the associated template of that component.

Specify the `styles`, `styleUrls`, or both properties to add style definitions to your component.
To learn more about the Angular approach to style definitions, see [Use of component style][AioGuideComponentUseStyle].

<div class="alert is-important">

**IMPORTANT**: <br />
The style definitions specified in the `styles` and `styleUrls` properties only apply to the DOM for that component.

</div>

### `styles` property

The inline CSS styles for the template of the component.
The `styles` property takes an array of strings that contains CSS rule declarations.

In the following code example, the metadata in a component includes the `selector`, `template`, and `styles` properties.

<code-example format="typescript" header="A component with metadata for inline HTML template and inline style definitions" language="typescript">

&commat;Component({
  selector: 'css-selector-name',
  template: &grave; &lt;!-- inline html --&gt; &grave;,
  styles: [&grave; /&ast; inline css style definitions &ast;/ &grave;]
})
export class ComponentName { }

</code-example>

### `styleUrls` property

The relative path to each CSS style file for the template of the component.
The `styleUrls` property takes an array of strings that specify one or more style files.
Supported style file extensions include `.css`, `.less`, and `.scss`.
The path for the `styleUrls` property is relative to the directory in which the component resides.

In the following code example, the metadata in a component includes the `selector`, `template`, and `styleUrls` properties.

<code-example format="typescript" header="A component with metadata for HTML template file and SASS style file" language="typescript">

&commat;Component({
  selector: 'css-selector-name',
  templateUrl: 'relative/path/to/template/file-name.html',
  styleUrls: ['relative/path/to/style/definition/file-name.scss']
})
export class ComponentName { }

</code-example>

## `providers` property

An array of [providers][AioGuideGlossaryProvider] for services the component requires.

The Angular framework uses the array to provide an instance of the `ServiceProviderName` provider for the constructor of the component to display the content.

In the following code example, the metadata in a component includes the `selector`, `templateUrl`, and `providers` properties.

<code-example format="typescript" header="A component with metadata for HTML template file and service provider" language="typescript">

&commat;Component({
  selector: 'css-selector-name',
  templateUrl: 'relative/path/to/template/file-name.html',
  providers: [ ServiceProviderName ]
})
export class ComponentName { }

</code-example>

## What's next

The `@component` is a specific type of attribute [directive][AioGuideGlossaryDirective].
To learn more, see [Attribute directives][AioGuideAttributeDirectives].

## Related content

*   [Create an Angular component][AioGuideComponentCreateCli]
*   [Manually create an Angular component][AioGuideComponentCreateManual]
*   [Use an Angular component][AioGuideComponentUseOverview]

<!-- links -->

[AioGuideComponentCreateManual]: guide/component/component-create-manual "Manually create an Angular component | Angular"

[AioGuideComponentCreateCli]: guide/component/component-create-cli "Create an Angular component | Angular"

[AioGuideAttributeDirectives]: guide/attribute-directives "Attribute directives | Angular"

[AioGuideComponentLifecycleOverview]: guide/component/component-lifecycle-overview "Understand the lifecycle of a component | Angular"

[AioGuideComponentUseOverview]: guide/component/component-use-overview "Use an Angular component | Angular"

<!-- [AioGuideComponentUseLifecycleHooks]: guide/component/component-use-lifecycle-hooks "Use an Angular lifecycle hook method | Angular" -->

[AioGuideComponentUseStyle]: guide/component/component-style "Use of component style | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"
[AioGuideGlossaryDirective]: guide/glossary#directive "directive - Glossary | Angular"
[AioGuideGlossaryProvider]: guide/glossary#provider "provider - Glossary | Angular"
[AioGuideGlossaryTemplate]: guide/glossary#template "template - Glossary | Angular"
[AioGuideGlossaryView]: guide/glossary#view "view - Glossary | Angular"

[AioGuideTemplateSyntax]: guide/template-syntax "Template syntax | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-08-23
