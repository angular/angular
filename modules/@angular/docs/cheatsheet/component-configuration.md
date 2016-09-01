@cheatsheetSection
Component configuration
@cheatsheetIndex 7
@description
{@target js}`ng.core.Component` extends `ng.core.Directive`,
so the `ng.core.Directive` configuration applies to components as well{@endtarget}
{@target ts}`@Component` extends `@Directive`,
so the `@Directive` configuration applies to components as well{@endtarget}

@cheatsheetItem
syntax:
`moduleId: module.id`|`moduleId:`
description:
If set, the `templateUrl` and `styleUrl` are resolved relative to the component.

@cheatsheetItem
syntax(ts):
`viewProviders: [MyService, { provide: ... }]`|`viewProviders:`
syntax(js):
`viewProviders: [MyService, { provide: ... }]`|`viewProviders:`
description:
List of dependency injection providers scoped to this component's view.


@cheatsheetItem
syntax:
`template: 'Hello {{name}}'
templateUrl: 'my-component.html'`|`template:`|`templateUrl:`
description:
Inline template or external template URL of the component's view.


@cheatsheetItem
syntax:
`styles: ['.primary {color: red}']
styleUrls: ['my-component.css']`|`styles:`|`styleUrls:`
description:
List of inline CSS styles or external stylesheet URLs for styling the component’s view.
