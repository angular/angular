# Testing Pipes

You can test [pipes](guide/templates/pipes) without the Angular testing utilities.

## Testing the `TitleCasePipe`

A pipe class has one method, `transform`, that manipulates the input value into a transformed output value.
The `transform` implementation rarely interacts with the DOM.
Most pipes have no dependence on Angular other than the `@Pipe` metadata and an interface.

Consider a `TitleCasePipe` that capitalizes the first letter of each word.
Here's an implementation with a regular expression.

<docs-code header="title-case.pipe.ts" path="adev/src/content/examples/testing/src/app/shared/title-case.pipe.ts"/>

Anything that uses a regular expression is worth testing thoroughly. You can use standard unit testing techniques to explore the expected cases and the edge cases.

<docs-code header="title-case.pipe.spec.ts" path="adev/src/content/examples/testing/src/app/shared/title-case.pipe.spec.ts" visibleRegion="excerpt"/>

## Writing DOM tests to support a pipe test

These are tests of the pipe _in isolation_.
They can't tell if the `TitleCasePipe` is working properly as applied in the application components.

Consider adding component tests such as this one:

<docs-code header="hero-detail.component.spec.ts (pipe test)" path="adev/src/content/examples/testing/src/app/hero/hero-detail.component.spec.ts" visibleRegion="title-case-pipe"/>
