@cheatsheetSection
Directive configuration
@cheatsheetIndex 6
@description
{@target ts}`@Directive({ property1: value1, ... })`{@endtarget}
{@target js}`ng.core.Directive({ property1: value1, ... }).Class({...})`{@endtarget}

@cheatsheetItem
syntax:
`selector: '.cool-button:not(a)'`|`selector:`
description:
Specifies a CSS selector that identifies this directive within a template. Supported selectors include `element`,
`[attribute]`, `.class`, and `:not()`.

Does not support parent-child relationship selectors.

@cheatsheetItem
syntax(ts):
`providers: [MyService, { provide: ... }]`|`providers:`
syntax(js):
`providers: [MyService, { provide: ... }]`|`providers:`
description:
List of dependency injection providers for this directive and its children.
