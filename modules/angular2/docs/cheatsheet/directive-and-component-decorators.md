@cheatsheetSection
Class field decorators for directives and components
@cheatsheetIndex 6
@description
`import {Input, ...} from 'angular2/angular2';`

@cheatsheetItem
`@Input() myProperty;`|`@Input()`
Declares an input property that we can update via property binding, e.g.
`<my-cmp [my-property]="someExpression">`


@cheatsheetItem
`@Output() myEvent = new EventEmitter();`|`@Output()`
Declares an output property that fires events to which we can subscribe with an event binding, e.g. `<my-cmp (my-event)="doSomething()">`


@cheatsheetItem
`@HostBinding('[class.valid]') isValid;`|`@HostBinding('[class.valid]')`
Binds a host element property (e.g. css class valid) to directive/component property (e.g. isValid)



@cheatsheetItem
`@HostListener('click', ['$event']) onClick(e) {...}`|`@HostListener('click', ['$event'])`
Subscribes to a host element event (e.g. click) with a directive/component method (e.g., onClick), optionally passing an argument ($event)


@cheatsheetItem
`@ContentChild(myPredicate) myChildComponent;`|`@ContentChild(myPredicate)`
Binds the first result of the component content query (myPredicate) to the myChildComponent property of the class.


@cheatsheetItem
`@ContentChildren(myPredicate) myChildComponents;`|`@ContentChildren(myPredicate)`
Binds the results of the component content query (myPredicate) to the myChildComponents property of the class.


@cheatsheetItem
`@ViewChild(myPredicate) myChildComponent;`|`@ViewChild(myPredicate)`
Binds the first result of the component view query (myPredicate) to the myChildComponent property of the class. Not available for directives.


@cheatsheetItem
`@ViewChildren(myPredicate) myChildComponents;`|`@ViewChildren(myPredicate)`
Binds the results of the component view query (myPredicate) to the myChildComponents property of the class. Not available for directives.