@cheatsheetSection
Class field decorators for directives and components
@cheatsheetIndex 8
@description
{@target ts}`import { Input, ... } from '@angular/core';`{@endtarget}
{@target js}Available from the `ng.core` namespace{@endtarget}

@cheatsheetItem
syntax(ts):
`@Input() myProperty;`|`@Input()`
syntax(js):
`ng.core.Input(myProperty, myComponent);`|`ng.core.Input(`|`);`
description:
Declares an input property that you can update via property binding (example:
`<my-cmp [myProperty]="someExpression">`).


@cheatsheetItem
syntax(ts):
`@Output() myEvent = new EventEmitter();`|`@Output()`
syntax(js):
`myEvent = new ng.core.EventEmitter();
ng.core.Output(myEvent, myComponent);`|`ng.core.Output(`|`);`
description:
Declares an output property that fires events that you can subscribe to with an event binding (example: `<my-cmp (myEvent)="doSomething()">`).


@cheatsheetItem
syntax(ts):
`@HostBinding('[class.valid]') isValid;`|`@HostBinding('[class.valid]')`
syntax(js):
`ng.core.HostBinding('[class.valid]',
    'isValid', myComponent);`|`ng.core.HostBinding('[class.valid]', 'isValid'`|`);`
description:
Binds a host element property (here, the CSS class `valid`) to a directive/component property (`isValid`).



@cheatsheetItem
syntax(ts):
`@HostListener('click', ['$event']) onClick(e) {...}`|`@HostListener('click', ['$event'])`
syntax(js):
`ng.core.HostListener('click',
    ['$event'], onClick(e) {...}, myComponent);`|`ng.core.HostListener('click', ['$event'], onClick(e)`|`);`
description:
Subscribes to a host element event (`click`) with a directive/component method (`onClick`), optionally passing an argument (`$event`).


@cheatsheetItem
syntax(ts):
`@ContentChild(myPredicate) myChildComponent;`|`@ContentChild(myPredicate)`
syntax(js):
`ng.core.ContentChild(myPredicate,
    'myChildComponent', myComponent);`|`ng.core.ContentChild(myPredicate,`|`);`
description:
Binds the first result of the component content query (`myPredicate`) to a property (`myChildComponent`) of the class.


@cheatsheetItem
syntax(ts):
`@ContentChildren(myPredicate) myChildComponents;`|`@ContentChildren(myPredicate)`
syntax(js):
`ng.core.ContentChildren(myPredicate,
    'myChildComponents', myComponent);`|`ng.core.ContentChildren(myPredicate,`|`);`
description:
Binds the results of the component content query (`myPredicate`) to a property (`myChildComponents`) of the class.


@cheatsheetItem
syntax(ts):
`@ViewChild(myPredicate) myChildComponent;`|`@ViewChild(myPredicate)`
syntax(js):
`ng.core.ViewChild(myPredicate,
    'myChildComponent', myComponent);`|`ng.core.ViewChild(myPredicate,`|`);`
description:
Binds the first result of the component view query (`myPredicate`) to a property (`myChildComponent`) of the class. Not available for directives.


@cheatsheetItem
syntax(ts):
`@ViewChildren(myPredicate) myChildComponents;`|`@ViewChildren(myPredicate)`
syntax(js):
`ng.core.ViewChildren(myPredicate,
    'myChildComponents', myComponent);`|`ng.core.ViewChildren(myPredicate,`|`);`
description:
Binds the results of the component view query (`myPredicate`) to a property (`myChildComponents`) of the class. Not available for directives.
