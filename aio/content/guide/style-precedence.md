# Style Precedence

When there are multiple bindings to the same class name or style attribute, Angular uses a set of precedence rules to determine which classes or styles to apply to the element.
These rules specify an order for which style and class related bindings have priority.
This styling precedence is as follows, from the most specific with the highest priority to least specific with the lowest priority:

1. Template bindings are the most specific because they apply to the element directly and exclusively, so they have the highest precedence.
  <table width="100%">
    <col width="40%"></col>
    <col width="60%"></col>
    <thead>
      <tr>
        <th>Binding type</th>
        <th>Example</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Property binding</td>
        <td><code>&lt;div [class.foo]="hasFoo"&gt;</code><br><code>&lt;div [style.color]="color"&gt;</code></td>
      </tr>
      <tr>
        <td>Map binding</td>
        <td><code>&lt;div [class]="classExpression"&gt;</code><br><code>&lt;div [style]="styleExpression"&gt;</code></td>
      </tr>
      <tr>
        <td>Static value</td>
        <td><code>&lt;div class="foo"&gt;</code><br><code>&lt;div style="color: blue"&gt;</code></td>
      </tr>
    </tbody>
  </table>
1. Directive host bindings are less specific because you can use directives in multiple locations, so they have a lower precedence than template bindings.
  <table width="100%">
    <col width="40%"></col>
    <col width="60%"></col>
    <thead>
      <tr>
        <th>Binding type</th>
        <th>Example</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Property binding</td>
        <td><code>host: {'[class.foo]': 'hasFoo'}</code><br><code>host: {'[style.color]': 'color'}</code></td>
      </tr>
      <tr>
        <td>Map binding</td>
        <td><code>host: {'[class]': 'classExpr'}</code><br><code>host: {'[style]': 'styleExpr'}</code></td>
      </tr>
      <tr>
        <td>Static value</td>
        <td><code>host: {'class': 'foo'}</code><br><code>host: {'style': 'color: blue'}</code></td>
      </tr>
    </tbody>
  </table>
1. Component host bindings have the lowest precedence.
    <table width="100%">
    <col width="40%"></col>
    <col width="60%"></col>
    <thead>
      <tr>
        <th>Binding type</th>
        <th>Example</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>Property binding</td>
        <td><code>host: {'[class.foo]': 'hasFoo'}</code><br><code>host: {'[style.color]': 'color'}</code></td>
      </tr>
      <tr>
        <td>Map binding</td>
        <td><code>host: {'[class]': 'classExpression'}</code><br><code>host: {'[style]': 'styleExpression'}</code></td>
      </tr>
      <tr>
        <td>Static value</td>
        <td><code>host: {'class': 'foo'}</code><br><code>host: {'style': 'color: blue'}</code></td>
      </tr>
    </tbody>
  </table>

## Precedence and specificity

In the following example, binding to a specific class, as in `[class.special]`, takes precedence over a generic `[class]` binding.
Similarly, binding to a specific style, as in `[style.color]`, takes precedence over a generic `[style]` binding.

<code-example path="attribute-binding/src/app/app.component.html" region="basic-specificity" header="src/app/app.component.html"></code-example>

## Precedence and bindings from different sources

Specificity rules also apply to bindings even when they originate from different sources.
An element can have bindings that originate from its own template, from host bindings on matched directives, and from host bindings on matched components.

<code-example path="attribute-binding/src/app/app.component.html" region="source-specificity" header="src/app/app.component.html"></code-example>

## Precedence of bindings and static attributes

Bindings take precedence over static attributes because they are dynamic.
In the following case, `class` and `[class]` have similar specificity, but the `[class]` binding takes precedence.

<code-example path="attribute-binding/src/app/app.component.html" region="dynamic-priority" header="src/app/app.component.html"></code-example>

{@a styling-delegation}

## Delegating to styles with lower precedence

Higher precedence styles can defer to lower precedence styles using `undefined` values.
For example, consider the following template:

<code-example path="attribute-binding/src/app/app.component.html" region="style-delegation" header="src/app/app.component.html"></code-example>

Imagine that the `dirWithHostBinding` directive and the `comp-with-host-binding` component both have a `[style.width]` host binding.

<code-example path="attribute-binding/src/app/comp-with-host-binding.component.ts" region="hostbinding" header="src/app/comp-with-host-binding.component.ts and dirWithHostBinding.directive.ts"></code-example>

If `dirWithHostBinding` sets its binding to `undefined`, the `width` property falls back to the value of the `comp-with-host-binding` host binding.

<code-example header="dirWithHostBinding directive">
@HostBinding('style.width')
width = ''; // undefined
</code-example>

<div class="alert is-helpful">

  If `dirWithHostBinding` sets its binding to `null`, Angular removes the `width` property entirely.

  <code-example header="dirWithHostBinding">
  @HostBinding('style.width')
  width = null;
  </code-example>

</div>
