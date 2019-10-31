# Appendix: Ivy Compatibility Examples

This appendix is intended to provide more background on Ivy changes. Many of these examples list error messages you may see, so searching by error message might be a good idea if you are debugging.

<div class="alert is-critical">
NOTE: Most of these issues affect a small percentage of applications encountering unusual or rare edge cases.
</div>


{@a content-children-descendants}
## @ContentChildren Queries Only Match Direct Children By Default


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

Previously, "descendants" referred to "descendant directives". 
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