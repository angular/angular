# Testing Pipes

You can test [pipes](guide/pipes) without the Angular testing utilities.

<div class="alert is-helpful">

If you'd like to experiment with the application that this guide describes, <live-example name="testing" noDownload>run it in your browser</live-example> or <live-example name="testing" downloadOnly>download and run it locally</live-example>.

</div>

## Testing the `TitleCasePipe`

A pipe class has one method, `transform`, that manipulates the input value into a transformed output value.
The `transform` implementation rarely interacts with the DOM.
Most pipes have no dependence on Angular other than the `@Pipe` metadata and an interface.

Consider a `TitleCasePipe` that capitalizes the first letter of each word.
Here's an implementation with a regular expression.

<code-example header="app/shared/title-case.pipe.ts" path="testing/src/app/shared/title-case.pipe.ts"></code-example>

Anything that uses a regular expression is worth testing thoroughly.
Use simple Jasmine to explore the expected cases and the edge cases.

<code-example header="app/shared/title-case.pipe.spec.ts" path="testing/src/app/shared/title-case.pipe.spec.ts" region="excerpt"></code-example>

<a id="write-tests"></a>

## Writing DOM tests to support a pipe test

These are tests of the pipe *in isolation*.
They can't tell if the `TitleCasePipe` is working properly as applied in the application components.

Consider adding component tests such as this one:

<code-example header="app/hero/hero-detail.component.spec.ts (pipe test)" path="testing/src/app/hero/hero-detail.component.spec.ts" region="title-case-pipe"></code-example>

<!-- links -->

<!-- external links -->

<!-- end links -->

@reviewed 2022-02-28
