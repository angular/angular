@cheatsheetSection
Directive configuration
@cheatsheetIndex 4
@description
`@Directive({ property1: value1, ... }) )`

@cheatsheetItem
`selector: '.cool-button:not(a)'`|`selector:`
Specifies a css selector that identifies this directive within a template. Supported selectors include: `element`,
`[attribute]`, `.class`, and `:not()`.

Does not support parent-child relationship selectors.

@cheatsheetItem
`providers: [MyService, provide(...)]`|`providers:`
Array of dependency injection providers for this directive and its children.