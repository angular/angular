# Creating pipes for custom data transformations

Create custom pipes to encapsulate transformations that are not provided with the built-in pipes.
Then, use your custom pipe in template expressions, the same way you use built-in pipes—to transform input values to output values for display.

## Marking a class as a pipe

To mark a class as a pipe and supply configuration metadata, apply the [`@Pipe`](/api/core/Pipe "API reference for Pipe") [decorator](/guide/glossary#decorator--decoration "Definition for decorator") to the class.

Use [UpperCamelCase](guide/glossary#case-types "Definition of case types") (the general convention for class names) for the pipe class name, and [camelCase](guide/glossary#case-types "Definition of case types") for the corresponding `name` string.
Do not use hyphens in the `name`.

For details and more examples, see [Pipe names](guide/styleguide#pipe-names "Pipe names in the Angular coding style guide").

Use `name` in template expressions as you would for a built-in pipe.

<div class="alert is-important">

*   Include your pipe in the `declarations` field of the `NgModule` metadata in order for it to be available to a template. See the `app.module.ts` file in the example application (<live-example></live-example>). For details, see [NgModules](guide/ngmodules "NgModules introduction").
*   Register your custom pipes. The [Angular CLI](cli "CLI Overview and Command Reference") [`ng generate pipe`](cli/generate#pipe "ng generate pipe in the CLI Command Reference") command registers the pipe automatically.

</div>

## Using the PipeTransform interface

Implement the [`PipeTransform`](/api/core/PipeTransform "API reference for PipeTransform") interface in your custom pipe class to perform the transformation.

Angular invokes the `transform` method with the value of a binding as the first argument, and any parameters as the second argument in list form, and returns the transformed value.

## Example: Transforming a value exponentially

In a game, you might want to implement a transformation that raises a value exponentially to increase a hero's power.
For example, if the hero's score is 2, boosting the hero's power exponentially by 10 produces a score of 1024.
Use a custom pipe for this transformation.

The following code example shows two component definitions:

*   The `exponential-strength.pipe.ts` component defines a custom pipe named `exponentialStrength` with the `transform` method that performs the transformation.
    It defines an argument to the `transform` method (`exponent`) for a parameter passed to the pipe.
*   The `power-booster.component.ts` component demonstrates how to use the pipe, specifying a value (`2`) and the exponent parameter (`10`).

<code-tabs>
    <code-pane header="src/app/exponential-strength.pipe.ts" path="pipes/src/app/exponential-strength.pipe.ts"></code-pane>
    <code-pane header="src/app/power-booster.component.ts" path="pipes/src/app/power-booster.component.ts"></code-pane>
</code-tabs>

The browser displays the following:

<code-example language="none">

Power Booster

Superpower boost: 1024

</code-example>

<div class="alert is-helpful">

To examine the behavior of the `exponentialStrength` pipe in the <live-example name="pipes"></live-example>, change the value and optional exponent in the template.

</div>

@reviewed 2023-01-06
