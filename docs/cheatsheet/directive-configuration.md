@cheatsheetSection
Directive configuration
@cheatsheetIndex 5
@description
`@Directive({ property1: value1, ... }) )`

@cheatsheetItem
syntax:
`selector: '.cool-button:not(a)'`|`selector:`
description:
Specifies a css selector that identifies this directive within a template. Supported selectors include: `element`,
`[attribute]`, `.class`, and `:not()`.

Does not support parent-child relationship selectors.

@cheatsheetItem
syntax:
`providers: [MyService, provide(...)]`|`providers:`
description:
Array of dependency injection providers for this directive and its children.