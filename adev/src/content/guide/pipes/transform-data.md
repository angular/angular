# Custom pipes for new transforms

Create custom pipes to encapsulate transformations that are not provided with the built-in pipes.
Then, use your custom pipe in template expressions, the same way you use built-in pipes—to transform input values to output values for display.

## Marking a class as a pipe

To mark a class as a pipe and supply configuration metadata, apply the `@Pipe` to the class.

Use UpperCamelCase (the general convention for class names) for the pipe class name, and camelCase for the corresponding `name` string.
Do not use hyphens in the `name`.

For details and more examples, see [Pipe names](/style-guide#pipe-names "Pipe names in the Angular coding style guide").

Use `name` in template expressions as you would for a built-in pipe.

```ts
import { Pipe } from '@angular/core';

@Pipe({
  name: 'greet',
})
export class GreetPipe {}
```

## Using the PipeTransform interface

Implement the [`PipeTransform`](/api/core/PipeTransform "API reference for PipeTransform") interface in your custom pipe class to perform the transformation.

Angular invokes the `transform` method with the value of a binding as the first argument, and any parameters as the second argument in list form, and returns the transformed value.

```ts
import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'greet',
})
export class GreetPipe implements PipeTransform {
  transform(value: string, param1: boolean, param2: boolean): string {
    return `Hello ${value}`;
  }
}
```

## Example: Transforming a value exponentially

In a game, you might want to implement a transformation that raises a value exponentially to increase a hero's power.
For example, if the hero's score is 2, boosting the hero's power exponentially by 10 produces a score of 1024 (`2**10`).
Use a custom pipe for this transformation.

The following code example shows two component definitions:

| Files                          | Details |
|:---                            |:---     |
| `exponential-strength.pipe.ts` | Defines a custom pipe named `exponentialStrength` with the `transform` method that performs the transformation. It defines an argument to the `transform` method \(`exponent`\) for a parameter passed to the pipe. |
| `power-booster.component.ts`   | Demonstrates how to use the pipe, specifying a value \(`2`\) and the exponent parameter \(`10`\).                                                                                                                   |

<docs-code-multifile>
  <docs-code header="src/app/exponential-strength.pipe.ts" language="ts" path="adev/src/content/examples/pipes/src/app/exponential-strength.pipe.ts"/>
  <docs-code header="src/app/power-booster.component.ts" language="ts" path="adev/src/content/examples/pipes/src/app/power-booster.component.ts"/>
</docs-code-multifile>
