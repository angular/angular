# Pipe Not Found

<docs-video src="https://www.youtube.com/embed/maI2u6Sxk9M"/>

Angular can't find a pipe with this name.

The [pipe](guide/templates/pipes) referenced in the template has not been named or declared properly.

To use the pipe:

- Ensure the name used in a template matches the name defined in the pipe decorator.
- Add the pipe to your component's `imports` array or, if the pipe sets `standalone: false`, add the `NgModule` to which the pipe belongs.

## Debugging the error

Use the pipe name to trace where the pipe is declared and used.

To resolve this error:

- If the pipe is local to the `NgModule`, give it a unique name in the pipe's decorator and declared it in the `NgModule`.
- If the pipe is standalone or is declared in another `NgModule`, add it to the `imports` field of the standalone component or the current `NgModule`.

If you recently added an import or declaration, you may need to restart your server to see these changes.
