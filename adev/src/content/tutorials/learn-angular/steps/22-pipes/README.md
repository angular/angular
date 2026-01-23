# Pipes

Pipes are functions that are used to transform data in templates. In general, pipes are "pure" functions that don't cause side effects. Angular has a number of helpful built-in pipes you can import and use in your components. You can also create a custom pipe.

NOTE: Learn more about [pipes in the in-depth guide](/guide/templates/pipes).

In this activity, you will import a pipe and use it in the template.

<hr>

To use a pipe in a template include it in an interpolated expression. Check out this example:

```angular-ts {highlight:[1,5,6]}
import {UpperCasePipe} from '@angular/common';

@Component({
  ...
  template: `{{ loudMessage | uppercase }}`,
  imports: [UpperCasePipe],
})
export class App {
  loudMessage = 'we think you are doing great!'
}
```

Now, it's your turn to give this a try:

<docs-workflow>

<docs-step title="Import the `LowerCase` pipe">
First, update `app.ts` by adding the file level import for `LowerCasePipe` from `@angular/common`.

```ts
import {LowerCasePipe} from '@angular/common';
```

</docs-step>

<docs-step title="Add the pipe to the template imports">
Next, update `@Component()` decorator `imports` to include a reference to `LowerCasePipe`

```ts {highlight:[3]}
@Component({
  ...
  imports: [LowerCasePipe]
})
```

</docs-step>

<docs-step title="Add the pipe to the template">
Finally, in `app.ts` update the template to include the `lowercase` pipe:

```angular-html
template: `{{ username | lowercase }}`
```

</docs-step>

</docs-workflow>

Pipes can also accept parameters which can be used to configure their output. Find out more in the next activity.

P.S. you are doing great ⭐️
