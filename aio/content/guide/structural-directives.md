# Structural directives

This guide is about structural directives and provides conceptual information on how such directives work, how Angular interprets their shorthand syntax, and how to add template guard properties to catch template type errors.

Structural directives are directives which change the DOM layout by adding and removing DOM elements.

Angular provides a set of built-in structural directives (such as `NgIf`, `NgForOf`, `NgSwitch` and others) which are commonly used in all Angular projects. For more information see [Built-in directives](guide/built-in-directives).

<div class="alert is-helpful">

For the example application that this page describes, see the <live-example name="structural-directives"></live-example>.

</div>

<a id="shorthand"></a>
<a id="asterisk"></a>

## Structural directive shorthand

When structural directives are applied they generally are prefixed by an asterisk, `*`,  such as `*ngIf`. This convention is shorthand that Angular interprets and converts into a longer form.
Angular transforms the asterisk in front of a structural directive into an `<ng-template>` that surrounds the host element and its descendants.

For example, let's take the following code which uses an `*ngIf` to display the hero's name if `hero` exists:

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (asterisk)" region="asterisk"></code-example>

Angular creates an `<ng-template>` element and applies the `*ngIf` directive onto it where it becomes a property binding in square brackets, `[ngIf]`. The rest of the `<div>`, including its class attribute, is then moved inside the `<ng-template>`:

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (ngif-template)" region="ngif-template"></code-example>

Note that Angular does not actually create a real `<ng-template>` element, but instead only renders the `<div>` element.

```html
<div _ngcontent-c0>Mr. Nice</div>

```

The following example compares the shorthand use of the asterisk in `*ngFor` with the longhand `<ng-template>` form:

<code-example path="structural-directives/src/app/app.component.html" header="src/app/app.component.html (inside-ngfor)" region="inside-ngfor"></code-example>

Here, everything related to the `ngFor` structural directive is moved to the `<ng-template>`.
All other bindings and attributes on the element apply to the `<div>` element within the `<ng-template>`.
Other modifiers on the host element, in addition to the `ngFor` string, remain in place as the element moves inside the `<ng-template>`.
In this example, the `[class.odd]="odd"` stays on the `<div>`.

The `let` keyword declares a template input variable that you can reference within the template.
The input variables in this example are `hero`, `i`, and `odd`.
The parser translates `let hero`, `let i`, and `let odd` into variables named `let-hero`, `let-i`, and `let-odd`.
The `let-i` and `let-odd` variables become `let i=index` and `let odd=odd`.
Angular sets `i` and `odd` to the current value of the context's `index` and `odd` properties.

The parser applies PascalCase to all directives and prefixes them with the directive's attribute name, such as ngFor.
For example, the `ngFor` input properties, `of` and `trackBy`, map to `ngForOf` and `ngForTrackBy`.

As the `NgFor` directive loops through the list, it sets and resets properties of its own context object.
These properties can include, but aren't limited to, `index`, `odd`, and a special property
named `$implicit`.

Angular sets `let-hero` to the value of the context's `$implicit` property, which `NgFor` has initialized with the hero for the current iteration.

For more information, see the [NgFor API](api/common/NgFor "API: NgFor") and [NgForOf API](api/common/NgForOf) documentation.

<div class="alert is-helpful">

  Note that Angular's `<ng-template>` element defines a template that doesn't render anything by default, if you just wrap elements in an `<ng-template>` without applying a structural directive those elements will not be rendered.

  For more information, see the [ng-template API](api/core/ng-template) documentation.

</div>


<a id="one-per-element"></a>
## One structural directive per element

It's a quite common use-case to repeat a block of HTML but only when a particular condition is true. An intuitive way to do that is to put both an `*ngFor` and an `*ngIf` on the same element. However, since both `*ngFor` and `*ngIf` are structural directives, this would be treated as an error by the compiler. You may apply only one _structural_ directive to an element.

The reason is simplicity. Structural directives can do complex things with the host element and its descendants.

When two directives lay claim to the same host element, which one should take precedence?

Which should go first, the `NgIf` or the `NgFor`? Can the `NgIf` cancel the effect of the `NgFor`?
If so (and it seems like it should be so), how should Angular generalize the ability to cancel for other structural directives?

There are no easy answers to these questions. Prohibiting multiple structural directives makes them moot.
There's an easy solution for this use case: put the `*ngIf` on a container element that wraps the `*ngFor` element. One or both elements can be an `<ng-container>` so that no extra DOM elements are generated.


<a id="unless"></a>
## Creating a structural directive

This section guides you through creating an `UnlessDirective` and how to set `condition` values.
The `UnlessDirective` does the opposite of `NgIf`, and `condition` values can be set to `true` or `false`.
`NgIf` displays the template content when the condition is `true`.
`UnlessDirective` displays the content when the condition is `false`.

Following is the `UnlessDirective` selector, `appUnless`, applied to the paragraph element.
When `condition` is `false`, the browser displays the sentence.

<code-example header="src/app/app.component.html (appUnless-1)" path="structural-directives/src/app/app.component.html" region="appUnless-1"></code-example>

