@cheatsheetSection
Class field decorators for directives and components
@cheatsheetIndex 7
@description
{@target js ts}`import {Input, ...} from 'angular2/core';`{@endtarget}
{@target dart}`import 'package:angular2/core.dart';`{@endtarget}

@cheatsheetItem
syntax:
`@Input() myProperty;`|`@Input()`
description:
Declares an input property that we can update via property binding (e.g.
`<my-cmp [my-property]="someExpression">`).


@cheatsheetItem
syntax:
`@Output() myEvent = new EventEmitter();`|`@Output()`
description:
Declares an output property that fires events to which we can subscribe with an event binding (e.g. `<my-cmp (my-event)="doSomething()">`).


@cheatsheetItem
syntax:
`@HostBinding('[class.valid]') isValid;`|`@HostBinding('[class.valid]')`
description:
Binds a host element property (e.g. CSS class valid) to directive/component property (e.g. isValid).



@cheatsheetItem
syntax:
`@HostListener('click', ['$event']) onClick(e) {...}`|`@HostListener('click', ['$event'])`
description:
Subscribes to a host element event (e.g. click) with a directive/component method (e.g. onClick), optionally passing an argument ($event).


@cheatsheetItem
syntax:
`@ContentChild(myPredicate) myChildComponent;`|`@ContentChild(myPredicate)`
description:
Binds the first result of the component content query (myPredicate) to the myChildComponent property of the class.


@cheatsheetItem
syntax:
`@ContentChildren(myPredicate) myChildComponents;`|`@ContentChildren(myPredicate)`
description:
Binds the results of the component content query (myPredicate) to the myChildComponents property of the class.


@cheatsheetItem
syntax:
`@ViewChild(myPredicate) myChildComponent;`|`@ViewChild(myPredicate)`
description:
Binds the first result of the component view query (myPredicate) to the myChildComponent property of the class. Not available for directives.


@cheatsheetItem
syntax:
`@ViewChildren(myPredicate) myChildComponents;`|`@ViewChildren(myPredicate)`
description:
Binds the results of the component view query (myPredicate) to the myChildComponents property of the class. Not available for directives.
