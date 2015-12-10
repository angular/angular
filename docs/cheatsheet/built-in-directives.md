@cheatsheetSection
Built-in directives
@cheatsheetIndex 2
@description
{@target js ts}`import {NgIf, ...} from 'angular2/angular2';`{@endtarget}
{@target dart}`import 'package:angular2/angular2.dart';`{@endtarget}

@cheatsheetItem
syntax:
`<section *ng-if="showSection">`|`*ng-if`
description:
Removes or recreates a portion of the DOM tree based on the showSection expression.

@cheatsheetItem
syntax:
`<li *ng-for="#item of list">`|`*ng-for`
description:
Turns the li element and its contents into a template, and uses that to instantiate a view for each item in list.

@cheatsheetItem
syntax:
`<div [ng-switch]="conditionExpression">
  <template [ng-switch-when]="case1Exp">...</template>
  <template ng-switch-when="case2LiteralString">...</template>
  <template ng-switch-default>...</template>
</div>`|`[ng-switch]`|`[ng-switch-when]`|`ng-switch-when`|`ng-switch-default`
description:
Conditionally swaps the contents of the div by selecting one of the embedded templates based on the current value of conditionExpression.

@cheatsheetItem
syntax:
`<div [ng-class]="{active: isActive, disabled: isDisabled}">`|`[ng-class]`
description:
Binds the presence of css classes on the element to the truthiness of the associated map values. The right-hand side expression should return {class-name: true/false} map.
