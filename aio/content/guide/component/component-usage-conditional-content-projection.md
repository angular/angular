# Conditional content projection

If your component needs to conditionally render content, or render content multiple times, you should configure that component to accept an `ng-template` element that contains the content you want to conditionally render.

Use of an `ng-content` element in these cases is not recommended, because when the consumer of a component supplies the content.
That content supplied by the consumer is always initialized, even if the component does not define an `ng-content` element or if that `ng-content` element is inside of an `ngIf` statement.

With an `ng-template` element, you are able to specify that your component explicitly renders content based on a desired condition, as many times as you want.
Angular does not initialize the content of an `ng-template` element until that element is explicitly rendered.

## Prerequisites

Before you work with multi-slot content projection in an Angular [component][AioGuideGlossaryComponent], verify that you have met the following prerequisites.

1.  [Install the Angular CLI][AioGuideSetupLocalInstallTheAngularCli].
1.  [Create an Angular workspace][AioGuideSetupLocalCreateAWorkspaceAndInitialApplication] with your initial application.
1.  [Create an Angular component][AioGuideComponentCreate].

## Add `ng-template` to template

To create a component that uses conditional content projection, complete the following tasks.

The following steps demonstrate a typical implementation of conditional content projection using `ng-template`.

1.  In the template where you want to project content, use the CSS selector of the component to specify the HTML content.
    Content that uses the `{ValueOfSelect}` attribute is projected into the `ng-content` element with the `select` attribute set to `{ValueOfSelect}`.

    <code-example format="html" header="Create content for ng-content" language="html">

    &lt;{name-of-css-selector}&gt;
      &lt;p&gt;Content projection is cool.&lt;/p&gt;
      &lt;p {ValueOfSelect}&gt;Learn more about content projection.&lt;/p&gt;
    &lt;/{name-of-css-selector}&gt;

    </code-example>

1.  In the template where you want to project content, wrap the HTML content in an `ng-template` element.

    <code-example format="html" header="Create content for ng-template" language="html">

    &lt;ng-template {name-of-css-selector}&gt;
      &lt;p&gt;Content projection is cool.&lt;/p&gt;
    &lt;/ng-template&gt;

    </code-example>

    Angular uses the logic when it encounters the custom `{name-of-css-selector}` attribute.
    The logic instructs Angular to instantiate a template reference.

    | Parts                    | Details |
    |:---                      |:---     |
    | `ng-template`            | An element. Defines a block of content that a component renders based on the specified logic.  |
    | `{name-of-css-selector}` | A custom directive. An API to mark the `ng-template` element for the content of the component. |

## Add `<ng-container>` to template

1.  In the template that accepts an `ng-template` element, use an `<ng-container>` element to render the template.

    <code-example format="html" header="Create ng-container" language="html">

    &lt;ng-container [ngTemplateOutlet]="content.templateRef"&gt;&lt;/ng-container&gt;

    </code-example>

    | Parts             | Details |
    |:---               |:---     |
    | `ngTemplateOutlet`| A directive. Render the specified `ng-template` element.                                                                                                                                                                                                                |
    | `TemplateRef`     | A reference to the template content. Created using either the `@ContentChild` or `@ContentChildren` decorator. The component renders the referenced content using either the `ngTemplateOutlet` directive or with the `createEmbeddedView()` `ViewContainerRef` method. |

    <div class="alert is-helpful">

    **NOTE**: <br />
    Apply the `ngTemplateOutlet` directive to any element.
    The `ng-container` element does not render a DOM element.

    </div>

1.  In the template that accepts an `ng-template` element, wrap the `<ng-container>` element in another element, such as a `div` element.

    <code-example format="html" header="Wrap ng-container" language="html">

    &lt;div&gt;
      &lt;ng-container [ngTemplateOutlet]="content.templateRef"&gt;&lt;/ng-container&gt;
    &lt;/div&gt;

    </code-example>

1.  In the template that accepts an `ng-template` element, apply conditional logic to the parent element of the `<ng-container>` element.

    <code-example format="html" header="Wrap ng-container" language="html">

    &lt;div &ast;ngIf="expanded" [id]="contentId"&gt;
      &lt;ng-container [ngTemplateOutlet]="content.templateRef"&gt;&lt;/ng-container&gt;
    &lt;/div&gt;

    </code-example>

    | Parts       | Details |
    |:---         |:---     |
    | `*ngIF`     |         |
    | `contentId` |         |

1.  Create a direcive with the `{name-of-css-selector}` selector.
    To learn more about how to create an attribute directive, see [Create an attribute directive][AioGuideAttributeDirectivesBuildingAnAttributeDirective].

1.  In the directive with the `{name-of-css-selector}` selector, instantiate the `TemplateRef` reference.

    <code-example format="typescript" header="Inject the TemplateRef instance" language="typescript">

    &commat;Directive({
      selector: '[{name-of-css-selector}]'
    })
    export class {Name-of-Directive}Directive {
      constructor(public templateRef: TemplateRef&lt;unknown&gt;) {}
    }

    </code-example>

    Your application has a component that instantiates a template when specific conditions are met.
    You created a directive that provides a reference to the template.

1.  In the component where you want to project content, use `@ContentChild` to get the template of the projected content.

    <code-example format="typescript" header="Inject the TemplateRef instance" language="typescript">

    &commat;ContentChild({Name-of-Directive}Directive) content!: {Name-of-Directive}Directive;

    </code-example>

    The `@ContentChild` decorator function instructs Angular to instantiate the template in the specified component.

    <div class="alert is-helpful">

    To use multi-slot content projection, replace `@ContentChild` with `@ContentChildren` to access the `QueryList` of the projected elements.

    </div>

<!-- links -->

[AioGuideAttributeDirectivesBuildingAnAttributeDirective]: guide/attribute-directives#building-an-attribute-directive "Building an attribute directive - Attribute directives | Angular"

[AioGuideComponentCreate]: guide/component/component-create "Create an Angular component | Angular"

[AioGuideGlossaryComponent]: guide/glossary#component "component - Glossary | Angular"

[AioGuideSetupLocalCreateAWorkspaceAndInitialApplication]: guide/setup-local#create-a-workspace-and-initial-application "Create a workspace and initial application - Setting up the local environment and workspace | Angular"
[AioGuideSetupLocalInstallTheAngularCli]: guide/setup-local#install-the-angular-cli "Install the Angular CLI - Setting up the local environment and workspace | Angular"

<!-- external links -->

<!-- end links -->

@reviewed 2022-04-13
