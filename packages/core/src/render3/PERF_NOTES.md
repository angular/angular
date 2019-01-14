
## General Notes

Each Array costs 70 bytes and is composed of `Array` and `(array)` object
  * `Array` javascript visible object: 32 bytes
  * `(array)` VM object where the array is actually stored in: 38 bytes

Each Object cost is 24 bytes plus 8 bytes per property.

For small arrays, it is more efficient to store the data as a linked list
of items rather than small arrays. However, the array access is faster as
shown here: https://jsperf.com/small-arrays-vs-linked-objects

## Monomorphic vs Megamorphic code

Great reads:
- [What's up with monomorphism?](http://mrale.ph/blog/2015/01/11/whats-up-with-monomorphism.html)
- [Impact of polymorphism on component-based frameworks like React](http://benediktmeurer.de/2018/03/23/impact-of-polymorphism-on-component-based-frameworks-like-react/)

1) Monomorphic prop access is 100 times faster than megamorphic.
2) Monomorphic call is 4 times faster the megamorphic call.

 See benchmark [here](https://jsperf.com/mono-vs-megamorphic-property-access).

## Exporting top level variables

Exporting top level variables should be avoided where possible where performance
and code size matters:

```
// Typescript
export let exported = 0;
let notExported = 0;

notExported = exported;

// Would be compiled to
exports.exported = 0;
var notExported = 0;

notExported = exports.exported;
```

Most minifiers do not rename properties (closure is an exception here).

What could be done instead is:

```
let exported = 0;

export function getExported() { return exported; }
export function setExported(v) { exported = v; }
```

Also writing to a property of `exports` might change its hidden class resulting in megamorphic access.

## Iterating over Keys of an Object.

https://jsperf.com/object-keys-vs-for-in-with-closure/3 implies that `Object.keys` is the fastest way of iterating
over properties of an object.

```
for (var i = 0, keys = Object.keys(obj); i < keys.length; i++) {
  const key = keys[i];
}
```

## Recursive functions
Avoid recursive functions when possible because they cannot be inlined.

## Function Inlining

VMs gain a lot of speed by inlining functions which are small (such as getters).
This is because the cost of the value retrieval (getter) is often way less than the cost of making a function call.
VMs use the heuristic of size to determine whether a function should be inline. 
Thinking is that large functions probably will not benefit inlining because the overhead of function call is not significant to the overall function execution.

Our goal should be that all of the instructions which are in template function should be inlinable. 
Here is an example of code which breaks the inlining and a way to fix it.

```
export function i18nStart(index: number, message: string, subTemplateIndex?: number): void {
  const tView = getTView();
  if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
    // LOTS OF CODE HERE WHICH PREVENTS INLINING.
  }
}
```

Notice that the above function almost never runs because `tView.firstTemplatePass` is usually false.
The application would benefit from inlining, but the large code inside `if` prevents it.
Simple refactoring will fix it.

```
export function i18nStart(index: number, message: string, subTemplateIndex?: number): void {
  const tView = getTView();
  if (tView.firstTemplatePass && tView.data[index + HEADER_OFFSET] === null) {
    i18nStartFirstTemplatePass(tView, index, message, subTemplateIndex)
  }
}
export function i18nStartFirstTemplatePass(tView: TView, index: number, message: string, subTemplateIndex?: number): void {
  // LOTS OF CODE HERE WHICH PREVENTS INLINING.
}
```



## Loops
Don't use `forEach`, it can cause megamorphic function calls (depending on the browser) and function allocations.
It is [a lot slower than regular `for` loops](https://jsperf.com/for-vs-foreach-misko)
