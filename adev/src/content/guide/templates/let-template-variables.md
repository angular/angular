# Local template variables

Angular's `@let` syntax allows you to define a local variable and re-use it across the template.

IMPORTANT: the `@let` syntax is currently in [Developer Preview](/reference/releases#developer-preview).

## Syntax

`@let` declarations are similar to [JavaScript's `let`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/let) and
their values can be any valid Angular expression. The expressions will be re-evaluated any time the
template is executed.

```angular-html
@let name = user.name;
@let greeting = 'Hello, ' + name;
@let data = data$ | async;
@let pi = 3.1459;
@let coordinates = {x: 50, y: 100};
@let longExpression = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit ' +
                      'sed do eiusmod tempor incididunt ut labore et dolore magna ' +
                      'Ut enim ad minim veniam...';
```

### Referencing the value of `@let`

Once you've declared the `@let`, you can reuse it anywhere in the template:


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

## Assignability

A key difference between `@let` and JavaScript's `let` is that `@let` cannot be re-assigned
within the template, however its value will be recomputed when Angular runs change detection.

```angular-html
@let value = 1;

<!-- Invalid -->
<button (click)="value = value + 1">Increment the value</button>
```

## Scope

`@let` declarations are scoped to the current view and its descendants. Since they are not
hoisted, they **cannot** be accessed by parent views or siblings:

```angular-html
@let topLevel = value;

<div>
  @let insideDiv = value;
</div>

{{topLevel}} <!-- Valid -->
{{insideDiv}} <!-- Valid -->

@if (condition) {
  {{topLevel + insideDiv}} <!-- Valid -->

  @let nested = value;

  @if (condition) {
    {{topLevel + insideDiv + nested}} <!-- Valid -->
  }
}

<div *ngIf="condition">
  {{topLevel + insideDiv}} <!-- Valid -->

  @let nestedNgIf = value;

  <div *ngIf="condition">
     {{topLevel + insideDiv + nestedNgIf}} <!-- Valid -->
  </div>
</div>

{{nested}} <!-- Error, not hoisted from @if -->
{{nestedNgIf}} <!-- Error, not hoisted from *ngIf -->
```

## Syntax definition

The `@let` syntax is formally defined as:
* The `@let` keyword.
* Followed by one or more whitespaces, not including new lines.
* Followed by a valid JavaScript name and zero or more whitespaces.
* Followed by the = symbol and zero or more whitespaces.
* Followed by an Angular expression which can be multi-line.
* Terminated by the `;` symbol.
