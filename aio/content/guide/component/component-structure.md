# Understand the structure an Angular component

The logic of a [component][AioGuideGlossaryComponent] class uses methods and properties in an API to define and interact with the [view][AioGuideGlossaryView].

Each [component][AioGuideGlossaryComponent] consists of the following parts.

| Parts               | Location                             | Details |
|:---                 |:---                                  |:---     |
| Template HTML       | An HTML file or inline HTML template | Declares what is rendered on a webpage. <br /> To learn more, see [Template syntax][AioGuideTemplateSyntax]. |
| Component class     | A Typescript file                    | Defines behavior.                                                                                            |
| Inline CSS selector | In the template HTML                 | Defines how the [component][AioGuideGlossaryComponent] is used in a [template][AioGuideGlossaryTemplate].    |
| Inline CSS          | In the template HTML                 | **Optional**. <br /> The CSS styles directly applied to the template.                                        |

Angular creates, updates, and destroys components as the user moves through the application.
This process is the lifecycle of an Angular component.

<div class="alert is-helpful">

**OPTIONAL**: <br />
You are able to interact with the lifecycle of a component at each moment [using the optional lifecycle hook methods][AioGuideComponentLifecycleUseLifecycleHookMethod].
For example, the `ngOnInit()` method.

</div>

## Component class

A [component][AioGuideGlossaryComponent] is a specific type of [directive][AioGuideGlossaryDirective].
Since a component is distinctive and central to Angular, the `@Component()` decorator defines a component.
The `@Component()` decorator extends the `@Directive()` decorator with features that are focused on a template.

<code-example format="typescript" header="Class with no special Angular notation or syntax" language="typescript">

export class &lcub;NameOfComponent&rcub;Component implements OnInit {
  /* &hellip; */
}

</code-example>

Use the `@Component()` decorator to identify a class as a [component][AioGuideGlossaryComponent] class.

<code-example format="typescript" header="Class with the &commat;Component() decorator" language="typescript">

&commat;Component({
  &hellip;
})
export class &lcub;NameOfComponent&rcub;Component implements OnInit {
  /* &hellip; */
}

</code-example>

Specify the associated `@Component()` configuration properties \(component metadata\) in the `@Component()` decorator.

<code-example format="typescript" header="Component class with metadata" language="typescript">

&commat;Component({
  selector: &hellip;
  templateUrl: &hellip;
  providers: &hellip;
})
export class &lcub;NameOfComponent&rcub;Component implements OnInit {
  /* &hellip; */
}

</code-example>

## Component metadata

<div class="lightbox">

<img alt="Metadata" class="left" src="generated/images/guide/architecture/metadata.png" />

</div>

The component metadata associates the HTML [template][AioGuideGlossaryTemplate] with the `@Component()`.

The component metadata includes the following information for your [component][AioGuideGlossaryComponent].

*   Contains or points to the file that contains the HTML [template][AioGuideGlossaryTemplate]
*   Configures how the [component][AioGuideGlossaryComponent] is referenced in HTML
*   Configures the service requirements for the [component][AioGuideGlossaryComponent]

Angular uses the component metadata to locate the major building blocks for the following tasks.

| Actions | Targets |
|:---     |:---     |
| Create  | The [component][AioGuideGlossaryComponent] and the associated [view][AioGuideGlossaryView]. |
| Present | The [component][AioGuideGlossaryComponent] and the associated [view][AioGuideGlossaryView]. |

The following code example shows basic component metadata for the `&lcub;NameOfComponent&rcub;Component` class.

<code-example format="typescript" header="&lcub;NameOfComponent&rcub;.component.ts" language="typescript">

&commat;Component({
  selector: '{name-of-css-selector}',
  templateUrl: '{relative/path/to/template/file}.html',
  providers: [ {NameOfServiceProvider} ]
})
export class &lcub;NameOfComponent&rcub;Component implements OnInit {
  /* &hellip; */
}

</code-example>

The following table lists `@Component()` configuration properties \(component metadata\).

