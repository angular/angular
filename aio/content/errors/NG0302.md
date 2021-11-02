@name Pipe Not Found
@category runtime
@videoUrl https://www.youtube.com/embed/maI2u6Sxk9M
@shortDescription Pipe not found!

@description
Angular can't find a pipe with this name. 
The pipe referenced in the template has not been named or declared properly. 
A [pipe](guide/pipes) must be either declared or imported in the `NgModule` where it is used, and the name used in a template must match the name defined in the pipe decorator.

@debugging
Use the pipe name to trace the templates or modules where this pipe is declared and used.

To resolve this error, ensure that:
- A local custom pipe is uniquely named in the pipe's decorator, and declared in the `NgModule`, or
- A pipe from another `NgModule` is added to the imports of the `NgModule` where it is used.

If you recently added an import or declaration, you may need to restart your server to see these changes.
