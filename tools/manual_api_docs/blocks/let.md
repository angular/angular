`@let` allows you to define a local variable and re-use it across the template.

## Syntax

```angular-html
@let name = user.name;
@let data = data$ | async;
```

## Description

`@let` declarations are similar to [JavaScript's `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) and
their values can be any valid Angular expression. The expressions will be re-evaluated everytime the template is executed.

Similarly to JavaScript variables, variables declared with `@let`, can be used:

- After they have been declared
- Within the bound of the same scope and nested scopes

```angular-html
@let user = user$ | async;

@if (user) {
  <h1>Hello, {{user.name}}</h1>
  <user-avatar [photo]="user.photo"/>

  <ul>
    @for (snack of user.favoriteSnacks; track snack.id) {
      <li>{{snack.name}}</li>
    }
  </ul>

  <button (click)="update(user)">Update profile</button>
}
```

## Syntax definition

The `@let` syntax is formally defined as:

- The `@let` keyword.
- Followed by one or more whitespaces, not including new lines.
- Followed by a valid JavaScript name and zero or more whitespaces.
- Followed by the = symbol and zero or more whitespaces.
- Followed by an Angular expression which can be multi-line.
- Terminated by the `;` symbol.

HELPFUL: A comprehensive description of the feature is available on [the templates guide](guide/templates/variables#local-template-variables-with-let)
