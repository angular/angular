# Ivy compatibility examples

This appendix is intended to provide more background on Ivy changes. Many of these examples list error messages you may see, so searching by error message might be a good idea if you are debugging.

<div class="alert is-critical">
NOTE: Most of these issues affect a small percentage of applications encountering unusual or rare edge cases.
</div>


{@a content-children-descendants}
## @ContentChildren queries only match direct children by default


### Basic example of change

Let's say a component (`Comp`) has a `@ContentChildren` query for `'foo'`:

```html
<comp>
    <div>
         <div #foo></div>   <!-- matches in old runtime, not in new runtime -->
    </div>
</comp>
```

In the previous runtime, the `<div>` with `#foo` would match.
With Ivy, that `<div>` does not match because it is not a direct child of `<comp>`.


### Background

By default, `@ContentChildren` queries have the `descendants` flag set to `false`.

In the previous rendering engine, "descendants" referred to "descendant directives".
An element could be a match as long as there were no other directives between the element and the requesting directive.
This made sense for directives with nesting like tabs, where nested tab directives might not be desirable to match.
However, this caused surprising behavior for users because adding an unrelated directive like `ngClass` to a wrapper element could invalidate query results.

For example, with the content query and template below, the last two `Tab` directives would not be matches:

```
@ContentChildren(Tab, {descendants: false}) tabs: QueryList<Tab>
```

```
<tab-list>
  <div>
    <tab> One </tab>     <!-- match (nested in element) -->
  </div>
  <tab>                  <!-- match (top level) -->
    <tab> A </tab>       <!-- not a match (nested in tab) -->
  </tab>
  <div [ngClass]="classes">
    <tab> Two </tab>     <!-- not a match (nested in ngClass) -->
  </div>
</tab-list>
```

In addition, the differences between type and string predicates were subtle and sometimes unclear.
For example, if you replace the type predicate above with a `'foo'` string predicate, the matches change:

```
@ContentChildren('foo', {descendants: false}) foos: QueryList<ElementRef>
```

```
<tab-list>
  <div>
    <div #foo> One </div>     <!-- match (nested in element) -->
  </div>
  <tab #foo>                  <!-- match (top level) -->
    <div #foo> A </div>       <!-- match (nested in tab) -->
  </tab>
  <div [ngClass]="classes">
    <div #foo> Two </div>     <!-- match (nested in ngClass) -->
  </div>
</tab-list>
```

Because the previous behavior was inconsistent and surprising to users, we did not want to reproduce it in Ivy.
Instead, we simplified the mental model so that "descendants" refers to DOM nesting only.
Any DOM element between the requesting component and a potential match will invalidate that match.
Type predicates and string predicates also have identical matching behavior.

Ivy behavior for directive/string predicates:
```
<tab-list>
  <div>
    <tab> One </tab>     <!-- not a match (nested in element) -->
  </div>
  <tab>                  <!-- match (top level) -->
    <tab> A </tab>       <!-- not a match (nested in tab) -->
  </tab>
  <div [ngClass]="classes">
    <tab> Two </tab>     <!-- not a match (nested in div) -->
  </div>
</tab-list>
```


### Example of error

The error message that you see will depend on how the particular content query is used in the application code.
Frequently, an error is thrown when a property is referenced on the content query result (which is now `undefined`).

For example, if the component sets the content query results to a property, `foos`, `foos.first.bar` would throw the error:

```
Uncaught TypeError: Cannot read property 'bar' of undefined
```

If you see an error like this, and the `undefined` property refers to the result of a `@ContentChildren` query, it may well be caused by this change.


### Recommended fix

You can either add the `descendants: true` flag to ignore wrapper elements or remove the wrapper elements themselves.

Option 1:
```
@ContentChildren('foo', {descendants: true}) foos: QueryList<ElementRef>;
```

Option 2:
```
<comp>
   <div #foo></div>   <!-- matches in both old runtime and  new runtime -->
</comp>
```

{@a undecorated-classes}
## All classes that use Angular DI must have an Angular class-level decorator


### Basic example of change:

In the previous rendering engine, the following would work:

```
export class DataService {
  constructor(@Inject('CONFIG') public config: DataConfig) {}
}

@Injectable()
export class AppService extends DataService {...}
```

In Ivy, it will throw an error because `DataService` is using Angular dependency injection, but is missing an `@Injectable` decorator.

The following would also work in the previous rendering engine, but in Ivy would require a `@Directive` decorator because it uses DI:

```
export class BaseMenu {
  constructor(private vcr: ViewContainerRef) {}
}

@Directive({selector: '[settingsMenu]'})
export class SettingsMenu extends BaseMenu {}
```

The same is true if your directive class extends a decorated directive, but does not have a decorator of its own.

