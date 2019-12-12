# Styling Algorithm 

Please keep this document up to date with the code in `packages/core/src/render3/styling`

# Overview

The algorithm works in two parts:
1. Concatenate the styling into a single string.
2. Reconcile the styling string with the DOM.


## Concatenation

NOTE: This document discusses `style` bindings, but keep in mind that the same algorithm/mental model/logic also applies to `class`.

Let's start with a worst case example where properties collide:
```htmlmixed=
<my-red-comp style="color: {{'blue'}};"
             [style.color]="tmplColor"
             [style]=" { color: tmplColor2 } "
             my-green-dir>
</my-red-comp>
```

In the above example we know:
- `my-red-comp` sets `color: red;` (implied)
- In template we set:
  - `color: {{'blue'}};`
  - `color: {{tmplColor}};`
  - `color: {{tmplColor2}};`
- `my-green-dir` sets `color: green;` (implied)

The algorithm needs to concatenate all of the individual styles into a single string in [correct order](#Concatenation-Order). The resulting string is:
```
color: red; color: green: color: {{tmplColor2}}; color: {{tmplColor}};
```

The resulting string is than written into the DOM using `element.style.cssText` (or `elemet.className`.) We rely on the browser to dedup the extra styles. 

The above algorithm is fast because:
- We only concatenate strings (no parsing.)
- We use `element.style.cssText` (or `elemet.className`) which requires only one JS to C++ API transition.

The above algorithm has an issue:
- When application code writes styling into DOM, the algorithm will clobber the application styling. (See [reconciliation](#Reconciliation) for a fix.)

### Concatenation Order

The order of concatenation has implication on the priority of style resolution. (i.e. template bindings overwrite the directive etc...)

The order of priority is from the highest to lowest:
- **Template**: This is controlled by the developer that integrates components and directives into the application. As such the developers intend on styling should have the highest priority (above that of directives or components.) Within the template the bindings are ordered as follows: 
  - **`[style.propertyName]="expValue"`**: Specific property binding is the most specific and so it should overwrite map (`[style]`) and static (`style`) binding.
  - **`[style]="expMap"`**: Map bindings are applied next because it is not clear form the template which properties will be set.
  - **`style="{{expInterpolate}}"`**: Interpolation properties are the lowest priority.
    - **`style="property: value;"`**: Static styling is just a special case of interpolation where there are only static parts. (See: [Static styling](#Static-styling))
- **Directive**: Directives often augment existing components/elements. For this reason they should have higher priority than the component.
  - **`@HostBinding("style.propertyName")`**: Same priority order as template
  - **`@HostBinding("style")`**: Same priority order as Template
- **Component**: Components have the lowest priority.
  - **`@HostBinding("style.propertyName")`**: Same priority order as Template
  - **`@HostBinding("style")`**: Same priority order as Template

Within the template the compiler ensures that it generates the styling binding instructions in the correct order:
```
template: function (...) {
  if (create) {
  
  }
  if (update) {
    ɵɵstylePropInterpolate1(...)
    ɵɵstyleMap(...)
    ɵɵstyleProp(...)
  }
}
```

This allows the concatenation order to be just the order in which the compiler instructions were generated. This is true for both the `template` as well as `hostBindings` function.

#### Directives and Components

While the order in which the styling properties should be applied is straight forward to understand, it is not so simple in the code. The issue is that the component and directives execute their `hostBindings` functions after the current template function is executed.

```htmlmixed=
<comp1 dir1 [style.color]=" exp1 "></comp1>
<comp2 dir2 [style.color]=" exp2 "></comp1>
```

The example above shows that the order of execution is in two phases:
1. Template `template` function: `exp1`; `exp2`.
2. Component/Directives `hostBindings` function: `comp1`; `dir1`; `comp2`; `dir2`.

The issue is that all template bindings execute before all component/directive host bindings. The implications of that are:
1. We need to flush (write the style into DOM twice). 
  - Once when we are done with the template element (during the `ɵɵadvance` instruction.)
  - And once when we are done with the `hostBindings` for the component/directives.
2. Because bindings come from two places `template` and `hostBindings` instructions which are executed at different times we need to be able to compute the overall change to the resulting styling string if only a single binding changes in either `template` or `hostBindings`.
3. The order of concatenation `comp -> dir -> template` is not the same as order of binding execution `template -> comp -> dir`. This creates a problem when a single binding is updated.

The algorithm to concatenate the strings in correct order relies on building up a linked list of bindings so that any change in the list can re-apply all bindings after the change.

Getting back to our example:
```htmlmixed=
<my-red-comp style="color: {{'blue'}};"
             [style.color]="tmplColor"
             [style]=" { color: tmplColor2 } "
             my-green-dir>
</my-red-comp>
```

In the above example the correct concatenation order is:
1. `color: red;` (from a component host binding)
2. `color: green;`(from a directive host binding)
3. `color: {{'blue'}};`
4. `color: {{tmplColor2}};`
5. `color: {{tmplColor}};`

However the execution order is:

```typescript=
template: function(...) {
  ɵɵstylePropInterpolate1('color: ' , 'blue', ';'); // 1
  ɵɵstyleMap({ color: tmplColor2 });                // 2
  ɵɵstyleProp('color', tmplColor);                  // 3
}
flushStyleToDOM();
comp.hostBindings: function(...) {
  ɵɵstyleProp('color', 'red');                      // 4
}
dir.hostBindings: function(...) {
  ɵɵstyleProp('color', 'green');                    // 5
}
flushStyleToDOM();
```

The execution order and the concatenation order need to be rearranged to get the desired output. This is done by building a linked list of bindings so that they can be re-applied at to get the correct concatenation order.

Mental Model:
1. Each binding takes two `LView` values (and two `TView.data` values)
2. Styling is flushed twice. After each element `ɵɵadvance` and after each component/directive `hostBindings` execution.
3. Component and Directive host bindings need to be inserted into correct location in tho `LView` to preserve the correct priority.


Here is what the `LView`/`TView.data` will look like after the execution of `template`.

|Idx|`TView.data`|`LView`        | Notes
|---|------------|--------       |--------------
|...|            |               |
|20 |`color`     |`blue`         |`ɵɵstylePropInterpolate1('color: ' , 'blue', ';')`
|21 |`0 | 22`    |`color: blue;` |intermediate result
|22 |`color`     |`orange`       |`ɵɵstyleMap({ color: tmplColor2 });` (assume `tmplColor2 == 'orange'`)
|23 |`20 | 24`   |`color: blue; color: orange;` |intermediate result
|24 |`color`     |`yellow`       |`ɵɵstyleProp('color', tmplColor);;` (assume `tmplColor == 'yellow'`)
|25 |`22 | 0`    |`color: blue; color: orange; color: yellow;` |intermediate result

> [name=Miško Hevery] 
> - Where do we store initial style data?

Notice that:
1. Each binding takes up two slots in `LView`
   - One for the binding value itself.
   - Second for the intermediary concatenation value. This is needed because on subsequent passes any of the bindings may change, and we don't want to re-concatenate all of the values as that would be slow and create memory pressure.
2. The `Tview.data` allows us to see where the previous and next bindings are.
3. If a particular binding changes it is sufficient to just start with the concatenated value up to that point and reapply all subsequent concatenation until end. (This makes this algorithm simple/efficient/fast)

The next step of execution is to run the component/directive `hostBindings` function which will update the `LView`/`TView.data` as follows. 

|Idx|`TView.data`|`LView`        | Notes
|---|------------|--------       |--------------
|...|            |               |
|20 |`color`     |`blue`         |
|21 |`40 | 22`   |`color: red; color: green; color: blue;` | Notice that the values here were now re-computed to reflect the fact that component has been inserted in front of `template`.
|22 |`color`     |`orange`       |
|23 |`20 | 24`   |`color: red; color: green; color: blue; color: orange;` | updated
|24 |`color`     |`yellow`       |
|25 |`22 | 0`    |`color: red; color: green; color: blue; color: orange; color: yellow;` | updated
|...|            |               |
|40 |`color`     |`red`          |`ɵɵstyleProp('color', 'red');`
|41 |`0 | 50`    |`color: red;`  |intermediate result
|...|            |               |
|50 |`color`     |`green`        |`ɵɵstyleProp('color', 'green');`
|51 |`40 | 20`   |`color: red; color: green;`  |intermediate result


Once we have a linked list of all of the bindings and which bindings follow, it is easy to compute the resulting styling:
1. See if the binding has changed.
2. If biding changed simply update the current concatenation, then go to the next binding until we reach the end of the list. 
3. Take the resulting concatenated result and apply it to the DOM element.


#### Static styling

Static bindings handling is as follows. 

```
<red-comp style="color: blue;">
```

:::danger
It would be reasonable to assume that the resulting `color` would be `blue`. However, that would be a breaking change with respect to VE. Instead in the VE the result is `red` and for now the Ivy follows the same behavior to maintain compatibility.
:::

- The static properties are stored as `tNode.styles = 'color: blue;'`
- Whenever, the concatenation occurs the `0` value points to `tNode.styles`

In the above example `LView`/`TNode.data` would look like this:

|Idx|`TView.data`|`LView`        | Notes
|---|------------|--------       |--------------
|...|            |               |
|40 |`color`     |`red`          |`ɵɵstyleProp('color', 'red');`
|41 |`0 | 0`     |`color: blue; color: red;`  |intermediate result

Notice that when `ɵɵstyleProp` of `<red-comp>` executes it's previous styling is `0` which means it uses `tNode.styles` instead.

```
tNode.syles + ' ' + 'color' + ': ' + 'red' + ';' ==> `color: blue; color: red;`
```


## Reconciliation

The above algorithm relies on writing the concatenated string directly to the DOM. The implication of this is that such write is destructive and will remove any styling which has been set outside of framework. The solution is to read the value of the styling before we write to it. If the value we read is same as last time we wrote, we assume there was no styling modification and we are safe to just write the new value. (This is the most common/fast path). If on the other hand it is detected that the value we read is not the same as the one we wrote last time (some change has occurred out of bounds) we have to reconcile what we are about to write with what is already written.

Because the `Render3` API is async (WebWorker) we can't rely on being able to read the value from the DOM. (This is also the case for NativeScript.) For this reason all we do is to check if the value has changed since last write, but we don't try to interpret the value we have read from the DOM (because it may not be there WebWorker/NativeScript).

The reconciliation process is as follows:
1. Detect that no one has modified `className`/`cssText` and if so just write directly (fast path).
2. If out of bounds write did occur, switch from writing using `className`/`cssText` to `element.classList.add/remove`/`element.style[property]`. This does require that the write function computes the difference between the previous Angular expected state and current Angular state. (This requires a parser. The advantage of having a parser is that we can support `style="width: {{exp}}px"` kind of bindings.) Compute the diff and apply it in non destructive way using `element.classList.add/remove`/`element.style[property]`

Properties of approach:
- If no out of bounds style modification:
  - Very fast code path: Just concatenate string in right order and write them to DOM.
  - Class list order is preserved
- If out of bounds style modification detected:
  - Penalty for parsing 
  - Switch to non destructive modification: `element.classList.add/remove`/`element.style[property]`
  - Switch to alphabetical way of setting classes.


## Back-storing of values

:::danger
**This section is not applicable.**

See: https://jsperf.com/csstext-read-vs-write The test case shows two things:
1. The fastest way to read/write into the styles is using `setAttribute()` (not `style.cssText`)
2. When using `setAttribute` the browser honors the text as is and will not try to re-write it. This means that the read hear is not necessary. It also means that the we don't need to do back-storing of values.

It is also true that writes using `style[property]` will update the attribute property.

```
element.setAttribute('style', 'color: red; color: blue;');
// NOTICE it does not coelesce
console.log(element.getAttribute('style')); // 'color: red; color: blue;' 
```

:::

~~When working with styles a read from `cssText` may read values different than were just wr itten. Example:~~

```
element.style.cssText = 'color: red; color: blue;';
console.log(element.style.cssText); // 'color: blue;'
```

~~Notice how the browser removes duplicates from the list. The implication of this is that a such binding will incorrectly flag the reconciliation algorithm as having an out of bound write, (where non is). To fix each write to browser will be associated with reading the values back out and than storing that value in the last concatenation value, so that subsequent read will correctly identify no out of band write situation.~~

## Flushing

Flushing is the act of writing the concatenated value into the DOM. Flushing happens twice:
1. On each `ɵɵadvance` instruction where the template bindings are written to DOM.
2. After a styling instruction in `hostBindings`. (This is because `hostBindings` execute after all of the `template` styling instructions execute.)

Let's assume that we have a template binding `width` and `hostBindings` `height`.
```
<div [style.width.px]="widthExp" [dir-height]="heightExp">
```

In the above example `LView`/`TNode.data` would look like this:

|Idx|`TView.data`|`LView`        | Notes
|---|------------|--------       |--------------
|20 |`{prop: 'width', suffix: 'px'}` |`10`         | `[style.width.px]="widthExp"`
|21 |`0 | 0`     |`width: 10px;` | This value flushed on `ɵɵadvance`.

When `widthExp` is checked the algorithm flushes `width: 10px;` into DOM.


Later when `heightExp` is checked the algorithm needs to update the linked list like so.

|Idx|`TView.data`|`LView`        | Notes
|---|------------|--------       |--------------
|20 |`{prop: 'width', suffix: 'px'}` |`10`         | `[style.width.px]="widthExp"`
|21 |`40 | 0`    |`width: 10px;` | notice linked list updated here.
|...|            |               |
|40 |`{prop: 'height', suffix: 'px'}`     |`20`          |`@HostProperty('[style.height.px]') heightExp:number;`
|41 |`0 | 20`    |`height: 20px; width: 10px;`  |intermediate result

The resulting flush is `height: 20px; width: 10px;`. (Notice that it pre-pends the `height: 20px; ` to `width: 10px;`)



The above case is required because a directive can read `getComputedStyles` of `div` and it should see `width` applied immediately. (not delayed until `hostBindings`.)

Let's assume that `widthExp` stays the same and `heightExp` is updated. In such a case when processing the `hostBindings` in the `dir-height` directive the resulting value is `height: 20px;`. However writing that value would be incorrect because it would remove `width: 10px;`. To correctly concatenate all values the algorithm uses the linked list in the `TNode.data` to concatenate binding which are located after it in the priority. In this case it would go append `width: 10px`. Since in this case there is nothing more to append, it would than flush the resulted value to the DOM element.