# Composing Components

You've learned to update the component template, component logic, and component styles, but how do you use a component in your application?

The `selector` property of the component configuration gives you a name to use when referencing the component in another template. You use the `selector` like an HTML tag, for example `app-user` would be `<app-user />` in the template.

Note: Learn more about [using components in the essentials guide](/essentials/components#using-components).

In this activity, you'll learn how to compose components.

<hr/>

In this example, there are two components `User` and `App`.

<docs-workflow>

<docs-step title="Add a reference to `User`">
Update the `App` template to include a reference to the `User` which uses the selector `app-user`. Be sure to add `User` to the imports array of `App`, this makes it available for use in the `App` template.

```ts
template: `<app-user />`,
imports: [User]
```

The component now displays the message `Username: youngTech`. You can update the template code to include more markup.
</docs-step>

<docs-step title="Add more markup">
Because you can use any HTML markup that you want in a template, try updating the template for `App` to also include more HTML elements. This example will add a `<section>` element as the parent of the `<app-user>` element.

```ts
template: `<section><app-user /></section>`,
```

</docs-step>

</docs-workflow>
You can use as much HTML markup and as many components as you need to bring your app idea to reality. You can even have multiple copies of your component on the same page.

That's a great segue, how would you conditionally show a component based on data? Head to the next section to find out.
