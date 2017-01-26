@cheatsheetSection
Built-in directives
@cheatsheetIndex 3
@description
{@target ts}`import { CommonModule } from '@angular/common';`{@endtarget}
{@target js}Available using the `ng.common.CommonModule` module{@endtarget}

@cheatsheetItem
syntax:
`<section *ngIf="showSection">`|`*ngIf`
description:
Removes or recreates a portion of the DOM tree based on the `showSection` expression.

@cheatsheetItem
syntax:
`<li *ngFor="let item of list">`|`*ngFor`
description:
Turns the li element and its contents into a template, and uses that to instantiate a view for each item in list.

@cheatsheetItem
syntax:
`<div [ngSwitch]="conditionExpression">
  <template [ngSwitchCase]="case1Exp">...</template>
  <template ngSwitchCase="case2LiteralString">...</template>
  <template ngSwitchDefault>...</template>
</div>`|`[ngSwitch]`|`[ngSwitchCase]`|`ngSwitchCase`|`ngSwitchDefault`
description:
Conditionally swaps the contents of the div by selecting one of the embedded templates based on the current value of `conditionExpression`.

@cheatsheetItem
syntax:
`<div [ngClass]="{active: isActive, disabled: isDisabled}">`|`[ngClass]`
description:
Binds the presence of CSS classes on the element to the truthiness of the associated map values. The right-hand expression should return {class-name: true/false} map.
