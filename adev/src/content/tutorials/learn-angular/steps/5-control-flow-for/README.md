# Control Flow in Components - `@for`

Often when building web applications, you need to repeat some code a specific number of times - for example, given an array of names, you may want to display each name in a `<p>` tag.

Note: Learn more about [control flow in the essentials guide](/essentials/templates#control-flow-with-if-and-for).

In this activity, you'll learn how to use `@for` to repeat elements in a template.

<hr/>

The syntax that enables repeating elements in a template is `@for`.

Here's an example of how to use the `@for` syntax in a component:

```angular-ts
@Component({
  ...
  template: `
    @for (os of operatingSystems; track os.id) {
      {{ os.name }}
    }
  `,
})
export class App {
  operatingSystems = [{id: 'win', name: 'Windows'}, {id: 'osx', name: 'MacOS'}, {id: 'linux', name: 'Linux'}];
}
```

Two things to take note of:

- There is an `@` prefix for the `for` because it is a special syntax called [Angular template syntax](guide/templates)
- For applications using v16 and older please refer to the [Angular documentation for NgFor](guide/directives/structural-directives)

<docs-workflow>

<docs-step title="Add the `users` property">
In the `App` class, add a property called `users` that contains users and their names.

```ts
[{id: 0, name: 'Sarah'}, {id: 1, name: 'Amy'}, {id: 2, name: 'Rachel'}, {id: 3, name: 'Jessica'}, {id: 4, name: 'Poornima'}]
```

</docs-step>

<docs-step title="Update the template">
Update the template to display each user name in a `p` element using the `@for` template syntax.

```angular-html
@for (user of users; track user.id) {
  <p>{{ user.name }}</p>
}
```

NOTE: the use of `track` is required, you may use the `id` or some other unique identifier.

</docs-step>

</docs-workflow>

This type of functionality is called control flow. Next, you'll learn to customize and communicate with components - by the way, you're doing a great job so far.