If you're using the CLI, there are two automated migrations that should transition your code for you ([this one](guide/migration-injectable) and [this one](guide/migration-undecorated-classes)).
However, as you're adding new code in version 9, you may run into this difference.

### Background

When a class has an Angular decorator like `@Injectable` or `@Directive`, the Angular compiler generates extra code to support injecting dependencies into the constructor of your class.
When using inheritance, Ivy needs both the parent class and the child class to apply a decorator to generate the correct code.
Otherwise, when the decorator is missing from the parent class, the subclass will inherit a constructor from a class for which the compiler did not generate special constructor info, and Angular won't have the dependency info it needs to create it properly.

In the previous rendering engine, the compiler had global knowledge, so in some cases (such as AOT mode or the presence of certain injection flags), it could look up the missing data.
However, the Ivy compiler only processes each class in isolation.
This means that compilation has the potential to be faster (and opens the framework up for optimizations and features going forward), but the compiler can't automatically infer the same information as before.

Adding the proper decorator explicitly provides this information.

### Example of error

In JIT mode, the framework will throw the following error:

```
ERROR: This constructor is not compatible with Angular Dependency Injection because its dependency at index X of the parameter list is invalid.
This can happen if the dependency type is a primitive like a string or if an ancestor of this class is missing an Angular decorator.

Please check that 1) the type for the parameter at index X is correct and 2) the correct Angular decorators are defined for this class and its ancestors.
```

In AOT mode, you'll see something like:

```
X inherits its constructor from Y, but the latter does not have an Angular decorator of its own.
Dependency injection will not be able to resolve the parameters of Y's constructor. Either add a
@Directive decorator to Y, or add an explicit constructor to X.
```

In some cases, the framework may not be able to detect the missing decorator.
In these cases, you'll generally see a runtime error thrown when there is a property access attempted on the missing dependency.
If dependency was `foo`, you'd see an error when accessing something like `foo.bar`:

```
Uncaught TypeError: Cannot read property 'bar' of undefined
```

If you see an error like this, and the `undefined` value refers to something that should have been injected, it may be this change.

### Recommended fix

- Add an `@Injectable` decorator to anything you plan to provide or inject.

```
@Injectable()
export class DataService {
  constructor(@Inject('CONFIG') public config: DataConfig) {}
}

@Injectable()
export class AppService extends DataService {...}
```

- Add a [selectorless `@Directive` decorator](guide/migration-undecorated-classes#what-does-it-mean-to-have-a-directive-decorator-with-no-metadata-inside-of-it) to any class that extends a directive or any class from which a directive inherits.

```
@Directive()            // selectorless, so it's not usable directly
export class BaseMenu {
  constructor(private vcr: ViewContainerRef) {}
}

@Directive({selector: '[settingsMenu]'})
export class SettingsMenu extends BaseMenu {}
```

{@a select-value-binding}
## Cannot Bind to `value` property of `<select>` with `*ngFor`


### Basic example of change 


```html
<select [value]="someValue">
  <option *ngFor="let option of options" [value]="option"> {{ option }} <option>
</select>
```

In the View Engine runtime, the above code would set the initial value of the `<select>` as expected. 
In Ivy, the initial value would not be set at all in this case.


### Background

Prior to Ivy, directive input bindings were always executed in their own change detection pass before any DOM bindings were processed. 
This was an implementation detail that supported the use case in question:
    
```html
<select [value]="someValue">
  <option *ngFor="let option of options" [value]="option"> {{ option }} <option>
</select>
```

It happened to work because the `*ngFor` would be checked first, during the directive input binding pass, and thus create the options first.
Then the DOM binding pass would run, which would check the `value` binding. 
At this time, it would be able to match the value against one of the existing options, and set the value of the `<select>` element in the DOM to display that option. 

In Ivy, bindings are checked in the order they are defined in the template, regardless of whether they are directive input bindings or DOM bindings.
This change makes change detection easier to reason about for debugging purposes, since bindings will be checked in depth-first order as declared in the template.

In this case, it means that the `value` binding will be checked before the `*ngFor` is checked, as it is declared above the `*ngFor` in the template. 
Consequently, the value of the `<select>` element will be set before any options are created, and it won't be able to match and display the correct option in the DOM.

### Example of error

There is no error thrown, but the `<select>` in question will not have the correct initial value displayed in the DOM.


### Recommended fix

To fix this problem, we recommend binding to the `selected` property on the `<option>` instead of the `value` on the `<select>`.

*Before*
```html
<select [value]="someValue">
  <option *ngFor="let option of options" [value]="option"> {{ option }} <option>
</select>
```

*After*
```html
<select>
  <option *ngFor="let option of options" [value]="option" [selected]="someValue == option">
    {{ option }}
  <option>
</select>
```