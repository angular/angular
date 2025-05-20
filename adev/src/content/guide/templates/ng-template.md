# Create template fragments with ng-template

Inspired by the [native `<template>` element](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/template), the `<ng-template>` element lets you declare a **template fragment** – a section of content that you can dynamically or programmatically render.

## Creating a template fragment

You can create a template fragment inside of any component template with the `<ng-template>` element:

```angular-html
<p>This is a normal element</p>

<ng-template>
  <p>This is a template fragment</p>
</ng-template>
```

When the above is rendered, the content of the `<ng-template>` element is not rendered on the page. Instead, you can get a reference to the template fragment and write code to dynamically render it.

### Binding context for fragments

Template fragments may contain bindings with dynamic expressions:

```angular-ts
@Component({
  /* ... */,
  template: `<ng-template>You've selected {{count}} items.</ng-template>`,
})
export class ItemCounter {
  count: number = 0;
}
```

Expressions or statements in a template fragment are evaluated against the component in which the fragment is declared, regardless of where the fragment is rendered.

## Getting a reference to a template fragment

You can get a reference to a template fragment in one of three ways:

- By declaring a [template reference variable](/guide/templates/variables#template-reference-variables) on the `<ng-template>` element
- By querying for the fragment with [a component or directive query](/guide/components/queries)
- By injecting the fragment in a directive that's applied directly to an `<ng-template>` element.

In all three cases, the fragment is represented by a [TemplateRef](/api/core/TemplateRef) object.

### Referencing a template fragment with a template reference variable

You can add a template reference variable to an `<ng-template>` element to reference that template fragment in other parts of the same template file:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a template fragment</p>
</ng-template>
```

You can then reference this fragment anywhere else in the template via the `myFragment` variable.

### Referencing a template fragment with queries

You can get a reference to a template fragment using any [component or directive query API](/guide/components/queries).

For example, if your template has exactly one template fragment, you can query directly for the `TemplateRef` object with a `@ViewChild` query:

```angular-ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template>
      <p>This is a template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
  @ViewChild(TemplateRef) myFragment: TemplateRef<unknown> | undefined;
}
```

You can then reference this fragment in your component code or the component's template like any other class member.

If a template contains multiple fragments, you can assign a name to each fragment by adding a template reference variable to each `<ng-template>` element and querying for the fragments based on that name:

```angular-ts
@Component({
  /* ... */,
  template: `
    <p>This is a normal element</p>

    <ng-template #fragmentOne>
      <p>This is one template fragment</p>
    </ng-template>

    <ng-template #fragmentTwo>
      <p>This is another template fragment</p>
    </ng-template>
  `,
})
export class ComponentWithFragment {
  // When querying by name, you can use the `read` option to specify that you want to get the
  // TemplateRef object associated with the element.
  @ViewChild('fragmentOne', {read: TemplateRef}) fragmentOne: TemplateRef<unknown> | undefined;
  @ViewChild('fragmentTwo', {read: TemplateRef}) fragmentTwo: TemplateRef<unknown> | undefined;
}
```

Again, you can then reference these fragments in your component code or the component's template like any other class members.

### Injecting a template fragment

A directive can inject a `TemplateRef` if that directive is applied directly to an `<ng-template>` element:

```angular-ts
@Directive({
  selector: '[myDirective]'
})
export class MyDirective {
  private fragment = inject(TemplateRef);
}
```

```angular-html
<ng-template myDirective>
  <p>This is one template fragment</p>
</ng-template>
```

You can then reference this fragment in your directive code like any other class member.

## Rendering a template fragment

Once you have a reference to a template fragment's `TemplateRef` object, you can render a fragment in one of two ways: in your template with the `NgTemplateOutlet` directive or in your TypeScript code with `ViewContainerRef`.

### Using `NgTemplateOutlet`

The `NgTemplateOutlet` directive from `@angular/common` accepts a `TemplateRef` and renders the fragment as a **sibling** to the element with the outlet. You should generally use `NgTemplateOutlet` on an [`<ng-container>` element](/guide/templates/ng-container).

First, import `NgTemplateOutlet`:
```typescript
import { NgTemplateOutlet } from '@angular/common';
```

