# Updating the Component Class

In Angular, the component's logic and behavior are defined in the component's TypeScript class.

Note: Learn more about [showing dynamic text in the essentials guide](/essentials/templates#showing-dynamic-text).

In this activity, you'll learn how to update the component class and how to use [interpolation](/guide/templates/binding#render-dynamic-text-with-text-interpolation).

<hr />

<docs-workflow>

<docs-step title="Add a property called `city`">
Update the component class by adding a property called `city` to the `App` class.

```ts
export class App {
  city = 'San Francisco';
}
```

The `city` property is of type `string` but you can omit the type because of [type inference in TypeScript](https://www.typescriptlang.org/docs/handbook/type-inference.html). The `city` property can be used in the `App` class and can be referenced in the component template.

<br>

To use a class property in a template, you have to use the `{{ }}` syntax.
</docs-step>

<docs-step title="Update the component template">
Update the `template` property to match the following HTML:

```ts
template: `Hello {{ city }}`,
```

This is an example of interpolation and is a part of Angular template syntax. It enables you to do much more than put dynamic text in a template. You can also use this syntax to call functions, write expressions and more.
</docs-step>

<docs-step title="More practice with interpolation">
Try this - add another set of `{{ }}` with the contents being `1 + 1`:

```ts
template: `Hello {{ city }}, {{ 1 + 1 }}`,
```

Angular evaluates the contents of the `{{ }}` and renders the output in the template.
</docs-step>

</docs-workflow>

This is just the beginning of what's possible with Angular templates, keep on learning to find out more.
