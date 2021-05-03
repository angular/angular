@name Invalid Attribute
@category compiler
@videoUrl https://www.youtube.com/embed/wfLkB3RsSJM
@shortDescription Unknown attribute or input

@description
An attribute or property cannot be resolved during compilation.

This error arises when attempting to bind to a property that does not exist. Any property binding must correspond to either:
* A native property on the HTML element, or
* An `@Input()` property of a component or directive applied to the element.

The runtime error for this is `NG0304: '${tagName}' is not a known element: …’`.

@debugging
Look at documentation for the specific [binding syntax](guide/binding-syntax) used. This is usually a typo or incorrect import. There may also be a missing direction with property selector ‘name’ or missing input.