The following example declares a template fragment and renders that fragment to a `<ng-container>` element with `NgTemplateOutlet`:

```angular-html
<p>This is a normal element</p>

<ng-template #myFragment>
  <p>This is a fragment</p>
</ng-template>

<ng-container *ngTemplateOutlet="myFragment"></ng-container>
```

This example produces the following rendered DOM:

```angular-html
<p>This is a normal element</p>
<p>This is a fragment</p>
```

### Using `ViewContainerRef`

A **view container** is a node in Angular's component tree that can contain content. Any component or directive can inject `ViewContainerRef` to get a reference to a view container corresponding to that component or directive's location in the DOM.

You can use the `createEmbeddedView` method on `ViewContainerRef` to dynamically render a template fragment. When you render a fragment with a `ViewContainerRef`, Angular appends it into the DOM as the next sibling of the component or directive that injected the `ViewContainerRef`.

The following example shows a component that accepts a reference to a template fragment as an input and renders that fragment into the DOM on a button click.

```angular-ts
@Component({
  /* ... */,
  selector: 'component-with-fragment',
  template: `
    <h2>Component with a fragment</h2>
    <ng-template #myFragment>
      <p>This is the fragment</p>
    </ng-template>
    <my-outlet [fragment]="myFragment" />
  `,
})
export class ComponentWithFragment { }

@Component({
  /* ... */,
  selector: 'my-outlet',
  template: `<button (click)="showFragment()">Show</button>`,
})
export class MyOutlet {
  private viewContainer = inject(ViewContainerRef);
  @Input() fragment: TemplateRef<unknown> | undefined;

  showFragment() {
    if (this.fragment) {
      this.viewContainer.createEmbeddedView(this.fragment);
    }
  }
}
```

In the example above, clicking the "Show" button results in the following output:

```angular-html
<component-with-fragment>
  <h2>Component with a fragment>
  <my-outlet>
    <button>Show</button>
  </my-outlet>
  <p>This is the fragment</p>
</component-with-fragment>
```

## Passing parameters when rendering a template fragment

When declaring a template fragment with `<ng-template>`, you can additionally declare parameters accepted by the fragment. When you render a fragment, you can optionally pass a `context` object corresponding to these parameters. You can use data from this context object in binding expressions and statements, in addition to referencing data from the component in which the fragment is declared.

Each parameter is written as an attribute prefixed with `let-` with a value matching a property name in the context object:

```angular-html
<ng-template let-pizzaTopping="topping">
  <p>You selected: {{pizzaTopping}}</p>
</ng-template>
```

### Using `NgTemplateOutlet`

You can bind a context object to the `ngTemplateOutletContext` input:

```angular-html
<ng-template #myFragment let-pizzaTopping="topping">
  <p>You selected: {{pizzaTopping}}</p>
</ng-template>

<ng-container
  [ngTemplateOutlet]="myFragment"
  [ngTemplateOutletContext]="{topping: 'onion'}"
/>
```

### Using `ViewContainerRef`

You can pass a context object as the second argument to `createEmbeddedView`:

```angular-ts
this.viewContainer.createEmbeddedView(this.myFragment, {topping: 'onion'});
```

## Structural directives

A **structural directive** is any directive that:

- Injects `TemplateRef`
- Injects `ViewContainerRef` and programmatically renders the injected `TemplateRef`

Angular supports a special convenience syntax for structural directives. If you apply the directive to an element and prefix the directive's selector with an asterisk (`*`) character, Angular interprets the entire element and all of its content as a template fragment:

```angular-html
<section *myDirective>
  <p>This is a fragment</p>
</section>
```

This is equivalent to:

```angular-html
<ng-template myDirective>
  <section>
    <p>This is a fragment</p>
  </section>
</ng-template>
```

Developers typically use structural directives to conditionally render fragments or render fragments multiple times.

For more details, see [Structural Directives](/guide/directives/structural-directives).

## Additional resources

For examples of how `ng-template` is used in other libraries, check out:

- [Tabs from Angular Material](https://material.angular.dev/components/tabs/overview) - nothing gets rendered into the DOM until the tab is activated
- [Table from Angular Material](https://material.angular.dev/components/table/overview) - allows developers to define different ways to render data