| Metadata                            | Details |
|:---                                 |:---     |
| [`providers`](#providers)           | An array of [providers][AioGuideGlossaryProvider] for services that the component requires.  |
| [`selector`](#selector)             | An HTML tag element.                                                                         |
| [`styles`](#style-metadata)         | The inline CSS styles for the template of the component.                                     |
| [`styleUrls`](#style-metadata)      | The module-relative address of each CSS style file for the template of the component.        |
| [`template`](#template-metadata)    | The inline HTML template of the component.                                                   |
| [`templateUrl`](#template-metadata) | The module-relative address of the HTML template file of the component.                      |

### `providers`

An array of [providers][AioGuideGlossaryProvider] for services that the component requires.

Angular uses the array to provide an instance of the `{NameOfServiceProvider}` provider to the constructor of the component in order to display the content.

### `selector`

Every component requires a CSS selector.
Angular searches the template HTML for the element tag that corresponds to a CSS selector and replaces it with the component.
Angular uses the tag element to find the instances of it in template HTML and insert an instance of the component view.
This property takes a string that contains the CSS selector.

Angular reads the `{name-of-css-selector}` selector and searches the HTML templates for the `<{name-of-css-selector}>` element tag to instantiate the component.

### Style metadata

| Metadata      | Details |
|:---           |:---     |
| `styles`      | The inline CSS styles for the template of the component. This property takes an array of strings that contains CSS rule declarations. <br /> To learn more, see [Styles in component metadata][AioGuideComponentStyleStylesInComponentMetadata]. <div class="alert is-critical"> The styles specified in this property only apply to the specified template. </div>                                                            |
| `styleUrls`   | The module-relative address of each CSS style file for the template of the component. This property takes an array of strings that specify style \(`.css`, `.less`, or `.scss`\) files. <br /> To learn more, see [Style files in component metadata][AioGuideComponentStyleStyleFilesInComponentMetadata]. <div class="alert is-critical"> The styles specified in this property only apply to the specified template. </div> |

### Template metadata

A template is a block of HTML that tells Angular how to render the component in your application.

| Metadata      | Details |
|:---           |:---     |
| `template`    | The inline HTML template of the component. This property takes a string that contains the HTML template. <br /> To learn more, see [Template syntax][AioGuideTemplateSyntax]. <div class="alert is-important"> **IMPORTANT**: <br /> If you specify a value for this property, do not specify the `templateUrl` property. </div> |
| `templateUrl` | The module-relative address of the HTML template file of the component. This property takes a string that specifies the HTML template file. <div class="alert is-important"> **IMPORTANT**: <br /> If you specify a value for this property, do not specify the `template` property. </div>                                      |

<!-- links -->

[AioGuideComponentLifecycleUseLifecycleHookMethod]: guide/component/component-lifecycle#use-lifecycle-hook-method

<!-- "Use lifecycle hook method - Component Lifecycle | Angular" -->

[AioGuideComponentStyleStylesInComponentMetadata]: guide/component/component-style#styles-in-component-metadata

<!-- "Styles in component metadata - Component style | Angular" -->

[AioGuideComponentStyleStyleFilesInComponentMetadata]: guide/component/component-style#style-files-in-component-metadata

<!-- "Style files in component metadata - Component style | Angular" -->

[AioGuideGlossaryComponent]: guide/glossary#component

<!-- "component - Glossary | Angular" -->

[AioGuideGlossaryDirective]: guide/glossary#directive

<!-- "directive - Glossary | Angular" -->

[AioGuideGlossaryProvider]: guide/glossary#provider

<!-- "provider - Glossary | Angular" -->

[AioGuideGlossaryTemplate]: guide/glossary#template

<!-- "template - Glossary | Angular" -->

[AioGuideGlossaryView]: guide/glossary#view

<!-- "view - Glossary | Angular" -->

[AioGuideTemplateSyntax]: guide/template-syntax

<!-- "Template syntax | Angular" -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
