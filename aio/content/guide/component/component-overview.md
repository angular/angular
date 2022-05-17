# Angular component overview

A [component][AioGuideGlossaryComponent] is the main building block for an Angular application.
Every Angular application has at least one component, the *root component*, that connects a component hierarchy with the document object model \(DOM\) of the page.

It is the class that controls the portion of a browser screen identified as a [view][AioGuideGlossaryView].
Each component defines a class that contains application data and logic.
Each component is associated with an HTML *template* that defines and controls the portion of a browser screen identified as a [view][AioGuideGlossaryView].

The `@Component()` decorator identifies the class immediately below it as a component, and provides the template and related component-specific metadata.

<div class="alert is-helpful">

Decorators are functions that modify JavaScript classes. Angular defines a number of decorators that attach specific kinds of metadata to classes, so that the system knows what those classes mean and how they should work.

To learn more about decorators on the web, see [Exploring EcmaScript Decorators](https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0)

[MediumGoogleDevelopersExploring-es7-decorators-76ecb65fb841#.x5c2ndtx0]: https://medium.com/google-developers/exploring-es7-decorators-76ecb65fb841#.x5c2ndtx0 "Exploring EcmaScript Decorators | medium.com"

</div>

When a user interacts with your application, Angular uses APIs to create, update, and remove [components][AioGuideGlossaryComponent].

## Learn about Angular components

<div class="card-container">
    <a href="guide/component/component-structure" class="docs-card" title="Understand the structure a component">
        <section>The structural overview of a component</section>
        <p>Learn more about the structure of an Angular component.</p>
        <p class="card-footer">Understand the structure an Angular component</p>
    </a>
    <a href="guide/component/component-lifecycle" class="docs-card" title="Understand the lifecycle of a component">
        <section>The structural overview of a component</section>
        <p>Learn more about the lifecycle of an Angular component.</p>
        <p class="card-footer">Understand the lifecycle of an Angular component</p>
    </a>
    <a href="guide/component/component-create" class="docs-card" title="Create an Angular component">
        <section>Create a component</section>
        <p>Learn how to create, specify css, define a template, and declare a style for an Angular component.</p>
        <p class="card-footer">Create an Angular component</p>
    </a>
    <a href="guide/component/component-usage" class="docs-card" title="Use an Angular component">
        <section>Use a component</section>
        <p>Learn how to communicate between child and parent Angular components.</p>
        <p class="card-footer">Use an Angular component</p>
    </a>
    <a href="guide/architecture-components" class="docs-card" title="Introduction to components and templates">
        <section>Intro to components and templates</section>
        <p>Learn more about the architectural overview of components.</p>
        <p class="card-footer">Introduction to components and templates</p>
    </a>
    <a href="api/core/Component" class="docs-card" title="Component API reference">
        <section>Component API reference</section>
        <p>Review additional options to use when you create a component.</p>
        <p class="card-footer">Component API reference</p>
    </a>
    <a href="guide/template-syntax" class="docs-card" title="Template syntax">
        <section>Template syntax</section>
        <p>Learn more about templates.</p>
        <p class="card-footer">Template syntax</p>
    </a>
    <a href="guide/component/component-example" class="docs-card" title="Component example">
        <section>Component examples</section>
        <p>Review examples of Angular components.</p>
        <p class="card-footer">Example Angular component applications</p>
    </a>
</div>

<!-- links -->

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"
[AioGuideGlossaryView]: guide/glossary#view "view - Glossary | Angular"

[AioGuideTemplateSyntax]: guide/template-syntax "Template syntax | Angular"

[AioTutorial]: tutorial "Tour of Heroes app and tutorial | Angular"

<!-- external links -->

[TypescriptlangDocsHandbook2ClassesHtmlParameterProperties]: https://www.typescriptlang.org/docs/handbook/2/classes.html#parameter-properties "Parameter Properties - Classes | TypeScript"

<!-- end links -->

@reviewed 2022-04-13
