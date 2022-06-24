# Style Precedence

When there are multiple bindings to the same class name or style attribute, Angular uses a set of precedence rules to determine which classes or styles to apply to the element.
These rules specify an order for which style and class related bindings have priority.
This styling precedence is as follows, from the most specific with the highest priority to least specific with the lowest priority:

1.  Template bindings are the most specific because they apply to the element directly and exclusively, so they have the highest precedence.

    | Binding type     | Examples |
    |:---              |:---     |
    | Property binding | <code-example format="html" hideCopy language="html"> &lt;div [class.foo]="hasFoo"&gt; </code-example> <code-example format="html" hideCopy language="html" >&lt;div [style.color]="color"&gt; </code-example>          |
    | Map binding      | <code-example format="html" hideCopy language="html"> &lt;div [class]="classExpression"&gt; </code-example> <code-example format="html" hideCopy language="html"> &lt;div [style]="styleExpression"&gt; </code-example> |
    | Static value     | <code-example format="html" hideCopy language="html"> &lt;div class="foo"&gt; </code-example> <code-example format="html" hideCopy language="html"> &lt;div style="color: blue"&gt; </code-example>                     |

1.  Directive host bindings are less specific because you can use directives in multiple locations, so they have a lower precedence than template bindings.

    | Binding type     | Examples |
    |:---              |:---     |
    | Property binding | <code-example format="typescript" hideCopy language="typescript"> host: {'[class.foo]': 'hasFoo'} </code-example> <code-example format="typescript" hideCopy language="typescript"> host: {'[style.color]': 'color'} </code-example> |
    | Map binding      | <code-example format="typescript" hideCopy language="typescript"> host: {'[class]': 'classExpr'} </code-example> <code-example format="typescript" hideCopy language="typescript"> host: {'[style]': 'styleExpr'} </code-example>    |
    | Static value     | <code-example format="typescript" hideCopy language="typescript"> host: {'class': 'foo'} </code-example> <code-example format="typescript" hideCopy language="typescript"> host: {'style': 'color: blue'} </code-example>            |

1.  Component host bindings have the lowest precedence.

    | Binding type     | Examples |
    |:---              |:---     |
    | Property binding | <code-example format="typescript" hideCopy language="typescript"> host: {'[class.foo]': 'hasFoo'} </code-example> <code-example format="typescript" hideCopy language="typescript">host: {'[style.color]': 'color'} </code-example>           |
    | Map binding      | <code-example format="typescript" hideCopy language="typescript"> host: {'[class]': 'classExpression'} </code-example> <code-example format="typescript" hideCopy language="typescript"> host: {'[style]': 'styleExpression'} </code-example> |
    | Static value     | <code-example format="typescript" hideCopy language="typescript"> host: {'class': 'foo'} </code-example> <code-example format="typescript" hideCopy language="typescript"> host: {'style': 'color: blue'} </code-example>                     |

## Precedence and specificity

In the following example, binding to a specific class, as in `[class.special]`, takes precedence over a generic `[class]` binding.
Similarly, binding to a specific style, as in `[style.color]`, takes precedence over a generic `[style]` binding.

<code-example header="src/app/app.component.html" path="attribute-binding/src/app/app.component.html" region="basic-specificity"></code-example>

## Precedence and bindings from different sources

Specificity rules also apply to bindings even when they originate from different sources.
An element can have bindings that originate from its own template, from host bindings on matched directives, and from host bindings on matched components.

<code-example header="src/app/app.component.html" path="attribute-binding/src/app/app.component.html" region="source-specificity"></code-example>

## Precedence of bindings and static attributes

Bindings take precedence over static attributes because they are dynamic.
In the following case, `class` and `[class]` have similar specificity, but the `[class]` binding takes precedence.

<code-example header="src/app/app.component.html" path="attribute-binding/src/app/app.component.html" region="dynamic-priority"></code-example>

<a id="styling-delegation"></a>

## Delegating to styles with lower precedence

Higher precedence styles can defer to lower precedence styles using `undefined` values.
For example, consider the following template:

<code-example header="src/app/app.component.html" path="attribute-binding/src/app/app.component.html" region="style-delegation"></code-example>

Imagine that the `dirWithHostBinding` directive and the `comp-with-host-binding` component both have a `[style.width]` host binding.

<code-example header="src/app/comp-with-host-binding.component.ts and dirWithHostBinding.directive.ts" path="attribute-binding/src/app/comp-with-host-binding.component.ts" region="hostbinding"></code-example>

If `dirWithHostBinding` sets its binding to `undefined`, the `width` property falls back to the value of the `comp-with-host-binding` host binding.

<code-example format="typescript" header="dirWithHostBinding directive" language="typescript">

&commat;HostBinding('style.width')
width = ''; // undefined

</code-example>

<div class="alert is-helpful">

If `dirWithHostBinding` sets its binding to `null`, Angular removes the `width` property entirely.

<code-example format="typescript" header="dirWithHostBinding" language="typescript">

&commat;HostBinding('style.width')
width = null;

</code-example>

</div>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
