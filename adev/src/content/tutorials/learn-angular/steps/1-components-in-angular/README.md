# Components in Angular

Components are the foundational building blocks for any Angular application. Each component has three parts:

- TypeScript class
- HTML template
- CSS styles

Note: Learn more about [components in the essentials guide](/essentials/components).

In this activity, you'll learn how to update the template and styles of a component.

<hr />

This is a great opportunity for you to get started with Angular.

<docs-workflow>

<docs-step title="Update the component template">
Update the `template` property to read `Hello Universe`

```ts
template: `
  Hello Universe
`,
```

When you changed the HTML template, the preview updated with your message. Let's go one step further: change the color of the text.
</docs-step>

<docs-step title="Update the component styles">
Update the styles value and change the `color` property from `blue` to `#a144eb`.

```ts
styles: `
  :host {
    color: #a144eb;
  }
`,
```

When you check the preview, you'll find that the text color will be changed.
</docs-step>

</docs-workflow>

In Angular, you can use all the browser supported CSS and HTML that's available. If you'd like, you can store your template and styles in separate files.