1.  Using the Angular CLI, run the following command, where `unless` is the name of the directive:

    <code-example format="shell" language="shell">

    ng generate directive unless

    </code-example>

    Angular creates the directive class and specifies the CSS selector, `appUnless`, that identifies the directive in a template.

1.  Import `Input`, `TemplateRef`, and `ViewContainerRef`.

    <code-example header="src/app/unless.directive.ts (skeleton)" path="structural-directives/src/app/unless.directive.ts" region="skeleton"></code-example>

1.  Inject `TemplateRef` and `ViewContainerRef` in the directive constructor as private variables.

    <code-example header="src/app/unless.directive.ts (ctor)" path="structural-directives/src/app/unless.directive.ts" region="ctor"></code-example>

    The `UnlessDirective` creates an [embedded view](api/core/EmbeddedViewRef "API: EmbeddedViewRef") from the Angular-generated `<ng-template>` and inserts that view in a [view container](api/core/ViewContainerRef "API: ViewContainerRef") adjacent to the directive's original `<p>` host element.

    [`TemplateRef`](api/core/TemplateRef "API: TemplateRef") helps you get to the `<ng-template>` contents and [`ViewContainerRef`](api/core/ViewContainerRef "API: ViewContainerRef") accesses the view container.

1.  Add an `appUnless` `@Input()` property with a setter.

    <code-example header="src/app/unless.directive.ts (set)" path="structural-directives/src/app/unless.directive.ts" region="set"></code-example>

    Angular sets the `appUnless` property whenever the value of the condition changes.

    *   If the condition is falsy and Angular hasn't created the view previously, the setter causes the view container to create the embedded view from the template
    *   If the condition is truthy and the view is currently displayed, the setter clears the container, which disposes of the view

The complete directive is as follows:

<code-example header="src/app/unless.directive.ts (excerpt)" path="structural-directives/src/app/unless.directive.ts" region="no-docs"></code-example>

### Testing the directive

In this section, you'll update your application to test the `UnlessDirective`.

1.  Add a `condition` set to `false` in the `AppComponent`.

    <code-example header="src/app/app.component.ts (excerpt)" path="structural-directives/src/app/app.component.ts" region="condition"></code-example>

1.  Update the template to use the directive.
    Here, `*appUnless` is on two `<p>` tags with opposite `condition` values, one `true` and one `false`.

    <code-example header="src/app/app.component.html (appUnless)" path="structural-directives/src/app/app.component.html" region="appUnless"></code-example>

    The asterisk is shorthand that marks `appUnless` as a structural directive.
    When the `condition` is falsy, the top \(A\) paragraph appears and the bottom \(B\) paragraph disappears.
    When the `condition` is truthy, the top \(A\) paragraph disappears and the bottom (B) paragraph appears.

1.  To change and display the value of `condition` in the browser, add markup that displays the status and a button.

    <code-example header="src/app/app.component.html" path="structural-directives/src/app/app.component.html" region="toggle-info"></code-example>

To verify that the directive works, click the button to change the value of `condition`.

<div class="lightbox">

<img alt="UnlessDirective in action" src="generated/images/guide/structural-directives/unless-anim.gif">

</div>

## Structural directive syntax reference

When you write your own structural directives, use the following syntax:

<code-example format="typescript" hideCopy language="typescript">

&ast;:prefix="( :let &verbar; :expression ) (';' &verbar; ',')? ( :let &verbar; :as &verbar; :keyExp )&ast;"

</code-example>

The following tables describe each portion of the structural directive grammar:

<code-tabs>
    <code-pane format="typescript" header="as" hideCopy language="typescript"> as = :export "as" :local ";"? </code-pane>
    <code-pane format="typescript" header="keyExp" hideCopy language="typescript"> keyExp = :key ":"? :expression ("as" :local)? ";"? </code-pane>
    <code-pane format="typescript" header="let" hideCopy language="typescript"> let = "let" :local "=" :export ";"? </code-pane>
</code-tabs>

| Keyword      | Details |
|:---          |:---     |
| `prefix`     | HTML attribute key                                 |
| `key`        | HTML attribute key                                 |
| `local`      | Local variable name used in the template           |
| `export`     | Value exported by the directive under a given name |
| `expression` | Standard Angular expression                        |

### How Angular translates shorthand

Angular translates structural directive shorthand into the normal binding syntax as follows:

| Shorthand                       | Translation |
|:---                             |:---         |
| `prefix` and naked `expression` | <code-example format="typescript" hideCopy language="typescript"> [prefix]="expression" </code-example>                                                                                                                       |
| `keyExp`                        | <code-example format="typescript" hideCopy language="typescript"> [prefixKey] "expression" (let-prefixKey="export") </code-example> <div class="alert is-helpful"> **NOTE**: <br /> The `prefix` is added to the `key` </div> |
| `let`                           | <code-example format="typescript" hideCopy language="typescript"> let-local="export" </code-example>                                                                                                                          |

### Shorthand examples

The following table provides shorthand examples:

