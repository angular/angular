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

{@a forward-refs-directive-inputs}
## Forward references to directive inputs accessed through local refs are no longer supported.


### Basic example of change


```ts
@Directive({
  selector: '[myDir]',
  exportAs: 'myDir'
})
export class MyDir {
  @Input() message: string;
}
```

```html
{{ myDir.name }}
<div myDir #myDir="myDir" [name]="myName"></div>
```

In the View Engine runtime, the above code would print out the name without any errors.
In Ivy, the `myDir.name` binding will throw an `ExpressionChangedAfterItHasBeenCheckedError`.


### Background

In the ViewEngine runtime, directive input bindings and element bindings were executed in different stages. Angular would process the template one full time to check directive inputs only (e.g. `[name]`), then process the whole template again to check element and text bindings only (e.g.`{{ myDir.name }}`). This meant that the `name` directive input would be checked before the `myDir.name` text binding despite their relative order in the template, which some users felt to be counterintuitive.

In contrast, Ivy processes the template in just one pass, so that bindings are checked in the same order that they are written in the template. In this case, it means that the `myDir.name` binding will be checked before the `name` input sets the property on the directive (and thus it will be `undefined`). Since the `myDir.name` property will be set by the time the next change detection pass runs, a change detection error is thrown.

### Example of error

Assuming that the value for `myName` is `Angular`, you should see an error that looks like

```
Error: ExpressionChangedAfterItHasBeenCheckedError: Expression has changed after it was checked. Previous value: 'undefined'. Current value: 'Angular'.
```

### Recommended fix

To fix this problem, we recommend either getting the information for the binding directly from the host component (e.g. the `myName` property from our example) or to move the data binding after the directive has been declared so that the initial value is available on the first pass.

*Before*
```html
{{ myDir.name }}
<div myDir #myDir="myDir" [name]="myName"></div>
```

*After*
```html
{{ myName }}
<div myDir [name]="myName"></div>
```

{@a foreign-values}
## Foreign functions and foreign values aren't statically resolvable

### Basic example of change 

Consider a library that defines and exports some selector string to be used in other libraries:

```
export let mySelector = '[my-selector]';
```

This selector is then imported in another library or an application:

```
import {mySelector} from 'my-library';

@Directive({selector: mySelector})
export class MyDirective {}
```

Because the `mySelector` value is imported from an external library, it is part of a different compilation unit and therefore considered _foreign_.

While this code would work correctly in the View Engine compiler, it would fail to compile in Ivy in AOT mode.

### Background

In View Engine, the compiler would capture the source code of a library in `metadata.json` files when bundling the library, so that external consumers could "look inside" the source code of an external library.
When AOT-compiling the application, the `metadata.json` files would be used to determine the value of `mySelector`.
In Ivy, the `metadata.json` files are no longer used. Instead, the compiler extracts metadata for external libraries from the `.d.ts` files that TypeScript creates.
This has several benefits such as better performance, much improved error reporting, and enables more build caching opportunities as there is no longer a dependency on library internals.

Looking back at the previous example, the `mySelector` value would be represented in the `.d.ts` as follows:

```
export declare let mySelector: string;
```

Notice that the actual value of the selector is no longer present, so that the Ivy compiler is unable to use it during AOT compilations.

### Example of error

In the above example, a compilation error would occur when compiling `MyDirective`:

```
error NG1010: selector must be a string
  Value is a reference to 'mySelector'.

    1  export declare let mySelector: string;
                          ~~~~~~~~~~
    Reference is declared here.

```

### Recommended fix

When exporting values from a library, ensure the actual value is present in the `.d.ts` file. This typically requires that the variable be declared as a constant:

```
export const mySelector = '[my-selector]';
```

In classes, a field should be declared using the `static readonly` modifiers:

```
export class Selectors {
  static readonly mySelector = '[my-selector]';
}
```
