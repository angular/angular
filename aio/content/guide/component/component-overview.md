# Understand Angular component

A [component][AioGuideGlossaryComponent] is the main building block for an Angular application.

A component is a TypeScript class defined using the `@Component` decorator.

<div class="alert is-helpful">

**NOTE**: <br />
The `@Component` statement is a [decorator][TypescriptlangDocsHandbookDecoratorsHtmlDecorators] that augments your TypeScript class with Angular-specific information.
The Angular-specific information defines how the Angular framework renders the component in the document object model \(DOM\).
To learn more about a decorator, see [Decorators][TypescriptlangDocsHandbookDecoratorsHtmlDecorators].
To learn more about the DOM, see [Document Object Model (DOM)][MdnWebApiDocumentObjectModel].

</div>

Every Angular application has at least one component.
The "root component" is the component that connects the hierarchy of one or more components with the document object model \(DOM\) of the page.

Every component contains the following information.

*   The data and logic metadata for your Angular application
*   The metadata for an associated HTML [template][AioGuideTemplateOverview]

The Angular framework uses a [component][AioGuideGlossaryComponent] and the associated HTML [template][AioGuideTemplateOverview] to complete the following actions.

*   Render the HTML template in the DOM structure
*   Update the rendered DOM structure
*   Remove a component and the associated DOM structure

When a user interacts with your application, the Angular framework updates your component.

<div class="alert is-helpful">

**TIP**: <br />
To simplify interactions with a part of the browser screen, the Angular framework may specify a [view][AioGuideGlossaryView].

</div>

## Learn about an Angular component

<div class="card-container">
    <a href="guide/component/component-structure" class="docs-card" title="Understand the structure a component">
        <section>The structural overview of a component</section>
        <p>Learn more about the structure of an Angular component.</p>
        <p class="card-footer">Understand the structure an Angular component</p>
    </a>
    <a href="guide/component/component-lifecycle-overview" class="docs-card" title="Understand the lifecycle of a component">
        <section>The structural overview of a component</section>
        <p>Learn more about the lifecycle of an Angular component.</p>
        <p class="card-footer">Understand the lifecycle of an Angular component</p>
    </a>
    <a href="guide/component/component-create-cli" class="docs-card" title="Create an Angular component">
        <section>Create a component</section>
        <p>Learn how to create, specify css, define a template, and declare a style for an Angular component.</p>
        <p class="card-footer">Create an Angular component</p>
    </a>
    <a href="guide/component/component-use-overview" class="docs-card" title="Use an Angular component">
        <section>Use a component</section>
        <p>Learn how to communicate from component or element to another component.</p>
        <p class="card-footer">Use an Angular component</p>
    </a>
    <a href="guide/architecture-components" class="docs-card" title="Introduction to components and templates">
        <section>Intro to components and templates</section>
        <p>Learn more about the architectural overview of components.</p>
        <p class="card-footer">Introduction to components and templates</p>
    </a>
    <a href="api/core/Component" class="docs-card" title="Component API reference">
        <section>Component API reference</section>
        <p>Review more options to use when you create a component.</p>
        <p class="card-footer">Component API reference</p>
    </a>
    <a href="guide/template-overview" class="docs-card" title="Understand templates">
        <section>Understand templates</section>
        <p>Learn more about HTML templates.</p>
        <p class="card-footer">Understand templates</p>
    </a>
    <a href="guide/component/component-example" class="docs-card" title="Component example">
        <section>Component examples</section>
        <p>Review examples of Angular components.</p>
        <p class="card-footer">Example Angular component applications</p>
    </a>
</div>

<!-- links -->

[AioGuideComponentStructure]: guide/component/component-structure "Understand the parts of an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideGlossaryView]: guide/glossary#view "view - Glossary | Angular"

[AioGuideTemplateOverview]: guide/template-overview "Understand templates | Angular"

<!-- external links -->

[MdnWebApiDocumentObjectModel]: https://developer.mozilla.org/docs/Web/API/Document_Object_Model "Document Object Model (DOM) | MDN"

[TypescriptlangDocsHandbookDecoratorsHtmlDecorators]: https://www.typescriptlang.org/docs/handbook/decorators.html#decorators "Decorators - Decorators | TypeScript"

<!-- end links -->

@reviewed 2022-08-23