| Shorthand                                                                                                                                                                                                     | How Angular interprets the syntax |
|:---                                                                                                                                                                                                           |:---                               |
| <code-example format="typescript" hideCopy language="typescript"> &ast;ngFor="let item of [1,2,3]" </code-example>                                                                                            | <code-example format="html" hideCopy language="html"> &lt;ng-template ngFor &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let-item &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ngForOf]="[1,2,3]"&gt; </code-example>                                                                                                                                                                                                                                                                                                                  |
| <code-example format="typescript" hideCopy language="typescript"> &ast;ngFor="let item of [1,2,3] as items; &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; trackBy: myTrack; index as i" </code-example> | <code-example format="html" hideCopy language="html"> &lt;ng-template ngFor &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let-item &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ngForOf]="[1,2,3]" &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let-items="ngForOf" &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; [ngForTrackBy]="myTrack" &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let-i="index"&gt; </code-example> |
| <code-example format="typescript" hideCopy language="typescript"> &ast;ngIf="exp" </code-example>                                                                                                             | <code-example format="html" hideCopy language="html"> &lt;ng-template [ngIf]="exp"&gt; </code-example>                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| <code-example format="typescript" hideCopy language="typescript"> &ast;ngIf="exp as value" </code-example>                                                                                                    | <code-example format="html" hideCopy language="html"> &lt;ng-template [ngIf]="exp" &NewLine;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; let-value="ngIf"&gt; </code-example>                                                                                                                                                                                                                                                                                                                                                                                                         |

<a id="directive-type-checks"></a>

<!--todo: To do follow up PR: move this section to a more general location because it also applies to attribute directives. -->

## Improving template type checking for custom directives

You can improve template type checking for custom directives by adding template guard properties to your directive definition.
These properties help the Angular template type checker find mistakes in the template at compile time, which can avoid runtime errors.
These properties are as follows:

*   A property `ngTemplateGuard_(someInputProperty)` lets you specify a more accurate type for an input expression within the template
*   The `ngTemplateContextGuard` static property declares the type of the template context

This section provides examples of both kinds of type-guard property.
For more information, see [Template type checking](guide/template-typecheck "Template type-checking guide").

<a id="narrowing-input-types"></a>

### Making in-template type requirements more specific with template guards

A structural directive in a template controls whether that template is rendered at run time, based on its input expression.
To help the compiler catch template type errors, you should specify as closely as possible the required type of a directive's input expression when it occurs inside the template.

A type guard function narrows the expected type of an input expression to a subset of types that might be passed to the directive within the template at run time.
You can provide such a function to help the type-checker infer the proper type for the expression at compile time.

For example, the `NgIf` implementation uses type-narrowing to ensure that the template is only instantiated if the input expression to `*ngIf` is truthy.
To provide the specific type requirement, the `NgIf` directive defines a [static property `ngTemplateGuard_ngIf: 'binding'`](api/common/NgIf#static-properties).
The `binding` value is a special case for a common kind of type-narrowing where the input expression is evaluated in order to satisfy the type requirement.

To provide a more specific type for an input expression to a directive within the template, add an `ngTemplateGuard_xx` property to the directive, where the suffix to the static property name, `xx`, is the `@Input()` field name.
The value of the property can be either a general type-narrowing function based on its return type, or the string `"binding"`, as in the case of `NgIf`.

For example, consider the following structural directive that takes the result of a template expression as an input:

<code-tabs linenums="true">
  <code-pane
    header="src/app/if-loaded.directive.ts"
    path="structural-directives/src/app/if-loaded.directive.ts">
  </code-pane>
  <code-pane
    header="src/app/loading-state.ts"
    path="structural-directives/src/app/loading-state.ts">
  </code-pane>
  <code-pane
    header="src/app/hero.component.ts"
    path="structural-directives/src/app/hero.component.ts">
  </code-pane>
</code-tabs>

In this example, the `LoadingState<T>` type permits either of two states, `Loaded<T>` or `Loading`.
The expression used as the directive's `state` input (aliased as `appIfLoaded`) is of the umbrella type `LoadingState`, as it's unknown what the loading state is at that point.

The `IfLoadedDirective` definition declares the static field `ngTemplateGuard_appIfLoaded`, which expresses the narrowing behavior.
Within the `AppComponent` template, the `*appIfLoaded` structural directive should render this template only when `state` is actually `Loaded<Hero>`.
The type guard lets the type checker infer that the acceptable type of `state` within the template is a `Loaded<T>`, and further infer that `T` must be an instance of `Hero`.

<a id="narrowing-context-type"></a>

### Typing the directive's context

If your structural directive provides a context to the instantiated template, you can properly type it inside the template by providing a static `ngTemplateContextGuard` function.
The following snippet shows an example of such a function.

<code-tabs linenums="true">
  <code-pane
    header="src/app/trigonometry.directive.ts"
    path="structural-directives/src/app/trigonometry.directive.ts">
  </code-pane>
  <code-pane
    header="src/app/app.component.html (appTrigonometry)"
    path="structural-directives/src/app/app.component.html"
    region="appTrigonometry">
  </code-pane>
</code-tabs>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
